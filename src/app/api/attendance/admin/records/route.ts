import { NextRequest, NextResponse } from "next/server";
import { requireAuthorizedUser } from "@/lib/services/patientAuthService";
import {
  listAttendanceRecords,
  AttendanceValidationError,
} from "@/lib/services/attendanceService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthorizedUser(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const therapistIdParam = searchParams.get("therapistId");
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");

    const filters = {
      therapistId: therapistIdParam ? Number(therapistIdParam) : undefined,
      date: dateParam ? dateParam.trim() : undefined,
      month: monthParam ? monthParam.trim() : undefined,
    };

    const data = await listAttendanceRecords(filters);

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    if (error instanceof AttendanceValidationError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error("GET /api/attendance/admin/records error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
