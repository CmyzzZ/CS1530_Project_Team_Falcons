from fastapi import FastAPI

from backend.recipe_catalog.routes import router as recipe_catalog_router
from backend.search_matching.routes import router as search_matching_router

app = FastAPI(title="Chinese Cuisine Knowledge Base")
app.include_router(search_matching_router)
app.include_router(recipe_catalog_router)
