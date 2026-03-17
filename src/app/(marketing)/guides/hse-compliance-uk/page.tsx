import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HSE Compliance Guide for UK Contractors 2026 — SubCompliant',
  description: 'Complete guide to HSE compliance for UK construction contractors. Understand your legal duties, what documents you need from subcontractors, and how to prepare for an HSE inspection.',
}

export default function HseCompliancePage() {
  return (
    <main className="main">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Guides</span><span>›</span><span>HSE Compliance Guide</span>
      </nav>
      <div className="article-tag">HSE Compliance Guide</div>
      <h1>HSE Compliance for UK Contractors: Complete Guide 2026</h1>
      <div className="article-meta">By SubCompliant · January 2026 · 5 min read</div>
      <p>If you engage subcontractors on UK construction sites, you have legal duties under the Health and Safety at Work Act 1974 and CDM 2015. This guide covers what you need to know and what documents you must collect from every subcontractor before they begin work.</p>
      <h2>Your Legal Duties</h2>
      <p>Under the Health and Safety at Work Act 1974, you have a duty to ensure the health, safety, and welfare of all workers under your control — including subcontractors. Under CDM 2015, you must take reasonable steps to verify subcontractor competency before they set foot on site. This duty is non-delegable.</p>
      <h2>Required Documents</h2>
      <p>You must collect and retain: Public Liability Insurance (minimum £2m), CSCS card appropriate to trade, Employers Liability Insurance (if they employ staff), and relevant trade certifications (Gas Safe, NICEIC, NAPIT, CISRS, etc). All documents must be checked for validity and expiry date.</p>
      <h2>HSE Inspection Readiness</h2>
      <p>HSE inspections can arrive without notice. Inspectors will ask for dated, documented evidence that you verified subcontractor competency — not verbal confirmation. A timestamped compliance record for each subcontractor is essential. SubCompliant generates this automatically.</p>
      <h2>Penalties for Non-Compliance</h2>
      <p>Unlimited fines, prosecution, and imprisonment are possible for serious HSE breaches. Average fines for medium-sized companies regularly exceed £100,000. One lapsed subcontractor document can also void your insurance policy, leaving you personally liable for claims.</p>
      <div className="cta-box">
        <h3>Automate your subcontractor compliance.</h3>
        <p>SubCompliant tracks all required documents, sends expiry alerts, and generates HSE audit reports automatically.</p>
        <Link href="/auth/sign-up" className="btn-cta">Start Free for 14 Days →</Link>
      </div>
    </main>
  )
}
