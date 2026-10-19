# CampusSentry AI — Admin Web Application

Frontend-only campus visitor management prototype with a simulated meeting approval workflow and security monitoring views. It does not connect to live cameras, identity models, gates, SMS, or push notification services.

This repository contains the **Admin Web Application** for CampusSentry AI. Demo actions run in the browser through Zustand and localStorage. The separate Staff Mobile App and production backend are not included.

---

## 1. Project Workflow & Core Concept

1. **Visitor Arrival:** A visitor arrival is entered into the demo workflow.
2. **Staff Gate Capture:** The prototype simulates a security staff member recording visitor category, stated reason, meeting recipient, and timing.
3. **Admin Web Dispatch:** The demo action creates a linked request, visitor record, notification, and audit event in local state.
4. **Administrative Decision:** An administrator reviews the request (noting the critical distinction between *Who arrived*, *Identity classification*, and *Whom they want to meet*), approves/rejects with reasons, or requests more information.
5. **Gate Synchronization:** The request record changes locally. Production gate updates require a backend integration.

> **Crucial Workflow Distinction:** This is a **visitor-request and meeting-approval workflow**, not an administrator calendar or student meeting planner.

---

## 2. Technology Stack

- **Framework:** Next.js 15 (App Router, React 19)
- **Language:** TypeScript (Strict Mode)
- **Styling & Design System:** Tailwind CSS, shared semantic light/dark tokens, restrained blue accent, and calm campus-operations surfaces
- **State Management & Persistence:** Zustand with local client-side storage persistence & hydration safety
- **Icons:** Lucide React
- **Data Visualizations:** Recharts (responsive category, status, and turnstile activity charts)
- **Date Utilities:** date-fns
- **Appearance:** persisted Light / Dark / System theme preference using CSS variables

### Phase 2 visual refresh

The admin interface uses an original, Apple-inspired visual direction focused on clarity and operational scanning. The grouped desktop navigation, compact mobile navigation, shared page typography, consistent card and form surfaces, and chart tooltip colors apply across all 13 existing routes. Light, Dark, and System preferences remain global. Statuses retain text labels and their semantic cues; Unknown identity remains neutral. No workflow or backend behavior was removed to simplify the interface.

---

## 3. Directory Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Overview dashboard with period-filtered demo metrics
│   │   ├── layout.tsx                  # Root Next.js layout
│   │   ├── globals.css                 # Enterprise light theme & navy styling
│   │   ├── login/                      # Functional demo login portal
│   │   ├── notifications/              # Staff Notifications & meeting request alerts
│   │   ├── visitor-requests/           # Visitor Requests review queue & decision drawer
│   │   ├── visitor-records/            # Visitor Records repository with gate check-in/out
│   │   ├── identity-registry/          # Known Identity Registry (5 canonical seeded entries)
│   │   ├── staff/                      # Staff & security personnel management
│   │   ├── security/                   # Security incident monitoring & sensor nodes
│   │   ├── entry-exit/                 # Simulated entry/exit events and current presence
│   │   ├── analytics/                  # Reports & detailed charts
│   │   ├── recognition-events/         # AI sensor recognition events (simulated)
│   │   ├── audit-logs/                 # Client-side demo audit trail
│   │   └── settings/                   # System configuration & integration desk
│   ├── components/
│   │   ├── layout/                     # Sidebar, Header, AppLayout, theme preference
│   │   ├── shared/                     # KpiCard, BadgeStatus, ConfirmDialog, SimulationModal, DemoBanner
│   │   └── ui/                         # Reusable UI primitives
│   ├── lib/
│   │   └── utils.ts                    # cn helper, RFC 4180 CSV exporter, date formatters
│   │   └── workflow.ts                 # Request transition guards, date ranges, timestamp bins
│   ├── mocks/
│   │   └── demo-data.ts                # Initial seeded mock data & 5 canonical identity records
│   ├── services/
│   │   └── api-client.ts               # Typed service interfaces & backend integration contracts
│   ├── store/
│   │   └── demo-store.ts               # Centralized Zustand store with full synchronization
│   └── types/
│       └── index.ts                    # Strict TypeScript domain interfaces & enums
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 4. Key Data Model Distinctions

The application enforces clear domain boundaries:

| Concept | Definition | Permitted Values |
| :--- | :--- | :--- |
| **Visitor Category** | **WHO has arrived** at the campus gate | Student, Parent/Guardian, Guest/External Visitor, Teaching Staff, Non-Teaching Staff, Vendor, Other, Not specified |
| **Identity Classification** | **HOW the visitor's identity is classified** | Known, Unknown, Verification Required |
| **Person / Authority to Meet** | **WHOM the visitor seeks to meet** | Principal/Director, Dean/HOD, Administrator, Other Authority/Office |
| **Reason for Meeting** | **WHY the visitor wants a meeting** | Stated query, fee consultation, vendor delivery, etc. |
| **Visit Mode** | **WHEN the meeting is requested** | Walk-in (Immediate / Now) vs Scheduled (Date & Time) |

