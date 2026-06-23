from google.cloud.firestore_v1 import Increment
from google.cloud.firestore_v1.client import Client

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventRecord,
    TrackingTokenRecord,
)
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.tracking_image_loading_repository import (
    TrackingImageLoadingRepository,
)


class FirestoreTrackingImageLoadingRepository(TrackingImageLoadingRepository):
    def __init__(self, firestore_client: Client):
        self.firestore_client = firestore_client

    def save_tracking_token(self, tracking_token_record: TrackingTokenRecord) -> None:
        self.firestore_client.collection("trackingTokens").document(
            tracking_token_record.tracking_token_hash,
        ).set({
            "recipientEmailAddress": tracking_token_record.recipient_email_address,
            "emailSubject": tracking_token_record.email_subject,
            "trackingImageUrl": tracking_token_record.tracking_image_url,
            "createdAt": tracking_token_record.created_at,
            "trackingImageLoadedCount": 0,
        })

    def find_tracking_token_by_hash(self, tracking_token_hash: str) -> TrackingTokenRecord | None:
        document_snapshot = self.firestore_client.collection("trackingTokens").document(tracking_token_hash).get()

        if not document_snapshot.exists:
            return None

        document_data = document_snapshot.to_dict() or {}
        return TrackingTokenRecord(
            tracking_token_hash=tracking_token_hash,
            recipient_email_address=str(document_data.get("recipientEmailAddress", "")),
            email_subject=str(document_data.get("emailSubject", "")),
            tracking_image_url=str(document_data.get("trackingImageUrl", "")),
            created_at=document_data.get("createdAt"),
        )

    def save_tracking_event(self, tracking_event_record: TrackingEventRecord) -> None:
        token_document_reference = self.firestore_client.collection("trackingTokens").document(
            tracking_event_record.tracking_token_hash,
        )
        event_document_reference = token_document_reference.collection("trackingImageLoadedEvents").document()
        event_document_reference.set({
            "userAgentHash": tracking_event_record.user_agent_hash,
            "networkAddressHash": tracking_event_record.network_address_hash,
            "loadedAt": tracking_event_record.loaded_at,
        })
        token_document_reference.update({"trackingImageLoadedCount": Increment(1)})

    def count_tracking_events(self, tracking_token_hash: str) -> int:
        document_snapshot = self.firestore_client.collection("trackingTokens").document(tracking_token_hash).get()

        if not document_snapshot.exists:
            return 0

        document_data = document_snapshot.to_dict() or {}
        return int(document_data.get("trackingImageLoadedCount", 0))
