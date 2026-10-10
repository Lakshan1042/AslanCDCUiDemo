import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser, verifyPatientAccess } from "@/lib/services/patientAuthService";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST", "PARENT"]);
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const patientId = parseInt(resolvedParams.id, 10);
  if (isNaN(patientId)) {
    return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
  }

  const access = await verifyPatientAccess(auth, patientId);
  if (!access.allowed) {
    return access.errorResponse!;
  }

  const patient = access.patient;
  const primaryAssignment = patient.therapistAssignments.find((a: any) => a.isPrimary) || patient.therapistAssignments[0];

  return NextResponse.json({
    success: true,
    data: {
      id: patient.id,
      patientCode: patient.patientCode,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      age: patient.dateOfBirth
        ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      gender: patient.gender,
      status: patient.status,
      program: patient.program || "",
      primaryConcerns: patient.primaryConcerns || "",
      currentPlan: patient.currentPlan || "",
      isLocked: patient.isLocked,
      enrollmentDate: patient.enrollmentDate,
      parent: patient.parent,
      assignedTherapists: patient.therapistAssignments.map((a: any) => ({
        id: a.therapist.id,
        name: a.therapist.name,
        isPrimary: a.isPrimary,
        assignedAt: a.assignedAt,
      })),
      primaryTherapist: primaryAssignment
        ? {
            id: primaryAssignment.therapist.id,
            name: primaryAssignment.therapist.name,
          }
        : null,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const patientId = parseInt(resolvedParams.id, 10);
  if (isNaN(patientId)) {
    return NextResponse.json({ success: false, message: "Invalid patient ID" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    // Explicitly reject any attempted password modifications via patient API
    if ("password" in body || "passwordHash" in body || "parentPassword" in body) {
      return NextResponse.json(
        { success: false, message: "Password modification is not permitted via patient management APIs" },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if ("status" in body) dataToUpdate.status = body.status;
    if ("isLocked" in body) dataToUpdate.isLocked = Boolean(body.isLocked);
    if ("program" in body) dataToUpdate.program = body.program;
    if ("primaryConcerns" in body) dataToUpdate.primaryConcerns = body.primaryConcerns;
    if ("currentPlan" in body) dataToUpdate.currentPlan = body.currentPlan;
    if ("name" in body && body.name?.trim()) dataToUpdate.name = body.name.trim();

    const updated = await prisma.patient.update({
      where: { id: patientId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Patient updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/patients/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update patient" },
      { status: 500 }
    );
  }
}
