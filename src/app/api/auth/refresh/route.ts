/**
 * POST /api/auth/refresh
 *
 * Reads the refresh token from the `cdc_refresh_token` HttpOnly cookie,
 * validates it against the database, rotates it (old session revoked,
 * new session created atomically), and issues a new access token +
 * a new refresh token.
 *
 * Rotation ensures that a stolen/replayed old refresh token is rejected
 * because the original session will already have been revoked.
 *
 * Returns: 200 on success, 401 if the token is missing/invalid/expired.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  signAccessToken,
  generateRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth";
import { rotateRefreshToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const rawRefreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!rawRefreshToken) {
    return NextResponse.json(
      { success: false, message: "No refresh token provided" },
      { status: 401 }
    );
  }

  const newRawRefreshToken = generateRefreshToken();

  let rotated: { userId: number; sessionId: number };
  try {
    rotated = await rotateRefreshToken(
      rawRefreshToken,
      newRawRefreshToken,
      req.headers.get("user-agent") ?? undefined,
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        undefined
    );
  } catch {
    // Token invalid, expired, or already revoked — clear cookies and reject
    const errRes = NextResponse.json(
      { success: false, message: "Invalid or expired refresh token" },
      { status: 401 }
    );
    clearAuthCookies(errRes);
    return errRes;
  }

  // Fetch the user's current role (needed for the new JWT payload)
  const user = await prisma.user.findUnique({
    where: { id: rotated.userId },
    select: { role: true, status: true },
  });

  if (!user || user.status === "DISABLED" || user.status === "LOCKED") {
    const errRes = NextResponse.json(
      { success: false, message: "Account unavailable" },
      { status: 401 }
    );
    clearAuthCookies(errRes);
    return errRes;
  }

  const newAccessToken = await signAccessToken({
    sub: String(rotated.userId),
    role: user.role,
    sessionId: rotated.sessionId,
  });

  const res = NextResponse.json(
    { success: true, message: "Token refreshed" },
    { status: 200 }
  );

  setAccessTokenCookie(res, newAccessToken);
  setRefreshTokenCookie(res, newRawRefreshToken);

  return res;
}
