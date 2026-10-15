import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function CommercialMastersTab({ activeSubTab = 'payment-terms' }) {
  const {
    paymentTerms = [], setPaymentTerms,
    paymentModes = [], setPaymentModes,
    currencies = [], setCurrencies,
    discountTypes = [], setDiscountTypes,
    otherCharges = [], setOtherCharges,
    creditPolicies = [], setCreditPolicies,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Form states
  const [formState, setFormState] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    let nextCode = '';
    if (activeSubTab === 'payment-terms') nextCode = `PT-${String(paymentTerms.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'payment-modes') nextCode = `PM-${String(paymentModes.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'currencies') nextCode = `CUR-${String(currencies.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'discount-types') nextCode = `DSC-${String(discountTypes.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'other-charges') nextCode = `CHG-${String(otherCharges.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'credit-policy') nextCode = `CP-${String(creditPolicies.length + 1).padStart(4, '0')}`;

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
    if (activeSubTab === 'payment-terms') {
      if (editingItem) setPaymentTerms(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setPaymentTerms(prev => [{ id: formState.code || `PT-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'payment-modes') {
      if (editingItem) setPaymentModes(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setPaymentModes(prev => [{ id: formState.code || `PM-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'currencies') {
      if (editingItem) setCurrencies(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setCurrencies(prev => [{ id: formState.code || `CUR-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'discount-types') {
      if (editingItem) setDiscountTypes(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setDiscountTypes(prev => [{ id: formState.code || `DSC-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'other-charges') {
      if (editingItem) setOtherCharges(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setOtherCharges(prev => [{ id: formState.code || `CHG-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'credit-policy') {
      if (editingItem) setCreditPolicies(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setCreditPolicies(prev => [{ id: formState.code || `CP-${Date.now()}`, ...formState }, ...prev]);
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
        if (activeSubTab === 'payment-terms') toggle(paymentTerms, setPaymentTerms);
        else if (activeSubTab === 'payment-modes') toggle(paymentModes, setPaymentModes);
        else if (activeSubTab === 'currencies') toggle(currencies, setCurrencies);
        else if (activeSubTab === 'discount-types') toggle(discountTypes, setDiscountTypes);
        else if (activeSubTab === 'other-charges') toggle(otherCharges, setOtherCharges);
        else if (activeSubTab === 'credit-policy') toggle(creditPolicies, setCreditPolicies);
      }
    });
  };

  // Select dataset & columns
  let currentData = paymentTerms;
  let currentColumns = [];
  let exportTitle = 'Payment Terms';

  if (activeSubTab === 'payment-terms') {
    currentData = paymentTerms;
    exportTitle = 'Payment Terms';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Name' },
      { key: 'days', title: 'Days', width: '80px', align: 'center' },
      { key: 'graceDays', title: 'Grace Days', width: '90px', align: 'center' },
      { key: 'description', title: 'Description' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'payment-modes') {
    currentData = paymentModes;
    exportTitle = 'Payment Modes';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Mode Name' },
      { key: 'requiresReference', title: 'Requires Ref', width: '110px' },
      { key: 'linkedBankAccount', title: 'Linked Bank Account' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'currencies') {
    currentData = currencies;
    exportTitle = 'Currencies';
    currentColumns = [
      { key: 'code', title: 'Code', width: '90px' },
      { key: 'name', title: 'Currency Name' },
      { key: 'symbol', title: 'Symbol', width: '70px', align: 'center' },
      { key: 'exchangeRate', title: 'Exchange Rate (Base INR)', align: 'right' },
      { key: 'rateDate', title: 'Rate Date', width: '110px' },
      { key: 'isBase', title: 'Base Currency', width: '110px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'discount-types') {
    currentData = discountTypes;
    exportTitle = 'Discount Types';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Name' },
      { key: 'method', title: 'Method', width: '100px' },
      { key: 'defaultValue', title: 'Default Value', align: 'right' },
      { key: 'appliesTo', title: 'Applies To', width: '110px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'other-charges') {
    currentData = otherCharges;
    exportTitle = 'Other Charges';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Charge Name' },
      { key: 'type', title: 'Type', width: '90px' },
      { key: 'defaultValue', title: 'Default Value', align: 'right' },
      { key: 'taxRate', title: 'Tax %', width: '80px', align: 'center' },
      { key: 'appliesTo', title: 'Applies To', width: '100px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'credit-policy') {
    currentData = creditPolicies;
    exportTitle = 'Credit Policy';
    currentColumns = [
      { key: 'code', title: 'Code', width: '120px' },
      { key: 'name', title: 'Policy Name' },
      { key: 'defaultCreditLimit', title: 'Default Credit Limit', align: 'right', render: v => `₹${Number(v).toLocaleString()}` },
      { key: 'defaultPaymentDays', title: 'Payment Days', width: '100px', align: 'center' },
      { key: 'graceDays', title: 'Grace Days', width: '90px', align: 'center' },
      { key: 'autoBlockOnOverdue', title: 'Auto-Block', width: '90px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  }

  // Filtered
  const filtered = useMemo(() => {
    return currentData.filter(item => {
      const q = searchQuery.toLowerCase();
      return Object.values(item).some(v => String(v).toLowerCase().includes(q));
    });
  }, [currentData, searchQuery]);

  // Action column
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
    'payment-terms': 'Payment Terms',
    'payment-modes': 'Payment Modes',
    'currencies': 'Currencies',
    'discount-types': 'Discount Types',
    'other-charges': 'Other Charges',
    'credit-policy': 'Credit Policy'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Commercial Masters'}
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

      {/* Main DataTable */}
      <DataTable columns={fullColumns} data={filtered} pageSize={10} hoverable />

      {/* FormDrawer */}
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
            <label className="form-label">Name</label>
            <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Enter name" />
          </div>

          {activeSubTab === 'payment-terms' && (
            <>
              <div className="form-group">
                <label className="form-label">Days</label>
                <input type="number" className="form-input" value={formState.days ?? ''} onChange={e => setFormState(p => ({ ...p, days: Number(e.target.value) }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Grace Days</label>
                <input type="number" className="form-input" value={formState.graceDays ?? ''} onChange={e => setFormState(p => ({ ...p, graceDays: Number(e.target.value) }))} placeholder="0" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <input type="text" className="form-input" value={formState.description || ''} onChange={e => setFormState(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
              </div>
            </>
          )}

          {activeSubTab === 'payment-modes' && (
            <>
              <div className="form-group">
                <label className="form-label">Requires Reference</label>
                <select className="form-select" value={formState.requiresReference || 'No'} onChange={e => setFormState(p => ({ ...p, requiresReference: e.target.value }))}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Linked Bank Account</label>
                <input type="text" className="form-input" value={formState.linkedBankAccount || ''} onChange={e => setFormState(p => ({ ...p, linkedBankAccount: e.target.value }))} placeholder="Select account" />
              </div>
            </>
          )}

          {activeSubTab === 'currencies' && (
            <>
              <div className="form-group">
                <label className="form-label">Symbol</label>
                <input type="text" className="form-input" value={formState.symbol || ''} onChange={e => setFormState(p => ({ ...p, symbol: e.target.value }))} placeholder="₹ / $ / €" />
              </div>
              <div className="form-group">
                <label className="form-label">Exchange Rate (Base INR)</label>
                <input type="number" step="0.01" className="form-input" value={formState.exchangeRate ?? ''} onChange={e => setFormState(p => ({ ...p, exchangeRate: Number(e.target.value) }))} placeholder="1.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Rate Date</label>
                <input type="date" className="form-input" value={formState.rateDate || ''} onChange={e => setFormState(p => ({ ...p, rateDate: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label className="form-label">Is Base</label>
                <select className="form-select" value={formState.isBase || 'No'} onChange={e => setFormState(p => ({ ...p, isBase: e.target.value }))}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </>
          )}

          {activeSubTab === 'discount-types' && (
            <>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select className="form-select" value={formState.method || 'Percent'} onChange={e => setFormState(p => ({ ...p, method: e.target.value }))}>
                  <option value="Percent">Percent</option>
                  <option value="Amount">Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Value</label>
                <input type="number" className="form-input" value={formState.defaultValue ?? ''} onChange={e => setFormState(p => ({ ...p, defaultValue: Number(e.target.value) }))} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Applies To</label>
                <select className="form-select" value={formState.appliesTo || 'Invoice'} onChange={e => setFormState(p => ({ ...p, appliesTo: e.target.value }))}>
                  <option value="Invoice">Invoice</option>
                  <option value="Line">Line</option>
                </select>
              </div>
            </>
          )}

          {activeSubTab === 'other-charges' && (
            <>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={formState.type || 'Fixed'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Fixed">Fixed</option>
                  <option value="Percent">Percent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Default Value</label>
                <input type="number" className="form-input" value={formState.defaultValue ?? ''} onChange={e => setFormState(p => ({ ...p, defaultValue: Number(e.target.value) }))} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input type="number" className="form-input" value={formState.taxRate ?? ''} onChange={e => setFormState(p => ({ ...p, taxRate: Number(e.target.value) }))} placeholder="18" />
              </div>
              <div className="form-group">
                <label className="form-label">Applies To</label>
                <select className="form-select" value={formState.appliesTo || 'Invoice'} onChange={e => setFormState(p => ({ ...p, appliesTo: e.target.value }))}>
                  <option value="Invoice">Invoice</option>
                  <option value="PO">PO</option>
                </select>
              </div>
            </>
          )}

          {activeSubTab === 'credit-policy' && (
            <>
              <div className="form-group">
                <label className="form-label">Default Credit Limit</label>
                <input type="number" className="form-input" value={formState.defaultCreditLimit ?? ''} onChange={e => setFormState(p => ({ ...p, defaultCreditLimit: Number(e.target.value) }))} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Default Payment Days</label>
                <input type="number" className="form-input" value={formState.defaultPaymentDays ?? ''} onChange={e => setFormState(p => ({ ...p, defaultPaymentDays: Number(e.target.value) }))} placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Grace Days</label>
                <input type="number" className="form-input" value={formState.graceDays ?? ''} onChange={e => setFormState(p => ({ ...p, graceDays: Number(e.target.value) }))} placeholder="5" />
              </div>
              <div className="form-group">
                <label className="form-label">Auto-Block on Overdue</label>
                <select className="form-select" value={formState.autoBlockOnOverdue || 'Yes'} onChange={e => setFormState(p => ({ ...p, autoBlockOnOverdue: e.target.value }))}>
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
