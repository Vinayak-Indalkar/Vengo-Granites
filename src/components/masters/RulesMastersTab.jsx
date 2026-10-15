import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function RulesMastersTab({ activeSubTab = 'approval-rules' }) {
  const {
    approvalRules = [], setApprovalRules,
    varianceTolerances = [], setVarianceTolerances,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [formState, setFormState] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    let nextCode = '';
    if (activeSubTab === 'approval-rules') nextCode = `AR-${String(approvalRules.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'variance-tolerance') nextCode = `VT-${String(varianceTolerances.length + 1).padStart(4, '0')}`;

    setFormState({ code: nextCode, status: 'Active' });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormState({ ...item });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeSubTab === 'approval-rules') {
      if (editingItem) setApprovalRules(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setApprovalRules(prev => [{ id: formState.code || `AR-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'variance-tolerance') {
      if (editingItem) setVarianceTolerances(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setVarianceTolerances(prev => [{ id: formState.code || `VT-${Date.now()}`, ...formState }, ...prev]);
    }

    if (showToast) showToast('Master updated successfully');
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Master Item',
      message: `Archive rule "${item.docType || item.scope || item.code}"?`,
      onConfirm: () => {
        const toggle = (list, setter) => setter(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
        if (activeSubTab === 'approval-rules') toggle(approvalRules, setApprovalRules);
        else if (activeSubTab === 'variance-tolerance') toggle(varianceTolerances, setVarianceTolerances);
      }
    });
  };

  let currentData = approvalRules;
  let currentColumns = [];
  let exportTitle = 'Approval Rules';

  if (activeSubTab === 'approval-rules') {
    currentData = approvalRules;
    exportTitle = 'Approval Threshold Rules';
    currentColumns = [
      { header: 'Document Type', accessor: 'docType' },
      { header: 'Amount Threshold (₹)', accessor: 'amountThreshold', align: 'right', render: r => `₹${Number(r.amountThreshold || 0).toLocaleString()}` },
      { header: 'Approver Role', accessor: 'approverRole' },
      { header: 'Status', accessor: 'status', width: '90px', render: r => <StatusBadge status={r.status} /> }
    ];
  } else if (activeSubTab === 'variance-tolerance') {
    currentData = varianceTolerances;
    exportTitle = 'Variance Tolerances';
    currentColumns = [
      { header: 'Scope', accessor: 'scope', width: '110px' },
      { header: 'Linked Subject / Entity', accessor: 'linkedRecord' },
      { header: 'Weight Tolerance %', accessor: 'toleranceWeightPercent', width: '150px', align: 'center', render: r => `${r.toleranceWeightPercent}%` },
      { header: 'Qty Tolerance %', accessor: 'toleranceQtyPercent', width: '150px', align: 'center', render: r => `${r.toleranceQtyPercent}%` },
      { header: 'Status', accessor: 'status', width: '90px', render: r => <StatusBadge status={r.status} /> }
    ];
  }

  const filtered = useMemo(() => {
    return currentData.filter(item => {
      const q = searchQuery.toLowerCase();
      return Object.values(item).some(v => String(v).toLowerCase().includes(q));
    });
  }, [currentData, searchQuery]);

  const fullColumns = [
    ...currentColumns,
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit', icon: Edit2, onClick: () => handleOpenEdit(r) },
            { label: r.status === 'Active' ? 'Archive' : 'Restore', icon: r.status === 'Active' ? XCircle : CheckCircle2, onClick: () => handleDeletePrompt(r) }
          ]}
        />
      )
    }
  ];

  const tabTitles = {
    'approval-rules': 'Approval Rules',
    'variance-tolerance': 'Variance Tolerance Rules'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Rules Masters'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportToExcel(currentColumns, filtered, exportTitle)} title="Export to Excel">
            <FileSpreadsheet size={13} />
            <span>Excel</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportToPDF(currentColumns, filtered, exportTitle)} title="Print / PDF">
            <Printer size={13} />
            <span>PDF</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>Add Rule</span>
          </button>
        </div>
      </div>

      <DataTable columns={fullColumns} data={filtered} pageSize={10} hoverable />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Rule' : 'Add Rule'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {activeSubTab === 'approval-rules' && (
            <>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select className="form-select" value={formState.docType || 'Buyer PO'} onChange={e => setFormState(p => ({ ...p, docType: e.target.value }))}>
                  <option value="Buyer PO">Buyer PO</option>
                  <option value="Quarry PO">Quarry PO</option>
                  <option value="Credit Override">Credit Override</option>
                  <option value="GRN Variance">GRN Variance</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Debit Note">Debit Note</option>
                  <option value="Write-off">Write-off</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Threshold (₹)</label>
                <input type="number" className="form-input" value={formState.amountThreshold ?? ''} onChange={e => setFormState(p => ({ ...p, amountThreshold: Number(e.target.value) }))} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Approver Role</label>
                <input type="text" className="form-input" value={formState.approverRole || 'Supplier/Client Admin'} onChange={e => setFormState(p => ({ ...p, approverRole: e.target.value }))} placeholder="Approver Role" />
              </div>
            </>
          )}

          {activeSubTab === 'variance-tolerance' && (
            <>
              <div className="form-group">
                <label className="form-label">Scope</label>
                <select className="form-select" value={formState.scope || 'Default'} onChange={e => setFormState(p => ({ ...p, scope: e.target.value }))}>
                  <option value="Default">Default</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Stone Type">Stone Type</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Linked Record / Entity</label>
                <input type="text" className="form-input" value={formState.linkedRecord || ''} onChange={e => setFormState(p => ({ ...p, linkedRecord: e.target.value }))} placeholder="Entity name" />
              </div>
              <div className="form-group">
                <label className="form-label">Weight Tolerance %</label>
                <input type="number" step="0.1" className="form-input" value={formState.toleranceWeightPercent ?? ''} onChange={e => setFormState(p => ({ ...p, toleranceWeightPercent: Number(e.target.value) }))} placeholder="1.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Tolerance %</label>
                <input type="number" step="0.1" className="form-input" value={formState.toleranceQtyPercent ?? ''} onChange={e => setFormState(p => ({ ...p, toleranceQtyPercent: Number(e.target.value) }))} placeholder="1.0" />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formState.status || 'Active'} onChange={e => setFormState(p => ({ ...p, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog(p => ({ ...p, isOpen: false })); }}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
