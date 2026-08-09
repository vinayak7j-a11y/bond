import { NextRequest, NextResponse } from "next/server";
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

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });

    const tag = await prisma.tag.findUnique({ where: { code } });
    if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    if (tag.claimedById === user.id) {
      return NextResponse.json({ tag, alreadyMine: true });
    }
    if (tag.claimedById) {
      return NextResponse.json({ error: "This tag has already been claimed." }, { status: 409 });
    }

    const [updatedTag] = await prisma.$transaction([
      prisma.tag.update({
        where: { code },
        data: { claimedById: user.id, claimedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { usernameLocked: true },
      }),
    ]);

    return NextResponse.json({ tag: updatedTag }, { status: 200 });
  } catch (err) {
    console.error("POST /api/tags/claim failed:", err);
    return NextResponse.json({ error: "Something went wrong claiming this tag." }, { status: 500 });
  }
}
