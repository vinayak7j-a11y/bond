"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Renders a scannable, theme-matched QR code with a centered Bond mark —
// the fallback path for any visitor whose phone lacks NFC hardware
// entirely (a real, confirmed gap, not theoretical). Drawn on canvas so
// the brand icon can be composited cleanly on top with real breathing
// room around it, rather than sitting directly over the pattern.
//
// Modules are brass-gold on a near-black background — a real branded
// look, not just a near-white/near-black stand-in for black/white. This
// trades some contrast versus pure black/white, so error correction is
// forced to "H" (~30% tolerance) to keep it reliably scannable despite
// both the lower contrast and the center logo cutout.
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
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#C9A15C", light: "#0E0F11" },
    })
      .then(() => {
        if (cancelled || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new Image();
        logo.onload = () => {
          if (cancelled) return;
          const logoSize = size * 0.2;
          const pad = logoSize * 0.4; // generous quiet zone around the logo
          const plateSize = logoSize + pad * 2;
          const x = (size - logoSize) / 2;
          const y = (size - logoSize) / 2;
          const plateX = (size - plateSize) / 2;
          const plateY = (size - plateSize) / 2;

          // Fully clear the area first — a solid background plate, not a
          // border drawn over existing modules, so nothing from the
          // pattern peeks out from behind the logo's corners.
          ctx.fillStyle = "#0E0F11";
          ctx.beginPath();
          ctx.roundRect(plateX, plateY, plateSize, plateSize, 10);
          ctx.fill();
          ctx.strokeStyle = "#C9A15C";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.drawImage(logo, x, y, logoSize, logoSize);
          setReady(true);
        };
        logo.onerror = () => setReady(true);
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
