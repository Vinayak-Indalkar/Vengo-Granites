import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard, DataTable, StatusBadge } from '../components/CommonComponents';
import { Box, Layers, DollarSign, AlertTriangle, Truck, Clock, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const { currentRole, rawBlocks, bundles, salesOrders, receipts, attendance, overtimeApprovals, customers, purchaseOrders } = useApp();

  // 1. QT Super Admin Dashboard (active clients, expiring validity, usage)
  if (currentRole === 'QT Super Admin') {
    const { clients } = useApp();
    const activeCount = clients.filter(c => c.status === 'Active').length;

    const columns = [
      { header: 'Client ID', accessor: 'id' },
      { header: 'Company Name', accessor: 'name' },
      { header: 'Plan', accessor: 'plan' },
      { header: 'Validity', accessor: 'validity' },
      { header: 'Admin Contact', accessor: 'email' },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
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

        <DataTable columns={columns} data={clients} emptyMessage="No clients onboarded." />
      </div>
    );
  }

  // 2. Supplier/Client Admin Dashboard
  if (currentRole === 'Supplier/Client Admin') {
    const todaySales = salesOrders.reduce((a, s) => a + (s.totalAmount || 0), 0);
    const openPOsCount = purchaseOrders.filter(p => p.status === 'Open' || p.status === 'Partially Received').length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent' || a.status === 'Leave').length;
    const overtimeHours = overtimeApprovals.reduce((a, o) => a + o.roundedOvertime, 0);
    const overdueCusts = customers.filter(c => c.isBlocked || c.balance > c.creditLimit).length;

    const blockTons = rawBlocks.reduce((a, b) => a + (b.weightTons || 0), 0);
    const finalSqFt = bundles.reduce((a, b) => a + (b.totalSqFt || 0), 0);

    const recentOrdersCols = [
      { header: 'Order ID', accessor: 'id' },
      { header: 'Customer', accessor: 'customerName' },
      { header: 'Stone', accessor: 'stoneCode' },
      { header: 'Sq.Ft', accessor: 'sqFt', render: r => <span className="table-num">{r.sqFt}</span> },
      { header: 'Amount ($)', accessor: 'totalAmount', render: r => <span className="table-num">${r.totalAmount.toLocaleString()}</span> },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Supplier / Client Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Today Sales" value={`$${todaySales.toLocaleString()}`} subtext={`${salesOrders.length} orders total`} />
          <StatCard label="Open POs" value={openPOsCount} subtext="Active procurement" />
          <StatCard label="Workforce Present" value={`${presentCount} / ${presentCount + absentCount}`} subtext={`${absentCount} absent/leave`} />
          <StatCard label="Overtime Today" value={`${overtimeHours} Hrs`} subtext="Requires approval" />
          <StatCard label="Overdue Customers" value={overdueCusts} subtext="Credit stop active" />
          <StatCard label="Final Stock" value={`${finalSqFt.toLocaleString()} Sq.Ft`} subtext={`${blockTons.toFixed(1)} MT blocks`} />
        </div>

        <DataTable columns={recentOrdersCols} data={salesOrders.slice(0, 5)} emptyMessage="No sales orders." />
      </div>
    );
  }

  // 3. Client HR Admin Dashboard
  if (currentRole === 'Client HR Admin') {
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent' || a.status === 'Leave').length;
    const overtimeHours = overtimeApprovals.reduce((a, o) => a + o.roundedOvertime, 0);

    const attCols = [
      { header: 'Date', accessor: 'date' },
      { header: 'Employee', accessor: 'employeeId' },
      { header: 'In Time', accessor: 'inTime' },
      { header: 'Out Time', accessor: 'outTime' },
      { header: 'Worked (Hrs)', accessor: 'workedHours', render: r => <span className="table-num">{r.workedHours}h</span> },
      { header: 'Overtime (Hrs)', accessor: 'overtimeHours', render: r => <span className="table-num">{r.overtimeHours}h</span> },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
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

        <DataTable columns={attCols} data={attendance} emptyMessage="No attendance records." />
      </div>
    );
  }

  // 4. Buyer Admin Dashboard
  if (currentRole === 'Buyer Admin') {
    const trucksToday = receipts.length;
    const ordersToDispatch = salesOrders.filter(s => s.status === 'Confirmed').length;
    const lowStock = bundles.filter(b => b.availableSqFt < 1500).length;

    const truckCols = [
      { header: 'GRN ID', accessor: 'id' },
      { header: 'Truck No', accessor: 'truckNumber' },
      { header: 'Stone', accessor: 'stoneCode' },
      { header: 'Net (Kg)', accessor: 'netKg', render: r => <span className="table-num">{r.netKg.toLocaleString()}</span> },
      { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
    ];

    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Buyer Admin Dashboard</h1>
        </div>

        <div className="stat-grid">
          <StatCard label="Trucks Today" value={trucksToday} subtext="Weighbridge receipts" />
          <StatCard label="Pending Orders" value={ordersToDispatch} subtext="In fulfillment" />
          <StatCard label="Lots Below Threshold" value={lowStock} subtext="Restock required" />
        </div>

        <DataTable columns={truckCols} data={receipts.slice(0, 5)} emptyMessage="No trucks weighed today." />
      </div>
    );
  }

  return null;
}
