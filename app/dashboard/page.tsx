"use client";

import { useEffect, useState } from "react";
import { BondPreview } from "@/components/BondPreview";

type Identity = {
  id: string;
  slug: string;
  label: string;
  isDefault: boolean;
  name: string;
  headline: string | null;
  about: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  github: string | null;
  portfolio: string | null;
};

type EditableForm = {
  label: string;
  name: string;
  headline: string;
  about: string;
  whatsapp: string;
  phone: string;
  email: string;
  linkedin: string;
  instagram: string;
  github: string;
  portfolio: string;
};

const EMPTY: EditableForm = {
  label: "",
  name: "",
  headline: "",
  about: "",
  whatsapp: "",
  phone: "",
  email: "",
  linkedin: "",
  instagram: "",
  github: "",
  portfolio: "",
};

const FIELD_GROUPS: { title: string; fields: (keyof EditableForm)[] }[] = [
  { title: "Identity", fields: ["label", "name", "headline", "about"] },
  { title: "Reach me", fields: ["whatsapp", "phone", "email"] },
  { title: "Elsewhere", fields: ["linkedin", "instagram", "github", "portfolio"] },
];

const PLACEHOLDERS: Record<keyof EditableForm, string> = {
  label: "e.g. Professional, Friend, Client",
  name: "Full name (can differ per identity)",
  headline: "How you'd introduce yourself in this context",
  about: "A couple sentences - whatever fits this version of you",
  whatsapp: "WhatsApp number",
  phone: "Phone number",
  email: "Email address",
  linkedin: "LinkedIn URL",
  instagram: "Instagram URL",
  github: "GitHub URL",
  portfolio: "Portfolio URL",
};

export default function DashboardPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [username, setUsername] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<EditableForm>(EMPTY);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loadError, setLoadError] = useState<string | null>(null);

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
      if (active) selectIdentity(active, data.identities);
    } catch {
      setLoadError("Couldn't reach the server. Check your connection and try refreshing.");
    }
  }

  function selectIdentity(identity: Identity, list: Identity[] = identities) {
    setActiveId(identity.id);
    setForm({
      label: identity.label ?? "",
      name: identity.name ?? "",
      headline: identity.headline ?? "",
      about: identity.about ?? "",
      whatsapp: identity.whatsapp ?? "",
      phone: identity.phone ?? "",
      email: identity.email ?? "",
      linkedin: identity.linkedin ?? "",
      instagram: identity.instagram ?? "",
      github: identity.github ?? "",
      portfolio: identity.portfolio ?? "",
    });
  }

  async function save() {
    if (!activeId) return;
    setStatus("saving");
    const res = await fetch(`/api/identities/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.identity) {
      setIdentities((prev) => prev.map((i) => (i.id === activeId ? data.identity : i)));
    }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  async function makeDefault() {
    if (!activeId) return;
    const res = await fetch(`/api/identities/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, makeDefault: true }),
    });
    const data = await res.json();
    if (data.identity) {
      await load();
    }
  }

  async function createIdentity() {
    const label = prompt("Name this identity (e.g. Friend, Client, Founder)");
    if (!label) return;
    const res = await fetch("/api/identities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, name: form.name || "Your name" }),
    });
    const data = await res.json();
    if (data.identity) {
      await load();
      selectIdentity(data.identity, [...identities, data.identity]);
    } else if (data.error) {
      alert(data.error);
    }
  }

  async function deleteIdentity() {
    if (!activeId) return;
    if (identities.length <= 1) {
      alert("You need at least one identity.");
      return;
    }
    if (!confirm(`Delete "${form.label}"? This can't be undone.`)) return;
    const res = await fetch(`/api/identities/${activeId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    await load();
  }

  const active = identities.find((i) => i.id === activeId);

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
          <button
            key={i.id}
            onClick={() => selectIdentity(i)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              i.id === activeId
                ? "border-brass bg-brass/10 text-brass"
                : "border-white/10 text-slate hover:text-bone"
            }`}
          >
            {i.label || "Untitled"}
            {i.isDefault && " (showing now)"}
          </button>
        ))}
        <button
          onClick={createIdentity}
          className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs text-slate hover:border-brass/50 hover:text-brass"
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

            {FIELD_GROUPS.map((group) => (
              <section key={group.title} className="mb-8">
                <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">{group.title}</h2>
                <div className="space-y-3">
                  {group.fields.map((field) => (
                    <input
                      key={field}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={PLACEHOLDERS[field]}
                      className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-bone placeholder:text-slate/60 focus:border-brass/50"
                    />
                  ))}
                </div>
              </section>
            ))}

            <button
              onClick={save}
              disabled={status === "saving"}
              className="w-full rounded-xl bg-brass px-6 py-4 text-center text-base font-medium text-ink transition active:scale-[0.98] disabled:opacity-60"
            >
              {status === "saved" ? "Saved" : status === "saving" ? "Saving..." : "Save changes"}
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
                <button onClick={deleteIdentity} className="text-slate hover:text-red-400">
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
            data={{
              label: form.label,
              name: form.name,
              headline: form.headline,
              about: form.about,
              whatsapp: form.whatsapp,
              phone: form.phone,
              email: form.email,
            }}
            username={username}
            slug={active.slug}
            isDefault={active.isDefault}
          />
        </div>
      )}
    </main>
  );
}
