import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Getting Started with SubCompliant | Help Centre',
  description:
    'Learn how to invite your first subcontractor, set document requirements, add team members, understand the compliance dashboard, and handle rejected documents.',
}

export default function GettingStartedPage() {
  return (
    <main className="main">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/help">Help Centre</Link>
        <span>›</span>
        <span>Getting Started</span>
      </div>

      {/* Header */}
      <div className="doc-header">
        <div className="doc-tag">Getting Started</div>
        <h1>Getting started with SubCompliant</h1>
        <p className="lead" style={{ textAlign: 'left', maxWidth: '600px', margin: '0' }}>
          Everything you need to know to get your subcontractor compliance programme up and
          running — from your first invite to understanding risk scores.
        </p>
      </div>

      {/* Table of contents */}
      <div className="toc">
        <h4>In this guide</h4>
        <ol>
          <li><a href="#invite">How to invite your first subcontractor</a></li>
          <li><a href="#requirements">Setting up document requirements by trade</a></li>
          <li><a href="#team">Adding team members and managing roles</a></li>
          <li><a href="#dashboard">Understanding the compliance dashboard</a></li>
          <li><a href="#rejected">What to do when a document is rejected</a></li>
        </ol>
      </div>

      {/* Section 1 */}
      <section id="invite">
        <h2>How to invite your first subcontractor</h2>
        <p>
          Inviting a subcontractor to SubCompliant takes under two minutes. From your dashboard,
          click <strong>Add Subcontractor</strong> and enter their name, email address, phone
          number (optional), company name, and trade type. Once saved, their profile is created
          and you can immediately send them a magic-link invitation.
        </p>
        <p>
          The magic link is a unique, time-limited URL that arrives in the subcontractor&apos;s
          inbox (or as an SMS if you provided a phone number). When they click it, they land
          directly on a branded upload page — no account creation, no password, no app download
          required. They simply select the documents you&apos;ve requested and upload them in
          one go. The link expires after 7 days by default, but you can resend it at any time
          from the subcontractor&apos;s profile.
        </p>
        <p>
          Once documents are uploaded, you&apos;ll receive an in-app notification and email
          alert. From there, you can review, approve, or reject each document individually.
          Compliance status updates automatically as you process documents — no manual
          calculations needed.
        </p>
        <div className="info-box">
          <p>
            <strong>Tip:</strong> If a subcontractor hasn&apos;t responded within 48 hours,
            use the <strong>Chase</strong> button on their profile to send an automatic
            reminder. The reminder re-uses the same magic link, so there&apos;s nothing new
            for them to find.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id="requirements" style={{ marginTop: '48px' }}>
        <h2>Setting up document requirements by trade</h2>
        <p>
          SubCompliant ships with pre-built document requirement templates for the most common
          UK construction trades. When you assign a trade type to a subcontractor (e.g. Gas
          Safe Engineer, Electrician, Roofer), the system automatically loads the relevant
          template — so you never have to wonder what to request from a plumber versus a
          scaffolder.
        </p>
        <p>
          Templates can be customised at both the account level and the individual subcontractor
          level. To edit a template globally, navigate to <strong>Settings → Document
          Templates</strong>. Add or remove document types, set whether each is mandatory or
          optional, and define whether it carries an expiry date. Changes apply to all future
          subcontractors of that trade type; existing profiles are unaffected unless you
          explicitly re-apply the template.
        </p>
        <p>
          For project-specific requirements — where a particular client demands additional
          documents beyond your standard template — you can add one-off requirements directly
          on the subcontractor&apos;s profile. This is useful when working on frameworks or
          for clients with their own compliance standards (e.g. requiring a specific insurance
          level or a bespoke RAMS format).
        </p>
        <p>
          Each document type has a configurable expiry behaviour. Most certificates (Gas Safe,
          CSCS, public liability insurance) have annual or biennial renewal cycles — SubCompliant
          knows this and will pre-populate suggested expiry dates when a document is uploaded.
          You can override these at any time.
        </p>
      </section>

      {/* Section 3 */}
      <section id="team" style={{ marginTop: '48px' }}>
        <h2>Adding team members and managing roles</h2>
        <p>
          SubCompliant supports three account roles: <strong>Owner</strong>,{' '}
          <strong>Admin</strong>, and <strong>Viewer</strong>. The Owner is typically the person
          who created the account and is the only role that can manage billing, change plan, or
          delete the account. Admins can do everything an Owner can except manage billing — they
          can add and remove subcontractors, send invitations, approve or reject documents, and
          manage document templates. Viewers have read-only access and are useful for project
          managers or clients who need to check compliance status without being able to make
          changes.
        </p>
        <p>
          To invite a team member, go to <strong>Settings → Team</strong> and click{' '}
          <strong>Invite Member</strong>. Enter their email address and select a role. They&apos;ll
          receive an email invitation with a link to set up their access. Pro accounts include
          up to 3 team members; Business accounts include up to 10. Additional seats are
          available on request.
        </p>
        <p>
          You can revoke access at any time from the same settings page. Revoking access
          immediately prevents the team member from logging in — any actions they had taken
          (approvals, rejections, invitations) remain in the audit log for compliance purposes.
        </p>
      </section>

      {/* Section 4 */}
      <section id="dashboard" style={{ marginTop: '48px' }}>
        <h2>Understanding the compliance dashboard</h2>
        <p>
          The compliance dashboard is your central view of all subcontractors and their current
          compliance status. Each subcontractor appears as a row with their name, trade,
          compliance status (Compliant, At Risk, Non-Compliant, or Pending), risk score, and
          the date of their most recent document activity.
        </p>
        <p>
          The <strong>risk score</strong> (Low, Medium, High, Critical) is calculated
          automatically based on three factors: document completeness (what proportion of
          required documents have been uploaded and approved), expiry proximity (how soon any
          approved documents are due to expire), and document type weighting (high-risk
          documents like public liability insurance carry more weight than optional ones like
          DBS checks). Scores update in real time.
        </p>
        <p>
          The dashboard can be filtered by compliance status, trade type, or risk score, and
          sorted by any column. Use the <strong>Export</strong> button to download a CSV
          snapshot of the current view — useful for project handovers or client-facing
          compliance reports. On Pro and Business plans, you can also generate a full PDF
          audit report directly from the dashboard.
        </p>
        <div className="info-box">
          <p>
            <strong>Expiry alerts</strong> appear at the top of the dashboard automatically.
            SubCompliant flags any subcontractor with a document expiring within 30 days,
            so you always know what needs attention before it becomes a problem.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section id="rejected" style={{ marginTop: '48px' }}>
        <h2>What to do when a document is rejected</h2>
        <p>
          When you reject a document during review, you&apos;re prompted to write a short
          reason — for example, &quot;Insurance certificate is out of date&quot; or &quot;RAMS
          does not cover working at height&quot;. This reason is included in the automatic
          email sent to the subcontractor, along with a new magic link so they can re-upload
          the corrected document immediately.
        </p>
        <p>
          Rejected documents remain visible in the subcontractor&apos;s profile under a
          <strong> Rejected</strong> tab, so you have a full audit trail of what was submitted,
          why it was rejected, and when the correct version was eventually accepted. This is
          particularly valuable for HSE audits, where demonstrating a rigorous review process
          can be as important as the documents themselves.
        </p>
        <p>
          If a subcontractor hasn&apos;t re-uploaded a rejected document within 7 days, you
          will receive an automatic reminder alert. You can also manually resend the re-upload
          link from their profile at any time using the <strong>Resend invite</strong> button.
          Compliance status will remain non-compliant for the rejected document type until a
          replacement has been approved.
        </p>
      </section>

      <SeoCta />
    </main>
  )
}
