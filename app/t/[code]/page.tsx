import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// This is the ACTUAL physical destination baked into every manufactured
// NFC/QR accessory — bond.app/t/CODE, never bond.app/username. See the
// Tag model for why: it's what lets tags get produced in bulk before any
// buyer is known.
export default async function TagRedirectPage({ params }: { params: { code: string } }) {
  const tag = await prisma.tag.findUnique({
    where: { code: params.code },
    include: { claimedBy: { select: { username: true } } },
  });

  if (!tag) notFound();

  if (!tag.claimedBy) {
    redirect(`/claim/${params.code}`);
  }

  // Always the owner's current default identity — the [username] page
  // already implements that resolution, nothing tag-specific to do here.
  redirect(`/${tag.claimedBy.username}`);
}
