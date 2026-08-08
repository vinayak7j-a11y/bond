"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { MeetingContextModal } from "./MeetingContextModal";
import { ShareBackModal, MyIdentityOption } from "./ShareBackModal";
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
  const [justStamped, setJustStamped] = useState(false);
  const [passCopied, setPassCopied] = useState(false);
  const [shareBackOpen, setShareBackOpen] = useState(false);
  const [myIdentities, setMyIdentities] = useState<MyIdentityOption[]>([]);
  const [sharedBack, setSharedBack] = useState(false);
  const [shareBackSubmitting, setShareBackSubmitting] = useState(false);
  const [shareBackError, setShareBackError] = useState<string | null>(null);
  const [pendingContext, setPendingContext] = useState<string | undefined>(undefined);
  const { isLoaded, isSignedIn } = useUser();

  function handleSave() {
    // Guard against a second tap re-opening a new tab and resetting the
    // whole meeting-context/share-back flow that's already in motion.
    if (saved) return;

    // Open the vCard endpoint directly in a new tab, with no `download`
    // attribute involved anywhere — this lets each browser apply its own
    // native handling for the text/vcard MIME type instead of being told
    // to silently force-save it as a generic file.
    //
    // iOS already showed its native "Add Contact" sheet under the old
    // fetch+blob+forced-download approach, because iOS recognizes .vcf
    // files at the OS level even when force-downloaded. Android's download
    // manager took that `download` attribute literally instead: silently
    // saved to Downloads, no Contacts prompt. Removing it lets Chrome on
    // Android offer its own "Open with Contacts" handling instead.
    //
    // This MUST be the very first synchronous line in the handler — no
    // `await` before it — or mobile browsers stop treating this as a
    // user-initiated action and block it as an unrequested popup.
    const win = window.open(`/api/vcard/${username}?identity=${identitySlug}`, "_blank");
    if (!win) {
      // window.open returned null — popup blocked, or (more likely in
      // practice) an in-app webview (e.g. some messaging apps' built-in
      // browser) that doesn't support real new tabs at all. Fall back to
      // navigating the current tab directly to the vCard. This does mean
      // they leave this page and lose the meeting-context/share-back
      // steps — a real trade-off — but a degraded save that still works
      // beats a button that silently does nothing.
      window.location.href = `/api/vcard/${username}?identity=${identitySlug}`;
      return;
    }

    setSaved(true);
    // Replay the same seal-stamp moment from the profile reveal — this is
    // the bond being sealed. Self-clears so it can't get stuck rendered.
    setJustStamped(true);
    setTimeout(() => setJustStamped(false), 650);
    // 2. Only after the save is already in motion, offer the one optional question.
    setModalOpen(true);
  }

  async function recordConnection(meetingContext?: string) {
    setModalOpen(false);
    setPendingContext(meetingContext);
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

    // Only a signed-in Bond user viewing someone ELSE's profile has
    // anything of their own to share back — everyone else just quietly
    // skips this step.
    if (!isLoaded || !isSignedIn) return;
    try {
      const res = await fetch("/api/identities");
      if (!res.ok) return;
      const data = await res.json();
      if (data.username === username) return; // viewing their own profile
      type RawIdentity = { id: string; label: string; name: string; photoUrl?: string | null };
      const identities: MyIdentityOption[] = (data.identities ?? []).map((i: RawIdentity) => ({
        id: i.id,
        label: i.label,
        name: i.name,
        photoUrl: i.photoUrl ?? null,
      }));
      if (identities.length === 0) return;
      setMyIdentities(identities);
      setShareBackOpen(true);
    } catch {
      // Share-back is a bonus step, not the core save — never block or
      // alarm the visitor if this lookup fails.
    }
  }

  async function shareBack(myIdentityId: string) {
    // Guard against a double-tap firing two POSTs and creating two
    // Connection rows on the other person's account for one real meeting.
    if (shareBackSubmitting) return;
    setShareBackSubmitting(true);
    setShareBackError(null);
    try {
      const res = await fetch("/api/connections/mutual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileOwnerUsername: username,
          myIdentityId,
          meetingContext: pendingContext ?? null,
        }),
      });
      if (res.ok) {
        setShareBackOpen(false);
        setSharedBack(true);
        setTimeout(() => setSharedBack(false), 2500);
      } else {
        // Leave the sheet open so they can retry or explicitly skip —
        // silently closing on a real failure would make it look like it
        // worked when it didn't.
        setShareBackError("Couldn't share back — you can try again, or skip for now.");
      }
    } catch {
      setShareBackError("Couldn't share back — you can try again, or skip for now.");
    } finally {
      setShareBackSubmitting(false);
    }
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
      <motion.button
        onClick={handleSave}
        disabled={saved}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="relative w-full overflow-hidden rounded-xl bg-brass px-6 py-4 text-center text-base font-medium text-ink disabled:cursor-default"
      >
        {justStamped && (
          <motion.span
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0 rounded-xl bg-ink/20"
          />
        )}
        <span className="relative">{saved ? "Saved ✓" : "Save Contact"}</span>
      </motion.button>
      {saved && (
        <button
          onClick={saveBondPass}
          className="w-full text-center text-xs text-slate hover:text-brass"
        >
          {passCopied ? "Link copied ✓" : "+ Save Bond Pass for quick access later"}
        </button>
      )}
      {sharedBack && (
        <p className="text-center text-xs text-brass">Shared back ✓ — they&apos;ll see you in their Connections</p>
      )}
      <MeetingContextModal
        open={modalOpen}
        onSelect={(ctx) => recordConnection(ctx)}
        onSkip={() => recordConnection(undefined)}
      />
      <ShareBackModal
        open={shareBackOpen}
        identities={myIdentities}
        submitting={shareBackSubmitting}
        error={shareBackError}
        onSelect={shareBack}
        onSkip={() => setShareBackOpen(false)}
      />
    </>
  );
}
