import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// Called once, client-side, the first time a freshly signed-up user loads
// the dashboard — see components/ClaimPendingConnections.tsx. Converts any
// PendingConnection rows tied to their browser's anon token into real
// Connections (preserving identityId, so the permanent bond.app/username/slug
// link keeps working exactly as it would have if they'd been signed in at
// the time), then deletes the pending rows. This is the entire "Connection
// Upgrade" feature: nothing about a pre-signup tap is lost just because
// they didn't have an account yet at that moment.
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { anonToken } = await req.json();
    if (!anonToken) return NextResponse.json({ claimed: 0 });

    const pending = await prisma.pendingConnection.findMany({ where: { anonToken } });
    if (pending.length === 0) return NextResponse.json({ claimed: 0 });

    // Skip the degenerate case where someone's own anonymous browsing of
    // their own Bond somehow got queued — shouldn't normally happen, but
    // cheap to guard against.
    const claimable = pending.filter((p) => p.bondOwnerId !== user.id);

    // One transaction for every create + the delete: if anything fails
    // partway, nothing commits, so a retry can't double-claim rows that
    // already succeeded on a previous attempt.
    await prisma.$transaction([
      ...claimable.map((p) =>
        prisma.connection.create({
          data: {
            ownerId: user.id,
            identityId: p.identityId,
            personUsername: p.personUsername,
            personName: p.personName,
            personHeadline: p.personHeadline,
            personPhoto: p.personPhoto,
            identityShared: p.identityShared,
            meetingContext: p.meetingContext,
            meetingSource: "nfc",
            createdAt: p.createdAt, // preserve the real moment they met, not today
          },
        })
      ),
      prisma.pendingConnection.deleteMany({ where: { anonToken } }),
    ]);

    return NextResponse.json({ claimed: claimable.length });
  } catch (err) {
    console.error("POST /api/pending-connections/claim failed:", err);
    return NextResponse.json({ error: "Something went wrong claiming your pending connections." }, { status: 500 });
  }
}
