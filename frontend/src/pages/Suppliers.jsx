import React, { useEffect, useState } from 'react';
import { getSuppliers, getRestockSuggestions, createSupplier } from '../api/client';
import { Building2, Plus, Clock, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    city: '',
    lead_time_days: '3',
    price_rating: '4.0',
    reliability: '0.95',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sups, restock] = await Promise.all([
        getSuppliers(),
        getRestockSuggestions(),
      ]);
      setSuppliers(sups);
      setSuggestions(restock);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createSupplier({
        ...form,
        lead_time_days: parseInt(form.lead_time_days, 10),
        price_rating: parseFloat(form.price_rating),
        reliability: parseFloat(form.reliability),
      });
      setShowModal(false);
      setForm({ name: '', city: '', lead_time_days: '3', price_rating: '4.0', reliability: '0.95' });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Vendor Directory & Multi-Criteria Ranking
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Suppliers & Vendor Procurement
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Transparent restock ranking: 40% Reliability + 30% Price Rating + 30% Delivery Speed.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-accent">{s.id}</span>
              <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono">
                {s.city}
              </span>
            </div>

            <h3 className="text-base font-display font-semibold text-text-main">
              {s.name}
            </h3>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
              <div className="p-2 rounded bg-surface-2/50">
                <Clock className="w-3.5 h-3.5 mx-auto text-text-dim mb-1" />
                <div className="font-mono font-bold text-xs text-text-main">{s.lead_time_days}d</div>
                <div className="text-[9px] text-text-dim font-mono">Lead Time</div>
              </div>

              <div className="p-2 rounded bg-surface-2/50">
                <Star className="w-3.5 h-3.5 mx-auto text-warn mb-1" />
                <div className="font-mono font-bold text-xs text-text-main">{s.price_rating} / 5</div>
                <div className="text-[9px] text-text-dim font-mono">Rating</div>
              </div>

              <div className="p-2 rounded bg-surface-2/50">
                <ShieldCheck className="w-3.5 h-3.5 mx-auto text-ok mb-1" />
                <div className="font-mono font-bold text-xs text-ok">{(s.reliability * 100).toFixed(0)}%</div>
                <div className="text-[9px] text-text-dim font-mono">Reliability</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Restock Recommendations Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-semibold text-text-main">
              Automated Restock Recommendations
            </h3>
            <p className="text-xs text-text-dim font-mono">
              Evaluated for products currently depleted below safe warehouse reorder levels
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-accent/15 text-accent text-xs font-mono font-semibold">
            {suggestions.length} Required
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-dim font-mono">
            No restock orders required currently.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/50 border-b border-border text-text-dim font-mono">
                <tr>
                  <th className="px-4 py-2.5">Depleted Item</th>
                  <th className="px-4 py-2.5">Target Warehouse</th>
                  <th className="px-4 py-2.5">Suggested Quantity</th>
                  <th className="px-4 py-2.5">Recommended Vendor</th>
                  <th className="px-4 py-2.5 text-right">Vendor Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {suggestions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-2/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-main">{item.product_name}</div>
                      <div className="font-mono text-[10px] text-text-dim">{item.product_id}</div>
                    </td>
                    <td className="px-4 py-3 text-text-dim">{item.warehouse_name}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-accent">
                      +{item.suggested_order_qty} units
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-main">{item.primary_supplier?.name}</div>
                      <div className="font-mono text-[10px] text-text-dim">
                        {item.primary_supplier?.city} &bull; {item.primary_supplier?.lead_time_days}d lead
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-ok">
                      {(item.supplier_score * 100).toFixed(1)} / 100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-lg font-display font-semibold text-text-main">
              Add New Supplier
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-dim font-mono mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-text-dim font-mono mb-1">City Hub</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">Lead Days</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.lead_time_days}
                    onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-dim font-mono mb-1">Price (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={form.price_rating}
                    onChange={(e) => setForm({ ...form, price_rating: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-text-dim font-mono mb-1">Reliability</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    value={form.reliability}
                    onChange={(e) => setForm({ ...form, reliability: e.target.value })}
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
                  disabled={submitting}
                  className="px-4 py-2 rounded bg-accent text-accent-fg font-medium hover:brightness-110"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
