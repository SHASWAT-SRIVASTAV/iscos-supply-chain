import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  Boxes, 
  Warehouse, 
  Package, 
  Building2, 
  FlaskConical, 
  LineChart, 
  Network,
  RotateCcw
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose, onResetSeed, onOptimizeNext }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'opt-next', label: 'Action: Run Optimize Next', icon: Zap, action: () => { onOptimizeNext?.(); onClose(false); } },
    { id: 'seed', label: 'Action: Reload Sample Data', icon: RotateCcw, action: () => { onResetSeed?.(); onClose(false); } },
    { id: 'p-dash', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => { navigate('/'); onClose(false); } },
    { id: 'p-opt', label: 'Go to Optimize Hero Map', icon: Zap, action: () => { navigate('/optimize'); onClose(false); } },
    { id: 'p-orders', label: 'Go to Orders & MinHeap Queue', icon: ShoppingCart, action: () => { navigate('/orders'); onClose(false); } },
    { id: 'p-inv', label: 'Go to Inventory & Low-Stock Alerts', icon: Boxes, action: () => { navigate('/inventory'); onClose(false); } },
    { id: 'p-wh', label: 'Go to Warehouses', icon: Warehouse, action: () => { navigate('/warehouses'); onClose(false); } },
    { id: 'p-prod', label: 'Go to Products Catalog', icon: Package, action: () => { navigate('/products'); onClose(false); } },
    { id: 'p-sup', label: 'Go to Suppliers Directory', icon: Building2, action: () => { navigate('/suppliers'); onClose(false); } },
    { id: 'p-lab', label: 'Go to Algorithm Lab (Dijkstra & Heap Stepper)', icon: FlaskConical, action: () => { navigate('/lab'); onClose(false); } },
    { id: 'p-bench', label: 'Go to Benchmarks', icon: LineChart, action: () => { navigate('/benchmarks'); onClose(false); } },
    { id: 'p-arch', label: 'Go to System Architecture', icon: Network, action: () => { navigate('/architecture'); onClose(false); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg glass-panel overflow-hidden border border-border shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-dim" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or page name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-text-main placeholder-text-dim outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-text-dim border border-border">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-dim">No matching commands found.</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-text-dim hover:text-text-main hover:bg-surface-2 transition-colors"
                >
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span className="flex-1 font-medium">{item.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
