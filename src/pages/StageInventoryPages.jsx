import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown, StatCard } from '../components/CommonComponents';
import { Plus, Check, X, ShieldAlert, ArrowRight, Printer, QrCode } from 'lucide-react';

// 1. Stock Grid Screen (All 4 stages, stage totals at top, filters)
export function StockGridScreen() {
  const { rawBlocks, cutSlabs, polishedSlabs, bundles, stoneTypes, currentRole } = useApp();
  const [stageFilter, setStageFilter] = useState('All');
  const [stoneFilter, setStoneFilter] = useState('All');

  const isSeller = currentRole === 'Seller';

  // Compute Stage Totals for top
  const totalRawBlockTons = rawBlocks.reduce((acc, b) => acc + (b.weightTons || 0), 0);
  const totalCutSqFt = cutSlabs.reduce((acc, c) => acc + (c.totalSqFt || 0), 0);
  const totalPolishedSqFt = polishedSlabs.reduce((acc, p) => acc + (p.totalSqFt || 0), 0);
  const totalFinalSqFt = bundles.reduce((acc, b) => acc + (b.totalSqFt || 0), 0);

  // Combine or filter items
  let allStockItems = [];

  if (!isSeller) {
    rawBlocks.forEach(b => allStockItems.push({
      id: b.id,
      stage: 'Raw Block',
      stoneType: b.stoneCode,
      thickness: `${b.lengthCm}×${b.widthCm}×${b.heightCm} cm`,
      finish: 'Natural Block',
      grade: b.qa1Status === 'Pass' ? 'A' : (b.qa1Status === 'Reject' ? 'C' : 'In QA'),
      pieces: 1,
      sqFtOrWeight: `${b.weightTons}t`,
      reservedSqFt: 0,
      location: b.yardLocation,
      status: b.status
    }));

    cutSlabs.forEach(c => allStockItems.push({
      id: c.id,
      stage: 'Cut Slab',
      stoneType: c.stoneCode,
      thickness: `${c.thicknessMm} mm`,
      finish: 'Sawn Raw',
      grade: 'Standard',
      pieces: c.slabsCount,
      sqFtOrWeight: `${c.totalSqFt.toLocaleString()} Sq.Ft`,
      reservedSqFt: 0,
      location: c.yardLocation,
      status: c.status
    }));

    polishedSlabs.forEach(p => allStockItems.push({
      id: p.id,
      stage: 'Polished Slab',
      stoneType: p.stoneCode,
      thickness: `${p.thicknessMm} mm`,
      finish: p.finishType,
      grade: p.qa2Status === 'Pass' ? 'A' : 'In QA',
      pieces: p.slabsCount,
      sqFtOrWeight: `${p.totalSqFt.toLocaleString()} Sq.Ft`,
      reservedSqFt: 0,
      location: p.yardLocation,
      status: p.status
    }));
  }

  // Final Slabs (Bundles) - Always included
  bundles.forEach(b => allStockItems.push({
    id: b.id,
    stage: 'Final Slab',
    stoneType: b.stoneCode,
    thickness: `${b.thicknessMm} mm`,
    finish: b.finish,
    grade: b.grade,
    pieces: b.slabsCount,
    sqFtOrWeight: `${b.totalSqFt.toLocaleString()} Sq.Ft`,
    reservedSqFt: b.reservedSqFt,
    location: b.yardLocation,
    status: b.status
  }));

  const filtered = allStockItems
    .filter(i => stageFilter === 'All' || i.stage === stageFilter)
    .filter(i => stoneFilter === 'All' || i.stoneType === stoneFilter);

  const columns = [
    { header: 'Item ID', accessor: 'id' },
    { header: 'Stage', accessor: 'stage', render: r => <span className={`badge ${r.stage === 'Final Slab' ? 'badge-emerald' : 'badge-teal'}`}>{r.stage}</span> },
    { header: 'Stone', accessor: 'stoneType' },
    { header: 'Dimensions', accessor: 'thickness' },
    { header: 'Finish', accessor: 'finish' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Pcs', accessor: 'pieces', render: r => <span className="table-num">{r.pieces}</span> },
    { header: 'Stock Area/Wt', accessor: 'sqFtOrWeight', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.sqFtOrWeight}</span> },
    { header: 'Reserved (Sq.Ft)', accessor: 'reservedSqFt', render: r => <span className="table-num">{r.reservedSqFt > 0 ? `${r.reservedSqFt} Sq.Ft` : '-'}</span> },
    { header: 'Location', accessor: 'location' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stock Grid</h1>
      </div>

      {/* Stage Totals at the top */}
      {!isSeller && (
        <div className="stat-grid" style={{ marginBottom: '16px' }}>
          <StatCard label="Raw Blocks" value={`${totalRawBlockTons.toFixed(1)} MT`} subtext="Stage 1 Total" />
          <StatCard label="Cut Slabs" value={`${totalCutSqFt.toLocaleString()} Sq.Ft`} subtext="Stage 2 Sawn" />
          <StatCard label="Polished Slabs" value={`${totalPolishedSqFt.toLocaleString()} Sq.Ft`} subtext="Stage 3 Finishing" />
          <StatCard label="Final Slabs" value={`${totalFinalSqFt.toLocaleString()} Sq.Ft`} subtext="Stage 4 Bundles" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {!isSeller && (
          <select className="form-select" style={{ maxWidth: '180px' }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="All">All Stages</option>
            <option value="Raw Block">Raw Block</option>
            <option value="Cut Slab">Cut Slab</option>
            <option value="Polished Slab">Polished Slab</option>
            <option value="Final Slab">Final Slab</option>
          </select>
        )}
        <select className="form-select" style={{ maxWidth: '180px' }} value={stoneFilter} onChange={e => setStoneFilter(e.target.value)}>
          <option value="All">All Stone Types</option>
          {stoneTypes.map(s => <option key={s.id} value={s.code}>{s.code}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No stock items found in grid." />
    </div>
  );
}

// 2. Raw Blocks & QA 1 Screen
export function RawBlocksScreen() {
  const { rawBlocks, recordQA1, overruleQA1, convertBlockToCutSlabs, currentRole } = useApp();
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);
  const [cutDrawerOpen, setCutDrawerOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [qaData, setQaData] = useState({ grade: 'A', result: 'Pass', remarks: '', photo: '' });
  const [cutData, setCutData] = useState({ slabsCount: 40, lengthIn: 114, heightIn: 64, thicknessMm: 20, yardLocation: 'LOC-B1' });

  const isCompanyAdmin = currentRole === 'Company Admin';

  const openQA = (b) => {
    setSelectedBlock(b);
    setQaData({ grade: 'A', result: 'Pass', remarks: '', photo: '' });
    setQaDrawerOpen(true);
  };

  const openCut = (b) => {
    setSelectedBlock(b);
    setCutData({ slabsCount: 42, lengthIn: 114, heightIn: 64, thicknessMm: 20, yardLocation: 'LOC-B1' });
    setCutDrawerOpen(true);
  };

  const handleSaveQA = (e) => {
    e.preventDefault();
    if (selectedBlock) {
      recordQA1({ blockId: selectedBlock.id, ...qaData });
    }
    setQaDrawerOpen(false);
  };

  const handleSaveCut = (e) => {
    e.preventDefault();
    if (selectedBlock) {
      convertBlockToCutSlabs(selectedBlock.id, cutData);
    }
    setCutDrawerOpen(false);
  };

  const columns = [
    { header: 'Block ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Quarry / Supplier', accessor: 'quarry' },
    { header: 'Weight (Tons)', accessor: 'weightTons', render: r => <span className="table-num">{r.weightTons}t</span> },
    { header: 'Location', accessor: 'yardLocation' },
    { header: 'QA 1 Status', accessor: 'qa1Status', render: r => <StatusBadge status={r.qa1Status} /> },
    { header: 'Block Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Perform QA 1', onClick: () => openQA(r) },
            { label: 'Cut Block to Slabs', disabled: r.qa1Status !== 'Pass' || r.status === 'Cut Sawn', onClick: () => openCut(r) },
            isCompanyAdmin && r.qa1Status === 'Reject' ? {
              label: 'Overrule QA 1 Result',
              onClick: () => {
                const reason = prompt('Enter overrule reason:');
                if (reason) overruleQA1(r.id, reason);
              }
            } : null
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stage 1: Raw Blocks & QA 1</h1>
      </div>
      <DataTable columns={columns} data={rawBlocks} emptyMessage="No raw blocks logged." />

      {/* QA 1 Form */}
      <FormDrawer
        isOpen={qaDrawerOpen}
        onClose={() => setQaDrawerOpen(false)}
        title={`QA 1 Inspection: ${selectedBlock?.id}`}
        onSubmit={handleSaveQA}
        submitLabel="Submit QA 1 Result"
      >
        <div className="form-group">
          <label className="form-label">Grade</label>
          <select className="form-select" value={qaData.grade} onChange={e => setQaData({ ...qaData, grade: e.target.value })}>
            <option value="A">Grade A (Premium)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Commercial)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Result</label>
          <select className="form-select" value={qaData.result} onChange={e => setQaData({ ...qaData, result: e.target.value })}>
            <option value="Pass">Pass (Ready for Sawing)</option>
            <option value="Rework">Rework</option>
            <option value="Reject">Reject (Auto Debit Note)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Remarks</label>
          <input className="form-input" placeholder="e.g. Sound body, clean veining" value={qaData.remarks} onChange={e => setQaData({ ...qaData, remarks: e.target.value })} />
        </div>
      </FormDrawer>

      {/* Convert Block to Cut Slab */}
      <FormDrawer
        isOpen={cutDrawerOpen}
        onClose={() => setCutDrawerOpen(false)}
        title={`Convert Block to Slabs: ${selectedBlock?.id}`}
        onSubmit={handleSaveCut}
        submitLabel="Convert to Cut Slabs"
      >
        <div className="form-group">
          <label className="form-label">Slab Count</label>
          <input type="number" className="form-input" placeholder="e.g. 40" value={cutData.slabsCount} onChange={e => setCutData({ ...cutData, slabsCount: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Length (Inches)</label>
          <input type="number" className="form-input" placeholder="e.g. 114" value={cutData.lengthIn} onChange={e => setCutData({ ...cutData, lengthIn: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Height (Inches)</label>
          <input type="number" className="form-input" placeholder="e.g. 64" value={cutData.heightIn} onChange={e => setCutData({ ...cutData, heightIn: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Thickness (mm)</label>
          <input type="number" className="form-input" placeholder="e.g. 20" value={cutData.thicknessMm} onChange={e => setCutData({ ...cutData, thicknessMm: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 3. Cut Slabs Screen
export function CutSlabsScreen() {
  const { cutSlabs, polishCutSlabs } = useApp();
  const [polishDrawerOpen, setPolishDrawerOpen] = useState(false);
  const [selectedCut, setSelectedCut] = useState(null);

  const [polishData, setPolishData] = useState({ finishType: 'Mirror Polished', breakageSlabs: 0, yardLocation: 'LOC-C1' });

  const openPolish = (c) => {
    setSelectedCut(c);
    setPolishData({ finishType: 'Mirror Polished', breakageSlabs: 1, yardLocation: 'LOC-C1' });
    setPolishDrawerOpen(true);
  };

  const handleSavePolish = (e) => {
    e.preventDefault();
    if (selectedCut) {
      polishCutSlabs(selectedCut.id, polishData);
    }
    setPolishDrawerOpen(false);
  };

  const columns = [
    { header: 'Lot ID', accessor: 'id' },
    { header: 'Parent Block', accessor: 'blockId' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Slab Count', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Thickness', accessor: 'thicknessMm', render: r => `${r.thicknessMm} mm` },
    { header: 'Total Area (Sq.Ft)', accessor: 'totalSqFt', render: r => <span className="table-num">{r.totalSqFt.toLocaleString()} Sq.Ft</span> },
    { header: 'Location', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Send to Polishing', disabled: r.status === 'Processed', onClick: () => openPolish(r) }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stage 2: Cut Slabs</h1>
      </div>
      <DataTable columns={columns} data={cutSlabs} emptyMessage="No cut slab lots logged." />

      <FormDrawer
        isOpen={polishDrawerOpen}
        onClose={() => setPolishDrawerOpen(false)}
        title={`Polish Slab Lot: ${selectedCut?.id}`}
        onSubmit={handleSavePolish}
        submitLabel="Complete Polishing"
      >
        <div className="form-group">
          <label className="form-label">Finish Type</label>
          <select className="form-select" value={polishData.finishType} onChange={e => setPolishData({ ...polishData, finishType: e.target.value })}>
            <option value="Mirror Polished">Mirror Polished</option>
            <option value="Honed">Honed</option>
            <option value="Leather Finish">Leather Finish</option>
            <option value="Flamed">Flamed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Breakage / Loss Slabs</label>
          <input type="number" className="form-input" placeholder="0" value={polishData.breakageSlabs} onChange={e => setPolishData({ ...polishData, breakageSlabs: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 4. Polished Slabs & QA 2 Screen
export function PolishedSlabsScreen() {
  const { polishedSlabs, recordQA2, overruleQA2, bundleFinalSlabs, currentRole } = useApp();
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);
  const [bundleDrawerOpen, setBundleDrawerOpen] = useState(false);
  const [selectedPolished, setSelectedPolished] = useState(null);

  const [qaData, setQaData] = useState({ grade: 'A', result: 'Pass', remarks: '', photo: '' });
  const [bundleData, setBundleData] = useState({ bundleNumber: '', grade: 'A', yardLocation: 'LOC-C1' });

  const isCompanyAdmin = currentRole === 'Company Admin';

  const openQA = (p) => {
    setSelectedPolished(p);
    setQaData({ grade: 'A', result: 'Pass', remarks: '', photo: '' });
    setQaDrawerOpen(true);
  };

  const openBundle = (p) => {
    setSelectedPolished(p);
    setBundleData({ bundleNumber: `BDL-0${Math.floor(Math.random() * 80 + 10)}`, grade: 'A', yardLocation: 'LOC-C1' });
    setBundleDrawerOpen(true);
  };

  const handleSaveQA = (e) => {
    e.preventDefault();
    if (selectedPolished) {
      recordQA2({ polishedLotId: selectedPolished.id, ...qaData });
    }
    setQaDrawerOpen(false);
  };

  const handleSaveBundle = (e) => {
    e.preventDefault();
    if (selectedPolished) {
      bundleFinalSlabs(selectedPolished.id, bundleData);
    }
    setBundleDrawerOpen(false);
  };

  const columns = [
    { header: 'Polished ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Finish', accessor: 'finishType' },
    { header: 'Count', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Area (Sq.Ft)', accessor: 'totalSqFt', render: r => <span className="table-num">{r.totalSqFt.toLocaleString()} Sq.Ft</span> },
    { header: 'QA 2 Status', accessor: 'qa2Status', render: r => <StatusBadge status={r.qa2Status} /> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Perform QA 2', onClick: () => openQA(r) },
            { label: 'Bundle into Final Slabs', disabled: r.qa2Status !== 'Pass' || r.status === 'Completed', onClick: () => openBundle(r) },
            isCompanyAdmin && r.qa2Status === 'Reject' ? {
              label: 'Overrule QA 2 Result',
              onClick: () => {
                const reason = prompt('Enter overrule reason:');
                if (reason) overruleQA2(r.id, reason);
              }
            } : null
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stage 3: Polished Slabs & QA 2</h1>
      </div>
      <DataTable columns={columns} data={polishedSlabs} emptyMessage="No polished slab lots." />

      <FormDrawer
        isOpen={qaDrawerOpen}
        onClose={() => setQaDrawerOpen(false)}
        title={`QA 2 Final Line: ${selectedPolished?.id}`}
        onSubmit={handleSaveQA}
        submitLabel="Submit QA 2 Result"
      >
        <div className="form-group">
          <label className="form-label">Grade</label>
          <select className="form-select" value={qaData.grade} onChange={e => setQaData({ ...qaData, grade: e.target.value })}>
            <option value="A">Grade A (Premium)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Commercial)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Result</label>
          <select className="form-select" value={qaData.result} onChange={e => setQaData({ ...qaData, result: e.target.value })}>
            <option value="Pass">Pass (Ready to Bundle & Sell)</option>
            <option value="Rework">Rework (Re-polish)</option>
            <option value="Reject">Reject (Send to Defective Store)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Remarks</label>
          <input className="form-input" placeholder="e.g. High gloss, no micro-cracks" value={qaData.remarks} onChange={e => setQaData({ ...qaData, remarks: e.target.value })} />
        </div>
      </FormDrawer>

      <FormDrawer
        isOpen={bundleDrawerOpen}
        onClose={() => setBundleDrawerOpen(false)}
        title={`Bundle Final Slabs: ${selectedPolished?.id}`}
        onSubmit={handleSaveBundle}
        submitLabel="Create Bundle"
      >
        <div className="form-group">
          <label className="form-label">Bundle ID</label>
          <input className="form-input" placeholder="e.g. BDL-05" value={bundleData.bundleNumber} onChange={e => setBundleData({ ...bundleData, bundleNumber: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Grade</label>
          <select className="form-select" value={bundleData.grade} onChange={e => setBundleData({ ...bundleData, grade: e.target.value })}>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}

// 5. Final Slabs & Bundles Screen (Only this stage can be sold)
export function BundlesScreen() {
  const { bundles, moveBundleLocation, activeClient } = useApp();
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [labelModalOpen, setLabelModalOpen] = useState(false);

  const printLabel = (b) => {
    setSelectedBundle(b);
    setLabelModalOpen(true);
  };

  const columns = [
    { header: 'Bundle ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Finish', accessor: 'finish' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Slabs', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Total (Sq.Ft)', accessor: 'totalSqFt', render: r => <span className="table-num">{r.totalSqFt.toLocaleString()} Sq.Ft</span> },
    { header: 'Reserved (Sq.Ft)', accessor: 'reservedSqFt', render: r => <span className="table-num">{r.reservedSqFt > 0 ? `${r.reservedSqFt} Sq.Ft` : '-'}</span> },
    { header: 'Available (Sq.Ft)', accessor: 'availableSqFt', render: r => <span className="table-num" style={{ fontWeight: 700, color: 'var(--teal-800)' }}>{r.availableSqFt.toLocaleString()} Sq.Ft</span> },
    { header: 'Location', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Print QR Label', onClick: () => printLabel(r) }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stage 4: Final Slabs & Bundles</h1>
      </div>
      <DataTable columns={columns} data={bundles} emptyMessage="No final slab bundles created." />

      {/* Printable Label Modal with Client Logo & QR Code */}
      {labelModalOpen && selectedBundle && (
        <div className="drawer-backdrop" onClick={() => setLabelModalOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="drawer-header">
              <div className="drawer-title">Bundle Label</div>
              <button type="button" className="iconbtn" onClick={() => setLabelModalOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body" style={{ textAlign: 'center' }}>
              <div style={{ border: '2px solid var(--ink)', padding: '20px', borderRadius: '8px' }}>
                <img src={activeClient?.logo} alt="Logo" style={{ height: '36px', marginBottom: '8px', objectFit: 'contain' }} />
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{activeClient?.name}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: 'var(--teal-800)' }}>{selectedBundle.bundleNumber}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedBundle.stoneCode} - {selectedBundle.finish}</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>{selectedBundle.slabsCount} Slabs | {selectedBundle.totalSqFt} Sq.Ft | Grade {selectedBundle.grade}</div>

                <div style={{ margin: '16px auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <QrCode size={90} />
                  <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{selectedBundle.qrCode}</span>
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-primary btn-sm" onClick={() => { window.print(); setLabelModalOpen(false); }}>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Stock Transfer & Adjustments Screen
export function StockTransferScreen() {
  const { stockTransfers, transferStock, bundles } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ itemId: bundles[0]?.id || 'BDL-01', fromYard: 'Main Yard', toYard: 'Display Studio', reason: 'Customer display lot' });

  const handleSave = (e) => {
    e.preventDefault();
    transferStock(formData);
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Transfer ID', accessor: 'id' },
    { header: 'Item ID', accessor: 'itemId' },
    { header: 'From Yard', accessor: 'fromYard' },
    { header: 'To Yard', accessor: 'toYard' },
    { header: 'Date', accessor: 'date' },
    { header: 'User', accessor: 'user' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stock Transfers</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>New Transfer</span>
        </button>
      </div>

      <DataTable columns={columns} data={stockTransfers} emptyMessage="No stock transfers logged." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Transfer Stock"
        onSubmit={handleSave}
        submitLabel="Execute Transfer"
      >
        <div className="form-group">
          <label className="form-label">Bundle</label>
          <select className="form-select" value={formData.itemId} onChange={e => setFormData({ ...formData, itemId: e.target.value })}>
            {bundles.map(b => <option key={b.id} value={b.id}>{b.bundleNumber} ({b.stoneCode})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">From Yard</label>
          <input className="form-input" placeholder="e.g. Main Yard" value={formData.fromYard} onChange={e => setFormData({ ...formData, fromYard: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">To Yard</label>
          <input className="form-input" placeholder="e.g. Display Studio" value={formData.toYard} onChange={e => setFormData({ ...formData, toYard: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 7. Stock Valuation Screen (Company Admin only: cost per stage)
export function StockValuationScreen() {
  const { rawBlocks, cutSlabs, polishedSlabs, bundles } = useApp();

  const valuationStages = [
    { stage: 'Stage 1: Raw Blocks', count: rawBlocks.length, metric: `${rawBlocks.reduce((a, b) => a + (b.weightTons || 0), 0).toFixed(1)} MT`, unitCost: '$580 / Ton', totalValuation: rawBlocks.reduce((a, b) => a + (b.weightTons * 580), 0) },
    { stage: 'Stage 2: Cut Slabs', count: cutSlabs.length, metric: `${cutSlabs.reduce((a, c) => a + c.totalSqFt, 0).toLocaleString()} Sq.Ft`, unitCost: '$35 / Sq.Ft', totalValuation: cutSlabs.reduce((a, c) => a + (c.totalSqFt * 35), 0) },
    { stage: 'Stage 3: Polished Slabs', count: polishedSlabs.length, metric: `${polishedSlabs.reduce((a, p) => a + p.totalSqFt, 0).toLocaleString()} Sq.Ft`, unitCost: '$55 / Sq.Ft', totalValuation: polishedSlabs.reduce((a, p) => a + (p.totalSqFt * 55), 0) },
    { stage: 'Stage 4: Final Slab Bundles', count: bundles.length, metric: `${bundles.reduce((a, b) => a + b.totalSqFt, 0).toLocaleString()} Sq.Ft`, unitCost: '$95 / Sq.Ft', totalValuation: bundles.reduce((a, b) => a + (b.totalSqFt * 95), 0) }
  ];

  const columns = [
    { header: 'Inventory Stage', accessor: 'stage' },
    { header: 'Lots / Units', accessor: 'count', render: r => <span className="table-num">{r.count}</span> },
    { header: 'Quantity Metric', accessor: 'metric', render: r => <span className="table-num">{r.metric}</span> },
    { header: 'Avg Cost Basis', accessor: 'unitCost' },
    { header: 'Stage Valuation ($)', accessor: 'totalValuation', render: r => <span className="table-num" style={{ fontWeight: 800 }}>${r.totalValuation.toLocaleString()}</span> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Inventory Valuation</h1>
      </div>
      <DataTable columns={columns} data={valuationStages} emptyMessage="No valuation records." />
    </div>
  );
}
