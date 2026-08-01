import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Already attributed — don't let a later, unrelated referral link
    // overwrite whoever actually brought this person here first.
    if (user.referredBy) return NextResponse.json({ ok: true, alreadyAttributed: true });

    const { ref } = await req.json();
    if (!ref || typeof ref !== "string" || ref === user.username) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const referrer = await prisma.user.findUnique({ where: { username: ref } });
    if (!referrer) return NextResponse.json({ ok: true, skipped: true });

    await prisma.user.update({ where: { id: user.id }, data: { referredBy: ref } });
    await prisma.profileEvent
      .create({ data: { profileUsername: ref, type: "referral_signup" } })
      .catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/referral failed:", err);
    return NextResponse.json({ error: "Something went wrong attributing your referral." }, { status: 500 });
  }
}
