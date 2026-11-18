from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_search_matching_health_returns_ok():
    """Search & Matching: GET /health returns 200 and status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_recipe_catalog_health_returns_ok():
    """Recipe Catalog: GET /recipes/health returns 200 and status ok."""
    response = client.get("/recipes/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}