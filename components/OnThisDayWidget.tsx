"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  personName: string;
  personPhoto: string | null;
  note: string | null;
  onThisDayLabel: string;
};

// Sits at the top of the dashboard, above the identity card gallery.
// Renders nothing at all if there's no anniversary today — this should
// feel like an occasional surprise, not a permanent fixture.
export function OnThisDayWidget() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetch("/api/connections/on-this-day")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches ?? []))
      .catch(() => {});
  }, []);

  const visible = matches.filter((m) => !dismissed.has(m.id));
  if (visible.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8 -mx-6 flex gap-3 overflow-x-auto px-6 pb-2"
    >
      <AnimatePresence>
        {visible.map((m) => (
          <motion.div
            key={m.id}
            layout
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => router.push(`/dashboard/connections?highlight=${m.id}`)}
            className="group relative flex w-64 shrink-0 cursor-pointer items-start gap-3 rounded-lg border border-brass/30 bg-gradient-to-br from-brass/10 to-transparent px-4 py-3 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass/30 bg-ink font-display text-brass">
              {m.personPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.personPhoto} alt={m.personName} className="h-full w-full object-cover" />
              ) : (
                m.personName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-brass/80">
                On this day · {m.onThisDayLabel}
              </p>
              <p className="truncate text-sm text-bone">{m.personName}</p>
              {m.note && <p className="truncate text-xs text-slate">{m.note}</p>}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDismissed((prev) => new Set(prev).add(m.id));
              }}
              className="absolute right-2 top-2 text-slate/40 hover:text-slate"
              aria-label="Dismiss"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
