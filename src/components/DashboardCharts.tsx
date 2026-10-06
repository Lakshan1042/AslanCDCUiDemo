import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Fictional weekly data for sessions
const weeklySessionData = [
  { name: 'Mon', completed: 18, cancelled: 2 },
  { name: 'Tue', completed: 22, cancelled: 1 },
  { name: 'Wed', completed: 25, cancelled: 3 },
  { name: 'Thu', completed: 20, cancelled: 0 },
  { name: 'Fri', completed: 24, cancelled: 2 },
  { name: 'Sat', completed: 15, cancelled: 1 },
];

// Attendance stats data
const attendanceData = [
  { name: 'Present', value: 75, color: '#0f766e' },    // clinic teal
  { name: 'Late', value: 15, color: '#eab308' },       // yellow
  { name: 'Cancelled', value: 10, color: '#f43f5e' },   // rose
];

// Patient progress over time data
const progressHistoryData = [
  { month: 'Mar', fineMotor: 40, sensory: 30, adl: 50 },
  { month: 'Apr', fineMotor: 48, sensory: 35, adl: 55 },
  { month: 'May', fineMotor: 55, sensory: 45, adl: 60 },
  { month: 'Jun', fineMotor: 65, sensory: 50, adl: 70 },
  { month: 'Jul', fineMotor: 75, sensory: 55, adl: 80 },
  { month: 'Aug', fineMotor: 82, sensory: 68, adl: 85 },
];

export const WeeklySessionsChart: React.FC = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weeklySessionData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="completed" name="Completed Sessions" fill="#0f766e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cancelled" name="Cancelled" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AttendancePieChart: React.FC = () => {
  return (
    <div className="h-64 w-full flex flex-col justify-between">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
        {attendanceData.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5 justify-center">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProgressChartProps {
  singlePatient?: boolean;
}

export const PatientProgressTrendChart: React.FC<ProgressChartProps> = ({ singlePatient = false }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={progressHistoryData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="fineMotor"
            name={singlePatient ? "Fine Motor grasping" : "Fine Motor Skills Avg"}
            stroke="#0f766e"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="sensory"
            name={singlePatient ? "Sensory focus" : "Sensory Regulation Avg"}
            stroke="#0ea5e9"
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="adl"
            name={singlePatient ? "Dressing skills" : "Daily Living Activities (ADL) Avg"}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Session Attendance Breakdown (Present vs Absent)
const monthlyAttendanceData = [
  { month: 'Mar', present: 112, absent: 14 },
  { month: 'Apr', present: 124, absent: 10 },
  { month: 'May', present: 135, absent: 12 },
  { month: 'Jun', present: 146, absent: 8 },
  { month: 'Jul', present: 158, absent: 11 },
  { month: 'Aug', present: 165, absent: 9 },
];

export const MonthlySessionAttendanceChart: React.FC = () => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlyAttendanceData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            formatter={(value: any, name: any) => [
              `${value} sessions`,
              name === 'present' || name === 'Sessions Present' ? 'Sessions Present' : 'Sessions Absent / Cancelled'
            ]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="present" name="Sessions Present" fill="#0f766e" radius={[6, 6, 0, 0]} />
          <Bar dataKey="absent" name="Sessions Absent / Cancelled" fill="#f43f5e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

