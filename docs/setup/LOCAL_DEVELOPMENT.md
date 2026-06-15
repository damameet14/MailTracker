# Local Development

1. Install Node.js 22+ and pnpm 10.
2. Copy `.env.example` to `.env.local`; keep `GMAIL_PROVIDER=mock`.
3. Run `pnpm install`.
4. Start Firebase emulators from the repository root with `pnpm emulators`.
5. Run `pnpm dev`.
6. Build the extension with `pnpm build:extension` and load `apps/extension/dist` unpacked.

Validation commands are listed in the root README. No production credentials are required for local foundation work.

Run the unit suite with temporary Auth and Firestore emulators using:

```bash
pnpm test:emulators
```

## Cloud CLI login

Firebase CLI, Google Cloud CLI, and Vercel CLI require an account-owner browser consent step. Run this once from an interactive PowerShell terminal:

```powershell
.\scripts\login-cloud.ps1
```

The helper stores CLI state in ignored workspace-local directories.
