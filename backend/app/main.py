"""FastAPI Application Entry Point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Startup: create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: nothing to clean up


app = FastAPI(
    title=settings.APP_NAME,
    description="AI Prompt Scoring & Training Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/", tags=["健康检查"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }


@app.get("/api/v1/health", tags=["健康检查"])
def api_health():
    """API health check."""
    return {"status": "ok", "message": "API is running"}
