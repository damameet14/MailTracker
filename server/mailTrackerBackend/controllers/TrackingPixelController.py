from fastapi import APIRouter, Request, Response
from server.mailTrackerBackend.models.TrackingEventSummaryResponse import TrackingEventSummaryResponse
from server.mailTrackerBackend.services.TrackingPixelService import TrackingPixelService
from server.mailTrackerBackend.services.TransparentGifResponseFactory import TransparentGifResponseFactory


class TrackingPixelController:
    def __init__(self, trackingPixelService: TrackingPixelService):
        self.trackingPixelService = trackingPixelService
        self.transparentGifResponseFactory = TransparentGifResponseFactory()
        self.router = APIRouter()
        self.router.add_api_route(
            "/t/{trackingToken}/pixel.gif",
            self.recordTrackingImageLoaded,
            methods=["GET"],
        )
        self.router.add_api_route(
            "/api/trackingEvents/{trackingToken}",
            self.getTrackingEventSummary,
            methods=["GET"],
            response_model=TrackingEventSummaryResponse,
        )

    def recordTrackingImageLoaded(self, trackingToken: str, request: Request) -> Response:
        self.trackingPixelService.recordTrackingImageLoaded(trackingToken, request)
        return self.transparentGifResponseFactory.createTransparentGifResponse()

    def getTrackingEventSummary(self, trackingToken: str) -> TrackingEventSummaryResponse:
        return self.trackingPixelService.summarizeTrackingEvents(trackingToken)
