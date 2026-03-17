import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Groundworker Compliance Software UK — SubCompliant',
  description: 'SubCompliant trade compliance template for Groundworks and civil engineering subcontractors. Pre-built document requirements: CSCS card, CPCS card, Public Liability Insurance, Plant operator certificate. Start free trial — 14 days.',
}

const docs = [
  { ico: '🚜', name: 'CPCS Card', note: 'Plant Competence Certification', req: 'Required' },
  { ico: '📋', name: 'Public Liability Insurance', note: 'Minimum £2m cover', req: 'Required' },
  { ico: '👷', name: 'CSCS Card', note: 'Construction skills card', req: 'Required' },
  { ico: '🏢', name: 'Employers Liability Insurance', note: 'If employing staff', req: 'Required' },
  { ico: '📜', name: 'Plant Operator Certificate', note: 'For plant operators', req: 'If applicable', muted: true },
]

export default function GroundworkersPage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Trades</span><span>›</span><span>Groundworks and civil engineering subcontractors</span>
      </nav>
      <div className="trade-tag">Groundworks and civil engineering subcontractors Compliance</div>
      <h1>Subcontractor Compliance for<br />Groundworks and civil engineering subcontractors</h1>
      <p>SubCompliant includes a pre-built compliance template for Groundworks and civil engineering subcontractors that automatically requires the correct documents when you invite a subcontractor of this trade. No manual setup required.</p>
      <h2>Required Documents — Groundworks and civil engineering subcontractors Template</h2>
      <div className="docs-grid">
        {docs.map((d) => (
          <div key={d.name} className="doc-card">
            <div className="doc-ico">{d.ico}</div>
            <div className="doc-name">{d.name}</div>
            <div className="doc-note">{d.note}</div>
            <span className={`doc-req ${d.muted ? 'muted' : ''}`}>{d.req}</span>
          </div>
        ))}
      </div>
      <p>When you invite a Groundworks and civil engineering subcontractors subcontractor, SubCompliant automatically requests these specific documents from them via the branded upload portal. You can customise this list for your specific requirements.</p>
      <div className="cta-box">
        <h2>Start tracking Groundworks and civil engineering subcontractors compliance today.</h2>
        <p>14-day free trial. No credit card. Trade templates pre-loaded and ready to use.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free Trial →</Link>
      </div>
    </main>
  )
}
