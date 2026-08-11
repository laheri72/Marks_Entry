# UI/UX Brief & Design System — The Register

**Project Name:** The Register — Formative Assessment Marking Platform  
**Document Version:** 1.0.0  
**Design Theme:** Tactile Paper Ledger meets Modern Glassmorphism  
**Target Visual Quality:** High-end, premium, wow-factor, warm academic aesthetic  

---

## 1. Design Philosophy & Core Aesthetics

**The Register** balances the warmth and familiarity of a physical academic ledger with the slick responsiveness of a state-of-the-art modern web application.

### Key Principles
1. **Paper-Like Tactility**: Soft cream/olive paper backgrounds (`#EEF3E8`), ruled notebook lines, rubber-stamp confirmation indicators.
2. **High-Density Legibility**: Typography optimized for multi-row data entry without clutter or eye fatigue.
3. **Zero-Friction Feedback**: Instant visual status updates (`✓ Saved` rubber stamp with micro-animation, active input highlight, error banners).
4. **Contextual Color Coding**: Subdued gold badges for regular teachers, crisp navy blue badges for school admins, status green for complete entries.

---

## 2. Design Tokens & Color Palette

### 2.1 Core Palette (CSS Variables)

```css
:root {
  /* Surface Colors */
  --paper: #EEF3E8;            /* Main background - warm light cream/olive */
  --paper-deep: #E4ECDC;       /* Sub-surface / table header background */
  --card: #FBFBF6;             /* Elevated card surface - soft off-white */
  --rule: #C6D3BC;             /* Ruled notebook line / subtle border */
  
  /* Ink & Typography Colors */
  --ink: #1E2A38;              /* Primary text - deep navy slate */
  --ink-soft: #55636F;         /* Secondary text - soft slate */
  --ink-faint: #8B978F;        /* Muted / roll number text */
  
  /* Status & Accent Colors */
  --red: #B4382C;              /* Primary input highlight & warnings */
  --red-soft: #D9BDB6;         /* Warning border */
  --gold: #A3812E;             /* Active tab & button accent */
  --gold-soft: #E9DCB8;        /* Badge background */
  --green-ok: #3F6B4A;         /* Save confirmation & completion green */
  --blue-admin: #3A5A78;       /* Admin role badge color */
  
  /* Shadows & Radius */
  --shadow: 0 1px 3px rgba(30,42,56,0.06), 0 8px 24px rgba(30,42,56,0.08);
  --radius: 12px;
  --radius-sm: 8px;
}
```

---

## 3. Typography Hierarchy

The UI pairs standard web fonts from Google Fonts for maximum legibility:

1. **Brand & Section Headers**: `Fraunces` (Serif, variable optical sizes). Gives the classic academic ledger feel.
2. **UI Controls & Body Text**: `IBM Plex Sans` (Sans-Serif). Clean, highly legible UI labels and button text.
3. **Marks Data & Roll Numbers**: `IBM Plex Mono` (Monospace). Ensures numerical alignment down columns.

| Element | Font Family | Size / Weight | Color |
| :--- | :--- | :--- | :--- |
| **App Title** | `Fraunces`, serif | 24px / 600 SemiBold | `--ink` |
| **Section Title** | `Fraunces`, serif | 15px / 600 SemiBold | `--ink-soft` |
| **Ledger Student Name** | `IBM Plex Sans`, sans-serif | 14.5px / 500 Medium | `--ink` |
| **Roll Number** | `IBM Plex Mono`, monospace | 13px / 500 Medium | `--ink-faint` |
| **Marks Input Field** | `IBM Plex Mono`, monospace | 16px / 600 SemiBold | `--red` (when filled) |
| **Badge Text** | `IBM Plex Sans`, sans-serif | 10px / 700 Uppercase | `--gold` / `--blue-admin` |

---

## 4. Key Component Designs & Micro-Interactions

### 4.1 Navigation Bar & Topbar
* **Brand Logo**: Circular badge with serif letter "R" inside dark navy background.
* **User Status Capsule**: Shows logged-in teacher's full name alongside an uppercase role pill (`TEACHER` or `ADMIN`).
* **Navigation Tabs**: Pill buttons (`Marks Entry`, `⚙ Settings`, `📋 Reports`) with subtle hover transition and active dark navy background state.

### 4.2 Class & Subject Scoped Picker
* **Class Selector Pills**: Flex wrapping tab buttons displaying Class names (e.g. `Class 5-A (Boys)`) with a mini capsule counter showing total roster size.
* **Subject Selector Pills**: Appears smoothly under Step 2 when a Class is selected. Displays subjects assigned to the logged-in teacher with Max Marks indicators.

### 4.3 High-Density Ledger Card
* **Header**: Displays Class Name, Subject Name, Student Count, and an inline editable **Max Marks** input (`Max marks: [ 100 ]`).
* **Ledger Grid Rows**: Alternating subtle background with ruled notebook lines (`repeating-linear-gradient`).
* **Columns**: `[ Roll # | Student Name | Marks Input / Max Marks ]`.
* **Input State Transitions**:
  * Default: Empty line `—`.
  * Focused: Gold halo focus ring (`box-shadow: 0 0 0 3px rgba(163,129,46,0.15)`), red baseline indicator.
  * Saved/Filled: Green bottom border (`--green-ok`), text turns crisp.

### 4.4 Tactile Save Confirmation Stamp

```css
.stamp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--green-ok);
  font-weight: 700;
  font-size: 12.5px;
  letter-spacing: .04em;
  text-transform: uppercase;
  border: 2px solid var(--green-ok);
  border-radius: 6px;
  padding: 4px 10px;
  transform: rotate(-3deg);
  animation: stampin .25s ease;
}

@keyframes stampin {
  0% { transform: rotate(-3deg) scale(1.4); opacity: 0; }
  100% { transform: rotate(-3deg) scale(1); opacity: 1; }
}
```

---

## 5. Report Preview & Download Drawer UI

* **Overview Progress Matrix**: Displays a grid of assigned classes x subjects with completion badges:
  * `18 / 18` Complete (Green background `#DCEADD`)
  * `0 / 20` Empty (Light grey background `#F0ECE3`)
* **Download Drawer**: Provides two prominent primary action buttons:
  1. `📥 Download Excel / CSV` (Green accent button)
  2. `🖨️ Print / Save as PDF` (Navy primary button)
