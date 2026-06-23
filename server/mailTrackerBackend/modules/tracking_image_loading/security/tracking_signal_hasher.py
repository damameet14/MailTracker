import hashlib
import hmac


class TrackingSignalHasher:
    def __init__(self, tracking_hmac_secret: str):
        self.tracking_hmac_secret = tracking_hmac_secret.encode("utf-8")

    def hash_tracking_token(self, tracking_token: str) -> str:
        return hashlib.sha256(tracking_token.encode("utf-8")).hexdigest()

    def hash_tracking_signal(self, tracking_signal_value: str) -> str:
        return hmac.new(
            self.tracking_hmac_secret,
            tracking_signal_value.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
