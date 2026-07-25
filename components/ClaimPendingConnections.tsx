"use client";

import { useEffect } from "react";
import { getAnonToken, rotateAnonToken } from "@/lib/anon";

// Mounted once in the dashboard layout. If this browser saved a contact
// before its owner had a Bond account, this quietly upgrades those into
// real connections the moment they land on their new dashboard — see
// /api/pending-connections/claim for the actual conversion logic.
export function ClaimPendingConnections() {
  useEffect(() => {
    const token = getAnonToken();
    if (!token) return;

    fetch("/api/pending-connections/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonToken: token }),
    })
      .then((r) => r.json())
      .then(() => {
        // Rotate so a shared/reused device doesn't attach someone else's
        // later anonymous saves to this account.
        rotateAnonToken();
      })
      .catch(() => {
        // Non-critical — worst case, nothing gets upgraded this load.
      });
  }, []);

  return null;
}
