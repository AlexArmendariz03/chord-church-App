// Slows down password guessing: after MAX_FAILURES wrong attempts for the same user or IP,
// login is blocked for the rest of the window. Kept in memory, so each server instance counts on its own.

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000

type Attempts = { count: number; resetAt: number }

const failures = new Map<string, Attempts>()

const keysFor = (username: string, ip: string) => [`user:${username}`, `ip:${ip}`]

const current = (key: string) => {
  const entry = failures.get(key)
  if (entry && entry.resetAt <= Date.now()) {
    failures.delete(key)
    return undefined
  }
  return entry
}

// Minutes until the user can try again, or 0 when not blocked
export function blockedMinutes(username: string, ip: string): number {
  const blocked = keysFor(username, ip)
    .map(current)
    .filter((entry): entry is Attempts => Boolean(entry && entry.count >= MAX_FAILURES))
  if (!blocked.length) return 0
  const resetAt = Math.max(...blocked.map(entry => entry.resetAt))
  return Math.ceil((resetAt - Date.now()) / 60000)
}

export function recordFailure(username: string, ip: string) {
  for (const key of keysFor(username, ip)) {
    const entry = current(key)
    if (entry) entry.count++
    else failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS })
  }
}

export function clearFailures(username: string, ip: string) {
  for (const key of keysFor(username, ip)) failures.delete(key)
}

export const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
