import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import type { Session } from '../types';
import { BookOpen, Check, Save, Star, ChevronLeft, CheckSquare, Target, UserCheck } from 'lucide-react';

interface SessionWorkspaceProps {
  patientId: string;
  onBack: () => void;
}

export const SessionWorkspaceView: React.FC<SessionWorkspaceProps> = ({ patientId, onBack }) => {
  const { patients, goals, therapists, activeTherapistId, addSession } = useClinic();

  const patient = patients.find(p => p.id === patientId) || patients[0];
  const therapist = therapists.find(t => t.id === activeTherapistId) || therapists[0];

  // Retrieve patient goals
  const activeGoals = goals.filter(g => g.patientId === patient.id && g.status !== 'Achieved');

  // Form states
  const [sessionNumber, setSessionNumber] = useState(1);
  const [duration, setDuration] = useState(60);
  const [activitiesPerformed, setActivitiesPerformed] = useState<string[]>([]);
  const [patientResponse, setPatientResponse] = useState('');
  const [assistanceLevel, setAssistanceLevel] = useState<'Independent' | 'Minimal' | 'Moderate' | 'Maximal' | 'Dependent'>('Minimal');
  const [observations, setObservations] = useState('');
  const [progressRating, setProgressRating] = useState(5);
  const [homeRecommendations, setHomeRecommendations] = useState('');
  const [therapistNotes, setTherapistNotes] = useState('');

  // Ratings 1-5
  const [participationRating, setParticipationRating] = useState(4);
  const [attentionRating, setAttentionRating] = useState(4);
  const [assistanceRating, setAssistanceRating] = useState(2); // low assistance = better
  const [performanceRating, setPerformanceRating] = useState(4);

  // Individual goal progress states inside session workspace
  const [sessionGoalProgress, setSessionGoalProgress] = useState<{ [goalId: string]: number }>({});

  useEffect(() => {
    // Populate session numbers based on existing patient session logs
    setSessionNumber(12); // mock session increment
    
    // Set initial goal progress percentages from the context
    const initialProgress: { [goalId: string]: number } = {};
    activeGoals.forEach(g => {
      initialProgress[g.id] = g.progressPercent;
    });
    setSessionGoalProgress(initialProgress);
  }, [patientId]);

  const presetActivities = [
    'Fine Motor Exercise',
    'Sensory Integration',
    'Balance Activity',
    'Handwriting Activity',
    'Coordination Exercise',
    'ADL Training'
  ];

  const toggleActivity = (activity: string) => {
    setActivitiesPerformed(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleGoalProgressChange = (goalId: string, value: number) => {
    setSessionGoalProgress(prev => ({
      ...prev,
      [goalId]: value
    }));
  };

  const handleSubmit = (status: 'Draft' | 'Completed') => {
    // Structure workspace data
    const workspaceGoals = activeGoals.map(g => ({
      goalId: g.id,
      name: g.name,
      progressPercent: sessionGoalProgress[g.id] || g.progressPercent
    }));

    const sessionRecord: Session = {
      id: `ses-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      therapistId: therapist.id,
      therapistName: therapist.name,
      date: new Date().toLocaleDateString('en-GB'),
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
        date: new Date().toLocaleDateString('en-GB'),
        sessionNumber,
        duration,
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

    addSession(sessionRecord);
    alert(`Therapy session marked as ${status === 'Completed' ? 'COMPLETED' : 'SAVED AS DRAFT'}! Patient metrics and goals updated.`);
    onBack();
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex gap-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setRating(num)}
            className={`transition ${num <= rating ? 'text-amber-500 hover:text-amber-400' : 'text-slate-200 hover:text-slate-300'}`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Session workspace header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-clinic-700" />
            <span>Active Session Workspace</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Recording observations for {patient.name}.</p>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Session details input */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header metadata summary */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Patient</span>
              <div className="font-extrabold text-slate-800 mt-0.5 text-sm">{patient.name}</div>
              <div className="text-xs text-slate-500 font-medium">Age: {patient.age}y • ID: {patient.id}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Program</span>
              <div className="font-bold text-clinic-700 mt-0.5 text-sm">{patient.program}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Session Number</span>
              <input
                type="number"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 mt-0.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-clinic-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Duration (Mins)</span>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 mt-0.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-clinic-500"
              />
            </div>
          </div>

          {/* Activities selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-clinic-700" />
              <span>Activities Performed</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presetActivities.map((act) => {
                const isSelected = activitiesPerformed.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActivity(act)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                      isSelected
                        ? 'bg-clinic-50 border-clinic-300 text-clinic-800 ring-1 ring-clinic-500'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    {act}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goals worked on & current session adjustment sliders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-clinic-700" />
              <span>Update Progress on Clinical Goals</span>
            </h2>
            <div className="space-y-4">
              {activeGoals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No active goals found. Set up goals first in the Goals Tracker.</p>
              ) : (
                activeGoals.map((goal) => (
                  <div key={goal.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">{goal.name}</span>
                      <span className="font-bold text-clinic-700 bg-clinic-100 px-2 py-0.5 rounded-full">
                        {sessionGoalProgress[goal.id] !== undefined ? sessionGoalProgress[goal.id] : goal.progressPercent}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{goal.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-medium">Start: {goal.progressPercent}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sessionGoalProgress[goal.id] !== undefined ? sessionGoalProgress[goal.id] : goal.progressPercent}
                        onChange={(e) => handleGoalProgressChange(goal.id, parseInt(e.target.value))}
                        className="flex-1 accent-clinic-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 font-medium">Target: 100%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Observations and notes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm">Clinical Notes & Observations</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assistance Level Required</label>
                <select
                  value={assistanceLevel}
                  onChange={(e: any) => setAssistanceLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
                >
                  <option value="Independent">Independent (0% assistance)</option>
                  <option value="Minimal">Minimal assistance (1%-25%)</option>
                  <option value="Moderate">Moderate assistance (26%-50%)</option>
                  <option value="Maximal">Maximal assistance (51%-75%)</option>
                  <option value="Dependent">Dependent / Total (76%-100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Session Progress Rating (1-10)</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={progressRating}
                    onChange={(e) => setProgressRating(parseInt(e.target.value))}
                    className="flex-1 accent-clinic-700 h-1.5 bg-slate-200 rounded-lg"
                  />
                  <span className="text-sm font-extrabold text-clinic-700 bg-clinic-50 border border-clinic-200 px-2 py-0.5 rounded-lg">
                    {progressRating} / 10
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Response to Activities</label>
                <textarea
                  rows={2}
                  value={patientResponse}
                  onChange={(e) => setPatientResponse(e.target.value)}
                  placeholder="e.g. resistant to swing at first, did well with weighted lap board..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Clinical Observations</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Note motor planning defects, sensory issues, physical alignment anomalies..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Home Recommendations for Parents</label>
                <textarea
                  rows={2}
                  value={homeRecommendations}
                  onChange={(e) => setHomeRecommendations(e.target.value)}
                  placeholder="Enter simple exercises to do at home (avoid jargon)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Internal Therapist Notes</label>
                <textarea
                  rows={2}
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  placeholder="Enter notes for next therapist session (not visible to parent directly)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Performance ratings widgets & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics Ratings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-clinic-700" />
              <span>Behavioral Performance</span>
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Participation</span>
                {renderStars(participationRating, setParticipationRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attention & Focus</span>
                {renderStars(attentionRating, setAttentionRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assistance Required (Lower is Better)</span>
                {renderStars(assistanceRating, setAssistanceRating)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Goal Performance</span>
                {renderStars(performanceRating, setPerformanceRating)}
              </div>
            </div>
          </div>

          {/* Action trigger widgets */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-premium space-y-3">
            <h2 className="font-bold text-slate-800 text-sm">Actions</h2>
            <p className="text-[11px] text-slate-400 leading-normal">
              Completing this session updates patient charts, logs billable units, and notifies the parent.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSubmit('Completed')}
                className="w-full flex items-center justify-center gap-2 bg-clinic-700 hover:bg-clinic-800 text-white font-bold px-4 py-3 rounded-xl transition duration-150 shadow-sm text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Complete Session</span>
              </button>
              <button
                onClick={() => handleSubmit('Draft')}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2.5 rounded-xl transition duration-150 text-xs"
              >
                <Save className="w-4 h-4 text-slate-400" />
                <span>Save Draft Note</span>
              </button>
              <button
                onClick={onBack}
                className="w-full text-center py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel & Close Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
