import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CHAS Alternative — SubCompliant | Subcontractor Compliance Software UK',
  description: "Looking for a CHAS alternative that manages your subcontractors' compliance daily? SubCompliant tracks documents, sends expiry alerts, and generates HSE reports. From £39/month.",
}

export default function ChasAlternativePage() {
  return (
    <main>
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>›</span><span>CHAS Alternative</span>
        </nav>
      </div>
      <section className="alt-hero">
        <div className="container">
          <div className="alt-tag">CHAS Alternative</div>
          <h1>CHAS accredits <em>your</em> H&S.<br />SubCompliant manages <em>theirs.</em></h1>
          <p>CHAS was built to assess your own Health &amp; Safety policies and procedures. SubCompliant was built to manage your subcontractors&apos; compliance documents every single day — tracking, alerting, and reporting automatically.</p>
          <div className="alt-ctas">
            <Link href="/auth/sign-up" className="btn btn-acc" style={{ padding: '14px 28px', fontSize: '15px' }}>Start Free for 14 Days →</Link>
            <Link href="/#pricing" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: '15px' }}>View Pricing</Link>
          </div>
        </div>
      </section>
      <section className="section alt-bg">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow"><span className="eyebrow-dot" /></div>
            <h2 className="sh">They&apos;re solving different problems.</h2>
            <p className="sl">Neither tool replaces the other. Understanding the difference will save you from using the wrong one for the wrong job.</p>
          </div>
          <div className="comp-grid">
            <div className="comp-card them">
              <div className="comp-card-label them-lbl">✗ CHAS</div>
              <h3>Accredits your own H&S policies</h3>
              <div className="comp-pts">
                <div className="comp-pt"><span className="comp-pt-ico">📅</span>Annual H&S assessment of your policies, procedures and management systems</div>
                <div className="comp-pt"><span className="comp-pt-ico">💰</span>£300–£800/year depending on membership level</div>
                <div className="comp-pt"><span className="comp-pt-ico">⏳</span>1–4 weeks to complete the assessment</div>
                <div className="comp-pt"><span className="comp-pt-ico">❌</span>Does not help you manage your subcontractors&apos; documents</div>
                <div className="comp-pt"><span className="comp-pt-ico">❌</span>No expiry alerts for your supply chain</div>
                <div className="comp-pt"><span className="comp-pt-ico">❌</span>No HSE audit reports for your subcontractors</div>
              </div>
            </div>
            <div className="comp-card us">
              <div className="comp-card-label us-lbl">✓ SubCompliant</div>
              <h3>Manages your subcontractors&apos; compliance daily</h3>
              <div className="comp-pts">
                <div className="comp-pt"><span className="comp-pt-ico">🔄</span>Daily operational tool — live tracking of every subcontractor&apos;s documents</div>
                <div className="comp-pt"><span className="comp-pt-ico">💷</span>From £39/month — no setup fees, no contracts</div>
                <div className="comp-pt"><span className="comp-pt-ico">⚡</span>Live in under 10 minutes — invite first subcontractor today</div>
                <div className="comp-pt"><span className="comp-pt-ico">✅</span>Full subcontractor document vault with version control</div>
                <div className="comp-pt"><span className="comp-pt-ico">✅</span>Automated expiry alerts at 90, 60, 30, and 7 days</div>
                <div className="comp-pt"><span className="comp-pt-ico">✅</span>One-click HSE audit pack for your entire supply chain</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow"><span className="eyebrow-dot" /></div>
            <h2 className="sh">What you actually get.</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="feat-table">
              <thead><tr><th>Capability</th><th>CHAS</th><th>SubCompliant</th></tr></thead>
              <tbody>
                <tr><td>Your own H&S accreditation</td><td className="ct-y">✓ Core feature</td><td className="ct-w">Not required — we complement this</td></tr>
                <tr className="win"><td>Subcontractor document collection</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ Automated invite portal</td></tr>
                <tr className="win"><td>Expiry tracking and alerts</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ 90/60/30/7-day cascade</td></tr>
                <tr className="win"><td>Real-time compliance scores</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ 0–100 live scoring</td></tr>
                <tr className="win"><td>HSE audit report generation</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ One-click PDF</td></tr>
                <tr className="win"><td>CSCS / Gas Safe / NICEIC verification</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ Live register checks</td></tr>
                <tr className="win"><td>Multi-site compliance management</td><td className="ct-n">✗ Not included</td><td className="ct-y">✓ Included on Pro+</td></tr>
                <tr><td>Monthly cost (SME)</td><td className="ct-w">£25–£67/mo</td><td className="ct-y">From £39/mo</td></tr>
                <tr><td>Time to set up</td><td className="ct-w">1–4 weeks</td><td className="ct-y">Under 10 minutes</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="section alt-bg">
        <div className="container">
          <div className="eyebrow"><span className="eyebrow-dot" /></div>
          <h2 className="sh">Three reasons SME contractors<br />choose SubCompliant.</h2>
          <div className="why-grid">
            <div className="why-card"><div className="why-ico">⚡</div><h3>Built for daily use, not annual submissions</h3><p>CHAS is an annual assessment of your own policies. SubCompliant is open every day — tracking renewals, alerting you to risks, and keeping your supply chain visible at all times.</p></div>
            <div className="why-card"><div className="why-ico">💷</div><h3>Priced for SMEs, not enterprise</h3><p>Start at £39/month with no setup fees. CHAS membership starts at £300/year and requires detailed health and safety documentation that many micro-SMEs struggle to compile.</p></div>
            <div className="why-card"><div className="why-ico">🛡️</div><h3>Protects you from your subcontractors&apos; lapses</h3><p>CHAS proves your H&S policies are sound. SubCompliant ensures your subcontractors stay compliant — which is the gap that causes HSE incidents, insurance voids, and contract disputes.</p></div>
          </div>
        </div>
      </section>
      <div className="alt-cta">
        <div className="container">
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" /></div>
            <h2 className="sh" style={{ margin: '0 auto 14px' }}>Start managing your subcontractors&apos; compliance today.</h2>
            <p className="sl" style={{ margin: '0 auto 28px' }}>14-day free trial. No credit card. Live in under 10 minutes.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/sign-up" className="btn btn-acc" style={{ padding: '14px 28px', fontSize: '15px' }}>Start Free Trial →</Link>
              <Link href="/#pricing" className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: '15px' }}>View Pricing</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
