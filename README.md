# Bond — MVP

The loop this build supports: **Meet → Connect → Remember**, across
**multiple identities** (Professional, Friend, Client, etc.) per person,
plus a lightweight growth loop (Bond Pass + referral attribution).
No AI, no teams/enterprise, no relationship scoring, no smart reminders —
those are later phases per the product brief.

## How multi-identity actually works

Every identity is a permanent, persistent object with its own URL:
`bond.app/username/slug`. Exactly one identity is marked "active"
(`isDefault` in the schema) — that's the ONLY thing controlled by
`bond.app/username` (no slug), which is what a brand-new NFC tap or QR
scan always lands on. Switch your active identity in the dashboard and
every physical accessory you own shows the new one on its very next tap —
nothing to reprogram, since the tag only ever stores the plain
`bond.app/username` link.

**The moment someone saves your contact, the link they keep is different.**
The generated vCard always points at the *specific* identity's permanent
URL (`bond.app/username/slug`), not the plain one. So:

- Switching your active identity only ever affects **new** people you meet.
- Anyone who already saved your contact keeps seeing exactly what you
  showed them, forever — even after you switch — and this works with
  **no account required on their end**, since the permanence lives in the
  URL itself, not in any per-visitor recognition.
- Editing an identity's fields (photo, about, links, and later blocks like
  AI or booking) DOES propagate to everyone already connected to it — it's
  the same living object, just reached through a permanent door. Only the
  *meeting context* (when, where, which identity) is frozen forever, to
  preserve the story of the relationship.

## What's here

```
app/
  [username]/page.tsx           bond.app/you — the active identity (new taps/scans)
  [username]/[identity]/        bond.app/you/slug — one identity's permanent URL
  dashboard/page.tsx            Identity Builder — create, edit, switch active identity
  dashboard/connections/        Connections list + search ("Remember" step)
  api/vcard/[username]/         Serves the .vcf — always links to the specific identity
  api/connections/              Create + list connections; anonymous visitors handled too
  api/identities/                Create/list/update/delete/switch-active identities
  api/pending-connections/claim/ Upgrades pre-signup anonymous saves into real connections
  api/referral/                  Attributes "Create your own Bond" signups
  api/events/                    Lightweight analytics/growth event logging
  sign-up, sign-in               Clerk auth pages
components/
  ProfileReveal.tsx             The signature tap animation
  IdentityView.tsx              Shared render for both identity routes above
  SaveContactButton.tsx         Save Contact + the optional Bond Pass follow-up
  MeetingContextModal.tsx       The one optional post-save question
  BondFooter.tsx                "Powered by Bond" growth CTA on every public identity
  ClaimPendingConnections.tsx   Runs once on first dashboard load after signup
  CaptureReferral.tsx           Attributes a captured referral once signed in
  ReferralParamCapture.tsx      Captures ?ref= on the sign-up page itself
prisma/schema.prisma            User, Identity, Connection, PendingConnection, ProfileEvent
lib/vcard.ts                    vCard 3.0 builder (native OS import on iOS + Android)
lib/anon.ts                     Anonymous-visitor browser token for pre-signup connections
lib/prisma.ts                   Prisma client singleton
```

## Local setup

```bash
npm install
cp .env.example .env         # fill in DATABASE_URL + Clerk keys
npx prisma db push           # creates tables from schema.prisma
npm run dev
```

You'll need:
- A Postgres database (Neon/Supabase/Vercel Postgres/Railway — free tier is fine)
- A free Clerk account for auth (dashboard.clerk.com)

## How the core loop maps to code

1. **Someone taps an NFC sticker or scans a QR code** → opens
   `bond.app/username` — native OS behavior on iOS and Android, nothing we build.
2. `app/[username]/page.tsx` resolves the currently active identity and
   server-renders it, so `ProfileReveal`'s entrance animation plays over
   data that's already there.
3. Visitor taps **Save Contact** → fetches `/api/vcard/[username]?identity=slug`,
   which returns a `.vcf` linking to that identity's *permanent* URL
   (`bond.app/username/slug`) — this is what makes the save permanent.
4. `MeetingContextModal` asks the one optional question. `POST /api/connections`
   then:
   - **Signed in** → writes a real `Connection`, referencing the identity by ID.
   - **Not signed in** → writes a `PendingConnection` keyed to an anonymous
     browser token (`lib/anon.ts`) instead, so nothing is lost.
5. If that anonymous visitor signs up later from the same browser,
   `ClaimPendingConnections` (mounted in the dashboard) fires once and
   `/api/pending-connections/claim` converts their pending saves into real
   connections — "Connection Upgrade" from the product brief.
6. Optionally, **Save Bond Pass** shares/copies the identity's permanent
   link for faster re-access than digging through contacts.
7. Every public identity carries a quiet **"Create your own Bond"** footer
   link with `?ref=username`. `ReferralParamCapture` stores that in
   localStorage on the sign-up page; `CaptureReferral` attributes it to the
   new `User.referredBy` once they're actually signed in.

## NFC accessories (stickers)

The tag stores nothing but `bond.app/username`, written as a standard NDEF
URI record. There's no in-app "Activate" flow, on purpose:

- Writing NFC tags from a website only works via the Web NFC API — Chrome
  on Android only. iOS Safari can't write tags from a browser at all.
- Instead, **stickers are pre-written during fulfillment**, before they
  ship — a free app like "NFC Tools", or a cheap USB writer (e.g. ACR122U)
  once volume grows. This is an ops step, not a feature to build.
- Because of this, **username changes should be restricted** once a
  sticker has shipped — `User.usernameLocked` exists in the schema for
  this but isn't enforced yet.

## Things intentionally not built yet

AI representative, booking/timeline blocks on identities, connection
health scores, network map, teams/enterprise, marketplace, official
hardware store, manual "change what a specific person sees" override
(the schema supports it via `Connection.identityId`, just no UI yet), and
Bond Pass is currently a Web Share/clipboard shortcut rather than a real
wallet-format pass. See the product brief's phased roadmap.
