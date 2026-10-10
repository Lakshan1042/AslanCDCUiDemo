/**
 * POST /api/auth/login
 *
 * Accepts: { identifier: string, password: string }
 *   where `identifier` is a username OR email address.
 *
 * Returns: 200 with user info on success, 401 on invalid credentials,
 *          403 on disabled/locked account, 429 when throttled.
 *
 * On success, sets two HttpOnly cookies:
 *   cdc_access_token  — JWT, 15-minute lifetime
 *   cdc_refresh_token — opaque token, scoped to /api/auth, 7-day lifetime
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createSession } from "@/lib/session";
import { isBlocked, recordFailedAttempt, resetAttempts } from "@/lib/throttle";

// ─── Validation schema ────────────────────────────────────────────────────────

const LoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Username or email is required")
    .max(191, "Identifier too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(256, "Password too long"),
});

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { identifier, password } = parsed.data;

  // ── Throttle check ────────────────────────────────────────────────────────
  if (isBlocked(identifier)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Too many failed login attempts. Please wait 15 minutes before trying again.",
      },
      { status: 429 }
    );
  }

  // ── Look up user by username OR email ─────────────────────────────────────
  // Use findFirst with OR to check both fields in one query
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      passwordHash: true,
      role: true,
      status: true,
      mustChangePassword: true,
    },
  });

  // ── Generic credential check (timing-safe path) ───────────────────────────
  // Always run bcrypt.compare even when no user is found, to prevent
  // timing-based user enumeration.
  const DUMMY_HASH =
    "$2b$12$invalidhashpadding...........................................";
  const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
  const passwordValid = await verifyPassword(password, hashToCompare);

  if (!user || !passwordValid) {
    recordFailedAttempt(identifier);
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // ── Account status check ──────────────────────────────────────────────────
  if (user.status === "DISABLED" || user.status === "LOCKED") {
    // Do NOT reset throttle — keep counting attempts against locked accounts
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  // ── Issue tokens ──────────────────────────────────────────────────────────
  // Reset throttle on successful credential verification
  resetAttempts(identifier);

  const rawRefreshToken = generateRefreshToken();

  // Create the DB session (stores hashed refresh token)
  const { sessionId } = await createSession({
    userId: user.id,
    rawRefreshToken,
    deviceInfo: req.headers.get("user-agent") ?? undefined,
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
  });

  const accessToken = await signAccessToken({
    sub: String(user.id),
    role: user.role,
    sessionId,
  });

  // ── Build response ────────────────────────────────────────────────────────
  const res = NextResponse.json(
    {
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    },
    { status: 200 }
  );

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, rawRefreshToken);

  return res;
}
