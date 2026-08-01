"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="bond-grain" />
      <p className="relative mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="relative max-w-sm font-display text-3xl leading-tight text-bone">
        Something went wrong.
      </h1>
      <p className="relative mt-4 max-w-xs text-sm text-slate">
        That&apos;s on us, not you. Nothing you did caused this — try again in a moment.
      </p>
      <div className="relative mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-brass px-6 py-3 text-sm font-medium text-ink transition active:scale-[0.98]"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-white/10 px-6 py-3 text-sm text-bone transition hover:border-white/25"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
