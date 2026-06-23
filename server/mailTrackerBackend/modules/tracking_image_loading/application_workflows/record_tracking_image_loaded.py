from datetime import datetime, timezone

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventRecord,
    TrackingImageLoadRecordingRequest,
    TrackingTokenNotFoundError,
)
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.tracking_image_loading_repository import (
    TrackingImageLoadingRepository,
)
from server.mailTrackerBackend.modules.tracking_image_loading.security.tracking_signal_hasher import (
    TrackingSignalHasher,
)


class TrackingImageLoadRecorder:
    def __init__(
        self,
        tracking_image_loading_repository: TrackingImageLoadingRepository,
        tracking_signal_hasher: TrackingSignalHasher,
    ):
        self.tracking_image_loading_repository = tracking_image_loading_repository
        self.tracking_signal_hasher = tracking_signal_hasher

    def record_tracking_image_loaded(
        self,
        tracking_image_load_recording_request: TrackingImageLoadRecordingRequest,
    ) -> None:
        tracking_token_hash = self.tracking_signal_hasher.hash_tracking_token(
            tracking_image_load_recording_request.tracking_token,
        )
        tracking_token_record = self.tracking_image_loading_repository.find_tracking_token_by_hash(
            tracking_token_hash,
        )

        if tracking_token_record is None:
            raise TrackingTokenNotFoundError("Tracking token was not found")

        self.tracking_image_loading_repository.save_tracking_event(TrackingEventRecord(
            tracking_token_hash=tracking_token_hash,
            user_agent_hash=self.tracking_signal_hasher.hash_tracking_signal(
                tracking_image_load_recording_request.user_agent,
            ),
            network_address_hash=self.tracking_signal_hasher.hash_tracking_signal(
                tracking_image_load_recording_request.network_address,
            ),
            loaded_at=datetime.now(timezone.utc),
        ))
