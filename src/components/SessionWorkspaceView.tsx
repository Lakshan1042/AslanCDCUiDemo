'use client';

import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import type { Session } from '../types';
import {
  BookOpen, Check, Save, Star, ChevronLeft, CheckSquare, Target, UserCheck,
  Edit, Plus, Lock, Award, FileText
} from 'lucide-react';

interface SessionWorkspaceProps {
  patientId?: string;
  existingSession?: Session | null;
  readOnlyInitial?: boolean;
  onBack: () => void;
}

export const SessionWorkspaceView: React.FC<SessionWorkspaceProps> = ({
  patientId,
  existingSession,
  readOnlyInitial = false,
  onBack
}) => {
  const {
    patients, goals, therapists, appointments, activeTherapistId,
    addSession, addGoal, addAssessment, addHomework, updateAppointmentStatus
  } = useClinic();

  // Determine active patient and therapist
  const targetPatientId = existingSession ? existingSession.patientId : (patientId || patients[0]?.id);
  const patient = patients.find(p => p.id === targetPatientId) || patients[0];
  const therapist = therapists.find(t => t.id === (existingSession?.therapistId || activeTherapistId)) || therapists[0];

  const [isEditing, setIsEditing] = useState<boolean>(!readOnlyInitial);

  // Scheduled appointments for this patient
  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    existingSession?.workspaceData?.appointmentId || patientAppointments[0]?.id || ''
  );

  // Patient goals
  const patientGoals = goals.filter(g => g.patientId === patient.id);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(patientGoals[0]?.id || '');

  // Form states initialized from existingSession if available
  const [sessionNumber, setSessionNumber] = useState<number>(existingSession?.workspaceData?.sessionNumber || 12);
  const [duration, setDuration] = useState<number>(existingSession?.duration || 60);
  
  // Activities list and checklist
  const [allActivities, setAllActivities] = useState<string[]>([
    'Fine Motor Exercise',
    'Sensory Integration',
    'Balance Activity',
    'Handwriting Activity',
    'Coordination Exercise',
    'ADL Training'
  ]);
  const [activitiesPerformed, setActivitiesPerformed] = useState<string[]>(
    existingSession?.workspaceData?.activitiesPerformed || ['Sensory Integration', 'Fine Motor Exercise']
  );

  // Modals state
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('03/11/2026');

  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwDesc, setNewHwDesc] = useState('');
  const [assignedHomeworks, setAssignedHomeworks] = useState<{ title: string; description: string }[]>([]);

  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [newAssCategory, setNewAssCategory] = useState<'Fine Motor Skills' | 'Gross Motor Skills' | 'Sensory Processing' | 'Visual Motor Skills' | 'Coordination' | 'Self-Care / ADL' | 'Attention' | 'Social Participation'>('Sensory Processing');
  const [newAssScore, setNewAssScore] = useState(75);
  const [newAssDate, setNewAssDate] = useState(existingSession?.date || '03/08/2026');
  const [sessionAssessments, setSessionAssessments] = useState<{ category: string; score: number; date: string }[]>([]);

  // Clinical notes
  const [patientResponse, setPatientResponse] = useState(existingSession?.workspaceData?.patientResponse || '');
  const [assistanceLevel, setAssistanceLevel] = useState<'Independent' | 'Minimal' | 'Moderate' | 'Maximal' | 'Dependent'>(
    existingSession?.workspaceData?.assistanceLevel || 'Minimal'
  );
  const [observations, setObservations] = useState(existingSession?.workspaceData?.observations || '');
  const [progressRating, setProgressRating] = useState<number>(existingSession?.workspaceData?.progressRating || 6);
  const [homeRecommendations, setHomeRecommendations] = useState(existingSession?.workspaceData?.homeRecommendations || '');
  const [therapistNotes, setTherapistNotes] = useState(existingSession?.workspaceData?.therapistNotes || '');

  // Ratings 1-5
  const [participationRating, setParticipationRating] = useState(existingSession?.workspaceData?.ratings?.participation || 4);
  const [attentionRating, setAttentionRating] = useState(existingSession?.workspaceData?.ratings?.attention || 4);
  const [assistanceRating, setAssistanceRating] = useState(existingSession?.workspaceData?.ratings?.assistance || 2);
  const [performanceRating, setPerformanceRating] = useState(existingSession?.workspaceData?.ratings?.performance || 4);

  // Individual goal progress states inside session workspace
  const [sessionGoalProgress, setSessionGoalProgress] = useState<{ [goalId: string]: number }>({});

  useEffect(() => {
    const initialProgress: { [goalId: string]: number } = {};
    if (existingSession?.workspaceData?.goalsWorkedOn) {
      existingSession.workspaceData.goalsWorkedOn.forEach(g => {
        initialProgress[g.goalId] = g.progressPercent;
      });
    } else {
      patientGoals.forEach(g => {
        initialProgress[g.id] = g.progressPercent;
      });
    }
    setSessionGoalProgress(initialProgress);
  }, [existingSession, patientId, goals]);

  // Handle adding custom activity
  const handleAddActivity = () => {
    if (!newActivityName.trim()) return;
    const actName = newActivityName.trim();
    if (!allActivities.includes(actName)) {
      setAllActivities(prev => [...prev, actName]);
    }
    if (!activitiesPerformed.includes(actName)) {
      setActivitiesPerformed(prev => [...prev, actName]);
    }
    setNewActivityName('');
    setIsAddActivityOpen(false);
  };

  const toggleActivity = (act: string) => {
    if (!isEditing) return;
    setActivitiesPerformed(prev =>
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  // Handle adding new Goal
  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    addGoal({
      patientId: patient.id,
      name: newGoalName,
      description: newGoalDesc,
      startDate: new Date().toLocaleDateString('en-GB'),
      targetDate: newGoalTargetDate,
      status: 'In Progress',
      therapistNotes: []
    });
    setNewGoalName('');
    setNewGoalDesc('');
    setIsAddGoalOpen(false);
    alert(`New goal "${newGoalName}" added for ${patient.name}!`);
  };

  // Handle adding Homework
  const handleAddHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;
    const newHw = { title: newHwTitle.trim(), description: newHwDesc.trim() };
    setAssignedHomeworks(prev => [...prev, newHw]);
    addHomework({
      patientId: patient.id,
      patientName: patient.name,
      therapistId: therapist.id,
      therapistName: therapist.name,
      title: newHwTitle.trim(),
      description: newHwDesc.trim()
    });
    setNewHwTitle('');
    setNewHwDesc('');
    setIsAddHomeworkOpen(false);
    alert(`Homework "${newHw.title}" assigned successfully!`);
  };

  // Handle adding Assessment
  const handleAddAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAss = { category: newAssCategory, score: newAssScore, date: newAssDate };
    setSessionAssessments(prev => [...prev, newAss]);
    addAssessment({
      patientId: patient.id,
      patientName: patient.name,
      date: newAssDate,
      category: newAssCategory,
      score: newAssScore,
      observations: observations || 'Logged during Session Workspace',
      comments: 'Progress tracked',
      recommendations: homeRecommendations || 'Continue daily exercises'
    });
    setIsAddAssessmentOpen(false);
    alert(`Assessment for ${newAssCategory} (Score: ${newAssScore}) logged!`);
  };

  const handleGoalProgressChange = (goalId: string, value: number) => {
    if (!isEditing) return;
    setSessionGoalProgress(prev => ({
      ...prev,
      [goalId]: value
    }));
  };

  const handleSubmit = (status: 'Draft' | 'Completed') => {
    const workspaceGoals = patientGoals.map(g => ({
      goalId: g.id,
      name: g.name,
      progressPercent: sessionGoalProgress[g.id] !== undefined ? sessionGoalProgress[g.id] : g.progressPercent
    }));

    const sessionRecord: Session = {
      id: existingSession ? existingSession.id : `ses-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      therapistId: therapist.id,
      therapistName: therapist.name,
      date: existingSession ? existingSession.date : new Date().toLocaleDateString('en-GB'),
      duration,
      sessionType: patient.program,
      goalsWorkedOn: workspaceGoals.map(g => g.name),
      status,
      workspaceData: {
        patientId: patient.id,
        patientName: patient.name,
        age: patient.age,
        therapistId: therapist.id,
        therapistName: therapist.name,
        date: existingSession ? existingSession.date : new Date().toLocaleDateString('en-GB'),
        sessionNumber,
        duration,
        appointmentId: selectedAppointmentId,
        goalsWorkedOn: workspaceGoals,
        activitiesPerformed,
        patientResponse,
        assistanceLevel,
        observations,
        progressRating,
        homeRecommendations,
        therapistNotes,
        ratings: {
          participation: participationRating,
          attention: attentionRating,
          assistance: assistanceRating,
          performance: performanceRating
        }
      }
    };

    // If an appointment was selected, mark it as Completed
    if (selectedAppointmentId) {
      updateAppointmentStatus(selectedAppointmentId, 'Completed');
    }

    addSession(sessionRecord);
    alert(`Active Session Workspace ${existingSession ? 'updated' : 'saved'} as ${status === 'Completed' ? 'COMPLETED' : 'DRAFT'}! Scheduled appointment documentation updated.`);
    setIsEditing(false);
    onBack();
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            disabled={!isEditing}
            onClick={() => setRating(num)}
            className={`transition ${num <= rating ? 'text-amber-500 hover:text-amber-400' : 'text-slate-200 hover:text-slate-300'} ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-clinic-700" />
              <span>Active Session Workspace</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Recording observations for {patient.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Workspace
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Saved Session Log Template
            </span>
          )}
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Main Session Workspace Form */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Patient Details Header Summary */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patient Name</span>
                <div className="font-extrabold text-slate-800 mt-0.5 text-sm">{patient.name}</div>
                <div className="text-xs text-slate-500 font-mono font-medium">ID: {patient.patientCode || patient.id}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Age</span>
                <div className="font-bold text-slate-800 mt-0.5 text-sm">{patient.age} years</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Program</span>
                <div className="font-bold text-clinic-700 mt-0.5 text-sm">{patient.program}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Number</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 mt-0.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-clinic-500 block"
                  />
                ) : (
                  <div className="font-bold text-slate-800 mt-0.5 text-sm">{sessionNumber}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Duration</span>
                {isEditing ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-clinic-500 block"
                    />
                    <span className="text-xs text-slate-400 font-medium">mins</span>
                  </div>
                ) : (
                  <div className="font-bold text-slate-800 mt-0.5 text-sm">{duration} mins</div>
                )}
              </div>
            </div>

            {/* Select Scheduled Session Dropdown */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Select Scheduled Session:</span>
              </label>
              <select
                disabled={!isEditing}
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-clinic-500"
              >
                {patientAppointments.length === 0 ? (
                  <option value="">No scheduled appointments found for {patient.name}</option>
                ) : (
                  patientAppointments.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {apt.date} • {apt.startTime} - {apt.sessionType} ({apt.status})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* 2. Activities Performed Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-clinic-700" />
                <span>Activities Performed</span>
              </h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(true)}
                  className="bg-clinic-50 hover:bg-clinic-100 text-clinic-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer border border-clinic-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              )}
            </div>

            {/* Checklist of activities */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {allActivities.map((act) => {
                const isSelected = activitiesPerformed.includes(act);
                return (
                  <label
                    key={act}
                    onClick={() => toggleActivity(act)}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition ${
                      isSelected
                        ? 'bg-clinic-50 border-clinic-300 text-clinic-800 ring-1 ring-clinic-500'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={isSelected}
                      onChange={() => {}} // handled by container onClick
                      className="accent-clinic-700 w-4 h-4 rounded cursor-pointer"
                    />
                    <span>{act}</span>
                  </label>
                );
              })}
            </div>

            {/* Display selected activity pills */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Selected Activities ({activitiesPerformed.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {activitiesPerformed.map(act => (
                  <span key={act} className="bg-clinic-100 text-clinic-800 border border-clinic-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span>{act}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Update Clinical Goals Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-clinic-700" />
                <span>Update Progress on Clinical Goals</span>
              </h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(true)}
                  className="bg-clinic-50 hover:bg-clinic-100 text-clinic-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer border border-clinic-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              )}
            </div>

            {/* Goals addressed dropdown selector */}
            {patientGoals.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Goals Addressed Dropdown</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {patientGoals.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.progressPercent}% Target)</option>
                  ))}
                </select>
              </div>
            )}

            {/* Render Goals sliders */}
            <div className="space-y-4 pt-2">
              {patientGoals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active goals found. Click "Add Goal" to set up a new clinical target.</p>
              ) : (
                patientGoals.map((goal) => {
                  const currentProg = sessionGoalProgress[goal.id] !== undefined ? sessionGoalProgress[goal.id] : goal.progressPercent;
                  const isCompleted = currentProg >= 100;
                  return (
                    <div key={goal.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-800">{goal.name}</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-clinic-100 text-clinic-700'}`}>
                          {currentProg}% {isCompleted ? '• Completed' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{goal.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-medium">0%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          disabled={!isEditing}
                          value={currentProg}
                          onChange={(e) => handleGoalProgressChange(goal.id, parseInt(e.target.value))}
                          className={`flex-1 accent-clinic-700 h-2 bg-slate-200 rounded-lg ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">100%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. Clinical Notes & Observations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-2">Clinical Notes & Observations</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assistance Level Required</label>
                {isEditing ? (
                  <select
                    value={assistanceLevel}
                    onChange={(e: any) => setAssistanceLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
                  >
                    <option value="Independent">Independent (0% assistance)</option>
                    <option value="Minimal">Minimal assistance (1%-25%)</option>
                    <option value="Moderate">Moderate assistance (26%-50%)</option>
                    <option value="Maximal">Maximal assistance (51%-75%)</option>
                    <option value="Dependent">Dependent / Total (76%-100%)</option>
                  </select>
                ) : (
                  <div className="bg-slate-50 p-2.5 rounded-xl border text-xs font-semibold text-slate-700">{assistanceLevel}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Session Progression Rating (0 - 10)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    disabled={!isEditing}
                    value={progressRating}
                    onChange={(e) => setProgressRating(parseInt(e.target.value))}
                    className={`flex-1 accent-clinic-700 h-2 bg-slate-200 rounded-lg ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  />
                  <span className="text-xs font-extrabold text-clinic-700 bg-clinic-50 border border-clinic-200 px-2.5 py-1 rounded-lg">
                    {progressRating} / 10
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Response to Activities</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={patientResponse}
                    onChange={(e) => setPatientResponse(e.target.value)}
                    placeholder="Enter notes on patient's behavioral response..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                  />
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 font-medium">{patientResponse || 'N/A'}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Clinical Observations</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Note motor planning defects, sensory issues, physical alignment..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                  />
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 font-medium">{observations || 'N/A'}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Home Recommendation to Parents</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={homeRecommendations}
                    onChange={(e) => setHomeRecommendations(e.target.value)}
                    placeholder="Enter simple exercises to do at home..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                  />
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 font-medium">{homeRecommendations || 'N/A'}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Internal Therapist Notes: Notes for next session</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={therapistNotes}
                    onChange={(e) => setTherapistNotes(e.target.value)}
                    placeholder="Notes for next therapist session..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                  />
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border text-xs text-slate-700 font-medium">{therapistNotes || 'N/A'}</div>
                )}
              </div>
            </div>

            {/* 5. Home Work Section */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-clinic-700" />
                  <span>Home Work Section</span>
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsAddHomeworkOpen(true)}
                    className="bg-clinic-50 hover:bg-clinic-100 text-clinic-700 font-bold px-3 py-1 rounded-xl text-xs transition flex items-center gap-1 border border-clinic-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Home Work</span>
                  </button>
                )}
              </div>

              {assignedHomeworks.length > 0 ? (
                <div className="space-y-2">
                  {assignedHomeworks.map((hw, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="font-extrabold text-slate-800">{hw.title}</div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{hw.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No homework assigned yet for this session.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Assessments, Behavioral Performance & Actions */}
        <div className="lg:col-span-4 space-y-6">

          {/* Assessment Details Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-clinic-700" />
                <span>Assessment Details</span>
              </h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsAddAssessmentOpen(true)}
                  className="bg-clinic-50 hover:bg-clinic-100 text-clinic-700 font-bold px-2.5 py-1 rounded-xl text-xs transition flex items-center gap-1 border border-clinic-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Assessment</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">Used for client progression charts and milestone evaluation.</p>

            {/* List of Assessments */}
            <div className="space-y-2">
              {sessionAssessments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No assessment added for this session.</p>
              ) : (
                sessionAssessments.map((ass, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{ass.category}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{ass.date}</div>
                    </div>
                    <span className="font-extrabold text-clinic-700 bg-clinic-100 px-2.5 py-1 rounded-lg">
                      {ass.score} / 100
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Behavioral Performance Ratings Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <UserCheck className="w-4 h-4 text-clinic-700" />
              <span>Behavioral Performance</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Participation</span>
                {renderStars(participationRating, setParticipationRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attention and Focus</span>
                {renderStars(attentionRating, setAttentionRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assistance Required (Lower is better)</span>
                {renderStars(assistanceRating, setAssistanceRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Goal Performance</span>
                {renderStars(performanceRating, setPerformanceRating)}
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3">
            <h2 className="font-bold text-slate-800 text-sm">Actions</h2>
            <p className="text-[11px] text-slate-400 leading-normal">
              {isEditing
                ? 'Completing this session updates patient charts, goal progress, clears pending documents, and notifies parent.'
                : 'Viewing saved session workspace note template.'}
            </p>

            {!isEditing ? (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-3 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Session Notes</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl transition duration-150 text-xs cursor-pointer"
                >
                  <span>Close Workspace</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit('Completed')}
                  className="w-full flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-3 rounded-xl transition duration-150 shadow-sm text-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Session</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('Draft')}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl transition duration-150 text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-400" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (existingSession) {
                      setIsEditing(false);
                    } else {
                      onBack();
                    }
                  }}
                  className="w-full text-center py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer block"
                >
                  Cancel & Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------ MODALS ------------------ */}

      {/* Modal: Add Custom Activity */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-800">Add New Activity</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Activity Name</label>
                <input
                  type="text"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-clinic-500"
                  placeholder="e.g. Trampoline Jumping Exercise"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
              <button onClick={() => setIsAddActivityOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={handleAddActivity} className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer">Add Activity</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Goal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleAddGoalSubmit}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Add Clinical Goal for {patient.name}</h3>
                <button type="button" onClick={() => setIsAddGoalOpen(false)} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Goal Name</label>
                  <input
                    type="text"
                    required
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    placeholder="e.g. Fine Motor Pincer Grasp Improvement"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newGoalDesc}
                    onChange={(e) => setNewGoalDesc(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    placeholder="Goal details..."
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Target Date</label>
                  <input
                    type="text"
                    value={newGoalTargetDate}
                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddGoalOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Homework */}
      {isAddHomeworkOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleAddHomeworkSubmit}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Add Home Work for Parents</h3>
                <button type="button" onClick={() => setIsAddHomeworkOpen(false)} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Home Work Name</label>
                  <input
                    type="text"
                    required
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    placeholder="e.g. Daily Balance Board Exercise"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Description & Instructions</label>
                  <textarea
                    rows={3}
                    value={newHwDesc}
                    onChange={(e) => setNewHwDesc(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                    placeholder="Instructions for parent at home..."
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddHomeworkOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer">Assign Home Work</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Assessment */}
      {isAddAssessmentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-premium w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleAddAssessmentSubmit}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">Add Clinical Assessment</h3>
                <button type="button" onClick={() => setIsAddAssessmentOpen(false)} className="text-slate-400 font-bold p-1 cursor-pointer">✕</button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Assessment Category / Name</label>
                  <select
                    value={newAssCategory}
                    onChange={(e: any) => setNewAssCategory(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                  >
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
                  <label className="block font-bold text-slate-400 uppercase mb-1">Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newAssScore}
                    onChange={(e) => setNewAssScore(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Assessment Date</label>
                  <input
                    type="text"
                    value={newAssDate}
                    onChange={(e) => setNewAssDate(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-2 justify-end">
                <button type="button" onClick={() => setIsAddAssessmentOpen(false)} className="px-4 py-2 bg-white border text-slate-600 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-clinic-700 text-white font-bold rounded-xl text-xs cursor-pointer">Save Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
