from abc import ABC, abstractmethod
from server.mailTrackerBackend.models.TrackingEventRecord import TrackingEventRecord
from server.mailTrackerBackend.models.TrackingTokenRecord import TrackingTokenRecord


class TrackingRepository(ABC):
    @abstractmethod
    def saveTrackingToken(self, trackingTokenRecord: TrackingTokenRecord) -> None:
        raise NotImplementedError

    @abstractmethod
    def findTrackingTokenByHash(self, trackingTokenHash: str) -> TrackingTokenRecord | None:
        raise NotImplementedError

    @abstractmethod
    def saveTrackingEvent(self, trackingEventRecord: TrackingEventRecord) -> None:
        raise NotImplementedError

    @abstractmethod
    def countTrackingEvents(self, trackingTokenHash: str) -> int:
        raise NotImplementedError
