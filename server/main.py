from fastapi import FastAPI
from server.mailTrackerBackend.configuration.ApplicationConfiguration import ApplicationConfiguration
from server.mailTrackerBackend.configuration.FirebaseApplicationFactory import FirebaseApplicationFactory
from server.mailTrackerBackend.controllers.HealthController import HealthController
from server.mailTrackerBackend.controllers.TrackingPixelController import TrackingPixelController
from server.mailTrackerBackend.controllers.TrackingTokenController import TrackingTokenController
from server.mailTrackerBackend.repositories.FirestoreTrackingRepository import FirestoreTrackingRepository
from server.mailTrackerBackend.security.TrackingSignalHasher import TrackingSignalHasher
from server.mailTrackerBackend.services.TrackingPixelService import TrackingPixelService
from server.mailTrackerBackend.services.TrackingTokenGenerator import TrackingTokenGenerator
from server.mailTrackerBackend.services.TrackingTokenService import TrackingTokenService

applicationConfiguration = ApplicationConfiguration.fromEnvironment()
firebaseApplicationFactory = FirebaseApplicationFactory(applicationConfiguration)
firestoreClient = firebaseApplicationFactory.createFirestoreClient()
trackingRepository = FirestoreTrackingRepository(firestoreClient)
trackingTokenGenerator = TrackingTokenGenerator()
trackingSignalHasher = TrackingSignalHasher(applicationConfiguration.trackingHmacSecret)

trackingTokenService = TrackingTokenService(
    applicationConfiguration,
    trackingTokenGenerator,
    trackingRepository,
)
trackingPixelService = TrackingPixelService(
    trackingRepository,
    trackingSignalHasher,
)

app = FastAPI(title="MailTracker API", version="0.1.0")
app.include_router(HealthController().router)
app.include_router(TrackingTokenController(trackingTokenService).router)
app.include_router(TrackingPixelController(trackingPixelService).router)
