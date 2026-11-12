import React, { useEffect, useState } from 'react';
import { 
  getDashboardSummary, 
  getOrderQueue, 
  getLowStockAlerts, 
  getHealth 
} from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { HeroSupplyChain } from '../assets/illustrations';
import { 
  Activity, 
  Boxes, 
  ShoppingCart, 
  Truck, 
  Zap, 
  AlertTriangle, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [ordersQueue, setOrdersQueue] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, qData, alertsData] = await Promise.all([
        getDashboardSummary(),
        getOrderQueue(),
        getLowStockAlerts(),
      ]);
      setSummary(sumData);
      setOrdersQueue(qData || []);
      setLowStock(alertsData || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-panel h-48 bg-surface-2/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card h-28 bg-surface-2/40" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center space-y-4 border-danger/40">
        <AlertTriangle className="w-10 h-10 text-danger mx-auto" />
        <h3 className="text-lg font-display font-semibold text-text-main">Backend Connection Error</h3>
        <p className="text-sm text-text-dim max-w-md mx-auto">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Mission Control Banner */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-mono font-medium border border-accent/25">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            DSA-II LOGISTICS MISSION CONTROL
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-main tracking-tight">
            Intelligent Supply Chain Optimization System
          </h2>
          <p className="text-sm text-text-dim leading-relaxed">
            Multi-criteria dispatching engine powered by hand-crafted array binary MinHeaps, Dijkstra shortest-path relaxation, stable merge sort, and transparent scoring tables.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => navigate('/optimize')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Optimizer</span>
            </button>
            <button
              onClick={() => navigate('/lab')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-sm font-medium text-text-main transition-colors"
            >
              <span>Algorithm Lab</span>
              <ArrowRight className="w-4 h-4 text-text-dim" />
            </button>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center">
          <HeroSupplyChain className="w-64 h-36 drop-shadow-lg" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-dim font-medium uppercase tracking-wide">Pending Orders</span>
            <ShoppingCart className="w-4 h-4 text-warn" />
          </div>
          <div className="text-3xl font-display font-bold text-text-main mt-2 font-mono">
            {summary?.orders?.pending ?? 0}
          </div>
          <div className="text-xs text-text-dim mt-1 font-mono">
            {summary?.orders?.total ?? 0} total registered
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-dim font-medium uppercase tracking-wide">Active Hubs</span>
            <Boxes className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-display font-bold text-text-main mt-2 font-mono">
            {summary?.warehouses?.active ?? 0} / {summary?.warehouses?.total ?? 0}
          </div>
          <div className="text-xs text-text-dim mt-1 font-mono">
            Operational warehouses
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-dim font-medium uppercase tracking-wide">Critical Low-Stock</span>
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className="text-3xl font-display font-bold text-danger mt-2 font-mono">
            {summary?.inventory?.low_stock_count ?? 0}
          </div>
          <div className="text-xs text-text-dim mt-1 font-mono">
            Below reorder threshold
          </div>
        </div>

        {/* Hero stat with gradient */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-dim font-medium uppercase tracking-wide">Hero Algorithm</span>
            <Zap className="w-4 h-4 text-accent-2" />
          </div>
          <div className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-2 mt-2">
            Dijkstra + Heap
          </div>
          <div className="text-xs text-text-dim mt-1 font-mono">
            O((V+E) log V) Complexity
          </div>
        </div>
      </div>

      {/* Grid: Order Queue & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order MinHeap Priority Queue */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-semibold text-text-main">
                Order MinHeap Queue
              </h3>
              <p className="text-xs text-text-dim font-mono">
                Pop order: Priority 1 (urgent) &rarr; Earliest created_at
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-text-dim font-mono">
                  <th className="pb-2">Queue Pos</th>
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Destination</th>
                  <th className="pb-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {ordersQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-dim">
                      No pending orders waiting in queue.
                    </td>
                  </tr>
                ) : (
                  ordersQueue.slice(0, 5).map((order, idx) => (
                    <tr key={order.id} className="hover:bg-surface-2/40">
                      <td className="py-2.5 font-mono text-accent">#{idx + 1}</td>
                      <td className="py-2.5 font-mono font-medium text-text-main">{order.id}</td>
                      <td className="py-2.5 text-text-dim">{order.customer_name}</td>
                      <td className="py-2.5 text-text-main">{order.destination_city}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          order.priority === 1 ? 'bg-danger/15 text-danger' : order.priority === 2 ? 'bg-warn/15 text-warn' : 'bg-surface-2 text-text-dim'
                        }`}>
                          P{order.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock Critical Alerts */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-display font-semibold text-text-main">
                Low-Stock Urgency Ranking
              </h3>
              <p className="text-xs text-text-dim font-mono">
                Sorted by available / reorder_level via MinHeap
              </p>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>Manage Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-text-dim font-mono">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Warehouse</th>
                  <th className="pb-2">Avail / Min</th>
                  <th className="pb-2">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-dim">
                      All inventory levels are healthy.
                    </td>
                  </tr>
                ) : (
                  lowStock.slice(0, 5).map((item, idx) => (
                    <tr key={`${item.warehouse_id}-${item.product_id}`} className="hover:bg-surface-2/40">
                      <td className="py-2.5">
                        <div className="font-medium text-text-main">{item.product_name}</div>
                        <div className="font-mono text-[10px] text-text-dim">{item.product_sku}</div>
                      </td>
                      <td className="py-2.5 text-text-dim">{item.warehouse_name}</td>
                      <td className="py-2.5 font-mono">
                        <span className="text-danger font-semibold">{item.available}</span> / {item.reorder_level}
                      </td>
                      <td className="py-2.5 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-danger/15 text-danger text-[10px] font-semibold">
                          {(item.urgency_ratio * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
