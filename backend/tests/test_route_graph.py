"""Unit and Integration tests for RouteGraph, Dijkstra, BFS, and Trace Stepper (M4)."""
import pytest
from app.dsa.route_graph import RouteGraph

def test_route_graph_known_answer_dijkstra():
    g = RouteGraph()
    # Build known graph
    # Mumbai -> Pune (150)
    # Pune -> Bengaluru (840)
    # Mumbai -> Ahmedabad (525)
    # Ahmedabad -> Pune (660)
    g.add_edge("Mumbai", "Pune", 150)
    g.add_edge("Pune", "Bengaluru", 840)
    g.add_edge("Mumbai", "Ahmedabad", 525)
    g.add_edge("Ahmedabad", "Pune", 660)

    res = g.dijkstra("Mumbai", "Bengaluru")
    assert res["reachable"] is True
    assert res["distance"] == 990.0 # 150 + 840
    assert res["path"] == ["Mumbai", "Pune", "Bengaluru"]

def test_route_graph_unreachable_node():
    g = RouteGraph()
    g.add_edge("Delhi", "Mumbai", 1400)
    g.add_node("IslandCity") # Isolated

    res = g.dijkstra("Delhi", "IslandCity")
    assert res["reachable"] is False
    assert res["distance"] == float("inf")
    assert res["path"] == []

def test_route_graph_bfs_hops():
    g = RouteGraph()
    g.add_edge("A", "B", 10)
    g.add_edge("B", "C", 10)
    g.add_edge("A", "C", 50) # Longer distance but 1 hop

    bfs_res = g.bfs("A", "C")
    assert bfs_res["reachable"] is True
    assert bfs_res["hops"]["C"] == 1 # Direct 1 hop
    assert bfs_res["path"] == ["A", "C"]

def test_dijkstra_trace_shape_contract(client):
    """Verifies that /api/lab/dijkstra matches the exact trace specification contract."""
    client.post("/api/seed/load")
    resp = client.get("/api/lab/dijkstra?from=Mumbai&to=Bengaluru")
    assert resp.status_code == 200
    data = resp.json()

    assert data["reachable"] is True
    assert data["distance"] == 990.0
    assert data["path"] == ["Mumbai", "Pune", "Bengaluru"]
    assert "steps" in data
    assert len(data["steps"]) > 0

    valid_step_types = {"pop", "relax", "settle", "push", "done"}
    valid_states = {"unvisited", "in_heap", "current", "settled"}

    for step in data["steps"]:
        assert "step" in step
        assert step["type"] in valid_step_types, f"Invalid step type: {step['type']}"
        assert "current" in step
        assert "heap" in step
        assert "heap_array" in step
        assert "distances" in step
        assert "node_states" in step
        assert "explain" in step
        assert len(step["explain"]) > 5 # Plain English explanation present

        for city, state in step["node_states"].items():
            assert state in valid_states, f"Invalid node state '{state}' for city '{city}'"

def test_routes_endpoints(client):
    client.post("/api/seed/load")
    # Graph representation
    graph_resp = client.get("/api/routes/graph")
    assert graph_resp.status_code == 200
    assert len(graph_resp.json()["cities"]) == 8

    # Shortest path endpoint
    sp_resp = client.get("/api/routes/shortest?from=Delhi&to=Pune")
    assert sp_resp.status_code == 200
    assert sp_resp.json()["reachable"] is True
    assert sp_resp.json()["distance"] > 0
