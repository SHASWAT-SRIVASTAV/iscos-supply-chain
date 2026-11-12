"""FastAPI entry point for the ISCOS Backend.

Provides the application factory, CORS middleware configuration, and router attachments.
Follows the python-backend skill layering rules strictly.
"""
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.routers import system, master, inventory, orders, routes, optimize

app = FastAPI(
    title="ISCOS - Intelligent Supply Chain Optimization System",
    description="DSA-II logistics prototype backend featuring hand-crafted data structures and algorithm visual traces.",
    version="1.0.0",
)

# Configure CORS (supports specified origins, local dev ports, and Vercel deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.vercel\.app)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root landing route: redirect browser / site access directly to interactive Swagger docs
@app.get("/", include_in_schema=False)
def root():
    """Redirect root access to Swagger interactive documentation."""
    return RedirectResponse(url="/docs")

# API base route
@app.get("/api", tags=["System"])
def api_root():
    """Returns basic service metadata and API documentation links."""
    return {
        "service": "iscos-backend",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health",
    }

# Root health check endpoint (as specified in M0)
@app.get("/health", tags=["System"])
def health_check():
    """Returns basic health status of the backend API."""
    return {
        "status": "ok",
        "service": "iscos-backend",
        "version": "1.0.0",
    }

# Register routers
app.include_router(system.router)
app.include_router(master.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(routes.router)
app.include_router(optimize.router)





