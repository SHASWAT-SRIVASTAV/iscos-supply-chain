"""Tests for the system health and architecture endpoints."""

def test_health_check(client):
    """Verify /health returns 200 OK and expected status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "iscos-backend"

def test_meta_architecture(client):
    """Verify /api/meta/architecture returns valid system layers and DSA registry."""
    response = client.get("/api/meta/architecture")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "ISCOS"
    assert len(data["layers"]) >= 5
    assert len(data["dsa_registry"]) >= 7
