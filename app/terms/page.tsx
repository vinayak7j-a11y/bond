import { LegalPageLayout } from "@/components/LegalPageLayout";

// NOTE FOR THE DEVELOPER — not shown to visitors: same caveat as the
// Privacy Policy. Good-faith starting draft, not a substitute for real
// legal review once there's real revenue or scale. Fill in every
// [bracketed] placeholder before treating this as final.
export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="[Insert date]">
      <p>
        These terms govern your use of Bond. By creating an account or using Bond, you agree to
        them. If you don&apos;t agree, please don&apos;t use the service.
      </p>

      <h2>1. What Bond is</h2>
      <p>
        Bond lets you create one or more identities, share them via a permanent link or a
        physical accessory (NFC/QR), and keep track of the people you meet. Some accessories are
        purchased physical goods; the software itself is provided as described below.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must be at least 18 [or the applicable age of majority] to create a Bond account. You&apos;re
        responsible for the accuracy of what you put in your own identities, and for keeping your
        account secure.
      </p>

      <h2>3. Physical accessories</h2>
      <p>
        Accessories (tags, cards, keychains, and similar items) carry a permanent, random code —
        never your username — and are bound to your account only once you activate them. Once an
        accessory is activated, your username is locked and can no longer be changed, since real
        physical objects in the world already point at it. Purchases of physical accessories are
        subject to our{" "}
        <a href="/returns">Returns &amp; Refunds policy</a>.
      </p>

      <h2>4. Your content</h2>
      <p>
        You own what you put into your identities and connection notes. By using Bond, you give
        us permission to store and display that content back to you and to the people you choose
        to share it with — nothing more.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Impersonate another person or misrepresent your identity.</li>
        <li>Use Bond to harass, stalk, or collect information about people without their knowledge.</li>
        <li>Attempt to claim a physical accessory that isn&apos;t rightfully yours.</li>
        <li>Interfere with or attempt to disrupt Bond&apos;s systems.</li>
      </ul>

      <h2>6. Termination</h2>
      <p>
        You can delete your account at any time from your dashboard. We may suspend or terminate
        accounts that violate these terms.
      </p>

      <h2>7. Disclaimer &amp; limitation of liability</h2>
      <p>
        Bond is provided &quot;as is.&quot; We do our best to keep it reliable, but we don&apos;t
        guarantee uninterrupted availability. To the extent permitted by law, our liability for
        any claim relating to Bond is limited to the amount you&apos;ve paid us, if any, in the
        preceding 12 months.
      </p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of [Insert jurisdiction, e.g. India].</p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms as Bond evolves. Material changes will be reflected by updating
        the date at the top of this page.
      </p>

      <h2>10. Contact</h2>
      <p>Questions about these terms: [contact email].</p>
    </LegalPageLayout>
  );
}
