import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Called once, client-side, the first time a freshly signed-up user loads
// the dashboard — see components/ClaimPendingConnections.tsx. Converts any
// PendingConnection rows tied to their browser's anon token into real
// Connections (preserving identityId, so the permanent bond.app/username/slug
// link keeps working exactly as it would have if they'd been signed in at
// the time), then deletes the pending rows. This is the entire "Connection
// Upgrade" feature: nothing about a pre-signup tap is lost just because
// they didn't have an account yet at that moment.
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { anonToken } = await req.json();
  if (!anonToken) return NextResponse.json({ claimed: 0 });

  const pending = await prisma.pendingConnection.findMany({ where: { anonToken } });
  if (pending.length === 0) return NextResponse.json({ claimed: 0 });

  let claimed = 0;
  for (const p of pending) {
    // Skip the degenerate case where someone's own anonymous browsing of
    // their own Bond somehow got queued — shouldn't normally happen, but
    // cheap to guard against.
    if (p.bondOwnerId === user.id) continue;

    await prisma.connection.create({
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
    });

    claimed += 1;
  }

  await prisma.pendingConnection.deleteMany({ where: { anonToken } });

  return NextResponse.json({ claimed });
}
