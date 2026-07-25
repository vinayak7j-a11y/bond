import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

const EDITABLE_FIELDS = [
  "photoUrl",
  "name",
  "headline",
  "about",
  "whatsapp",
  "phone",
  "email",
  "linkedin",
  "instagram",
  "github",
  "portfolio",
  "resumeUrl",
  "label",
] as const;

async function getOwnedIdentity(id: string) {
  const user = await getOrCreateUser();
  if (!user) return { user: null, identity: null };
  const identity = await prisma.identity.findFirst({ where: { id, userId: user.id } });
  return { user, identity };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, identity } = await getOwnedIdentity(params.id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!identity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, string | null> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field] === "" ? null : body[field];
  }

  // "makeDefault" is handled separately in a transaction so exactly one
  // identity is ever marked default at a time.
  if (body.makeDefault) {
    await prisma.$transaction([
      prisma.identity.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
      prisma.identity.update({ where: { id: identity.id }, data: { ...data, isDefault: true } }),
    ]);
  } else {
    await prisma.identity.update({ where: { id: identity.id }, data });
  }

  const updated = await prisma.identity.findUnique({ where: { id: identity.id } });
  return NextResponse.json({ identity: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { user, identity } = await getOwnedIdentity(params.id);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!identity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await prisma.identity.count({ where: { userId: user.id } });
  if (count <= 1) {
    return NextResponse.json(
      { error: "You need at least one identity — edit it instead of deleting it." },
      { status: 400 }
    );
  }

  await prisma.identity.delete({ where: { id: identity.id } });

  // If we just deleted the default identity, promote the oldest remaining one.
  if (identity.isDefault) {
    const next = await prisma.identity.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) await prisma.identity.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  return NextResponse.json({ ok: true });
}
