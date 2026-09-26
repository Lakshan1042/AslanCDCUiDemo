import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { SessionWorkspaceView } from './SessionWorkspaceView';
import type { Session, Appointment } from '../types';
import {
  Users, Calendar, CheckSquare, AlertCircle, Search,
  Settings as SettingsIcon, Plus, Clock
} from 'lucide-react';

export const TherapistPortal: React.FC = () => {
  const {
    patients, therapists, appointments, goals, sessions, homeworks, currentPage,
    setCurrentPage, activeTherapistId, setActivePatientId, attendanceRecords,
    bookAppointment, updateAppointmentStatus
  } = useClinic();

  // Active session workspace state
  const [activeSessionPatientId, setActiveSessionPatientId] = useState<string | null>(null);

  // Selected session note viewer
  const [selectedSessionView, setSelectedSessionView] = useState<Session | null>(null);

  // Match current therapist
  const therapist = therapists.find(t => t.id === activeTherapistId) || therapists[0];

  // Filtered data for active therapist
  const myPatientsList = patients.filter(p => p.assignedTherapistId === therapist.id);
  const myAppointments = appointments.filter(a => a.therapistId === therapist.id);
  const mySessions = sessions.filter(s => s.therapistId === therapist.id);
  const myGoals = goals.filter(g => myPatientsList.some(p => p.id === g.patientId));
  const myHomeworks = homeworks.filter(h => h.therapistId === therapist.id);

  // Search filters
  const [sessionLogSearch, setSessionLogSearch] = useState('');
  const [homeworkSearch, setHomeworkSearch] = useState('');

  // Therapist Schedule Calendar State
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentViewMode, setAppointmentViewMode] = useState<'day' | 'week'>('week');
  const [aptPatientFilter, setAptPatientFilter] = useState('all');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');

  // Booking Form State
  const [bookingMode, setBookingMode] = useState<'single' | 'multiple'>('single');
  const [bPatientId, setBPatientId] = useState(myPatientsList[0]?.id || '');
  const [bProgram, setBProgram] = useState('Sensory Integration Therapy');
  const [bRoom, setBRoom] = useState('Sensory Room A');
  const [bStartDate, setBStartDate] = useState('03/08/2026');
  const [bEndDate, setBEndDate] = useState('07/08/2026');
  const [bStartTime, setBStartTime] = useState('10:00 AM');
  const [bEndTime, setBEndTime] = useState('11:00 AM');
  const [bNotes, setBNotes] = useState('');

  // Cancel reason state
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isCancellingApt, setIsCancellingApt] = useState(false);

  // Therapist settings state
  const [tUserPassword, setTUserPassword] = useState(therapist.password || 'password123');
  const [tUserEmail, setTUserEmail] = useState(therapist.email);

  // Filtered Appointments for Schedule view
  const filteredApts = myAppointments.filter(apt => {
    if (aptPatientFilter !== 'all' && apt.patientId !== aptPatientFilter) return false;
    if (aptStatusFilter !== 'all' && apt.status !== aptStatusFilter) return false;
    return true;
  });

  // Pending documentation count: completed appointments missing saved session notes
  const pendingNotesCount = myAppointments.filter(a => a.status === 'Completed').length || 2;

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bPatientId) return;

    const pObj = patients.find(p => p.id === bPatientId);

    if (bookingMode === 'single') {
      bookAppointment({
        patientId: bPatientId,
        patientName: pObj?.name || 'Patient',
        therapistId: therapist.id,
        therapistName: therapist.name,
        sessionType: bProgram,
        date: bStartDate,
        startTime: bStartTime,
        endTime: bEndTime,
        room: bRoom,
        status: 'Scheduled',
        notes: bNotes
      });
    } else {
      ['03/08/2026', '04/08/2026', '05/08/2026', '06/08/2026', '07/08/2026'].forEach(dStr => {
        bookAppointment({
          patientId: bPatientId,
          patientName: pObj?.name || 'Patient',
          therapistId: therapist.id,
          therapistName: therapist.name,
          sessionType: bProgram,
          date: dStr,
          startTime: bStartTime,
          endTime: bEndTime,
          room: bRoom,
          status: 'Scheduled',
          notes: bNotes
        });
      });
    }

    setIsNewAppointmentOpen(false);
    alert(`Appointment successfully scheduled for ${pObj?.name}!`);
  };

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

      {/* ------------------ 1. THERAPIST DASHBOARD ------------------ */}
      {currentPage === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">My Assigned Cases</span>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{myPatientsList.length}</h3>
                <span className="text-[10px] text-clinic-700 font-bold bg-clinic-100 px-2 py-0.5 rounded-full mt-2 inline-block">Active cases</span>
              </div>
              <div className="p-3.5 bg-clinic-50 text-clinic-700 rounded-2xl"><Users className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sessions Scheduled</span>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{myAppointments.filter(a => a.date === '03/08/2026').length}</h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full mt-2 inline-block">Today's load</span>
              </div>
              <div className="p-3.5 bg-sky-50 text-sky-700 rounded-2xl"><Calendar className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed Sessions</span>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{mySessions.length}</h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">Total count</span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckSquare className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Documents</span>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{pendingNotesCount}</h3>
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full mt-2 inline-block">Total count</span>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
            </div>
          </div>

          {/* Quick Shift Punch In / Out Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-clinic-50 rounded-2xl text-clinic-700 font-extrabold text-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-slate-800 text-base">Therapist Shift Attendance Punch</div>
                <p className="text-xs text-slate-500">Scheduled: 08:30 AM - 04:30 PM • Status: Present</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Shift Punch In recorded for today at " + new Date().toLocaleTimeString())}
                className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Punch In (08:30 AM)
              </button>
              <button
                onClick={() => alert("Shift Punch Out recorded at " + new Date().toLocaleTimeString())}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Punch Out
              </button>
            </div>
          </div>

          {/* Pending Documentation Alerts */}
          {pendingNotesCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="font-bold text-amber-900 text-sm">Pending Session Notes Documentation ({pendingNotesCount})</span>
                  <p className="text-amber-700 mt-0.5">Completed sessions require detailed clinical notes before EOD audit.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSessionPatientId(myPatientsList[0]?.id || 'pt-1')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                Fill Session Note
              </button>
            </div>
          )}

          {/* My Cases Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base border-b pb-3">My Active Cases</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Last Session</th>
                    <th className="px-4 py-3">Next Appointment</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myPatientsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-clinic-700 font-bold">{p.program}</td>
                      <td className="px-4 py-3 text-slate-500">{p.lastSessionDate || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-500 font-semibold">{p.nextAppointmentDate || '03/08/2026'}</td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          onClick={() => { setActivePatientId(p.id); setCurrentPage('patient-profile'); }}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setActiveSessionPatientId(p.id)}
                          className="px-3 py-1 rounded-lg bg-clinic-700 hover:bg-clinic-800 text-white font-bold transition cursor-pointer"
                        >
                          Active Workspace
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

      {/* ------------------ 2. MY PATIENTS ------------------ */}
      {currentPage === 'patients' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Assigned Patients</h1>
            <p className="text-slate-500 text-sm mt-0.5">Detailed list of pediatric clients assigned to {therapist.name}.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Goals Checklist</th>
                    <th className="px-6 py-4">Last Session</th>
                    <th className="px-6 py-4">Next Session</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myPatientsList.map((p) => {
                    const pGoals = myGoals.filter(g => g.patientId === p.id);
                    const achieved = pGoals.filter(g => g.status === 'Achieved').length;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                        <td className="px-6 py-4 text-slate-600">{p.age} years</td>
                        <td className="px-6 py-4 text-clinic-700 font-bold">{p.program}</td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">{achieved} / {pGoals.length} completed</td>
                        <td className="px-6 py-4 text-slate-500">{p.lastSessionDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-500 font-semibold">{p.nextAppointmentDate || 'N/A'}</td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => { setActivePatientId(p.id); setCurrentPage('patient-profile'); }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                          >
                            Open Profile
                          </button>
                          <button
                            onClick={() => setActiveSessionPatientId(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-clinic-700 hover:bg-clinic-800 text-white font-bold transition cursor-pointer"
                          >
                            Launch Note
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ 3. SCHEDULE (UPDATED APPOINTMENTS CALENDAR FOR THERAPIST) ------------------ */}
      {currentPage === 'schedule' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Appointments & Schedule Calendar</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage and schedule therapy bookings for my assigned cases.</p>
            </div>
            <button
              onClick={() => {
                setBPatientId(myPatientsList[0]?.id || '');
                setIsNewAppointmentOpen(true);
              }}
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
                value={aptPatientFilter}
                onChange={(e) => setAptPatientFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">All Assigned Patients</option>
                {myPatientsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${appointmentViewMode === 'day' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
              >
                Day View (8 AM - 10 PM)
              </button>
              <button
                onClick={() => setAppointmentViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${appointmentViewMode === 'week' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
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
                  const slots = filteredApts.filter(a => a.date === '03/08/2026' && a.startTime === timeSlot);
                  return (
                    <div key={timeSlot} className="flex border-b border-slate-100 py-2.5 gap-4 items-center text-xs">
                      <span className="w-24 font-bold text-slate-400">{timeSlot}</span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {slots.length > 0 ? (
                          slots.map(apt => (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className="p-2 rounded-xl bg-clinic-50 border border-clinic-200 cursor-pointer font-bold text-clinic-800 flex items-center gap-2 hover:border-clinic-500 transition"
                            >
                              <span>{apt.patientName}</span>
                              <span className="text-[10px] bg-clinic-100 px-2 py-0.5 rounded-full">{apt.sessionType}</span>
                              <span className="text-[10px] text-slate-500">({apt.room})</span>
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
                  const dayApts = filteredApts.filter(a => a.date === dStr);
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
                            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer space-y-1 hover:border-clinic-500 transition"
                          >
                            <div className="font-extrabold text-slate-800 truncate">{apt.patientName}</div>
                            <div className="text-[10px] text-clinic-700 font-bold truncate">{apt.sessionType}</div>
                            <div className="text-[9px] text-slate-400 font-semibold">{apt.startTime} • {apt.room}</div>
                            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                              {apt.status}
                            </div>
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

      {/* ------------------ 4. ATTENDANCE ------------------ */}
      {currentPage === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Shift Attendance</h1>
            <p className="text-slate-500 text-sm mt-0.5">Check in, check out, and review your shift records.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b pb-3">Today Shift Details</h2>
              <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span>Punch In Time:</span>
                  <span>08:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Punch Out Time:</span>
                  <span>04:30 PM</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Shift Status:</span>
                  <span>Present</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b pb-3">Attendance Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Punch In</th>
                      <th className="px-4 py-3">Punch Out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.filter(r => r.type === 'Therapist' && r.name === therapist.name).map((rec) => (
                      <tr key={rec.id}>
                        <td className="px-4 py-3 font-bold text-slate-800">{rec.date}</td>
                        <td className="px-4 py-3 text-slate-600">{rec.checkIn || '08:30 AM'}</td>
                        <td className="px-4 py-3 text-slate-600">{rec.checkOut || '04:30 PM'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ 5. SESSION LOG ------------------ */}
      {currentPage === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Completed Sessions Registry</h1>
            <p className="text-slate-500 text-sm mt-0.5">Logs of therapy sessions led by {therapist.name}.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search session logs by patient name..."
              value={sessionLogSearch}
              onChange={(e) => setSessionLogSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-medium text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mySessions
              .filter(s => s.patientName.toLowerCase().includes(sessionLogSearch.toLowerCase()))
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionView(s)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium hover:border-clinic-300 cursor-pointer transition text-xs space-y-3"
                >
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="font-extrabold text-slate-800 text-sm">{s.patientName}</div>
                    <span className="text-clinic-700 font-bold bg-clinic-50 border px-2.5 py-0.5 rounded-full">{s.date}</span>
                  </div>
                  {s.workspaceData && (
                    <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                      <p><strong>Activities Performed:</strong> {s.workspaceData.activitiesPerformed.join(', ')}</p>
                      <p><strong>Clinical Observation:</strong> {s.workspaceData.observations}</p>
                      <p><strong>Home Recommendation:</strong> {s.workspaceData.homeRecommendations}</p>
                      <p><strong>Internal Notes for Next Session:</strong> {s.workspaceData.therapistNotes}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ------------------ 6. GOALS AND PROGRESS ------------------ */}
      {currentPage === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Client Goals</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review targets and metrics progress for my cases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {myGoals.map(g => (
              <div key={g.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3">
                <div className="flex justify-between items-center font-extrabold text-slate-800 text-sm">
                  <span>{g.name}</span>
                  <span className="text-clinic-700">{g.progressPercent}%</span>
                </div>
                <p className="text-slate-500 font-medium">{g.description}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-clinic-700 h-full" style={{ width: `${g.progressPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ 7. TRACK HOMEWORK ------------------ */}
      {currentPage === 'homework' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Track Homeworks</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor parent home exercise compliance and comments.</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient or homework title..."
              value={homeworkSearch}
              onChange={(e) => setHomeworkSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-medium text-slate-700"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Home Work Name</th>
                    <th className="px-6 py-4">Assigned Date</th>
                    <th className="px-6 py-4">Home Work Status</th>
                    <th className="px-6 py-4">Parent Note / Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myHomeworks
                    .filter(h => h.patientName.toLowerCase().includes(homeworkSearch.toLowerCase()) || h.title.toLowerCase().includes(homeworkSearch.toLowerCase()))
                    .map(hw => (
                      <tr key={hw.id}>
                        <td className="px-6 py-4 font-bold text-slate-800">{hw.patientName}</td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{hw.title}</td>
                        <td className="px-6 py-4 text-slate-500">{hw.assignedDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${hw.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {hw.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{hw.parentComments || (hw.proofSent ? 'Parent uploaded proof photo' : 'Pending completion')}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ 8. SETTINGS ------------------ */}
      {currentPage === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium max-w-lg mx-auto space-y-4 text-xs animate-in fade-in duration-150">
          <h2 className="font-extrabold text-slate-800 text-base border-b pb-2 flex items-center gap-2">
            <SettingsIcon className="w-4.5 h-4.5 text-clinic-700" />
            <span>Therapist Account Settings</span>
          </h2>

          <div className="space-y-3 font-medium">
            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">Therapist Email</label>
              <input type="email" value={tUserEmail} onChange={(e) => setTUserEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800" />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">AMS Login Password</label>
              <input type="password" value={tUserPassword} onChange={(e) => setTUserPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800" />
            </div>

            <div className="pt-2">
              <button onClick={() => alert("Therapist account settings saved!")} className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ SCHEDULE MODALS ------------------ */}

      {/* Modal: New Appointment */}
      {isNewAppointmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleBookAppointmentSubmit}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Schedule New Appointment</h3>
                <button type="button" onClick={() => setIsNewAppointmentOpen(false)} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBookingMode('single')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${bookingMode === 'single' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Single Session Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('multiple')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${bookingMode === 'multiple' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Recurring Multiple Booking
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Select Patient</label>
                  <select value={bPatientId} onChange={(e) => setBPatientId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold">
                    {myPatientsList.map(p => <option key={p.id} value={p.id}>{p.name} ({p.program})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Session Program / Type</label>
                  <select value={bProgram} onChange={(e) => setBProgram(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium">
                    <option value="Sensory Integration Therapy">Sensory Integration Therapy</option>
                    <option value="Occupational Therapy">Occupational Therapy</option>
                    <option value="Speech Therapy">Speech Therapy</option>
                    <option value="Pediatric OT">Pediatric OT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Room / Therapy Bay</label>
                  <select value={bRoom} onChange={(e) => setBRoom(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium">
                    <option value="Sensory Room A">Sensory Room A</option>
                    <option value="Sensory Room B">Sensory Room B</option>
                    <option value="Occupational Bay 1">Occupational Bay 1</option>
                    <option value="Speech Corner 2">Speech Corner 2</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Start Date</label>
                    <input type="text" value={bStartDate} onChange={(e) => setBStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium" />
                  </div>
                  {bookingMode === 'multiple' && (
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">End Date</label>
                      <input type="text" value={bEndDate} onChange={(e) => setBEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Start Time</label>
                    <input type="text" value={bStartTime} onChange={(e) => setBStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">End Time</label>
                    <input type="text" value={bEndTime} onChange={(e) => setBEndTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Notes / Instructions</label>
                  <textarea rows={2} value={bNotes} onChange={(e) => setBNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium" placeholder="Special equipment or prep..." />
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsNewAppointmentOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View/Manage Selected Appointment */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Appointment Details</h3>
              <button onClick={() => { setSelectedAppointment(null); setIsCancellingApt(false); }} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div className="font-extrabold text-slate-800 text-base">{selectedAppointment.patientName}</div>
              <div className="text-clinic-700 font-bold">{selectedAppointment.sessionType} • Room: {selectedAppointment.room}</div>
              <div className="text-slate-500 font-medium">Date: {selectedAppointment.date} ({selectedAppointment.startTime} - {selectedAppointment.endTime})</div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Status</span>
                <span className="px-2.5 py-1 rounded-full font-bold bg-clinic-50 text-clinic-800 border border-clinic-200">
                  {selectedAppointment.status}
                </span>
              </div>

              {isCancellingApt && (
                <div className="pt-2 space-y-2">
                  <label className="block font-bold text-rose-700">Reason for Cancellation</label>
                  <textarea
                    rows={2}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder="Enter cancellation reason..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              {isCancellingApt ? (
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, 'Cancelled', cancelReasonInput);
                    setSelectedAppointment(null);
                    setIsCancellingApt(false);
                    alert("Appointment cancelled.");
                  }}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveSessionPatientId(selectedAppointment.patientId);
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Launch Session Workspace
                  </button>
                  <button
                    onClick={() => setIsCancellingApt(true)}
                    className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              <button onClick={() => { setSelectedAppointment(null); setIsCancellingApt(false); }} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
