# CampusSentry design context

## Direction

Use an original, Apple-inspired enterprise style with restrained color, generous but useful whitespace, clear typography, compact tables, and small purposeful motion. Prioritize rapid scanning of request status and gate activity. Do not mimic Apple product screens.

## Foundations

- System font stack; no remote font dependency.
- 4px spacing rhythm; 14–18px card radii; 10–14px control radii.
- Semantic CSS variables in `src/app/globals.css` are the source of truth.
- Light, dark, and system preferences persist in browser storage.
- Keep responsive overflow handling and keyboard-visible focus.
- Statuses include text and color; unknown identity is not a threat label.
- All activity, audit, notification, OTP, and recognition integrations are simulated in this frontend.

## Implementation note

The 21st CLI was unavailable in the project dependency tree and could not be fetched in this network-restricted session. This file and `design.json` record the project context manually for later 21st CLI review or component search.
