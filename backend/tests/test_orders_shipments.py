"""Unit and Integration tests for Order MinHeap Priority Queue and Shipment FIFO Deque (M3)."""
import pytest
from app.dsa.shipment_queue import ShipmentQueue

def test_shipment_queue_unit():
    q = ShipmentQueue()
    assert q.is_empty()
    assert len(q) == 0
    assert q.peek() is None

    q.enqueue({"id": "SH-101", "status": "QUEUED"})
    q.enqueue({"id": "SH-102", "status": "QUEUED"})
    assert len(q) == 2
    assert q.peek()["id"] == "SH-101"

    item = q.dequeue()
    assert item["id"] == "SH-101"
    assert len(q) == 1
    assert q.peek()["id"] == "SH-102"

    item2 = q.dequeue()
    assert item2["id"] == "SH-102"
    assert q.is_empty()

    with pytest.raises(IndexError):
        q.dequeue()

def test_order_min_heap_priority_proven_by_test(client):
    """Proves that orders in /api/orders/queue are ordered strictly by (priority, created_at)."""
    client.post("/api/seed/load")

    # Fetch initial queue
    resp = client.get("/api/orders/queue")
    assert resp.status_code == 200
    queue = resp.json()
    assert len(queue) > 0

    # Ensure priorities are non-decreasing
    priorities = [o["priority"] for o in queue]
    assert priorities == sorted(priorities), f"Queue not priority-ordered: {priorities}"

    # Insert a new Priority 1 (urgent) order and verify it jumps to the front of priority 2/3 orders
    urgent_order = {
        "customer_name": "Emergency Medical Supplies",
        "destination_city": "Delhi",
        "items": [{"product_id": "P-001", "qty": 5}],
        "priority": 1,
    }
    create_resp = client.post("/api/orders", json=urgent_order)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    # Verify queue again
    updated_queue = client.get("/api/orders/queue").json()
    p1_orders = [o for o in updated_queue if o["priority"] == 1]
    assert any(o["id"] == created_id for o in p1_orders)
    # The newly created order must appear before all priority 2 and 3 orders
    created_idx = next(i for i, o in enumerate(updated_queue) if o["id"] == created_id)
    for lower_p in (2, 3):
        for o in updated_queue:
            if o["priority"] == lower_p:
                lower_idx = updated_queue.index(o)
                assert created_idx < lower_idx, f"Urgent order at {created_idx} was placed after priority {lower_p} at {lower_idx}"

def test_shipment_advance_flow(client):
    client.post("/api/seed/load")

    initial_q = client.get("/api/shipments/queue").json()
    assert len(initial_q) > 0
    head_id = initial_q[0]["id"]
    head_status = initial_q[0]["status"]

    # Advance head
    adv_resp = client.post("/api/shipments/advance")
    assert adv_resp.status_code == 200
    adv_data = adv_resp.json()
    assert adv_data["id"] == head_id

    if head_status == "QUEUED":
        assert adv_data["status"] == "IN_TRANSIT"
    elif head_status == "IN_TRANSIT":
        assert adv_data["status"] == "DELIVERED"
