"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FieldDraft, ACTION_TYPES } from "@/lib/fieldTypes";

// Mirrors components/IdentityBody.tsx's visual language (engraved eyebrow,
// serif name, brass rule, quick-actions) so editing here and viewing the
// real profile never feel like two different products. Deliberately static
// (no entrance replay on every keystroke) — only the identity switch
// animates, so typing feels instant rather than performative.
export function BondPreview({
  label,
  name,
  photoUrl,
  fields,
  username,
  slug,
  isDefault,
}: {
  label: string;
  name: string;
  photoUrl?: string | null;
  fields: FieldDraft[];
  username: string;
  slug: string;
  isDefault: boolean;
}) {
  const [pulse, setPulse] = useState(false);

  const signature = JSON.stringify(fields.map((f) => [f.type, f.label, f.value]));
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, label, signature]);

  const filled = fields.filter((f) => f.value);
  const headline = filled.find((f) => f.key === "headline")?.value;
  const about = filled.find((f) => f.key === "about")?.value;
  const actions = filled.filter((f) => ACTION_TYPES.includes(f.type) && f.key !== "headline" && f.key !== "about");
  const links = filled.filter((f) => f.type === "LINK");
  const details = filled.filter(
    (f) => (f.type === "TEXT" || f.type === "LONG_TEXT") && f.key !== "headline" && f.key !== "about"
  );

  return (
    <div className="lg:sticky lg:top-10">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
        <span className="relative flex h-1.5 w-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brass/50" />
          <AnimatePresence>
            {pulse && (
              <motion.span
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-brass"
              />
            )}
          </AnimatePresence>
        </span>
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
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-xl text-brass">
                    {(name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-brass/80">
                {label || "Untitled"}
              </p>
              <h2 className="font-display text-2xl tracking-tight text-bone">{name || "Your name"}</h2>
              {headline && <p className="mt-1 text-xs text-slate">{headline}</p>}

              {about && (
                <>
                  <div className="my-3 h-px w-12 bg-gradient-to-r from-transparent via-brass/60 to-transparent" />
                  <p className="text-xs leading-relaxed text-bone/80">{about}</p>
                </>
              )}

              <div className="mt-6 w-full space-y-2">
                <div className="w-full rounded-lg bg-brass py-2.5 text-center text-xs font-medium text-ink">
                  Save Contact
                </div>
                {actions.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {actions.map((a, i) => (
                      <div
                        key={`${a.label}-${i}`}
                        className="rounded-md border border-white/10 bg-surface py-2 text-center text-[10px] text-bone"
                      >
                        {a.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {details.length > 0 && (
                <div className="mt-4 w-full space-y-1.5 text-left">
                  {details.map((d, i) => (
                    <div key={`${d.label}-${i}`} className="rounded-md border border-white/10 bg-surface px-3 py-1.5">
                      <p className="font-mono text-[8px] uppercase tracking-wide text-brass/70">{d.label}</p>
                      <p className="mt-0.5 text-[10px] text-bone/80">{d.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {links.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {links.map((l, i) => (
                    <span key={`${l.label}-${i}`} className="font-mono text-[9px] text-slate">
                      {l.label}
                    </span>
                  ))}
                </div>
              )}

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
