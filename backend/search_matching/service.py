import unicodedata


def clean_name(name: str) -> str:
    return " ".join(
        unicodedata.normalize("NFKC", name).casefold().split()
    )


def build_alias_map(ingredients: list[dict]) -> dict[str, str]:
    aliases = {}

    for ingredient in ingredients:
        names = [
            ingredient["id"],
            ingredient["name_en"],
            ingredient["name_zh"],
            *ingredient.get("aliases", []),
        ]

        for name in names:
            normalized = clean_name(name)
            if not normalized:
                continue

            previous = aliases.get(normalized)
            if previous is not None and previous != ingredient["id"]:
                raise ValueError(
                    "Ingredient aliases must identify one ingredient."
                )

            aliases[normalized] = ingredient["id"]

    return aliases


def normalize_ingredients(
    names: list[str],
    alias_map: dict[str, str],
) -> set[str]:
    normalized = set()

    for name in names:
        cleaned = clean_name(name)
        if cleaned:
            normalized.add(alias_map.get(cleaned, cleaned))

    return normalized


def match_recipes(
    available_ingredients: list[str],
    recipes: list[dict],
    ingredients: list[dict],
) -> list[dict]:
    alias_map = build_alias_map(ingredients)

    available = normalize_ingredients(
        available_ingredients,
        alias_map,
    )

    if not available:
        return []

    ingredient_by_id = {
        item["id"]: item
        for item in ingredients
    }

    def describe(ids: set[str]) -> list[dict]:
        return [
            {
                "id": ingredient_id,
                "name_en": ingredient_by_id[ingredient_id]["name_en"],
                "name_zh": ingredient_by_id[ingredient_id]["name_zh"],
            }
            for ingredient_id in sorted(ids)
        ]

    results = []

    for recipe in recipes:
        required = set(recipe["ingredients"])
        matched = required & available

        if not matched:
            continue

        missing = required - available

        results.append({
            "id": recipe["id"],
            "name_en": recipe["name_en"],
            "name_zh": recipe["name_zh"],
            "matched_ingredients": sorted(matched),
            "missing_ingredients": sorted(missing),
            "matched_ingredient_details": describe(matched),
            "missing_ingredient_details": describe(missing),
            "matched_count": len(matched),
            "missing_count": len(missing),
            "total_ingredients": len(required),
            "match_ratio": len(matched) / len(required),
            "is_full_match": not missing,
        })

    results.sort(
        key=lambda item: (
            -item["match_ratio"],
            -item["matched_count"],
            item["id"],
        )
    )

    return results