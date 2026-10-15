import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  Download,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Ban
} from 'lucide-react';
import { DataTable, StatusBadge, ActionDropdown } from '../CommonComponents';

export function BuyerListScreen({
  onSelectBuyer,
  onOpenAdd,
  onOpenEdit,
  onDeleteBuyer,
  onRestoreBuyer,
  onToggleBlock
}) {
  const { customers, salesOrders, invoices, bulkArchiveCustomers, bulkRestoreCustomers, currentRole } = useApp();

  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive' | 'Blocked'
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Stats calculation
  const totalCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active' && !c.isArchived && !c.isBlocked).length;
  const blockedCount = customers.filter(c => c.isBlocked).length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive' || c.isArchived).length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  // Filtered dataset
  const filteredBuyers = useMemo(() => {
    return customers.filter(b => {
      // Status filter
      if (statusFilter === 'Active' && (b.status === 'Inactive' || b.isArchived || b.isBlocked)) return false;
      if (statusFilter === 'Inactive' && b.status !== 'Inactive' && !b.isArchived) return false;
      if (statusFilter === 'Blocked' && !b.isBlocked) return false;

      // Type filter
      if (typeFilter !== 'All' && b.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = (b.code || b.id || '').toLowerCase();
        const name = (b.name || '').toLowerCase();
        const city = (b.city || '').toLowerCase();
        const state = (b.state || '').toLowerCase();
        const phone = (b.phone || '').toLowerCase();
        const taxId = (b.taxId || b.pan || '').toLowerCase();
        return code.includes(q) || name.includes(q) || city.includes(q) || state.includes(q) || phone.includes(q) || taxId.includes(q);
      }

      return true;
    });
  }, [customers, statusFilter, typeFilter, searchQuery]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredBuyers.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      return [...prev, id];
    });
  };

  const handleBulkArchive = () => {
    if (window.confirm(`Archive ${selectedIds.length} selected buyer(s)?`)) {
      bulkArchiveCustomers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkRestore = () => {
    if (window.confirm(`Restore ${selectedIds.length} selected buyer(s) to Active?`)) {
      bulkRestoreCustomers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Buyer Name', 'Type', 'Tax ID (GSTIN)', 'PAN', 'Phone', 'Email', 'City', 'State', 'Credit Limit', 'Balance Outstanding', 'Credit Days', 'Status', 'Blocked'];
    const rows = filteredBuyers.map(b => [
      `"${b.code || b.id}"`,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${b.type || ''}"`,
      `"${b.taxId || ''}"`,
      `"${b.pan || ''}"`,
      `"${b.phone || ''}"`,
      `"${b.email || ''}"`,
      `"${b.city || ''}"`,
      `"${b.state || ''}"`,
      b.creditLimit || 0,
      b.balance || 0,
      b.creditDays || 30,
      `"${b.status || 'Active'}"`,
      b.isBlocked ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buyers_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to count orders
  const getOrderCount = (buyer) => {
    return salesOrders.filter(so => so.customerId === buyer.id || so.customer === buyer.name || (buyer.legacyId && so.customerId === buyer.legacyId)).length;
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={filteredBuyers.length > 0 && selectedIds.length === filteredBuyers.length}
          aria-label="Select all buyers"
          style={{ cursor: 'pointer' }}
        />
      ),
      width: '40px',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleToggleRow(row.id, e)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select buyer ${row.name}`}
          style={{ cursor: 'pointer' }}
        />
      )
    },
    {
      header: 'Buyer Code',
      accessor: 'code',
      render: (row) => (
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            onSelectBuyer(row.id);
          }}
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-color)' }}
        >
          {row.code || row.id}
          {row.isBlocked && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px', color: 'var(--rose-600)', fontSize: '10px', fontWeight: 700 }}>
              <Ban size={11} /> BLOCKED
            </span>
          )}
        </button>
      )
    },
    {
      header: 'Buyer / Client Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
            <span className="badge badge-subtle" style={{ fontSize: '10px' }}>
              {row.type || 'Direct End-User'}
            </span>
            {row.priceList && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>• {row.priceList}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Contact & Location',
      accessor: 'city',
      render: (row) => (
        <div style={{ fontSize: '12px' }}>
          {row.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ink)' }}>
              <Phone size={12} style={{ color: 'var(--muted)' }} /> {row.phone}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted)', marginTop: '2px' }}>
            <MapPin size={12} /> {row.city ? `${row.city}${row.state ? ', ' + row.state : ''}` : 'Location N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Credit & Outstanding',
      accessor: 'balance',
      render: (row) => {
        const limit = Number(row.creditLimit) || 0;
        const bal = Number(row.balance) || 0;
        const pct = limit > 0 ? Math.min(100, Math.round((bal / limit) * 100)) : 0;
        const isNearLimit = pct > 80;
        return (
          <div style={{ minWidth: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ color: bal > 0 ? (isNearLimit ? 'var(--rose-600)' : 'var(--ink)') : 'var(--muted)' }}>
                ₹{bal.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>
                / ₹{limit > 0 ? (limit / 100000).toFixed(1) + 'L' : '0'}
              </span>
            </div>
            {limit > 0 && (
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--line)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: row.isBlocked ? 'var(--rose-600)' : isNearLimit ? 'var(--amber-500)' : 'var(--teal-600)'
                  }}
                />
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
              {row.creditDays || 30} days credit • {getOrderCount(row)} orders
            </div>
          </div>
        );
      }
    },
    {
      header: 'Tax ID / GST',
      accessor: 'taxId',
      render: (row) => (
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div>{row.taxId || 'GST N/A'}</div>
          {row.pan && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>PAN: {row.pan}</div>}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        if (row.isBlocked) {
          return <span className="badge badge-ruby" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Ban size={10} /> Blocked</span>;
        }
        return <StatusBadge status={row.status || 'Active'} />;
      }
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isInactive = row.isArchived || row.status === 'Inactive';
        return (
          <ActionDropdown
            items={[
              {
                label: 'View Dossier / Details',
                icon: Eye,
                onClick: () => onSelectBuyer(row.id)
              },
              {
                label: 'Edit Buyer',
                icon: Edit,
                onClick: () => onOpenEdit(row)
              },
              ...(row.isBlocked ? [
                {
                  label: 'Unblock Buyer',
                  icon: CheckCircle2,
                  onClick: () => onToggleBlock && onToggleBlock(row.id)
                }
              ] : [
                {
                  label: 'Block Account',
                  icon: Ban,
                  danger: true,
                  confirm: `Block credit and orders for ${row.name}?`,
                  onClick: () => onToggleBlock && onToggleBlock(row.id)
                }
              ]),
              ...(isInactive ? [
                {
                  label: 'Restore Buyer',
                  icon: RotateCcw,
                  onClick: () => onRestoreBuyer(row.id)
                }
              ] : [
                {
                  label: 'Archive Buyer',
                  icon: Trash2,
                  danger: true,
                  confirm: `Archive buyer ${row.name || row.code}?`,
                  onClick: () => onDeleteBuyer(row.id)
                }
              ])
            ]}
          />
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Row (matching Inbound list page: no card, no background, no border, no padding) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            Buyers
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAdd}
          >
            <Plus size={14} />
            <span>Add Buyer</span>
          </button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredBuyers}
        onRowClick={(row) => onSelectBuyer(row.id)}
        emptyMessage="No buyers registered."
      />
    </div>
  );
}
