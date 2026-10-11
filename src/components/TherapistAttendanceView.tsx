'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Calendar, Clock, CheckSquare, AlertCircle, X,
  ChevronLeft, ChevronRight, RefreshCw, UserCheck,
  Info, CalendarDays
} from 'lucide-react';

export interface TherapistAttendanceRecord {
  id: number;
  attendanceDate: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  punchIn: string | null;
  attendanceTime: string | null; // e.g. "09:15 AM"
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistAttendanceSummary {
  totalMarked: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}

export interface TherapistOwnAttendanceResponse {
  therapist: {
    id: number;
    name: string;
    therapistCode: string;
    specialization: string;
  };
  month: string; // YYYY-MM
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: TherapistAttendanceSummary;
  records: TherapistAttendanceRecord[];
}

// Helper functions for Asia/Kolkata timezone
function getTodayIST(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getCurrentMonthIST(): string {
  return getTodayIST().slice(0, 7);
}

function formatMonthTitle(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, 1));
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return monthStr;
  }
}

function formatDisplayDate(dateStr: string): { formatted: string; dayOfWeek: string } {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    const formatted = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const dayOfWeek = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      weekday: 'short',
    }).format(d);
    return { formatted, dayOfWeek };
  } catch {
    return { formatted: dateStr, dayOfWeek: '' };
  }
}

