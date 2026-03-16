import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Subcontractor Compliance Checklist UK | Required Documents for Contractors',
  description:
    'Complete UK subcontractor compliance checklist including CSCS cards, insurance, RAMS and training records. Learn what contractors must collect from subcontractors.',
  openGraph: {
    title: 'Subcontractor Compliance Checklist UK | Required Documents for Contractors',
    description:
      'Step-by-step subcontractor compliance checklist for UK contractors covering identity, CSCS cards, insurance, RAMS and training documentation.',
    url: 'https://subcompliant.com/subcontractor-compliance-checklist-uk',
    type: 'article',
  },
}

export default function SubcontractorComplianceChecklistUkPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          Subcontractor compliance checklist · UK
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          Subcontractor Compliance Checklist for UK Contractors
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          Use this practical subcontractor compliance checklist for UK construction projects to understand exactly which
          documents you should collect, how to verify them, and how to keep on top of expiries across your supply chain.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Why subcontractor compliance is so difficult to manage
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Most UK contractors know they should check CSCS cards, insurance certificates and RAMS, but in practice the
          process is messy. Documents arrive over email, get saved to ad‑hoc folders and spreadsheets, and nobody has
          a single view of which subcontractor is genuinely compliant today.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          The typical site team is trying to juggle:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>CSCS card verification for individual operatives turning up on site</li>
          <li>Insurance certificates for every subcontractor company, often for multiple policy types</li>
          <li>RAMS documentation for each package of work, including method statements and risk assessments</li>
          <li>Training records for high‑risk activities such as working at height or asbestos awareness</li>
          <li>Expiry dates for cards, insurances and certificates that all lapse at different times</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Without a structured approach, important renewals are missed and contractors are exposed to unnecessary risk
          on site and in their contracts.
        </p>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Full subcontractor compliance checklist (UK)
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          The following checklist is designed for UK main contractors and principal contractors who engage
          subcontractors on construction projects. You can adapt it to your own company procedures, but these are the
          core areas every contractor should cover.
        </p>

        <article className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            1. Identity &amp; qualifications
          </h3>
          <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
            <li>
              <strong>CSCS card:</strong> check the card type, occupation and expiry date for each operative. Verify the
              card via the official CSCS card checker or relevant partner schemes.
            </li>
            <li>
              <strong>NVQ or relevant qualifications:</strong> collect evidence of trade qualifications (e.g. NVQ Level
              2/3, apprenticeship certificates, specialist tickets) where required for the role.
            </li>
            <li>
              <strong>Right to work in the UK:</strong> confirm that each worker has the legal right to work, and keep
              evidence of checks in line with Home Office guidance.
            </li>
          </ul>
        </article>

        <article className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            2. Insurance requirements
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Every subcontractor company should provide up‑to‑date insurance certificates with cover levels that meet
            your contract and client requirements.
          </p>
          <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
            <li>
              <strong>Public Liability Insurance:</strong> usually required for all subcontractors. Check the indemnity
              limit, scope of cover and expiry date.
            </li>
            <li>
              <strong>Employers Liability Insurance:</strong> required where the subcontractor employs staff. Confirm
              that the business trading name matches the policy.
            </li>
            <li>
              <strong>Professional Indemnity Insurance (where applicable):</strong> needed for design‑and‑build or
              advisory roles. Verify retroactive dates and limits of indemnity.
            </li>
          </ul>
        </article>

        <article className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            3. Safety documentation
          </h3>
          <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
            <li>
              <strong>RAMS (Risk Assessment &amp; Method Statement):</strong> project‑specific RAMS for each package of
              work, signed and dated, with clear controls and residual risks.
            </li>
            <li>
              <strong>Method statements:</strong> task‑based method statements where separate from main RAMS, especially
              for higher‑risk activities.
            </li>
            <li>
              <strong>Site induction documentation:</strong> evidence that subcontractors and their operatives have
              attended your site induction and understand local rules.
            </li>
          </ul>
        </article>

        <article className="space-y-3">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            4. Training requirements
          </h3>
          <p className="text-sm md:text-base text-gray-700">
            Training expectations vary by trade and task, but the following courses are common on UK construction
            projects.
          </p>
          <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
            <li>
              <strong>Health &amp; Safety awareness:</strong> e.g. CITB Health &amp; Safety Awareness or equivalent,
              particularly for new entrants.
            </li>
            <li>
              <strong>Manual handling:</strong> training in safe lifting techniques and use of mechanical aids.
            </li>
            <li>
              <strong>Working at height:</strong> for any work off the ground, including scaffolding, MEWPs and roof
              work.
            </li>
            <li>
              <strong>Asbestos awareness:</strong> essential where there is any risk of disturbing asbestos‑containing
              materials.
            </li>
          </ul>
        </article>
      </section>

      <section className="space-y-4 mb-10">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Why manual subcontractor compliance breaks down
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Many contractors try to manage all of this with shared email inboxes and spreadsheets. It works for a while,
          but as project volume and subcontractor numbers grow, the admin load quickly becomes unmanageable.
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Spreadsheets get out of date as soon as a new document arrives or a policy renews.</li>
          <li>Documents arrive via email from different people and are saved in inconsistent folder structures.</li>
          <li>No automated reminders are sent when a CSCS card or insurance policy is about to expire.</li>
          <li>Compliance checks that should take minutes end up taking hours before every audit or pre‑start meeting.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          The result is unnecessary risk: non‑compliant subcontractors on site, extra work for the H&amp;S team, and
          poor evidence if something goes wrong.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant helps UK contractors stay on top of subcontractor compliance
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant is built specifically for UK contractors who want a simple way to keep subcontractor compliance
          under control without adding more spreadsheets.
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Invite subcontractors via magic link:</strong> send a branded link that guides subcontractors to
            upload exactly the documents you need for their trade.
          </li>
          <li>
            <strong>Collect compliance documents automatically:</strong> CSCS cards, insurance certificates, RAMS and
            training records are stored against each subcontractor profile.
          </li>
          <li>
            <strong>Track document expiry automatically:</strong> SubCompliant monitors expiry dates and sends reminder
            emails before documents lapse.
          </li>
          <li>
            <strong>See everything in one dashboard:</strong> quickly see which subcontractors are compliant, which
            have missing documents and where your risk sits.
          </li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          You keep control of your compliance standards; SubCompliant does the heavy lifting of chasing and organising
          documents in the background.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          To learn more about specific areas of subcontractor compliance, explore:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-brand-700 space-y-1">
          <li>
            <Link href="/cscs-card-checker" className="hover:underline">
              CSCS card checker for subcontractors
            </Link>
          </li>
          <li>
            <Link href="/rams-template" className="hover:underline">
              RAMS template guidance for UK contractors
            </Link>
          </li>
          <li>
            <Link href="/subcontractor-insurance-requirements" className="hover:underline">
              Subcontractor insurance requirements in the UK
            </Link>
          </li>
          <li>
            <Link href="/subcontractor-document-tracker" className="hover:underline">
              How to track subcontractor documents without spreadsheets
            </Link>
          </li>
        </ul>
      </section>

      <SeoCta />
    </main>
  )
}

