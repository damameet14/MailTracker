from fastapi import APIRouter
from server.mailTrackerBackend.models.TrackingTokenCreationRequest import TrackingTokenCreationRequest
from server.mailTrackerBackend.models.TrackingTokenCreationResponse import TrackingTokenCreationResponse
from server.mailTrackerBackend.services.TrackingTokenService import TrackingTokenService


class TrackingTokenController:
    def __init__(self, trackingTokenService: TrackingTokenService):
        self.trackingTokenService = trackingTokenService
        self.router = APIRouter()
        self.router.add_api_route(
            "/api/trackingTokens",
            self.createTrackingToken,
            methods=["POST"],
            response_model=TrackingTokenCreationResponse,
        )

    def createTrackingToken(
        self,
        trackingTokenCreationRequest: TrackingTokenCreationRequest,
    ) -> TrackingTokenCreationResponse:
        return self.trackingTokenService.createTrackingToken(trackingTokenCreationRequest)
