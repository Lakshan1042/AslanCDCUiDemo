'use client';

import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { PatientProgressTrendChart } from './DashboardCharts';
import type { Session } from '../types';
import {
  Calendar, Award, BookOpen, Smile, CheckCircle2, Sparkles,
  ShieldAlert, Star, Send, Settings as SettingsIcon, FileCheck
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const {
    patients, goals, appointments, sessions, therapists, homeworks, feedbacks, complaints,
    activePatientId, setActivePatientId, addFeedback, addComplaint, toggleHomeworkStatus,
    currentUser, changePassword
  } = useClinic();

  // Password change state
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmPwdInput, setConfirmPwdInput] = useState('');
  const [pwdChangeError, setPwdChangeError] = useState<string | null>(null);
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);

  // Parent name derived from authenticated user or fallback
  const parentName = currentUser?.username || 'Senthil Kumar';

  // Consent form state (Simulates first-time agreement)
  const [hasAgreedConsent, setHasAgreedConsent] = useState<boolean>(() => {
    return localStorage.getItem('ot_parent_consent') === 'true';
  });
  const [consentSignatureName, setConsentSignatureName] = useState('');
  const [consentSignatureDate, setConsentSignatureDate] = useState('03/08/2026');

  // Find all children belonging to Senthil Kumar (Kavin Raj & Yazhini Senthil)
  const myChildren = patients.filter(p => p.parentName === parentName);
  const activeChild = myChildren.find(p => p.id === activePatientId) || myChildren[0] || patients[0];

  // Navigation tabs (Horizontal menu bar)
  const [parentTab, setParentTab] = useState<'home' | 'progress' | 'appointments' | 'activities' | 'feedback' | 'settings'>('home');

  // Feedback section sub-tabs (Feedback / Complaints)
  const [feedbackSubTab, setFeedbackSubTab] = useState<'feedback' | 'complaint'>('feedback');

  // Interactive activity popup state
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<any | null>(null);
  const [isMarkCompletedChecked, setIsMarkCompletedChecked] = useState(false);
  const [isProofSentChecked, setIsProofSentChecked] = useState(false);
  const [parentModalComment, setParentModalComment] = useState('');

  // Selected completed session for template note view
  const [selectedSessionView, setSelectedSessionView] = useState<Session | null>(null);

  // Feedback form state
  const [fbType, setFbType] = useState<'Clinic Feedback' | 'Therapist Feedback'>('Therapist Feedback');
  const [fbTherapistId, setFbTherapistId] = useState('th-1');
  const [fbRating, setFbRating] = useState(5);
  const [fbComments, setFbComments] = useState('');
  const [fbSuggestions, setFbSuggestions] = useState('');

  // Complaint form state
  const [cmpCategory, setCmpCategory] = useState<'Therapy Session' | 'Facility & Equipment' | 'Scheduling & Timing' | 'Billing & Fee' | 'Staff Behavior' | 'Other'>('Scheduling & Timing');
  const [cmpSubject, setCmpSubject] = useState('');
  const [cmpDescription, setCmpDescription] = useState('');

  // Settings form state
  const [userPassword, setUserPassword] = useState('password123');
  const [userEmail, setUserEmail] = useState('senthil.k@gmail.com');

  // Derived data
  const childGoals = goals.filter(g => g.patientId === activeChild.id);
  const childAppointments = appointments.filter(a => a.patientId === activeChild.id);
  const childSessions = sessions.filter(s => s.patientId === activeChild.id);
  const childHomeworks = homeworks.filter(h => h.patientId === activeChild.id);

  const nextApt = childAppointments.find(a => a.status === 'Scheduled');
  const lastSession = childSessions[0];

  const handleConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentSignatureName.trim()) return;
    setHasAgreedConsent(true);
    localStorage.setItem('ot_parent_consent', 'true');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbComments.trim()) return;

    const tObj = therapists.find(t => t.id === fbTherapistId);
    addFeedback({
      patientId: activeChild.id,
      patientName: activeChild.name,
      parentName,
      feedbackType: fbType,
      therapistId: fbType === 'Therapist Feedback' ? fbTherapistId : undefined,
      therapistName: fbType === 'Therapist Feedback' ? tObj?.name : undefined,
      rating: fbRating,
      comments: fbComments,
      suggestions: fbSuggestions
    });

    setFbComments('');
    setFbSuggestions('');
    alert('Thank you! Your feedback has been submitted to clinic administration.');
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpSubject.trim() || !cmpDescription.trim()) return;

    addComplaint({
      patientId: activeChild.id,
      patientName: activeChild.name,
      parentName,
      subject: cmpSubject,
      category: cmpCategory,
      description: cmpDescription
    });

    setCmpSubject('');
    setCmpDescription('');
    alert('Your complaint has been registered. Clinic management will review and address it promptly.');
  };

  const handleActivitySaveModal = () => {
    if (selectedActivityForModal) {
      toggleHomeworkStatus(selectedActivityForModal.id, isProofSentChecked, parentModalComment);
      setSelectedActivityForModal(null);
    }
  };

  // First-login mandatory password change gate
  if (currentUser?.mustChangePassword) {
    const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPwdChangeError(null);

      if (newPwdInput.length < 8) {
        setPwdChangeError('New password must be at least 8 characters long');
        return;
      }

      if (newPwdInput !== confirmPwdInput) {
        setPwdChangeError('New password and confirmation do not match');
        return;
      }

      const hasUpper = /[A-Z]/.test(newPwdInput);
      const hasLower = /[a-z]/.test(newPwdInput);
      const hasNumber = /[0-9]/.test(newPwdInput);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPwdInput);

      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        setPwdChangeError('Password must contain uppercase, lowercase, number, and special character');
        return;
      }

      setIsSubmittingPwd(true);
      const res = await changePassword(currentPwdInput, newPwdInput);
      setIsSubmittingPwd(false);

      if (!res.success) {
        setPwdChangeError(res.error || 'Failed to update password');
      }
    };

    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-clinic-100 shadow-premium space-y-5 text-xs text-slate-700 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-1.5 border-b pb-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h2 className="text-lg font-black text-slate-900">Set Permanent Password</h2>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            For security, newly created parent accounts must update their temporary password before continuing.
          </p>
        </div>

        {pwdChangeError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {pwdChangeError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Current Temporary Password</label>
            <input
              required
              type="password"
              value={currentPwdInput}
              onChange={(e) => setCurrentPwdInput(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
              placeholder="Enter initial password"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">New Permanent Password</label>
            <input
              required
              type="password"
              value={newPwdInput}
              onChange={(e) => setNewPwdInput(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 num, 1 symbol"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Confirm New Password</label>
            <input
              required
              type="password"
              value={confirmPwdInput}
              onChange={(e) => setConfirmPwdInput(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingPwd}
            className="w-full bg-clinic-700 hover:bg-clinic-800 text-white font-extrabold py-3 rounded-xl transition text-xs shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmittingPwd ? 'Updating Password...' : 'Save Password & Access Portal'}
          </button>
        </form>
      </div>
    );
  }

  // If patient profile is locked by admin
  if (activeChild.isLocked) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-3xl border border-rose-100 shadow-premium text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">Account Access Locked</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Parent portal access for <strong>{activeChild.name}</strong> has been locked by clinic administration. Please contact the clinic office for assistance.
        </p>
      </div>
    );
  }

  // First-time Consent Form Modal
  if (!hasAgreedConsent) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white p-8 rounded-3xl border border-clinic-100 shadow-premium space-y-6 text-xs text-slate-700 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2 border-b pb-4">
          <FileCheck className="w-12 h-12 text-clinic-700 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Parent Consent & Agreement Terms</h2>
          <p className="text-[11px] text-slate-400 font-medium">Please review and agree to terms to access your child's therapy board.</p>
        </div>

        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto leading-relaxed font-medium">
          <p><strong>1. Therapy Progress & Data Privacy:</strong> All developmental assessments, video logs, and home exercise records are confidential between Aslan Child Development Center and the parent/guardian.</p>
          <p><strong>2. Home Exercise Compliance:</strong> Home recommendations provided by occupational therapists should be practiced as instructed to accelerate developmental goals.</p>
          <p><strong>3. Cancellation Policy:</strong> Appointments must be cancelled at least 24 hours prior to schedule.</p>
        </div>

        <form onSubmit={handleConsentSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Parent Signature Name (Full Name)</label>
            <input
              required
              type="text"
              placeholder="e.g. Senthil Kumar"
              value={consentSignatureName}
              onChange={(e) => setConsentSignatureName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Signature Date</label>
            <input
              required
              type="text"
              value={consentSignatureDate}
              onChange={(e) => setConsentSignatureDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-clinic-700 hover:bg-clinic-800 text-white font-extrabold py-3 rounded-xl transition text-xs shadow-sm cursor-pointer"
          >
            I Agree to Terms & Sign Consent
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 md:px-4">
      
      {/* Top Header Center Message */}
      <div className="text-center space-y-2 py-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Smile className="w-7 h-7 text-clinic-700" />
          <span>Vanakkam, {parentName}!</span>
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
          Welcome to your child's therapy progress board. Here you can track developmental milestones and home exercises.
        </p>
      </div>

      {/* Child Profile Selector (if multiple children) */}
      {myChildren.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Child Profile:</span>
          <select
            value={activeChild.id}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-extrabold text-slate-700 shadow-sm cursor-pointer"
          >
            {myChildren.map(c => <option key={c.id} value={c.id}>{c.name} {c.patientCode ? `(${c.patientCode})` : ''}</option>)}
          </select>
        </div>
      )}

      {/* Horizontal Menu Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-2xl mx-auto overflow-x-auto">
        {(['home', 'progress', 'appointments', 'activities', 'feedback', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setParentTab(tab)}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap cursor-pointer ${
              parentTab === tab ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'home' ? 'Home' :
             tab === 'progress' ? 'Progress' :
             tab === 'appointments' ? 'Appointment' :
             tab === 'activities' ? 'Activities' :
             tab === 'feedback' ? 'Feedback' : 'Settings'}
          </button>
        ))}
      </div>

      {/* ------------------ HOME PAGE ------------------ */}
      {parentTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          
          {/* Grid 1 - Next Scheduled Session */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <Calendar className="w-4.5 h-4.5 text-clinic-700" />
              <span>Grid 1 - Next Scheduled Session</span>
            </h3>
            {nextApt ? (
              <div className="p-4 bg-clinic-50/60 rounded-2xl border border-clinic-100 space-y-2">
                <div className="text-clinic-700 font-extrabold text-sm flex items-center justify-between">
                  <span>Session Date: {nextApt.date}</span>
                  <span className="text-[10px] bg-white border border-clinic-200 px-2 py-0.5 rounded-full font-bold">
                    Confirmed
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-medium">
                  <div>Time: <strong>{nextApt.startTime}</strong></div>
                  <div>Program: <strong>{nextApt.sessionType}</strong></div>
                  <div>Guided By: <strong>{nextApt.therapistName}</strong></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No upcoming session scheduled.</p>
            )}
          </div>

          {/* Grid 2 - Latest Session Notes from Therapist */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <BookOpen className="w-4.5 h-4.5 text-clinic-700" />
              <span>Grid 2 - Latest Session Notes</span>
            </h3>
            {lastSession ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Date: {lastSession.date}</span>
                  <span className="text-clinic-700">{lastSession.sessionType}</span>
                </div>
                {lastSession.workspaceData && (
                  <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                    <p>🚀 <strong>Activities Done:</strong> {lastSession.workspaceData.activitiesPerformed.join(', ')}</p>
                    <p>✨ <strong>Therapist Feedback:</strong> {lastSession.workspaceData.observations}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No session notes recorded.</p>
            )}
          </div>

          {/* Grid 3 - Milestones */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-3">
              <Award className="w-4.5 h-4.5 text-clinic-700" />
              <span>Grid 3 - Milestones</span>
            </h3>
            <div className="space-y-3">
              {childGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{goal.name}</span>
                    <span className="text-clinic-700 font-extrabold">{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-clinic-700 h-full transition-all duration-300" style={{ width: `${goal.progressPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid 4 - Homework Checklist */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-clinic-700" />
                <span>Grid 4 - Homework Checklist</span>
              </h3>
              <button
                onClick={() => setParentTab('activities')}
                className="text-xs text-clinic-700 font-bold hover:underline"
              >
                View More
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {activeChild.assignedTherapistName} recommends completing these daily to accelerate results.
            </p>
            <div className="space-y-2.5 text-xs text-slate-700 font-medium">
              {childHomeworks.slice(0, 3).map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => setSelectedActivityForModal(hw)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                    hw.status === 'Completed' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${hw.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <div className="font-bold">{hw.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{hw.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------ PROGRESS PAGE ------------------ */}
      {parentTab === 'progress' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Patient Progress Chart</h2>
            <p className="text-xs text-slate-400 mt-0.5">Development metric scores plotted over session dates.</p>
          </div>

          <PatientProgressTrendChart singlePatient={true} />

          {/* Patient Achievements with AI suggested elevation */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>Patient Achievements 🏆</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                AI Suggested
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-gradient-to-r from-amber-50/60 to-clinic-50/60 rounded-2xl border border-amber-100 shadow-sm space-y-1">
                <div className="font-bold text-slate-800 text-sm">Fine Motor Grasp Milestone Achieved!</div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Kavin transitioned to static tripod grip for over 10 continuous minutes during writing sessions.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-sky-50/60 to-emerald-50/60 rounded-2xl border border-sky-100 shadow-sm space-y-1">
                <div className="font-bold text-slate-800 text-sm">Vestibular Balance Elevation</div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Rope climbing bilateral leg coordination improved from 15% to 50% milestone checkpoints.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ APPOINTMENTS PAGE ------------------ */}
      {parentTab === 'appointments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Therapy Bookings Calendar</h2>
            <p className="text-xs text-slate-400 mt-0.5">View details of scheduled and completed appointments.</p>
          </div>

          <div className="space-y-3 text-xs">
            {childAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => {
                  if (apt.status === 'Completed') {
                    const matchedSession = childSessions.find(s => s.date === apt.date);
                    if (matchedSession) setSelectedSessionView(matchedSession);
                  }
                }}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition ${
                  apt.status === 'Completed' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer' : 'bg-white border-slate-100'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{apt.date} • {apt.startTime}</div>
                  <div className="text-slate-500 font-medium mt-0.5">Program: {apt.sessionType} • Therapist: {apt.therapistName}</div>
                  {apt.status === 'Completed' && <div className="text-[10px] text-clinic-700 font-bold mt-1">Click to view session notes template</div>}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-center ${
                  apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-clinic-50 text-clinic-700 border-clinic-200'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ ACTIVITIES PAGE ------------------ */}
      {parentTab === 'activities' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="font-extrabold text-slate-800 text-base">Home Exercises Board</h2>
            <p className="text-xs text-slate-400 mt-0.5">Check off recommendations provided by {activeChild.assignedTherapistName}.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            {childHomeworks.map((hw) => (
              <div
                key={hw.id}
                onClick={() => {
                  setSelectedActivityForModal(hw);
                  setIsMarkCompletedChecked(hw.status === 'Completed');
                  setIsProofSentChecked(hw.proofSent || false);
                  setParentModalComment(hw.parentComments || '');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                  hw.status === 'Completed' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${hw.status === 'Completed' ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 text-sm">{hw.title}</div>
                  <p className="text-slate-600 font-medium">{hw.description}</p>
                  {hw.parentComments && <div className="text-[10px] text-emerald-700 font-bold italic">Parent comment: "{hw.parentComments}"</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ FEEDBACK & COMPLAINTS PAGE ------------------ */}
      {parentTab === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Sub-tabs for Feedback vs Complaints */}
          <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setFeedbackSubTab('feedback')}
              className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                feedbackSubTab === 'feedback' ? 'bg-white text-clinic-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={() => setFeedbackSubTab('complaint')}
              className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                feedbackSubTab === 'complaint' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              File a Complaint ⚠️
            </button>
          </div>

          {/* Feedback Sub-tab */}
          {feedbackSubTab === 'feedback' && (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">Submit Feedback</h2>
                
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Feedback Type</label>
                      <select
                        value={fbType}
                        onChange={(e: any) => setFbType(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
                      >
                        <option value="Therapist Feedback">Therapist Feedback</option>
                        <option value="Clinic Feedback">Clinic Feedback</option>
                      </select>
                    </div>

                    {fbType === 'Therapist Feedback' && (
                      <div>
                        <label className="block font-bold text-slate-400 uppercase mb-1">Select Therapist</label>
                        <select
                          value={fbTherapistId}
                          onChange={(e) => setFbTherapistId(e.target.value)}
                          className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
                        >
                          {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Score / Rating (1-5 Stars)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFbRating(num)}
                          className={`p-2 rounded-xl transition ${num <= fbRating ? 'text-amber-500 bg-amber-50' : 'text-slate-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Feedback Comments</label>
                    <textarea
                      required
                      rows={3}
                      value={fbComments}
                      onChange={(e) => setFbComments(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Suggestions (Optional)</label>
                    <input
                      type="text"
                      value={fbSuggestions}
                      onChange={(e) => setFbSuggestions(e.target.value)}
                      placeholder="Ideas for clinic improvement..."
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-6 py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </form>
              </div>

              {/* List of Previous Submitted Feedbacks */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">My Submitted Feedbacks</h2>
                <div className="space-y-3 text-xs">
                  {feedbacks.filter(f => f.parentName === parentName).map((fb) => (
                    <div key={fb.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 font-medium">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{fb.feedbackType} ({fb.date})</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium">"{fb.comments}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Complaints Sub-tab */}
          {feedbackSubTab === 'complaint' && (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <div className="border-b pb-2">
                  <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span className="text-rose-600">File a Complaint</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Submit concerns directly to clinic administration for resolution.</p>
                </div>

                <form onSubmit={handleComplaintSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Complaint Category</label>
                      <select
                        value={cmpCategory}
                        onChange={(e: any) => setCmpCategory(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
                      >
                        <option value="Scheduling & Timing">Scheduling & Timing</option>
                        <option value="Therapy Session">Therapy Session</option>
                        <option value="Facility & Equipment">Facility & Equipment</option>
                        <option value="Billing & Fee">Billing & Fee</option>
                        <option value="Staff Behavior">Staff Behavior</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-400 uppercase mb-1">Subject / Title</label>
                      <input
                        required
                        type="text"
                        value={cmpSubject}
                        onChange={(e) => setCmpSubject(e.target.value)}
                        placeholder="Brief summary of the issue..."
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 uppercase mb-1">Detailed Description</label>
                    <textarea
                      required
                      rows={4}
                      value={cmpDescription}
                      onChange={(e) => setCmpDescription(e.target.value)}
                      placeholder="Provide details of your concern..."
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium text-slate-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Complaint</span>
                  </button>
                </form>
              </div>

              {/* List of Submitted Complaints */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
                <h2 className="font-extrabold text-slate-800 text-base border-b pb-2">My Filed Complaints</h2>
                <div className="space-y-3 text-xs">
                  {complaints.filter(c => c.parentName === parentName).length > 0 ? (
                    complaints.filter(c => c.parentName === parentName).map((cmp) => (
                      <div key={cmp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-start font-bold">
                          <div>
                            <span className="text-slate-800 text-sm font-extrabold">{cmp.subject}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block">{cmp.category} • Filed on {cmp.date}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            cmp.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            cmp.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {cmp.status}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed">{cmp.description}</p>
                        {cmp.resolutionNotes && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-800 font-medium text-[11px]">
                            <strong>Admin Resolution Note:</strong> {cmp.resolutionNotes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic text-xs">No complaints filed yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* ------------------ SETTINGS PAGE ------------------ */}
      {parentTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium max-w-lg mx-auto space-y-4 text-xs animate-in fade-in duration-150">
          <h2 className="font-extrabold text-slate-800 text-base border-b pb-2 flex items-center gap-2">
            <SettingsIcon className="w-4.5 h-4.5 text-clinic-700" />
            <span>Parent Settings</span>
          </h2>

          <div className="space-y-3 font-medium">
            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">Parent Email</label>
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800" />
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">Change Password</label>
              <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-bold text-slate-800" />
            </div>

            <div className="pt-2">
              <button onClick={() => alert("Settings saved!")} className="bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer">
                Save Account Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Popup Modal */}
      {selectedActivityForModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Home Exercise Detail</h3>
              <button onClick={() => setSelectedActivityForModal(null)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="font-extrabold text-slate-800 text-sm">{selectedActivityForModal.title}</div>
              <p className="text-slate-600 font-medium">{selectedActivityForModal.description}</p>

              <div className="space-y-2 border-t pt-3 font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMarkCompletedChecked}
                    onChange={(e) => setIsMarkCompletedChecked(e.target.checked)}
                    className="w-4 h-4 accent-clinic-700"
                  />
                  <span>Mark Home as completed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProofSentChecked}
                    onChange={(e) => setIsProofSentChecked(e.target.checked)}
                    className="w-4 h-4 accent-clinic-700"
                  />
                  <span>Proof Sent</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Parent Comments</label>
                <textarea
                  rows={2}
                  value={parentModalComment}
                  onChange={(e) => setParentModalComment(e.target.value)}
                  placeholder="Enter comments on how child performed..."
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setSelectedActivityForModal(null)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={handleActivitySaveModal} className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs">Save Exercise Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Session Note View Modal */}
      {selectedSessionView && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Therapy Notes (Session Template)</h3>
              <button onClick={() => setSelectedSessionView(null)} className="text-slate-400 font-bold p-1">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs max-h-[70vh] overflow-y-auto">
              <div className="font-extrabold text-slate-800 text-base">{selectedSessionView.patientName} • Date: {selectedSessionView.date}</div>
              <div className="text-clinic-700 font-bold">Session Program: {selectedSessionView.sessionType} • Therapist: {selectedSessionView.therapistName}</div>
              {selectedSessionView.workspaceData && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 font-medium leading-relaxed">
                  <p><strong>Activities Performed:</strong> {selectedSessionView.workspaceData.activitiesPerformed.join(', ')}</p>
                  <p><strong>Assistance Level:</strong> {selectedSessionView.workspaceData.assistanceLevel}</p>
                  <p><strong>Patient Response:</strong> {selectedSessionView.workspaceData.patientResponse}</p>
                  <p><strong>Clinical Observations:</strong> {selectedSessionView.workspaceData.observations}</p>
                  <p><strong>Home Recommendations:</strong> {selectedSessionView.workspaceData.homeRecommendations}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedSessionView(null)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
