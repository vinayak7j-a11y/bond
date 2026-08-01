"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function DeleteIdentityModal({
  open,
  label,
  onConfirm,
  onClose,
  error,
  pending,
}: {
  open: boolean;
  label: string;
  onConfirm: () => void;
  onClose: () => void;
  error?: string | null;
  pending?: boolean;
}) {
  function safeClose() {
    if (pending) return; // don't let the sheet close mid-request
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") safeClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={safeClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl border border-white/10 bg-surface p-6 sm:rounded-2xl"
          >
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-slate">Remove identity</p>
            <h2 className="mb-2 font-display text-2xl text-bone">Delete &quot;{label}&quot;?</h2>
            <p className="mb-5 text-sm leading-relaxed text-slate">
              Anyone who already saved this identity&apos;s contact keeps their permanent link — this
              can&apos;t be undone here, but their saved copy is unaffected.
            </p>

            {error && <p className="mb-3 text-center text-xs text-red-300">{error}</p>}

            <button
              onClick={onConfirm}
              disabled={pending}
              className="w-full rounded-xl border border-red-400/30 bg-red-400/10 px-6 py-3 text-center text-sm font-medium text-red-300 transition hover:bg-red-400/15 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Deleting…" : `Delete "${label}"`}
            </button>
            <button
              onClick={safeClose}
              disabled={pending}
              className="mt-3 w-full text-center text-sm text-slate hover:text-bone disabled:opacity-40"
            >
              Keep it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
