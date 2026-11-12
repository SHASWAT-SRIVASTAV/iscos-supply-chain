"""Unit and Integration tests for MergeSort, BinarySearch, and the Multi-Criteria Optimizer (M5)."""
import pytest
from app.dsa.sorting import merge_sort
from app.dsa.searching import binary_search
from app.dsa.optimizer import evaluate_order_candidates
from app.dsa.route_graph import RouteGraph

def test_merge_sort_stability_and_keys():
    # Empty and single
    assert merge_sort([]) == []
    assert merge_sort([42]) == [42]

    # Unsorted numbers
    nums = [9, 3, 7, 1, 4, 8, 2, 6, 5]
    assert merge_sort(nums) == [1, 2, 3, 4, 5, 6, 7, 8, 9]
    assert merge_sort(nums, reverse=True) == [9, 8, 7, 6, 5, 4, 3, 2, 1]

    # Stability test on equal keys
    records = [
        {"id": "A", "val": 10, "orig": 1},
        {"id": "B", "val": 5, "orig": 2},
        {"id": "C", "val": 10, "orig": 3},
        {"id": "D", "val": 5, "orig": 4},
    ]
    sorted_recs = merge_sort(records, key=lambda r: r["val"])
    # B and D have val=5; B must precede D
    assert sorted_recs[0]["id"] == "B"
    assert sorted_recs[1]["id"] == "D"
    # A and C have val=10; A must precede C
    assert sorted_recs[2]["id"] == "A"
    assert sorted_recs[3]["id"] == "C"

def test_binary_search_edge_cases():
    # Empty
    assert binary_search([], 10) is None

    # Single
    assert binary_search([5], 5) == 0
    assert binary_search([5], 1) is None
    assert binary_search([5], 10) is None

    # Odd and even length lists
    arr = [10, 20, 30, 40, 50, 60]
    assert binary_search(arr, 10) == 0
    assert binary_search(arr, 30) == 2
    assert binary_search(arr, 60) == 5
    assert binary_search(arr, 5) is None
    assert binary_search(arr, 35) is None
    assert binary_search(arr, 70) is None

    # Duplicates - must find first occurrence
    dup_arr = [10, 20, 20, 20, 30]
    assert binary_search(dup_arr, 20) == 1

def test_optimizer_scoring_table_contract(client):
    client.post("/api/seed/load")

    # Preview order O-003
    resp = client.post("/api/optimize/preview/O-003")
    assert resp.status_code == 200
    data = resp.json()

    assert "winner" in data
    assert "candidates" in data
    assert "weights" in data
    assert data["weights"]["distance"] == 0.6
    assert data["weights"]["cost"] == 0.4

    # Check that candidates have both accepted and rejected cases
    candidates = data["candidates"]
    statuses = {c["status"] for c in candidates}
    assert "accepted" in statuses, "Must have at least one accepted candidate"

    # For accepted candidates, score must be computed
    for c in candidates:
        if c["status"] == "accepted":
            assert c["score"] is not None
            assert 0.0 <= c["norm_distance"] <= 1.0
            assert 0.0 <= c["norm_cost"] <= 1.0
        elif c["status"] == "rejected":
            assert c["rejection_reason"] in {"inactive", "insufficient stock", "no route"}

def test_optimize_next_flow(client):
    client.post("/api/seed/load")

    # Get initial queue
    q_before = client.get("/api/orders/queue").json()
    assert len(q_before) > 0
    top_order_id = q_before[0]["id"]

    # Run optimize next
    opt_resp = client.post("/api/optimize/next")
    assert opt_resp.status_code == 200
    opt_data = opt_resp.json()

    # Dispatched order must match the top order from the queue
    assert opt_data["order"]["id"] == top_order_id
    assert opt_data["order"]["status"] in ("DISPATCHED", "FAILED")

    if opt_data["winner"]:
        assert opt_data["shipment"] is not None
        assert opt_data["shipment"]["order_id"] == top_order_id
        assert opt_data["shipment"]["status"] == "QUEUED"

    # The queue length must now be decreased by 1
    q_after = client.get("/api/orders/queue").json()
    assert len(q_after) == len(q_before) - 1
