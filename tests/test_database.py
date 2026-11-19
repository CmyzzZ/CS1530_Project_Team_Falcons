import os
import uuid

from fastapi.testclient import TestClient
import psycopg
from psycopg import sql
from psycopg.rows import dict_row
import pytest

from backend.data_management.database import read_catalog
from backend.data_management.init_db import initialize_database
from backend.main import app
from backend.search_matching.routes import get_catalog


def test_postgresql_seed_read_and_search():
    database_url = os.getenv("TEST_DATABASE_URL")

    if not database_url:
        pytest.skip(
            "Set TEST_DATABASE_URL to run the PostgreSQL integration test."
        )

    schema_name = "sprint5_test_" + uuid.uuid4().hex

    connection = psycopg.connect(
        database_url,
        row_factory=dict_row,
        connect_timeout=5,
    )

    previous = app.dependency_overrides.get(get_catalog)

    try:
        connection.execute(
            sql.SQL("CREATE SCHEMA {}").format(
                sql.Identifier(schema_name)
            )
        )

        connection.execute(
            sql.SQL("SET LOCAL search_path TO {}").format(
                sql.Identifier(schema_name)
            )
        )

        initialize_database(connection)
        initialize_database(connection)

        catalog = read_catalog(connection)

        assert len(catalog["ingredients"]) == 4
        assert len(catalog["recipes"]) == 4

        tomato = next(
            item for item in catalog["ingredients"]
            if item["id"] == "tomato"
        )

        assert tomato["name_zh"] == "番茄"
        assert "西红柿" in tomato["aliases"]

        app.dependency_overrides[get_catalog] = (
            lambda: read_catalog(connection)
        )

        with TestClient(app) as client:
            response = client.post(
                "/search",
                json={"ingredients": ["西红柿", "鸡蛋"]},
            )

        assert response.status_code == 200

        assert [
            item["id"]
            for item in response.json()["results"]
        ] == [1, 4, 2]

    finally:
        if previous is None:
            app.dependency_overrides.pop(get_catalog, None)
        else:
            app.dependency_overrides[get_catalog] = previous

        try:
            connection.rollback()
        finally:
            connection.close()