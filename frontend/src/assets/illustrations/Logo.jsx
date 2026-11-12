import React from 'react';

export function Logo({ className = "h-8" }) {
  return (
    <div className={`flex items-center gap-2.5 font-display select-none ${className}`}>
      <svg 
        viewBox="0 0 32 32" 
        className="h-7 w-7 text-accent shrink-0" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="7" cy="8" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="25" cy="8" r="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.2" />
        <path d="M10 10L14 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M22 10L18 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M11 8H21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <div className="flex flex-col">
        <span className="font-bold tracking-wider text-text-main text-lg leading-none">ISCOS</span>
        <span className="text-[9px] uppercase tracking-widest text-text-dim font-mono leading-tight">Supply Chain AI</span>
      </div>
    </div>
  );
}
