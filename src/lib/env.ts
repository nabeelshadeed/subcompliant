/**
 * Validate required environment variables at startup.
 * Imported by the root layout so that a missing secret surfaces immediately
 * as a build/boot error rather than at the moment a specific feature is used.
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CRON_SECRET',
] as const

// Only validate on the server side — NEXT_PUBLIC_* vars are inlined at build
// time and are always present on the client bundle.
if (typeof window === 'undefined') {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
      'Check your .env.local (dev) or Cloudflare Worker secrets (prod).'
    )
  }
}
