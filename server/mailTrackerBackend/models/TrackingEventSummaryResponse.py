from pydantic import BaseModel


class TrackingEventSummaryResponse(BaseModel):
    trackingToken: str
    openDetected: bool
    trackingImageLoadedCount: int
