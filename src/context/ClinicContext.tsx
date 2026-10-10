'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Patient,
  Therapist,
  Appointment,
  Goal,
  Session,
  InventoryItem,
  Cupboard,
  Invoice,
  AttendanceRecord,
  Assessment,
  ParentFeedback,
  HomeworkItem,
  ParentComplaint
} from '../types';
import {
  mockPatients,
  mockTherapists,
  mockAppointments,
  mockGoals,
  mockSessions,
  mockInventory,
  mockCupboards,
  mockInvoices,
  mockAttendanceRecords,
  mockAssessments,
  mockFeedbacks,
  mockHomeworks,
  mockComplaints
} from '../data/mockData';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'THERAPIST' | 'PARENT';
  status?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
}

interface ClinicContextType {
  // Data State
  patients: Patient[];
  therapists: Therapist[];
  appointments: Appointment[];
  goals: Goal[];
  sessions: Session[];
  inventory: InventoryItem[];
  cupboards: Cupboard[];
  invoices: Invoice[];
  attendanceRecords: AttendanceRecord[];
  assessments: Assessment[];
  feedbacks: ParentFeedback[];
  homeworks: HomeworkItem[];
  complaints: ParentComplaint[];

  // Authentication & Session State
  currentUser: AuthUser | null;
  currentRole: 'admin' | 'therapist' | 'parent' | null;
  currentPage: string;
  activeTherapistId: string;
  activePatientId: string; // for Parent Portal (child selector) or detail views
  isAuthChecking: boolean;

