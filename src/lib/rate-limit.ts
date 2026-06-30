// Simple in-memory rate limiter — resets on server restart / Vercel cold start
// Good enough for low-traffic apps; upgrade to Upstash Redis for persistent limits
type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Prune stale entries every 500 requests to avoid memory leak
let pruneCounter = 0
function maybePrune() {
  if (++pruneCounter < 500) return
  pruneCounter = 0
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k)
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key    Unique key (e.g. "apply:1.2.3.4")
 * @param limit  Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  maybePrune()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** Extract the real client IP from Vercel/Next.js request headers */
export function getIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
