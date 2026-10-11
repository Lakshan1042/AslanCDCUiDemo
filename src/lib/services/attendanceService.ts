/**
 * Therapist Attendance Service
 *
 * Core domain service for therapist attendance:
 * - Admin marking of daily attendance
 * - Admin listing/filtering of attendance records
 * - Admin corrections with atomic audit trail insertion
 * - Retrieval of correction history
 * - Self-service read-only attendance for logged-in therapists
 */

import { prisma } from "../prisma";
import type { TherapistAttendanceStatus } from "../../generated/prisma/client";
import {
  toPrismaDate,
  formatDateOnly,
  parseISTTimeToDate,
  formatISTTime,
  getMonthDateRange,
  getCurrentISTMonthString,
  isValidDateString,
  isValidMonthString,
} from "../dateUtils";

// ─── Custom Domain Errors ───────────────────────────────────────────────────

export class AttendanceValidationError extends Error {
  statusCode = 400;
  code = "VALIDATION_ERROR";
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "AttendanceValidationError";
    this.code = code;
  }
}

export class AttendanceNotFoundError extends Error {
  statusCode = 404;
  code = "NOT_FOUND";
  constructor(message: string) {
    super(message);
    this.name = "AttendanceNotFoundError";
  }
}

export class AttendanceDuplicateError extends Error {
  statusCode = 409;
  code = "DUPLICATE_RECORD";
  constructor(message: string) {
    super(message);
    this.name = "AttendanceDuplicateError";
  }
}

export class AttendanceForbiddenError extends Error {
  statusCode = 403;
  code = "FORBIDDEN";
  constructor(message: string) {
    super(message);
    this.name = "AttendanceForbiddenError";
  }
}

// ─── Input Types ────────────────────────────────────────────────────────────

export interface MarkAttendanceInput {
  therapistId: number;
  attendanceDate: string; // YYYY-MM-DD
  status: TherapistAttendanceStatus;
  attendanceTime?: string | null; // e.g. "09:15", "09:15 AM", required for PRESENT/LATE
  reason?: string | null; // required for ON_LEAVE
}

export interface CorrectAttendanceInput {
  attendanceId: number;
  adminUserId: number;
  status: TherapistAttendanceStatus;
  attendanceTime?: string | null;
  reason?: string | null;
  correctionReason: string; // mandatory explanation
}

export interface ListAttendanceFilters {
  therapistId?: number;
  date?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM
}

// ─── Helper: Validate Status, Time, and Reason Matrix ───────────────────────

function validateStatusAndTime(
  status: TherapistAttendanceStatus,
  attendanceDate: string,
  attendanceTime?: string | null,
  reason?: string | null
): { punchIn: Date | null; cleanedReason: string | null } {
  const validStatuses: TherapistAttendanceStatus[] = [
    "PRESENT",
    "ABSENT",
    "LATE",
    "ON_LEAVE",
  ];

  if (!validStatuses.includes(status)) {
    throw new AttendanceValidationError(
      `Invalid attendance status: "${status}". Must be one of: ${validStatuses.join(", ")}.`
    );
  }

  let punchIn: Date | null = null;
  let cleanedReason: string | null = null;

  if (status === "PRESENT" || status === "LATE") {
    if (!attendanceTime || !attendanceTime.trim()) {
      throw new AttendanceValidationError(
        `Attendance time is required when status is ${status}.`,
        "TIME_REQUIRED"
      );
    }
    try {
      punchIn = parseISTTimeToDate(attendanceDate, attendanceTime);
    } catch (err: any) {
      throw new AttendanceValidationError(err.message, "INVALID_TIME");
    }
    cleanedReason = reason?.trim() ? reason.trim() : null;
  } else if (status === "ABSENT") {
    if (attendanceTime && attendanceTime.trim()) {
      throw new AttendanceValidationError(
        "Attendance time must not be provided for ABSENT status.",
        "TIME_NOT_ALLOWED"
      );
    }
    punchIn = null;
    cleanedReason = reason?.trim() ? reason.trim() : null;
  } else if (status === "ON_LEAVE") {
    if (attendanceTime && attendanceTime.trim()) {
      throw new AttendanceValidationError(
        "Attendance time must not be provided for ON_LEAVE status.",
        "TIME_NOT_ALLOWED"
      );
    }
    if (!reason || reason.trim().length < 3) {
      throw new AttendanceValidationError(
        "A valid reason (minimum 3 characters) is required when status is ON_LEAVE.",
        "LEAVE_REASON_REQUIRED"
      );
    }
    punchIn = null;
    cleanedReason = reason.trim();
  }

  return { punchIn, cleanedReason };
}

