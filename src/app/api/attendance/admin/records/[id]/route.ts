import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  correctAttendanceRecord,
  AttendanceValidationError,
  AttendanceNotFoundError,
} from "@/lib/services/attendanceService";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: rawId } = await context.params;
    const attendanceId = Number(rawId);

    if (isNaN(attendanceId) || attendanceId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid attendance record ID" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { status, attendanceTime, reason, correctionReason } = body;

    const data = await correctAttendanceRecord({
      attendanceId,
      adminUserId: auth.userId,
      status,
      attendanceTime: attendanceTime !== undefined ? attendanceTime : null,
      reason: reason !== undefined ? reason : null,
      correctionReason: String(correctionReason || "").trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Attendance corrected successfully and audit trail logged",
      data,
    });
  } catch (error: any) {
    if (
      error instanceof AttendanceValidationError ||
      error instanceof AttendanceNotFoundError
    ) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error("PUT /api/attendance/admin/records/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
