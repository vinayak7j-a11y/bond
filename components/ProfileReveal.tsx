"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

// The signature moment: the profile doesn't "load," it resolves — like a
// signal locking on. A thin brass ring pulses once around the photo while
// it sharpens from a soft blur into focus, then everything else settles in
// behind it. This plays on every visit (not just first tap) but stays under
// ~1s total so repeat visitors never feel like they're waiting on a screen.
//
// If you later want a "first view only" version, gate the whole sequence
// behind a localStorage check keyed by username and skip straight to the
// resting state (variants "visible" with no transition) on repeat views.

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
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

export function ProfileReveal({
  photoUrl,
  name,
  children,
}: {
  photoUrl?: string | null;
  name: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="flex flex-col items-center px-6 pt-14 pb-10"
    >
      <motion.div
        variants={item}
        className="relative mb-6 h-28 w-28 shrink-0 animate-pulse-ring rounded-full"
      >
        <motion.div
          initial={{ filter: "blur(8px)", scale: 0.92, opacity: 0 }}
          animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="h-28 w-28 overflow-hidden rounded-full border border-brass/40 bg-surface"
        >
          {photoUrl ? (
            <Image src={photoUrl} alt={name} width={112} height={112} className="h-full w-full object-cover" />
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

export { item as revealItem };
