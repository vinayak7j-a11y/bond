import Link from "next/link";

// Shared wrapper for Privacy, Terms, and Returns pages — same color/type
// tokens as the rest of the app, but without the ambient-glow/grain
// treatment used for hero moments. Long-form legal text should be plain
// and easy to read, not "designed."
export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="font-mono text-xs uppercase tracking-widest text-brass">
        Bond
      </Link>
      <h1 className="mb-2 mt-4 font-display text-3xl leading-tight text-bone">{title}</h1>
      <p className="mb-10 text-xs text-slate">Last updated: {lastUpdated}</p>
      <div className="space-y-6 text-sm leading-relaxed text-slate [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-bone [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_strong]:text-bone [&_a]:text-brass [&_a]:underline">
        {children}
      </div>
    </main>
  );
}
