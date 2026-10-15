import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerAccountsTab({ submenu = 'payables', tab = 'invoices' }) {
  const {
    tradeInvoices = [],
    tradeCustomerPayments = [],
    tradeCreditNotes = [],
    tradePRs = [],
    tradeBuyerPOs = [],
    tradeSalesOrders = [],
    tradeBuyerGRNs = [],
    addCustomerPayment,
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

  // Filter records for activeBuyerId
  const buyerInvoices = useMemo(() => {
    return tradeInvoices.filter(i => i.buyerId === activeBuyerId || !i.buyerId);
  }, [tradeInvoices, activeBuyerId]);

  const buyerPayments = useMemo(() => {
    return tradeCustomerPayments.filter(p => p.buyerId === activeBuyerId || !p.buyerId);
  }, [tradeCustomerPayments, activeBuyerId]);

  const buyerCreditNotes = useMemo(() => {
    return tradeCreditNotes.filter(cn => cn.buyerId === activeBuyerId || !cn.buyerId);
  }, [tradeCreditNotes, activeBuyerId]);

  // Payment Form
  const [payForm, setPayForm] = useState({
    invoiceId: buyerInvoices[0]?.id || 'INV-0002',
    amount: 100000,
    paymentMode: 'NEFT / RTGS (MOD-001)',
    referenceNo: 'UTR88391024'
  });

  // Payables Ageing for activeBuyerId
  const ageingBuckets = useMemo(() => {
    const today = new Date('2026-10-15');
    let current = 0, days30 = 0, days60 = 0, days90 = 0, days90Plus = 0, total = 0;

    buyerInvoices.forEach(inv => {
      const out = Number(inv.outstandingAmount || (inv.status === 'Paid' ? 0 : inv.totalAmount) || 0);
      if (out <= 0 || inv.status === 'Cancelled') return;

      const diffDays = Math.floor((today - new Date(inv.dueDate || inv.date)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) current += out;
      else if (diffDays <= 30) days30 += out;
      else if (diffDays <= 60) days60 += out;
      else if (diffDays <= 90) days90 += out;
      else days90Plus += out;
      total += out;
    });

    return [
      { category: 'Current (Not Due)', amount: current, percent: total > 0 ? `${((current / total) * 100).toFixed(1)}%` : '0%' },
      { category: '1 - 30 Days Overdue', amount: days30, percent: total > 0 ? `${((days30 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '31 - 60 Days Overdue', amount: days60, percent: total > 0 ? `${((days60 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '61 - 90 Days Overdue', amount: days90, percent: total > 0 ? `${((days90 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '90+ Days Critical Overdue', amount: days90Plus, percent: total > 0 ? `${((days90Plus / total) * 100).toFixed(1)}%` : '0%' },
      { category: 'Total Payables Outstanding', amount: total, percent: '100%' }
    ];
  }, [buyerInvoices]);

  // Buyer Statement Ledger
  const statementLedger = useMemo(() => {
    const entries = [];
    buyerInvoices.filter(i => i.status !== 'Cancelled').forEach(i => {
      entries.push({ date: i.date, docNo: i.id, type: 'Invoice', particular: `Tax Invoice (SO ${i.soId || '-'})`, debit: i.totalAmount, credit: 0 });
    });
    buyerPayments.forEach(p => {
      entries.push({ date: p.date, docNo: p.id, type: 'Payment', particular: `Settlement via ${p.paymentMode} (${p.referenceNo || '-'})`, debit: 0, credit: p.amount });
    });
    buyerCreditNotes.forEach(cn => {
      entries.push({ date: cn.date, docNo: cn.id, type: 'Credit Note', particular: `Credit Note against ${cn.invoiceId || '-'}`, debit: 0, credit: cn.totalCredit || cn.amount });
    });

    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    let run = 0;
    return entries.map(item => {
      run += item.debit - item.credit;
      return { ...item, balance: run };
    });
  }, [buyerInvoices, buyerPayments, buyerCreditNotes]);

  // 3-Way Match for Buyer Admin: PR (ordered) vs BGRN (received) vs Invoice (billed)
  const threeWayMatch = useMemo(() => {
    return tradePRs.filter(p => p.buyerId === activeBuyerId).map(pr => {
      const line = pr.lines?.[0] || {};
      const linkedBPO = tradeBuyerPOs.find(b => b.prId === pr.id || b.id === pr.id);
      const linkedSO = tradeSalesOrders.find(s => (linkedBPO && s.bpoId === linkedBPO.id) || s.bpoId === pr.id);
      const linkedInvoice = buyerInvoices.find(i =>
        (linkedSO && i.soId === linkedSO.id) ||
        (linkedBPO && i.bpoId === linkedBPO.id) ||
        i.bpoId === pr.id
      );
      const linkedGRN = tradeBuyerGRNs.find(g =>
        (linkedInvoice && g.invoiceId === linkedInvoice.id) ||
        (linkedInvoice?.challanId && g.challanId === linkedInvoice.challanId) ||
        (line.bundleId && g.bundleId === line.bundleId)
      );

      const requestedQty = line.qtySqFt || 1500;
      const receivedQty = linkedGRN ? linkedGRN.receivedSqFt : null;

      let status = 'Matched';
      let remarks = 'Quantities, specifications, and rates fully verified';

      if (!linkedInvoice || !linkedGRN) {
        status = 'Missing Document';
        remarks = !linkedInvoice ? 'Awaiting Supplier Invoice' : 'Awaiting Warehouse GRN Receipt';
      } else if (linkedGRN.damagedSqFt > 0) {
        status = 'Discrepancy';
        remarks = `${linkedGRN.damagedSqFt} Sq.Ft damaged upon delivery`;
      }

      return {
        id: `3WM-${pr.id}`,
        prId: pr.id,
        stoneName: line.stoneName || 'Granite Slabs',
        grnId: linkedGRN?.id || 'Pending',
        invoiceId: linkedInvoice?.id || 'Pending',
        requestedQty: `${requestedQty} Sq.Ft`,
        receivedQty: receivedQty !== null ? `${receivedQty} Sq.Ft` : '-',
        billedAmount: linkedInvoice ? `₹${linkedInvoice.totalAmount.toLocaleString()}` : '-',
        status,
        remarks
      };
    });
  }, [tradePRs, tradeBuyerPOs, tradeSalesOrders, buyerInvoices, tradeBuyerGRNs, activeBuyerId]);

  // Handlers
  const handleSavePayment = (e) => {
    e.preventDefault();
    const amt = Number(payForm.amount) || 0;
    addCustomerPayment({
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.name,
      amount: amt,
      paymentMode: payForm.paymentMode,
      referenceNo: payForm.referenceNo,
      allocatedInvoices: [
        { invoiceId: payForm.invoiceId, amount: amt }
      ]
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Payment of ₹${amt.toLocaleString()} submitted`, 'success');
  };

  // COLUMNS
  const invoiceColumns = [
    { header: 'Invoice No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'SO Ref', accessor: 'soId' },
    { header: 'Challan', accessor: 'challanId' },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Paid (₹)', accessor: 'paidAmount', render: r => `₹${Number(r.paidAmount || 0).toLocaleString()}` },
    {
      header: 'Outstanding (₹)',
      accessor: 'outstandingAmount',
      render: r => (
        <span style={{ fontWeight: 600, color: (r.outstandingAmount || 0) > 0 ? 'var(--ruby-text)' : 'inherit' }}>
          ₹{Number(r.outstandingAmount || 0).toLocaleString()}
        </span>
      )
    },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setPayForm({ invoiceId: r.id, amount: r.outstandingAmount || 50000, paymentMode: 'NEFT / RTGS (MOD-001)', referenceNo: 'UTR88391024' });
            setIsDrawerOpen(true);
          }}
          disabled={r.status === 'Paid'}
        >
          <CreditCard size={13} />
          <span>Pay Bill</span>
        </button>
      )
    }
  ];

  const paymentColumns = [
    { header: 'Payment Ref', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-solid, #10b981)' }}>₹{Number(r.amount || 0).toLocaleString()}</span> },
    { header: 'Mode', accessor: 'paymentMode' },
    { header: 'Bank UTR / Ref', accessor: 'referenceNo' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Completed'} /> }
  ];

  const ageingColumns = [
    { header: 'Ageing Bracket', accessor: 'category', render: r => <span style={{ fontWeight: 600 }}>{r.category}</span> },
    { header: 'Outstanding Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700, color: r.amount > 0 ? 'var(--ruby-text)' : 'inherit' }}>₹{r.amount.toLocaleString()}</span> },
    { header: 'Portfolio %', accessor: 'percent' }
  ];

  const statementColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Document', accessor: 'docNo', render: r => <span style={{ fontWeight: 600 }}>{r.docNo}</span> },
    { header: 'Type', accessor: 'type', render: r => <StatusBadge status={r.type === 'Invoice' ? 'Issued' : 'Paid'} /> },
    { header: 'Particulars', accessor: 'particular' },
    { header: 'Billed / Debit (₹)', accessor: 'debit', render: r => r.debit > 0 ? `₹${r.debit.toLocaleString()}` : '-' },
    { header: 'Paid / Credit (₹)', accessor: 'credit', render: r => r.credit > 0 ? `₹${r.credit.toLocaleString()}` : '-' },
    { header: 'Running Dues (₹)', accessor: 'balance', render: r => <span style={{ fontWeight: 700 }}>₹{r.balance.toLocaleString()}</span> }
  ];

  const matchColumns = [
    { header: 'Match ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'PR Ref', accessor: 'prId' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'GRN Ref', accessor: 'grnId' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Requested Qty', accessor: 'requestedQty' },
    { header: 'Received Qty', accessor: 'receivedQty' },
    { header: 'Billed Amount', accessor: 'billedAmount' },
    {
      header: 'Match Status',
      accessor: 'status',
      render: r => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11.5px',
          fontWeight: 700,
          background: r.status === 'Matched' ? 'var(--emerald-subtle)' : 'var(--amber-subtle)',
          color: r.status === 'Matched' ? 'var(--emerald-solid)' : 'var(--amber-solid)'
        }}>
          {r.status === 'Matched' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {r.status}
        </span>
      )
    },
    { header: 'Audit Verification', accessor: 'remarks', render: r => <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.remarks}</span> }
  ];

  const getTabTitle = () => {
    if (submenu === 'payables') {
      if (tab === 'invoices') return 'Supplier Invoices Payable';
      if (tab === 'payments') return 'Disbursed Payments Register';
      if (tab === 'ageing') return 'Accounts Payable Ageing Analysis';
      if (tab === 'statement') return 'Buyer Statement of Account';
      return 'Accounts Payable';
    }
    if (submenu === 'match') {
      return '3-Way Match Verification (PO - GRN - Bill)';
    }
    return 'Accounts';
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
        {submenu === 'payables' && tab === 'payments' && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsDrawerOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Make Payment</span>
          </button>
        )}
      </div>

      {submenu === 'payables' && tab === 'invoices' && (
        <DataTable columns={invoiceColumns} data={buyerInvoices} emptyMessage="No payable invoices found." />
      )}

      {submenu === 'payables' && tab === 'payments' && (
        <DataTable columns={paymentColumns} data={buyerPayments} emptyMessage="No payment disbursements logged." />
      )}

      {submenu === 'payables' && tab === 'ageing' && (
        <DataTable columns={ageingColumns} data={ageingBuckets} emptyMessage="No ageing balance." />
      )}

      {submenu === 'payables' && tab === 'statement' && (
        <DataTable columns={statementColumns} data={statementLedger} emptyMessage="No statement transactions." />
      )}

      {submenu === 'match' && (
        <DataTable columns={matchColumns} data={threeWayMatch} emptyMessage="No 3-way match records." />
      )}

      {/* Pay Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Make Payment Disbursement"
        onSubmit={handleSavePayment}
        submitLabel="Disburse Payment"
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

        <div className="form-group col-span-2">
          <label className="form-label">Select Invoice to Settle</label>
          <select
            className="form-select"
            value={payForm.invoiceId}
            onChange={e => setPayForm({ ...payForm, invoiceId: e.target.value })}
          >
            {buyerInvoices.filter(i => (i.outstandingAmount || 0) > 0).map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.id} (Outstanding: ₹{Number(inv.outstandingAmount).toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Disbursement Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={payForm.amount}
            onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <input
            className="form-input"
            placeholder="e.g. NEFT / RTGS"
            value={payForm.paymentMode}
            onChange={e => setPayForm({ ...payForm, paymentMode: e.target.value })}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Bank Reference / UTR Number</label>
          <input
            className="form-input"
            placeholder="e.g. UTR88391024"
            value={payForm.referenceNo}
            onChange={e => setPayForm({ ...payForm, referenceNo: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}
