from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TrackingTokenRecord:
    trackingTokenHash: str
    recipientEmailAddress: str
    emailSubject: str
    trackingImageUrl: str
    createdAt: datetime
