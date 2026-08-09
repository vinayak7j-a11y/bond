import { SignUp } from "@clerk/nextjs";
import { ReferralParamCapture } from "@/components/ReferralParamCapture";

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const dest = searchParams.redirect_url || "/dashboard";
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <ReferralParamCapture />
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="mb-8 max-w-sm font-display text-2xl leading-tight text-bone">
        Create your Bond.
      </h1>
      <SignUp fallbackRedirectUrl={dest} signInFallbackRedirectUrl={dest} />
    </main>
  );
}
