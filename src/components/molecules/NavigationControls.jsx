import React from 'react';

/**
 * Breadcrumb (Molecule)
 * Breadcrumb trail for hierarchy navigation
 */
export function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: 'var(--muted)',
      marginBottom: '4px'
    }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <span style={{
              fontWeight: isLast ? 700 : 500,
              color: isLast ? 'var(--black)' : 'var(--muted)',
              cursor: item.onClick ? 'pointer' : 'default'
            }}
            onClick={item.onClick}
            >
              {item.label}
            </span>
            {!isLast && <span style={{ color: 'var(--line-strong)' }}>/</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Pagination (Molecule)
 * Pagination control bar with direct-jump pages and previous/next navigation
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination-container">
      <button
        type="button"
        className="pagination-item"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        title="Previous Page"
        aria-label="Previous Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      {pages.map((p, idx) => {
        if (p === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
              ...
            </span>
          );
        }
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            className={`pagination-item ${isActive ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={isActive ? 'page' : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-item"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        title="Next Page"
        aria-label="Next Page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
}
