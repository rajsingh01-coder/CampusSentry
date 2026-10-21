# CampusSentry implementation audit

This file keeps the Phase 1 audit history from the earlier frontend-only prototype. Its descriptions of demo screens and behavior are historical. Phase 2 below documents the current root Admin Web App after backend integration.

Baseline: the supplied archive contained a clean Git worktree at commit `f547761`. The initial `npm ci` attempt failed with a Windows `EPERM` directory-creation error. To review without a network install, the dependency tree already included in the supplied archive was restored. The repository did not include an existing test script or ESLint flat config; both were added. The pre-change scripts were therefore not fully runnable in this environment.

## Phase 1 — Functional correctness

| Finding | Severity | Area | Status and evidence |
| --- | --- | --- | --- |
| Repeated or contradictory request decisions were accepted. | High | `src/store/demo-store.ts`, `src/lib/workflow.ts`, `src/app/visitor-requests/page.tsx` | Fixed: only Pending Approval and Additional Information Required can be reviewed. Terminal requests show no decision controls. Covered by transition tests. |
| Keep Pending changed only the request and could leave linked records inconsistent. | High | `src/store/demo-store.ts` | Fixed: request, visitor, and notification states now update together; a review-history item and audit item are recorded. |
| Request Info and rejection could proceed with fallback text or empty notes. | High | `src/app/visitor-requests/page.tsx`, `src/components/shared/confirm-dialog.tsx`, `src/store/demo-store.ts` | Fixed: required in-app input, store-level non-empty guards, and stale dialog input resets. |
| Guest OTP was marked verified without a verification action. | High | `src/store/demo-store.ts`, `src/mocks/demo-data.ts`, `src/app/visitor-requests/page.tsx` | Fixed: configured external guests start Pending Verification; the explicit demo action moves them to Pending Approval and writes review/audit history. No SMS delivery is claimed. OTP policy has regression tests. |
| Manual visitor creation could appear approved and OTP-verified. | High | `src/app/visitor-records/page.tsx`, `src/store/demo-store.ts` | Fixed: the form creates a linked simulated request; a direct service-created record is also forced into a pending state and cannot be checked in. |
| Identity relationships could be inferred from names, including duplicate display names. | High | `src/store/demo-store.ts`, `src/components/shared/simulation-modal.tsx`, `src/app/identity-registry/page.tsx`, `src/types/index.ts` | Fixed: only a unique active demo registry name match is linked, all later relationships use stable record IDs, and ambiguous names remain unlinked. Covered by a regression test. |
| Editing visitor display details left linked request and notification copies stale. | Medium | `src/store/demo-store.ts` | Fixed: linked display projections update by `visitorId`; event history retains its captured display name. |
| Dashboard and analytics date controls changed selection without filtering their data; hourly charts fabricated bins. | High | `src/lib/workflow.ts`, `src/app/page.tsx`, `src/app/analytics/page.tsx` | Fixed: local Today/Week/Month periods filter the request and visitor populations; hourly charts use timestamped gate events and show empty states. Date/bin logic has regression tests. |
| Entry/exit Today counts used all-time totals, and non-approved visitors could be checked in through store actions. | High | `src/app/entry-exit/page.tsx`, `src/app/visitor-records/page.tsx`, `src/store/demo-store.ts` | Fixed: Today uses local day boundaries; store requires an approved request, prevents duplicate entry and invalid exit, and allows a new entry after a recorded exit. |
| Registry-only reset invoked a full demo reset. | Medium | `src/store/demo-store.ts`, `src/app/identity-registry/page.tsx` | Fixed: registry restore resets only the canonical five and records an audit item; full reset remains separately confirmed. |
| Native prompt/confirm interactions and dialog state/focus behavior were inconsistent. | Medium | `src/components/shared/confirm-dialog.tsx`, `src/components/shared/simulation-modal.tsx`, reset controls | Fixed: important confirmations use in-app dialogs, required inputs reset on open, Escape closes, focus is restored, and focus is trapped in the two shared dialogs. |
| Login ignored credentials and role selection did not change the demo user. | Medium | `src/app/login/page.tsx`, `src/store/demo-store.ts` | Fixed: login explicitly identifies itself as demo access, selected role changes the client-side user, and the UI states that credentials are not validated. |
| Configured categories, authorities, OTP, walk-in priority, and Unknown review flags were partly inert. | Medium | `src/app/settings/page.tsx`, `src/components/shared/simulation-modal.tsx`, `src/store/demo-store.ts` | Fixed: forms consume configured categories/authorities; OTP gates review; walk-in setting controls priority; Unknown flag creates a neutral review alert. Inert sound/desktop settings were removed. Retention is labelled as a target, not automatic deletion. |
| Persisted UI state and malformed localStorage could produce invalid state or stale dialogs. | Medium | `src/store/demo-store.ts` | Fixed: only domain state is persisted; arrays, user, settings, and scalar values are validated and merged with safe defaults; transient modal/search state is not restored. |
| README/UI claimed live sync, immutable audit, or verified hardware state for a frontend demo. | Medium | `README.md`, dashboard, audit, notifications, security, entry/exit copy | Fixed: simulated, browser-local, and non-tamper-proof boundaries are stated accurately. |

