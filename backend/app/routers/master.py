"""Master entity CRUD routers for Products, Suppliers, and Warehouses.

Strict layering: validates requests via Pydantic, delegates to SupplyChainService,
and returns clean JSON with correct HTTP status codes.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.entities import (
    Product, ProductCreate,
    Supplier, SupplierCreate,
    Warehouse, WarehouseCreate,
)
from app.services.supply_chain import service

router = APIRouter(prefix="/api", tags=["Master Entities"])

# --- Products ---

@router.get("/products", response_model=list[Product])
def list_products(
    search: Optional[str] = Query(None, description="Search query for name, SKU, or category"),
    sort_by: Optional[str] = Query(None, description="Field to sort by"),
    order: str = Query("asc", description="Sort direction (asc/desc)"),
):
    return service.list_products(search=search, sort_by=sort_by, order=order)

@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    p = service.get_product(product_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return p

@router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    try:
        return service.create_product(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductCreate):
    try:
        return service.update_product(product_id, payload)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: str):
    success = service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return {"status": "deleted", "id": product_id}

# --- Suppliers ---

@router.get("/suppliers", response_model=list[Supplier])
def list_suppliers(
    search: Optional[str] = Query(None, description="Search query for name or city"),
    sort_by: Optional[str] = Query(None, description="Field to sort by"),
    order: str = Query("asc", description="Sort direction (asc/desc)"),
):
    return service.list_suppliers(search=search, sort_by=sort_by, order=order)

@router.get("/suppliers/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: str):
    s = service.get_supplier(supplier_id)
    if not s:
        raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found.")
    return s

@router.post("/suppliers", response_model=Supplier, status_code=status.HTTP_201_CREATED)
def create_supplier(payload: SupplierCreate):
    try:
        return service.create_supplier(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/suppliers/{supplier_id}", response_model=Supplier)
def update_supplier(supplier_id: str, payload: SupplierCreate):
    try:
        return service.update_supplier(supplier_id, payload)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/suppliers/{supplier_id}", status_code=status.HTTP_200_OK)
def delete_supplier(supplier_id: str):
    try:
        success = service.delete_supplier(supplier_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Supplier '{supplier_id}' not found.")
        return {"status": "deleted", "id": supplier_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Warehouses ---

@router.get("/warehouses", response_model=list[Warehouse])
def list_warehouses(
    search: Optional[str] = Query(None, description="Search query for name or city"),
    sort_by: Optional[str] = Query(None, description="Field to sort by"),
    order: str = Query("asc", description="Sort direction (asc/desc)"),
):
    return service.list_warehouses(search=search, sort_by=sort_by, order=order)

@router.get("/warehouses/{warehouse_id}", response_model=Warehouse)
def get_warehouse(warehouse_id: str):
    w = service.get_warehouse(warehouse_id)
    if not w:
        raise HTTPException(status_code=404, detail=f"Warehouse '{warehouse_id}' not found.")
    return w

@router.post("/warehouses", response_model=Warehouse, status_code=status.HTTP_201_CREATED)
def create_warehouse(payload: WarehouseCreate):
    try:
        return service.create_warehouse(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/warehouses/{warehouse_id}", response_model=Warehouse)
def update_warehouse(warehouse_id: str, payload: WarehouseCreate):
    try:
        return service.update_warehouse(warehouse_id, payload)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/warehouses/{warehouse_id}", status_code=status.HTTP_200_OK)
def delete_warehouse(warehouse_id: str):
    success = service.delete_warehouse(warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Warehouse '{warehouse_id}' not found.")
    return {"status": "deleted", "id": warehouse_id}

# --- Seed Reset ---

@router.post("/seed/load", status_code=status.HTTP_200_OK)
def load_seed():
    """Reloads standard seed dataset into store and memory."""
    raw = service.reset_seed()
    return {"status": "ok", "message": "Demo seed data reloaded successfully", "summary": service.get_dashboard_summary()}
