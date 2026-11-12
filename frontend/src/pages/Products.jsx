import React, { useEffect, useState } from 'react';
import { getProducts, getSuppliers, createProduct } from '../api/client';
import { EmptyProducts } from '../assets/illustrations';
import { Package, Search, Plus, RotateCcw, ArrowUpDown } from 'lucide-react';

export function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New product modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit_price: '',
    weight_kg: '',
    supplier_id: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, sups] = await Promise.all([
        getProducts({ search, sort_by: sortBy, order }),
        getSuppliers(),
      ]);
      setProducts(prods);
      setSuppliers(sups);
      if (sups.length > 0 && !form.supplier_id) {
        setForm(f => ({ ...f, supplier_id: sups[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, sortBy, order]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      await createProduct({
        ...form,
        unit_price: parseFloat(form.unit_price) || 0,
        weight_kg: parseFloat(form.weight_kg) || 0,
      });
      setShowModal(false);
      setForm({ name: '', sku: '', category: '', unit_price: '', weight_kg: '', supplier_id: suppliers[0]?.id || '' });
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Entity Registry (O(1) Hash Map)
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Product Master Catalog
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Indexed by unique SKU and ID. Supports custom stable merge sort and binary search lookups.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full group">
          <Search className="w-4 h-4 text-text-dim group-focus-within:text-accent absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-xs text-text-main placeholder:text-text-dim/80 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-xs text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer shadow-inner"
          >
            <option value="name" className="bg-surface text-text-main">Sort: Name</option>
            <option value="sku" className="bg-surface text-text-main">Sort: SKU</option>
            <option value="unit_price" className="bg-surface text-text-main">Sort: Price</option>
            <option value="weight_kg" className="bg-surface text-text-main">Sort: Weight</option>
          </select>

          <button
            onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-bg hover:bg-surface-2 border border-border hover:border-text-dim/50 rounded-lg text-text-dim hover:text-text-main focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="glass-panel p-8 text-center text-xs text-text-dim font-mono animate-pulse">
          Loading products from registry...
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center space-y-3 border-danger/40">
          <p className="text-sm text-danger font-medium">{error}</p>
          <button onClick={fetchProducts} className="px-3 py-1.5 rounded bg-surface-2 text-xs">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <EmptyProducts className="mx-auto" />
          <h3 className="text-base font-display font-semibold text-text-main">No Products Found</h3>
          <p className="text-xs text-text-dim max-w-sm mx-auto">
            No products matched your search filter. Clear the search or create a new catalog entry.
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-border text-xs text-text-main"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/50 border-b border-border text-text-dim font-mono">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Weight (kg)</th>
                  <th className="px-4 py-3">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-accent font-semibold">{p.id}</td>
                    <td className="px-4 py-3 font-mono text-text-dim">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-text-main">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-text-main">
                      ${p.unit_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-dim">
                      {p.weight_kg.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-text-dim">
                      {p.supplier_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-lg font-display font-semibold text-text-main">
              Add New Product
            </h3>
            {formError && (
              <div className="p-2.5 rounded bg-danger/10 border border-danger/30 text-xs text-danger">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-dim font-mono mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-text-dim font-mono mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-text-dim font-mono mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-text-dim font-mono mb-1">Supplier</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 bg-bg border border-border hover:border-text-dim/50 rounded-lg text-text-main outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer shadow-inner"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id} className="bg-surface text-text-main">
                      {s.name} ({s.id} - {s.city})
                    </option>
                  ))}
                </select>
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
                  className="px-4 py-2 rounded bg-accent text-accent-fg font-medium hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
