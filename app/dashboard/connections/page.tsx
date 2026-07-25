"use client";

import { useEffect, useState } from "react";

type Connection = {
  id: string;
  personName: string;
  personHeadline: string | null;
  personPhoto: string | null;
  meetingContext: string | null;
  identityShared: string | null;
  meetingSource: string;
  createdAt: string;
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => setConnections(d.connections ?? []));
  }, []);

  const filtered = connections.filter((c) =>
    `${c.personName} ${c.personHeadline ?? ""} ${c.meetingContext ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-6 font-display text-3xl text-bone">Connections</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, role, or where you met"
        className="mb-6 w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
      />

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-slate">
          {connections.length === 0
            ? "No connections yet. Share your Bond and they'll show up here."
            : "Nothing matches that search."}
        </p>
      )}

      <ul className="space-y-2">
        {filtered.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-surface px-4 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-brass">
              {c.personPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.personPhoto} alt={c.personName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                c.personName.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-bone">{c.personName}</p>
              {c.personHeadline && <p className="truncate text-xs text-slate">{c.personHeadline}</p>}
            </div>
            <div className="text-right">
              {c.meetingContext && (
                <span className="block font-mono text-[10px] uppercase tracking-wide text-brass">
                  {c.meetingContext}
                </span>
              )}
              {c.identityShared && (
                <span className="block font-mono text-[10px] text-slate/70">
                  as {c.identityShared}
                </span>
              )}
              <p className="font-mono text-[10px] text-slate/70">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
