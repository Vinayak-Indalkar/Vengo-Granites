import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function LabelPrintModal({ isOpen, onClose, label, onReprint }) {
  const { activeClient, reprintLabel, showToast } = useApp();
  const [template, setTemplate] = useState(label?.template || 'Standard QR Label');

  if (!isOpen || !label) return null;

  const handlePrint = () => {
    if (reprintLabel) {
      reprintLabel(label.id);
    }
    if (onReprint) {
      onReprint(label);
    }
    showToast(`Printing label ${label.labelNo}...`);
    // Optional print trigger
    window.print();
  };

  const clientLogo = activeClient?.logo || '/vengo-logo.svg';
  const clientName = activeClient?.name || 'Vengo Granites';

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '620px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Label Print & Verification
            </div>
            <h3 style={{ margin: '4px 0 0 0' }}>Label: {label.labelNo}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Template Selector */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Select Label Template</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Standard QR Label', 'Detailed Barcode Label', 'Pallet Shipping Label'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-xs ${template === t ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTemplate(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Label Preview Box */}
          <div style={{
            border: '2px solid #222350',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            position: 'relative'
          }}>
            {/* Header with Client Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #222350', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {clientLogo ? (
                  <img src={clientLogo} alt={clientName} style={{ height: '36px', maxWidth: '120px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : null}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#222350' }}>{clientName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Natural Stone Production & ERP Verified</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge" style={{ backgroundColor: '#222350', color: '#fff', fontSize: '11px', padding: '4px 8px' }}>
                  {label.labelType?.toUpperCase()} LABEL
                </span>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 600, marginTop: '4px' }}>
                  {label.labelNo}
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>STONE TYPE</span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{label.stoneType || 'Granite'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>LINKED RECORD</span>
                  <strong style={{ fontFamily: 'monospace' }}>{label.linkedRecordId || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>SIZE / DIMENSIONS</span>
                  <strong>{label.size || 'Standard'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>THICKNESS</span>
                  <strong>{label.thickness || '20mm'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>SURFACE FINISH</span>
                  <strong>{label.finish || 'Polished High Gloss'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>GRADE</span>
                  <strong style={{ color: '#059669' }}>{label.grade || 'Grade A'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>TOTAL SQ.FT</span>
                  <strong style={{ fontSize: '14px', color: '#222350' }}>{label.sqft || 0} Sq.Ft</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>STORAGE LOCATION</span>
                  <strong>{label.location || 'Yard 1 / Zone C'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>QUARRY / SUPPLIER</span>
                  <span>{label.supplier || 'Monte Altissimo Quarry'}</span>
                </div>
              </div>

              {/* Barcode & QR Code simulation */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '10px' }}>
                {/* QR Code representation */}
                <div style={{
                  width: '90px',
                  height: '90px',
                  border: '3px solid #222350',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#fff',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '22px', height: '22px', backgroundColor: '#222350' }} />
                    <div style={{ width: '22px', height: '22px', backgroundColor: '#222350' }} />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: '#222350', letterSpacing: '-0.5px' }}>
                    SCAN QR
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '22px', height: '22px', backgroundColor: '#222350' }} />
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#222350', margin: '5px' }} />
                  </div>
                </div>

                {/* Barcode representation */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{
                    height: '24px',
                    background: 'repeating-linear-gradient(to right, #000 0, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 6px, transparent 6px, transparent 7px, #000 7px, #000 10px, transparent 10px, transparent 13px)',
                    width: '100%',
                    marginBottom: '2px'
                  }} />
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {label.barcode || '890100010001'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer inside label */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '14px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <div>Printed: {label.date || 'Today'} • By {label.printedBy || 'Operator'}</div>
              <div>Print Count: <strong style={{ color: '#222350' }}>{label.printCount || 1}</strong></div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--line)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Reprinting increments count & logs to Audit Trail.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={handlePrint} style={{ backgroundColor: '#222350' }}>
              🖨️ Print Label (Reprint #{Number(label.printCount || 1) + 1})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
