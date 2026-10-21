# CampusSentry AI Admin Web Application

This is the current root Admin Web App. It integrates with the provided Express/MongoDB backend in `backend-source/backend`. The older `backend-source/frontend` and the separate Staff application are not used by this app.

## Run the applications

The frontend and backend start separately. The backend must connect to MongoDB before it begins listening.

1. Configure the backend environment in `backend-source/backend/.env`. `PORT` defaults to `5000`; `MONGO_URI` defaults to a local MongoDB URL; and `JWT_SECRET` currently falls back to the insecure development value `secretkey`. Set a strong private JWT secret and the intended database URL before use. `JWT_EXPIRES_IN` defaults to `7d`.
2. Install backend dependencies from `backend-source/backend`, then start the server with `node server.js`. That package does not define a start script.
3. The root frontend `.env` uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`, matching the backend's default port. This is a public API origin, not a secret. Change it to the backend origin when needed, then restart Next.js.
4. From the project root, install frontend dependencies and run `npm run dev`.

An administrator account is not included. Provision one through a trusted backend setup process before signing in. The frontend does not provide demo credentials or a registration screen.

## Integration architecture

`src/services/api-client.ts` centralizes the backend origin, JSON envelope handling, bearer authorization, timeout and error handling, and response shape checks. The backend response envelope is `{ success, statusCode, message, data }`; errors use `{ success: false, message, errors }`.

The backend returns bearer JWTs from login and does not set an HttpOnly cookie. The frontend stores the token in per-tab `sessionStorage`, attaches it as `Authorization: Bearer <token>`, verifies the current user through `/api/auth/me`, and accepts only the exact backend role `admin`. A `401` clears the session and returns to sign-in. Backend JWT verification and role middleware remain the access control; the frontend route check is only a user experience guard.

### Verified API-to-page mapping

| Admin area | Backend contract used |
| --- | --- |
| Login | `POST /api/auth/login` with `{ email, password }`; `GET /api/auth/me` with bearer token |
| Overview | `GET /api/admin/dashboard` and `GET /api/approvals/pending` |
| Visitor requests | `GET /api/approvals/pending`; `PATCH /api/approvals/:id/approve`; `PATCH /api/approvals/:id/reject` with `{ reason }` |
| Visitor records | `GET /api/visitors` with optional `status` and `search` query parameters; `POST /api/visitors` |
| Entry/exit | `GET /api/entries` with optional `status`; `POST /api/entries/check-in` and `/api/entries/check-out`, each with `{ visitorId }` |
| Recognition events | `GET /api/ai/recognition-events` |
| Analytics | `GET /api/admin/dashboard` only; displays the three supplied counts without fabricated trends |

The listed success responses are HTTP `200`, except visitor creation and entry check-in, which return `201`. Login, dashboard, approvals, visitor registration/list/detail, entry logs, check-out, and recognition reads are wrapped in `{ success, statusCode, message, data }`. Login `data` contains `{ user: { id, name, email, role }, token }`; `/api/auth/me` returns the user document (password excluded); visitor and approval data are Mongoose visitor documents; entry reads return log documents with selected visitor and check-in-user fields populated; recognition reads return event documents with candidate visitor fields populated. `/health` is unauthenticated and returns `{ status: "UP", timestamp }` without the standard envelope. Errors use `{ success: false, message, errors }` and the status chosen by the controller or error middleware.

Other verified but unused contracts: public `POST /api/auth/register` accepts `{ name, email, password, role }` and returns HTTP `201` with the same user/token shape as login; `POST /api/otp/send` accepts `{ phone }` and returns HTTP `200` with `{ phone, simulatedOtp }`; `POST /api/otp/verify` accepts `{ phone, otp }` and returns `{ verified: true }` on HTTP `200`; `POST /api/ai/recognition-events` accepts `{ externalEventId, matchScore, candidateVisitorId, metadata }` and returns HTTP `201` with the created event. The OTP response contains the simulated code and the controller logs it, so the Admin app does not present this as real verification. The recognition write route has no authentication middleware and is not called by the Admin app.

Authentication in the supplied routes is: dashboard and approval routes require a bearer token with role `admin`; visitor read/create routes require a valid bearer token but do not restrict the role; entry reads allow `admin`, `security`, or `staff`, while check-in/check-out allow `admin` or `security`; recognition reads allow `admin` or `security`; login is public. `GET /api/visitors/:id` returns one visitor with HTTP `200` when found. Approval/rejection updates return the updated visitor with HTTP `200`; missing visitor IDs return `404`. Check-in returns `201`, and rejects unapproved or already checked-in visitors with `400`; check-out returns `200` and reports a missing active log as `404`.

Visitor registration sends the schema fields required by `Visitor`: `name`, `phone`, `category`, `purpose`, `personToMeet`, and `department`. The backend supplies the initial status (`Pending Verification`). Approval and rejection pages refresh their queue after the backend confirms the decision. Rejection sends a reason. Entry check-in is available only for visitors whose API status is `Approved`; the backend independently validates approval and duplicate active check-ins.

The dashboard counts are exactly those calculated by `admin.controller.js`: visitors created since the server's local midnight, entry log documents with status `IN`, and visitor documents with status `Pending Approval`. The `activeOnCampus` value counts active log documents, not unique people.

### Areas without backend support

Notifications, identity registry/classification history, staff directory and role management, security alerts/device health, audit history, and browser-editable system settings have no matching backend API and show a clear not-connected state. Visitor editing and archiving are also unsupported. The backend recognition endpoint returns event records but does not expose a review or identity-verification action. OTP routes are not connected to the Admin app: the current backend sends no SMS and returns/logs a simulated OTP.

The backend contains no WebSocket, Socket.IO, or Server-Sent Events implementation. The frontend does not claim push updates or poll in the background. Users can refresh data manually; visitor approval actions refresh the affected queue after success.

## Backend prerequisites and security gaps

The supplied backend source was inspected at `server.js`, `src/app.js`, its route and controller files, models, auth/role middleware, database configuration, package manifest, and `.env.example`. No backend files were changed.

Before production use, the backend team should address these verified gaps:

- `POST /api/auth/register` is public and accepts a caller-supplied `role`, including `admin`. There is no safe administrator bootstrap path in the supplied code. Do not expose this endpoint as an admin signup flow; provision the initial administrator through a trusted process and restrict or redesign registration.
- `JWT_SECRET` falls back to `secretkey` in both token signing and verification. A strong private server-side secret must be configured. Do not put it in the frontend `.env`.
- User records have `isActive`, but login and bearer middleware do not enforce it. The frontend rejects a disabled user after `/api/auth/me`, but only the backend can prevent API access for that account.
- `/api/visitors` checks for a valid token but has no role authorization middleware. The frontend only exposes it after admin sign-in; the backend should enforce the intended roles because client-side guards are not security controls.
- Approval controllers update a matching visitor by ID without checking that its current status is `Pending Approval`. The Admin queue only offers actions for records returned by that pending endpoint, but the backend should enforce valid state transitions itself.
- `POST /api/ai/recognition-events` and both OTP routes have no authentication middleware. Recognition writes are not exposed by this Admin UI. OTP delivery is explicitly simulated in the supplied controller.
- `cors()` is configured without an origin allowlist. Restrict allowed origins for the deployment environment.

The root `.env` is ignored by Git. The root TypeScript and ESLint configurations exclude `backend-source/**` because those are separate applications with their own stacks; this prevents the root Admin checks from treating the older frontend and mobile app as part of this project.

## Verification

Run the root checks with `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build`. The backend package does not define a working test script. A successful frontend build does not verify MongoDB connectivity, a provisioned admin account, CORS behavior in deployment, or browser-to-backend end-to-end behavior.
