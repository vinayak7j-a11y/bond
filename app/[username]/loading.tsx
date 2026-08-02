// Next.js renders this automatically while the server component above it
// (IdentityView, which awaits a DB fetch) is still resolving. A slow,
// subtle opacity pulse reads as "static" once someone stares at it for
// more than a second or two — this uses a real moving shimmer sweep
// (the pattern most feeds use for exactly this reason) plus a spinning
// brass arc, so it's unmistakably "actively working" rather than frozen.
function Shimmer({ className }: { className: string }) {
  return (
    <div
      className={`animate-shimmer bg-white/5 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(247,245,241,0.14) 50%, rgba(255,255,255,0.05) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function Loading() {
  return (
    <div className="flex w-full flex-col items-center px-6 pt-14 pb-10">
      <div className="relative mb-6 h-28 w-28 shrink-0 rounded-full">
        <div className="absolute inset-0 rounded-full bg-brass/10 animate-pulse-ring" />
        <div className="h-28 w-28 rounded-full border border-white/10 bg-surface" />
        {/* A visibly spinning brass arc — reads unambiguously as "loading"
            rather than a static shape, regardless of how long the wait is. */}
        <div
          className="absolute inset-2 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#C9A15C", borderRightColor: "#C9A15C33", animationDuration: "1.1s" }}
        />
      </div>
      <Shimmer className="h-2.5 w-20 rounded-full" />
      <div className="mt-3">
        <Shimmer className="h-6 w-40 rounded-full" />
      </div>
      <div className="mt-3">
        <Shimmer className="h-3 w-56 rounded-full" />
      </div>
      <div className="mt-8 w-full max-w-xs space-y-3">
        <Shimmer className="h-11 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <Shimmer className="h-11 rounded-lg" />
          <Shimmer className="h-11 rounded-lg" />
          <Shimmer className="h-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
