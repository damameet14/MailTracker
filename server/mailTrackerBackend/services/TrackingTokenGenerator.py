import secrets


class TrackingTokenGenerator:
    def generateTrackingToken(self) -> str:
        return secrets.token_urlsafe(32)
