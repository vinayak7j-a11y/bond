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
    const { label, name, templateId } = body;
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
        isDefault: existingIdentities.length === 0,
        fields: template?.fields.length
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
