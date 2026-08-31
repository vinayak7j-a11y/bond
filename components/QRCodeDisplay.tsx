"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Renders a scannable QR code for any Bond URL — the profile link, or a
// physical accessory's /t/CODE destination. Exists specifically so the
// core flow (view profile, save contact, mutual exchange) works even for
// visitors whose phone lacks NFC hardware entirely — a real, confirmed
// gap, not a theoretical one. Generated client-side via the `qrcode`
// package, no third-party image API involved, so it works offline and
// never depends on an external service staying up.
export function QRCodeDisplay({ url, size = 180 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: size, margin: 1 })
      .then((d) => {
        if (!cancelled) setDataUrl(d);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (error) return null;
  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="animate-pulse rounded-lg bg-white/5"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Scan to open this Bond profile"
      width={size}
      height={size}
      className="rounded-lg bg-white p-2"
    />
  );
}
