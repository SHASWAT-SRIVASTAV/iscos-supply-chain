# ISCOS Five-Minute Live Demo Presentation Script

Follow this step-by-step click path during your viva demonstration to showcase the system end-to-end within 5 minutes.

---

### Step 1: Mission Control Dashboard (Minute 0:00 - 1:00)
* **Click Path**: Start at `http://localhost:5173/` (Dashboard).
* **What to Show**:
  - Point to the **Hero Mission Control Banner** and **Stat Cards**:
    - "Here we have real-time counts loaded directly from our FastAPI backend: 8 orders, 5 active warehouse hubs, and our low-stock alert count."
    - Highlight the gradient stat card: *"Dijkstra + Heap with $O((V+E)\log V)$ complexity."*
  - Scroll down to the **Order MinHeap Queue Table**:
    - "Notice that the pending orders are queued strictly by urgency: Priority 1 (urgent) orders appear at the top, followed by Priority 2 and 3. Ties are broken by arrival timestamp."
  - Point to the **Low-Stock Urgency Ranking Table**:
    - "These alerts are generated using a Min-Heap sorted by the ratio of available stock to reorder level. Items with the lowest ratio appear first because they are most critically depleted."

---

### Step 2: Hero Optimize Mission Control (Minute 1:00 - 2:15)
* **Click Path**: Click **"Optimize"** in the sidebar (or top bar).
* **What to Show**:
  - Explain the dual-pane layout: 8-column Road Network Map on the left, 4-column Evaluation Table on the right.
  - "Notice the road network of 8 major Indian cities and 14 highway connections."
  - Click the primary button: **"Optimize Next Order"**.
  - As the route draws:
    - "Watch the winning Dijkstra route animate in 700 ms in our teal accent color, with shipment transit dots travelling along the path."
    - "Look at the right panel: our multi-criteria optimizer evaluated every warehouse candidate. Inactive warehouses or hubs with insufficient stock are automatically dimmed to 35% opacity and display their exact rejection reason (e.g. `[insufficient stock]`)."
    - "For accepted candidates, the system min-max normalized distance and logistics cost, calculated a weighted score ($0.6 \times \text{norm\_dist} + 0.4 \times \text{norm\_cost}$), and selected the winner."
  - Point to the **Shipment Status Strip** under the map:
    - "A shipment record has been generated and enqueued in our FIFO dispatch deque."

---

### Step 3: Algorithm Lab Stepper & Heap Visualizer (Minute 2:15 - 3:30)
* **Click Path**: Click **"Algorithm Lab"** in the sidebar.
* **What to Show**:
  - Select an origin (e.g. `Delhi`) and destination (e.g. `Bengaluru`).
  - Click **"Play Trace"** or step forward with **"Step Forward"**:
    - "This trace is generated directly by our pure Python backend without third-party graph libraries. React only displays the trace."
    - Point to the **Step Explanation Banner**:
      - *"Step 2: Pop Mumbai (distance 1400.0) from MinHeap as closest unsettled node."*
      - *"Step 4: Relax edge Mumbai -> Pune (150 km): 1400 + 150 = 1550 km is better than infinity."*
    - Point to the **Live Distance Table**:
      - "Notice how the node states dynamically transition from `unvisited` to `in_heap` to `current` to `settled`."
  - Scroll down to the **MinHeap Swaps Visualizer**:
    - "Our hand-crafted array heap logs exact sift-up and sift-down swap pairs `[i, j]` during insertion and extraction, proving correct heap invariance."

---

### Step 4: Empirical Complexity Benchmarks (Minute 3:30 - 4:15)
* **Click Path**: Click **"Benchmarks"** in the sidebar.
* **What to Show**:
  - Point to the **Recharts Performance Line Chart**:
    - "Here we benchmark our custom Dijkstra implementation on synthetic connected graphs ranging from 50 to 800 vertices with 5 runs per size."
    - "The solid teal line shows empirical measured runtime in milliseconds. The dashed violet curve represents the theoretical $O((V+E)\log V)$ scaling."
    - "Notice how closely the empirical runtime aligns with the theoretical logarithmic curve, validating our asymptotic analysis."

---

### Step 5: System Architecture & Wrap-Up (Minute 4:15 - 5:00)
* **Click Path**: Click **"Architecture"** in the sidebar.
* **What to Show**:
  - Click through the architecture blocks: **UI Shell** $\to$ **API Client** $\to$ **FastAPI Routers** $\to$ **SupplyChainService** $\to$ **DSA Core** $\to$ **JSON Storage**.
  - "Every layer strictly respects separation of concerns. All business state is coordinated by the service, while core data structures remain decoupled from HTTP frameworks."
  - Show the **Complete DSA-II Implementation Matrix**:
    - "In summary, every required data structure (HashRegistry, MinHeap, ShipmentQueue, RouteGraph Dijkstra/BFS, MergeSort, BinarySearch, and Multi-Criteria Optimizer) is implemented in pure Python with unit tests and complexity docstrings."
  - Conclude: *"Thank you. I am ready for questions."*
