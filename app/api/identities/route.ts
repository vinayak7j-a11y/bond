import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const identities = await prisma.identity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
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
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, name } = body;
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

  const identity = await prisma.identity.create({
    data: {
      userId: user.id,
      slug,
      label,
      name,
      isDefault: existingIdentities.length === 0,
    },
  });

  return NextResponse.json({ identity }, { status: 201 });
}
