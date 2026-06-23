from fastapi import FastAPI

from server.mailTrackerBackend.configuration.ApplicationConfiguration import ApplicationConfiguration
from server.mailTrackerBackend.configuration.FirebaseApplicationFactory import FirebaseApplicationFactory
from server.mailTrackerBackend.modules.tracking_image_loading.persistence.firestore_tracking_image_loading_repository import (
    FirestoreTrackingImageLoadingRepository,
)
from server.mailTrackerBackend.modules.tracking_image_loading.public_interface import (
    TrackingImageLoadingModuleDependencies,
    create_tracking_image_loading_router,
)
from server.mailTrackerBackend.modules.tracking_image_loading.security.tracking_signal_hasher import (
    TrackingSignalHasher,
)
from server.mailTrackerBackend.modules.tracking_image_loading.token_generation.tracking_token_generator import (
    TrackingTokenGenerator,
)
from server.mailTrackerBackend.transport.health_check_router import create_health_check_router


def create_mail_tracker_api() -> FastAPI:
    application_configuration = ApplicationConfiguration.fromEnvironment()
    firebase_application_factory = FirebaseApplicationFactory(application_configuration)
    firestore_client = firebase_application_factory.createFirestoreClient()

    tracking_image_loading_dependencies = TrackingImageLoadingModuleDependencies(
        tracking_base_url=application_configuration.trackingBaseUrl,
        tracking_token_generator=TrackingTokenGenerator(),
        tracking_signal_hasher=TrackingSignalHasher(application_configuration.trackingHmacSecret),
        tracking_image_loading_repository=FirestoreTrackingImageLoadingRepository(firestore_client),
    )

    mail_tracker_api = FastAPI(title="MailTracker API", version="0.1.0")
    mail_tracker_api.include_router(create_health_check_router())
    mail_tracker_api.include_router(create_tracking_image_loading_router(tracking_image_loading_dependencies))
    return mail_tracker_api
