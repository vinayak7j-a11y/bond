"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { BondPreview } from "@/components/BondPreview";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { NewIdentityModal } from "@/components/NewIdentityModal";
import { DeleteIdentityModal } from "@/components/DeleteIdentityModal";
import { FieldDraft, FieldType, FIELD_TYPES, FIELD_TYPE_META } from "@/lib/fieldTypes";
import { FieldTypeIcon } from "@/components/FieldTypeIcon";
import { OnThisDayWidget } from "@/components/OnThisDayWidget";
import { MyTagsSection } from "@/components/MyTagsSection";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";

type ServerField = FieldDraft & { id: string };

type Identity = {
  id: string;
  slug: string;
  label: string;
  isDefault: boolean;
  name: string;
  photoUrl: string | null;
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
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [justAddedCid, setJustAddedCid] = useState<string | null>(null);
  const [fields, setFields] = useState<LocalField[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newIdentityOpen, setNewIdentityOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [justSwitchedId, setJustSwitchedId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [creatingIdentity, setCreatingIdentity] = useState(false);
  const [deletingIdentity, setDeletingIdentity] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const load = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function selectIdentity(identity: Identity) {
    setActiveId(identity.id);
    setJustSwitchedId(identity.id);
    setTimeout(() => setJustSwitchedId(null), 550);
    setName(identity.name ?? "");
    setLabel(identity.label ?? "");
    setPhotoUrl(identity.photoUrl ?? "");
    setFields(toLocalFields(identity.fields ?? []));
  }

  function updateField(fieldCid: string, patch: Partial<LocalField>) {
    setFields((prev) => prev.map((f) => (f._cid === fieldCid ? { ...f, ...patch } : f)));
  }

  function removeField(fieldCid: string) {
    setFields((prev) => prev.filter((f) => f._cid !== fieldCid));
  }

  function addField() {
    const newCid = cid();
    setFields((prev) => [...prev, { _cid: newCid, type: "TEXT", label: "", value: "", order: prev.length }]);
    setJustAddedCid(newCid);
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

  function handleReorderCustomFields(newCustomOrder: LocalField[]) {
    setFields((prev) => {
      const special = prev.filter((f) => f.key === "headline" || f.key === "about");
      return [...special, ...newCustomOrder];
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
    try {
      const res = await fetch(`/api/identities/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, label, photoUrl, fields: buildPayload() }),
      });
      const data = await res.json();
      if (!res.ok || !data.identity) {
        setLoadError(data.error ?? "Couldn't save your changes. Try again.");
        setStatus("idle");
        return;
      }
      setIdentities((prev) => prev.map((i) => (i.id === activeId ? data.identity : i)));
      setFields(toLocalFields(data.identity.fields ?? []));
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setLoadError("Couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  }

  async function makeDefault() {
    if (!activeId) return;
    const res = await fetch(`/api/identities/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, label, photoUrl, fields: buildPayload(), makeDefault: true }),
    });
    const data = await res.json();
    if (!res.ok || !data.identity) {
      setLoadError(data.error ?? "Couldn't switch identities. Try again.");
      return;
    }
    await load();
  }

  async function createIdentity(newLabel: string, templateId: string) {
    setCreateError(null);
    setCreatingIdentity(true);
    try {
      const res = await fetch("/api/identities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, name: name || "Your name", templateId }),
      });
      const data = await res.json();
      if (!res.ok || !data.identity) {
        setCreateError(data.error ?? "Couldn't create that identity — try again.");
        return;
      }
      setNewIdentityOpen(false);
      setIdentities((prev) => [...prev, data.identity]);
      selectIdentity(data.identity);
    } catch {
      setCreateError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setCreatingIdentity(false);
    }
  }

  async function duplicateIdentity() {
    if (!active || duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch("/api/identities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: `${active.label} copy`,
          name: active.name,
          duplicateFromId: active.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.identity) return; // non-critical action, fail quietly rather than alarm
      setIdentities((prev) => [...prev, data.identity]);
      selectIdentity(data.identity);
    } catch {
      // Same — duplication is a convenience, not a core action worth a
      // scary error state if the network hiccups.
    } finally {
      setDuplicating(false);
    }
  }

  async function deleteIdentity() {
    if (!activeId) return;
    setDeleteError(null);
    setDeletingIdentity(true);
    try {
      const res = await fetch(`/api/identities/${activeId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setDeleteError(data.error ?? "Couldn't delete that identity — try again.");
        return;
      }
      setDeleteOpen(false);
      await load();
    } catch {
      setDeleteError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeletingIdentity(false);
    }
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

      <OnThisDayWidget />

      <div className="mb-8 -mx-6 flex gap-3 overflow-x-auto px-6 pb-2">
        {identities.map((i, idx) => (
          <motion.button
            key={i.id}
            onClick={() => selectIdentity(i)}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -3 }}
            initial={{ opacity: 0, y: 16, scale: 0.9, rotate: idx % 2 === 0 ? -3 : 3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-pressed={i.id === activeId}
            className={`relative flex w-28 shrink-0 flex-col items-center gap-2 overflow-hidden rounded-xl border p-3 transition-colors ${
              i.id === activeId
                ? "border-brass bg-brass/5"
                : "border-white/10 hover:border-white/25"
            }`}
          >
            {i.id === activeId && (
              <>
                <motion.span
                  layoutId="card-highlight"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-brass/5"
                />
                {/* A soft continuous pulse so the active card reads as
                    "alive" rather than a static selected state. */}
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 rounded-xl border border-brass/40"
                />
              </>
            )}
            {justSwitchedId === i.id && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl animate-ring-stamp"
              />
            )}
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-brass/30 bg-ink">
              {i.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-lg text-brass">
                  {(i.label || i.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="relative w-full text-center">
              <p className="truncate text-xs font-medium text-bone">{i.label || "Untitled"}</p>
              {i.isDefault && <p className="mt-0.5 text-[9px] uppercase tracking-wide text-brass">Showing now</p>}
            </div>
          </motion.button>
        ))}
        <motion.button
          onClick={() => setNewIdentityOpen(true)}
          whileTap={{ scale: 0.94 }}
          whileHover={{ y: -3, borderColor: "rgba(201,161,92,0.5)" }}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: identities.length * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/20 p-3 text-slate transition-colors hover:text-brass"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[10px]">New identity</span>
        </motion.button>
      </div>

      {active && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="mb-6 text-xs text-slate">
              Your accessories always open the same link - bond.app/{username}. Whichever
              identity is marked &quot;showing now&quot; is what anyone sees when they tap or scan. Switch
              it any time; every accessory updates instantly, nothing to reprogram. People who&apos;ve
              already saved your contact keep seeing whatever you showed them at the time -
              switching here only changes what new people see.
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
            <section className="mb-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">Identity</h2>
              <div className="mb-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.focus()}
                  className="group relative h-20 w-20 overflow-hidden rounded-full border border-brass/30 bg-ink transition hover:border-brass/60"
                >
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-2xl text-brass">
                      {(name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-[10px] font-medium text-bone opacity-0 transition-opacity group-hover:bg-ink/60 group-hover:opacity-100">
                    Change
                  </span>
                  <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-brass text-ink transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="M2.5 6a1 1 0 0 1 1-1h1.2l.6-1.1a1 1 0 0 1 .88-.5h3.64a1 1 0 0 1 .88.5l.6 1.1h1.2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V6z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="8.8" r="2.1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </button>
                <input
                  ref={photoInputRef}
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste a direct image link"
                  className="w-full max-w-[220px] rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-center text-xs text-bone placeholder:text-slate/60 focus:border-brass/50"
                />
              </div>
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

              <Reorder.Group
                as="div"
                axis="y"
                values={customFields}
                onReorder={handleReorderCustomFields}
                className="space-y-2"
              >
                <AnimatePresence initial={false}>
                  {customFields.map((f, i) => (
                    <FieldRow
                      key={f._cid}
                      field={f}
                      index={i}
                      total={customFields.length}
                      autoFocus={f._cid === justAddedCid}
                      onUpdate={(patch) => updateField(f._cid, patch)}
                      onRemove={() => removeField(f._cid)}
                      onMoveUp={() => moveCustomField(f._cid, -1)}
                      onMoveDown={() => moveCustomField(f._cid, 1)}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
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
              <div className="flex items-center gap-4">
                <button
                  onClick={duplicateIdentity}
                  disabled={duplicating}
                  className="text-slate hover:text-brass disabled:opacity-50"
                >
                  {duplicating ? "Duplicating…" : "Duplicate"}
                </button>
                {identities.length > 1 && (
                  <button onClick={() => setDeleteOpen(true)} className="text-slate hover:text-red-400">
                    Delete identity
                  </button>
                )}
              </div>
            </div>

            {username && (
              <>
                <a
                  href={`/${username}${active.isDefault ? "" : `/${active.slug}`}`}
                  target="_blank"
                  className="mt-4 block text-center text-sm text-slate hover:text-brass"
                >
                  View this identity live
                </a>
                <div className="mt-4 flex justify-center">
                  <div className="rounded-2xl border border-brass/30 p-4">
                    <QRCodeDisplay
                      url={`${typeof window !== "undefined" ? window.location.origin : ""}/${username}${active.isDefault ? "" : `/${active.slug}`}`}
                    />
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-slate">
                  No NFC on your phone? Scan this to open the profile instead.
                </p>
              </>
            )}
              </motion.div>
            </AnimatePresence>
          </div>

          <BondPreview
            label={label}
            name={name}
            photoUrl={photoUrl}
            fields={fields}
            username={username}
            slug={active.slug}
            isDefault={active.isDefault}
          />
        </div>
      )}

      <AnalyticsWidget />
      <MyTagsSection />

      <NewIdentityModal
        open={newIdentityOpen}
        onCreate={createIdentity}
        onClose={() => {
          setNewIdentityOpen(false);
          setCreateError(null);
        }}
        error={createError}
        pending={creatingIdentity}
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
        pending={deletingIdentity}
      />
    </main>
  );
}

// A single custom field row. Drag is scoped to the handle only (via
// useDragControls + dragListener={false}) so grabbing anywhere in the row
// doesn't fight with placing a text cursor in the label/value inputs —
// only the grip icon on the left actually initiates a drag.
function FieldRow({
  field,
  index,
  total,
  autoFocus,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  field: LocalField;
  index: number;
  total: number;
  autoFocus?: boolean;
  onUpdate: (patch: Partial<LocalField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dragControls = useDragControls();
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && labelRef.current) {
      labelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      labelRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  return (
    <Reorder.Item
      as="div"
      value={field}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 28px rgba(0,0,0,0.4)", borderColor: "rgba(201,161,92,0.5)" }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
        <button
          onPointerDown={(e) => dragControls.start(e)}
          className="shrink-0 cursor-grab touch-none text-slate/50 hover:text-brass active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        <input
          ref={labelRef}
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Field name — Resume, Skills, Favorite food, anything"
          className="min-w-0 flex-1 bg-transparent text-sm text-bone placeholder:text-slate/60 focus:outline-none"
        />
        <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-ink pl-1.5 pr-0.5">
          <FieldTypeIcon type={field.type} className="h-3.5 w-3.5 text-brass" />
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
            className="bg-transparent py-1 pr-1.5 text-xs text-slate focus:outline-none"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {FIELD_TYPE_META[t].name}
              </option>
            ))}
          </select>
        </div>
        {/* Kept alongside dragging as a keyboard/screen-reader-accessible
            way to reorder — drag alone would lock those users out. */}
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-slate hover:text-bone disabled:opacity-20"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-slate hover:text-bone disabled:opacity-20"
          aria-label="Move down"
        >
          ↓
        </button>
        <button onClick={onRemove} className="text-slate hover:text-red-400" aria-label="Remove field">
          ✕
        </button>
      </div>
      {field.type === "LONG_TEXT" ? (
        <textarea
          value={field.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={FIELD_TYPE_META[field.type].placeholder}
          rows={2}
          className="w-full bg-transparent px-3 py-2 text-sm text-bone placeholder:text-slate/60 focus:outline-none"
        />
      ) : (
        <input
          value={field.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder={FIELD_TYPE_META[field.type].placeholder}
          className="w-full bg-transparent px-3 py-2 text-sm text-bone placeholder:text-slate/60 focus:outline-none"
        />
      )}
    </Reorder.Item>
  );
}
