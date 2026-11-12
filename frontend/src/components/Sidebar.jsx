import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  Boxes, 
  Warehouse, 
  Package, 
  Building2, 
  FlaskConical, 
  LineChart, 
  Network
} from 'lucide-react';
import { Logo } from '../assets/illustrations/Logo';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/optimize', label: 'Optimize', icon: Zap, hero: true },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/suppliers', label: 'Suppliers', icon: Building2 },
  { to: '/lab', label: 'Algorithm Lab', icon: FlaskConical },
  { to: '/benchmarks', label: 'Benchmarks', icon: LineChart },
  { to: '/architecture', label: 'Architecture', icon: Network },
];

export function Sidebar() {
  return (
    <aside className="w-[248px] shrink-0 h-[calc(100vh-2rem)] sticky top-4 left-4 my-4 ml-4 glass-panel flex flex-col p-4 select-none z-30">
      <div className="px-3 py-2 mb-4 border-b border-border/60 pb-4">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-accent/15 text-accent border border-accent/30 font-semibold' 
                  : 'text-text-dim hover:text-text-main hover:bg-surface-2/60 border border-transparent'}
                ${item.hero && !isActive ? 'hover:text-accent' : ''}
              `}
            >
              <Icon className={`w-4 h-4 shrink-0`} />
              <span>{item.label}</span>
              {item.hero && (
                <span className="ml-auto text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                  Hero
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-3 border-t border-border/60 px-3 text-xs text-text-dim flex items-center justify-between font-mono">
        <span>DSA-II Core</span>
        <span className="flex items-center gap-1.5 text-ok">
          <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
          Ready
        </span>
      </div>
    </aside>
  );
}
