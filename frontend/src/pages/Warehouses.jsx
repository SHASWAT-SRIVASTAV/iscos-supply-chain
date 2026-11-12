import React, { useEffect, useState } from 'react';
import { getWarehouses, createWarehouse } from '../api/client';
import { Warehouse as WhIcon, Plus, MapPin, Gauge, DollarSign } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    city: '',
    capacity: '10000',
    cost_per_km: '1.40',
    active: true,
  });

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (err) {
      setError(err.message || 'Failed to load warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWarehouse({
        ...form,
        capacity: parseInt(form.capacity, 10),
        cost_per_km: parseFloat(form.cost_per_km),
      });
      setShowModal(false);
      setForm({ name: '', city: '', capacity: '10000', cost_per_km: '1.40', active: true });
      loadWarehouses();
    } catch (err) {
      alert(err.message || 'Failed to create warehouse.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Network Logistics Hubs (Graph Nodes)
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Warehouse Distribution Centers
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Strategic fulfillment hubs mapped to road network vertices for Dijkstra shortest-path dispatching.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Warehouse</span>
        </button>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((w) => (
          <div key={w.id} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-accent">{w.id}</span>
              <StatusBadge status={w.active ? 'ACTIVE' : 'INACTIVE'} />
            </div>

            <h3 className="text-base font-display font-semibold text-text-main">
              {w.name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-text-dim">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>Node: <strong className="text-text-main">{w.city}</strong></span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
              <div className="p-2 rounded bg-surface-2/50">
                <div className="text-[10px] text-text-dim font-mono flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-text-dim" />
                  <span>Capacity</span>
                </div>
                <div className="font-mono font-bold text-text-main mt-1">
                  {w.capacity.toLocaleString()} units
                </div>
              </div>

              <div className="p-2 rounded bg-surface-2/50">
                <div className="text-[10px] text-text-dim font-mono flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-text-dim" />
                  <span>Cost Rate</span>
                </div>
                <div className="font-mono font-bold text-text-main mt-1">
                  ${w.cost_per_km.toFixed(2)} / km
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-lg font-display font-semibold text-text-main">
              Add New Warehouse
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-dim font-mono mb-1">Hub Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-text-dim font-mono mb-1">City Node</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">Capacity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-dim font-mono mb-1">Cost / km ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={form.cost_per_km}
                    onChange={(e) => setForm({ ...form, cost_per_km: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-surface-2 text-text-dim hover:text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-accent text-accent-fg font-medium hover:brightness-110"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
