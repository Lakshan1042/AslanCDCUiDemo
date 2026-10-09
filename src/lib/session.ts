/**
 * UserSession database operations for the Aslan CDC Management Software.
 *
 * Encapsulates all session lifecycle logic:
 *  - Creating sessions on login
 *  - Validating and rotating refresh tokens
 *  - Revoking sessions on logout
 *  - Cleaning up expired sessions
 */

import { prisma } from "./prisma";
import { hashRefreshToken, refreshTokenTtlSeconds } from "./auth";

// ─── Session creation ─────────────────────────────────────────────────────────

export interface CreateSessionInput {
  userId: number;
  rawRefreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}

/**
 * Creates a new UserSession in the database.
 * Only the SHA-256 hash of the refresh token is stored — never the raw value.
 */
export async function createSession(
  input: CreateSessionInput
): Promise<{ sessionId: number }> {
  const refreshTokenHash = await hashRefreshToken(input.rawRefreshToken);
  const ttl = refreshTokenTtlSeconds();
  const expiresAt = new Date(Date.now() + ttl * 1000);

  const session = await prisma.userSession.create({
    data: {
      userId: input.userId,
      refreshTokenHash,
      deviceInfo: input.deviceInfo ?? null,
      ipAddress: input.ipAddress ?? null,
      expiresAt,
    },
    select: { id: true },
  });

  return { sessionId: session.id };
}

// ─── Session validation & refresh-token rotation ──────────────────────────────

export interface ValidateRefreshResult {
  userId: number;
  sessionId: number;
}

/**
 * Validates a raw refresh token and performs atomic rotation:
 * 1. Hashes the incoming raw token.
 * 2. Finds the matching session (not expired, not revoked).
 * 3. Revokes the old session.
 * 4. Creates a new session with the new refresh token.
 *
 * Returns the userId and the new sessionId, or throws if validation fails.
 *
 * Atomic rotation prevents refresh-token reuse: if an attacker replays a
 * rotated token, the session will be expired/revoked and the lookup fails.
 */
export async function rotateRefreshToken(
  rawRefreshToken: string,
  newRawRefreshToken: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<ValidateRefreshResult> {
  const incomingHash = await hashRefreshToken(rawRefreshToken);

  // Find the existing session by its hashed refresh token
  const existing = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: incomingHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });

  if (!existing) {
    // Check if this token was previously revoked (reuse detection per RFC 6819)
    const reusedSession = await prisma.userSession.findFirst({
      where: {
        refreshTokenHash: incomingHash,
        revokedAt: { not: null },
      },
      select: { userId: true },
    });

    if (reusedSession) {
      // Reuse attack detected: Invalidate all active sessions for this user grant
      await revokeAllUserSessions(reusedSession.userId);
    }

    throw new Error("Invalid or expired refresh token");
  }

  // Compute the new session's expiry
  const ttl = refreshTokenTtlSeconds();
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const newRefreshTokenHash = await hashRefreshToken(newRawRefreshToken);

  // Atomically revoke the old session and create the new one
  const [, newSession] = await prisma.$transaction([
    prisma.userSession.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    }),
    prisma.userSession.create({
      data: {
        userId: existing.userId,
        refreshTokenHash: newRefreshTokenHash,
        deviceInfo: deviceInfo ?? null,
        ipAddress: ipAddress ?? null,
        expiresAt,
      },
      select: { id: true },
    }),
  ]);

  return {
    userId: existing.userId,
    sessionId: newSession.id,
  };
}

// ─── Session revocation (logout) ──────────────────────────────────────────────

/**
 * Revokes a specific session by its ID (used during logout).
 * Idempotent: already-revoked sessions are a no-op.
 */
export async function revokeSession(sessionId: number): Promise<void> {
  await prisma.userSession.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes all active sessions for a user (e.g., password change, account lock).
 */
export async function revokeAllUserSessions(userId: number): Promise<void> {
  await prisma.userSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

// ─── Session touch ────────────────────────────────────────────────────────────

/**
 * Updates `lastUsedAt` for an active session.
 * Call this on successful authenticated requests if needed.
 */
export async function touchSession(sessionId: number): Promise<void> {
  await prisma.userSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { lastUsedAt: new Date() },
  });
}
