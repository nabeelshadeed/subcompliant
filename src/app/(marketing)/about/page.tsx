import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About SubCompliant',
  description: 'SubCompliant is a UK-built subcontractor compliance platform for SME contractors. Our mission: eliminate the risk of expired documents from UK construction sites.',
}

export default function AboutPage() {
  return (
    <main className="main">
      <div className="hero-section">
        <div className="eyebrow">About SubCompliant</div>
        <h1>Built for UK contractors.<br />Obsessed with compliance.</h1>
        <p className="lead">SubCompliant exists because one expired document from a subcontractor can end a contractor&apos;s business. We built the tool that makes sure that never happens.</p>
      </div>
      <div className="mission-box">
        <h2>Our Mission</h2>
        <p>To eliminate compliance risk from UK construction sites by making subcontractor document management so simple and automated that no contractor ever has to worry about an expired certificate again.</p>
      </div>
      <h2>Why We Built This</h2>
      <p>Every year, hundreds of UK SME contractors face HSE investigations, insurance disputes, and contract terminations because a subcontractor&apos;s document lapsed without anyone noticing. Spreadsheets fail. Email chains get ignored. Certificates expire.</p>
      <p>The enterprise compliance tools — Constructionline, CHAS, Avetta — solve a different problem. They help contractors prove their own compliance to buyers. None of them help you manage your subcontractors&apos; compliance on a daily basis. That gap is what SubCompliant closes.</p>
      <h2>Our Values</h2>
      <div className="values-grid">
        <div className="value-card">
          <div className="value-ico">🛡️</div>
          <h3>Protection first</h3>
          <p>Every feature we build is designed to protect contractors from compliance risk before it becomes a problem.</p>
        </div>
        <div className="value-card">
          <div className="value-ico">⚡</div>
          <h3>Automation by default</h3>
          <p>Manual compliance management fails at scale. We automate everything that can be automated.</p>
        </div>
        <div className="value-card">
          <div className="value-ico">💷</div>
          <h3>Accessible pricing</h3>
          <p>The SME contractor market has been ignored by enterprise tools. We built something they can actually afford.</p>
        </div>
        <div className="value-card">
          <div className="value-ico">🔒</div>
          <h3>Data integrity</h3>
          <p>Compliance documents are legal records. We treat them with the security and permanence they deserve.</p>
        </div>
        <div className="value-card">
          <div className="value-ico">🤝</div>
          <h3>Honest transparency</h3>
          <p>Simple pricing. No hidden fees. No upselling. We tell you exactly what you get for your money.</p>
        </div>
        <div className="value-card">
          <div className="value-ico">🇬🇧</div>
          <h3>UK-native</h3>
          <p>Built specifically for UK compliance requirements — CSCS, Gas Safe, NICEIC, HSE, UK GDPR. Not adapted from a US product.</p>
        </div>
      </div>
    </main>
  )
}
