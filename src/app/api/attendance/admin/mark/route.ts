import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  markTherapistAttendance,
  AttendanceValidationError,
  AttendanceNotFoundError,
  AttendanceDuplicateError,
} from "@/lib/services/attendanceService";

export async function POST(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { therapistId, attendanceDate, status, attendanceTime, reason } = body;

    const data = await markTherapistAttendance({
      therapistId: Number(therapistId),
      attendanceDate: String(attendanceDate || "").trim(),
      status,
      attendanceTime: attendanceTime !== undefined ? attendanceTime : null,
      reason: reason !== undefined ? reason : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error instanceof AttendanceValidationError ||
      error instanceof AttendanceNotFoundError ||
      error instanceof AttendanceDuplicateError
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

    console.error("POST /api/attendance/admin/mark error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
