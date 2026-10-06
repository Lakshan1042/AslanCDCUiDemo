import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { AdminPortal } from './components/AdminPortal';
import { TherapistPortal } from './components/TherapistPortal';
import { ParentPortal } from './components/ParentPortal';
import {
  Bell, LogOut, ChevronLeft, ChevronRight, User, Settings,
  Box, Calendar, Users, Award, CheckSquare, BarChart, Activity,
  FileText, Lock, Clock, Smile, Heart, Sparkles, TrendingUp, Sun, Star, Gift
} from 'lucide-react';

const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" stroke="url(#logo-gradient)" strokeWidth="5" strokeDasharray="6 4" className="opacity-40" />
      <path d="M50 75 V46" stroke="url(#logo-gradient)" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 62 C35 58 32 45 42 36 C48 32 50 46 50 46" fill="url(#logo-gradient)" opacity="0.95" />
      <path d="M50 62 C65 58 68 45 58 36 C52 32 50 46 50 46" fill="url(#logo-gradient)" opacity="0.95" />
      <path d="M50 18 L53 25 L60 25 L55 29 L57 36 L50 32 L43 36 L45 29 L40 25 L47 25 Z" fill="#f59e0b" />
    </svg>
  );
};

const SidebarLink: React.FC<{
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  collapsed: boolean;
}> = ({ active, label, icon, onClick, collapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition duration-150 text-left ${active
        ? 'bg-clinic-700 text-white font-bold shadow-md shadow-clinic-700/20'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 font-semibold'
        }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && <span className="text-xs tracking-wide">{label}</span>}
    </button>
  );
};

