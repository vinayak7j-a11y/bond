import { IdentityView, loadIdentityBySlug, notFound } from "@/components/IdentityView";

// bond.app/username/slug — the PERMANENT URL for one specific identity.
// This is what every saved contact's vCard actually links to, which is
// what makes "once shared, it doesn't change for that person" true: this
// page always shows this exact identity, regardless of whatever the owner
// has switched their active identity to. No account needed to view it.
export default async function IdentityBySlugPage({
  params,
}: {
  params: { username: string; identity: string };
}) {
  const identity = await loadIdentityBySlug(params.username, params.identity);
  if (!identity) notFound();

  return (
    <IdentityView username={params.username} identity={identity} displayPath={`/${params.identity}`} />
  );
}
