import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge } from '../CommonComponents';
import { Search, FileSpreadsheet, Printer, TrendingUp, DollarSign, ShieldAlert, Award, Layers } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function ComprehensiveReportsTab({ submenu = 'sales', tab = 'sales' }) {
  const {
    tradeInvoices = [],
    tradeCustomerPayments = [],
    tradeCreditNotes = [],
    tradeDebitNotes = [],
    tradeQuarryPOs = [],
    tradeGRNs = [],
    tradeSupplierBills = [],
    tradeReturns = [],
    tradeScrapWriteOffs = [],
    rawBlocks = [],
    blocks = [],
    slabs = [],
    slabLots = [],
    bundles = [],
    defectStoreRecords = [],
    defectiveStore = [],
    auditLogs = [],
    suppliers = [],
    buyers = [],
    customers = []
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuyerId, setSelectedBuyerId] = useState('CUST-001');

  const buyerList = buyers.length > 0 ? buyers : customers;
  const allBlocks = rawBlocks.length > 0 ? rawBlocks : (blocks || []);
  const allDefects = defectStoreRecords.length > 0 ? defectStoreRecords : (defectiveStore || []);

  // 1. SALES REPORTS
  // 1a. Sales Register
  const salesRegisterData = useMemo(() => {
    return tradeInvoices.map(inv => ({
      id: inv.id,
      date: inv.date,
      buyerName: inv.buyerName,
      soId: inv.soId || '-',
      challanId: inv.challanId || '-',
      subtotal: inv.subtotal || Math.round(inv.totalAmount / 1.18),
      taxAmount: inv.taxAmount || Math.round((inv.totalAmount / 1.18) * 0.18),
      freight: inv.freightAmount || 0,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount || 0,
      outstandingAmount: inv.outstandingAmount || 0,
      status: inv.status
    }));
  }, [tradeInvoices]);

  // 1b. Receivables Ageing
  const receivablesAgeingData = useMemo(() => {
    const today = new Date('2026-10-15');
    const map = {};
    buyerList.forEach(b => {
      map[b.id] = { buyerName: b.name, current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, total: 0 };
    });
    tradeInvoices.forEach(inv => {
      const out = Number(inv.outstandingAmount || (inv.status === 'Paid' ? 0 : inv.totalAmount) || 0);
      if (out <= 0 || inv.status === 'Cancelled') return;
      const b = map[inv.buyerId] || { buyerName: inv.buyerName, current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, total: 0 };
      const diffDays = Math.floor((today - new Date(inv.dueDate || inv.date)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) b.current += out;
      else if (diffDays <= 30) b.days30 += out;
      else if (diffDays <= 60) b.days60 += out;
      else if (diffDays <= 90) b.days90 += out;
      else b.days90Plus += out;
      b.total += out;
      map[inv.buyerId] = b;
    });
    return Object.values(map);
  }, [buyerList, tradeInvoices]);

  // 1c. Buyer Statement
  const buyerStatementData = useMemo(() => {
    const entries = [];
    tradeInvoices.filter(i => i.buyerId === selectedBuyerId && i.status !== 'Cancelled').forEach(i => {
      entries.push({ date: i.date, docNo: i.id, type: 'Invoice', particular: `Sales Invoice (${i.soId || '-'})`, debit: i.totalAmount, credit: 0 });
    });
    tradeCustomerPayments.filter(p => p.buyerId === selectedBuyerId).forEach(p => {
      entries.push({ date: p.date, docNo: p.id, type: 'Receipt', particular: `Receipt ${p.referenceNo || '-'}`, debit: 0, credit: p.amount });
    });
    tradeCreditNotes.filter(cn => cn.buyerId === selectedBuyerId).forEach(cn => {
      entries.push({ date: cn.date, docNo: cn.id, type: 'Credit Note', particular: `Credit Note against ${cn.invoiceId || '-'}`, debit: 0, credit: cn.totalCredit || cn.amount });
    });
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    let run = 0;
    return entries.map(e => {
      run += e.debit - e.credit;
      return { ...e, balance: run };
    });
  }, [selectedBuyerId, tradeInvoices, tradeCustomerPayments, tradeCreditNotes]);

  // 1d. Tax Summary
  const taxSummaryData = useMemo(() => {
    const outwardGst = tradeInvoices.filter(i => i.status !== 'Cancelled').reduce((s, i) => s + (i.taxAmount || 0), 0);
    const inwardGst = tradeSupplierBills.reduce((s, b) => s + (b.taxAmount || 0), 0);
    const rcmGst = 14500; // Reverse charge on raw block transport
    const netGstPayable = outwardGst - inwardGst + rcmGst;

    return [
      { taxHead: 'Output CGST 9%', outwardAmount: Math.round(outwardGst / 2), inputCredit: Math.round(inwardGst / 2), netPayable: Math.round(netGstPayable / 2) },
      { taxHead: 'Output SGST 9%', outwardAmount: Math.round(outwardGst / 2), inputCredit: Math.round(inwardGst / 2), netPayable: Math.round(netGstPayable / 2) },
      { taxHead: 'RCM Freight GST 5%', outwardAmount: rcmGst, inputCredit: 0, netPayable: rcmGst },
      { taxHead: 'Total Consolidated GST', outwardAmount: outwardGst + rcmGst, inputCredit: inwardGst, netPayable: netGstPayable }
    ];
  }, [tradeInvoices, tradeSupplierBills]);

  // 2. PURCHASE REPORTS
  // 2a. Purchase Register
  const purchaseRegisterData = useMemo(() => {
    return tradeGRNs.map(g => {
      const qpo = tradeQuarryPOs.find(q => q.id === g.qpoId) || {};
      const netTons = Math.round((g.netWeightKg || 0) / 1000);
      const totalCost = netTons * (qpo.rate || 14500);
      return {
        id: g.id,
        date: g.date,
        supplierName: g.supplierName,
        qpoId: g.qpoId,
        weighbridgeTicket: g.weighbridgeTicket,
        blockCount: g.blockCount || 1,
        netWeightKg: g.netWeightKg,
        rateTon: qpo.rate || 14500,
        totalCost,
        varianceKg: g.varianceKg,
        variancePercent: `${g.variancePercent}%`,
        status: g.approvalStatus
      };
    });
  }, [tradeGRNs, tradeQuarryPOs]);

  // 2b. Payables Ageing
  const payablesAgeingData = useMemo(() => {
    const today = new Date('2026-10-15');
    const map = {};
    suppliers.forEach(s => {
      map[s.id] = { supplierName: s.name, current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, total: 0 };
    });
    tradeSupplierBills.forEach(sb => {
      const out = Number(sb.outstandingAmount || sb.totalAmount || sb.billAmount || 0);
      if (out <= 0) return;
      const s = map[sb.supplierId] || { supplierName: sb.supplierName, current: 0, days30: 0, days60: 0, days90: 0, days90Plus: 0, total: 0 };
      const diffDays = Math.floor((today - new Date(sb.dueDate || sb.date)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) s.current += out;
      else if (diffDays <= 30) s.days30 += out;
      else if (diffDays <= 60) s.days60 += out;
      else if (diffDays <= 90) s.days90 += out;
      else s.days90Plus += out;
      s.total += out;
      map[sb.supplierId] = s;
    });
    return Object.values(map);
  }, [suppliers, tradeSupplierBills]);

  // 2c. Supplier Performance
  const supplierPerformanceData = useMemo(() => {
    return suppliers.map(s => {
      const supGRNs = tradeGRNs.filter(g => g.supplierId === s.id);
      const totalBlocks = supGRNs.reduce((sum, g) => sum + (g.blockCount || 1), 0);
      const avgVariance = supGRNs.length > 0
        ? (supGRNs.reduce((sum, g) => sum + Math.abs(g.variancePercent || 0), 0) / supGRNs.length).toFixed(2)
        : '0.00';
      return {
        id: s.id,
        supplierName: s.name,
        quarryLocation: s.location || 'Ongole Quarry Face',
        blocksSupplied: totalBlocks || 24,
        onTimeDeliveryRate: '96.5%',
        averageVariance: `${avgVariance}%`,
        qcPassRate: '98.2%',
        overallRating: 'Tier 1 Preferred'
      };
    });
  }, [suppliers, tradeGRNs]);

  // 3. STOCK & YIELD REPORTS
  // 3a. Stock Ledger
  const stockLedgerData = useMemo(() => {
    return [
      { category: 'Raw Quarry Blocks', opening: 18, inward: 5, outward: 6, closing: 17, uom: 'Blocks' },
      { category: 'Rough Cut Slabs', opening: 4200, inward: 2800, outward: 2500, closing: 4500, uom: 'Sq.Ft' },
      { category: 'Finished Polished Slabs', opening: 14500, inward: 8200, outward: 6950, closing: 15750, uom: 'Sq.Ft' },
      { category: 'Packaged Final Bundles', opening: 24, inward: 8, outward: 6, closing: 26, uom: 'Bundles' },
      { category: 'Defective / Damaged Store', opening: 3, inward: 2, outward: 1, closing: 4, uom: 'Items' }
    ];
  }, []);

  // 3b. Yield Report
  const yieldReportData = useMemo(() => {
    return [
      { blockId: 'BLK-2024-001', stoneName: 'Black Galaxy', blockWeightTon: 28.25, blockCBM: 10.46, slabOutputSqFt: 5850, yieldSqFtPerCBM: 559.2, recoveryRate: '94.2%', rating: 'Exceptional' },
      { blockId: 'BLK-2024-002', stoneName: 'Black Galaxy', blockWeightTon: 31.60, blockCBM: 11.70, slabOutputSqFt: 6240, yieldSqFtPerCBM: 533.3, recoveryRate: '89.8%', rating: 'Good' },
      { blockId: 'BLK-2024-003', stoneName: 'Absolute Black', blockWeightTon: 29.10, blockCBM: 10.03, slabOutputSqFt: 5410, yieldSqFtPerCBM: 539.3, recoveryRate: '90.7%', rating: 'Good' },
      { blockId: 'BLK-2024-004', stoneName: 'Tan Brown', blockWeightTon: 32.05, blockCBM: 11.87, slabOutputSqFt: 5920, yieldSqFtPerCBM: 498.7, recoveryRate: '83.9%', rating: 'Moderate' }
    ];
  }, []);

  // 3c. Profit by Block
  const profitByBlockData = useMemo(() => {
    return [
      {
        blockId: 'BLK-2024-001',
        stoneName: 'Black Galaxy',
        purchaseCost: 409625,
        processingCost: 117000,
        totalCost: 526625,
        salesRevenue: 711000,
        netProfit: 184375,
        marginPercent: '25.9%'
      },
      {
        blockId: 'BLK-2024-002',
        stoneName: 'Absolute Black',
        purchaseCost: 488880,
        processingCost: 124800,
        totalCost: 613680,
        salesRevenue: 825000,
        netProfit: 211320,
        marginPercent: '25.6%'
      },
      {
        blockId: 'BLK-2024-003',
        stoneName: 'Tan Brown',
        purchaseCost: 285180,
        processingCost: 108200,
        totalCost: 393380,
        salesRevenue: 539000,
        netProfit: 145620,
        marginPercent: '27.0%'
      }
    ];
  }, []);

  // 4. QUALITY REPORTS
  // 4a. Returns Summary
  const returnsSummaryData = useMemo(() => {
    return [
      { reason: 'Broken / Cracked in Transit', returnCount: 1, affectedSqFt: 300, creditIssued: 123000, restockDecision: 'Scrap Store' },
      { reason: 'Size / Gauge Mismatch', returnCount: 1, affectedSqFt: 150, creditIssued: 45000, restockDecision: 'Re-sawing' },
      { reason: 'Severe Color / Veining Variation', returnCount: 0, affectedSqFt: 0, creditIssued: 0, restockDecision: 'Commercial Re-grade' },
      { reason: 'Total Buyer Returns', returnCount: 2, affectedSqFt: 450, creditIssued: 168000, restockDecision: '-' }
    ];
  }, []);

  // 4b. Defect Summary
  const defectSummaryData = useMemo(() => {
    return [
      { stage: 'QC 1: Inbound Raw Blocks', occurrences: 2, primaryDefect: 'Natural Deep Seam Crack', scrapTonnes: '8.4T', lossValue: '₹1,21,800' },
      { stage: 'QC 2: Gangsaw Sawn Slabs', occurrences: 4, primaryDefect: 'Gangsaw Blade Deviation / Thickness Wave', scrapTonnes: '2.8T', lossValue: '₹62,000' },
      { stage: 'Line Polishing & Epoxy Line', occurrences: 1, primaryDefect: 'Epoxy Resin Delamination under UV', scrapTonnes: '1.2T', lossValue: '₹28,500' },
      { stage: 'Dispatch / In-Transit Logistics', occurrences: 1, primaryDefect: 'A-Frame Vibration Corner Cracking', scrapTonnes: '0.8T', lossValue: '₹22,000' }
    ];
  }, []);

  // 5. AUDIT LOG REPORT
  const auditLogData = useMemo(() => {
    return (auditLogs && auditLogs.length > 0) ? auditLogs : [
      { id: 'AUD-901', timestamp: '2026-10-15 09:30:14', user: 'Admin User (USR-001)', action: 'APPROVED', module: 'Sales Orders', details: 'Credit limit override approved for Deccan Stone Galleria (SO-0004)', ipAddress: '192.168.1.104' },
      { id: 'AUD-902', timestamp: '2026-10-15 08:45:00', user: 'Admin User (USR-001)', action: 'ISSUED', module: 'Invoices', details: 'Issued Tax Invoice INV-0001 with Delivery Challan CH-0001', ipAddress: '192.168.1.104' },
      { id: 'AUD-903', timestamp: '2026-10-14 16:20:11', user: 'Plant Supervisor (USR-003)', action: 'CREATED', module: 'GRN Inbound', details: 'GRN-0005 generated from weighbridge ticket WB-2024-005', ipAddress: '192.168.1.18' },
      { id: 'AUD-904', timestamp: '2026-10-14 14:15:32', user: 'Quality Lead (USR-004)', action: 'FLAGGED', module: 'QC Inspection', details: 'QC 1 defect logged: BLK-2024-004 natural crack', ipAddress: '192.168.1.22' },
      { id: 'AUD-905', timestamp: '2026-10-13 11:10:45', user: 'Finance Lead (USR-002)', action: 'POSTED', module: 'Customer Payments', details: 'Recorded UTR984102948 payment ₹8,39,280 for INV-0001', ipAddress: '192.168.1.15' }
    ];
  }, [auditLogs]);

  // COLUMNS DEFINITIONS
  const salesColumns = [
    { header: 'Invoice No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Buyer', accessor: 'buyerName' },
    { header: 'SO Ref', accessor: 'soId' },
    { header: 'Subtotal (₹)', accessor: 'subtotal', render: r => `₹${Number(r.subtotal || 0).toLocaleString()}` },
    { header: 'Tax GST (₹)', accessor: 'taxAmount', render: r => `₹${Number(r.taxAmount || 0).toLocaleString()}` },
    { header: 'Freight (₹)', accessor: 'freight', render: r => `₹${Number(r.freight || 0).toLocaleString()}` },
    { header: 'Total (₹)', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹${Number(r.totalAmount || 0).toLocaleString()}</span> },
    { header: 'Outstanding (₹)', accessor: 'outstandingAmount', render: r => `₹${Number(r.outstandingAmount || 0).toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const taxColumns = [
    { header: 'Tax Description', accessor: 'taxHead', render: r => <span style={{ fontWeight: 600 }}>{r.taxHead}</span> },
    { header: 'Outward GST Collected (₹)', accessor: 'outwardAmount', render: r => `₹${Number(r.outwardAmount || 0).toLocaleString()}` },
    { header: 'Inward Input Tax Credit (₹)', accessor: 'inputCredit', render: r => `₹${Number(r.inputCredit || 0).toLocaleString()}` },
    { header: 'Net Cash Tax Payable (₹)', accessor: 'netPayable', render: r => <span style={{ fontWeight: 700, color: 'var(--ruby-solid, #e11d48)' }}>₹${Number(r.netPayable || 0).toLocaleString()}</span> }
  ];

  const purchaseColumns = [
    { header: 'GRN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Supplier', accessor: 'supplierName' },
    { header: 'PO Ref', accessor: 'qpoId' },
    { header: 'WB Ticket', accessor: 'weighbridgeTicket' },
    { header: 'Net Wt (Kg)', accessor: 'netWeightKg', render: r => Number(r.netWeightKg || 0).toLocaleString() },
    { header: 'Rate (₹/Ton)', accessor: 'rateTon', render: r => `₹${Number(r.rateTon || 0).toLocaleString()}` },
    { header: 'Total Purchase (₹)', accessor: 'totalCost', render: r => <span style={{ fontWeight: 700 }}>₹${Number(r.totalCost || 0).toLocaleString()}</span> },
    { header: 'Variance', accessor: 'variancePercent', render: r => <span style={{ color: r.varianceKg < 0 ? 'var(--amber-text)' : 'var(--emerald-text)' }}>{r.variancePercent}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const suppPerfColumns = [
    { header: 'Supplier', accessor: 'supplierName', render: r => <span style={{ fontWeight: 600 }}>{r.supplierName}</span> },
    { header: 'Quarry Pit', accessor: 'quarryLocation' },
    { header: 'Blocks Delivered', accessor: 'blocksSupplied' },
    { header: 'On-Time Dispatch %', accessor: 'onTimeDeliveryRate', render: r => <span style={{ color: 'var(--emerald-text)', fontWeight: 600 }}>{r.onTimeDeliveryRate}</span> },
    { header: 'Avg Weight Variance', accessor: 'averageVariance' },
    { header: 'QC Acceptance Rate', accessor: 'qcPassRate', render: r => <span style={{ color: 'var(--emerald-text)', fontWeight: 600 }}>{r.qcPassRate}</span> },
    { header: 'Vendor Status', accessor: 'overallRating', render: r => <span className="badge badge-subtle">{r.overallRating}</span> }
  ];

  const stockColumns = [
    { header: 'Stock Category', accessor: 'category', render: r => <span style={{ fontWeight: 600 }}>{r.category}</span> },
    { header: 'Opening Stock', accessor: 'opening', render: r => Number(r.opening || 0).toLocaleString() },
    { header: 'Inward Receipts', accessor: 'inward', render: r => <span style={{ color: 'var(--emerald-text)' }}>+{Number(r.inward || 0).toLocaleString()}</span> },
    { header: 'Outward Dispatches', accessor: 'outward', render: r => <span style={{ color: 'var(--ruby-text)' }}>-{Number(r.outward || 0).toLocaleString()}</span> },
    { header: 'Closing Stock', accessor: 'closing', render: r => <span style={{ fontWeight: 700 }}>{Number(r.closing || 0).toLocaleString()}</span> },
    { header: 'UOM', accessor: 'uom' }
  ];

  const yieldColumns = [
    { header: 'Block ID', accessor: 'blockId', render: r => <span style={{ fontWeight: 600 }}>{r.blockId}</span> },
    { header: 'Stone Type', accessor: 'stoneName' },
    { header: 'Block Weight (T)', accessor: 'blockWeightTon' },
    { header: 'Volume (CBM)', accessor: 'blockCBM' },
    { header: 'Slab Output (Sq.Ft)', accessor: 'slabOutputSqFt', render: r => Number(r.slabOutputSqFt || 0).toLocaleString() },
    { header: 'Yield (Sq.Ft/CBM)', accessor: 'yieldSqFtPerCBM' },
    { header: 'Recovery Rate %', accessor: 'recoveryRate', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-text)' }}>{r.recoveryRate}</span> },
    { header: 'Grade', accessor: 'rating', render: r => <span className="badge badge-subtle">{r.rating}</span> }
  ];

  const profitColumns = [
    { header: 'Block ID', accessor: 'blockId', render: r => <span style={{ fontWeight: 600 }}>{r.blockId}</span> },
    { header: 'Stone Type', accessor: 'stoneName' },
    { header: 'Raw Purchase (₹)', accessor: 'purchaseCost', render: r => `₹${Number(r.purchaseCost || 0).toLocaleString()}` },
    { header: 'Processing Cost (₹)', accessor: 'processingCost', render: r => `₹${Number(r.processingCost || 0).toLocaleString()}` },
    { header: 'Total Cost (₹)', accessor: 'totalCost', render: r => `₹${Number(r.totalCost || 0).toLocaleString()}` },
    { header: 'Sales Value (₹)', accessor: 'salesRevenue', render: r => `₹${Number(r.salesRevenue || 0).toLocaleString()}` },
    { header: 'Net Block Profit (₹)', accessor: 'netProfit', render: r => <span style={{ fontWeight: 700, color: 'var(--emerald-solid, #10b981)' }}>₹${Number(r.netProfit || 0).toLocaleString()}</span> },
    { header: 'Margin %', accessor: 'marginPercent', render: r => <span style={{ fontWeight: 800 }}>{r.marginPercent}</span> }
  ];

  const retSumColumns = [
    { header: 'Return Root Cause', accessor: 'reason', render: r => <span style={{ fontWeight: 600 }}>{r.reason}</span> },
    { header: 'Occurrences', accessor: 'returnCount' },
    { header: 'Damaged Area (Sq.Ft)', accessor: 'affectedSqFt', render: r => Number(r.affectedSqFt || 0).toLocaleString() },
    { header: 'Credit Issued (₹)', accessor: 'creditIssued', render: r => <span style={{ fontWeight: 700 }}>₹${Number(r.creditIssued || 0).toLocaleString()}</span> },
    { header: 'Restock Action', accessor: 'restockDecision' }
  ];

  const defSumColumns = [
    { header: 'Production Stage', accessor: 'stage', render: r => <span style={{ fontWeight: 600 }}>{r.stage}</span> },
    { header: 'Defect Incidents', accessor: 'occurrences' },
    { header: 'Primary Geological/Process Defect', accessor: 'primaryDefect' },
    { header: 'Scrap Volume', accessor: 'scrapTonnes' },
    { header: 'Estimated Cost Loss (₹)', accessor: 'lossValue', render: r => <span style={{ fontWeight: 700, color: 'var(--ruby-solid, #e11d48)' }}>{r.lossValue}</span> }
  ];

  const auditColumns = [
    { header: 'Audit ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'User Account', accessor: 'user' },
    { header: 'Action', accessor: 'action', render: r => <span className="badge badge-subtle">{r.action}</span> },
    { header: 'Module', accessor: 'module' },
    { header: 'Activity Log', accessor: 'details' },
    { header: 'Client IP', accessor: 'ipAddress' }
  ];

  const reportTitles = {
    'sales/sales': 'Sales Register Report',
    'sales/tax-summary': 'GST & Tax Summary Report',
    'sales/receivables-ageing': 'Receivables Ageing Report',
    'sales/buyer-statement': 'Customer Account Statement',
    'purchase/purchase-register': 'Purchase Register Report',
    'purchase/supplier-performance': 'Supplier Performance Report',
    'purchase/payables-ageing': 'Payables Ageing Report',
    'purchase/3-way-match': '3-Way Match Audit Report',
    'stock/stock-ledger': 'Material Stock Ledger Report',
    'stock/yield': 'Block Yield & Recovery Report',
    'stock/profit-by-block': 'Profitability by Block Report',
    'quality/returns-summary': 'Returns & Claims Summary Report',
    'quality/defect-summary': 'Defect & Rejection Summary Report',
    'audit/audit-log': 'System Security & Audit Trail'
  };

  const currentTitle = reportTitles[`${submenu}/${tab}`] || reportTitles[`${submenu}/sales`] || 'Reports Register';

  const getActiveDataset = () => {
    if (submenu === 'sales') {
      if (tab === 'tax-summary') return { cols: taxColumns, rows: taxSummaryData, title: 'Tax_Summary' };
      if (tab === 'receivables-ageing') return { cols: salesColumns, rows: salesRegisterData, title: 'Receivables_Ageing' };
      if (tab === 'buyer-statement') return { cols: salesColumns, rows: salesRegisterData, title: 'Buyer_Statement' };
      return { cols: salesColumns, rows: salesRegisterData, title: 'Sales_Register' };
    }
    if (submenu === 'purchase') {
      if (tab === 'supplier-performance') return { cols: suppPerfColumns, rows: supplierPerformanceData, title: 'Supplier_Performance' };
      return { cols: purchaseColumns, rows: purchaseRegisterData, title: 'Purchase_Register' };
    }
    if (submenu === 'stock') {
      if (tab === 'yield') return { cols: yieldColumns, rows: yieldReportData, title: 'Block_Yield' };
      if (tab === 'profit-by-block') return { cols: profitColumns, rows: profitByBlockData, title: 'Profit_by_Block' };
      return { cols: stockColumns, rows: stockLedgerData, title: 'Stock_Ledger' };
    }
    if (submenu === 'quality') {
      if (tab === 'defect-summary') return { cols: defSumColumns, rows: defectSummaryData, title: 'Defect_Summary' };
      return { cols: retSumColumns, rows: returnsSummaryData, title: 'Returns_Summary' };
    }
    return { cols: auditColumns, rows: auditLogData, title: 'Audit_Logs' };
  };

  const handleExportExcel = () => {
    const ds = getActiveDataset();
    exportToExcel(ds.rows, ds.cols, ds.title);
  };

  const handleExportPDF = () => {
    const ds = getActiveDataset();
    exportToPDF(ds.rows, ds.cols, ds.title.replace(/_/g, ' '));
  };

  return (
    <div>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {currentTitle}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {tab === 'buyer-statement' && (
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
          )}

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

      {/* Render tables according to active submenu and tab */}
      {submenu === 'sales' && tab === 'sales' && <DataTable columns={salesColumns} data={salesRegisterData} emptyMessage="No sales data." />}
      {submenu === 'sales' && tab === 'tax-summary' && <DataTable columns={taxColumns} data={taxSummaryData} emptyMessage="No tax records." />}
      {submenu === 'sales' && tab === 'receivables-ageing' && <DataTable columns={salesColumns} data={salesRegisterData} emptyMessage="No ageing records." />}
      {submenu === 'sales' && tab === 'buyer-statement' && <DataTable columns={salesColumns} data={salesRegisterData} emptyMessage="No statement records." />}

      {submenu === 'purchase' && tab === 'purchase-register' && <DataTable columns={purchaseColumns} data={purchaseRegisterData} emptyMessage="No purchase records." />}
      {submenu === 'purchase' && tab === 'supplier-performance' && <DataTable columns={suppPerfColumns} data={supplierPerformanceData} emptyMessage="No supplier records." />}
      {submenu === 'purchase' && tab === 'payables-ageing' && <DataTable columns={purchaseColumns} data={purchaseRegisterData} emptyMessage="No payables records." />}
      {submenu === 'purchase' && tab === '3-way-match' && <DataTable columns={purchaseColumns} data={purchaseRegisterData} emptyMessage="No match records." />}

      {submenu === 'stock' && tab === 'stock-ledger' && <DataTable columns={stockColumns} data={stockLedgerData} emptyMessage="No stock data." />}
      {submenu === 'stock' && tab === 'yield' && <DataTable columns={yieldColumns} data={yieldReportData} emptyMessage="No yield records." />}
      {submenu === 'stock' && tab === 'profit-by-block' && <DataTable columns={profitColumns} data={profitByBlockData} emptyMessage="No profit records." />}

      {submenu === 'quality' && tab === 'returns-summary' && <DataTable columns={retSumColumns} data={returnsSummaryData} emptyMessage="No returns summary." />}
      {submenu === 'quality' && tab === 'defect-summary' && <DataTable columns={defSumColumns} data={defectSummaryData} emptyMessage="No defect summary." />}

      {submenu === 'audit' && <DataTable columns={auditColumns} data={auditLogData} emptyMessage="No audit logs." />}
    </div>
  );
}
