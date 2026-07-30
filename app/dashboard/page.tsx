"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BondPreview } from "@/components/BondPreview";
import { NewIdentityModal } from "@/components/NewIdentityModal";
import { DeleteIdentityModal } from "@/components/DeleteIdentityModal";
import { FieldDraft, FieldType, FIELD_TYPES, FIELD_TYPE_META } from "@/lib/fieldTypes";

type ServerField = FieldDraft & { id: string };

type Identity = {
  id: string;
  slug: string;
  label: string;
  isDefault: boolean;
  name: string;
  fields: ServerField[];
};

// A local-only id so React keys and update targets stay stable across
// reorders/edits, regardless of whether the field has a server id yet.
type LocalField = FieldDraft & { _cid: string };

function cid() {
  return Math.random().toString(36).slice(2);
}

function toLocalFields(fields: ServerField[]): LocalField[] {
  const withCid: LocalField[] = fields.map((f) => ({ ...f, _cid: f.id }));
  // Always guarantee headline/about slots exist locally so the editor has a
  // consistent pinned shape, even for a "Blank" or "Just Contact" identity
  // that never had them.
  if (!withCid.some((f) => f.key === "headline")) {
    withCid.unshift({ _cid: cid(), key: "headline", type: "TEXT", label: "Headline", value: "", order: -2 });
  }
  if (!withCid.some((f) => f.key === "about")) {
    const idx = withCid.some((f) => f.key === "headline") ? 1 : 0;
    withCid.splice(idx, 0, {
      _cid: cid(),
      key: "about",
      type: "LONG_TEXT",
      label: "About",
      value: "",
      order: -1,
    });
  }
  return withCid;
}