// ─── 1. Admin: Mark Attendance ──────────────────────────────────────────────

export async function markTherapistAttendance(input: MarkAttendanceInput) {
  const { therapistId, attendanceDate, status, attendanceTime, reason } = input;

  if (!therapistId || typeof therapistId !== "number" || therapistId <= 0) {
    throw new AttendanceValidationError("A valid therapistId is required.");
  }

  if (!attendanceDate || !isValidDateString(attendanceDate)) {
    throw new AttendanceValidationError(
      `Invalid attendanceDate: "${attendanceDate}". Expected format YYYY-MM-DD.`,
      "INVALID_DATE"
    );
  }

  // Verify therapist exists and is active
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    select: { id: true, name: true, therapistCode: true, status: true },
  });

  if (!therapist) {
    throw new AttendanceNotFoundError(`Therapist with ID ${therapistId} not found.`);
  }

  if (therapist.status !== "ACTIVE") {
    throw new AttendanceValidationError(
      `Cannot mark attendance: Therapist "${therapist.name}" is INACTIVE.`,
      "THERAPIST_INACTIVE"
    );
  }

  const { punchIn, cleanedReason } = validateStatusAndTime(
    status,
    attendanceDate,
    attendanceTime,
    reason
  );

  const prismaDate = toPrismaDate(attendanceDate);

  // Pre-check for duplicate record
  const existing = await prisma.therapistAttendance.findUnique({
    where: {
      therapistId_attendanceDate: {
        therapistId,
        attendanceDate: prismaDate,
      },
    },
  });

  if (existing) {
    throw new AttendanceDuplicateError(
      `Attendance for therapist "${therapist.name}" on ${attendanceDate} has already been marked. Use the correction feature to edit an existing record.`
    );
  }

  try {
    const record = await prisma.therapistAttendance.create({
      data: {
        therapistId,
        attendanceDate: prismaDate,
        status,
        punchIn,
        punchOut: null, // Punch-out remains unused in Phase 1
        reason: cleanedReason,
      },
      include: {
        therapist: {
          select: { id: true, name: true, therapistCode: true, specialization: true },
        },
      },
    });

    return {
      id: record.id,
      therapistId: record.therapistId,
      therapistName: record.therapist.name,
      therapistCode: record.therapist.therapistCode,
      specialization: record.therapist.specialization,
      attendanceDate: formatDateOnly(record.attendanceDate),
      status: record.status,
      punchIn: record.punchIn ? record.punchIn.toISOString() : null,
      attendanceTime: formatISTTime(record.punchIn),
      reason: record.reason,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  } catch (error: any) {
    // Handle concurrent race condition caught by MySQL unique constraint
    if (error?.code === "P2002") {
      throw new AttendanceDuplicateError(
        `Attendance for therapist on ${attendanceDate} already exists.`
      );
    }
    throw error;
  }
}

// ─── 2. Admin: List Attendance Records with Filters ─────────────────────────

