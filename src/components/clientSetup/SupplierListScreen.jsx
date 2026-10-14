import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Layers,
  Phone,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  Download,
  CheckSquare,
  Square,
  ShieldCheck,
  Truck,
  Scale,
  DollarSign
} from 'lucide-react';
import { DataTable, StatusBadge } from '../CommonComponents';

export function SupplierListScreen({
  onSelectSupplier,
  onOpenAdd,
  onOpenEdit,
  onDeleteSupplier,
  onRestoreSupplier
}) {
  const { suppliers, purchaseOrders, detailedRawBlocks, bulkArchiveSuppliers, bulkRestoreSuppliers, currentRole } = useApp();

  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Stats calculation
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter(s => s.status === 'Active' && !s.isArchived).length;
  const inactiveCount = suppliers.filter(s => s.status === 'Inactive' || s.isArchived).length;
  const quarryCount = suppliers.filter(s => s.type === 'Quarry' || s.type === 'Mine').length;

  // Filtered dataset
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Status filter
      if (statusFilter === 'Active' && (s.status === 'Inactive' || s.isArchived)) return false;
      if (statusFilter === 'Inactive' && s.status !== 'Inactive' && !s.isArchived) return false;

      // Type filter
      if (typeFilter !== 'All' && s.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = (s.code || s.id || '').toLowerCase();
        const name = (s.name || '').toLowerCase();
        const city = (s.city || '').toLowerCase();
        const country = (s.country || '').toLowerCase();
        const phone = (s.phone || s.contact || '').toLowerCase();
        const taxId = (s.taxId || '').toLowerCase();
        return code.includes(q) || name.includes(q) || city.includes(q) || country.includes(q) || phone.includes(q) || taxId.includes(q);
      }

      return true;
    });
  }, [suppliers, statusFilter, typeFilter, searchQuery]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredSuppliers.map(s => s.id));
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
    if (window.confirm(`Archive ${selectedIds.length} selected supplier(s)?`)) {
      bulkArchiveSuppliers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkRestore = () => {
    if (window.confirm(`Restore ${selectedIds.length} selected supplier(s) to Active?`)) {
      bulkRestoreSuppliers(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkExportCSV = () => {
    const rowsToExport = suppliers.filter(s => selectedIds.includes(s.id));
    const header = ['Code', 'Name', 'Type', 'Status', 'Tax ID', 'Phone', 'Email', 'City', 'Country', 'Payment Days'];
    const csvContent = [
      header.join(','),
      ...rowsToExport.map(s => [
        `"${s.code || s.id}"`,
        `"${s.name}"`,
        `"${s.type || 'Quarry'}"`,
        `"${s.status || 'Active'}"`,
        `"${s.taxId || ''}"`,
        `"${s.phone || s.contact || ''}"`,
        `"${s.email || ''}"`,
        `"${s.city || ''}"`,
        `"${s.country || ''}"`,
        `"${s.paymentDays || 30}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `suppliers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={filteredSuppliers.length > 0 && selectedIds.length === filteredSuppliers.length}
          onChange={handleSelectAll}
          onClick={e => e.stopPropagation()}
        />
      ),
      width: '40px',
      render: r => (
        <input
          type="checkbox"
          checked={selectedIds.includes(r.id)}
          onChange={e => handleToggleRow(r.id, e)}
          onClick={e => e.stopPropagation()}
        />
      )
    },
    {
      header: 'Code',
      accessor: 'code',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-color)' }}>
          {r.code || r.id}
        </span>
      )
    },
    {
      header: 'Supplier & Quarry Name',
      render: r => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ color: 'var(--ink)' }}>{r.name}</strong>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {r.quarryName ? r.quarryName : (r.materialType || 'Quarry / Natural Stone')}
          </span>
        </div>
      )
    },
    {
      header: 'Type',
      render: r => (
        <span className={`badge ${r.type === 'Mine' ? 'badge-amber' : r.type === 'Material Vendor' ? 'badge-teal' : 'badge-cobalt'}`}>
          {r.type || 'Quarry'}
        </span>
      )
    },
    {
      header: 'Phone / Contact',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          {r.phone || r.contact || '—'}
        </span>
      )
    },
    {
      header: 'City / Location',
      render: r => (
        <span>
          {r.city ? `${r.city}, ${r.country || ''}` : r.country || 'Global'}
        </span>
      )
    },
    {
      header: 'Rating',
      render: r => (
        <span className="badge badge-emerald">
          {r.rating || 'A'} ({r.qualityScore || 90}%)
        </span>
      )
    },
    {
      header: 'Status',
      render: r => <StatusBadge status={r.status || 'Active'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: r => {
        const isRowInactive = r.status === 'Inactive' || r.isArchived;
        return (
          <div
            style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onSelectSupplier(r.id)}
              title="View Detailed Dossier"
            >
              <Eye size={14} />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onOpenEdit(r)}
              title="Edit Profile"
            >
              <Edit size={14} />
            </button>
            {isRowInactive ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onRestoreSupplier(r.id)}
                title="Restore Supplier"
                style={{ color: 'var(--teal-600)' }}
              >
                <RotateCcw size={14} />
              </button>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onDeleteSupplier(r.id)}
                title="Archive / Remove Supplier"
                style={{ color: 'var(--ruby-text)' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
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
            Suppliers
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenAdd}
          >
            <Plus size={14} />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Floating / Contextual Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '10px 18px',
          background: 'var(--ink)',
          color: '#ffffff',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>
            {selectedIds.length} supplier(s) selected
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBulkExportCSV}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBulkArchive}
              style={{ background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: 'none' }}
            >
              <Trash2 size={13} />
              <span>Archive Selected</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleBulkRestore}
              style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#86efac', border: 'none' }}
            >
              <RotateCcw size={13} />
              <span>Restore Selected</span>
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedIds([])}
              style={{ color: '#fff' }}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        onRowClick={row => onSelectSupplier(row.id)}
        emptyMessage={
          searchQuery
            ? `No suppliers matched your search "${searchQuery}".`
            : 'No suppliers registered in this category.'
        }
      />
    </div>
  );
}
