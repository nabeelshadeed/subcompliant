import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'RAMS Template for Subcontractors | UK Construction Guide',
  description:
    'Understand what should go into a RAMS template for UK construction subcontractors, how contractors should review RAMS, and how to keep documents organised.',
  openGraph: {
    title: 'RAMS Template for Subcontractors | UK Construction Guide',
    description:
      'Detailed guide to RAMS (Risk Assessment & Method Statement) templates for subcontractors, including key sections and review tips for UK contractors.',
    url: 'https://subcompliant.com/rams-template',
    type: 'article',
  },
}

export default function RamsTemplatePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          RAMS template · UK construction
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          RAMS Template for UK Subcontractors (Contractor Checklist)
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          RAMS – Risk Assessment &amp; Method Statement – are a core part of subcontractor compliance on UK construction
          projects. This guide explains what a good RAMS template should include and how contractors can review and
          track RAMS effectively.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          What is a RAMS document and why does it matter?
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          A RAMS document combines a task‑specific risk assessment with a clear method statement describing how the work
          will be carried out safely. It is normally provided by the subcontractor and reviewed by the main contractor or
          principal contractor before work starts on site.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          RAMS are a key piece of evidence that your supply chain understands the risks involved and has put suitable
          controls in place. Poor or generic RAMS increase the likelihood of incidents, enforcement action and contract
          disputes after an event.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Essential sections in a RAMS template
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Different organisations have their own formats, but most good RAMS templates for UK construction work include
          the following sections:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Project and company details:</strong> site name, address, client, principal contractor and
            subcontractor details.
          </li>
          <li>
            <strong>Scope of works:</strong> a clear description of the tasks covered by the RAMS and any limitations.
          </li>
          <li>
            <strong>Responsibilities:</strong> who is responsible for supervising the work and implementing controls.
          </li>
          <li>
            <strong>Risk assessment:</strong> identification of hazards, likelihood and severity ratings, and residual
            risk after controls.
          </li>
          <li>
            <strong>Method statement:</strong> step‑by‑step sequence of operations, including equipment, access and
            permits required.
          </li>
          <li>
            <strong>PPE requirements:</strong> specific PPE for the work in addition to your site standard PPE.
          </li>
          <li>
            <strong>Emergency procedures:</strong> how to respond if something goes wrong, including first‑aid and
            communication arrangements.
          </li>
          <li>
            <strong>Sign‑off:</strong> signatures from the subcontractor and, where required, the contractor reviewer.
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How contractors should review subcontractor RAMS
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Contractors are not expected to rewrite every RAMS document, but you should carry out a sensible review before
          work begins:
        </p>
        <ol className="list-decimal pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            Check the RAMS are specific to your project and the actual tasks to be carried out – avoid accepting generic
            “one size fits all” documents.
          </li>
          <li>
            Confirm that high‑risk activities (work at height, lifting operations, hot works, confined spaces etc.) are
            clearly identified with appropriate controls.
          </li>
          <li>
            Ensure that the sequence of works aligns with your overall construction programme and any other trades on
            site.
          </li>
          <li>
            Verify that named supervisors or competent persons are available and appropriately qualified.
          </li>
          <li>
            Check that the document is signed, dated and version‑controlled so you know which revision has been
            approved.
          </li>
        </ol>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Keeping RAMS templates organised across multiple subcontractors
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          On a single project you might be dealing with dozens of RAMS documents from different subcontractors. Many
          contractors still manage these via email folders and network drives, which makes it difficult to answer simple
          questions such as:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Which RAMS have been reviewed and approved?</li>
          <li>Which subcontractors are still working from outdated versions?</li>
          <li>Where is the latest signed copy if an incident occurs?</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          RAMS should be managed alongside other subcontractor compliance documents such as insurance certificates and
          CSCS cards. For a full checklist of what to collect, see the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            Subcontractor Compliance Checklist for UK contractors
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant helps manage RAMS and subcontractor compliance
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant gives contractors a structured way to request and store RAMS from every subcontractor:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Invite subcontractors to upload RAMS and supporting documents via a guided magic link.</li>
          <li>
            Store RAMS alongside insurance, CSCS cards and training records for each subcontractor, with a clear status
            for “current” documents.
          </li>
          <li>Track document dates and set reminders when RAMS need to be updated for new phases of work.</li>
          <li>Give project teams a dashboard view of which subcontractors are fully compliant before work starts.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Instead of hunting through inboxes for RAMS attachments, your team can see the latest approved documents in
          one place and focus on the quality of the content rather than the admin.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          To understand the wider compliance picture, start with the{' '}
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

