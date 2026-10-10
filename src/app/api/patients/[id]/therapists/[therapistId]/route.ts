import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import { unassignTherapistFromPatient } from "@/lib/services/patientService";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; therapistId: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const resolvedParams = await params;
  const patientId = parseInt(resolvedParams.id, 10);
  const therapistId = parseInt(resolvedParams.therapistId, 10);

  if (isNaN(patientId) || isNaN(therapistId)) {
    return NextResponse.json(
      { success: false, message: "Invalid patient or therapist ID" },
      { status: 400 }
    );
  }

  // Parse optional replacementTherapistId from query parameters or JSON body
  const { searchParams } = new URL(req.url);
  const qReplacement = searchParams.get("replacementTherapistId");
  let bodyReplacement: any = null;
  try {
    const body = await req.json().catch(() => null);
    if (body?.replacementTherapistId) {
      bodyReplacement = body.replacementTherapistId;
    }
  } catch {}

  const rawReplacement = qReplacement || bodyReplacement;
  const replacementTherapistId = rawReplacement
    ? parseInt(String(rawReplacement), 10)
    : undefined;

  if (rawReplacement && isNaN(replacementTherapistId!)) {
    return NextResponse.json(
      { success: false, message: "Invalid replacement therapist ID" },
      { status: 400 }
    );
  }

  try {
    await unassignTherapistFromPatient(patientId, therapistId, replacementTherapistId);

    return NextResponse.json({
      success: true,
      message: "Therapist unassigned successfully; historical records preserved",
    });
  } catch (error: any) {
    console.error("DELETE /api/patients/[id]/therapists/[therapistId] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to unassign therapist" },
      { status: 400 }
    );
  }
}
