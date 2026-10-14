import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown, StatCard } from '../components/CommonComponents';
import { Plus, Check, DollarSign, ArrowDown, ArrowUp } from 'lucide-react';

// 1. Supplier Bills & 3-Way Match Screen
export function SupplierBillsScreen() {
  const { supplierBills, recordSupplierPayment, currentRole } = useApp();
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payData, setPayData] = useState({ amount: 0, mode: 'Wire Transfer', refNo: '', debitNoteDeducted: 0 });

  const isCompanyAdmin = currentRole === 'Company Admin';

  const openPay = (b) => {
    setSelectedBill(b);
    setPayData({ amount: b.amount, mode: 'Wire Transfer', refNo: `TXN-${Math.floor(Math.random() * 89999 + 10000)}`, debitNoteDeducted: 0 });
    setPayDrawerOpen(true);
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (selectedBill) {
      recordSupplierPayment({ billId: selectedBill.id, ...payData });
    }
    setPayDrawerOpen(false);
  };

  const columns = [
    { header: 'Bill ID', accessor: 'id' },
    { header: 'PO Ref', accessor: 'poId' },
    { header: 'GRN Ref', accessor: 'grnId' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Bill Amount ($)', accessor: 'amount', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.amount.toLocaleString()}</span> },
    { header: '3-Way Match', accessor: 'matchStatus', render: r => <span className="badge badge-emerald">PO = Wt = Bill</span> },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => isCompanyAdmin && r.status === 'Pending' ? (
        <ActionDropdown
          items={[
            {
              label: 'Pay Bill',
              onClick: () => openPay(r)
            }
          ]}
        />
      ) : null
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Supplier Bills & 3-Way Match</h1>
      </div>
      <DataTable columns={columns} data={supplierBills} emptyMessage="No supplier bills." />

      <FormDrawer
        isOpen={payDrawerOpen}
        onClose={() => setPayDrawerOpen(false)}
        title={`Pay Supplier: ${selectedBill?.supplier}`}
        onSubmit={handlePay}
        submitLabel="Disburse Payment"
      >
        <div className="form-group">
          <label className="form-label">Bill ID</label>
          <input className="form-input" disabled value={selectedBill?.id || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Amount ($)</label>
          <input type="number" className="form-input" placeholder="0.00" value={payData.amount} onChange={e => setPayData({ ...payData, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Debit Note Deduction ($)</label>
          <input type="number" className="form-input" placeholder="0.00" value={payData.debitNoteDeducted} onChange={e => setPayData({ ...payData, debitNoteDeducted: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <select className="form-select" value={payData.mode} onChange={e => setPayData({ ...payData, mode: e.target.value })}>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Letter of Credit">Letter of Credit (LC)</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bank Reference No</label>
          <input className="form-input" placeholder="e.g. TXN-88129" value={payData.refNo} onChange={e => setPayData({ ...payData, refNo: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 2. Supplier Payments Screen
export function SupplierPaymentsScreen() {
  const { supplierPayments } = useApp();

  const columns = [
    { header: 'Payment ID', accessor: 'id' },
    { header: 'Bill ID', accessor: 'billId' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'Paid ($)', accessor: 'amountPaid', render: r => <span className="table-num">${r.amountPaid.toLocaleString()}</span> },
    { header: 'Debit Deducted ($)', accessor: 'debitNoteDeducted', render: r => <span className="table-num">${r.debitNoteDeducted}</span> },
    { header: 'Mode', accessor: 'mode' },
    { header: 'Ref No', accessor: 'refNo' },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Supplier Payments</h1>
      </div>
      <DataTable columns={columns} data={supplierPayments} emptyMessage="No supplier payments." />
    </div>
  );
}

// 3. Customer Payments Screen
export function CustomerPaymentsScreen() {
  const { customerPayments, invoices, recordCustomerPayment } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ invoiceId: invoices[0]?.id || 'INV-2026-081', amount: 50000, mode: 'Wire Transfer', refNo: 'TXN-99881' });

  const handleSave = (e) => {
    e.preventDefault();
    recordCustomerPayment(formData);
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Receipt ID', accessor: 'id' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Amount ($)', accessor: 'amountReceived', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.amountReceived.toLocaleString()}</span> },
    { header: 'Mode', accessor: 'mode' },
    { header: 'Ref No', accessor: 'refNo' },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Customer Receipts</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>New Receipt</span>
        </button>
      </div>

      <DataTable columns={columns} data={customerPayments} emptyMessage="No customer payments." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Record Customer Payment"
        onSubmit={handleSave}
        submitLabel="Record Receipt"
      >
        <div className="form-group">
          <label className="form-label">Invoice</label>
          <select className="form-select" value={formData.invoiceId} onChange={e => setFormData({ ...formData, invoiceId: e.target.value })}>
            {invoices.map(i => <option key={i.id} value={i.id}>{i.id} - {i.customerName} (${i.totalAmount})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount Received ($)</label>
          <input type="number" className="form-input" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <select className="form-select" value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="NEFT">NEFT</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Reference No</label>
          <input className="form-input" placeholder="Enter transaction ref" value={formData.refNo} onChange={e => setFormData({ ...formData, refNo: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 4. Contractor Payments Screen
export function ContractorPaymentsScreen() {
  const { contractorPayments, personnel, recordContractorPayment } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ contractorId: 'CON-201', amount: 980, period: 'Week 41' });

  const contractors = personnel.filter(p => p.type === 'Contractor');

  const handleSave = (e) => {
    e.preventDefault();
    recordContractorPayment(formData);
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Payment ID', accessor: 'id' },
    { header: 'Contractor', accessor: 'contractorName' },
    { header: 'Disbursed ($)', accessor: 'amount', render: r => <span className="table-num">${r.amount.toLocaleString()}</span> },
    { header: 'Billing Period', accessor: 'period' },
    { header: 'Date', accessor: 'date' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Contractor Payments</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={14} />
          <span>New Contractor Payment</span>
        </button>
      </div>

      <DataTable columns={columns} data={contractorPayments} emptyMessage="No contractor disbursements." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Disburse Contractor Pay"
        onSubmit={handleSave}
        submitLabel="Disburse"
      >
        <div className="form-group">
          <label className="form-label">Contractor</label>
          <select className="form-select" value={formData.contractorId} onChange={e => setFormData({ ...formData, contractorId: e.target.value })}>
            {contractors.map(c => <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Amount ($)</label>
          <input type="number" className="form-input" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Billing Period</label>
          <input className="form-input" placeholder="e.g. Week 42" value={formData.period} onChange={e => setFormData({ ...formData, period: e.target.value })} />
        </div>
      </FormDrawer>
    </div>
  );
}

// 5. Ageing & Credit Screen
export function AgeingScreen() {
  const { customers } = useApp();

  const ageingData = customers.map(c => {
    const bal = c.balance || 0;
    return {
      id: c.id,
      name: c.name,
      creditLimit: c.creditLimit,
      balance: bal,
      current: Math.round(bal * 0.5),
      days30: Math.round(bal * 0.3),
      days60: Math.round(bal * 0.15),
      days90Plus: Math.round(bal * 0.05),
      isBlocked: c.isBlocked
    };
  });

  const columns = [
    { header: 'Customer', accessor: 'name' },
    { header: 'Credit Limit ($)', accessor: 'creditLimit', render: r => <span className="table-num">${r.creditLimit.toLocaleString()}</span> },
    { header: 'Total Due ($)', accessor: 'balance', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.balance.toLocaleString()}</span> },
    { header: 'Current ($)', accessor: 'current', render: r => <span className="table-num">${r.current.toLocaleString()}</span> },
    { header: '1-30 Days ($)', accessor: 'days30', render: r => <span className="table-num">${r.days30.toLocaleString()}</span> },
    { header: '31-60 Days ($)', accessor: 'days60', render: r => <span className="table-num">${r.days60.toLocaleString()}</span> },
    { header: '90+ Days ($)', accessor: 'days90Plus', render: r => <span className="table-num" style={{ color: r.days90Plus > 0 ? 'var(--ruby-text)' : 'inherit' }}>${r.days90Plus.toLocaleString()}</span> },
    { header: 'Account Status', render: r => r.isBlocked ? <span className="badge badge-ruby">Blocked</span> : <span className="badge badge-emerald">Optimal</span> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Accounts Ageing & Credit</h1>
      </div>
      <DataTable columns={columns} data={ageingData} emptyMessage="No customer balances." />
    </div>
  );
}
