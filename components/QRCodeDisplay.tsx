"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Renders a scannable, theme-matched QR code with a centered Bond mark —
// the fallback path for any visitor whose phone lacks NFC hardware
// entirely (a real, confirmed gap, not theoretical). Drawn on canvas
// rather than a plain <img> specifically so the brand icon can be
// composited on top. Error-correction is forced to "H" (~30% tolerance)
// BEFORE adding the logo — covering the center of a lower-tier QR with
// an image can make it unreadable; at H-level, a small centered logo is
// safely within the code's built-in redundancy.
export function QRCodeDisplay({ url, size = 220 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "H",
      // Inverted, theme-matched: light marks on a dark surface instead of
      // the default black-on-white — blends into the dashboard's dark UI
      // instead of sitting on it as a stark white square.
      color: { dark: "#F7F5F1", light: "#17181B" },
    })
      .then(() => {
        if (cancelled || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new Image();
        logo.onload = () => {
          if (cancelled) return;
          const logoSize = size * 0.22;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          // Small brass-bordered plate behind the logo so it reads as an
          // intentional badge sitting on the code, not a rendering glitch.
          const pad = logoSize * 0.18;
          ctx.fillStyle = "#17181B";
          ctx.beginPath();
          ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
          ctx.fill();
          ctx.strokeStyle = "#C9A15C";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          setReady(true);
        };
        logo.onerror = () => setReady(true); // QR itself still renders fine without the logo
        logo.src = "/icons/icon-512.png";
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (error) return null;

  return (
    <div style={{ width: size, height: size }} className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`rounded-lg transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {!ready && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-white/5" />
      )}
    </div>
  );
}
