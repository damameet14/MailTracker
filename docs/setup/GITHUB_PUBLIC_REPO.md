# Public GitHub Repository Setup

The repository is designed to be public, but credentials must never be committed.

## Security preflight

Ignored local-only paths include:

```text
.env.local
apps/web/.env.local
firebase-service-account.local.json
.firebase-cli/
.gcloud/
.vercel-cli/
.vercel/
```

Before every public push, run:

```powershell
git status --short
rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!.env.local' -g '!apps/web/.env.local' -g '!firebase-service-account.local.json' "PRIVATE KEY|CLIENT_SECRET|TRACKING_HMAC_SECRET=.+"
pnpm audit
```

Review every staged file with `git diff --cached`.

## GitHub login and publication

Run once from an interactive terminal:

```powershell
gh auth login --web --git-protocol https
```

Then create and push the repository:

```powershell
gh repo create MailTracker --public --source . --remote origin --push
```

Enable GitHub secret scanning and push protection in repository security settings. Keep Dependabot alerts enabled.

## Vercel Git connection

The Vercel project is already created and linked locally. To connect GitHub deployments:

1. Open the Vercel project `mailtracker`.
2. Open **Settings** → **Git**.
3. Connect the public `MailTracker` GitHub repository.
4. Keep Production Branch set to `main`.
5. Confirm the project uses root directory `.` and `vercel.json`.

## Firebase Git relationship

Firebase does not need direct GitHub access for this architecture. Firestore rules and indexes are deployed using Firebase CLI. If GitHub Actions deployment is added later, use workload identity federation rather than committing or storing a long-lived service-account JSON key.
