import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="bond-grain" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/10 blur-3xl animate-ambient-glow"
      />
      <svg viewBox="0 0 48 48" className="relative mb-6 h-12 w-12 text-brass/50" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.4" />
      </svg>
      <p className="relative mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="relative max-w-sm font-display text-3xl leading-tight text-bone">
        This link doesn&apos;t lead anywhere.
      </h1>
      <p className="relative mt-4 max-w-xs text-sm text-slate">
        Whoever you&apos;re looking for may have changed their username, or the link was mistyped.
      </p>
      <Link
        href="/"
        className="relative mt-8 rounded-xl bg-brass px-8 py-3 text-sm font-medium text-ink transition active:scale-[0.98]"
      >
        Go to Bond
      </Link>
    </main>
  );
}
