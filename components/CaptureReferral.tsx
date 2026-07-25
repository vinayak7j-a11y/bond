"use client";

import { useEffect } from "react";

const KEY = "bond_referred_by";

export function captureReferralParam(ref: string | null) {
  if (typeof window === "undefined" || !ref) return;
  // Only ever store the FIRST referrer this browser saw before signup —
  // don't let a later click overwrite an earlier, more accurate one.
  if (!window.localStorage.getItem(KEY)) {
    window.localStorage.setItem(KEY, ref);
  }
}

// Mounted once in the dashboard layout, alongside ClaimPendingConnections.
// If this browser visited a Bond via someone's "Create your own Bond" link
// before signing up, attribute that referral now that an account exists.
export function CaptureReferral() {
  useEffect(() => {
    const ref = window.localStorage.getItem(KEY);
    if (!ref) return;

    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
    })
      .then(() => window.localStorage.removeItem(KEY))
      .catch(() => {
        // Non-critical — worst case, this signup just isn't attributed.
      });
  }, []);

  return null;
}
