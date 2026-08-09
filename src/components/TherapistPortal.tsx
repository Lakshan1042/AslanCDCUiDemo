import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { CalendarView } from './CalendarView';
import { SessionWorkspaceView } from './SessionWorkspaceView';
import {
  Activity, Users, Calendar, CheckSquare, AlertCircle
} from 'lucide-react';

export const TherapistPortal: React.FC = () => {
  const {
    patients, therapists, appointments, goals, sessions, currentPage,
    setCurrentPage, activeTherapistId, attendanceRecords, markAttendance, addAttendanceRecord
  } = useClinic();

  // Active session state
  const [activeSessionPatientId, setActiveSessionPatientId] = useState<string | null>(null);

  // Match current therapist
  const therapist = therapists.find(t => t.id === activeTherapistId) || therapists[0];

  // Filtered data for active therapist
  const myPatientsList = patients.filter(p => p.assignedTherapistId === therapist.id);
  const myAppointments = appointments.filter(a => a.therapistId === therapist.id);
  const mySessions = sessions.filter(s => s.therapistId === therapist.id);

  // Active goals of my patients
  const myGoals = goals.filter(g => myPatientsList.some(p => p.id === g.patientId));

  // Count pending documentation (scheduled appointments today or in draft session state)
  const pendingNotesCount = 2; // static dashboard metric representation

  if (activeSessionPatientId) {
    return (
      <SessionWorkspaceView
        patientId={activeSessionPatientId}
        onBack={() => setActiveSessionPatientId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------ THERAPIST DASHBOARD ------------------ */}
      {currentPage === 'dashboard' && (
        <div className="space-y-6">
          {/* Therapist stats widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">My Assigned Cases</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{myPatientsList.length}</h3>
                <span className="text-[10px] text-clinic-700 font-bold bg-clinic-100 px-2 py-0.5 rounded-full mt-2 inline-block">Active cases</span>
              </div>
              <div className="p-3.5 bg-clinic-50 text-clinic-700 rounded-2xl"><Users className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Sessions Scheduled</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{myAppointments.filter(a => a.date === '03/08/2026').length}</h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full mt-2 inline-block">Today's load</span>
              </div>
              <div className="p-3.5 bg-sky-50 text-sky-700 rounded-2xl"><Calendar className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Completed Sessions</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{mySessions.length}</h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">Total logged</span>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckSquare className="w-6 h-6" /></div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Pending Documentation</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{pendingNotesCount}</h3>
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full mt-2 inline-block">Notes required</span>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Therapist Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {myPatientsList.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSessionPatientId(p.id)}
                  className="p-3 bg-clinic-50/50 hover:bg-clinic-50 border border-clinic-100 text-clinic-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <Activity className="w-4 h-4 text-clinic-700" />
                  <span>Start Note: {p.name}</span>
                </button>
              ))}
              <button
                onClick={() => setCurrentPage('patients')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>My Cases Panel</span>
              </button>
            </div>
          </div>

          {/* Bottom Grid Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-extrabold text-slate-800 text-base">My Schedule (Today)</h3>
                <button
                  onClick={() => setCurrentPage('schedule')}
                  className="text-xs text-clinic-700 font-bold hover:underline"
                >
                  View Calendar
                </button>
              </div>
              <div className="space-y-3">
                {myAppointments.filter(a => a.date === '03/08/2026').length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No appointments booked for today.</p>
                ) : (
                  myAppointments.filter(a => a.date === '03/08/2026').map(apt => (
                    <div key={apt.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{apt.patientName}</div>
                        <div className="text-slate-400 font-semibold mt-0.5">{apt.sessionType} • Room: {apt.room}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-700">{apt.startTime}</div>
                        <button
                          onClick={() => setActiveSessionPatientId(apt.patientId)}
                          className="mt-1 text-[10px] text-clinic-700 font-bold hover:underline"
                        >
                          Start Note
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side Columns: Attendance Check-In & Pending Docs */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Shift Attendance Check-In Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-base">Shift Attendance</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === '03/08/2026')
                      ? attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === '03/08/2026')?.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === '03/08/2026') 
                      ? attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === '03/08/2026')?.status 
                      : 'Not Checked In'}
                  </span>
                </div>
                
                {(() => {
                  const todayDate = '03/08/2026';
                  const record = attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === todayDate);
                  
                  if (!record) {
                    return (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 leading-normal">
                          You have not marked your clinical shift attendance for today (<strong>{todayDate}</strong>).
                        </p>
                        <button
                          onClick={() => {
                            addAttendanceRecord({
                              type: 'Therapist',
                              name: therapist.name,
                              date: todayDate,
                              status: 'Present',
                              checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                              notes: 'Self check-in via therapist portal.'
                            });
                          }}
                          className="w-full bg-clinic-700 hover:bg-clinic-800 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                          Check In Present
                        </button>
                      </div>
                    );
                  } else if (!record.checkOut) {
                    return (
                      <div className="space-y-3">
                        <div className="text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Check In:</span>
                            <span className="font-bold text-slate-700">{record.checkIn || '--:--'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Shift Date:</span>
                            <span className="font-bold text-slate-700">{record.date}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            markAttendance(
                              record.id,
                              undefined,
                              new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                              'Present',
                              'Self check-out via therapist portal.'
                            );
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
                        >
                          Check Out Shift
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-xs space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-emerald-800">
                        <div className="font-bold text-center border-b border-emerald-200 pb-1.5 mb-2">Shift Completed</div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-emerald-700">Checked In:</span>
                          <span className="font-bold">{record.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-emerald-700">Checked Out:</span>
                          <span className="font-bold">{record.checkOut}</span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Pending Documentation Details & Alerts */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Pending Documentation</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center gap-3 justify-between">
                    <div>
                      <div className="font-bold text-rose-800 text-xs">Kavin Raj</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Session: 28/07/2026 (Draft note saved)</div>
                    </div>
                    <button
                      onClick={() => setActiveSessionPatientId('pt-1')}
                      className="text-xs text-rose-700 font-bold hover:underline bg-white border border-rose-200 px-2.5 py-1 rounded-xl"
                    >
                      Resume
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-3 justify-between">
                    <div>
                      <div className="font-bold text-amber-800 text-xs">Nila Prakash</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Upcoming session today 10:15 AM</div>
                    </div>
                    <button
                      onClick={() => setActiveSessionPatientId('pt-2')}
                      className="text-xs text-amber-700 font-bold hover:underline bg-white border border-amber-200 px-2.5 py-1 rounded-xl"
                    >
                      Launch Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MY PATIENTS PANEL ------------------ */}
      {currentPage === 'patients' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Active Cases</h1>
            <p className="text-slate-500 text-sm mt-0.5">List of clinical cases assigned to {therapist.name}.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wide">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Age</th>
                    <th className="px-6 py-4">OT Program</th>
                    <th className="px-6 py-4">Goals Checklist</th>
                    <th className="px-6 py-4">Last Session</th>
                    <th className="px-6 py-4">Next Appointment</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {myPatientsList.map((p) => {
                    const patientGoalsCount = myGoals.filter(g => g.patientId === p.id).length;
                    const achievedGoalsCount = myGoals.filter(g => g.patientId === p.id && g.status === 'Achieved').length;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                        <td className="px-6 py-4 text-slate-600">{p.age} years</td>
                        <td className="px-6 py-4 text-clinic-700 font-bold text-xs">{p.program}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {achievedGoalsCount} / {patientGoalsCount} goals met
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{p.lastSessionDate || 'No logged sessions'}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-semibold">{p.nextAppointmentDate || 'Not scheduled'}</td>
                        <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveSessionPatientId(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-clinic-50 hover:bg-clinic-100 border border-clinic-200 text-clinic-800 font-bold text-xs transition"
                          >
                            Write Note
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

      {/* ------------------ CALENDAR SCHEDULE ------------------ */}
      {currentPage === 'schedule' && <CalendarView />}

      {/* ------------------ SESSIONS LIST ------------------ */}
      {currentPage === 'sessions' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Completed Sessions Registry</h1>
            <p className="text-slate-500 text-sm mt-0.5">Logs of therapy sessions led by {therapist.name}.</p>
          </div>

          <div className="space-y-3">
            {mySessions.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium text-xs space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                  <div className="font-bold text-slate-800 text-sm">
                    Patient: {s.patientName} • Date: {s.date}
                  </div>
                  <span className="text-clinic-700 font-bold bg-clinic-100 px-2.5 py-0.5 rounded-full">{s.sessionType}</span>
                </div>
                {s.workspaceData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 leading-relaxed font-medium">
                    <div>
                      <p><strong>Activities:</strong> {s.workspaceData.activitiesPerformed.join(', ')}</p>
                      <p className="mt-1"><strong>Observations:</strong> {s.workspaceData.observations}</p>
                    </div>
                    <div>
                      <p><strong>Home Plan:</strong> {s.workspaceData.homeRecommendations}</p>
                      <p className="mt-1"><strong>Notes for next time:</strong> {s.workspaceData.therapistNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ CLINICAL ASSESSMENTS ------------------ */}
      {currentPage === 'assessments' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Case Assessments</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track evaluations completed for assigned cases.</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6">
            <p className="text-xs text-slate-400 italic">Evaluations are recorded inside patient profile files. Please navigate to the patient panel and open their details.</p>
          </div>
        </div>
      )}

      {/* ------------------ GOALS CHECKPOINTS ------------------ */}
      {currentPage === 'goals' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Client Goals</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review targets and metrics progress for my cases.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGoals.map(g => (
              <div key={g.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>{g.name}</span>
                  <span className="text-clinic-700">{g.progressPercent}%</span>
                </div>
                <p className="text-slate-500">{g.description}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-clinic-700 h-full" style={{ width: `${g.progressPercent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ THERAPIST MARK ATTENDANCE PAGE ------------------ */}
      {currentPage === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Shift Attendance</h1>
            <p className="text-slate-500 text-sm mt-0.5">Check in, check out, and review your shift records.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Shift Check-In Form (Left panel) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">Mark Shift Today</h2>
              
              {(() => {
                const todayDate = '03/08/2026';
                const record = attendanceRecords.find(r => r.type === 'Therapist' && r.name === therapist.name && r.date === todayDate);
                
                if (!record) {
                  return (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 leading-normal font-medium">
                        Click below to mark your shift attendance as <strong>Present</strong> for today (<strong>{todayDate}</strong>).
                      </p>
                      <button
                        onClick={() => {
                          addAttendanceRecord({
                            type: 'Therapist',
                            name: therapist.name,
                            date: todayDate,
                            status: 'Present',
                            checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            notes: 'Checked in from the therapist page.'
                          });
                        }}
                        className="w-full bg-clinic-700 hover:bg-clinic-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        Check In Shift (Present)
                      </button>
                    </div>
                  );
                } else if (!record.checkOut) {
                  return (
                    <div className="space-y-3">
                      <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-semibold text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date:</span>
                          <span>{record.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Check In Time:</span>
                          <span>{record.checkIn || '--:--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="text-emerald-600">{record.status}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          markAttendance(
                            record.id,
                            undefined,
                            new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                            'Present',
                            'Checked out from the therapist page.'
                          );
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                      >
                        Check Out Shift
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-xs space-y-2.5 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-emerald-800 font-semibold">
                      <div className="font-bold text-center border-b border-emerald-200 pb-1.5 mb-2 text-sm">Shift Completed</div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Shift Date:</span>
                        <span>{record.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Check In:</span>
                        <span>{record.checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Check Out:</span>
                        <span>{record.checkOut}</span>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Attendance Logs List (Right panel) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h2 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">My Attendance Log</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wide">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check In</th>
                      <th className="px-4 py-3">Check Out</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {attendanceRecords.filter(r => r.type === 'Therapist' && r.name === therapist.name).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">No attendance records logged yet.</td>
                      </tr>
                    ) : (
                      attendanceRecords.filter(r => r.type === 'Therapist' && r.name === therapist.name).map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-bold text-slate-800">{rec.date}</td>
                          <td className="px-4 py-3 text-slate-600">{rec.checkIn || '--:--'}</td>
                          <td className="px-4 py-3 text-slate-600">{rec.checkOut || '--:--'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold border ${
                              rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              rec.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 italic font-semibold max-w-[150px] truncate" title={rec.notes}>{rec.notes || 'No remarks'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
