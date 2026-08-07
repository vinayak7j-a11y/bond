import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// POST is called by a SIGNED-IN visitor who just saved someone's contact
// and chose to "share their Bond back." Unlike the normal /api/connections
// POST (which always writes to the CALLER's own account), this writes a
// Connection onto the OTHER person's account — recording the visitor as
// someone they met. That's a real trust boundary, so the only thing this
// route trusts blindly is who the caller is (their own Clerk session); it
// verifies server-side that the identity being shared actually belongs to
// them before using its data, rather than trusting whatever the client sends.
export async function POST(req: NextRequest) {
  try {
    const caller = await getOrCreateUser();
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { profileOwnerUsername, myIdentityId, meetingContext } = await req.json();
    if (!profileOwnerUsername || !myIdentityId) {
      return NextResponse.json({ error: "profileOwnerUsername and myIdentityId are required" }, { status: 400 });
    }

    const myIdentity = await prisma.identity.findUnique({
      where: { id: myIdentityId },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    if (!myIdentity || myIdentity.userId !== caller.id) {
      return NextResponse.json({ error: "That identity isn't yours to share." }, { status: 403 });
    }

    const profileOwner = await prisma.user.findUnique({ where: { username: profileOwnerUsername } });
    if (!profileOwner) return NextResponse.json({ error: "Profile owner not found" }, { status: 404 });

    // Sharing back with yourself isn't a real connection.
    if (profileOwner.id === caller.id) {
      return NextResponse.json({ skipped: true, reason: "own profile" }, { status: 200 });
    }

    const headline = myIdentity.fields.find((f) => f.key === "headline")?.value || null;

    const connection = await prisma.connection.create({
      data: {
        ownerId: profileOwner.id,
        identityId: myIdentity.id,
        personUsername: caller.username,
        personName: myIdentity.name,
        personPhoto: myIdentity.photoUrl,
        personHeadline: headline,
        identityShared: myIdentity.label,
        meetingContext: meetingContext ?? null,
        meetingSource: "mutual",
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (err) {
    console.error("POST /api/connections/mutual failed:", err);
    return NextResponse.json({ error: "Something went wrong sharing your Bond back." }, { status: 500 });
  }
}
