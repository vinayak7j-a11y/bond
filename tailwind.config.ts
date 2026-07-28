import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E0F11",
        bone: "#F7F5F1",
        brass: "#C9A15C",
        "brass-dim": "#8A7346",
        slate: "#6B7280",
        surface: "#17181B",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(201,161,92,0.45)" },
          "100%": { boxShadow: "0 0 0 24px rgba(201,161,92,0)" },
        },
        "ring-stamp": {
          "0%": { boxShadow: "0 0 0 0 rgba(201,161,92,0.55)", opacity: "1" },
          "70%": { boxShadow: "0 0 0 14px rgba(201,161,92,0)", opacity: "0.4" },
          "100%": { boxShadow: "0 0 0 14px rgba(201,161,92,0)", opacity: "0" },
        },
        "ambient-glow": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.1s cubic-bezier(0.4,0,0.2,1)",
        "ring-stamp": "ring-stamp 0.6s cubic-bezier(0.22,1,0.36,1)",
        "ambient-glow": "ambient-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
