import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'CSCS Card Checker | Verify Construction Skills Certification Scheme Cards',
  description:
    'Check and verify CSCS cards used on UK construction sites. Learn how contractors confirm worker qualifications and site access requirements.',
  openGraph: {
    title: 'CSCS Card Checker | Verify Construction Skills Certification Scheme Cards',
    description:
      'Guide for UK contractors on checking and verifying CSCS cards, including card types, online checks, expiry tracking and subcontractor compliance.',
    url: 'https://subcompliant.com/cscs-card-checker',
    type: 'article',
  },
}

export default function CscsCardCheckerPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          CSCS card checker · UK subcontractors
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
          CSCS Card Checker for UK Contractors
        </h1>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl">
          Every subcontractor operative on a UK construction site should hold the correct CSCS card. This guide explains
          how contractors can check cards properly, avoid common mistakes and keep on top of renewals across live
          projects.
        </p>
      </header>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          What is a CSCS card?
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          The Construction Skills Certification Scheme (CSCS) card is widely recognised across the UK construction
          industry as proof that an individual has the appropriate training and qualifications for the job they perform
          on site. It is not a legal requirement in itself, but most principal contractors and clients insist that
          workers hold the right CSCS or affiliated card before they are allowed on to a live construction site.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          For contractors, CSCS cards are a practical way to demonstrate that you have exercised due diligence when
          controlling access to site. By checking that each worker&apos;s card matches their role and has not expired,
          you reduce the likelihood of untrained labour carrying out safety‑critical tasks and strengthen your position
          if something goes wrong.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          Subcontractor workforces are fluid – people switch employers, change occupations and renew their cards at
          different times. Without a clear CSCS card checker process, expired or incorrect cards can easily slip through
          the net, especially on busy projects with multiple gates and shifts.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How contractors check CSCS cards in practice
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          Whether you are checking cards manually at the gate, using a tablet on induction, or via a digital access
          control system, you should verify the same core information every time:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Card type and colour:</strong> does it match the level of responsibility (labourer, skilled worker,
            supervisor, manager etc.)?
          </li>
          <li>
            <strong>Occupation or job title:</strong> is the occupation printed on the card appropriate for the work
            they are actually doing on your site?
          </li>
          <li>
            <strong>Expiry date:</strong> has the card expired or is it close to expiry? Short‑dated cards may need
            closer monitoring.
          </li>
          <li>
            <strong>Photo and name:</strong> does the card clearly belong to the person presenting it?
          </li>
          <li>
            <strong>Card number:</strong> use this to perform an online CSCS card check when required.
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How to check CSCS card validity step by step
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          CSCS and affiliated partner schemes provide online tools and mobile apps that let you confirm the validity of
          a card directly from the source. A simple contractor process might look like this:
        </p>
        <ol className="list-decimal pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Capture the CSCS card number and worker name from the front of the card.</li>
          <li>Use the official CSCS online checker or approved partner app to look up the card.</li>
          <li>
            Confirm that the name, occupation, card type and expiry date shown in the system match the physical card and
            the role the worker will perform on site.
          </li>
          <li>Record that a check has been performed, who carried it out and the date of the check.</li>
        </ol>
        <p className="text-sm md:text-base text-gray-700">
          For subcontractor operatives who attend regularly, you do not want to repeat the same manual checks every
          week. Instead, aim to centralise CSCS information alongside other subcontractor compliance documents so it can
          be monitored across all live projects and upcoming expiries can be picked up automatically.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          Failing to verify CSCS cards properly increases the risk of unqualified workers carrying out safety‑critical
          tasks, weakens your position with regulators and can undermine the strength of your insurance in the event of
          a claim.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          CSCS card types contractors should know
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          CSCS cards come in different colours and types to reflect the holder&apos;s level of competence and
          responsibility. Some of the most common cards seen on UK construction sites include:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <strong>Labourer card (green):</strong> for workers carrying out basic site labouring duties. Usually linked
            to entry‑level health and safety training.
          </li>
          <li>
            <strong>Skilled worker card (blue or gold):</strong> for operatives who hold an NVQ or equivalent
            qualification in their trade (e.g. carpenter, electrician, bricklayer).
          </li>
          <li>
            <strong>Advanced craft card:</strong> for highly skilled tradespeople who have achieved an advanced NVQ or
            equivalent and often take on more complex tasks.
          </li>
          <li>
            <strong>Supervisor card:</strong> for individuals with responsibility for supervising others, often linked
            to supervisory qualifications.
          </li>
          <li>
            <strong>Manager card (black):</strong> for site managers and project managers with higher‑level
            qualifications and responsibilities.
          </li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          As part of your CSCS card checker process, make sure the card type matches the worker&apos;s actual duties.
          For example, a labourer card is unlikely to be appropriate for someone supervising lifting operations or
          managing a site.
        </p>
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mt-4">
          Common mistakes when checking CSCS cards
        </h3>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Only checking cards on the first visit and not tracking future expiries.</li>
          <li>Accepting any valid CSCS card, even if the occupation does not match the work being done.</li>
          <li>Relying on gate staff to spot issues without giving them clear rules or a checklist.</li>
          <li>Storing CSCS card photos in emails or shared folders with no central oversight.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          These problems are amplified when you work with dozens of subcontractor companies. A more systematic approach
          is needed to manage CSCS data alongside other compliance requirements such as insurance and RAMS, ideally as
          part of a single subcontractor compliance system.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Managing CSCS cards as part of a wider subcontractor compliance checklist
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          CSCS cards are one part of a broader compliance picture. For each subcontractor you should also be collecting
          and tracking:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Company insurance certificates (public liability, employers liability, professional indemnity).</li>
          <li>RAMS and method statements for the work package.</li>
          <li>Training records for high‑risk activities.</li>
          <li>Right to work and identity checks.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          To see how CSCS card checks fit into a complete workflow, read the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            Subcontractor Compliance Checklist for UK contractors
          </Link>
          , along with related guides on{' '}
          <Link href="/subcontractor-insurance-requirements" className="text-brand-700 hover:underline">
            subcontractor insurance requirements
          </Link>{' '}
          and the{' '}
          <Link href="/construction-compliance-checklist" className="text-brand-700 hover:underline">
            construction compliance checklist
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          How SubCompliant helps track CSCS cards and other subcontractor documents
        </h2>
        <p className="text-sm md:text-base text-gray-700">
          SubCompliant gives contractors a single place to manage subcontractor compliance, including CSCS card data:
        </p>
        <ul className="list-disc pl-5 text-sm md:text-base text-gray-700 space-y-1">
          <li>Invite subcontractors to upload CSCS card photos and details via a self‑service magic link.</li>
          <li>Store CSCS information alongside insurance, RAMS and training records for each subcontractor profile.</li>
          <li>Track expiries and receive reminders when cards are due for renewal.</li>
          <li>See at a glance which subcontractors are fully compliant and which are missing documentation.</li>
        </ul>
        <p className="text-sm md:text-base text-gray-700">
          Instead of chasing individual emails, you work from a live dashboard that shows the compliance status of your
          entire supply chain.
        </p>
        <p className="text-sm md:text-base text-gray-700">
          For a broader view of what to collect from subcontractors, visit the{' '}
          <Link href="/subcontractor-compliance-checklist-uk" className="text-brand-700 hover:underline">
            UK Subcontractor Compliance Checklist
          </Link>
          .
        </p>
      </section>

      <section className="mt-10 border-t border-gray-200 pt-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl px-6 py-6 md:px-8 md:py-7 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold">
              Stop manually checking subcontractor compliance.
            </h2>
            <p className="mt-1 text-sm text-brand-50 max-w-xl">
              SubCompliant collects CSCS cards and compliance documents automatically so you always know who is qualified
              to work on site.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-brand-700 text-sm font-semibold shadow-sm hover:bg-brand-50 transition-colors"
            >
              Start Managing Compliance
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

