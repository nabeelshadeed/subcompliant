import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Centre',
  description:
    'Getting started guides, billing help, document management support, and security information for SubCompliant — the UK subcontractor compliance platform.',
}

const categories = [
  {
    icon: '🚀',
    title: 'Getting Started',
    description: 'New to SubCompliant? Start here.',
    href: '/help/getting-started',
  },
  {
    icon: '📄',
    title: 'Documents & Compliance',
    description: 'Managing documents, approvals, and expiry alerts.',
    href: '/help/documents',
  },
  {
    icon: '💳',
    title: 'Billing & Plans',
    description: 'Trial, payments, upgrades and cancellation.',
    href: '/help/billing',
  },
  {
    icon: '🔒',
    title: 'Security & Privacy',
    description: 'Data protection, GDPR, and access control.',
    href: '/help/security',
  },
]

const popularArticles = [
  { title: 'How to invite your first subcontractor', href: '/help/getting-started#invite' },
  { title: 'What documents should I collect?', href: '/help/documents#what-to-collect' },
  { title: 'How do expiry reminders work?', href: '/help/documents#expiry-reminders' },
  { title: 'How to approve or reject a document', href: '/help/documents#review' },
  { title: 'What happens at the end of my trial?', href: '/help/billing#trial' },
  { title: 'How to cancel my subscription', href: '/help/billing#cancel' },
  { title: 'Is my data stored in the UK?', href: '/help/security#data-residency' },
  { title: 'How do I add team members?', href: '/help/getting-started#team' },
]

export default function HelpPage() {
  return (
    <main className="main">
      {/* Hero */}
      <div className="hero-section">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          Help Centre
        </div>
        <h1>How can we help?</h1>
        <p className="lead">
          Guides, articles and answers to help you get the most out of SubCompliant.
        </p>

        {/* Search hint — decorative only */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '480px',
            margin: '28px auto 0',
            padding: '12px 18px',
            background: 'var(--bg2)',
            border: '1px solid var(--bdr)',
            borderRadius: '10px',
            color: 'var(--w30)',
            fontSize: '14px',
          }}
        >
          <span style={{ fontSize: '16px' }}>🔍</span>
          <span>Search the help centre… (coming soon)</span>
        </div>
      </div>

      {/* Category cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          marginBottom: '60px',
        }}
      >
        {categories.map(cat => (
          <Link
            key={cat.href}
            href={cat.href}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="value-card"
              style={{
                padding: '28px',
                transition: 'border-color .2s, transform .2s',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{cat.icon}</div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{cat.title}</h3>
              <p style={{ margin: 0 }}>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Popular articles */}
      <h2 style={{ marginBottom: '20px' }}>Popular articles</h2>
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--bdr)',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '52px',
        }}
      >
        {popularArticles.map((article, i) => (
          <Link
            key={article.href}
            href={article.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px',
              borderBottom: i < popularArticles.length - 1 ? '1px solid var(--bdr)' : 'none',
              textDecoration: 'none',
              transition: 'background .15s',
            }}
          >
            <span style={{ fontSize: '14px', color: 'var(--w80)' }}>{article.title}</span>
            <span style={{ color: 'var(--acc)', fontSize: '16px', flexShrink: 0 }}>→</span>
          </Link>
        ))}
      </div>

      {/* Contact */}
      <div className="contact-box">
        <h3>Still need help?</h3>
        <p>
          Email{' '}
          <a href="mailto:hello@subcompliant.co.uk" style={{ color: 'var(--acc)' }}>
            hello@subcompliant.co.uk
          </a>{' '}
          — we reply within 4 hours Mon–Fri.
        </p>
      </div>
    </main>
  )
}
