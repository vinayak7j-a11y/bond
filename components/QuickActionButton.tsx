"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function QuickActionButton({ label, href }: { label: string; href: string }) {
  const [stamped, setStamped] = useState(false);

  return (
    <motion.a
      href={href}
      onClick={() => {
        setStamped(true);
        setTimeout(() => setStamped(false), 650);
      }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
      className="relative overflow-hidden rounded-lg border border-white/10 bg-surface py-3 text-center text-xs text-bone transition hover:border-brass/40 active:border-brass/60 active:bg-brass/[0.06]"
    >
      {stamped && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg animate-ring-stamp"
        />
      )}
      {label}
    </motion.a>
  );
}
