import { LegalPageLayout } from "@/components/LegalPageLayout";

// NOTE FOR THE DEVELOPER — not shown to visitors:
// This is a solid, good-faith starting draft covering the topics that
// actually matter for what Bond does — it is NOT a substitute for a real
// legal review, especially once there's real revenue or real scale. Every
// [bracketed] placeholder below needs a real value before this should be
// treated as your actual, reliable policy. Nothing here should be read as
// legal advice.
export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="[Insert date]">
      <p>
        Bond (&quot;we&quot;, &quot;us&quot;) is a relationship intelligence platform that
        helps people create, remember, and grow real-world connections. This policy explains
        what personal data we collect, why, and what rights you have over it.
      </p>

      <h2>1. Who this applies to</h2>
      <p>
        This policy covers two kinds of people: <strong>Bond account holders</strong> (you signed
        up), and <strong>people someone else has met</strong> — if a Bond user saves a connection
        with you before you have an account yourself, we hold a limited amount of information
        about you too, described below.
      </p>

      <h2>2. What we collect</h2>
      <p>If you have a Bond account:</p>
      <ul>
        <li>Account info: name, email, and authentication data, handled by our authentication provider, Clerk.</li>
        <li>The identities and fields you create (name, headline, links, photos, and any other information you choose to add to your profile).</li>
        <li>Your saved connections: who you&apos;ve met, any notes or meeting context you add, and when.</li>
        <li>Basic usage events — profile views, contact saves, and referral signups — used to show you activity on your own profile and to understand how Bond is used.</li>
      </ul>
      <p>If you do <strong>not</strong> have a Bond account yet, but someone has saved you as a connection:</p>
      <ul>
        <li>We hold whatever the Bond user entered when saving you — typically a name, and optionally a photo, headline, and meeting context.</li>
        <li>
          This is stored so that if you later create your own Bond account, that interaction can
          be linked to you rather than lost. If you never create an account, this information is
          never made public and is only visible to the person who saved it.
        </li>
      </ul>

      <h2>3. How we use it</h2>
      <p>
        To operate Bond&apos;s core features: showing your profile to people you share it with,
        maintaining your list of connections, and — if you choose to activate a physical
        accessory — resolving that accessory to your current default profile. We do not sell
        personal data to third parties, and we do not use your connections&apos; information for
        advertising.
      </p>

      <h2>4. Who we share data with</h2>
      <p>
        We use a small number of service providers to run Bond, each of whom only receives what
        they need to do their job: Clerk (authentication), [database/hosting provider], and
        [payment processor, once accessories are purchasable]. None of them are permitted to use
        your data for their own purposes.
      </p>

      <h2>5. Your rights</h2>
      <p>You can, at any time:</p>
      <ul>
        <li>Access or export the data associated with your account.</li>
        <li>Correct or update any identity, field, or connection note you&apos;ve added.</li>
        <li>Delete an identity, a connection, or your entire account.</li>
        <li>Ask us to remove information someone else saved about you, even before you have an account — contact us at [privacy contact email].</li>
      </ul>

      <h2>6. Data retention</h2>
      <p>
        We keep your data for as long as your account is active. If you delete your account, your
        identities and connections are removed; some minimal records may be retained where
        required for legal or security purposes.
      </p>

      <h2>7. Children</h2>
      <p>
        Bond is not directed at, and should not be used by, anyone under the age of 18 [or the
        age of digital consent in your jurisdiction, if different].
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        If this policy changes materially, we&apos;ll update the date at the top of this page and,
        where appropriate, notify account holders directly.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy or your data: [privacy contact email]. Registered business
        address: [Insert address].
      </p>
    </LegalPageLayout>
  );
}
