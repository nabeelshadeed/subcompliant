import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, requireAdmin, logAudit } from '@/lib/auth/get-auth'
import { db } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest) {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: { code: 'INVALID_BODY', message: 'Invalid JSON body' } }, { status: 400 })

  const { name, website, addressLine1, addressCity, addressPostcode, companiesHouseNo, vatNumber } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return NextResponse.json({ error: { code: 'INVALID_NAME', message: 'Name must be at least 2 characters' } }, { status: 422 })
  }

  const updates: Partial<typeof contractors.$inferInsert> = {}
  if (name !== undefined)             updates.name             = name.trim()
  if (website !== undefined)          updates.website          = website?.trim() || null
  if (addressLine1 !== undefined)     updates.addressLine1     = addressLine1?.trim() || null
  if (addressCity !== undefined)      updates.addressCity      = addressCity?.trim() || null
  if (addressPostcode !== undefined)  updates.addressPostcode  = addressPostcode?.trim() || null
  if (companiesHouseNo !== undefined) updates.companiesHouseNo = companiesHouseNo?.trim() || null
  if (vatNumber !== undefined)        updates.vatNumber        = vatNumber?.trim() || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: { code: 'NO_CHANGES', message: 'No fields to update' } }, { status: 422 })
  }

  updates.updatedAt = new Date()

  await db.update(contractors).set(updates).where(eq(contractors.id, ctx.contractorId))

  logAudit({ contractorId: ctx.contractorId, actorId: ctx.userId, action: 'account.update', payload: updates })

  return NextResponse.json({ ok: true })
}
