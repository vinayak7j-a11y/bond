// Top-level static route segments that must never collide with a real
// user's username. Next.js always prioritizes a static route over a
// dynamic one at the same path depth, so a user whose username happened
// to be one of these would have their own profile/slug links permanently
// shadowed by the static route instead of ever resolving to their Bond.
const RESERVED_USERNAMES = new Set([
  "t", // physical accessory redirect resolver — see app/t/[code]
  "claim", // accessory claim flow — see app/claim/[code]
  "dashboard",
  "sign-in",
  "sign-up",
  "api",
  "privacy",
  "terms",
  "returns",
]);

// Falls back to a Clerk-id-derived handle if the requested one collides
// with a reserved route segment. Used at every point a User row gets
// created, so a colliding username can never actually reach the database.
export function safeUsername(candidate: string, clerkId: string): string {
  return RESERVED_USERNAMES.has(candidate.toLowerCase()) ? clerkId.slice(-8) : candidate;
}
