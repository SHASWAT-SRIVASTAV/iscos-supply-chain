"""Optimizer API endpoints for ISCOS.

Provides:
- POST /api/optimize/next: pops top order from MinHeap, runs multi-criteria scoring, reserves stock, creates shipment, and dispatches order.
- POST /api/optimize/preview/{order_id}: scoring simulation without state changes.
"""
from fastapi import APIRouter, HTTPException, status
from app.services.supply_chain import service

router = APIRouter(prefix="/api/optimize", tags=["Optimizer"])

@router.post("/next", status_code=status.HTTP_200_OK)
def optimize_next():
    """Pops the most urgent pending order and optimizes warehouse selection."""
    try:
        return service.optimize_next()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/preview/{order_id}", status_code=status.HTTP_200_OK)
def optimize_preview(order_id: str):
    """Simulates warehouse evaluation table for an order without altering inventory or status."""
    try:
        return service.optimize_preview(order_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
