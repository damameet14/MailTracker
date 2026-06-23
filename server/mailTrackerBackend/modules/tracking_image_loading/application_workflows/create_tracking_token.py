from datetime import datetime, timezone

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingTokenCreationRequest,
    TrackingTokenCreationResponse,
    TrackingTokenRecord,
)
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.tracking_image_loading_repository import (
    TrackingImageLoadingRepository,
)
from server.mailTrackerBackend.modules.tracking_image_loading.security.tracking_signal_hasher import (
    TrackingSignalHasher,
)
from server.mailTrackerBackend.modules.tracking_image_loading.token_generation.tracking_token_generator import (
    TrackingTokenGenerator,
)


class TrackingTokenCreator:
    def __init__(
        self,
        tracking_base_url: str,
        tracking_token_generator: TrackingTokenGenerator,
        tracking_signal_hasher: TrackingSignalHasher,
        tracking_image_loading_repository: TrackingImageLoadingRepository,
    ):
        self.tracking_base_url = tracking_base_url
        self.tracking_token_generator = tracking_token_generator
        self.tracking_signal_hasher = tracking_signal_hasher
        self.tracking_image_loading_repository = tracking_image_loading_repository

    def create_tracking_token(
        self,
        tracking_token_creation_request: TrackingTokenCreationRequest,
    ) -> TrackingTokenCreationResponse:
        tracking_token = self.tracking_token_generator.generate_tracking_token()
        tracking_token_hash = self.tracking_signal_hasher.hash_tracking_token(tracking_token)
        tracking_image_url = f"{self.tracking_base_url}/t/{tracking_token}/pixel.gif"

        self.tracking_image_loading_repository.save_tracking_token(TrackingTokenRecord(
            tracking_token_hash=tracking_token_hash,
            recipient_email_address=tracking_token_creation_request.recipient_email_address,
            email_subject=tracking_token_creation_request.email_subject,
            tracking_image_url=tracking_image_url,
            created_at=datetime.now(timezone.utc),
        ))

        return TrackingTokenCreationResponse(
            tracking_token=tracking_token,
            tracking_image_url=tracking_image_url,
        )
