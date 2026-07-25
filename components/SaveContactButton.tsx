"use client";

import { useState } from "react";
import { MeetingContextModal } from "./MeetingContextModal";
import { getAnonToken } from "@/lib/anon";

type Props = {
  username: string;
  identityId: string;
  identitySlug: string;
  identityLabel: string;
  name: string;
  headline?: string | null;
  photoUrl?: string | null;
};

export function SaveContactButton({
  username,
  identityId,
  identitySlug,
  identityLabel,
  name,
  headline,
  photoUrl,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passCopied, setPassCopied] = useState(false);

  async function handleSave() {
    // 1. Trigger the native "add contact" sheet immediately — this is the
    //    part that has to feel instant. No network round-trip in the path.
    const res = await fetch(`/api/vcard/${username}?identity=${identitySlug}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "_")}.vcf`;
    link.click();
    URL.revokeObjectURL(url);

    setSaved(true);
    // 2. Only after the save is already in motion, offer the one optional question.
    setModalOpen(true);
  }

  async function recordConnection(meetingContext?: string) {
    setModalOpen(false);
    await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personUsername: username,
        personName: name,
        personHeadline: headline,
        personPhoto: photoUrl,
        identityId,
        identityShared: identityLabel,
        meetingContext: meetingContext ?? null,
        meetingSource: "nfc",
        anonToken: getAnonToken(),
      }),
    }).catch(() => {
      // Non-critical path — losing an analytics/timeline write should never
      // block or alarm the visitor mid-save. Fail silently for MVP.
    });
  }

  async function saveBondPass() {
    const shareUrl = `https://bond.app/${username}/${identitySlug}`;
    const shareData = {
      title: `${name} · Bond`,
      text: `${name}${headline ? ` — ${headline}` : ""}`,
      url: shareUrl,
    };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileUsername: `${username}/${identitySlug}`, type: "bond_pass_save" }),
    }).catch(() => {});

    // Web Share lets them send it to themselves (Notes, Messages, etc.) or
    // add it straight to their home screen on most mobile browsers — the
    // closest thing to a real wallet pass without building native infra.
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setPassCopied(true);
      setTimeout(() => setPassCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing more we can do silently; the link is
      // still saved in their contact card from Save Contact either way.
    }
  }

  return (
    <>
      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-brass px-6 py-4 text-center text-base font-medium text-ink transition active:scale-[0.98]"
      >
        {saved ? "Saved ✓" : "Save Contact"}
      </button>
      {saved && (
        <button
          onClick={saveBondPass}
          className="w-full text-center text-xs text-slate hover:text-brass"
        >
          {passCopied ? "Link copied ✓" : "+ Save Bond Pass for quick access later"}
        </button>
      )}
      <MeetingContextModal
        open={modalOpen}
        onSelect={(ctx) => recordConnection(ctx)}
        onSkip={() => recordConnection(undefined)}
      />
    </>
  );
}
