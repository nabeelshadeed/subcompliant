import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Subcontractor Insurance Requirements UK 2026',
  description: 'What insurance must UK subcontractors hold? Guide to public liability, employers liability, and professional indemnity requirements for construction subcontractors.',
}

export default function SubcontractorInsurancePage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Guides</span><span>›</span><span>Insurance Guide</span>
      </nav>
      <div className="article-tag">Insurance Guide</div>
      <h1>Subcontractor Insurance Requirements UK 2026</h1>
      <div className="article-meta">By SubCompliant · January 2026 · 5 min read</div>
      <p>Before allowing any subcontractor to work on your site, you must verify they hold adequate insurance. One uninsured subcontractor causing an accident can expose your business to claims that your own insurance may not cover. This guide explains the minimum insurance requirements for UK construction subcontractors.</p>
      <h2>Public Liability Insurance</h2>
      <p>Every subcontractor must hold Public Liability Insurance — a minimum of £2m cover is standard, though many principal contractors require £5m or £10m. Check the policy is current, covers the type of work being undertaken, and the named insured matches the company or individual you have engaged.</p>
      <h2>Employers Liability Insurance</h2>
      <p>Any subcontractor who employs staff (even one employee) is legally required to hold Employers Liability Insurance with a minimum of £5m cover. Non-compliance is a criminal offence carrying fines of up to £2,500 per day. This requirement also applies to workers engaged on a labour-only basis in some circumstances.</p>
      <h2>Trade-Specific Insurance</h2>
      <p>Some trades require additional insurance: Professional Indemnity (design and engineering), Plant and Equipment Insurance (plant hire operators), Contractors All Risks (larger subcontractors). Always check your contract requirements and discuss with your own insurer what cover you require from the supply chain.</p>
      <h2>Tracking Insurance Renewals</h2>
      <p>Insurance certificates typically last 12 months. You must track the renewal dates of every subcontractor&apos;s policies. A lapsed insurance certificate — even by one day — means the subcontractor is legally uninsured on your site. SubCompliant sends automated alerts at 90, 60, 30, and 7 days before any insurance certificate expires.</p>
      <div className="cta-box">
        <h3>Automate your subcontractor compliance.</h3>
        <p>SubCompliant tracks all required documents, sends expiry alerts, and generates HSE audit reports automatically.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free for 14 Days →</Link>
      </div>
    </main>
  )
}
