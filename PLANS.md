# Inbox CRM Implementation Plan

## Repository assessment

The repository was empty and was not initialized as Git on June 15, 2026. The implementation therefore starts as a pnpm workspace monorepo.

## Architectural choices

- Next.js 16 App Router hosts the dashboard and Vercel-compatible route handlers.
- The Chrome extension is a Vite/React Manifest V3 application.
- `packages/shared` owns schemas, security primitives, provider contracts, and pure domain logic.
- Firestore is accessed through server-side repositories; strict rules deny direct client access.
- Local development defaults to mock Gmail and emulator-backed persistence.

## Phases

### Phase 0: Foundation

- Scaffold web, extension, shared package, Firebase emulator configuration, linting, formatting, tests, and setup docs.
- Add environment validation, health endpoint, security headers, mock Gmail provider contract, and extension build.
- Validate install, lint, typecheck, tests, and production builds.

### Phase 1: Authentication and CRM foundation

- Add Firebase ID-token to session-cookie flow, owner restriction, origin/CSRF validation, and server authorization.
- Implement repository-backed contacts, companies, notes, tasks, pipelines, deals, and activities.
- Build dashboard navigation and core CRUD screens against emulator-compatible APIs.

### Phase 2: Extension foundation

- Implement pairing codes/devices, background-only bearer token use, typed messages, popup, Gmail adapter, Shadow DOM sidebar, contextual contact lookup, and diagnostics.

### Phase 3: Gmail OAuth and tracked sending

- Implement signed OAuth state, encrypted refresh tokens, Google and mock send providers, sanitized MIME composition, idempotent send transactions, and tracked composer.

### Phase 4: Open detection

- Implement hashed tracking-token lookup, fast generic pixel response, classification, deduplication, transactional counters, rate limits, event/activity/notification records, and tests.

### Phase 5: Product completion

- Add polling notifications, tracked-email views, search, CSV import/export, settings, device revocation, and retention cleanup.

### Phase 6: Hardening

- Complete OpenAPI, integration/e2e coverage, security/accessibility/performance reviews, deployment docs, audits, and final self-review.

## Architectural risks

- Gmail markup is unstable; adapter fixtures and isolated selectors reduce blast radius.
- Image proxies/scanners distort detection; raw/classified/counted semantics remain separate.
- Serverless tracking writes can contend; transactions, dedupe buckets, and write suppression are required.
- OAuth/session/token handling has high security impact; secrets remain server-only and encrypted/hashed.
- Firestore uniqueness is not native; normalized-email reservation or transaction logic is required.

## Manual external boundaries

The owner must create/configure Google Cloud OAuth, Gmail API, Firebase project/Auth/Firestore/service account, Vercel project/environment variables/domain, and manually install or publish the extension. Exact instructions live under `docs/setup`.
