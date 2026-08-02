import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileReveal } from "@/components/ProfileReveal";
import { IdentityBody } from "@/components/IdentityBody";
import { BondFooter } from "@/components/BondFooter";
import { ACTION_TYPES } from "@/lib/fieldTypes";

type FieldRecord = {
  id: string;
  key: string | null;
  type: "TEXT" | "LONG_TEXT" | "LINK" | "PHONE" | "WHATSAPP" | "EMAIL";
  label: string;
  value: string;
  order: number;
};

type IdentityRecord = {
  id: string;
  slug: string;
  label: string;
  isDefault: boolean;
  photoUrl: string | null;
  name: string;
  fields: FieldRecord[];
};

const ACTION_HREF: Record<string, (value: string) => string> = {
  WHATSAPP: (v) => `https://wa.me/${v.replace(/\D/g, "")}`,
  PHONE: (v) => `tel:${v}`,
  EMAIL: (v) => `mailto:${v}`,
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

  const fields = identity.fields.filter((f) => f.value); // never render empty fields
  const headline = fields.find((f) => f.key === "headline")?.value ?? null;
  const about = fields.find((f) => f.key === "about")?.value ?? null;

  const actions = fields
    .filter((f) => ACTION_TYPES.includes(f.type) && f.key !== "headline" && f.key !== "about")
    .map((f) => ({ label: f.label, href: ACTION_HREF[f.type](f.value) }));

  const links = fields.filter((f) => f.type === "LINK").map((f) => ({ label: f.label, href: f.value }));

  // Freeform text fields — Skills, Achievements, "favorite food," anything
  // the owner made up — beyond the two special headline/about slots.
  const details = fields
    .filter((f) => (f.type === "TEXT" || f.type === "LONG_TEXT") && f.key !== "headline" && f.key !== "about")
    .map((f) => ({ label: f.label, value: f.value, type: f.type as "TEXT" | "LONG_TEXT" }));

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden">
      <div className="bond-grain" />
      <ProfileReveal photoUrl={identity.photoUrl} name={identity.name}>
        <IdentityBody
          username={username}
          identity={{
            id: identity.id,
            slug: identity.slug,
            label: identity.label,
            name: identity.name,
            headline,
            about,
            photoUrl: identity.photoUrl,
          }}
          actions={actions}
          links={links}
          details={details}
        />
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
    include: { identities: { include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!owner || owner.identities.length === 0) return null;
  return owner.identities.find((i) => i.isDefault) ?? owner.identities[0];
}

// bond.app/username/slug — a specific identity's permanent URL. This is
// what saved contacts link to, so it never changes regardless of what the
// owner's active identity becomes later. No account needed to resolve it.
//
// Single query via relation filtering (user: { username }) instead of a
// separate user lookup followed by a separate identity lookup — halves
// the database round-trips for what's likely the most-hit route once
// people actually have saved contacts, since every tap of an already-saved
// contact lands here rather than on the "active identity" route.
export async function loadIdentityBySlug(username: string, slug: string) {
  return prisma.identity.findFirst({
    where: { slug, user: { username } },
    include: { fields: { orderBy: { order: "asc" } } },
  });
}

export { notFound };
