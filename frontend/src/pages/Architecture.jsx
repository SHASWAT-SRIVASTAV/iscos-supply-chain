import React, { useState } from 'react';
import { Network, FileCode, CheckCircle2, ChevronRight, Layers, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const ARCH_NODES = [
  {
    id: 'frontend',
    title: 'React UI Shell',
    tech: 'React 18 + Vite + Tailwind',
    file: 'frontend/src/App.jsx',
    layer: 'Presentation',
    role: 'Renders mission control, handles theme tokens, maps, and steppers. Contains NO business logic.',
    complexity: 'O(1) display logic',
    color: 'var(--accent)',
  },
  {
    id: 'api_client',
    title: 'HTTP API Client',
    tech: 'Browser Fetch API wrapper',
    file: 'frontend/src/api/client.js',
    layer: 'API Client',
    role: 'Centralized network interface. All React components communicate with the backend exclusively through this file.',
    complexity: 'Network I/O',
    color: 'var(--accent)',
  },
  {
    id: 'routers',
    title: 'FastAPI Routers',
    tech: 'FastAPI + Pydantic v2',
    file: 'backend/app/routers/*.py',
    layer: 'Transport / Validation',
    role: 'Parses HTTP requests, validates schemas, delegates directly to SupplyChainService, maps HTTP status codes.',
    complexity: 'O(1) schema validation',
    color: 'var(--accent-2)',
  },
  {
    id: 'service',
    title: 'SupplyChainService',
    tech: 'Python 3.10+ State Manager',
    file: 'backend/app/services/supply_chain.py',
    layer: 'Service / Coordinator',
    role: 'Single source of truth in memory. Owns custom DSA registries, coordinates optimization flow, calls storage after mutation.',
    complexity: 'Coordinates core DSA',
    color: 'var(--accent-2)',
  },
  {
    id: 'dsa_core',
    title: 'Hand-Crafted DSA Core',
    tech: 'Pure Python (No external graph/heap libs)',
    file: 'backend/app/dsa/*.py',
    layer: 'Core Algorithms',
    role: 'HashRegistry O(1), MinHeap O(log N), Dijkstra O((V+E)log V), BFS O(V+E), MergeSort O(N log N), BinarySearch O(log N).',
    complexity: 'O((V+E)log V) hero bound',
    color: 'var(--ok)',
  },
  {
    id: 'storage',
    title: 'JSON Persistence',
    tech: 'File I/O (store.json / seed.json)',
    file: 'backend/app/storage/store.py',
    layer: 'Persistence',
    role: 'Persists in-memory state after changes and seeds initial factory data.',
    complexity: 'O(N) serialization',
    color: 'var(--warn)',
  },
];

export function Architecture() {
  const [selectedNode, setSelectedNode] = useState(ARCH_NODES[4]); // Default to DSA Core

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Layered Architecture & Viva Roadmap
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            System Architecture & Optimization Dataflow
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Strict separation of concerns: UI &rarr; API &rarr; Service Coordinator &rarr; Hand-Crafted DSA &rarr; JSON Storage.
          </p>
        </div>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-display font-semibold text-text-main">
          Request Pipeline: Click any block to view code location, complexity, and contract
        </h3>

        {/* SVG Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
          {ARCH_NODES.map((node, idx) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between relative group ${
                  isSelected 
                    ? 'bg-surface-2 border-accent ring-2 ring-accent/30 shadow-lg' 
                    : 'bg-surface-2/40 border-border hover:border-accent/50'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-mono text-text-dim">
                    Layer {idx + 1}
                  </div>
                  <div className="font-display font-bold text-xs text-text-main mt-1">
                    {node.title}
                  </div>
                  <div className="text-[10px] text-text-dim font-mono mt-1">
                    {node.tech}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/40 text-[9px] font-mono text-accent">
                  {node.complexity}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="glass-panel p-6 space-y-4 border-accent/40 bg-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div>
              <span className="text-xs font-mono text-accent font-bold uppercase tracking-wider">
                {selectedNode.layer}
              </span>
              <h3 className="text-lg font-display font-bold text-text-main">
                {selectedNode.title}
              </h3>
            </div>
            <div className="font-mono text-xs px-3 py-1 rounded bg-surface border border-border text-text-main flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-accent" />
              <span>{selectedNode.file}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <span className="font-mono text-text-dim font-semibold uppercase text-[10px]">Architectural Mandate</span>
              <p className="text-text-main leading-relaxed">
                {selectedNode.role}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-text-dim font-semibold uppercase text-[10px]">Asymptotic Bound & Defense</span>
              <div className="p-3 rounded-lg bg-surface border border-border font-mono text-accent-2 font-semibold">
                {selectedNode.complexity}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DSA Viva Defense Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-display font-semibold text-text-main">
          Complete DSA-II Implementation Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/60 border-b border-border text-text-dim font-mono">
              <tr>
                <th className="py-2.5 px-3">Need</th>
                <th className="py-2.5 px-3">Structure / Algorithm</th>
                <th className="py-2.5 px-3">File Location</th>
                <th className="py-2.5 px-3">Time Complexity</th>
                <th className="py-2.5 px-3">Why Hand-Crafted?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-mono">
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Entity Lookup by ID</td>
                <td className="py-2.5 px-3 text-accent font-bold">HashRegistry (dict)</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/hash_registry.py</td>
                <td className="py-2.5 px-3 text-ok font-semibold">O(1) average</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Instant random access for products, warehouses, orders</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Order Priority Dispatch</td>
                <td className="py-2.5 px-3 text-accent font-bold">Array Binary MinHeap</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/min_heap.py</td>
                <td className="py-2.5 px-3 text-ok font-semibold">push/pop O(log N)</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Pops urgent orders first, tracks array swaps for visualizer</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Shipment Dispatch Flow</td>
                <td className="py-2.5 px-3 text-accent font-bold">ShipmentQueue (FIFO deque)</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/shipment_queue.py</td>
                <td className="py-2.5 px-3 text-ok font-semibold">O(1) push/pop</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Strict FIFO delivery pipeline without linear shift overhead</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Cheapest Route Path</td>
                <td className="py-2.5 px-3 text-accent font-bold">Dijkstra + MinHeap</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/route_graph.py</td>
                <td className="py-2.5 px-3 text-accent-2 font-semibold">O((V+E) log V)</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Shortest road route, produces step trace for Algorithm Lab</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Fewest Stops & Connectivity</td>
                <td className="py-2.5 px-3 text-accent font-bold">Breadth-First Search (BFS)</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/route_graph.py</td>
                <td className="py-2.5 px-3 text-ok font-semibold">O(V + E)</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Verifies road graph connectivity and minimum vertex hops</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">Stable Entity Sorting</td>
                <td className="py-2.5 px-3 text-accent font-bold">Custom Merge Sort</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/sorting.py</td>
                <td className="py-2.5 px-3 text-accent-2 font-semibold">O(N log N) stable</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Divide-and-conquer guarantees stability for multi-level table sorts</td>
              </tr>
              <tr className="hover:bg-surface-2/30">
                <td className="py-2.5 px-3 text-text-main">SKU Lookup in Sorted Data</td>
                <td className="py-2.5 px-3 text-accent font-bold">Binary Search</td>
                <td className="py-2.5 px-3 text-text-dim">app/dsa/searching.py</td>
                <td className="py-2.5 px-3 text-ok font-semibold">O(log N)</td>
                <td className="py-2.5 px-3 text-text-dim font-sans text-[11px]">Halves search interval; handles duplicates by finding first occurrence</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
