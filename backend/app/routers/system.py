"""System router for health and architecture endpoints."""
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["System"])

@router.get("/meta/architecture")
def get_architecture_meta():
    """Returns architecture overview, layer definitions, and algorithm complexity notes."""
    return {
        "system": "ISCOS",
        "description": "Intelligent Supply Chain Optimization System",
        "layers": [
            {"layer": "Frontend", "tech": "React 18 + Vite + Tailwind + Framer Motion"},
            {"layer": "API", "tech": "FastAPI with Pydantic validation"},
            {"layer": "Service", "tech": "SupplyChainService (state coordination and mutation)"},
            {"layer": "DSA Core", "tech": "Pure Python hand-crafted algorithms without external libraries"},
            {"layer": "Storage", "tech": "JSON File Persistence (store.json / seed.json)"},
        ],
        "dsa_registry": [
            {"structure": "HashRegistry", "file": "app/dsa/hash_registry.py", "time": "O(1) avg", "space": "O(N)", "role": "Entity lookups"},
            {"structure": "MinHeap", "file": "app/dsa/min_heap.py", "time": "push/pop O(log N), peek O(1)", "space": "O(N)", "role": "Order priority & Dijkstra frontier"},
            {"structure": "ShipmentQueue", "file": "app/dsa/shipment_queue.py", "time": "O(1)", "space": "O(N)", "role": "FIFO dispatch queue"},
            {"structure": "RouteGraph", "file": "app/dsa/route_graph.py", "time": "Dijkstra O((V+E)log V), BFS O(V+E)", "space": "O(V+E)", "role": "Road network & pathfinding"},
            {"structure": "MergeSort", "file": "app/dsa/sorting.py", "time": "O(N log N)", "space": "O(N)", "role": "Stable entity sorting"},
            {"structure": "BinarySearch", "file": "app/dsa/searching.py", "time": "O(log N)", "space": "O(1)", "role": "SKU / name lookup on sorted data"},
            {"structure": "Optimizer", "file": "app/dsa/optimizer.py", "time": "O(W * (V+E) log V)", "space": "O(W + V)", "role": "Explainable multi-criteria warehouse selection"},
        ]
    }

@router.get("/dashboard/summary")
def get_dashboard_summary():
    """Returns real-time counts and health metrics for the dashboard KPI cards."""
    from app.services.supply_chain import service
    return service.get_dashboard_summary()

@router.get("/benchmarks/dijkstra")
def get_benchmarks(sizes: str = "50,100,200,400,800"):
    """Runs empirical runtime scaling benchmarks on synthetic connected graphs."""
    from app.services.benchmark import run_dijkstra_benchmarks
    try:
        size_list = [int(s.strip()) for s in sizes.split(",") if s.strip()]
        return run_dijkstra_benchmarks(size_list)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid sizes parameter: {e}")


