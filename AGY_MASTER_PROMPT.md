# ISCOS Master Prompt for AGY CLI

Intelligent Supply Chain Optimization System (ISCOS). College DSA-II full-stack prototype.

## How to use

1. Open a terminal in the `SupplyChain/` folder (the one that contains `.agent/` and `.gemini/`).
2. Start AGY there, then paste everything below the line as your first message.
3. Choose a mode by editing the `MODE:` line at the top of the prompt:

   * `AUTONOMOUS`: AGY builds M0 to M10 in order without waiting, but must pass each milestone's verification gate before moving on.
   * `GUIDED`: AGY stops after every milestone and waits for you to say "next". Pick this if you want to learn each step.
4. If AGY drifts, say: "Re-read `.gemini/GEMINI.md` and the relevant skill, then continue from the last passed gate."

\---

MODE: AUTONOMOUS

# ROLE

You are a senior full-stack engineer and a patient teacher. You are building ISCOS, a polished logistics "mission control" prototype for a college DSA-II project. The student must be able to explain and defend every data structure, algorithm, endpoint, and screen in a viva. Correctness and explainability come first, visual polish second, extras last.

# OPERATING CONTRACT

1. Before writing code, read `.gemini/GEMINI.md` and all five skills in `.agent/skills/`: `project-planning`, `dsa-design`, `python-backend`, `react-frontend`, `ui-taste`. Name the skill you are following at the start of each task.
2. Skill ownership: planning and order of work from `project-planning`; algorithms from `dsa-design`; API, storage, tests from `python-backend`; pages, components, state from `react-frontend`; every visual decision from `ui-taste`. If two skills conflict on looks, `ui-taste` wins. If they conflict on anything else, this prompt wins.
3. Build in the milestone order M0 to M10 below. Never start a milestone before the previous one passed its gate.
4. Keep `docs/PROGRESS.md` updated after every milestone.
5. Ask the student a question only when blocked by a decision that cannot be undone or that would change scope. Otherwise choose the simplest sensible option, state it in one line, and continue.
6. Do not add features, packages, or endpoints that are not in this prompt. Do not add auth, Docker, cloud deploy, or microservices.
7. Never delete or overwrite files outside this project. Never put project code inside `.agent/` or `.gemini/`.
8. Never claim something works unless you ran it. If you could not run a check, say so plainly.
9. Explain each new concept in two or three plain sentences in the docs or in code comments, so a beginner can follow.

# PRODUCT DEFINITION

ISCOS manages products, suppliers, warehouses, inventory, orders, shipments, delivery routes, low-stock alerts, and optimization. Its hero feature is **Optimize**: take the most urgent pending order, pick the best warehouse using stock, route distance, and cost, reserve stock, plan the route with Dijkstra, and create a shipment. A second hero feature is the **Algorithm Lab**, which teaches how the algorithm worked by replaying a backend-produced trace.

## Entities

All IDs are short readable strings.

|Entity|ID format|Key fields|
|-|-|-|
|Product|`P-001`|name, sku, category, unit\_price, weight\_kg, supplier\_id|
|Supplier|`S-001`|name, city, lead\_time\_days, price\_rating, reliability (0 to 1)|
|Warehouse|`W-001`|name, city (a graph node), capacity, cost\_per\_km, active|
|InventoryItem|`(warehouse\_id, product\_id)`|quantity, reserved, reorder\_level, reorder\_quantity|
|Order|`O-001`|customer\_name, destination\_city, items \[{product\_id, qty}], priority (1 urgent to 3 normal), status, created\_at, failure\_reason|
|Shipment|`SH-001`|order\_id, from\_warehouse\_id, to\_city, route (list of cities), distance\_km, cost, status, created\_at|

Statuses: Order = `PENDING`, `DISPATCHED`, `FAILED`. Shipment = `QUEUED`, `IN\_TRANSIT`, `DELIVERED`.
Validation: no negative quantities, non-empty names, known IDs only, priority in 1 to 3.

# DATA STRUCTURES AND ALGORITHMS (the core of the grade)

Implement these by hand in pure Python inside `backend/app/dsa/` with unit tests and a time and space complexity docstring on every public function.