  // State Setters & Auth Actions
  setCurrentUser: (user: AuthUser | null) => void;
  setCurrentRole: (role: 'admin' | 'therapist' | 'parent' | null) => void;
  setCurrentPage: (page: string) => void;
  setActiveTherapistId: (id: string) => void;
  setActivePatientId: (id: string) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; role?: 'admin' | 'therapist' | 'parent' }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'assignedTherapistName'> & { initialPassword?: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  updatePatientLockStatus: (id: string, isLocked: boolean) => void;
  assignSecondaryTherapist: (patientId: string, therapistId: string, isPrimary?: boolean) => Promise<{ success: boolean; error?: string }>;
  changePrimaryTherapist: (patientId: string, therapistId: string) => Promise<{ success: boolean; error?: string }>;
  unassignTherapist: (patientId: string, therapistId: string, replacementTherapistId?: string) => Promise<{ success: boolean; error?: string }>;
  refreshPatients: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  addTherapist: (therapist: Omit<Therapist, 'id' | 'assignedPatients' | 'todaySessionsCount'>) => void;
  deleteTherapist: (id: string) => void;
  bookAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status'], reason?: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'timeline' | 'progressPercent'>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progressPercent: number, note: string) => void;
  completeGoal: (id: string) => void;
  addSession: (session: Session) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'availableQuantity'>) => void;
  moveInventoryItem: (itemId: string, targetCupboard: string, targetShelf: string) => void;
  addAssessment: (assessment: Omit<Assessment, 'id' | 'previousScore'>) => void;
  markAttendance: (recordId: string, checkIn?: string, checkOut?: string, status?: AttendanceRecord['status'], notes?: string) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  addFeedback: (fb: Omit<ParentFeedback, 'id' | 'date'>) => void;
  toggleHomeworkStatus: (id: string, proofSent?: boolean, parentComments?: string) => void;
  addHomework: (hw: Omit<HomeworkItem, 'id' | 'status' | 'assignedDate'>) => void;
  addComplaint: (complaint: Omit<ParentComplaint, 'id' | 'date' | 'status'>) => void;
  updateComplaintStatus: (id: string, status: ParentComplaint['status'], resolutionNotes?: string) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const getStorageItem = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const raw = getStorageItem<Patient[]>('ot_patients', mockPatients);
    return raw.map((p) => {
      if (!p.patientCode && p.id?.startsWith('pt-')) {
        const num = p.id.replace('pt-', '').padStart(3, '0');
        return { ...p, patientCode: `PT-2026-${num}` };
      }
      return p;
    });
  });
  const [therapists, setTherapists] = useState<Therapist[]>(() => getStorageItem('ot_therapists', mockTherapists));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStorageItem('ot_appointments', mockAppointments));
  const [goals, setGoals] = useState<Goal[]>(() => getStorageItem('ot_goals', mockGoals));
  const [sessions, setSessions] = useState<Session[]>(() => getStorageItem('ot_sessions', mockSessions));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStorageItem('ot_inventory', mockInventory));
  const [cupboards, setCupboards] = useState<Cupboard[]>(() => getStorageItem('ot_cupboards', mockCupboards));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStorageItem('ot_invoices', mockInvoices));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getStorageItem('ot_attendance', mockAttendanceRecords));
  const [assessments, setAssessments] = useState<Assessment[]>(() => getStorageItem('ot_assessments', mockAssessments));
  const [feedbacks, setFeedbacks] = useState<ParentFeedback[]>(() => getStorageItem('ot_feedbacks', mockFeedbacks));
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(() => getStorageItem('ot_homeworks', mockHomeworks));
  const [complaints, setComplaints] = useState<ParentComplaint[]>(() => getStorageItem('ot_complaints', mockComplaints));

  // Authentication & Navigation states
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<'admin' | 'therapist' | 'parent' | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [activeTherapistId, setActiveTherapistId] = useState<string>('th-1'); // Dr. Priya Raman as active therapist user
  const [activePatientId, setActivePatientId] = useState<string>('pt-1'); // Kavin Raj as active child/patient selection
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Restore session from server on mount / refresh
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.success && json?.data) {
          const user: AuthUser = json.data;
          setCurrentUser(user);
          const role = user.role.toLowerCase() as 'admin' | 'therapist' | 'parent';
          setCurrentRole(role);
          if (role === 'therapist') {
            const matched = therapists.find(
              t => t.email.toLowerCase() === user.email.toLowerCase()
            );
            if (matched) {
              setActiveTherapistId(matched.id);
            }
          }
          return;
        }
      }
      setCurrentUser(null);
      setCurrentRole(null);
    } catch (err) {
      console.error('Session check failed:', err);
      setCurrentUser(null);
      setCurrentRole(null);
    } finally {
      setIsAuthChecking(false);
    }
  }, [therapists]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        let msg = json?.message || 'Login failed';
        if (json?.errors) {
          const fieldErrors = Object.values(json.errors).flat() as string[];
          if (fieldErrors.length > 0) {
            msg = fieldErrors[0];
          }
        }
        return {
          success: false,
          error: msg,
        };
      }

      const user: AuthUser = json.data;
      setCurrentUser(user);
      const role = user.role.toLowerCase() as 'admin' | 'therapist' | 'parent';
      setCurrentRole(role);
      setCurrentPage('dashboard');

      if (role === 'therapist') {
        const matched = therapists.find(
          t => t.email.toLowerCase() === user.email.toLowerCase()
        );
        if (matched) {
          setActiveTherapistId(matched.id);
        }
      }

      return { success: true, role };
    } catch (err) {
      console.error('Login request failed:', err);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your network connection.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setCurrentRole(null);
      setCurrentPage('dashboard');
    }
  };

  // Sync to local storage for demo persistence
  useEffect(() => {
    localStorage.setItem('ot_patients', JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem('ot_therapists', JSON.stringify(therapists));
  }, [therapists]);
  useEffect(() => {
    localStorage.setItem('ot_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('ot_goals', JSON.stringify(goals));
  }, [goals]);
  useEffect(() => {
    localStorage.setItem('ot_sessions', JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem('ot_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('ot_cupboards', JSON.stringify(cupboards));
  }, [cupboards]);
  useEffect(() => {
    localStorage.setItem('ot_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('ot_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);
  useEffect(() => {
    localStorage.setItem('ot_assessments', JSON.stringify(assessments));
  }, [assessments]);
  useEffect(() => {
    localStorage.setItem('ot_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);
  useEffect(() => {
    localStorage.setItem('ot_homeworks', JSON.stringify(homeworks));
  }, [homeworks]);
  useEffect(() => {
    localStorage.setItem('ot_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Adjust routing default page when switching roles
  useEffect(() => {
    setCurrentPage('dashboard');
  }, [currentRole]);

  // Refresh patients from API
  const refreshPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const apiPatients: Patient[] = json.data.map((p: any) => ({
            id: String(p.id),
            patientCode: p.patientCode,
            name: p.name,
            age: p.age ?? 6,
            gender: p.gender === 'FEMALE' ? 'Female' : 'Male',
            parentName: p.parent?.name || '',
            parentPhone: p.parent?.phone || '',
            parentEmail: p.parent?.email || '',
            address: p.parent?.address || '',
            assignedTherapistId: p.primaryTherapist ? `th-${p.primaryTherapist.id}` : (p.assignedTherapists?.[0] ? `th-${p.assignedTherapists[0].id}` : 'th-1'),
            assignedTherapistName: p.primaryTherapist?.name || p.assignedTherapists?.[0]?.name || 'Dr. Priya Raman',
            assignedTherapists: p.assignedTherapists || [],
            program: p.program || 'Sensory Integration Therapy',
            status: p.status === 'ON_HOLD' ? 'On Hold' : p.status === 'DISCHARGED' ? 'Discharged' : 'Active',
            isLocked: p.isLocked ?? false,
            primaryConcerns: p.primaryConcerns || '',
            currentPlan: p.currentPlan || '',
          }));
          setPatients(apiPatients);
        }
      }
    } catch (err) {
      console.error('Failed to load patients from API:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshPatients();
    }
  }, [currentUser, refreshPatients]);

  // Actions implementation
  const addPatient = async (patient: Omit<Patient, 'id' | 'assignedTherapistName'> & { initialPassword?: string }) => {
    try {
      const numericTherapistId = parseInt(patient.assignedTherapistId.replace(/\D/g, '') || '1', 10);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: patient.name,
          gender: patient.gender.toUpperCase(),
          program: patient.program,
          primaryConcerns: patient.primaryConcerns,
          currentPlan: patient.currentPlan,
          primaryTherapistId: numericTherapistId,
          parent: {
            name: patient.parentName,
            email: patient.parentEmail,
            phone: patient.parentPhone,
            address: patient.address,
            initialPassword: patient.initialPassword || 'Parent@12345',
          },
        }),
      });

      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        await refreshPatients();
        return { success: true, data: json.data };
      }
      return { success: false, error: json?.message || 'Failed to enroll patient' };
    } catch (err: any) {
      console.error('addPatient error:', err);
      return { success: false, error: err?.message || 'Failed to enroll patient' };
    }
  };

  const updatePatientStatus = async (id: string, status: Patient['status']) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      const apiStatus = status === 'On Hold' ? 'ON_HOLD' : status === 'Discharged' ? 'DISCHARGED' : 'ACTIVE';
      await fetch(`/api/patients/${numericId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: apiStatus }),
      }).catch(console.error);
    }
  };

  const updatePatientLockStatus = async (id: string, isLocked: boolean) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, isLocked } : p));
    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      await fetch(`/api/patients/${numericId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isLocked }),
      }).catch(console.error);
    }
  };

  const resolveNumericPatientId = (patientId: string): number => {
    if (/^\d+$/.test(patientId)) return parseInt(patientId, 10);
    if (/^pt-\d+$/i.test(patientId)) return parseInt(patientId.replace(/pt-/i, ''), 10);
    const matched = patients.find(p => p.patientCode === patientId || p.id === patientId);
    if (matched && /^\d+$/.test(matched.id)) return parseInt(matched.id, 10);
    return parseInt(patientId.replace(/\D/g, ''), 10);
  };

  const resolveNumericTherapistId = (therapistId: string | number): number => {
    if (typeof therapistId === 'number') return therapistId;
    if (/^\d+$/.test(therapistId)) return parseInt(therapistId, 10);
    if (/^th-\d+$/i.test(therapistId)) return parseInt(therapistId.replace(/th-/i, ''), 10);
    return parseInt(String(therapistId).replace(/\D/g, ''), 10);
  };

  const assignSecondaryTherapist = async (patientId: string, therapistId: string, isPrimary = false) => {
    const numPatId = resolveNumericPatientId(patientId);
    const numThId = resolveNumericTherapistId(therapistId);
    const targetTh = therapists.find(t => resolveNumericTherapistId(t.id) === numThId);

    // Optimistic state update so UI updates immediately
    setPatients(prev => prev.map(p => {
      const match = resolveNumericPatientId(p.id) === numPatId || p.id === patientId || p.patientCode === patientId;
      if (!match) return p;

      let currentAssigned = [...(p.assignedTherapists || [])];
      if (isPrimary) {
        currentAssigned = currentAssigned.map(at => ({ ...at, isPrimary: false }));
        const existingIdx = currentAssigned.findIndex(at => resolveNumericTherapistId(at.id) === numThId);
        if (existingIdx >= 0) {
          currentAssigned[existingIdx] = { ...currentAssigned[existingIdx], isPrimary: true };
        } else if (targetTh) {
          currentAssigned.push({
            id: targetTh.id,
            name: targetTh.name,
            specialization: targetTh.specialization,
            isPrimary: true,
          });
        }
        return {
          ...p,
          assignedTherapistId: targetTh ? `th-${resolveNumericTherapistId(targetTh.id)}` : p.assignedTherapistId,
          assignedTherapistName: targetTh ? targetTh.name : p.assignedTherapistName,
          assignedTherapists: currentAssigned,
        };
      } else {
        const existingIdx = currentAssigned.findIndex(at => resolveNumericTherapistId(at.id) === numThId);
        if (existingIdx < 0 && targetTh) {
          currentAssigned.push({
            id: targetTh.id,
            name: targetTh.name,
            specialization: targetTh.specialization,
            isPrimary: false,
          });
        }
        return {
          ...p,
          assignedTherapists: currentAssigned,
        };
      }
    }));

    const res = await fetch(`/api/patients/${numPatId}/therapists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ therapistId: numThId, isPrimary }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      await refreshPatients();
      return { success: true };
    }
    await refreshPatients();
    return { success: false, error: json?.message || 'Failed to assign therapist' };
  };

  const changePrimaryTherapist = async (patientId: string, therapistId: string) => {
    return assignSecondaryTherapist(patientId, therapistId, true);
  };

  const unassignTherapist = async (patientId: string, therapistId: string, replacementTherapistId?: string) => {
    const numPatId = resolveNumericPatientId(patientId);
    const numThId = resolveNumericTherapistId(therapistId);
    const numReplacementId = replacementTherapistId ? resolveNumericTherapistId(replacementTherapistId) : undefined;
    const repTh = numReplacementId ? therapists.find(t => resolveNumericTherapistId(t.id) === numReplacementId) : undefined;

    // Optimistic state update so UI updates immediately
    setPatients(prev => prev.map(p => {
      const match = resolveNumericPatientId(p.id) === numPatId || p.id === patientId || p.patientCode === patientId;
      if (!match) return p;

      let currentAssigned = [...(p.assignedTherapists || [])];
      if (numReplacementId && repTh) {
        currentAssigned = currentAssigned
          .filter(at => resolveNumericTherapistId(at.id) !== numThId)
          .map(at => ({ ...at, isPrimary: false }));
        const repIdx = currentAssigned.findIndex(at => resolveNumericTherapistId(at.id) === numReplacementId);
        if (repIdx >= 0) {
          currentAssigned[repIdx] = { ...currentAssigned[repIdx], isPrimary: true };
        } else {
          currentAssigned.push({
            id: repTh.id,
            name: repTh.name,
            specialization: repTh.specialization,
            isPrimary: true,
          });
        }
        return {
          ...p,
          assignedTherapistId: `th-${resolveNumericTherapistId(repTh.id)}`,
          assignedTherapistName: repTh.name,
          assignedTherapists: currentAssigned,
        };
      } else {
        currentAssigned = currentAssigned.filter(at => resolveNumericTherapistId(at.id) !== numThId);
        return {
          ...p,
          assignedTherapists: currentAssigned,
        };
      }
    }));

    let url = `/api/patients/${numPatId}/therapists/${numThId}`;
    if (numReplacementId && !isNaN(numReplacementId)) {
      url += `?replacementTherapistId=${numReplacementId}`;
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: (numReplacementId && !isNaN(numReplacementId)) ? JSON.stringify({ replacementTherapistId: numReplacementId }) : undefined,
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      await refreshPatients();
      return { success: true };
    }
    await refreshPatients();
    return { success: false, error: json?.message || 'Failed to unassign therapist' };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      if (currentUser) {
        setCurrentUser({ ...currentUser, mustChangePassword: false });
      }
      return { success: true };
    }
    return { success: false, error: json?.message || 'Failed to change password' };
  };

  const addTherapist = (therapist: Omit<Therapist, 'id' | 'assignedPatients' | 'todaySessionsCount'>) => {
    const newId = `th-${therapists.length + 1}`;
    const newTherapist: Therapist = {
      ...therapist,
      id: newId,
      assignedPatients: [],
      todaySessionsCount: 0
    };
    setTherapists(prev => [...prev, newTherapist]);
  };

  const deleteTherapist = (id: string) => {
    setTherapists(prev => prev.filter(t => t.id !== id));
  };

  const bookAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newId = `apt-${appointments.length + 1}`;
    const newApt: Appointment = {
      ...appointment,
      id: newId
    };
    setAppointments(prev => [newApt, ...prev]);

    if (appointment.status === 'Completed') {
      const newInvc: Invoice = {
        id: `invc-${invoices.length + 1}`,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        invoiceNumber: `INV/2026/0${90 + invoices.length}`,
        billingPeriod: `August 2026 (1 Session)`,
        amount: 1300,
        status: 'Pending'
      };
      setInvoices(prev => [newInvc, ...prev]);
    }
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], reason?: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        if (status === 'Completed' && apt.status !== 'Completed') {
          setTherapists(theraps => theraps.map(t => {
            if (t.id === apt.therapistId) {
              return { ...t, todaySessionsCount: t.todaySessionsCount + 1 };
            }
            return t;
          }));
        }
        return { ...apt, status, ...(reason && { cancellationReason: reason }) };
      }
      return apt;
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'timeline' | 'progressPercent'>) => {
    const newId = `gl-${goals.length + 1}`;
    const newGoal: Goal = {
      ...goal,
      id: newId,
      progressPercent: 0,
      timeline: [
        { date: new Date().toLocaleDateString('en-GB'), progress: 0, note: 'Goal created.' }
      ]
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalProgress = (id: string, progressPercent: number, note: string) => {
    setGoals(prev => prev.map(gl => {
      if (gl.id === id) {
        return {
          ...gl,
          progressPercent,
          status: progressPercent >= 100 ? 'Achieved' : 'In Progress',
          timeline: [
            ...gl.timeline,
            { date: new Date().toLocaleDateString('en-GB'), progress: progressPercent, note }
          ]
        };
      }
      return gl;
    }));
  };

  const completeGoal = (id: string) => {
    updateGoalProgress(id, 100, 'Goal completed/achieved during session.');
  };

  const addSession = (session: Session) => {
    setSessions(prev => [session, ...prev]);

    setPatients(prev => prev.map(p => {
      if (p.id === session.patientId) {
        return { ...p, lastSessionDate: session.date };
      }
      return p;
    }));

    if (session.workspaceData) {
      session.workspaceData.goalsWorkedOn.forEach(gw => {
        updateGoalProgress(gw.goalId, gw.progressPercent, `Worked on during session: ${session.workspaceData?.observations || ''}`);
      });
    }

    const matchedApt = appointments.find(a => a.patientId === session.patientId && a.therapistId === session.therapistId && a.status === 'Scheduled');
    if (matchedApt) {
      updateAppointmentStatus(matchedApt.id, 'Completed');
    }
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'availableQuantity'>) => {
    const newId = `inv-${inventory.length + 1}`;
    const newItem: InventoryItem = {
      ...item,
      id: newId,
      availableQuantity: item.status === 'Available' ? item.quantity : 0
    };
    setInventory(prev => [...prev, newItem]);

    setCupboards(prev => prev.map(c => {
      if (c.name === item.cupboard) {
        return {
          ...c,
          shelves: c.shelves.map(s => {
            if (s.name === item.shelf) {
              return { ...s, itemIds: [...s.itemIds, newId] };
            }
            return s;
          })
        };
      }
      return c;
    }));
  };

  const moveInventoryItem = (itemId: string, targetCupboard: string, targetShelf: string) => {
    let oldCupboard = '';
    let oldShelf = '';

    inventory.forEach(item => {
      if (item.id === itemId) {
        oldCupboard = item.cupboard;
        oldShelf = item.shelf;
      }
    });

    setCupboards(prev => prev.map(c => {
      let updatedShelves = c.shelves;
      if (c.name === oldCupboard) {
        updatedShelves = updatedShelves.map(s => {
          if (s.name === oldShelf) {
            return { ...s, itemIds: s.itemIds.filter(id => id !== itemId) };
          }
          return s;
        });
      }
      if (c.name === targetCupboard) {
        updatedShelves = updatedShelves.map(s => {
          if (s.name === targetShelf) {
            return { ...s, itemIds: [...s.itemIds, itemId] };
          }
          return s;
        });
      }
      return { ...c, shelves: updatedShelves };
    }));

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, cupboard: targetCupboard, shelf: targetShelf };
      }
      return item;
    }));
  };

  const addAssessment = (assessment: Omit<Assessment, 'id' | 'previousScore'>) => {
    const newId = `asm-${assessments.length + 1}`;
    const prevAsm = assessments.find(a => a.patientId === assessment.patientId && a.category === assessment.category);
    const newAsm: Assessment = {
      ...assessment,
      id: newId,
      previousScore: prevAsm ? prevAsm.score : undefined
    };
    setAssessments(prev => [newAsm, ...prev]);
  };

  const markAttendance = (recordId: string, checkIn?: string, checkOut?: string, status?: AttendanceRecord['status'], notes?: string) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        if (rec.type === 'Therapist' && status) {
          setTherapists(tPrev => tPrev.map(t => t.name === rec.name ? { ...t, attendanceStatus: status as any } : t));
        }
        return {
          ...rec,
          ...(checkIn && { checkIn }),
          ...(checkOut && { checkOut }),
          ...(status && { status }),
          ...(notes && { notes })
        };
      }
      return rec;
    }));
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newId = `att-${attendanceRecords.length + 1}`;
    setAttendanceRecords(prev => [{ ...record, id: newId }, ...prev]);
    if (record.type === 'Therapist') {
      setTherapists(tPrev => tPrev.map(t => t.name === record.name ? { ...t, attendanceStatus: record.status as any } : t));
    }
  };

  const addFeedback = (fb: Omit<ParentFeedback, 'id' | 'date'>) => {
    const newFb: ParentFeedback = {
      ...fb,
      id: `fb-${feedbacks.length + 1}`,
      date: new Date().toLocaleDateString('en-GB')
    };
    setFeedbacks(prev => [newFb, ...prev]);
  };

  const toggleHomeworkStatus = (id: string, proofSent?: boolean, parentComments?: string) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        const newStatus = hw.status === 'Completed' ? 'Pending' : 'Completed';
        return {
          ...hw,
          status: newStatus,
          completedDate: newStatus === 'Completed' ? new Date().toLocaleDateString('en-GB') : undefined,
          ...(proofSent !== undefined && { proofSent }),
          ...(parentComments !== undefined && { parentComments })
        };
      }
      return hw;
    }));
  };

  const addHomework = (hw: Omit<HomeworkItem, 'id' | 'status' | 'assignedDate'>) => {
    const newHw: HomeworkItem = {
      ...hw,
      id: `hw-${homeworks.length + 1}`,
      assignedDate: new Date().toLocaleDateString('en-GB'),
      status: 'Pending'
    };
    setHomeworks(prev => [newHw, ...prev]);
  };

  const addComplaint = (complaint: Omit<ParentComplaint, 'id' | 'date' | 'status'>) => {
    const newCmp: ParentComplaint = {
      ...complaint,
      id: `cmp-${complaints.length + 1}`,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Open'
    };
    setComplaints(prev => [newCmp, ...prev]);
  };

  const updateComplaintStatus = (id: string, status: ParentComplaint['status'], resolutionNotes?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          ...(resolutionNotes !== undefined && { resolutionNotes })
        };
      }
      return c;
    }));
  };

  return (
    <ClinicContext.Provider value={{
      patients,
      therapists,
      appointments,
      goals,
      sessions,
      inventory,
      cupboards,
      invoices,
      attendanceRecords,
      assessments,
      feedbacks,
      homeworks,
      complaints,

      currentUser,
      currentRole,
      currentPage,
      activeTherapistId,
      activePatientId,
      isAuthChecking,

      setCurrentUser,
      setCurrentRole,
      setCurrentPage,
      setActiveTherapistId,
      setActivePatientId,
      login,
      logout,
      checkAuth,

      addPatient,
      updatePatientStatus,
      updatePatientLockStatus,
      assignSecondaryTherapist,
      changePrimaryTherapist,
      unassignTherapist,
      refreshPatients,
      changePassword,
      addTherapist,
      deleteTherapist,
      bookAppointment,
      updateAppointmentStatus,
      addGoal,
      deleteGoal,
      updateGoalProgress,
      completeGoal,
      addSession,
      addInventoryItem,
      moveInventoryItem,
      addAssessment,
      markAttendance,
      addAttendanceRecord,
      addFeedback,
      toggleHomeworkStatus,
      addHomework,
      addComplaint,
      updateComplaintStatus
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

