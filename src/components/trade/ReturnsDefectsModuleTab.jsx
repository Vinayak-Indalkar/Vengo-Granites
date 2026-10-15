import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Route as RouteIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function ReturnsDefectsModuleTab({ submenu = 'returns', tab = 'buyer-returns' }) {
  const navigate = useNavigate();
  const {
    tradeReturns = [],
    tradeCreditNotes = [],
    tradeDebitNotes = [],
    tradeScrapWriteOffs = [],
    defectStoreRecords = [],
    defectiveStore = [],
    setDefectiveStore,
    returnReasons = [],
    noteReasons = [],
    scrapReasons = [],
    suppliers = [],
    buyers = [],
    customers = [],
    tradeInvoices = [],
    tradeQuarryPOs = [],
    addReturn,
    approveReturn,
    addDebitNote,
    addScrapWriteOff,
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const allDefects = defectStoreRecords.length > 0 ? defectStoreRecords : defectiveStore;

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('new-return'); // 'new-return' | 'approve-return' | 'new-dn' | 'new-scrap'
  const [activeItem, setActiveItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Forms
  const [returnForm, setReturnForm] = useState({
    buyerId: buyerList[0]?.id || 'CUST-001',
    buyerName: buyerList[0]?.name || 'Carrara Marble Importers',
    invoiceId: 'INV-0002',
    bundleId: 'BUN-2024-002',
    stoneName: 'Absolute Black',
    returnReason: 'Broken / Cracked in Transit (RR-0001)',
    qtySqFt: 300,
    creditAmountEstimated: 123000,
    remarks: 'Corner chipped during unloading'
  });

  const [approveForm, setApproveForm] = useState({
    returnId: '',
    creditAmount: 123000,
    resolutionAction: 'Credit Note'
  });

  const [debitNoteForm, setDebitNoteForm] = useState({
    supplierId: suppliers[0]?.id || 'SUP-0001',
    supplierName: suppliers[0]?.name || 'Altissimo Quarries',
    qpoId: 'QPO-0002',
    reason: 'Quarry Block QC Rejection (NR-0003)',
    amount: 85000,
    taxPercent: 5,
    remarks: 'Natural fissure discovered at dressing'
  });

  const [scrapForm, setScrapForm] = useState({
    defectId: allDefects[0]?.id || 'DEF-001',
    stoneName: 'Black Galaxy',
    qtyWeight: '4.5 Tons',
    reason: 'Catastrophic Gangsaw Breakage (SR-0001)',
    approvedBy: 'Director of Plant Operations',
    scrapRevenue: 15000,
    netLoss: 65000
  });

  // Filters
  const filteredReturns = useMemo(() => {
    if (!searchQuery) return tradeReturns;
    const q = searchQuery.toLowerCase();
    return tradeReturns.filter(r =>
      r.id?.toLowerCase().includes(q) ||
      r.buyerName?.toLowerCase().includes(q) ||
      r.invoiceId?.toLowerCase().includes(q) ||
      r.stoneName?.toLowerCase().includes(q)
    );
  }, [tradeReturns, searchQuery]);

  const filteredCreditNotes = useMemo(() => {
    if (!searchQuery) return tradeCreditNotes;
    const q = searchQuery.toLowerCase();
    return tradeCreditNotes.filter(cn =>
      cn.id?.toLowerCase().includes(q) ||
      cn.buyerName?.toLowerCase().includes(q) ||
      cn.invoiceId?.toLowerCase().includes(q)
    );
  }, [tradeCreditNotes, searchQuery]);

  const filteredDefects = useMemo(() => {
    if (!searchQuery) return allDefects;
    const q = searchQuery.toLowerCase();
    return allDefects.filter(d =>
      d.id?.toLowerCase().includes(q) ||
      d.stoneType?.toLowerCase().includes(q) ||
      d.reason?.toLowerCase().includes(q) ||
      d.source?.toLowerCase().includes(q)
    );
  }, [allDefects, searchQuery]);

  const filteredDebitNotes = useMemo(() => {
    if (!searchQuery) return tradeDebitNotes;
    const q = searchQuery.toLowerCase();
    return tradeDebitNotes.filter(dn =>
      dn.id?.toLowerCase().includes(q) ||
      dn.supplierName?.toLowerCase().includes(q) ||
      dn.qpoId?.toLowerCase().includes(q)
    );
  }, [tradeDebitNotes, searchQuery]);

  const filteredScrap = useMemo(() => {
    if (!searchQuery) return tradeScrapWriteOffs;
    const q = searchQuery.toLowerCase();
    return tradeScrapWriteOffs.filter(s =>
      s.id?.toLowerCase().includes(q) ||
      s.stoneName?.toLowerCase().includes(q) ||
      s.reason?.toLowerCase().includes(q)
    );
  }, [tradeScrapWriteOffs, searchQuery]);

  // Handlers
  const handleOpenApprove = (ret) => {
    setActiveItem(ret);
    setApproveForm({
      returnId: ret.id,
      creditAmount: ret.creditAmountEstimated || 100000,
      resolutionAction: 'Credit Note'
    });
    setDrawerType('approve-return');
    setIsDrawerOpen(true);
  };

  const handleSaveApproveReturn = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    const credAmt = Number(approveForm.creditAmount) || 0;
    approveReturn(activeItem.id, credAmt);

    // Route returned stone to Defective Store
    if (setDefectiveStore) {
      setDefectiveStore(prev => [
        {
          id: `DEF-RET-${Date.now().toString().slice(-4)}`,
          stage: 'Final Slab',
          itemRefId: activeItem.bundleId || activeItem.id,
          stoneCode: activeItem.stoneName,
          reason: activeItem.returnReason || 'Buyer Return: Transit Defect / Damage',
          quantity: `${activeItem.qtySqFt} Sq.Ft`,
          detectedAt: 'Buyer Site Delivery Inspection',
          status: 'Credit Note Issued',
          date: new Date().toISOString().slice(0, 10)
        },
        ...prev
      ]);
    }

    setIsDrawerOpen(false);
    if (showToast) showToast(`Return ${activeItem.id} approved & Credit Note issued`, 'success');
  };

  const handleSaveReturn = (e) => {
    e.preventDefault();
    const newRet = addReturn({
      buyerId: returnForm.buyerId,
      buyerName: returnForm.buyerName,
      invoiceId: returnForm.invoiceId,
      bundleId: returnForm.bundleId,
      stoneName: returnForm.stoneName,
      returnReason: returnForm.returnReason,
      qtySqFt: Number(returnForm.qtySqFt) || 0,
      creditAmountEstimated: Number(returnForm.creditAmountEstimated) || 0,
      remarks: returnForm.remarks
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Buyer Return ${newRet.id} raised`, 'success');
  };

  const handleSaveDebitNote = (e) => {
    e.preventDefault();
    const amt = Number(debitNoteForm.amount) || 0;
    const tax = Math.round(amt * ((Number(debitNoteForm.taxPercent) || 5) / 100));
    const newDN = addDebitNote({
      supplierId: debitNoteForm.supplierId,
      supplierName: debitNoteForm.supplierName,
      qpoId: debitNoteForm.qpoId,
      reason: debitNoteForm.reason,
      amount: amt,
      taxAmount: tax,
      totalAmount: amt + tax,
      remarks: debitNoteForm.remarks
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Debit Note ${newDN.id} created`, 'success');
  };

  const handleSaveScrap = (e) => {
    e.preventDefault();
    const scrapRev = Number(scrapForm.scrapRevenue) || 0;
    const netLoss = Number(scrapForm.netLoss) || 0;
    const newScrap = addScrapWriteOff({
      defectId: scrapForm.defectId,
      stoneName: scrapForm.stoneName,
      qtyWeight: scrapForm.qtyWeight,
      reason: scrapForm.reason,
      approvedBy: scrapForm.approvedBy,
      scrapRevenue: scrapRev,
      netLoss: netLoss
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Scrap write-off ${newScrap.id} logged`, 'success');
  };

  // COLUMNS DEFINITIONS
  const returnColumns = [
    { header: 'Return No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Bundle ID', accessor: 'bundleId' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Return Reason', accessor: 'returnReason', render: r => <span style={{ fontSize: '12px' }}>{r.returnReason}</span> },
    { header: 'Qty (Sq.Ft)', accessor: 'qtySqFt', render: r => Number(r.qtySqFt || 0).toLocaleString() },
    { header: 'Estimated Credit (₹)', accessor: 'creditAmountEstimated', render: r => `₹${Number(r.creditAmountEstimated || 0).toLocaleString()}` },
    { header: 'Resolution', accessor: 'resolutionAction', render: r => <span className="badge badge-subtle">{r.resolutionAction || 'Pending'}</span> },
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
              label: 'View Return',
              icon: Eye,
              onClick: () => setViewItem({ type: 'Return', data: r })
            },
            r.status === 'Raised' && {
              label: 'Approve & Issue Credit Note',
              icon: CheckCircle2,
              onClick: () => handleOpenApprove(r)
            }
          ].filter(Boolean)}
        />
      )
    }
  ];

  const creditNoteColumns = [
    { header: 'CN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Return Ref', accessor: 'returnId', render: r => r.returnId || '-' },
    { header: 'Credit Amount (₹)', accessor: 'amount', render: r => `₹${Number(r.amount || 0).toLocaleString()}` },
    { header: 'Tax Adjusted (₹)', accessor: 'taxAdjusted', render: r => `₹${Number(r.taxAdjusted || 0).toLocaleString()}` },
    { header: 'Total Credit (₹)', accessor: 'totalCredit', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-solid, #10b981)' }}>₹{Number(r.totalCredit || r.amount || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Active'} /> },
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
            }
          ]}
        />
      )
    }
  ];

  const defectColumns = [
    { header: 'Defect ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Source', accessor: 'source', render: r => <span className="badge badge-subtle">{r.source || 'QC Inspection'}</span> },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Block / Bundle Ref', accessor: 'blockOrBundleId', render: r => r.blockOrBundleId || r.lotId || '-' },
    { header: 'Affected Area / Wt', accessor: 'qty', render: r => r.qty || r.sqFtOrKg || '-' },
    { header: 'Defect Reason', accessor: 'reason' },
    { header: 'Current Bay', accessor: 'location', render: r => r.location || 'Defective Bay D-1' },
    { header: 'Scrap Status', accessor: 'scrapStatus', render: r => <StatusBadge status={r.scrapStatus || r.status || 'Under Review'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.blockOrBundleId || r.lotId || r.id}`)
            }
          ]}
        />
      )
    }
  ];

  const debitNoteColumns = [
    { header: 'DN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Quarry PO Ref', accessor: 'qpoId' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Amount (₹)', accessor: 'amount', render: r => `₹${Number(r.amount || 0).toLocaleString()}` },
    { header: 'Tax Amount (₹)', accessor: 'taxAmount', render: r => `₹${Number(r.taxAmount || 0).toLocaleString()}` },
    { header: 'Total Debit (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700, color: 'var(--ruby-solid, #e11d48)' }}>₹{Number(r.totalAmount || r.amount || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Active'} /> },
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
            }
          ]}
        />
      )
    }
  ];

  const scrapColumns = [
    { header: 'Write-off No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Qty / Weight', accessor: 'qtyWeight' },
    { header: 'Scrap Reason', accessor: 'reason' },
    { header: 'Approved By', accessor: 'approvedBy' },
    { header: 'Scrap Recovery (₹)', accessor: 'scrapRevenue', render: r => `₹${Number(r.scrapRevenue || 0).toLocaleString()}` },
    { header: 'Net Loss (₹)', accessor: 'netLoss', render: r => <span style={{ fontWeight: 700, color: 'var(--ruby-solid, #e11d48)' }}>₹{Number(r.netLoss || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Approved'} /> },
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
            }
          ]}
        />
      )
    }
  ];

  const getTableInfo = () => {
    if (submenu === 'returns') {
      if (tab === 'buyer-returns') {
        return {
          title: 'Buyer Return Claims Register',
          count: filteredReturns.length,
          unit: 'claims',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-return'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Raise Buyer Return</span>
            </button>
          )
        };
      }
      if (tab === 'credit-notes') {
        return {
          title: 'Customer Credit Notes',
          count: filteredCreditNotes.length,
          unit: 'credit notes'
        };
      }
      return { title: 'Returns', count: filteredReturns.length, unit: 'records' };
    }

    if (submenu === 'defects') {
      if (tab === 'defective-store') {
        return {
          title: 'Defective Stone & Quarantine Store',
          count: filteredDefects.length,
          unit: 'records'
        };
      }
      if (tab === 'debit-notes') {
        return {
          title: 'Supplier Debit Notes Register',
          count: filteredDebitNotes.length,
          unit: 'debit notes',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-dn'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>New Debit Note</span>
            </button>
          )
        };
      }
      if (tab === 'scrap-write-off') {
        return {
          title: 'Material Scrap & Loss Write-Offs',
          count: filteredScrap.length,
          unit: 'records',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-scrap'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Log Scrap Write-off</span>
            </button>
          )
        };
      }
      return { title: 'Defects', count: filteredDefects.length, unit: 'records' };
    }

    return { title: 'Returns & Defects', count: 0, unit: 'records' };
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

      {/* Render Table */}
      {submenu === 'returns' && tab === 'buyer-returns' && (
        <DataTable
          columns={returnColumns}
          data={filteredReturns}
          emptyMessage="No buyer returns found."
        />
      )}

      {submenu === 'returns' && tab === 'credit-notes' && (
        <DataTable
          columns={creditNoteColumns}
          data={filteredCreditNotes}
          emptyMessage="No credit notes found."
        />
      )}

      {submenu === 'defects' && tab === 'defective-store' && (
        <DataTable
          columns={defectColumns}
          data={filteredDefects}
          emptyMessage="No defect store records."
        />
      )}

      {submenu === 'defects' && tab === 'debit-notes' && (
        <DataTable
          columns={debitNoteColumns}
          data={filteredDebitNotes}
          emptyMessage="No debit notes found."
        />
      )}

      {submenu === 'defects' && tab === 'scrap-write-off' && (
        <DataTable
          columns={scrapColumns}
          data={filteredScrap}
          emptyMessage="No scrap write-off records."
        />
      )}

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          drawerType === 'new-return' ? 'Raise Buyer Return' :
          drawerType === 'approve-return' ? 'Approve Return & Issue Credit Note' :
          drawerType === 'new-dn' ? 'Create Supplier Debit Note' :
          drawerType === 'new-scrap' ? 'Record Scrap Write-off' : 'Form'
        }
        onSubmit={
          drawerType === 'new-return' ? handleSaveReturn :
          drawerType === 'approve-return' ? handleSaveApproveReturn :
          drawerType === 'new-dn' ? handleSaveDebitNote :
          drawerType === 'new-scrap' ? handleSaveScrap : () => {}
        }
        submitLabel={drawerType === 'approve-return' ? 'Approve & Issue CN' : 'Save Record'}
      >
        {drawerType === 'new-return' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Buyer</label>
              <select
                className="form-select"
                value={returnForm.buyerId}
                onChange={e => {
                  const b = buyerList.find(x => x.id === e.target.value);
                  setReturnForm({ ...returnForm, buyerId: e.target.value, buyerName: b?.name || '' });
                }}
              >
                <option value="">Select Buyer (Optional)</option>
                {buyerList.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <input
                className="form-input"
                placeholder="e.g. INV-2026-0081"
                value={returnForm.invoiceId}
                onChange={e => setReturnForm({ ...returnForm, invoiceId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bundle ID</label>
              <input
                className="form-input"
                placeholder="e.g. BUN-2026-0819"
                value={returnForm.bundleId}
                onChange={e => setReturnForm({ ...returnForm, bundleId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <input
                className="form-input"
                placeholder="e.g. Black Galaxy"
                value={returnForm.stoneName}
                onChange={e => setReturnForm({ ...returnForm, stoneName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return Reason</label>
              <select
                className="form-select"
                value={returnForm.returnReason}
                onChange={e => setReturnForm({ ...returnForm, returnReason: e.target.value })}
              >
                {returnReasons.map(r => (
                  <option key={r.id} value={`${r.name} (${r.id})`}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Affected (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 150"
                value={returnForm.qtySqFt}
                onChange={e => setReturnForm({ ...returnForm, qtySqFt: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Credit (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={returnForm.creditAmountEstimated}
                onChange={e => setReturnForm({ ...returnForm, creditAmountEstimated: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter remarks or arrival notes..."
                value={returnForm.remarks}
                onChange={e => setReturnForm({ ...returnForm, remarks: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'approve-return' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Approval Notice</label>
              <div className="detail-value" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                Approving Return <strong>{activeItem?.id}</strong> from {activeItem?.buyerName}.
              </div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Resolution Action</label>
              <select
                className="form-select"
                value={approveForm.resolutionAction}
                onChange={e => setApproveForm({ ...approveForm, resolutionAction: e.target.value })}
              >
                <option value="Credit Note">Issue Credit Note</option>
                <option value="Replacement">Dispatch Replacement</option>
                <option value="Scrap Restock">Move to Defective Store</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Approved Credit Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={approveForm.creditAmount}
                onChange={e => setApproveForm({ ...approveForm, creditAmount: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'new-dn' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier</label>
              <select
                className="form-select"
                value={debitNoteForm.supplierId}
                onChange={e => {
                  const s = suppliers.find(x => x.id === e.target.value);
                  setDebitNoteForm({ ...debitNoteForm, supplierId: e.target.value, supplierName: s?.name || '' });
                }}
              >
                <option value="">Select Quarry / Supplier (Optional)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quarry PO Ref</label>
              <input
                className="form-input"
                placeholder="e.g. QPO-2026-0041"
                value={debitNoteForm.qpoId}
                onChange={e => setDebitNoteForm({ ...debitNoteForm, qpoId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <select
                className="form-select"
                value={debitNoteForm.reason}
                onChange={e => setDebitNoteForm({ ...debitNoteForm, reason: e.target.value })}
              >
                {noteReasons.filter(n => n.type === 'Debit').map(n => (
                  <option key={n.id} value={`${n.name} (${n.id})`}>{n.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Debit Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={debitNoteForm.amount}
                onChange={e => setDebitNoteForm({ ...debitNoteForm, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                className="form-input"
                placeholder="5"
                value={debitNoteForm.taxPercent}
                onChange={e => setDebitNoteForm({ ...debitNoteForm, taxPercent: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter remarks or arrival notes..."
                value={debitNoteForm.remarks}
                onChange={e => setDebitNoteForm({ ...debitNoteForm, remarks: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'new-scrap' && (
          <>
            <div className="form-group">
              <label className="form-label">Defect Record Ref</label>
              <input
                className="form-input"
                placeholder="e.g. DEF-2026-001"
                value={scrapForm.defectId}
                onChange={e => setScrapForm({ ...scrapForm, defectId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <input
                className="form-input"
                placeholder="e.g. Black Galaxy"
                value={scrapForm.stoneName}
                onChange={e => setScrapForm({ ...scrapForm, stoneName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity / Weight</label>
              <input
                className="form-input"
                placeholder="e.g. 5 Tons"
                value={scrapForm.qtyWeight}
                onChange={e => setScrapForm({ ...scrapForm, qtyWeight: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scrap Reason</label>
              <select
                className="form-select"
                value={scrapForm.reason}
                onChange={e => setScrapForm({ ...scrapForm, reason: e.target.value })}
              >
                {scrapReasons.map(s => (
                  <option key={s.id} value={`${s.name} (${s.id})`}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Approved By</label>
              <input
                className="form-input"
                placeholder="e.g. Factory Director"
                value={scrapForm.approvedBy}
                onChange={e => setScrapForm({ ...scrapForm, approvedBy: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scrap Recovery (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={scrapForm.scrapRevenue}
                onChange={e => setScrapForm({ ...scrapForm, scrapRevenue: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Net Loss (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={scrapForm.netLoss}
                onChange={e => setScrapForm({ ...scrapForm, netLoss: e.target.value })}
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
    </div>
  );
}
