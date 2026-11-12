import React from 'react';

export function StatusBadge({ status, className = "" }) {
  const norm = String(status || '').toUpperCase();

  let styles = "bg-surface-2 text-text-dim border-border";
  let dotColor = "bg-text-dim";

  if (norm === 'DISPATCHED' || norm === 'DELIVERED' || norm === 'ACTIVE') {
    styles = "bg-ok/10 text-ok border-ok/25";
    dotColor = "bg-ok";
  } else if (norm === 'PENDING' || norm === 'QUEUED') {
    styles = "bg-warn/10 text-warn border-warn/25";
    dotColor = "bg-warn";
  } else if (norm === 'FAILED' || norm === 'LOW_STOCK' || norm === 'INACTIVE') {
    styles = "bg-danger/10 text-danger border-danger/25";
    dotColor = "bg-danger";
  } else if (norm === 'IN_TRANSIT') {
    styles = "bg-info/10 text-info border-info/25";
    dotColor = "bg-info";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${styles} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {norm}
    </span>
  );
}
