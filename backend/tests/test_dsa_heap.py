"""Unit tests for hand-written MinHeap data structure."""
import pytest
from app.dsa.min_heap import MinHeap

def test_min_heap_basic_operations():
    heap = MinHeap()
    assert len(heap) == 0
    assert not heap

    # Insert out-of-order numbers
    values = [5, 3, 8, 1, 9, 2]
    for v in values:
        heap.push(v)

    assert len(heap) == 6
    assert heap.peek() == 1

    # Extract in ascending order
    extracted = []
    while heap:
        extracted.append(heap.pop())

    assert extracted == [1, 2, 3, 5, 8, 9]

def test_min_heap_custom_key():
    # Tuples: (priority, created_at)
    heap = MinHeap(key_fn=lambda x: (x["priority"], x["created_at"]))

    heap.push({"id": "O-3", "priority": 3, "created_at": "2026-10-27T10:00:00Z"})
    heap.push({"id": "O-1b", "priority": 1, "created_at": "2026-10-27T11:00:00Z"})
    heap.push({"id": "O-1a", "priority": 1, "created_at": "2026-10-27T10:30:00Z"})
    heap.push({"id": "O-2", "priority": 2, "created_at": "2026-10-27T09:00:00Z"})

    # Priority 1 items must come before Priority 2 and 3
    # Among Priority 1 items, earlier created_at (10:30) comes before 11:00
    first = heap.pop()
    assert first["id"] == "O-1a"

    second = heap.pop()
    assert second["id"] == "O-1b"

    third = heap.pop()
    assert third["id"] == "O-2"

    fourth = heap.pop()
    assert fourth["id"] == "O-3"

def test_min_heap_ops_logging():
    heap = MinHeap(record_ops=True)
    heap.push(10)
    heap.push(5)
    heap.pop()

    assert len(heap.ops_log) == 3
    assert heap.ops_log[0]["op"] == "push"
    assert heap.ops_log[1]["op"] == "push"
    assert heap.ops_log[2]["op"] == "pop"
