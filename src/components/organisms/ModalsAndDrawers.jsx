import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { StatusBadge } from '../atoms/BadgesAndMetrics';

/**
 * ConfirmDialog (Molecule)
 * Accessible modal dialog for destructive or critical confirmation
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--r-16)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--sh-3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>
            {title}
          </div>
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            title="Close"
            style={{ width: '28px', height: '28px' }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px', fontSize: '13px', color: 'var(--ink)' }}>
          {message}
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${danger ? 'btn-primary' : 'btn-primary'}`}
            style={danger ? { backgroundColor: 'var(--ruby-text)', borderColor: 'var(--ruby-text)' } : {}}
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * FormDrawer (Organism)
 * Slide-over drawer form with integrated confirmation step
 */
export function FormDrawer({ isOpen, onClose, title, children, onSubmit, submitLabel = 'Save', confirmSubmit = true, footer }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const isEdit = String(title || '').toLowerCase().includes('edit') || String(submitLabel || '').toLowerCase().includes('save') || String(submitLabel || '').toLowerCase().includes('update');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (confirmSubmit) {
      setShowConfirm(true);
    } else if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleConfirmed = () => {
    setShowConfirm(false);
    if (onSubmit) {
      onSubmit({ preventDefault: () => {} });
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}>
        <div className="drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <div className="drawer-title">{title}</div>
            <button type="button" className="iconbtn" onClick={onClose} title="Close">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="drawer-body">
              {children}
            </div>
            {footer ? (
              <div className="drawer-footer">
                {footer}
              </div>
            ) : (
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {submitLabel}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          isOpen={true}
          title={isEdit ? 'Confirm Update' : 'Confirm Add'}
          message={isEdit ? 'Are you sure you want to save the changes to this record?' : 'Are you sure you want to add this new record?'}
          confirmLabel={isEdit ? 'Save Changes' : 'Confirm & Add'}
          onConfirm={handleConfirmed}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

/**
 * ViewDrawer (Organism)
 * Detailed inspect view drawer for table row records matching universal drawer design
 */
export function ViewDrawer({
  isOpen,
  onClose,
  title,
  data = {},
  columns = [],
  children,
  footer
}) {
  if (!isOpen) return null;

  const cleanFieldEntries = [];
  const processedKeys = new Set();

  if (Array.isArray(columns) && columns.length > 0) {
    columns.forEach(col => {
      const key = col.accessor || col.header;
      if (!key || key.toLowerCase() === 'actions' || key.toLowerCase() === 'action') return;
      processedKeys.add(key);

      let val = col.accessor ? data[col.accessor] : data[col.header];
      cleanFieldEntries.push({
        key,
        header: col.header || key,
        value: val,
        render: col.render ? () => col.render(data) : null
      });
    });
  }

  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, val]) => {
      if (processedKeys.has(key)) return;
      if (['_raw', 'raw', 'isMock', 'password'].includes(key.toLowerCase())) return;

      const formattedHeader = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, c => c.toUpperCase());

      cleanFieldEntries.push({
        key,
        header: formattedHeader,
        value: val,
        render: null
      });
    });
  }

  const recordTitle = title || data?.name || data?.title || data?.companyName || data?.stoneCode || data?.code || data?.id || 'Record Details';
  const recordStatus = data?.status || null;
  const recordId = data?.id || data?.code || null;

  return createPortal(
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '580px' }}>
        <div className="drawer-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="drawer-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  {recordTitle}
                </div>
                {recordStatus && <StatusBadge status={recordStatus} />}
              </div>
              {recordId && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {recordId}
                </div>
              )}
            </div>
          </div>
          <button type="button" className="iconbtn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {children ? (
            children
          ) : (
            cleanFieldEntries.map((f, idx) => {
              const isFullWidth = (typeof f.value === 'string' && f.value.length > 35) ||
                f.key === 'name' || f.key === 'Device Name' || f.header === 'Device Name' ||
                f.key === 'address' || f.key === 'remarks' || f.key === 'description' || f.key === 'notes';

              let displayContent = null;

              if (f.render) {
                displayContent = f.render();
              } else if (f.key === 'status') {
                displayContent = <StatusBadge status={f.value} />;
              } else if (f.key === 'logo' && f.value) {
                displayContent = (
                  <img
                    src={f.value || '/default-client-logo.png'}
                    alt="Logo"
                    onError={e => { e.currentTarget.src = '/default-client-logo.png'; }}
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--line)' }}
                  />
                );
              } else if (typeof f.value === 'boolean') {
                displayContent = (
                  <span className={`badge ${f.value ? 'badge-emerald' : 'badge-soft'}`}>
                    {f.value ? 'Yes' : 'No'}
                  </span>
                );
              } else if (Array.isArray(f.value)) {
                displayContent = f.value.join(', ');
              } else {
                displayContent = f.value !== undefined && f.value !== null && f.value !== '' ? String(f.value) : '—';
              }

              return (
                <div key={idx} className={`form-group ${isFullWidth ? 'col-span-2' : ''}`}>
                  <label className="form-label">{f.header}</label>
                  <div className="detail-value">
                    {displayContent}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="drawer-footer">
          {footer ? (
            footer
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Alias for backwards compatibility
export const RowDetailsDrawer = ViewDrawer;
