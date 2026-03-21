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
      // API routes should return 401, not redirect
      if (isApiRoute(req)) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
      }
      const signInUrl = new URL('/auth/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Let Clerk's middleware fall through naturally — do NOT return NextResponse.next()
  // here for API routes, as it overwrites Clerk's injected auth headers in Workers.
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
