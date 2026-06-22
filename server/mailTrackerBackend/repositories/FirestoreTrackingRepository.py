from google.cloud.firestore_v1 import Increment
from google.cloud.firestore_v1.client import Client
from server.mailTrackerBackend.models.TrackingEventRecord import TrackingEventRecord
from server.mailTrackerBackend.models.TrackingTokenRecord import TrackingTokenRecord
from server.mailTrackerBackend.repositories.TrackingRepository import TrackingRepository


class FirestoreTrackingRepository(TrackingRepository):
    def __init__(self, firestoreClient: Client):
        self.firestoreClient = firestoreClient

    def saveTrackingToken(self, trackingTokenRecord: TrackingTokenRecord) -> None:
        self.firestoreClient.collection("trackingTokens").document(
            trackingTokenRecord.trackingTokenHash,
        ).set({
            "recipientEmailAddress": trackingTokenRecord.recipientEmailAddress,
            "emailSubject": trackingTokenRecord.emailSubject,
            "trackingImageUrl": trackingTokenRecord.trackingImageUrl,
            "createdAt": trackingTokenRecord.createdAt,
            "trackingImageLoadedCount": 0,
        })

    def findTrackingTokenByHash(self, trackingTokenHash: str) -> TrackingTokenRecord | None:
        documentSnapshot = self.firestoreClient.collection("trackingTokens").document(trackingTokenHash).get()

        if not documentSnapshot.exists:
            return None

        documentData = documentSnapshot.to_dict() or {}
        return TrackingTokenRecord(
            trackingTokenHash=trackingTokenHash,
            recipientEmailAddress=str(documentData.get("recipientEmailAddress", "")),
            emailSubject=str(documentData.get("emailSubject", "")),
            trackingImageUrl=str(documentData.get("trackingImageUrl", "")),
            createdAt=documentData.get("createdAt"),
        )

    def saveTrackingEvent(self, trackingEventRecord: TrackingEventRecord) -> None:
        tokenDocumentReference = self.firestoreClient.collection("trackingTokens").document(
            trackingEventRecord.trackingTokenHash,
        )
        eventDocumentReference = tokenDocumentReference.collection("trackingImageLoadedEvents").document()
        eventDocumentReference.set({
            "userAgentHash": trackingEventRecord.userAgentHash,
            "networkAddressHash": trackingEventRecord.networkAddressHash,
            "loadedAt": trackingEventRecord.loadedAt,
        })
        tokenDocumentReference.update({"trackingImageLoadedCount": Increment(1)})

    def countTrackingEvents(self, trackingTokenHash: str) -> int:
        documentSnapshot = self.firestoreClient.collection("trackingTokens").document(trackingTokenHash).get()

        if not documentSnapshot.exists:
            return 0

        documentData = documentSnapshot.to_dict() or {}
        return int(documentData.get("trackingImageLoadedCount", 0))
