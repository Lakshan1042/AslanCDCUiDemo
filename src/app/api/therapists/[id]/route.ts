import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getTherapistById,
  updateTherapist,
  deactivateTherapist,
  reactivateTherapist,
} from "@/lib/services/therapistService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const therapistId = parseInt(resolvedParams.id, 10);
  if (isNaN(therapistId)) {
    return NextResponse.json(
      { success: false, message: "Invalid therapist ID" },
      { status: 400 }
    );
  }

  try {
    const therapist = await getTherapistById(therapistId);
    if (!therapist) {
      return NextResponse.json(
        { success: false, message: "Therapist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: therapist,
    });
  } catch (error: any) {
    console.error("GET /api/therapists/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch therapist" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const therapistId = parseInt(resolvedParams.id, 10);
  if (isNaN(therapistId)) {
    return NextResponse.json(
      { success: false, message: "Invalid therapist ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Explicitly reject any attempted password modifications via therapist management API
    if (
      "password" in body ||
      "passwordHash" in body ||
      "initialPassword" in body ||
      "newPassword" in body
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password modification is not permitted via therapist management APIs. Admin cannot change or view therapist passwords.",
        },
        { status: 400 }
      );
    }

    // Handle dedicated action triggers
    if (body.action === "deactivate" || body.status === "INACTIVE" || body.status === "Inactive") {
      const deactResult = await deactivateTherapist(therapistId);
      const updated = await getTherapistById(therapistId);
      return NextResponse.json({
        success: true,
        message: "Therapist deactivated successfully",
        data: updated,
        deactivatedSecondaryCount: deactResult.deactivatedSecondaryCount,
      });
    }

    if (body.action === "reactivate" || body.status === "ACTIVE" || body.status === "Active") {
      await reactivateTherapist(therapistId);
      const updated = await getTherapistById(therapistId);
      return NextResponse.json({
        success: true,
        message: "Therapist reactivated successfully",
        data: updated,
      });
    }

    // Normal profile update
    const finalEducation =
      body.education ||
      (body.collegeName || body.degreeProgram || body.yearOfPassing
        ? {
            collegeName: body.collegeName,
            degreeProgram: body.degreeProgram,
            yearOfPassing: body.yearOfPassing,
          }
        : undefined);

    const updated = await updateTherapist(therapistId, {
      name: body.name,
      phone: body.phone,
      specialization: body.specialization,
      joiningDate: body.joiningDate,
      gender: body.gender,
      age: body.age,
      address: body.address,
      education: finalEducation,
      employmentType:
        body.employmentType === "Part Time" || body.employmentType === "PART_TIME"
          ? "PART_TIME"
          : body.employmentType === "Full Time" || body.employmentType === "FULL_TIME"
          ? "FULL_TIME"
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Therapist updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/therapists/[id] error:", error);
    const statusCode = error.code === "ACTIVE_PRIMARY_ASSIGNMENT" ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        code: error.code || "UPDATE_FAILED",
        message: error.message || "Failed to update therapist",
        patients: error.patients || undefined,
      },
      { status: statusCode }
    );
  }
}
