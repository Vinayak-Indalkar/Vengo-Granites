import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function AccountsModuleTab({ submenu = 'receivables', tab = 'customer-payments' }) {
  const {
    tradeCustomerPayments = [],
    tradeInvoices = [],
    tradeCreditNotes = [],
    tradeSupplierBills = [],
    tradeSupplierPayments = [],
    tradeContractorPayments = [],
    tradeQuarryPOs = [],
    tradeGRNs = [],
    suppliers = [],
    contractors = [],
    buyers = [],
    customers = [],
    addCustomerPayment,
    addSupplierBill,
    addSupplierPayment,
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyerList[0]?.id || 'CUST-001');
  const [statementDateRange, setStatementDateRange] = useState({ from: '2026-01-01', to: '2026-12-31' });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('new-cust-pay'); // 'new-cust-pay' | 'new-sup-bill' | 'new-sup-pay' | 'new-con-pay'
  const [viewItem, setViewItem] = useState(null);

  // Forms
  const [custPayForm, setCustPayForm] = useState({
    buyerId: buyerList[0]?.id || 'CUST-001',
    buyerName: buyerList[0]?.name || 'Carrara Marble Importers',
    amount: 100000,
    paymentMode: 'NEFT / RTGS (MOD-001)',
    referenceNo: 'UTR984102948',
    invoiceId: 'INV-0002'
  });

  const [supBillForm, setSupBillForm] = useState({
    supplierId: suppliers[0]?.id || 'SUP-0001',
    supplierName: suppliers[0]?.name || 'Altissimo Quarries',
    qpoId: 'QPO-0001',
    grnId: 'GRN-0001',
    billNo: 'ALT-INV-9921',
    billAmount: 1294125,
    taxAmount: 64706,
    dueDate: '2026-11-15'
  });

  const [supPayForm, setSupPayForm] = useState({
    supplierId: suppliers[0]?.id || 'SUP-0001',
    supplierName: suppliers[0]?.name || 'Altissimo Quarries',
    billId: 'SB-0001',
    amount: 500000,
    paymentMode: 'Bank Transfer (MOD-001)',
    reference: 'UTR772019481'
  });

  const [conPayForm, setConPayForm] = useState({
    contractorId: contractors[0]?.id || 'CON-001',
    contractorName: contractors[0]?.name || 'Apex Cutting & Dressing Works',
    workType: 'Block Gangsaw Dressing & Edge Squaring',
    amount: 45000,
    paymentMode: 'NEFT Transfer',
    reference: 'CON-PAY-9041'
  });

  // 1. Receivables: Ageing Calculations
  const ageingData = useMemo(() => {
    const today = new Date('2026-10-15');
    const map = {};

    buyerList.forEach(b => {
      map[b.id] = {
        buyerId: b.id,
        buyerName: b.name,
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        days90Plus: 0,
        totalOutstanding: 0
      };
    });

    tradeInvoices.forEach(inv => {
      const outstanding = Number(inv.outstandingAmount || (inv.status === 'Paid' ? 0 : inv.totalAmount) || 0);
      if (outstanding <= 0 || inv.status === 'Cancelled') return;

      const buyer = map[inv.buyerId] || {
        buyerId: inv.buyerId,
        buyerName: inv.buyerName,
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        days90Plus: 0,
        totalOutstanding: 0
      };

      const dueDate = new Date(inv.dueDate || inv.date);
      const diffDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) buyer.current += outstanding;
      else if (diffDays <= 30) buyer.days30 += outstanding;
      else if (diffDays <= 60) buyer.days60 += outstanding;
      else if (diffDays <= 90) buyer.days90 += outstanding;
      else buyer.days90Plus += outstanding;

      buyer.totalOutstanding += outstanding;
      map[inv.buyerId] = buyer;
    });

    return Object.values(map);
  }, [buyerList, tradeInvoices]);

  // 2. Receivables: Buyer Statement Ledger
  const buyerStatementData = useMemo(() => {
    if (!selectedBuyerId) return [];
    const entries = [];

    // Invoices (Debit - increases buyer's balance)
    tradeInvoices
      .filter(i => i.buyerId === selectedBuyerId && i.status !== 'Cancelled')
      .forEach(i => {
        entries.push({
          date: i.date,
          type: 'Invoice',
          docNo: i.id,
          description: `Tax Invoice for Sales Order ${i.soId || '-'}`,
          debit: i.totalAmount,
          credit: 0
        });
      });

    // Customer Payments (Credit - reduces buyer's balance)
    tradeCustomerPayments
      .filter(p => p.buyerId === selectedBuyerId)
      .forEach(p => {
        entries.push({
          date: p.date,
          type: 'Receipt',
          docNo: p.id,
          description: `Payment via ${p.paymentMode || 'Bank'} (Ref: ${p.referenceNo || '-'})`,
          debit: 0,
          credit: p.amount
        });
      });

    // Credit Notes (Credit - reduces buyer's balance)
    tradeCreditNotes
      .filter(cn => cn.buyerId === selectedBuyerId)
      .forEach(cn => {
        entries.push({
          date: cn.date,
          type: 'Credit Note',
          docNo: cn.id,
          description: `Credit Note against ${cn.invoiceId || '-'}`,
          debit: 0,
          credit: cn.totalCredit || cn.amount
        });
      });

    // Sort by date ascending
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let running = 0;
    return entries.map(item => {
      running += item.debit - item.credit;
      return {
        ...item,
        runningBalance: running
      };
    });
  }, [selectedBuyerId, tradeInvoices, tradeCustomerPayments, tradeCreditNotes]);

  // 3. Match: 3-Way Match Data
  const threeWayMatchData = useMemo(() => {
    return tradeQuarryPOs.map(po => {
      const linkedGRN = tradeGRNs.find(g => g.qpoId === po.id);
      const linkedBill = tradeSupplierBills.find(b => b.qpoId === po.id);

      const orderedQty = po.expectedQty || 0;
      const receivedQty = linkedGRN ? Math.round((linkedGRN.netWeightKg || 0) / 1000) : 0;
      const billedQty = linkedBill ? Math.round((linkedBill.billAmount || po.totalAmount) / (po.rate || 1)) : 0;

      let matchStatus = 'Matched';
      let issueDescription = 'All documents align within standard tolerance';

      if (!linkedGRN || !linkedBill) {
        matchStatus = 'Missing Document';
        issueDescription = !linkedGRN ? 'Awaiting GRN receipt' : 'Awaiting Supplier Bill submission';
      } else if (Math.abs(orderedQty - receivedQty) > 2) {
        matchStatus = 'Quantity Variance';
        issueDescription = `Variance of ${receivedQty - orderedQty} Tons between PO and Weighbridge GRN`;
      }

      return {
        id: `3WM-${po.id}`,
        qpoId: po.id,
        supplierName: po.supplierName,
        stoneName: po.stoneName,
        grnId: linkedGRN?.id || 'Pending',
        billId: linkedBill?.id || 'Pending',
        orderedQty: `${orderedQty} ${po.unit || 'Ton'}`,
        receivedQty: linkedGRN ? `${receivedQty} Ton` : '-',
        poRate: `₹${po.rate}`,
        poTotal: `₹${po.totalAmount.toLocaleString()}`,
        billedTotal: linkedBill ? `₹${(linkedBill.totalAmount || linkedBill.billAmount).toLocaleString()}` : '-',
        matchStatus,
        issueDescription
      };
    });
  }, [tradeQuarryPOs, tradeGRNs, tradeSupplierBills]);

  // Filter handlers
  const filteredCustomerPayments = useMemo(() => {
    if (!searchQuery) return tradeCustomerPayments;
    const q = searchQuery.toLowerCase();
    return tradeCustomerPayments.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.buyerName?.toLowerCase().includes(q) ||
      p.referenceNo?.toLowerCase().includes(q)
    );
  }, [tradeCustomerPayments, searchQuery]);

  const filteredSupplierBills = useMemo(() => {
    if (!searchQuery) return tradeSupplierBills;
    const q = searchQuery.toLowerCase();
    return tradeSupplierBills.filter(b =>
      b.id?.toLowerCase().includes(q) ||
      b.supplierName?.toLowerCase().includes(q) ||
      b.billNo?.toLowerCase().includes(q)
    );
  }, [tradeSupplierBills, searchQuery]);

  const filteredSupplierPayments = useMemo(() => {
    if (!searchQuery) return tradeSupplierPayments;
    const q = searchQuery.toLowerCase();
    return tradeSupplierPayments.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.supplierName?.toLowerCase().includes(q) ||
      p.billId?.toLowerCase().includes(q)
    );
  }, [tradeSupplierPayments, searchQuery]);

  const filteredContractorPayments = useMemo(() => {
    if (!searchQuery) return tradeContractorPayments;
    const q = searchQuery.toLowerCase();
    return tradeContractorPayments.filter(c =>
      c.id?.toLowerCase().includes(q) ||
      c.contractorName?.toLowerCase().includes(q) ||
      c.workType?.toLowerCase().includes(q)
    );
  }, [tradeContractorPayments, searchQuery]);

  // Form Submissions
  const handleSaveCustPayment = (e) => {
    e.preventDefault();
    const amountNum = Number(custPayForm.amount) || 0;
    addCustomerPayment({
      buyerId: custPayForm.buyerId,
      buyerName: custPayForm.buyerName,
      amount: amountNum,
      paymentMode: custPayForm.paymentMode,
      referenceNo: custPayForm.referenceNo,
      allocatedInvoices: [
        { invoiceId: custPayForm.invoiceId, amount: amountNum }
      ]
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Payment of ₹${amountNum.toLocaleString()} recorded`, 'success');
  };

  const handleSaveSupBill = (e) => {
    e.preventDefault();
    const billAmt = Number(supBillForm.billAmount) || 0;
    const taxAmt = Number(supBillForm.taxAmount) || 0;
    addSupplierBill({
      supplierId: supBillForm.supplierId,
      supplierName: supBillForm.supplierName,
      qpoId: supBillForm.qpoId,
      grnId: supBillForm.grnId,
      billNo: supBillForm.billNo,
      billAmount: billAmt,
      taxAmount: taxAmt,
      totalAmount: billAmt + taxAmt,
      dueDate: supBillForm.dueDate
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Supplier bill ${supBillForm.billNo} registered`, 'success');
  };

  const handleSaveSupPay = (e) => {
    e.preventDefault();
    const amt = Number(supPayForm.amount) || 0;
    addSupplierPayment({
      supplierId: supPayForm.supplierId,
      supplierName: supPayForm.supplierName,
      billId: supPayForm.billId,
      amount: amt,
      paymentMode: supPayForm.paymentMode,
      reference: supPayForm.reference
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Supplier payment of ₹${amt.toLocaleString()} recorded`, 'success');
  };

  // COLUMNS DEFINITIONS
  const custPayColumns = [
    { header: 'Receipt No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-solid, #10b981)' }}>₹{Number(r.amount || 0).toLocaleString()}</span> },
    { header: 'Payment Mode', accessor: 'paymentMode' },
    { header: 'Reference / UTR', accessor: 'referenceNo' },
    {
      header: 'Allocated Invoices',
      accessor: 'allocatedInvoices',
      render: r => Array.isArray(r.allocatedInvoices)
        ? r.allocatedInvoices.map(a => `${a.invoiceId} (₹${a.amount?.toLocaleString()})`).join(', ')
        : (r.invoiceId || '-')
    },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Completed'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'View Receipt',
              icon: Eye,
              onClick: () => setViewItem({ type: 'Receipt', data: r })
            }
          ]}
        />
      )
    }
  ];

  const ageingColumns = [
    { header: 'Buyer', accessor: 'buyerName', render: r => <span style={{ fontWeight: 600 }}>{r.buyerName}</span> },
    { header: 'Current (Not Due)', accessor: 'current', render: r => `₹${r.current.toLocaleString()}` },
    { header: '1 - 30 Days', accessor: 'days30', render: r => <span style={{ color: r.days30 > 0 ? 'var(--amber-text, #d97706)' : 'inherit' }}>₹{r.days30.toLocaleString()}</span> },
    { header: '31 - 60 Days', accessor: 'days60', render: r => <span style={{ color: r.days60 > 0 ? 'var(--amber-text, #d97706)' : 'inherit' }}>₹{r.days60.toLocaleString()}</span> },
    { header: '61 - 90 Days', accessor: 'days90', render: r => <span style={{ color: r.days90 > 0 ? 'var(--ruby-text, #e11d48)' : 'inherit' }}>₹{r.days90.toLocaleString()}</span> },
    { header: '90+ Days Overdue', accessor: 'days90Plus', render: r => <span style={{ color: r.days90Plus > 0 ? 'var(--ruby-text, #e11d48)' : 'inherit', fontWeight: 700 }}>₹{r.days90Plus.toLocaleString()}</span> },
    { header: 'Total Outstanding (₹)', accessor: 'totalOutstanding', render: r => <span style={{ fontWeight: 800 }}>₹{r.totalOutstanding.toLocaleString()}</span> }
  ];

  const statementColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Document', accessor: 'docNo', render: r => <span style={{ fontWeight: 600 }}>{r.docNo}</span> },
    { header: 'Type', accessor: 'type', render: r => <StatusBadge status={r.type === 'Invoice' ? 'Issued' : r.type === 'Receipt' ? 'Paid' : 'Approved'} /> },
    { header: 'Particulars', accessor: 'description' },
    { header: 'Debit (₹)', accessor: 'debit', render: r => r.debit > 0 ? `₹${r.debit.toLocaleString()}` : '-' },
    { header: 'Credit (₹)', accessor: 'credit', render: r => r.credit > 0 ? `₹${r.credit.toLocaleString()}` : '-' },
    { header: 'Balance (₹)', accessor: 'runningBalance', render: r => <span style={{ fontWeight: 700 }}>₹{r.runningBalance.toLocaleString()}</span> }
  ];

  const supBillColumns = [
    { header: 'Bill ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Bill Ref', accessor: 'billNo' },
    { header: 'PO Ref', accessor: 'qpoId' },
    { header: 'GRN Ref', accessor: 'grnId' },
    { header: 'Bill Amount (₹)', accessor: 'billAmount', render: r => `₹${Number(r.billAmount || 0).toLocaleString()}` },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.totalAmount || r.billAmount || 0).toLocaleString()}</span> },
    { header: 'Outstanding (₹)', accessor: 'outstandingAmount', render: r => `₹${Number(r.outstandingAmount || 0).toLocaleString()}` },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const supPayColumns = [
    { header: 'Payment ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Bill Ref', accessor: 'billId' },
    { header: 'Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700, color: 'var(--ruby-solid, #e11d48)' }}>₹{Number(r.amount || 0).toLocaleString()}</span> },
    { header: 'Mode', accessor: 'paymentMode' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Completed'} /> }
  ];

  const conPayColumns = [
    { header: 'Payment ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Contractor', accessor: 'contractorName' },
    { header: 'Work Description', accessor: 'workType' },
    { header: 'Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.amount || 0).toLocaleString()}</span> },
    { header: 'Mode', accessor: 'paymentMode' },
    { header: 'Reference', accessor: 'reference' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status || 'Completed'} /> }
  ];

  const matchColumns = [
    { header: 'PO Ref', accessor: 'qpoId', render: r => <span style={{ fontWeight: 600 }}>{r.qpoId}</span> },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'GRN Ref', accessor: 'grnId' },
    { header: 'Bill Ref', accessor: 'billId' },
    { header: 'Ordered Qty', accessor: 'orderedQty' },
    { header: 'Received Qty', accessor: 'receivedQty' },
    { header: 'PO Rate', accessor: 'poRate' },
    { header: 'PO Total', accessor: 'poTotal' },
    { header: 'Billed Total', accessor: 'billedTotal' },
    {
      header: 'Match Status',
      accessor: 'matchStatus',
      render: r => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '11.5px',
          fontWeight: 700,
          background: r.matchStatus === 'Matched' ? 'var(--emerald-subtle, #ecfdf5)' : 'var(--amber-subtle, #fffbeb)',
          color: r.matchStatus === 'Matched' ? 'var(--emerald-solid, #10b981)' : 'var(--amber-solid, #d97706)'
        }}>
          {r.matchStatus === 'Matched' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {r.matchStatus}
        </span>
      )
    },
    { header: 'Discrepancy / Remarks', accessor: 'issueDescription', render: r => <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.issueDescription}</span> }
  ];

  const getTableInfo = () => {
    if (submenu === 'receivables') {
      if (tab === 'customer-payments') {
        return {
          title: 'Customer Payment Receipts',
          count: filteredCustomerPayments.length,
          unit: 'payments',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-cust-pay'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Record Payment</span>
            </button>
          )
        };
      }
      if (tab === 'ageing') {
        return {
          title: 'Accounts Receivable Ageing',
          count: ageingData.length,
          unit: 'accounts'
        };
      }
      if (tab === 'statements') {
        return {
          title: 'Buyer Account Statement Ledger',
          count: buyerStatementData.length,
          unit: 'entries',
          action: (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>Buyer:</label>
              <select
                className="form-select form-select-sm"
                value={selectedBuyerId}
                onChange={e => setSelectedBuyerId(e.target.value)}
                style={{ width: '220px' }}
              >
                {buyerList.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )
        };
      }
      return { title: 'Receivables', count: filteredCustomerPayments.length, unit: 'records' };
    }

    if (submenu === 'payables') {
      if (tab === 'supplier-bills') {
        return {
          title: 'Quarry & Supplier Bills',
          count: filteredSupplierBills.length,
          unit: 'bills',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-sup-bill'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Enter Supplier Bill</span>
            </button>
          )
        };
      }
      if (tab === 'supplier-payments') {
        return {
          title: 'Quarry & Supplier Payments',
          count: filteredSupplierPayments.length,
          unit: 'payments',
          action: (
            <button className="btn btn-primary btn-sm" onClick={() => { setDrawerType('new-sup-pay'); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} />
              <span>Make Supplier Payment</span>
            </button>
          )
        };
      }
      if (tab === 'contractor-payments') {
        return {
          title: 'Contractor & Job-Work Payments',
          count: filteredContractorPayments.length,
          unit: 'payments'
        };
      }
      return { title: 'Payables', count: filteredSupplierBills.length, unit: 'records' };
    }

    if (submenu === 'match') {
      return {
        title: '3-Way Invoice Matching (PO - GRN - Bill)',
        count: threeWayMatchData.length,
        unit: 'matches'
      };
    }

    return { title: 'Accounts', count: 0, unit: 'records' };
  };

  const tableInfo = getTableInfo();

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
            {tableInfo.title}
          </h2>
        </div>
        {tableInfo.action || null}
      </div>

      {/* Render tables according to active tab */}
      {submenu === 'receivables' && tab === 'customer-payments' && (
        <DataTable
          columns={custPayColumns}
          data={filteredCustomerPayments}
          emptyMessage="No customer payments recorded."
        />
      )}

      {submenu === 'receivables' && tab === 'ageing' && (
        <DataTable
          columns={ageingColumns}
          data={ageingData}
          emptyMessage="No ageing balances."
        />
      )}

      {submenu === 'receivables' && tab === 'statements' && (
        <DataTable
          columns={statementColumns}
          data={buyerStatementData}
          emptyMessage="No ledger entries for this buyer."
        />
      )}

      {submenu === 'payables' && tab === 'supplier-bills' && (
        <DataTable
          columns={supBillColumns}
          data={filteredSupplierBills}
          emptyMessage="No supplier bills logged."
        />
      )}

      {submenu === 'payables' && tab === 'supplier-payments' && (
        <DataTable
          columns={supPayColumns}
          data={filteredSupplierPayments}
          emptyMessage="No supplier payments logged."
        />
      )}

      {submenu === 'payables' && tab === 'contractor-payments' && (
        <DataTable
          columns={conPayColumns}
          data={filteredContractorPayments}
          emptyMessage="No contractor payments logged."
        />
      )}

      {submenu === 'match' && (
        <DataTable
          columns={matchColumns}
          data={threeWayMatchData}
          emptyMessage="No 3-way match records."
        />
      )}

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          drawerType === 'new-cust-pay' ? 'Record Customer Payment' :
          drawerType === 'new-sup-bill' ? 'Enter Supplier Bill' :
          drawerType === 'new-sup-pay' ? 'Record Supplier Payment' : 'Form'
        }
        onSubmit={
          drawerType === 'new-cust-pay' ? handleSaveCustPayment :
          drawerType === 'new-sup-bill' ? handleSaveSupBill :
          drawerType === 'new-sup-pay' ? handleSaveSupPay : () => {}
        }
        submitLabel="Save Payment"
      >
        {drawerType === 'new-cust-pay' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Buyer</label>
              <select
                className="form-select"
                value={custPayForm.buyerId}
                onChange={e => {
                  const b = buyerList.find(x => x.id === e.target.value);
                  setCustPayForm({ ...custPayForm, buyerId: e.target.value, buyerName: b?.name || '' });
                }}
              >
                <option value="">Select Buyer (Optional)</option>
                {buyerList.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={custPayForm.amount}
                onChange={e => setCustPayForm({ ...custPayForm, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <input
                className="form-input"
                placeholder="e.g. NEFT / RTGS"
                value={custPayForm.paymentMode}
                onChange={e => setCustPayForm({ ...custPayForm, paymentMode: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Bank Reference / UTR Number</label>
              <input
                className="form-input"
                placeholder="e.g. UTR88391024"
                value={custPayForm.referenceNo}
                onChange={e => setCustPayForm({ ...custPayForm, referenceNo: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Allocate to Invoice</label>
              <select
                className="form-select"
                value={custPayForm.invoiceId}
                onChange={e => setCustPayForm({ ...custPayForm, invoiceId: e.target.value })}
              >
                <option value="">Select Invoice to Settle</option>
                {tradeInvoices
                  .filter(i => i.buyerId === custPayForm.buyerId && i.outstandingAmount > 0)
                  .map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} (Outstanding: ₹{inv.outstandingAmount?.toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {drawerType === 'new-sup-bill' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier</label>
              <select
                className="form-select"
                value={supBillForm.supplierId}
                onChange={e => {
                  const s = suppliers.find(x => x.id === e.target.value);
                  setSupBillForm({ ...supBillForm, supplierId: e.target.value, supplierName: s?.name || '' });
                }}
              >
                <option value="">Select Quarry / Supplier (Optional)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Supplier Bill / Invoice No.</label>
              <input
                className="form-input"
                placeholder="e.g. BILL-2026-9041"
                value={supBillForm.billNo}
                onChange={e => setSupBillForm({ ...supBillForm, billNo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quarry PO Ref</label>
              <input
                className="form-input"
                placeholder="e.g. QPO-2026-0041"
                value={supBillForm.qpoId}
                onChange={e => setSupBillForm({ ...supBillForm, qpoId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GRN Ref</label>
              <input
                className="form-input"
                placeholder="e.g. GRN-2026-0041"
                value={supBillForm.grnId}
                onChange={e => setSupBillForm({ ...supBillForm, grnId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bill Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={supBillForm.billAmount}
                onChange={e => setSupBillForm({ ...supBillForm, billAmount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={supBillForm.taxAmount}
                onChange={e => setSupBillForm({ ...supBillForm, taxAmount: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                placeholder="DD/MM/YYYY"
                value={supBillForm.dueDate}
                onChange={e => setSupBillForm({ ...supBillForm, dueDate: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'new-sup-pay' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier</label>
              <select
                className="form-select"
                value={supPayForm.supplierId}
                onChange={e => {
                  const s = suppliers.find(x => x.id === e.target.value);
                  setSupPayForm({ ...supPayForm, supplierId: e.target.value, supplierName: s?.name || '' });
                }}
              >
                <option value="">Select Quarry / Supplier (Optional)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Supplier Bill Reference</label>
              <input
                className="form-input"
                placeholder="e.g. BILL-2026-9041"
                value={supPayForm.billId}
                onChange={e => setSupPayForm({ ...supPayForm, billId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={supPayForm.amount}
                onChange={e => setSupPayForm({ ...supPayForm, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <input
                className="form-input"
                placeholder="e.g. NEFT / RTGS"
                value={supPayForm.paymentMode}
                onChange={e => setSupPayForm({ ...supPayForm, paymentMode: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Bank Reference / UTR</label>
              <input
                className="form-input"
                placeholder="e.g. UTR88391024"
                value={supPayForm.reference}
                onChange={e => setSupPayForm({ ...supPayForm, reference: e.target.value })}
              />
            </div>
          </>
        )}
      </FormDrawer>

      {/* View Item Details Drawer */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`${viewItem?.type || 'Record'} Details: ${viewItem?.data?.id || ''}`}
        data={viewItem?.data || {}}
      />
    </div>
  );
}
