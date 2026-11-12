import React, { useEffect, useState } from 'react';
import { 
  getOrders, 
  getOrderQueue, 
  createOrder, 
  getProducts, 
  getRoutesGraph,
  advanceShipment,
  getShipmentQueue
} from '../api/client';
import { ShoppingCart, Plus, Truck, AlertCircle, Clock, Zap } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [orderQueue, setOrderQueue] = useState([]);
  const [shipmentQueue, setShipmentQueue] = useState([]);
  const [products, setProducts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Order Modal State
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [destCity, setDestCity] = useState('');
  const [priority, setPriority] = useState(2);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allOrders, qOrders, shQueue, prods, graphData] = await Promise.all([
        getOrders(),
        getOrderQueue(),
        getShipmentQueue(),
        getProducts(),
        getRoutesGraph(),
      ]);
      setOrders(allOrders);
      setOrderQueue(qOrders);
      setShipmentQueue(shQueue);
      setProducts(prods);
      setCities(graphData.cities || []);
      if (graphData.cities?.length > 0 && !destCity) {
        setDestCity(graphData.cities[0]);
      }
      if (prods.length > 0 && !selectedProduct) {
        setSelectedProduct(prods[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setFormError(null);
      await createOrder({
        customer_name: customerName,
        destination_city: destCity,
        priority: parseInt(priority, 10),
        items: [{ product_id: selectedProduct, qty: parseInt(quantity, 10) }],
      });
      setShowModal(false);
      setCustomerName('');
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceShipment = async () => {
    try {
      await advanceShipment();
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to advance shipment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">
            Order Lifecycle & MinHeap Priority Queue
          </div>
          <h2 className="text-xl font-display font-bold text-text-main mt-1">
            Orders & Shipment Dispatch Pipeline
          </h2>
          <p className="text-xs text-text-dim mt-0.5">
            Orders are prioritized by (Priority 1 urgent to 3 normal, arrival timestamp) via binary MinHeap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg text-sm font-medium hover:brightness-110 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Top Section: Active MinHeap Queue & Shipment Deque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MinHeap Pending Queue */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display font-semibold text-text-main">
                Order MinHeap Queue (Pending Dispatch)
              </h3>
              <p className="text-[11px] text-text-dim font-mono">
                Pop Priority: P1 &rarr; P2 &rarr; P3 (Earliest created_at breaks ties)
              </p>
            </div>
            <button
              onClick={() => navigate('/optimize')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Optimize Next</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/40 border-b border-border/50 text-text-dim font-mono">
                <tr>
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Destination</th>
                  <th className="py-2 px-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {orderQueue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-dim font-mono">
                      Queue empty. All orders dispatched.
                    </td>
                  </tr>
                ) : (
                  orderQueue.map((o, idx) => (
                    <tr key={o.id} className="hover:bg-surface-2/30">
                      <td className="py-2.5 px-3 font-mono text-accent font-bold">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-text-main">{o.id}</td>
                      <td className="py-2.5 px-3 text-text-main">{o.destination_city}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                          o.priority === 1 ? 'bg-danger/20 text-danger' : o.priority === 2 ? 'bg-warn/20 text-warn' : 'bg-surface-2 text-text-dim'
                        }`}>
                          P{o.priority} {o.priority === 1 ? 'Urgent' : o.priority === 2 ? 'Medium' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FIFO Shipment Deque */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-display font-semibold text-text-main">
                Shipment Flow (FIFO Deque)
              </h3>
              <p className="text-[11px] text-text-dim font-mono">
                O(1) collections.deque: QUEUED &rarr; IN_TRANSIT &rarr; DELIVERED
              </p>
            </div>
            <button
              onClick={handleAdvanceShipment}
              disabled={shipmentQueue.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border text-xs text-text-main disabled:opacity-40"
            >
              <Truck className="w-3.5 h-3.5 text-info" />
              <span>Advance Head</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/40 border-b border-border/50 text-text-dim font-mono">
                <tr>
                  <th className="py-2 px-3">Shipment</th>
                  <th className="py-2 px-3">Order</th>
                  <th className="py-2 px-3">Destination</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {shipmentQueue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-text-dim font-mono">
                      No active shipments in dispatch queue.
                    </td>
                  </tr>
                ) : (
                  shipmentQueue.map((sh) => (
                    <tr key={sh.id} className="hover:bg-surface-2/30">
                      <td className="py-2.5 px-3 font-mono font-medium text-text-main">{sh.id}</td>
                      <td className="py-2.5 px-3 font-mono text-text-dim">{sh.order_id}</td>
                      <td className="py-2.5 px-3 text-text-main">{sh.to_city}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={sh.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Orders Ledger */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <h3 className="text-sm font-display font-semibold text-text-main">
            All Registered Orders Registry
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/50 border-b border-border text-text-dim font-mono">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-accent">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-text-main">{o.customer_name}</td>
                  <td className="px-4 py-3 text-text-main">{o.destination_city}</td>
                  <td className="px-4 py-3 font-mono text-text-dim">
                    {o.items?.map(it => `${it.product_id} x${it.qty}`).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      o.priority === 1 ? 'bg-danger/20 text-danger' : o.priority === 2 ? 'bg-warn/20 text-warn' : 'bg-surface-2 text-text-dim'
                    }`}>
                      P{o.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-dim">
                    {o.failure_reason ? (
                      <span className="text-danger flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {o.failure_reason}
                      </span>
                    ) : (
                      <span className="text-text-dim">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
            <h3 className="text-lg font-display font-semibold text-text-main">
              Create New Order
            </h3>
            {formError && (
              <div className="p-2.5 rounded bg-danger/10 border border-danger/30 text-xs text-danger">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-dim font-mono mb-1">Customer / Enterprise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Logistics Hub"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">Destination City</label>
                  <select
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  >
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-dim font-mono mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent font-mono"
                  >
                    <option value={1}>1 - Urgent</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-dim font-mono mb-1">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-text-main outline-none focus:border-accent"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-dim font-mono mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                  Enqueue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
