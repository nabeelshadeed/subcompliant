import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactSubmission } from '@/lib/resend'

export const dynamic = 'force-dynamic'

const SUBJECTS = [
  'General enquiry',
  'Technical support',
  'Billing question',
  'Enterprise / Sales',
  'Demo request',
  'Partnership',
] as const

const schema = z.object({
  name:    z.string().min(1, 'Name is required').max(200),
  email:   z.string().email('Invalid email address'),
  subject: z.string().min(1).max(200),
  message: z.string().max(5000).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => e.message).join('; ')
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: msg } }, { status: 400 })
  }

  const { name, email, subject, message } = parsed.data

  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY not set')
    return NextResponse.json(
      { error: { code: 'SERVICE_UNAVAILABLE', message: 'Contact form is temporarily unavailable. Please try again later or email us directly.' } },
      { status: 503 }
    )
  }

  try {
    await sendContactSubmission({
      name:    name.trim(),
      email:   email.trim(),
      subject: subject.trim(),
      message: (message ?? '').trim(),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Send failed:', err)
    return NextResponse.json(
      { error: { code: 'SEND_FAILED', message: 'Failed to send message. Please try again or email us directly.' } },
      { status: 500 }
    )
  }
}
