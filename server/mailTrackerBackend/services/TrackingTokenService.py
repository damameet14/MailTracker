from datetime import datetime, timezone
from server.mailTrackerBackend.configuration.ApplicationConfiguration import ApplicationConfiguration
from server.mailTrackerBackend.models.TrackingTokenCreationRequest import TrackingTokenCreationRequest
from server.mailTrackerBackend.models.TrackingTokenCreationResponse import TrackingTokenCreationResponse
from server.mailTrackerBackend.models.TrackingTokenRecord import TrackingTokenRecord
from server.mailTrackerBackend.repositories.TrackingRepository import TrackingRepository
from server.mailTrackerBackend.security.TrackingSignalHasher import TrackingSignalHasher
from server.mailTrackerBackend.services.TrackingTokenGenerator import TrackingTokenGenerator


class TrackingTokenService:
    def __init__(
        self,
        applicationConfiguration: ApplicationConfiguration,
        trackingTokenGenerator: TrackingTokenGenerator,
        trackingRepository: TrackingRepository,
    ):
        self.applicationConfiguration = applicationConfiguration
        self.trackingTokenGenerator = trackingTokenGenerator
        self.trackingRepository = trackingRepository
        self.trackingSignalHasher = TrackingSignalHasher(applicationConfiguration.trackingHmacSecret)

    def createTrackingToken(
        self,
        trackingTokenCreationRequest: TrackingTokenCreationRequest,
    ) -> TrackingTokenCreationResponse:
        trackingToken = self.trackingTokenGenerator.generateTrackingToken()
        trackingTokenHash = self.trackingSignalHasher.hashTrackingToken(trackingToken)
        trackingImageUrl = f"{self.applicationConfiguration.trackingBaseUrl}/t/{trackingToken}/pixel.gif"

        self.trackingRepository.saveTrackingToken(TrackingTokenRecord(
            trackingTokenHash=trackingTokenHash,
            recipientEmailAddress=trackingTokenCreationRequest.recipientEmailAddress,
            emailSubject=trackingTokenCreationRequest.emailSubject,
            trackingImageUrl=trackingImageUrl,
            createdAt=datetime.now(timezone.utc),
        ))

        return TrackingTokenCreationResponse(
            trackingToken=trackingToken,
            trackingImageUrl=trackingImageUrl,
        )
