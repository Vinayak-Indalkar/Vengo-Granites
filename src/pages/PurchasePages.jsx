import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown } from '../components/CommonComponents';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';

// Approvals Screen (Super Admin: PR approvals)
export function POApprovalsScreen() {
  const { purchaseRequests, approvePurchaseRequest, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [selectedPR, setSelectedPR] = useState(null);
  const [ratePerTon, setRatePerTon] = useState(250);

  const pendingPRs = purchaseRequests.filter(p =>
    (p.status === 'Pending Approval') &&
    (p.id.toLowerCase().includes(search.toLowerCase()) || p.stoneCode.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApprove = (e) => {
    e.preventDefault();
    if (selectedPR) {
      approvePurchaseRequest(selectedPR.id, ratePerTon);
      setSelectedPR(null);
    }
  };

  const columns = [
    { header: 'PR ID', accessor: 'id' },
    { header: 'Requested By', accessor: 'requestedBy' },
    { header: 'Stone Code', accessor: 'stoneCode' },
    { header: 'Quantity (Tons)', accessor: 'quantityTons', render: r => <span className="table-num">{r.quantityTons}t</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Request Date', accessor: 'date' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') ? (
        <ActionDropdown
          items={[
            {
              label: 'Approve to PO',
              icon: CheckCircle,
              onClick: () => { setSelectedPR(r); setRatePerTon(250); }
            }
          ]}
        />
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Admin Only</span>
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">PR Approvals Queue</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search pending requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={pendingPRs} emptyMessage="No PRs pending approval." />

      <FormDrawer
        isOpen={!!selectedPR}
        onClose={() => setSelectedPR(null)}
        title={`Approve PR: ${selectedPR?.id}`}
        onSubmit={handleApprove}
        submitLabel="Confirm & Generate PO"
      >
        <div className="form-group">
          <label className="form-label">Stone Code</label>
          <input className="form-input" disabled value={selectedPR?.stoneCode || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Quantity (Tons)</label>
          <input className="form-input" disabled value={selectedPR?.quantityTons || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Negotiated Rate ($/Ton)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 180"
            value={ratePerTon}
            onChange={e => setRatePerTon(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Cost ($)</label>
          <input
            className="form-input"
            disabled
            value={`$${(Number(selectedPR?.quantityTons || 0) * Number(ratePerTon)).toLocaleString()}`}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// New PO Screen / Open POs Screen
export function OpenPOsScreen() {
  const { purchaseOrders, suppliers, stoneTypes } = useApp();
  const [search, setSearch] = useState('');

  const filtered = purchaseOrders.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'PO Number', accessor: 'id' },
    { header: 'Ref PR', accessor: 'prId' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Tons', accessor: 'tons', render: r => <span className="table-num">{r.tons}t</span> },
    { header: 'Rate/Ton ($)', accessor: 'ratePerTon', render: r => <span className="table-num">${r.ratePerTon}</span> },
    { header: 'Total ($)', accessor: 'totalCost', render: r => <span className="table-num">${r.totalCost.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Order Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search POs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No purchase orders found." />
    </div>
  );
}

// Client Admin: Purchase Requests (New PR / My PRs)
export function PurchaseRequestsScreen() {
  const { purchaseRequests, addPurchaseRequest, suppliers, stoneTypes } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ supplierId: 'SUP-001', stoneCode: 'BLK-GAL', quantityTons: 50 });

  const filtered = purchaseRequests.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addPurchaseRequest({
      supplierId: formData.supplierId,
      stoneCode: formData.stoneCode,
      quantityTons: Number(formData.quantityTons)
    });
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'PR ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Supplier', accessor: 'supplierId', render: r => suppliers.find(s => s.id === r.supplierId)?.name || r.supplierId },
    { header: 'Quantity (Tons)', accessor: 'quantityTons', render: r => <span className="table-num">{r.quantityTons}t</span> },
    { header: 'Requested By', accessor: 'requestedBy' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Purchase Requests</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search PRs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>New PR</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No purchase requests submitted." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Purchase Request"
        onSubmit={handleSubmit}
        submitLabel="Submit PR"
      >
        <div className="form-group">
          <label className="form-label">Select Stone</label>
          <select
            className="form-select"
            value={formData.stoneCode}
            onChange={e => setFormData({ ...formData, stoneCode: e.target.value })}
          >
            {stoneTypes.map(s => <option key={s.id} value={s.code}>{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Preferred Supplier</label>
          <select
            className="form-select"
            value={formData.supplierId}
            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
          >
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Required Quantity (Tons)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 50"
            value={formData.quantityTons}
            onChange={e => setFormData({ ...formData, quantityTons: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}
