import base64
from fastapi import Response


class TransparentGifResponseFactory:
    def createTransparentGifResponse(self) -> Response:
        transparentGifBytes = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==")
        return Response(
            content=transparentGifBytes,
            media_type="image/gif",
            headers={
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "X-Content-Type-Options": "nosniff",
            },
        )
