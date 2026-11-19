import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.recipe_catalog.routes import router as recipe_catalog_router
from backend.search_matching.routes import router as search_matching_router


app = FastAPI(title="Chinese Cuisine Knowledge Base")

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:8081,http://127.0.0.1:8081,"
        "http://localhost:19006,http://127.0.0.1:19006",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(search_matching_router)
app.include_router(recipe_catalog_router)