### Phase 1 checks

- [x] `npx tsc --noEmit` — passed after the workflow and state changes.
- [x] `npm test` — 5 tests passed; Node prints a non-failing module-type detection warning for the TypeScript test file.
- [x] `npm run lint -- --quiet` — passed with no errors. The normal lint invocation reports pre-existing unused-import warnings across the imported prototype pages.
- [x] `npm run build` — passed; Next.js compiled and statically generated all 14 routes.
- [ ] Browser interaction sweep — could not run: the in-app browser timed out on both `localhost:3000` and `127.0.0.1:3000`, and the shell was denied local socket access by the environment; production build succeeded, but live UI verification remains unconfirmed.

## Phase 2 — UI and accessibility

- [x] Added shared light/dark semantic CSS tokens and Dark class overrides used across all routes.
- [x] Added persisted Light / Dark / System preference, system-change handling, and early theme initialization.
- [x] Added reduced-motion handling and visible focus styles.
- [x] Added a horizontal mobile navigation for small screens; desktop sidebar remains available at medium widths and above.
- [x] Added responsive notification popover sizing and an accessible notification link target.
- [x] Added `.21st/design.json`, `.21st/DESIGN.md`, and `project-theme.css` as local design context/theme preparation.
- [ ] `21st review` / component search — not run: the 21st CLI was not installed and the attempted `npx` invocation did not complete in the restricted network environment.
- [ ] Publish theme — prepared only. Publishing is public and requires an explicit approval step under the requested design-sync workflow.
- [ ] Browser verification of all routes, themes, responsive breakpoints, and keyboard paths — blocked by local socket restrictions in the environment; no visual behavior is claimed as browser-verified.

## Deliberate scope exclusions

- No production backend, database, identity provider, real OTP gateway, live AI/biometrics, cross-device notification bus, or gate hardware integration was added.
- The separate Staff/Security Mobile App and Phase 3 production integrations were not added.

## Phase 2 — Existing backend integration

| Finding | Status and evidence |
| --- | --- |
| Admin login used a demo role and ignored credentials. | Replaced with the backend's `POST /api/auth/login` and `GET /api/auth/me`; only the exact backend `admin` role is accepted. Bearer tokens are kept in tab-scoped `sessionStorage`; `401` clears the session. |
| Pending queue and visitor records showed browser-local seed data. | Removed demo store and mock data from the root Admin runtime. The request queue reads `/api/approvals/pending`; visitor records read `/api/visitors`; successful empty results remain empty. |
| Approval decisions were local-only. | Approve/reject use the backend's `PATCH /api/approvals/:id/approve` and `/reject`; the list changes only after the server returns the updated visitor. The rejection reason is sent in the request body. |
| Visitor creation and gate actions were simulated. | Visitor registration uses `POST /api/visitors`. Entry reads and actions use `/api/entries` and backend-validated check-in/check-out endpoints. |
| Dashboard, recognition, and unsupported operational screens claimed data unavailable from the API. | Dashboard and analytics use the three `/api/admin/dashboard` counts; recognition reads `/api/ai/recognition-events`. Unsupported sections now explain which API is missing. |
| Real-time status was described without a backend push protocol. | No WebSocket, Socket.IO, or SSE implementation exists. The UI uses manual refresh and refreshes the request queue after a decision; no polling or push claim is made. |
| Root checks included the separate frontend and Staff app. | Root `tsconfig.json` and `eslint.config.mjs` exclude `backend-source/**`. Those separate trees were not edited. |

### Phase 2 checks

- [x] `npx tsc --noEmit` — passed.
- [x] `npm test` — 9 tests passed, including API contract/auth/empty-list behavior. Node emits a non-failing module-type warning for the TypeScript tests.
- [x] `npm run lint` — passed with no warnings.
- [x] `npm run build` — passed when rerun with permission to create generated build output. Normal workspace runs hit Windows `EPERM` while creating route folders under `.next`; no source change was needed to fix that environment restriction.
- [ ] Browser/database end-to-end verification — not run; the backend has no local `.env`, MongoDB connection, or provisioned admin account in this workspace.

### Phase 2 backend prerequisites and limits

- A strong `JWT_SECRET`, reachable MongoDB, and an administrator created through a trusted setup process are required before real sign-in and persistence can be tested.
- The supplied backend's public `POST /api/auth/register` accepts a caller-supplied role, JWT middleware does not enforce `isActive`, `/api/visitors` lacks role authorization, and AI write/OTP routes are unauthenticated. These are documented backend security gaps; no backend file was modified.
- Approval controllers update any matching visitor ID without checking that its current status is pending; the backend should enforce that transition rule.
- Notifications, identity registry, staff directory, security alerts, audit history, and settings have no matching endpoint. The root Admin runtime now removes demo state and shows those sections as not connected.
