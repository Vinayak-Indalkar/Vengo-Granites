import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Camera, QrCode, Search, CheckCircle, Zap, RefreshCw, X, ArrowRight, ShieldCheck, Box, Layers, Route as RouteIcon } from 'lucide-react';

export function QRScanModal({ isOpen, onClose, onScanSuccess }) {
  const navigate = useNavigate();
  const { detailedRawBlocks, slabs, pieces, boxes, labels } = useApp();
  const [scanInput, setScanInput] = useState('');
  const [activeCam, setActiveCam] = useState('Camera 01 (Rear Macro)');
  const [torchOn, setTorchOn] = useState(true);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  // Real-time record lookup matching user input
  const matchedRecord = useMemo(() => {
    if (!scanInput.trim()) return null;
    const query = scanInput.trim().toUpperCase();

    // Check detailedRawBlocks
    const foundBlock = detailedRawBlocks.find(b =>
      b.id.toUpperCase() === query ||
      (b.blockNo && b.blockNo.toUpperCase() === query) ||
      (b.quarryBlockNo && b.quarryBlockNo.toUpperCase() === query)
    );
    if (foundBlock) {
      return {
        type: 'Raw Block',
        id: foundBlock.id,
        name: foundBlock.blockNo || foundBlock.id,
        stoneType: foundBlock.stoneType,
        details: `${foundBlock.length}" x ${foundBlock.width}" x ${foundBlock.height}" • ${foundBlock.netWeight || 0} MT`,
        location: `${foundBlock.receivingYard || 'Main Yard'} • ${foundBlock.location || 'Bay 01'}`,
        status: foundBlock.status || 'Received',
        grade: foundBlock.grade || 'Grade A',
        raw: foundBlock
      };
    }

    // Check slabs
    const foundSlab = slabs.find(s =>
      s.id.toUpperCase() === query ||
      (s.slabNo && s.slabNo.toUpperCase() === query)
    );
    if (foundSlab) {
      return {
        type: 'Polished Slab',
        id: foundSlab.id,
        name: foundSlab.slabNo || foundSlab.id,
        stoneType: foundSlab.stoneType,
        details: `${foundSlab.length}" x ${foundSlab.width}" (${foundSlab.sqft || 0} sq.ft) • ${foundSlab.thickness || 20}mm`,
        location: foundSlab.location || `${foundSlab.yard || 'Yard'} • ${foundSlab.bay || 'A-Frame'}`,
        status: foundSlab.status || 'Stored',
        grade: foundSlab.grade || 'Grade A',
        raw: foundSlab
      };
    }

    // Check pieces
    const foundPiece = pieces.find(p =>
      p.id.toUpperCase() === query ||
      (p.pieceNo && p.pieceNo.toUpperCase() === query)
    );
    if (foundPiece) {
      return {
        type: 'Cut Piece',
        id: foundPiece.id,
        name: foundPiece.pieceNo || foundPiece.id,
        stoneType: foundPiece.stoneType,
        details: `${foundPiece.size || `${foundPiece.length}" x ${foundPiece.width}"`} • ${foundPiece.sqft || 0} sq.ft`,
        location: foundPiece.location || 'Zone D',
        status: foundPiece.status || 'Stored',
        grade: foundPiece.grade || 'Grade A',
        raw: foundPiece
      };
    }

    // Check boxes
    const foundBox = boxes.find(bx =>
      bx.id.toUpperCase() === query ||
      (bx.boxNo && bx.boxNo.toUpperCase() === query)
    );
    if (foundBox) {
      return {
        type: 'Storage Box / Pallet',
        id: foundBox.id,
        name: foundBox.boxNo || foundBox.id,
        stoneType: foundBox.stoneType,
        details: `${foundBox.type} • ${foundBox.pieceCount || 0} Items • ${foundBox.sqft || 0} sq.ft`,
        location: foundBox.location || 'Zone C / D',
        status: foundBox.status || 'Open',
        grade: foundBox.grade || 'Grade A',
        raw: foundBox
      };
    }

    // Check labels
    const foundLabel = labels.find(l =>
      l.id.toUpperCase() === query ||
      (l.labelNo && l.labelNo.toUpperCase() === query) ||
      (l.qrCode && l.qrCode.toUpperCase() === query) ||
      (l.barcode && l.barcode.toUpperCase() === query)
    );
    if (foundLabel) {
      return {
        type: `Label (${foundLabel.labelType})`,
        id: foundLabel.linkedRecordId || foundLabel.id,
        name: foundLabel.labelNo,
        stoneType: foundLabel.stoneType,
        details: `${foundLabel.template} • Barcode: ${foundLabel.barcode}`,
        location: foundLabel.location || 'Yard Storage',
        status: 'Active Tag',
        grade: foundLabel.grade || 'Grade A',
        raw: foundLabel
      };
    }

    return null;
  }, [scanInput, detailedRawBlocks, slabs, pieces, boxes, labels]);

  const handleScanSubmit = (e) => {
    e?.preventDefault();
    if (!scanInput.trim()) return;
    onScanSuccess(matchedRecord?.id || scanInput.trim());
    onClose();
  };

  const handleQuickPick = (id) => {
    setScanInput(id);
    onScanSuccess(id);
    onClose();
  };

  const simulateRandomScan = () => {
    setIsSimulatingScan(true);
    const pool = [
      ...detailedRawBlocks.map(b => b.id),
      ...slabs.map(s => s.id),
      ...boxes.map(bx => bx.id),
      ...pieces.map(p => p.id)
    ];
    const picked = pool[Math.floor(Math.random() * pool.length)] || 'BLK-0001';
    setTimeout(() => {
      setScanInput(picked);
      setIsSimulatingScan(false);
    }, 700);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ maxWidth: '580px', width: '92%', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--line)',
          padding: '14px 20px',
          background: 'var(--surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(34, 35, 80, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#222350'
            }}>
              <QrCode size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 600 }}>
                High-Speed Optical Scanner
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Scan Inventory Tag
              </h3>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close Scanner">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Animated Scanner Viewport simulation */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '210px',
            backgroundColor: '#0a0f1d',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '16px',
            border: '2px solid #1e293b',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
          }}>
            {/* Viewport Grid Lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }} />

            {/* Corner Crosshairs */}
            <div style={{ position: 'absolute', top: 14, left: 14, width: 28, height: 28, borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, width: 28, height: 28, borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: 14, right: 14, width: 28, height: 28, borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderRadius: '2px' }} />

            {/* Center Target Box */}
            <div style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              border: `1.5px dashed ${matchedRecord ? '#10b981' : 'rgba(56, 189, 248, 0.6)'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: matchedRecord ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 189, 248, 0.04)',
              transition: 'all 0.3s ease'
            }}>
              {matchedRecord ? (
                <div style={{ textAlign: 'center', color: '#10b981', animation: 'pulse 1.5s infinite' }}>
                  <CheckCircle size={36} />
                  <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>TARGET LOCKED</div>
                </div>
              ) : (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              )}
            </div>

            {/* Animated Laser Line */}
            <div style={{
              position: 'absolute',
              left: '12%',
              right: '12%',
              height: '2px',
              backgroundColor: matchedRecord ? '#10b981' : '#ef4444',
              boxShadow: matchedRecord ? '0 0 12px 3px #10b981' : '0 0 12px 3px #ef4444',
              animation: 'laserScan 2.2s ease-in-out infinite',
              zIndex: 2
            }} />

            {/* Laser Scan Keyframes Style */}
            <style>{`
              @keyframes laserScan {
                0% { top: 20%; opacity: 0.7; }
                50% { top: 80%; opacity: 1; }
                100% { top: 20%; opacity: 0.7; }
              }
            `}</style>

            {/* Telemetry HUD Top Bar */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: 20,
              right: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              zIndex: 3
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                LIVE • 60 FPS
              </span>
              <span>{activeCam}</span>
              <button
                type="button"
                onClick={() => setTorchOn(!torchOn)}
                style={{
                  background: torchOn ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)',
                  color: torchOn ? '#fbbf24' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Zap size={10} />
                {torchOn ? 'TORCH ON' : 'TORCH OFF'}
              </button>
            </div>

            {/* Viewport Bottom Controls */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: 20,
              right: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              zIndex: 3
            }}>
              <span style={{ color: '#cbd5e1' }}>AUTOFOCUS: ACTIVE</span>
              <button
                type="button"
                onClick={simulateRandomScan}
                disabled={isSimulatingScan}
                style={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={10} className={isSimulatingScan ? 'spin-anim' : ''} />
                {isSimulatingScan ? 'Scanning...' : 'Simulate Scan Sweep'}
              </button>
            </div>
          </div>

          {/* Real-time Match Detection Card */}
          {matchedRecord ? (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                    {matchedRecord.type}
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{matchedRecord.name}</strong>
                  <span className="badge badge-soft" style={{ fontSize: '10px' }}>{matchedRecord.grade}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink)', fontWeight: 500 }}>
                  {matchedRecord.stoneType} • {matchedRecord.details}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  📍 {matchedRecord.location} • Status: <strong style={{ color: 'var(--teal-600)' }}>{matchedRecord.status}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigate(`/stone-journey/${matchedRecord.id}`);
                    onClose();
                  }}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Track full stone journey"
                >
                  <RouteIcon size={14} />
                  <span>Stone Journey</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleScanSubmit}
                  style={{ backgroundColor: '#222350', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Lookup Record</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : scanInput.trim() ? (
            <div style={{
              padding: '10px 14px',
              background: 'var(--surface-sunken)',
              border: '1px dashed var(--line)',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Search size={14} />
              <span>No direct inventory item matched "{scanInput}". Click "Lookup Record" to execute global search.</span>
            </div>
          ) : null}

          {/* Manual Input Form */}
          <form onSubmit={handleScanSubmit} style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Or Enter Tag ID / Barcode / QR Code Number:</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>Supports Block, Slab, Piece, Box IDs</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="e.g. BLK-0001, SLB-0001, PC-0001, BOX-0001, LBL-0001..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#222350', whiteSpace: 'nowrap' }}>
                Lookup Record
              </button>
            </div>
          </form>

          {/* Quick Test Pick List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Test Codes (Click to select):
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'blocks', 'slabs', 'boxes'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      border: 'none',
                      background: selectedCategory === cat ? '#222350' : 'transparent',
                      color: selectedCategory === cat ? '#fff' : 'var(--muted)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: selectedCategory === cat ? 600 : 400
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {(selectedCategory === 'all' || selectedCategory === 'blocks') && detailedRawBlocks.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleQuickPick(b.id)}
                  title={`${b.stoneType} • ${b.receivingYard}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--line)' }}
                >
                  🧱 <strong>{b.blockNo || b.id}</strong> <span style={{ color: 'var(--muted)', fontSize: '10px' }}>({b.stoneType.split(' ')[0]})</span>
                </button>
              ))}

              {(selectedCategory === 'all' || selectedCategory === 'slabs') && slabs.slice(0, 4).map(s => (
                <button
                  key={s.id}
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleQuickPick(s.id)}
                  title={`${s.stoneType} • ${s.location}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--line)' }}
                >
                  📐 <strong>{s.slabNo || s.id}</strong> <span style={{ color: 'var(--muted)', fontSize: '10px' }}>({s.stoneType.split(' ')[0]})</span>
                </button>
              ))}

              {(selectedCategory === 'all' || selectedCategory === 'boxes') && boxes.slice(0, 3).map(bx => (
                <button
                  key={bx.id}
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleQuickPick(bx.id)}
                  title={`${bx.type} • ${bx.stoneType}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--line)' }}
                >
                  📦 <strong>{bx.boxNo || bx.id}</strong> <span style={{ color: 'var(--muted)', fontSize: '10px' }}>({bx.type})</span>
                </button>
              ))}

              {selectedCategory === 'all' && pieces.slice(0, 2).map(p => (
                <button
                  key={p.id}
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleQuickPick(p.id)}
                  title={`${p.stoneType} • ${p.size}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--line)' }}
                >
                  🧩 <strong>{p.pieceNo || p.id}</strong> <span style={{ color: 'var(--muted)', fontSize: '10px' }}>({p.size})</span>
                </button>
              ))}

              {selectedCategory === 'all' && labels.slice(0, 2).map(l => (
                <button
                  key={l.id}
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handleQuickPick(l.qrCode || l.id)}
                  title={`Template: ${l.template}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--line)' }}
                >
                  🏷️ <strong>{l.labelNo}</strong> <span style={{ color: 'var(--muted)', fontSize: '10px' }}>({l.labelType})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{
          borderTop: '1px solid var(--line)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-sunken)'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            Optical laser decodes standard QR, DataMatrix, Code 128 & GS1 formats
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
