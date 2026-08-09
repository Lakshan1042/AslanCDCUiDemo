import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  WeeklySessionsChart,
  AttendancePieChart,
  PatientProgressTrendChart
} from './DashboardCharts';
import { CalendarView } from './CalendarView';
import { StorageManagementView } from './StorageManagementView';
import { SessionWorkspaceView } from './SessionWorkspaceView';
import {
  Users, UserCheck, Calendar, CheckSquare, Search, Plus,
  FileText, Activity, Box, TrendingUp,
  ArrowRight, Phone, Mail, MapPin, BadgeAlert, FileSpreadsheet, Download
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    patients, therapists, appointments, goals, sessions, inventory,
    invoices, attendanceRecords, assessments, currentPage, setCurrentPage,
    activePatientId, setActivePatientId, addPatient, addTherapist, addGoal,
    addAssessment, addInventoryItem, updatePatientStatus, markAttendance
  } = useClinic();

  // Active workspace state (for Starting a Session from Admin)
  const [activeSessionPatientId, setActiveSessionPatientId] = useState<string | null>(null);

  // Search/Filter states for Patients list
  const [patientSearch, setPatientSearch] = useState('');
  const [patientTherapistFilter, setPatientTherapistFilter] = useState('all');
  const [patientProgramFilter, setPatientProgramFilter] = useState('all');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddTherapistOpen, setIsAddTherapistOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);

  // Forms state
  // Add Patient
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState(6);
  const pGender = 'Male';
  const [pParent, setPParent] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pTherapistId, setPTherapistId] = useState('th-1');
  const [pProgram, setPProgram] = useState('Sensory Integration Therapy');
  const [pConcerns, setPConcerns] = useState('');
  const [pPlan, setPPlan] = useState('');

  // Add Therapist
  const [tName, setTName] = useState('');
  const [tSpec, setTSpec] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPassword, setTPassword] = useState('password123');

  // Add Inventory
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState('Vestibular & Balance');
  const [invQty, setInvQty] = useState(2);
  const [invCup, setInvCup] = useState('Cupboard A');
  const [invShelf, setInvShelf] = useState('Shelf 1');
  const invCond = 'Excellent';

  // Add Goal
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gStart, setGStart] = useState('03/08/2026');
  const [gTarget, setGTarget] = useState('03/11/2026');

  // Add Assessment
  const [asmCat, setAsmCat] = useState<'Fine Motor Skills' | 'Gross Motor Skills' | 'Sensory Processing' | 'Visual Motor Skills' | 'Coordination' | 'Self-Care / ADL' | 'Attention' | 'Social Participation'>('Fine Motor Skills');
  const [asmScore, setAsmScore] = useState(60);
  const [asmObs, setAsmObs] = useState('');
  const [asmComm, setAsmComm] = useState('');
  const [asmRec, setAsmRec] = useState('');

  // Active patient in profile page
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const [profileTab, setProfileTab] = useState<'overview' | 'sessions' | 'assessments' | 'goals' | 'progress' | 'documents' | 'attendance'>('overview');

  // Quick Action form submissions
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pParent || !pPhone) return;

    addPatient({
      name: pName,
      age: pAge,
      gender: pGender,
      parentName: pParent,
      parentPhone: pPhone,
      parentEmail: pEmail || `${pName.toLowerCase().replace(' ', '')}@gmail.com`,
      address: pAddress || 'Chennai, Tamil Nadu',
      assignedTherapistId: pTherapistId,
      program: pProgram,
      status: 'Active',
      primaryConcerns: pConcerns || 'Developmental developmental motor support.',
      currentPlan: pPlan || 'Standard occupational therapy drills.'
    });

    setIsAddPatientOpen(false);
    // Reset
    setPName(''); setPParent(''); setPPhone(''); setPEmail(''); setPAddress(''); setPConcerns(''); setPPlan('');
  };

  const handleAddTherapistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tPhone || !tEmail) return;

    addTherapist({
      name: tName,
      employeeId: `EMP-OT-${100 + therapists.length + 1}`,
      specialization: tSpec || 'General Occupational Therapy',
      contact: tPhone,
      email: tEmail,
      password: tPassword || 'password123',
      attendanceStatus: 'Present',
      status: 'Active'
    });

    setIsAddTherapistOpen(false);
    setTName(''); setTSpec(''); setTPhone(''); setTEmail(''); setTPassword('password123');
  };

  const handleAddInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName) return;

    addInventoryItem({
      name: invName,
      category: invCat,
      quantity: invQty,
      cupboard: invCup,
      shelf: invShelf,
      condition: invCond as any,
      status: invQty < 2 ? 'Low Stock' : 'Available'
    });

    setIsAddInventoryOpen(false);
    setInvName('');
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName || !activePatient) return;

    addGoal({
      patientId: activePatient.id,
      name: gName,
      description: gDesc,
      startDate: gStart,
      targetDate: gTarget,
      status: 'Not Started',
      therapistNotes: ['Goal initialized.']
    });

    setIsAddGoalOpen(false);
    setGName(''); setGDesc('');
  };

  const handleAddAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    addAssessment({
      patientId: activePatient.id,
      patientName: activePatient.name,
      date: new Date().toLocaleDateString('en-GB'),
      category: asmCat,
      score: asmScore,
      observations: asmObs,
      comments: asmComm,
      recommendations: asmRec
    });

    setIsAddAssessmentOpen(false);
    setAsmObs(''); setAsmComm(''); setAsmRec('');
  };

  // Render content according to page route
  if (activeSessionPatientId) {
    return (
      <SessionWorkspaceView
        patientId={activeSessionPatientId}
        onBack={() => setActiveSessionPatientId(null)}
      />
    );
  }

  // Attendance lists helpers
  const patientAttendanceList = attendanceRecords.filter(r => r.type === 'Patient');
  const therapistAttendanceList = attendanceRecords.filter(r => r.type === 'Therapist');

  return (
    <div className="space-y-6">
      {/* ------------------ DASHBOARD PAGE ------------------ */}
      {currentPage === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary metrics row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Active Patients</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{patients.filter(p => p.status === 'Active').length}</h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">↑ 8% this mo</span>
              </div>
              <div className="p-3.5 bg-clinic-50 text-clinic-700 rounded-2xl"><Users className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Therapists Present</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{therapists.filter(t => t.attendanceStatus === 'Present' || t.attendanceStatus === 'Late').length}</h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full mt-2 inline-block">of {therapists.length} total staff</span>
              </div>
              <div className="p-3.5 bg-sky-50 text-sky-700 rounded-2xl"><UserCheck className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Today's Bookings</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{appointments.filter(a => a.date === '03/08/2026').length}</h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">100% capacity</span>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl"><Calendar className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Sessions Finished</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{sessions.length}</h3>
                <span className="text-[10px] text-clinic-700 font-bold bg-clinic-100 px-2 py-0.5 rounded-full mt-2 inline-block">July/Aug metrics</span>
              </div>
              <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl"><CheckSquare className="w-6 h-6" /></div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-clinic-700" />
              <span>Quick Administrative Actions</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setIsAddPatientOpen(true)}
                className="p-3 bg-clinic-50/50 hover:bg-clinic-50 border border-clinic-100 text-clinic-800 font-bold text-xs rounded-2xl flex flex-col items-center gap-2 transition"
              >
                <Users className="w-5 h-5 text-clinic-700" /> Add Patient
              </button>
              <button
                onClick={() => setIsAddTherapistOpen(true)}
                className="p-3 bg-accent-50 hover:bg-accent-100/70 border border-accent-100 text-accent-700 font-bold text-xs rounded-2xl flex flex-col items-center gap-2 transition"
              >
                <UserCheck className="w-5 h-5 text-accent-600" /> Add Therapist
              </button>
              <button
                onClick={() => setCurrentPage('appointments')}
                className="p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-100 text-amber-700 font-bold text-xs rounded-2xl flex flex-col items-center gap-2 transition"
              >
                <Calendar className="w-5 h-5 text-amber-600" /> Book Appointment
              </button>
              <button
                onClick={() => setCurrentPage('attendance')}
                className="p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold text-xs rounded-2xl flex flex-col items-center gap-2 transition"
              >
                <CheckSquare className="w-5 h-5 text-emerald-600" /> Mark Attendance
              </button>
              <button
                onClick={() => setIsAddInventoryOpen(true)}
                className="p-3 bg-violet-50/50 hover:bg-violet-50 border border-violet-100 text-violet-700 font-bold text-xs rounded-2xl flex flex-col items-center gap-2 transition"
              >
                <Box className="w-5 h-5 text-violet-600" /> Add Inventory Item
              </button>
            </div>
          </div>

          {/* Grid Section for charts and schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="font-extrabold text-slate-800 text-base">Today's Schedule (03 Aug)</h2>
                  <button
                    onClick={() => setCurrentPage('appointments')}
                    className="text-xs text-clinic-700 hover:text-clinic-800 font-bold flex items-center gap-1"
                  >
                    <span>View Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[300px]">
                  {appointments.filter(a => a.date === '03/08/2026').map((apt) => (
                    <div key={apt.id} className="py-3.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs border">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{apt.patientName}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{apt.sessionType} • {apt.therapistName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700 flex items-center gap-1 justify-end text-xs">
                          <Calendar className="w-3.5 h-3.5 text-clinic-600" />
                          <span>{apt.startTime}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border mt-1 inline-block ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-clinic-50 text-clinic-700 border-clinic-100'
                          }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendance breakdown circular chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100">Attendance Overview</h2>
                <AttendancePieChart />
              </div>
            </div>
          </div>

          {/* Sessions Analytics Line/Bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
              <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-4">Completed Sessions frequency (Weekly)</h2>
              <WeeklySessionsChart />
            </div>

            {/* Inventory alert card & activity */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Inventory Alerts</span>
                </h2>
                <div className="space-y-3">
                  {inventory.filter(item => item.status === 'Low Stock' || item.status === 'Maintenance Required').map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3 justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Location: {item.cupboard} → {item.shelf}</div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                        {item.status.replace(' Required', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('inventory')}
                className="mt-4 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl font-bold text-xs text-slate-600 transition"
              >
                Manage Inventory & Storage
              </button>
            </div>
          </div>

          {/* Recent activities section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-4">Clinic Activity Stream</h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Session completed for <strong>Kavin Raj</strong> by Dr. Priya Raman (28/07/2026)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-sky-500 rounded-full" />
                <span>Assessment updated for <strong>Nila Prakash</strong> (Tripod grasp focus - 82%)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-clinic-700 rounded-full" />
                <span>New patient enrollment: <strong>Aadhira Saravanan</strong> assigned to Dr. Priya Raman</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>Inventory item moved: <strong>Therapy Ball</strong> shifted to Cupboard B → Shelf 2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ PATIENT MANAGEMENT ------------------ */}
      {currentPage === 'patients' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patients Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Enroll new patients and configure OT schedules.</p>
            </div>
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-medium px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Patient</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, parent, or ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-clinic-500 text-slate-700"
              />
            </div>

            <select
              value={patientTherapistFilter}
              onChange={(e) => setPatientTherapistFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-clinic-500 font-medium text-slate-600"
            >
              <option value="all">All Therapists</option>
              {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select
              value={patientProgramFilter}
              onChange={(e) => setPatientProgramFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-clinic-500 font-medium text-slate-600"
            >
              <option value="all">All Programs</option>
              <option value="Sensory Integration Therapy">Sensory Integration</option>
              <option value="Fine Motor Program">Fine Motor Program</option>
              <option value="Handwriting Program">Handwriting Program</option>
              <option value="Early Intervention Program">Early Intervention</option>
            </select>

            <select
              value={patientStatusFilter}
              onChange={(e) => setPatientStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-clinic-500 font-medium text-slate-600"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Patient ID</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Parent / Guardian</th>
                    <th className="px-6 py-4">Assigned Therapist</th>
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients
                    .filter(p => {
                      if (patientSearch && !p.name.toLowerCase().includes(patientSearch.toLowerCase()) && !p.parentName.toLowerCase().includes(patientSearch.toLowerCase()) && !p.id.toLowerCase().includes(patientSearch.toLowerCase())) return false;
                      if (patientTherapistFilter !== 'all' && p.assignedTherapistId !== patientTherapistFilter) return false;
                      if (patientProgramFilter !== 'all' && p.program !== patientProgramFilter) return false;
                      if (patientStatusFilter !== 'all' && p.status !== patientStatusFilter) return false;
                      return true;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-800 cursor-pointer hover:text-clinic-700" onClick={() => { setActivePatientId(p.id); setProfileTab('overview'); setCurrentPage('patient-profile'); }}>
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.id.toUpperCase()}</td>
                        <td className="px-6 py-4 text-slate-600">{p.age} years</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{p.parentName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{p.parentPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{p.assignedTherapistName}</td>
                        <td className="px-6 py-4 text-clinic-700 font-semibold text-xs">{p.program}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              p.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => { setActivePatientId(p.id); setProfileTab('overview'); setCurrentPage('patient-profile'); }}
                            className="text-xs text-clinic-700 font-bold hover:underline"
                          >
                            Open Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ PATIENT PROFILE DETAIL ------------------ */}
      {currentPage === 'patient-profile' && activePatient && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-clinic-700 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                {activePatient.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>{activePatient.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 border">{activePatient.id.toUpperCase()}</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Age: <strong>{activePatient.age}y</strong> • Program: <strong className="text-clinic-700">{activePatient.program}</strong> • Therapist: <strong>{activePatient.assignedTherapistName}</strong>
                </p>
              </div>
            </div>

            {/* Actions inside profile header */}
            <div className="flex gap-2">
              <select
                value={activePatient.status}
                onChange={(e) => updatePatientStatus(activePatient.id, e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-clinic-500 font-bold text-slate-600"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Discharged">Discharged</option>
              </select>
              <button
                onClick={() => setActiveSessionPatientId(activePatient.id)}
                className="flex items-center justify-center gap-1.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition text-xs shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Start Session Note</span>
              </button>
              <button
                onClick={() => setCurrentPage('patients')}
                className="text-xs text-slate-400 font-bold hover:text-slate-600 px-3.5 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Back
              </button>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto py-1">
            {(['overview', 'sessions', 'assessments', 'goals', 'progress', 'documents', 'attendance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold capitalize border-b-2 whitespace-nowrap transition ${profileTab === tab
                    ? 'border-clinic-700 text-clinic-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          {profileTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column info details */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm">Parent & Location Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Parent/Guardian Name</span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" />{activePatient.parentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Phone Number</span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" />{activePatient.parentPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Email Address</span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" />{activePatient.parentEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Chennai Address</span>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{activePatient.address}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm">Therapeutic Concerns & Plan</h3>
                  <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Primary Concerns:</span>
                      <p className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium text-slate-700">{activePatient.primaryConcerns}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Therapy Plan Strategy:</span>
                      <p className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium text-slate-700">{activePatient.currentPlan}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column quick stats indicators */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm">Next Appointment</h3>
                  {activePatient.nextAppointmentDate ? (
                    <div className="p-3 bg-clinic-50/50 rounded-2xl border border-clinic-100">
                      <div className="text-xs text-clinic-700 font-extrabold flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{activePatient.nextAppointmentDate}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Scheduled with {activePatient.assignedTherapistName}.
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No upcoming bookings.</span>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm">Attendance Summary</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Monthly Attendance Rate</span>
                    <span className="text-sm font-black text-clinic-700">92%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'sessions' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Completed Therapy Logs</h3>
                <button
                  onClick={() => setActiveSessionPatientId(activePatient.id)}
                  className="text-xs text-clinic-700 font-bold hover:underline"
                >
                  Start New Session
                </button>
              </div>
              <div className="space-y-3">
                {sessions.filter(s => s.patientId === activePatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No session logs recorded for this patient.</p>
                ) : (
                  sessions.filter(s => s.patientId === activePatient.id).map(s => (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>Session dated {s.date} ({s.duration} mins)</span>
                        <span className="text-clinic-700">{s.sessionType}</span>
                      </div>
                      {s.workspaceData && (
                        <div className="space-y-1.5 text-slate-600 mt-1 leading-relaxed">
                          <p><strong>Activities:</strong> {s.workspaceData.activitiesPerformed.join(', ')}</p>
                          <p><strong>Observations:</strong> {s.workspaceData.observations}</p>
                          <p><strong>Home Work:</strong> {s.workspaceData.homeRecommendations}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {profileTab === 'assessments' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Assessment History</h3>
                <button
                  onClick={() => setIsAddAssessmentOpen(true)}
                  className="flex items-center gap-1 text-xs text-clinic-700 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Assessment
                </button>
              </div>
              <div className="space-y-3">
                {assessments.filter(a => a.patientId === activePatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No evaluations recorded. Click 'Record Assessment' above to add evaluations.</p>
                ) : (
                  assessments.filter(a => a.patientId === activePatient.id).map(a => (
                    <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                      <div className="flex items-center justify-between font-extrabold text-slate-800">
                        <span>{a.category} ({a.date})</span>
                        <span className="text-clinic-700 font-black bg-clinic-100 px-2 py-0.5 rounded-full">Score: {a.score}%</span>
                      </div>
                      {a.previousScore !== undefined && (
                        <div className="text-[10px] text-slate-400 font-bold">
                          Previous Score: {a.previousScore}% (Improvement: +{a.score - a.previousScore} points)
                        </div>
                      )}
                      <p className="text-slate-600 mt-1 leading-normal"><strong>Observation:</strong> {a.observations}</p>
                      <p className="text-slate-600 leading-normal"><strong>Recommendations:</strong> {a.recommendations}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {profileTab === 'goals' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Therapy Goal Checkpoints</h3>
                <button
                  onClick={() => setIsAddGoalOpen(true)}
                  className="flex items-center gap-1 text-xs text-clinic-700 font-bold animate-pulse"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Goal
                </button>
              </div>
              <div className="space-y-3">
                {goals.filter(g => g.patientId === activePatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No goals defined. Set up goals first.</p>
                ) : (
                  goals.filter(g => g.patientId === activePatient.id).map(g => (
                    <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{g.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${g.status === 'Achieved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            g.status === 'In Progress' ? 'bg-clinic-50 text-clinic-700 border-clinic-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          {g.status}
                        </span>
                      </div>
                      <p className="text-slate-500">{g.description}</p>
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                          <span>Timeline: {g.startDate} to {g.targetDate}</span>
                          <span>Progress: {g.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-clinic-700 h-full transition-all duration-300" style={{ width: `${g.progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {profileTab === 'progress' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
              <h3 className="font-extrabold text-slate-800 text-sm pb-3 border-b border-slate-100 mb-4">Patient Development Chart</h3>
              <PatientProgressTrendChart singlePatient={true} />
            </div>
          )}

          {profileTab === 'documents' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Clinic Records / Uploaded Documents</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800">Initial Assessment Intake Form.pdf</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Uploaded 12/06/2026 • 1.2 MB</div>
                    </div>
                  </div>
                  <button className="text-clinic-700 font-bold hover:underline flex items-center gap-0.5"><Download className="w-3.5 h-3.5" /> Download</button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-bold text-slate-800">Sensory Diet Routine checklist.pdf</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Uploaded 28/07/2026 • 450 KB</div>
                    </div>
                  </div>
                  <button className="text-clinic-700 font-bold hover:underline flex items-center gap-0.5"><Download className="w-3.5 h-3.5" /> Download</button>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'attendance' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Patient Attendance History</h3>
              <div className="space-y-2">
                {patientAttendanceList.filter(r => r.name === activePatient.name).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No attendance records found.</p>
                ) : (
                  patientAttendanceList.filter(r => r.name === activePatient.name).map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{r.date} - {r.time}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Therapist: {r.therapistName} {r.notes ? `(${r.notes})` : ''}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${r.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                        {r.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------ THERAPISTS MANAGEMENT ------------------ */}
      {currentPage === 'therapists' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Therapist Staff Registry</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage employee details, schedules, and presence.</p>
            </div>
            <button
              onClick={() => setIsAddTherapistOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-medium px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Therapist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((t) => (
              <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-clinic-100 text-clinic-700 flex items-center justify-center font-extrabold text-base border border-clinic-200 flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{t.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{t.employeeId}</p>
                    <p className="text-xs text-clinic-700 font-bold mt-1.5">{t.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-semibold">Assigned Cases</span>
                    <span className="font-extrabold text-slate-700">{t.assignedPatients.length} children</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Today's Sessions</span>
                    <span className="font-extrabold text-slate-700">{t.todaySessionsCount} sessions</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Contact</span>
                    <span className="font-bold text-slate-700 truncate block">{t.contact}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Daily Attendance</span>
                    <span className={`font-bold mt-0.5 block ${t.attendanceStatus === 'Present' ? 'text-emerald-600' :
                        t.attendanceStatus === 'Late' ? 'text-amber-500' : 'text-rose-500'
                      }`}>{t.attendanceStatus}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-slate-400 font-bold uppercase">Status: <strong className="text-emerald-600">{t.status}</strong></span>
                  <a href={`mailto:${t.email}`} className="text-clinic-700 font-bold hover:underline">Send Email</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ APPOINTMENTS ------------------ */}
      {currentPage === 'appointments' && <CalendarView />}

      {/* ------------------ ATTENDANCE LOGS ------------------ */}
      {currentPage === 'attendance' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance Logs</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track patient and therapist daily attendance.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Attendance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Patient Attendance (Today)</h2>
              <div className="space-y-3">
                {patientAttendanceList.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{rec.name}</div>
                      <div className="text-slate-400 font-semibold mt-0.5">Time: {rec.time || 'N/A'} • Doctor: {rec.therapistName}</div>
                      {rec.notes && <div className="text-[10px] text-slate-400 italic mt-1 font-medium">Notes: {rec.notes}</div>}
                    </div>
                    <div className="text-right space-y-1.5">
                      <select
                        value={rec.status}
                        onChange={(e) => markAttendance(rec.id, undefined, undefined, e.target.value as any)}
                        className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none"
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <div className="text-[9px] text-slate-400 font-bold block">
                        In: {rec.checkIn || '--:--'} • Out: {rec.checkOut || '--:--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Therapist Attendance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Therapist Attendance (Today)</h2>
              <div className="space-y-3">
                {therapistAttendanceList.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{rec.name}</div>
                      <div className="text-slate-400 font-semibold mt-0.5">Role: OT Specialist</div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <select
                        value={rec.status}
                        onChange={(e) => markAttendance(rec.id, undefined, undefined, e.target.value as any)}
                        className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none"
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                      <div className="text-[9px] text-slate-400 font-bold block">
                        Check In: {rec.checkIn || '--:--'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ THERAPY SESSIONS LOG ------------------ */}
      {currentPage === 'sessions' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Therapy Session Notes</h1>
            <p className="text-slate-500 text-sm mt-0.5">Audit therapist notes and activities completed.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Therapist</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Session Type</th>
                    <th className="px-6 py-4">Goals Addressed</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800">{s.patientName}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{s.therapistName}</td>
                      <td className="px-6 py-4 text-slate-600">{s.date}</td>
                      <td className="px-6 py-4 text-slate-600">{s.duration} minutes</td>
                      <td className="px-6 py-4 text-clinic-700 font-semibold text-xs">{s.sessionType}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={s.goalsWorkedOn.join(', ')}>
                        {s.goalsWorkedOn.join(', ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ ASSESSMENTS GRID ------------------ */}
      {currentPage === 'assessments' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical Assessments</h1>
            <p className="text-slate-500 text-sm mt-0.5">View structural milestone and sensorimotor checklists.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800">Evaluations Database</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {assessments.map(asm => (
                <div key={asm.id} className="p-6 text-xs hover:bg-slate-50/50 transition space-y-2">
                  <div className="flex items-center justify-between font-extrabold text-slate-800 text-sm">
                    <div>
                      <span>{asm.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-bold ml-2">({asm.date})</span>
                    </div>
                    <span className="text-clinic-700 bg-clinic-100 px-2.5 py-0.5 rounded-full">
                      Score: {asm.score}%
                    </span>
                  </div>
                  <div className="text-[10px] text-clinic-700 font-bold uppercase tracking-wider">{asm.category}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-slate-600 leading-relaxed font-medium">
                    <div><strong>Observations:</strong> {asm.observations}</div>
                    <div><strong>Recommendations:</strong> {asm.recommendations}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ GOALS & PROGRESS ------------------ */}
      {currentPage === 'goals' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Goals Tracking & Progress</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor patient progress against individual milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => {
              const p = patients.find(p => p.id === g.patientId);
              return (
                <div key={g.id} className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{g.name}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Patient: <strong>{p?.name}</strong> • Program: <strong className="text-clinic-700">{p?.program}</strong></p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${g.status === 'Achieved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        g.status === 'In Progress' ? 'bg-clinic-50 text-clinic-700 border-clinic-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {g.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{g.description}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Timeline: {g.startDate} - {g.targetDate}</span>
                      <span>Progress: {g.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-clinic-700 h-full" style={{ width: `${g.progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Timeline updates history */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Goal Updates Log:</span>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      {g.timeline.slice(-2).map((tl, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-bold text-slate-400">{tl.date}:</span>
                          <span>{tl.note} (progress reached {tl.progress}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------ INVENTORY MANAGEMENT ------------------ */}
      {currentPage === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Registry</h1>
              <p className="text-slate-500 text-sm mt-0.5">Track location, availability, and quality of therapy tools.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('storage')}
                className="flex items-center justify-center gap-1 text-xs text-clinic-700 font-bold hover:bg-clinic-50 px-3.5 py-2 border border-clinic-200 rounded-xl bg-white"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Cupboard Map
              </button>
              <button
                onClick={() => setIsAddInventoryOpen(true)}
                className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-medium px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Storage Location</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-xs">{item.category}</td>
                      <td className="px-6 py-4 text-slate-600">{item.quantity} total</td>
                      <td className="px-6 py-4 text-clinic-700 font-semibold text-xs">
                        {item.cupboard} → {item.shelf}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.condition === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            item.condition === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            item.status === 'In Use' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                              item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ STORAGE CUPBOARD VIEW ------------------ */}
      {currentPage === 'storage' && <StorageManagementView />}

      {/* ------------------ REPORTS ANALYTICS ------------------ */}
      {currentPage === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical Reports</h1>
              <p className="text-slate-500 text-sm mt-0.5">Generate and download client metric analytics.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50"><FileSpreadsheet className="w-4 h-4" /> Export Excel</button>
              <button className="flex items-center gap-1.5 text-xs text-white font-bold bg-clinic-700 hover:bg-clinic-800 px-4 py-2.5 rounded-xl"><Download className="w-4 h-4" /> Download PDF</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Session Utilization Frequency</h3>
              <WeeklySessionsChart />
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Attendance Stats</h3>
              <AttendancePieChart />
            </div>
          </div>

          {/* Quick Metrics Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-500">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
              <span>Overall Attendance Rate</span>
              <div className="text-2xl font-extrabold text-clinic-700 mt-1">94.2%</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
              <span>Average Cancellation Rate</span>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">4.5%</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium">
              <span>Therapist Room Utilization</span>
              <div className="text-2xl font-extrabold text-slate-700 mt-1">88.7%</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ BILLING INVOICES ------------------ */}
      {currentPage === 'billing' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Invoices</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track patient invoicing, sessions billed, and payments (₹).</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Billing Period</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{inv.patientName}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{inv.billingPeriod}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            inv.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-semibold">{inv.paymentDate || '--/--/----'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ SETTINGS ------------------ */}
      {currentPage === 'settings' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Configure occupational therapy clinic defaults.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium max-w-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Clinic Settings Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Clinic Name</label>
                <input type="text" readOnly value="Aslan Child Development Center" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">City / Region</label>
                <input type="text" readOnly value="Chennai, Tamil Nadu, India" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Primary Currency</label>
                <input type="text" readOnly value="INR (₹)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Contact Email</label>
                <input type="text" readOnly value="admin@sudarshanaot.in" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================= MODALS ========================= */}
      {/* ======================================================== */}

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Enroll New Patient</h3>
              <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50">✕</button>
            </div>
            <form onSubmit={handleAddPatientSubmit}>
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Patient Name</label>
                    <input required type="text" placeholder="e.g. Mithran" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Age</label>
                    <input required type="number" value={pAge} onChange={(e) => setPAge(parseInt(e.target.value) || 6)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Parent Name</label>
                    <input required type="text" placeholder="e.g. Ramesh Kumar" value={pParent} onChange={(e) => setPParent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Parent Phone</label>
                    <input required type="text" placeholder="+91 XXXXX XXXXX" value={pPhone} onChange={(e) => setPPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assigned Therapist</label>
                    <select value={pTherapistId} onChange={(e) => setPTherapistId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500">
                      {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Therapy Program</label>
                    <select value={pProgram} onChange={(e) => setPProgram(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                      <option value="Sensory Integration Therapy">Sensory Integration</option>
                      <option value="Fine Motor Program">Fine Motor Program</option>
                      <option value="Handwriting Program">Handwriting Program</option>
                      <option value="Early Intervention Program">Early Intervention</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chennai Area Address</label>
                  <input type="text" placeholder="e.g. Adyar, Chennai" value={pAddress} onChange={(e) => setPAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Primary Concerns</label>
                  <textarea rows={2} placeholder="Symptomatic developmental remarks..." value={pConcerns} onChange={(e) => setPConcerns(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl">Enroll Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Therapist Modal */}
      {isAddTherapistOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Therapist Staff</h3>
              <button onClick={() => setIsAddTherapistOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50">✕</button>
            </div>
            <form onSubmit={handleAddTherapistSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Therapist Name</label>
                  <input required type="text" placeholder="e.g. Dr. Priya Raman" value={tName} onChange={(e) => setTName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Specialization</label>
                  <input type="text" placeholder="e.g. Sensory Integration" value={tSpec} onChange={(e) => setTSpec(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                    <input required type="text" placeholder="+91 9840X XXXXX" value={tPhone} onChange={(e) => setTPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input required type="email" placeholder="name@clinic.in" value={tEmail} onChange={(e) => setTEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Login Password for Portal</label>
                  <input required type="text" placeholder="e.g. password123" value={tPassword} onChange={(e) => setTPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddTherapistOpen(false)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl">Add Therapist</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Item Modal */}
      {isAddInventoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Inventory Item</h3>
              <button onClick={() => setIsAddInventoryOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50">✕</button>
            </div>
            <form onSubmit={handleAddInventorySubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Item Name</label>
                  <input required type="text" placeholder="e.g. Sensory Brush" value={invName} onChange={(e) => setInvName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                    <select value={invCat} onChange={(e) => setInvCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option value="Vestibular & Balance">Vestibular & Balance</option>
                      <option value="Tactile Desensitization">Tactile Desensitization</option>
                      <option value="Deep Pressure Touch">Deep Pressure Touch</option>
                      <option value="Fine Motor & Coordination">Fine Motor & Coordination</option>
                      <option value="Strengthening">Strengthening</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
                    <input required type="number" value={invQty} onChange={(e) => setInvQty(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Storage Cupboard</label>
                    <select value={invCup} onChange={(e) => setInvCup(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option value="Cupboard A">Cupboard A</option>
                      <option value="Cupboard B">Cupboard B</option>
                      <option value="Cupboard C">Cupboard C</option>
                      <option value="Sensory Room Cabinet">Sensory Room Cabinet</option>
                      <option value="Therapy Room Storage">Therapy Room Storage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Shelf Number</label>
                    <select value={invShelf} onChange={(e) => setInvShelf(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option value="Shelf 1">Shelf 1</option>
                      <option value="Shelf 2">Shelf 2</option>
                      <option value="Shelf 3">Shelf 3</option>
                      <option value="Cabinet 3">Cabinet 3 (Sensory)</option>
                      <option value="Storage Rack 2">Rack 2 (Therapy)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddInventoryOpen(false)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Goal for {activePatient?.name}</h3>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50">✕</button>
            </div>
            <form onSubmit={handleAddGoalSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Goal Name</label>
                  <input required type="text" placeholder="e.g. Alternate feet climbing ladder" value={gName} onChange={(e) => setGName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows={2} placeholder="Explain exactly how this is evaluated..." value={gDesc} onChange={(e) => setGDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input type="text" value={gStart} onChange={(e) => setGStart(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Date</label>
                    <input type="text" value={gTarget} onChange={(e) => setGTarget(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddGoalOpen(false)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assessment Modal */}
      {isAddAssessmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Record Assessment for {activePatient?.name}</h3>
              <button onClick={() => setIsAddAssessmentOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50">✕</button>
            </div>
            <form onSubmit={handleAddAssessmentSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                    <select value={asmCat} onChange={(e: any) => setAsmCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                      <option value="Fine Motor Skills">Fine Motor Skills</option>
                      <option value="Gross Motor Skills">Gross Motor Skills</option>
                      <option value="Sensory Processing">Sensory Processing</option>
                      <option value="Visual Motor Skills">Visual Motor Skills</option>
                      <option value="Coordination">Coordination</option>
                      <option value="Self-Care / ADL">Self-Care / ADL</option>
                      <option value="Attention">Attention</option>
                      <option value="Social Participation">Social Participation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Score (0-100%)</label>
                    <input required type="number" min="0" max="100" value={asmScore} onChange={(e) => setAsmScore(parseInt(e.target.value) || 60)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Observations</label>
                  <textarea rows={2} value={asmObs} onChange={(e) => setAsmObs(e.target.value)} placeholder="Developmental milestones hit..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Comments</label>
                  <textarea rows={2} value={asmComm} onChange={(e) => setAsmComm(e.target.value)} placeholder="Clinical evaluation feedback..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Recommendations</label>
                  <textarea rows={2} value={asmRec} onChange={(e) => setAsmRec(e.target.value)} placeholder="Action items..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddAssessmentOpen(false)} className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 hover:bg-clinic-800 text-white font-semibold text-xs rounded-xl">Record Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
