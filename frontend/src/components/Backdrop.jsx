import React from 'react';

export function Backdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
      {/* Top-left Teal radial glow */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />
      {/* Bottom-right Violet radial glow */}
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--accent-2) 0%, transparent 70%)' }}
      />
      {/* 48px grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
    </div>
  );
}
