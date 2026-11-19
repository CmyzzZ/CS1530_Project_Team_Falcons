from pathlib import Path

from backend.data_management.database import get_connection
from backend.data_management.seed_data import INGREDIENTS, RECIPES


SCHEMA_PATH = Path(__file__).with_name("schema.sql")


def initialize_database(connection) -> None:
    connection.execute(
        SCHEMA_PATH.read_text(encoding="utf-8"),
        prepare=False,
    )

    for ingredient in INGREDIENTS:
        connection.execute(
            """
            INSERT INTO ingredients (id, name_en, name_zh, aliases)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (
                ingredient["id"],
                ingredient["name_en"],
                ingredient["name_zh"],
                ingredient["aliases"],
            ),
        )

    for recipe in RECIPES:
        connection.execute(
            """
            INSERT INTO recipes (id, name_en, name_zh)
            VALUES (%s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (
                recipe["id"],
                recipe["name_en"],
                recipe["name_zh"],
            ),
        )

        for ingredient_id in recipe["ingredients"]:
            connection.execute(
                """
                INSERT INTO recipe_ingredients (recipe_id, ingredient_id)
                VALUES (%s, %s)
                ON CONFLICT (recipe_id, ingredient_id) DO NOTHING
                """,
                (
                    recipe["id"],
                    ingredient_id,
                ),
            )


def main() -> None:
    with get_connection() as connection:
        initialize_database(connection)

    print("Database tables and development data are ready.")


if __name__ == "__main__":
    main()