import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard, DataTable, StatusBadge } from '../components/CommonComponents';
import { Box, Layers, DollarSign, AlertTriangle, Truck, Clock, CheckCircle, FileText, ShoppingCart } from 'lucide-react';

export function Dashboard() {
  const {
    currentRole,
    rawBlocks = [],
    bundles = [],
    salesOrders = [],
    receipts = [],
    attendance = [],
    overtimeApprovals = [],
    customers = [],
    purchaseOrders = [],
    tradeSalesOrders = [],
    tradeInvoices = [],
    tradeBuyerPOs = [],
    tradeQuarryPOs = [],
    tradeGRNs = [],
    tradePRs = [],
    tradeDispatches = [],
    tradeChallans = [],
    activeBuyerId,
    clients = []
  } = useApp();

  // 1. QT Super Admin Dashboard
  if (currentRole === 'QT Super Admin') {
    const clientList = clients || [];
    const activeCount = clientList.filter(c => c.status === 'Active').length;

    const columns = [
      { header: 'Client ID', accessor: 'id' },
      { header: 'Company Name', accessor: 'name' },
      { header: 'Plan', accessor: 'plan' },
      { header: 'Validity', accessor: 'validity' },
      { header: 'Admin Contact', accessor: 'email' },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r?.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">QT Super Admin Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Active Clients" value={activeCount} subtext="Onboarded instances" />
          <StatCard label="Expiring Soon" value="0" subtext="All valid > 6 months" />
          <StatCard label="System Health" value="100%" subtext="All kiosks & services online" />
        </div>

        <div style={{ margin: '20px 0 12px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Onboarded Client Instances</h2>
        </div>
        <DataTable columns={columns} data={clientList} emptyMessage="No clients onboarded." />
      </div>
    );
  }

  // 2. Supplier/Client Admin Dashboard
  if (currentRole === 'Supplier/Client Admin') {
    const ordersList = tradeSalesOrders.length > 0 ? tradeSalesOrders : (salesOrders || []);
    const invList = tradeInvoices || [];
    const totalSalesAmount = invList.reduce((acc, i) => acc + (Number(i?.totalAmount) || 0), 0) ||
      ordersList.reduce((acc, s) => acc + (Number(s?.totalAmount) || 0), 0);

    const pendingOrdersCount = ordersList.filter(s => s?.status === 'Reserved' || s?.status === 'Draft' || s?.status === 'Confirmed').length;
    const openQuarryPOsCount = (tradeQuarryPOs || []).filter(q => q?.status === 'Open').length;
    const grnCount = (tradeGRNs || []).length;
    const blockCount = (rawBlocks || []).length;
    const totalBundleSqFt = (bundles || []).reduce((acc, b) => acc + (Number(b?.totalSqFt) || Number(b?.qtySqFt) || 0), 0);

    const recentOrdersCols = [
      { header: 'Order ID', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r?.id || '-'}</span> },
      { header: 'Buyer', accessor: 'buyerName', render: r => r?.buyerName || r?.customerName || '-' },
      { header: 'Date', accessor: 'date', render: r => r?.date || '-' },
      {
        header: 'Amount (₹)',
        accessor: 'totalAmount',
        render: r => <span style={{ fontWeight: 700 }}>₹{Number(r?.totalAmount || 0).toLocaleString()}</span>
      },
      { header: 'Credit Status', accessor: 'creditStatus', render: r => <span style={{ fontSize: '12px' }}>{r?.creditStatus || 'Cleared'}</span> },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r?.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Supplier / Client Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Total Invoiced Sales" value={`₹${totalSalesAmount.toLocaleString()}`} subtext={`${ordersList.length} orders tracked`} />
          <StatCard label="Pending Orders" value={pendingOrdersCount} subtext="Awaiting fulfillment / dispatch" />
          <StatCard label="Open Quarry POs" value={openQuarryPOsCount} subtext="Active quarry procurement" />
          <StatCard label="Raw Block Stock" value={`${blockCount} Blocks`} subtext="In Carrara Main Yard" />
          <StatCard label="Finished Slabs" value={`${totalBundleSqFt > 0 ? totalBundleSqFt.toLocaleString() : '18,500'} Sq.Ft`} subtext="Ready for dispatch" />
          <StatCard label="Inbound GRNs" value={grnCount} subtext="Weighbridge verified" />
        </div>

        <div style={{ margin: '20px 0 12px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Recent Sales Orders</h2>
        </div>
        <DataTable columns={recentOrdersCols} data={ordersList.slice(0, 5)} emptyMessage="No sales orders." />
      </div>
    );
  }

  // 3. Client HR Admin Dashboard
  if (currentRole === 'Client HR Admin') {
    const attList = attendance || [];
    const otList = overtimeApprovals || [];
    const presentCount = attList.filter(a => a?.status === 'Present').length;
    const absentCount = attList.filter(a => a?.status === 'Absent' || a?.status === 'Leave').length;
    const overtimeHours = otList.reduce((a, o) => a + (Number(o?.roundedOvertime) || 0), 0);

    const attCols = [
      { header: 'Date', accessor: 'date' },
      { header: 'Employee', accessor: 'employeeId' },
      { header: 'In Time', accessor: 'inTime' },
      { header: 'Out Time', accessor: 'outTime' },
      { header: 'Worked (Hrs)', accessor: 'workedHours', render: r => <span className="table-num">{r?.workedHours || 0}h</span> },
      { header: 'Overtime (Hrs)', accessor: 'overtimeHours', render: r => <span className="table-num">{r?.overtimeHours || 0}h</span> },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r?.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">HR & Workforce Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Present Today" value={presentCount} subtext={`${absentCount} on leave/absent`} />
          <StatCard label="Active Shifts" value="3 Shifts" subtext="Morning, Evening, Night" />
          <StatCard label="Total Overtime" value={`${overtimeHours} Hrs`} subtext="Approved & Pending" />
        </div>

        <div style={{ margin: '20px 0 12px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Recent Daily Attendance</h2>
        </div>
        <DataTable columns={attCols} data={attList.slice(0, 6)} emptyMessage="No attendance records." />
      </div>
    );
  }

  // 4. Buyer Admin Dashboard
  if (currentRole === 'Buyer Admin') {
    const myPRs = (tradePRs || []).filter(p => !activeBuyerId || p?.buyerId === activeBuyerId);
    const myInvoices = (tradeInvoices || []).filter(i => !activeBuyerId || i?.buyerId === activeBuyerId);
    const expectedShipments = (tradeDispatches || []).filter(d => {
      const ch = (tradeChallans || []).find(c => c?.id === d?.challanId);
      return (!activeBuyerId || ch?.buyerId === activeBuyerId) && d?.status !== 'Delivered';
    });

    const pendingPRCount = myPRs.filter(p => p?.status === 'Submitted' || p?.status === 'Pending').length;
    const expectedCount = expectedShipments.length;
    const outstandingDues = myInvoices.reduce((sum, inv) => sum + (Number(inv?.outstandingAmount) || (inv?.status === 'Paid' ? 0 : Number(inv?.totalAmount) || 0)), 0);

    const prCols = [
      { header: 'PR No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r?.id || '-'}</span> },
      { header: 'Date', accessor: 'date', render: r => r?.date || '-' },
      { header: 'Supplier', accessor: 'supplierName', render: r => r?.supplierName || 'Open Sourcing' },
      { header: 'Required Date', accessor: 'requiredDate', render: r => r?.requiredDate || '-' },
      {
        header: 'Total Est. (₹)',
        accessor: 'totalAmount',
        render: r => <span style={{ fontWeight: 700 }}>₹{Number(r?.totalAmount || 0).toLocaleString()}</span>
      },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r?.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Buyer Admin Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Active PRs" value={myPRs.length} subtext={`${pendingPRCount} awaiting supplier approval`} />
          <StatCard label="Expected Shipments" value={expectedCount} subtext="Dispatched / in transit" />
          <StatCard label="Outstanding Payables" value={`₹${outstandingDues.toLocaleString()}`} subtext="Due to supplier" />
          <StatCard label="Total Invoices" value={myInvoices.length} subtext="Billed purchase orders" />
        </div>

        <div style={{ margin: '20px 0 12px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Recent Purchase Requests</h2>
        </div>
        <DataTable columns={prCols} data={myPRs.slice(0, 5)} emptyMessage="No purchase requests." />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <p style={{ color: 'var(--muted)' }}>Select an active role from the top-right header to view role-specific dashboards.</p>
    </div>
  );
}
