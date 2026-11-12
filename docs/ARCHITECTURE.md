# ISCOS System Architecture & Dataflow

## 1. Project Directory Layout
```
SupplyChain/
├── .agent/skills/       # Custom agent guidelines (DSA, Backend, Frontend, UI, Planning)
├── .gemini/GEMINI.md    # Project charter & viva explainability rules
├── backend/
│   ├── app/
│   │   ├── main.py      # FastAPI entry point & CORS configuration
│   │   ├── config.py    # Global paths, weights, and fee constants
│   │   ├── seed.py      # 8-city road network, 15 products, 5 warehouses, orders
│   │   ├── schemas/     # Pydantic v2 validation models
│   │   │   └── entities.py
│   │   ├── routers/     # API endpoints (system, master, inventory, orders, routes, optimize)
│   │   ├── services/    # State coordination (supply_chain.py, benchmark.py)
│   │   ├── storage/     # File persistence (store.py)
│   │   └── dsa/         # Hand-crafted pure Python DSA algorithms:
│   │       ├── hash_registry.py   # O(1) avg entity lookup
│   │       ├── min_heap.py        # O(log N) array binary heap with ops tracing
│   │       ├── shipment_queue.py  # O(1) FIFO dispatch deque
│   │       ├── route_graph.py     # O((V+E)log V) Dijkstra & O(V+E) BFS
│   │       ├── sorting.py         # O(N log N) stable merge sort
│   │       ├── searching.py       # O(log N) binary search
│   │       └── optimizer.py       # Explainable multi-criteria candidate scorer
│   ├── data/            # store.json & seed.json
│   ├── tests/           # 27+ comprehensive pytest unit and integration tests
│   ├── requirements.txt # Pinned Python dependencies
│   └── pytest.ini       # Pytest configuration
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Shell layout, theme provider, router, command palette
│   │   ├── main.jsx            # React root mount
│   │   ├── api/client.js       # Centralized typed HTTP API client
│   │   ├── assets/illustrations/ # Inline SVG components (Hero, Empty states, Logo)
│   │   ├── components/         # Sidebar, TopBar, Backdrop, StatusBadge, CommandPalette
│   │   ├── pages/              # Dashboard, Optimize, Orders, Inventory, Warehouses, 
│   │   │                       # Products, Suppliers, AlgorithmLab, Benchmarks, Architecture
│   │   └── styles/index.css    # CSS variables & design tokens mapped to Tailwind
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docs/                # Complete viva documentation deliverables & evidence
```

---

## 2. Layering Architecture (Strict Separation of Concerns)

```
[React 18 + Vite + Tailwind Frontend]
               │ (HTTP JSON API requests)
               ▼
   [FastAPI Routers: app/routers/]
   - Validates request payload shapes via Pydantic
   - Contains NO business logic
               │
               ▼
[SupplyChainService: app/services/supply_chain.py]
   - Single in-memory state authority
   - Coordinates hand-crafted DSA modules
   - Triggers persistence after every state mutation
        ┌──────┴──────────────────────────┐
        ▼                                 ▼
[Hand-Crafted DSA: app/dsa/]      [Storage: app/storage/store.py]
- HashRegistry (O(1))              - Reads/writes data/store.json
- MinHeap (O(log N))               - No calculations or logic
- RouteGraph + Dijkstra (O((V+E)log V))
- MergeSort (O(N log N))
```

---

## 3. Request Flow for `/api/optimize/next` (Hero Flow)

When the user clicks **"Optimize Next Order"**:
1. **Frontend Trigger**: `Optimize.jsx` invokes `optimizeNext()` in `api/client.js` via `POST /api/optimize/next`.
2. **FastAPI Router**: `app/routers/optimize.py` receives request and delegates to `service.optimize_next()`.
3. **Queue Pop**: `SupplyChainService` extracts the top-priority pending order from the hand-crafted `MinHeap` in $O(\log N)$ time.
4. **Candidate Evaluation**:
   - For all 5 warehouses:
     - Rejects if `active == false` (`"inactive"`).
     - Rejects if on-hand stock minus reserved < required quantity for any item (`"insufficient stock"`).
     - Rejects if destination city is unreachable (`"no route"`).
   - For all accepted candidates:
     - Runs **Dijkstra** algorithm over `RouteGraph` using the internal `MinHeap` to find shortest distance in $O((V+E)\log V)$ time.
     - Calculates shipping cost: `cost = distance_km * cost_per_km + handling_fee`.
5. **Multi-Criteria Normalization**:
   - Min-max normalizes distance and cost across accepted warehouses.
   - Computes weighted score: `score = 0.6 * norm_distance + 0.4 * norm_cost`.
6. **Winner Decision**:
   - Picks warehouse with minimum score (ties broken by lower distance, then warehouse ID).
7. **State Mutation & Reservation**:
   - Reserves ordered inventory in the winning warehouse (`reserved += qty`).
   - Generates a new `Shipment` record (`QUEUED`), and enqueues into `ShipmentQueue` (FIFO deque).
   - Sets order status to `DISPATCHED`.
   - Persists state to `store.json`.
8. **UI Animation**:
   - Returns winning candidate, scoring table, and shipment.
   - Frontend animates the winning road path on the SVG map in 700 ms, initiates travelling shipment dots, and dims rejected candidates to 35% with explicit rejection badges.
