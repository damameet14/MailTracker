import secrets


class TrackingTokenGenerator:
    def generate_tracking_token(self) -> str:
        return secrets.token_urlsafe(32)
