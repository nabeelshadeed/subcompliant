import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Subcontractor Insurance Requirements UK | Contractor Checklist',
  description:
    'Learn which insurance policies UK subcontractors must hold, typical cover levels, and how contractors should collect and track insurance certificates.',
  openGraph: {
    title: 'Subcontractor Insurance Requirements UK | Contractor Checklist',
    description:
      'Detailed overview of UK subcontractor insurance requirements, including public liability, employers liability and professional indemnity for contractors.',
    url: 'https://subcompliant.com/subcontractor-insurance-requirements',
    type: 'article',
  },
}

export default function SubcontractorInsuranceRequirementsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Subcontractor insurance · UK
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          Subcontractor Insurance Requirements for UK Contractors
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          Insurance is one of the most important parts of subcontractor compliance. This guide explains which policies
          UK subcontractors are expected to hold and how contractors can collect and monitor insurance certificates
          effectively.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Why subcontractor insurance matters to main contractors
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          When you engage a subcontractor, you are relying on their insurance to respond if their work causes damage,
          injury or financial loss. Clients and principal contractors will expect you to demonstrate that your supply
          chain has adequate cover in place and that policies are kept up to date.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          Poor control over insurance documentation leaves contractors exposed to uninsured losses and disputes with
          clients or insurers, especially if a policy has lapsed or does not match the subcontractor&apos;s trading
          entity.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Core insurance policies subcontractors should hold
        </h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Public Liability Insurance:</strong> covers claims from third parties for injury or property damage
            arising from the subcontractor&apos;s work. Most contractors specify a minimum indemnity limit (e.g. £2m,
            £5m or more depending on project size).
          </li>
          <li>
            <strong>Employers Liability Insurance:</strong> a legal requirement in most cases where the subcontractor
            employs staff. Verify that the policy is in the correct business name and covers all employees and labour
            only subcontractors where applicable.
          </li>
          <li>
            <strong>Professional Indemnity Insurance (where applicable):</strong> required for subcontractors who design
            or specify works, such as M&amp;E designers or specialist consultants. Pay attention to retroactive dates and
            any exclusions.
          </li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Depending on the trade and project, you may also require specialist policies such as contractors all risks,
          product liability or design and construct covers. These should be clearly specified in your subcontract
          agreements.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          What contractors should check on each insurance certificate
        </h2>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Insured name:</strong> does it match the subcontractor&apos;s legal or trading name in your
            contract?
          </li>
          <li>
            <strong>Policy type and insurer:</strong> is it the correct type of policy with a reputable insurer?
          </li>
          <li>
            <strong>Limit of indemnity:</strong> does the limit meet or exceed the requirement in your subcontract or
            main contract?
          </li>
          <li>
            <strong>Policy period:</strong> check the start and end dates carefully – near‑expiry policies should be
            flagged for follow‑up.
          </li>
          <li>
            <strong>Business description:</strong> does the description of activities on the schedule align with the
            work the subcontractor is doing for you?
          </li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          It is not enough to collect a copy of an insurance certificate once and then file it away. You need a process
          to ensure that cover remains in place throughout the duration of the works.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Tracking subcontractor insurance renewals without spreadsheets
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Many contractors use spreadsheets to log insurance expiries. This can work at small scale, but quickly becomes
          unmanageable when you work with dozens of subcontractors and multiple policies per company. Typical problems
          include:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Expiry dates not being updated when a subcontractor sends a renewed certificate.</li>
          <li>Different project teams keeping their own versions of the truth.</li>
          <li>Last‑minute chases when a client or auditor requests evidence of cover.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          A better approach is to centralise subcontractor insurance alongside other compliance documents. For a full
          list of what to collect from each subcontractor, see the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            Subcontractor Compliance Checklist for UK contractors
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant manages subcontractor insurance for you
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant is designed to take the friction out of collecting and tracking subcontractor insurance:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Invite subcontractors via magic link to upload their insurance certificates directly into the system.</li>
          <li>
            Store public liability, employers liability and professional indemnity alongside CSCS cards, RAMS and
            training records.
          </li>
          <li>Automatically monitor expiry dates and send reminders ahead of renewal.</li>
          <li>Give your team a dashboard view of which subcontractors are fully insured and which need follow‑up.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Rather than chasing documents manually, you define your requirements and SubCompliant handles the collection
          and tracking in the background.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          To put insurance in context with the rest of your compliance process, start with the{' '}
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

