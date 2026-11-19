from copy import deepcopy

import pytest

from backend.data_management.seed_data import INGREDIENTS, RECIPES
from backend.search_matching.service import (
    build_alias_map,
    match_recipes,
    normalize_ingredients,
)


def test_normalization_handles_languages_case_width_and_duplicates():
    aliases = build_alias_map(INGREDIENTS)

    result = normalize_ingredients(
        [" Egg ", "鸡蛋", "ＥＧＧ", "西红柿", "TOMATO", "", " "],
        aliases,
    )

    assert result == {"egg", "tomato"}


def test_full_match_first_then_partial_matches():
    results = match_recipes(
        ["番茄", "鸡蛋"],
        RECIPES,
        INGREDIENTS,
    )

    assert [item["id"] for item in results] == [1, 4, 2]
    assert results[0]["match_ratio"] == 1.0
    assert results[0]["is_full_match"] is True
    assert results[0]["missing_count"] == 0


def test_missing_ingredients_include_bilingual_names():
    results = match_recipes(
        ["egg"],
        RECIPES,
        INGREDIENTS,
    )

    rice = next(
        item for item in results
        if item["id"] == 2
    )

    assert rice["matched_ingredients"] == ["egg"]
    assert rice["missing_ingredients"] == ["rice"]
    assert rice["missing_count"] == 1
    assert rice["match_ratio"] == 0.5

    assert rice["missing_ingredient_details"] == [
        {
            "id": "rice",
            "name_en": "Cooked rice",
            "name_zh": "米饭",
        },
    ]


def test_duplicate_aliases_do_not_increase_match_count():
    results = match_recipes(
        ["egg", "eggs", "鸡蛋", "tomato"],
        RECIPES,
        INGREDIENTS,
    )

    assert results[0]["matched_count"] == 2
    assert results[0]["match_ratio"] == 1.0


def test_empty_input_returns_no_recipes():
    assert match_recipes(
        [],
        RECIPES,
        INGREDIENTS,
    ) == []

    assert match_recipes(
        ["", " "],
        RECIPES,
        INGREDIENTS,
    ) == []


def test_zero_match_recipes_are_excluded():
    assert match_recipes(
        ["beef"],
        RECIPES,
        INGREDIENTS,
    ) == []

    results = match_recipes(
        ["egg"],
        RECIPES,
        INGREDIENTS,
    )

    assert [item["id"] for item in results] == [1, 2, 4]


def test_ties_use_match_count_then_recipe_id():
    extra = {
        "id": 8,
        "name_en": "Egg",
        "name_zh": "鸡蛋",
        "ingredients": ["egg"],
    }

    results = match_recipes(
        ["tomato", "egg"],
        [extra, *reversed(RECIPES)],
        INGREDIENTS,
    )

    assert [item["id"] for item in results] == [1, 8, 4, 2]


def test_matching_does_not_modify_source_data():
    recipes_before = deepcopy(RECIPES)
    ingredients_before = deepcopy(INGREDIENTS)

    match_recipes(
        ["egg", "tomato"],
        RECIPES,
        INGREDIENTS,
    )

    assert RECIPES == recipes_before
    assert INGREDIENTS == ingredients_before


def test_conflicting_aliases_are_rejected():
    ingredients = deepcopy(INGREDIENTS)
    ingredients[1]["aliases"].append("egg")

    with pytest.raises(ValueError, match="one ingredient"):
        build_alias_map(ingredients)

def test_mixed_known_and_unknown_ingredients_keep_valid_matches():
    results = match_recipes(
        ["egg", "beef"],
        RECIPES,
        INGREDIENTS,
    )

    assert [item["id"] for item in results] == [1, 2, 4]
    assert all(item["matched_count"] == 1 for item in results)