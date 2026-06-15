# Implementation Status

Last updated: June 15, 2026

## Phase 0 - Complete

- [x] Empty repository assessed
- [x] Monorepo structure and baseline configuration
- [x] Planning, agent, privacy, and setup documentation
- [x] Shared schemas/security utilities with unit tests
- [x] Next.js dashboard shell and health endpoint
- [x] Manifest V3 extension foundation
- [x] Firebase emulator rules/index configuration
- [x] Dependency installation and lockfile
- [x] Lint, typecheck, unit tests, web build, and extension build
- [x] Playwright dashboard smoke test
- [x] Dependency audit with no high or critical findings

## Implemented MVP core

- [x] Firebase Google sign-in to secure session-cookie flow
- [x] Owner restriction and server-side Firestore authorization
- [x] Contact, company, note, task, pipeline, and deal APIs
- [x] Contact duplicate reservation and CSV export
- [x] One-time extension pairing and hashed device tokens
- [x] Extension background-only authenticated API access
- [x] Gmail OAuth state/callback and AES-GCM refresh-token storage
- [x] Mock and real Gmail sending with sanitized MIME
- [x] Idempotent tracked-email sends and failed-send token revocation
- [x] Public tracking endpoint, classification, dedupe, counters, and first-open notifications
- [x] Extension alarm polling and browser notifications
- [x] Owner sign-in/settings UI and basic contact management UI

## Remaining product depth

- Advanced dashboard views, full Kanban UX, CSV import mapping, and richer record detail screens
- Broader integration/e2e test coverage against Firebase emulators
- Full OpenAPI coverage for every implemented endpoint
- Chrome Web Store packaging/publishing

## Manual setup outstanding

- Load the built unpacked extension from `apps/extension/dist` and pair it with the dashboard.
- Complete an authenticated Gmail OAuth connection from the production Settings page.
- Chrome Web Store publishing remains external and out of MVP scope.

## Credential tooling

- [x] Firebase CLI installed
- [x] Google Cloud CLI installed
- [x] Vercel CLI installed
- [x] Ignored local development environment generated with random encryption/HMAC secrets
- [x] Firebase Auth and Firestore emulator-backed tests passed
- [x] Account-owner browser login/consent (`scripts/login-cloud.ps1`)
- [x] Dedicated Google Cloud/Firebase project: `inbox-crm-530324` (display name: MailTracker)
- [x] Firebase web app registered
- [x] Production Firestore database created in `nam5`
- [x] Strict Firestore rules and indexes deployed
- [x] Firebase, Firestore, Identity Toolkit, Gmail, and IAM Credentials APIs enabled
- [x] Least-privileged server service account created
- [x] Dedicated Vercel project `mailtracker` linked and production deployment created
- [x] Production Firebase/server environment variables uploaded to Vercel
- [x] Public GitHub repository: `https://github.com/damameet14/MailTracker`
- [x] Vercel project connected to GitHub repository
- [x] GitHub Actions connected to Firebase using keyless workload identity
- [x] GitHub vulnerability alerts, automated security fixes, Dependabot, and CI enabled
- [x] Google sign-in provider and authorized production domains
- [x] Google OAuth consent screen and Gmail OAuth client credentials
- [ ] Vercel preview environment variables
- [ ] Billing-dependent Secret Manager setup
- [x] Name.com DNS A records for `crm` and `track`

## Production foundation

- Dashboard/API domain active: `https://crm.d14.app`
- Tracking domain active: `https://track.d14.app`
- Temporary stable Vercel URL: `https://inbox-crm-rosy.vercel.app`
- Live health endpoint: passed
- Live generic tracking-pixel endpoint: passed
- Gmail OAuth credentials are configured and the production Google provider is active
- Production Gmail provider is active and the latest deployment is aliased to `https://crm.d14.app`
- Name.com DNS records and Google console authentication/OAuth actions are complete

## Latest validation

- `pnpm lint`: passed
- `pnpm typecheck`: passed
- `pnpm test`: passed, 9 tests
- `pnpm test:e2e`: passed, 1 test
- `pnpm build`: passed for shared package, web, and extension
- `pnpm audit`: passed with no known advisories
