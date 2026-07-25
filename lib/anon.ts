// A random per-browser token, stored in localStorage, that lets us
// recognize "this same anonymous visitor" if they save a contact before
// creating a Bond account, then sign up later. It carries no personal data
// on its own — it's just a claim ticket for /api/pending-connections/claim.
const KEY = "bond_anon_id";

export function getAnonToken(): string {
  if (typeof window === "undefined") return "";
  let token = window.localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(KEY, token);
  }
  return token;
}

// Called right after a successful claim so a shared/reused device doesn't
// silently re-attach a stranger's future anonymous saves to this account.
export function rotateAnonToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, crypto.randomUUID());
}
