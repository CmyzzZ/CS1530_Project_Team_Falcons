from fastapi import APIRouter

router = APIRouter(tags=["Search & Matching"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "broken"}
