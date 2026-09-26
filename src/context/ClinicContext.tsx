import React, { createContext, useContext, useState, useEffect } from 'react';
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
  HomeworkItem
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
  mockHomeworks
} from '../data/mockData';

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

  // Demo Navigation / Role Selection State
  currentRole: 'admin' | 'therapist' | 'parent' | null;
  currentPage: string;
  activeTherapistId: string;
  activePatientId: string; // for Parent Portal (child selector) or detail views

  // State Setters
  setCurrentRole: (role: 'admin' | 'therapist' | 'parent' | null) => void;
  setCurrentPage: (page: string) => void;
  setActiveTherapistId: (id: string) => void;
  setActivePatientId: (id: string) => void;

  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'assignedTherapistName'>) => void;
  updatePatientStatus: (id: string, status: Patient['status']) => void;
  updatePatientLockStatus: (id: string, isLocked: boolean) => void;
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
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('ot_patients');
    return saved ? JSON.parse(saved) : mockPatients;
  });

  const [therapists, setTherapists] = useState<Therapist[]>(() => {
    const saved = localStorage.getItem('ot_therapists');
    return saved ? JSON.parse(saved) : mockTherapists;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('ot_appointments');
    return saved ? JSON.parse(saved) : mockAppointments;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('ot_goals');
    return saved ? JSON.parse(saved) : mockGoals;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('ot_sessions');
    return saved ? JSON.parse(saved) : mockSessions;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('ot_inventory');
    return saved ? JSON.parse(saved) : mockInventory;
  });

  const [cupboards, setCupboards] = useState<Cupboard[]>(() => {
    const saved = localStorage.getItem('ot_cupboards');
    return saved ? JSON.parse(saved) : mockCupboards;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('ot_invoices');
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ot_attendance');
    return saved ? JSON.parse(saved) : mockAttendanceRecords;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('ot_assessments');
    return saved ? JSON.parse(saved) : mockAssessments;
  });

  const [feedbacks, setFeedbacks] = useState<ParentFeedback[]>(() => {
    const saved = localStorage.getItem('ot_feedbacks');
    return saved ? JSON.parse(saved) : mockFeedbacks;
  });

  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(() => {
    const saved = localStorage.getItem('ot_homeworks');
    return saved ? JSON.parse(saved) : mockHomeworks;
  });

  // Navigation states
  const [currentRole, setCurrentRole] = useState<'admin' | 'therapist' | 'parent' | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [activeTherapistId, setActiveTherapistId] = useState<string>('th-1'); // Dr. Priya Raman as active therapist user
  const [activePatientId, setActivePatientId] = useState<string>('pt-1'); // Kavin Raj as active child/patient selection

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

  // Adjust routing default page when switching roles
  useEffect(() => {
    setCurrentPage('dashboard');
  }, [currentRole]);

  // Actions implementation
  const addPatient = (patient: Omit<Patient, 'id' | 'assignedTherapistName'>) => {
    const newId = `pt-${patients.length + 1}`;
    const therapistName = therapists.find(t => t.id === patient.assignedTherapistId)?.name || 'Dr. Priya Raman';
    const newPatient: Patient = {
      ...patient,
      id: newId,
      assignedTherapistName: therapistName,
    };
    setPatients(prev => [newPatient, ...prev]);

    // Also link to therapist
    setTherapists(prev => prev.map(t => {
      if (t.id === patient.assignedTherapistId) {
        return { ...t, assignedPatients: [...t.assignedPatients, newId] };
      }
      return t;
    }));
  };

  const updatePatientStatus = (id: string, status: Patient['status']) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const updatePatientLockStatus = (id: string, isLocked: boolean) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, isLocked } : p));
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

      currentRole,
      currentPage,
      activeTherapistId,
      activePatientId,

      setCurrentRole,
      setCurrentPage,
      setActiveTherapistId,
      setActivePatientId,

      addPatient,
      updatePatientStatus,
      updatePatientLockStatus,
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
      addHomework
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

