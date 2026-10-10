/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile.
 * Requires a valid access-token cookie AND a non-revoked/non-expired session.
 *
 * Returns: 200 with user data, 401 if not authenticated.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  if (!user || user.status === "DISABLED" || user.status === "LOCKED") {
    return NextResponse.json(
      { success: false, message: user ? "Account unavailable" : "User not found" },
      { status: user ? 401 : 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "OK",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
    },
    { status: 200 }
  );
}
