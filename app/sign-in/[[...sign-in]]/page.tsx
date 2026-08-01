import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="mb-8 max-w-sm font-display text-2xl leading-tight text-bone">
        Welcome back.
      </h1>
      <SignIn fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard" />
    </main>
  );
}
