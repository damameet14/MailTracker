# MailTracker

MailTracker is a private Gmail CRM with honest tracking-image load detection.

Production architecture:

- Dashboard and APIs: `https://crm.d14.app`
- Public tracking pixels: `https://track.d14.app/t/<token>/pixel.gif`
- Firebase: authentication and Firestore infrastructure only
- Vercel: hosts both production subdomains
- Chrome extension: communicates only with `https://crm.d14.app`

## Quick start

```bash
pnpm install
pnpm dev
```

Local development uses `GMAIL_PROVIDER=mock` and Firebase emulators. Copy `.env.example` to `.env.local` and follow [local setup](docs/setup/LOCAL_DEVELOPMENT.md).

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm build:extension
```

Open detection is evidence that a tracking image URL was requested, not proof that a person read an email.
