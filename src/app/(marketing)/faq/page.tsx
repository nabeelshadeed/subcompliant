import type { Metadata } from 'next'
import Link from 'next/link'
// FaqAccordion is a client component defined in this same directory
import FaqAccordion from './FaqAccordion'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to the most common questions about SubCompliant — the UK subcontractor compliance platform. Getting started, pricing, documents, security, and platform features.',
  openGraph: {
    title: 'FAQ — SubCompliant',
    description:
      'Everything you need to know about SubCompliant. How it works, what it costs, how your data is protected, and what documents you can manage.',
  },
}

type FaqCategory = {
  category: string
  questions: { q: string; a: string }[]
}

const faqData: FaqCategory[] = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How does SubCompliant work?',
        a: "You add a subcontractor, send them a branded magic-link by email or SMS. They click the link and upload their documents — no account creation needed. Their files are stored against their profile, compliance status is calculated automatically, and you get alerted as anything approaches expiry.",
      },
      {
        q: 'How long does it take to set up?',
        a: "Most contractors are live within 10 minutes. Create your account, add your first subcontractor, and send them a magic-link invite. That's it. There's no software to install, no IT department needed.",
      },
      {
        q: 'Do subcontractors need to create an account?',
        a: "No. Subcontractors receive a branded magic link. They click it and upload directly — no passwords, no app downloads, no friction. We built it this way because anything that adds steps for the subcontractor kills your response rate.",
      },
      {
        q: 'Can I import my existing subcontractor list?',
        a: "Yes. You can add subcontractors individually or in bulk via CSV upload. If you have an existing spreadsheet, you can import name, email, phone, company name and trade type in one go.",
      },
      {
        q: 'What trades does SubCompliant support?',
        a: "All UK construction trades — electricians, gas engineers, plumbers, roofers, scaffolders, groundworkers, joiners, painters, decorators and more. For each trade we have pre-built document requirement templates so you know exactly what to request.",
      },
    ],
  },
  {
    category: 'Pricing & Trial',
    questions: [
      {
        q: 'Is there really no credit card required for the trial?',
        a: "Correct. Start your 14-day trial with full Pro features — zero payment details required. At the end of the trial you choose whether to activate a paid plan. If you don't, your account automatically downgrades to our Starter tier.",
      },
      {
        q: 'What happens when the 14-day trial ends?',
        a: "If you haven't activated a paid plan, your account moves to our free Starter tier. You keep access to your data and can continue managing up to 3 subcontractors. Documents already uploaded are retained. No data is deleted.",
      },
      {
        q: 'Can I cancel anytime?',
        a: "Yes. Cancel from your account settings in under 60 seconds. Access continues to the end of your current billing period. Your data is retained for 90 days so you can export it. No questions asked, no cancellation fees.",
      },
      {
        q: 'Is there a money-back guarantee?',
        a: "Yes — 30-day money-back guarantee on all paid plans. If SubCompliant isn't the right fit within 30 days of your first paid charge, email us and we'll refund in full. No conditions.",
      },
      {
        q: 'Do you offer discounts for annual billing?',
        a: "Yes, annual billing saves 20% compared to monthly. You can switch to annual in your account settings at any time. The saving is applied immediately pro-rata.",
      },
    ],
  },
  {
    category: 'Documents & Compliance',
    questions: [
      {
        q: 'What documents can I collect and store?',
        a: "Public liability insurance, employers liability insurance, professional indemnity, CSCS cards, Gas Safe registration, NICEIC/NAPIT certificates, RAMS (risk assessments & method statements), CIS registration, UTR numbers, right-to-work documentation, asbestos awareness certificates, working at height certificates, IPAF/PASMA, DBS checks, and any custom document type you define.",
      },
      {
        q: 'How does SubCompliant track document expiry?',
        a: "Every document has an expiry date. SubCompliant automatically sends reminders at 30, 14, 7, 3, and 1 days before expiry — to you and optionally to the subcontractor directly. When a document expires, its compliance status updates in real time and you get a critical alert.",
      },
      {
        q: 'Can I set my own document requirements per subcontractor?',
        a: "Yes. You can use trade-specific templates (e.g. all Gas Safe engineers require Gas Safe registration + public liability + RAMS) or customise requirements per subcontractor. Different clients or projects may have different standards — SubCompliant accommodates that.",
      },
      {
        q: 'What happens when a document expires?',
        a: "The subcontractor's compliance status changes to non-compliant and their risk score updates immediately. You receive an in-app notification and email alert. A one-click re-invitation link lets you chase the subcontractor directly from the dashboard.",
      },
      {
        q: "Can I approve or reject documents after they're uploaded?",
        a: "Yes. Every uploaded document goes through a review queue. You can preview, approve, or reject with a written reason. Rejected documents trigger an automatic email to the subcontractor with your feedback and a re-upload link.",
      },
    ],
  },
  {
    category: 'Security & Data',
    questions: [
      {
        q: 'Where is my data stored?',
        a: "All data is stored in the European Union (EU-West) on ISO 27001-certified infrastructure. We use Neon (Postgres) for your compliance data and Cloudflare R2 for document storage. Both services comply with UK GDPR data residency requirements.",
      },
      {
        q: 'Is SubCompliant GDPR compliant?',
        a: "Yes. We are registered with the ICO, operate under UK GDPR and the Data Protection Act 2018, and maintain a detailed privacy policy and DPIA. We act as a data processor on your behalf and sign a Data Processing Agreement (DPA) with all customers on Business and Enterprise plans.",
      },
      {
        q: 'Are documents encrypted?',
        a: "Yes. Documents are encrypted in transit (TLS 1.3) and at rest (AES-256) on Cloudflare R2. Access is controlled by scoped, time-limited signed URLs — no document is publicly accessible.",
      },
      {
        q: 'Can I export all my data?',
        a: "Yes. You can export all subcontractor data and document metadata as a CSV at any time from your settings page. Document files can be downloaded individually or in bulk. On account closure, all data is exported before deletion.",
      },
      {
        q: 'Who has access to our compliance data?',
        a: "Only authenticated members of your SubCompliant account. We implement row-level security (RLS) at the database level, meaning no data is ever accessible across account boundaries. SubCompliant staff can only access data when explicitly required for support, with your consent.",
      },
    ],
  },
  {
    category: 'Platform Features',
    questions: [
      {
        q: 'Does SubCompliant integrate with my existing tools?',
        a: "The Business and Enterprise plans include API access. You can push subcontractor data from your CRM or project management tool and pull compliance status into dashboards or reports. Webhook support for real-time event notifications is also available.",
      },
      {
        q: 'Can multiple team members use the same account?',
        a: "Yes. You can invite team members with Owner, Admin, or Viewer roles. Owners control billing and account settings. Admins can manage subcontractors and approve documents. Viewers have read-only access. All plans include at least one user seat; Pro includes 3 and Business includes 10.",
      },
      {
        q: 'Does SubCompliant generate HSE audit reports?',
        a: "Yes. On Pro and Business plans you can generate a PDF compliance report for any subcontractor or across your full supply chain. The report shows document status, expiry dates, risk scores, and approval history — formatted for HSE site audits.",
      },
      {
        q: 'Can I see a compliance risk score for each subcontractor?',
        a: "Yes. Each subcontractor receives an automated risk score (Low, Medium, High, Critical) based on document completeness, expiry proximity, and document type weighting. Scores update in real time as documents are uploaded, approved, or expire.",
      },
      {
        q: 'Is there a mobile app?',
        a: "SubCompliant is a web app optimised for both desktop and mobile browsers. You can manage subcontractors, review documents, and send invitations from any device without installing anything. A dedicated iOS/Android app is on the roadmap.",
      },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.flatMap(cat =>
    cat.questions.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="main">
        {/* Hero */}
        <div className="hero-section">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            FAQ
          </div>
          <h1>Frequently asked questions</h1>
          <p className="lead">
            Everything you need to know about SubCompliant — from getting started to security,
            pricing, and compliance features.
          </p>
        </div>

        {/* Category quick-nav */}
        <nav
          aria-label="FAQ categories"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '52px',
            justifyContent: 'center',
          }}
        >
          {faqData.map(cat => (
            <a
              key={cat.category}
              href={`#${cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              style={{
                display: 'inline-flex',
                padding: '7px 16px',
                background: 'var(--bg2)',
                border: '1px solid var(--bdr)',
                borderRadius: '100px',
                fontSize: '13px',
                color: 'var(--w55)',
                transition: 'all .15s',
                textDecoration: 'none',
              }}
            >
              {cat.category}
            </a>
          ))}
        </nav>

        {/* Interactive accordion — client component */}
        <FaqAccordion categories={faqData} />

        {/* Trust CTA */}
        <div className="cta-box" style={{ marginTop: '64px' }}>
          <h2>Still have questions?</h2>
          <p>
            Our team replies within 4 hours Mon–Fri. Or jump straight in — your first 14 days
            are completely free, no credit card required.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
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
              Contact us
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
