# Inbox CRM Agent Guide

## Product language

- Say "Open detected" or "tracking image loaded"; never claim an email was read.
- Treat this as a private single-owner product while retaining owner UID boundaries.

## Security invariants

- Never expose Gmail refresh tokens, extension tokens, tracking tokens, Firebase Admin credentials, raw IP addresses, or full email bodies.
- All privileged Firestore access is server-side. Direct client Firestore access remains denied.
- Validate every external input with shared Zod schemas.
- Keep Gmail DOM selectors and parsing inside `apps/extension/src/gmail`.
- Keep external providers behind interfaces and provide mocks for local tests.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm build:extension` before marking a phase complete.
