"""Order and Shipment API routers for ISCOS.

Provides:
- POST /api/orders (push into pending priority MinHeap)
- GET /api/orders
- GET /api/orders/{id}
- GET /api/orders/queue (orders in pop order: urgent first, then oldest)
- GET /api/shipments
- GET /api/shipments/queue (FIFO deque)
- POST /api/shipments/advance (QUEUED -> IN_TRANSIT -> DELIVERED)
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas.entities import OrderCreate
from app.services.supply_chain import service

router = APIRouter(prefix="/api", tags=["Orders & Shipments"])

# --- Orders ---

@router.get("/orders")
def list_orders():
    """List all registered orders."""
    return service.list_orders()

@router.get("/orders/queue")
def get_orders_queue():
    """Returns pending orders in pop priority order (Priority 1 urgent first, then arrival time)."""
    return service.get_order_queue()

@router.get("/orders/{order_id}")
def get_order(order_id: str):
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    return order

@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate):
    try:
        return service.create_order(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Shipments ---

@router.get("/shipments")
def list_shipments():
    """List all historical shipments."""
    return service.list_shipments()

@router.get("/shipments/queue")
def get_shipments_queue():
    """List currently active shipments in FIFO deque order."""
    return service.get_shipment_queue()

@router.post("/shipments/advance", status_code=status.HTTP_200_OK)
def advance_shipment():
    """Advances the head shipment in the FIFO queue (QUEUED -> IN_TRANSIT, IN_TRANSIT -> DELIVERED)."""
    try:
        return service.advance_shipment()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
