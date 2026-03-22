import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Security & Data Protection',
  description:
    'SubCompliant stores all data in the EU, encrypts documents in transit and at rest, is ICO-registered, and operates fully under UK GDPR. Security you can show your clients.',
  openGraph: {
    title: 'Security & Data Protection — SubCompliant',
    description:
      'EU data residency, AES-256 encryption, UK GDPR compliance, and row-level security. Built for UK contractors who handle sensitive subcontractor data.',
  },
}

const securityCards = [
  {
    icon: '🌍',
    title: 'Data Residency & Storage',
    items: [
      'All data stored in EU-West (Ireland)',
      'Neon Postgres for structured compliance data',
      'Cloudflare R2 for document file storage',
      'ISO 27001-certified infrastructure throughout',
      'UK GDPR data residency requirements met',
    ],
  },
  {
    icon: '🔐',
    title: 'Encryption & Access',
    items: [
      'TLS 1.3 encryption for all data in transit',
      'AES-256 encryption for all documents at rest',
      'Scoped, time-limited signed URLs for document access',
      'No document is ever publicly accessible',
      'Row-level security (RLS) at the database layer',
    ],
  },
  {
    icon: '⚖️',
    title: 'UK GDPR & Compliance',
    items: [
      'Registered with the ICO (Information Commissioner\'s Office)',
      'Fully compliant with UK GDPR and the Data Protection Act 2018',
      'Data Processing Agreement (DPA) signed with all Business+ customers',
      'DPIA (Data Protection Impact Assessment) maintained and reviewed annually',
      'Full data subject rights supported: access, deletion, portability',
    ],
  },
  {
    icon: '🛡️',
    title: 'Infrastructure & Reliability',
    items: [
      'Cloudflare Workers global edge network',
      '99.9% uptime SLA',
      'DDoS protection at the network edge',
      'Automatic daily database backups with 30-day retention',
      'Zero-downtime deployments',
    ],
  },
]

const badges = [
  { label: 'ICO Registered', color: '#00E676' },
  { label: 'UK GDPR', color: '#00E676' },
  { label: 'AES-256', color: 'var(--acc)' },
  { label: 'TLS 1.3', color: 'var(--acc)' },
  { label: 'EU Data Residency', color: 'var(--acc)' },
  { label: 'SOC 2 (in progress)', color: 'var(--w55)' },
]

export default function SecurityPage() {
  return (
    <main className="main">
      {/* Hero */}
      <div className="hero-section">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Security & Trust
        </div>
        <h1>Security you can show your clients.</h1>
        <p className="lead">
          SubCompliant is built on UK GDPR-compliant infrastructure, stores all data in the EU,
          and encrypts every document in transit and at rest. When your clients ask about data
          protection, you have answers.
        </p>
      </div>

      {/* Security badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '60px',
        }}
      >
        {badges.map(badge => (
          <span
            key={badge.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              background: 'var(--bg2)',
              border: '1px solid var(--bdr)',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              color: badge.color,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: badge.color,
                flexShrink: 0,
              }}
            />
            {badge.label}
          </span>
        ))}
      </div>

      {/* Security cards */}
      <div className="values-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '60px' }}>
        {securityCards.map(card => (
          <div key={card.title} className="value-card" style={{ padding: '28px' }}>
            <div className="value-ico" style={{ fontSize: '28px' }}>{card.icon}</div>
            <h3 style={{ fontSize: '17px', marginBottom: '16px' }}>{card.title}</h3>
            <ul className="check-list" style={{ margin: 0 }}>
              {card.items.map(item => (
                <li key={item} style={{ fontSize: '13px', color: 'var(--w55)', lineHeight: 1.6, marginBottom: '8px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Responsible disclosure */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--bdr)',
          borderRadius: '14px',
          padding: '32px',
          marginBottom: '48px',
        }}
      >
        <h2 style={{ marginBottom: '12px' }}>Responsible Disclosure</h2>
        <p>
          We take security vulnerabilities seriously. If you discover a security issue in
          SubCompliant, please report it responsibly by emailing{' '}
          <a href="mailto:security@subcompliant.co.uk" style={{ color: 'var(--acc)' }}>
            security@subcompliant.co.uk
          </a>
          . We will acknowledge your report within 24 hours and aim to resolve confirmed
          vulnerabilities within 30 days.
        </p>
        <p style={{ marginBottom: 0 }}>
          Please do not publicly disclose the vulnerability until we have had the opportunity to
          address it. We appreciate responsible researchers and will credit you in our security
          acknowledgements where appropriate.
        </p>
      </div>

      {/* Trust CTA */}
      <div className="cta-box">
        <h2>Ready to manage compliance with confidence?</h2>
        <p>
          Join contractors across the UK who trust SubCompliant to protect their subcontractor
          data. Start your 14-day free trial — no credit card required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/sign-up" className="btn-cta">
            Start free trial
          </Link>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              padding: '12px 22px',
              background: 'transparent',
              color: 'var(--w80)',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--bdr)',
              transition: 'all .18s',
            }}
          >
            Talk to us about security
          </Link>
        </div>
      </div>
    </main>
  )
}
