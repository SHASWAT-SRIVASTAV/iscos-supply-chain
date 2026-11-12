"""Tests for Inventory, Adjustments, and Low-Stock Alert MinHeap ranking (M2)."""
import pytest

def test_inventory_list_and_filter(client):
    client.post("/api/seed/load")
    
    # List all inventory
    resp = client.get("/api/inventory")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 20
    assert "available" in items[0]
    assert "is_low_stock" in items[0]

    # Filter by specific warehouse
    wh_resp = client.get("/api/inventory?warehouse_id=W-001")
    assert wh_resp.status_code == 200
    w1_items = wh_resp.json()
    assert len(w1_items) > 0
    assert all(i["warehouse_id"] == "W-001" for i in w1_items)

def test_inventory_adjustment_and_validation(client):
    client.post("/api/seed/load")

    # Positive adjustment (add 20 units)
    initial_resp = client.get("/api/inventory?warehouse_id=W-001")
    target = next(i for i in initial_resp.json() if i["product_id"] == "P-001")
    initial_qty = target["quantity"]

    adj_resp = client.post("/api/inventory/adjust", json={
        "warehouse_id": "W-001",
        "product_id": "P-001",
        "quantity_delta": 25
    })
    assert adj_resp.status_code == 200
    
    # Verify new quantity
    updated_items = client.get("/api/inventory?warehouse_id=W-001").json()
    updated = next(i for i in updated_items if i["product_id"] == "P-001")
    assert updated["quantity"] == initial_qty + 25

    # Negative adjustment resulting in negative stock must fail (400)
    fail_resp = client.post("/api/inventory/adjust", json={
        "warehouse_id": "W-001",
        "product_id": "P-001",
        "quantity_delta": -99999
    })
    assert fail_resp.status_code == 400
    assert "Insufficient stock" in fail_resp.json()["detail"]

def test_low_stock_alerts_min_heap_order(client):
    """Verifies that alerts are sorted in ascending order of urgency_ratio via MinHeap."""
    client.post("/api/seed/load")
    resp = client.get("/api/alerts/low-stock")
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) >= 5

    # Check urgency ratios: ratio = available / reorder_level
    ratios = [a["urgency_ratio"] for a in alerts]
    # In a min-heap drain, ratios must be non-decreasing (lowest ratio = most critical first)
    assert ratios == sorted(ratios), f"Alerts not sorted by urgency: {ratios}"

def test_restock_suggestions(client):
    client.post("/api/seed/load")
    resp = client.get("/api/optimizer/restock")
    assert resp.status_code == 200
    suggestions = resp.json()
    assert len(suggestions) > 0
    first = suggestions[0]
    assert "primary_supplier" in first
    assert "supplier_score" in first
    assert "weights" in first["score_breakdown"]
