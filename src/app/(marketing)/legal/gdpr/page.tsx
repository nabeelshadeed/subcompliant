import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR Compliance — SubCompliant',
  description: 'SubCompliant GDPR compliance statement. How we protect personal data under UK GDPR.',
}

export default function GdprPage() {
  return (
    <main className="main">
      <div className="doc-tag" style={{ background: 'rgba(0,230,118,.1)', borderColor: 'rgba(0,230,118,.2)', color: '#00E676' }}>✓ GDPR Compliant</div>
      <h1>GDPR Compliance</h1>
      <div className="doc-meta">SubCompliant Ltd — UK GDPR Compliance Statement — July 2025</div>
      <p>SubCompliant is fully compliant with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. This page summarises our key compliance commitments.</p>
      <div className="status-box">
        <div className="status-ico">✅</div>
        <div>
          <div className="status-title">UK GDPR Compliant</div>
          <div className="status-desc">Data processed in accordance with UK GDPR and DPA 2018</div>
        </div>
      </div>
      <div className="status-box">
        <div className="status-ico">🔒</div>
        <div>
          <div className="status-title">Data stored in UK / EU</div>
          <div className="status-desc">All personal data stored on servers within UK/EU jurisdiction</div>
        </div>
      </div>
      <div className="status-box">
        <div className="status-ico">📋</div>
        <div>
          <div className="status-title">DPA agreements in place</div>
          <div className="status-desc">GDPR-compliant Data Processing Agreements with all sub-processors</div>
        </div>
      </div>
      <h2>Your Rights</h2>
      <ul className="check-list">
        <li>Right to access your personal data</li>
        <li>Right to rectify inaccurate data</li>
        <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
        <li>Right to restrict processing</li>
        <li>Right to data portability</li>
        <li>Right to object to processing</li>
        <li>Right to withdraw consent at any time</li>
      </ul>
      <p>To exercise any right: privacy@subcompliant.co.uk — we respond within 30 days.</p>
      <h2>Data Retention</h2>
      <p>Personal data is retained only as long as necessary for the stated purpose. Account data is deleted within 90 days of account closure upon request. See our <Link href="/legal/privacy" data-acc>Privacy Policy</Link> for full retention schedules.</p>
      <h2>Data Breaches</h2>
      <p>In the event of a personal data breach that is likely to result in a risk to individuals, we will notify the ICO within 72 hours and affected users without undue delay.</p>
      <h2>Contact</h2>
      <p>Data Protection enquiries: privacy@subcompliant.co.uk</p>
      <p>You have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO): <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" data-acc>ico.org.uk</a></p>
    </main>
  )
}
