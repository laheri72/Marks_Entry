# Product Requirements Document (PRD) — The Register

**Project Name:** The Register — Formative Assessment Marking Platform  
**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Environment:** Web (Desktop & Tablet optimized, Mobile responsive)  

---

## 1. Executive Summary & Vision

**The Register** is a purpose-built, high-velocity digital marking register designed to eliminate the friction of traditional school ERP systems. Specifically tailored for formative assessments in primary and middle schools (with built-in support for 27 Bohra school classes, 550+ students, and gender-divided sections *Talabat / Talebaat*), the application provides a tactile, paper-ledger-inspired digital experience.

Teachers can log in securely via **Google Sign-In**, immediately view **only** their assigned classes and subjects, type student marks with rapid **keyboard navigation** (`Enter` key auto-jumps to the next student), and benefit from instant **auto-saving**. School administrators retain total oversight with flexible maximum marks configuration, teacher permission management, audit trails, and PDF/CSV report exports.

---

## 2. Stakeholders & User Personas

### 2.1 Persona 1: The Subject Teacher (e.g., Educator teaching Class 5 & 7 English)
* **Goal**: Rapidly enter and update formative assessment marks for student rosters without navigating complex menus.
* **Pain Points**: Heavy ERP software with slow page reloads, excessive dropdowns, manual "Save" button clicks, and cluttered interfaces showing classes/subjects they don't teach.
* **Key Needs**:
  * Seamless Google Sign-In using institutional email.
  * Zero UI noise: Only see assigned classes (e.g., `Class 5-A (Boys)`, `Class 7-A (Girls)`) and assigned subjects (e.g., `English`).
  * Keyboard-driven mark entry (`Enter` key moves focus to next student).
  * Auto-save confirmation without manual submit buttons.

### 2.2 Persona 2: The School Administrator / Academic Coordinator
* **Goal**: Maintain academic integrity, manage teacher assignments, configure max marks per subject/assessment, and generate downloadable class/student reports.
* **Pain Points**: Unauthorized mark edits, lack of audit trails, difficulty extracting PDF/CSV mark sheets for parent meetings or section reports.
* **Key Needs**:
  * Role-Based Access Control (RBAC) to enforce teacher permissions server-side.
  * Granular assignment matrix (assign specific Class + Subject combinations to specific teachers).
  * Flexible Max Marks setting per subject (e.g., Unit Test out of 15, Formative out of 25, Terminal out of 80/100).
  * Downloadable Reports in PDF and Excel/CSV formats.
  * Audit log tracking who modified what mark and when.

---

## 3. Core Functional Requirements

### FR-1: Google Sign-In & Institutional Authentication
* **FR-1.1**: The application MUST replace basic ID/password logins with **Google Sign-In** using OAuth 2.0.
* **FR-1.2**: Teachers and Admins sign in using their institutional Google accounts.
* **FR-1.3**: The system MUST resolve the authenticated user's email against the `profiles` table to retrieve their role (`admin` or `teacher`) and active subject assignments.
* **FR-1.4**: Unauthenticated users MUST be redirected to the Login screen. Unapproved Google accounts MUST see a "Pending Account Approval" screen with 0 permission access.

### FR-2: Teacher-Specific Class & Subject Scoping (Zero-Noise UI)
* **FR-2.1**: Upon login, the front-end MUST query the user's assigned permissions and display **only** the classes and subjects assigned to that teacher.
* **FR-2.2**: Non-assigned classes and subjects MUST NOT be rendered in the DOM or picker UI for regular teachers.
* **FR-2.3**: Access control MUST be enforced on the backend (via Row Level Security policies or server middleware). Any API/GraphQL request to read/write unassigned class marks MUST be rejected by the server.

### FR-3: Flexible Maximum Marks Configuration
* **FR-3.1**: Maximum marks MUST NOT be fixed to 100.
* **FR-3.2**: Each subject/assessment within a class MUST allow an editable Max Marks value (e.g., 15, 20, 25, 50, 80, 100).
* **FR-3.3**: Changing the Max Marks value MUST automatically adjust validation bounds for all student inputs under that subject/assessment.

### FR-4: Keyboard-First Mark Entry & Auto-Save Velocity
* **FR-4.1**: Selecting a Class and Subject MUST render a clean ledger roster sorted by Roll Number.
* **FR-4.2**: The first student's mark input field MUST auto-focus upon ledger load.
* **FR-4.3**: Pressing the `Enter` key inside a mark input field MUST validate the value, trigger an auto-save, and immediately focus the next student's mark input field.
* **FR-4.4**: Marks MUST auto-save on typing/blur with a visual `✓ Saved` tactile stamp indicator.

### FR-5: Student & Standard-Wise Reporting with PDF/CSV Export
* **FR-5.1**: Admins (and authorized teachers for their assigned classes) MUST be able to generate Standard/Class-wise and Subject-wise report cards.
* **FR-5.2**: Reports MUST display student roll numbers, full names, entered marks, max marks, percentage/grade indicators, and completion status (`X / Y` students filled).
* **FR-5.3**: **Export to CSV**: Users can download raw data cleanly formatted for Microsoft Excel / Google Sheets.
* **FR-5.4**: **Export to PDF**: Users can generate a clean, print-ready PDF document formatted with school header branding for sharing with section heads or parents.

### FR-6: Audit Trail & Historical Traceability
* **FR-6.1**: Every mark entry creation or modification MUST log the exact timestamp (`updated_at`), the teacher's profile ID, and previous vs. new mark values.
* **FR-6.2**: Admins MUST have access to an Audit Ledger tab displaying "Who entered what mark and when".

---

## 4. Non-Functional Requirements (NFRs)

* **NFR-1 Performance**: Mark input keypress to visual confirmation latency MUST be less than 50ms. Page load time MUST be under 1.5 seconds.
* **NFR-2 Security**: All database interactions MUST be guarded by server-side Row Level Security (RLS) rules. No plain credentials stored client-side.
* **NFR-3 Reliability & Offline Resilience**: In case of temporary network drops, mark entries MUST be stored in an offline queue (IndexedDB) and auto-synced when connection resumes.
* **NFR-4 Usability & Aesthetics**: Follow the tactile "Paper Ledger" visual design tokens (`--paper: #EEF3E8`, serif headers `Fraunces`, monospace inputs `IBM Plex Mono`).
* **NFR-5 Cost Efficiency**: Complete solution MUST run on **100% Free Hosting & Backend Tiers** (Vercel/Netlify + Supabase/Firebase Free Spark).

---

## 5. Success Metrics & KPIs

1. **Mark Entry Speed**: Average time to enter marks for a class of 30 students reduced by >60% compared to legacy ERP.
2. **Zero Unauthorized Access**: 100% compliance on teacher scoping (0 incidents of cross-teacher mark overwriting).
3. **Data Loss Rate**: 0% lost marks due to offline support and atomic upserts.
