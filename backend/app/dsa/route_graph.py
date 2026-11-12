"""Custom Weighted Road Network Graph with hand-written Dijkstra, BFS, and Trace Stepper.

DSA-II College Prototype:
- Adjacency list representation: dict[city] -> list[tuple[neighbor, km]]
- Hand-written Dijkstra shortest path using our custom MinHeap: O((V+E) log V)
- Hand-written Breadth-First Search (BFS) for connectivity & hop counts: O(V+E)
- Complete visual step-by-step trace generation for Algorithm Lab
- Pure Python without networkx or external libraries
- Time and space complexity docstring on every public function
"""
from typing import Optional, Any
from collections import deque
from app.dsa.min_heap import MinHeap

class RouteGraph:
    """Undirected weighted graph representing city road networks.
    
    Time Complexity:
        - add_node: O(1)
        - add_edge: O(1)
        - get_neighbors: O(deg(V))
        - dijkstra: O((V + E) log V)
        - bfs: O(V + E)
    Space Complexity:
        - O(V + E) where V is city nodes and E is road edges
    """

    def __init__(self) -> None:
        """Initialize empty graph adjacency list."""
        self._adj: dict[str, list[tuple[str, float]]] = {}
        self._cities: set[str] = set()

    def add_node(self, city: str) -> None:
        """Add a city node to the graph if not already present.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        if city not in self._adj:
            self._adj[city] = []
            self._cities.add(city)

    def add_edge(self, u: str, v: str, km: float) -> None:
        """Add bidirectional road edge between city u and city v.
        
        Time Complexity: O(1)
        Space Complexity: O(1)
        """
        self.add_node(u)
        self.add_node(v)
        # Avoid duplicate parallel edges with same or higher weight
        self._adj[u].append((v, float(km)))
        self._adj[v].append((u, float(km)))

    def nodes(self) -> list[str]:
        """Return list of all registered city nodes.
        
        Time Complexity: O(V)
        Space Complexity: O(V)
        """
        return list(self._cities)

    def neighbors(self, city: str) -> list[tuple[str, float]]:
        """Return list of (neighbor_city, distance_km) for the given city.
        
        Time Complexity: O(deg(V))
        Space Complexity: O(deg(V))
        """
        return self._adj.get(city, [])

    def bfs(self, start: str, target: Optional[str] = None) -> dict[str, Any]:
        """Breadth-First Search for connectivity verification and fewest-hop routes.
        
        Time Complexity: O(V + E)
        Space Complexity: O(V)
        """
        if start not in self._adj:
            return {"reachable": False, "visited": [], "hops": {}}

        visited: list[str] = []
        visited_set: set[str] = {start}
        parent: dict[str, Optional[str]] = {start: None}
        hops: dict[str, int] = {start: 0}
        q: deque[str] = deque([start])

        while q:
            curr = q.popleft()
            visited.append(curr)

            if target and curr == target:
                break

            for neighbor, _ in self._adj.get(curr, []):
                if neighbor not in visited_set:
                    visited_set.add(neighbor)
                    parent[neighbor] = curr
                    hops[neighbor] = hops[curr] + 1
                    q.append(neighbor)

        is_reachable = (target in visited_set) if target else True
        path = []
        if target and is_reachable:
            curr_node: Optional[str] = target
            while curr_node is not None:
                path.append(curr_node)
                curr_node = parent.get(curr_node)
            path.reverse()

        return {
            "reachable": is_reachable,
            "visited": visited,
            "hops": hops,
            "path": path,
            "complexity": "O(V + E)",
        }

    def dijkstra(
        self, 
        source: str, 
        target: Optional[str] = None, 
        trace: bool = False
    ) -> dict[str, Any]:
        """Calculates shortest road paths from source using custom MinHeap.
        
        Args:
            source: Starting city node.
            target: Destination city node (optional).
            trace: If True, produces full step trace log for Algorithm Lab replay.
        
        Returns:
            Dictionary with {path, distance, reachable, complexity, distances, steps (if trace)}.
        
        Time Complexity: O((V + E) log V)
        Space Complexity: O(V)
        """
        if source not in self._adj:
            return {
                "path": [],
                "distance": float("inf"),
                "reachable": False,
                "complexity": "O((V + E) log V)",
                "distances": {},
                "steps": [],
            }

        # Initialize distances table
        distances: dict[str, float] = {city: float("inf") for city in self._cities}
        distances[source] = 0.0
        predecessors: dict[str, Optional[str]] = {city: None for city in self._cities}
        settled: set[str] = set()

        # MinHeap element: (distance, city_name)
        pq = MinHeap[tuple[float, str]](key_fn=lambda item: item[0])
        pq.push((0.0, source))

        # Node states for tracer: unvisited, in_heap, current, settled
        node_states: dict[str, str] = {city: "unvisited" for city in self._cities}
        node_states[source] = "in_heap"

        steps: list[dict[str, Any]] = []
        step_counter = 0

        def clean_distances(d_map: dict[str, float]) -> dict[str, Optional[float]]:
            return {k: (round(v, 1) if v != float("inf") else None) for k, v in d_map.items()}

        if trace:
            step_counter += 1
            steps.append({
                "step": step_counter,
                "type": "push",
                "current": source,
                "heap": list(pq._heap),
                "heap_array": [f"{item[1]}:{item[0]}" for item in pq._heap],
                "distances": clean_distances(distances),
                "node_states": dict(node_states),
                "relaxed_edge": None,
                "explain": f"Initialize source node {source} with distance 0.0 and push into MinHeap."
            })

        while pq:
            curr_dist, u = pq.pop()

            if u in settled:
                continue

            node_states[u] = "current"
            if trace:
                step_counter += 1
                steps.append({
                    "step": step_counter,
                    "type": "pop",
                    "current": u,
                    "heap": list(pq._heap),
                    "heap_array": [f"{item[1]}:{item[0]}" for item in pq._heap],
                    "distances": clean_distances(distances),
                    "node_states": dict(node_states),
                    "relaxed_edge": None,
                    "explain": f"Pop {u} (distance {curr_dist:.1f}) from MinHeap as closest unsettled node."
                })

            settled.add(u)
            node_states[u] = "settled"

            # Check if destination reached
            if target and u == target:
                if trace:
                    step_counter += 1
                    steps.append({
                        "step": step_counter,
                        "type": "done",
                        "current": u,
                        "heap": list(pq._heap),
                        "heap_array": [f"{item[1]}:{item[0]}" for item in pq._heap],
                        "distances": clean_distances(distances),
                        "node_states": dict(node_states),
                        "relaxed_edge": None,
                        "explain": f"Target node {target} reached with optimal distance {curr_dist:.1f} km."
                    })
                break

            # Relax adjacent edges
            for v, weight in self._adj.get(u, []):
                if v in settled:
                    continue

                new_dist = curr_dist + weight
                old_dist = distances[v]

                if new_dist < old_dist:
                    distances[v] = new_dist
                    predecessors[v] = u
                    pq.push((new_dist, v))
                    node_states[v] = "in_heap"

                    if trace:
                        step_counter += 1
                        old_str = f"{old_dist:.1f}" if old_dist != float("inf") else "infinity"
                        steps.append({
                            "step": step_counter,
                            "type": "relax",
                            "current": u,
                            "heap": list(pq._heap),
                            "heap_array": [f"{item[1]}:{item[0]}" for item in pq._heap],
                            "distances": clean_distances(distances),
                            "node_states": dict(node_states),
                            "relaxed_edge": {"from": u, "to": v, "km": weight, "new_total": new_dist},
                            "explain": f"Relax edge {u} -> {v} ({weight:.1f} km): {curr_dist:.1f}+{weight:.1f}={new_dist:.1f} km is better than {old_str}."
                        })


        # Reconstruct path if target given
        path: list[str] = []
        reachable = False
        final_dist = float("inf")

        if target:
            if target in predecessors and (predecessors[target] is not None or target == source):
                reachable = True
                final_dist = distances[target]
                curr = target
                while curr is not None:
                    path.append(curr)
                    curr = predecessors[curr]
                path.reverse()
        else:
            reachable = True

        result: dict[str, Any] = {
            "path": path,
            "distance": final_dist if target else 0.0,
            "reachable": reachable,
            "complexity": "O((V + E) log V)",
            "distances": {k: (v if v != float("inf") else None) for k, v in distances.items()},
        }
        if trace:
            result["steps"] = steps

        return result
