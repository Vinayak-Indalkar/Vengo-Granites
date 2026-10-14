import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge } from '../components/CommonComponents';
import { Plus } from 'lucide-react';

export function NotificationsScreen() {
  const { notifications } = useApp();

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Message', accessor: 'message' },
    { header: 'Type', accessor: 'type', render: r => <span className={`badge ${r.type === 'warning' ? 'badge-ruby' : 'badge-teal'}`}>{r.type}</span> },
    { header: 'Date', accessor: 'date' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
      </div>
      <DataTable columns={columns} data={notifications} emptyMessage="No notifications." />
    </div>
  );
}
