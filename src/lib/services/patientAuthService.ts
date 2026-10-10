import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuthContext } from "@/types/auth";
import type { UserRole } from "@/generated/prisma/client";

export interface VerifiedPatientContext extends AuthContext {
  parentRecordId?: number;
  therapistRecordId?: number;
}

/**
 * Stage 1-4 Guard:
 * Authenticates request, verifies live account status, verifies mandatory password change flag,
 * and ensures caller has one of the allowed roles.
 */
export async function requireAuthorizedUser(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<AuthContext | NextResponse> {
  const auth = allowedRoles
    ? await requireRole(req, allowedRoles)
    : await requireAuth(req);

  if (auth instanceof NextResponse) return auth;

  // Query live user status & mandatory password change
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      status: true,
      mustChangePassword: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json(
      { success: false, message: "Account is disabled or locked" },
      { status: 403 }
    );
  }

  if (user.mustChangePassword) {
    return NextResponse.json(
      {
        success: false,
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "You must change your password before accessing clinic services.",
      },
      { status: 403 }
    );
  }

  return auth;
}

/**
 * Stage 5 Guard:
 * Enforces resource-level patient ownership and active therapist assignment boundaries.
 *
 * Rules:
 * - Admin: Full access.
 * - Therapist: Allowed ONLY if active assignment exists (isActive: true).
 * - Parent: Allowed ONLY if patient.parentId === parent.id.
 *   If patient.isLocked === true, returns 403 CHILD_LOCKED.
 */
export async function verifyPatientAccess(
  auth: AuthContext,
  patientId: number
): Promise<{ allowed: boolean; errorResponse?: NextResponse; patient?: any }> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      parent: {
        select: { id: true, userId: true, name: true, phone: true },
      },
      therapistAssignments: {
        where: { isActive: true },
        include: {
          therapist: {
            select: { id: true, name: true, userId: true },
          },
        },
      },
    },
  });

  if (!patient) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      ),
    };
  }

  if (auth.role === "ADMIN") {
    return { allowed: true, patient };
  }

  if (auth.role === "THERAPIST") {
    const therapist = await prisma.therapist.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });

    if (!therapist) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          { success: false, message: "Therapist profile not found" },
          { status: 403 }
        ),
      };
    }

    const isAssigned = patient.therapistAssignments.some(
      (a) => a.therapistId === therapist.id
    );

    if (!isAssigned) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            code: "UNASSIGNED_THERAPIST",
            message: "Access denied: Patient is not actively assigned to you.",
          },
          { status: 403 }
        ),
      };
    }

    return { allowed: true, patient };
  }

  if (auth.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });

    if (!parent || patient.parentId !== parent.id) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          { success: false, message: "Access denied to this patient profile" },
          { status: 403 }
        ),
      };
    }

    if (patient.isLocked) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            code: "CHILD_LOCKED",
            message: "Access to this child's therapy profile has been locked by clinic administration.",
          },
          { status: 403 }
        ),
      };
    }

    return { allowed: true, patient };
  }

  return {
    allowed: false,
    errorResponse: NextResponse.json(
      { success: false, message: "Insufficient permissions" },
      { status: 403 }
    ),
  };
}
