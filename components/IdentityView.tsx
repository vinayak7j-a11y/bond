import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileReveal } from "@/components/ProfileReveal";
import { IdentityBody } from "@/components/IdentityBody";
import { BondFooter } from "@/components/BondFooter";

type IdentityRecord = {
  id: string;
  slug: string;
  label: string;
  isDefault: boolean;
  photoUrl: string | null;
  name: string;
  headline: string | null;
  about: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  portfolio: string | null;
};

export async function IdentityView({
  username,
  identity,
  displayPath = "",
}: {
  username: string;
  identity: IdentityRecord;
  displayPath?: string; // e.g. "/friend" — the path actually in the browser URL
}) {
  prisma.profileEvent
    .create({ data: { profileUsername: `${username}/${identity.slug}`, type: "view" } })
    .catch(() => {});

  const actions = [
    identity.whatsapp && { label: "WhatsApp", href: `https://wa.me/${identity.whatsapp.replace(/\D/g, "")}` },
    identity.phone && { label: "Call", href: `tel:${identity.phone}` },
    identity.email && { label: "Email", href: `mailto:${identity.email}` },
  ].filter(Boolean) as { label: string; href: string }[];

  const socials = [
    identity.linkedin && { label: "LinkedIn", href: identity.linkedin },
    identity.instagram && { label: "Instagram", href: identity.instagram },
    identity.github && { label: "GitHub", href: identity.github },
    identity.portfolio && { label: "Portfolio", href: identity.portfolio },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden">
      <div className="bond-grain" />
      <ProfileReveal photoUrl={identity.photoUrl} name={identity.name}>
        <IdentityBody username={username} identity={identity} actions={actions} socials={socials} />
      </ProfileReveal>

      <BondFooter username={username} displayPath={displayPath} />
    </main>
  );
}

// bond.app/username — shows whichever identity is currently marked
// isDefault. This is the ONLY route affected by switching your active
// identity, and it's what a brand-new NFC tap or QR scan always lands on.
export async function loadActiveIdentity(username: string) {
  const owner = await prisma.user.findUnique({
    where: { username },
    include: { identities: true },
  });
  if (!owner || owner.identities.length === 0) return null;
  return owner.identities.find((i) => i.isDefault) ?? owner.identities[0];
}

// bond.app/username/slug — a specific identity's permanent URL. This is
// what saved contacts link to, so it never changes regardless of what the
// owner's active identity becomes later. No account needed to resolve it.
export async function loadIdentityBySlug(username: string, slug: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  return prisma.identity.findUnique({ where: { userId_slug: { userId: user.id, slug } } });
}

export { notFound };
