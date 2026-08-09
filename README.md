# 🏥 Aslan Child Development Center Portal

Welcome to the **Aslan Child Development Center** platform—a multi-role clinic management dashboard for pediatric occupational and developmental therapy. This system bridges the gap between **Clinic Administrators**, **Therapists**, and **Parents** to manage patient records, daily attendance, real-time therapy logs, clinical assessments, physical inventory mapping, and home-based exercise checklists.

---

## 🚀 Tech Stack

The application is built using the following modern web technologies:
- **Core Framework:** React 19 + TypeScript + Vite
- **Styling:** CSS + TailwindCSS (for sleek, responsive dashboards and modern aesthetic layouts)
- **Icons:** Lucide React
- **Linter & Tools:** Oxlint (for fast, efficient code validation)

---

## 💻 Getting Started

To run the application locally, run the following commands in the workspace root directory:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Preview the production bundle:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Run code validation (linter):**
   ```bash
   npm run lint
   ```

---

## 🔑 Login Accounts (Demo Reference)

When loading the app, you will land on the login screen. You can select one of the following pre-configured roles to sign in:

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@aslancdc.in` | `password123` |
| **Therapist** | `priya.raman@chennaiotclinic.in` | `password123` |
| **Parent** | `senthil.k@gmail.com` | `password123` |

---

## 🏢 1. The Admin Portal

The Admin Portal (defined in [AdminPortal.tsx](file:///d:/Work/CDC/Demo/src/components/AdminPortal.tsx)) provides clinical administrators with a comprehensive bird's-eye view of all operations.

### Sidebar Menus & How to Use Them

#### 📊 Dashboard
- **What it is:** High-level metrics showing center efficiency (Overall Attendance Rate, Average Cancellation Rate, and Therapist Room Utilization).
- **Interactive features:** Includes visual analytical charts (Weekly Sessions Trend, Attendance breakdown, and Patient Progress Trends) alongside a live activity feed showing recent notes and milestones.
- **How to use it:** Check this page to monitor daily clinic operations and get automated clinical alerts.

#### 👥 Patients
- **What it is:** A database of all pediatric patients registered at the clinic.
- **How to use it:**
  - Search patients by name or filter by program and primary therapist.
  - Click **"Add Patient"** to register a new child (requires parent contact details, child's age, and developmental concerns).
  - Click on a patient's card to open their **Patient Profile** to view their personal detail cards, active goals progress, and a scrollable timeline of their therapy logs.

#### 🩺 Therapists
- **What it is:** A directory of occupational therapists employed by the clinic.
- **How to use it:** Click **"Add Therapist"** to add a new therapist, or review current specializations and active caseload counts.

#### 📅 Appointments
- **What it is:** An interactive scheduling calendar.
- **How to use it:** Click on time blocks or click the schedule action button to book new therapy slots, view therapist availability, and track upcoming appointments.

#### 📝 Attendance
- **What it is:** Daily registry log to mark attendance for scheduled sessions.
- **How to use it:** Check off patient attendance as *Present*, *Absent*, *Excused*, or *Cancelled* to update center statistics.

#### 📂 Therapy Sessions
- **What it is:** Read-only log of all recorded sessions.
- **How to use it:** Review completed session notes, sensory response reports, and home recommendations logged by the clinical staff.

#### 🏆 Assessments
- **What it is:** Database of intake forms and milestone diagnostics.
- **How to use it:** Click **"Add Assessment"** to log child assessment scores, therapist recommendations, and status (e.g. *Completed*, *Pending Review*).

#### 🎯 Goals & Progress
- **What it is:** Developmental milestone goals library.
- **How to use it:** Add or update therapeutic milestones for children (e.g., Pencil Grip, Balancing, Sensory regulation) and view progress bars.

#### 📦 Inventory & Cupboard Map
- **What it is:** Tracking center physical sensory aids (e.g., sensory swings, weighted vests, visual cue cards).
- **How to use it:** 
  - Click **"Add Item"** to register new sensory tools.
  - Click the **"Cupboard Map"** button to load the interactive storage layout (defined in [StorageManagementView.tsx](file:///d:/Work/CDC/Demo/src/components/StorageManagementView.tsx)), where you can allocate items to specific cupboard shelves.

#### 📊 Reports
- **What it is:** A reporting suite focusing on patient attendance and monthly case counts.
- **How to use it:** Use it to review attendance trends or prepare summaries.

#### ⚙️ Settings
- **What it is:** Configuration center for global settings.
- **How to use it:** Adjust clinic operating hours, session fees, alarm alerts, and default session lengths.

*Note: The Billing and Invoice menu has been hidden from the Admin Portal layout by user request.*

---

## 🩺 2. The Therapist Portal

The Therapist Portal (defined in [TherapistPortal.tsx](file:///d:/Work/CDC/Demo/src/components/TherapistPortal.tsx)) is streamlined for clinicians to check their schedule and log daily session records.

### Sidebar Menus & How to Use Them

#### 📊 Dashboard
- **What it is:** A personal summary panel showing the therapist's active cases, total clinic hours logged, and upcoming bookings.

#### 👥 My Patients
- **What it is:** A curated directory of patients assigned directly to the logged-in therapist.
- **How to use it:** Click on any child's profile to view their milestone progression, assessment scores, and history of session notes.

#### 📅 Schedule
- **What it is:** A therapist-specific appointment calendar.

#### 📝 Attendance
- **What it is:** Access to log daily check-ins for the therapist's scheduled patients.

#### 📂 Sessions Log & Active Session Workspace
- **What it is:** The hub for logging clinical records.
- **How to use it:**
  - View past session logs.
  - Click **"Start Workspace"** or **"Resume"** to open the clinical layout in [SessionWorkspaceView.tsx](file:///d:/Work/CDC/Demo/src/components/SessionWorkspaceView.tsx).

> ### 🧠 How to use the Interactive Session Workspace:
> During a live therapy session, the therapist opens this workspace to record clinical notes:
> 1. **Goals Progress:** Adjust slide bars to update the progress percentages of active goals in real-time.
> 2. **Inventory Tools:** Check boxes next to tools used (e.g., *Sensory Swing*, *Weighted Vest*).
> 3. **Milestones:** Check off any newly achieved milestones.
> 4. **Clinical Observations:** Log qualitative findings under sensory response, activities performed, and general notes.
> 5. **Home Recommendations:** Write homework recommendations that will be immediately visible on the parent's portal.
> 6. **Save:** Save the workspace to store the session log.

#### 🏆 Assessments
- **What it is:** Access to file and log developmental assessments for the therapist's patients.

#### 🎯 Goals & Progress
- **What it is:** Edit active developmental milestones and set new target milestones.

---

## 🏡 3. The Parent Portal

The Parent Portal (defined in [ParentPortal.tsx](file:///d:/Work/CDC/Demo/src/components/ParentPortal.tsx)) features a simplified, responsive layout that allows parents to check updates from mobile devices.

### Tabs & How to Use Them

#### 🏠 Home
- **What it is:** An overview page summarizing key child information.
- **How to use it:**
  - Check the profile card to view the child's age, assigned program, and therapist.
  - Review upcoming scheduled appointments.
  - Read the **Latest Session Notes from Therapist** for a quick summary of the child's latest activities and therapist feedback.
  - Parents with multiple children enrolled can switch profiles using the **Child Profile** drop-down menu in the top banner.

#### 📈 Progress
- **What it is:** Visual tracking of the child's development.
- **How to use it:**
  - View the progress chart to track developmental growth over time.
  - Review the checklist under active goals and look at the trophy badge checklist for achieved milestones.

#### 📅 Appointments
- **What it is:** A timeline list of all bookings for the selected child.
- **How to use it:** Track the date, time, therapy type, room, therapist, and status (*Completed*, *Scheduled*, or *Cancelled*).

#### 🎯 Activities
- **What it is:** An interactive home exercises board.
- **How to use it:**
  - Displays daily sensory or physical exercises recommended by the therapist (e.g., *"Thread 15 plastic beads to practice pinch grip"*).
  - Parents can check off exercises as they complete them with their child at home, helping to maintain engagement between clinic visits.
