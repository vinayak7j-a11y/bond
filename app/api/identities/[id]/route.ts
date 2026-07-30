import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { FieldDraft, FIELD_TYPES } from "@/lib/fieldTypes";

const EDITABLE_FIELDS = ["photoUrl", "name", "label"] as const;

async function getOwnedIdentity(id: string) {
  const user = await getOrCreateUser();
  if (!user) return { user: null, identity: null };
  const identity = await prisma.identity.findFirst({
    where: { id, userId: user.id },
    include: { fields: true },
  });
  return { user, identity };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, identity } = await getOwnedIdentity(params.id);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!identity) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const data: Record<string, string | null> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) data[field] = body[field] === "" ? null : body[field];
    }

    const ops: any[] = [];

    if (body.makeDefault) {
      // Handled in the same transaction so exactly one identity is ever
      // marked default at a time.
      ops.push(prisma.identity.updateMany({ where: { userId: user.id }, data: { isDefault: false } }));
      ops.push(prisma.identity.update({ where: { id: identity.id }, data: { ...data, isDefault: true } }));
    } else if (Object.keys(data).length > 0) {
      ops.push(prisma.identity.update({ where: { id: identity.id }, data }));
    }

    // Full sync of this identity's fields: the client always sends the
    // complete desired list. Anything with an existing id gets updated,
    // anything without one is new, and any current DB row not present in
    // the payload gets deleted. This mirrors how the dashboard already
    // saves everything in one "Save changes" action rather than many
    // separate field-level API calls.
    if (Array.isArray(body.fields)) {
      const incoming = body.fields as FieldDraft[];
      const incomingIds = new Set(incoming.filter((f) => f.id).map((f) => f.id));

      for (const existing of identity.fields) {
        if (!incomingIds.has(existing.id)) {
          ops.push(prisma.field.delete({ where: { id: existing.id } }));
        }
      }

      incoming.forEach((f, index) => {
        if (!FIELD_TYPES.includes(f.type)) return; // ignore anything malformed
        const payload = {
          key: f.key ?? null,
          type: f.type,
          label: (f.label || "Untitled").slice(0, 80),
          value: f.value ?? "",
          order: index,
        };
        if (f.id) {
          ops.push(prisma.field.update({ where: { id: f.id }, data: payload }));
        } else {
          ops.push(prisma.field.create({ data: { ...payload, identityId: identity.id } }));
        }
      });
    }

    if (ops.length > 0) await prisma.$transaction(ops);

    const updated = await prisma.identity.findUnique({
      where: { id: identity.id },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ identity: updated });
  } catch (err) {
    console.error("PUT /api/identities/[id] failed:", err);
    return NextResponse.json({ error: "Something went wrong saving this identity." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
  } catch (err) {
    console.error("DELETE /api/identities/[id] failed:", err);
    return NextResponse.json({ error: "Something went wrong deleting this identity." }, { status: 500 });
  }
}