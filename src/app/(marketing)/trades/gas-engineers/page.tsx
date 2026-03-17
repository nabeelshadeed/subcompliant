import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gas Engineer Compliance Software UK — SubCompliant',
  description: 'SubCompliant trade compliance template for Gas Safe engineers and plumbers. Pre-built document requirements: Gas Safe registration, CSCS card, Public Liability Insurance, ACS certification. Start free trial — 14 days.',
}

const docs = [
  { ico: '🔥', name: 'Gas Safe Registration', note: 'Live register check', req: 'Required' },
  { ico: '📋', name: 'Public Liability Insurance', note: 'Minimum £2m cover', req: 'Required' },
  { ico: '👷', name: 'CSCS Card', note: 'Construction skills card', req: 'Required' },
  { ico: '🎓', name: 'ACS Certification', note: 'Gas appliance categories', req: 'Required' },
  { ico: '🏢', name: 'Employers Liability Insurance', note: 'If employing staff', req: 'Required' },
]

export default function GasEngineersPage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Trades</span><span>›</span><span>Gas Safe engineers and plumbers</span>
      </nav>
      <div className="trade-tag">Gas Safe engineers and plumbers Compliance</div>
      <h1>Subcontractor Compliance for<br />Gas Safe engineers and plumbers</h1>
      <p>SubCompliant includes a pre-built compliance template for Gas Safe engineers and plumbers that automatically requires the correct documents when you invite a subcontractor of this trade. No manual setup required.</p>
      <h2>Required Documents — Gas Safe engineers and plumbers Template</h2>
      <div className="docs-grid">
        {docs.map((d) => (
          <div key={d.name} className="doc-card">
            <div className="doc-ico">{d.ico}</div>
            <div className="doc-name">{d.name}</div>
            <div className="doc-note">{d.note}</div>
            <span className="doc-req">{d.req}</span>
          </div>
        ))}
      </div>
      <p>When you invite a Gas Safe engineers and plumbers subcontractor, SubCompliant automatically requests these specific documents from them via the branded upload portal. You can customise this list for your specific requirements.</p>
      <div className="cta-box">
        <h2>Start tracking Gas Safe engineers and plumbers compliance today.</h2>
        <p>14-day free trial. No credit card. Trade templates pre-loaded and ready to use.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free Trial →</Link>
      </div>
    </main>
  )
}
