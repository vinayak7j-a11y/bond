"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type PreviewData = {
  label: string;
  name: string;
  headline: string;
  about: string;
  whatsapp: string;
  phone: string;
  email: string;
};

// Mirrors components/IdentityBody.tsx's visual language (engraved eyebrow,
// serif name, brass rule, quick-actions) so editing here and viewing the
// real profile never feel like two different products. Deliberately static
// (no entrance replay on every keystroke) — only the identity switch
// animates, so typing feels instant rather than performative.
export function BondPreview({
  data,
  username,
  slug,
  isDefault,
}: {
  data: PreviewData;
  username: string;
  slug: string;
  isDefault: boolean;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
  }, [data.label, data.name, data.headline, data.about, data.whatsapp, data.phone, data.email]);

  const actions = [
    data.whatsapp && "WhatsApp",
    data.phone && "Call",
    data.email && "Email",
  ].filter(Boolean) as string[];

  return (
    <div className="lg:sticky lg:top-10">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            pulse ? "bg-brass" : "bg-slate/40"
          }`}
        />
        Live preview
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-ink p-1.5 shadow-2xl shadow-black/40">
        <div className="relative overflow-hidden rounded-[1.65rem] border border-white/5 bg-ink px-6 pb-8 pt-10">
          <div className="bond-grain" style={{ position: "absolute" }} />

          <AnimatePresence mode="wait">
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-4 h-16 w-16 overflow-hidden rounded-full border border-brass/40 bg-surface">
                <div className="flex h-full w-full items-center justify-center font-display text-xl text-brass">
                  {(data.name || "?").charAt(0).toUpperCase()}
                </div>
              </div>

              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-brass/80">
                {data.label || "Untitled"}
              </p>
              <h2 className="font-display text-2xl tracking-tight text-bone">{data.name || "Your name"}</h2>
              {data.headline && <p className="mt-1 text-xs text-slate">{data.headline}</p>}

              {data.about && (
                <>
                  <div className="my-3 h-px w-12 bg-gradient-to-r from-transparent via-brass/60 to-transparent" />
                  <p className="text-xs leading-relaxed text-bone/80">{data.about}</p>
                </>
              )}

              <div className="mt-6 w-full space-y-2">
                <div className="w-full rounded-lg bg-brass py-2.5 text-center text-xs font-medium text-ink">
                  Save Contact
                </div>
                {actions.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {actions.map((a) => (
                      <div
                        key={a}
                        className="rounded-md border border-white/10 bg-surface py-2 text-center text-[10px] text-bone"
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-6 font-mono text-[9px] text-slate/60">
                bond.app/{username || "you"}
                {!isDefault && slug ? `/${slug}` : ""}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-slate/70">
        {isDefault
          ? "This is what anyone tapping your accessory sees right now."
          : "Not showing yet — switch to it below to make it live."}
      </p>
    </div>
  );
}
