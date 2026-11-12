import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig, motion, AnimatePresence } from 'framer-motion';

import { Backdrop } from './components/Backdrop';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { loadSeedData } from './api/client';

import { Dashboard } from './pages/Dashboard';
import { Optimize } from './pages/Optimize';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Warehouses } from './pages/Warehouses';
import { Products } from './pages/Products';
import { Suppliers } from './pages/Suppliers';
import { NotFound } from './pages/NotFound';

// Lazy-load heavier visualizer and chart pages as specified in Shell contract
const AlgorithmLab = React.lazy(() => import('./pages/AlgorithmLab').then(m => ({ default: m.AlgorithmLab })));
const Benchmarks = React.lazy(() => import('./pages/Benchmarks').then(m => ({ default: m.Benchmarks })));
const Architecture = React.lazy(() => import('./pages/Architecture').then(m => ({ default: m.Architecture })));


const PAGE_TITLES = {
  '/': 'Mission Control Dashboard',
  '/optimize': 'Supply Chain Optimizer',
  '/orders': 'Orders & MinHeap Priority Queue',
  '/inventory': 'Inventory & Stock Alerts',
  '/warehouses': 'Warehouses Network',
  '/products': 'Product Catalog',
  '/suppliers': 'Suppliers Directory',
  '/lab': 'Algorithm Interactive Lab',
  '/benchmarks': 'Empirical Benchmarks',
  '/architecture': 'System Architecture',
};

export function App() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleResetSeed = async () => {
    try {
      setIsResetting(true);
      await loadSeedData();
      showToast('Sample seed data successfully loaded into memory & store.', 'ok');
    } catch (err) {
      showToast(err.message || 'Failed to reload seed data.', 'danger');
    } finally {
      setIsResetting(false);
    }
  };

  const title = PAGE_TITLES[location.pathname] || 'ISCOS Logistics';

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-bg text-text-main font-sans selection:bg-accent selection:text-accent-fg relative">
        <Backdrop />
        
        {/* Fixed 248px glass sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar 
            title={title} 
            onOpenPalette={() => setPaletteOpen(true)}
            onResetSeed={handleResetSeed}
            isResetting={isResetting}
          />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <React.Suspense fallback={
              <div className="glass-panel p-12 text-center text-xs font-mono text-text-dim animate-pulse">
                Loading module...
              </div>
            }>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Routes location={location}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/optimize" element={<Optimize />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/warehouses" element={<Warehouses />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/lab" element={<AlgorithmLab />} />
                    <Route path="/benchmarks" element={<Benchmarks />} />
                    <Route path="/architecture" element={<Architecture />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </React.Suspense>
          </main>

        </div>

        {/* Global Command Palette */}
        <CommandPalette 
          isOpen={paletteOpen} 
          onClose={setPaletteOpen}
          onResetSeed={handleResetSeed}
        />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-3 text-xs font-mono border-accent/40 shadow-xl flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${toast.type === 'ok' ? 'bg-ok' : toast.type === 'danger' ? 'bg-danger' : 'bg-info'}`} />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
export default App;
