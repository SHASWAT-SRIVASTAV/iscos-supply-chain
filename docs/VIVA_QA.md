# ISCOS DSA-II Viva Examination Preparation Guide

A curated list of 28 core viva questions and concise answers defending the architecture, data structures, algorithms, and design decisions of ISCOS.

---

### Core DSA & Structures

#### 1. Why use a hash map (`dict`) for entity registries instead of an array or linked list?
*Answer*: Hash maps provide $O(1)$ average-time lookup, insertion, and deletion by unique entity ID (e.g. `P-001`, `W-002`) using hash indexing. An array or linked list requires an $O(N)$ linear search to find an item by ID.

#### 2. Why write your own `MinHeap` instead of importing Python's built-in `heapq` module?
*Answer*: Writing the heap by hand proves understanding of array-based binary heap invariants, 0-based index parent/child arithmetic ($\lfloor(i-1)/2\rfloor$, $2i+1$, $2i+2$), and sift-up/sift-down operations. Furthermore, our hand-written implementation records swap event logs (`ops_log`) to animate element movements in the Algorithm Lab.

#### 3. What is the heap property, and how is it maintained?
*Answer*: In a Min-Heap, every parent node's key is less than or equal to its children's keys. When adding an element (`push`), `_sift_up` swaps it with its parent in $O(\log N)$ until the property holds. When extracting the minimum (`pop`), the last element replaces the root and `_sift_down` swaps it with its smallest child in $O(\log N)$.

#### 4. Why is the order dispatch queue keyed by `(priority, created_at)`?
*Answer*: Python tuple comparison evaluates elements lexicographically. Priority 1 (urgent) evaluates smaller than Priority 2 or 3, guaranteeing urgent orders are popped first. If two orders have the same priority, the earlier ISO timestamp breaks the tie, implementing a fair FIFO discipline among equals.

#### 5. Why use `collections.deque` instead of a plain Python `list` for the shipment queue?
*Answer*: Python lists are dynamic arrays where `list.pop(0)` takes $O(N)$ time because all subsequent elements must shift left in memory. `collections.deque` is a doubly linked block list providing true $O(1)$ constant-time append and popleft operations.

#### 6. Why represent the road network as an Adjacency List rather than an Adjacency Matrix?
*Answer*: Road networks are sparse graphs where vertices (cities) have few neighbors ($E \ll V^2$). An adjacency matrix takes $O(V^2)$ space regardless of edges. An adjacency list takes $O(V + E)$ space and allows iterating over neighbors in $O(\text{deg}(V))$ rather than scanning $V$ matrix columns.

#### 7. Why does Dijkstra's algorithm require non-negative edge weights?
*Answer*: Dijkstra is a greedy algorithm that permanently "settles" a vertex once popped from the priority queue, assuming no shorter path can be found later. A negative edge weight could produce a shorter path after a node is already marked settled, invalidating the greedy choice and requiring Bellman-Ford instead.

#### 8. What is the time complexity of Dijkstra with a binary MinHeap?
*Answer*: $O((V + E) \log V)$. Every vertex is popped from the heap at most once ($V \log V$), and every edge is relaxed at most once, pushing an updated distance into the heap ($E \log V$).

#### 9. Why can BFS find the shortest path in unweighted graphs but not in weighted road networks?
*Answer*: BFS explores nodes in increasing order of hop count (edge count). In weighted graphs, a path with 2 edges could have distance 1000 km while a path with 3 edges has distance 300 km. BFS would incorrectly pick the 2-hop route.

#### 10. Why is Merge Sort preferred over QuickSort for product and order listings?
*Answer*: Merge Sort is **stable**; equal elements maintain their relative original order. This allows multi-level sorting (e.g. sorting by customer name, then by price). Furthermore, Merge Sort guarantees $O(N \log N)$ worst-case performance, whereas QuickSort degrades to $O(N^2)$ on unfavorable pivot choices.

#### 11. Why does Binary Search require the data to be pre-sorted?
*Answer*: Binary search relies on monotonicity: comparing the target with the midpoint allows safely eliminating half the search space ($O(\log N)$). Without sorted data, order relations cannot guarantee which half contains the target.

#### 12. How does your binary search handle duplicate values?
*Answer*: When `mid_val == target`, rather than returning immediately, our algorithm records the index and shifts `high = mid - 1` to continue scanning left. This guarantees returning the leftmost (first) occurrence.

---

### Optimizer & Business Logic

#### 13. How does the Multi-Criteria Optimizer select the winning warehouse?
*Answer*: It filters candidates by active status, inventory sufficiency, and road reachability. Accepted candidates are evaluated on road distance (via Dijkstra) and logistics cost (`distance * cost_per_km + fee`). Distance and cost are min-max normalized ($0.0$ to $1.0$), and a combined score is calculated: $\text{Score} = 0.6 \cdot \text{norm\_dist} + 0.4 \cdot \text{norm\_cost}$. The candidate with the lowest score wins.

