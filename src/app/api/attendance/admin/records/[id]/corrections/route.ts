import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getRecordCorrectionHistory,
  AttendanceValidationError,
  AttendanceNotFoundError,
} from "@/lib/services/attendanceService";

export async function GET(
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

    const data = await getRecordCorrectionHistory(attendanceId);

    return NextResponse.json({
      success: true,
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

    console.error("GET /api/attendance/admin/records/[id]/corrections error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
