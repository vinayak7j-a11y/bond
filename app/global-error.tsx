"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0E0F11",
          color: "#F7F5F1",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <p style={{ marginBottom: 12, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A15C" }}>
          Bond
        </p>
        <h1 style={{ maxWidth: 380, fontSize: 24, lineHeight: 1.3, marginBottom: 12 }}>
          Something went wrong.
        </h1>
        <p style={{ maxWidth: 320, fontSize: 14, color: "#6B7280", marginBottom: 32 }}>
          That&apos;s on us, not you. Try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            backgroundColor: "#C9A15C",
            color: "#0E0F11",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
