// The Clerk CLI (clerk init) added a ClerkProvider directly in app/layout.tsx,
// which is the pattern Clerk recommends. This file is kept as a no-op wrapper
// so layout.tsx doesn't need to change if other app-wide providers are added later.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
