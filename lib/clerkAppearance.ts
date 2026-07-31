import type { Appearance } from "@clerk/types";

// Applied once on ClerkProvider so every Clerk surface — SignIn, SignUp,
// UserButton, and anything else Clerk renders — matches the ink/bone/brass
// signet theme instead of Clerk's light-mode default.
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#C9A15C", // brass
    colorBackground: "#17181B", // surface
    colorInputBackground: "#0E0F11", // ink
    colorInputText: "#F7F5F1", // bone
    colorText: "#F7F5F1", // bone
    colorTextSecondary: "#6B7280", // slate
    colorNeutral: "#F7F5F1",
    colorDanger: "#E5484D",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-body)",
  },
  elements: {
    card: "bg-surface border border-white/10 shadow-2xl",
    headerTitle: "font-display text-bone",
    headerSubtitle: "text-slate",
    socialButtonsBlockButton: "border border-white/10 bg-ink text-bone hover:bg-white/5 transition-colors",
    socialButtonsBlockButtonText: "text-bone",
    dividerLine: "bg-white/10",
    dividerText: "text-slate",
    formFieldLabel: "text-bone",
    formFieldInput: "bg-ink border-white/10 text-bone focus:border-brass",
    formButtonPrimary: "bg-brass hover:bg-brass-dim text-ink transition-colors",
    footerActionText: "text-slate",
    footerActionLink: "text-brass hover:text-brass-dim",
    identityPreviewText: "text-bone",
    identityPreviewEditButton: "text-brass",
    userButtonPopoverCard: "bg-surface border border-white/10",
    userButtonPopoverActionButtonText: "text-bone",
    userButtonPopoverFooter: "hidden",
    badge: "bg-brass-dim text-ink",
  },
};
