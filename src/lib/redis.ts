import { Redis } from '@upstash/redis'
import crypto from 'crypto'

function getRedis(): Redis {
  return new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export type JobType =
  | 'process_document'
  | 'send_notification'
  | 'calculate_risk_score'
  | 'send_expiry_reminders'
  | 'virus_scan'

export interface Job<T = unknown> {
  id:        string
  type:      JobType
  payload:   T
  createdAt: number
  attempts:  number
}

const QUEUE_KEY        = 'subcompliant:jobs'
const INFLIGHT_KEY     = 'subcompliant:inflight'
const DLQ_KEY          = 'subcompliant:dlq'
const RATE_LIMIT_PREFIX= 'subcompliant:rl'

export async function enqueueJob<T>(type: JobType, payload: T): Promise<string> {
  const job: Job<T> = {
    id:        crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
    attempts:  0,
  }
  await getRedis().lpush(QUEUE_KEY, JSON.stringify(job))
  return job.id
}

export async function dequeueJob(): Promise<Job | null> {
  const raw = await getRedis().lmove(QUEUE_KEY, INFLIGHT_KEY, 'right', 'left')
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : (raw as Job)
}

export async function ackJob(job: Job): Promise<void> {
  await getRedis().lrem(INFLIGHT_KEY, 0, JSON.stringify(job))
}

export async function nackJob(job: Job, error: string): Promise<void> {
  await getRedis().lrem(INFLIGHT_KEY, 0, JSON.stringify(job))
  await getRedis().lpush(DLQ_KEY, JSON.stringify({ ...job, error, failedAt: Date.now() }))
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return getRedis().get<T>(key)
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  await getRedis().set(key, value, { ex: ttlSeconds })
}

export async function cacheDel(key: string): Promise<void> {
  await getRedis().del(key)
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const redis   = getRedis()
  const bucket  = Math.floor(Date.now() / 1000 / windowSeconds)
  const rlKey   = `${RATE_LIMIT_PREFIX}:${key}:${bucket}`
  const current = await redis.incr(rlKey)

  if (current === 1) {
    await redis.expire(rlKey, windowSeconds)
  }

  return {
    allowed:   current <= limit,
    remaining: Math.max(0, limit - current),
  }
}
