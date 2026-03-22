import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SubCompliant Privacy Policy. Learn how we collect, use, and protect your personal data in accordance with UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <main className="main">
      <div className="doc-header">
        <div className="doc-tag">Legal Document</div>
        <h1>Privacy Policy</h1>
        <div className="doc-meta">Last updated: 16 March 2026 &nbsp;·&nbsp; Effective: 16 March 2026 &nbsp;·&nbsp; Version 1.0</div>
      </div>
      <div className="doc-intro">
        SubCompliant Ltd (&quot;SubCompliant&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect information when you use our subcontractor compliance management platform, website, and related services. This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
      </div>
      <div className="toc">
        <h4>Contents</h4>
        <ol>
          <li><Link href="#who-we-are">Who we are</Link></li>
          <li><Link href="#data-collect">Data we collect</Link></li>
          <li><Link href="#how-we-use">How we use your data</Link></li>
          <li><Link href="#legal-basis">Legal basis for processing</Link></li>
          <li><Link href="#sharing">Data sharing</Link></li>
          <li><Link href="#retention">Data retention</Link></li>
          <li><Link href="#rights">Your rights</Link></li>
          <li><Link href="#security">Security</Link></li>
          <li><Link href="#cookies">Cookies</Link></li>
          <li><Link href="#contact">Contact us</Link></li>
        </ol>
      </div>

      <h2 id="who-we-are">1. Who We Are</h2>
      <p>SubCompliant Ltd is a company registered in England and Wales. We are the data controller responsible for your personal data when you use the SubCompliant platform and website.</p>
      <p><strong>Contact:</strong> hello@subcompliant.co.uk</p>

      <h2 id="data-collect">2. Data We Collect</h2>
      <h3>Account Holders (Contractors)</h3>
      <ul>
        <li>Name, email address, phone number, company name, job title</li>
        <li>Billing information (processed by Stripe — we do not store card details)</li>
        <li>Platform usage data, login records, feature usage analytics</li>
      </ul>
      <h3>Subcontractors</h3>
      <ul>
        <li>Name, email address, phone number, trade, company name</li>
        <li>UTR number or Companies House registration number</li>
        <li>Compliance documents (insurance certificates, trade certifications, CSCS cards, DBS checks)</li>
        <li>Expiry dates and document metadata</li>
      </ul>
      <h3>Website Visitors</h3>
      <ul>
        <li>IP address, browser type, pages visited (via analytics — anonymised)</li>
        <li>Form submissions (contact, demo request, newsletter)</li>
      </ul>
      <div className="info-box"><p>⚡ We never sell your personal data to third parties. We never use your data for advertising purposes.</p></div>

      <h2 id="how-we-use">3. How We Use Your Data</h2>
      <ul>
        <li>To provide and operate the SubCompliant platform</li>
        <li>To send expiry alerts and compliance notifications</li>
        <li>To process payments and manage subscriptions</li>
        <li>To provide customer support</li>
        <li>To generate compliance reports on your behalf</li>
        <li>To improve the platform through aggregated, anonymised analytics</li>
        <li>To communicate product updates (you can unsubscribe at any time)</li>
      </ul>

      <h2 id="legal-basis">4. Legal Basis for Processing</h2>
      <ul>
        <li><strong>Contract performance:</strong> Processing necessary to provide the service you&apos;ve subscribed to</li>
        <li><strong>Legitimate interests:</strong> Analytics, fraud prevention, platform security</li>
        <li><strong>Legal obligation:</strong> Compliance with applicable laws and regulations</li>
        <li><strong>Consent:</strong> Marketing communications (withdrawable at any time)</li>
      </ul>

      <h2 id="sharing">5. Data Sharing</h2>
      <p>We share data only with trusted service providers necessary to operate the platform:</p>
      <ul>
        <li><strong>Stripe:</strong> Payment processing</li>
        <li><strong>Neon / Supabase:</strong> Database hosting (data stored in EU/UK)</li>
        <li><strong>Resend:</strong> Email delivery</li>
        <li><strong>Cloudflare:</strong> CDN and security</li>
      </ul>
      <p>All service providers are contractually bound to process data only as instructed and in compliance with UK GDPR.</p>
      <p>We do not share data with employers, insurers, government bodies, or any third parties without your explicit consent or legal obligation.</p>

      <h2 id="retention">6. Data Retention</h2>
      <ul>
        <li>Account data: Retained for the duration of your subscription plus 90 days after cancellation</li>
        <li>Compliance documents: Retained as long as your account is active; deleted within 90 days of account closure upon request</li>
        <li>Billing records: Retained for 7 years in accordance with UK accounting requirements</li>
        <li>Analytics data: Anonymised and retained indefinitely</li>
      </ul>

      <h2 id="rights">7. Your Rights Under UK GDPR</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
        <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
        <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Restriction:</strong> Restrict how we process your data in certain circumstances</li>
        <li><strong>Portability:</strong> Receive your data in a portable format</li>
        <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        <li><strong>Withdraw consent:</strong> For any processing based on consent</li>
      </ul>
      <p>To exercise any of these rights, contact us at privacy@subcompliant.co.uk. We will respond within 30 days. If you are not satisfied with our response, you have the right to complain to the Information Commissioner&apos;s Office (ICO) at ico.org.uk.</p>

      <h2 id="security">8. Security</h2>
      <p>We implement industry-standard security measures including:</p>
      <ul>
        <li>TLS encryption for all data in transit</li>
        <li>Encryption at rest for all stored documents and personal data</li>
        <li>Role-based access controls — contractors can only see their own subcontractors&apos; data</li>
        <li>Regular security audits and penetration testing</li>
        <li>GDPR-compliant data processing agreements with all sub-processors</li>
      </ul>

      <h2 id="cookies">9. Cookies</h2>
      <p>We use essential cookies for platform functionality and analytics cookies to understand how visitors use our website. You can manage cookie preferences via our <Link href="/legal/cookies" data-acc>Cookie Policy</Link>. We do not use advertising or tracking cookies.</p>

      <h2 id="contact">10. Contact Us</h2>
      <div className="contact-box">
        <h3>Data Protection Contact</h3>
        <p>SubCompliant Ltd &nbsp;·&nbsp; Email: privacy@subcompliant.co.uk<br />
        For urgent data protection matters or to exercise your rights, please include &quot;Data Protection Request&quot; in your subject line. We respond within 30 days.</p>
      </div>
    </main>
  )
}
