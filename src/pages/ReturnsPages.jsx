import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge } from '../components/CommonComponents';
import { Plus, Search, Trash2, AlertTriangle } from 'lucide-react';

// Defective Store & Damage Logging
export function DefectiveStoreScreen() {
  const { defectiveStore, logDamage, slabLots, blocks } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Slab',
    lotId: slabLots[0]?.id || 'LOT-401',
    reason: 'Dry Seam Crack',
    sqFtOrKg: '100 Sq.Ft',
    detectedAt: 'Polishing Line'
  });

  const filtered = defectiveStore.filter(d =>
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.lotId.toLowerCase().includes(search.toLowerCase()) ||
    d.reason.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    logDamage(formData);
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Defect ID', accessor: 'id' },
    { header: 'Item Type', accessor: 'type' },
    { header: 'Lot / Block ID', accessor: 'lotId' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Affected Area/Weight', accessor: 'sqFtOrKg' },
    { header: 'Detected Stage', accessor: 'detectedAt' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Defective & Damaged Store</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search defects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>Log Damage</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No defective materials reported." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Log Material Damage / Defect"
        onSubmit={handleSubmit}
        submitLabel="Log Defect Record"
      >
        <div className="form-group">
          <label className="form-label">Material Form</label>
          <select
            className="form-select"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Slab">Slab Lot</option>
            <option value="Block">Raw Block</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Item / Lot Identifier</label>
          <input
            className="form-input"
            required
            placeholder="e.g. BLK-8801 or BND-2026-04"
            value={formData.lotId}
            onChange={e => setFormData({ ...formData, lotId: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Defect Observation</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Natural crack, discoloration, handling break"
            value={formData.reason}
            onChange={e => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Loss (Sq.Ft or Kg)</label>
          <input
            className="form-input"
            required
            placeholder="e.g. 180 Sq.Ft or 4,200 Kg"
            value={formData.sqFtOrKg}
            onChange={e => setFormData({ ...formData, sqFtOrKg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Inspection Stage</label>
          <input
            className="form-input"
            placeholder="e.g. Post-Gangsaw Sawing, Yard Unloading"
            value={formData.detectedAt}
            onChange={e => setFormData({ ...formData, detectedAt: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// Debit Notes (to Suppliers for quarry defects)
export function DebitNotesScreen() {
  const { debitNotes } = useApp();

  const columns = [
    { header: 'Debit Note ID', accessor: 'id' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Ref GRN', accessor: 'grnId' },
    { header: 'Amount ($)', accessor: 'amount', render: r => <span className="table-num">${r.amount.toLocaleString()}</span> },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Supplier Debit Notes</h1>
      </div>

      <div className="toolbar">
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Claims against defective quarry shipments</span>
      </div>

      <DataTable columns={columns} data={debitNotes} emptyMessage="No debit notes raised." />
    </div>
  );
}

// Credit Notes (to Customers for slab returns/credits)
export function CreditNotesScreen() {
  const { creditNotes } = useApp();

  const columns = [
    { header: 'Credit Note ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Ref Invoice', accessor: 'invoiceId' },
    { header: 'Amount ($)', accessor: 'amount', render: r => <span className="table-num">${r.amount.toLocaleString()}</span> },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Customer Credit Notes</h1>
      </div>

      <div className="toolbar">
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Credit allowances issued to clients</span>
      </div>

      <DataTable columns={columns} data={creditNotes} emptyMessage="No credit notes issued." />
    </div>
  );
}

// Scrap Write-off (Super Admin Only: Client Admin cannot write off scrap)
export function ScrapWriteOffScreen() {
  const { scrapWriteOffs, defectiveStore, approveScrapWriteOff, currentRole } = useApp();
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [writeOffData, setWriteOffData] = useState({ material: '', quantityKg: 1000, estimatedValue: 50 });

  if (currentRole !== 'Super Admin') {
    return (
      <div className="page-wrapper">
        <div className="callout callout-ruby">
          Access Denied: Scrap write-offs can only be executed by Super Admin.
        </div>
      </div>
    );
  }

  const handleWriteOff = (e) => {
    e.preventDefault();
    if (selectedDefect) {
      approveScrapWriteOff(selectedDefect.id, writeOffData);
      setSelectedDefect(null);
    }
  };

  const columns = [
    { header: 'Scrap ID', accessor: 'id' },
    { header: 'Ref Defect', accessor: 'itemId' },
    { header: 'Scrap Material', accessor: 'material' },
    { header: 'Weight (Kg)', accessor: 'quantityKg', render: r => <span className="table-num">{r.quantityKg.toLocaleString()}kg</span> },
    { header: 'Salvage Value ($)', accessor: 'estimatedValue', render: r => <span className="table-num">${r.estimatedValue}</span> },
    { header: 'Approved By', accessor: 'approvedBy' },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Scrap & Slurry Write-offs</h1>
      </div>

      <div className="toolbar">
        <div className="toolbar-group">
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Available defective items to write-off:</span>
          <select
            className="filter-select"
            value={selectedDefect?.id || ''}
            onChange={e => {
              const d = defectiveStore.find(x => x.id === e.target.value);
              setSelectedDefect(d);
              if (d) setWriteOffData({ material: `${d.lotId} - ${d.reason}`, quantityKg: 1000, estimatedValue: 50 });
            }}
          >
            <option value="">Select Defect Item...</option>
            {defectiveStore.filter(d => d.status !== 'Scrapped').map(d => (
              <option key={d.id} value={d.id}>{d.id} ({d.lotId} - {d.reason})</option>
            ))}
          </select>
          {selectedDefect && (
            <button className="btn btn-danger btn-sm" onClick={() => {}}>
              <Trash2 size={14} />
              <span>Authorize Write-Off</span>
            </button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={scrapWriteOffs} emptyMessage="No scrap write-offs executed." />

      <FormDrawer
        isOpen={!!selectedDefect}
        onClose={() => setSelectedDefect(null)}
        title={`Write-off: ${selectedDefect?.id}`}
        onSubmit={handleWriteOff}
        submitLabel="Confirm Scrap Disposal"
      >
        <div className="callout callout-ruby">
          <AlertTriangle size={16} />
          <div>This action will permanently retire the item from physical inventory and record depreciation.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Material Description</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Broken Granite Slabs & End Trims"
            value={writeOffData.material}
            onChange={e => setWriteOffData({ ...writeOffData, material: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Scrap Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 1200"
            value={writeOffData.quantityKg}
            onChange={e => setWriteOffData({ ...writeOffData, quantityKg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Salvage Recovery Value ($)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 150"
            value={writeOffData.estimatedValue}
            onChange={e => setWriteOffData({ ...writeOffData, estimatedValue: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}
