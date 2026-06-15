# Firebase Setup

Manual owner actions:

1. Create or select a Firebase project.
2. Register a web app and copy its public client configuration into the `NEXT_PUBLIC_FIREBASE_*` variables.
3. Enable Google as a Firebase Authentication provider.
4. Create Firestore, select the desired region, and do not enable permissive production rules.
5. Create a service account and place its project ID, client email, and private key in server-only environment variables.
6. Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes --config firebase/firebase.json
```

Verify that direct client reads are denied and server-side Admin SDK access succeeds. Never commit service-account JSON.
