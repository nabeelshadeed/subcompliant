import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const FROM = () => `${process.env.EMAIL_FROM_NAME ?? 'SubCompliant'} <${process.env.EMAIL_FROM ?? 'noreply@subcompliant.co.uk'}>`

export async function sendMagicLinkInvite(params: {
  to:             string
  subName:        string
  contractorName: string
  magicLink:      string
  customMessage?: string
  expiresAt:      Date
  requiredDocs:   string[]
}) {
  const docsHtml = params.requiredDocs.map(d => `<li style="margin:4px 0">${d}</li>`).join('')
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `${params.contractorName} requests your compliance documents`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#0074c5;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">SubCompliant</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${params.subName},</p>
          <p><strong>${params.contractorName}</strong> has requested your compliance documents via SubCompliant.</p>
          ${params.customMessage ? `<blockquote style="border-left:4px solid #0074c5;padding-left:16px;margin:16px 0;color:#555">${params.customMessage}</blockquote>` : ''}
          <p>Required documents:</p>
          <ul style="color:#374151">${docsHtml}</ul>
          <div style="text-align:center;margin:32px 0">
            <a href="${params.magicLink}" style="background:#0074c5;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
              Upload My Documents
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">
            This link expires on ${params.expiresAt.toLocaleDateString('en-GB', { dateStyle: 'long' })}.<br>
            If you have questions, reply to this email.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendExpiryWarning(params: {
  to:            string
  subName:       string
  docTypeName:   string
  expiresAt:     Date
  daysRemaining: number
  uploadLink:    string
}) {
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `⚠️ ${params.docTypeName} expires in ${params.daysRemaining} days`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#d97706;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Document Expiry Warning</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${params.subName},</p>
          <p>Your <strong>${params.docTypeName}</strong> expires on 
             <strong>${params.expiresAt.toLocaleDateString('en-GB', { dateStyle: 'long' })}</strong> 
             (${params.daysRemaining} days).</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${params.uploadLink}" style="background:#d97706;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
              Upload Renewal
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendDocumentApproved(params: {
  to:          string
  subName:     string
  docTypeName: string
  reviewNotes?: string
}) {
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `✅ ${params.docTypeName} approved`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#16a34a;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Document Approved</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${params.subName}, your <strong>${params.docTypeName}</strong> has been approved.</p>
          ${params.reviewNotes ? `<p><em>${params.reviewNotes}</em></p>` : ''}
        </div>
      </div>
    `,
  })
}

export async function sendDocumentRejected(params: {
  to:             string
  subName:        string
  docTypeName:    string
  rejectedReason: string
  reuploadLink:   string
}) {
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `❌ ${params.docTypeName} rejected – action required`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#dc2626;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Document Rejected</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${params.subName}, your <strong>${params.docTypeName}</strong> was rejected.</p>
          <p><strong>Reason:</strong> ${params.rejectedReason}</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${params.reuploadLink}" style="background:#dc2626;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
              Upload Correct Document
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Send contact form submission to the team and optional auto-reply to the user */
export async function sendContactSubmission(params: {
  name:    string
  email:   string
  subject: string
  message: string
}) {
  const to = process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || 'noreply@subcompliant.co.uk'
  const safeSubject = escapeHtml(params.subject)
  const safeMessage = escapeHtml(params.message).replace(/\n/g, '<br>')
  const safeName    = escapeHtml(params.name)
  const safeEmail   = escapeHtml(params.email)

  return getResend().emails.send({
    from:      FROM(),
    to:        to,
    reply_to:  params.email,
    subject: `[Contact] ${params.subject} — ${params.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#0A0A0A;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">New contact form submission</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
          <div style="white-space:pre-wrap">${safeMessage || '(No message)'}</div>
        </div>
      </div>
    `,
  })
}

export async function sendTrialExpiring(params: {
  to:         string
  firstName:  string
  daysLeft:   number
  upgradeUrl: string
}) {
  const urgency = params.daysLeft <= 1 ? 'Your trial ends today' : `${params.daysLeft} days left in your trial`
  const colour  = params.daysLeft <= 1 ? '#dc2626' : params.daysLeft <= 3 ? '#d97706' : '#0074c5'
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `⏰ ${urgency} — keep your subcontractors compliant`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:${colour};padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">SubCompliant</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${escapeHtml(params.firstName)},</p>
          <p><strong>${urgency}.</strong></p>
          <p>Your subcontractors are relying on you to keep their compliance in order. Don't let your trial expire and lose visibility over expiring documents.</p>
          <p>With SubCompliant you get:</p>
          <ul style="color:#374151;padding-left:20px">
            <li style="margin:6px 0">Automatic expiry alerts at 30, 14, 7, 3 and 1 days</li>
            <li style="margin:6px 0">Magic-link document collection (98% response rate)</li>
            <li style="margin:6px 0">Real-time risk scores for every subcontractor</li>
            <li style="margin:6px 0">One-click HSE audit reports</li>
          </ul>
          <div style="text-align:center;margin:32px 0">
            <a href="${params.upgradeUrl}" style="background:#CCFF00;color:#0A0A0A;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block;font-size:16px">
              Upgrade Now — From £39/mo →
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">30-day money-back guarantee. Cancel anytime. No long-term contract.</p>
          <p style="color:#6b7280;font-size:13px">Questions? Reply to this email or visit <a href="https://subcompliant.co.uk/help" style="color:#0074c5">our Help Centre</a>.</p>
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(params: {
  to:              string
  firstName:       string
  contractorName:  string
  dashboardUrl:    string
}) {
  return getResend().emails.send({
    from: FROM(),
    to:   params.to,
    subject: `Welcome to SubCompliant — let's get your first subcontractor set up`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#0A0A0A;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#CCFF00;margin:0;font-size:22px">SubCompliant</h1>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${escapeHtml(params.firstName)},</p>
          <p>Welcome to SubCompliant! Your account for <strong>${escapeHtml(params.contractorName)}</strong> is ready.</p>
          <p>Here's how to get set up in under 10 minutes:</p>
          <ol style="color:#374151;padding-left:20px">
            <li style="margin:8px 0"><strong>Add a subcontractor</strong> — enter their name and email from your dashboard</li>
            <li style="margin:8px 0"><strong>Send a magic-link invite</strong> — they upload their documents in 2 minutes, no account needed</li>
            <li style="margin:8px 0"><strong>Approve their documents</strong> — review and approve from the documents tab</li>
            <li style="margin:8px 0"><strong>Watch your compliance score update</strong> — SubCompliant handles expiry monitoring from here</li>
          </ol>
          <div style="text-align:center;margin:32px 0">
            <a href="${params.dashboardUrl}" style="background:#CCFF00;color:#0A0A0A;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block;font-size:16px">
              Go to Dashboard →
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px">Your 14-day free trial includes full Pro features. No credit card needed.</p>
          <p style="color:#6b7280;font-size:13px">Any questions? Reply to this email — we reply within 4 hours Mon–Fri.</p>
        </div>
      </div>
    `,
  })
}
