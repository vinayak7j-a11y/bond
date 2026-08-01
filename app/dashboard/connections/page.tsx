"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Connection = {
  id: string;
  personName: string;
  personHeadline: string | null;
  personPhoto: string | null;
  meetingContext: string | null;
  identityShared: string | null;
  meetingSource: string;
  note: string | null;
  createdAt: string;
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((startOfToday.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 86400000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  if (days < 30) return "This month";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/connections")
      .then((r) => r.json())
      .then((d) => setConnections(d.connections ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = connections.filter((c) =>
    `${c.personName} ${c.personHeadline ?? ""} ${c.meetingContext ?? ""} ${c.note ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const groups = useMemo(() => {
    const map = new Map<string, Connection[]>();
    for (const c of filtered) {
      const label = groupLabel(c.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function updateLocalNote(id: string, note: string) {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, note } : c)));
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-6 font-display text-3xl text-bone">Connections</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, role, note, or where you met"
        className="mb-6 w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
      />

      {!loading && filtered.length === 0 && <EmptyState hasAny={connections.length > 0} />}

      <motion.div initial="hidden" animate="visible" variants={container} className="space-y-6">
        {groups.map(([label, items]) => (
          <div key={label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-slate/70">{label}</p>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {items.map((c) => (
                  <ConnectionRow
                    key={c.id}
                    connection={c}
                    expanded={expandedId === c.id}
                    onToggle={() => setExpandedId((cur) => (cur === c.id ? null : c.id))}
                    onNoteChange={(note) => updateLocalNote(c.id, note)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </motion.div>
    </main>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <svg viewBox="0 0 48 48" className="mb-4 h-12 w-12 text-brass/40" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.5" />
      </svg>
      <p className="max-w-xs text-sm text-slate">
        {hasAny
          ? "Nothing matches that search."
          : "No connections yet. Share your Bond and the people you meet will show up here."}
      </p>
    </div>
  );
}

function ConnectionRow({
  connection: c,
  expanded,
  onToggle,
  onNoteChange,
}: {
  connection: Connection;
  expanded: boolean;
  onToggle: () => void;
  onNoteChange: (note: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [noteDraft, setNoteDraft] = useState(c.note ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  async function saveNote() {
    if (noteDraft === (c.note ?? "")) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/connections/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft }),
      });
      const data = await res.json();
      if (!res.ok || !data.connection) {
        setSaveState("idle");
        return;
      }
      onNoteChange(noteDraft);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1200);
    } catch {
      setSaveState("idle");
    }
  }

  return (
    <motion.div
      layout={!reduceMotion}
      variants={item}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-surface"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass/30 bg-ink font-display text-brass">
          {c.personPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.personPhoto} alt={c.personName} className="h-full w-full object-cover" />
          ) : (
            c.personName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-bone">{c.personName}</p>
          {c.personHeadline && <p className="truncate text-xs text-slate">{c.personHeadline}</p>}
        </div>
        <div className="shrink-0 text-right">
          {c.meetingContext && (
            <span className="block font-mono text-[10px] uppercase tracking-wide text-brass">
              {c.meetingContext}
            </span>
          )}
          {c.identityShared && (
            <span className="block font-mono text-[10px] text-slate/70">as {c.identityShared}</span>
          )}
        </div>
        {c.note && !expanded && (
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brass" title="Has a note" />
        )}
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate"
        >
          ⌄
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-3">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-slate/70">
                Met via {c.meetingSource} · {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onBlur={saveNote}
                placeholder="Add a private note — why they matter, what to follow up on…"
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate/50 focus:border-brass/50 focus:outline-none"
              />
              <div className="mt-1 h-3 text-right font-mono text-[10px] text-brass/70">
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : ""}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
