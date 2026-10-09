/**
 * POST /api/auth/logout
 *
 * Revokes the current session identified by the JWT access token's sessionId
 * claim, then clears both auth cookies.
 *
 * Accepts unauthenticated calls gracefully (always clears cookies).
 * Returns: 200 always.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAuthContext,
  clearAuthCookies,
} from "@/lib/auth";
import { revokeSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const ctx = await getAuthContext(req);

  if (ctx) {
    // Best-effort revocation — do not let a DB error prevent cookie clearing
    try {
      await revokeSession(ctx.sessionId);
    } catch (err) {
      console.error("[auth/logout] Failed to revoke session:", err);
    }
  }

  const res = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  clearAuthCookies(res);
  return res;
}
