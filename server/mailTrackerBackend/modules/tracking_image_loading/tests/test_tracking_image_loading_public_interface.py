import unittest

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventRecord,
    TrackingEventSummaryRequest,
    TrackingImageLoadRecordingRequest,
    TrackingTokenCreationRequest,
    TrackingTokenNotFoundError,
    TrackingTokenRecord,
)
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.tracking_image_loading_repository import (
    TrackingImageLoadingRepository,
)
from server.mailTrackerBackend.modules.tracking_image_loading.public_interface import (
    TrackingImageLoadingModule,
    TrackingImageLoadingModuleDependencies,
)
from server.mailTrackerBackend.modules.tracking_image_loading.security.tracking_signal_hasher import (
    TrackingSignalHasher,
)


class PredictableTrackingTokenGenerator:
    def generate_tracking_token(self) -> str:
        return "predictable-token"


class InMemoryTrackingImageLoadingRepository(TrackingImageLoadingRepository):
    def __init__(self):
        self.tracking_token_records_by_hash: dict[str, TrackingTokenRecord] = {}
        self.tracking_event_records: list[TrackingEventRecord] = []

    def save_tracking_token(self, tracking_token_record: TrackingTokenRecord) -> None:
        self.tracking_token_records_by_hash[tracking_token_record.tracking_token_hash] = tracking_token_record

    def find_tracking_token_by_hash(self, tracking_token_hash: str) -> TrackingTokenRecord | None:
        return self.tracking_token_records_by_hash.get(tracking_token_hash)

    def save_tracking_event(self, tracking_event_record: TrackingEventRecord) -> None:
        self.tracking_event_records.append(tracking_event_record)

    def count_tracking_events(self, tracking_token_hash: str) -> int:
        return sum(
            1
            for tracking_event_record in self.tracking_event_records
            if tracking_event_record.tracking_token_hash == tracking_token_hash
        )


class TrackingImageLoadingPublicInterfaceTest(unittest.TestCase):
    def setUp(self):
        self.tracking_image_loading_repository = InMemoryTrackingImageLoadingRepository()
        self.tracking_signal_hasher = TrackingSignalHasher("test-secret")
        self.tracking_image_loading_module = TrackingImageLoadingModule(TrackingImageLoadingModuleDependencies(
            tracking_base_url="https://track.example.test",
            tracking_token_generator=PredictableTrackingTokenGenerator(),
            tracking_signal_hasher=self.tracking_signal_hasher,
            tracking_image_loading_repository=self.tracking_image_loading_repository,
        ))

    def test_create_tracking_token_stores_hashed_token_and_returns_tracking_image_url(self):
        result = self.tracking_image_loading_module.create_tracking_token(TrackingTokenCreationRequest(
            recipientEmailAddress="recipient@example.com",
            emailSubject="Hello",
        ))

        expected_tracking_token_hash = self.tracking_signal_hasher.hash_tracking_token("predictable-token")
        stored_tracking_token_record = self.tracking_image_loading_repository.tracking_token_records_by_hash[
            expected_tracking_token_hash
        ]

        self.assertEqual(result.tracking_token, "predictable-token")
        self.assertEqual(result.tracking_image_url, "https://track.example.test/t/predictable-token/pixel.gif")
        self.assertEqual(stored_tracking_token_record.recipient_email_address, "recipient@example.com")
        self.assertEqual(stored_tracking_token_record.email_subject, "Hello")

    def test_record_tracking_image_loaded_hashes_external_signals_before_storage(self):
        self.tracking_image_loading_module.create_tracking_token(TrackingTokenCreationRequest(
            recipientEmailAddress="recipient@example.com",
            emailSubject="Hello",
        ))

        self.tracking_image_loading_module.record_tracking_image_loaded(TrackingImageLoadRecordingRequest(
            tracking_token="predictable-token",
            user_agent="Raw User Agent",
            network_address="203.0.113.10",
        ))

        stored_tracking_event_record = self.tracking_image_loading_repository.tracking_event_records[0]
        self.assertNotEqual(stored_tracking_event_record.user_agent_hash, "Raw User Agent")
        self.assertNotEqual(stored_tracking_event_record.network_address_hash, "203.0.113.10")

    def test_record_tracking_image_loaded_rejects_unknown_token(self):
        with self.assertRaises(TrackingTokenNotFoundError):
            self.tracking_image_loading_module.record_tracking_image_loaded(TrackingImageLoadRecordingRequest(
                tracking_token="missing-token",
                user_agent="Raw User Agent",
                network_address="203.0.113.10",
            ))

    def test_summarize_tracking_events_uses_open_detected_language_after_tracking_image_load(self):
        self.tracking_image_loading_module.create_tracking_token(TrackingTokenCreationRequest(
            recipientEmailAddress="recipient@example.com",
            emailSubject="Hello",
        ))
        self.tracking_image_loading_module.record_tracking_image_loaded(TrackingImageLoadRecordingRequest(
            tracking_token="predictable-token",
            user_agent="Raw User Agent",
            network_address="203.0.113.10",
        ))

        result = self.tracking_image_loading_module.summarize_tracking_events(TrackingEventSummaryRequest(
            tracking_token="predictable-token",
        ))

        self.assertTrue(result.is_open_detected)
        self.assertEqual(result.tracking_image_loaded_count, 1)

    def test_tracking_event_summary_preserves_extension_api_response_field_names(self):
        result = self.tracking_image_loading_module.summarize_tracking_events(TrackingEventSummaryRequest(
            tracking_token="predictable-token",
        ))

        self.assertEqual(result.model_dump(by_alias=True), {
            "trackingToken": "predictable-token",
            "openDetected": False,
            "trackingImageLoadedCount": 0,
        })


if __name__ == "__main__":
    unittest.main()
