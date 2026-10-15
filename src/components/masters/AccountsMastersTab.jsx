import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function AccountsMastersTab({ activeSubTab = 'bank-accounts' }) {
  const {
    bankAccounts = [], setBankAccounts,
    accountHeads = [], setAccountHeads,
    financialYears = [], setFinancialYears,
    documentNumbering = [], setDocumentNumbering,
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
    if (activeSubTab === 'bank-accounts') nextCode = `BA-${String(bankAccounts.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'account-heads') nextCode = `AH-${String(accountHeads.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'financial-years') nextCode = `FY-2027-28`;
    else if (activeSubTab === 'document-numbering') nextCode = `DOC-${String(documentNumbering.length + 1).padStart(2, '0')}`;

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
    if (activeSubTab === 'bank-accounts') {
      if (editingItem) setBankAccounts(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setBankAccounts(prev => [{ id: formState.code || `BA-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'account-heads') {
      if (editingItem) setAccountHeads(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setAccountHeads(prev => [{ id: formState.code || `AH-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'financial-years') {
      if (editingItem) setFinancialYears(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setFinancialYears(prev => [{ id: formState.name || `FY-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'document-numbering') {
      const padding = Number(formState.padding) || 4;
      const nextNum = Number(formState.nextNumber) || 1;
      const sample = `${formState.prefix || 'DOC'}-${String(nextNum).padStart(padding, '0')}`;
      const itemToSave = { ...formState, padding, nextNumber: nextNum, sample };
      if (editingItem) setDocumentNumbering(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemToSave } : i));
      else setDocumentNumbering(prev => [{ id: `DOC-${Date.now()}`, ...itemToSave }, ...prev]);
    }

    if (showToast) showToast('Master updated successfully');
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Master Item',
      message: `Archive "${item.name || item.accountName || item.docType || item.code}"?`,
      onConfirm: () => {
        const toggle = (list, setter) => setter(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
        if (activeSubTab === 'bank-accounts') toggle(bankAccounts, setBankAccounts);
        else if (activeSubTab === 'account-heads') toggle(accountHeads, setAccountHeads);
        else if (activeSubTab === 'financial-years') toggle(financialYears, setFinancialYears);
        else if (activeSubTab === 'document-numbering') toggle(documentNumbering, setDocumentNumbering);
      }
    });
  };

  let currentData = bankAccounts;
  let currentColumns = [];
  let exportTitle = 'Bank Accounts';

  if (activeSubTab === 'bank-accounts') {
    currentData = bankAccounts;
    exportTitle = 'Bank Accounts';
    currentColumns = [
      { key: 'code', title: 'Code', width: '100px' },
      { key: 'accountName', title: 'Account Name' },
      { key: 'bankName', title: 'Bank Name' },
      { key: 'accountNumber', title: 'Account Number', render: v => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
      { key: 'ifscSwift', title: 'IFSC / SWIFT', width: '120px' },
      { key: 'openingBalance', title: 'Opening (₹)', align: 'right', render: v => `₹${Number(v || 0).toLocaleString()}` },
      { key: 'currentBalance', title: 'Balance (₹)', align: 'right', render: v => <strong>₹{Number(v || 0).toLocaleString()}</strong> },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'account-heads') {
    currentData = accountHeads;
    exportTitle = 'Account Heads';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Account Head Name' },
      { key: 'type', title: 'Classification Type', width: '130px' },
      { key: 'parentHead', title: 'Parent Head', render: v => v || 'Root' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'financial-years') {
    currentData = financialYears;
    exportTitle = 'Financial Years';
    currentColumns = [
      { key: 'name', title: 'Financial Year' },
      { key: 'startDate', title: 'Start Date', width: '110px' },
      { key: 'endDate', title: 'End Date', width: '110px' },
      { key: 'lockDate', title: 'Lock Date', width: '110px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'document-numbering') {
    currentData = documentNumbering;
    exportTitle = 'Document Numbering';
    currentColumns = [
      { key: 'docType', title: 'Document Type' },
      { key: 'prefix', title: 'Prefix', width: '80px', align: 'center' },
      { key: 'nextNumber', title: 'Next Number', width: '100px', align: 'center' },
      { key: 'padding', title: 'Padding', width: '80px', align: 'center' },
      { key: 'resetYearly', title: 'Reset Yearly', width: '110px', align: 'center' },
      { key: 'sample', title: 'Sample Format', width: '120px', render: v => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> }
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
    'bank-accounts': 'Bank Accounts',
    'accountHeads': 'Account Heads',
    'financial-years': 'Financial Years',
    'document-numbering': 'Document Numbering'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Accounts Masters'}
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
          {activeSubTab === 'bank-accounts' && (
            <>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="BA-0001" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input type="text" className="form-input" value={formState.accountName || ''} onChange={e => setFormState(p => ({ ...p, accountName: e.target.value }))} placeholder="Enter account name" />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input type="text" className="form-input" value={formState.bankName || ''} onChange={e => setFormState(p => ({ ...p, bankName: e.target.value }))} placeholder="Bank Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input type="text" className="form-input" value={formState.accountNumber || ''} onChange={e => setFormState(p => ({ ...p, accountNumber: e.target.value }))} placeholder="Account Number" />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC / SWIFT</label>
                <input type="text" className="form-input" value={formState.ifscSwift || ''} onChange={e => setFormState(p => ({ ...p, ifscSwift: e.target.value }))} placeholder="IFSC / SWIFT" />
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input type="text" className="form-input" value={formState.branch || ''} onChange={e => setFormState(p => ({ ...p, branch: e.target.value }))} placeholder="Branch Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Opening Balance</label>
                <input type="number" className="form-input" value={formState.openingBalance ?? ''} onChange={e => setFormState(p => ({ ...p, openingBalance: Number(e.target.value) }))} placeholder="0.00" />
              </div>
            </>
          )}

          {activeSubTab === 'account-heads' && (
            <>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="AH-0001" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Head Name</label>
                <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Head Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={formState.type || 'Income'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Parent Head</label>
                <input type="text" className="form-input" value={formState.parentHead || ''} onChange={e => setFormState(p => ({ ...p, parentHead: e.target.value }))} placeholder="Optional parent" />
              </div>
            </>
          )}

          {activeSubTab === 'financial-years' && (
            <>
              <div className="form-group">
                <label className="form-label">Financial Year Name</label>
                <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="FY 2026 - 2027" />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={formState.startDate || ''} onChange={e => setFormState(p => ({ ...p, startDate: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={formState.endDate || ''} onChange={e => setFormState(p => ({ ...p, endDate: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label className="form-label">Lock Date</label>
                <input type="date" className="form-input" value={formState.lockDate || ''} onChange={e => setFormState(p => ({ ...p, lockDate: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
            </>
          )}

          {activeSubTab === 'document-numbering' && (
            <>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <input type="text" className="form-input" value={formState.docType || ''} onChange={e => setFormState(p => ({ ...p, docType: e.target.value }))} placeholder="e.g. Sales Order" />
              </div>
              <div className="form-group">
                <label className="form-label">Prefix</label>
                <input type="text" className="form-input" value={formState.prefix || ''} onChange={e => setFormState(p => ({ ...p, prefix: e.target.value }))} placeholder="SO" />
              </div>
              <div className="form-group">
                <label className="form-label">Next Number</label>
                <input type="number" className="form-input" value={formState.nextNumber ?? ''} onChange={e => setFormState(p => ({ ...p, nextNumber: Number(e.target.value) }))} placeholder="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Padding</label>
                <input type="number" className="form-input" value={formState.padding ?? ''} onChange={e => setFormState(p => ({ ...p, padding: Number(e.target.value) }))} placeholder="4" />
              </div>
              <div className="form-group">
                <label className="form-label">Reset Yearly</label>
                <select className="form-select" value={formState.resetYearly || 'Yes'} onChange={e => setFormState(p => ({ ...p, resetYearly: e.target.value }))}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
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
