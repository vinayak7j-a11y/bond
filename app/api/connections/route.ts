import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST is called by a VISITOR who just tapped Save Contact on someone
// else's identity.
//
// Signed in  -> writes a real Connection on their account, referencing the
//               specific Identity that was shown (identityId).
// Signed out -> we still don't block the save (the vCard already downloaded
//               independently, and it's a permanent link — see the vCard
//               route) but we have no User to attach a Connection to.
//               Instead we record a PendingConnection keyed to their
//               anonymous browser token. If they sign up later with that
//               same browser, /api/pending-connections/claim converts this
//               into a real Connection — see "Connection Upgrade".
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    personUsername,
    personName,
    personHeadline,
    personPhoto,
    identityId,
    identityShared,
    meetingContext,
    meetingSource,
    anonToken,
  } = body;

  if (!personName) {
    return NextResponse.json({ error: "personName is required" }, { status: 400 });
  }

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    if (!anonToken || !personUsername || !identityId) {
      return NextResponse.json({ skipped: true, reason: "not signed in, no anon token" }, { status: 200 });
    }
    const bondOwner = await prisma.user.findUnique({ where: { username: personUsername } });
    if (!bondOwner) return NextResponse.json({ skipped: true, reason: "owner not found" }, { status: 200 });

    await prisma.pendingConnection.create({
      data: {
        anonToken,
        bondOwnerId: bondOwner.id,
        identityId,
        personName,
        personHeadline: personHeadline ?? null,
        personPhoto: personPhoto ?? null,
        personUsername: personUsername ?? null,
        identityShared: identityShared ?? null,
        meetingContext: meetingContext ?? null,
      },
    });

    return NextResponse.json({ pending: true }, { status: 201 });
  }

  const owner = await prisma.user.findUnique({ where: { clerkId } });
  if (!owner) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const connection = await prisma.connection.create({
    data: {
      ownerId: owner.id,
      identityId: identityId ?? null,
      personUsername: personUsername ?? null,
      personName,
      personHeadline: personHeadline ?? null,
      personPhoto: personPhoto ?? null,
      identityShared: identityShared ?? null,
      meetingContext: meetingContext ?? null,
      meetingSource: meetingSource ?? "nfc",
    },
  });

  return NextResponse.json({ connection }, { status: 201 });
}

// GET returns the signed-in user's connections list, newest first —
// powers the dashboard "Connections" view.
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owner = await prisma.user.findUnique({ where: { clerkId } });
  if (!owner) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const connections = await prisma.connection.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ connections });
}
