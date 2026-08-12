"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tag = {
  id: string;
  code: string;
  claimedAt: string | null;
};

export function MyTagsSection() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [manualCode, setManualCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setTags(d.tags ?? []);
      })
      .catch(() => {
        if (!cancelled) setTags([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function goActivate() {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    // Reuses the existing claim page rather than re-implementing claim
    // logic here — that page already handles every state (not found,
    // already claimed, already yours) correctly.
    router.push(`/claim/${code}`);
  }

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">
        Accessories
      </h2>

      {tags === null && <p className="text-sm text-slate">Loading…</p>}

      {tags !== null && tags.length === 0 && (
        <p className="mb-4 text-sm text-slate">
          No accessories activated yet. Got a physical tag? Tap or scan it, or enter its code below.
        </p>
      )}

      {tags !== null && tags.length > 0 && (
        <ul className="mb-4 space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-surface px-4 py-3"
            >
              <span className="font-mono text-sm text-bone">{tag.code}</span>
              <span className="text-xs text-slate">
                {tag.claimedAt
                  ? `Activated ${new Date(tag.claimedAt).toLocaleDateString()}`
                  : "Activated"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goActivate()}
          placeholder="Enter accessory code"
          className="flex-1 rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
        />
        <button
          onClick={goActivate}
          disabled={!manualCode.trim()}
          className="rounded-lg border border-brass/40 px-4 py-2.5 text-sm text-brass transition hover:border-brass disabled:opacity-40"
        >
          Activate
        </button>
      </div>
    </section>
  );
}
