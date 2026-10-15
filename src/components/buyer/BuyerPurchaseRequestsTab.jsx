import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerPurchaseRequestsTab({ tab = 'my-prs' }) {
  const {
    tradePRs = [],
    addTradePR,
    activeBuyerId,
    buyers = [],
    customers = [],
    suppliers = [],
    stoneTypes = [],
    finishes = [],
    thicknesses = [],
    grades = [],
    tradeRateLists = [],
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const currentBuyer = buyerList.find(b => b.id === activeBuyerId) || buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // New PR form state
  const [prForm, setPrForm] = useState({
    supplierId: suppliers[0]?.id || '',
    supplierName: suppliers[0]?.name || '',
    requiredDate: '2026-11-15',
    deliveryAddress: currentBuyer.shippingAddress || 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
    remarks: '',
    stoneTypeId: stoneTypes[0]?.id || 'ST-001',
    finishId: finishes[0]?.id || 'FIN-001',
    thicknessId: thicknesses[0]?.id || 'THK-003',
    gradeId: grades[0]?.id || 'GRD-001',
    size: '10ft x 6ft',
    qtySqFt: 1500,
    expectedRate: 395
  });

  // Filter PRs for activeBuyerId
  const buyerPRs = useMemo(() => {
    return tradePRs.filter(p => p.buyerId === activeBuyerId || !p.buyerId);
  }, [tradePRs, activeBuyerId]);

  const filteredPRs = useMemo(() => {
    let list = buyerPRs;
    if (tab === 'approved') {
      list = list.filter(p => p.status === 'Approved');
    } else if (tab === 'rejected') {
      list = list.filter(p => p.status === 'Rejected');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.supplierName?.toLowerCase().includes(q) ||
      p.deliveryAddress?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  }, [buyerPRs, tab, searchQuery]);

  useEffect(() => {
    if (tab === 'new-pr') {
      handleOpenNewPR();
    }
  }, [tab]);

  const handleOpenNewPR = () => {
    setPrForm({
      supplierId: suppliers[0]?.id || '',
      supplierName: suppliers[0]?.name || '',
      requiredDate: '2026-11-15',
      deliveryAddress: currentBuyer.shippingAddress || 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
      remarks: '',
      stoneTypeId: stoneTypes[0]?.id || 'ST-001',
      finishId: finishes[0]?.id || 'FIN-001',
      thicknessId: thicknesses[0]?.id || 'THK-003',
      gradeId: grades[0]?.id || 'GRD-001',
      size: '10ft x 6ft',
      qtySqFt: 1500,
      expectedRate: 395
    });
    setIsDrawerOpen(true);
  };

  const handleSavePR = (e) => {
    e.preventDefault();
    const st = stoneTypes.find(s => s.id === prForm.stoneTypeId);
    const fn = finishes.find(f => f.id === prForm.finishId);
    const th = thicknesses.find(t => t.id === prForm.thicknessId);
    const gr = grades.find(g => g.id === prForm.gradeId);
    const sup = suppliers.find(s => s.id === prForm.supplierId);

    const qty = Number(prForm.qtySqFt) || 0;
    const rate = Number(prForm.expectedRate) || 0;
    const lineTotal = qty * rate;

    const newPR = addTradePR({
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.name,
      supplierId: prForm.supplierId || null,
      supplierName: sup?.name || 'Open Quarry Sourcing',
      requiredDate: prForm.requiredDate,
      deliveryAddress: prForm.deliveryAddress,
      remarks: prForm.remarks,
      lines: [
        {
          id: `PRL-${Date.now().toString().slice(-3)}`,
          stoneTypeId: prForm.stoneTypeId,
          stoneName: st?.name || 'Black Galaxy',
          finishId: prForm.finishId,
          finishName: fn?.name || 'Mirror Polished',
          thicknessId: prForm.thicknessId,
          thicknessName: th?.name || '20mm',
          size: prForm.size,
          gradeId: prForm.gradeId,
          gradeName: gr?.name || 'Premium',
          qtySqFt: qty,
          expectedRate: rate,
          lineTotal
        }
      ],
      totalAmount: lineTotal
    });

    setIsDrawerOpen(false);
    if (showToast) showToast(`Purchase Request ${newPR.id} submitted`, 'success');
  };

  const columns = [
    { header: 'PR No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Preferred Supplier', accessor: 'supplierName', render: r => r.supplierName || 'Open Sourcing' },
    { header: 'Required Date', accessor: 'requiredDate' },
    { header: 'Delivery Destination', accessor: 'deliveryAddress', render: r => <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.deliveryAddress}</span> },
    {
      header: 'Items / Stone',
      accessor: 'lines',
      render: r => Array.isArray(r.lines) ? r.lines.map(l => `${l.stoneName} (${l.qtySqFt} Sq.Ft)`).join(', ') : '-'
    },
    { header: 'Total Est. (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'View PR',
              icon: Eye,
              onClick: () => setViewItem(r)
            }
          ]}
        />
      )
    }
  ];

  const getTabTitle = () => {
    switch (tab) {
      case 'new-pr':
        return 'Create Purchase Request';
      case 'my-prs':
        return 'My Purchase Requests';
      case 'approved':
        return 'Approved Purchase Requests';
      case 'rejected':
        return 'Rejected Purchase Requests';
      default:
        return 'Purchase Requests';
    }
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
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenNewPR}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>New PR</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredPRs}
        emptyMessage="No purchase requests found."
      />

      {/* New PR Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Purchase Request"
        onSubmit={handleSavePR}
        submitLabel="Submit Purchase Request"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Buyer</label>
          <input
            className="form-input"
            value={`${currentBuyer.name} (${currentBuyer.id})`}
            disabled
            style={{ background: 'var(--surface-subtle)', color: 'var(--ink)' }}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Preferred Supplier</label>
          <select
            className="form-select"
            value={prForm.supplierId}
            onChange={e => setPrForm({ ...prForm, supplierId: e.target.value })}
          >
            <option value="">Select Quarry / Supplier (Optional)</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Required Delivery Date</label>
          <input
            type="date"
            className="form-input"
            placeholder="DD/MM/YYYY"
            value={prForm.requiredDate}
            onChange={e => setPrForm({ ...prForm, requiredDate: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Delivery Destination</label>
          <input
            className="form-input"
            placeholder="e.g. Yard 4, Sector B"
            value={prForm.deliveryAddress}
            onChange={e => setPrForm({ ...prForm, deliveryAddress: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stone Type</label>
          <select
            className="form-select"
            value={prForm.stoneTypeId}
            onChange={e => setPrForm({ ...prForm, stoneTypeId: e.target.value })}
          >
            {stoneTypes.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Finish</label>
          <select
            className="form-select"
            value={prForm.finishId}
            onChange={e => setPrForm({ ...prForm, finishId: e.target.value })}
          >
            {finishes.map(fn => (
              <option key={fn.id} value={fn.id}>{fn.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Thickness</label>
          <select
            className="form-select"
            value={prForm.thicknessId}
            onChange={e => setPrForm({ ...prForm, thicknessId: e.target.value })}
          >
            {thicknesses.map(th => (
              <option key={th.id} value={th.id}>{th.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Grade</label>
          <select
            className="form-select"
            value={prForm.gradeId}
            onChange={e => setPrForm({ ...prForm, gradeId: e.target.value })}
          >
            {grades.map(gr => (
              <option key={gr.id} value={gr.id}>{gr.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity (Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 1500"
            value={prForm.qtySqFt}
            onChange={e => setPrForm({ ...prForm, qtySqFt: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Expected Rate (₹/Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 380"
            value={prForm.expectedRate}
            onChange={e => setPrForm({ ...prForm, expectedRate: e.target.value })}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Remarks</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="Enter remarks or arrival notes..."
            value={prForm.remarks}
            onChange={e => setPrForm({ ...prForm, remarks: e.target.value })}
          />
        </div>
      </FormDrawer>

      {/* View PR Details */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Purchase Request: ${viewItem?.id || ''}`}
      >
        {viewItem && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">PR Number</label>
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
            <div className="form-group col-span-2">
              <label className="form-label">Buyer</label>
              <div className="detail-value">{viewItem.buyerName || currentBuyer.name}</div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Preferred Supplier</label>
              <div className="detail-value">{viewItem.supplierName || 'Open Quarry Sourcing'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Required Delivery Date</label>
              <div className="detail-value">{viewItem.requiredDate || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Destination</label>
              <div className="detail-value">{viewItem.deliveryAddress || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <div className="detail-value">{viewItem.stoneTypeName || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Finish / Grade</label>
              <div className="detail-value">{viewItem.finishName || 'Polished'} • {viewItem.gradeName || 'Standard'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Thickness</label>
              <div className="detail-value">{viewItem.thicknessName || '20mm'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>{viewItem.qtySqFt} Sq.Ft</div>
            </div>
            <div className="form-group">
              <label className="form-label">Target Rate</label>
              <div className="detail-value">₹{viewItem.expectedRate || viewItem.rate || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Total</label>
              <div className="detail-value" style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                ₹{((viewItem.qtySqFt || 0) * (viewItem.expectedRate || viewItem.rate || 0)).toLocaleString()}
              </div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <div className="detail-value">{viewItem.remarks || 'No remarks provided.'}</div>
            </div>
          </>
        )}
      </ViewDrawer>
    </div>
  );
}
