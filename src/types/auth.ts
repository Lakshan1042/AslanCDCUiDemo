/**
 * Authentication type definitions for the Aslan CDC Management Software.
 */

import type { UserRole } from "../generated/prisma/client";

/** Payload embedded inside the signed JWT access token. */
export interface JwtPayload {
  /** Subject — the User.id as a string */
  sub: string;
  /** User role for coarse-grained authorization */
  role: UserRole;
  /** The UserSession.id that issued this token — used for session validity checks */
  sessionId: number;
}

/** Decoded, verified JWT payload (adds standard JWT claims). */
export interface VerifiedToken extends JwtPayload {
  iat: number;
  exp: number;
}

/** The authenticated context attached to every verified request. */
export interface AuthContext {
  userId: number;
  role: UserRole;
  sessionId: number;
}

/** Standard JSON shape returned by every auth API response. */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

/** Shape returned by GET /api/auth/me */
export interface MeResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: string;
}
