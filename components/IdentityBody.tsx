"use client";

import { motion } from "framer-motion";
import { revealItem, ruleItem } from "@/components/ProfileReveal";
import { SaveContactButton } from "@/components/SaveContactButton";
import { QuickActionButton } from "@/components/QuickActionButton";

type Action = { label: string; href: string };

export function IdentityBody({
  username,
  identity,
  actions,
  socials,
}: {
  username: string;
  identity: {
    id: string;
    slug: string;
    label: string;
    name: string;
    headline: string | null;
    about: string | null;
    photoUrl: string | null;
  };
  actions: Action[];
  socials: Action[];
}) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <motion.p
        variants={revealItem}
        className="mb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-brass/80"
      >
        {identity.label}
      </motion.p>

      <motion.h1 variants={revealItem} className="font-display text-4xl tracking-tight text-bone">
        {identity.name}
      </motion.h1>

      {identity.headline && (
        <motion.p variants={revealItem} className="mt-1.5 text-sm text-slate">
          {identity.headline}
        </motion.p>
      )}

      {identity.about && (
        <>
          <motion.div
            variants={ruleItem}
            className="my-5 h-px w-16 bg-gradient-to-r from-transparent via-brass/60 to-transparent"
          />
          <motion.p variants={revealItem} className="text-sm leading-relaxed text-bone/80">
            {identity.about}
          </motion.p>
        </>
      )}

      <motion.div variants={revealItem} className="mt-8 w-full space-y-3">
        <SaveContactButton
          username={username}
          identityId={identity.id}
          identitySlug={identity.slug}
          identityLabel={identity.label}
          name={identity.name}
          headline={identity.headline}
          photoUrl={identity.photoUrl}
        />

        {actions.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {actions.map((a) => (
              <QuickActionButton key={a.label} label={a.label} href={a.href} />
            ))}
          </div>
        )}
      </motion.div>

      {socials.length > 0 && (
        <motion.div variants={revealItem} className="mt-6 flex flex-wrap justify-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-slate transition hover:text-brass"
            >
              {s.label}
            </a>
          ))}
        </motion.div>
      )}
    </div>
  );
}
