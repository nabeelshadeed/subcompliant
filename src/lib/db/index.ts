import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import * as relations from './relations'

const fullSchema = { ...schema, ...relations }
type FullSchema = typeof fullSchema

// Use pooled connection for serverless (pgBouncer-compatible)
const connectionString = process.env.NODE_ENV === 'production'
  ? process.env.DATABASE_URL_POOLED!
  : process.env.DATABASE_URL!

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db: PostgresJsDatabase<FullSchema> = drizzle(client, {
  schema: fullSchema,
  logger: process.env.NODE_ENV === 'development',
})

// Set RLS session variable for tenant isolation (non-transaction version)
// Use this at the start of API route handlers that need RLS enforcement
export async function setTenantContext(contractorId: string): Promise<void> {
  await client`SELECT set_config('app.contractor_id', ${contractorId}, FALSE)`
}
