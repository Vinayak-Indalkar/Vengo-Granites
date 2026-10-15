import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, CheckCircle2, AlertTriangle, FileSpreadsheet, Printer, Eye } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function ReceiptsGRNTab({ activeTab = 'grn' }) {
  const {
    tradeGRNs = [],
    addGRN,
    approveGRNVariance,
    tradeQuarryPOs = [],
    suppliers = [],
    gateEntries = [],
    weighbridgeTickets = [],
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [formState, setFormState] = useState({
    qpoId: '',
    supplierId: '',
    supplierName: '',
    gateEntry: 'GE-2024-001',
    weighbridgeTicket: 'WB-2024-001',
    blockCount: 1,
    grossWeightKg: 42000,
    tareWeightKg: 14000,
    challanWeightKg: 28000,
    toleranceThreshold: 1.5,
    remarks: ''
  });

  const handleOpenAdd = () => {
    const defaultQPO = tradeQuarryPOs[0] || { id: 'QPO-0001', supplierId: 'SUP-0001', supplierName: 'Altissimo Quarries' };
    setFormState({
      qpoId: defaultQPO.id,
      supplierId: defaultQPO.supplierId,
      supplierName: defaultQPO.supplierName,
      gateEntry: 'GE-2024-006',
      weighbridgeTicket: 'WB-2024-006',
      blockCount: 1,
      grossWeightKg: 44000,
      tareWeightKg: 14200,
      challanWeightKg: 29800,
      toleranceThreshold: 1.5,
      remarks: ''
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const gross = Number(formState.grossWeightKg) || 0;
    const tare = Number(formState.tareWeightKg) || 0;
    const net = gross - tare;
    const challan = Number(formState.challanWeightKg) || net;
    const varianceKg = net - challan;
    const variancePercent = challan > 0 ? Number(((varianceKg / challan) * 100).toFixed(2)) : 0;

    const payload = {
      ...formState,
      grossWeightKg: gross,
      tareWeightKg: tare,
      netWeightKg: net,
      challanWeightKg: challan,
      varianceKg,
      variancePercent
    };

    const created = addGRN(payload);
    if (showToast) showToast(`GRN ${created.id} created.`);
    setIsDrawerOpen(false);
  };

  const handleApproveVariance = (grnId) => {
    approveGRNVariance(grnId);
    if (showToast) showToast(`GRN ${grnId} variance approved.`);
  };

  // Filter based on activeTab: 'grn' | 'live-weights' | 'block-check' | 'variance'
  const filteredData = useMemo(() => {
    return tradeGRNs.filter(g => {
      if (activeTab === 'variance') {
        return Math.abs(g.variancePercent || 0) > 1.0;
      }
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.id.toLowerCase().includes(q) ||
        (g.supplierName && g.supplierName.toLowerCase().includes(q)) ||
        (g.qpoId && g.qpoId.toLowerCase().includes(q)) ||
        (g.approvalStatus && g.approvalStatus.toLowerCase().includes(q))
      );
    });
  }, [tradeGRNs, activeTab, searchQuery]);

  const columns = [
    {
      header: 'GRN No.',
      accessor: 'id',
      width: '110px',
      render: r => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</span>
    },
    { header: 'Date', accessor: 'date', width: '100px' },
    {
      header: 'Linked QPO',
      accessor: 'qpoId',
      width: '100px',
      render: r => <span style={{ fontFamily: 'monospace' }}>{r.qpoId}</span>
    },
    {
      header: 'Quarry / Supplier',
      accessor: 'supplierName',
      render: r => <strong>{r.supplierName}</strong>
    },
    {
      header: 'Gross (Kg)',
      accessor: 'grossWeightKg',
      align: 'right',
      render: r => `${Number(r.grossWeightKg || 0).toLocaleString()}`
    },
    {
      header: 'Tare (Kg)',
      accessor: 'tareWeightKg',
      align: 'right',
      render: r => `${Number(r.tareWeightKg || 0).toLocaleString()}`
    },
    {
      header: 'Net (Kg)',
      accessor: 'netWeightKg',
      align: 'right',
      render: r => <strong style={{ color: 'var(--ink)' }}>{Number(r.netWeightKg || 0).toLocaleString()}</strong>
    },
    {
      header: 'Challan Wt',
      accessor: 'challanWeightKg',
      align: 'right',
      render: r => `${Number(r.challanWeightKg || 0).toLocaleString()}`
    },
    {
      header: 'Variance %',
      accessor: 'variancePercent',
      align: 'center',
      render: r => {
        const v = r.variancePercent || 0;
        return (
          <span style={{
            fontWeight: 700,
            color: Math.abs(v) > (r.toleranceThreshold || 1.5) ? '#b91c1c' : '#047857'
          }}>
            {v > 0 ? `+${v}%` : `${v}%`}
          </span>
        );
      }
    },
    {
      header: 'Approval Status',
      accessor: 'approvalStatus',
      width: '130px',
      render: r => (
        <span style={{
          fontSize: '11.5px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '12px',
          background: r.approvalStatus === 'Accepted' ? '#dcfce7' : '#fee2e2',
          color: r.approvalStatus === 'Accepted' ? '#166534' : '#991b1b'
        }}>
          {r.approvalStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '90px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'View GRN Details',
            icon: Eye,
            onClick: () => setViewItem(r)
          }
        ];
        if (r.approvalStatus === 'Pending Approval') {
          items.push(
            { divider: true },
            {
              label: 'Approve Variance',
              icon: CheckCircle2,
              onClick: () => handleApproveVariance(r.id)
            }
          );
        }
        return <ActionDropdown items={items} />;
      }
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'grn':
        return 'Goods Receipt Notes (GRN)';
      case 'live-weights':
        return 'Live Weighbridge Receipts';
      case 'block-check':
        return 'Block Physical Verification & Quality Checks';
      case 'variance':
        return 'Weight & Measurement Variance Log';
      default:
        return 'Material Receipts';
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
        {(activeTab === 'grn' || activeTab === 'live-weights') && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>New GRN</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pageSize={10}
        hoverable
      />

      {/* View Details Drawer */}
      <ViewDrawer
        isOpen={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        title={`GRN Details: ${viewItem?.id || ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            {viewItem?.approvalStatus === 'Pending Approval' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => { handleApproveVariance(viewItem.id); setViewItem(null); }}
              >
                Approve Variance Override
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewItem(null)}>
              Close
            </button>
          </div>
        }
      >
        {viewItem && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">GRN Number</label>
              <div className="detail-value" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {viewItem.id}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Approval Status</label>
              <div className="detail-value">
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: viewItem.approvalStatus === 'Accepted' ? '#dcfce7' : '#fee2e2',
                  color: viewItem.approvalStatus === 'Accepted' ? '#166534' : '#991b1b'
                }}>
                  {viewItem.approvalStatus}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Quarry PO</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.qpoId}
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Supplier / Quarry</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>
                {viewItem.supplierName}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gate Entry Number</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.gateEntry}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Weighbridge Ticket</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.weighbridgeTicket}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gross Weight (Kg)</label>
              <div className="detail-value">{viewItem.grossWeightKg} Kg</div>
            </div>

            <div className="form-group">
              <label className="form-label">Tare Weight (Kg)</label>
              <div className="detail-value">{viewItem.tareWeightKg} Kg</div>
            </div>

            <div className="form-group">
              <label className="form-label">Net Weight (Kg)</label>
              <div className="detail-value" style={{ fontWeight: 700, color: '#166534' }}>
                {viewItem.netWeightKg} Kg
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Challan Weight (Kg)</label>
              <div className="detail-value">{viewItem.challanWeightKg} Kg</div>
            </div>

            <div className="form-group">
              <label className="form-label">Weight Variance</label>
              <div className="detail-value" style={{
                fontWeight: 700,
                color: Math.abs(viewItem.variancePercent || 0) > (viewItem.toleranceThreshold || 1.5) ? '#b91c1c' : '#047857'
              }}>
                {viewItem.varianceKg} Kg ({viewItem.variancePercent}%)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tolerance Threshold</label>
              <div className="detail-value">±{viewItem.toleranceThreshold || 1.5}%</div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <div className="detail-value">{viewItem.remarks || 'No remarks recorded.'}</div>
            </div>
          </>
        )}
      </ViewDrawer>

      {/* Add Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Goods Receipt Note (GRN)"
        onSubmit={handleSubmit}
        submitLabel="Save GRN"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Linked Quarry PO</label>
          <select
            className="form-select"
            value={formState.qpoId}
            onChange={(e) => {
              const qId = e.target.value;
              const match = tradeQuarryPOs.find(q => q.id === qId);
              setFormState(p => ({
                ...p,
                qpoId: qId,
                supplierId: match?.supplierId || p.supplierId,
                supplierName: match?.supplierName || p.supplierName
              }));
            }}
          >
            {tradeQuarryPOs.map(q => (
              <option key={q.id} value={q.id}>{q.id} - {q.supplierName}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Supplier / Quarry</label>
          <input
            type="text"
            className="form-input"
            value={formState.supplierName}
            readOnly
            style={{ background: 'var(--surface-sunken)' }}
            placeholder="Select Quarry / Supplier"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Gate Entry Number</label>
          <input
            type="text"
            className="form-input"
            value={formState.gateEntry}
            onChange={e => setFormState(p => ({ ...p, gateEntry: e.target.value }))}
            placeholder="e.g. GE-2026-0041"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Weighbridge Ticket</label>
          <input
            type="text"
            className="form-input"
            value={formState.weighbridgeTicket}
            onChange={e => setFormState(p => ({ ...p, weighbridgeTicket: e.target.value }))}
            placeholder="e.g. WB-2026-9012"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Gross Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            value={formState.grossWeightKg}
            onChange={e => setFormState(p => ({ ...p, grossWeightKg: Number(e.target.value) }))}
            placeholder="e.g. 42500"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tare Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            value={formState.tareWeightKg}
            onChange={e => setFormState(p => ({ ...p, tareWeightKg: Number(e.target.value) }))}
            placeholder="e.g. 14200"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Challan Weight (Kg)</label>
          <input
            type="number"
            className="form-input"
            value={formState.challanWeightKg}
            onChange={e => setFormState(p => ({ ...p, challanWeightKg: Number(e.target.value) }))}
            placeholder="e.g. 28000"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tolerance Threshold (%)</label>
          <input
            type="number"
            step="0.1"
            className="form-input"
            value={formState.toleranceThreshold}
            onChange={e => setFormState(p => ({ ...p, toleranceThreshold: Number(e.target.value) }))}
            placeholder="1.5"
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Remarks</label>
          <textarea
            className="form-textarea"
            rows="2"
            value={formState.remarks}
            onChange={e => setFormState(p => ({ ...p, remarks: e.target.value }))}
            placeholder="Enter remarks or arrival notes..."
          />
        </div>
      </FormDrawer>
    </div>
  );
}
