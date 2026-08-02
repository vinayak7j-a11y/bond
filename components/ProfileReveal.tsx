"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

// The signature moment: the profile doesn't "load," it's stamped — like a
// signet ring pressing into wax. The photo recedes slightly, a brass ring
// flashes as the impression lands, then everything releases upward with a
// small overshoot. What's left behind is a real, permanent mark: a thin
// brass rule (see `ruleItem`) dividing headline from bio, as if the seal's
// impression is still visible on the page. The same stamp micro-interaction
// replays on Save Contact (see SaveContactButton) — sealing the bond.
//
// Plays on every visit (not just first tap), tuned to land under ~1s so
// repeat visitors never feel like they're waiting on a screen. Respects
// prefers-reduced-motion globally (see globals.css).

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// For elements that should "unroll" horizontally from center, like the
// engraved rule the seal leaves behind.
const ruleItem = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProfileReveal({
  photoUrl,
  name,
  children,
}: {
  photoUrl?: string | null;
  name: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const particleCount = reduceMotion ? 0 : 8;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative flex flex-col items-center px-6 pt-14 pb-10"
    >
      {/* A brief room-filling light pulse right as the seal lands — makes
          the moment feel like it fills the whole screen, not just the
          medallion. Fixed positioning so it covers the full viewport
          regardless of scroll, fires once, gone in half a second. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: 0.55, delay: 0.32, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(201,161,92,0.5), transparent 55%)",
          }}
        />
      )}

      {/* Ambient halo behind the medallion — barely perceptible, gives the
          impression photo weight/presence without reading as a "glow effect." */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-14 h-40 w-40 -translate-x-1/2 rounded-full bg-brass/20 blur-2xl animate-ambient-glow"
      />

      <motion.div
        variants={item}
        className="relative mb-6 h-28 w-28 shrink-0 rounded-full"
      >
        {/* Fine brass dust scattering outward as the seal makes contact —
            reinforces "impact" rather than just a glow fading in. */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * Math.PI * 2;
          const distance = 46;
          return (
            <motion.span
              key={i}
              aria-hidden
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 1, 0],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: [0.8, 1, 0.6],
              }}
              transition={{ duration: 0.55, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-brass"
            />
          );
        })}

        {/* The stamp flash — a ring that snaps out once as the seal lands. */}
        <motion.div
          initial={{ opacity: 1, boxShadow: "0 0 0 0 rgba(201,161,92,0.6)" }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(201,161,92,0.6)",
              "0 0 0 10px rgba(201,161,92,0)",
            ],
            opacity: [1, 0],
          }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.88, y: 4, filter: "blur(6px)", opacity: 0 }}
          animate={{ scale: [0.88, 1.06, 1], y: [4, -2, 0], filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="h-28 w-28 overflow-hidden rounded-full border border-brass/40 bg-surface"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              width={112}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-brass">
              {name.charAt(0)}
            </div>
          )}
        </motion.div>
      </motion.div>
      {children}
    </motion.div>
  );
}

export { item as revealItem, ruleItem };
