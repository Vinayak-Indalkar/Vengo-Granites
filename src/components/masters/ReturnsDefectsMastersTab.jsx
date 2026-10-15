import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function ReturnsDefectsMastersTab({ activeSubTab = 'return-reasons' }) {
  const {
    returnReasons = [], setReturnReasons,
    noteReasons = [], setNoteReasons,
    scrapReasons = [], setScrapReasons,
    rejectionReasons = [], setRejectionReasons,
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
    if (activeSubTab === 'return-reasons') nextCode = `RR-${String(returnReasons.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'note-reasons') nextCode = `NR-${String(noteReasons.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'scrap-reasons') nextCode = `SR-${String(scrapReasons.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'rejection-reasons') nextCode = `RJR-${String(rejectionReasons.length + 1).padStart(4, '0')}`;

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
    if (activeSubTab === 'return-reasons') {
      if (editingItem) setReturnReasons(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setReturnReasons(prev => [{ id: formState.code || `RR-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'note-reasons') {
      if (editingItem) setNoteReasons(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setNoteReasons(prev => [{ id: formState.code || `NR-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'scrap-reasons') {
      if (editingItem) setScrapReasons(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setScrapReasons(prev => [{ id: formState.code || `SR-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'rejection-reasons') {
      if (editingItem) setRejectionReasons(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setRejectionReasons(prev => [{ id: formState.code || `RJR-${Date.now()}`, ...formState }, ...prev]);
    }

    if (showToast) showToast('Master updated successfully');
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Master Item',
      message: `Archive "${item.name || item.code}"?`,
      onConfirm: () => {
        const toggle = (list, setter) => setter(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
        if (activeSubTab === 'return-reasons') toggle(returnReasons, setReturnReasons);
        else if (activeSubTab === 'note-reasons') toggle(noteReasons, setNoteReasons);
        else if (activeSubTab === 'scrap-reasons') toggle(scrapReasons, setScrapReasons);
        else if (activeSubTab === 'rejection-reasons') toggle(rejectionReasons, setRejectionReasons);
      }
    });
  };

  let currentData = returnReasons;
  let currentColumns = [];
  let exportTitle = 'Return Reasons';

  if (activeSubTab === 'return-reasons') {
    currentData = returnReasons;
    exportTitle = 'Return Reasons';
    currentColumns = [
      { key: 'code', title: 'Code', width: '110px' },
      { key: 'name', title: 'Return Reason' },
      { key: 'restock', title: 'Allow Restock', width: '110px' },
      { key: 'defaultAction', title: 'Default Action', width: '120px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'note-reasons') {
    currentData = noteReasons;
    exportTitle = 'Note Reasons';
    currentColumns = [
      { key: 'code', title: 'Code', width: '110px' },
      { key: 'name', title: 'Reason Description' },
      { key: 'type', title: 'Note Type', width: '100px' },
      { key: 'taxTreatment', title: 'Tax Treatment' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'scrap-reasons') {
    currentData = scrapReasons;
    exportTitle = 'Scrap Reasons';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Scrap Cause' },
      { key: 'approvalNeeded', title: 'Approval Needed', width: '130px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'rejection-reasons') {
    currentData = rejectionReasons;
    exportTitle = 'Rejection Reasons';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Rejection Description' },
      { key: 'approvalNeeded', title: 'Approval Needed', width: '130px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
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
      key: 'actions',
      title: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: 'Edit', icon: Edit2, onClick: () => handleOpenEdit(row) },
            { label: row.status === 'Active' ? 'Archive' : 'Restore', icon: row.status === 'Active' ? XCircle : CheckCircle2, onClick: () => handleDeletePrompt(row) }
          ]}
        />
      )
    }
  ];

  const tabTitles = {
    'return-reasons': 'Return Reasons',
    'note-reasons': 'Credit / Debit Note Reasons',
    'scrap-reasons': 'Scrap Reasons',
    'rejection-reasons': 'Rejection Reasons'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Returns & Defects Masters'}
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
            <span>Add Reason</span>
          </button>
        </div>
      </div>

      <DataTable columns={fullColumns} data={filtered} pageSize={10} hoverable />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Record' : 'Add Record'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Code</label>
            <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="Code" />
          </div>

          <div className="form-group">
            <label className="form-label">Name / Description</label>
            <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Enter reason description" />
          </div>

          {activeSubTab === 'return-reasons' && (
            <>
              <div className="form-group">
                <label className="form-label">Allow Restock</label>
                <select className="form-select" value={formState.restock || 'Yes'} onChange={e => setFormState(p => ({ ...p, restock: e.target.value }))}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Action</label>
                <select className="form-select" value={formState.defaultAction || 'Credit'} onChange={e => setFormState(p => ({ ...p, defaultAction: e.target.value }))}>
                  <option value="Credit">Credit</option>
                  <option value="Replace">Replace</option>
                  <option value="Scrap">Scrap</option>
                </select>
              </div>
            </>
          )}

          {activeSubTab === 'note-reasons' && (
            <>
              <div className="form-group">
                <label className="form-label">Note Type</label>
                <select className="form-select" value={formState.type || 'Credit'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tax Treatment</label>
                <input type="text" className="form-input" value={formState.taxTreatment || ''} onChange={e => setFormState(p => ({ ...p, taxTreatment: e.target.value }))} placeholder="e.g. Adjust Output GST" />
              </div>
            </>
          )}

          {(activeSubTab === 'scrap-reasons' || activeSubTab === 'rejection-reasons') && (
            <div className="form-group">
              <label className="form-label">Approval Needed</label>
              <select className="form-select" value={formState.approvalNeeded || 'Yes'} onChange={e => setFormState(p => ({ ...p, approvalNeeded: e.target.value }))}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
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
