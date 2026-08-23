import { IdentityView, loadActiveIdentity, notFound } from "@/components/IdentityView";
import { prisma } from "@/lib/prisma";
// bond.app/username — always the currently active identity. This is what
// every physical accessory and every QR code points to permanently; what
// it SHOWS changes whenever the owner switches their active identity.
export default async function ActiveIdentityPage({ params }: { params: { username: string } }) {
  const identity = await loadActiveIdentity(params.username);
  if (identity) return <IdentityView username={params.username} identity={identity} />;
  // loadActiveIdentity returns null for two different reasons — no such
  // user, or a real user who hasn't created an identity yet (e.g. just
  // claimed a physical tag before finishing setup). A stranger tapping a
  // freshly-claimed accessory shouldn't hit a generic Next.js 404 for the
  // second case — that's the exact "magic moment" this product is built
  // around, and a bare 404 undercuts it badly.
  const owner = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } });
  if (!owner) notFound();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
        This Bond is still being set up
      </h1>
      <p className="max-w-xs text-sm text-slate">Check back soon.</p>
    </main>
  );
}
