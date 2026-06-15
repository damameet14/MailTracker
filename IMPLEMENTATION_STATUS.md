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

## Later phases

- Phase 1 repository contracts and dashboard shell: started; authentication and CRUD persistence pending
- Phase 2 extension pairing/sidebar: pending
- Phase 3 Gmail OAuth/tracked sending: pending
- Phase 4 open detection persistence: pending
- Phase 5 product completion: pending
- Phase 6 hardening/release: pending

## Manual setup outstanding

All Firebase, Gmail/Google Cloud, Vercel, production-domain, and Chrome installation actions described in `docs/setup` remain external.

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
- [ ] Google sign-in provider and authorized production domains (Firebase Console)
- [ ] Google OAuth consent screen and Gmail OAuth client credentials (Google Cloud Console)
- [ ] Vercel preview environment variables
- [ ] Billing-dependent Secret Manager setup
- [ ] Name.com DNS A records for `crm` and `track`

## Production foundation

- Dashboard/API domain pending DNS: `https://crm.d14.app`
- Tracking domain pending DNS: `https://track.d14.app`
- Temporary stable Vercel URL: `https://inbox-crm-rosy.vercel.app`
- Live health endpoint: passed
- Live generic tracking-pixel endpoint: passed
- Gmail provider remains `mock` until OAuth credentials are configured
- Name.com DNS records and Google console authentication/OAuth actions remain documented manual steps

## Latest validation

- `pnpm lint`: passed
- `pnpm typecheck`: passed
- `pnpm test`: passed, 9 tests
- `pnpm test:e2e`: passed, 1 test
- `pnpm build`: passed for shared package, web, and extension
- `pnpm audit`: passed with no known advisories
