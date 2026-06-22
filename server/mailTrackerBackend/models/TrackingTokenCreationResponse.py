from pydantic import BaseModel


class TrackingTokenCreationResponse(BaseModel):
    trackingToken: str
    trackingImageUrl: str
