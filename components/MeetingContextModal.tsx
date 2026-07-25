"use client";

import { AnimatePresence, motion } from "framer-motion";

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
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
