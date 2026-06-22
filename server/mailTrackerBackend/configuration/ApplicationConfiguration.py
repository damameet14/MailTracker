import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ApplicationConfiguration:
    trackingBaseUrl: str
    trackingHmacSecret: str
    firebaseProjectId: str
    firebaseClientEmail: str | None
    firebasePrivateKey: str | None

    @classmethod
    def fromEnvironment(cls) -> "ApplicationConfiguration":
        return cls(
            trackingBaseUrl=os.environ.get("TRACKING_BASE_URL", "https://track.d14.app"),
            trackingHmacSecret=os.environ.get("TRACKING_HMAC_SECRET", "development-secret-change-before-production"),
            firebaseProjectId=os.environ.get("FIREBASE_PROJECT_ID", "demo-inbox-crm"),
            firebaseClientEmail=os.environ.get("FIREBASE_CLIENT_EMAIL"),
            firebasePrivateKey=os.environ.get("FIREBASE_PRIVATE_KEY"),
        )
