import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, AlertTriangle } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerReturnsTab({ submenu = 'returns', tab = 'my-returns' }) {
  const {
    tradeReturns = [],
    tradeCreditNotes = [],
    tradeInvoices = [],
    returnReasons = [],
    addReturn,
    activeBuyerId,
    buyers = [],
    customers = [],
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const currentBuyer = buyerList.find(b => b.id === activeBuyerId) || buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Return Form
  const [returnForm, setReturnForm] = useState({
    invoiceId: 'INV-0002',
    bundleId: 'BUN-2024-002',
    stoneName: 'Absolute Black',
    returnReason: 'Broken / Cracked in Transit (RR-0001)',
    qtySqFt: 300,
    creditAmountEstimated: 123000,
    remarks: 'Corner chipped during unloading'
  });

  // Local site damage records for activeBuyerId
  const [damageLog, setDamageLog] = useState(() => [
    { id: 'DMG-001', date: '2026-10-08', bundleId: 'BUN-2024-002', stoneName: 'Absolute Black', damagedSqFt: 300, defectType: 'Transit Edge Crack', reportedBy: 'Site Foreman Marco', actionTaken: 'Return Claim Raised (RET-0001)' },
    { id: 'DMG-002', date: '2026-10-12', bundleId: 'BUN-2024-003', stoneName: 'Tan Brown', damagedSqFt: 50, defectType: 'Surface Scratch during Fabrication', reportedBy: 'Shop Floor Tech Luca', actionTaken: 'Re-polished in-house' }
  ]);

  // Filter records
  const buyerReturns = useMemo(() => {
    return tradeReturns.filter(r => r.buyerId === activeBuyerId || !r.buyerId);
  }, [tradeReturns, activeBuyerId]);

  const buyerCreditNotes = useMemo(() => {
    return tradeCreditNotes.filter(cn => cn.buyerId === activeBuyerId || !cn.buyerId);
  }, [tradeCreditNotes, activeBuyerId]);

  const filteredReturns = useMemo(() => {
    if (!searchQuery) return buyerReturns;
    const q = searchQuery.toLowerCase();
    return buyerReturns.filter(r =>
      r.id?.toLowerCase().includes(q) ||
      r.invoiceId?.toLowerCase().includes(q) ||
      r.bundleId?.toLowerCase().includes(q) ||
      r.stoneName?.toLowerCase().includes(q)
    );
  }, [buyerReturns, searchQuery]);

  const filteredCreditNotes = useMemo(() => {
    if (!searchQuery) return buyerCreditNotes;
    const q = searchQuery.toLowerCase();
    return buyerCreditNotes.filter(cn =>
      cn.id?.toLowerCase().includes(q) ||
      cn.invoiceId?.toLowerCase().includes(q)
    );
  }, [buyerCreditNotes, searchQuery]);

  const filteredDamage = useMemo(() => {
    if (!searchQuery) return damageLog;
    const q = searchQuery.toLowerCase();
    return damageLog.filter(d =>
      d.id?.toLowerCase().includes(q) ||
      d.bundleId?.toLowerCase().includes(q) ||
      d.defectType?.toLowerCase().includes(q)
    );
  }, [damageLog, searchQuery]);

  useEffect(() => {
    if (tab === 'new-return') {
      setIsDrawerOpen(true);
    }
  }, [tab]);

  // Handlers
  const handleSaveReturn = (e) => {
    e.preventDefault();
    const newRet = addReturn({
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.name,
      invoiceId: returnForm.invoiceId,
      bundleId: returnForm.bundleId,
      stoneName: returnForm.stoneName,
      returnReason: returnForm.returnReason,
      qtySqFt: Number(returnForm.qtySqFt) || 0,
      creditAmountEstimated: Number(returnForm.creditAmountEstimated) || 0,
      remarks: returnForm.remarks
    });

    setIsDrawerOpen(false);
    if (showToast) showToast(`Return claim ${newRet.id} submitted for review`, 'success');
  };

  // COLUMNS
  const returnColumns = [
    { header: 'Return No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Bundle ID', accessor: 'bundleId' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Reason', accessor: 'returnReason' },
    { header: 'Damaged Area (Sq.Ft)', accessor: 'qtySqFt', render: r => Number(r.qtySqFt || 0).toLocaleString() },
    { header: 'Claim Value (₹)', accessor: 'creditAmountEstimated', render: r => `₹${Number(r.creditAmountEstimated || 0).toLocaleString()}` },
    { header: 'Credit Note Ref', accessor: 'creditNoteId', render: r => r.creditNoteId ? <span className="badge badge-subtle">{r.creditNoteId}</span> : '-' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'View Claim',
              icon: Eye,
              onClick: () => setViewItem(r)
            }
          ]}
        />
      )
    }
  ];

  const creditNoteColumns = [
    { header: 'CN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Return Ref', accessor: 'returnId', render: r => r.returnId || '-' },
    { header: 'Credit Amount (₹)', accessor: 'amount', render: r => `₹${Number(r.amount || 0).toLocaleString()}` },
    { header: 'Tax Adjusted (₹)', accessor: 'taxAdjusted', render: r => `₹${Number(r.taxAdjusted || 0).toLocaleString()}` },
    { header: 'Total Credit (₹)', accessor: 'totalCredit', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-solid, #10b981)' }}>₹{Number(r.totalCredit || r.amount || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Applied'} /> }
  ];

  const damageColumns = [
    { header: 'Damage ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Bundle Ref', accessor: 'bundleId' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Damaged Area', accessor: 'damagedSqFt', render: r => `${r.damagedSqFt} Sq.Ft` },
    { header: 'Defect Type', accessor: 'defectType' },
    { header: 'Reported By', accessor: 'reportedBy' },
    { header: 'Action Taken', accessor: 'actionTaken', render: r => <span className="badge badge-subtle">{r.actionTaken}</span> }
  ];

  const getTabTitle = () => {
    if (submenu === 'returns') {
      if (tab === 'new-return') return 'Raise Return Claim';
      if (tab === 'my-returns') return 'My Return Claims';
      if (tab === 'credit-notes') return 'Issued Credit Notes';
      return 'Return Claims';
    }
    if (submenu === 'damage') {
      return 'Material Damage & Defect Log';
    }
    return 'Returns & Damage';
  };

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
            {getTabTitle()}
          </h2>
        </div>
        {submenu === 'returns' && tab !== 'credit-notes' && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsDrawerOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Raise Return Claim</span>
          </button>
        )}
      </div>

      {submenu === 'returns' && tab !== 'credit-notes' && (
        <DataTable columns={returnColumns} data={filteredReturns} emptyMessage="No return claims raised." />
      )}

      {submenu === 'returns' && tab === 'credit-notes' && (
        <DataTable columns={creditNoteColumns} data={filteredCreditNotes} emptyMessage="No credit notes issued." />
      )}

      {submenu === 'damage' && (
        <DataTable columns={damageColumns} data={filteredDamage} emptyMessage="No damage incidents logged." />
      )}

      {/* Return Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Raise Return / Credit Request"
        onSubmit={handleSaveReturn}
        submitLabel="Submit Return Claim"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Buyer Account</label>
          <input
            className="form-input"
            value={`${currentBuyer.name} (${currentBuyer.id})`}
            disabled
            style={{ background: 'var(--surface-subtle)' }}
          />
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
          <label className="form-label">Discrepancy / Return Reason</label>
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
          <label className="form-label">Claim Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 55000"
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
      </FormDrawer>

      {/* View Return Details */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Return Claim: ${viewItem?.id || ''}`}
      >
        {viewItem && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Return Claim ID</label>
              <div className="detail-value" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {viewItem.id}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="detail-value">
                <StatusBadge status={viewItem.status} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="detail-value">{viewItem.date}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.invoiceId || '—'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bundle ID</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.bundleId || '—'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <div className="detail-value">{viewItem.stoneName || '—'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Affected</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>
                {viewItem.qtySqFt} Sq.Ft
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Return Reason</label>
              <div className="detail-value" style={{ color: 'var(--ruby-text)', fontWeight: 600 }}>
                {viewItem.returnReason}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Claim Amount</label>
              <div className="detail-value" style={{ fontWeight: 700 }}>
                ₹{Number(viewItem.creditAmountEstimated || 0).toLocaleString()}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Credit Note Ref</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.creditNoteId || 'Pending Approval'}
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <div className="detail-value">{viewItem.remarks || 'No remarks recorded.'}</div>
            </div>
          </>
        )}
      </ViewDrawer>
    </div>
  );
}
