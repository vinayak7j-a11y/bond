"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ClaimTagCard({
  code,
  isSignedIn,
  alreadyClaimed,
  isMine,
}: {
  code: string;
  isSignedIn: boolean;
  alreadyClaimed: boolean;
  isMine: boolean;
}) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (claiming) return;
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/tags/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setClaimed(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't claim this tag — please try again.");
      }
    } catch {
      setError("Couldn't claim this tag — please try again.");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>

      {!isSignedIn && (
        <>
          <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
            Activate this Bond accessory
          </h1>
          <p className="mb-8 max-w-xs text-sm text-slate">
            Sign in or create a Bond to bind this tag to your account.
          </p>
          <div className="flex gap-3">
            <Link
              href={`/sign-up?redirect_url=/claim/${code}`}
              className="rounded-xl bg-brass px-6 py-3 text-sm font-medium text-ink"
            >
              Create your Bond
            </Link>
            <Link
              href={`/sign-in?redirect_url=/claim/${code}`}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm text-bone"
            >
              Sign in
            </Link>
          </div>
        </>
      )}

      {isSignedIn && isMine && (
        <>
          <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
            This tag is already yours ✓
          </h1>
          <Link href="/dashboard" className="mt-4 text-sm text-brass hover:underline">
            Go to your dashboard →
          </Link>
        </>
      )}

      {isSignedIn && !isMine && alreadyClaimed && (
        <>
          <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
            This tag has already been claimed
          </h1>
          <p className="max-w-xs text-sm text-slate">
            If you believe this is a mistake, reach out to Bond support.
          </p>
        </>
      )}

      {isSignedIn && !isMine && !alreadyClaimed && !claimed && (
        <>
          <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
            Activate this Bond accessory
          </h1>
          <p className="mb-8 max-w-xs text-sm text-slate">
            This will always show whichever identity you have set as default —
            you can change that any time from your dashboard.
          </p>
          <motion.button
            onClick={claim}
            disabled={claiming}
            whileTap={{ scale: 0.96 }}
            className="rounded-xl bg-brass px-8 py-3 text-sm font-medium text-ink disabled:opacity-60"
          >
            {claiming ? "Activating…" : "Activate this tag"}
          </motion.button>
          {error && <p className="mt-4 text-xs text-red-300">{error}</p>}
        </>
      )}

      {claimed && (
        <>
          <h1 className="mb-3 max-w-sm font-display text-2xl leading-tight text-bone">
            Activated ✓
          </h1>
          <p className="mb-6 max-w-xs text-sm text-slate">
            This tag is now bound to your Bond.
          </p>
          <Link href="/dashboard" className="text-sm text-brass hover:underline">
            Go to your dashboard →
          </Link>
        </>
      )}
    </main>
  );
}
