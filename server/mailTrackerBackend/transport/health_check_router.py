from fastapi import APIRouter


def create_health_check_router() -> APIRouter:
    router = APIRouter()

    @router.get("/api/health")
    def get_health() -> dict[str, str]:
        return {"status": "ok"}

    return router