export const TherapistAttendanceView: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthIST());
  const [data, setData] = useState<TherapistOwnAttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref to track latest request ID and prevent stale race condition overwrites
  const latestRequestIdRef = useRef<number>(0);

  const fetchAttendance = useCallback(async (monthToFetch: string) => {
    const requestId = ++latestRequestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/attendance/me?month=${encodeURIComponent(monthToFetch)}`, {
        credentials: 'include',
      });

      // Ignore response if a newer request was dispatched while waiting
      if (requestId !== latestRequestIdRef.current) return;

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        if (res.status === 401 || res.status === 403) {
          setErrorMessage(json?.message || 'Session expired or unauthorized. Please re-login.');
        } else {
          setErrorMessage(json?.message || 'Failed to fetch attendance records.');
        }
        setData(null);
        return;
      }

      setData(json.data);
    } catch (err: any) {
      if (requestId !== latestRequestIdRef.current) return;
      console.error('Error fetching therapist attendance:', err);
      setErrorMessage(err?.message || 'Network error while retrieving attendance logs.');
      setData(null);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAttendance(selectedMonth);
  }, [selectedMonth, fetchAttendance]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(Date.UTC(year, month - 2, 1));
    const newMonthStr = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month, 1));
    const newMonthStr = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleResetCurrentMonth = () => {
    const cur = getCurrentMonthIST();
    if (selectedMonth !== cur) {
      setSelectedMonth(cur);
    } else {
      fetchAttendance(cur);
    }
  };

  const currentMonthStr = getCurrentMonthIST();
  const isCurrentMonth = selectedMonth === currentMonthStr;

  const records = useMemo(() => data?.records || [], [data?.records]);
  const summary = data?.summary || {
    totalMarked: 0,
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
  };

  // Pagination (Max 10 records per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  const totalPages = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, records.length);
  const paginatedRecords = useMemo(() => {
    return records.slice(startIndex, endIndex);
  }, [records, startIndex, endIndex]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (validCurrentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-clinic-700" />
            <span>My Attendance</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            View your official monthly attendance records and shift logs marked by the clinic administration.
          </p>
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-800 whitespace-nowrap min-w-[120px] text-center">
                {formatMonthTitle(selectedMonth)}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedMonth(e.target.value);
                  }
                }}
                className="sr-only"
                id="therapist-month-picker"
              />
              <label
                htmlFor="therapist-month-picker"
                title="Select Specific Month"
                className="cursor-pointer text-slate-400 hover:text-slate-600 p-0.5"
              >
                <Calendar className="w-3.5 h-3.5" />
              </label>
            </div>

            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={handleResetCurrentMonth}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer whitespace-nowrap"
            >
              This Month
            </button>
          )}

          <button
            onClick={() => fetchAttendance(selectedMonth)}
            disabled={isLoading}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm transition cursor-pointer disabled:opacity-50"
            title="Refresh Attendance Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-clinic-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Monthly Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Marked */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Marked</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">
              {isLoading ? '—' : summary.totalMarked}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">working days</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Present */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Present</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {isLoading ? '—' : summary.present}
            </div>
            <span className="text-[10px] text-emerald-600/80 font-semibold">on-time shifts</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Late */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Late</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">
              {isLoading ? '—' : summary.late}
            </div>
            <span className="text-[10px] text-amber-600/80 font-semibold">delayed arrivals</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Absent</span>
            <div className="text-2xl font-black text-rose-700 mt-0.5">
              {isLoading ? '—' : summary.absent}
            </div>
            <span className="text-[10px] text-rose-600/80 font-semibold">unexcused</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
            <X className="w-5 h-5" />
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">On Leave</span>
            <div className="text-2xl font-black text-indigo-700 mt-0.5">
              {isLoading ? '—' : summary.onLeave}
            </div>
            <span className="text-[10px] text-indigo-600/80 font-semibold">approved leave</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        {/* Error State Banner */}
        {errorMessage && (
          <div className="p-5 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-bold">{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchAttendance(selectedMonth)}
              className="px-3.5 py-1.5 bg-white border border-rose-200 rounded-xl text-rose-700 font-bold hover:bg-rose-100 transition cursor-pointer self-start sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-clinic-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">Loading your attendance records...</span>
          </div>
        ) : records.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">
              No attendance records found for {formatMonthTitle(selectedMonth)}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Attendance records for this month have not been logged yet by clinic administration. When attendance is marked, your verified daily records will appear here.
            </p>
            {!isCurrentMonth && (
              <div className="pt-2">
                <button
                  onClick={handleResetCurrentMonth}
                  className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Current Month</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Table Header Counter */}
            <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Showing <strong className="text-slate-700">{startIndex + 1}</strong> to{' '}
                  <strong className="text-slate-700">{endIndex}</strong> of{' '}
                  <strong className="text-slate-700">{records.length}</strong> attendance records for{' '}
                  <strong className="text-slate-700">{formatMonthTitle(selectedMonth)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {totalPages > 1 && (
                  <span className="text-[11px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Page {validCurrentPage} of {totalPages}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {data?.therapist?.name} ({data?.therapist?.therapistCode})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">Attendance Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Attendance Time</th>
                  <th className="px-6 py-4">Leave Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedRecords.map((rec) => {
                  const { formatted, dayOfWeek } = formatDisplayDate(rec.attendanceDate);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                      {/* Attendance Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-slate-800 text-xs">{formatted}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {dayOfWeek}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rec.attendanceDate}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rec.status === 'PRESENT' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Present
                          </span>
                        )}
                        {rec.status === 'LATE' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Late
                          </span>
                        )}
                        {rec.status === 'ABSENT' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Absent
                          </span>
                        )}
                        {rec.status === 'ON_LEAVE' && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            On Leave
                          </span>
                        )}
                      </td>

                      {/* Attendance Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rec.attendanceTime ? (
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rec.attendanceTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono select-none">—</span>
                        )}
                      </td>

                      {/* Leave Reason / Notes */}
                      <td className="px-6 py-4">
                        {rec.reason ? (
                          <div className="max-w-md text-slate-700 font-medium" title={rec.reason}>
                            {rec.reason}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono select-none">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {records.length === 0 ? (
                <span>Showing 0 records</span>
              ) : (
                <span>
                  Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to{' '}
                  <span className="font-bold text-slate-700">{endIndex}</span> of{' '}
                  <span className="font-bold text-slate-700">{records.length}</span> records
                </span>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={validCurrentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageItem, idx) => {
                    if (pageItem === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-400 font-bold select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(pageItem);
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-8 h-8 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-clinic-700 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Clinic Attendance Policy Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-3">
        <UserCheck className="w-4 h-4 text-clinic-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-700">Official Clinical Records</span>
          <p className="text-[11px] leading-relaxed">
            Attendance entries, timestamps, and leave statuses are authenticated and audited by Aslan CDC management. If you notice a discrepancy with your shift log, please contact clinic administration.
          </p>
        </div>
      </div>
    </div>
  );
};
