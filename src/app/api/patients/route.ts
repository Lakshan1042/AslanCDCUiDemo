import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import { listPatients, enrollPatient } from "@/lib/services/patientService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN", "THERAPIST", "PARENT"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const program = searchParams.get("program") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const therapistId = searchParams.get("therapistId")
      ? parseInt(searchParams.get("therapistId")!, 10)
      : undefined;

    const data = await listPatients(auth, {
      search,
      program,
      status,
      therapistId,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch patients" },
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
      dateOfBirth,
      gender,
      program,
      primaryConcerns,
      currentPlan,
      primaryTherapistId,
      parent,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Patient name is required" },
        { status: 400 }
      );
    }

    if (!parent?.name?.trim() || !parent?.email?.trim() || !parent?.phone?.trim()) {
      return NextResponse.json(
        { success: false, message: "Parent name, email, and phone number are required" },
        { status: 400 }
      );
    }

    if (!primaryTherapistId) {
      return NextResponse.json(
        { success: false, message: "A primary therapist must be assigned during enrollment" },
        { status: 400 }
      );
    }

    const result = await enrollPatient({
      name,
      dateOfBirth,
      gender,
      program,
      primaryConcerns,
      currentPlan,
      primaryTherapistId: Number(primaryTherapistId),
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        address: parent.address,
        initialPassword: parent.initialPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient enrolled successfully",
        data: {
          id: result.patient.id,
          patientCode: result.patient.patientCode,
          name: result.patient.name,
          isNewParent: result.isNewParent,
          // Temporary initial password returned only once for newly provisioned parent handover
          initialPassword: result.initialPassword,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to enroll patient" },
      { status: 400 }
    );
  }
}
