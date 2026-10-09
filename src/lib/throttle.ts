/**
 * In-memory login throttle for the Aslan CDC Management Software.
 *
 * PURPOSE: Prevent brute-force password guessing on the login endpoint.
 * Tracks failed attempts per identifier (username/email, lowercased).
 *
 * ⚠ LIMITATIONS (documented intentionally):
 *  - This store is per-process. In a multi-process or multi-instance
 *    deployment (PM2 clusters, Kubernetes pods) each instance has its own
 *    counter — a distributed attacker can bypass per-instance limits.
 *  - For a production multi-instance deployment, replace with a
 *    shared store (e.g., Redis INCR with TTL via ioredis).
 *  - Memory is reclaimed automatically when the entry expires, but the
 *    Map itself grows until cleanup runs.
 *
 * POLICY:
 *  - After MAX_ATTEMPTS consecutive failures within WINDOW_MS, the identifier
 *    is blocked for LOCKOUT_MS milliseconds.
 *  - A successful login resets the counter for that identifier.
 */

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000;  // 15-minute lockout

interface ThrottleEntry {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
}

const store = new Map<string, ThrottleEntry>();

/** Returns the normalized key for a given login identifier. */
function key(identifier: string): string {
  return identifier.toLowerCase().trim();
}

/**
 * Records a failed login attempt.
 * Returns { blocked: true } if the identifier is now throttled.
 */
export function recordFailedAttempt(identifier: string): { blocked: boolean } {
  const k = key(identifier);
  const now = Date.now();
  const entry = store.get(k);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Start a fresh window
    store.set(k, { count: 1, windowStart: now, lockedUntil: null });
    return { blocked: false };
  }

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    store.set(k, entry);
    return { blocked: true };
  }

  store.set(k, entry);
  return { blocked: false };
}

/**
 * Checks whether an identifier is currently blocked.
 */
export function isBlocked(identifier: string): boolean {
  const k = key(identifier);
  const entry = store.get(k);
  if (!entry || entry.lockedUntil === null) return false;
  if (Date.now() < entry.lockedUntil) return true;
  // Lockout expired — clear it
  store.delete(k);
  return false;
}

/**
 * Resets the attempt counter for an identifier after a successful login.
 */
export function resetAttempts(identifier: string): void {
  store.delete(key(identifier));
}
