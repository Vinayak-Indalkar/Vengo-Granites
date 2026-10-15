import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, FileSpreadsheet, Printer, CheckCircle2, XCircle, Route as RouteIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function QuarryPOList({ activeTab = 'open' }) {
  const navigate = useNavigate();
  const {
    tradeQuarryPOs = [],
    addQuarryPO,
    setTradeQuarryPOs,
    suppliers = [],
    stoneTypes = [],
    paymentTerms = [],
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [formState, setFormState] = useState({
    supplierId: '',
    supplierName: '',
    expectedDate: '',
    stoneTypeId: '',
    stoneName: '',
    expectedQty: 60,
    unit: 'Ton',
    rate: 14500,
    taxPercent: 5,
    paymentTerms: 'Net 30 Days (PT-0003)',
    status: 'Open',
    remarks: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultSup = suppliers[0] || { id: 'SUP-0001', name: 'Altissimo Quarries' };
    const defaultStone = stoneTypes[0] || { id: 'ST-001', name: 'Black Galaxy' };
    setFormState({
      supplierId: defaultSup.id || defaultSup.code,
      supplierName: defaultSup.name,
      expectedDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      stoneTypeId: defaultStone.id || defaultStone.code,
      stoneName: defaultStone.name,
      expectedQty: 70,
      unit: 'Ton',
      rate: 15000,
      taxPercent: 5,
      paymentTerms: 'Net 30 Days (PT-0003)',
      status: 'Open',
      remarks: ''
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (po) => {
    setEditingItem(po);
    setFormState({ ...po });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(formState.expectedQty) || 0;
    const rate = Number(formState.rate) || 0;
    const subtotal = qty * rate;
    const taxAmt = Math.round(subtotal * ((Number(formState.taxPercent) || 5) / 100));
    const totalAmount = subtotal + taxAmt;

    const supMatch = suppliers.find(s => s.id === formState.supplierId || s.code === formState.supplierId);
    const stoneMatch = stoneTypes.find(st => st.id === formState.stoneTypeId || st.code === formState.stoneTypeId);

    const payload = {
      ...formState,
      supplierName: supMatch?.name || formState.supplierName,
      stoneName: stoneMatch?.name || formState.stoneName,
      totalAmount
    };

    if (editingItem) {
      setTradeQuarryPOs(prev =>
        prev.map(p => p.id === editingItem.id ? { ...p, ...payload } : p)
      );
      if (showToast) showToast(`Quarry PO ${editingItem.id} updated.`);
    } else {
      const created = addQuarryPO(payload);
      if (showToast) showToast(`Quarry PO ${created.id} created successfully.`);
    }

    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const filteredPOs = useMemo(() => {
    return tradeQuarryPOs.filter(po => {
      if (activeTab === 'approvals' && po.status !== 'Pending Approval') return false;
      if (activeTab === 'open' && po.status !== 'Open') return false;
      if (activeTab === 'closed' && po.status !== 'Closed') return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        po.id.toLowerCase().includes(q) ||
        (po.supplierName && po.supplierName.toLowerCase().includes(q)) ||
        (po.stoneName && po.stoneName.toLowerCase().includes(q)) ||
        (po.status && po.status.toLowerCase().includes(q))
      );
    });
  }, [tradeQuarryPOs, activeTab, searchQuery]);

  const columns = [
    {
      header: 'QPO No.',
      accessor: 'id',
      width: '110px',
      render: r => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</span>
    },
    { header: 'Order Date', accessor: 'date', width: '100px' },
    {
      header: 'Quarry / Supplier',
      accessor: 'supplierName',
      render: r => <strong>{r.supplierName}</strong>
    },
    { header: 'Stone Spec', accessor: 'stoneName' },
    {
      header: 'Qty Ordered',
      accessor: 'expectedQty',
      align: 'right',
      render: r => `${r.expectedQty} ${r.unit || 'Ton'}`
    },
    {
      header: 'Rate / Unit',
      accessor: 'rate',
      align: 'right',
      render: r => `₹${Number(r.rate || 0).toLocaleString()}`
    },
    {
      header: 'Total (₹)',
      accessor: 'totalAmount',
      align: 'right',
      render: r => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span>
    },
    { header: 'Payment Terms', accessor: 'paymentTerms' },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => <StatusBadge status={r.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Stone Journey', icon: RouteIcon, onClick: () => navigate(`/stone-journey/${r.id}`) },
            { label: 'Edit QPO', icon: Edit2, onClick: () => handleOpenEdit(r) },
            {
              label: r.status === 'Open' ? 'Close QPO' : 'Re-open QPO',
              icon: r.status === 'Open' ? XCircle : CheckCircle2,
              onClick: () => {
                const nextSt = r.status === 'Open' ? 'Closed' : 'Open';
                setTradeQuarryPOs(p => p.map(x => x.id === r.id ? { ...x, status: nextSt } : x));
              }
            }
          ]}
        />
      )
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'open':
        return 'Open Quarry Purchase Orders';
      case 'approvals':
        return 'Quarry Purchase Orders Awaiting Approval';
      case 'closed':
        return 'Closed Quarry Purchase Orders';
      case 'new-po':
        return 'New Quarry Purchase Order';
      default:
        return 'Quarry Purchase Orders';
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
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>New Quarry PO</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredPOs}
        pageSize={10}
        hoverable
      />

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingItem(null); }}
        title={editingItem ? `Edit Quarry PO: ${editingItem.id}` : 'Create Quarry PO'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setIsDrawerOpen(false); setEditingItem(null); }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Save PO
            </button>
          </div>
        }
      >
        <div className="form-group col-span-2">
          <label className="form-label">Supplier / Quarry</label>
          <select
            className="form-select"
            value={formState.supplierId}
            onChange={(e) => setFormState(p => ({ ...p, supplierId: e.target.value }))}
          >
            <option value="">Select Quarry / Supplier (Optional)</option>
            {suppliers.map(s => (
              <option key={s.id || s.code} value={s.id || s.code}>
                {s.name} ({s.code || s.id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Expected Date</label>
          <input
            type="date"
            className="form-input"
            value={formState.expectedDate || ''}
            onChange={(e) => setFormState(p => ({ ...p, expectedDate: e.target.value }))}
            placeholder="DD/MM/YYYY"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stone Spec</label>
          <select
            className="form-select"
            value={formState.stoneTypeId}
            onChange={(e) => setFormState(p => ({ ...p, stoneTypeId: e.target.value }))}
          >
            {stoneTypes.map(st => (
              <option key={st.id || st.code} value={st.id || st.code}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Unit of Measure</label>
          <select
            className="form-select"
            value={formState.unit}
            onChange={(e) => setFormState(p => ({ ...p, unit: e.target.value }))}
          >
            <option value="Ton">Ton</option>
            <option value="CBM">CBM</option>
            <option value="Blocks">Blocks</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Expected Quantity</label>
          <input
            type="number"
            className="form-input"
            value={formState.expectedQty}
            onChange={(e) => setFormState(p => ({ ...p, expectedQty: Number(e.target.value) }))}
            placeholder="Enter qty"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Rate (₹ / Unit)</label>
          <input
            type="number"
            className="form-input"
            value={formState.rate}
            onChange={(e) => setFormState(p => ({ ...p, rate: Number(e.target.value) }))}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tax Rate (%)</label>
          <input
            type="number"
            className="form-input"
            value={formState.taxPercent}
            onChange={(e) => setFormState(p => ({ ...p, taxPercent: Number(e.target.value) }))}
            placeholder="5"
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Payment Terms</label>
          <input
            type="text"
            className="form-input"
            value={formState.paymentTerms}
            onChange={(e) => setFormState(p => ({ ...p, paymentTerms: e.target.value }))}
            placeholder="e.g. Net 30 Days"
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Remarks</label>
          <textarea
            className="form-textarea"
            rows="2"
            value={formState.remarks || ''}
            onChange={(e) => setFormState(p => ({ ...p, remarks: e.target.value }))}
            placeholder="Enter remarks or arrival notes..."
          />
        </div>
      </FormDrawer>
    </div>
  );
}
