import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileReveal } from "@/components/ProfileReveal";
import { SaveContactButton } from "@/components/SaveContactButton";
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
    <main className="mx-auto flex min-h-screen max-w-md flex-col">
      <ProfileReveal photoUrl={identity.photoUrl} name={identity.name}>
        <div className="flex w-full flex-col items-center text-center">
          <div className="w-full">
            <h1 className="font-display text-3xl text-bone">{identity.name}</h1>
            {identity.headline && <p className="mt-1 text-sm text-slate">{identity.headline}</p>}
            {identity.about && <p className="mt-4 text-sm leading-relaxed text-bone/80">{identity.about}</p>}
          </div>

          <div className="mt-8 w-full space-y-3">
            <SaveContactButton
              username={username}
              identityId={identity.id}
              identitySlug={identity.slug}
              identityLabel={identity.label}
              name={identity.name}
              headline={identity.headline}
              photoUrl={identity.photoUrl}
            />

            {actions.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {actions.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="rounded-lg border border-white/10 bg-surface py-3 text-center text-xs text-bone transition hover:border-brass/40"
                  >
                    {a.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-slate hover:text-brass"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
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
