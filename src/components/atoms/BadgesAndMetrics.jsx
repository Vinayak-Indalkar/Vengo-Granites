import React from 'react';

/**
 * StatusBadge (Atom)
 * Standard status badge with semantic color styling across ERP modules
 */
export function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  
  let type = 'soft';
  if (['active', 'approved', 'optimal', 'issued', 'confirmed', 'settled', 'dispatched', 'delivered'].includes(s)) {
    type = 'emerald';
  } else if (['pending', 'pending approval', 'held', 'under review', 'open', 'weighed', 'checked'].includes(s)) {
    type = 'amber';
  } else if (['blocked', 'rejected', 'cancelled', 'defect', 'scrapped'].includes(s)) {
    type = 'ruby';
  } else if (['polished', 'cut sawn', 'in yard'].includes(s)) {
    type = 'teal';
  }

  return (
    <span className={`badge badge-${type}`}>
      {status}
    </span>
  );
}

/**
 * StatCard (Atom)
 * Key performance and summary metric card
 */
export function StatCard({ label, value, icon: Icon, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="stat-val">{value}</div>
      {subtext && <div className="stat-footer">{subtext}</div>}
    </div>
  );
}
