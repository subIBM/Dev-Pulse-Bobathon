"""
DevPulse FastAPI Backend
AI-Powered Sprint Orchestrator
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api import repository, analysis, refactor
from app.database.db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting DevPulse backend...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    # Shutdown
    logger.info("👋 Shutting down DevPulse backend...")


app = FastAPI(
    title="DevPulse API",
    description="AI-Powered Sprint Orchestrator - Predict and prevent architectural blockers",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(repository.router, prefix="/api/repository", tags=["Repository"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(refactor.router, prefix="/api/refactor", tags=["Refactor"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DevPulse API - AI-Powered Sprint Orchestrator",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "devpulse-api",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

# Made with Bob
