from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.client import Client
from server.mailTrackerBackend.configuration.ApplicationConfiguration import ApplicationConfiguration


class FirebaseApplicationFactory:
    def __init__(self, applicationConfiguration: ApplicationConfiguration):
        self.applicationConfiguration = applicationConfiguration

    def createFirestoreClient(self) -> Client:
        if not firebase_admin._apps:
            firebase_admin.initialize_app(
                self.createFirebaseCredential(),
                {"projectId": self.applicationConfiguration.firebaseProjectId},
            )
        return firestore.client()

    def createFirebaseCredential(self):
        if self.applicationConfiguration.firebaseClientEmail and self.applicationConfiguration.firebasePrivateKey:
            return credentials.Certificate({
                "type": "service_account",
                "project_id": self.applicationConfiguration.firebaseProjectId,
                "client_email": self.applicationConfiguration.firebaseClientEmail,
                "private_key": self.applicationConfiguration.firebasePrivateKey.replace("\\n", "\n"),
                "token_uri": "https://oauth2.googleapis.com/token",
            })
        localServiceAccountPath = Path("firebase-service-account.local.json")
        if localServiceAccountPath.exists():
            return credentials.Certificate(str(localServiceAccountPath))
        return credentials.ApplicationDefault()