*Note: An **Unknown** classification does NOT mean the visitor is malicious, dangerous, or automatically denied access. An AI match never independently authorizes access.*

---

## 5. Seeded Known Identity Registry

As explicitly specified in the product specification, the Known Identity Registry is seeded with **exactly five canonical entries**:

1. **Keshav**
2. **Praveen**
3. **Raj**
4. **Aditi**
5. **Supriya**

No invented surnames, telephone numbers, student/employee IDs, or biometric files are fabricated. When an incoming request matches one of these names, it is tagged as a **&ldquo;Demo registry match&rdquo;** for administrative correlation.

**Reset Demo Data** restores the full seeded demo state. **Restore Registry Defaults** restores only these five identities.

---

## 6. How to Run & Test the Core Workflow

The Overview Dashboard and Analytics pages support Today, Week, Month, and a custom inclusive local date range. Their visitor/request metrics and gate-event charts use the selected range; current campus occupancy remains a separate current demo snapshot.

### Prerequisites
- Node.js >= 22.6 (the built-in test command uses Node TypeScript stripping; verified on v24.21.0)
- npm >= 9

### Installation & Run
```bash
# 1. Install dependencies
npm ci

# Run the configured checks
npm test
npm run lint
npx tsc --noEmit
npm run build

# Start the development server
npm run dev

# Start the production build
npm start
```

### Complete End-to-End Evaluation Journey:
1. Open the application at `http://localhost:3000` (or `/login`).
2. Observe the **Overview Dashboard** period-filtered request counts and current campus presence.
3. Click the top-banner button: **&ldquo;Simulate Incoming Staff Request&rdquo;**.
4. Test one of the quick presets (e.g. *Keshav - Seeded Known Guest*, *Nandini - Unknown Parent*, or *Raj - Seeded Known Vendor*), or enter custom fields.
5. Click **&ldquo;Dispatch Simulated Staff Request&rdquo;**. When guest OTP is required, the request remains in Pending Verification and does not claim delivery.
6. Observe:
   - The unread notification badge increments.
   - A new item appears in the Staff Notifications dropdown and page.
   - The pending review counter increments on the sidebar.
   - An audit trail item is appended.
7. Open **Visitor Requests** (or click the notification to navigate directly).
8. Inspect the visitor details in the review drawer.
9. For a guest, use **Simulate OTP Verification** to record the demo-only check, then Approve or Reject with a reason.
10. Verify that the request status, corresponding notification, visitor record, and overview KPIs reflect the local decision.
11. Navigate to **Visitor Records**:
    - Manually adjust an identity classification (Known, Unknown, Verification Required) with an in-app dialog.
    - Click **Record Gate Entry** or **Record Gate Exit** to update simulated campus presence. Check-in is only available for approved requests.
12. Click **Export CSV** on Visitor Requests, Records, or Audit Logs to verify RFC 4180 spreadsheet generation.
13. Click **Reset Demo Data** to confirm canonical state restoration.

Regression tests run with npm test and cover request transitions, identity links/resets, OTP success/failure, visitor state guards, occupancy events, role/settings behavior, notifications, service filters, and CSV quoting. The test command requires Node 22.6 or newer.

---

## 7. Backend Integration Architecture & Contract

The frontend encapsulates all data interactions behind clean typed contracts in `src/services/api-client.ts`:
- `IVisitorRequestService`: Fetching, approving, rejecting, and simulating requests.
- `IVisitorRecordService`: Gate check-in, check-out, record archiving, and manual additions.
- `IIdentityRegistryService`: Classification adjustments and history logging.
- `INotificationService`: Push notification ingestion and read receipts.
- `ISecurityMonitoringService`: Incident tracking and sensor health polling.

### Production Migration Roadmap:
To connect to the actual backend when available:
1. Provide `NEXT_PUBLIC_API_GATEWAY_URL` in `.env.local`.
2. Replace mock methods in `src/services/api-client.ts` with authenticated `fetch()` calls containing JWT bearer tokens.
3. Replace the local simulation modal trigger with a WebSocket (`wss://`) or Server-Sent Events (SSE) listener subscribing to `/api/events/staff-requests`.

---

## 8. Simulated vs Production Scope Clarifications

- **Simulated in this Prototype:** Staff request submissions, OTP verification, recognition scores, security alerts, and gate events. The prototype sends no SMS and has no live sensor or turnstile connection.
- **Audit Trail:** Stored in editable browser state; it is not immutable or tamper-proof.
- **Theme:** Light, Dark, and System appearance preferences apply globally and persist in localStorage.
- **Strictly Frontend-Only:** Client-side role switching is provided for demo evaluation and must not be treated as a security boundary.
- **Production Server Authority:** Production authorization, password hashing, tamper-evident audit storage, and biometric inference must reside on backend infrastructure.
