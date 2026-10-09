/**
 * Core authentication utilities for the Aslan CDC Management Software.
 *
 * Provides:
 *  - JWT access token signing and verification (jose, HS256)
 *  - Opaque refresh-token generation and SHA-256 hashing
 *  - Password hashing and comparison (bcryptjs)
 *  - Cookie helpers for access + refresh tokens
 *  - A reusable `requireAuth` server-side guard
 *  - A reusable `requireRole` authorization helper
 *
 * IMPORTANT: Never log passwords, tokens, or hashes.
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import type { AuthContext, JwtPayload, VerifiedToken } from "../types/auth";
import type { UserRole } from "../generated/prisma/client";

// ─── Environment-variable helpers ────────────────────────────────────────────

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        "Check your .env file and restart the server."
    );
  }
  return value;
}

/** Returns the JWT secret as a Uint8Array for use with jose. */
function getJwtSecret(): Uint8Array {
  const secret = getRequiredEnv("JWT_SECRET");
  return new TextEncoder().encode(secret);
}

// ─── Token lifetimes ─────────────────────────────────────────────────────────

/** Access token lifetime in seconds. Default: 15 minutes. */
export function accessTokenTtlSeconds(): number {
  return Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? "900");
}

/** Refresh token lifetime in seconds. Default: 7 days. */
export function refreshTokenTtlSeconds(): number {
  return Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? String(7 * 24 * 60 * 60));
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

/**
 * Signs and returns a new JWT access token.
 * Algorithm: HS256  |  Lifetime: ACCESS_TOKEN_TTL_SECONDS (default 15 min)
 */
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  const ttl = accessTokenTtlSeconds();
  return new SignJWT({
    role: payload.role,
    sessionId: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getJwtSecret());
}

/**
 * Verifies a JWT access token.
 * Returns the decoded payload or throws if the token is invalid/expired.
 */
export async function verifyAccessToken(token: string): Promise<VerifiedToken> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  // Narrow the jose generic payload to our shape
  if (
    typeof payload.sub !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.sessionId !== "number"
  ) {
    throw new Error("Malformed token payload");
  }

  return {
    sub: payload.sub,
    role: payload.role as UserRole,
    sessionId: payload.sessionId,
    iat: payload.iat as number,
    exp: payload.exp as number,
  };
}

// ─── Refresh token ────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random opaque refresh token (32 bytes → 64 hex chars).
 * This raw value is sent to the client; only its SHA-256 hash is stored in the DB.
 */
export function generateRefreshToken(): string {
  // Use the Web Crypto API which is available in Node 18+
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns the SHA-256 hash of a raw refresh token as a hex string.
 * This is what is stored in UserSession.refreshTokenHash.
 */
export async function hashRefreshToken(rawToken: string): Promise<string> {
  const encoded = new TextEncoder().encode(rawToken);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Password hashing ─────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcryptjs.
 * Use this when creating or updating user accounts — never log the result.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 * Timing-safe via bcrypt's constant-time compare.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Cookie name for the short-lived JWT access token. */
export const ACCESS_TOKEN_COOKIE = "cdc_access_token";
/** Cookie name for the long-lived opaque refresh token. */
export const REFRESH_TOKEN_COOKIE = "cdc_refresh_token";

/** Sets the access-token cookie on a NextResponse. */
export function setAccessTokenCookie(res: NextResponse, token: string): void {
  const maxAge = accessTokenTtlSeconds();
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/** Sets the refresh-token cookie on a NextResponse. */
export function setRefreshTokenCookie(res: NextResponse, token: string): void {
  const maxAge = refreshTokenTtlSeconds();
  res.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    // Scope refresh token to the refresh endpoint only
    path: "/api/auth",
    maxAge,
  });
}

/** Clears both auth cookies on a NextResponse (used by logout). */
export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 0,
  });
}

// ─── Server-side auth guard ───────────────────────────────────────────────────

/**
 * Reads and verifies the access-token cookie from an incoming request.
 * Also validates that the referenced session is still valid in the database.
 *
 * Returns an AuthContext on success, or null if authentication fails.
 * Callers must treat null as a 401 condition.
 *
 * NOTE: Import prisma lazily inside this function to avoid circular imports
 * when auth.ts is imported from route handlers that also import prisma.
 */
export async function getAuthContext(
  req: NextRequest
): Promise<AuthContext | null> {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) return null;

    const payload = await verifyAccessToken(token);
    const userId = Number(payload.sub);

    // Validate session still exists, is not revoked/expired, and user account is active
    const { prisma } = await import("./prisma");
    const session = await prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        user: {
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!session || !session.user) return null;

    // Reject disabled or locked accounts immediately
    if (session.user.status === "DISABLED" || session.user.status === "LOCKED") {
      return null;
    }

    return {
      userId,
      role: session.user.role,
      sessionId: payload.sessionId,
    };
  } catch {
    // Invalid/expired JWT or DB error — treat as unauthenticated
    return null;
  }
}

/**
 * Requires authentication. Returns the AuthContext or sends a 401 response.
 *
 * Usage:
 * ```ts
 * const auth = await requireAuth(req);
 * if (auth instanceof NextResponse) return auth;
 * // auth is now AuthContext
 * ```
 */
export async function requireAuth(
  req: NextRequest
): Promise<AuthContext | NextResponse> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
  return ctx;
}

/**
 * Requires authentication AND one of the specified roles.
 * Returns AuthContext or a 401/403 NextResponse.
 *
 * Usage:
 * ```ts
 * const auth = await requireRole(req, ["ADMIN", "THERAPIST"]);
 * if (auth instanceof NextResponse) return auth;
 * ```
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthContext | NextResponse> {
  const ctx = await getAuthContext(req);
  if (!ctx) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
  if (!allowedRoles.includes(ctx.role)) {
    return NextResponse.json(
      { success: false, message: "Insufficient permissions" },
      { status: 403 }
    );
  }
  return ctx;
}
