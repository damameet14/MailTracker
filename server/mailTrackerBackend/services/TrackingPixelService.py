from datetime import datetime, timezone
from fastapi import HTTPException, Request
from server.mailTrackerBackend.models.TrackingEventRecord import TrackingEventRecord
from server.mailTrackerBackend.models.TrackingEventSummaryResponse import TrackingEventSummaryResponse
from server.mailTrackerBackend.repositories.TrackingRepository import TrackingRepository
from server.mailTrackerBackend.security.TrackingSignalHasher import TrackingSignalHasher


class TrackingPixelService:
    def __init__(
        self,
        trackingRepository: TrackingRepository,
        trackingSignalHasher: TrackingSignalHasher,
    ):
        self.trackingRepository = trackingRepository
        self.trackingSignalHasher = trackingSignalHasher

    def recordTrackingImageLoaded(self, trackingToken: str, request: Request) -> None:
        trackingTokenHash = self.trackingSignalHasher.hashTrackingToken(trackingToken)
        trackingTokenRecord = self.trackingRepository.findTrackingTokenByHash(trackingTokenHash)

        if trackingTokenRecord is None:
            raise HTTPException(status_code=404, detail="Tracking token was not found")

        userAgent = request.headers.get("user-agent", "unknown")
        networkAddress = request.client.host if request.client else "unknown"

        self.trackingRepository.saveTrackingEvent(TrackingEventRecord(
            trackingTokenHash=trackingTokenHash,
            userAgentHash=self.trackingSignalHasher.hashTrackingSignal(userAgent),
            networkAddressHash=self.trackingSignalHasher.hashTrackingSignal(networkAddress),
            loadedAt=datetime.now(timezone.utc),
        ))

    def summarizeTrackingEvents(self, trackingToken: str) -> TrackingEventSummaryResponse:
        trackingTokenHash = self.trackingSignalHasher.hashTrackingToken(trackingToken)
        trackingImageLoadedCount = self.trackingRepository.countTrackingEvents(trackingTokenHash)

        return TrackingEventSummaryResponse(
            trackingToken=trackingToken,
            openDetected=trackingImageLoadedCount > 0,
            trackingImageLoadedCount=trackingImageLoadedCount,
        )
