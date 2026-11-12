"""Pydantic schemas for ISCOS entities and validation rules.

Enforces:
- Short readable ID strings
- Non-empty names
- Non-negative quantities, prices, capacities, and costs
- Priority in range [1, 3] (1 = urgent, 3 = normal)
- Reliability rating in range [0.0, 1.0]
- Valid status enumerations
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    DISPATCHED = "DISPATCHED"
    FAILED = "FAILED"

class ShipmentStatus(str, Enum):
    QUEUED = "QUEUED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"

# --- Master Entities ---

class Product(BaseModel):
    id: str = Field(..., pattern=r"^P-\d+$", description="Product ID e.g. P-001")
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    unit_price: float = Field(..., ge=0.0)
    weight_kg: float = Field(..., ge=0.0)
    supplier_id: str = Field(..., pattern=r"^S-\d+$")

class ProductCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    unit_price: float = Field(..., ge=0.0)
    weight_kg: float = Field(..., ge=0.0)
    supplier_id: str = Field(..., pattern=r"^S-\d+$")

class Supplier(BaseModel):
    id: str = Field(..., pattern=r"^S-\d+$", description="Supplier ID e.g. S-001")
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    lead_time_days: int = Field(..., ge=1)
    price_rating: float = Field(..., ge=1.0, le=5.0)
    reliability: float = Field(..., ge=0.0, le=1.0)

class SupplierCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    lead_time_days: int = Field(..., ge=1)
    price_rating: float = Field(..., ge=1.0, le=5.0)
    reliability: float = Field(..., ge=0.0, le=1.0)

class Warehouse(BaseModel):
    id: str = Field(..., pattern=r"^W-\d+$", description="Warehouse ID e.g. W-001")
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    capacity: int = Field(..., ge=0)
    cost_per_km: float = Field(..., ge=0.0)
    active: bool = True

class WarehouseCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1)
    capacity: int = Field(..., ge=0)
    cost_per_km: float = Field(..., ge=0.0)
    active: bool = True

# --- Inventory ---

class InventoryItem(BaseModel):
    warehouse_id: str = Field(..., pattern=r"^W-\d+$")
    product_id: str = Field(..., pattern=r"^P-\d+$")
    quantity: int = Field(..., ge=0)
    reserved: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    reorder_quantity: int = Field(default=50, ge=1)

    @property
    def available(self) -> int:
        return max(0, self.quantity - self.reserved)

class InventoryAdjustRequest(BaseModel):
    warehouse_id: str
    product_id: str
    quantity_delta: int = Field(..., description="Positive to add stock, negative to consume stock")

# --- Orders ---

class OrderItem(BaseModel):
    product_id: str = Field(..., pattern=r"^P-\d+$")
    qty: int = Field(..., ge=1)

class Order(BaseModel):
    id: str = Field(..., pattern=r"^O-\d+$")
    customer_name: str = Field(..., min_length=1)
    destination_city: str = Field(..., min_length=1)
    items: list[OrderItem] = Field(..., min_length=1)
    priority: int = Field(..., ge=1, le=3, description="1 urgent, 2 medium, 3 normal")
    status: OrderStatus = OrderStatus.PENDING
    created_at: str
    failure_reason: Optional[str] = None

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1)
    destination_city: str = Field(..., min_length=1)
    items: list[OrderItem] = Field(..., min_length=1)
    priority: int = Field(default=3, ge=1, le=3)

# --- Shipments ---

class Shipment(BaseModel):
    id: str = Field(..., pattern=r"^SH-\d+$")
    order_id: str = Field(..., pattern=r"^O-\d+$")
    from_warehouse_id: str = Field(..., pattern=r"^W-\d+$")
    to_city: str
    route: list[str] = Field(..., min_length=1)
    distance_km: float = Field(..., ge=0.0)
    cost: float = Field(..., ge=0.0)
    status: ShipmentStatus = ShipmentStatus.QUEUED
    created_at: str
