"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const OPTIONS = ["Startup Event", "Client", "College", "Friend", "Conference", "Other"];

export function MeetingContextModal({
  open,
  onSelect,
  onSkip,
}: {
  open: boolean;
  onSelect: (context: string) => void;
  onSkip: () => void;
}) {
  const reduceMotion = useReducedMotion();

  // Consistent with the identity create/delete modals elsewhere in the
  // app: Escape closes it, not just tapping the backdrop.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onSkip();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onSkip]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={onSkip}
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-2xl border border-white/10 bg-surface p-6 sm:rounded-2xl"
          >
            <p className="mb-1 font-mono text-xs uppercase tracking-wide text-slate">Saved</p>
            <h2 className="mb-5 font-display text-2xl text-bone">Where did you meet?</h2>
            <div className="grid grid-cols-2 gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => onSelect(opt)}
                  className="rounded-lg border border-white/10 bg-ink px-3 py-2.5 text-left text-sm text-bone transition hover:border-brass/50 hover:text-brass"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={onSkip} className="mt-4 w-full text-center text-sm text-slate hover:text-bone">
              Skip
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
