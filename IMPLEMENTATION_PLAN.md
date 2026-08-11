# Implementation Plan — The Register

**Project Name:** The Register — Formative Assessment Marking Platform  
**Document Version:** 1.0.0  
**Target Delivery Strategy:** Agile 4-Phase Build Sprint  

---

## Phase 1: Cloud BaaS & Database Foundation (Supabase / Firebase)

### Objectives
Initialize the free cloud backend project, execute relational schema migrations, configure Google OAuth 2.0 Provider, and load the initial seed data (27 classes, 550+ students).

### Tasks
- [ ] **1.1 BaaS Setup**: Provision free Supabase / Firebase project named `the-register-marks`.
- [ ] **1.2 DDL Execution**: Run SQL migration script ([`BACKEND_SCHEMA.md`](file:///D:/My%20Sites/Marks_Entry/BACKEND_SCHEMA.md)) creating tables `profiles`, `academic_classes`, `subjects`, `students`, `teacher_permissions`, `mark_entries`, and `mark_audit_logs`.
- [ ] **1.3 Google OAuth Setup**: Configure Google Cloud Console credentials, set authorized OAuth redirect URIs, and bind to Supabase Auth provider.
- [ ] **1.4 Seed Data Migration**: Seed 27 Bohra school classes (`1-A (Boys)` to `7-A (Girls)`), default subject mappings, and 550+ Bohra school student rosters.
- [ ] **1.5 RLS Validation**: Execute unit tests verifying that RLS policies block cross-teacher mark access at the database level.

---

## Phase 2: Modern Frontend Shell & Authentication Module (Vite + React)

### Objectives
Build the high-density paper ledger UI design system, Google Sign-In authentication flow, and dynamic teacher-scoped navigation engine.

### Tasks
- [ ] **2.1 App Setup & Design System**: Initialize Vite + React project, set up CSS tokens (`--paper: #EEF3E8`, `--rule`, Google Fonts `Fraunces` & `IBM Plex`).
- [ ] **2.2 Google Auth Flow**: Build `/login` screen with "Continue with Google" button, OAuth token handler, and session persistence hook.
- [ ] **2.3 Scoped Navigation Engine**: Build `usePermissions` React hook fetching assigned classes & subjects for the current user. Ensure UI renders **only** assigned options for regular teachers.
- [ ] **2.4 App Shell Topbar**: Render Brand logo, active user capsule, uppercase Role badge (`TEACHER` / `ADMIN`), and view tabs (`Marks Entry`, `Settings`, `Reports`).

---

## Phase 3: High-Velocity Roster Ledger & Auto-Save Engine

### Objectives
Implement the paper register marking ledger with keyboard auto-jump navigation, dynamic max marks editing, and tactile `✓ Saved` feedback stamps.

### Tasks
- [ ] **3.1 Ledger Roster Grid**: Render student roster sorted by Roll Number with monospace inputs and configurable max marks header (`Max marks: [ 100 ]`).
- [ ] **3.2 Keyboard Navigation Engine**: Attach `keydown` listener capturing `Enter` / `Tab` keypresses, moving focus seamlessly to the next student input row (`focusFirstMarksInput()`).
- [ ] **3.3 Auto-Save & Debounce Engine**: Implement debounced atomic SQL upserts (`UPSERT INTO mark_entries`).
- [ ] **3.4 Tactile Feedback Stamp**: Animate rotating `✓ Saved` stamp upon DB write confirmation.
- [ ] **3.5 Offline Fallback Queue**: Implement IndexedDB local storage sync queue for offline usage.

---

## Phase 4: Reporting Suite, CSV/PDF Exports & Deployment

### Objectives
Build the Admin reporting matrix, CSV/Excel download engine, vector PDF print report generator, and deploy to Vercel/Netlify.

### Tasks
- [ ] **4.1 Reports Overview Matrix**: Build grid table rendering all assigned classes x subjects with completion pills (`X / Y filled`) and last activity timestamps.
- [ ] **4.2 CSV / Excel Export**: Integrate `SheetJS` to generate `.xlsx` file downloads for selected class mark registers.
- [ ] **4.3 PDF Print Engine**: Integrate `jsPDF` to render print-ready vector PDF report cards with school header and summary statistics.
- [ ] **4.4 Admin Settings Suite**: Build teacher assignment checkbox matrix allowing Admins to assign/revoke class + subject permissions per teacher.
- [ ] **4.5 Deployment Pipeline**: Deploy SPA to Vercel/Netlify with custom domain routing and SSL. Perform final end-to-end verification.

---

## Verification & Acceptance Checklist

| Requirement | Test Method | Acceptance Criteria |
| :--- | :--- | :--- |
| **Google Sign-In** | Login with `@school.edu` account. | Authenticates cleanly, resolves user profile, lands on scoped app. |
| **Teacher Scoping** | Login as Teacher A (assigned Std 5 English). | UI shows ONLY Std 5 English. No dropdowns or options exist for other classes. |
| **Flexible Max Marks** | Change subject max marks from 100 to 15. | Header updates, input validation scales to 15, PDF/CSV report reflects `/ 15`. |
| **PDF & CSV Download** | Click "Download CSV" & "Print PDF". | `.xlsx` downloads cleanly with all student marks; PDF opens print preview with clean headers. |
