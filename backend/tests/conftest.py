"""Pytest fixtures for backend tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """Provides a TestClient connected to the FastAPI application."""
    return TestClient(app)
