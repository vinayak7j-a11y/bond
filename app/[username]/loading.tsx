// Next.js renders this automatically while the server component above it
// (IdentityView, which awaits a DB fetch) is still resolving. Mirrors the
// real layout's proportions so there's no layout shift when the actual
// reveal takes over, and keeps the same "something is about to arrive"
// feeling rather than a blank void.
export default function Loading() {
  return (
    <div className="flex w-full flex-col items-center px-6 pt-14 pb-10">
      <div className="relative mb-6 h-28 w-28 shrink-0 rounded-full">
        <div className="absolute inset-0 rounded-full bg-brass/10 animate-pulse-ring" />
        <div className="h-28 w-28 animate-pulse rounded-full border border-white/10 bg-surface" />
      </div>
      <div className="h-2.5 w-20 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-6 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-56 animate-pulse rounded-full bg-white/5" />
      <div className="mt-8 w-full max-w-xs space-y-3">
        <div className="h-11 w-full animate-pulse rounded-lg bg-white/5" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-11 animate-pulse rounded-lg bg-white/5" />
          <div className="h-11 animate-pulse rounded-lg bg-white/5" />
          <div className="h-11 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}
