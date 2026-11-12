"""Multi-criteria Explainable Warehouse Selection Optimizer.

DSA-II College Prototype Hero Feature:
Evaluates warehouse fulfillment candidates against an order and destination:
1. Filters candidates: inactive ("inactive"), stock deficiency ("insufficient stock"),
   or graph disconnection ("no route").
2. Calculates shortest path distance using Dijkstra and estimated logistics cost:
   cost = distance_km * cost_per_km + handling_fee
3. Min-max normalizes distance and cost metrics across accepted candidates.
4. Computes explainable combined score: score = W_dist * norm_dist + W_cost * norm_cost (lower is better).
5. Breaks ties by lower distance, then lower warehouse ID.
6. Returns complete decision audit table for transparent viva demonstration.
"""
from typing import Any, Optional
from collections import Counter
from app.dsa.route_graph import RouteGraph

def evaluate_order_candidates(
    order: dict[str, Any],
    warehouses: list[dict[str, Any]],
    inventory_map: dict[tuple[str, str], dict[str, Any]],
    graph: RouteGraph,
    weight_distance: float = 0.6,
    weight_cost: float = 0.4,
    handling_fee: float = 50.0,
) -> dict[str, Any]:
    """Evaluates all warehouses as candidates to fulfill a pending order.
    
    Time Complexity:
        - Candidate filtering & stock check: O(W * Lines)
        - Path calculations for accepted: O(W_acc * (V + E) log V)
        - Normalization & scoring: O(W_acc)
        - Total: O(W * (V + E) log V)
    Space Complexity:
        - O(W + V)
        
    Args:
        order: Order dictionary with items [{product_id, qty}] and destination_city.
        warehouses: List of all warehouse entity dictionaries.
        inventory_map: Lookup map (warehouse_id, product_id) -> inventory record.
        graph: RouteGraph instance with road connections.
        weight_distance: Scoring weight for normalized route distance (default 0.6).
        weight_cost: Scoring weight for normalized logistics cost (default 0.4).
        handling_fee: Flat warehouse handling fee in currency units.
        
    Returns:
        Dictionary with:
        - winner: Optional[dict] of the winning warehouse candidate or None
        - candidates: list of all candidates (both accepted and rejected)
        - weights: scoring weights dict
        - failure_reason: Optional string if no candidate qualified
    """
    dest_city = order.get("destination_city", "")
    order_items = order.get("items", [])
    
    candidates: list[dict[str, Any]] = []
    accepted_candidates: list[dict[str, Any]] = []
    rejection_reasons: list[str] = []

    for wh in warehouses:
        wh_id = wh["id"]
        wh_city = wh["city"]
        wh_name = wh["name"]
        cost_per_km = float(wh.get("cost_per_km", 1.5))
        is_active = bool(wh.get("active", True))

        candidate = {
            "warehouse_id": wh_id,
            "warehouse_name": wh_name,
            "warehouse_city": wh_city,
            "cost_per_km": cost_per_km,
            "status": "accepted",
            "rejection_reason": None,
            "distance_km": None,
            "cost": None,
            "route": [],
            "norm_distance": 0.0,
            "norm_cost": 0.0,
            "score": None,
        }

        # 1. Check active status
        if not is_active:
            candidate["status"] = "rejected"
            candidate["rejection_reason"] = "inactive"
            candidates.append(candidate)
            rejection_reasons.append("inactive")
            continue

        # 2. Check stock sufficiency for every order line
        can_fulfill = True
        for line in order_items:
            p_id = line["product_id"]
            req_qty = line["qty"]
            inv_record = inventory_map.get((wh_id, p_id))
            if not inv_record:
                can_fulfill = False
                break
            available = inv_record.get("quantity", 0) - inv_record.get("reserved", 0)
            if available < req_qty:
                can_fulfill = False
                break

        if not can_fulfill:
            candidate["status"] = "rejected"
            candidate["rejection_reason"] = "insufficient stock"
            candidates.append(candidate)
            rejection_reasons.append("insufficient stock")
            continue

        # 3. Check road reachability via Dijkstra
        dijkstra_res = graph.dijkstra(wh_city, dest_city)
        if not dijkstra_res.get("reachable", False):
            candidate["status"] = "rejected"
            candidate["rejection_reason"] = "no route"
            candidates.append(candidate)
            rejection_reasons.append("no route")
            continue

        # Candidate is accepted!
        dist = float(dijkstra_res["distance"])
        cost = round(dist * cost_per_km + handling_fee, 2)
        candidate["distance_km"] = dist
        candidate["cost"] = cost
        candidate["route"] = dijkstra_res["path"]

        accepted_candidates.append(candidate)
        candidates.append(candidate)

    # If no accepted candidates exist, determine most common failure reason
    if not accepted_candidates:
        most_common_reason = "insufficient stock"
        if rejection_reasons:
            counts = Counter(rejection_reasons)
            most_common_reason = counts.most_common(1)[0][0]

        return {
            "winner": None,
            "candidates": candidates,
            "weights": {
                "distance": weight_distance,
                "cost": weight_cost,
                "handling_fee": handling_fee
            },
            "failure_reason": most_common_reason,
        }

    # Min-max normalization across accepted candidates
    distances = [c["distance_km"] for c in accepted_candidates]
    costs = [c["cost"] for c in accepted_candidates]

    min_dist, max_dist = min(distances), max(distances)
    min_cost, max_cost = min(costs), max(costs)

    for c in accepted_candidates:
        # Distance normalization (0.0 if all equal)
        if max_dist > min_dist:
            norm_dist = (c["distance_km"] - min_dist) / (max_dist - min_dist)
        else:
            norm_dist = 0.0

        # Cost normalization (0.0 if all equal)
        if max_cost > min_cost:
            norm_cost = (c["cost"] - min_cost) / (max_cost - min_cost)
        else:
            norm_cost = 0.0

        # Combined score: lower is better
        score = round(weight_distance * norm_dist + weight_cost * norm_cost, 4)
        c["norm_distance"] = round(norm_dist, 4)
        c["norm_cost"] = round(norm_cost, 4)
        c["score"] = score

    # Winner selection: lowest score -> tie breaker: lower distance -> lower warehouse ID
    accepted_candidates.sort(key=lambda c: (c["score"], c["distance_km"], c["warehouse_id"]))
    winner = accepted_candidates[0]

    return {
        "winner": winner,
        "candidates": candidates,
        "weights": {
            "distance": weight_distance,
            "cost": weight_cost,
            "handling_fee": handling_fee
        },
        "failure_reason": None,
    }
