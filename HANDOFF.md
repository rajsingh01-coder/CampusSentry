# Integration handoff

## Completed in the root Admin Web App

- Replaced demo login and role selection with `POST /api/auth/login`, `GET /api/auth/me`, admin-role checks, bearer requests, session-scoped token storage, and `401` session clearing.
- Connected the overview to the backend dashboard counts and pending approvals.
- Connected request search, category filtering, CSV export, approval, and rejection to actual backend visitor documents. Decisions update the UI only after the server responds successfully.
- Connected visitor list and registration to the visitor endpoints. Removed edit/archive controls because no corresponding backend actions exist.
- Connected entry log reads and backend-validated check-in/check-out operations.
- Connected the read-only recognition event feed.
- Removed sample visitor, staff, alert, notification, recognition, audit, and registry data from the current app's runtime, along with demo simulation/reset controls.
- Replaced unsupported areas with explicit not-connected states. Analytics displays only the three backend-provided aggregate counts.
- Added API, empty, loading, retry, and error handling without mock fallbacks.
- Documented the verified contract and backend security prerequisites in `README.md`.

## Remaining backend and environment prerequisites

- MongoDB must be reachable from the backend, `JWT_SECRET` must be set to a strong server-side value, and a trusted administrator account must exist before real login can succeed.
- The supplied public registration route accepts `role: "admin"`; administrator provisioning is not safe until the backend closes or redesigns that path.
- The backend does not enforce `User.isActive`, restrict visitor routes by role, or restrict AI event writes and OTP routes by authentication. These are backend authorization gaps; no backend changes were made in this frontend integration.
- Approval controllers do not validate that a visitor is still pending before changing its status. The UI submits decisions only for records from the pending queue; the backend should enforce the same state rule.
- The backend has no push event protocol. The Admin app uses manual refresh and refreshes the affected queue after successful decisions.
- The configured root frontend URL is `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` in the ignored root `.env`. Replace it with the actual backend origin for another environment.

## Verification status

- `npx tsc --noEmit` — passed.
- `npm test` — passed, 9/9 tests, including API request/auth/empty-response tests. Node emitted its existing module-type detection warning for TypeScript test files.
- `npm run lint` — passed with no warnings.
- `npm run build` — passed and generated the app routes when rerun with permission to create generated build output. Normal workspace runs hit Windows `EPERM` while creating route folders under `.next`; no source change was needed to fix that environment restriction.
- Browser-to-backend and database tests — not run. This workspace has no backend `.env`, reachable MongoDB configuration, or provisioned administrator account, so real login and persisted workflows could not be exercised.
