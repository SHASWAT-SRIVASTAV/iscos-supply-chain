"""Inventory and Low-Stock Alert routers for ISCOS.

Provides:
- GET /api/inventory (supports ?warehouse_id=)
- POST /api/inventory/adjust
- GET /api/alerts/low-stock (sorted by urgency ratio via MinHeap)
- GET /api/optimizer/restock (supplier-weighted restock suggestions)
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.entities import InventoryAdjustRequest
from app.services.supply_chain import service

router = APIRouter(prefix="/api", tags=["Inventory & Alerts"])

@router.get("/inventory")
def list_inventory(warehouse_id: Optional[str] = Query(None, description="Optional warehouse ID filter")):
    """Returns inventory levels enriched with available stock and product details."""
    return service.list_inventory(warehouse_id=warehouse_id)

@router.post("/inventory/adjust", status_code=status.HTTP_200_OK)
def adjust_inventory(payload: InventoryAdjustRequest):
    """Adjusts on-hand stock quantity. Validates non-negative available quantity."""
    try:
        return service.adjust_inventory(
            warehouse_id=payload.warehouse_id,
            product_id=payload.product_id,
            delta=payload.quantity_delta
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/alerts/low-stock")
def get_low_stock_alerts():
    """Returns inventory items where available stock <= reorder level.
    Ranked strictly by urgency ratio (available / reorder_level) via hand-written MinHeap.
    """
    return service.get_low_stock_alerts()

@router.get("/optimizer/restock")
def get_restock_suggestions():
    """Returns recommended restock orders with supplier score breakdowns."""
    return service.get_restock_suggestions()
