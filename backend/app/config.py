"""Configuration settings for ISCOS backend.

Provides file paths, CORS origins, and algorithm tuning parameters.
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SEED_FILE = DATA_DIR / "seed.json"
STORE_FILE = DATA_DIR / "store.json"

# Optimizer scoring weights (spec: 0.6 distance, 0.4 cost)
WEIGHT_DISTANCE: float = 0.6
WEIGHT_COST: float = 0.4
HANDLING_FEE: float = 50.0

# CORS settings
CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
