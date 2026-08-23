"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type MyIdentityOption = {
  id: string;
  label: string;
  name: string;
  photoUrl: string | null;
};

export function ShareBackModal({
  open,
  identities,
  submitting = false,
  error = null,
  onSelect,
  onSkip,
}: {
  open: boolean;
  identities: MyIdentityOption[];
  submitting?: boolean;
  error?: string | null;
  onSelect: (identityId: string) => void;
  onSkip: () => void;
}) {
  const reduceMotion = useReducedMotion();

  // Consistent with the rest of the app's sheet modals: Escape closes it,
  // same as the identity create/delete modals on the dashboard.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onSkip();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onSkip, submitting]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={submitting ? undefined : onSkip}
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl border border-white/10 bg-surface p-6 sm:rounded-2xl"
          >
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-slate">Two-way Bond</p>
            <h2 className="mb-5 font-display text-2xl text-bone">Share your Bond back?</h2>
            <div className="space-y-2">
              {identities.map((id) => (
                <button
                  key={id.id}
                  onClick={() => onSelect(id.id)}
                  disabled={submitting}
                  className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-ink px-3 py-2.5 text-left transition hover:border-brass/50 disabled:cursor-default disabled:opacity-50 disabled:hover:border-white/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass/30 bg-surface font-display text-sm text-brass">
                    {id.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={id.photoUrl} alt={id.name} className="h-full w-full object-cover" />
                    ) : (
                      id.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone">{id.name}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wide text-slate/70">
                      {id.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
            <button
              onClick={onSkip}
              disabled={submitting}
              className="mt-4 w-full text-center text-sm text-slate hover:text-bone disabled:opacity-50"
            >
              {submitting ? "Sharing…" : "Not now"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
