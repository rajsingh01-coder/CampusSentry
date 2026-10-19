# CampusSentry Staff Mobile

React Native + Expo staff/security prototype, kept separate from the Admin Web app.

## Run

```sh
npm install
npm run start
```

Scan the Expo QR code with Expo Go, or press `a` to launch an Android emulator. To preview the cross-platform UI in a browser, run `npm run web`.

Run the supported project checks with:

```sh
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android
```

## Included flows

- Animated startup and staff sign-in screen.
- Home dashboard, request status list, visitor records, and profile.
- Visitor registration, camera permission/preview, manual verification, notifications, and an assistant UI.
- Light, dark, and system theme preference, saved locally.
- Sample visitor/request data and in-memory check-in/out remain in the demo data provider, but the login screen no longer offers a demo sign-in.
- Frontend navigation from assistant prompts to relevant app screens; the assistant itself remains disconnected.
- Admin-only approval/rejection controls in authenticated mode; the backend enforces permissions.

## Backend connection

The mobile app and admin web app remain separate applications. The mobile app connects to the Express backend in `..\backend`; it does not call the web app.

The app defaults to `http://127.0.0.1:5000` in web/iOS simulator and `http://10.0.2.2:5000` on Android emulators. For a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to the computer's reachable LAN IP in a local `.env` file in this folder, then restart Expo:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
```

Use an address reachable from the device running the app. `.env.example` is a non-secret template. Do not commit a local `.env`.

The backend uses `PORT` (default `5000`), `MONGO_URI` (default local MongoDB), `JWT_SECRET`, and `JWT_EXPIRES_IN`. From the backend folder, install dependencies with `npm install`, start MongoDB, and run `node server.js` before testing the mobile API.

### Mobile flows connected to backend routes

- Sign-in: `POST /api/auth/login`; the JWT is stored with Expo SecureStore on native devices. `GET /api/auth/me` validates a restored session. In web preview, the token is kept only in memory and does not survive a page reload.
- Visitor registration: `POST /api/visitors` with the backend-required name, phone, category, purpose, person-to-meet, and department fields.
- Visitor requests and records: `GET /api/visitors` and `GET /api/entries`; the dashboard, requests, records, detail and status-update screens use backend data after authenticated sign-in.
- Gate operations: `POST /api/entries/check-in` and `/api/entries/check-out`. The backend authorizes only `admin` and `security` roles; the mobile UI also disables these controls for other roles.
- Approvals: `PATCH /api/approvals/:id/approve` and `/reject`; controls are enabled only for an authenticated admin and a request in `Pending Approval`. The backend enforces the role too.
- The login screen only enters the authenticated area after the backend confirms sign-in. There is no local demo sign-in option.

### Not connected / backend gaps

- The backend OTP endpoints currently simulate delivery (including returning the OTP) and do not update a visitor's verification status. OTP controls therefore remain disabled; do not use this simulation for real identity verification.
- There is no push-notification route. The notifications screen derives updates from visitor records and does not receive push or real-time events.
- The backend AI recognition-event route accepts event metadata and a score, not an image or camera stream. No mobile-to-AI pipeline or fixed-camera integration is present in the repositories. The mobile camera is a manual preview/capture only; it never uploads an image, records an AI event, identifies a person, or grants access.
- Backend owner action before deployment: configure a strong `JWT_SECRET`; the current code falls back to a known development string. Also restrict public account registration from assigning privileged roles, and authenticate/authorize AI-event writes before exposing that route.
- The backend could not be runtime-verified in the current environment because MongoDB was not reachable at `127.0.0.1:27017`. TypeScript validation does not prove that a live API request succeeds.
- The admin web frontend is not available as a working directory in this workspace, so web compatibility was not verified. Existing tracked web files appear deleted in the repository status; they were left untouched.
