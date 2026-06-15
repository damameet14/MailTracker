# Google Authentication and Gmail OAuth Setup

These steps require account-owner interaction in Google consoles. The dedicated project is `inbox-crm-530324`.

## Firebase Google sign-in

1. Open `https://console.firebase.google.com/project/inbox-crm-530324/authentication/providers`.
2. Select **Get started** if Authentication has not been initialized.
3. Enable the **Google** provider.
4. Select `damameet14@gmail.com` as the support email.
5. Save.
6. Open Authentication **Settings** → **Authorized domains**.
7. Add:

```text
crm.d14.app
```

Keep `localhost` for local development. Do not add `track.d14.app`; it does not host authentication UI.

## OAuth consent screen

1. Open Google Cloud Console for project `inbox-crm-530324`.
2. Open **Google Auth Platform**.
3. Configure branding with application name **MailTracker**.
4. Use an owner-controlled support/developer email.
5. Choose the appropriate audience for personal use.
6. Add `damameet14@gmail.com` as a test user while the app remains in testing.
7. Add only the Gmail send scope required by the MVP:

```text
https://www.googleapis.com/auth/gmail.send
```

Do not request inbox-read, modify, or full Gmail access.

## Gmail OAuth client

1. Open Google Cloud Console → **Google Auth Platform** → **Clients**.
2. Select **Create client**.
3. Choose **Web application**.
4. Name it `MailTracker Gmail Send`.
5. Leave **Authorized JavaScript origins** empty. The Gmail connection uses a server-side redirect flow, not browser-side token handling.
6. Add this authorized redirect URI exactly:

```text
https://crm.d14.app/api/integrations/gmail/callback
```

7. Create the client.
8. Copy the client ID and client secret. Do not download or commit the client-secret JSON into this repository.
9. Add both values to Vercel Production as encrypted variables:

```powershell
vercel env add GOOGLE_GMAIL_CLIENT_ID production
vercel env add GOOGLE_GMAIL_CLIENT_SECRET production
```

10. Keep `GMAIL_PROVIDER=mock` until the Gmail OAuth callback, encrypted token persistence, and real Gmail send provider are implemented and tested.

Never commit the OAuth client secret or paste it into browser code.

## Consent-screen self-audit

Confirm these values in **Google Auth Platform**:

- App name: `MailTracker`
- User support email: an owner-controlled address
- Audience: External, unless the account belongs to a Google Workspace organization and Internal is intentional
- Publishing status: Testing is appropriate for personal development
- Test users: `damameet14@gmail.com`
- Authorized domain: `d14.app`
- Developer contact email: current owner-controlled address
- Requested Gmail scope: only `https://www.googleapis.com/auth/gmail.send`
- No Gmail read, modify, or full-mailbox scope

If the application remains in Testing, only listed test users can authorize it. Publishing broadly or removing unverified-app warnings may require Google verification.

## What happens after client creation

The application implementation must:

1. Redirect the signed-in owner to Google's authorization endpoint using:
   - the new client ID
   - scope `https://www.googleapis.com/auth/gmail.send`
   - `access_type=offline`
   - `include_granted_scopes=true`
   - a short-lived, signed or hashed `state` value
2. Receive the one-time authorization code at:

```text
https://crm.d14.app/api/integrations/gmail/callback
```

3. Verify `state` before exchanging the code.
4. Exchange the code server-side using the client secret.
5. Encrypt the returned refresh token using `GMAIL_TOKEN_ENCRYPTION_KEY`.
6. Store only the encrypted refresh token and safe integration metadata in Firestore.
7. Never return or log the refresh token, authorization code, or client secret.
8. Verify that the granted scopes include `gmail.send`.
9. Use the refresh token server-side to obtain access tokens and send mail through Gmail API.

Google returns a refresh token only when offline access is requested. A fresh refresh token may require `prompt=consent` if the account previously authorized the client without offline access.

## Verification after application implementation

1. Select **Connect Gmail** from MailTracker settings.
2. Confirm the Google consent page displays **MailTracker** and only permission to send email.
3. Complete consent using the configured test user.
4. Confirm the callback returns to `crm.d14.app` without an OAuth error.
5. Confirm no token appears in browser responses or logs.
6. Use the connection-test endpoint.
7. Send one mock message first, then one real tracked test message.
8. Revoke access from the Google Account third-party access page and confirm MailTracker reports the connection as expired/revoked.
