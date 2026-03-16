import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Construction Compliance Checklist UK | Contractor Responsibilities',
  description:
    'High-level construction compliance checklist for UK contractors, covering subcontractor compliance, health and safety, documentation and ongoing monitoring.',
  openGraph: {
    title: 'Construction Compliance Checklist UK | Contractor Responsibilities',
    description:
      'Structured construction compliance checklist for UK contractors, including subcontractor vetting, documentation, RAMS, training and ongoing monitoring.',
    url: 'https://subcompliant.com/construction-compliance-checklist',
    type: 'article',
  },
}

export default function ConstructionComplianceChecklistPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Construction compliance checklist · UK
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          Construction Compliance Checklist for UK Contractors
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          This construction compliance checklist gives UK contractors a high‑level view of the systems and documents
          required to manage risk across projects, with a focus on subcontractor compliance.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          1. Pre‑qualification and subcontractor vetting
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Before placing orders, contractors should carry out basic due diligence on subcontractor companies:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Company identity and registration checks (Companies House, VAT, UTR).</li>
          <li>Financial stability indicators where appropriate.</li>
          <li>Health and safety track record and any relevant accreditations.</li>
          <li>Confirmation of core insurance policies and minimum cover levels.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          These checks form the foundation of a compliant supply chain and should be backed up by contract clauses that
          set out ongoing obligations for documentation and standards.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          2. Subcontractor documentation and evidence
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Once a subcontractor has been selected, you need to gather and maintain a clear set of documents. At a minimum
          this should include:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Signed subcontract or work order with clear scope and responsibilities.</li>
          <li>Insurance certificates with appropriate cover (public liability, employers liability, PI where needed).</li>
          <li>RAMS and method statements for the works.</li>
          <li>Evidence of competence and training for high‑risk tasks.</li>
          <li>CSCS cards and right to work checks for operatives.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          For a detailed breakdown of subcontractor documentation, see the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            Subcontractor Compliance Checklist for UK contractors
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          3. Health and safety management on site
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Construction compliance is closely tied to effective health and safety management. Contractors should ensure
          that:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Site rules and induction processes are clearly documented and consistently applied.</li>
          <li>RAMS are reviewed before work starts and kept up to date as the project changes.</li>
          <li>Toolbox talks and refresher training are delivered and recorded where appropriate.</li>
          <li>Supervision arrangements are proportionate to the risks involved.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Good documentation alone is not enough – you also need evidence that procedures are being followed in practice.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          4. Ongoing monitoring and document expiry control
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Compliance is not a one‑off exercise at the start of a project. Documents and circumstances change over time:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Insurance policies renew annually and may change insurer or level of cover.</li>
          <li>CSCS cards and training certificates expire or are upgraded.</li>
          <li>RAMS need to be updated as methods or risks evolve.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Spreadsheets and shared drives make it difficult to stay on top of these expiries across multiple projects.
          Many contractors now use dedicated subcontractor compliance tools to monitor dates and trigger reminders.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant supports construction compliance for UK contractors
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant focuses specifically on the subcontractor part of your construction compliance duties:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            Centralise subcontractor profiles with insurance, RAMS, CSCS cards and training records stored in one place.
          </li>
          <li>
            Invite subcontractors via magic link to upload documents themselves, reducing email chasing for your team.
          </li>
          <li>Automatically track document expiries and send reminder emails ahead of key dates.</li>
          <li>Use a dashboard to see which subcontractors are fully compliant and which need attention.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          By tightening your subcontractor compliance process, you strengthen your overall construction compliance
          position and free up project teams to focus on delivery.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          For a more detailed list of subcontractor‑specific requirements, read the{' '}
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

