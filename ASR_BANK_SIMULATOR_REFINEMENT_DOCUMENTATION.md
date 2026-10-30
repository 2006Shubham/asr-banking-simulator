# ASR Bank Simulator — Role-Based Architecture & System Documentation

## 1. Executive Summary

The ASR Bank Simulator has been transformed into a fully dynamic, multi-role banking management system with strict separation of duties, dynamic MySQL database backing, explicit JDBC SQL queries for support operations, and complete role-aware workspaces.

Three independent workspaces are now supported:
1. **Customer NetBanking Portal** (`/dashboard/*`, `/customer/*`) — Account management, transaction statements, loan EMIs, fixed deposits, cards, profile, and ticketed support inquiry management.
2. **Employee Staff Workspace** (`/employee/*`) — Branch-level active cases, queue management, atomic ticket claiming, internal communication notes, customer directory search, and manager escalation.
3. **Branch Manager Workspace** (`/manager/*`) — Branch-wide oversight, case assignment and reassignment, employee workload tracking, and SQL-aggregated analytics reports.

---

## 2. Role-Based Credentials & Personas (All passwords: `demo123`)

| Username | Role | Persona | ID | Branch | Default Workspace |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `suraj_w` | **Customer** | Suraj Walke | `CUST001` | BR001 (Pune Main) | `/dashboard` |
| `anita_s` | **Customer** | Anita Shinde | `CUST002` | BR001 (Pune Main) | `/dashboard` |
| `pooja_acc` | **Employee** | Pooja Patil (Sr. Accountant) | `EMP002` | BR001 (Pune Main) | `/employee/dashboard` |
| `rajesh_mgr` | **Manager** | Rajesh Sharma (Branch Manager) | `EMP001` | BR001 (Pune Main) | `/manager/dashboard` |

---

## 3. Architecture & Data Flow

### 3.1 Security & Authentication
- **Session Management:** Stored in `localStorage` key `asr_bank_session` containing token, user entity, customer entity (for customers), employee entity (for bank staff), and branch metadata.
- **Frontend Route Protection:** [`ProtectedRoute`](file:///Users/rutuja/Documents/DBMS_project/asr-banking-simulator/frontend/src/routes/ProtectedRoute.jsx) evaluates `allowedRoles`. Unauthorized access attempts are automatically redirected to the user's role-specific home page via `getRoleHome()`.
- **Backend Role Verification:** Passwords verified via BCrypt hashing with legacy plaintext fallback for backward compatibility. Auth response returns both `Employee` and `Branch` entities.

### 3.2 Dynamic Database Schema (MySQL)
Three dedicated inquiry management tables were created with proper foreign keys and indexes:
1. `inquiries` — Inquiry master entity (`inquiry_id`, `cust_id`, `branch_id`, `assigned_emp_id`, `status`, `priority`, `category`, `subject`, `description`, timestamps).
2. `inquiry_messages` — Communication thread supporting `is_internal BOOLEAN` (internal staff notes are hidden from customers).
3. `inquiry_history` — Immutable audit log recording every state transition, claim, escalation, and assignment.

---

## 4. Workspaces & Implemented Features

### 4.1 Customer Workspace
- **Support & Inquiries (`/customer/inquiries`):**
  - View all raised support tickets with color-coded status badges (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  - Expandable case drawer displaying full message history and description.
  - Interactive two-way messaging with branch representatives.
  - "New Inquiry" modal with Category, Priority, Subject, Description, and optional Account Number.

### 4.2 Employee Workspace
- **Dashboard (`/employee/dashboard`):** Real-time KPI counters (`Assigned to Me`, `In Progress`, `Branch Queue`, `Escalated`, `Resolved by Me`, `Branch Total`) and recent case list.
- **Inquiry Queue (`/employee/inquiries`):**
  - **My Cases Tab:** Active cases currently being handled.
  - **Branch Queue Tab:** Unassigned branch tickets with one-click atomic **Claim Case** action.
  - **Escalated Tab:** Tickets flagged for Manager review.
  - **Case Actions Drawer:** Internal Notes checkbox (staff-only), status updates (`IN_PROGRESS`, `WAITING_FOR_CUSTOMER`, `RESOLVED`), and **Escalate Case to Branch Manager**.
- **Customer Lookup (`/employee/customers`):** Fast search by customer ID, name, phone, or email.
- **Staff Profile (`/employee/profile`):** Employee designation, branch allocation, IFSC, and contact information.

### 4.3 Manager Workspace
- **Dashboard (`/manager/dashboard`):** Consolidated branch KPIs, resolution turnaround times, quick action triggers, and workload preview.
- **Inquiry Oversight (`/manager/inquiries`):** Filter by `All Branch Cases`, `Escalated Cases`, or `Unassigned Queue`. Includes **Assign / Reassign Case** modal to distribute tickets among staff members.
- **Staff Workload (`/manager/employees`):** Relative workload progress bars, active vs resolved case distribution per employee.
- **Branch Reports (`/manager/reports`):** SQL-aggregated breakdowns by Category, Status, and Priority, along with average resolution hours.
- **Manager Profile (`/manager/profile`):** Branch leadership details, IFSC, street address, and branch assets.

---

## 5. Verification Commands

1. **Frontend Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

2. **Backend Spring Boot:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Server listens on `http://localhost:8080/`.

