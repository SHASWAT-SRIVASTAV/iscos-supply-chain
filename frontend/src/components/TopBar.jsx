import React from 'react';
import { Sun, Moon, Zap, Command, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopBar({ title, onOpenPalette, onResetSeed, isResetting }) {
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="h-16 px-6 glass-panel mx-4 mt-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-display font-semibold text-text-main tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Command palette search trigger */}
        <button
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2/80 hover:bg-surface-2 border border-border text-xs text-text-dim transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Commands</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-text-dim">
            Ctrl+K
          </kbd>
        </button>

        {/* Reset / Load Sample Seed */}
        <button
          onClick={onResetSeed}
          disabled={isResetting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2/60 hover:bg-surface-2 border border-border text-xs text-text-dim hover:text-text-main transition-colors disabled:opacity-50"
          title="Reload Demo Seed Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Reset Seed</span>
        </button>

        {/* Quick Optimize Shortcut */}
        <button
          onClick={() => navigate('/optimize')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-fg font-medium text-xs hover:brightness-110 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Optimize</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 border border-border text-text-dim hover:text-text-main transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
