"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function HomeHero() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="bond-grain" />

      {/* Same ambient brass presence used behind the profile medallion —
          ties the very first page into the rest of the product's material
          language instead of feeling like a disconnected landing page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/10 blur-3xl animate-ambient-glow"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative flex flex-col items-center"
      >
        <motion.p variants={item} className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">
          Bond
        </motion.p>
        <motion.h1 variants={item} className="max-w-sm font-display text-4xl leading-tight text-bone">
          The future of human connections.
        </motion.h1>
        <motion.p variants={item} className="mt-4 max-w-xs text-sm text-slate">
          Tap. Save. Remember. The smoothest way to turn an introduction into a relationship.
        </motion.p>

        <motion.div variants={item}>
          <Link href="/sign-up">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="mt-8 inline-block rounded-xl bg-brass px-8 py-3 text-sm font-medium text-ink"
            >
              Create your Bond
            </motion.span>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/sign-in" className="mt-4 inline-block text-sm text-slate hover:text-bone">
            Already have one? Sign in
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
