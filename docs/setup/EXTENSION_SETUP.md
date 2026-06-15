# Extension Setup

1. Run `pnpm build:extension`.
2. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3. Select `apps/extension/dist`.
4. Record the generated extension ID and configure the production allowed origin.
5. Rebuild and use the extension page's reload button after code changes.
6. Open Gmail and verify that the MailTracker sidebar mounts once.

The requested permissions are storage, alarms, and notifications. Host access is restricted to Gmail and `https://crm.d14.app/*`. Publishing to the Chrome Web Store is outside the MVP automation boundary.
