module.exports = [
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$App$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/App.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$App$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/context/ClinicContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClinicProvider",
    ()=>ClinicProvider,
    "useClinic",
    ()=>useClinic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const ClinicContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const getStorageItem = (key, fallback)=>{
    if ("TURBOPACK compile-time truthy", 1) return fallback;
    //TURBOPACK unreachable
    ;
};
const ClinicProvider = ({ children })=>{
    const [patients, setPatients] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_patients', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockPatients"]));
    const [therapists, setTherapists] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_therapists', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockTherapists"]));
    const [appointments, setAppointments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_appointments', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockAppointments"]));
    const [goals, setGoals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_goals', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockGoals"]));
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_sessions', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockSessions"]));
    const [inventory, setInventory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_inventory', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockInventory"]));
    const [cupboards, setCupboards] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_cupboards', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockCupboards"]));
    const [invoices, setInvoices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_invoices', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockInvoices"]));
    const [attendanceRecords, setAttendanceRecords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_attendance', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockAttendanceRecords"]));
    const [assessments, setAssessments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_assessments', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockAssessments"]));
    const [feedbacks, setFeedbacks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_feedbacks', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockFeedbacks"]));
    const [homeworks, setHomeworks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_homeworks', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockHomeworks"]));
    const [complaints, setComplaints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getStorageItem('ot_complaints', __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockComplaints"]));
    // Navigation states
    const [currentRole, setCurrentRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('dashboard');
    const [activeTherapistId, setActiveTherapistId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('th-1'); // Dr. Priya Raman as active therapist user
    const [activePatientId, setActivePatientId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('pt-1'); // Kavin Raj as active child/patient selection
    // Sync to local storage for demo persistence
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_patients', JSON.stringify(patients));
    }, [
        patients
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_therapists', JSON.stringify(therapists));
    }, [
        therapists
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_appointments', JSON.stringify(appointments));
    }, [
        appointments
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_goals', JSON.stringify(goals));
    }, [
        goals
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_sessions', JSON.stringify(sessions));
    }, [
        sessions
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_inventory', JSON.stringify(inventory));
    }, [
        inventory
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_cupboards', JSON.stringify(cupboards));
    }, [
        cupboards
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_invoices', JSON.stringify(invoices));
    }, [
        invoices
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_attendance', JSON.stringify(attendanceRecords));
    }, [
        attendanceRecords
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_assessments', JSON.stringify(assessments));
    }, [
        assessments
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_feedbacks', JSON.stringify(feedbacks));
    }, [
        feedbacks
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_homeworks', JSON.stringify(homeworks));
    }, [
        homeworks
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('ot_complaints', JSON.stringify(complaints));
    }, [
        complaints
    ]);
    // Adjust routing default page when switching roles
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setCurrentPage('dashboard');
    }, [
        currentRole
    ]);
    // Actions implementation
    const addPatient = (patient)=>{
        const newId = `pt-${patients.length + 1}`;
        const therapistName = therapists.find((t)=>t.id === patient.assignedTherapistId)?.name || 'Dr. Priya Raman';
        const newPatient = {
            ...patient,
            id: newId,
            assignedTherapistName: therapistName
        };
        setPatients((prev)=>[
                newPatient,
                ...prev
            ]);
        // Also link to therapist
        setTherapists((prev)=>prev.map((t)=>{
                if (t.id === patient.assignedTherapistId) {
                    return {
                        ...t,
                        assignedPatients: [
                            ...t.assignedPatients,
                            newId
                        ]
                    };
                }
                return t;
            }));
    };
    const updatePatientStatus = (id, status)=>{
        setPatients((prev)=>prev.map((p)=>p.id === id ? {
                    ...p,
                    status
                } : p));
    };
    const updatePatientLockStatus = (id, isLocked)=>{
        setPatients((prev)=>prev.map((p)=>p.id === id ? {
                    ...p,
                    isLocked
                } : p));
    };
    const addTherapist = (therapist)=>{
        const newId = `th-${therapists.length + 1}`;
        const newTherapist = {
            ...therapist,
            id: newId,
            assignedPatients: [],
            todaySessionsCount: 0
        };
        setTherapists((prev)=>[
                ...prev,
                newTherapist
            ]);
    };
    const deleteTherapist = (id)=>{
        setTherapists((prev)=>prev.filter((t)=>t.id !== id));
    };
    const bookAppointment = (appointment)=>{
        const newId = `apt-${appointments.length + 1}`;
        const newApt = {
            ...appointment,
            id: newId
        };
        setAppointments((prev)=>[
                newApt,
                ...prev
            ]);
        if (appointment.status === 'Completed') {
            const newInvc = {
                id: `invc-${invoices.length + 1}`,
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                invoiceNumber: `INV/2026/0${90 + invoices.length}`,
                billingPeriod: `August 2026 (1 Session)`,
                amount: 1300,
                status: 'Pending'
            };
            setInvoices((prev)=>[
                    newInvc,
                    ...prev
                ]);
        }
    };
    const updateAppointmentStatus = (id, status, reason)=>{
        setAppointments((prev)=>prev.map((apt)=>{
                if (apt.id === id) {
                    if (status === 'Completed' && apt.status !== 'Completed') {
                        setTherapists((theraps)=>theraps.map((t)=>{
                                if (t.id === apt.therapistId) {
                                    return {
                                        ...t,
                                        todaySessionsCount: t.todaySessionsCount + 1
                                    };
                                }
                                return t;
                            }));
                    }
                    return {
                        ...apt,
                        status,
                        ...reason && {
                            cancellationReason: reason
                        }
                    };
                }
                return apt;
            }));
    };
    const addGoal = (goal)=>{
        const newId = `gl-${goals.length + 1}`;
        const newGoal = {
            ...goal,
            id: newId,
            progressPercent: 0,
            timeline: [
                {
                    date: new Date().toLocaleDateString('en-GB'),
                    progress: 0,
                    note: 'Goal created.'
                }
            ]
        };
        setGoals((prev)=>[
                ...prev,
                newGoal
            ]);
    };
    const deleteGoal = (id)=>{
        setGoals((prev)=>prev.filter((g)=>g.id !== id));
    };
    const updateGoalProgress = (id, progressPercent, note)=>{
        setGoals((prev)=>prev.map((gl)=>{
                if (gl.id === id) {
                    return {
                        ...gl,
                        progressPercent,
                        status: progressPercent >= 100 ? 'Achieved' : 'In Progress',
                        timeline: [
                            ...gl.timeline,
                            {
                                date: new Date().toLocaleDateString('en-GB'),
                                progress: progressPercent,
                                note
                            }
                        ]
                    };
                }
                return gl;
            }));
    };
    const completeGoal = (id)=>{
        updateGoalProgress(id, 100, 'Goal completed/achieved during session.');
    };
    const addSession = (session)=>{
        setSessions((prev)=>[
                session,
                ...prev
            ]);
        setPatients((prev)=>prev.map((p)=>{
                if (p.id === session.patientId) {
                    return {
                        ...p,
                        lastSessionDate: session.date
                    };
                }
                return p;
            }));
        if (session.workspaceData) {
            session.workspaceData.goalsWorkedOn.forEach((gw)=>{
                updateGoalProgress(gw.goalId, gw.progressPercent, `Worked on during session: ${session.workspaceData?.observations || ''}`);
            });
        }
        const matchedApt = appointments.find((a)=>a.patientId === session.patientId && a.therapistId === session.therapistId && a.status === 'Scheduled');
        if (matchedApt) {
            updateAppointmentStatus(matchedApt.id, 'Completed');
        }
    };
    const addInventoryItem = (item)=>{
        const newId = `inv-${inventory.length + 1}`;
        const newItem = {
            ...item,
            id: newId,
            availableQuantity: item.status === 'Available' ? item.quantity : 0
        };
        setInventory((prev)=>[
                ...prev,
                newItem
            ]);
        setCupboards((prev)=>prev.map((c)=>{
                if (c.name === item.cupboard) {
                    return {
                        ...c,
                        shelves: c.shelves.map((s)=>{
                            if (s.name === item.shelf) {
                                return {
                                    ...s,
                                    itemIds: [
                                        ...s.itemIds,
                                        newId
                                    ]
                                };
                            }
                            return s;
                        })
                    };
                }
                return c;
            }));
    };
    const moveInventoryItem = (itemId, targetCupboard, targetShelf)=>{
        let oldCupboard = '';
        let oldShelf = '';
        inventory.forEach((item)=>{
            if (item.id === itemId) {
                oldCupboard = item.cupboard;
                oldShelf = item.shelf;
            }
        });
        setCupboards((prev)=>prev.map((c)=>{
                let updatedShelves = c.shelves;
                if (c.name === oldCupboard) {
                    updatedShelves = updatedShelves.map((s)=>{
                        if (s.name === oldShelf) {
                            return {
                                ...s,
                                itemIds: s.itemIds.filter((id)=>id !== itemId)
                            };
                        }
                        return s;
                    });
                }
                if (c.name === targetCupboard) {
                    updatedShelves = updatedShelves.map((s)=>{
                        if (s.name === targetShelf) {
                            return {
                                ...s,
                                itemIds: [
                                    ...s.itemIds,
                                    itemId
                                ]
                            };
                        }
                        return s;
                    });
                }
                return {
                    ...c,
                    shelves: updatedShelves
                };
            }));
        setInventory((prev)=>prev.map((item)=>{
                if (item.id === itemId) {
                    return {
                        ...item,
                        cupboard: targetCupboard,
                        shelf: targetShelf
                    };
                }
                return item;
            }));
    };
    const addAssessment = (assessment)=>{
        const newId = `asm-${assessments.length + 1}`;
        const prevAsm = assessments.find((a)=>a.patientId === assessment.patientId && a.category === assessment.category);
        const newAsm = {
            ...assessment,
            id: newId,
            previousScore: prevAsm ? prevAsm.score : undefined
        };
        setAssessments((prev)=>[
                newAsm,
                ...prev
            ]);
    };
    const markAttendance = (recordId, checkIn, checkOut, status, notes)=>{
        setAttendanceRecords((prev)=>prev.map((rec)=>{
                if (rec.id === recordId) {
                    if (rec.type === 'Therapist' && status) {
                        setTherapists((tPrev)=>tPrev.map((t)=>t.name === rec.name ? {
                                    ...t,
                                    attendanceStatus: status
                                } : t));
                    }
                    return {
                        ...rec,
                        ...checkIn && {
                            checkIn
                        },
                        ...checkOut && {
                            checkOut
                        },
                        ...status && {
                            status
                        },
                        ...notes && {
                            notes
                        }
                    };
                }
                return rec;
            }));
    };
    const addAttendanceRecord = (record)=>{
        const newId = `att-${attendanceRecords.length + 1}`;
        setAttendanceRecords((prev)=>[
                {
                    ...record,
                    id: newId
                },
                ...prev
            ]);
        if (record.type === 'Therapist') {
            setTherapists((tPrev)=>tPrev.map((t)=>t.name === record.name ? {
                        ...t,
                        attendanceStatus: record.status
                    } : t));
        }
    };
    const addFeedback = (fb)=>{
        const newFb = {
            ...fb,
            id: `fb-${feedbacks.length + 1}`,
            date: new Date().toLocaleDateString('en-GB')
        };
        setFeedbacks((prev)=>[
                newFb,
                ...prev
            ]);
    };
    const toggleHomeworkStatus = (id, proofSent, parentComments)=>{
        setHomeworks((prev)=>prev.map((hw)=>{
                if (hw.id === id) {
                    const newStatus = hw.status === 'Completed' ? 'Pending' : 'Completed';
                    return {
                        ...hw,
                        status: newStatus,
                        completedDate: newStatus === 'Completed' ? new Date().toLocaleDateString('en-GB') : undefined,
                        ...proofSent !== undefined && {
                            proofSent
                        },
                        ...parentComments !== undefined && {
                            parentComments
                        }
                    };
                }
                return hw;
            }));
    };
    const addHomework = (hw)=>{
        const newHw = {
            ...hw,
            id: `hw-${homeworks.length + 1}`,
            assignedDate: new Date().toLocaleDateString('en-GB'),
            status: 'Pending'
        };
        setHomeworks((prev)=>[
                newHw,
                ...prev
            ]);
    };
    const addComplaint = (complaint)=>{
        const newCmp = {
            ...complaint,
            id: `cmp-${complaints.length + 1}`,
            date: new Date().toLocaleDateString('en-GB'),
            status: 'Open'
        };
        setComplaints((prev)=>[
                newCmp,
                ...prev
            ]);
    };
    const updateComplaintStatus = (id, status, resolutionNotes)=>{
        setComplaints((prev)=>prev.map((c)=>{
                if (c.id === id) {
                    return {
                        ...c,
                        status,
                        ...resolutionNotes !== undefined && {
                            resolutionNotes
                        }
                    };
                }
                return c;
            }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ClinicContext.Provider, {
        value: {
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
            complaints,
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
            addHomework,
            addComplaint,
            updateComplaintStatus
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/ClinicContext.tsx",
        lineNumber: 470,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useClinic = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ClinicContext);
    if (!context) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
};
}),
"[project]/src/data/mockData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockAppointments",
    ()=>mockAppointments,
    "mockAssessments",
    ()=>mockAssessments,
    "mockAttendanceRecords",
    ()=>mockAttendanceRecords,
    "mockComplaints",
    ()=>mockComplaints,
    "mockCupboards",
    ()=>mockCupboards,
    "mockFeedbacks",
    ()=>mockFeedbacks,
    "mockGoals",
    ()=>mockGoals,
    "mockHomeworks",
    ()=>mockHomeworks,
    "mockInventory",
    ()=>mockInventory,
    "mockInvoices",
    ()=>mockInvoices,
    "mockPatients",
    ()=>mockPatients,
    "mockSessions",
    ()=>mockSessions,
    "mockTherapists",
    ()=>mockTherapists
]);
const mockTherapists = [
    {
        id: 'th-1',
        name: 'Dr. Priya Raman',
        employeeId: 'EMP-OT-101',
        specialization: 'Sensory Integration & Pediatric OT',
        contact: '+91 98401 23456',
        email: 'priya.raman@chennaiotclinic.in',
        attendanceStatus: 'Present',
        status: 'Active',
        assignedPatients: [
            'pt-1',
            'pt-2',
            'pt-9'
        ],
        todaySessionsCount: 3
    },
    {
        id: 'th-2',
        name: 'Anitha Krishnan',
        employeeId: 'EMP-OT-102',
        specialization: 'Fine Motor & Handwriting Specialist',
        contact: '+91 98402 34567',
        email: 'anitha.k@chennaiotclinic.in',
        attendanceStatus: 'Present',
        status: 'Active',
        assignedPatients: [
            'pt-3',
            'pt-4'
        ],
        todaySessionsCount: 2
    },
    {
        id: 'th-3',
        name: 'Divya Shankar',
        employeeId: 'EMP-OT-103',
        specialization: 'Autism Spectrum & Sensory Regulation',
        contact: '+91 98403 45678',
        email: 'divya.s@chennaiotclinic.in',
        attendanceStatus: 'Late',
        status: 'Active',
        assignedPatients: [
            'pt-5',
            'pt-6',
            'pt-10'
        ],
        todaySessionsCount: 4
    },
    {
        id: 'th-4',
        name: 'Karthik Subramanian',
        employeeId: 'EMP-OT-104',
        specialization: 'Adult Neuro-Rehabilitation & ADL',
        contact: '+91 98404 56789',
        email: 'karthik.s@chennaiotclinic.in',
        attendanceStatus: 'Present',
        status: 'Active',
        assignedPatients: [
            'pt-7',
            'pt-8'
        ],
        todaySessionsCount: 2
    },
    {
        id: 'th-5',
        name: 'Meena Suresh',
        employeeId: 'EMP-OT-105',
        specialization: 'Gross Motor & Postural Correction',
        contact: '+91 98405 67890',
        email: 'meena.s@chennaiotclinic.in',
        attendanceStatus: 'Present',
        status: 'Active',
        assignedPatients: [
            'pt-11'
        ],
        todaySessionsCount: 1
    },
    {
        id: 'th-6',
        name: 'Janani Rajendran',
        employeeId: 'EMP-OT-106',
        specialization: 'Hand Therapy & Splinting',
        contact: '+91 98406 78901',
        email: 'janani.r@chennaiotclinic.in',
        attendanceStatus: 'Absent',
        status: 'Active',
        assignedPatients: [
            'pt-12'
        ],
        todaySessionsCount: 0
    },
    {
        id: 'th-7',
        name: 'Arun Kumar',
        employeeId: 'EMP-OT-107',
        specialization: 'Developmental Delays & Early Intervention',
        contact: '+91 98407 89012',
        email: 'arun.k@chennaiotclinic.in',
        attendanceStatus: 'On Leave',
        status: 'Inactive',
        assignedPatients: [],
        todaySessionsCount: 0
    }
];
const mockPatients = [
    {
        id: 'pt-1',
        name: 'Kavin Raj',
        age: 6,
        gender: 'Male',
        parentName: 'Senthil Kumar',
        parentPhone: '+91 99401 12345',
        parentEmail: 'senthil.k@gmail.com',
        address: 'Flat 3A, Temple View Apartments, Anna Nagar, Chennai - 600040',
        assignedTherapistId: 'th-1',
        assignedTherapistName: 'Dr. Priya Raman',
        program: 'Sensory Integration Therapy',
        lastSessionDate: '28/07/2026',
        nextAppointmentDate: '03/08/2026',
        status: 'Active',
        primaryConcerns: 'Sensory seeking behavior, difficulty sitting in one place, poor emotional regulation during transitions.',
        currentPlan: 'Provide heavy work activities, swing therapy, and deep pressure protocols. Teach self-regulation strategies.'
    },
    {
        id: 'pt-2',
        name: 'Nila Prakash',
        age: 7,
        gender: 'Female',
        parentName: 'Prakash Rajendran',
        parentPhone: '+91 99402 23456',
        parentEmail: 'prakash.r@yahoo.com',
        address: '12, Karpagam Avenue, Adyar, Chennai - 600020',
        assignedTherapistId: 'th-1',
        assignedTherapistName: 'Dr. Priya Raman',
        program: 'Fine Motor Program',
        lastSessionDate: '30/07/2026',
        nextAppointmentDate: '03/08/2026',
        status: 'Active',
        primaryConcerns: 'Poor pencil grip, weak hand muscles, runs out of stamina during handwriting tasks at school.',
        currentPlan: 'Theraputty hand exercises, peg boards, scissor cutting, and writing on inclined boards with tripod grip reinforcement.'
    },
    {
        id: 'pt-3',
        name: 'Adhavan Kumar',
        age: 8,
        gender: 'Male',
        parentName: 'Ramesh Kumar',
        parentPhone: '+91 99403 34567',
        parentEmail: 'ramesh.k@rediffmail.com',
        address: '45, Gandhi Nagar Main Road, Velachery, Chennai - 600042',
        assignedTherapistId: 'th-2',
        assignedTherapistName: 'Anitha Krishnan',
        program: 'Handwriting Program',
        lastSessionDate: '29/07/2026',
        nextAppointmentDate: '04/08/2026',
        status: 'Active',
        primaryConcerns: 'Illegible handwriting, letter reversals, improper letter spacing and alignment on lines.',
        currentPlan: 'Multi-sensory writing (sand, air), trace sheets, and spatial awareness exercises.'
    },
    {
        id: 'pt-4',
        name: 'Yazhini Senthil',
        age: 5,
        gender: 'Female',
        parentName: 'Senthil Kumar',
        parentPhone: '+91 99401 12345',
        parentEmail: 'senthil.k@gmail.com',
        address: 'Flat 3A, Temple View Apartments, Anna Nagar, Chennai - 600040',
        assignedTherapistId: 'th-2',
        assignedTherapistName: 'Anitha Krishnan',
        program: 'Early Intervention Program',
        lastSessionDate: '27/07/2026',
        nextAppointmentDate: '04/08/2026',
        status: 'Active',
        primaryConcerns: 'Delayed bilateral coordination, unable to button shirts or zip bags, low muscle tone in fingers.',
        currentPlan: 'Lacing cards, bead threading, peg activities, and bi-lateral tearing/crumpling paper exercises.'
    },
    {
        id: 'pt-5',
        name: 'Harini Suresh',
        age: 9,
        gender: 'Female',
        parentName: 'Revathi Suresh',
        parentPhone: '+91 99404 45678',
        parentEmail: 'revathi.s@outlook.com',
        address: '22/9, Thiruvalluvar Street, T. Nagar, Chennai - 600017',
        assignedTherapistId: 'th-3',
        assignedTherapistName: 'Divya Shankar',
        program: 'Sensory Regulation Program',
        lastSessionDate: '31/07/2026',
        nextAppointmentDate: '03/08/2026',
        status: 'Active',
        primaryConcerns: 'Auditory hypersensitivity, covers ears during loud noises, easily overwhelmed by bright lights.',
        currentPlan: 'Sensory diet with controlled sound stimulation, compression vest training, and calming breathing routines.'
    },
    {
        id: 'pt-6',
        name: 'Mithran Karthik',
        age: 6,
        gender: 'Male',
        parentName: 'Deepa Anand',
        parentPhone: '+91 99405 56789',
        parentEmail: 'deepa.anand@hotmail.com',
        address: '8, Sannidhi Street, Mylapore, Chennai - 600004',
        assignedTherapistId: 'th-3',
        assignedTherapistName: 'Divya Shankar',
        program: 'Social Participation Program',
        lastSessionDate: '29/07/2026',
        nextAppointmentDate: '05/08/2026',
        status: 'Active',
        primaryConcerns: 'Difficulty playing with peers, lack of turn-taking, limited eye contact during conversation.',
        currentPlan: 'Structured group play, social stories, interactive games, and emotional expression cards.'
    },
    {
        id: 'pt-7',
        name: 'Iniya Aravind',
        age: 12,
        gender: 'Female',
        parentName: 'Lakshmi Narayanan',
        parentPhone: '+91 99406 67890',
        parentEmail: 'lakshmi.n@gmail.com',
        address: '15/2, Lake View Road, Porur, Chennai - 600116',
        assignedTherapistId: 'th-4',
        assignedTherapistName: 'Karthik Subramanian',
        program: 'Adult Rehab & ADL Preparation',
        lastSessionDate: '25/07/2026',
        nextAppointmentDate: '05/08/2026',
        status: 'On Hold',
        primaryConcerns: 'Recovering from post-viral motor weakness, difficulty dressing and eating independently.',
        currentPlan: 'Strengthening gross motor muscles, learning adaptive dressing techniques, and mock dining setup exercises.'
    },
    {
        id: 'pt-8',
        name: 'Viyan Rajesh',
        age: 4,
        gender: 'Male',
        parentName: 'Kavitha Saravanan',
        parentPhone: '+91 99407 78901',
        parentEmail: 'kavitha.s@gmail.com',
        address: '7, Thillai Ganga Nagar, Nanganallur, Chennai - 600061',
        assignedTherapistId: 'th-4',
        assignedTherapistName: 'Karthik Subramanian',
        program: 'Early Intervention Program',
        lastSessionDate: '28/07/2026',
        nextAppointmentDate: '06/08/2026',
        status: 'Active',
        primaryConcerns: 'Toe walking, poor balance, frequently falls while walking on uneven surfaces.',
        currentPlan: 'Balance board standing, heel-to-toe walking, ankle stretches, and sensory obstacle courses.'
    },
    {
        id: 'pt-9',
        name: 'Aadhira Saravanan',
        age: 5,
        gender: 'Female',
        parentName: 'Kavitha Saravanan',
        parentPhone: '+91 99407 78901',
        parentEmail: 'kavitha.s@gmail.com',
        address: '7, Thillai Ganga Nagar, Nanganallur, Chennai - 600061',
        assignedTherapistId: 'th-1',
        assignedTherapistName: 'Dr. Priya Raman',
        program: 'Sensory Integration Therapy',
        lastSessionDate: undefined,
        nextAppointmentDate: '03/08/2026',
        status: 'Active',
        primaryConcerns: 'Tactile defensiveness, refuses to play with sand/slime/dough, dislikes tags on clothing.',
        currentPlan: 'Gradual desensitization protocols, play with dry grains leading to wet textures, brushing technique application.'
    },
    {
        id: 'pt-10',
        name: 'Rithvik Anand',
        age: 8,
        gender: 'Male',
        parentName: 'Deepa Anand',
        parentPhone: '+91 99405 56789',
        parentEmail: 'deepa.anand@hotmail.com',
        address: '8, Sannidhi Street, Mylapore, Chennai - 600004',
        assignedTherapistId: 'th-3',
        assignedTherapistName: 'Divya Shankar',
        program: 'Attention and Focus Program',
        lastSessionDate: '31/07/2026',
        nextAppointmentDate: '07/08/2026',
        status: 'Active',
        primaryConcerns: 'Extremely short attention span (less than 2 minutes), distractibility, hyperactive behavior.',
        currentPlan: 'Visual schedules, auditory timers, core stabilization exercises to improve focus, and sequential cognitive games.'
    },
    {
        id: 'pt-11',
        name: 'Dharshini Kumar',
        age: 10,
        gender: 'Female',
        parentName: 'Ramesh Kumar',
        parentPhone: '+91 99403 34567',
        parentEmail: 'ramesh.k@rediffmail.com',
        address: '45, Gandhi Nagar Main Road, Velachery, Chennai - 600042',
        assignedTherapistId: 'th-5',
        assignedTherapistName: 'Meena Suresh',
        program: 'Gross Motor Coordination',
        lastSessionDate: '26/07/2026',
        nextAppointmentDate: '06/08/2026',
        status: 'Active',
        primaryConcerns: 'Difficulty catching balls, unable to jump on a single foot, poor shoulder stability.',
        currentPlan: 'Catch-and-throw training, target practice, single-leg hops, and wheelbarrow walking for shoulder strength.'
    },
    {
        id: 'pt-12',
        name: 'Sanjay Velmurugan',
        age: 14,
        gender: 'Male',
        parentName: 'Revathi Suresh',
        parentPhone: '+91 99404 45678',
        parentEmail: 'revathi.s@outlook.com',
        address: '22/9, Thiruvalluvar Street, T. Nagar, Chennai - 600017',
        assignedTherapistId: 'th-6',
        assignedTherapistName: 'Janani Rajendran',
        program: 'Self-Care / ADL Training',
        lastSessionDate: '20/07/2026',
        nextAppointmentDate: undefined,
        status: 'Discharged',
        primaryConcerns: 'Achieved independence in bathing, brushing, feeding, and buttoning. Focus shifted to academic integration.',
        currentPlan: 'Successfully completed goals. Discharged from active therapy. Advised home routines and biannual check-ins.'
    }
];
const mockAppointments = [
    // Today: 03/08/2026
    {
        id: 'apt-1',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        sessionType: 'Sensory Integration',
        date: '03/08/2026',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        room: 'Sensory Room A',
        status: 'Scheduled'
    },
    {
        id: 'apt-2',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        sessionType: 'Fine Motor Skills',
        date: '03/08/2026',
        startTime: '10:15 AM',
        endTime: '11:15 AM',
        room: 'Therapy Cabinet 1',
        status: 'Scheduled'
    },
    {
        id: 'apt-3',
        patientId: 'pt-9',
        patientName: 'Aadhira Saravanan',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        sessionType: 'Sensory Desensitization',
        date: '03/08/2026',
        startTime: '11:30 AM',
        endTime: '12:30 PM',
        room: 'Sensory Room B',
        status: 'Scheduled'
    },
    {
        id: 'apt-4',
        patientId: 'pt-5',
        patientName: 'Harini Suresh',
        therapistId: 'th-3',
        therapistName: 'Divya Shankar',
        sessionType: 'Sensory Regulation',
        date: '03/08/2026',
        startTime: '09:30 AM',
        endTime: '10:30 AM',
        room: 'Therapy Room 3',
        status: 'Scheduled'
    },
    {
        id: 'apt-5',
        patientId: 'pt-10',
        patientName: 'Rithvik Anand',
        therapistId: 'th-3',
        therapistName: 'Divya Shankar',
        sessionType: 'Attention Training',
        date: '03/08/2026',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        room: 'Therapy Room 3',
        status: 'Scheduled'
    },
    {
        id: 'apt-6',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        therapistId: 'th-2',
        therapistName: 'Anitha Krishnan',
        sessionType: 'Handwriting Skill',
        date: '03/08/2026',
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        room: 'Therapy Cabinet 2',
        status: 'Scheduled'
    },
    {
        id: 'apt-7',
        patientId: 'pt-4',
        patientName: 'Yazhini Senthil',
        therapistId: 'th-2',
        therapistName: 'Anitha Krishnan',
        sessionType: 'Early Intervention',
        date: '03/08/2026',
        startTime: '03:15 PM',
        endTime: '04:15 PM',
        room: 'Therapy Cabinet 2',
        status: 'Scheduled'
    },
    {
        id: 'apt-8',
        patientId: 'pt-8',
        patientName: 'Viyan Rajesh',
        therapistId: 'th-4',
        therapistName: 'Karthik Subramanian',
        sessionType: 'Balance/Gross Motor',
        date: '03/08/2026',
        startTime: '04:00 PM',
        endTime: '05:00 PM',
        room: 'Gym Area 1',
        status: 'Scheduled'
    },
    {
        id: 'apt-9',
        patientId: 'pt-11',
        patientName: 'Dharshini Kumar',
        therapistId: 'th-5',
        therapistName: 'Meena Suresh',
        sessionType: 'Gross Motor Coordination',
        date: '03/08/2026',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        room: 'Gym Area 2',
        status: 'Completed' // Finished early today
    },
    // Future Appointments (Weekly Schedule Demonstration)
    {
        id: 'apt-10',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        sessionType: 'Sensory Integration',
        date: '05/08/2026',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        room: 'Sensory Room A',
        status: 'Scheduled'
    },
    {
        id: 'apt-11',
        patientId: 'pt-6',
        patientName: 'Mithran Karthik',
        therapistId: 'th-3',
        therapistName: 'Divya Shankar',
        sessionType: 'Social Participation',
        date: '05/08/2026',
        startTime: '02:00 PM',
        endTime: '03:00 PM',
        room: 'Therapy Room 3',
        status: 'Scheduled'
    },
    {
        id: 'apt-12',
        patientId: 'pt-7',
        patientName: 'Iniya Aravind',
        therapistId: 'th-4',
        therapistName: 'Karthik Subramanian',
        sessionType: 'ADL Training',
        date: '05/08/2026',
        startTime: '03:00 PM',
        endTime: '04:00 PM',
        room: 'ADL Kitchen',
        status: 'Scheduled'
    }
];
const mockGoals = [
    {
        id: 'gl-1',
        patientId: 'pt-1',
        name: 'Sit focused for 10 minutes',
        description: 'Help Kavin improve sitting tolerance during table top educational activities using a weighted lap pad.',
        startDate: '10/06/2026',
        targetDate: '10/09/2026',
        progressPercent: 65,
        status: 'In Progress',
        therapistNotes: [
            'Responds well to weighted lap pad.',
            'Needs verbal prompts at around the 7-minute mark.'
        ],
        timeline: [
            {
                date: '12/06/2026',
                progress: 10,
                note: 'Initial assessment. Sitting limit is 2-3 minutes before seeking sensory movement.'
            },
            {
                date: '05/07/2026',
                progress: 40,
                note: 'Fitted weighted lap pad. Focus extended to 6 minutes.'
            },
            {
                date: '28/07/2026',
                progress: 65,
                note: 'Now consistently sitting for 7.5 to 8 minutes with minor prompts.'
            }
        ]
    },
    {
        id: 'gl-2',
        patientId: 'pt-1',
        name: 'Bilateral coordination in climbing',
        description: 'Kavin will climb the sensory rope ladder alternating feet with minimal physical prompts.',
        startDate: '15/06/2026',
        targetDate: '15/09/2026',
        progressPercent: 50,
        status: 'In Progress',
        therapistNotes: [
            'Grip strength has improved. Foot placing requires visual guidance.'
        ],
        timeline: [
            {
                date: '15/06/2026',
                progress: 15,
                note: 'Unable to coordinate left leg/arm together.'
            },
            {
                date: '15/07/2026',
                progress: 50,
                note: 'Can climb 4 rungs with hand support and visual cues.'
            }
        ]
    },
    {
        id: 'gl-3',
        patientId: 'pt-2',
        name: 'Improve fine motor grasp for handwriting',
        description: 'Nila will hold a standard pencil using a static tripod grasp to write three-letter words legibly.',
        startDate: '01/07/2026',
        targetDate: '30/09/2026',
        progressPercent: 75,
        status: 'In Progress',
        therapistNotes: [
            'Pencil grip has shifted from palmar grasp to tripod grasp with finger-weight training.'
        ],
        timeline: [
            {
                date: '01/07/2026',
                progress: 20,
                note: 'Exhibits hand fatigue within 2 lines of writing.'
            },
            {
                date: '20/07/2026',
                progress: 55,
                note: 'Using a silicone grip helper. Writes 4-5 sentences before fatigue sets in.'
            },
            {
                date: '30/07/2026',
                progress: 75,
                note: 'Consistently using static tripod grip without grip helper. Muscle stamina improved.'
            }
        ]
    },
    {
        id: 'gl-4',
        patientId: 'pt-2',
        name: 'Scissor cutting along straight lines',
        description: 'Cut a 6-inch paper strip along a straight bold line within 1/8 inch margin of error.',
        startDate: '01/07/2026',
        targetDate: '15/08/2026',
        progressPercent: 90,
        status: 'In Progress',
        therapistNotes: [
            'Highly motivated during craft tasks. Coordination is nearly complete.'
        ],
        timeline: [
            {
                date: '01/07/2026',
                progress: 30,
                note: 'Struggles with paper holding hand positioning.'
            },
            {
                date: '25/07/2026',
                progress: 90,
                note: 'Can cut straight sheets. Working on curved patterns now.'
            }
        ]
    },
    {
        id: 'gl-5',
        patientId: 'pt-3',
        name: 'Letter formation and sizing alignment',
        description: 'Adhavan will write lowercase alphabet letters aligning on four-ruled paper lines correctly.',
        startDate: '10/05/2026',
        targetDate: '10/08/2026',
        progressPercent: 80,
        status: 'In Progress',
        therapistNotes: [
            'Shows excellent improvement. Reversals of b and d are reduced.'
        ],
        timeline: [
            {
                date: '10/05/2026',
                progress: 20,
                note: 'Frequent line overflows and letter reversals.'
            },
            {
                date: '15/06/2026',
                progress: 50,
                note: 'Correct sizing on letters a, c, e, o. Still struggling with t, d, h.'
            },
            {
                date: '29/07/2026',
                progress: 80,
                note: 'Aligns 85% of letters on standard double lined boards.'
            }
        ]
    },
    {
        id: 'gl-6',
        patientId: 'pt-7',
        name: 'Independence in Buttoning Shirts',
        description: 'Iniya will button a standard front-opening school shirt with 5 medium buttons independently.',
        startDate: '01/06/2026',
        targetDate: '31/08/2026',
        progressPercent: 35,
        status: 'In Progress',
        therapistNotes: [
            'Frustrated by smaller buttons. Practice with dressing boards is ongoing.'
        ],
        timeline: [
            {
                date: '01/06/2026',
                progress: 0,
                note: 'Struggles to align button through buttonhole.'
            },
            {
                date: '10/07/2026',
                progress: 35,
                note: 'Can push large buttons on button board but struggles with soft clothing.'
            }
        ]
    }
];
const mockSessions = [
    {
        id: 'ses-1',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        date: '28/07/2026',
        duration: 60,
        sessionType: 'Sensory Integration',
        goalsWorkedOn: [
            'Sit focused for 10 minutes',
            'Bilateral coordination in climbing'
        ],
        status: 'Completed',
        workspaceData: {
            patientId: 'pt-1',
            patientName: 'Kavin Raj',
            age: 6,
            therapistId: 'th-1',
            therapistName: 'Dr. Priya Raman',
            date: '28/07/2026',
            sessionNumber: 15,
            duration: 60,
            goalsWorkedOn: [
                {
                    goalId: 'gl-1',
                    name: 'Sit focused for 10 minutes',
                    progressPercent: 65
                },
                {
                    goalId: 'gl-2',
                    name: 'Bilateral coordination in climbing',
                    progressPercent: 50
                }
            ],
            activitiesPerformed: [
                'Sensory Swing (Calming linear motion)',
                'Rope Ladder Climbing',
                'Weighted Lap Pad Table Activity'
            ],
            patientResponse: 'Kavin participated actively in swing. Initially resistant to rope ladder but complied after token reward (sticker chart).',
            assistanceLevel: 'Minimal',
            observations: 'Better sensory regulation observed today. Did not try to escape the chair during the weighted lap activity for 7 full minutes.',
            progressRating: 7,
            homeRecommendations: 'Parents to use the weighted vest (2kg) for 15 minutes before homework sessions. Linear swinging in the playground.',
            therapistNotes: 'Next session will focus on decreasing verbal prompts during fine motor tasks.',
            ratings: {
                participation: 4,
                attention: 3,
                assistance: 2,
                performance: 4
            }
        }
    },
    {
        id: 'ses-2',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        date: '30/07/2026',
        duration: 60,
        sessionType: 'Fine Motor Skills',
        goalsWorkedOn: [
            'Improve fine motor grasp for handwriting',
            'Scissor cutting along straight lines'
        ],
        status: 'Completed',
        workspaceData: {
            patientId: 'pt-2',
            patientName: 'Nila Prakash',
            age: 7,
            therapistId: 'th-1',
            therapistName: 'Dr. Priya Raman',
            date: '30/07/2026',
            sessionNumber: 8,
            duration: 60,
            goalsWorkedOn: [
                {
                    goalId: 'gl-3',
                    name: 'Improve fine motor grasp for handwriting',
                    progressPercent: 75
                },
                {
                    goalId: 'gl-4',
                    name: 'Scissor cutting along straight lines',
                    progressPercent: 90
                }
            ],
            activitiesPerformed: [
                'Theraputty (finger pinch drills)',
                'Scissor cutting bold sheets',
                'Tracing letters using wax crayons'
            ],
            patientResponse: 'Very enthusiastic. Proud of her scissor cutting. Maintained tripod grip on crayons for 10 minutes.',
            assistanceLevel: 'Independent',
            observations: 'Shows great hand strength growth. Wrist stabilization is improving.',
            progressRating: 9,
            homeRecommendations: 'Thread beads (15-20 beads) daily at home. Practice cutting safety paper sheets.',
            therapistNotes: 'Will transition to regular wood pencils next week.',
            ratings: {
                participation: 5,
                attention: 5,
                assistance: 1,
                performance: 5
            }
        }
    },
    {
        id: 'ses-3',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        therapistId: 'th-2',
        therapistName: 'Anitha Krishnan',
        date: '29/07/2026',
        duration: 60,
        sessionType: 'Handwriting Skill',
        goalsWorkedOn: [
            'Letter formation and sizing alignment'
        ],
        status: 'Completed',
        workspaceData: {
            patientId: 'pt-3',
            patientName: 'Adhavan Kumar',
            age: 8,
            therapistId: 'th-2',
            therapistName: 'Anitha Krishnan',
            date: '29/07/2026',
            sessionNumber: 12,
            duration: 60,
            goalsWorkedOn: [
                {
                    goalId: 'gl-5',
                    name: 'Letter formation and sizing alignment',
                    progressPercent: 80
                }
            ],
            activitiesPerformed: [
                'Lined paper grid exercises',
                'Sand tray letter tracing',
                'Auditory spelling & pacing drills'
            ],
            patientResponse: 'Responsive to pacing. Still tends to write quickly and messily when excited.',
            assistanceLevel: 'Minimal',
            observations: 'Sizing of vertical letters like b, d, h has improved. Reversals restricted to letter g.',
            progressRating: 8,
            homeRecommendations: 'Complete 1 page of the custom tracing journal with focus on letter baseline contacts.',
            therapistNotes: 'Excellent work today.',
            ratings: {
                participation: 4,
                attention: 4,
                assistance: 2,
                performance: 4
            }
        }
    }
];
const mockInventory = [
    {
        id: 'inv-1',
        name: 'Therapy Ball (65cm, Teal)',
        category: 'Vestibular & Balance',
        quantity: 4,
        availableQuantity: 3,
        cupboard: 'Cupboard A',
        shelf: 'Shelf 1',
        condition: 'Excellent',
        status: 'Available'
    },
    {
        id: 'inv-2',
        name: 'Balance Board (Wooden)',
        category: 'Vestibular & Proprioception',
        quantity: 2,
        availableQuantity: 2,
        cupboard: 'Cupboard A',
        shelf: 'Shelf 2',
        condition: 'Good',
        status: 'Available'
    },
    {
        id: 'inv-3',
        name: 'Sensory Brushes (Therapressure)',
        category: 'Tactile Desensitization',
        quantity: 12,
        availableQuantity: 10,
        cupboard: 'Cupboard B',
        shelf: 'Shelf 1',
        condition: 'Excellent',
        status: 'Available'
    },
    {
        id: 'inv-4',
        name: 'Weighted Vest (2.5 kg)',
        category: 'Deep Pressure Touch',
        quantity: 3,
        availableQuantity: 1,
        cupboard: 'Cupboard B',
        shelf: 'Shelf 2',
        condition: 'Good',
        status: 'In Use'
    },
    {
        id: 'inv-5',
        name: 'Fine Motor Peg Board (Wood)',
        category: 'Fine Motor & Coordination',
        quantity: 5,
        availableQuantity: 5,
        cupboard: 'Cupboard C',
        shelf: 'Shelf 1',
        condition: 'Good',
        status: 'Available'
    },
    {
        id: 'inv-6',
        name: 'Therapy Resistance Bands (Set of 3)',
        category: 'Strengthening',
        quantity: 8,
        availableQuantity: 2,
        cupboard: 'Cupboard C',
        shelf: 'Shelf 2',
        condition: 'Fair',
        status: 'Low Stock'
    },
    {
        id: 'inv-7',
        name: 'Sensory Lycra Swing (Blue)',
        category: 'Vestibular & Calming',
        quantity: 2,
        availableQuantity: 1,
        cupboard: 'Sensory Room',
        shelf: 'Cabinet 3',
        condition: 'Needs Maintenance',
        status: 'Maintenance Required'
    },
    {
        id: 'inv-8',
        name: 'Wooden Shape Sorting Puzzle',
        category: 'Visual Motor & Cognitive',
        quantity: 6,
        availableQuantity: 6,
        cupboard: 'Therapy Room',
        shelf: 'Storage Rack 2',
        condition: 'Excellent',
        status: 'Available'
    },
    {
        id: 'inv-9',
        name: 'Pencil Grip Helpers (Silicone, pack of 10)',
        category: 'Handwriting Tools',
        quantity: 4,
        availableQuantity: 0,
        cupboard: 'Cupboard B',
        shelf: 'Shelf 1',
        condition: 'Good',
        status: 'Low Stock'
    },
    {
        id: 'inv-10',
        name: 'Light Box with Colored Acrylic Shapes',
        category: 'Visual & Sensory Integration',
        quantity: 1,
        availableQuantity: 1,
        cupboard: 'Sensory Room',
        shelf: 'Cabinet 3',
        condition: 'Good',
        status: 'Available'
    }
];
const mockCupboards = [
    {
        id: 'cp-1',
        name: 'Cupboard A',
        description: 'Located in Gym Area. Stores balance boards, therapy balls, and rollers.',
        shelves: [
            {
                id: 'cp-1-s1',
                name: 'Shelf 1',
                itemIds: [
                    'inv-1'
                ]
            },
            {
                id: 'cp-1-s2',
                name: 'Shelf 2',
                itemIds: [
                    'inv-2'
                ]
            },
            {
                id: 'cp-1-s3',
                name: 'Shelf 3',
                itemIds: []
            }
        ]
    },
    {
        id: 'cp-2',
        name: 'Cupboard B',
        description: 'Located in Assessment Office. Stores sensory brushes, weighted items, and pencil grips.',
        shelves: [
            {
                id: 'cp-2-s1',
                name: 'Shelf 1',
                itemIds: [
                    'inv-3',
                    'inv-9'
                ]
            },
            {
                id: 'cp-2-s2',
                name: 'Shelf 2',
                itemIds: [
                    'inv-4'
                ]
            }
        ]
    },
    {
        id: 'cp-3',
        name: 'Cupboard C',
        description: 'Located in Pediatric Bay. Stores fine motor toys, peg boards, and resistance loops.',
        shelves: [
            {
                id: 'cp-3-s1',
                name: 'Shelf 1',
                itemIds: [
                    'inv-5'
                ]
            },
            {
                id: 'cp-3-s2',
                name: 'Shelf 2',
                itemIds: [
                    'inv-6'
                ]
            }
        ]
    },
    {
        id: 'cp-4',
        name: 'Sensory Room Cabinet',
        description: 'Cabinet 3 in the main sensory suite. Holds active swings and visual light toys.',
        shelves: [
            {
                id: 'cp-4-s1',
                name: 'Cabinet 3',
                itemIds: [
                    'inv-7',
                    'inv-10'
                ]
            }
        ]
    },
    {
        id: 'cp-5',
        name: 'Therapy Room Storage',
        description: 'Metal storage rack 2 in therapy room B. Holds cognitive puzzles.',
        shelves: [
            {
                id: 'cp-5-s1',
                name: 'Storage Rack 2',
                itemIds: [
                    'inv-8'
                ]
            }
        ]
    }
];
const mockInvoices = [
    {
        id: 'invc-1',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        invoiceNumber: 'INV/2026/084',
        billingPeriod: 'July 2026 (4 Sessions)',
        amount: 5200,
        status: 'Paid',
        paymentDate: '29/07/2026'
    },
    {
        id: 'invc-2',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        invoiceNumber: 'INV/2026/085',
        billingPeriod: 'July 2026 (5 Sessions)',
        amount: 6500,
        status: 'Paid',
        paymentDate: '31/07/2026'
    },
    {
        id: 'invc-3',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        invoiceNumber: 'INV/2026/086',
        billingPeriod: 'July 2026 (4 Sessions)',
        amount: 5200,
        status: 'Pending'
    },
    {
        id: 'invc-4',
        patientId: 'pt-5',
        patientName: 'Harini Suresh',
        invoiceNumber: 'INV/2026/087',
        billingPeriod: 'July 2026 (6 Sessions)',
        amount: 7800,
        status: 'Overdue'
    },
    {
        id: 'invc-5',
        patientId: 'pt-7',
        patientName: 'Iniya Aravind',
        invoiceNumber: 'INV/2026/088',
        billingPeriod: 'July 2026 (2 Sessions)',
        amount: 3000,
        status: 'Paid',
        paymentDate: '26/07/2026'
    }
];
const mockAttendanceRecords = [
    // Today's Patient Attendance Logs
    {
        id: 'att-p1',
        type: 'Patient',
        name: 'Kavin Raj',
        date: '03/08/2026',
        time: '09:00 AM',
        therapistName: 'Dr. Priya Raman',
        checkIn: '08:55 AM',
        checkOut: '10:02 AM',
        status: 'Present',
        notes: 'Cooperative, arrived ready for session.'
    },
    {
        id: 'att-p2',
        type: 'Patient',
        name: 'Harini Suresh',
        date: '03/08/2026',
        time: '09:30 AM',
        therapistName: 'Divya Shankar',
        checkIn: '09:42 AM',
        checkOut: '10:35 AM',
        status: 'Late',
        notes: 'Delayed due to traffic in Chennai Anna Salai.'
    },
    {
        id: 'att-p3',
        type: 'Patient',
        name: 'Dharshini Kumar',
        date: '03/08/2026',
        time: '10:00 AM',
        therapistName: 'Meena Suresh',
        checkIn: '09:58 AM',
        checkOut: '11:00 AM',
        status: 'Present',
        notes: 'Completed all target exercises.'
    },
    {
        id: 'att-p4',
        type: 'Patient',
        name: 'Nila Prakash',
        date: '03/08/2026',
        time: '10:15 AM',
        therapistName: 'Dr. Priya Raman',
        status: 'Absent',
        notes: 'Parent notified: Child down with low-grade fever.'
    },
    // Today's Therapist Attendance Logs
    {
        id: 'att-t1',
        type: 'Therapist',
        name: 'Dr. Priya Raman',
        date: '03/08/2026',
        checkIn: '08:30 AM',
        checkOut: '04:30 PM',
        status: 'Present'
    },
    {
        id: 'att-t2',
        type: 'Therapist',
        name: 'Anitha Krishnan',
        date: '03/08/2026',
        checkIn: '08:45 AM',
        checkOut: '04:45 PM',
        status: 'Present'
    },
    {
        id: 'att-t3',
        type: 'Therapist',
        name: 'Divya Shankar',
        date: '03/08/2026',
        checkIn: '09:15 AM',
        checkOut: '05:15 PM',
        status: 'Late'
    },
    {
        id: 'att-t4',
        type: 'Therapist',
        name: 'Karthik Subramanian',
        date: '03/08/2026',
        checkIn: '08:35 AM',
        checkOut: '04:30 PM',
        status: 'Present'
    },
    {
        id: 'att-t5',
        type: 'Therapist',
        name: 'Meena Suresh',
        date: '03/08/2026',
        checkIn: '08:40 AM',
        checkOut: '04:40 PM',
        status: 'Present'
    },
    {
        id: 'att-t6',
        type: 'Therapist',
        name: 'Janani Rajendran',
        date: '03/08/2026',
        status: 'Absent'
    }
];
const mockAssessments = [
    {
        id: 'asm-1',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        date: '10/06/2026',
        category: 'Sensory Processing',
        score: 55,
        previousScore: 45,
        observations: 'Hypersensitive to touch but seeks deep proprioceptive input. High movement-seeking behavior (swings, climbing).',
        comments: 'Has shown 10-point improvement since entering sensory integration course last quarter. Auditory overload is still minor trigger.',
        recommendations: 'Continue sensory brushing twice per session. Heavy work before focus tasks.'
    },
    {
        id: 'asm-2',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        date: '28/07/2026',
        category: 'Attention',
        score: 68,
        previousScore: 50,
        observations: 'Sitting limit improved to 7-8 minutes with deep compression therapy.',
        comments: 'Positive adaptation to visual schedules. Transitions are less stressful.',
        recommendations: 'Transition from physical prompts to auditory-visual timers.'
    },
    {
        id: 'asm-3',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        date: '15/05/2026',
        category: 'Fine Motor Skills',
        score: 60,
        previousScore: 40,
        observations: 'Immature grasp (palmar/supinate grasp), poor pencil pressure control, tears paper when erasing.',
        comments: 'Hand muscle tone is weak, tires after 3 minutes of drawing.',
        recommendations: 'Introduce finger putty, bead sequencing, and vertical easel writing.'
    },
    {
        id: 'asm-4',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        date: '30/07/2026',
        category: 'Fine Motor Skills',
        score: 82,
        previousScore: 60,
        observations: 'Using a functional tripod grasp. Sizing of letters is 80% accurate.',
        comments: 'Significant improvement in grasp endurance. Pencil control is stable.',
        recommendations: 'Practice wood pencil writing. Transition to lined homework notebooks.'
    }
];
const mockFeedbacks = [
    {
        id: 'fb-1',
        date: '30/07/2026',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        parentName: 'Senthil Kumar',
        feedbackType: 'Therapist Feedback',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        rating: 5,
        comments: 'Dr. Priya Raman has been wonderful with Kavin! We noticed a dramatic improvement in Kavin sitting tolerance at school.',
        suggestions: 'Would love to receive video snippets of swing drills if possible!'
    },
    {
        id: 'fb-2',
        date: '28/07/2026',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        parentName: 'Prakash Rajendran',
        feedbackType: 'Clinic Feedback',
        rating: 4,
        comments: 'Very clean facilities and caring OT staff. The cupboard equipment is always sanitized and neatly organized.',
        suggestions: 'Parking space in front of the clinic gets slightly crowded around 4 PM.'
    },
    {
        id: 'fb-3',
        date: '25/07/2026',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        parentName: 'Ramesh Kumar',
        feedbackType: 'Therapist Feedback',
        therapistId: 'th-2',
        therapistName: 'Anitha Krishnan',
        rating: 5,
        comments: 'Anitha maam patient approach with Adhavan handwriting has boosted his confidence in school tests.',
        suggestions: 'Keep up the good work.'
    }
];
const mockHomeworks = [
    {
        id: 'hw-1',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        title: 'Weighted Lap Pad Desk Routine',
        description: 'Use the weighted lap pad (2kg) for 15 minutes before homework writing tasks.',
        assignedDate: '28/07/2026',
        status: 'Completed',
        completedDate: '01/08/2026',
        proofSent: true,
        parentComments: 'Kavin stayed seated for 12 minutes straight during his English homework!'
    },
    {
        id: 'hw-2',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        title: 'Linear Swinging Routine',
        description: '10 minutes of linear swinging in the neighborhood park for vestibular input.',
        assignedDate: '28/07/2026',
        status: 'Completed',
        completedDate: '02/08/2026',
        proofSent: true,
        parentComments: 'Done at Anna Nagar tower park.'
    },
    {
        id: 'hw-3',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        therapistId: 'th-1',
        therapistName: 'Dr. Priya Raman',
        title: 'Theraputty Pinch Drills',
        description: 'Pinch 20 small hidden beads out of Theraputty to strengthen tripod grasp.',
        assignedDate: '30/07/2026',
        status: 'Pending'
    },
    {
        id: 'hw-4',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        therapistId: 'th-2',
        therapistName: 'Anitha Krishnan',
        title: 'Custom Tracing Journal',
        description: 'Complete 1 page of the custom tracing journal with focus on letter baseline contacts.',
        assignedDate: '29/07/2026',
        status: 'Completed',
        completedDate: '02/08/2026',
        proofSent: true,
        parentComments: 'Completed page 4 on Saturday.'
    }
];
const mockComplaints = [
    {
        id: 'cmp-1',
        date: '01/08/2026',
        patientId: 'pt-1',
        patientName: 'Kavin Raj',
        parentName: 'Senthil Kumar',
        subject: 'Session Delay on Friday',
        category: 'Scheduling & Timing',
        description: 'The 9:00 AM session started 20 minutes late due to previous cabinet overlap.',
        status: 'Under Review',
        resolutionNotes: 'Admin team notified front desk to buffer 10 mins between sessions.'
    },
    {
        id: 'cmp-2',
        date: '27/07/2026',
        patientId: 'pt-2',
        patientName: 'Nila Prakash',
        parentName: 'Prakash Rajendran',
        subject: 'Waiting Lounge Air Conditioning',
        category: 'Facility & Equipment',
        description: 'The waiting lounge AC unit was blowing warm air on Monday afternoon.',
        status: 'Resolved',
        resolutionNotes: 'AC unit serviced and cleaned by technician on 29/07/2026.'
    },
    {
        id: 'cmp-3',
        date: '25/07/2026',
        patientId: 'pt-3',
        patientName: 'Adhavan Kumar',
        parentName: 'Ramesh Kumar',
        subject: 'Parking Area Crowd',
        category: 'Facility & Equipment',
        description: 'Front gate parking was blocked around 4 PM making drop-off difficult.',
        status: 'Open'
    }
];
}),
];

//# sourceMappingURL=src_0wp7870._.js.map