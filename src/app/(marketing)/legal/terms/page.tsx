import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SubCompliant Terms of Service. Read the terms that govern your use of the SubCompliant subcontractor compliance platform.',
}

export default function TermsPage() {
  return (
    <main className="main">
      <div className="doc-header">
        <div className="doc-tag">Legal Document</div>
        <h1>Terms of Service</h1>
        <div className="doc-meta">Last updated: 16 March 2026 · Version 1.0</div>
      </div>
      <div className="doc-intro">Please read these Terms of Service carefully before using SubCompliant. By creating an account or using the platform, you agree to be bound by these terms. If you do not agree, do not use the service.</div>

      <h2>1. Acceptance of Terms</h2>
      <p>These Terms of Service (&quot;Terms&quot;) govern your use of the SubCompliant platform and website operated by SubCompliant Ltd, registered in England and Wales (&quot;SubCompliant&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using the service, you confirm you are at least 18 years old and have authority to bind your company to these Terms.</p>

      <h2>2. Description of Service</h2>
      <p>SubCompliant provides a software-as-a-service platform for UK construction contractors to manage subcontractor compliance documentation, track document expiry dates, run certification verification checks, and generate compliance reports. The service is provided on a subscription basis.</p>

      <h2>3. Subscription and Payment</h2>
      <ul>
        <li>Subscriptions are billed monthly or annually in advance</li>
        <li>Payment is processed by Stripe. By subscribing, you authorise recurring charges</li>
        <li>Annual subscriptions are non-refundable after 14 days</li>
        <li>Monthly subscriptions can be cancelled at any time; access continues until the end of the billing period</li>
        <li>We reserve the right to change pricing with 30 days&apos; notice. Existing subscriptions continue at the agreed rate until renewal</li>
        <li>Failed payments may result in service suspension after 7 days</li>
      </ul>

      <h2>4. Free Trial</h2>
      <p>New accounts receive a 14-day free trial with full Pro plan features. No credit card is required during the trial. At the end of the trial, the account is downgraded to the Starter plan unless a paid subscription is activated. Trial accounts created fraudulently to circumvent the 14-day limit will be terminated.</p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload false, falsified, or fraudulent compliance documents</li>
        <li>Use the platform to misrepresent the compliance status of subcontractors</li>
        <li>Attempt to access other contractors&apos; accounts or data</li>
        <li>Reverse engineer, copy, or resell any part of the platform</li>
        <li>Use the platform for any unlawful purpose</li>
        <li>Upload malicious code, files, or content</li>
      </ul>
      <p>SubCompliant is a document management and tracking tool. We do not verify the legal validity of documents submitted. Contractors remain solely responsible for verifying that subcontractors hold valid, appropriate compliance documentation before allowing them on site.</p>

      <h2>6. Data and Privacy</h2>
      <p>Our <Link href="/legal/privacy" data-acc>Privacy Policy</Link> describes how we collect and process personal data. By using SubCompliant, you agree to the Privacy Policy and confirm you have authority to share subcontractor data with us.</p>

      <h2>7. Intellectual Property</h2>
      <p>All platform code, design, branding, and content is the property of SubCompliant Ltd. You are granted a limited, non-exclusive, non-transferable licence to use the platform during your active subscription. Your compliance documents remain your property at all times.</p>

      <h2>8. Limitation of Liability</h2>
      <p>SubCompliant provides a document management and tracking tool. We are not responsible for:</p>
      <ul>
        <li>The accuracy, validity, or currency of documents uploaded by subcontractors</li>
        <li>HSE incidents, insurance claims, or legal disputes arising from subcontractor non-compliance</li>
        <li>Business losses arising from platform downtime beyond our reasonable control</li>
      </ul>
      <p>Our maximum liability to you in any 12-month period is limited to the total subscription fees paid in that period.</p>

      <h2>9. Termination</h2>
      <p>You may cancel your subscription at any time via account settings. We may terminate accounts that breach these Terms, with or without notice. Upon termination, your data will be retained for 90 days before deletion, during which time you may export your data.</p>

      <h2>10. Changes to Terms</h2>
      <p>We may update these Terms from time to time. Significant changes will be notified by email 14 days in advance. Continued use of the platform after the effective date constitutes acceptance of the updated Terms.</p>

      <h2>11. Governing Law</h2>
      <p>These Terms are governed by English law. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

      <h2>12. Contact</h2>
      <p>SubCompliant Ltd · legal@subcompliant.co.uk</p>
    </main>
  )
}
