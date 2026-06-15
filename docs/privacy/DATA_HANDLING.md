# Data Handling

Inbox CRM stores owner-managed CRM records, sanitized message previews, Gmail message identifiers, derived tracking event classifications, timestamps, hashed network/user-agent fingerprints, and encrypted Gmail refresh tokens.

It does not store raw IP addresses, plaintext refresh tokens, plaintext extension or tracking tokens, BCC addresses in logs, or full email bodies by default. Privileged Firestore access is server-side only. Raw tracking events can be removed while retaining tracked-email summary counts.