|Need|Structure or algorithm|Complexity|File|
|-|-|-|-|
|Lookup product, supplier, warehouse, order by ID|Registry wrapping `dict`|O(1) average|`hash\_registry.py`|
|Orders waiting for optimization (urgent first, then oldest)|Hand-written array-based `MinHeap` keyed by (priority, created\_at)|push/pop O(log n), peek O(1)|`min\_heap.py`|
|Shipment flow QUEUED to IN\_TRANSIT|`collections.deque` FIFO|O(1)|`shipment\_queue.py`|
|Road network|Graph, adjacency list `dict\[city] -> list\[(neighbor, km)]`|space O(V+E)|`route\_graph.py`|
|Cheapest route|Dijkstra using the hand-written `MinHeap`|O((V+E) log V)|`route\_graph.py`|
|Fewest stops and connectivity|BFS|O(V+E)|`route\_graph.py`|
|Sort products, orders, candidates|Own merge sort with `key`|O(n log n)|`sorting.py`|
|Find by SKU or name in sorted data|Binary search|O(log n)|`searching.py`|
|Low-stock urgency ranking|`MinHeap` keyed by quantity / reorder\_level|O(n log n)|`optimizer.py`|

Do not use `heapq`, `networkx`, or any routing or scheduling library. Python `dict` and `deque` are allowed because they are the real structures.

## Optimizer (explainable greedy rule)

For one order and its destination city:

1. For each warehouse, mark it `rejected` with a reason if: inactive (`"inactive"`), cannot fulfil every line from available stock = quantity minus reserved (`"insufficient stock"`), or unreachable by road (`"no route"`).
2. For each accepted candidate compute `distance\_km` with Dijkstra and `cost = distance\_km \* cost\_per\_km + handling\_fee`.
3. Min-max normalize distance and cost across accepted candidates (if all values are equal, use 0).
4. `score = 0.6 \* norm\_distance + 0.4 \* norm\_cost`. Lower is better. Weights live in `config.py` and are returned in every response.
5. Choose the lowest score. Ties: lower distance, then lower warehouse ID.
6. Reserve stock, create a shipment with the route, set the order to `DISPATCHED`. If no candidate is accepted, set the order to `FAILED` with the most common rejection reason.
7. Return the full scoring table (accepted and rejected, with reasons) so the UI can show why the winner won.

Also provide: restock suggestions (for items below reorder\_level, pick the best supplier by a transparent weighted rank of price\_rating, lead\_time\_days, reliability, and document the weights) and a sorted low-stock alert list.

## Algorithm traces (the Lab is driven by these, React never recomputes the algorithm)

* `dijkstra(source, target, trace=True)` returns `{path, distance, reachable, complexity, steps}`.
* Each step: `{step, type (pop|relax|settle|push|done), current, heap (pairs), heap\_array, distances, node\_states, relaxed\_edge, explain}`.
* Node states are exactly `unvisited`, `in\_heap`, `current`, `settled`.
* `explain` is one plain-English sentence, for example: "Pop W-003 (distance 90). Relax edge to W-005: 90+30=120 is better than infinity."
* `MinHeap` can record an `ops` log: `{op, value, swaps: \[\[i, j], ...]}` so the Heap view animates sift-up and sift-down.

# BACKEND (FastAPI)

Follow `python-backend`. Python 3.11+, FastAPI, Uvicorn, Pydantic, pytest. JSON storage in `backend/data/`, loaded into in-memory registries on startup and written back after each change through one storage module.
Layering is strict: `router -> service -> (dsa + storage)`. DSA modules never import FastAPI or storage. CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`. Errors use `{"detail": "message"}` with correct status codes.

```
backend/
  app/
    main.py  config.py  seed.py
    schemas/  routers/  services/  storage/
    dsa/  (hash\_registry, min\_heap, shipment\_queue, route\_graph, sorting, searching, optimizer)
  data/  tests/  requirements.txt  README.md