#### 14. Why is normalization necessary before calculating the score?
*Answer*: Distance is in kilometers (e.g. 150 to 1500 km) while cost is in dollars (e.g. $250 to $2500). Summing raw numbers would cause the larger numerical metric to arbitrarily dominate the decision. Min-max normalization scales both dimensions to a uniform $[0, 1]$ interval.

#### 15. How are ties broken in the optimizer?
*Answer*: If two warehouses achieve identical combined scores, ties are broken first by lower raw distance (favoring faster transit), and second by lexicographical warehouse ID (`W-001` before `W-002`).

#### 16. What happens if no warehouse can fulfill an order?
*Answer*: The order status is transitioned to `FAILED`. The system tallies rejection reasons (`"inactive"`, `"insufficient stock"`, `"no route"`) and sets `failure_reason` to the most common bottleneck to inform supply chain managers.

#### 17. How does inventory reservation work during dispatch?
*Answer*: When an order is optimized and dispatched, the ordered quantities are added to `reserved` in `(warehouse_id, product_id)`. Available stock is defined as $\text{quantity} - \text{reserved}$. This prevents double-allocation while preserving physical stock counts until actual shipment departure.

#### 18. How is the low-stock alert list ranked?
*Answer*: Low-stock items are ranked by **urgency ratio**: $\text{available} / \text{reorder\_level}$. An item with 2 units available against a reorder level of 20 (ratio 0.10) is more critically depleted than an item with 8 units against a level of 10 (ratio 0.80). A custom `MinHeap` extracts alerts in ascending order of ratio ($O(N \log N)$).

#### 19. How are supplier restock suggestions scored?
*Answer*: Using a transparent weighted formula: $\text{Score} = 0.4 \cdot \text{reliability} + 0.3 \cdot (\text{price\_rating}/5) + 0.3 \cdot \min(1.0, 3/\text{lead\_time})$. Reliability is weighted highest to minimize supply disruptions.

---

### System Architecture & Engineering

#### 20. Explain the strict layering rule in the backend.
*Answer*: Layering follows: `Router` $\to$ `Service` $\to$ (`DSA Core` + `Storage`). Routers only validate input and return HTTP responses; they contain no business logic. The `Service` owns state and coordinates mutations. The `DSA Core` contains pure algorithmic logic and never imports FastAPI, Pydantic, or JSON modules.

#### 21. How does the frontend communicate with the backend?
*Answer*: Exclusively through `src/api/client.js` via the native browser `fetch` API. Individual React components never call `fetch` directly. In development, Vite proxies `/api` and `/health` requests to `http://127.0.0.1:8000`.

#### 22. What design system rules are enforced in the UI?
*Answer*: Dark mode default with calm control-room styling; all colors are defined as CSS variables in `styles/index.css` and mapped to Tailwind; exactly one primary accent (teal `--accent`) for primary buttons and winning routes; violet `--accent-2` reserved for Algorithm Lab and gradients; all numbers rendered in tabular monospace font.

#### 23. What four states must every data-fetching UI component handle?
*Answer*: Loading (content-shaped skeleton), Error (alert banner with retry button), Empty (custom SVG illustration with fixing action), and Data (successful rendering).

#### 24. What are the space and time complexities of empirical benchmarks?
*Answer*: Running Dijkstra on graphs of sizes $V \in [50, 800]$ runs in $O((V+E)\log V)$ time and $O(V+E)$ space. The measured median runtimes closely match the theoretical logarithmic scaling curve plotted on the Benchmarks page.

#### 25. Why did you use React.lazy for AlgorithmLab, Architecture, and Benchmarks?
*Answer*: `AlgorithmLab`, `Architecture`, and `Benchmarks` include heavier dependencies (e.g. `recharts`, animated SVGs). Lazy-loading them with `React.lazy` and `Suspense` keeps the initial dashboard bundle lightweight, eliminating Vite chunk size warnings and speeding up first contentful paint.

#### 26. How is accessibility addressed across the application?
*Answer*: Contrast ratios meet WCAG AA standards (4.5:1); interactive elements have visible focus rings; all icon buttons include `aria-label`; animations respect `prefers-reduced-motion` via Framer Motion; and all charts include accessible data tables.

#### 27. What happens if the backend server restarts?
*Answer*: Because state is persisted to `backend/data/store.json` on every mutation, the `SupplyChainService` reloads all product, warehouse, inventory, order, and shipment records back into custom in-memory data structures on startup without data loss.

#### 28. What are the key takeaways from this project?
*Answer*: Algorithmic correctness and explainability take precedence over third-party black-box libraries. Hand-crafting data structures guarantees complete transparency during viva examination and demonstrates practical mastery of core computer science fundamentals.
