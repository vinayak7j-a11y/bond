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
      <p className="mt-2 text-[10px] text-slate/40">
        Icons by{" "}
        <a
          href="https://github.com/twitter/twemoji"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Twemoji
        </a>
        , licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          CC BY 4.0
        </a>
      </p>
      <p className="mt-2 text-[10px] text-slate/40">
        <a href="/privacy" className="hover:underline">
          Privacy
        </a>{" "}
        ·{" "}
        <a href="/terms" className="hover:underline">
          Terms
        </a>
      </p>
    </footer>
  );
}
