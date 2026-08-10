import { LegalPageLayout } from "@/components/LegalPageLayout";

// NOTE FOR THE DEVELOPER — not shown to visitors: this page exists to
// satisfy the Consumer Protection (E-Commerce) Rules, 2020 requirement
// for a visible return/refund/exchange policy and grievance contact once
// you're taking money for physical goods online. It's only relevant once
// accessories are actually purchasable — activate this page (link it from
// checkout) at that point, not before. Fill in every [bracketed] value.
export default function ReturnsPage() {
  return (
    <LegalPageLayout title="Returns, Refunds & Exchanges" lastUpdated="[Insert date]">
      <p>
        This page covers physical Bond accessories (tags, cards, keychains, and similar items)
        purchased through Bond. It does not cover the Bond software itself, which is free to use.
      </p>

      <h2>1. Returns &amp; exchanges</h2>
      <p>
        If your accessory arrives damaged, defective, or not as described, you can request a
        replacement or refund within [X] days of delivery. Contact us at [support email] with your
        order details and a photo of the issue.
      </p>
      <p>
        Because accessories are bound to your account only after you activate them, an unactivated
        accessory is generally eligible for return; once claimed to an account, replacements are
        handled case by case rather than as a standard exchange.
      </p>

      <h2>2. Refunds</h2>
      <p>
        Approved refunds are processed to your original payment method within [X] business days.
        Depending on your bank, it may take longer to appear on your statement.
      </p>

      <h2>3. What&apos;s not covered</h2>
      <ul>
        <li>Normal wear and tear.</li>
        <li>Damage from misuse or attempts to modify the embedded chip.</li>
        <li>Change of mind after an accessory has been activated to your account.</li>
      </ul>

      <h2>4. Grievance officer</h2>
      <p>
        In accordance with the Consumer Protection (E-Commerce) Rules, 2020, complaints about
        orders, returns, or this policy can be directed to:
      </p>
      <p>
        [Grievance Officer Name]
        <br />
        [Email address]
        <br />
        [Phone number, if applicable]
        <br />
        [Registered business address]
      </p>
      <p>We aim to acknowledge complaints within [X] days.</p>
    </LegalPageLayout>
  );
}
