import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function QRScanModal({ isOpen, onClose, onScanSuccess }) {
  const { detailedRawBlocks, slabs, pieces, boxes, labels } = useApp();
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleScanSubmit = (e) => {
    e?.preventDefault();
    if (!scanInput.trim()) return;
    onScanSuccess(scanInput.trim());
    onClose();
  };

  const handleQuickPick = (id) => {
    onScanSuccess(id);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Optical QR & Barcode Scanner
            </div>
            <h3 style={{ margin: '4px 0 0 0' }}>Scan Inventory Tag</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Animated Scanner Viewport simulation */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px',
            border: '2px solid #334155'
          }}>
            {/* Corner Crosshairs */}
            <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
            <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />

            {/* Laser Line animation */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              right: '10%',
              height: '2px',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px 2px #ef4444'
            }} />

            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                Laser Scanner Ready
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Point optical scanner at Block, Slab, or Box QR tag
              </div>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleScanSubmit} style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>
              Or Enter Tag ID / Barcode / QR Code Number:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SLB-0001, BLK-0001, PC-0001, BOX-0001, LBL-0001"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#222350', whiteSpace: 'nowrap' }}>
                Lookup Record
              </button>
            </div>
          </form>

          {/* Quick Test Pick List */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Quick Test Codes (Click to scan):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {detailedRawBlocks.slice(0, 2).map(b => (
                <button key={b.id} type="button" className="btn btn-xs btn-ghost" onClick={() => handleQuickPick(b.id)}>
                  🧱 {b.blockNo} (Block)
                </button>
              ))}
              {slabs.slice(0, 2).map(s => (
                <button key={s.id} type="button" className="btn btn-xs btn-ghost" onClick={() => handleQuickPick(s.id)}>
                  📐 {s.slabNo} (Slab)
                </button>
              ))}
              {pieces.slice(0, 2).map(p => (
                <button key={p.id} type="button" className="btn btn-xs btn-ghost" onClick={() => handleQuickPick(p.id)}>
                  🧩 {p.pieceNo} (Piece)
                </button>
              ))}
              {boxes.slice(0, 1).map(bx => (
                <button key={bx.id} type="button" className="btn btn-xs btn-ghost" onClick={() => handleQuickPick(bx.id)}>
                  📦 {bx.boxNo} (Box)
                </button>
              ))}
              {labels.slice(0, 1).map(l => (
                <button key={l.id} type="button" className="btn btn-xs btn-ghost" onClick={() => handleQuickPick(l.qrCode)}>
                  🏷️ {l.labelNo} (QR)
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--line)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
