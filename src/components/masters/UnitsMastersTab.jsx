import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function UnitsMastersTab({ activeSubTab = 'units' }) {
  const {
    units = [], setUnits,
    unitConversions = [], setUnitConversions,
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
    if (activeSubTab === 'units') nextCode = `UNT-${String(units.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'conversions') nextCode = `CNV-${String(unitConversions.length + 1).padStart(4, '0')}`;

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
    if (activeSubTab === 'units') {
      if (editingItem) setUnits(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setUnits(prev => [{ id: formState.code || `UNT-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'conversions') {
      if (editingItem) setUnitConversions(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setUnitConversions(prev => [{ id: formState.code || `CNV-${Date.now()}`, ...formState }, ...prev]);
    }

    if (showToast) showToast('Master updated successfully');
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Master Item',
      message: `Archive "${item.name || item.code || item.fromUnit}"?`,
      onConfirm: () => {
        const toggle = (list, setter) => setter(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
        if (activeSubTab === 'units') toggle(units, setUnits);
        else if (activeSubTab === 'conversions') toggle(unitConversions, setUnitConversions);
      }
    });
  };

  let currentData = units;
  let currentColumns = [];
  let exportTitle = 'Units';

  if (activeSubTab === 'units') {
    currentData = units;
    exportTitle = 'Measurement Units';
    currentColumns = [
      { header: 'Unit Code', accessor: 'code', width: '120px' },
      { header: 'Unit Name', accessor: 'name' },
      { header: 'Unit Type', accessor: 'type', width: '110px' },
      { header: 'Decimals', accessor: 'decimals', width: '90px', align: 'center' },
      { header: 'Status', accessor: 'status', width: '90px', render: r => <StatusBadge status={r.status} /> }
    ];
  } else if (activeSubTab === 'conversions') {
    currentData = unitConversions;
    exportTitle = 'Unit Conversions';
    currentColumns = [
      { header: 'From Unit', accessor: 'fromUnit', width: '120px' },
      { header: 'To Unit', accessor: 'toUnit', width: '120px' },
      { header: 'Conversion Factor', accessor: 'factor', align: 'right', render: r => <strong>1 {r.fromUnit} = {r.factor} {r.toUnit}</strong> },
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
    'units': 'Units of Measurement',
    'conversions': 'Unit Conversions'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Units Masters'}
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
            <span>Add {tabTitles[activeSubTab] ? tabTitles[activeSubTab].replace(/s$/, '') : 'Record'}</span>
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
          {activeSubTab === 'units' && (
            <>
              <div className="form-group">
                <label className="form-label">Unit Code</label>
                <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="Sq.Ft / Ton" />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Name</label>
                <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Full unit name" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={formState.type || 'Area'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Area">Area</option>
                  <option value="Weight">Weight</option>
                  <option value="Volume">Volume</option>
                  <option value="Count">Count</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Decimal Places</label>
                <input type="number" className="form-input" value={formState.decimals ?? ''} onChange={e => setFormState(p => ({ ...p, decimals: Number(e.target.value) }))} placeholder="2" />
              </div>
            </>
          )}

          {activeSubTab === 'conversions' && (
            <>
              <div className="form-group">
                <label className="form-label">From Unit</label>
                <input type="text" className="form-input" value={formState.fromUnit || ''} onChange={e => setFormState(p => ({ ...p, fromUnit: e.target.value }))} placeholder="e.g. Sq.Ft" />
              </div>
              <div className="form-group">
                <label className="form-label">To Unit</label>
                <input type="text" className="form-input" value={formState.toUnit || ''} onChange={e => setFormState(p => ({ ...p, toUnit: e.target.value }))} placeholder="e.g. Sq.M" />
              </div>
              <div className="form-group">
                <label className="form-label">Conversion Factor</label>
                <input type="number" step="0.0001" className="form-input" value={formState.factor ?? ''} onChange={e => setFormState(p => ({ ...p, factor: Number(e.target.value) }))} placeholder="0.0929" />
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
