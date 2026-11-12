"""JSON persistence module for ISCOS backend.

Loads from store.json or seed.json fallback and persists data on each mutation.
Contains no business logic or calculations.
"""
import json
from pathlib import Path
from typing import Any
from app.config import STORE_FILE, SEED_FILE
from app.seed import get_initial_seed

class Store:
    def __init__(self, store_path: Path = STORE_FILE, seed_path: Path = SEED_FILE) -> None:
        self.store_path = store_path
        self.seed_path = seed_path

    def load(self) -> dict[str, Any]:
        """Loads state dictionary. Uses store_path if present, else seed_path, else default seed."""
        if self.store_path.exists():
            try:
                with open(self.store_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        
        if self.seed_path.exists():
            try:
                with open(self.seed_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.save(data)
                    return data
            except Exception:
                pass

        # Generate fresh seed
        data = get_initial_seed()
        self.save(data)
        return data

    def save(self, data: dict[str, Any]) -> None:
        """Persists state dictionary to store_path as formatted JSON."""
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.store_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def reset(self) -> dict[str, Any]:
        """Resets store back to initial seed data."""
        data = get_initial_seed()
        self.save(data)
        return data
