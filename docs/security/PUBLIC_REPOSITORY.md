# Public Repository Security

- No `.env.local` files or service-account keys may be committed.
- Public Firebase web configuration is acceptable in browser code; Firebase Admin credentials are not.
- Gmail OAuth client secrets, refresh tokens, extension tokens, and tracking tokens are server-only.
- Vercel production variables remain encrypted.
- Firestore direct client access is denied by default.
- Tracking endpoints disclose no token validity and never store raw IP addresses.
- Long-lived service-account keys should eventually be replaced with Vercel OIDC/workload identity federation.
- Rotate and revoke credentials immediately if secret scanning reports exposure.
