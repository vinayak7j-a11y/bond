import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// This is the ACTUAL physical destination baked into every manufactured
// NFC/QR accessory — bond.app/t/CODE, never bond.app/username. See the
// Tag model for why: it's what lets tags get produced in bulk before any
// buyer is known.
export default async function TagRedirectPage({ params }: { params: { code: string } }) {
  // Codes are generated uppercase-only (see scripts/generate-tags.ts), but
  // if this ever gets typed by hand — a support scenario, sharing a code
  // verbally, a hard-to-read print — Postgres string comparison is
  // case-sensitive by default, so a lowercase entry would silently fail
  // to match an otherwise-identical, valid code.
  const code = params.code.toUpperCase();

  const tag = await prisma.tag.findUnique({
    where: { code },
    include: { claimedBy: { select: { username: true } } },
  });

  if (!tag) notFound();

  if (!tag.claimedBy) {
    redirect(`/claim/${code}`);
  }

  // Always the owner's current default identity — the [username] page
  // already implements that resolution, nothing tag-specific to do here.
  redirect(`/${tag.claimedBy.username}`);
}
