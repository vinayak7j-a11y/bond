// Every public identity carries this. Referral attribution rides along in
// the query string on the sign-up link — see app/sign-up for how it's
// captured into a real User.referredBy once someone actually creates an
// account (view alone doesn't count as a referral, only a completed signup).
export function BondFooter({ username, displayPath = "" }: { username: string; displayPath?: string }) {
  return (
    <footer className="mt-auto pb-8 pt-14 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate/60">
        bond.app/{username}
        {displayPath}
      </p>
      <p className="mt-3 text-xs text-slate">
        Powered by Bond ·{" "}
        <a href={`/sign-up?ref=${username}`} className="text-brass hover:underline">
          Create your own Bond →
        </a>
      </p>
    </footer>
  );
}
