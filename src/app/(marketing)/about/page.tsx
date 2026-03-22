import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Zap, PoundSterling, Lock, Handshake, Flag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'SubCompliant is a UK-built subcontractor compliance platform for SME contractors. Our mission: eliminate the risk of expired documents from UK construction sites.',
}

export default function AboutPage() {
  return (
    <main className="main">
      <div className="hero-section">
        <div className="eyebrow">About SubCompliant</div>
        <h1>Built for UK contractors.<br />Obsessed with compliance.</h1>
        <p className="lead">We&apos;re a UK-based team that spent years watching contractors get caught out by one simple problem: a subcontractor&apos;s document lapsed and nobody noticed. We built SubCompliant to make sure that never happens — automated, organised, and built for the realities of UK SME contractors.</p>
      </div>
      <div className="mission-box">
        <h2>Our Mission</h2>
        <p>To eliminate compliance risk from UK construction sites by making subcontractor document management so simple and automated that no contractor ever has to worry about an expired certificate again.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        {[
          { val: '2024', label: 'Founded in the UK' },
          { val: '500+', label: 'Contractors on platform' },
          { val: '12k+', label: 'Documents tracked' },
        ].map(s => (
          <div key={s.val} style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Syne', system-ui, sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--acc)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 13, color: 'var(--w55)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h2>Why We Built This</h2>
      <p>Every year, hundreds of UK SME contractors face HSE investigations, insurance disputes, and contract terminations because a subcontractor&apos;s document lapsed without anyone noticing. Spreadsheets fail. Email chains get ignored. Certificates expire.</p>
      <p>The enterprise compliance tools — Constructionline, CHAS, Avetta — solve a different problem. They help contractors prove their own compliance to buyers. None of them help you manage your subcontractors&apos; compliance on a daily basis. That gap is what SubCompliant closes.</p>
      <h2>Our Values</h2>
      <div className="values-grid">
        <div className="value-card">
          <div className="value-ico"><ShieldCheck size={22} /></div>
          <h3>Protection first</h3>
          <p>Every feature we build is designed to protect contractors from compliance risk before it becomes a problem.</p>
        </div>
        <div className="value-card">
          <div className="value-ico"><Zap size={22} /></div>
          <h3>Automation by default</h3>
          <p>Manual compliance management fails at scale. We automate everything that can be automated.</p>
        </div>
        <div className="value-card">
          <div className="value-ico"><PoundSterling size={22} /></div>
          <h3>Accessible pricing</h3>
          <p>The SME contractor market has been ignored by enterprise tools. We built something they can actually afford.</p>
        </div>
        <div className="value-card">
          <div className="value-ico"><Lock size={22} /></div>
          <h3>Data integrity</h3>
          <p>Compliance documents are legal records. We treat them with the security and permanence they deserve.</p>
        </div>
        <div className="value-card">
          <div className="value-ico"><Handshake size={22} /></div>
          <h3>Honest transparency</h3>
          <p>Simple pricing. No hidden fees. No upselling. We tell you exactly what you get for your money.</p>
        </div>
        <div className="value-card">
          <div className="value-ico"><Flag size={22} /></div>
          <h3>UK-native</h3>
          <p>Built specifically for UK compliance requirements — CSCS, Gas Safe, NICEIC, HSE, UK GDPR. Not adapted from a US product.</p>
        </div>
      </div>
    </main>
  )
}
