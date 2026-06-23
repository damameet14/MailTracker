from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TrackingTokenCreationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    recipient_email_address: str = Field(alias="recipientEmailAddress", min_length=3, max_length=320)
    email_subject: str = Field(alias="emailSubject", min_length=1, max_length=998)


class TrackingTokenCreationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    tracking_token: str = Field(alias="trackingToken")
    tracking_image_url: str = Field(alias="trackingImageUrl")


class TrackingEventSummaryResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    tracking_token: str = Field(alias="trackingToken")
    is_open_detected: bool = Field(alias="openDetected")
    tracking_image_loaded_count: int = Field(alias="trackingImageLoadedCount")


@dataclass(frozen=True)
class TrackingImageLoadRecordingRequest:
    tracking_token: str
    user_agent: str
    network_address: str


@dataclass(frozen=True)
class TrackingEventSummaryRequest:
    tracking_token: str


@dataclass(frozen=True)
class TrackingTokenRecord:
    tracking_token_hash: str
    recipient_email_address: str
    email_subject: str
    tracking_image_url: str
    created_at: datetime


@dataclass(frozen=True)
class TrackingEventRecord:
    tracking_token_hash: str
    user_agent_hash: str
    network_address_hash: str
    loaded_at: datetime


class TrackingTokenNotFoundError(Exception):
    pass
