import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { TEMPLATES } from "@/lib/identityTemplates";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const identities = await prisma.identity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ identities, username: user.username });
  } catch (err) {
    console.error("GET /api/identities failed:", err);
    return NextResponse.json({ error: "Something went wrong loading your Bond." }, { status: 500 });
  }
}

function slugify(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { label, name, templateId, duplicateFromId } = body;
    if (!label || !name) {
      return NextResponse.json({ error: "label and name are required" }, { status: 400 });
    }

    const existingIdentities = await prisma.identity.findMany({ where: { userId: user.id } });

    let slug = slugify(label);
    let suffix = 1;
    const existingSlugs = new Set(existingIdentities.map((i) => i.slug));
    while (existingSlugs.has(slug)) {
      suffix += 1;
      slug = `${slugify(label)}-${suffix}`;
    }

    // Duplicating an identity clones its actual field VALUES, not just a
    // template shape — but the source identity has to be looked up and
    // verified server-side rather than trusting whatever field data the
    // client sends, or anyone could POST arbitrary field content claiming
    // it came from "duplication."
    let duplicateFields: { key: string; type: string; label: string; value: string; order: number }[] | undefined;
    let sourcePhotoUrl: string | null | undefined;
    if (duplicateFromId) {
      const source = await prisma.identity.findUnique({
        where: { id: duplicateFromId },
        include: { fields: { orderBy: { order: "asc" } } },
      });
      if (!source || source.userId !== user.id) {
        return NextResponse.json({ error: "That identity isn't yours to duplicate." }, { status: 403 });
      }
      duplicateFields = source.fields.map((f) => ({
        key: f.key,
        type: f.type,
        label: f.label,
        value: f.value,
        order: f.order,
      }));
      sourcePhotoUrl = source.photoUrl;
    }

    // A template is just a starting set of empty Field rows the owner can
    // freely edit, reorder, retype, or delete afterward — nothing about it
    // is locked in once the identity exists.
    const template = TEMPLATES.find((t) => t.id === templateId);

    const identity = await prisma.identity.create({
      data: {
        userId: user.id,
        slug,
        label,
        name,
        photoUrl: sourcePhotoUrl,
        isDefault: existingIdentities.length === 0,
        fields: duplicateFields
          ? { create: duplicateFields }
          : template?.fields.length
            ? { create: template.fields.map((f) => ({ ...f, value: f.value || "" })) }
            : undefined,
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ identity }, { status: 201 });
  } catch (err) {
    console.error("POST /api/identities failed:", err);
    return NextResponse.json({ error: "Something went wrong creating that identity." }, { status: 500 });
  }
}
