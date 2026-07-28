"use client";

import { motion } from "framer-motion";

export function QuickActionButton({ label, href }: { label: string; href: string }) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-white/10 bg-surface py-3 text-center text-xs text-bone transition hover:border-brass/40 active:border-brass/60 active:bg-brass/[0.06]"
    >
      {label}
    </motion.a>
  );
}
