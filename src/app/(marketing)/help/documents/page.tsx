import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Documents & Compliance Help | SubCompliant Help Centre',
  description:
    'Learn what documents to collect from subcontractors, how expiry reminders work, how to approve and reject documents, and how bulk uploads are handled.',
}

export default function DocumentsHelpPage() {
  return (
    <main className="main">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/help">Help Centre</Link>
        <span>›</span>
        <span>Documents &amp; Compliance</span>
      </div>

      {/* Header */}
      <div className="doc-header">
        <div className="doc-tag">Documents &amp; Compliance</div>
        <h1>Managing documents and compliance</h1>
        <p className="lead" style={{ textAlign: 'left', maxWidth: '600px', margin: '0' }}>
          Everything you need to know about collecting, reviewing, tracking, and managing
          subcontractor compliance documents on SubCompliant.
        </p>
      </div>

      {/* Table of contents */}
      <div className="toc">
        <h4>In this guide</h4>
        <ol>
          <li><a href="#what-to-collect">What documents should I collect?</a></li>
          <li><a href="#expiry-reminders">How expiry reminders work</a></li>
          <li><a href="#review">Approving and rejecting documents</a></li>
          <li><a href="#magic-link">How magic-link upload works</a></li>
          <li><a href="#bulk">Handling multiple documents at once</a></li>
        </ol>
      </div>

      {/* Section 1 */}
      <section id="what-to-collect">
        <h2>What documents should I collect?</h2>
        <p>
          The documents you collect will depend on the trade type and the requirements of the
          projects or clients you are working with. SubCompliant includes pre-built templates
          for the most common UK construction trades. Below is a comprehensive list of document
          types the platform supports:
        </p>

        <div className="docs-grid">
          {[
            { name: 'Public Liability Insurance', note: 'Typically £1m–£10m cover required. Annual renewal.' },
            { name: 'Employers Liability Insurance', note: 'Mandatory for employers. Must show at least £5m cover.' },
            { name: 'Professional Indemnity Insurance', note: 'Required for design-and-build or consulting trades.' },
            { name: 'CSCS Card', note: 'Confirms health and safety training for site access.' },
            { name: 'Gas Safe Registration', note: 'Mandatory for all gas work in the UK. Annual renewal.' },
            { name: 'NICEIC / NAPIT Certificate', note: 'Scheme membership for electrical contractors.' },
            { name: 'RAMS', note: 'Risk assessments & method statements. Project-specific.' },
            { name: 'CIS Registration', note: 'Construction Industry Scheme registration number.' },
            { name: 'UTR Number', note: 'Unique Taxpayer Reference for self-employed subcontractors.' },
            { name: 'Right-to-Work Documentation', note: 'Passport, visa, or share code for non-UK nationals.' },
            { name: 'Asbestos Awareness Certificate', note: 'Required for anyone likely to disturb asbestos.' },
            { name: 'Working at Height Certificate', note: 'Evidence of competency for elevated work.' },
            { name: 'IPAF Licence', note: 'Powered Access Licence for MEWPs and scissor lifts.' },
            { name: 'PASMA Card', note: 'Mobile access tower competency card.' },
            { name: 'DBS Check', note: 'Disclosure & Barring Service check where required.' },
          ].map(doc => (
            <div key={doc.name} className="doc-card">
              <div className="doc-ico">📋</div>
              <div className="doc-name">{doc.name}</div>
              <div className="doc-note">{doc.note}</div>
            </div>
          ))}
        </div>

        <p>
          In addition to the above, you can create <strong>custom document types</strong> from
          your Settings page. Custom types support the same expiry tracking, reminders, and
          review workflow as built-in types.
        </p>
      </section>

      {/* Section 2 */}
      <section id="expiry-reminders" style={{ marginTop: '48px' }}>
        <h2>How expiry reminders work</h2>
        <p>
          Every approved document with an expiry date is automatically monitored by
          SubCompliant&apos;s reminder engine. Reminders are sent at five intervals before the
          expiry date: <strong>30 days, 14 days, 7 days, 3 days, and 1 day</strong>. Each
          reminder is sent both to you (the account holder) and, if enabled, directly to the
          subcontractor.
        </p>
        <p>
          Reminders to you arrive via in-app notification and email. The email includes a
          direct link to the subcontractor&apos;s profile so you can take action immediately.
          Reminders to the subcontractor include a branded magic link pre-loaded with the
          expiring document type, so they can upload a renewal in one click without needing
          to remember any login details.
        </p>
        <p>
          You can configure which reminders are sent to subcontractors from{' '}
          <strong>Settings → Notifications</strong>. Some contractors prefer to manage all
          chasing themselves; others prefer to let SubCompliant handle subcontractor
          communications automatically.
        </p>
        <p>
          When a document expires, its status changes to <strong>Expired</strong> immediately.
          The subcontractor&apos;s overall compliance status updates to Non-Compliant (unless
          the expired document was optional), and you receive a critical alert. The dashboard
          flags all subcontractors with expired documents at the top of the list.
        </p>
        <div className="info-box">
          <p>
            <strong>Important:</strong> Expiry reminders are based on the expiry date recorded
            when the document was approved. Always verify the expiry date on the certificate
            during review before approving.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section id="review" style={{ marginTop: '48px' }}>
        <h2>Approving and rejecting documents</h2>
        <p>
          When a subcontractor uploads documents via their magic link, they appear in your
          <strong> Review Queue</strong> — accessible from the main navigation and from each
          subcontractor&apos;s profile. Uploaded documents are never automatically approved;
          every document requires a manual review to ensure it meets your requirements.
        </p>
        <p>
          During review you can open a full-screen preview of the document, check the document
          type, verify the expiry date, and confirm the document matches the subcontractor&apos;s
          details. Once satisfied, click <strong>Approve</strong>. The document moves to
          Approved status, the expiry date is saved, and reminder scheduling begins immediately.
        </p>
        <p>
          If a document does not meet your requirements — it is illegible, out of date, the
          wrong document type, or covers insufficient value — click <strong>Reject</strong> and
          enter a clear written reason. Writing good rejection feedback helps subcontractors
          resubmit correctly first time:
        </p>
        <ul>
          <li>Be specific: &quot;Insurance certificate expired January 2025 — please upload a current certificate.&quot;</li>
          <li>Explain what you need: &quot;RAMS does not mention working at height — please revise and resubmit.&quot;</li>
          <li>Avoid vague rejections: &quot;Not acceptable&quot; gives the subcontractor no guidance.</li>
        </ul>
        <p>
          On rejection, the subcontractor automatically receives an email with your feedback
          and a new magic link to re-upload. The rejected document and your reason are stored
          in the audit log permanently.
        </p>
      </section>

      {/* Section 4 */}
      <section id="magic-link" style={{ marginTop: '48px' }}>
        <h2>How magic-link upload works for subcontractors</h2>
        <p>
          SubCompliant is designed so that subcontractors never need to create an account or
          remember a password. When you invite a subcontractor, they receive an email (or SMS)
          containing a personalised magic link. This link is unique to them and pre-loaded
          with the document requirements you have set.
        </p>
        <p>
          Clicking the link takes them directly to a branded upload page that shows your
          company name and logo (configured in Settings). The page lists each required document
          with a description of what is needed. Subcontractors simply tap or click each
          document type, select the file from their device, and hit submit. The entire process
          typically takes under five minutes.
        </p>
        <p>
          Magic links expire after 7 days by default for security reasons. If a subcontractor
          has not responded, use the <strong>Resend Invite</strong> button on their profile
          to generate a fresh link. Each resend also creates a new entry in the activity log,
          so you can demonstrate that you actively chased compliance.
        </p>
        <p>
          Subcontractors can return to the same magic link multiple times during its validity
          period. If they only have some documents to hand, they can upload what they have
          and return later to upload the remainder — each upload immediately appears in your
          review queue.
        </p>
      </section>

      {/* Section 5 */}
      <section id="bulk" style={{ marginTop: '48px' }}>
        <h2>Handling multiple documents at once</h2>
        <p>
          When you are onboarding several subcontractors simultaneously — for example at the
          start of a new project — SubCompliant&apos;s bulk features can save significant time.
          From the <strong>Subcontractors</strong> page, use <strong>Bulk Import</strong> to
          upload a CSV containing subcontractor names, email addresses, phone numbers, company
          names, and trade types. The system creates profiles for each and queues invitation
          emails to be sent immediately or on a schedule you choose.
        </p>
        <p>
          Once documents begin arriving, the Review Queue shows all pending documents across
          all subcontractors in a single list. You can filter by document type, subcontractor,
          or upload date. Batch approval is available for straightforward document types where
          you are confident in the submissions — select multiple documents and approve them in
          one action. Batch rejection is intentionally not supported, as each rejection should
          include tailored feedback.
        </p>
        <p>
          For downloading documents in bulk — for example to hand over to a client or for an
          audit pack — navigate to the subcontractor&apos;s profile and click{' '}
          <strong>Download All Documents</strong>. This generates a ZIP file containing all
          approved documents, named by document type for easy reference. On Business plans,
          bulk download is available across your entire supply chain from the Settings page.
        </p>
      </section>

      <SeoCta />
    </main>
  )
}
