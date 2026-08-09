import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";
import { ClaimTagCard } from "@/components/ClaimTagCard";

// Landing page for an UNCLAIMED tag (or a claimed one someone's revisiting
// the claim link for). getOrCreateUser() returns null for a signed-out
// visitor rather than throwing — same pattern used across the API routes
// — so this page works whether or not they're signed in yet.
export default async function ClaimPage({ params }: { params: { code: string } }) {
  const tag = await prisma.tag.findUnique({ where: { code: params.code } });
  if (!tag) notFound();

  const user = await getOrCreateUser();

  return (
    <ClaimTagCard
      code={params.code}
      isSignedIn={!!user}
      alreadyClaimed={!!tag.claimedById}
      isMine={!!user && tag.claimedById === user.id}
    />
  );
}
