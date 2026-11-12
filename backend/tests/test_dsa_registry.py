"""Unit tests for HashRegistry custom data structure."""
import pytest
from app.dsa.hash_registry import HashRegistry

def test_hash_registry_crud():
    reg = HashRegistry()
    assert len(reg) == 0
    assert reg.get("P-001") is None
    assert not reg.has("P-001")

    # Set item
    reg.set("P-001", {"name": "Industrial Sensor", "price": 450.0})
    assert len(reg) == 1
    assert reg.has("P-001")
    assert reg.get("P-001")["price"] == 450.0

    # Update item
    reg.set("P-001", {"name": "Industrial Sensor", "price": 420.0})
    assert len(reg) == 1
    assert reg.get("P-001")["price"] == 420.0

    # Values
    assert len(reg.values()) == 1
    assert len(reg.items()) == 1

    # Delete item
    deleted = reg.delete("P-001")
    assert deleted is True
    assert len(reg) == 0
    assert not reg.has("P-001")
    assert reg.get("P-001") is None

    # Delete non-existent
    assert reg.delete("P-001") is False

def test_hash_registry_initial_dict():
    initial = {"S-001": {"city": "Delhi"}, "S-002": {"city": "Mumbai"}}
    reg = HashRegistry(initial)
    assert len(reg) == 2
    assert reg.get("S-001")["city"] == "Delhi"
    assert reg.get("S-002")["city"] == "Mumbai"
    reg.clear()
    assert len(reg) == 0
