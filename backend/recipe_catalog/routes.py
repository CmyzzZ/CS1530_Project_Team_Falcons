from fastapi import APIRouter

router = APIRouter(prefix="/recipes", tags=["Recipe Catalog"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
