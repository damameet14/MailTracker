from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class TrackingEventRecord:
    trackingTokenHash: str
    userAgentHash: str
    networkAddressHash: str
    loadedAt: datetime
