import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildVCard } from "@/lib/vcard";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const slug = req.nextUrl.searchParams.get("identity");

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { identities: { include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const identity = slug
    ? user.identities.find((i) => i.slug === slug)
    : user.identities.find((i) => i.isDefault) ?? user.identities[0];

  if (!identity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const vcard = buildVCard({
    name: identity.name,
    photoUrl: identity.photoUrl,
    fields: identity.fields,
    // Always the identity-specific URL. This is what makes the saved
    // contact permanent: whoever saves it keeps seeing exactly this
    // identity forever, even after the owner's active identity changes —
    // no account needed on the visitor's end for this to work.
    website: `https://bond.app/${user.username}/${identity.slug}`,
  });

  prisma.profileEvent
    .create({ data: { profileUsername: `${user.username}/${identity.slug}`, type: "contact_save" } })
    .catch(() => {});

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${identity.name.replace(/\s+/g, "_")}.vcf"`,
    },
  });
}
