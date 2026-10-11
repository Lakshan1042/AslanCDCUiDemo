'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Clock, Calendar, CheckSquare, Edit,
  RefreshCw, AlertCircle, CheckCircle2, X, History,
  Info, ShieldCheck, Filter, ChevronLeft, ChevronRight,
  User as UserIcon
} from 'lucide-react';

export interface AttendanceRecordItem {
  id: number;
  therapistId: number;
  therapistName: string;
  therapistCode: string;
  specialization: string;
  therapistStatus?: string;
  attendanceDate: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  punchIn: string | null;
  attendanceTime: string | null; // e.g. "09:15 AM"
  reason: string | null;
  hasCorrections: boolean;
  correctionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionHistoryItem {
  id: number;
  adminUserId: number;
  adminUsername: string;
  prevStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  prevTime: string | null;
  prevTimeRaw: string | null;
  newTime: string | null;
  newTimeRaw: string | null;
  prevReason: string | null;
  newReason: string | null;
  correctionReason: string;
  createdAt: string;
}

interface TherapistOption {
  id: number;
  name: string;
  therapistCode: string;
  specialization?: string;
  status: string;
}

// Helpers for IST dates
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

function formatDisplayDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatDisplayDateTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoStr;
  }
}

export const AdminAttendanceView: React.FC = () => {
  // Data states
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [therapists, setTherapists] = useState<TherapistOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter states
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthIST());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mark Modal state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState<boolean>(false);
  const [markTherapistId, setMarkTherapistId] = useState<string>('');
  const [markDate, setMarkDate] = useState<string>(getTodayIST());
  const [markStatus, setMarkStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE'>('PRESENT');
  const [markTime, setMarkTime] = useState<string>('09:00 AM');
  const [markReason, setMarkReason] = useState<string>('');
  const [markFormError, setMarkFormError] = useState<string | null>(null);
  const [isSubmittingMark, setIsSubmittingMark] = useState<boolean>(false);

  // Correct Modal state
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState<boolean>(false);
  const [activeRecordForCorrection, setActiveRecordForCorrection] = useState<AttendanceRecordItem | null>(null);
  const [correctStatus, setCorrectStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE'>('PRESENT');
  const [correctTime, setCorrectTime] = useState<string>('09:00 AM');
  const [correctReason, setCorrectReason] = useState<string>('');
  const [correctionReasonInput, setCorrectionReasonInput] = useState<string>('');
  const [correctFormError, setCorrectFormError] = useState<string | null>(null);
  const [isSubmittingCorrect, setIsSubmittingCorrect] = useState<boolean>(false);

  // History Modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historyTargetRecord, setHistoryTargetRecord] = useState<AttendanceRecordItem | null>(null);
  const [historyItems, setHistoryItems] = useState<CorrectionHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Auto-dismiss success toast
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Load therapists list
  const fetchTherapists = useCallback(async () => {
    try {
      const res = await fetch('/api/therapists', { credentials: 'include' });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && Array.isArray(json?.data)) {
        setTherapists(
          json.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            therapistCode: t.therapistCode,
            specialization: t.specialization,
            status: t.status,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load therapists:', err);
    }
  }, []);

  // Load attendance records
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (selectedTherapistId !== 'all') {
        params.set('therapistId', selectedTherapistId);
      }
      if (selectedDate) {
        params.set('date', selectedDate);
      } else if (selectedMonth) {
        params.set('month', selectedMonth);
      }

      const res = await fetch(`/api/attendance/admin/records?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setErrorMessage(json?.message || 'Failed to fetch attendance records');
        return;
      }

      setRecords(json.data || []);
    } catch (err: any) {
      console.error('Error fetching attendance records:', err);
      setErrorMessage(err?.message || 'Network error while fetching attendance records');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTherapistId, selectedDate, selectedMonth]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Client-side filtering for search & status
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = rec.therapistName.toLowerCase().includes(q);
        const matchesCode = rec.therapistCode.toLowerCase().includes(q);
        const matchesDate = rec.attendanceDate.includes(q);
        if (!matchesName && !matchesCode && !matchesDate) return false;
      }
      return true;
    });
  }, [records, statusFilter, searchQuery]);

  // KPI Summary
  const kpiSummary = useMemo(() => {
    return {
      total: filteredRecords.length,
      present: filteredRecords.filter((r) => r.status === 'PRESENT').length,
      late: filteredRecords.filter((r) => r.status === 'LATE').length,
      absent: filteredRecords.filter((r) => r.status === 'ABSENT').length,
      onLeave: filteredRecords.filter((r) => r.status === 'ON_LEAVE').length,
    };
  }, [filteredRecords]);

  // Pagination (Max 10 records per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTherapistId, selectedMonth, selectedDate, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / RECORDS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, filteredRecords.length);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, startIndex, endIndex]);

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

  // Open Mark Modal
  const handleOpenMarkModal = (preselectedTherapistId?: number) => {
    setMarkFormError(null);
    setMarkTherapistId(preselectedTherapistId ? String(preselectedTherapistId) : (therapists[0]?.id ? String(therapists[0].id) : ''));
    setMarkDate(getTodayIST());
    setMarkStatus('PRESENT');
    setMarkTime('09:00 AM');
    setMarkReason('');
    setIsMarkModalOpen(true);
  };

  // Submit Mark Attendance
  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarkFormError(null);

    const tId = Number(markTherapistId);
    if (!tId || isNaN(tId)) {
      setMarkFormError('Please select a valid therapist.');
      return;
    }

    if (!markDate) {
      setMarkFormError('Please select an attendance date.');
      return;
    }

    if ((markStatus === 'PRESENT' || markStatus === 'LATE') && !markTime.trim()) {
      setMarkFormError(`Attendance time is required when marking ${markStatus}.`);
      return;
    }

    if (markStatus === 'ON_LEAVE' && markReason.trim().length < 3) {
      setMarkFormError('A specific reason (minimum 3 characters) is required when marking ON LEAVE.');
      return;
    }

    setIsSubmittingMark(true);
    try {
      const res = await fetch('/api/attendance/admin/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          therapistId: tId,
          attendanceDate: markDate,
          status: markStatus,
          attendanceTime: (markStatus === 'PRESENT' || markStatus === 'LATE') ? markTime.trim() : null,
          reason: markStatus === 'ON_LEAVE' ? markReason.trim() : null,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setMarkFormError(json?.message || 'Failed to mark attendance.');
        return;
      }

      setIsMarkModalOpen(false);
      setSuccessToast(`Attendance marked successfully for ${json.data.therapistName}.`);
      fetchRecords();
    } catch (err: any) {
      console.error('Mark attendance submission error:', err);
      setMarkFormError(err?.message || 'Network error submitting attendance.');
    } finally {
      setIsSubmittingMark(false);
    }
  };

  // Open Correct Modal
  const handleOpenCorrectModal = (record: AttendanceRecordItem) => {
    setActiveRecordForCorrection(record);
    setCorrectFormError(null);
    setCorrectStatus(record.status);
    setCorrectTime(record.attendanceTime || '09:00 AM');
    setCorrectReason(record.reason || '');
    setCorrectionReasonInput('');
    setIsCorrectModalOpen(true);
  };

  // Submit Correction
  const handleCorrectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecordForCorrection) return;
    setCorrectFormError(null);

    if ((correctStatus === 'PRESENT' || correctStatus === 'LATE') && !correctTime.trim()) {
      setCorrectFormError(`Attendance time is required for ${correctStatus}.`);
      return;
    }

    if (correctStatus === 'ON_LEAVE' && correctReason.trim().length < 3) {
      setCorrectFormError('A valid leave reason (minimum 3 characters) is required for ON LEAVE.');
      return;
    }

    if (!correctionReasonInput.trim() || correctionReasonInput.trim().length < 3) {
      setCorrectFormError('An administrative explanation (minimum 3 characters) is mandatory to audit this change.');
      return;
    }

    setIsSubmittingCorrect(true);
    try {
      const res = await fetch(`/api/attendance/admin/records/${activeRecordForCorrection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: correctStatus,
          attendanceTime: (correctStatus === 'PRESENT' || correctStatus === 'LATE') ? correctTime.trim() : null,
          reason: correctStatus === 'ON_LEAVE' ? correctReason.trim() : null,
          correctionReason: correctionReasonInput.trim(),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setCorrectFormError(json?.message || 'Failed to correct attendance record.');
        return;
      }

      setIsCorrectModalOpen(false);
      setSuccessToast(`Attendance corrected successfully for ${activeRecordForCorrection.therapistName}.`);
      fetchRecords();
    } catch (err: any) {
      console.error('Correction submission error:', err);
      setCorrectFormError(err?.message || 'Network error saving correction.');
    } finally {
      setIsSubmittingCorrect(false);
    }
  };

  // Open History Modal
  const handleOpenHistoryModal = async (record: AttendanceRecordItem) => {
    setHistoryTargetRecord(record);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryError(null);
    setHistoryItems([]);

    try {
      const res = await fetch(`/api/attendance/admin/records/${record.id}/corrections`, {
        credentials: 'include',
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        setHistoryError(json?.message || 'Failed to fetch correction history.');
        return;
      }

      setHistoryItems(json.data.corrections || []);
    } catch (err: any) {
      console.error('History fetch error:', err);
      setHistoryError(err?.message || 'Network error loading correction history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(Date.UTC(year, month - 2, 1));
    const newMonthStr = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
    setSelectedDate('');
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(Date.UTC(year, month, 1));
    const newMonthStr = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
    setSelectedDate('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-80 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-clinic-700" />
            <span>Therapist Attendance</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Record daily attendance logs, review clinic history, and audit administrative corrections.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenMarkModal()}
            className="px-4 py-2.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs transition shadow-md shadow-clinic-700/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by therapist name, code, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none font-medium text-slate-700"
            />
          </div>

          {/* Therapist Dropdown Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Therapists ({therapists.length})</option>
              {therapists.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name} ({t.therapistCode})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector with Stepper */}
          <div className="lg:col-span-3 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 hover:bg-white rounded-lg text-slate-500 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value);
                  setSelectedDate('');
                }
              }}
              className="w-full bg-transparent text-center font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            />
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 hover:bg-white rounded-lg text-slate-500 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Optional Single-Date Filter */}
          <div className="lg:col-span-2 flex items-center gap-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Filter by exact date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                title="Clear single date filter"
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE'] as const).map((st) => {
              const active = statusFilter === st;
              const labels: Record<string, string> = {
                all: 'All',
                PRESENT: 'Present',
                LATE: 'Late',
                ABSENT: 'Absent',
                ON_LEAVE: 'On Leave',
              };
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[st]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchRecords()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs py-1 px-2.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Refresh Attendance List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Records</span>
            <div className="text-xl font-black text-slate-800 mt-0.5">{kpiSummary.total}</div>
          </div>
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Present</span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{kpiSummary.present}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Late</span>
            <div className="text-xl font-black text-amber-700 mt-0.5">{kpiSummary.late}</div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Absent</span>
            <div className="text-xl font-black text-rose-700 mt-0.5">{kpiSummary.absent}</div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
            <X className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">On Leave</span>
            <div className="text-xl font-black text-indigo-700 mt-0.5">{kpiSummary.onLeave}</div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table / Content Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        {errorMessage && (
          <div className="p-6 bg-rose-50 border-b border-rose-100 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-bold">{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchRecords()}
              className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-rose-700 font-bold hover:bg-rose-100"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-clinic-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">Loading attendance records...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-20 text-center px-4 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">No attendance records found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || selectedDate
                ? 'No logs match your current search or filters. Try adjusting your parameters.'
                : 'No attendance has been recorded for the selected month yet.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleOpenMarkModal()}
                className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mark Attendance Now</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Table Counter Header */}
            <div className="px-6 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Showing <strong className="text-slate-700">{startIndex + 1}</strong> to{' '}
                  <strong className="text-slate-700">{endIndex}</strong> of{' '}
                  <strong className="text-slate-700">{filteredRecords.length}</strong> attendance records
                </span>
              </div>
              {totalPages > 1 && (
                <span className="text-[11px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Page {validCurrentPage} of {totalPages}
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Therapist</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Attendance Time</th>
                    <th className="px-6 py-4">Leave Reason / Notes</th>
                    <th className="px-6 py-4">Audit Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{formatDisplayDate(rec.attendanceDate)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.attendanceDate}</div>
                    </td>

                    {/* Therapist Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rec.therapistName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {rec.therapistCode} • {rec.specialization}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rec.status === 'PRESENT' && (
                        <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Present
                        </span>
                      )}
                      {rec.status === 'LATE' && (
                        <span className="px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Late
                        </span>
                      )}
                      {rec.status === 'ABSENT' && (
                        <span className="px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 text-[11px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          Absent
                        </span>
                      )}
                      {rec.status === 'ON_LEAVE' && (
                        <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] inline-flex items-center gap-1">
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
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Leave Reason / Notes */}
                    <td className="px-6 py-4">
                      {rec.reason ? (
                        <div className="max-w-xs truncate text-slate-600 font-medium" title={rec.reason}>
                          {rec.reason}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Audit Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rec.hasCorrections ? (
                        <button
                          onClick={() => handleOpenHistoryModal(rec)}
                          className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition inline-flex items-center gap-1 cursor-pointer"
                          title="Click to view correction timeline"
                        >
                          <History className="w-3 h-3 text-purple-500" />
                          <span>Corrected ({rec.correctionCount})</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-slate-50 text-slate-500 border border-slate-200">
                          Original
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => handleOpenCorrectModal(rec)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                        title="Edit or correct this attendance record"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Correct</span>
                      </button>

                      <button
                        onClick={() => handleOpenHistoryModal(rec)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
                        title="View audit history"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              {filteredRecords.length === 0 ? (
                <span>Showing 0 records</span>
              ) : (
                <span>
                  Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to{' '}
                  <span className="font-bold text-slate-700">{endIndex}</span> of{' '}
                  <span className="font-bold text-slate-700">{filteredRecords.length}</span> records
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

      {/* ────────────────── MODAL 1: MARK ATTENDANCE ────────────────── */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-800">Mark Therapist Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Record attendance for clinic therapists.</p>
              </div>
              <button
                onClick={() => setIsMarkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkSubmit} className="p-6 space-y-4 text-xs">
              {markFormError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="font-semibold leading-relaxed">{markFormError}</div>
                </div>
              )}

              {/* Therapist Selection */}
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1 text-[10px] tracking-wider">
                  Select Therapist <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={markTherapistId}
                  onChange={(e) => setMarkTherapistId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-none"
                >
                  <option value="" disabled>-- Select Active Therapist --</option>
                  {therapists
                    .filter((t) => t.status === 'ACTIVE')
                    .map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name} ({t.therapistCode}) • {t.specialization}
                      </option>
                    ))}
                </select>
              </div>

              {/* Attendance Date */}
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1 text-[10px] tracking-wider">
                  Attendance Date <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={markDate}
                  onChange={(e) => setMarkDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Attendance Status Selector */}
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5 text-[10px] tracking-wider">
                  Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PRESENT', label: 'Present', color: 'emerald' },
                    { id: 'LATE', label: 'Late', color: 'amber' },
                    { id: 'ABSENT', label: 'Absent', color: 'rose' },
                    { id: 'ON_LEAVE', label: 'On Leave', color: 'indigo' },
                  ].map((item) => {
                    const isSelected = markStatus === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setMarkStatus(item.id as any)}
                        className={`p-2.5 rounded-xl border font-bold text-xs transition text-center cursor-pointer ${
                          isSelected
                            ? item.id === 'PRESENT'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                              : item.id === 'LATE'
                              ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                              : item.id === 'ABSENT'
                              ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                              : 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Field: Time (for PRESENT or LATE) */}
              {(markStatus === 'PRESENT' || markStatus === 'LATE') && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Attendance Punch Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={markTime}
                    onChange={(e) => setMarkTime(e.target.value)}
                    placeholder="e.g. 09:15 AM or 09:15"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Enter the time the therapist arrived at the clinic. Formats accepted: 12-hour (09:15 AM) or 24-hour (09:15).
                  </p>
                </div>
              )}

              {/* Conditional Banner: ABSENT */}
              {markStatus === 'ABSENT' && (
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>No punch-in time is assigned for absent therapists.</span>
                </div>
              )}

              {/* Conditional Field: Reason (for ON_LEAVE) */}
              {markStatus === 'ON_LEAVE' && (
                <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                  <label className="block font-bold text-indigo-950 uppercase text-[10px] tracking-wider">
                    Reason for Leave <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={markReason}
                    onChange={(e) => setMarkReason(e.target.value)}
                    placeholder="Specify leave reason (e.g., Medical Emergency, Sick Leave, Family Event)..."
                    className="w-full bg-white border border-indigo-200 rounded-xl p-3 font-medium text-slate-800 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-indigo-700">
                    A meaningful explanation (min 3 characters) is required for compliance audit.
                  </p>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={isSubmittingMark}
                  onClick={() => setIsMarkModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMark}
                  className="px-5 py-2.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingMark ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Attendance</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL 2: CORRECT ATTENDANCE ────────────────── */}
      {isCorrectModalOpen && activeRecordForCorrection && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-800">Correct Attendance Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeRecordForCorrection.therapistName} ({activeRecordForCorrection.therapistCode}) • {formatDisplayDate(activeRecordForCorrection.attendanceDate)}
                </p>
              </div>
              <button
                onClick={() => setIsCorrectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCorrectSubmit} className="p-6 space-y-4 text-xs">
              {correctFormError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="font-semibold leading-relaxed">{correctFormError}</div>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1.5 text-[10px] tracking-wider">
                  Update Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'PRESENT', label: 'Present' },
                    { id: 'LATE', label: 'Late' },
                    { id: 'ABSENT', label: 'Absent' },
                    { id: 'ON_LEAVE', label: 'On Leave' },
                  ].map((item) => {
                    const isSelected = correctStatus === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setCorrectStatus(item.id as any)}
                        className={`p-2.5 rounded-xl border font-bold text-xs transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Field: Time */}
              {(correctStatus === 'PRESENT' || correctStatus === 'LATE') && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Corrected Punch-In Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={correctTime}
                    onChange={(e) => setCorrectTime(e.target.value)}
                    placeholder="e.g. 09:15 AM or 09:15"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              )}

              {/* Conditional Field: Reason (for ON_LEAVE) */}
              {correctStatus === 'ON_LEAVE' && (
                <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2">
                  <label className="block font-bold text-indigo-950 uppercase text-[10px] tracking-wider">
                    Leave Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={correctReason}
                    onChange={(e) => setCorrectReason(e.target.value)}
                    placeholder="Specify leave reason..."
                    className="w-full bg-white border border-indigo-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none text-xs"
                  />
                </div>
              )}

              {/* Mandatory Correction Explanation */}
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                <label className="block font-bold text-amber-950 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Mandatory Correction Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionReasonInput}
                  onChange={(e) => setCorrectionReasonInput(e.target.value)}
                  placeholder="State the justification for this administrative change (e.g. Therapist reported biometric malfunction, verified with shift log)..."
                  className="w-full bg-white border border-amber-200 rounded-xl p-3 font-medium text-slate-800 focus:outline-none text-xs"
                />
                <p className="text-[10px] text-amber-700">
                  This explanation will be permanently recorded in the audit log alongside your Admin identity.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={isSubmittingCorrect}
                  onClick={() => setIsCorrectModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCorrect}
                  className="px-5 py-2.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingCorrect ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Audit...</span>
                    </>
                  ) : (
                    <span>Apply Correction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL 3: CORRECTION AUDIT HISTORY ────────────────── */}
      {isHistoryModalOpen && historyTargetRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <span>Attendance Audit History</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {historyTargetRecord.therapistName} ({historyTargetRecord.therapistCode}) • {formatDisplayDate(historyTargetRecord.attendanceDate)}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Snapshot Banner */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="text-slate-500 font-bold">Current Live Record:</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800">{historyTargetRecord.status}</span>
                {historyTargetRecord.attendanceTime && (
                  <span className="text-slate-500">• {historyTargetRecord.attendanceTime}</span>
                )}
                {historyTargetRecord.reason && (
                  <span className="text-slate-500 italic">• &quot;{historyTargetRecord.reason}&quot;</span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {isLoadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-400 font-medium">Loading audit history...</span>
                </div>
              ) : historyError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{historyError}</span>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-700">No administrative corrections on record</div>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    This attendance entry has not undergone any administrative edits and reflects its original values.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {historyItems.map((item, idx) => (
                    <div key={item.id} className="relative space-y-2">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-600 border-2 border-white shadow-sm"></div>

                      {/* Header */}
                      <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                        <span className="font-black text-slate-800">
                          Correction #{historyItems.length - idx} by Admin: {item.adminUsername}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {formatDisplayDateTime(item.createdAt)}
                        </span>
                      </div>

                      {/* Transitions Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Status</span>
                            <div className="font-semibold text-slate-700">
                              <span className="text-rose-600 line-through mr-1.5">{item.prevStatus}</span>
                              <span className="text-emerald-700 font-bold">→ {item.newStatus}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Time</span>
                            <div className="font-semibold text-slate-700">
                              <span className="text-slate-400 line-through mr-1.5">{item.prevTime || 'None'}</span>
                              <span className="text-slate-800 font-bold">→ {item.newTime || 'None'}</span>
                            </div>
                          </div>
                        </div>

                        {(item.prevReason || item.newReason) && (
                          <div className="pt-2 border-t border-slate-200/80 text-[11px]">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Leave Reason</span>
                            <div className="text-slate-600">
                              <span className="line-through text-slate-400 mr-1.5">{item.prevReason || 'None'}</span>
                              <span className="text-slate-800 font-semibold">→ {item.newReason || 'None'}</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Admin Explanation</span>
                          <p className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium italic">
                            &quot;{item.correctionReason}&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
