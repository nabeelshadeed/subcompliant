import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'SubCompliant Cookie Policy. How we use cookies on subcompliant.co.uk.',
}

export default function CookiesPage() {
  return (
    <main className="main">
      <div className="doc-tag">Legal Document</div>
      <h1>Cookie Policy</h1>
      <div className="doc-meta">Last updated: 16 March 2026</div>
      <h2>What are cookies?</h2>
      <p>Cookies are small text files stored on your device when you visit a website. They help websites function correctly and allow us to understand how you interact with our site.</p>
      <h2>Cookies we use</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>sc_session</td><td>Essential</td><td>Keeps you logged in to your account</td><td>Session</td></tr>
          <tr><td>sc_csrf</td><td>Essential</td><td>Security — prevents cross-site request forgery</td><td>Session</td></tr>
          <tr><td>sc_prefs</td><td>Functional</td><td>Remembers your dashboard preferences</td><td>1 year</td></tr>
          <tr><td>_ga, _gid</td><td>Analytics</td><td>Google Analytics — anonymous visitor statistics</td><td>2 years</td></tr>
          <tr><td>posthog_*</td><td>Analytics</td><td>Product analytics — feature usage (anonymised)</td><td>1 year</td></tr>
        </tbody>
      </table>
      <h2>Cookies we do NOT use</h2>
      <p>We do not use advertising cookies, tracking pixels, or any cookies that follow you across other websites. We do not serve targeted advertising.</p>
      <h2>Managing cookies</h2>
      <p>You can control cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in to the platform. Analytics cookies can be disabled without affecting platform functionality.</p>
      <h2>Changes</h2>
      <p>We may update this policy. Significant changes will be communicated via the platform or email.</p>
      <h2>Contact</h2>
      <p>Questions about cookies: privacy@subcompliant.co.uk</p>
    </main>
  )
}
