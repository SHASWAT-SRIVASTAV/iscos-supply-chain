"""SupplyChainService owns business state and coordinates hand-written DSA with storage.

Follows python-backend strictly:
- No HTTP or FastAPI imports
- State is held in custom DSA (HashRegistry, MinHeap, etc.)
- Saves state after every mutation
"""
from datetime import datetime, timezone
from typing import Optional, Any
from app.dsa.hash_registry import HashRegistry
from app.dsa.min_heap import MinHeap
from app.dsa.shipment_queue import ShipmentQueue
from app.dsa.route_graph import RouteGraph
from app.schemas.entities import (
    Product, ProductCreate,
    Supplier, SupplierCreate,
    Warehouse, WarehouseCreate,
    InventoryItem, Order, OrderCreate, OrderStatus,
    Shipment, ShipmentStatus
)
from app.storage.store import Store

class SupplyChainService:
    def __init__(self, store: Optional[Store] = None) -> None:
        self.store = store or Store()
        self.products = HashRegistry[dict]()
        self.suppliers = HashRegistry[dict]()
        self.warehouses = HashRegistry[dict]()
        self.inventory: dict[tuple[str, str], dict] = {} # (warehouse_id, product_id) -> record
        self.orders = HashRegistry[dict]()
        self.order_queue = MinHeap[dict](key_fn=lambda o: (o["priority"], o["created_at"]))
        self.shipments: list[dict] = []
        self.shipment_queue = ShipmentQueue[dict]()
        self.cities: list[str] = []
        self.road_edges: list[dict] = []
        self.graph = RouteGraph()
        
        self.load_state()

    def load_state(self) -> None:
        """Loads state from storage layer into in-memory custom data structures."""
        raw = self.store.load()
        self.cities = list(raw.get("cities", []))
        self.road_edges = list(raw.get("road_edges", []))

        # Build RouteGraph
        self.graph = RouteGraph()
        for c in self.cities:
            self.graph.add_node(c)
        for e in self.road_edges:
            self.graph.add_edge(e["from"], e["to"], float(e["km"]))


        # Populate custom Hash Registries
        self.products.clear()
        for p in raw.get("products", []):
            self.products.set(p["id"], p)

        self.suppliers.clear()
        for s in raw.get("suppliers", []):
            self.suppliers.set(s["id"], s)

        self.warehouses.clear()
        for w in raw.get("warehouses", []):
            self.warehouses.set(w["id"], w)

        self.inventory.clear()
        for inv in raw.get("inventory", []):
            key = (inv["warehouse_id"], inv["product_id"])
            self.inventory[key] = inv

        self.orders.clear()
        self.order_queue.clear()
        for o in raw.get("orders", []):
            self.orders.set(o["id"], o)
            if o.get("status") == "PENDING":
                self.order_queue.push(o)

        self.shipments = list(raw.get("shipments", []))
        self.shipment_queue.clear()
        for sh in self.shipments:
            if sh.get("status") in ("QUEUED", "IN_TRANSIT"):
                self.shipment_queue.enqueue(sh)


    def serialize_state(self) -> dict[str, Any]:
        """Serializes current in-memory registries into a JSON-compatible dictionary."""
        return {
            "cities": self.cities,
            "road_edges": self.road_edges,
            "suppliers": self.suppliers.values(),
            "warehouses": self.warehouses.values(),
            "products": self.products.values(),
            "inventory": list(self.inventory.values()),
            "orders": self.orders.values(),
            "shipments": self.shipments,
        }

    def save_state(self) -> None:
        """Persists current state to JSON storage."""
        self.store.save(self.serialize_state())

    def reset_seed(self) -> dict[str, Any]:
        """Resets current state to initial factory seed dataset."""
        raw = self.store.reset()
        self.load_state()
        return raw

    # --- Product CRUD (O(1) lookups via HashRegistry) ---

    def list_products(
        self, 
        search: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        order: str = "asc"
    ) -> list[dict]:
        """Lists products with optional search query and key sorting."""
        items = self.products.values()
        if search:
            q = search.lower()
            items = [p for p in items if q in p["name"].lower() or q in p["sku"].lower() or q in p["category"].lower()]
        
        if sort_by and items and sort_by in items[0]:
            reverse = order.lower() == "desc"
            items = sorted(items, key=lambda x: x.get(sort_by) or "", reverse=reverse)
        return items

    def get_product(self, product_id: str) -> Optional[dict]:
        """Lookup product by ID using custom HashRegistry (O(1) average)."""
        return self.products.get(product_id)

    def create_product(self, data: ProductCreate) -> dict:
        """Creates and stores a product, verifying supplier exists."""
        if not self.suppliers.has(data.supplier_id):
            raise ValueError(f"Supplier '{data.supplier_id}' does not exist.")

        # Generate next ID if not provided
        if not data.id:
            existing_nums = [int(p["id"].split("-")[1]) for p in self.products.values() if p["id"].startswith("P-")]
            next_num = max(existing_nums, default=0) + 1
            prod_id = f"P-{next_num:03d}"
        else:
            prod_id = data.id
            if self.products.has(prod_id):
                raise ValueError(f"Product ID '{prod_id}' already exists.")

        record = {
            "id": prod_id,
            "name": data.name,
            "sku": data.sku,
            "category": data.category,
            "unit_price": data.unit_price,
            "weight_kg": data.weight_kg,
            "supplier_id": data.supplier_id,
        }
        self.products.set(prod_id, record)
        self.save_state()
        return record

    def update_product(self, product_id: str, data: ProductCreate) -> dict:
        """Updates an existing product."""
        if not self.products.has(product_id):
            raise KeyError(f"Product '{product_id}' not found.")
        if not self.suppliers.has(data.supplier_id):
            raise ValueError(f"Supplier '{data.supplier_id}' does not exist.")

        record = {
            "id": product_id,
            "name": data.name,
            "sku": data.sku,
            "category": data.category,
            "unit_price": data.unit_price,
            "weight_kg": data.weight_kg,
            "supplier_id": data.supplier_id,
        }
        self.products.set(product_id, record)
        self.save_state()
        return record

    def delete_product(self, product_id: str) -> bool:
        """Deletes a product and its associated inventory records."""
        if not self.products.has(product_id):
            return False
        self.products.delete(product_id)
        # Remove inventory for this product
        keys_to_remove = [k for k in self.inventory if k[1] == product_id]
        for k in keys_to_remove:
            del self.inventory[k]
        self.save_state()
        return True

    # --- Supplier CRUD (O(1) lookups via HashRegistry) ---

    def list_suppliers(
        self, 
        search: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        order: str = "asc"
    ) -> list[dict]:
        items = self.suppliers.values()
        if search:
            q = search.lower()
            items = [s for s in items if q in s["name"].lower() or q in s["city"].lower()]
        if sort_by and items and sort_by in items[0]:
            reverse = order.lower() == "desc"
            items = sorted(items, key=lambda x: x.get(sort_by) or "", reverse=reverse)
        return items

    def get_supplier(self, supplier_id: str) -> Optional[dict]:
        return self.suppliers.get(supplier_id)

    def create_supplier(self, data: SupplierCreate) -> dict:
        if not data.id:
            existing_nums = [int(s["id"].split("-")[1]) for s in self.suppliers.values() if s["id"].startswith("S-")]
            next_num = max(existing_nums, default=0) + 1
            sup_id = f"S-{next_num:03d}"
        else:
            sup_id = data.id
            if self.suppliers.has(sup_id):
                raise ValueError(f"Supplier ID '{sup_id}' already exists.")

        record = {
            "id": sup_id,
            "name": data.name,
            "city": data.city,
            "lead_time_days": data.lead_time_days,
            "price_rating": data.price_rating,
            "reliability": data.reliability,
        }
        self.suppliers.set(sup_id, record)
        self.save_state()
        return record

    def update_supplier(self, supplier_id: str, data: SupplierCreate) -> dict:
        if not self.suppliers.has(supplier_id):
            raise KeyError(f"Supplier '{supplier_id}' not found.")
        record = {
            "id": supplier_id,
            "name": data.name,
            "city": data.city,
            "lead_time_days": data.lead_time_days,
            "price_rating": data.price_rating,
            "reliability": data.reliability,
        }
        self.suppliers.set(supplier_id, record)
        self.save_state()
        return record

    def delete_supplier(self, supplier_id: str) -> bool:
        # Check if any products reference this supplier
        if any(p["supplier_id"] == supplier_id for p in self.products.values()):
            raise ValueError(f"Cannot delete supplier '{supplier_id}' as products reference it.")
        deleted = self.suppliers.delete(supplier_id)
        if deleted:
            self.save_state()
        return deleted

    # --- Inventory & Low-Stock Alerts (M2) ---

    def list_inventory(self, warehouse_id: Optional[str] = None) -> list[dict]:
        """Returns inventory list with enriched entity details and computed availability."""
        rows = []
        for (w_id, p_id), item in self.inventory.items():
            if warehouse_id and w_id != warehouse_id:
                continue
            
            p = self.products.get(p_id) or {}
            w = self.warehouses.get(w_id) or {}
            qty = item.get("quantity", 0)
            res = item.get("reserved", 0)
            avail = max(0, qty - res)
            reorder = item.get("reorder_level", 10)

            rows.append({
                "warehouse_id": w_id,
                "warehouse_name": w.get("name", w_id),
                "warehouse_city": w.get("city", ""),
                "product_id": p_id,
                "product_name": p.get("name", p_id),
                "product_sku": p.get("sku", ""),
                "quantity": qty,
                "reserved": res,
                "available": avail,
                "reorder_level": reorder,
                "reorder_quantity": item.get("reorder_quantity", 50),
                "is_low_stock": avail <= reorder,
            })
        return rows

    def adjust_inventory(self, warehouse_id: str, product_id: str, delta: int) -> dict:
        """Adjusts on-hand inventory quantity for a warehouse and product.
        
        Validates that available stock does not drop below 0 or below reserved stock.
        """
        key = (warehouse_id, product_id)
        if key not in self.inventory:
            # If item not yet tracked, initialize if product and warehouse exist
            if not self.warehouses.has(warehouse_id):
                raise ValueError(f"Warehouse '{warehouse_id}' does not exist.")
            if not self.products.has(product_id):
                raise ValueError(f"Product '{product_id}' does not exist.")
            self.inventory[key] = {
                "warehouse_id": warehouse_id,
                "product_id": product_id,
                "quantity": 0,
                "reserved": 0,
                "reorder_level": 15,
                "reorder_quantity": 50,
            }

        item = self.inventory[key]
        new_qty = item["quantity"] + delta
        if new_qty < 0:
            raise ValueError(f"Insufficient stock to deduct {abs(delta)}. Current quantity is {item['quantity']}.")
        if new_qty < item["reserved"]:
            raise ValueError(f"Cannot adjust stock below reserved quantity ({item['reserved']}). Target quantity: {new_qty}.")

        item["quantity"] = new_qty
        self.save_state()
        return self.list_inventory(warehouse_id=warehouse_id)[0]

    def get_low_stock_alerts(self) -> list[dict]:
        """Produces a low-stock alert list ranked by urgency using a custom MinHeap.
        
        Urgency is defined as available / reorder_level (lower ratio = more critically depleted).
        Time Complexity: O(N log N) via MinHeap drain
        Space Complexity: O(N)
        """
        from app.dsa.min_heap import MinHeap

        heap = MinHeap(key_fn=lambda x: x["urgency_ratio"])
        
        for (w_id, p_id), item in self.inventory.items():
            qty = item.get("quantity", 0)
            res = item.get("reserved", 0)
            avail = max(0, qty - res)
            reorder = max(1, item.get("reorder_level", 10))

            if avail <= reorder:
                p = self.products.get(p_id) or {}
                w = self.warehouses.get(w_id) or {}
                ratio = round(avail / reorder, 4)

                heap.push({
                    "warehouse_id": w_id,
                    "warehouse_name": w.get("name", w_id),
                    "warehouse_city": w.get("city", ""),
                    "product_id": p_id,
                    "product_name": p.get("name", p_id),
                    "product_sku": p.get("sku", ""),
                    "quantity": qty,
                    "reserved": res,
                    "available": avail,
                    "reorder_level": reorder,
                    "reorder_quantity": item.get("reorder_quantity", 50),
                    "urgency_ratio": ratio,
                    "deficiency": reorder - avail,
                })

        return heap.to_sorted_list()

    def get_restock_suggestions(self) -> list[dict]:
        """Generates restock suggestions for low-stock items evaluated against supplier metrics.
        
        Weighted supplier score formula:
        score = 0.4 * reliability + 0.3 * (price_rating / 5.0) + 0.3 * (1.0 / lead_time_days)
        """
        low_stock = self.get_low_stock_alerts()
        suggestions = []

        for alert in low_stock:
            prod = self.products.get(alert["product_id"])
            if not prod:
                continue

            supplier = self.suppliers.get(prod.get("supplier_id"))
            if supplier:
                rel = supplier.get("reliability", 0.9)
                price_norm = supplier.get("price_rating", 3.0) / 5.0
                lead_time = max(1, supplier.get("lead_time_days", 1))
                speed_score = min(1.0, 3.0 / lead_time) # 3 days or fewer = 1.0

                score = round(0.4 * rel + 0.3 * price_norm + 0.3 * speed_score, 3)
                suggestions.append({
                    "product_id": alert["product_id"],
                    "product_name": alert["product_name"],
                    "warehouse_id": alert["warehouse_id"],
                    "warehouse_name": alert["warehouse_name"],
                    "suggested_order_qty": alert["reorder_quantity"],
                    "primary_supplier": supplier,
                    "supplier_score": score,
                    "score_breakdown": {
                        "weights": {"reliability": 0.4, "price_rating": 0.3, "lead_time": 0.3},
                        "reliability_val": rel,
                        "price_val": price_norm,
                        "speed_val": round(speed_score, 3),
                    }
                })

        return suggestions

    # --- Warehouse CRUD (O(1) lookups via HashRegistry) ---

    def list_warehouses(
        self, 
        search: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        order: str = "asc"
    ) -> list[dict]:
        items = self.warehouses.values()
        if search:
            q = search.lower()
            items = [w for w in items if q in w["name"].lower() or q in w["city"].lower()]
        if sort_by and items and sort_by in items[0]:
            reverse = order.lower() == "desc"
            items = sorted(items, key=lambda x: x.get(sort_by) or "", reverse=reverse)
        return items

    def get_warehouse(self, warehouse_id: str) -> Optional[dict]:
        return self.warehouses.get(warehouse_id)

    def create_warehouse(self, data: WarehouseCreate) -> dict:
        if not data.id:
            existing_nums = [int(w["id"].split("-")[1]) for w in self.warehouses.values() if w["id"].startswith("W-")]
            next_num = max(existing_nums, default=0) + 1
            wh_id = f"W-{next_num:03d}"
        else:
            wh_id = data.id
            if self.warehouses.has(wh_id):
                raise ValueError(f"Warehouse ID '{wh_id}' already exists.")

        record = {
            "id": wh_id,
            "name": data.name,
            "city": data.city,
            "capacity": data.capacity,
            "cost_per_km": data.cost_per_km,
            "active": data.active,
        }
        self.warehouses.set(wh_id, record)
        self.save_state()
        return record

    def update_warehouse(self, warehouse_id: str, data: WarehouseCreate) -> dict:
        if not self.warehouses.has(warehouse_id):
            raise KeyError(f"Warehouse '{warehouse_id}' not found.")
        record = {
            "id": warehouse_id,
            "name": data.name,
            "city": data.city,
            "capacity": data.capacity,
            "cost_per_km": data.cost_per_km,
            "active": data.active,
        }
        self.warehouses.set(warehouse_id, record)
        self.save_state()
        return record

    def delete_warehouse(self, warehouse_id: str) -> bool:
        if not self.warehouses.has(warehouse_id):
            return False
        self.warehouses.delete(warehouse_id)
        # Clean up inventory in this warehouse
        keys_to_remove = [k for k in self.inventory if k[0] == warehouse_id]
        for k in keys_to_remove:
            del self.inventory[k]
        self.save_state()
        return True

    # --- Orders & MinHeap Queue (M3) ---

    def list_orders(self) -> list[dict]:
        """Returns all orders from the HashRegistry."""
        return self.orders.values()

    def get_order(self, order_id: str) -> Optional[dict]:
        """Lookup order by ID from HashRegistry in O(1) average time."""
        return self.orders.get(order_id)

    def create_order(self, data: OrderCreate) -> dict:
        """Creates order, validates city & product IDs, pushes to MinHeap queue."""
        if self.cities and data.destination_city not in self.cities:
            raise ValueError(f"Destination city '{data.destination_city}' is not in the road network.")

        for item in data.items:
            if not self.products.has(item.product_id):
                raise ValueError(f"Product '{item.product_id}' does not exist.")

        # Generate order ID
        existing_nums = [int(o["id"].split("-")[1]) for o in self.orders.values() if o["id"].startswith("O-")]
        next_num = max(existing_nums, default=0) + 1
        order_id = f"O-{next_num:03d}"

        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        record = {
            "id": order_id,
            "customer_name": data.customer_name,
            "destination_city": data.destination_city,
            "items": [it.model_dump() for it in data.items],
            "priority": data.priority,
            "status": "PENDING",
            "created_at": now_iso,
            "failure_reason": None,
        }

        self.orders.set(order_id, record)
        self.order_queue.push(record)
        self.save_state()
        return record

    def get_order_queue(self) -> list[dict]:
        """Returns pending orders in pop priority order (urgent first, then oldest).
        
        Time Complexity: O(N log N)
        Space Complexity: O(N)
        """
        return self.order_queue.to_sorted_list()

    # --- Shipments & FIFO Deque (M3) ---

    def list_shipments(self) -> list[dict]:
        """Returns all historical and active shipments."""
        return list(self.shipments)

    def get_shipment_queue(self) -> list[dict]:
        """Returns currently active shipments in FIFO deque order."""
        return self.shipment_queue.to_list()

    def advance_shipment(self) -> dict:
        """Dequeues head shipment from FIFO queue:
        QUEUED -> IN_TRANSIT (re-enqueued)
        IN_TRANSIT -> DELIVERED (leaves queue)
        """
        if self.shipment_queue.is_empty():
            raise ValueError("No active shipments in the dispatch queue to advance.")

        head = self.shipment_queue.dequeue()
        cur_status = head.get("status")

        if cur_status == "QUEUED":
            next_status = "IN_TRANSIT"
            head["status"] = next_status
            self.shipment_queue.enqueue(head)
        elif cur_status == "IN_TRANSIT":
            next_status = "DELIVERED"
            head["status"] = next_status
        else:
            next_status = "DELIVERED"
            head["status"] = next_status

        # Update in master shipments list
        for idx, sh in enumerate(self.shipments):
            if sh["id"] == head["id"]:
                self.shipments[idx]["status"] = next_status
                break

        self.save_state()
        return head

    # --- Graph, Shortest Path & Algorithm Lab (M4 & M8) ---

    def get_routes_graph(self) -> dict[str, Any]:
        """Returns nodes and road edges forming the logistics network."""
        return {
            "cities": self.cities,
            "road_edges": self.road_edges,
            "warehouses": [
                {"id": w["id"], "name": w["name"], "city": w["city"]}
                for w in self.warehouses.values()
            ]
        }

    def get_shortest_route(self, from_city: str, to_city: str) -> dict[str, Any]:
        """Calculates shortest path using Dijkstra algorithm."""
        if from_city not in self.cities:
            raise ValueError(f"Origin city '{from_city}' not found in road network.")
        if to_city not in self.cities:
            raise ValueError(f"Destination city '{to_city}' not found in road network.")
        return self.graph.dijkstra(from_city, to_city, trace=False)

    def get_lab_dijkstra(self, from_city: str, to_city: str) -> dict[str, Any]:
        """Calculates route and produces complete step-by-step trace log for Algorithm Lab."""
        if from_city not in self.cities:
            raise ValueError(f"Origin city '{from_city}' not found in road network.")
        if to_city not in self.cities:
            raise ValueError(f"Destination city '{to_city}' not found in road network.")
        return self.graph.dijkstra(from_city, to_city, trace=True)

    def get_lab_heap_demo(self, values: list[float]) -> dict[str, Any]:
        """Executes MinHeap push/pop sequence recording exact sift-up / sift-down operations."""
        heap = MinHeap[float](record_ops=True)
        for v in values:
            heap.push(v)
        extracted = []
        while heap:
            extracted.append(heap.pop())
        return {
            "input_values": values,
            "sorted_output": extracted,
            "ops_log": heap.ops_log,
        }

    # --- Optimizer Flow (M5 & M7) ---

    def optimize_preview(self, order_id: str) -> dict[str, Any]:
        """Runs candidate evaluation for an order without mutating state or reserving stock."""
        from app.dsa.optimizer import evaluate_order_candidates
        from app.config import WEIGHT_DISTANCE, WEIGHT_COST, HANDLING_FEE

        order = self.orders.get(order_id)
        if not order:
            raise KeyError(f"Order '{order_id}' not found.")

        result = evaluate_order_candidates(
            order=order,
            warehouses=self.warehouses.values(),
            inventory_map=self.inventory,
            graph=self.graph,
            weight_distance=WEIGHT_DISTANCE,
            weight_cost=WEIGHT_COST,
            handling_fee=HANDLING_FEE,
        )
        result["order"] = order
        return result

    def optimize_next(self) -> dict[str, Any]:
        """Pops highest priority order from MinHeap, optimizes warehouse selection,
        reserves inventory, dispatches order, and enqueues shipment.
        """
        from app.dsa.optimizer import evaluate_order_candidates
        from app.config import WEIGHT_DISTANCE, WEIGHT_COST, HANDLING_FEE

        if not self.order_queue:
            raise ValueError("No pending orders available in the queue for optimization.")

        # Pop top order from MinHeap
        order = self.order_queue.pop()
        order_id = order["id"]

        result = evaluate_order_candidates(
            order=order,
            warehouses=self.warehouses.values(),
            inventory_map=self.inventory,
            graph=self.graph,
            weight_distance=WEIGHT_DISTANCE,
            weight_cost=WEIGHT_COST,
            handling_fee=HANDLING_FEE,
        )

        winner = result.get("winner")
        created_shipment = None

        if winner:
            # 1. Reserve stock in winning warehouse
            w_id = winner["warehouse_id"]
            for line in order["items"]:
                p_id = line["product_id"]
                req_qty = line["qty"]
                inv = self.inventory.get((w_id, p_id))
                if inv:
                    inv["reserved"] = inv.get("reserved", 0) + req_qty

            # 2. Update order to DISPATCHED
            order["status"] = "DISPATCHED"
            order["failure_reason"] = None
            self.orders.set(order_id, order)

            # 3. Create Shipment
            existing_sh_nums = [int(s["id"].split("-")[1]) for s in self.shipments if s["id"].startswith("SH-")]
            next_sh_num = max(existing_sh_nums, default=0) + 1
            sh_id = f"SH-{next_sh_num:03d}"
            now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

            created_shipment = {
                "id": sh_id,
                "order_id": order_id,
                "from_warehouse_id": w_id,
                "to_city": order["destination_city"],
                "route": winner["route"],
                "distance_km": winner["distance_km"],
                "cost": winner["cost"],
                "status": "QUEUED",
                "created_at": now_iso,
            }

            self.shipments.append(created_shipment)
            self.shipment_queue.enqueue(created_shipment)

        else:
            # No candidate could fulfill: set order to FAILED
            order["status"] = "FAILED"
            order["failure_reason"] = result.get("failure_reason", "insufficient stock")
            self.orders.set(order_id, order)

        self.save_state()

        result["order"] = order
        result["shipment"] = created_shipment
        return result

    # --- Dashboard Summary ---

    def get_dashboard_summary(self) -> dict[str, Any]:
        """Computes summary statistics for Dashboard KPIs."""
        total_orders = len(self.orders)
        pending_orders = sum(1 for o in self.orders.values() if o["status"] == "PENDING")
        dispatched_orders = sum(1 for o in self.orders.values() if o["status"] == "DISPATCHED")
        failed_orders = sum(1 for o in self.orders.values() if o["status"] == "FAILED")
        
        low_stock_items = [
            inv for inv in self.inventory.values() 
            if inv["quantity"] - inv.get("reserved", 0) <= inv["reorder_level"]
        ]

        active_warehouses = sum(1 for w in self.warehouses.values() if w.get("active", True))

        return {
            "orders": {
                "total": total_orders,
                "pending": pending_orders,
                "dispatched": dispatched_orders,
                "failed": failed_orders,
            },
            "inventory": {
                "total_rows": len(self.inventory),
                "low_stock_count": len(low_stock_items),
            },
            "warehouses": {
                "total": len(self.warehouses),
                "active": active_warehouses,
            },
            "shipments": {
                "total": len(self.shipments),
            }
        }

# Global singleton service instance
service = SupplyChainService()
