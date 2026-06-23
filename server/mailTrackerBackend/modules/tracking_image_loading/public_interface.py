from dataclasses import dataclass

from fastapi import APIRouter

from server.mailTrackerBackend.modules.tracking_image_loading.application_workflows.create_tracking_token import (
    TrackingTokenCreator,
)
from server.mailTrackerBackend.modules.tracking_image_loading.application_workflows.record_tracking_image_loaded import (
    TrackingImageLoadRecorder,
)
from server.mailTrackerBackend.modules.tracking_image_loading.application_workflows.summarize_tracking_events import (
    TrackingEventSummarizer,
)
from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventSummaryRequest,
    TrackingEventSummaryResponse,
    TrackingImageLoadRecordingRequest,
    TrackingTokenCreationRequest,
    TrackingTokenCreationResponse,
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
from server.mailTrackerBackend.modules.tracking_image_loading.transport.tracking_image_loading_router import (
    create_tracking_image_loading_router as create_tracking_image_loading_transport_router,
)


@dataclass(frozen=True)
class TrackingImageLoadingModuleDependencies:
    tracking_base_url: str
    tracking_token_generator: TrackingTokenGenerator
    tracking_signal_hasher: TrackingSignalHasher
    tracking_image_loading_repository: TrackingImageLoadingRepository


class TrackingImageLoadingModule:
    def __init__(self, dependencies: TrackingImageLoadingModuleDependencies):
        self.tracking_token_creator = TrackingTokenCreator(
            dependencies.tracking_base_url,
            dependencies.tracking_token_generator,
            dependencies.tracking_signal_hasher,
            dependencies.tracking_image_loading_repository,
        )
        self.tracking_image_load_recorder = TrackingImageLoadRecorder(
            dependencies.tracking_image_loading_repository,
            dependencies.tracking_signal_hasher,
        )
        self.tracking_event_summarizer = TrackingEventSummarizer(
            dependencies.tracking_image_loading_repository,
            dependencies.tracking_signal_hasher,
        )

    def create_tracking_token(
        self,
        tracking_token_creation_request: TrackingTokenCreationRequest,
    ) -> TrackingTokenCreationResponse:
        return self.tracking_token_creator.create_tracking_token(tracking_token_creation_request)

    def record_tracking_image_loaded(
        self,
        tracking_image_load_recording_request: TrackingImageLoadRecordingRequest,
    ) -> None:
        self.tracking_image_load_recorder.record_tracking_image_loaded(tracking_image_load_recording_request)

    def summarize_tracking_events(
        self,
        tracking_event_summary_request: TrackingEventSummaryRequest,
    ) -> TrackingEventSummaryResponse:
        return self.tracking_event_summarizer.summarize_tracking_events(tracking_event_summary_request)


def create_tracking_image_loading_router(
    dependencies: TrackingImageLoadingModuleDependencies,
) -> APIRouter:
    return create_tracking_image_loading_transport_router(TrackingImageLoadingModule(dependencies))