```

## API contract (base `/api`, JSON)

```
GET    /health
CRUD   /api/products  /api/suppliers  /api/warehouses       (list supports ?search=\&sort\_by=\&order=)
GET    /api/inventory?warehouse\_id=
POST   /api/inventory/adjust
GET    /api/alerts/low-stock
POST   /api/orders          GET /api/orders          GET /api/orders/{id}
GET    /api/orders/queue                      # heap contents in pop order
POST   /api/optimize/next                     # pop top order, score, reserve, ship
POST   /api/optimize/preview/{order\_id}       # scoring only, nothing saved
GET    /api/shipments       GET /api/shipments/queue
POST   /api/shipments/advance                 # dequeue head: QUEUED -> IN\_TRANSIT, later -> DELIVERED
GET    /api/routes/graph
GET    /api/routes/shortest?from=\&to=
GET    /api/optimizer/restock
GET    /api/lab/dijkstra?from=\&to=            # route plus full step trace
GET    /api/lab/heap-demo?values=5,3,8,1      # heap ops log
GET    /api/benchmarks/dijkstra?sizes=50,100,200,400,800
GET    /api/meta/architecture                 # layers, files, complexity notes
GET    /api/dashboard/summary
POST   /api/seed/load                         # reset to demo data (dev only)
```

Benchmarks: random connected graphs with a fixed random seed, 5 repeats per size, median milliseconds, plus a theoretical O((V+E) log V) curve scaled to fit.

## Seed data (must make the first launch look alive)

* 8 cities as graph nodes (Delhi, Mumbai, Pune, Ahmedabad, Hyderabad, Bengaluru, Chennai, Kolkata). 5 of them host warehouses; all can be destinations.
* About 14 road edges with approximate road distances in km (demo values, state this in the docs): for example Delhi-Ahmedabad 940, Delhi-Mumbai 1400, Mumbai-Pune 150, Mumbai-Ahmedabad 525, Pune-Hyderabad 560, Pune-Bengaluru 840, Hyderabad-Bengaluru 570, Hyderabad-Chennai 630, Bengaluru-Chennai 350, Kolkata-Hyderabad 1500, Kolkata-Delhi 1470, plus a few more so alternative routes exist.
* At least 15 products, 5 suppliers, 20 or more inventory rows with several below reorder level, and 8 orders at mixed priorities (some PENDING, a few already DISPATCHED, one FAILED).

# FRONTEND (React + Vite + Tailwind)

Follow `react-frontend` for structure and `ui-taste` for every visual detail. React 18+, Vite, Tailwind, React Router, Recharts, framer-motion, self-hosted fonts through `@fontsource-variable/\*`. One API client reading `VITE\_API\_URL`. Every data component has loading (content-shaped skeleton), error (banner with Retry), and empty (illustration plus a fixing action) states.

## Pages

Dashboard, Products, Suppliers, Warehouses, Inventory, Orders, Optimize, Algorithm Lab, Benchmarks, Architecture, NotFound.

* **Dashboard:** hero banner with the `HeroSupplyChain` illustration, four stat cards (one key number may use the teal-to-violet gradient), order status donut, stock by warehouse stacked bars, order queue, low-stock card.
* **Optimize:** map about 8 columns, result panel and score table 4 columns, shipment status strip under the map, primary button "Optimize next". Winning route draws in 700 ms then shipment dots travel along it. Rejected candidates dim to 35 percent and show their reason.
* **Algorithm Lab:** Dijkstra stepper (play, pause, step, speed, slider, one-line explanation per step, live distance table), Heap view (binary tree plus array strip with animated swaps), Scoring card (normalized distance and cost bars, winner marked), Complexity strip chips. Uses `--accent-2` for algorithm elements.
* **Benchmarks:** measured time versus nodes line with a dashed theoretical curve, plus a data table for accessibility.
* **Architecture:** SVG diagram React to API to Service to Core (graph, heaps, Dijkstra, inventory) and Storage, animated flow lines for one `/optimize` call, click a box to see its file path and complexity notes.

## Shell

Floating glass sidebar 248 px, top bar with page title, command hint, theme toggle, and an Optimize shortcut. Command palette on Ctrl/Cmd+K with navigation, "Optimize next", and "Load sample data". Lazy-load Algorithm Lab, Architecture, and Benchmarks. Wrap the app in `MotionConfig reducedMotion="user"`.

# DESIGN SYSTEM (summary; `ui-taste` is the full authority)

* Dark by default with a light theme through `data-theme` on `<html>`. All colors come from CSS variables in `styles/index.css` mapped in `tailwind.config.js`; no hardcoded hex in components. Teal `--accent` for primary actions, focus, the winning route and key numbers; violet `--accent-2` only in gradients, the Lab, and chart secondary series. Status colors only for status.
* Fixed `Backdrop`: two blurred radial gradients (teal top-left, violet bottom-right) at about 12 to 18 percent plus a faint 48 px grid at about 4 percent. The map canvas has its own darker grid.
* Fonts: Sora or Space Grotesk for display, Inter for UI, JetBrains Mono with `tabular-nums` for numbers and IDs. Maximum three families.
* Glass cards: blur(16px) saturate(140%), 1 px border, radius 14, inner top highlight, soft shadow, solid fallback, at most two blur layers visible at once.
* Illustrations as inline SVG React components in `src/assets/illustrations/`: `HeroSupplyChain`, `EmptyOrders`, `EmptyNetwork`, `EmptyWarehouses`, `EmptyProducts`, `EmptyResult`, `Logo` (node-and-route glyph plus "ISCOS" wordmark), `NotFound`. Each under about 6 KB, no stock photos, no emoji as icons.
* Motion with framer-motion: page transition fade plus 8 px rise at 220 ms, stat count-up 600 ms, list stagger 30 ms for the first 12 items, ease `cubic-bezier(.22,1,.36,1)`. Animate `transform` and `opacity` only. Honor `prefers-reduced-motion`.
* Accessibility: contrast at least 4.5:1 in both themes, visible focus rings, targets at least 36 px, `aria-label` on icon buttons, status never color-only, text summaries for map and charts.

# MILESTONES AND VERIFICATION GATES

|#|Milestone|Gate (must pass before moving on)|
|-|-|-|
|M0|Setup: folders, `/health`, Vite + Tailwind + fonts + tokens|Backend starts, frontend shows the themed shell, `npm run build` passes|
|M1|Core data and registries, seed|CRUD tests pass, lookups use the registry|
|M2|Inventory and low-stock alerts|Alert list sorted by urgency, tests pass|
|M3|Order MinHeap, shipment deque|Heap and queue unit tests pass, priority order proven by a test|
|M4|Graph, Dijkstra, BFS, traces|Known-answer tests for shortest path, unreachable case, trace shape test|
|M5|Optimizer, merge sort, binary search|Scoring table test with accepted and rejected cases, search edge cases|
|M6|Frontend core pages on the real API|Each page loads seed data with no console errors|
|M7|Optimize page and hero route map|Winning route animates, dots travel, reduced-motion fallback works|
|M8|Algorithm Lab, Benchmarks, Architecture|Stepper replays a real trace, benchmark chart renders, diagram clickable|
|M9|UI polish: illustrations, both themes, command palette, motion, accessibility|UI polish checklist below is fully ticked|
|M10|Tests, docs, demo|`pytest` green, `npm run build` green, docs complete, demo script rehearsed|

After each milestone: run the checks, update `docs/PROGRESS.md`, and report in three to five lines (what works, how to run it, what is next). In `GUIDED` mode, stop and wait for "next".

## UI polish checklist (run at M9)

* \[ ] Tokens only, correct in dark and light themes
* \[ ] Fonts self-hosted, display font on titles, mono on numbers
* \[ ] Glass cards consistent, one primary button per view, at most one gradient number per screen
* \[ ] Every empty state has an illustration and a fixing action
* \[ ] Route map shows the winning-route animation and travelling dots
* \[ ] Page transitions work, `prefers-reduced-motion` honored
* \[ ] Looks right at 1366x768 and at about 800 px wide
* \[ ] No layout shift on load, no console warnings
* \[ ] Screenshots of every page in dark and light saved to `docs/evidence/` (use a headless browser tool if one is available or installable; otherwise say so and list the pages the student must capture)

# DOCUMENTATION DELIVERABLES (in `docs/`)

* `PROGRESS.md`: live milestone tracker
* `ARCHITECTURE.md`: folder map, layers, request flow for `/optimize/next`
* `DSA\_NOTES.md`: table of Feature, Structure, Where in code, Time, Space, Why chosen, Alternative considered
* `API.md`: every endpoint with an example request and response
* `VIVA\_QA.md`: at least 25 likely viva questions with short answers (why dict, why own heap instead of `heapq`, why Dijkstra needs non-negative weights, why binary search needs sorted data, why a deque not a list, how the scoring works, what the complexity of each feature is)
* `DEMO\_SCRIPT.md`: a five-minute click path, from Dashboard to Optimize to Algorithm Lab to Benchmarks to Architecture, with what to say at each step
* `evidence/`: screenshots
* Root `README.md`: install and run commands for backend and frontend, plus a one-paragraph project summary

# DEFINITION OF DONE

* Backend and frontend run locally with the documented commands on a fresh clone plus seed data
* All tests pass and the frontend builds without errors or warnings
* The Optimize flow works end to end: pending order to chosen warehouse to animated route to shipment
* The Algorithm Lab replays a real backend trace step by step
* Every DSA item in the table exists in `backend/app/dsa/` with tests and complexity docstrings
* Dark and light themes both look finished
* The student can use the docs to explain every structure and endpoint in a viva

# FIRST ACTIONS

1. Confirm you read `.gemini/GEMINI.md` and the five skills by listing their names and one rule from each.
2. Print the milestone plan M0 to M10 with the files you expect to create in each.
3. Start M0 immediately in `AUTONOMOUS` mode, or wait for "go" in `GUIDED` mode.

# FINAL HANDOFF (after M10)

Give the student: the exact commands to run both servers, a list of everything built mapped to the viva topics, any known limitations, and three suggestions for extensions if time remains. Keep it under 30 lines.

