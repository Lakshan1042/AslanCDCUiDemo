import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  listTherapists,
  createTherapist,
} from "@/lib/services/therapistService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const employmentType = (searchParams.get("employmentType") as any) || undefined;

    const data = await listTherapists({
      search,
      status,
      employmentType,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/therapists error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch therapists" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      specialization,
      initialPassword,
      age,
      gender,
      address,
      joiningDate,
      education,
      collegeName,
      degreeProgram,
      yearOfPassing,
      employmentType,
      status,
    } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !specialization?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email, phone, and specialization are required" },
        { status: 400 }
      );
    }

    if (!initialPassword?.trim()) {
      return NextResponse.json(
        { success: false, message: "Initial password is required" },
        { status: 400 }
      );
    }

    // Support education passed either as object or separate fields
    const finalEducation =
      education ||
      (collegeName || degreeProgram || yearOfPassing
        ? { collegeName, degreeProgram, yearOfPassing }
        : null);

    const result = await createTherapist({
      name,
      email,
      phone,
      specialization,
      initialPassword,
      age: age ? Number(age) : null,
      gender,
      address,
      joiningDate,
      education: finalEducation,
      employmentType: employmentType === "Part Time" || employmentType === "PART_TIME" ? "PART_TIME" : "FULL_TIME",
      status: status === "Inactive" || status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Therapist enrolled successfully",
        data: {
          therapist: result.therapist,
          initialPassword: result.initialPassword,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/therapists error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create therapist" },
      { status: 400 }
    );
  }
}
