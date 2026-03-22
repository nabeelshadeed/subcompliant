import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CSCS Card Requirements UK 2026 — Complete Guide',
  description: 'Which CSCS card does your subcontractor need? Full guide to CSCS card types, eligibility, expiry dates, and how to verify a CSCS card is genuine.',
}

export default function CscsCardPage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Guides</span><span>›</span><span>CSCS Card Guide</span>
      </nav>
      <div className="article-tag">CSCS Card Guide</div>
      <h1>CSCS Card Requirements for UK Contractors 2025</h1>
      <div className="article-meta">By SubCompliant · January 2026 · 5 min read</div>
      <p>The Construction Skills Certification Scheme (CSCS) is the UK&apos;s primary evidence of competency for construction workers. As a contractor, you must ensure every worker on your site holds a valid, appropriate CSCS card. This guide explains which cards are required by trade and how to verify them.</p>
      <h2>Why CSCS Cards Matter</h2>
      <p>CSCS cards prove a worker has the appropriate skills, qualifications, and health and safety knowledge for their role. Under CDM 2015 and most principal contractor requirements, all operatives must hold a valid CSCS card. Allowing an uncarded worker on site is a compliance failure.</p>
      <h2>CSCS Card Types by Trade</h2>
      <p>Green Labourer card: labourers with a Level 1 Award in Health &amp; Safety. Blue Skilled Worker card: qualified tradespeople (electricians, plumbers, bricklayers, etc). Gold Supervisory card: site supervisors and forepersons. Black Manager card: site managers and project managers. Each card has specific qualification requirements.</p>
      <h2>CSCS Card Expiry</h2>
      <p>CSCS cards typically last 5 years. You must track expiry dates for every worker. An expired CSCS card is not valid — the card holder must renew before returning to site. SubCompliant tracks CSCS expiry dates and sends automated alerts before cards lapse.</p>
      <h2>How to Verify a CSCS Card</h2>
      <p>Use the CSCS card checker at cscs.uk.com or call the CSCS helpline to verify any card number. SubCompliant&apos;s verification engine does this automatically for all your subcontractors, flagging expired or invalid cards in real time.</p>
      <div className="cta-box">
        <h3>Automate your subcontractor compliance.</h3>
        <p>SubCompliant tracks all required documents, sends expiry alerts, and generates HSE audit reports automatically.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free for 14 Days →</Link>
      </div>
    </main>
  )
}
