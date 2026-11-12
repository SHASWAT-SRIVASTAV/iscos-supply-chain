"""Routes and Algorithm Lab API endpoints for ISCOS.

Provides:
- GET /api/routes/graph: Returns road nodes and edges
- GET /api/routes/shortest: Dijkstra shortest path between two cities
- GET /api/lab/dijkstra: Route calculation with full step-by-step trace
- GET /api/lab/heap-demo: MinHeap ops log recording sift-up and sift-down swaps
"""
from fastapi import APIRouter, HTTPException, Query
from app.services.supply_chain import service

router = APIRouter(prefix="/api", tags=["Routes & Algorithm Lab"])

@router.get("/routes/graph")
def get_routes_graph():
    """Returns network graph nodes and weighted edges."""
    return service.get_routes_graph()

@router.get("/routes/shortest")
def get_shortest_route(
    from_city: str = Query(..., alias="from", description="Origin city name"),
    to_city: str = Query(..., alias="to", description="Destination city name"),
):
    """Computes shortest path between two cities using Dijkstra algorithm."""
    try:
        return service.get_shortest_route(from_city, to_city)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/lab/dijkstra")
def get_lab_dijkstra(
    from_city: str = Query(..., alias="from", description="Origin city name"),
    to_city: str = Query(..., alias="to", description="Destination city name"),
):
    """Computes route and returns full step-by-step trace for interactive UI replay."""
    try:
        return service.get_lab_dijkstra(from_city, to_city)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/lab/heap-demo")
def get_lab_heap_demo(
    values: str = Query("5,3,8,1,9,2", description="Comma-separated numbers to insert and extract"),
):
    """Executes MinHeap operations recording element swaps for heap visualizer."""
    try:
        nums = [float(x.strip()) for x in values.split(",") if x.strip()]
        return service.get_lab_heap_demo(nums)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid numbers input: {e}")
