import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Subcontractor Document Tracker | Replace Spreadsheets',
  description:
    'Learn how UK contractors can track subcontractor documents such as CSCS cards, insurance and RAMS without spreadsheets, and when to use dedicated tools.',
  openGraph: {
    title: 'Subcontractor Document Tracker | Replace Spreadsheets',
    description:
      'Guide to building a subcontractor document tracker for UK contractors, including which documents to track and how to automate reminders.',
    url: 'https://subcompliant.com/subcontractor-document-tracker',
    type: 'article',
  },
}

export default function SubcontractorDocumentTrackerPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Subcontractor document tracker · UK
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          How to Build a Subcontractor Document Tracker (Without Losing Your Mind)
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          Most UK contractors start with a spreadsheet to track subcontractor documents. It works for a few trades, but
          quickly becomes unmanageable. This guide explains what to track and how to move beyond manual spreadsheets.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          What should your subcontractor document tracker include?
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          A basic tracker needs to answer a simple question: “Is this subcontractor compliant today?” To do that, you
          need to record:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Subcontractor company details and key contacts.</li>
          <li>Insurance policies with limits and expiry dates.</li>
          <li>RAMS and method statement issue dates and versions.</li>
          <li>CSCS cards for regular operatives and their expiry dates.</li>
          <li>Training certificates for high‑risk activities.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          For a full checklist of documents to collect, see the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            Subcontractor Compliance Checklist for UK contractors
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          The limitations of spreadsheet‑based document trackers
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Spreadsheets are flexible, but they were not designed to be long‑term compliance systems. Common issues
          include:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Multiple versions of the truth as different people maintain their own copies.</li>
          <li>No built‑in reminders when expiry dates are approaching.</li>
          <li>Links to files that break when folders are reorganised.</li>
          <li>Limited audit trail when clients ask who checked what and when.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          As your subcontractor base grows, these pain points increase and it becomes harder to give a confident answer
          when someone asks, “Are we covered if something happens today?”
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Moving from spreadsheets to a dedicated subcontractor document tracker
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          A dedicated tracker for subcontractor documents should do more than store information; it should actively help
          you stay compliant. Look for systems that:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Link documents directly to each subcontractor profile and trade.</li>
          <li>Support different document types such as insurance, RAMS, CSCS cards and training.</li>
          <li>Automatically calculate which documents are current, expiring soon or expired.</li>
          <li>Send reminders to subcontractors ahead of expiry dates.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          The less time your team spends updating spreadsheets, the more time they can spend working with subcontractors
          to improve standards on site.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant works as a subcontractor document tracker
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant is built specifically to replace manual subcontractor trackers for UK contractors:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Invite subcontractors via magic link to upload all required documents in one go.</li>
          <li>
            Store insurance, RAMS, CSCS cards and training records against a reusable subcontractor profile (a
            “compliance passport”).
          </li>
          <li>Automatically flag missing, expiring and expired documents.</li>
          <li>Use dashboards and risk scores to prioritise where to focus attention.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Instead of asking, “Which spreadsheet is correct?”, you work from a single source of truth that updates itself
          as subcontractors upload new documents.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          To design your tracker fields and requirements, start with the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            UK Subcontractor Compliance Checklist
          </Link>
          .
        </p>
      </section>

      <SeoCta />
    </main>
  )
}

