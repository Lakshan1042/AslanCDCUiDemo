import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  WeeklySessionsChart,
  AttendancePieChart,
  PatientProgressTrendChart
} from './DashboardCharts';
import { SessionWorkspaceView } from './SessionWorkspaceView';
import type { Appointment, Session } from '../types';
import {
  Users, UserCheck, Calendar, CheckSquare, Search, Plus,
  Activity, Box, TrendingUp,
  BadgeAlert, Download,
  Smile, Edit, Trash2, ArrowLeft, Save, Star, Clock, Shield
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    patients, therapists, appointments, goals, sessions, inventory,
    cupboards, attendanceRecords, feedbacks, currentPage, setCurrentPage,
    activePatientId, setActivePatientId, addPatient, updatePatientStatus, updatePatientLockStatus,
    addTherapist, deleteTherapist, addGoal, deleteGoal, addInventoryItem,
    bookAppointment, updateAppointmentStatus, addAttendanceRecord
  } = useClinic();

  // Active workspace state
  const [activeSessionPatientId, setActiveSessionPatientId] = useState<string | null>(null);

  // Selected session note modal viewer
  const [selectedSessionView, setSelectedSessionView] = useState<Session | null>(null);

  // Search/Filter states for Patients list
  const [patientSearch, setPatientSearch] = useState('');
  const [patientTherapistFilter, setPatientTherapistFilter] = useState('all');
  const [patientProgramFilter, setPatientProgramFilter] = useState('all');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');

  // Active patient in profile page
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const [profileTab, setProfileTab] = useState<'overview' | 'sessions' | 'goals' | 'progress' | 'attendance'>('overview');
  
  // Profile edit state
  const [profileStatus, setProfileStatus] = useState<string>(activePatient ? activePatient.status : 'Active');
  const [profileIsLocked, setProfileIsLocked] = useState<boolean>(activePatient?.isLocked || false);
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  // Subview toggle inside Inventory page
  const [inventorySubView, setInventorySubView] = useState<'registry' | 'cupboard-map'>('registry');

  // Modals state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddTherapistOpen, setIsAddTherapistOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  // Appointments Modals & Filters
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentViewMode, setAppointmentViewMode] = useState<'day' | 'week'>('week');
  const [aptTherapistFilter, setAptTherapistFilter] = useState('all');
  const [aptPatientFilter, setAptPatientFilter] = useState('all');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');

  // Booking Form State
  const [bookingMode, setBookingMode] = useState<'single' | 'multiple'>('single');
  const [bPatientId, setBPatientId] = useState('');
  const [bTherapistId, setBTherapistId] = useState('');
  const [bProgram, setBProgram] = useState('Sensory Integration Therapy');
  const [bRoom, setBRoom] = useState('Sensory Room A');
  const [bStartDate, setBStartDate] = useState('03/08/2026');
  const [bEndDate, setBEndDate] = useState('07/08/2026');
  const [bStartTime, setBStartTime] = useState('10:00 AM');
  const [bEndTime, setBEndTime] = useState('11:00 AM');
  const [bNotes, setBNotes] = useState('');

  // Cancel reason state for appointment modal
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isCancellingApt, setIsCancellingApt] = useState(false);

  // Attendance Modals
  const [attendanceTherapistSearch, setAttendanceTherapistSearch] = useState('');
  const [selectedTherapistForAttendance, setSelectedTherapistForAttendance] = useState<any | null>(null);
  const [attendanceDate, setAttendanceDate] = useState('03/08/2026');
  const [attendanceTime, setAttendanceTime] = useState('09:00 AM');
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Late' | 'On Leave'>('Present');
  const [attendanceReason, setAttendanceReason] = useState('');
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [viewAttendanceTherapist, setViewAttendanceTherapist] = useState<any | null>(null);

  // Storage / Cupboard Map State
  const [selectedCupboardId, setSelectedCupboardId] = useState<string>('cp-1');
  const [isAddCupboardOpen, setIsAddCupboardOpen] = useState(false);
  const [isAddShelfOpen, setIsAddShelfOpen] = useState(false);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [targetCupboardName, setTargetCupboardName] = useState<string>('');
  const [targetShelfName, setTargetShelfName] = useState<string>('');
  const [newCupboardName, setNewCupboardName] = useState('');
  const [newCupboardDesc, setNewCupboardDesc] = useState('');
  const [newShelfName, setNewShelfName] = useState('Shelf 1');

  // Add Patient Form State
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState(6);
  const [pGender, setPGender] = useState('Male');
  const [pParent, setPParent] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pTherapistId, setPTherapistId] = useState('th-1');
  const [pProgram, setPProgram] = useState('Sensory Integration Therapy');
  const [pConcerns, setPConcerns] = useState('');
  const [pPlan, setPPlan] = useState('');

  // Add Therapist Form State
  const [tName, setTName] = useState('');
  const [tAge, setTAge] = useState(32);
  const [tGender, setTGender] = useState('Female');
  const [tPhone, setTPhone] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tAddress] = useState('Chennai, Tamil Nadu');
  const [tSpec, setTSpec] = useState('Sensory Integration & Pediatric OT');
  const [tJoining, setTJoining] = useState('01/06/2023');
  const [tCollege, setTCollege] = useState('SRM Institute of OT');
  const [tDegree, setTDegree] = useState('BOT - Bachelor of OT');
  const [tYearPassing, setTYearPassing] = useState('2018');
  const [tEmployment, setTEmployment] = useState<'Full Time' | 'Part Time'>('Full Time');
  const [tStatus, setTStatus] = useState<'Active' | 'Inactive'>('Active');
  const [tPassword, setTPassword] = useState('password123');

  // Add Goal Form State
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gStart, setGStart] = useState('03/08/2026');
  const [gTarget, setGTarget] = useState('03/11/2026');

  // Add Inventory Form State
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState('Vestibular & Balance');
  const [invQty, setInvQty] = useState(2);
  const [invCup, setInvCup] = useState('Cupboard A');
  const [invShelf, setInvShelf] = useState('Shelf 1');
  const [invStatus, setInvStatus] = useState<'Good' | 'Need Maintenance'>('Good');

  // Admin Settings State
  const [adminName, setAdminName] = useState('Dr Vigneshwaran');
  const [clinicName, setClinicName] = useState('Aslan Child Development Center');
  const [branchName, setBranchName] = useState('Anna Nagar Branch, Chennai');
  const [adminUsername, setAdminUsername] = useState('admin@aslancdc.in');
  const [adminPassword, setAdminPassword] = useState('password123');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');

  // Form Submissions
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pParent || !pPhone) return;

    addPatient({
      name: pName,
      age: pAge,
      gender: pGender,
      parentName: pParent,
      parentPhone: pPhone,
      parentEmail: pEmail || `${pName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: pAddress || 'Chennai, Tamil Nadu',
      assignedTherapistId: pTherapistId,
      program: pProgram,
      status: 'Active',
      primaryConcerns: pConcerns || 'Developmental motor and sensory regulation support.',
      currentPlan: pPlan || 'Standard occupational therapy intervention program.'
    });

    setIsAddPatientOpen(false);
    setPName(''); setPParent(''); setPPhone(''); setPEmail(''); setPAddress(''); setPConcerns(''); setPPlan('');
  };

  const handleAddTherapistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tPhone || !tEmail) return;

    addTherapist({
      name: tName,
      employeeId: `EMP-OT-${100 + therapists.length + 1}`,
      specialization: tSpec || 'Sensory Integration & Pediatric OT',
      contact: tPhone,
      email: tEmail,
      password: tPassword || 'password123',
      age: tAge,
      gender: tGender,
      address: tAddress,
      dateOfJoining: tJoining,
      collegeName: tCollege,
      degreeProgram: tDegree,
      yearOfPassing: tYearPassing,
      employmentType: tEmployment,
      attendanceStatus: 'Present',
      status: tStatus
    });

    setIsAddTherapistOpen(false);
    setTName(''); setTPhone(''); setTEmail(''); setTPassword('password123');
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
      therapistNotes: ['Goal created by admin.']
    });

    setIsAddGoalOpen(false);
    setGName(''); setGDesc('');
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
      condition: invStatus === 'Need Maintenance' ? 'Needs Maintenance' : 'Good',
      status: invStatus === 'Need Maintenance' ? 'Maintenance Required' : invQty < 2 ? 'Low Stock' : 'Available'
    });

    setIsAddInventoryOpen(false);
    setInvName('');
  };

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bPatientId || !bTherapistId) return;

    const pObj = patients.find(p => p.id === bPatientId);
    const tObj = therapists.find(t => t.id === bTherapistId);

    if (bookingMode === 'single') {
      bookAppointment({
        patientId: bPatientId,
        patientName: pObj?.name || 'Patient',
        therapistId: bTherapistId,
        therapistName: tObj?.name || 'Therapist',
        sessionType: bProgram,
        date: bStartDate,
        startTime: bStartTime,
        endTime: bEndTime,
        room: bRoom,
        status: 'Scheduled',
        notes: bNotes
      });
    } else {
      // Multiple appointments demonstration
      const dates = [bStartDate, '05/08/2026', '07/08/2026'];
      dates.forEach(d => {
        bookAppointment({
          patientId: bPatientId,
          patientName: pObj?.name || 'Patient',
          therapistId: bTherapistId,
          therapistName: tObj?.name || 'Therapist',
          sessionType: bProgram,
          date: d,
          startTime: bStartTime,
          endTime: bEndTime,
          room: bRoom,
          status: 'Scheduled',
          notes: bNotes
        });
      });
    }

    setIsNewAppointmentOpen(false);
    setBNotes('');
  };

  const handleProfileSave = () => {
    if (activePatient) {
      updatePatientStatus(activePatient.id, profileStatus as any);
      updatePatientLockStatus(activePatient.id, profileIsLocked);
      setIsProfileChanged(false);
      alert(`Patient profile for ${activePatient.name} saved successfully.`);
    }
  };

  // Helper arrays
  const filteredAppointments = appointments.filter(apt => {
    if (aptTherapistFilter !== 'all' && apt.therapistId !== aptTherapistFilter) return false;
    if (aptPatientFilter !== 'all' && apt.patientId !== aptPatientFilter) return false;
    if (aptStatusFilter !== 'all' && apt.status !== aptStatusFilter) return false;
    return true;
  });

  const selectedCupboard = cupboards.find(c => c.id === selectedCupboardId) || cupboards[0];

  if (activeSessionPatientId) {
    return (
      <SessionWorkspaceView
        patientId={activeSessionPatientId}
        onBack={() => setActiveSessionPatientId(null)}
      />
    );
  }

  if (selectedSessionView) {
    return (
      <SessionWorkspaceView
        existingSession={selectedSessionView}
        readOnlyInitial={true}
        onBack={() => setSelectedSessionView(null)}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* ------------------ 1. DASHBOARD PAGE ------------------ */}
      {currentPage === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Active Patients (Overall) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Patients (Overall)</span>
                <div className="p-3 bg-clinic-50 text-clinic-700 rounded-2xl"><Users className="w-5 h-5" /></div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">{patients.filter(p => p.status === 'Active').length}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>This Month Addition</span>
                    <span className="text-emerald-600 font-extrabold">+8%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-clinic-700 h-full w-[68%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Therapists Present */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Therapists Present</span>
                <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl"><UserCheck className="w-5 h-5" /></div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-800">5</span>
                  <span className="text-sm font-bold text-slate-400">out of {therapists.length}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                  Today's Attendance Verified
                </span>
              </div>
            </div>

            {/* Card 3: Today's Bookings */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today's Bookings</span>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar className="w-5 h-5" /></div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">{appointments.filter(a => a.date === '03/08/2026').length}</h3>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                  9 Scheduled Sessions
                </span>
              </div>
            </div>

            {/* Card 4: Session Count (Monthly Count) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Session Count (Monthly)</span>
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Activity className="w-5 h-5" /></div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">{sessions.length + 38}</h3>
                <span className="text-[10px] text-clinic-700 font-bold bg-clinic-100 px-2 py-0.5 rounded-full mt-2 inline-block">
                  August Monthly Target: 50+
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-clinic-700" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setIsAddPatientOpen(true)}
                className="p-3.5 bg-clinic-50/60 hover:bg-clinic-50 border border-clinic-100 text-clinic-800 font-extrabold text-xs rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <Users className="w-5 h-5 text-clinic-700" />
                <span>Add Patient</span>
              </button>
              <button
                onClick={() => setIsAddTherapistOpen(true)}
                className="p-3.5 bg-sky-50/60 hover:bg-sky-50 border border-sky-100 text-sky-800 font-extrabold text-xs rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>Add Therapists</span>
              </button>
              <button
                onClick={() => setIsAddInventoryOpen(true)}
                className="p-3.5 bg-violet-50/60 hover:bg-violet-50 border border-violet-100 text-violet-800 font-extrabold text-xs rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <Box className="w-5 h-5 text-violet-600" />
                <span>Add Inventory</span>
              </button>
              <button
                onClick={() => setCurrentPage('attendance')}
                className="p-3.5 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold text-xs rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => setIsNewAppointmentOpen(true)}
                className="p-3.5 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 text-amber-800 font-extrabold text-xs rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>Appointment</span>
              </button>
            </div>
          </div>

          {/* Analysis Cards / Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Widget 1: Today's Sessions */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <h2 className="font-extrabold text-slate-800 text-base">Today's Session (03 Aug 2026)</h2>
                  <button
                    onClick={() => setCurrentPage('appointments')}
                    className="text-xs text-clinic-700 hover:text-clinic-800 font-bold flex items-center gap-1 bg-clinic-50 px-3 py-1.5 rounded-xl border border-clinic-100 transition cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Calendar</span>
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
                  {appointments.filter(a => a.date === '03/08/2026').map((apt) => (
                    <div key={apt.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-800 text-sm">{apt.patientName}</div>
                        <div className="text-slate-500 font-medium">
                          {apt.sessionType} • {apt.therapistName}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-slate-700 flex items-center justify-end gap-1 text-xs">
                          <Clock className="w-3.5 h-3.5 text-clinic-600" />
                          <span>{apt.startTime}</span>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
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

            {/* Widget 2: Sessions Overview (Attendance Piechart) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100">Attendance (Session Attendance)</h2>
                <AttendancePieChart />
              </div>
            </div>

          </div>

          {/* Widgets Row 2: Frequency, Inventory Alerts, Feedbacks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Widget 3: Session Frequency Bar Chart */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
              <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-4">
                Completed Session Frequency (Weekly)
              </h2>
              <WeeklySessionsChart />
            </div>

            {/* Widget 4: Inventory Alerts */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-3 flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Inventory Alerts</span>
                </h2>
                <div className="space-y-3">
                  {inventory.filter(item => item.status === 'Low Stock' || item.status === 'Maintenance Required').map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Location: {item.cupboard} → {item.shelf}</div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.status === 'Low Stock' ? 'Available' : 'Need maintenance'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setCurrentPage('inventory'); setInventorySubView('cupboard-map'); }}
                className="mt-4 w-full bg-clinic-50 hover:bg-clinic-100 border border-clinic-200 py-2.5 rounded-xl font-bold text-xs text-clinic-800 transition cursor-pointer"
              >
                Manage Inventory & Storage
              </button>
            </div>

            {/* Widget 5: Parent's Feedback Carousel/List */}
            <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100 mb-3 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-clinic-700" />
                  <span>Parent's Feedback</span>
                </h2>
                <div className="space-y-3 text-xs">
                  {feedbacks.slice(0, 2).map((fb) => (
                    <div key={fb.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-800">{fb.parentName}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic font-medium">"{fb.comments}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('feedback')}
                className="mt-4 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-xl font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                View Feedbacks
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------ 2. PATIENTS MANAGEMENT ------------------ */}
      {currentPage === 'patients' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Enroll new patients and configure OT schedules.</p>
            </div>
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-clinic-500 text-slate-700 font-medium"
              />
            </div>

            <select
              value={patientTherapistFilter}
              onChange={(e) => setPatientTherapistFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none font-medium text-slate-600"
            >
              <option value="all">All Therapists</option>
              {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select
              value={patientProgramFilter}
              onChange={(e) => setPatientProgramFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none font-medium text-slate-600"
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
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none font-medium text-slate-600"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Patient Id</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Parent Name & Contact</th>
                    <th className="px-6 py-4">Assigned Therapist</th>
                    <th className="px-6 py-4">Program Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
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
                        <td className="px-6 py-4 font-extrabold text-slate-800 cursor-pointer hover:text-clinic-700" onClick={() => { setActivePatientId(p.id); setProfileTab('overview'); setCurrentPage('patient-profile'); }}>
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.id.toUpperCase()}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{p.age} years</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="font-bold text-slate-800">{p.parentName}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{p.parentPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{p.assignedTherapistName}</td>
                        <td className="px-6 py-4 text-clinic-700 font-extrabold text-xs">{p.program}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            p.isLocked ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            p.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            p.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {p.isLocked ? 'Locked' : p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => { setActivePatientId(p.id); setProfileTab('overview'); setCurrentPage('patient-profile'); }}
                            className="text-xs text-clinic-700 font-extrabold hover:underline cursor-pointer"
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

      {/* ------------------ PATIENT PROFILE DETAIL VIEW ------------------ */}
      {currentPage === 'patient-profile' && activePatient && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Bar / Small Div */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-clinic-700 text-white font-black flex items-center justify-center text-xl shadow-sm">
                {activePatient.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>{activePatient.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 border">{activePatient.id.toUpperCase()}</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                  Age: <strong>{activePatient.age} years</strong> • Program: <strong className="text-clinic-700">{activePatient.program}</strong> • Therapist: <strong>{activePatient.assignedTherapistName}</strong>
                </p>
              </div>
            </div>

            {/* Actions: Status Dropdown (Active, On Hold, Discharged, Locked), Back & Save */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
                <select
                  value={profileIsLocked ? 'Locked' : profileStatus}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Locked') {
                      setProfileIsLocked(true);
                    } else {
                      setProfileIsLocked(false);
                      setProfileStatus(val);
                    }
                    setIsProfileChanged(true);
                  }}
                  className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Locked">Locked (Disable Parent Login)</option>
                </select>
              </div>

              <button
                onClick={handleProfileSave}
                disabled={!isProfileChanged}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  isProfileChanged
                    ? 'bg-clinic-700 hover:bg-clinic-800 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                onClick={() => setCurrentPage('patients')}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Overview, Sessions, Goals, Progress, Attendance */}
          <div className="flex border-b border-slate-200 overflow-x-auto py-1">
            {(['overview', 'sessions', 'goals', 'progress', 'attendance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`px-5 py-2.5 text-xs font-extrabold capitalize border-b-2 whitespace-nowrap transition cursor-pointer ${
                  profileTab === tab
                    ? 'border-clinic-700 text-clinic-700'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {tab === 'overview' ? 'Patients Overview' :
                 tab === 'sessions' ? 'Sessions (History)' :
                 tab === 'goals' ? 'Goals (Score Based)' :
                 tab === 'progress' ? 'Progress (Session wise)' : 'Attendance'}
              </button>
            ))}
          </div>

          {/* Sub-tab 1: Patients Overview */}
          {profileTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">Patient Enrollment Details</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Parent / Guardian Name</span>
                      <span className="font-bold text-slate-800 text-sm">{activePatient.parentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Parent Contact Number</span>
                      <span className="font-bold text-slate-800 text-sm">{activePatient.parentPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Parent Email</span>
                      <span className="font-bold text-slate-800 text-sm">{activePatient.parentEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Residential Address</span>
                      <span className="font-bold text-slate-800 text-sm">{activePatient.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Primary Clinical Concerns</span>
                      <p className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed mt-1">
                        {activePatient.primaryConcerns}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">Next Appointment Details</h3>
                  {activePatient.nextAppointmentDate ? (
                    <div className="p-4 bg-clinic-50/60 rounded-2xl border border-clinic-100 space-y-1">
                      <div className="text-clinic-700 font-black text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Date: {activePatient.nextAppointmentDate}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Time: 10:00 AM • Scheduled with <strong>{activePatient.assignedTherapistName}</strong>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No future appointment scheduled.</p>
                  )}
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-2">Patient Attendance Summary</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-600 font-semibold">Monthly Attendance Rate</span>
                    <span className="text-base font-black text-emerald-600">92% Present</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Sessions (History) */}
          {profileTab === 'sessions' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Completed Therapy Logs</h3>
                <button
                  onClick={() => setActiveSessionPatientId(activePatient.id)}
                  className="px-3 py-1.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Start New Session</span>
                </button>
              </div>

              <div className="space-y-3">
                {sessions.filter(s => s.patientId === activePatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No therapy logs recorded yet.</p>
                ) : (
                  sessions.filter(s => s.patientId === activePatient.id).map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSessionView(s)}
                      className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl cursor-pointer transition space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center font-extrabold text-slate-800">
                        <span>Session Date: {s.date} ({s.duration} mins)</span>
                        <span className="text-clinic-700 bg-white border px-2 py-0.5 rounded-full">{s.sessionType}</span>
                      </div>
                      {s.workspaceData && (
                        <div className="space-y-1 text-slate-600 font-medium">
                          <p><strong>Activities Performed:</strong> {s.workspaceData.activitiesPerformed.join(', ')}</p>
                          <p><strong>Observations:</strong> {s.workspaceData.observations}</p>
                          <p><strong>Homework Notes:</strong> {s.workspaceData.homeRecommendations}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sub-tab 3: Goals */}
          {profileTab === 'goals' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm">Therapy Goal Checkpoints</h3>
                <button
                  onClick={() => setIsAddGoalOpen(true)}
                  className="px-3 py-1.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="space-y-4">
                {goals.filter(g => g.patientId === activePatient.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No goals defined for this patient.</p>
                ) : (
                  goals.filter(g => g.patientId === activePatient.id).map((g) => (
                    <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm">{g.name}</div>
                          <p className="text-slate-500 font-medium mt-0.5">{g.description}</p>
                        </div>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                          <span>Timeline: {g.startDate} - {g.targetDate}</span>
                          <span className="text-clinic-700">Progress: {g.progressPercent}%</span>
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

          {/* Sub-tab 4: Progress */}
          {profileTab === 'progress' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Patient Development Chart</h3>
              <PatientProgressTrendChart singlePatient={true} />
            </div>
          )}

          {/* Sub-tab 5: Attendance */}
          {profileTab === 'attendance' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-3">Patient Attendance History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Therapist Name</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.filter(r => r.type === 'Patient' && r.name === activePatient.name).map((rec) => (
                      <tr key={rec.id}>
                        <td className="px-4 py-3 font-bold text-slate-800">{rec.date}</td>
                        <td className="px-4 py-3 text-slate-600">{rec.time || '10:00 AM'}</td>
                        <td className="px-4 py-3 text-slate-700">{rec.therapistName || activePatient.assignedTherapistName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold border ${
                            rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------ 3. THERAPIST MANAGEMENT ------------------ */}
      {currentPage === 'therapists' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Therapist Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage employee details, schedules, and presence.</p>
            </div>
            <button
              onClick={() => setIsAddTherapistOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Therapist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((t) => (
              <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-base">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{t.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{t.employeeId}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    t.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <div>Specialization: <strong className="text-slate-800">{t.specialization}</strong></div>
                  <div>Assigned Cases: <strong className="text-clinic-700">{t.assignedPatients.length} active patients</strong></div>
                  <div>Today's Session: <strong>{t.todaySessionsCount} sessions</strong></div>
                  <div>Contact: <strong>{t.contact}</strong></div>
                  {t.employmentType && <div>Type: <strong>{t.employmentType}</strong></div>}
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => alert(`Therapist profile for ${t.name} (EMP: ${t.employeeId})`)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteTherapist(t.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition cursor-pointer"
                    title="Delete Therapist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ 4. APPOINTMENTS CALENDAR ------------------ */}
      {currentPage === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Appointments Calendar</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage and schedule therapy bookings.</p>
            </div>
            <button
              onClick={() => setIsNewAppointmentOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Appointment</span>
            </button>
          </div>

          {/* Filters dropdowns */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Filters:</span>
              <select
                value={aptTherapistFilter}
                onChange={(e) => setAptTherapistFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">All Therapists</option>
                {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select
                value={aptPatientFilter}
                onChange={(e) => setAptPatientFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">All Patients</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select
                value={aptStatusFilter}
                onChange={(e) => setAptStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled / No Show</option>
              </select>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setAppointmentViewMode('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${appointmentViewMode === 'day' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
              >
                Day View (8 AM - 10 PM)
              </button>
              <button
                onClick={() => setAppointmentViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${appointmentViewMode === 'week' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
              >
                Week View (Mon - Sun)
              </button>
            </div>
          </div>

          {/* Appointments Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            {appointmentViewMode === 'day' ? (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm border-b pb-2">Hourly Day Schedule (03 Aug 2026)</div>
                {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map((timeSlot) => {
                  const slots = filteredAppointments.filter(a => a.date === '03/08/2026' && a.startTime === timeSlot);
                  return (
                    <div key={timeSlot} className="flex border-b border-slate-100 py-2.5 gap-4 items-center text-xs">
                      <span className="w-24 font-bold text-slate-400">{timeSlot}</span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {slots.length > 0 ? (
                          slots.map(apt => (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className="p-2 rounded-xl bg-clinic-50 border border-clinic-200 cursor-pointer font-bold text-clinic-800"
                            >
                              {apt.patientName} • {apt.sessionType} ({apt.startTime})
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-300 italic">Free slot</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-xs">
                {['03/08/2026', '04/08/2026', '05/08/2026', '06/08/2026', '07/08/2026', '08/08/2026', '09/08/2026'].map((dStr, idx) => {
                  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const dayApts = filteredAppointments.filter(a => a.date === dStr);
                  return (
                    <div key={dStr} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 min-h-[300px]">
                      <div className="text-center font-extrabold text-slate-700 border-b pb-2 mb-2">
                        {dayNames[idx]} ({dStr.slice(0, 5)})
                      </div>
                      <div className="space-y-2">
                        {dayApts.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer space-y-1 hover:border-clinic-500"
                          >
                            <div className="font-extrabold text-slate-800 truncate">{apt.patientName}</div>
                            <div className="text-[10px] text-clinic-700 font-bold truncate">{apt.sessionType}</div>
                            <div className="text-[9px] text-slate-400 font-semibold">{apt.startTime}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ 5. ATTENDANCE LOGS ------------------ */}
      {currentPage === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance Logs</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track therapist daily attendance.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search therapist by name or ID..."
              value={attendanceTherapistSearch}
              onChange={(e) => setAttendanceTherapistSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-medium text-slate-700"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-6 py-4">Therapist Name</th>
                    <th className="px-6 py-4">Therapist ID</th>
                    <th className="px-6 py-4">Role / Specialization</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {therapists
                    .filter(t => t.name.toLowerCase().includes(attendanceTherapistSearch.toLowerCase()) || t.employeeId.toLowerCase().includes(attendanceTherapistSearch.toLowerCase()))
                    .map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-800">{t.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{t.employeeId}</td>
                        <td className="px-6 py-4 text-slate-600">{t.specialization}</td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => { setSelectedTherapistForAttendance(t); setIsMarkAttendanceOpen(true); }}
                            className="px-3 py-1.5 bg-clinic-700 hover:bg-clinic-800 text-white font-bold rounded-xl transition cursor-pointer"
                          >
                            Mark Attendance
                          </button>
                          <button
                            onClick={() => setViewAttendanceTherapist(t)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                          >
                            View Attendance
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

      {/* ------------------ 6. SESSIONS (THERAPY SESSION NOTES) ------------------ */}
      {currentPage === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Therapy Session Notes</h1>
            <p className="text-slate-500 text-sm mt-0.5">Audit therapist notes and activities completed.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">Recorded Session Notes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Therapist Name</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Session Type</th>
                    <th className="px-4 py-3">Goals Addressed</th>
                    <th className="px-4 py-3">Activities Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sessions.map(s => (
                    <tr key={s.id} onClick={() => setSelectedSessionView(s)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-3 font-bold text-slate-800">{s.patientName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.therapistName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.date}</td>
                      <td className="px-4 py-3 text-slate-600">{s.duration} mins</td>
                      <td className="px-4 py-3 text-clinic-700 font-bold">{s.sessionType}</td>
                      <td className="px-4 py-3 text-slate-600">{s.goalsWorkedOn.join(', ')}</td>
                      <td className="px-4 py-3 text-slate-600">{s.workspaceData?.activitiesPerformed.join(', ') || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Documentation Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base border-b pb-2 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 text-amber-500" />
              <span>Pending Document</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Therapist Name</th>
                    <th className="px-4 py-3">Session Date</th>
                    <th className="px-4 py-3">Session Time</th>
                    <th className="px-4 py-3">Notes Pending Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {appointments.filter(a => a.status === 'Completed').map(apt => (
                    <tr key={apt.id}>
                      <td className="px-4 py-3 font-bold text-slate-800">{apt.patientName}</td>
                      <td className="px-4 py-3 text-slate-600">{apt.therapistName}</td>
                      <td className="px-4 py-3 text-slate-600">{apt.date}</td>
                      <td className="px-4 py-3 text-slate-600">{apt.startTime}</td>
                      <td className="px-4 py-3">
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold">
                          Notes Pending
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

      {/* ------------------ 7. GOALS AND PROGRESS ------------------ */}
      {currentPage === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Goals Tracking & Progress</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor patient progress against individual milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map(g => {
              const pt = patients.find(p => p.id === g.patientId);
              return (
                <div key={g.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3 text-xs">
                  <div className="flex justify-between items-start font-extrabold text-slate-800 text-sm">
                    <div>
                      <div>{g.name}</div>
                      <div className="text-xs text-clinic-700 font-bold mt-0.5">Patient: {pt?.name || g.patientId}</div>
                    </div>
                    <span className="text-clinic-700 bg-clinic-50 border border-clinic-100 px-2 py-0.5 rounded-full">{g.progressPercent}%</span>
                  </div>
                  <p className="text-slate-500 font-medium">{g.description}</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-clinic-700 h-full" style={{ width: `${g.progressPercent}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    Timeline: {g.startDate} to {g.targetDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------ 8. INVENTORY ------------------ */}
      {currentPage === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {inventorySubView === 'registry' ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory Registry</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Track location, availability, and quality of therapy tools.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInventorySubView('cupboard-map')}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    Cupboard Map
                  </button>
                  <button
                    onClick={() => setIsAddInventoryOpen(true)}
                    className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="px-6 py-4">Inventory Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Cupboard and Location</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {inventory.map(item => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.category}</td>
                          <td className="px-6 py-4 text-slate-600">{item.quantity} units</td>
                          <td className="px-6 py-4 text-slate-700 font-bold">{item.cupboard} → {item.shelf}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                              item.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-clinic-700 font-bold hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* Cupboard Map View */
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Storage and Cupboard Map</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Visualize where clinic occupational therapy gear is kept.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInventorySubView('registry')}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Back to Registry
                  </button>
                  <button
                    onClick={() => setIsAddCupboardOpen(true)}
                    className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Cupboard</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase">Cupboards List</div>
                  {cupboards.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCupboardId(c.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition shadow-card ${
                        selectedCupboardId === c.id ? 'bg-clinic-50 border-clinic-600' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="font-extrabold text-slate-800 text-sm">{c.name}</div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                        <span>{c.shelves.length} Shelves</span>
                        <span>{inventory.filter(i => i.cupboard === c.name).reduce((sum, i) => sum + i.quantity, 0)} Total Quantity</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h2 className="font-extrabold text-slate-800 text-base">{selectedCupboard.name} Shelf Blueprint</h2>
                      <p className="text-xs text-slate-500">{selectedCupboard.description}</p>
                    </div>
                    <button
                      onClick={() => setIsAddShelfOpen(true)}
                      className="text-clinic-700 font-bold text-xs hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Shelf</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedCupboard.shelves.map(shelf => {
                      const shelfItems = inventory.filter(i => i.cupboard === selectedCupboard.name && i.shelf === shelf.name);
                      return (
                        <div key={shelf.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex justify-between text-xs font-extrabold text-slate-700">
                            <span>{shelf.name}</span>
                            <span className="text-slate-400 font-medium">{shelfItems.length} items</span>
                          </div>
                          <div className="space-y-2">
                            {shelfItems.map(item => (
                              <div key={item.id} className="p-3 bg-white rounded-xl border flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-bold text-slate-800">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold">Qty: {item.quantity} • Status: {item.status}</div>
                                </div>
                                <button
                                  onClick={() => {
                                    setMovingItemId(item.id);
                                    setTargetCupboardName(item.cupboard);
                                    setTargetShelfName(item.shelf);
                                  }}
                                  className="text-clinic-700 font-bold text-xs hover:underline"
                                >
                                  Move
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------ 9. REPORTS ------------------ */}
      {currentPage === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Clinical Reports</h1>
              <p className="text-slate-500 text-sm mt-0.5">Generate and download client metric analytics.</p>
            </div>
            <button
              onClick={() => alert("Downloading PDF summary report...")}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Sessions Metric Analytics</h3>
              <p className="text-xs text-slate-500">Total sessions completed this quarter: 142 sessions.</p>
              <WeeklySessionsChart />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3">
              <h3 className="font-extrabold text-slate-800 text-base">Therapist Attendance Analytics</h3>
              <p className="text-xs text-slate-500">Attendance retention rate: 94% present on time.</p>
              <AttendancePieChart />
            </div>
          </div>
        </div>
      )}

      {/* ------------------ 10. FEEDBACK ------------------ */}
      {currentPage === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Parent's Feedback</h1>
            <p className="text-slate-500 text-sm mt-0.5">Audit parent ratings, comments, and clinic suggestions.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-6 py-4">Feedback Date</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Parent Name</th>
                    <th className="px-6 py-4">Score / Rating</th>
                    <th className="px-6 py-4">Feedback Text</th>
                    <th className="px-6 py-4">Comments / Suggestions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {feedbacks.map(fb => (
                    <tr key={fb.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{fb.date}</td>
                      <td className="px-6 py-4 text-slate-700">{fb.patientName}</td>
                      <td className="px-6 py-4 text-slate-700">{fb.parentName}</td>
                      <td className="px-6 py-4">
                        <div className="flex text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs">{fb.comments}</td>
                      <td className="px-6 py-4 text-slate-500 italic max-w-xs">{fb.suggestions || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ 11. SETTINGS ------------------ */}
      {currentPage === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Settings</h1>
              <p className="text-slate-500 text-sm mt-0.5">Configure clinic details and administrator credentials.</p>
            </div>
            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Add Admin</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium max-w-xl space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">Clinic General Profile</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Branch</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                  />
                </div>
              </div>
              <button
                onClick={() => alert("Clinic System Settings saved!")}
                className="mt-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MODALS ------------------ */}

      {/* Modal: Add Patient */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Enroll New Patient</h3>
              <button onClick={() => setIsAddPatientOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleAddPatientSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Patient Name</label>
                  <input required type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="e.g. Aarav Kumar" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Age</label>
                    <input required type="number" value={pAge} onChange={(e) => setPAge(parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Gender</label>
                    <select value={pGender} onChange={(e) => setPGender(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Parent / Guardian Name</label>
                  <input required type="text" value={pParent} onChange={(e) => setPParent(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Parent Name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Parent Phone</label>
                    <input required type="text" value={pPhone} onChange={(e) => setPPhone(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="+91 99400 00000" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Parent Email</label>
                    <input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="parent@gmail.com" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Assigned Therapist</label>
                  <select value={pTherapistId} onChange={(e) => setPTherapistId(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Program</label>
                  <select value={pProgram} onChange={(e) => setPProgram(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                    <option value="Sensory Integration Therapy">Sensory Integration Therapy</option>
                    <option value="Fine Motor Program">Fine Motor Program</option>
                    <option value="Handwriting Program">Handwriting Program</option>
                    <option value="Early Intervention Program">Early Intervention Program</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Enroll Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Therapist */}
      {isAddTherapistOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add New Therapist</h3>
              <button onClick={() => setIsAddTherapistOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleAddTherapistSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Therapist Name</label>
                    <input required type="text" value={tName} onChange={(e) => setTName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Dr. Name" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Specialization</label>
                    <input required type="text" value={tSpec} onChange={(e) => setTSpec(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Age</label>
                    <input type="number" value={tAge} onChange={(e) => setTAge(parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Gender</label>
                    <select value={tGender} onChange={(e) => setTGender(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Joining Date</label>
                    <input type="text" value={tJoining} onChange={(e) => setTJoining(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input required type="text" value={tPhone} onChange={(e) => setTPhone(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input required type="email" value={tEmail} onChange={(e) => setTEmail(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div className="font-extrabold text-slate-700">Educational Details</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">College Name</label>
                      <input type="text" value={tCollege} onChange={(e) => setTCollege(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Program Name</label>
                      <input type="text" value={tDegree} onChange={(e) => setTDegree(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Year of Passing</label>
                      <input type="text" value={tYearPassing} onChange={(e) => setTYearPassing(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t pt-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Employment Type</label>
                    <select value={tEmployment} onChange={(e: any) => setTEmployment(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select value={tStatus} onChange={(e: any) => setTStatus(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">AMS Password</label>
                    <input type="password" value={tPassword} onChange={(e) => setTPassword(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddTherapistOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Save Therapist</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Goal */}
      {isAddGoalOpen && activePatient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Goal for {activePatient.name}</h3>
              <button onClick={() => setIsAddGoalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleAddGoalSubmit}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Goal Name</label>
                  <input required type="text" value={gName} onChange={(e) => setGName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Goal Name" />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea rows={2} value={gDesc} onChange={(e) => setGDesc(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input type="text" value={gStart} onChange={(e) => setGStart(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Target End Date</label>
                    <input type="text" value={gTarget} onChange={(e) => setGTarget(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddGoalOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Appointment */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">New Appointment</h3>
              <button onClick={() => setIsNewAppointmentOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleBookAppointmentSubmit}>
              <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Select Patient</label>
                  <select required value={bPatientId} onChange={(e) => setBPatientId(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800">
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Select Therapist</label>
                  <select required value={bTherapistId} onChange={(e) => setBTherapistId(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800">
                    <option value="">-- Choose Therapist --</option>
                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Program Name</label>
                    <select value={bProgram} onChange={(e) => setBProgram(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Sensory Integration Therapy">Sensory Integration Therapy</option>
                      <option value="Fine Motor Program">Fine Motor Program</option>
                      <option value="Handwriting Program">Handwriting Program</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Room / Location</label>
                    <select value={bRoom} onChange={(e) => setBRoom(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      <option value="Sensory Room A">Sensory Room A</option>
                      <option value="Sensory Room B">Sensory Room B</option>
                      <option value="Therapy Cabinet 1">Therapy Cabinet 1</option>
                      <option value="Gym Area 1">Gym Area 1</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                  <div className="flex gap-4 font-bold text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="bmode" checked={bookingMode === 'single'} onChange={() => setBookingMode('single')} />
                      <span>Single Appointment</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="bmode" checked={bookingMode === 'multiple'} onChange={() => setBookingMode('multiple')} />
                      <span>Multiple Appointments</span>
                    </label>
                  </div>

                  {bookingMode === 'single' ? (
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Select Date</label>
                      <input type="text" value={bStartDate} onChange={(e) => setBStartDate(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-1.5 font-bold" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-400 uppercase mb-1">Start Date</label>
                        <input type="text" value={bStartDate} onChange={(e) => setBStartDate(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-1.5 font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 uppercase mb-1">End Date</label>
                        <input type="text" value={bEndDate} onChange={(e) => setBEndDate(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-1.5 font-bold" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Start Time</label>
                      <input type="text" value={bStartTime} onChange={(e) => setBStartTime(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-1.5 font-bold" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">End Time</label>
                      <input type="text" value={bEndTime} onChange={(e) => setBEndTime(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-1.5 font-bold" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Notes / Instructions</label>
                  <textarea rows={2} value={bNotes} onChange={(e) => setBNotes(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsNewAppointmentOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View/Edit Appointment */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Appointment Details</h3>
              <button onClick={() => { setSelectedAppointment(null); setIsCancellingApt(false); }} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="font-extrabold text-slate-800 text-base">{selectedAppointment.patientName} (ID: {selectedAppointment.patientId})</div>
              <div className="space-y-1 text-slate-600">
                <div>Therapist: <strong>{selectedAppointment.therapistName}</strong></div>
                <div>Program Type: <strong>{selectedAppointment.sessionType}</strong></div>
                <div>Time: <strong>{selectedAppointment.startTime} - {selectedAppointment.endTime}</strong></div>
                <div>Room: <strong>{selectedAppointment.room}</strong></div>
                <div>Status: <strong className="text-clinic-700">{selectedAppointment.status}</strong></div>
              </div>

              {isCancellingApt && (
                <div className="space-y-2 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <label className="block font-bold text-rose-800 uppercase">Reason for Cancellation</label>
                  <input
                    type="text"
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 font-medium text-slate-700"
                  />
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'Cancelled', cancelReasonInput);
                      setSelectedAppointment(null);
                      setIsCancellingApt(false);
                    }}
                    className="w-full bg-rose-600 text-white font-bold py-1.5 rounded-xl transition"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              {selectedAppointment.status === 'Scheduled' && !isCancellingApt && (
                <>
                  <button
                    onClick={() => setIsCancellingApt(true)}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs"
                  >
                    Cancel Appointment
                  </button>
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'Completed');
                      setSelectedAppointment(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                  >
                    Mark Completed
                  </button>
                </>
              )}
              <button onClick={() => { setSelectedAppointment(null); setIsCancellingApt(false); }} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mark Therapist Attendance */}
      {isMarkAttendanceOpen && selectedTherapistForAttendance && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Mark Attendance: {selectedTherapistForAttendance.name}</h3>
              <button onClick={() => setIsMarkAttendanceOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Select Date</label>
                  <input type="text" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Select Time</label>
                  <input type="text" value={attendanceTime} onChange={(e) => setAttendanceTime(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Status</label>
                <select value={attendanceStatus} onChange={(e: any) => setAttendanceStatus(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {attendanceStatus === 'On Leave' && (
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Reason for Leave</label>
                  <input type="text" value={attendanceReason} onChange={(e) => setAttendanceReason(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Enter reason..." />
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setIsMarkAttendanceOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button
                onClick={() => {
                  addAttendanceRecord({
                    type: 'Therapist',
                    name: selectedTherapistForAttendance.name,
                    date: attendanceDate,
                    time: attendanceTime,
                    status: attendanceStatus,
                    notes: attendanceReason
                  });
                  setIsMarkAttendanceOpen(false);
                }}
                className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Attendance Calendar */}
      {viewAttendanceTherapist && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Monthly Attendance: {viewAttendanceTherapist.name}</h3>
              <button onClick={() => setViewAttendanceTherapist(null)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="font-bold text-slate-600">August 2026 Attendance Overview</div>
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className={`p-2 rounded-lg font-bold border ${i % 7 === 6 ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button onClick={() => setViewAttendanceTherapist(null)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Inventory */}
      {isAddInventoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add Inventory Item</h3>
              <button onClick={() => setIsAddInventoryOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <form onSubmit={handleAddInventorySubmit}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Item Name</label>
                  <input required type="text" value={invName} onChange={(e) => setInvName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Item Name" />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Category</label>
                  <input required type="text" value={invCat} onChange={(e) => setInvCat(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Quantity</label>
                    <input type="number" value={invQty} onChange={(e) => setInvQty(parseInt(e.target.value))} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Cupboard Name</label>
                    <select value={invCup} onChange={(e) => setInvCup(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      {cupboards.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Shelf Name</label>
                    <select value={invShelf} onChange={(e) => setInvShelf(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                      {cupboards.find(c => c.name === invCup)?.shelves.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select value={invStatus} onChange={(e: any) => setInvStatus(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold">
                    <option value="Good">Good</option>
                    <option value="Need Maintenance">Need Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddInventoryOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Admin */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add New Admin</h3>
              <button onClick={() => setIsAddAdminOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Admin Name</label>
                <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Name" />
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Admin Username</label>
                <input type="text" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="admin2@aslancdc.in" />
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Admin Password</label>
                <input type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Password" />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setIsAddAdminOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={() => { alert("New Admin added successfully!"); setIsAddAdminOpen(false); }} className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Create Admin</button>
            </div>
          </div>
        </div>
      )}



      {/* Modal: Add Cupboard */}
      {isAddCupboardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add New Cupboard</h3>
              <button onClick={() => setIsAddCupboardOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Cupboard Name</label>
                <input type="text" value={newCupboardName} onChange={(e) => setNewCupboardName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Cupboard C" />
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Description</label>
                <input type="text" value={newCupboardDesc} onChange={(e) => setNewCupboardDesc(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Storage for Fine Motor Equipment" />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setIsAddCupboardOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={() => { alert("New Cupboard created successfully!"); setIsAddCupboardOpen(false); setNewCupboardName(''); setNewCupboardDesc(''); }} className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Save Cupboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Shelf */}
      {isAddShelfOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add New Shelf</h3>
              <button onClick={() => setIsAddShelfOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Shelf Name / Designation</label>
                <input type="text" value={newShelfName} onChange={(e) => setNewShelfName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium" placeholder="Shelf 4" />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setIsAddShelfOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={() => { alert("New Shelf added successfully!"); setIsAddShelfOpen(false); }} className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Add Shelf</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Move Inventory Item */}
      {movingItemId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Move Inventory Item Location</h3>
              <button onClick={() => setMovingItemId(null)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Target Cupboard</label>
                <select value={targetCupboardName} onChange={(e) => setTargetCupboardName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                  {cupboards.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Target Shelf</label>
                <select value={targetShelfName} onChange={(e) => setTargetShelfName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium">
                  {cupboards.find(c => c.name === targetCupboardName)?.shelves.map(s => <option key={s.id} value={s.name}>{s.name}</option>) || <option value="Shelf 1">Shelf 1</option>}
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setMovingItemId(null)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button
                onClick={() => {
                  alert(`Item successfully relocated to ${targetCupboardName} - ${targetShelfName}!`);
                  setMovingItemId(null);
                }}
                className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <span>Confirm Move</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
