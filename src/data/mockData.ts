import type { Patient, Therapist, Appointment, Goal, Session, InventoryItem, Cupboard, Invoice, AttendanceRecord, Assessment } from '../types';

export const mockTherapists: Therapist[] = [
  {
    id: 'th-1',
    name: 'Dr. Priya Raman',
    employeeId: 'EMP-OT-101',
    specialization: 'Sensory Integration & Pediatric OT',
    contact: '+91 98401 23456',
    email: 'priya.raman@chennaiotclinic.in',
    attendanceStatus: 'Present',
    status: 'Active',
    assignedPatients: ['pt-1', 'pt-2', 'pt-9'],
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
    assignedPatients: ['pt-3', 'pt-4'],
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
    assignedPatients: ['pt-5', 'pt-6', 'pt-10'],
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
    assignedPatients: ['pt-7', 'pt-8'],
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
    assignedPatients: ['pt-11'],
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
    assignedPatients: ['pt-12'],
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

export const mockPatients: Patient[] = [
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

export const mockAppointments: Appointment[] = [
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

export const mockGoals: Goal[] = [
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
      { date: '12/06/2026', progress: 10, note: 'Initial assessment. Sitting limit is 2-3 minutes before seeking sensory movement.' },
      { date: '05/07/2026', progress: 40, note: 'Fitted weighted lap pad. Focus extended to 6 minutes.' },
      { date: '28/07/2026', progress: 65, note: 'Now consistently sitting for 7.5 to 8 minutes with minor prompts.' }
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
      { date: '15/06/2026', progress: 15, note: 'Unable to coordinate left leg/arm together.' },
      { date: '15/07/2026', progress: 50, note: 'Can climb 4 rungs with hand support and visual cues.' }
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
      { date: '01/07/2026', progress: 20, note: 'Exhibits hand fatigue within 2 lines of writing.' },
      { date: '20/07/2026', progress: 55, note: 'Using a silicone grip helper. Writes 4-5 sentences before fatigue sets in.' },
      { date: '30/07/2026', progress: 75, note: 'Consistently using static tripod grip without grip helper. Muscle stamina improved.' }
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
      { date: '01/07/2026', progress: 30, note: 'Struggles with paper holding hand positioning.' },
      { date: '25/07/2026', progress: 90, note: 'Can cut straight sheets. Working on curved patterns now.' }
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
    therapistNotes: ['Shows excellent improvement. Reversals of b and d are reduced.'],
    timeline: [
      { date: '10/05/2026', progress: 20, note: 'Frequent line overflows and letter reversals.' },
      { date: '15/06/2026', progress: 50, note: 'Correct sizing on letters a, c, e, o. Still struggling with t, d, h.' },
      { date: '29/07/2026', progress: 80, note: 'Aligns 85% of letters on standard double lined boards.' }
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
    therapistNotes: ['Frustrated by smaller buttons. Practice with dressing boards is ongoing.'],
    timeline: [
      { date: '01/06/2026', progress: 0, note: 'Struggles to align button through buttonhole.' },
      { date: '10/07/2026', progress: 35, note: 'Can push large buttons on button board but struggles with soft clothing.' }
    ]
  }
];

export const mockSessions: Session[] = [
  {
    id: 'ses-1',
    patientId: 'pt-1',
    patientName: 'Kavin Raj',
    therapistId: 'th-1',
    therapistName: 'Dr. Priya Raman',
    date: '28/07/2026',
    duration: 60,
    sessionType: 'Sensory Integration',
    goalsWorkedOn: ['Sit focused for 10 minutes', 'Bilateral coordination in climbing'],
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
        { goalId: 'gl-1', name: 'Sit focused for 10 minutes', progressPercent: 65 },
        { goalId: 'gl-2', name: 'Bilateral coordination in climbing', progressPercent: 50 }
      ],
      activitiesPerformed: ['Sensory Swing (Calming linear motion)', 'Rope Ladder Climbing', 'Weighted Lap Pad Table Activity'],
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
    goalsWorkedOn: ['Improve fine motor grasp for handwriting', 'Scissor cutting along straight lines'],
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
        { goalId: 'gl-3', name: 'Improve fine motor grasp for handwriting', progressPercent: 75 },
        { goalId: 'gl-4', name: 'Scissor cutting along straight lines', progressPercent: 90 }
      ],
      activitiesPerformed: ['Theraputty (finger pinch drills)', 'Scissor cutting bold sheets', 'Tracing letters using wax crayons'],
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
    goalsWorkedOn: ['Letter formation and sizing alignment'],
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
        { goalId: 'gl-5', name: 'Letter formation and sizing alignment', progressPercent: 80 }
      ],
      activitiesPerformed: ['Lined paper grid exercises', 'Sand tray letter tracing', 'Auditory spelling & pacing drills'],
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

export const mockInventory: InventoryItem[] = [
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

export const mockCupboards: Cupboard[] = [
  {
    id: 'cp-1',
    name: 'Cupboard A',
    description: 'Located in Gym Area. Stores balance boards, therapy balls, and rollers.',
    shelves: [
      { id: 'cp-1-s1', name: 'Shelf 1', itemIds: ['inv-1'] },
      { id: 'cp-1-s2', name: 'Shelf 2', itemIds: ['inv-2'] },
      { id: 'cp-1-s3', name: 'Shelf 3', itemIds: [] }
    ]
  },
  {
    id: 'cp-2',
    name: 'Cupboard B',
    description: 'Located in Assessment Office. Stores sensory brushes, weighted items, and pencil grips.',
    shelves: [
      { id: 'cp-2-s1', name: 'Shelf 1', itemIds: ['inv-3', 'inv-9'] },
      { id: 'cp-2-s2', name: 'Shelf 2', itemIds: ['inv-4'] }
    ]
  },
  {
    id: 'cp-3',
    name: 'Cupboard C',
    description: 'Located in Pediatric Bay. Stores fine motor toys, peg boards, and resistance loops.',
    shelves: [
      { id: 'cp-3-s1', name: 'Shelf 1', itemIds: ['inv-5'] },
      { id: 'cp-3-s2', name: 'Shelf 2', itemIds: ['inv-6'] }
    ]
  },
  {
    id: 'cp-4',
    name: 'Sensory Room Cabinet',
    description: 'Cabinet 3 in the main sensory suite. Holds active swings and visual light toys.',
    shelves: [
      { id: 'cp-4-s1', name: 'Cabinet 3', itemIds: ['inv-7', 'inv-10'] }
    ]
  },
  {
    id: 'cp-5',
    name: 'Therapy Room Storage',
    description: 'Metal storage rack 2 in therapy room B. Holds cognitive puzzles.',
    shelves: [
      { id: 'cp-5-s1', name: 'Storage Rack 2', itemIds: ['inv-8'] }
    ]
  }
];

export const mockInvoices: Invoice[] = [
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

export const mockAttendanceRecords: AttendanceRecord[] = [
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
    checkIn: '09:15 AM', // late
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

export const mockAssessments: Assessment[] = [
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
