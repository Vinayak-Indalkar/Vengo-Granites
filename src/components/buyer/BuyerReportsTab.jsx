import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge } from '../CommonComponents';
import { Search, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerReportsTab({ tab = 'pr-status' }) {
  const {
    tradePRs = [],
    tradeInvoices = [],
    tradeCustomerPayments = [],
    tradeBuyerGRNs = [],
    tradeReturns = [],
    activeBuyerId,
    buyers = [],
    customers = []
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const currentBuyer = buyerList.find(b => b.id === activeBuyerId) || buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };

  // Filtered collections
  const buyerPRs = useMemo(() => tradePRs.filter(p => p.buyerId === activeBuyerId), [tradePRs, activeBuyerId]);
  const buyerInvoices = useMemo(() => tradeInvoices.filter(i => i.buyerId === activeBuyerId), [tradeInvoices, activeBuyerId]);
  const buyerGRNs = useMemo(() => tradeBuyerGRNs.filter(g => g.buyerId === activeBuyerId), [tradeBuyerGRNs, activeBuyerId]);
  const buyerReturns = useMemo(() => tradeReturns.filter(r => r.buyerId === activeBuyerId), [tradeReturns, activeBuyerId]);

  // 1. PR Status
  const prStatusData = useMemo(() => {
    return buyerPRs.map(p => ({
      id: p.id,
      date: p.date,
      supplierName: p.supplierName || 'Open Sourcing',
      requiredDate: p.requiredDate,
      stoneItems: Array.isArray(p.lines) ? p.lines.map(l => `${l.stoneName} (${l.qtySqFt} Sq.Ft)`).join(', ') : '-',
      totalAmount: p.totalAmount,
      status: p.status
    }));
  }, [buyerPRs]);

  // 2. Purchase Register
  const purchaseRegisterData = useMemo(() => {
    return buyerInvoices.map(inv => ({
      id: inv.id,
      date: inv.date,
      soRef: inv.soId || '-',
      challanRef: inv.challanId || '-',
      subtotal: inv.subtotal || Math.round(inv.totalAmount / 1.18),
      taxAmount: inv.taxAmount || Math.round((inv.totalAmount / 1.18) * 0.18),
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount || 0,
      outstandingAmount: inv.outstandingAmount || 0,
      status: inv.status
    }));
  }, [buyerInvoices]);

  // 3. Payables Ageing
  const payablesAgeingData = useMemo(() => {
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
      { category: 'Current Invoices (Within Term)', amount: current, percent: total > 0 ? `${((current / total) * 100).toFixed(1)}%` : '0%' },
      { category: '1 - 30 Days Overdue', amount: days30, percent: total > 0 ? `${((days30 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '31 - 60 Days Overdue', amount: days60, percent: total > 0 ? `${((days60 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '61 - 90 Days Overdue', amount: days90, percent: total > 0 ? `${((days90 / total) * 100).toFixed(1)}%` : '0%' },
      { category: '90+ Days Critical Overdue', amount: days90Plus, percent: total > 0 ? `${((days90Plus / total) * 100).toFixed(1)}%` : '0%' },
      { category: 'Total Payables Outstanding', amount: total, percent: '100%' }
    ];
  }, [buyerInvoices]);

  // 4. Stock Ledger
  const stockLedgerData = useMemo(() => {
    return [
      { category: '20mm Polished Granite Slabs', opening: 4500, inward: 3300, outward: 1800, closing: 6000, uom: 'Sq.Ft' },
      { category: '18mm Honed Granite Slabs', opening: 2200, inward: 2200, outward: 1200, closing: 3200, uom: 'Sq.Ft' },
      { category: '30mm Flamed Monolith Slabs', opening: 800, inward: 0, outward: 0, closing: 800, uom: 'Sq.Ft' },
      { category: 'A-Frame Stored Bundles', opening: 4, inward: 2, outward: 1, closing: 5, uom: 'Bundles' }
    ];
  }, []);

  // 5. Receipt Variance
  const receiptVarianceData = useMemo(() => {
    return buyerGRNs.map(g => ({
      id: g.id,
      date: g.date,
      challanId: g.challanId,
      bundleId: g.bundleId,
      stoneName: g.stoneName,
      receivedSqFt: g.receivedSqFt,
      damagedSqFt: g.damagedSqFt || 0,
      shortageSqFt: g.shortageSqFt || 0,
      varianceRate: g.receivedSqFt > 0 ? `${(((g.damagedSqFt + g.shortageSqFt) / g.receivedSqFt) * 100).toFixed(1)}%` : '0%',
      status: g.status
    }));
  }, [buyerGRNs]);

  // 6. Returns Summary
  const returnsSummaryData = useMemo(() => {
    return [
      { reason: 'Broken / Cracked in Transit', claimsCount: 1, sqFtAffected: 300, totalCreditClaimed: 123000, status: 'Credit Approved' },
      { reason: 'Size / Gauge Mismatch', claimsCount: 1, sqFtAffected: 150, totalCreditClaimed: 45000, status: 'Replacement In Transit' },
      { reason: 'Total Buyer Claims', claimsCount: 2, sqFtAffected: 450, totalCreditClaimed: 168000, status: 'Active Claims' }
    ];
  }, []);

  // 7. Supplier Performance
  const supplierPerformanceData = useMemo(() => {
    return [
      { supplierName: 'Altissimo Quarries & Processing', totalOrders: 3, onTimeRate: '98.5%', defectRate: '0.8%', overallRating: 'Tier 1 Preferred' },
      { supplierName: 'Deccan Granite Mining Corp', totalOrders: 2, onTimeRate: '94.0%', defectRate: '1.5%', overallRating: 'Approved Standard' }
    ];
  }, []);

  // COLUMNS
  const prColumns = [
    { header: 'PR No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'Required Date', accessor: 'requiredDate' },
    { header: 'Stone Specifications', accessor: 'stoneItems' },
    { header: 'Est. Total (₹)', accessor: 'totalAmount', render: r => `₹${Number(r.totalAmount || 0).toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const purchaseColumns = [
    { header: 'Invoice No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'SO Ref', accessor: 'soRef' },
    { header: 'Challan', accessor: 'challanRef' },
    { header: 'Subtotal (₹)', accessor: 'subtotal', render: r => `₹${r.subtotal.toLocaleString()}` },
    { header: 'Tax (₹)', accessor: 'taxAmount', render: r => `₹${r.taxAmount.toLocaleString()}` },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{r.totalAmount.toLocaleString()}</span> },
    { header: 'Paid (₹)', accessor: 'paidAmount', render: r => `₹${r.paidAmount.toLocaleString()}` },
    { header: 'Outstanding (₹)', accessor: 'outstandingAmount', render: r => `₹${r.outstandingAmount.toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const ageingColumns = [
    { header: 'Ageing Bracket', accessor: 'category', render: r => <span style={{ fontWeight: 600 }}>{r.category}</span> },
    { header: 'Amount (₹)', accessor: 'amount', render: r => <span style={{ fontWeight: 700, color: r.amount > 0 ? 'var(--ruby-text)' : 'inherit' }}>₹{r.amount.toLocaleString()}</span> },
    { header: 'Percentage', accessor: 'percent' }
  ];

  const stockColumns = [
    { header: 'Material Category', accessor: 'category', render: r => <span style={{ fontWeight: 600 }}>{r.category}</span> },
    { header: 'Opening Stock', accessor: 'opening', render: r => r.opening.toLocaleString() },
    { header: 'Received Inward', accessor: 'inward', render: r => `+${r.inward.toLocaleString()}` },
    { header: 'Consumed Outward', accessor: 'outward', render: r => `-${r.outward.toLocaleString()}` },
    { header: 'Closing Balance', accessor: 'closing', render: r => <span style={{ fontWeight: 700 }}>{r.closing.toLocaleString()}</span> },
    { header: 'UOM', accessor: 'uom' }
  ];

  const varianceColumns = [
    { header: 'BGRN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Challan Ref', accessor: 'challanId' },
    { header: 'Bundle ID', accessor: 'bundleId' },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Received (Sq.Ft)', accessor: 'receivedSqFt', render: r => r.receivedSqFt.toLocaleString() },
    { header: 'Damaged (Sq.Ft)', accessor: 'damagedSqFt', render: r => r.damagedSqFt > 0 ? <span style={{ color: 'var(--ruby-text)', fontWeight: 700 }}>{r.damagedSqFt}</span> : '-' },
    { header: 'Shortage (Sq.Ft)', accessor: 'shortageSqFt', render: r => r.shortageSqFt > 0 ? <span style={{ color: 'var(--amber-text)', fontWeight: 700 }}>{r.shortageSqFt}</span> : '-' },
    { header: 'Variance %', accessor: 'varianceRate' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const retSummaryColumns = [
    { header: 'Reason for Claim', accessor: 'reason', render: r => <span style={{ fontWeight: 600 }}>{r.reason}</span> },
    { header: 'Claims Count', accessor: 'claimsCount' },
    { header: 'Damaged Area (Sq.Ft)', accessor: 'sqFtAffected', render: r => r.sqFtAffected.toLocaleString() },
    { header: 'Credit Claimed (₹)', accessor: 'totalCreditClaimed', render: r => <span style={{ fontWeight: 700 }}>₹{r.totalCreditClaimed.toLocaleString()}</span> },
    { header: 'Settlement Status', accessor: 'status', render: r => <span className="badge badge-subtle">{r.status}</span> }
  ];

  const suppPerfColumns = [
    { header: 'Supplier Name', accessor: 'supplierName', render: r => <span style={{ fontWeight: 600 }}>{r.supplierName}</span> },
    { header: 'Orders Fulfilled', accessor: 'totalOrders' },
    { header: 'On-Time Delivery %', accessor: 'onTimeRate', render: r => <span style={{ color: 'var(--emerald-text)', fontWeight: 700 }}>{r.onTimeRate}</span> },
    { header: 'Defect / Rejection %', accessor: 'defectRate' },
    { header: 'Vendor Status', accessor: 'overallRating', render: r => <span className="badge badge-subtle">{r.overallRating}</span> }
  ];

  const tabTitles = {
    'pr-status': 'Buyer Purchase Requests Status',
    'purchase-register': 'Buyer Purchase Register',
    'payables-ageing': 'Payables Ageing Summary',
    'stock-ledger': 'Yard Material Stock Ledger',
    'receipt-variance': 'Material Receipt Variance Register',
    'returns-summary': 'Buyer Returns & Rejections Summary',
    'supplier-performance': 'Supplier Performance Metrics'
  };

  const getActiveDataset = () => {
    switch (tab) {
      case 'purchase-register': return { cols: purchaseColumns, rows: purchaseRegisterData, title: 'Purchase Register' };
      case 'payables-ageing': return { cols: ageingColumns, rows: payablesAgeingData, title: 'Payables Ageing' };
      case 'stock-ledger': return { cols: stockColumns, rows: stockLedgerData, title: 'Stock Ledger' };
      case 'receipt-variance': return { cols: varianceColumns, rows: receiptVarianceData, title: 'Receipt Variance' };
      case 'returns-summary': return { cols: retSummaryColumns, rows: returnsSummaryData, title: 'Returns Summary' };
      case 'supplier-performance': return { cols: suppPerfColumns, rows: supplierPerformanceData, title: 'Supplier Performance' };
      case 'pr-status':
      default:
        return { cols: prColumns, rows: prStatusData, title: 'PR Status' };
    }
  };

  const handleExportExcel = () => {
    const ds = getActiveDataset();
    exportToExcel(ds.rows, ds.cols, `Buyer_${ds.title.replace(/\s+/g, '_')}`);
  };

  const handleExportPDF = () => {
    const ds = getActiveDataset();
    exportToPDF(ds.rows, ds.cols, `Buyer - ${ds.title}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[tab] || 'Buyer Reports'}
          </h2>
          <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
            Showing records for <strong>{currentBuyer.name}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportExcel} title="Export to Excel">
            <FileSpreadsheet size={13} />
            <span>Excel</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportPDF} title="Print / PDF">
            <Printer size={13} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {tab === 'pr-status' && <DataTable columns={prColumns} data={prStatusData} emptyMessage="No purchase requests." />}
      {tab === 'purchase-register' && <DataTable columns={purchaseColumns} data={purchaseRegisterData} emptyMessage="No purchase invoices." />}
      {tab === 'payables-ageing' && <DataTable columns={ageingColumns} data={payablesAgeingData} emptyMessage="No ageing balance." />}
      {tab === 'stock-ledger' && <DataTable columns={stockColumns} data={stockLedgerData} emptyMessage="No stock data." />}
      {tab === 'receipt-variance' && <DataTable columns={varianceColumns} data={receiptVarianceData} emptyMessage="No receipt variances." />}
      {tab === 'returns-summary' && <DataTable columns={retSummaryColumns} data={returnsSummaryData} emptyMessage="No returns summary." />}
      {tab === 'supplier-performance' && <DataTable columns={suppPerfColumns} data={supplierPerformanceData} emptyMessage="No supplier metrics." />}
    </div>
  );
}
