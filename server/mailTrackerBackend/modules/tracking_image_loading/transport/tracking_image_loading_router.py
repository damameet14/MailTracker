from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, HTTPException, Request

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventSummaryRequest,
    TrackingEventSummaryResponse,
    TrackingImageLoadRecordingRequest,
    TrackingTokenCreationRequest,
    TrackingTokenCreationResponse,
    TrackingTokenNotFoundError,
)
from server.mailTrackerBackend.modules.tracking_image_loading.transport.transparent_gif_response_factory import (
    create_transparent_gif_response,
)

if TYPE_CHECKING:
    from server.mailTrackerBackend.modules.tracking_image_loading.public_interface import TrackingImageLoadingModule


def create_tracking_image_loading_router(tracking_image_loading_module: TrackingImageLoadingModule) -> APIRouter:
    router = APIRouter()

    @router.post("/api/trackingTokens", response_model=TrackingTokenCreationResponse)
    def create_tracking_token(
        tracking_token_creation_request: TrackingTokenCreationRequest,
    ) -> TrackingTokenCreationResponse:
        return tracking_image_loading_module.create_tracking_token(tracking_token_creation_request)

    @router.get("/t/{tracking_token}/pixel.gif")
    def record_tracking_image_loaded(tracking_token: str, request: Request):
        try:
            tracking_image_loading_module.record_tracking_image_loaded(TrackingImageLoadRecordingRequest(
                tracking_token=tracking_token,
                user_agent=request.headers.get("user-agent", "unknown"),
                network_address=request.client.host if request.client else "unknown",
            ))
        except TrackingTokenNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

        return create_transparent_gif_response()

    @router.get("/api/trackingEvents/{tracking_token}", response_model=TrackingEventSummaryResponse)
    def summarize_tracking_events(tracking_token: str) -> TrackingEventSummaryResponse:
        return tracking_image_loading_module.summarize_tracking_events(TrackingEventSummaryRequest(
            tracking_token=tracking_token,
        ))

    return router
