export interface AssignedTherapistInfo {
  id: string | number;
  name: string;
  specialization?: string;
  isPrimary: boolean;
  assignedAt?: string;
}

export interface Patient {
  id: string;
  patientCode?: string;
  name: string;
  age: number;
  gender: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  assignedTherapistId: string;
  assignedTherapistName: string;
  assignedTherapists?: AssignedTherapistInfo[];
  program: string;
  lastSessionDate?: string;
  nextAppointmentDate?: string;
  status: 'Active' | 'On Hold' | 'Discharged';
  isLocked?: boolean;
  primaryConcerns: string;
  currentPlan: string;
  photo?: string;
}

export interface Therapist {
  id: string;
  name: string;
  employeeId: string;
  specialization: string;
  contact: string;
  email: string;
  password?: string;
  age?: number;
  gender?: string;
  address?: string;
  dateOfJoining?: string;
  collegeName?: string;
  degreeProgram?: string;
  yearOfPassing?: string;
  employmentType?: 'Full Time' | 'Part Time';
  attendanceStatus: 'Present' | 'Late' | 'Absent' | 'On Leave';
  status: 'Active' | 'Inactive';
  assignedPatients: string[]; // Patient IDs
  activePatientCount?: number;
  primaryPatientCount?: number;
  todaySessionsCount: number;
  photo?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  sessionType: string;
  date: string; // DD/MM/YYYY
  startTime: string; // HH:MM AM/PM
  endTime: string;
  room: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  cancellationReason?: string;
  notes?: string;
}

export interface Goal {
  id: string;
  patientId: string;
  name: string;
  description: string;
  startDate: string;
  targetDate: string;
  progressPercent: number; // 0 to 100
  status: 'Not Started' | 'In Progress' | 'Achieved' | 'On Hold';
  therapistNotes: string[];
  timeline: {
    date: string;
    progress: number;
    note: string;
  }[];
}

export interface SessionWorkspace {
  patientId: string;
  patientName: string;
  age: number;
  therapistId: string;
  therapistName: string;
  date: string;
  sessionNumber: number;
  duration: number; // minutes
  appointmentId?: string;
  goalsWorkedOn: { goalId: string; name: string; progressPercent: number }[];
  activitiesPerformed: string[];
  patientResponse: string;
  assistanceLevel: 'Independent' | 'Minimal' | 'Moderate' | 'Maximal' | 'Dependent';
  observations: string;
  progressRating: number; // 1-10
  homeRecommendations: string;
  therapistNotes: string;
  ratings: {
    participation: number; // 1-5
    attention: number; // 1-5
    assistance: number; // 1-5
    performance: number; // 1-5
  };
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string;
  duration: number;
  sessionType: string;
  goalsWorkedOn: string[];
  status: 'Draft' | 'Completed';
  workspaceData?: SessionWorkspace;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  cupboard: string; // e.g., 'Cupboard A'
  shelf: string; // e.g., 'Shelf 1'
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Maintenance';
  status: 'Available' | 'In Use' | 'Low Stock' | 'Maintenance Required';
}

export interface Cupboard {
  id: string;
  name: string;
  description: string;
  shelves: {
    id: string;
    name: string; // e.g., 'Shelf 1'
    itemIds: string[];
  }[];
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  invoiceNumber: string;
  billingPeriod: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: string;
}

export interface AttendanceRecord {
  id: string;
  type: 'Patient' | 'Therapist';
  name: string;
  date: string; // DD/MM/YYYY
  time?: string;
  therapistName?: string; // For patient
  role?: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Cancelled' | 'On Leave';
  notes?: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // DD/MM/YYYY
  category: 'Fine Motor Skills' | 'Gross Motor Skills' | 'Sensory Processing' | 'Visual Motor Skills' | 'Coordination' | 'Self-Care / ADL' | 'Attention' | 'Social Participation';
  score: number; // 0 - 100
  previousScore?: number;
  observations: string;
  comments: string;
  recommendations: string;
}

export interface ParentFeedback {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  parentName: string;
  feedbackType: 'Clinic Feedback' | 'Therapist Feedback';
  therapistId?: string;
  therapistName?: string;
  rating: number; // 1-5
  comments: string;
  suggestions?: string;
}

export interface HomeworkItem {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  title: string;
  description: string;
  assignedDate: string;
  status: 'Completed' | 'Pending';
  completedDate?: string;
  proofSent?: boolean;
  parentComments?: string;
}

export interface ParentComplaint {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  parentName: string;
  subject: string;
  category: 'Therapy Session' | 'Facility & Equipment' | 'Scheduling & Timing' | 'Billing & Fee' | 'Staff Behavior' | 'Other';
  description: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  resolutionNotes?: string;
}

