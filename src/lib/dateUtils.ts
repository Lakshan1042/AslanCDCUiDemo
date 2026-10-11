/**
 * Date and time utilities for Asia/Kolkata timezone.
 *
 * Ensures deterministic date-only storage in MySQL @db.Date and
 * proper timestamp arithmetic without local timezone drift.
 */

export const TIMEZONE_IST = "Asia/Kolkata";

/**
 * Validates 'YYYY-MM-DD' calendar date string format and logical calendar validity.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Validates 'YYYY-MM' month string format and range.
 */
export function isValidMonthString(monthStr: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return false;
  const [year, month] = monthStr.split("-").map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
}

/**
 * Returns current calendar date in Asia/Kolkata as 'YYYY-MM-DD'.
 */
export function getISTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Returns current calendar month in Asia/Kolkata as 'YYYY-MM'.
 */
export function getCurrentISTMonthString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_IST,
    year: "numeric",
    month: "2-digit",
  });
  return formatter.format(new Date()).slice(0, 7);
}

/**
 * Converts 'YYYY-MM-DD' string to a normalized UTC midnight Date for Prisma @db.Date fields.
 */
export function toPrismaDate(dateStr: string): Date {
  if (!isValidDateString(dateStr)) {
    throw new Error(`Invalid calendar date string: "${dateStr}". Expected format YYYY-MM-DD.`);
  }
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/**
 * Formats a Prisma @db.Date to canonical 'YYYY-MM-DD'.
 */
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Parses time string (e.g. "09:15", "09:15 AM", "2:30 PM", "14:30") on a given
 * calendar date 'YYYY-MM-DD' into an absolute Date object in Asia/Kolkata (+05:30).
 */
export function parseISTTimeToDate(dateStr: string, timeStr: string): Date {
  if (!isValidDateString(dateStr)) {
    throw new Error(`Invalid date string: "${dateStr}". Expected format YYYY-MM-DD.`);
  }

  const trimmed = timeStr.trim();

  // If already an ISO string, validate and return
  if (trimmed.includes("T") && !isNaN(Date.parse(trimmed))) {
    return new Date(trimmed);
  }

  // Regex matching "HH:mm", "HH:mm:ss", "hh:mm AM/PM", "h:mm am/pm"
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM|am|pm))?$/;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error(
      `Invalid time format: "${timeStr}". Expected "HH:mm" (24h) or "hh:mm AM/PM" (12h).`
    );
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] ? parseInt(match[3], 10) : 0;
  const modifier = match[4] ? match[4].toUpperCase() : null;

  if (modifier) {
    if (hours < 1 || hours > 12) {
      throw new Error(`Invalid 12-hour value: ${hours}. Must be between 1 and 12.`);
    }
    if (modifier === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
  } else {
    if (hours < 0 || hours > 23) {
      throw new Error(`Invalid 24-hour value: ${hours}. Must be between 0 and 23.`);
    }
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes value: ${minutes}. Must be between 0 and 59.`);
  }

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  // Construct ISO timestamp explicitly with Asia/Kolkata offset (+05:30)
  return new Date(`${dateStr}T${hh}:${mm}:${ss}+05:30`);
}

/**
 * Formats a Date object to "hh:mm A" in Asia/Kolkata timezone.
 */
export function formatISTTime(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE_IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Computes the start and end Date boundaries for a 'YYYY-MM' month in Prisma @db.Date representation.
 */
export function getMonthDateRange(monthStr: string): {
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
} {
  if (!isValidMonthString(monthStr)) {
    throw new Error(`Invalid month string: "${monthStr}". Expected format YYYY-MM.`);
  }

  const [year, month] = monthStr.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const startDateStr = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDateStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return {
    startDate: toPrismaDate(startDateStr),
    endDate: toPrismaDate(endDateStr),
    startDateStr,
    endDateStr,
  };
}
