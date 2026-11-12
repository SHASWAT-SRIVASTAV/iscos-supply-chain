"""Benchmark runner measuring empirical runtime of custom Dijkstra on generated graphs.

Uses fixed random seed for reproducible results and compares measured median runtimes
against theoretical O((V + E) log V) algorithmic scaling curve.
"""
import random
import time
from typing import Any
from math import log2
from app.dsa.route_graph import RouteGraph

def run_dijkstra_benchmarks(sizes: list[int]) -> dict[str, Any]:
    """Measures empirical median runtime of RouteGraph.dijkstra over graph sizes.
    
    Args:
        sizes: List of node counts (e.g. [50, 100, 200, 400, 800]).
        
    Returns:
        Dictionary with measured points, scaled theoretical curve, and fit analysis.
    """
    rng = random.Random(42)
    results = []

    for v_count in sizes:
        # Build connected random graph
        g = RouteGraph()
        nodes = [f"N-{i}" for i in range(v_count)]
        for n in nodes:
            g.add_node(n)

        # Spanning tree to ensure full connectivity
        for i in range(1, v_count):
            parent = rng.randint(0, i - 1)
            km = rng.uniform(20.0, 500.0)
            g.add_edge(nodes[i], nodes[parent], km)

        # Additional random road edges (approx 2*V extra edges)
        extra_edges = v_count * 2
        for _ in range(extra_edges):
            u = rng.choice(nodes)
            v = rng.choice(nodes)
            if u != v:
                km = rng.uniform(20.0, 500.0)
                g.add_edge(u, v, km)

        total_edges = (v_count - 1) + extra_edges

        # Run 5 iterations and record durations
        durations: list[float] = []
        source = nodes[0]
        target = nodes[-1]

        for _ in range(5):
            t0 = time.perf_counter()
            g.dijkstra(source, target, trace=False)
            t1 = time.perf_counter()
            durations.append((t1 - t0) * 1000.0) # Convert to ms

        durations.sort()
        median_ms = round(durations[len(durations) // 2], 3)

        results.append({
            "nodes": v_count,
            "edges": total_edges,
            "measured_ms": median_ms,
            "raw_complexity": (v_count + total_edges) * log2(max(2, v_count)),
        })

    # Scale theoretical O((V+E) log V) curve to fit the measured data points
    if results:
        # Fit scale factor C using the middle data point
        mid_idx = len(results) // 2
        mid_sample = results[mid_idx]
        scale = mid_sample["measured_ms"] / max(0.001, mid_sample["raw_complexity"])

        for r in results:
            r["theoretical_ms"] = round(r["raw_complexity"] * scale, 3)
            del r["raw_complexity"]

    return {
        "algorithm": "Dijkstra with Custom MinHeap",
        "theoretical_complexity": "O((V + E) log V)",
        "repeats_per_size": 5,
        "seed": 42,
        "data": results,
    }
