# ISCOS REST API Specification

Base URL: `http://localhost:8000/api` (Root health at `http://localhost:8000/health`)

---

## 1. System & Architecture Endpoints

### `GET /health`
Returns server operational health status.
```json
{
  "status": "ok",
  "service": "iscos-backend",
  "version": "1.0.0"
}
```

### `GET /api/meta/architecture`
Returns architectural layering and registered DSA complexity metadata.
```json
{
  "system": "ISCOS",
  "layers": [
    { "layer": "Frontend", "tech": "React 18 + Vite + Tailwind" },
    { "layer": "API", "tech": "FastAPI with Pydantic validation" },
    { "layer": "Service", "tech": "SupplyChainService" },
    { "layer": "DSA Core", "tech": "Pure Python hand-crafted algorithms" },
    { "layer": "Storage", "tech": "JSON File Persistence" }
  ],
  "dsa_registry": [
    { "structure": "MinHeap", "time": "push/pop O(log N), peek O(1)", "space": "O(N)" },
    { "structure": "RouteGraph", "time": "Dijkstra O((V+E)log V), BFS O(V+E)", "space": "O(V+E)" }
  ]
}
```

### `GET /api/dashboard/summary`
Returns KPI metrics for mission control cards.
```json
{
  "orders": { "total": 8, "pending": 5, "dispatched": 2, "failed": 1 },
  "inventory": { "total_rows": 25, "low_stock_count": 6 },
  "warehouses": { "total": 5, "active": 5 },
  "shipments": { "total": 2 }
}
```

### `POST /api/seed/load`
Resets the store and memory registries to the standard initial seed dataset.

---

## 2. Master Entity CRUD

### `GET /api/products`
Query parameters: `search`, `sort_by`, `order` (asc/desc).
```json
[
  {
    "id": "P-001",
    "name": "Industrial IoT Sensor",
    "sku": "SEN-IOT-01",
    "category": "Sensors",
    "unit_price": 45.0,
    "weight_kg": 0.25,
    "supplier_id": "S-003"
  }
]
```

### `POST /api/products`
Creates a new product.
Request:
```json
{
  "name": "Precision Step Motor",
  "sku": "MOT-STP-04",
  "category": "Motors",
  "unit_price": 85.0,
  "weight_kg": 1.2,
  "supplier_id": "S-002"
}
```
Response: `201 Created` with generated ID `P-016`.

### `GET /api/suppliers` & `POST /api/suppliers`
Manages vendors with reliability ratings (0 to 1), lead times, and price ratings.

### `GET /api/warehouses` & `POST /api/warehouses`
Manages distribution hubs mapped to road network vertices.

---

## 3. Inventory & Low-Stock Alerts

### `GET /api/inventory?warehouse_id=W-001`
Returns stock matrix enriched with computed available stock and low-stock flag.
```json
[
  {
    "warehouse_id": "W-001",
    "warehouse_name": "Northern Mega Hub",
    "product_id": "P-002",
    "quantity": 8,
    "reserved": 0,
    "available": 8,
    "reorder_level": 15,
    "is_low_stock": true
  }
]
```

### `POST /api/inventory/adjust`
Adjusts stock on hand.
Request:
```json
{
  "warehouse_id": "W-001",
  "product_id": "P-001",
  "quantity_delta": 25
}
```

### `GET /api/alerts/low-stock`
Returns items sorted by urgency ratio `(available / reorder_level)` via hand-crafted `MinHeap`.

### `GET /api/optimizer/restock`
Returns restock order suggestions weighted by vendor reliability (0.4), price rating (0.3), and delivery speed (0.3).

---

## 4. Orders & Shipments

### `POST /api/orders`
Request:
```json
{
  "customer_name": "Bharat Electronics",
  "destination_city": "Bengaluru",
  "items": [{ "product_id": "P-001", "qty": 10 }],
  "priority": 1
}
```
Inserts order into registry and pushes to pending order `MinHeap`.

### `GET /api/orders/queue`
Returns pending orders in pop priority order (urgent P1 first, then arrival timestamp).

### `GET /api/shipments/queue`
Returns active shipments in FIFO deque order.

### `POST /api/shipments/advance`
Advances head shipment in FIFO queue: `QUEUED` $\to$ `IN_TRANSIT` $\to$ `DELIVERED`.

---

## 5. Optimizer & Algorithm Lab

### `POST /api/optimize/next`
Pops the highest priority order from the MinHeap queue, evaluates warehouse candidates, reserves stock, dispatches the order, and creates a shipment.
```json
{
  "order": { "id": "O-004", "destination_city": "Mumbai", "status": "DISPATCHED" },
  "winner": {
    "warehouse_id": "W-002",
    "warehouse_name": "West Coast Terminal",
    "distance_km": 0.0,
    "cost": 50.0,
    "score": 0.0,
    "route": ["Mumbai"]
  },
  "candidates": [ ... ],
  "shipment": { "id": "SH-003", "status": "QUEUED" }
}
```

### `POST /api/optimize/preview/{order_id}`
Simulates candidate evaluation and scoring table for an order without altering database state.

### `GET /api/routes/shortest?from=Delhi&to=Bengaluru`
Calculates shortest path using Dijkstra algorithm.

### `GET /api/lab/dijkstra?from=Delhi&to=Bengaluru`
Returns shortest path plus full step-by-step trace log with node states (`unvisited`, `in_heap`, `current`, `settled`) and plain-English step explanations for UI playback.

### `GET /api/lab/heap-demo?values=5,3,8,1`
Executes push and pop sequence recording exact swap pairs `[i, j]` for heap visualizer animation.

### `GET /api/benchmarks/dijkstra?sizes=50,100,200,400,800`
Returns empirical runtimes and theoretical $O((V+E)\log V)$ scaled curve.
