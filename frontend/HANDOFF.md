# Handoff notes

## Scope and architecture

- This is the existing Next.js App Router / React / TypeScript admin demo. No backend, mobile app, real OTP, push service, AI model, or hardware integration was added.
- `src/lib/workflow.ts` contains request transition rules, custom local date ranges, and timestamp event bins.
- `src/store/demo-store.ts` owns browser-local data and guarded demo actions; `src/services/api-client.ts` provides the typed adapters and filters.
- Request, visitor, identity and staff workflows remain in their existing route files. `src/lib/use-accessible-dialog.ts` provides keyboard behavior for route-specific edit dialogs.
- Phase 2 refreshes the shared shell, grouped navigation, all route surfaces, form/table treatment, status badges and chart styling. It preserves the Phase 1 workflow contracts and data calculations.
- `AUDIT_CHECKLIST.md` records the Phase 1 bug audit, Phase 2 changes, checks and environment limits.

## Verification snapshot — 2026-10-16

- Node v24.21.0, npm 11.19.0. Installed dependencies remained within their existing ranges (Next 15.5.28, React 19.3.1, Zustand 5.0.15, Recharts 2.15.4); no dependency upgrades were made.
- `npx tsc --noEmit` — passed.
- `npm test` — 18/18 passed. Node emitted non-failing module-type detection warnings.
- `npm run lint` — 0 errors, 100 warnings. Warnings are inherited unused imports across prototype routes plus the ESLint config export warning; the login refresh removed three prior unused imports.
- Production build — passed with all 13 app routes generated using an isolated temporary build output directory. The default `.next` attempt first hit Windows EPERM, then stale/missing route-manifest errors. The successful isolated build's temporary config was restored, and the build-generated tsconfig path was removed.
- Browser visual and interaction checks — not performed. Playwright is not installed/cached and local preview access failed in this environment. There is no evidence to claim route-by-route theme, breakpoint, keyboard, console, or overflow verification.
- 21st CLI review/component search — unavailable in the current restricted environment; the CLI is not installed and the earlier package invocation could not complete.

## Remaining limits and publication

- The application is visually refreshed in source, but browser-rendered visual QA remains outstanding because local preview access is unavailable.
- `project-theme.css` is prepared locally and is not published. The 21st design-sync skill publishes themes publicly and requires explicit approval before that step.
- No production backend, database, identity provider, real OTP gateway, live AI/biometrics, cross-device notification bus, or gate hardware integration was added. The separate Staff/Security Mobile App and Phase 3 integrations remain out of scope.
