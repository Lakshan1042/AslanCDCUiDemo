import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  getTherapistOwnAttendance,
  AttendanceValidationError,
  AttendanceForbiddenError,
} from "@/lib/services/attendanceService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["THERAPIST"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const month = monthParam ? monthParam.trim() : undefined;

    const data = await getTherapistOwnAttendance(auth.userId, month);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    if (
      error instanceof AttendanceValidationError ||
      error instanceof AttendanceForbiddenError
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

    console.error("GET /api/attendance/me error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
