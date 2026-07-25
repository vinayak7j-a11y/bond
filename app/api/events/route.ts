import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Intentionally unauthenticated and best-effort — this only logs
// non-sensitive counters (Bond Pass saves, etc.) for the owner's own
// analytics, and must never block or fail the visitor's actual action.
export async function POST(req: NextRequest) {
  const { profileUsername, type } = await req.json();
  if (!profileUsername || !type) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.profileEvent.create({ data: { profileUsername, type } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
