import os

import psycopg
from psycopg.rows import dict_row


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured.")

    return psycopg.connect(
        database_url,
        connect_timeout=5,
        row_factory=dict_row,
    )


def read_catalog(connection) -> dict:
    with connection.cursor(row_factory=dict_row) as cursor:
        ingredients = cursor.execute(
            """
            SELECT id, name_en, name_zh, aliases
            FROM ingredients
            ORDER BY id
            """
        ).fetchall()

        recipes = cursor.execute(
            """
            SELECT
                r.id,
                r.name_en,
                r.name_zh,
                COALESCE(
                    array_agg(ri.ingredient_id ORDER BY ri.ingredient_id)
                        FILTER (WHERE ri.ingredient_id IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) AS ingredients
            FROM recipes AS r
            LEFT JOIN recipe_ingredients AS ri ON ri.recipe_id = r.id
            GROUP BY r.id, r.name_en, r.name_zh
            ORDER BY r.id
            """
        ).fetchall()

    return {
        "ingredients": ingredients,
        "recipes": recipes,
    }


def load_catalog() -> dict:
    with get_connection() as connection:
        return read_catalog(connection)