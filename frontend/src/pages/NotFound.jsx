import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="glass-panel p-12 text-center max-w-md mx-auto my-12 space-y-4">
      <div className="w-16 h-16 rounded-full bg-warn/15 border border-warn/30 flex items-center justify-center mx-auto text-warn">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-display font-bold text-text-main">404 - Page Not Found</h2>
      <p className="text-sm text-text-dim">
        The route you requested does not exist on the ISCOS control room navigation network.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-fg font-medium text-sm hover:brightness-110 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
