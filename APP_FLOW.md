# App Flow & User Journeys — The Register

**Project Name:** The Register — Formative Assessment Marking Platform  
**Document Version:** 1.0.0  
**Focus:** User Navigation Architecture, Interaction Flows, State Machines & Screen Maps  

---

## 1. High-Level Site Map & Navigation Hierarchy

```
/
├── /login                            [Google Sign-In Authentication]
├── /pending                          [Account Pending Admin Approval]
├── /app (Authenticated Root)
│   ├── /app/entry                    [Teacher & Admin: Scoped Marks Entry Ledger]
│   │   ├── Step 1: Select Assigned Class (Filtered)
│   │   ├── Step 2: Select Assigned Subject (Filtered)
│   │   └── Step 3: Enter Marks Roster (Keyboard Navigation)
│   ├── /app/reports                  [Admin & Authorized Teacher: Class & Student Reports]
│   │   ├── Overview Progress Grid
│   │   ├── Class & Subject Drilldown Ledger
│   │   └── Export Actions (Download CSV / Print & Save PDF)
│   └── /app/settings                 [Admin Only: Roster & Permission Controls]
│       ├── Class & Subject Master List
│       ├── Bulk Roster Import (Paste Roll, Name)
│       └── Teacher Assignment Permission Matrix
```

---

## 2. Comprehensive User Journeys

### 2.1 Journey 1: Teacher Login & Zero-Noise Class Scoping

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant Browser
    participant Auth as Supabase Auth (Google)
    participant BaaS as PostgreSQL (BaaS)

    Teacher->>Browser: Open Application Link
    Browser->>Teacher: Render Login Screen ("Continue with Google")
    Teacher->>Browser: Click "Continue with Google"
    Browser->>Auth: Redirect to Google OAuth Flow
    Auth-->>Browser: Return OAuth Token & Email (e.g. teacher@school.edu)
    Browser->>BaaS: Fetch Profile & Permissions (auth.uid())
    BaaS-->>Browser: Return { role: "teacher", assignments: ["5-A (Boys)|English", "7-A (Girls)|English"] }
    Browser->>Teacher: Render Scoped Entry Screen
    Note over Teacher,Browser: UI displays ONLY Class 5-A (Boys) & Class 7-A (Girls).<br/>Non-assigned classes & subjects are NOT rendered.
```

---

### 2.2 Journey 2: Frictionless Marks Entry & Keyboard Velocity Loop

```mermaid
sequenceDiagram
    autonumber
    actor Teacher
    participant RosterUI as Roster Ledger DOM
    participant AppState as Client React State
    participant BaaS as Database (BaaS)

    Teacher->>RosterUI: Click "Class 5-A (Boys)" -> Click "English"
    RosterUI-->>Teacher: Render Roster (20 Students). Focus on Student #1 Input.
    Teacher->>RosterUI: Type "18.5" and Press "Enter"
    RosterUI->>AppState: Update local student entry mark
    AppState->>RosterUI: Move focus to Student #2 Input
    AppState->>BaaS: Trigger Debounced Atomic UPSERT (Student #1, Mark: 18.5)
    BaaS-->>AppState: Confirm DB Write Success
    AppState->>RosterUI: Trigger Tactile Stamp "✓ Saved" Animation
```

---

### 2.3 Journey 3: Admin Managing Teacher Subject Assignments

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant SettingsUI as Admin Settings Tab
    participant BaaS as Database (BaaS)

    Admin->>SettingsUI: Open Settings -> Navigate to "Teachers & Permissions"
    SettingsUI->>BaaS: Query Teachers List & Current Permissions
    BaaS-->>SettingsUI: Return Teachers Roster & Permission Matrix
    Admin->>SettingsUI: Select Teacher "Priya Sharma"
    Admin->>SettingsUI: Toggle Checkbox [x] Class 3-A (Boys) - Mathematics
    SettingsUI->>BaaS: INSERT INTO teacher_permissions (teacher_id, class_id, subject_id)
    BaaS-->>SettingsUI: Confirm Authorization Saved
    SettingsUI-->>Admin: Show Success Toast ("Permissions Updated")
```

---

### 2.4 Journey 4: Class & Student Report Generation & Download (PDF/CSV)

```mermaid
sequenceDiagram
    autonumber
    actor User as Admin / Authorized Teacher
    participant ReportsUI as Reports Screen
    participant ExportEngine as Client Export Engine (jsPDF/SheetJS)

    User->>ReportsUI: Click Reports Tab -> Select Class "7-A (Girls)"
    ReportsUI->>ReportsUI: Render Live Completion Summary (18/18 Marks Filled)
    User->>ReportsUI: Click "Download CSV" OR "Print / Save PDF"
    alt Choice: Download CSV
        ReportsUI->>ExportEngine: Format JSON to SheetJS Worksheet
        ExportEngine-->>User: Trigger Browser File Download ("Class_7-A_Girls_English.xlsx")
    else Choice: Print / Save PDF
        ReportsUI->>ExportEngine: Build jsPDF Document Layout (School Header + Table)
        ExportEngine-->>User: Open Browser PDF Print Preview Dialog
    end
```

---

## 3. Application State Machine Definitions

```mermaid
stateDiagram-v2
    [*] --> Loading: App Launch
    Loading --> LoginScreen: Unauthenticated
    Loading --> ScopedApp: Authenticated & Approved
    Loading --> PendingScreen: Authenticated but Unapproved
    
    LoginScreen --> ScopedApp: Successful Google Sign-In
    
    state ScopedApp {
        [*] --> EntryView
        EntryView --> ClassSelected: Click Class Tab
        ClassSelected --> SubjectSelected: Click Subject Tab
        SubjectSelected --> MarksEditing: Type Mark
        MarksEditing --> SavingState: Debounce / Press Enter
        SavingState --> SavedState: API Success (Show 'Saved' Stamp)
        SavingState --> OfflineQueueState: Network Failure (Show 'Offline' Badge)
        
        EntryView --> SettingsView: Click ⚙ Settings (Admin Only)
        EntryView --> ReportsView: Click 📋 Reports (Admin Only)
    }

    ScopedApp --> LoginScreen: Click Log Out
```
