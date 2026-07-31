"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "bond:install-dismissed-at";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_DAYS;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (private mode etc.) — fine, just won't persist
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (wasRecentlyDismissed()) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      setShowIosHint(true);
      setVisible(true);
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (!visible) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    dismiss();
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3 shadow-2xl">
        <div className="flex-1 text-sm text-bone">
          {showIosHint ? (
            <>
              Add Bond to your Home Screen — tap{" "}
              <span className="text-brass">Share</span> then{" "}
              <span className="text-brass">Add to Home Screen</span>.
            </>
          ) : (
            <>Install Bond for quicker access.</>
          )}
        </div>
        {!showIosHint && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-lg bg-brass px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-brass-dim"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-slate transition-colors hover:text-bone"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
