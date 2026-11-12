import React from 'react';

export function HeroSupplyChain({ className = "w-full max-w-[280px] h-auto" }) {
  return (
    <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="heroTealGrad" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Network Edges */}
      <path d="M40 90 L120 40 L200 70 L280 40" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M120 40 L160 130 L240 140 L280 40" stroke="var(--border)" strokeWidth="2" />
      <path d="M40 90 L160 130" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
      {/* Active Route Highlight */}
      <path d="M40 90 L120 40 L200 70 L280 40" stroke="url(#heroTealGrad)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Nodes */}
      <circle cx="40" cy="90" r="10" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3" />
      <circle cx="120" cy="40" r="14" fill="var(--surface)" stroke="var(--accent)" strokeWidth="3.5" />
      <circle cx="200" cy="70" r="9" fill="var(--surface)" stroke="var(--accent-2)" strokeWidth="2.5" />
      <circle cx="280" cy="40" r="12" fill="var(--surface)" stroke="var(--ok)" strokeWidth="3" />
      <circle cx="160" cy="130" r="11" fill="var(--surface)" stroke="var(--border)" strokeWidth="2.5" />
      <circle cx="240" cy="140" r="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
      {/* Hub icon glyphs */}
      <circle cx="120" cy="40" r="4" fill="var(--accent)" />
      <circle cx="280" cy="40" r="4" fill="var(--ok)" />
    </svg>
  );
}

export function EmptyOrders({ className = "w-36 h-36" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="50" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="2" />
      <path d="M40 45H80M40 60H70M40 75H55" stroke="var(--text-dim)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="78" cy="75" r="7" stroke="var(--warn)" strokeWidth="2" />
      <path d="M78 72V76M78 78V79" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyProducts({ className = "w-36 h-36" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="30" width="70" height="60" rx="8" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="2" />
      <path d="M25 50H95M60 50V90" stroke="var(--border)" strokeWidth="2" />
      <circle cx="60" cy="40" r="3" fill="var(--accent)" />
    </svg>
  );
}

export function EmptyWarehouses({ className = "w-36 h-36" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 55L60 25L100 55V95H20V55Z" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="2" />
      <rect x="45" y="65" width="30" height="30" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

export function EmptyNetwork({ className = "w-36 h-36" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="35" cy="45" r="10" stroke="var(--border)" strokeWidth="2" />
      <circle cx="85" cy="45" r="10" stroke="var(--border)" strokeWidth="2" />
      <circle cx="60" cy="85" r="10" stroke="var(--text-dim)" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M45 45H75M42 53L54 77M78 53L66 77" stroke="var(--border)" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  );
}

export function EmptyResult({ className = "w-36 h-36" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="45" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="55" cy="55" r="18" stroke="var(--accent)" strokeWidth="3" />
      <path d="M68 68L85 85" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
