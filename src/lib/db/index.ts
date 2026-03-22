import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as relations from './relations'

const fullSchema = { ...schema, ...relations }
type FullSchema = typeof fullSchema

function getConnectionString(): string {
  // Prefer the pooled URL in production (better for serverless), fall back to base URL
  const url = process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL)
    : process.env.DATABASE_URL
  if (!url?.trim()) {
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'DATABASE_URL is not set. Add it in Cloudflare Workers → Settings → Variables and Secrets.'
        : 'DATABASE_URL is not set. Add it to .env.local.'
    )
  }
  return url
}

let _client: ReturnType<typeof postgres> | null = null
function getClient(): ReturnType<typeof postgres> {
  if (!_client) {
    const connectionString = getConnectionString()
    _client = postgres(connectionString, {
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      // max:1 keeps one connection per Worker isolate — correct for serverless
      max: process.env.NODE_ENV === 'production' ? 1 : 10,
      idle_timeout: 20,
      connect_timeout: 10,
      // Required when using a connection pooler (Neon, PgBouncer in transaction
      // mode): poolers do not support the extended query protocol that prepared
      // statements rely on, so disable them for the pooled production URL.
      prepare: process.env.NODE_ENV !== 'production',
    })
  }
  return _client
}

let _db: PostgresJsDatabase<FullSchema> | null = null
function getDb(): PostgresJsDatabase<FullSchema> {
  if (!_db) {
    _db = drizzle(getClient(), {
      schema: fullSchema,
      logger: process.env.NODE_ENV === 'development',
    })
  }
  return _db
}

export const db = new Proxy({} as PostgresJsDatabase<FullSchema>, {
  get(_, prop) {
    return (getDb() as any)[prop]
  },
})

// Set RLS session variable for tenant isolation (non-transaction version)
// Use this at the start of API route handlers that need RLS enforcement
export async function setTenantContext(contractorId: string): Promise<void> {
  await getClient()`SELECT set_config('app.contractor_id', ${contractorId}, FALSE)`
}