export async function listAttendanceRecords(filters: ListAttendanceFilters) {
  const where: any = {};

  if (filters.therapistId) {
    if (typeof filters.therapistId !== "number" || filters.therapistId <= 0) {
      throw new AttendanceValidationError("Invalid therapistId filter.");
    }
    where.therapistId = filters.therapistId;
  }

  if (filters.date) {
    if (!isValidDateString(filters.date)) {
      throw new AttendanceValidationError(
        `Invalid date filter: "${filters.date}". Expected YYYY-MM-DD.`,
        "INVALID_DATE"
      );
    }
    where.attendanceDate = toPrismaDate(filters.date);
  } else if (filters.month) {
    if (!isValidMonthString(filters.month)) {
      throw new AttendanceValidationError(
        `Invalid month filter: "${filters.month}". Expected YYYY-MM.`,
        "INVALID_MONTH"
      );
    }
    const range = getMonthDateRange(filters.month);
    where.attendanceDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  const records = await prisma.therapistAttendance.findMany({
    where,
    include: {
      therapist: {
        select: {
          id: true,
          name: true,
          therapistCode: true,
          specialization: true,
          status: true,
        },
      },
      _count: {
        select: { corrections: true },
      },
    },
    orderBy: [
      { attendanceDate: "desc" },
      { therapist: { name: "asc" } },
    ],
  });

  return records.map((rec) => ({
    id: rec.id,
    therapistId: rec.therapistId,
    therapistName: rec.therapist.name,
    therapistCode: rec.therapist.therapistCode,
    specialization: rec.therapist.specialization,
    therapistStatus: rec.therapist.status,
    attendanceDate: formatDateOnly(rec.attendanceDate),
    status: rec.status,
    punchIn: rec.punchIn ? rec.punchIn.toISOString() : null,
    attendanceTime: formatISTTime(rec.punchIn),
    reason: rec.reason,
    hasCorrections: rec._count.corrections > 0,
    correctionCount: rec._count.corrections,
    createdAt: rec.createdAt.toISOString(),
    updatedAt: rec.updatedAt.toISOString(),
  }));
}

// ─── 3. Admin: Correct Attendance Record (Atomic Transaction) ───────────────

export async function correctAttendanceRecord(input: CorrectAttendanceInput) {
  const {
    attendanceId,
    adminUserId,
    status,
    attendanceTime,
    reason,
    correctionReason,
  } = input;

  if (!attendanceId || typeof attendanceId !== "number" || attendanceId <= 0) {
    throw new AttendanceValidationError("Valid attendanceId is required.");
  }

  if (!adminUserId || typeof adminUserId !== "number" || adminUserId <= 0) {
    throw new AttendanceValidationError("Valid adminUserId is required.");
  }

  if (!correctionReason || correctionReason.trim().length < 3) {
    throw new AttendanceValidationError(
      "A specific correction reason (minimum 3 characters) is mandatory to audit this change.",
      "CORRECTION_REASON_REQUIRED"
    );
  }

  if (correctionReason.trim().length > 500) {
    throw new AttendanceValidationError(
      "Correction reason must not exceed 500 characters."
    );
  }

  // Execute in atomic database transaction
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.therapistAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        therapist: {
          select: { id: true, name: true, therapistCode: true, specialization: true },
        },
      },
    });

    if (!existing) {
      throw new AttendanceNotFoundError(`Attendance record ID ${attendanceId} not found.`);
    }

    const attendanceDateStr = formatDateOnly(existing.attendanceDate);

    const { punchIn, cleanedReason } = validateStatusAndTime(
      status,
      attendanceDateStr,
      attendanceTime,
      reason
    );

    // Update attendance record
    const updated = await tx.therapistAttendance.update({
      where: { id: attendanceId },
      data: {
        status,
        punchIn,
        punchOut: null,
        reason: cleanedReason,
      },
    });

    // Create audit correction entry in the same transaction
    const correction = await tx.therapistAttendanceCorrection.create({
      data: {
        attendanceId: existing.id,
        adminUserId,
        prevStatus: existing.status,
        newStatus: status,
        prevTime: existing.punchIn,
        newTime: punchIn,
        prevReason: existing.reason,
        newReason: cleanedReason,
        correctionReason: correctionReason.trim(),
      },
      include: {
        adminUser: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    return {
      record: {
        id: updated.id,
        therapistId: updated.therapistId,
        therapistName: existing.therapist.name,
        therapistCode: existing.therapist.therapistCode,
        specialization: existing.therapist.specialization,
        attendanceDate: attendanceDateStr,
        status: updated.status,
        punchIn: updated.punchIn ? updated.punchIn.toISOString() : null,
        attendanceTime: formatISTTime(updated.punchIn),
        reason: updated.reason,
        updatedAt: updated.updatedAt.toISOString(),
      },
      correction: {
        id: correction.id,
        attendanceId: correction.attendanceId,
        adminUserId: correction.adminUserId,
        adminUsername: correction.adminUser.username,
        prevStatus: correction.prevStatus,
        newStatus: correction.newStatus,
        prevTime: formatISTTime(correction.prevTime),
        newTime: formatISTTime(correction.newTime),
        prevReason: correction.prevReason,
        newReason: correction.newReason,
        correctionReason: correction.correctionReason,
        correctedAt: correction.createdAt.toISOString(),
      },
    };
  });
}

