import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { PatientProgressTrendChart } from './DashboardCharts';
import {
  Calendar, Clock, Award, BookOpen, Smile, CheckCircle2, Sparkles
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const { patients, goals, appointments, sessions, activePatientId, setActivePatientId } = useClinic();

  // Fictional parent user state: Senthil Kumar
  const parentName = 'Senthil Kumar';

  // Find all children belonging to Senthil Kumar (Kavin Raj and Yazhini Senthil)
  const myChildren = patients.filter(p => p.parentName === parentName);

  // Current selected child in parent portal
  const activeChild = myChildren.find(p => p.id === activePatientId) || myChildren[0];

  // Goals specific to current child
  const childGoals = goals.filter(g => g.patientId === activeChild.id);

  // Appointments for this child
  const childAppointments = appointments.filter(a => a.patientId === activeChild.id);

  // Sessions history for child
  const childSessions = sessions.filter(s => s.patientId === activeChild.id);

  // Home activities state - interactive checklist for demonstration
  const [completedActivities, setCompletedActivities] = useState<{ [act: string]: boolean }>({});

  const handleToggleActivity = (activity: string) => {
    setCompletedActivities(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  };

  // Switch child trigger
  const handleChildSelect = (childId: string) => {
    setActivePatientId(childId);
  };

  // Parent Navigation Tab
  const [parentTab, setParentTab] = useState<'home' | 'progress' | 'appointments' | 'activities'>('home');

  // Next upcoming scheduled appointment
  const nextApt = childAppointments.find(a => a.status === 'Scheduled');

  // Last completed session
  const lastSession = childSessions[0];

  // Activities list derived from latest session recommendations
  const recommendedActivities = lastSession?.workspaceData?.homeRecommendations
    ? lastSession.workspaceData.homeRecommendations.split('.').filter(s => s.trim().length > 0)
    : ["Use the weighted lap pad for 15 minutes before writing tasks.", "10 minutes of linear swinging in the neighborhood park.", "Thread 15 plastic beads to practice pinch grip."];

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 md:px-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-clinic-50 to-sky-50 rounded-3xl border border-clinic-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Smile className="w-6 h-6 text-clinic-700" />
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Vanakkam, {parentName}!</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed font-medium">
            Welcome to your child's therapy progress board. Here you can track developmental milestones and home exercises.
          </p>
        </div>

        {/* Child switcher for parents with multiple enrolled kids */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Child Profile:</span>
          <select
            value={activeChild.id}
            onChange={(e) => handleChildSelect(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clinic-500 font-extrabold text-slate-700 shadow-sm"
          >
            {myChildren.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parent Navbar Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
        {(['home', 'progress', 'appointments', 'activities'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setParentTab(tab)}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-bold capitalize transition ${parentTab === tab
                ? 'bg-white text-clinic-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ------------------ HOME / DASHBOARD VIEW ------------------ */}
      {parentTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: child details, next session, updates */}
          <div className="lg:col-span-8 space-y-6">

            {/* Child Card Widget */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium flex flex-col sm:flex-row gap-5 items-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xl shadow-inner border border-sky-200">
                {activeChild.name.charAt(0)}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-extrabold text-slate-800 text-lg flex items-center justify-center sm:justify-start gap-2">
                  <span>{activeChild.name}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 border">{activeChild.age} years old</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Therapy Program: <strong className="text-clinic-700">{activeChild.program}</strong><br />
                  Therapist in Charge: <strong>{activeChild.assignedTherapistName}</strong>
                </p>
              </div>
            </div>

            {/* Next Appointment prominently */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-clinic-700" />
                <span>Next Scheduled Session</span>
              </h3>
              {nextApt ? (
                <div className="p-4 bg-clinic-50/50 rounded-2xl border border-clinic-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-clinic-700 font-extrabold text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{nextApt.date} • {nextApt.startTime} ({nextApt.sessionType})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">
                      Location: {nextApt.room} • Guided by {nextApt.therapistName}.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white border border-clinic-200 text-clinic-700 rounded-full self-start sm:self-center">
                    Confirmed
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No upcoming sessions scheduled this week.</p>
              )}
            </div>

            {/* Recent Completed Session Parent-Friendly summary */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-clinic-700" />
                <span>Latest Session Notes from Therapist</span>
              </h3>
              {lastSession ? (
                <div className="space-y-3.5 text-xs text-slate-600 font-medium leading-relaxed">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between font-bold text-slate-700">
                    <span>Session completed on {lastSession.date}</span>
                    <span className="text-clinic-700">Focus: {lastSession.sessionType}</span>
                  </div>
                  {lastSession.workspaceData && (
                    <div className="space-y-2">
                      <p>🚀 <strong>What they practiced:</strong> {lastSession.workspaceData.activitiesPerformed.join(', ')}.</p>
                      <p>✨ <strong>Therapist feedback:</strong> {lastSession.workspaceData.observations}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No session logs found.</p>
              )}
            </div>
          </div>

          {/* Right Column: Progress bar goals and activities */}
          <div className="lg:col-span-4 space-y-6">
            {/* Developmental Milestone Progress */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-clinic-700" />
                <span>Development Milestones</span>
              </h3>
              <div className="space-y-4">
                {childGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{goal.name}</span>
                      <span className="text-clinic-700">{goal.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-clinic-700 h-full" style={{ width: `${goal.progressPercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Home activities daily tasks */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-clinic-700" />
                <span>Home Action Checklist</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Dr. Priya Raman recommends completing these daily to accelerate results:
              </p>
              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                {recommendedActivities.map((act, i) => {
                  const isChecked = !!completedActivities[act];
                  return (
                    <div
                      key={i}
                      onClick={() => handleToggleActivity(act)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${isChecked ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>{act.trim()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ CHILD PROGRESS CHART ------------------ */}
      {parentTab === 'progress' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Development Progress (Chart)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Visualize improvement across fine motor, sensory, and self-care metrics.</p>
          </div>

          <PatientProgressTrendChart singlePatient={true} />

          {/* List of achievements */}
          <div className="border-t border-slate-100 pt-4 space-y-3.5">
            <h3 className="font-bold text-sm text-slate-800">Recent Achievements 🏆</h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-medium">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2">
                <span className="text-base">🎉</span>
                <div>
                  <strong>Coordination Milestones:</strong> Alternate feet climbing safety ladder goal increased from 15% to 50% under physical supervision.
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2">
                <span className="text-base">🎉</span>
                <div>
                  <strong>Sitting focus:</strong> Reached 8 minutes sitting tolerance during homework sessions using a weighted vest checklist.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ APPOINTMENTS VIEW ------------------ */}
      {parentTab === 'appointments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Therapy Bookings Calendar</h2>
            <p className="text-xs text-slate-400 mt-0.5">View details of scheduled and completed appointments.</p>
          </div>

          <div className="space-y-3">
            {childAppointments.map((apt) => (
              <div key={apt.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-800 text-sm">{apt.date} • {apt.startTime}</div>
                  <div className="text-slate-500 font-semibold mt-1">Specialty: {apt.sessionType} • Therapist: {apt.therapistName}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Location: {apt.room}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-center ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-clinic-50 text-clinic-700 border-clinic-200'
                  }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ ACTIVITIES DETAILED CHECKLIST ------------------ */}
      {parentTab === 'activities' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Home Exercises Board</h2>
            <p className="text-xs text-slate-400 mt-0.5">Check off recommendations provided by {activeChild.assignedTherapistName}.</p>
          </div>

          <div className="space-y-3.5">
            {recommendedActivities.map((act, i) => {
              const isChecked = !!completedActivities[act];
              return (
                <div
                  key={i}
                  onClick={() => handleToggleActivity(act)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${isChecked ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                    }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{act.trim()}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1">Recommended for daily homework routines.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
