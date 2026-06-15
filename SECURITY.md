# Security Policy

Do not open public issues containing credentials, tokens, recipient data, or tracking URLs.

For a suspected credential exposure, immediately revoke or rotate the affected credential before investigating further. The repository intentionally excludes `.env.local`, Firebase service-account keys, CLI state, Gmail OAuth secrets, and Vercel project metadata.

MailTracker open detection records tracking-image requests. It must never be described as proof that a recipient read an email.