const MainDashboardLayout: React.FC = () => {
  const { currentRole, setCurrentRole, currentPage, setCurrentPage, therapists, activeTherapistId } = useClinic();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // List of links for Admin
  const adminLinks = [
    { page: 'dashboard', label: 'Dashboard', icon: <BarChart className="w-4 h-4" /> },
    { page: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
    { page: 'therapists', label: 'Therapists', icon: <User className="w-4 h-4" /> },
    { page: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { page: 'attendance', label: 'Attendance', icon: <CheckSquare className="w-4 h-4" /> },
    { page: 'sessions', label: 'Sessions', icon: <Activity className="w-4 h-4" /> },
    { page: 'goals', label: 'Goals and Progress', icon: <Award className="w-4 h-4" /> },
    { page: 'inventory', label: 'Inventory', icon: <Box className="w-4 h-4" /> },
    { page: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { page: 'feedback', label: 'Feedback', icon: <Smile className="w-4 h-4" /> },
    { page: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // List of links for Therapist
  const therapistLinks = [
    { page: 'dashboard', label: 'Dashboard', icon: <BarChart className="w-4 h-4" /> },
    { page: 'patients', label: 'My Patients', icon: <Users className="w-4 h-4" /> },
    { page: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { page: 'attendance', label: 'Attendance', icon: <Clock className="w-4 h-4" /> },
    { page: 'sessions', label: 'Session Log', icon: <Activity className="w-4 h-4" /> },
    { page: 'goals', label: 'Goals and Progress', icon: <Award className="w-4 h-4" /> },
    { page: 'inventory', label: 'Inventory', icon: <Box className="w-4 h-4" /> },
    { page: 'homework', label: 'Track Homework', icon: <CheckSquare className="w-4 h-4" /> },
    { page: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const sidebarLinks = currentRole === 'admin' ? adminLinks : therapistLinks;
  const currentTherapist = therapists.find(t => t.id === activeTherapistId) || therapists[0];

  const userDisplayName = currentRole === 'admin' ? 'Dr Vigneshwaran' : currentTherapist.name;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">

      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-100 flex flex-col justify-between transition-all duration-300 z-30 shadow-card ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Brand area */}
          <div className="h-16 flex items-center px-5 border-b border-slate-100/80 gap-3 justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LogoIcon className="w-8 h-8 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h1 className="font-extrabold text-sm text-slate-800 leading-none truncate">Aslan Child Development Center</h1>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Chennai Clinic</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {sidebarLinks.map((link) => (
              <SidebarLink
                key={link.page}
                active={currentPage === link.page}
                label={link.label}
                icon={link.icon}
                collapsed={sidebarCollapsed}
                onClick={() => setCurrentPage(link.page)}
              />
            ))}
          </nav>
        </div>

        {/* Bottom profile/logout card */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentRole(null)} // logout resets role state to show login
            className={`w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition rounded-2xl font-bold text-left`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xs">Switch Portal</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 shadow-sm z-20">

          <div className="hidden sm:block font-semibold text-xs text-slate-500">
            {currentRole === 'admin' ? 'Admin Workspace' : 'Therapist Workspace'}
          </div>
          <div className="sm:hidden font-extrabold text-sm text-clinic-800">
            Aslan Child Development Center
          </div>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center gap-4 relative">

            {/* Global Role Presenter Switcher (Dropdown) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase px-2 hidden md:inline">Portal:</span>
              <select
                value={currentRole || ''}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="text-[10px] font-black bg-white text-slate-800 border-none rounded-lg px-2.5 py-1 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="admin">Admin Portal</option>
                <option value="therapist">Therapist Portal</option>
                <option value="parent">Parent Portal</option>
              </select>
            </div>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition relative"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-3xl border border-slate-100 shadow-premium p-4 space-y-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="font-bold border-b pb-2 text-slate-700 flex justify-between items-center">
                    <span>Notifications</span>
                    <button className="text-[10px] text-clinic-700 font-bold hover:underline">Clear all</button>
                  </div>
                  <div className="space-y-2.5 leading-normal">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <strong>Kavin Raj</strong> completed sensorimotor rope climbs.
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <strong>Dr. Priya Raman</strong> recorded handwriting milestone progress.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info Dropdown */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 text-left focus:outline-none"
              >
                <div className="w-8.5 h-8.5 rounded-full bg-clinic-100 text-clinic-700 flex items-center justify-center font-bold text-xs border border-clinic-200">
                  {userDisplayName.charAt(0)}
                </div>
                <div className="hidden lg:block min-w-0">
                  <div className="font-extrabold text-xs text-slate-800 leading-tight">{userDisplayName}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 capitalize">{currentRole} portal</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT WORKSPACE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          {currentRole === 'admin' ? <AdminPortal /> : <TherapistPortal />}
        </main>
      </div>
    </div>
  );
};

const LandingScreen: React.FC = () => {
  const { therapists, setActiveTherapistId, setCurrentRole } = useClinic();
  const [role, setRole] = useState<'admin' | 'therapist' | 'parent'>('admin');
  const [email, setEmail] = useState('admin@aslancdc.in');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDemoGuide, setShowDemoGuide] = useState(false);

  const handleRoleChange = (selectedRole: 'admin' | 'therapist' | 'parent') => {
    setRole(selectedRole);
    setErrorMsg(null);
    if (selectedRole === 'admin') {
      setEmail('admin@aslancdc.in');
    } else if (selectedRole === 'therapist') {
      setEmail('priya.raman@chennaiotclinic.in');
    } else {
      setEmail('senthil.k@gmail.com');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (role === 'admin') {
      if (email.trim() === 'admin@aslancdc.in' && password === 'password123') {
        setCurrentRole('admin');
      } else {
        setErrorMsg('Invalid Admin credentials. Try admin@aslancdc.in / password123');
      }
    } else if (role === 'therapist') {
      const match = therapists.find(t => t.email.toLowerCase() === email.trim().toLowerCase());
      if (match) {
        const expectedPwd = match.password || 'password123';
        if (password === expectedPwd) {
          setActiveTherapistId(match.id);
          setCurrentRole('therapist');
        } else {
          setErrorMsg('Invalid password for this Therapist account.');
        }
      } else {
        setErrorMsg('Therapist email not found in clinic records.');
      }
    } else if (role === 'parent') {
      if (email.trim() === 'senthil.k@gmail.com' && password === 'password123') {
        setCurrentRole('parent');
      } else {
        setErrorMsg('Invalid Parent credentials. Try senthil.k@gmail.com / password123');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-amber-50/15 to-clinic-50/20 flex flex-col justify-center items-center font-sans text-slate-800 p-4 relative overflow-hidden select-none">
      
      {/* Drifting abstract background gradient spheres */}
      <div className="absolute top-12 left-12 w-80 h-80 bg-gradient-to-br from-rose-200/15 to-amber-200/25 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-clinic-200/20 to-sky-200/20 rounded-[40%_60%_70%_30%] blur-3xl animate-drift-slow pointer-events-none" />
      <div className="absolute top-1/3 right-12 w-64 h-64 bg-gradient-to-bl from-indigo-200/10 to-purple-200/10 rounded-[60%_40%_30%_70%] blur-3xl animate-float-slow pointer-events-none" />

      {/* Faint Floating Positive Words (Typography Elements) */}
      <span className="absolute top-[12%] left-[6%] text-5xl md:text-7xl font-black text-rose-500/15 tracking-widest uppercase pointer-events-none select-none">Growth</span>
      <span className="absolute top-[10%] right-[8%] text-5xl md:text-7xl font-black text-clinic-600/15 tracking-widest uppercase pointer-events-none select-none">Milestones</span>
      <span className="absolute bottom-[20%] left-[8%] text-6xl md:text-8xl font-black text-amber-500/15 tracking-widest uppercase pointer-events-none select-none">Joy</span>
      <span className="absolute bottom-[12%] right-[6%] text-6xl md:text-8xl font-black text-sky-500/15 tracking-widest uppercase pointer-events-none select-none">Care</span>
      
      <span className="absolute top-[8%] left-[45%] text-4xl md:text-5xl font-black text-amber-500/10 tracking-widest uppercase pointer-events-none select-none">Hope</span>
      <span className="absolute top-[45%] right-[6%] text-4xl md:text-5xl font-black text-indigo-500/10 tracking-widest uppercase pointer-events-none select-none">Play</span>
      <span className="absolute top-[48%] left-[6%] text-4xl md:text-5xl font-black text-emerald-500/10 tracking-widest uppercase pointer-events-none select-none">Support</span>
      <span className="absolute bottom-[8%] left-[45%] text-4xl md:text-5xl font-black text-rose-500/10 tracking-widest uppercase pointer-events-none select-none">Smile</span>

      {/* Faint Floating Positive Outline Icons */}
      <Heart className="w-16 h-16 text-rose-500/25 absolute top-[22%] left-[8%] animate-float-slow pointer-events-none" />
      <Sparkles className="w-12 h-12 text-amber-500/25 absolute top-[18%] right-[14%] animate-pulse pointer-events-none" />
      <Smile className="w-16 h-16 text-clinic-600/25 absolute bottom-[26%] left-[10%] animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
      <Award className="w-16 h-16 text-sky-500/25 absolute bottom-[22%] right-[16%] animate-pulse pointer-events-none" />
      <Users className="w-12 h-12 text-indigo-500/25 absolute top-[38%] right-[10%] animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />
      <CheckSquare className="w-12 h-12 text-emerald-500/25 absolute top-[35%] left-[10%] animate-pulse pointer-events-none" />
      
      <TrendingUp className="w-14 h-14 text-clinic-500/20 absolute top-[6%] left-[28%] animate-float-slow pointer-events-none" />
      <Sun className="w-16 h-16 text-amber-500/20 absolute top-[28%] left-[24%] animate-pulse pointer-events-none" />
      <Star className="w-14 h-14 text-yellow-500/20 absolute bottom-[18%] left-[32%] animate-float-slow pointer-events-none" style={{ animationDelay: '1s' }} />
      <Gift className="w-14 h-14 text-rose-500/20 absolute bottom-[28%] right-[32%] animate-pulse pointer-events-none" />
      <Calendar className="w-12 h-12 text-sky-500/20 absolute top-[28%] right-[24%] animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />
      <Activity className="w-14 h-14 text-emerald-500/20 absolute bottom-[12%] left-[24%] animate-pulse pointer-events-none" />
      
      <Heart className="w-8 h-8 text-pink-500/20 absolute top-[52%] right-[22%] animate-float-slow pointer-events-none" style={{ animationDelay: '5s' }} />
      <Smile className="w-8 h-8 text-emerald-500/20 absolute top-[55%] left-[22%] animate-pulse pointer-events-none" />

      {/* Floating Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-premium p-8 lg:p-10 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-500 text-center">
        
        {/* Brand identity & Clean Subheader */}
        <div className="space-y-4">
          <LogoIcon className="w-16 h-16 mx-auto mb-2 drop-shadow-sm" />
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Portal Sign In</h2>
            <p className="text-[11px] text-slate-400 font-semibold max-w-xs mx-auto mt-1">
              Select your role and enter credentials to access your dashboard.
            </p>
          </div>
        </div>

        {/* Portal selector tabs inside login */}
        <div className="flex bg-slate-100/60 p-1 rounded-2xl border border-slate-200/40">
          {(['admin', 'therapist', 'parent'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`flex-1 text-center py-2 rounded-xl text-xs font-bold capitalize transition duration-150 cursor-pointer ${
                role === r
                  ? r === 'admin'
                    ? 'bg-white text-clinic-700 shadow-sm font-extrabold'
                    : r === 'therapist'
                    ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                    : 'bg-white text-clinic-600 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Errors display */}
        {errorMsg && (
          <div className="bg-rose-50/80 border border-rose-100 text-rose-700 text-xs font-semibold px-4 py-2.5 rounded-2xl text-center animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Portal User Email</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-clinic-500 font-medium text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full text-white font-bold py-2.5 rounded-xl transition duration-150 shadow-sm text-xs mt-4 cursor-pointer ${
              role === 'admin' ? 'bg-clinic-700 hover:bg-clinic-800' :
              role === 'therapist' ? 'bg-emerald-600 hover:bg-emerald-700' :
              'bg-clinic-600 hover:bg-clinic-700'
            }`}
          >
            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            📍 Chennai Clinic • Demonstration Prototype
          </span>
          
          <button
            type="button"
            onClick={() => setShowDemoGuide(!showDemoGuide)}
            className="bg-slate-100/50 hover:bg-slate-150 border border-slate-200/60 text-slate-500 font-bold px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer mt-1"
          >
            🔑 {showDemoGuide ? "Hide" : "Show"} Demo Logins Guide
          </button>

          {showDemoGuide && (
            <div className="w-full bg-slate-50/80 rounded-2xl border border-slate-200/50 p-4 shadow-sm text-left text-[11px] space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="font-extrabold text-slate-700 text-xs border-b border-slate-200/60 pb-1.5">Quick Login Reference Accounts:</div>
              <div className="space-y-1.5 font-medium">
                <div>
                  <span className="font-bold text-clinic-700">Admin:</span>
                  <code className="bg-slate-200/40 px-1 rounded ml-1 text-slate-600">admin@aslancdc.in</code>
                  <span className="text-slate-400"> (pwd: password123)</span>
                </div>
                <div>
                  <span className="font-bold text-emerald-700">Therapist:</span>
                  <code className="bg-slate-200/40 px-1 rounded ml-1 text-slate-600">priya.raman@chennaiotclinic.in</code>
                  <span className="text-slate-400"> (pwd: password123)</span>
                </div>
                <div>
                  <span className="font-bold text-clinic-600">Parent:</span>
                  <code className="bg-slate-200/40 px-1 rounded ml-1 text-slate-600">senthil.k@gmail.com</code>
                  <span className="text-slate-400"> (pwd: password123)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RootRouter: React.FC = () => {
  const { currentRole, setCurrentRole } = useClinic();

  // If no role has been selected yet (initial load), show landing selector
  // In addition, we will provide a way to switch roles on all views.

  // Note: Parent Portal layout is distinct (Header-centered navigation, no left sidebar)
  if (!currentRole) {
    return <LandingScreen />;
  }

  if (currentRole === 'parent') {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-amber-50/15 to-clinic-50/20 text-slate-800 font-sans relative overflow-x-hidden select-none pb-12">
        
        {/* Drifting abstract background gradient spheres */}
        <div className="absolute top-12 left-12 w-80 h-80 bg-gradient-to-br from-rose-200/15 to-amber-200/25 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-clinic-200/20 to-sky-200/20 rounded-[40%_60%_70%_30%] blur-3xl animate-drift-slow pointer-events-none" />
        <div className="absolute top-1/3 right-12 w-64 h-64 bg-gradient-to-bl from-indigo-200/10 to-purple-200/10 rounded-[60%_40%_30%_70%] blur-3xl animate-float-slow pointer-events-none" />

        {/* Faint Floating Positive Words (Typography Elements) */}
        <span className="absolute top-[12%] left-[4%] text-5xl md:text-7xl font-black text-rose-500/10 tracking-widest uppercase pointer-events-none select-none">Growth</span>
        <span className="absolute top-[10%] right-[5%] text-5xl md:text-7xl font-black text-clinic-600/10 tracking-widest uppercase pointer-events-none select-none">Milestones</span>
        <span className="absolute bottom-[20%] left-[5%] text-6xl md:text-8xl font-black text-amber-500/10 tracking-widest uppercase pointer-events-none select-none">Joy</span>
        <span className="absolute bottom-[12%] right-[4%] text-6xl md:text-8xl font-black text-sky-500/10 tracking-widest uppercase pointer-events-none select-none">Care</span>
        
        <span className="absolute top-[8%] left-[45%] text-4xl md:text-5xl font-black text-amber-500/10 tracking-widest uppercase pointer-events-none select-none">Hope</span>
        <span className="absolute top-[45%] right-[4%] text-4xl md:text-5xl font-black text-indigo-500/10 tracking-widest uppercase pointer-events-none select-none">Play</span>
        <span className="absolute top-[48%] left-[4%] text-4xl md:text-5xl font-black text-emerald-500/10 tracking-widest uppercase pointer-events-none select-none">Support</span>
        <span className="absolute bottom-[8%] left-[45%] text-4xl md:text-5xl font-black text-rose-500/10 tracking-widest uppercase pointer-events-none select-none">Smile</span>

        {/* Faint Floating Positive Outline Icons */}
        <Heart className="w-16 h-16 text-rose-500/20 absolute top-[22%] left-[6%] animate-float-slow pointer-events-none" />
        <Sparkles className="w-12 h-12 text-amber-500/20 absolute top-[18%] right-[10%] animate-pulse pointer-events-none" />
        <Smile className="w-16 h-16 text-clinic-600/20 absolute bottom-[26%] left-[8%] animate-float-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        <Award className="w-16 h-16 text-sky-500/20 absolute bottom-[22%] right-[12%] animate-pulse pointer-events-none" />
        <Users className="w-12 h-12 text-indigo-500/20 absolute top-[38%] right-[8%] animate-float-slow pointer-events-none" style={{ animationDelay: '4s' }} />
        <CheckSquare className="w-12 h-12 text-emerald-500/20 absolute top-[35%] left-[8%] animate-pulse pointer-events-none" />
        
        <TrendingUp className="w-14 h-14 text-clinic-500/15 absolute top-[6%] left-[28%] animate-float-slow pointer-events-none" />
        <Sun className="w-16 h-16 text-amber-500/15 absolute top-[28%] left-[24%] animate-pulse pointer-events-none" />
        <Star className="w-14 h-14 text-yellow-500/15 absolute bottom-[18%] left-[32%] animate-float-slow pointer-events-none" style={{ animationDelay: '1s' }} />
        <Gift className="w-14 h-14 text-rose-500/15 absolute bottom-[28%] right-[32%] animate-pulse pointer-events-none" />
        <Calendar className="w-12 h-12 text-sky-500/15 absolute top-[28%] right-[24%] animate-float-slow pointer-events-none" style={{ animationDelay: '3s' }} />
        <Activity className="w-14 h-14 text-emerald-500/15 absolute bottom-[12%] left-[24%] animate-pulse pointer-events-none" />

        {/* Parent Portal Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <LogoIcon className="w-8 h-8 flex-shrink-0" />
            <div className="leading-none text-left">
              <h1 className="font-extrabold text-xs text-slate-800">Aslan Child Development Center</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block mt-0.5">Parent Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 border border-slate-200/40">
              <span className="text-[9px] text-slate-400 font-bold uppercase px-1.5">Portal:</span>
              <select
                value={currentRole || ''}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="text-[9px] font-black bg-white text-slate-800 border-none rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="admin">Admin Portal</option>
                <option value="therapist">Therapist Portal</option>
                <option value="parent">Parent Portal</option>
              </select>
            </div>

            <button
              onClick={() => setCurrentRole(null)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition bg-white/80 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 relative z-10">
          <ParentPortal />
        </main>
      </div>
    );
  }

  // Admin and Therapist portals share a Left Sidebar layout
  return <MainDashboardLayout />;
};

function App() {
  return (
    <ClinicProvider>
      <RootRouter />
    </ClinicProvider>
  );
}

export default App;
