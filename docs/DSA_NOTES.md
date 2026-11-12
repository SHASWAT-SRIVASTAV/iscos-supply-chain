# ISCOS Data Structures & Algorithms (DSA-II Core Notes)

This document details every hand-crafted data structure and algorithm implemented in ISCOS for examination and viva defense.

---

## 1. Summary Matrix

| Feature / Need | Structure or Algorithm | Where in Code | Time Complexity | Space Complexity | Why Chosen? | Alternative Considered & Rejected |
|---|---|---|---|---|---|---|
| **Entity Lookup by ID** | `HashRegistry` (wrapping `dict`) | `backend/app/dsa/hash_registry.py` | Average: $O(1)$<br>Worst: $O(N)$ | $O(N)$ | Instant constant-time record access by unique string ID (`P-xxx`, `W-xxx`, `O-xxx`). | Array linear scan ($O(N)$) or Binary Search Tree ($O(\log N)$) - unnecessarily slow for simple unique ID queries. |
| **Pending Order Dispatch Queue** | Array-based Binary `MinHeap` | `backend/app/dsa/min_heap.py` | Push: $O(\log N)$<br>Pop: $O(\log N)$<br>Peek: $O(1)$ | $O(N)$ | Priority 1 orders must dispatch ahead of Priority 2/3. Earliest timestamp breaks ties. Array layout enables clean tree indexing: left=$2i+1$, right=$2i+2$. | Python `heapq` (rejected: disallowed by college DSA-II rules), linked priority list ($O(N)$ insertion). |
| **Shipment Flow Pipeline** | `ShipmentQueue` (FIFO deque) | `backend/app/dsa/shipment_queue.py` | Enqueue: $O(1)$<br>Dequeue: $O(1)$ | $O(N)$ | Guarantees fair First-In-First-Out processing of shipments (`QUEUED` $\to$ `IN_TRANSIT` $\to$ `DELIVERED`). | Python `list.pop(0)` (rejected: $O(N)$ element memory shifting overhead on dequeue). |
| **Road Network & Connectivity** | Adjacency List Graph + BFS | `backend/app/dsa/route_graph.py` | BFS: $O(V + E)$<br>Neighbors: $O(\text{deg}(V))$ | $O(V + E)$ | Sparse road network with ~8 cities and ~14 highways. Adjacency list is memory efficient and traversal-friendly. | Adjacency Matrix ($O(V^2)$ space - wasteful for sparse networks) or `networkx` (disallowed library). |
| **Cheapest Route Pathfinding** | Dijkstra Algorithm + MinHeap | `backend/app/dsa/route_graph.py` | $O((V + E) \log V)$ | $O(V)$ | Non-negative road distances guarantee optimal shortest distance in logarithmic vertex relaxation. Produces visual step trace for Lab. | Bellman-Ford ($O(VE)$ - redundant without negative weights) or Floyd-Warshall ($O(V^3)$ all-pairs overhead). |
| **Product & Order Sorting** | Custom Merge Sort | `backend/app/dsa/sorting.py` | Best/Avg/Worst: $O(N \log N)$ | $O(N)$ | Divide-and-conquer guarantees **stability** (equal keys maintain relative initial order). Essential for multi-level sorting. | QuickSort (unstable, worst case $O(N^2)$), Bubble/Insertion Sort ($O(N^2)$). |
| **SKU / Catalog Search** | Custom Binary Search | `backend/app/dsa/searching.py` | $O(\log N)$ | $O(1)$ | Halves search range per iteration on sorted arrays; left-bias variant reliably retrieves first occurrence on duplicates. | Linear Scan ($O(N)$ - slow on large catalogs). |
| **Warehouse Selection** | Multi-Criteria Greedy Optimizer | `backend/app/dsa/optimizer.py` | $O(W \cdot (V + E) \log V)$ | $O(W + V)$ | Normalizes heterogeneous metrics (km vs currency) and computes an explainable weighted linear combination. | Single-variable greedy (e.g. distance only - ignores shipping cost variations and inventory availability). |

---

## 2. In-Depth Algorithmic Explanations

### 1. Array Binary MinHeap (`min_heap.py`)
* **Mathematical Invariant**: For every node at index $i$, the key of its parent at $\lfloor(i-1)/2\rfloor$ is less than or equal to the key at $i$.
* **Sift-Up ($O(\log N)$)**: After appending a new element at index $N-1$, we compare it with its parent and swap upward until the heap property is satisfied.
* **Sift-Down ($O(\log N)$)**: After extracting the minimum at index 0, the last element is moved to index 0 and swapped downward with the smaller of its two children until the heap property is restored.
* **Ops Logging**: To power the Algorithm Lab's animated swaps, our `MinHeap` optionally records every swap pair `[i, j]` during sift-up and sift-down.

### 2. Dijkstra Shortest Path with MinHeap (`route_graph.py`)
* **Algorithm Steps**:
  1. Initialize distance table: source = $0.0$, all other vertices = $\infty$.
  2. Push `(0.0, source)` into custom `MinHeap`.
  3. While heap is not empty: pop vertex $u$ with minimum tentative distance. If $u$ is already settled, discard.
  4. Mark $u$ as settled.
  5. For each neighbor $v$ of $u$, calculate new path distance: $\text{alt} = \text{dist}[u] + \text{weight}(u, v)$.
  6. If $\text{alt} < \text{dist}[v]$, update $\text{dist}[v] = \text{alt}$, record predecessor $P[v] = u$, and push `(alt, v)` into the heap.
* **Complexity Proof**:
  - Each vertex is popped at most once: $V \times O(\log V)$.
  - Each edge is relaxed at most once: $E \times O(\log V)$.
  - Total time bound: $O((V + E) \log V)$.

### 3. Stable Merge Sort (`sorting.py`)
* **Divide**: Splits input array into left and right halves at midpoint $\lfloor N/2\rfloor$.
* **Conquer**: Recursively sorts each half until base case of length $\le 1$.
* **Combine**: Merges sorted left and right arrays in linear time $O(L + R)$. When left and right elements have equal keys, the left element is appended first, preserving relative original ordering (**stability**).
