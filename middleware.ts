import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/upload(.*)',
  '/setup',
  '/api/auth/upload-session/(.*)',
  '/api/documents/upload(.*)',
  '/api/webhooks/(.*)',
  '/pricing',
  '/about',
  '/contact',
  '/legal/(.*)',
  '/guides/(.*)',
  '/trades/(.*)',
  '/alternatives/(.*)',
])

// Webhooks are server-to-server — no CORS headers needed or wanted there.
const isWebhookRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith('/api/webhooks/')

const isApiRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith('/api/')

function corsHeaders(req: NextRequest): Record<string, string> {
  // Only reflect the configured app URL, never a wildcard. Falls back to the
  // request origin during local dev when NEXT_PUBLIC_APP_URL may be unset.
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin':      origin,
    'Access-Control-Allow-Methods':     'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age':           '86400',
  }
}

export default clerkMiddleware(async (auth, req) => {
  // Handle OPTIONS preflight for API routes before any auth processing.
  // Webhooks never need CORS — they are called from Stripe/Clerk servers.
  if (req.method === 'OPTIONS' && isApiRoute(req) && !isWebhookRoute(req)) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) })
  }

  if (!isPublicRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/auth/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Attach CORS headers to all non-webhook API responses.
  if (isApiRoute(req) && !isWebhookRoute(req)) {
    const res = NextResponse.next()
    const h = corsHeaders(req)
    Object.entries(h).forEach(([k, v]) => res.headers.set(k, v))
    return res
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
