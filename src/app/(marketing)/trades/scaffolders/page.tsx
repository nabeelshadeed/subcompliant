import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Scaffolding Contractor Compliance Software UK',
  description: 'SubCompliant trade compliance template for Scaffolding contractors. Pre-built document requirements: CISRS card, NASC membership, CSCS card, Public Liability Insurance. Start free trial — 14 days.',
}

const docs = [
  { ico: '🏗️', name: 'CISRS Card', note: 'Scaffolding competency card', req: 'Required' },
  { ico: '📋', name: 'Public Liability Insurance', note: 'Minimum £5m recommended', req: 'Required' },
  { ico: '👷', name: 'CSCS Card', note: 'Construction skills card', req: 'Required' },
  { ico: '🏢', name: 'Employers Liability Insurance', note: 'If employing staff', req: 'Required' },
  { ico: '📜', name: 'NASC Membership', note: 'Trade association accreditation', req: 'If applicable', muted: true },
]

export default function ScaffoldersPage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Trades</span><span>›</span><span>Scaffolding contractors</span>
      </nav>
      <div className="trade-tag">Scaffolding contractors Compliance</div>
      <h1>Subcontractor Compliance for<br />Scaffolding contractors</h1>
      <p>SubCompliant includes a pre-built compliance template for Scaffolding contractors that automatically requires the correct documents when you invite a subcontractor of this trade. No manual setup required.</p>
      <h2>Required Documents — Scaffolding contractors Template</h2>
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
      <p>When you invite a Scaffolding contractors subcontractor, SubCompliant automatically requests these specific documents from them via the branded upload portal. You can customise this list for your specific requirements.</p>
      <div className="cta-box">
        <h2>Start tracking Scaffolding contractors compliance today.</h2>
        <p>14-day free trial. No credit card. Trade templates pre-loaded and ready to use.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free Trial →</Link>
      </div>
    </main>
  )
}
