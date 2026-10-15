import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, XCircle, AlertTriangle, Truck, RotateCcw, ShieldCheck, DollarSign, Route as RouteIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function SalesOrdersBillingTab({ submenu = 'orders', tab = 'sales-orders' }) {
  const navigate = useNavigate();
  const {
    tradeSalesOrders = [],
    tradeInvoices = [],
    tradeChallans = [],
    tradeDispatches = [],
    tradeCreditPolicies = [],
    customers = [],
    buyers = [],
    bundles = [],
    issueInvoice,
    cancelInvoice,
    reissueInvoice,
    updateDispatchStatus,
    getNextDocNumber,
    setTradeSalesOrders,
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('new-so'); // 'new-so' | 'new-inv' | 'override' | 'cancel-inv'
  const [activeItem, setActiveItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Form states
  const [soForm, setSoForm] = useState({
    buyerId: '',
    buyerName: '',
    bpoId: '',
    shippingAddress: '',
    priceList: 'Standard Export Contract',
    bundleId: 'BUN-2024-001',
    stoneName: 'Black Galaxy',
    thickness: '20mm',
    qtySqFt: 1200,
    rate: 395
  });

  const [invForm, setInvForm] = useState({
    soId: '',
    buyerId: '',
    buyerName: '',
    subtotal: 500000,
    discountAmount: 10000,
    taxPercent: 18,
    freightAmount: 15000,
    paymentTerms: 'Net 30 Days',
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav'
  });

  const [overrideForm, setOverrideForm] = useState({
    soId: '',
    reason: 'Executive Director temporary guarantee',
    approvedLimit: 5000000,
    expiryDate: '2026-12-31'
  });

  const [cancelForm, setCancelForm] = useState({
    invId: '',
    reason: 'Buyer order modification'
  });

  // Filter datasets
  const filteredSalesOrders = useMemo(() => {
    let list = tradeSalesOrders;
    if (tab === 'reservations') {
      list = list.filter(s => s.status === 'Reserved' || (s.reservedBundles && s.reservedBundles.length > 0));
    } else if (tab === 'credit-override') {
      list = list.filter(s => s.creditStatus?.toLowerCase().includes('warning') || s.creditStatus?.toLowerCase().includes('override') || s.status === 'Held');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(s =>
      s.id?.toLowerCase().includes(q) ||
      s.buyerName?.toLowerCase().includes(q) ||
      s.bpoId?.toLowerCase().includes(q) ||
      s.shippingAddress?.toLowerCase().includes(q)
    );
  }, [tradeSalesOrders, tab, searchQuery]);

  const filteredInvoices = useMemo(() => {
    let list = tradeInvoices;
    if (tab === 'cancel-reissue') {
      list = list.filter(i => i.status === 'Cancelled' || i.reissuedFrom);
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(i =>
      i.id?.toLowerCase().includes(q) ||
      i.buyerName?.toLowerCase().includes(q) ||
      i.soId?.toLowerCase().includes(q)
    );
  }, [tradeInvoices, tab, searchQuery]);

  const filteredChallans = useMemo(() => {
    if (!searchQuery) return tradeChallans;
    const q = searchQuery.toLowerCase();
    return tradeChallans.filter(c =>
      c.id?.toLowerCase().includes(q) ||
      c.invoiceId?.toLowerCase().includes(q) ||
      c.buyerName?.toLowerCase().includes(q) ||
      c.vehicleNo?.toLowerCase().includes(q)
    );
  }, [tradeChallans, searchQuery]);

  const filteredDispatches = useMemo(() => {
    let list = tradeDispatches;
    if (tab === 'to-dispatch') {
      list = list.filter(d => d.status === 'Pending' || d.status === 'To Dispatch');
    } else if (tab === 'dispatched') {
      list = list.filter(d => d.status === 'Dispatched');
    } else if (tab === 'delivered') {
      list = list.filter(d => d.status === 'Delivered');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(d =>
      d.id?.toLowerCase().includes(q) ||
      d.challanId?.toLowerCase().includes(q) ||
      d.vehicleNo?.toLowerCase().includes(q) ||
      d.driverName?.toLowerCase().includes(q)
    );
  }, [tradeDispatches, tab, searchQuery]);

  // Handlers
  const handleOpenNewSO = () => {
    const defaultBuyer = buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };
    setSoForm({
      buyerId: defaultBuyer.id,
      buyerName: defaultBuyer.name,
      bpoId: 'BPO-0001',
      shippingAddress: 'Standard Delivery Depot',
      priceList: 'Standard Export Contract',
      bundleId: 'BUN-2024-001',
      stoneName: 'Black Galaxy',
      thickness: '20mm',
      qtySqFt: 1200,
      rate: 395
    });
    setDrawerType('new-so');
    setIsDrawerOpen(true);
  };

  const handleSaveSO = (e) => {
    e.preventDefault();
    const nextSOId = getNextDocNumber ? getNextDocNumber('SO') : `SO-${Date.now().toString().slice(-4)}`;
    const lineTotal = Number(soForm.qtySqFt || 0) * Number(soForm.rate || 0);
    const taxTotal = Math.round(lineTotal * 0.18);
    const totalAmount = lineTotal + taxTotal;

    const newSO = {
      id: nextSOId,
      date: new Date().toISOString().split('T')[0],
      buyerId: soForm.buyerId,
      buyerName: soForm.buyerName,
      bpoId: soForm.bpoId,
      shippingAddress: soForm.shippingAddress,
      priceList: soForm.priceList,
      creditStatus: 'Cleared',
      lines: [
        {
          id: `SOL-${Date.now().toString().slice(-3)}`,
          bundleId: soForm.bundleId,
          stoneName: soForm.stoneName,
          thickness: soForm.thickness,
          qtySqFt: Number(soForm.qtySqFt) || 0,
          rate: Number(soForm.rate) || 0,
          amount: lineTotal
        }
      ],
      totalAmount,
      reservedBundles: [soForm.bundleId],
      status: 'Reserved'
    };

    setTradeSalesOrders(prev => [newSO, ...prev]);
    setIsDrawerOpen(false);
    if (showToast) showToast(`Sales Order ${newSO.id} created & bundle reserved`, 'success');
  };

  const handleOpenOverride = (so) => {
    setActiveItem(so);
    setOverrideForm({
      soId: so.id,
      reason: 'Executive Director temporary guarantee',
      approvedLimit: 5000000,
      expiryDate: '2026-12-31'
    });
    setDrawerType('override');
    setIsDrawerOpen(true);
  };

  const handleSaveOverride = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    setTradeSalesOrders(prev =>
      prev.map(s => s.id === activeItem.id ? {
        ...s,
        creditStatus: `Override Approved: ${overrideForm.reason}`,
        status: s.status === 'Held' ? 'Reserved' : s.status
      } : s)
    );
    setIsDrawerOpen(false);
    if (showToast) showToast(`Credit override approved for ${activeItem.id}`, 'success');
  };

  const handleOpenCancelInvoice = (inv) => {
    setActiveItem(inv);
    setCancelForm({
      invId: inv.id,
      reason: 'Customer requested order amendment'
    });
    setDrawerType('cancel-inv');
    setIsDrawerOpen(true);
  };

  const handleSaveCancelInvoice = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    cancelInvoice(activeItem.id, cancelForm.reason);
    setIsDrawerOpen(false);
    if (showToast) showToast(`Invoice ${activeItem.id} cancelled`, 'success');
  };

  const handleReissueInvoice = (inv) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reissue Invoice',
      message: `Cancel ${inv.id} and reissue a new invoice document?`,
      onConfirm: () => {
        const reissued = reissueInvoice(inv.id);
        if (showToast) showToast(`Invoice reissued as ${reissued?.id || 'new invoice'}`, 'success');
      }
    });
  };

  // COLUMNS DEFINITIONS
  const soColumns = [
    { header: 'SO No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'BPO Ref', accessor: 'bpoId', render: r => r.bpoId ? <span className="badge badge-subtle">{r.bpoId}</span> : '-' },
    { header: 'Shipping Address', accessor: 'shippingAddress', render: r => <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.shippingAddress}</span> },
    { header: 'Reserved Bundles', accessor: 'reservedBundles', render: r => (r.reservedBundles || []).join(', ') || '-' },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 600 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span> },
    {
      header: 'Credit Check',
      accessor: 'creditStatus',
      render: r => {
        const isOverride = r.creditStatus?.toLowerCase().includes('override');
        const isWarning = r.creditStatus?.toLowerCase().includes('warning');
        return (
          <span style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: isOverride ? 'var(--cyan-solid, #06b6d4)' : isWarning ? 'var(--amber-solid, #f59e0b)' : 'var(--emerald-solid, #10b981)'
          }}>
            {r.creditStatus || 'Cleared'}
          </span>
        );
      }
    },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.id}`)
            },
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => setViewItem({ type: 'SO', data: r })
            },
            r.status !== 'Invoiced' && r.status !== 'Cancelled' && {
              label: 'Issue Invoice & Challan',
              icon: CheckCircle2,
              onClick: () => {
                const res = issueInvoice(r.id);
                if (showToast) showToast(`Invoice ${res.invoice.id} & Challan ${res.challan.id} issued`, 'success');
              }
            },
            (r.creditStatus?.toLowerCase().includes('warning') || r.creditStatus?.toLowerCase().includes('override') || r.status === 'Held') && {
              label: 'Override Credit Limit',
              icon: ShieldCheck,
              onClick: () => handleOpenOverride(r)
            },
            r.status !== 'Cancelled' && {
              label: 'Cancel Order',
              icon: XCircle,
              danger: true,
              onClick: () => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Cancel Sales Order',
                  message: `Cancel ${r.id}? This will immediately release reserved inventory bundles.`,
                  onConfirm: () => {
                    setTradeSalesOrders(prev =>
                      prev.map(s => s.id === r.id ? { ...s, status: 'Cancelled', reservedBundles: [] } : s)
                    );
                    if (showToast) showToast(`Sales Order ${r.id} cancelled`, 'success');
                  }
                });
              }
            }
          ].filter(Boolean)}
        />
      )
    }
  ];

  const invColumns = [
    { header: 'INV No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'SO Ref', accessor: 'soId', render: r => r.soId || '-' },
    { header: 'Challan', accessor: 'challanId', render: r => r.challanId ? <span className="badge badge-subtle">{r.challanId}</span> : '-' },
    { header: 'Subtotal (₹)', accessor: 'subtotal', render: r => `₹${Number(r.subtotal || 0).toLocaleString()}` },
    { header: 'Tax (₹)', accessor: 'taxAmount', render: r => `₹${Number(r.taxAmount || 0).toLocaleString()}` },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Paid (₹)', accessor: 'paidAmount', render: r => `₹${Number(r.paidAmount || 0).toLocaleString()}` },
    {
      header: 'Outstanding (₹)',
      accessor: 'outstandingAmount',
      render: r => (
        <span style={{ fontWeight: 600, color: (r.outstandingAmount || 0) > 0 ? 'var(--ruby-text, #e11d48)' : 'var(--muted)' }}>
          ₹{Number(r.outstandingAmount || 0).toLocaleString()}
        </span>
      )
    },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.id}`)
            },
            {
              label: 'View Invoice',
              icon: Eye,
              onClick: () => setViewItem({ type: 'INV', data: r })
            },
            r.status !== 'Cancelled' && {
              label: 'Cancel Invoice',
              icon: XCircle,
              danger: true,
              onClick: () => handleOpenCancelInvoice(r)
            },
            r.status === 'Cancelled' && {
              label: 'Reissue Invoice',
              icon: RotateCcw,
              onClick: () => handleReissueInvoice(r)
            }
          ].filter(Boolean)}
        />
      )
    }
  ];

  const challanColumns = [
    { header: 'Challan No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'Vehicle No.', accessor: 'vehicleNo' },
    { header: 'Driver', accessor: 'driverName' },
    { header: 'Bundles', accessor: 'bundles', render: r => (r.bundles || []).join(', ') },
    { header: 'Total Sq.Ft', accessor: 'totalSqFt', render: r => Number(r.totalSqFt || 0).toLocaleString() },
    { header: 'Weight (kg)', accessor: 'weightKg', render: r => Number(r.weightKg || 0).toLocaleString() },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.id}`)
            },
            {
              label: 'View Challan',
              icon: Eye,
              onClick: () => setViewItem({ type: 'CH', data: r })
            }
          ]}
        />
      )
    }
  ];

  const dispatchColumns = [
    { header: 'DSP No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Challan Ref', accessor: 'challanId' },
    { header: 'Vehicle No.', accessor: 'vehicleNo' },
    { header: 'Driver Name', accessor: 'driverName' },
    { header: 'Out Time', accessor: 'outTime' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Proof of Delivery', accessor: 'proofOfDelivery', render: r => <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.proofOfDelivery || '-'}</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.id}`)
            },
            {
              label: 'View Dispatch',
              icon: Eye,
              onClick: () => setViewItem({ type: 'DSP', data: r })
            },
            r.status !== 'Delivered' && {
              label: 'Confirm Delivery',
              icon: CheckCircle2,
              onClick: () => {
                updateDispatchStatus(r.id, 'Delivered', 'Signed POD Uploaded');
                if (showToast) showToast(`Dispatch ${r.id} confirmed delivered`, 'success');
              }
            }
          ].filter(Boolean)}
        />
      )
    }
  ];

  const getTableInfo = () => {
    if (submenu === 'orders') {
      if (tab === 'sales-orders') {
        return {
          title: 'Sales Orders Register',
          count: filteredSalesOrders.length,
          unit: 'orders',
          action: (
            <button className="btn btn-primary btn-sm" onClick={handleOpenNewSO} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>New Sales Order</span>
            </button>
          )
        };
      }
      if (tab === 'reservations') {
        return {
          title: 'Stock Bundle Reservations',
          count: filteredSalesOrders.filter(so => so.bundleId || so.bundleDetails).length,
          unit: 'reservations'
        };
      }
      if (tab === 'credit-override') {
        return {
          title: 'Credit Limit Override Requests',
          count: filteredSalesOrders.filter(so => so.creditStatus?.toLowerCase().includes('warning') || so.status === 'Held').length,
          unit: 'requests'
        };
      }
      return { title: 'Sales Orders', count: filteredSalesOrders.length, unit: 'orders' };
    }

    if (submenu === 'billing') {
      if (tab === 'invoices') {
        return {
          title: 'Tax Invoices & Billing Register',
          count: filteredInvoices.length,
          unit: 'invoices'
        };
      }
      if (tab === 'challans') {
        return {
          title: 'Delivery Challans (Gate Pass)',
          count: filteredChallans.length,
          unit: 'challans'
        };
      }
      if (tab === 'cancel-reissue') {
        return {
          title: 'Cancelled & Reissued Invoices',
          count: filteredInvoices.filter(i => i.status === 'Cancelled' || i.status === 'Reissued').length,
          unit: 'invoices'
        };
      }
      return { title: 'Invoices & Billing', count: filteredInvoices.length, unit: 'invoices' };
    }

    if (submenu === 'dispatch') {
      if (tab === 'to-dispatch') {
        return {
          title: 'Outward Dispatches - Ready & Pending',
          count: filteredDispatches.length,
          unit: 'consignments'
        };
      }
      if (tab === 'dispatched') {
        return {
          title: 'Outward Dispatches - In Transit',
          count: filteredDispatches.length,
          unit: 'shipments'
        };
      }
      if (tab === 'delivered') {
        return {
          title: 'Outward Dispatches - Confirmed Delivered',
          count: filteredDispatches.length,
          unit: 'deliveries'
        };
      }
      return { title: 'Dispatch Register', count: filteredDispatches.length, unit: 'dispatches' };
    }

    return { title: 'Sales & Invoices', count: 0, unit: 'records' };
  };

  const tableInfo = getTableInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Table Header / Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {tableInfo.title}
          </h2>
        </div>
        {tableInfo.action || null}
      </div>

      {/* Render Tables according to submenu and tab */}
      {submenu === 'orders' && (
        <DataTable
          columns={soColumns}
          data={filteredSalesOrders}
          emptyMessage="No sales orders found."
        />
      )}

      {submenu === 'billing' && tab !== 'challans' && (
        <DataTable
          columns={invColumns}
          data={filteredInvoices}
          emptyMessage="No invoices found."
        />
      )}

      {submenu === 'billing' && tab === 'challans' && (
        <DataTable
          columns={challanColumns}
          data={filteredChallans}
          emptyMessage="No delivery challans found."
        />
      )}

      {submenu === 'dispatch' && (
        <DataTable
          columns={dispatchColumns}
          data={filteredDispatches}
          emptyMessage="No dispatches found."
        />
      )}

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          drawerType === 'new-so' ? 'New Sales Order' :
          drawerType === 'override' ? 'Credit Override Approval' :
          drawerType === 'cancel-inv' ? 'Cancel Invoice' : 'Form'
        }
        onSubmit={
          drawerType === 'new-so' ? handleSaveSO :
          drawerType === 'override' ? handleSaveOverride :
          drawerType === 'cancel-inv' ? handleSaveCancelInvoice : () => {}
        }
        submitLabel={
          drawerType === 'new-so' ? 'Create Sales Order' :
          drawerType === 'override' ? 'Approve Override' :
          drawerType === 'cancel-inv' ? 'Confirm Cancellation' : 'Save'
        }
      >
        {drawerType === 'new-so' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Buyer</label>
              <select
                className="form-select"
                value={soForm.buyerId}
                onChange={e => {
                  const b = buyerList.find(x => x.id === e.target.value);
                  setSoForm({ ...soForm, buyerId: e.target.value, buyerName: b?.name || '' });
                }}
              >
                <option value="">Select Buyer (Optional)</option>
                {buyerList.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.id})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">BPO Reference</label>
              <input
                className="form-input"
                placeholder="e.g. BPO-2026-0041"
                value={soForm.bpoId}
                onChange={e => setSoForm({ ...soForm, bpoId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <input
                className="form-input"
                placeholder="e.g. Yard 4, Sector B"
                value={soForm.shippingAddress}
                onChange={e => setSoForm({ ...soForm, shippingAddress: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Price List</label>
              <input
                className="form-input"
                placeholder="e.g. Standard Export Contract"
                value={soForm.priceList}
                onChange={e => setSoForm({ ...soForm, priceList: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '4px', marginTop: '6px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>Line Item (Final Slab Bundle)</div>
            </div>

            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <input
                className="form-input"
                placeholder="e.g. Black Galaxy"
                value={soForm.stoneName}
                onChange={e => setSoForm({ ...soForm, stoneName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bundle ID</label>
              <input
                className="form-input"
                placeholder="e.g. BUN-2026-0819"
                value={soForm.bundleId}
                onChange={e => setSoForm({ ...soForm, bundleId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1200"
                value={soForm.qtySqFt}
                onChange={e => setSoForm({ ...soForm, qtySqFt: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rate (₹/Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 395"
                value={soForm.rate}
                onChange={e => setSoForm({ ...soForm, rate: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'override' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Order & Buyer Context</label>
              <div className="detail-value" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Approving credit override for <strong>{activeItem?.buyerName}</strong> ({activeItem?.id}). Order value: ₹{Number(activeItem?.totalAmount || 0).toLocaleString()}.
              </div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Approval Justification</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter remarks or arrival notes..."
                value={overrideForm.reason}
                onChange={e => setOverrideForm({ ...overrideForm, reason: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Approved Credit Limit (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1500000"
                value={overrideForm.approvedLimit}
                onChange={e => setOverrideForm({ ...overrideForm, approvedLimit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                placeholder="DD/MM/YYYY"
                value={overrideForm.expiryDate}
                onChange={e => setOverrideForm({ ...overrideForm, expiryDate: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'cancel-inv' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Invoice Notice</label>
              <div className="detail-value" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Cancelling <strong>{activeItem?.id}</strong> for {activeItem?.buyerName}.
              </div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Cancellation Reason</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter cancellation reason..."
                value={cancelForm.reason}
                onChange={e => setCancelForm({ ...cancelForm, reason: e.target.value })}
              />
            </div>
          </>
        )}
      </FormDrawer>

      {/* View Item Details Drawer */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`${viewItem?.type || 'Record'} Details: ${viewItem?.data?.id || ''}`}
        data={viewItem?.data || {}}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
}
