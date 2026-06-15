# Vercel Setup

Manual owner actions:

1. Import the Git repository into Vercel.
2. Keep the repository root as the project root and use `pnpm --filter @mailtracker/web build`.
3. Add all production environment variables from `.env.example`; never expose server-only values with a `NEXT_PUBLIC_` prefix.
4. Set `NEXT_PUBLIC_APP_URL=https://crm.d14.app`, `TRACKING_BASE_URL=https://track.d14.app`, and the Gmail redirect URI to `https://crm.d14.app/api/integrations/gmail/callback`.
5. Configure preview and production values separately.
6. Deploy, inspect Function logs, and verify `https://crm.d14.app/api/health` plus `https://track.d14.app/t/test/pixel.gif`.
7. Configure both custom domains using `DOMAIN_SETUP.md`.
