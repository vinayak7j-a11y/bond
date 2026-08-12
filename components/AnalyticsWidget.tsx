"use client";

import { useEffect, useState } from "react";

type Counts = {
  view: number;
  contact_save: number;
  bond_pass_save: number;
  referral_signup: number;
};

export function AnalyticsWidget() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [last30, setLast30] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setCounts(d.counts ?? null);
          setLast30(d.last30 ?? null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // No loading skeleton for a secondary stat row — it should just appear
  // once ready rather than draw attention to itself while loading.
  if (!counts) return null;

  const stats = [
    { label: "Views", value: counts.view, recent: last30?.view },
    { label: "Saves", value: counts.contact_save, recent: last30?.contact_save },
    { label: "Referrals", value: counts.referral_signup, recent: last30?.referral_signup },
  ];

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">Activity</h2>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-white/10 bg-surface px-4 py-3 text-center"
          >
            <p className="font-display text-2xl text-bone">{s.value}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-slate">{s.label}</p>
            {typeof s.recent === "number" && s.recent > 0 && (
              <p className="mt-1 text-[10px] text-brass">+{s.recent} this month</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
