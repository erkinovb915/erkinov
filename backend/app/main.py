from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.config import get_settings
from app.database import SessionLocal, engine
from app.routers import admin, contact, health, portfolio, projects
from app.seed import seed_projects

logger = logging.getLogger("erkinov.api")
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Verify schema availability and idempotently seed canonical projects."""
    try:
        inspector = inspect(engine)
        if inspector.has_table("projects"):
            with SessionLocal() as db:
                seed_projects(db)
        else:
            logger.warning(
                "Table 'projects' not found yet. Run 'alembic upgrade head' before starting in production."
            )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Startup seed check skipped: %s", exc)
    yield


app = FastAPI(
    title="ERKINOV LOYIHASI — Portfolio API",
    description="Backend API for ERKINOV BOBURJON interactive 3D portfolio.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(portfolio.router)
app.include_router(projects.router)
app.include_router(contact.router)
app.include_router(admin.router)


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    return {
        "brand": "ERKINOV LOYIHASI",
        "owner": "ERKINOV BOBURJON",
        "docs": "/docs",
        "health": "/api/health",
    }
