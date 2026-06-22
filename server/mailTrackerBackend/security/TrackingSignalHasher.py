import hashlib
import hmac


class TrackingSignalHasher:
    def __init__(self, trackingHmacSecret: str):
        self.trackingHmacSecret = trackingHmacSecret.encode("utf-8")

    def hashTrackingToken(self, trackingToken: str) -> str:
        return hashlib.sha256(trackingToken.encode("utf-8")).hexdigest()

    def hashTrackingSignal(self, trackingSignalValue: str) -> str:
        return hmac.new(
            self.trackingHmacSecret,
            trackingSignalValue.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
