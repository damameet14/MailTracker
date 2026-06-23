from abc import ABC, abstractmethod

from server.mailTrackerBackend.modules.tracking_image_loading.contracts import (
    TrackingEventRecord,
    TrackingTokenRecord,
)


class TrackingImageLoadingRepository(ABC):
    @abstractmethod
    def save_tracking_token(self, tracking_token_record: TrackingTokenRecord) -> None:
        raise NotImplementedError

    @abstractmethod
    def find_tracking_token_by_hash(self, tracking_token_hash: str) -> TrackingTokenRecord | None:
        raise NotImplementedError

    @abstractmethod
    def save_tracking_event(self, tracking_event_record: TrackingEventRecord) -> None:
        raise NotImplementedError

    @abstractmethod
    def count_tracking_events(self, tracking_token_hash: str) -> int:
        raise NotImplementedError
