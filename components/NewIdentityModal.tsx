"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEMPLATES } from "@/lib/identityTemplates";

export function NewIdentityModal({
  open,
  onCreate,
  onClose,
  error,
  pending,
}: {
  open: boolean;
  onCreate: (label: string, templateId: string) => void;
  onClose: () => void;
  error?: string | null;
  pending?: boolean;
}) {
  const [label, setLabel] = useState("");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);

  function submit() {
    const trimmed = label.trim();
    if (!trimmed || pending) return;
    onCreate(trimmed, templateId);
    setLabel("");
  }

  function safeClose() {
    if (pending) return; // don't let the sheet close mid-request — avoids an orphaned in-flight create
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
            {/* A small seal icon that "presses in" as the sheet opens — the
                same stamp language as the profile reveal, in miniature. */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-brass/40 bg-ink"
            >
              <motion.div
                initial={{ opacity: 1, boxShadow: "0 0 0 0 rgba(201,161,92,0.6)" }}
                animate={{ boxShadow: "0 0 0 8px rgba(201,161,92,0)", opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute inset-0 rounded-full"
              />
              <span className="font-display text-lg text-brass">+</span>
            </motion.div>

            <p className="mb-1 text-center font-mono text-xs uppercase tracking-wide text-slate">New identity</p>
            <h2 className="mb-5 text-center font-display text-2xl text-bone">Who&apos;s this version of you?</h2>

            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Friend, Client, Founder"
              disabled={pending}
              className="mb-4 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-center text-sm text-bone placeholder:text-slate/60 focus:border-brass/50 disabled:opacity-60"
            />

            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-slate">
              Start from a template
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  disabled={pending}
                  className={`rounded-lg border px-3 py-2.5 text-left transition disabled:opacity-60 ${
                    templateId === t.id
                      ? "border-brass bg-brass/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <p className={`text-xs font-medium ${templateId === t.id ? "text-brass" : "text-bone"}`}>
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-snug text-slate">{t.description}</p>
                </button>
              ))}
            </div>

            {error && <p className="mb-3 text-center text-xs text-red-300">{error}</p>}

            <button
              onClick={submit}
              disabled={!label.trim() || pending}
              className="w-full rounded-xl bg-brass px-6 py-3 text-center text-sm font-medium text-ink transition active:scale-[0.98] disabled:opacity-40"
            >
              {pending ? "Creating…" : "Create identity"}
            </button>
            <button onClick={safeClose} disabled={pending} className="mt-3 w-full text-center text-sm text-slate hover:text-bone disabled:opacity-40">
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
