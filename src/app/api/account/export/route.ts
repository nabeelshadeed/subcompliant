import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth/get-auth'
import { db } from '@/lib/db'
import { subcontractors, subProfiles, complianceDocuments, documentTypes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  // Fetch all subcontractors with their profiles
  const subs = await db
    .select({
      id:          subcontractors.id,
      displayName: subcontractors.displayName,
      status:      subcontractors.status,
      invitedAt:   subcontractors.invitedAt,
      activatedAt: subcontractors.activatedAt,
      firstName:   subProfiles.firstName,
      lastName:    subProfiles.lastName,
      email:       subProfiles.ownerEmail,
      phone:       subProfiles.phone,
      company:     subProfiles.companyName,
    })
    .from(subcontractors)
    .innerJoin(subProfiles, eq(subProfiles.id, subcontractors.profileId))
    .where(eq(subcontractors.contractorId, ctx.contractorId))

  // Fetch all current compliance documents
  const docs = await db
    .select({
      profileId:   complianceDocuments.profileId,
      docType:     documentTypes.name,
      status:      complianceDocuments.status,
      expiresAt:   complianceDocuments.expiresAt,
      submittedAt: complianceDocuments.submittedAt,
    })
    .from(complianceDocuments)
    .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
    .innerJoin(subcontractors, and(
      eq(subcontractors.profileId, complianceDocuments.profileId),
      eq(subcontractors.contractorId, ctx.contractorId),
    ))
    .where(eq(complianceDocuments.isCurrent, true))

  // Build CSV
  const rows: string[] = [
    'Name,Email,Phone,Company,Status,Invited At,Activated At,Documents',
  ]

  for (const sub of subs) {
    const subDocs = docs.filter(d => d.profileId === sub.id)
    const docSummary = subDocs.map(d => `${d.docType}:${d.status}${d.expiresAt ? ':exp=' + new Date(d.expiresAt).toISOString().slice(0,10) : ''}`).join('; ')
    const name = `${sub.firstName} ${sub.lastName}`.trim()
    rows.push([
      csvEscape(sub.displayName || name),
      csvEscape(sub.email),
      csvEscape(sub.phone ?? ''),
      csvEscape(sub.company ?? ''),
      csvEscape(sub.status),
      csvEscape(sub.invitedAt ? new Date(sub.invitedAt).toISOString().slice(0,10) : ''),
      csvEscape(sub.activatedAt ? new Date(sub.activatedAt).toISOString().slice(0,10) : ''),
      csvEscape(docSummary),
    ].join(','))
  }

  const csv = rows.join('\r\n')
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subcompliant-export-${date}.csv"`,
    },
  })
}

function csvEscape(val: string): string {
  // Prevent CSV formula injection: Excel/Sheets treat cells starting with
  // =, +, -, @ as formulas. Prefix with a single quote to neutralise them.
  // The quote is displayed as-is in most spreadsheet apps, making it visible
  // rather than silently stripping it (which could mask the sanitisation).
  if (val.match(/^[=+\-@|]/)) {
    val = "'" + val
  }
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}
