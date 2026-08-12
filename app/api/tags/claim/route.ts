import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// POST binds a physical accessory's code to the caller's account. This is
// also the moment `usernameLocked` turns on — the User model has carried
// that field since early on ("true once first accessory is activated"),
// but nothing ever actually set it until now. Once a real physical object
// has this person's username baked into every link it produces, letting
// them freely rename would silently break every tag already out in the
// world pointing at bond.app/<old-username>.
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code: rawCode } = await req.json();
    if (!rawCode) return NextResponse.json({ error: "code is required" }, { status: 400 });
    const code = String(rawCode).toUpperCase(); // same normalization as the page-level lookups

    const exists = await prisma.tag.findUnique({ where: { code }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    // Two people tapping/scanning the same unclaimed tag at nearly the same
    // moment is a real scenario, not a theoretical one — a plain
    // findUnique-then-update here would let both requests pass a
    // claimedById-is-null check and the second write would silently
    // overwrite the first, with BOTH callers wrongly believing they'd
    // claimed it. updateMany with claimedById: null in the WHERE clause
    // makes the claim itself atomic: only one request can ever succeed.
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const claim = await tx.tag.updateMany({
        where: { code, claimedById: null },
        data: { claimedById: user.id, claimedAt: new Date() },
      });

      if (claim.count === 0) {
        const current = await tx.tag.findUnique({ where: { code } });
        return { claimed: false as const, current };
      }

      await tx.user.update({
        where: { id: user.id },
        data: { usernameLocked: true },
      });
      const updatedTag = await tx.tag.findUnique({ where: { code } });
      return { claimed: true as const, updatedTag };
    });

    if (!result.claimed) {
      if (result.current?.claimedById === user.id) {
        return NextResponse.json({ tag: result.current, alreadyMine: true });
      }
      return NextResponse.json({ error: "This tag has already been claimed." }, { status: 409 });
    }

    return NextResponse.json({ tag: result.updatedTag }, { status: 200 });
  } catch (err) {
    console.error("POST /api/tags/claim failed:", err);
    return NextResponse.json({ error: "Something went wrong claiming this tag." }, { status: 500 });
  }
}
