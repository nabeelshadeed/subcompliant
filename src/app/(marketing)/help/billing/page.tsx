import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Billing & Plans Help | SubCompliant Help Centre',
  description:
    'Understand the SubCompliant 14-day trial, plan pricing, how to upgrade mid-cycle, how to cancel, and the 30-day money-back guarantee.',
}

export default function BillingHelpPage() {
  return (
    <main className="main">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/help">Help Centre</Link>
        <span>›</span>
        <span>Billing &amp; Plans</span>
      </div>

      {/* Header */}
      <div className="doc-header">
        <div className="doc-tag">Billing &amp; Plans</div>
        <h1>Billing, plans and payments</h1>
        <p className="lead" style={{ textAlign: 'left', maxWidth: '600px', margin: '0' }}>
          Everything you need to know about your SubCompliant subscription — from the free trial
          to cancellation and refunds.
        </p>
      </div>

      {/* Table of contents */}
      <div className="toc">
        <h4>In this guide</h4>
        <ol>
          <li><a href="#trial">The 14-day free trial</a></li>
          <li><a href="#plans">Plans and pricing</a></li>
          <li><a href="#upgrade">Upgrading mid-cycle</a></li>
          <li><a href="#cancel">Cancelling your subscription</a></li>
          <li><a href="#refund">30-day money-back guarantee</a></li>
        </ol>
      </div>

      {/* Section 1 */}
      <section id="trial">
        <h2>The 14-day free trial</h2>
        <p>
          When you create a SubCompliant account, you automatically start a 14-day free trial
          with full access to all Pro plan features. No credit card is required to start —
          you will not be asked for payment details until you choose to activate a paid plan.
        </p>
        <p>
          During the trial you can add subcontractors, send magic-link invitations, collect and
          approve documents, configure document templates, invite team members (up to 3), and
          generate compliance reports. There are no feature restrictions during the trial period.
        </p>
        <p>
          Five days before your trial ends, SubCompliant will send you a reminder email with
          a summary of your activity and a link to choose your plan. At the end of the 14 days:
        </p>
        <ul>
          <li>If you activate a paid plan, everything continues without interruption.</li>
          <li>
            If you do not activate a paid plan, your account automatically downgrades to the
            free Starter tier. You retain access to your first 3 subcontractors and all their
            documents. Additional subcontractors are hidden (not deleted) until you upgrade.
          </li>
        </ul>
        <div className="info-box">
          <p>
            <strong>No data is ever deleted at trial end.</strong> Upgrading at any point
            restores full access to all subcontractors and documents you created during
            the trial.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id="plans" style={{ marginTop: '48px' }}>
        <h2>Plans and pricing</h2>
        <p>
          SubCompliant offers four tiers. All paid plans include a 30-day money-back guarantee
          and annual billing with a 20% discount.
        </p>

        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Price</th>
              <th>Subcontractors</th>
              <th>Team members</th>
              <th>Key features</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Free Starter</strong></td>
              <td>£0/mo</td>
              <td>Up to 3</td>
              <td>1</td>
              <td>Basic document collection, manual review</td>
            </tr>
            <tr>
              <td><strong>Starter</strong></td>
              <td>£39/mo</td>
              <td>Up to 10</td>
              <td>1</td>
              <td>All Free features + expiry reminders, compliance dashboard</td>
            </tr>
            <tr>
              <td><strong>Pro</strong></td>
              <td>£79/mo</td>
              <td>Up to 50</td>
              <td>3</td>
              <td>All Starter features + PDF reports, risk scoring, trade templates</td>
            </tr>
            <tr>
              <td><strong>Business</strong></td>
              <td>£149/mo</td>
              <td>Unlimited</td>
              <td>10</td>
              <td>All Pro features + API access, webhooks, DPA, bulk tools</td>
            </tr>
          </tbody>
        </table>

        <p>
          Annual billing is available for all paid plans and saves 20% compared to monthly
          billing. You can switch to annual from <strong>Settings → Billing</strong> at any
          time. The discount is applied immediately and the difference is credited to your
          next invoice pro-rata.
        </p>
      </section>

      {/* Section 3 */}
      <section id="upgrade" style={{ marginTop: '48px' }}>
        <h2>Upgrading mid-cycle</h2>
        <p>
          You can upgrade your plan at any time from <strong>Settings → Billing</strong>.
          When you upgrade mid-billing-cycle, you are charged the pro-rated difference for
          the remaining days in your current period. For example, if you are halfway through
          a monthly Starter billing period and upgrade to Pro, you will be charged half the
          difference between the two plans immediately, and your next invoice will be at the
          full Pro rate.
        </p>
        <p>
          Upgraded features are available immediately — you do not need to wait until your
          next billing date. If you are upgrading to unlock more subcontractor slots, all
          previously hidden subcontractors are restored as soon as the upgrade is processed.
        </p>
        <p>
          Downgrading mid-cycle is also possible, but any features or subcontractors that
          exceed the lower plan&apos;s limits will be restricted until the current billing
          period ends. No data is deleted on downgrade — it is simply inaccessible until you
          upgrade again or the billing period resets.
        </p>
      </section>

      {/* Section 4 */}
      <section id="cancel" style={{ marginTop: '48px' }}>
        <h2>Cancelling your subscription</h2>
        <p>
          You can cancel your SubCompliant subscription at any time from{' '}
          <strong>Settings → Billing → Cancel Subscription</strong>. The process takes
          under 60 seconds and requires no phone calls, no chat conversations, and no
          cancellation reasons (though we&apos;d appreciate feedback if you&apos;re willing
          to share it).
        </p>
        <p>
          When you cancel:
        </p>
        <ul>
          <li>Your access continues at the paid plan level until the end of your current billing period.</li>
          <li>After the billing period ends, your account downgrades to the free Starter tier.</li>
          <li>All your data — subcontractor profiles, documents, compliance history — is retained for 90 days.</li>
          <li>You can export all your data at any time during this 90-day window.</li>
          <li>After 90 days, all data is permanently deleted in accordance with our data retention policy.</li>
        </ul>
        <p>
          If you change your mind after cancelling but before the billing period ends, you can
          reactivate your subscription from the Billing settings page at any time.
        </p>
        <div className="info-box">
          <p>
            <strong>No cancellation fees apply.</strong> SubCompliant does not charge exit fees,
            data export fees, or any other charges related to cancellation.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section id="refund" style={{ marginTop: '48px' }}>
        <h2>30-day money-back guarantee</h2>
        <p>
          All SubCompliant paid plans come with a <strong>30-day money-back guarantee</strong>.
          If SubCompliant is not the right fit for your business within 30 days of your first
          paid charge, email us at{' '}
          <a href="mailto:hello@subcompliant.co.uk" style={{ color: 'var(--acc)' }}>
            hello@subcompliant.co.uk
          </a>{' '}
          with the subject line &quot;Refund request&quot; and we will process a full refund
          within 5 business days. No conditions, no questions asked.
        </p>
        <p>
          The 30-day window runs from the date of your first paid charge — not from the start
          of your trial. If you use the full 14-day trial before activating a plan, you still
          get a full 30 days from the point of payment.
        </p>
        <p>
          Refunds are returned to the original payment method. Processing times vary by bank
          and card issuer but are typically 3–5 business days. If you have not received your
          refund after 7 business days, please contact us and we will investigate immediately.
        </p>
      </section>

      <SeoCta />
    </main>
  )
}
