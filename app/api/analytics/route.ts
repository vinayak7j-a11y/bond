import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// GET powers the dashboard's "Activity" widget — surfaces data that's
// been collected via ProfileEvent this whole time (view, contact_save,
// bond_pass_save, referral_signup) but was never shown to the owner
// anywhere. Per-identity events use "username/slug" as profileUsername;
// referral_signup events use just "username" (account-level, not tied to
// a specific identity) — so both shapes need matching, not just one.
type EventType = "view" | "contact_save" | "bond_pass_save" | "referral_signup";
const EVENT_TYPES: EventType[] = ["view", "contact_save", "bond_pass_save", "referral_signup"];

function isEventType(t: string): t is EventType {
  return (EVENT_TYPES as string[]).includes(t);
}

function emptyCounts(): Record<EventType, number> {
  return { view: 0, contact_save: 0, bond_pass_save: 0, referral_signup: 0 };
}

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const events = await prisma.profileEvent.findMany({
      where: {
        OR: [
          { profileUsername: { startsWith: `${user.username}/` } },
          { profileUsername: user.username },
        ],
      },
      select: { type: true, createdAt: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const counts = emptyCounts();
    const last30 = emptyCounts();

    for (const e of events) {
      const type = e.type;
      if (!isEventType(type)) continue;
      counts[type]++;
      if (new Date(e.createdAt) >= thirtyDaysAgo) last30[type]++;
    }

    return NextResponse.json({ counts, last30 });
  } catch (err) {
    console.error("GET /api/analytics failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
