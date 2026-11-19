from copy import deepcopy

from fastapi.testclient import TestClient
import pytest

from backend.data_management.seed_data import INGREDIENTS, RECIPES
from backend.main import app
from backend.search_matching.routes import get_catalog


client = TestClient(app)


@pytest.fixture(autouse=True)
def use_test_catalog():
    previous = app.dependency_overrides.get(get_catalog)

    app.dependency_overrides[get_catalog] = lambda: {
        "ingredients": deepcopy(INGREDIENTS),
        "recipes": deepcopy(RECIPES),
    }

    try:
        yield
    finally:
        if previous is None:
            app.dependency_overrides.pop(get_catalog, None)
        else:
            app.dependency_overrides[get_catalog] = previous


def test_search_chinese_input_returns_ranked_results():
    response = client.post(
        "/search",
        json={"ingredients": ["番茄", "鸡蛋"]},
    )

    assert response.status_code == 200

    results = response.json()["results"]

    assert [item["id"] for item in results] == [1, 4, 2]
    assert results[0]["missing_count"] == 0
    assert results[1]["missing_ingredients"] == ["rice"]


def test_search_english_and_chinese_inputs_have_same_results():
    english = client.post(
        "/search",
        json={"ingredients": [" TOMATO ", "Egg"]},
    )

    chinese = client.post(
        "/search",
        json={"ingredients": ["西红柿", "鸡蛋"]},
    )

    assert english.status_code == 200
    assert chinese.status_code == 200
    assert english.json() == chinese.json()


def test_search_unknown_ingredient_returns_empty_results():
    response = client.post(
        "/search",
        json={"ingredients": ["beef"]},
    )

    assert response.status_code == 200
    assert response.json() == {"results": []}


def test_search_empty_list_is_rejected():
    response = client.post(
        "/search",
        json={"ingredients": []},
    )

    assert response.status_code == 422


def test_search_blank_ingredient_is_rejected():
    response = client.post(
        "/search",
        json={"ingredients": ["   "]},
    )

    assert response.status_code == 422
    
def test_database_unavailable_returns_generic_503(monkeypatch):
    import psycopg

    from backend.data_management import database

    app.dependency_overrides.pop(get_catalog, None)

    def fail_load_catalog():
        raise psycopg.OperationalError("private-connection-details")

    monkeypatch.setattr(
        database,
        "load_catalog",
        fail_load_catalog,
    )

    response = client.post(
        "/search",
        json={"ingredients": ["egg"]},
    )

    assert response.status_code == 503

    assert response.json() == {
        "detail": (
            "Recipe database is unavailable. "
            "Please try again later."
        ),
    }