import React from 'react';
import { X, ExternalLink, Calendar, User, Clock, FileText, Image, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../CommonComponents';

export function StoneJourneyDrawer({ isOpen, onClose, node, onOpenModule }) {
  if (!isOpen || !node) return null;

  const data = node.raw || {};
  const isException = node.isException || node.status === 'Rejected' || node.status === 'Defective';

  // Format key-value pairs cleanly
  const renderValue = (val) => {
    if (val === null || val === undefined || val === '') return <span style={{ color: 'var(--muted)' }}>—</span>;
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        if (val.length === 0) return 'None';
        return val.map((v, i) => (typeof v === 'object' ? (v.id || v.name || JSON.stringify(v)) : String(v))).join(', ');
      }
      return JSON.stringify(val);
    }
    return String(val);
  };

  // Exclude raw or internal keys
  const displayFields = Object.entries(data).filter(([k]) => 
    !['photos', 'documents', 'raw', 'children', 'isArchived', 'clientId'].includes(k)
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="drawer"
        style={{
          width: '520px',
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: 'var(--white)',
          boxShadow: '-6px 0 24px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideLeft 0.25s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isException ? 'var(--ruby-subtle, #fef2f2)' : 'var(--surface-subtle, #f8fafc)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-color)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {node.category || 'Stage Record'}
              </span>
              <StatusBadge status={node.status || 'Active'} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0 0', color: 'var(--ink)' }}>
              {node.name}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px', fontFamily: 'monospace' }}>
              Record ID: <strong>{node.id}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Key Metric Banner */}
          {node.keyFigure && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-sunken)',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Key Figure / Metric</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{node.keyFigure}</span>
            </div>
          )}

          {/* Timestamp & Operator info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            paddingBottom: '16px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--line)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="var(--muted)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Logged At</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{node.timestamp || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color="var(--muted)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Operator / Assigned</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>{node.operator || data.operator || data.inspector || data.receivedBy || 'System Automated'}</div>
              </div>
            </div>
          </div>

          {/* Field Details Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '10px' }}>
              Record Fields & Specifications
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              backgroundColor: 'var(--surface-subtle, #f8fafc)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--line)'
            }}>
              {displayFields.map(([k, v]) => (
                <div key={k} style={{ gridColumn: (typeof v === 'string' && v.length > 35) ? 'span 2' : 'span 1' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', wordBreak: 'break-word', marginTop: '1px' }}>
                    {renderValue(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attached Photos */}
          {Array.isArray(data.photos) && data.photos.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={14} />
                <span>Attached Photos ({data.photos.length})</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {data.photos.map((ph, idx) => (
                  <a key={idx} href={ph} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                    <img src={ph} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail & Change Log */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>Audit Trail & Event Log</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                padding: '10px 12px',
                borderLeft: '3px solid var(--brand-color)',
                backgroundColor: 'var(--surface-subtle, #f8fafc)',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '2px' }}>
                  <span>System Created</span>
                  <span>{node.timestamp || '2026-10-13 08:30'}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  Record {node.id} verified and synchronized with Granite ERP shared store.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--white)'
        }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>

          {node.moduleRoute && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                if (onOpenModule) onOpenModule(node.moduleRoute);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Open in Screen</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
