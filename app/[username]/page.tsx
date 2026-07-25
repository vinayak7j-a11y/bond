import { IdentityView, loadActiveIdentity, notFound } from "@/components/IdentityView";

// bond.app/username — always the currently active identity. This is what
// every physical accessory and every QR code points to permanently; what
// it SHOWS changes whenever the owner switches their active identity.
export default async function ActiveIdentityPage({ params }: { params: { username: string } }) {
  const identity = await loadActiveIdentity(params.username);
  if (!identity) notFound();

  return <IdentityView username={params.username} identity={identity} />;
}
