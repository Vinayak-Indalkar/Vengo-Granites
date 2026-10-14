import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge } from '../components/CommonComponents';
import { Plus, Search, Scale, Printer, Layers } from 'lucide-react';

// Live Weights & GRN Screen (Net = Gross - Tare auto-calculated)
export function ReceiptsScreen() {
  const { receipts, addReceipt, purchaseOrders, stoneTypes, yardLocations } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    poId: 'PO-2026-101',
    truckNumber: '',
    stoneCode: 'BLK-GAL',
    grossKg: 42000,
    tareKg: 14000,
    blockCount: 1,
    yardLocation: 'LOC-A1'
  });

  const netCalculated = Math.max(0, Number(formData.grossKg || 0) - Number(formData.tareKg || 0));

  const filtered = receipts.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.truckNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addReceipt({
      ...formData,
      grossKg: Number(formData.grossKg),
      tareKg: Number(formData.tareKg),
      blockCount: Number(formData.blockCount)
    });
    setIsDrawerOpen(false);
    setFormData({ poId: 'PO-2026-101', truckNumber: '', stoneCode: 'BLK-GAL', grossKg: 42000, tareKg: 14000, blockCount: 1, yardLocation: 'LOC-A1' });
  };

  const columns = [
    { header: 'GRN ID', accessor: 'id' },
    { header: 'Ref PO', accessor: 'poId' },
    { header: 'Truck Number', accessor: 'truckNumber' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Gross (Kg)', accessor: 'grossKg', render: r => <span className="table-num">{r.grossKg.toLocaleString()}</span> },
    { header: 'Tare (Kg)', accessor: 'tareKg', render: r => <span className="table-num">{r.tareKg.toLocaleString()}</span> },
    { header: 'Net Weight (Kg)', accessor: 'netKg', render: r => <span className="table-num" style={{ fontWeight: 700, color: 'var(--teal-900)' }}>{r.netKg.toLocaleString()}</span> },
    { header: 'Yard Location', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Weighbridge Receipts (GRN)</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search GRNs or trucks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Scale size={14} />
          <span>New GRN</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No weighbridge receipts logged." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Weighbridge Intake Entry"
        onSubmit={handleSubmit}
        submitLabel="Log Weighbridge & Create Block"
      >
        <div className="form-group">
          <label className="form-label">Reference PO</label>
          <select
            className="form-select"
            value={formData.poId}
            onChange={e => setFormData({ ...formData, poId: e.target.value })}
          >
            {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.id} ({p.supplier} - {p.stoneCode})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Truck / Trailer Plate</label>
          <input
            className="form-input"
            required
            placeholder="e.g. RJ-14-GA-9021"
            value={formData.truckNumber}
            onChange={e => setFormData({ ...formData, truckNumber: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Stone Type</label>
          <select
            className="form-select"
            value={formData.stoneCode}
            onChange={e => setFormData({ ...formData, stoneCode: e.target.value })}
          >
            {stoneTypes.map(s => <option key={s.id} value={s.code}>{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Gross Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 42500"
            value={formData.grossKg}
            onChange={e => setFormData({ ...formData, grossKg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tare Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 14200"
            value={formData.tareKg}
            onChange={e => setFormData({ ...formData, tareKg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Auto Net Weight (Gross - Tare)</label>
          <input
            className="form-input"
            disabled
            value={`${netCalculated.toLocaleString()} Kg`}
            style={{ fontWeight: 700, color: 'var(--teal-900)' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Unloading Yard Bay</label>
          <select
            className="form-select"
            value={formData.yardLocation}
            onChange={e => setFormData({ ...formData, yardLocation: e.target.value })}
          >
            {yardLocations.map(y => <option key={y.id} value={y.id}>{y.id} ({y.zone} - {y.bay})</option>)}
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}

// Block Check & Inspection
export function BlockCheckScreen() {
  const { blocks } = useApp();
  const [search, setSearch] = useState('');

  const filtered = blocks.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.stoneCode.toLowerCase().includes(search.toLowerCase()) ||
    b.grnId.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Block ID', accessor: 'id' },
    { header: 'GRN Number', accessor: 'grnId' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Dimensions (L × W × H)', render: r => `${r.lengthCm} × ${r.widthCm} × ${r.heightCm} cm` },
    { header: 'Weight (Kg)', accessor: 'weightKg', render: r => <span className="table-num">{r.weightKg.toLocaleString()}</span> },
    { header: 'Yard Bay', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Block Inventory Check</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search blocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No raw blocks in yard." />
    </div>
  );
}

// Slab Lots & Gangsaw Block Conversion
export function SlabLotsScreen() {
  const { slabLots, blocks, convertBlockToSlabs, yardLocations } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0]?.id || '');
  const [formData, setFormData] = useState({
    bundleNumber: 'BDL-03',
    slabsCount: 40,
    lengthIn: 114,
    heightIn: 64,
    thicknessMm: 20,
    yardLocation: 'LOC-C1'
  });

  const estSqFt = Math.round((Number(formData.slabsCount || 0) * Number(formData.lengthIn || 0) * Number(formData.heightIn || 0)) / 144);

  const filtered = slabLots.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.bundleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleConvert = (e) => {
    e.preventDefault();
    convertBlockToSlabs(selectedBlockId, formData);
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Lot ID', accessor: 'id' },
    { header: 'Bundle', accessor: 'bundleNumber' },
    { header: 'Ref Block', accessor: 'blockId' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Slabs', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Size (In)', render: r => `${r.lengthIn}" × ${r.heightIn}"` },
    { header: 'Thickness', accessor: 'thicknessMm', render: r => `${r.thicknessMm} mm` },
    { header: 'Total Sq.Ft', accessor: 'totalSqFt', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.totalSqFt.toLocaleString()}</span> },
    { header: 'A-Frame Bay', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Slab Lots & Bundles</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search slab lots..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Layers size={14} />
          <span>Block to Slab</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No slab bundles created." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Gangsaw: Block to Slab Conversion"
        onSubmit={handleConvert}
        submitLabel="Produce Slabs"
      >
        <div className="form-group">
          <label className="form-label">Select Raw Block</label>
          <select
            className="form-select"
            value={selectedBlockId}
            onChange={e => setSelectedBlockId(e.target.value)}
          >
            {blocks.filter(b => b.status === 'In Yard').map(b => (
              <option key={b.id} value={b.id}>{b.id} ({b.stoneCode} - {b.weightKg.toLocaleString()}kg)</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bundle Identifier</label>
          <input
            className="form-input"
            required
            placeholder="e.g. BND-2026-01"
            value={formData.bundleNumber}
            onChange={e => setFormData({ ...formData, bundleNumber: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Number of Slabs</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 28"
            value={formData.slabsCount}
            onChange={e => setFormData({ ...formData, slabsCount: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Length (Inches)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 120"
            value={formData.lengthIn}
            onChange={e => setFormData({ ...formData, lengthIn: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Height (Inches)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 75"
            value={formData.heightIn}
            onChange={e => setFormData({ ...formData, heightIn: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Thickness (mm)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 20"
            value={formData.thicknessMm}
            onChange={e => setFormData({ ...formData, thicknessMm: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Calculated Sq.Ft Yield</label>
          <input
            className="form-input"
            disabled
            value={`${estSqFt.toLocaleString()} Sq.Ft`}
            style={{ fontWeight: 700, color: 'var(--teal-900)' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Destination Yard Frame</label>
          <select
            className="form-select"
            value={formData.yardLocation}
            onChange={e => setFormData({ ...formData, yardLocation: e.target.value })}
          >
            {yardLocations.map(y => <option key={y.id} value={y.id}>{y.id} ({y.bay})</option>)}
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}

// Print Labels for Slabs & Bundles
export function PrintLabelsScreen() {
  const { slabLots } = useApp();
  const [selectedLot, setSelectedLot] = useState(slabLots[0]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Barcode & Bundle Labels</h1>
      </div>

      <div className="toolbar">
        <div className="toolbar-group">
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Select Bundle:</span>
          <select
            className="filter-select"
            value={selectedLot?.id}
            onChange={e => setSelectedLot(slabLots.find(s => s.id === e.target.value))}
          >
            {slabLots.map(s => <option key={s.id} value={s.id}>{s.id} - {s.bundleNumber} ({s.stoneCode})</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={14} />
          <span>Print QR Label</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
        <div style={{
          width: '380px',
          padding: '24px',
          background: 'var(--white)',
          border: '2px solid var(--black)',
          borderRadius: 'var(--r-12)',
          boxShadow: 'var(--sh-2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--teal-900)' }}>VENGO GRANITES TRACKING</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{selectedLot?.bundleNumber}</div>
            </div>
            <div style={{ width: '48px', height: '48px', border: '1px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
              [QR CODE]
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Stone Code:</span>
              <span style={{ fontWeight: 700 }}>{selectedLot?.stoneCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Parent Block:</span>
              <span>{selectedLot?.blockId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Slab Count:</span>
              <span style={{ fontWeight: 700 }}>{selectedLot?.slabsCount} Slabs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Dimension:</span>
              <span>{selectedLot?.lengthIn}" × {selectedLot?.heightIn}" × {selectedLot?.thicknessMm}mm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Net Area:</span>
              <span style={{ fontWeight: 800, color: 'var(--teal-900)' }}>{selectedLot?.totalSqFt} Sq.Ft</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Yard Bay:</span>
              <span>{selectedLot?.yardLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
