import type { Metadata } from 'next'
import Link from 'next/link'
import { SeoCta } from '@/components/marketing/SeoCta'

export const metadata: Metadata = {
  title: 'Security & Privacy Help | SubCompliant Help Centre',
  description:
    'Understand how SubCompliant stores your data in the EU, encrypts documents, implements row-level security, meets UK GDPR requirements, and lets you export your data.',
}

export default function SecurityHelpPage() {
  return (
    <main className="main">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/help">Help Centre</Link>
        <span>›</span>
        <span>Security &amp; Privacy</span>
      </div>

      {/* Header */}
      <div className="doc-header">
        <div className="doc-tag">Security &amp; Privacy</div>
        <h1>Security, privacy and data protection</h1>
        <p className="lead" style={{ textAlign: 'left', maxWidth: '600px', margin: '0' }}>
          Detailed information about how SubCompliant protects your data, meets UK GDPR
          requirements, and gives you full control over your compliance records.
        </p>
      </div>

      {/* Status indicator */}
      <div className="status-box">
        <div className="status-ico">✅</div>
        <div>
          <div className="status-title">All systems operational</div>
          <div className="status-desc">
            SubCompliant infrastructure is running normally. ICO registered. UK GDPR compliant.
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div className="toc">
        <h4>In this guide</h4>
        <ol>
          <li><a href="#data-residency">Data residency and storage location</a></li>
          <li><a href="#encryption">Encryption in transit and at rest</a></li>
          <li><a href="#access">Access control and row-level security</a></li>
          <li><a href="#gdpr">UK GDPR compliance and your rights</a></li>
          <li><a href="#export">Exporting your data</a></li>
        </ol>
      </div>

      {/* Section 1 */}
      <section id="data-residency">
        <h2>Data residency and storage location</h2>
        <p>
          All SubCompliant data — including subcontractor profiles, compliance records, and
          uploaded documents — is stored exclusively in the <strong>European Union (EU-West,
          Ireland)</strong>. We do not store data in the United States or any other
          jurisdiction outside the EEA.
        </p>
        <p>
          We use two primary storage services:
        </p>
        <ul>
          <li>
            <strong>Neon (PostgreSQL)</strong> — stores all structured compliance data
            including subcontractor profiles, document metadata, expiry dates, audit logs,
            and account information. Neon operates on ISO 27001-certified infrastructure in
            EU-West.
          </li>
          <li>
            <strong>Cloudflare R2</strong> — stores all uploaded document files (PDFs,
            images, certificates). R2 EU-West buckets ensure files never leave the EEA.
          </li>
        </ul>
        <p>
          Both services are selected specifically for their UK GDPR data residency compliance.
          We review our infrastructure choices as part of our annual DPIA process to ensure
          continued compliance.
        </p>
        <div className="info-box">
          <p>
            <strong>UK GDPR and Brexit:</strong> Following the UK&apos;s departure from the EU,
            the UK and EU maintain a data adequacy agreement that allows personal data to flow
            freely between the UK and EEA without additional safeguards. Storing data in the
            EU therefore fully meets UK GDPR requirements.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id="encryption" style={{ marginTop: '48px' }}>
        <h2>Encryption in transit and at rest</h2>
        <p>
          SubCompliant applies encryption at every stage of the data lifecycle.
        </p>
        <p>
          <strong>In transit:</strong> All communication between your browser and SubCompliant
          servers uses <strong>TLS 1.3</strong>, the most current and secure version of the
          Transport Layer Security protocol. Older, less secure versions (TLS 1.0, TLS 1.1)
          are explicitly disabled. This applies to all API calls, document uploads, and
          magic-link access.
        </p>
        <p>
          <strong>At rest:</strong> All document files stored in Cloudflare R2 are encrypted
          using <strong>AES-256</strong>, the industry-standard symmetric encryption algorithm.
          Encryption keys are managed by Cloudflare and rotated automatically. Database
          records in Neon Postgres are also encrypted at the storage layer.
        </p>
        <p>
          <strong>Document access:</strong> Documents are never accessible via a public URL.
          Every request to view or download a document generates a scoped, time-limited signed
          URL that expires after 60 minutes. This means that even if a URL were intercepted,
          it would be unusable after a short window.
        </p>
      </section>

      {/* Section 3 */}
      <section id="access" style={{ marginTop: '48px' }}>
        <h2>Access control and row-level security</h2>
        <p>
          SubCompliant implements <strong>row-level security (RLS)</strong> at the PostgreSQL
          database layer. This means that every database query is automatically scoped to the
          authenticated account — it is technically impossible for one account&apos;s data to
          be returned in another account&apos;s query, even in the event of an application-layer
          bug.
        </p>
        <p>
          Within your account, access is controlled by roles:
        </p>
        <ul>
          <li><strong>Owner</strong> — full access including billing and account management.</li>
          <li><strong>Admin</strong> — full operational access; cannot manage billing or delete the account.</li>
          <li><strong>Viewer</strong> — read-only access to subcontractor data and compliance status.</li>
        </ul>
        <p>
          Authentication is handled via Clerk, which provides enterprise-grade identity
          management including multi-factor authentication (MFA). We strongly recommend
          enabling MFA for all Owner and Admin accounts.
        </p>
        <p>
          SubCompliant staff can only access customer data when explicitly required for
          support purposes and with your prior consent. All staff data access is logged and
          auditable. We do not use customer data for any purpose other than providing the
          SubCompliant service.
        </p>
      </section>

      {/* Section 4 */}
      <section id="gdpr" style={{ marginTop: '48px' }}>
        <h2>UK GDPR compliance and your rights</h2>
        <p>
          SubCompliant is registered with the <strong>Information Commissioner&apos;s Office
          (ICO)</strong> as a data controller and operates fully in accordance with the
          <strong> UK General Data Protection Regulation (UK GDPR)</strong> and the Data
          Protection Act 2018.
        </p>
        <p>
          In the context of subcontractor data, SubCompliant acts as a{' '}
          <strong>data processor</strong> on your behalf — you are the data controller for
          your subcontractors&apos; personal information. We sign a{' '}
          <strong>Data Processing Agreement (DPA)</strong> with all Business and Enterprise
          plan customers. If you require a DPA on a lower plan, please contact us.
        </p>
        <p>
          As a data subject, your rights under UK GDPR include:
        </p>
        <ul className="check-list">
          <li>Right of access — request a copy of all personal data we hold about you.</li>
          <li>Right to rectification — request correction of inaccurate personal data.</li>
          <li>Right to erasure — request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
          <li>Right to data portability — receive your data in a machine-readable format.</li>
          <li>Right to object — object to processing of your data for certain purposes.</li>
          <li>Right to restrict processing — limit how we use your data in certain circumstances.</li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@subcompliant.co.uk" style={{ color: 'var(--acc)' }}>
            privacy@subcompliant.co.uk
          </a>
          . We will respond within 30 days in accordance with our obligations under UK GDPR.
        </p>
        <p>
          We maintain a DPIA (Data Protection Impact Assessment) for SubCompliant&apos;s data
          processing activities, which is reviewed annually and whenever we make significant
          changes to how we process personal data.
        </p>
      </section>

      {/* Section 5 */}
      <section id="export" style={{ marginTop: '48px' }}>
        <h2>Exporting your data</h2>
        <p>
          You have full control over your data and can export it at any time — whether you are
          staying with SubCompliant or moving to a different system. We do not lock you in.
        </p>
        <p>
          <strong>Subcontractor data and document metadata</strong> can be exported as a CSV
          from <strong>Settings → Data Export</strong>. The CSV includes subcontractor names,
          contact details, trade types, document types, approval status, expiry dates, and
          the full activity log.
        </p>
        <p>
          <strong>Document files</strong> can be downloaded individually from each
          subcontractor&apos;s profile, or in bulk as a ZIP archive. On Business plans, a
          full supply-chain bulk export is available from the Settings page. Files are named
          by document type and subcontractor name for easy reference.
        </p>
        <p>
          If you cancel your account, you have <strong>90 days</strong> to export all your
          data before it is permanently deleted. After 90 days, deletion is irreversible.
          We will send you a reminder email at 30 days and 7 days before deletion so you are
          not caught unawares.
        </p>
        <div className="info-box">
          <p>
            <strong>Need help exporting?</strong> If you are having trouble exporting your data
            or need a specific format, email{' '}
            <a href="mailto:hello@subcompliant.co.uk" style={{ color: 'var(--acc)' }}>
              hello@subcompliant.co.uk
            </a>{' '}
            and we will assist directly.
          </p>
        </div>
      </section>

      <SeoCta />
    </main>
  )
}
