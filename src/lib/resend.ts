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
