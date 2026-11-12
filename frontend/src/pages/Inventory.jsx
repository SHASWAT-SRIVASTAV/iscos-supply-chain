import React, { useEffect, useState } from 'react';
import { getInventory, getWarehouses, adjustInventory, getLowStockAlerts } from '../api/client';
import { Boxes, Filter, Edit3, AlertTriangle, ArrowUpDown, Plus, Minus, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWh, setSelectedWh] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stock Adjustment Modal
  const [adjustItem, setAdjustItem] = useState(null);
  const [delta, setDelta] = useState(10);
  const [adjError, setAdjError] = useState(null);
  const [adjusting, setAdjusting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inv, whs] = await Promise.all([
        getInventory(selectedWh || null),
        getWarehouses(),
      ]);
      setInventory(inv);
      setWarehouses(whs);
    } catch (err) {
      setError(err.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWh]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      setAdjusting(true);
      setAdjError(null);
      await adjustInventory({
        warehouse_id: adjustItem.warehouse_id,
        product_id: adjustItem.product_id,
        quantity_delta: parseInt(delta, 10),
      });
      setAdjustItem(null);
      loadData();
    } catch (err) {
      setAdjError(err.message || 'Failed to adjust stock.');
    } finally {
      setAdjusting(false);
    }
  };

  const filteredInventory = inventory.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.product_name?.toLowerCase().includes(q) ||
      row.product_sku?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Stock Matrix & Reservation Ledger
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Warehouse Inventory & Stock Allocation
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Real-time available stock = Quantity &minus; Reserved. Low stock triggered when available &le; Reorder Level.
          </p>
        </div>

        {/* Search & Warehouse Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-56 group">
            <Search className="w-4 h-4 text-text-dim group-focus-within:text-accent absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-xs text-text-main placeholder:text-text-dim/80 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto group">
            <Filter className="w-4 h-4 text-text-dim group-focus-within:text-accent transition-colors" />
            <select
              value={selectedWh}
              onChange={(e) => setSelectedWh(e.target.value)}
              className="px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-xs text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer shadow-inner w-full sm:w-auto"
            >
              <option value="" className="bg-surface text-text-main">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="bg-surface text-text-main">
                  {w.name} ({w.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/50 border-b border-border text-text-dim font-mono">
              <tr>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-right">Reserved</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Min Level</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredInventory.map((row) => (
                <tr 
                  key={`${row.warehouse_id}-${row.product_id}`} 
                  className={`hover:bg-surface-2/40 transition-colors ${row.is_low_stock ? 'bg-danger/5' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-text-main">
                    <div>{row.warehouse_name}</div>
                    <div className="font-mono text-[10px] text-text-dim">{row.warehouse_id} &bull; {row.warehouse_city}</div>
                  </td>
                  <td className="px-4 py-3 text-text-main font-medium">
                    {row.product_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-dim">
                    {row.product_sku}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-text-main">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-dim">
                    {row.reserved}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${row.is_low_stock ? 'text-danger' : 'text-ok'}`}>
                    {row.available}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-dim">
                    {row.reorder_level}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={row.is_low_stock ? 'LOW_STOCK' : 'OK'} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { setAdjustItem(row); setDelta(10); setAdjError(null); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-2/80 text-text-dim hover:text-text-main border border-border"
                      title="Adjust inventory quantity"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-base font-display font-semibold text-text-main">
              Adjust Stock Quantity
            </h3>
            <div className="p-3 rounded bg-surface-2/60 text-xs space-y-1">
              <div className="text-text-main font-medium">{adjustItem.product_name}</div>
              <div className="text-text-dim font-mono">{adjustItem.warehouse_name} ({adjustItem.warehouse_id})</div>
              <div className="text-text-dim font-mono pt-1">
                Current On-Hand: <strong className="text-text-main">{adjustItem.quantity}</strong> | Reserved: <strong className="text-text-main">{adjustItem.reserved}</strong>
              </div>
            </div>

            {adjError && (
              <div className="p-2.5 rounded bg-danger/10 border border-danger/30 text-xs text-danger">
                {adjError}
              </div>
            )}

            <form onSubmit={handleAdjust} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-dim font-mono mb-1">
                  Quantity Delta (Positive to Add, Negative to Deduct)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDelta(d => d - 5)}
                    className="p-2 bg-surface-2 border border-border rounded text-text-dim hover:text-text-main"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    required
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    className="w-full text-center px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded font-mono font-bold text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta(d => d + 5)}
                    className="p-2 bg-surface-2 border border-border rounded text-text-dim hover:text-text-main"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[10px] text-text-dim font-mono mt-1 text-center">
                  New Resulting On-Hand: <strong>{adjustItem.quantity + (parseInt(delta, 10) || 0)}</strong> units
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 rounded bg-surface-2 text-text-dim hover:text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-4 py-2 rounded bg-accent text-accent-fg font-medium hover:brightness-110"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
