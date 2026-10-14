import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown } from '../components/CommonComponents';
import { Plus, Search, AlertTriangle, RotateCcw, Truck, FileText, CheckCircle } from 'lucide-react';

// Sales Orders / New Sales Order
export function SalesOrdersScreen() {
  const { salesOrders, customers, slabLots, createSalesOrder, generateInvoice } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    lotId: slabLots[0]?.id || '',
    sqFt: 500,
    rateSqFt: 65
  });
  const [alertNotice, setAlertNotice] = useState(null);

  const selectedCust = customers.find(c => c.id === formData.customerId);
  const totalAmount = Number(formData.sqFt || 0) * Number(formData.rateSqFt || 0);

  const filtered = salesOrders.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.customerName.toLowerCase().includes(search.toLowerCase()) ||
    s.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = createSalesOrder(formData);
    setIsDrawerOpen(false);
    if (result.isHeld) {
      setAlertNotice(`Order held: ${result.reason}. Super Admin credit override is required.`);
    } else {
      setAlertNotice(null);
    }
  };

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Client', accessor: 'customerName' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Sq.Ft', accessor: 'sqFt', render: r => <span className="table-num">{r.sqFt.toLocaleString()}</span> },
    { header: 'Rate ($/Sq.Ft)', accessor: 'rateSqFt', render: r => <span className="table-num">${r.rateSqFt}</span> },
    { header: 'Total ($)', accessor: 'totalAmount', render: r => <span className="table-num">${r.totalAmount.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Remarks / Hold Reason', accessor: 'overrideReason', render: r => r.overrideReason ? <span style={{ fontSize: '12px', color: 'var(--ruby-text)' }}>{r.overrideReason}</span> : '-' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            r.status === 'Confirmed' && {
              label: 'Generate Invoice',
              icon: FileText,
              onClick: () => generateInvoice(r.id)
            }
          ].filter(Boolean)}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Sales Orders</h1>
      </div>

      {alertNotice && (
        <div className="callout callout-ruby">
          <AlertTriangle size={16} />
          <div>{alertNotice}</div>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search sales orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>New Order</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No sales orders logged." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Sales Order"
        onSubmit={handleSubmit}
        submitLabel="Place Sales Order"
      >
        <div className="form-group">
          <label className="form-label">Client</label>
          <select
            className="form-select"
            value={formData.customerId}
            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isBlocked ? '(BLOCKED)' : `(Limit: $${c.creditLimit.toLocaleString()})`}
              </option>
            ))}
          </select>
        </div>

        {selectedCust && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--soft)', padding: '8px 12px', borderRadius: 'var(--r-8)' }}>
            <div>Current Balance: <b>${selectedCust.balance.toLocaleString()}</b></div>
            <div>Credit Limit: <b>${selectedCust.creditLimit.toLocaleString()}</b></div>
            <div>Account Status: <b style={{ color: selectedCust.isBlocked ? 'var(--ruby-text)' : 'var(--emerald-text)' }}>{selectedCust.isBlocked ? 'BLOCKED' : 'GOOD STANDING'}</b></div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Select Slab Lot</label>
          <select
            className="form-select"
            value={formData.lotId}
            onChange={e => setFormData({ ...formData, lotId: e.target.value })}
          >
            {slabLots.map(l => (
              <option key={l.id} value={l.id}>
                {l.id} - {l.bundleNumber} ({l.stoneCode} - {l.totalSqFt} Sq.Ft avail)
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity (Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 1500"
            value={formData.sqFt}
            onChange={e => setFormData({ ...formData, sqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rate ($/Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 65"
            value={formData.rateSqFt}
            onChange={e => setFormData({ ...formData, rateSqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Order Total (Sq.Ft × Rate)</label>
          <input
            className="form-input"
            disabled
            value={`$${totalAmount.toLocaleString()}`}
            style={{ fontWeight: 700, color: 'var(--teal-900)' }}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// Credit Override Screen (Super Admin Only with MANDATORY reason)
export function CreditOverrideScreen() {
  const { salesOrders, overrideSalesOrderCredit, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState('');

  const heldOrders = salesOrders.filter(s =>
    s.status === 'Held' &&
    (s.id.toLowerCase().includes(search.toLowerCase()) || s.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOverride = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Override reason is mandatory.');
      return;
    }
    overrideSalesOrderCredit(selectedOrder.id, reason);
    setSelectedOrder(null);
    setReason('');
  };

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Order Total ($)', accessor: 'totalAmount', render: r => <span className="table-num">${r.totalAmount.toLocaleString()}</span> },
    { header: 'Hold Reason', accessor: 'overrideReason', render: r => <span style={{ color: 'var(--ruby-text)', fontWeight: 600 }}>{r.overrideReason}</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => currentRole === 'Super Admin' ? (
        <ActionDropdown
          items={[
            {
              label: 'Approve Override',
              icon: CheckCircle,
              onClick: () => { setSelectedOrder(r); setReason(''); }
            }
          ]}
        />
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Requires Super Admin</span>
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Credit & Limit Overrides</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search held orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={heldOrders} emptyMessage="No orders on credit hold." />

      <FormDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Override Credit: ${selectedOrder?.id}`}
        onSubmit={handleOverride}
        submitLabel="Authorize Override"
      >
        <div className="callout callout-ruby">
          <AlertTriangle size={16} />
          <div>Customer has exceeded authorized credit limit or is marked blocked. Super Admin justification required.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input className="form-input" disabled value={selectedOrder?.customerName || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Order Total ($)</label>
          <input className="form-input" disabled value={`$${selectedOrder?.totalAmount?.toLocaleString() || 0}`} />
        </div>
        <div className="form-group">
          <label className="form-label">
            <span>Mandatory Override Reason</span>
            <span style={{ color: 'var(--ruby-text)' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            required
            placeholder="e.g. Director approved temporary credit expansion against irrevocable LC..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// Invoices & Cancel/Reissue Screen (Invoices are NEVER edited in place)
export function InvoicesScreen() {
  const { invoices, cancelAndReissueInvoice, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [reissueData, setReissueData] = useState({ newSqFt: 0, newRateSqFt: 0, reason: '' });

  const filtered = invoices.filter(i =>
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleReissue = (e) => {
    e.preventDefault();
    cancelAndReissueInvoice(selectedInvoice.id, reissueData);
    setSelectedInvoice(null);
  };

  const columns = [
    { header: 'Invoice ID', accessor: 'id' },
    { header: 'Ref Order', accessor: 'soId' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Sq.Ft', accessor: 'sqFt', render: r => <span className="table-num">{r.sqFt.toLocaleString()}</span> },
    { header: 'Rate ($/Sq.Ft)', accessor: 'rateSqFt', render: r => <span className="table-num">${r.rateSqFt}</span> },
    { header: 'Invoice Total ($)', accessor: 'totalAmount', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.totalAmount.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (r.status === 'Issued' && currentRole === 'Super Admin') ? (
        <ActionDropdown
          items={[
            {
              label: 'Cancel & Reissue',
              icon: RotateCcw,
              onClick: () => {
                setSelectedInvoice(r);
                setReissueData({ newSqFt: r.sqFt, newRateSqFt: r.rateSqFt, reason: '' });
              }
            }
          ]}
        />
      ) : null
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Sales Invoices</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No sales invoices found." />

      <FormDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Cancel & Reissue: ${selectedInvoice?.id}`}
        onSubmit={handleReissue}
        submitLabel="Cancel Old & Issue New"
      >
        <div className="callout callout-amber">
          <AlertTriangle size={16} />
          <div>Invoices are immutable. Original invoice will be marked Cancelled and a new sequence issued.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Customer</label>
          <input className="form-input" disabled value={selectedInvoice?.customerName || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Revised Sq.Ft</label>
          <input
            type="number"
            className="form-input"
            required
            value={reissueData.newSqFt}
            onChange={e => setReissueData({ ...reissueData, newSqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Revised Rate ($/Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            required
            value={reissueData.newRateSqFt}
            onChange={e => setReissueData({ ...reissueData, newRateSqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">New Total (Sq.Ft × Rate)</label>
          <input
            className="form-input"
            disabled
            value={`$${(Number(reissueData.newSqFt || 0) * Number(reissueData.newRateSqFt || 0)).toLocaleString()}`}
            style={{ fontWeight: 700 }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Cancellation Reason</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Rate adjustment after visual inspection"
            value={reissueData.reason}
            onChange={e => setReissueData({ ...reissueData, reason: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// Dispatch & Challans Screen
export function DispatchScreen() {
  const { challans, invoices, createDeliveryChallan } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: invoices[0]?.id || '',
    vehicleNo: '',
    driverName: '',
    slabsCount: 20,
    bundleNumber: 'BDL-01'
  });

  const filtered = challans.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicleNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    createDeliveryChallan(formData);
    setIsDrawerOpen(false);
    setFormData({ invoiceId: invoices[0]?.id || '', vehicleNo: '', driverName: '', slabsCount: 20, bundleNumber: 'BDL-01' });
  };

  const columns = [
    { header: 'Challan ID', accessor: 'id' },
    { header: 'Invoice ID', accessor: 'invoiceId' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Bundle', accessor: 'bundleNumber' },
    { header: 'Slab Count', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Vehicle Number', accessor: 'vehicleNo' },
    { header: 'Driver', accessor: 'driverName' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Delivery Challans & Dispatch</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search challans..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Truck size={14} />
          <span>New Challan</span>
        </button>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No delivery challans issued." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Issue Delivery Challan"
        onSubmit={handleSubmit}
        submitLabel="Generate Challan & Dispatch"
      >
        <div className="form-group">
          <label className="form-label">Reference Invoice</label>
          <select
            className="form-select"
            value={formData.invoiceId}
            onChange={e => setFormData({ ...formData, invoiceId: e.target.value })}
          >
            {invoices.filter(i => i.status === 'Issued').map(i => (
              <option key={i.id} value={i.id}>{i.id} - {i.customerName} (${i.totalAmount})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bundle Code</label>
          <input
            className="form-input"
            required
            placeholder="e.g. BND-2026-01"
            value={formData.bundleNumber}
            onChange={e => setFormData({ ...formData, bundleNumber: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Slab Count</label>
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
          <label className="form-label">Transport Vehicle Plate</label>
          <input
            className="form-input"
            required
            placeholder="e.g. KA-01-AB-1200"
            value={formData.vehicleNo}
            onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Driver Name</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Sunil Verma"
            value={formData.driverName}
            onChange={e => setFormData({ ...formData, driverName: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}
