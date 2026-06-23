from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventSummaryRequest,
    TrackingEventSummaryResponse,
)
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.tracking_image_loading_repository import (
    TrackingImageLoadingRepository,
)
from server.mailTrackerBackend.modules.tracking_image_loading.security.tracking_signal_hasher import (
    TrackingSignalHasher,
)


class TrackingEventSummarizer:
    def __init__(
        self,
        tracking_image_loading_repository: TrackingImageLoadingRepository,
        tracking_signal_hasher: TrackingSignalHasher,
    ):
        self.tracking_image_loading_repository = tracking_image_loading_repository
        self.tracking_signal_hasher = tracking_signal_hasher

    def summarize_tracking_events(
        self,
        tracking_event_summary_request: TrackingEventSummaryRequest,
    ) -> TrackingEventSummaryResponse:
        tracking_token_hash = self.tracking_signal_hasher.hash_tracking_token(
            tracking_event_summary_request.tracking_token,
        )
        tracking_image_loaded_count = self.tracking_image_loading_repository.count_tracking_events(
            tracking_token_hash,
        )

        return TrackingEventSummaryResponse(
            tracking_token=tracking_event_summary_request.tracking_token,
            is_open_detected=tracking_image_loaded_count > 0,
            tracking_image_loaded_count=tracking_image_loaded_count,
        )
