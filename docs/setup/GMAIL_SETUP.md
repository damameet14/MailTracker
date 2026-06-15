# Gmail API Setup

Manual owner actions:

1. Select the Google Cloud project associated with the application.
2. Enable the Gmail API.
3. Configure the OAuth consent screen for personal testing and add the owner as a test user.
4. Create a Web OAuth client.
5. Add the exact callback URL, for example `https://your-domain.example/api/integrations/gmail/callback`.
6. Store the client ID and secret as server-only variables.
7. Generate a 32-byte encryption key and store it as `GMAIL_TOKEN_ENCRYPTION_KEY`.
8. Connect Gmail from Settings after deployment.

The MVP requests only Gmail send scope. Unverified-app warnings may appear during private test-mode use. Revoke access from the Google Account security page when disconnecting permanently.
