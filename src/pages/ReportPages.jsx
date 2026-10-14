import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, StatusBadge } from '../components/CommonComponents';

// 1. Yield Report (by stage, quarry, stone type)
export function YieldReportScreen() {
  const { cutSlabs, polishedSlabs, finalBundles, blocks } = useApp();
  const [filterType, setFilterType] = useState('All');

  const rows = cutSlabs.map(cut => {
    const parentBlock = blocks.find(b => b.id === cut.blockId);
    const pol = polishedSlabs.find(p => p.cutSlabId === cut.id);
    const bundle = finalBundles.find(b => b.id === (pol ? pol.bundleId : ''));

    const weightTons = parentBlock ? (parentBlock.weightKg / 1000).toFixed(1) : '28.0';
    const rawSqFt = cut.totalSqFt || 1850;
    const finalSqFt = bundle ? bundle.totalSqFt : (pol ? pol.totalSqFt : rawSqFt);
    const yieldPct = Math.round((finalSqFt / rawSqFt) * 100);

    return {
      cutId: cut.id,
      blockId: cut.blockId,
      stoneCode: cut.stoneCode,
      quarry: parentBlock?.quarrySource || 'Carrara Q1',
      weightTons: `${weightTons}t`,
      cutSqFt: rawSqFt,
      finishSqFt: finalSqFt,
      yieldPct: `${yieldPct}%`,
      status: yieldPct >= 95 ? 'Optimal' : 'Normal'
    };
  });

  const stoneTypesList = ['All', ...new Set(rows.map(r => r.stoneCode))];
  const filtered = filterType === 'All' ? rows : rows.filter(r => r.stoneCode === filterType);

  const columns = [
    { header: 'Cut Batch', accessor: 'cutId' },
    { header: 'Raw Block', accessor: 'blockId' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Quarry', accessor: 'quarry' },
    { header: 'Block Wt', accessor: 'weightTons', render: r => <span className="table-num">{r.weightTons}</span> },
    { header: 'Cut Area', accessor: 'cutSqFt', render: r => <span className="table-num">{r.cutSqFt.toLocaleString()} sq.ft</span> },
    { header: 'Final Area', accessor: 'finishSqFt', render: r => <span className="table-num">{r.finishSqFt.toLocaleString()} sq.ft</span> },
    { header: 'Yield %', accessor: 'yieldPct', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.yieldPct}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Yield Report</h1>
      </div>

      <div className="toolbar">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select className="form-select" style={{ width: '160px', height: '32px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            {stoneTypesList.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No yield records." />
    </div>
  );
}

// 2. Stock Ledger Report
export function StockLedgerScreen() {
  const { stoneTypes, blocks, finalBundles } = useApp();

  const ledgerData = stoneTypes.map(st => {
    const rawTons = blocks
      .filter(b => b.stoneCode === st.code && b.status === 'In Yard')
      .reduce((acc, b) => acc + (b.weightKg / 1000), 0);

    const slabSqFt = finalBundles
      .filter(s => s.stoneCode === st.code)
      .reduce((acc, s) => acc + s.totalSqFt, 0);

    return {
      code: st.code,
      name: st.name,
      category: st.category,
      rawBlockTons: `${rawTons.toFixed(1)}t`,
      slabsInStock: slabSqFt,
      baseRate: `$${st.baseRateSqFt}`,
      valuation: `$${(slabSqFt * st.baseRateSqFt).toLocaleString()}`
    };
  });

  const columns = [
    { header: 'Stone Code', accessor: 'code' },
    { header: 'Stone Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Raw Blocks', accessor: 'rawBlockTons', render: r => <span className="table-num">{r.rawBlockTons}</span> },
    { header: 'Final Slabs', accessor: 'slabsInStock', render: r => <span className="table-num">{r.slabsInStock.toLocaleString()} sq.ft</span> },
    { header: 'Base Rate', accessor: 'baseRate', render: r => <span className="table-num">{r.baseRate}</span> },
    { header: 'Valuation', accessor: 'valuation', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.valuation}</span> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stock Ledger</h1>
      </div>

      <DataTable columns={columns} data={ledgerData} emptyMessage="No stock ledger entries." />
    </div>
  );
}

// 3. 3-Way Match Audit (PO vs GRN vs Supplier Bill)
export function ThreeWayMatchScreen() {
  const { purchaseOrders, receipts, supplierBills } = useApp();

  const matchData = purchaseOrders.map(po => {
    const grn = receipts.find(r => r.poId === po.id);
    const bill = supplierBills.find(b => b.poId === po.id);

    const poTons = po.tons;
    const grnTons = grn ? (grn.netKg / 1000).toFixed(1) : '0.0';
    const billAmount = bill ? `$${bill.amount.toLocaleString()}` : '$0';
    const isMatched = grn && bill && Math.abs(po.totalCost - (bill ? bill.amount : 0)) < 100;

    return {
      poId: po.id,
      supplier: po.supplier,
      poTons: `${poTons}t`,
      poCost: `$${po.totalCost.toLocaleString()}`,
      grnId: grn ? grn.id : 'Pending',
      grnTons: `${grnTons}t`,
      billId: bill ? bill.id : 'Pending',
      billAmount,
      status: isMatched ? 'Matched' : 'Discrepancy'
    };
  });

  const columns = [
    { header: 'PO ID', accessor: 'poId' },
    { header: 'Supplier', accessor: 'supplier' },
    { header: 'PO Qty', accessor: 'poTons', render: r => <span className="table-num">{r.poTons}</span> },
    { header: 'PO Amount', accessor: 'poCost', render: r => <span className="table-num">{r.poCost}</span> },
    { header: 'GRN Qty', accessor: 'grnTons', render: r => <span className="table-num">{r.grnTons}</span> },
    { header: 'Bill Amount', accessor: 'billAmount', render: r => <span className="table-num">{r.billAmount}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status === 'Matched' ? 'Optimal' : 'Attention'} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">3-Way Match</h1>
      </div>

      <DataTable columns={columns} data={matchData} emptyMessage="No procurement cycles." />
    </div>
  );
}

// 4. Sales Report / Daily Tally
export function SalesReportScreen() {
  const { salesOrders } = useApp();

  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Stone Code', accessor: 'stoneCode' },
    { header: 'Area', accessor: 'sqFt', render: r => <span className="table-num">{r.sqFt.toLocaleString()} sq.ft</span> },
    { header: 'Rate', accessor: 'rateSqFt', render: r => <span className="table-num">${r.rateSqFt}</span> },
    { header: 'Total', accessor: 'totalAmount', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.totalAmount.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Sales Report</h1>
      </div>

      <DataTable columns={columns} data={salesOrders} emptyMessage="No sales logged." />
    </div>
  );
}

// 5. Attendance & Overtime Report
export function AttendanceReportScreen() {
  const { attendanceLogs, employees } = useApp();

  const rows = attendanceLogs.map(log => {
    const emp = employees.find(e => e.id === log.employeeId);
    return {
      id: log.id,
      date: log.date,
      name: emp ? emp.name : log.employeeId,
      shift: log.shift,
      inTime: log.inTime,
      outTime: log.outTime,
      workedHours: `${log.workedHours}h`,
      overtimeHours: `${log.overtimeHours}h`,
      status: log.status
    };
  });

  const columns = [
    { header: 'Log ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Employee', accessor: 'name' },
    { header: 'Shift', accessor: 'shift' },
    { header: 'In Time', accessor: 'inTime' },
    { header: 'Out Time', accessor: 'outTime' },
    { header: 'Worked', accessor: 'workedHours', render: r => <span className="table-num">{r.workedHours}</span> },
    { header: 'Overtime', accessor: 'overtimeHours', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.overtimeHours}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Attendance Report</h1>
      </div>

      <DataTable columns={columns} data={rows} emptyMessage="No attendance records." />
    </div>
  );
}

// 6. Audit Trail
export function AuditLogScreen() {
  const { auditLogs } = useApp();

  const columns = [
    { header: 'Audit ID', accessor: 'id' },
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'Action', accessor: 'action', render: r => <span className="badge badge-teal">{r.action}</span> },
    { header: 'Entity Ref', accessor: 'entity', render: r => <span style={{ fontWeight: 600 }}>{r.entity}</span> },
    { header: 'User', accessor: 'user' },
    { header: 'Role', accessor: 'role' },
    { header: 'Details', accessor: 'details' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Audit Log</h1>
      </div>

      <DataTable columns={columns} data={auditLogs} emptyMessage="No audit logs recorded." />
    </div>
  );
}

// 7. End-of-Day Operations Summary
export function EndOfDayScreen() {
  const { receipts, salesOrders, finalBundles } = useApp();

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">End-of-Day</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="table-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Intake</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>{receipts.length} Trucks</div>
        </div>

        <div className="table-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Bundles</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>{finalBundles.length} Bundles</div>
        </div>

        <div className="table-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Dispatches</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>{salesOrders.length} Orders</div>
        </div>
      </div>
    </div>
  );
}
