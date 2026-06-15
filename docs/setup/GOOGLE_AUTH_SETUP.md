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

1. Create a **Web application** OAuth client named `MailTracker Gmail Send`.
2. Add this authorized redirect URI exactly:

```text
https://crm.d14.app/api/integrations/gmail/callback
```

3. Copy the client ID and client secret.
4. Add both values to Vercel Production as encrypted variables:

```powershell
vercel env add GOOGLE_GMAIL_CLIENT_ID production
vercel env add GOOGLE_GMAIL_CLIENT_SECRET production
```

5. Change `GMAIL_PROVIDER` from `mock` to the real provider only after the Gmail integration code is complete and tested.

Never commit the OAuth client secret or paste it into browser code.