export default function DashboardPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [username, setUsername] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState<LocalField[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newIdentityOpen, setNewIdentityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [justSwitchedId, setJustSwitchedId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/identities");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Couldn't load your Bond. Try refreshing.");
        return;
      }
      setLoadError(null);
      setIdentities(data.identities);
      setUsername(data.username ?? "");
      const active = data.identities.find((i: Identity) => i.isDefault) ?? data.identities[0];
      if (active) selectIdentity(active);
    } catch {
      setLoadError("Couldn't reach the server. Check your connection and try refreshing.");
    }
  }

  function selectIdentity(identity: Identity) {
    setActiveId(identity.id);
    setJustSwitchedId(identity.id);
    setTimeout(() => setJustSwitchedId(null), 550);
    setName(identity.name ?? "");
    setLabel(identity.label ?? "");
    setFields(toLocalFields(identity.fields ?? []));
  }

  function updateField(fieldCid: string, patch: Partial<LocalField>) {
    setFields((prev) => prev.map((f) => (f._cid === fieldCid ? { ...f, ...patch } : f)));
  }

  function removeField(fieldCid: string) {
    setFields((prev) => prev.filter((f) => f._cid !== fieldCid));
  }

  function addField() {
    setFields((prev) => [...prev, { _cid: cid(), type: "TEXT", label: "", value: "", order: prev.length }]);
  }

  function moveCustomField(fieldCid: string, direction: -1 | 1) {
    setFields((prev) => {
      const special = prev.filter((f) => f.key === "headline" || f.key === "about");
      const custom = prev.filter((f) => f.key !== "headline" && f.key !== "about");
      const idx = custom.findIndex((f) => f._cid === fieldCid);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= custom.length) return prev;
      const reordered = [...custom];
      [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
      return [...special, ...reordered];
    });
  }

  function buildPayload() {
    return fields
      .filter((f) => f.value.trim() !== "" || f.id) // don't create empty rows for untouched new fields
      .map(({ _cid, ...rest }) => rest);
  }

  async function save() {
    if (!activeId) return;
    setStatus("saving");
    const res = await fetch(`/api/identities/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, label, fields: buildPayload() }),
    });
    const data = await res.json();
    if (data.identity) {
      setIdentities((prev) => prev.map((i) => (i.id === activeId ? data.identity : i)));
      setFields(toLocalFields(data.identity.fields ?? []));
    }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  async function makeDefault() {
    if (!activeId) return;
    const res = await fetch(`/api/identities/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, label, fields: buildPayload(), makeDefault: true }),
    });
    const data = await res.json();
    if (data.identity) await load();
  }

  async function createIdentity(newLabel: string, templateId: string) {
    setCreateError(null);
    const res = await fetch("/api/identities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, name: name || "Your name", templateId }),
    });
    const data = await res.json();
    if (data.identity) {
      setNewIdentityOpen(false);
      setIdentities((prev) => [...prev, data.identity]);
      selectIdentity(data.identity);
    } else {
      setCreateError(data.error ?? "Couldn't create that identity — try again.");
    }
  }

  async function deleteIdentity() {
    if (!activeId) return;
    setDeleteError(null);
    const res = await fetch(`/api/identities/${activeId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      setDeleteError(data.error);
      return;
    }
    setDeleteOpen(false);
    await load();
  }

  const active = identities.find((i) => i.id === activeId);
  const headlineField = fields.find((f) => f.key === "headline");
  const aboutField = fields.find((f) => f.key === "about");
  const customFields = fields.filter((f) => f.key !== "headline" && f.key !== "about");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-display text-3xl text-bone">Your Bond</h1>
        {username && (
          <p className="font-mono text-xs text-slate">
            bond.app/{username}
            {active && !active.isDefault && `/${active.slug}`}
          </p>
        )}
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {identities.map((i) => (
          <motion.button
            key={i.id}
            onClick={() => selectIdentity(i)}
            whileTap={{ scale: 0.96 }}
            className={`relative rounded-full border px-3 py-1.5 text-xs transition ${
              i.id === activeId ? "border-brass text-brass" : "border-white/10 text-slate hover:text-bone"
            }`}
          >
            {i.id === activeId && (
              <motion.span
                layoutId="pill-highlight"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="absolute inset-0 rounded-full bg-brass/10"
              />
            )}
            {justSwitchedId === i.id && (
              <motion.span
                initial={{ opacity: 0.8, boxShadow: "0 0 0 0 rgba(201,161,92,0.5)" }}
                animate={{ opacity: 0, boxShadow: "0 0 0 6px rgba(201,161,92,0)" }}
                transition={{ duration: 0.5 }}
                className="pointer-events-none absolute inset-0 rounded-full"
              />
            )}
            <span className="relative">
              {i.label || "Untitled"}
              {i.isDefault && " (showing now)"}
            </span>
          </motion.button>
        ))}
        <button
          onClick={() => setNewIdentityOpen(true)}
          className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs text-slate transition hover:border-brass/50 hover:text-brass"
        >
          + New identity
        </button>
      </div>

      {active && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="mb-6 text-xs text-slate">
              Your accessories always open the same link - bond.app/{username}. Whichever
              identity is marked "showing now" is what anyone sees when they tap or scan. Switch
              it any time; every accessory updates instantly, nothing to reprogram. People who've
              already saved your contact keep seeing whatever you showed them at the time -
              switching here only changes what new people see.
            </p>

            <section className="mb-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">Identity</h2>
              <div className="space-y-3">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Professional, Friend, Client"
                  className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name (can differ per identity)"
                  className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
                />
                {headlineField && (
                  <input
                    value={headlineField.value}
                    onChange={(e) => updateField(headlineField._cid, { value: e.target.value })}
                    placeholder="How you'd introduce yourself in this context"
                    className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
                  />
                )}
                {aboutField && (
                  <textarea
                    value={aboutField.value}
                    onChange={(e) => updateField(aboutField._cid, { value: e.target.value })}
                    placeholder="A couple sentences - whatever fits this version of you"
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
                  />
                )}
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-xs uppercase tracking-wide text-slate">
                  Fields — whatever this identity needs
                </h2>
                <button
                  onClick={addField}
                  className="font-mono text-xs text-brass hover:underline"
                >
                  + Add field
                </button>
              </div>

              {customFields.length === 0 && (
                <p className="rounded-lg border border-dashed border-white/10 px-4 py-4 text-center text-xs text-slate">
                  Nothing here yet — add contact methods, links, resume, skills, achievements, or
                  anything else this identity should carry. Only fields with a value ever show on
                  the public profile.
                </p>
              )}

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {customFields.map((f, i) => (
                    <motion.div
                      key={f._cid}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden rounded-lg border border-white/10 bg-surface"
                    >
                      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
                        <input
                          value={f.label}
                          onChange={(e) => updateField(f._cid, { label: e.target.value })}
                          placeholder="Field name — Resume, Skills, Favorite food, anything"
                          className="min-w-0 flex-1 bg-transparent text-sm text-bone placeholder:text-slate/60 focus:outline-none"
                        />
                        <select
                          value={f.type}
                          onChange={(e) => updateField(f._cid, { type: e.target.value as FieldType })}
                          className="rounded-md border border-white/10 bg-ink px-2 py-1 text-xs text-slate focus:border-brass/50 focus:outline-none"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {FIELD_TYPE_META[t].name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => moveCustomField(f._cid, -1)}
                          disabled={i === 0}
                          className="text-slate hover:text-bone disabled:opacity-20"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCustomField(f._cid, 1)}
                          disabled={i === customFields.length - 1}
                          className="text-slate hover:text-bone disabled:opacity-20"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeField(f._cid)}
                          className="text-slate hover:text-red-400"
                          aria-label="Remove field"
                        >
                          ✕
                        </button>
                      </div>
                      {f.type === "LONG_TEXT" ? (
                        <textarea
                          value={f.value}
                          onChange={(e) => updateField(f._cid, { value: e.target.value })}
                          placeholder={FIELD_TYPE_META[f.type].placeholder}
                          rows={2}
                          className="w-full bg-transparent px-3 py-2 text-sm text-bone placeholder:text-slate/60 focus:outline-none"
                        />
                      ) : (
                        <input
                          value={f.value}
                          onChange={(e) => updateField(f._cid, { value: e.target.value })}
                          placeholder={FIELD_TYPE_META[f.type].placeholder}
                          className="w-full bg-transparent px-3 py-2 text-sm text-bone placeholder:text-slate/60 focus:outline-none"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            <button
              onClick={save}
              disabled={status === "saving"}
              className="relative w-full overflow-hidden rounded-xl bg-brass px-6 py-4 text-center text-base font-medium text-ink transition active:scale-[0.98] disabled:opacity-60"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  {status === "saved" ? "Saved ✓" : status === "saving" ? "Saving…" : "Save changes"}
                </motion.span>
              </AnimatePresence>
            </button>

            <div className="mt-4 flex items-center justify-between text-sm">
              {active.isDefault ? (
                <span className="text-slate">Your accessories are currently showing this</span>
              ) : (
                <button onClick={makeDefault} className="text-brass hover:underline">
                  Show this instead
                </button>
              )}
              {identities.length > 1 && (
                <button onClick={() => setDeleteOpen(true)} className="text-slate hover:text-red-400">
                  Delete identity
                </button>
              )}
            </div>

            {username && (
              <a
                href={`/${username}${active.isDefault ? "" : `/${active.slug}`}`}
                target="_blank"
                className="mt-4 block text-center text-sm text-slate hover:text-brass"
              >
                View this identity live
              </a>
            )}
          </div>

          <BondPreview
            label={label}
            name={name}
            fields={fields}
            username={username}
            slug={active.slug}
            isDefault={active.isDefault}
          />
        </div>
      )}

      <NewIdentityModal
        open={newIdentityOpen}
        onCreate={createIdentity}
        onClose={() => {
          setNewIdentityOpen(false);
          setCreateError(null);
        }}
        error={createError}
      />

      <DeleteIdentityModal
        open={deleteOpen}
        label={active?.label || "this identity"}
        onConfirm={deleteIdentity}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        error={deleteError}
      />
    </main>
  );
}
