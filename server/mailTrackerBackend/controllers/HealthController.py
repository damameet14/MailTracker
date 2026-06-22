from fastapi import APIRouter


class HealthController:
    def __init__(self):
        self.router = APIRouter()
        self.router.add_api_route("/api/health", self.getHealth, methods=["GET"])

    def getHealth(self) -> dict[str, str]:
        return {"status": "ok"}
