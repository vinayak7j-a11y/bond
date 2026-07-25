import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brass">Bond</p>
      <h1 className="max-w-sm font-display text-4xl leading-tight text-bone">
        The future of human connections.
      </h1>
      <p className="mt-4 max-w-xs text-sm text-slate">
        Tap. Save. Remember. The smoothest way to turn an introduction into a relationship.
      </p>
      <Link
        href="/sign-up"
        className="mt-8 rounded-xl bg-brass px-8 py-3 text-sm font-medium text-ink transition active:scale-[0.98]"
      >
        Create your Bond
      </Link>
      <Link href="/sign-in" className="mt-4 text-sm text-slate hover:text-bone">
        Already have one? Sign in
      </Link>
    </main>
  );
}