// ─── 4. Admin: View Correction History for a Record ──────────────────────────

export async function getRecordCorrectionHistory(attendanceId: number) {
  if (!attendanceId || typeof attendanceId !== "number" || attendanceId <= 0) {
    throw new AttendanceValidationError("Valid attendanceId is required.");
  }

  const existing = await prisma.therapistAttendance.findUnique({
    where: { id: attendanceId },
    include: {
      therapist: {
        select: { id: true, name: true, therapistCode: true },
      },
    },
  });

  if (!existing) {
    throw new AttendanceNotFoundError(`Attendance record ID ${attendanceId} not found.`);
  }

  const corrections = await prisma.therapistAttendanceCorrection.findMany({
    where: { attendanceId },
    include: {
      adminUser: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    attendanceRecord: {
      id: existing.id,
      therapistId: existing.therapistId,
      therapistName: existing.therapist.name,
      therapistCode: existing.therapist.therapistCode,
      attendanceDate: formatDateOnly(existing.attendanceDate),
      currentStatus: existing.status,
      currentTime: formatISTTime(existing.punchIn),
      currentReason: existing.reason,
    },
    corrections: corrections.map((c) => ({
      id: c.id,
      adminUserId: c.adminUserId,
      adminUsername: c.adminUser.username,
      prevStatus: c.prevStatus,
      newStatus: c.newStatus,
      prevTime: formatISTTime(c.prevTime),
      prevTimeRaw: c.prevTime ? c.prevTime.toISOString() : null,
      newTime: formatISTTime(c.newTime),
      newTimeRaw: c.newTime ? c.newTime.toISOString() : null,
      prevReason: c.prevReason,
      newReason: c.newReason,
      correctionReason: c.correctionReason,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

// ─── 5. Therapist: Self-Service Own Attendance History ───────────────────────

export async function getTherapistOwnAttendance(userId: number, month?: string) {
  if (!userId || typeof userId !== "number" || userId <= 0) {
    throw new AttendanceValidationError("Valid userId is required.");
  }

  // Resolve therapist strictly through the authenticated userId
  const therapist = await prisma.therapist.findUnique({
    where: { userId },
    select: { id: true, name: true, therapistCode: true, specialization: true },
  });

  if (!therapist) {
    throw new AttendanceForbiddenError(
      "No therapist profile is linked to this authenticated user account."
    );
  }

  const targetMonth = month && month.trim() ? month.trim() : getCurrentISTMonthString();

  if (!isValidMonthString(targetMonth)) {
    throw new AttendanceValidationError(
      `Invalid month: "${targetMonth}". Expected format YYYY-MM.`,
      "INVALID_MONTH"
    );
  }

  const range = getMonthDateRange(targetMonth);

  const records = await prisma.therapistAttendance.findMany({
    where: {
      therapistId: therapist.id,
      attendanceDate: {
        gte: range.startDate,
        lte: range.endDate,
      },
    },
    orderBy: { attendanceDate: "desc" },
  });

  return {
    therapist: {
      id: therapist.id,
      name: therapist.name,
      therapistCode: therapist.therapistCode,
      specialization: therapist.specialization,
    },
    month: targetMonth,
    dateRange: {
      startDate: range.startDateStr,
      endDate: range.endDateStr,
    },
    summary: {
      totalMarked: records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      late: records.filter((r) => r.status === "LATE").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      onLeave: records.filter((r) => r.status === "ON_LEAVE").length,
    },
    records: records.map((r) => ({
      id: r.id,
      attendanceDate: formatDateOnly(r.attendanceDate),
      status: r.status,
      punchIn: r.punchIn ? r.punchIn.toISOString() : null,
      attendanceTime: formatISTTime(r.punchIn),
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}
