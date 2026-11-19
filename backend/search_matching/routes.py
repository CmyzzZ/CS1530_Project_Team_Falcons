from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, StringConstraints
import psycopg

from backend.data_management import database
from backend.search_matching.service import match_recipes


router = APIRouter(tags=["Search & Matching"])

IngredientName = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
        max_length=80,
        strict=True,
    ),
]


class SearchRequest(BaseModel):
    ingredients: list[IngredientName] = Field(
        min_length=1,
        max_length=50,
    )


class IngredientDetail(BaseModel):
    id: str
    name_en: str
    name_zh: str


class IngredientOption(IngredientDetail):
    aliases: list[str]


class IngredientListResponse(BaseModel):
    ingredients: list[IngredientOption]


class RecipeMatch(BaseModel):
    id: int
    name_en: str
    name_zh: str
    matched_ingredients: list[str]
    missing_ingredients: list[str]
    matched_ingredient_details: list[IngredientDetail]
    missing_ingredient_details: list[IngredientDetail]
    matched_count: int
    missing_count: int
    total_ingredients: int
    match_ratio: float
    is_full_match: bool


class SearchResponse(BaseModel):
    results: list[RecipeMatch]


def get_catalog() -> dict:
    try:
        return database.load_catalog()
    except (psycopg.Error, RuntimeError) as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Recipe database is unavailable. "
                "Please try again later."
            ),
        ) from exc


CatalogDependency = Annotated[
    dict,
    Depends(get_catalog),
]


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get(
    "/ingredients",
    response_model=IngredientListResponse,
)
def list_ingredients(catalog: CatalogDependency) -> dict:
    return {
        "ingredients": catalog["ingredients"],
    }


@router.post(
    "/search",
    response_model=SearchResponse,
)
def search_recipes(
    request: SearchRequest,
    catalog: CatalogDependency,
) -> dict:
    return {
        "results": match_recipes(
            request.ingredients,
            catalog["recipes"],
            catalog["ingredients"],
        ),
    }