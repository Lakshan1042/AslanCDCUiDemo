import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import { assignTherapistToPatient } from "@/lib/services/patientService";

export async function POST(
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
    if (!body || !body.therapistId) {
      return NextResponse.json(
        { success: false, message: "therapistId is required" },
        { status: 400 }
      );
    }

    const therapistId = Number(body.therapistId);
    const isPrimary = Boolean(body.isPrimary);

    await assignTherapistToPatient(patientId, therapistId, isPrimary);

    return NextResponse.json({
      success: true,
      message: isPrimary
        ? "Therapist assigned as primary care therapist"
        : "Secondary therapist assigned successfully",
    });
  } catch (error: any) {
    console.error("POST /api/patients/[id]/therapists error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to assign therapist" },
      { status: 500 }
    );
  }
}
