"""Integration tests for Master Entities CRUD API (M1)."""
import pytest

def test_seed_reset_and_list_counts(client):
    # Reset seed to clean initial state
    resp = client.post("/api/seed/load")
    assert resp.status_code == 200

    # Verify initial products
    prods_resp = client.get("/api/products")
    assert prods_resp.status_code == 200
    prods = prods_resp.json()
    assert len(prods) >= 15

    # Verify initial suppliers
    sups_resp = client.get("/api/suppliers")
    assert sups_resp.status_code == 200
    sups = sups_resp.json()
    assert len(sups) >= 5

    # Verify initial warehouses
    wh_resp = client.get("/api/warehouses")
    assert wh_resp.status_code == 200
    whs = wh_resp.json()
    assert len(whs) >= 5

def test_product_crud_and_validation(client):
    # Lookup by ID
    p_resp = client.get("/api/products/P-001")
    assert p_resp.status_code == 200
    assert p_resp.json()["name"] == "Industrial IoT Sensor"

    # Create new product
    new_prod = {
        "name": "Heavy Duty Servomotor Cable",
        "sku": "CBL-SRV-10",
        "category": "Cables",
        "unit_price": 38.0,
        "weight_kg": 0.8,
        "supplier_id": "S-002"
    }
    create_resp = client.post("/api/products", json=new_prod)
    assert create_resp.status_code == 201
    created = create_resp.json()
    prod_id = created["id"]
    assert prod_id.startswith("P-")
    assert created["name"] == "Heavy Duty Servomotor Cable"

    # Lookup newly created
    get_resp = client.get(f"/api/products/{prod_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["sku"] == "CBL-SRV-10"

    # Update product
    update_data = {
        "name": "Heavy Duty Servomotor Cable Shielded",
        "sku": "CBL-SRV-10-SHLD",
        "category": "Cables",
        "unit_price": 44.5,
        "weight_kg": 0.9,
        "supplier_id": "S-002"
    }
    up_resp = client.put(f"/api/products/{prod_id}", json=update_data)
    assert up_resp.status_code == 200
    assert up_resp.json()["unit_price"] == 44.5

    # Delete product
    del_resp = client.delete(f"/api/products/{prod_id}")
    assert del_resp.status_code == 200
    
    # Verify deleted
    assert client.get(f"/api/products/{prod_id}").status_code == 404

    # Validation: unknown supplier
    invalid_prod = {
        "name": "Unknown Part",
        "sku": "UNK-001",
        "category": "Test",
        "unit_price": 10.0,
        "weight_kg": 1.0,
        "supplier_id": "S-999"
    }
    assert client.post("/api/products", json=invalid_prod).status_code == 400

def test_supplier_and_warehouse_crud(client):
    # Create supplier
    new_sup = {
        "name": "Precision Optics Corp",
        "city": "Pune",
        "lead_time_days": 4,
        "price_rating": 4.0,
        "reliability": 0.96
    }
    s_resp = client.post("/api/suppliers", json=new_sup)
    assert s_resp.status_code == 201
    sup_id = s_resp.json()["id"]

    # Create warehouse
    new_wh = {
        "name": "Central Hub Bhopal",
        "city": "Bhopal",
        "capacity": 5000,
        "cost_per_km": 1.35,
        "active": True
    }
    w_resp = client.post("/api/warehouses", json=new_wh)
    assert w_resp.status_code == 201
    wh_id = w_resp.json()["id"]

    # Get warehouse
    assert client.get(f"/api/warehouses/{wh_id}").json()["city"] == "Bhopal"

    # Clean up
    assert client.delete(f"/api/warehouses/{wh_id}").status_code == 200
    assert client.delete(f"/api/suppliers/{sup_id}").status_code == 200

def test_product_search_and_sort(client):
    # Search by category
    resp = client.get("/api/products?search=Sensors")
    assert resp.status_code == 200
    results = resp.json()
    assert all("sensor" in r["category"].lower() or "sensor" in r["name"].lower() for r in results)

    # Sort by unit_price desc
    resp = client.get("/api/products?sort_by=unit_price&order=desc")
    assert resp.status_code == 200
    sorted_prods = resp.json()
    prices = [p["unit_price"] for p in sorted_prods]
    assert prices == sorted(prices, reverse=True)
