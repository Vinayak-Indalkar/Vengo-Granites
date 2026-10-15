import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HardHat,
  Plus,
  Search,
  Phone,
  MapPin,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  Download,
  Users,
  Briefcase,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { DataTable, StatusBadge, ActionDropdown } from '../CommonComponents';

export function ContractorListScreen({
  onSelectContractor,
  onOpenAdd,
  onOpenEdit,
  onDeleteContractor,
  onRestoreContractor
}) {
  const { contractors, personnel, bulkArchiveContractors, bulkRestoreContractors } = useApp();

  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [tradeFilter, setTradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Stats calculation
  const totalCount = contractors.length;
  const activeCount = contractors.filter(c => c.status === 'Active').length;
  const inactiveCount = contractors.filter(c => c.status === 'Inactive').length;
  
  // Total linked contractor workers
  const totalWorkers = personnel.filter(p => p.type === 'Contractor Worker' && p.status === 'Active').length;

  // Filtered dataset
  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      // Status filter
      if (statusFilter === 'Active' && c.status === 'Inactive') return false;
      if (statusFilter === 'Inactive' && c.status !== 'Inactive') return false;

      // Trade/Service filter
      if (tradeFilter !== 'All' && c.serviceType !== tradeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = (c.code || c.id || '').toLowerCase();
        const name = (c.companyName || '').toLowerCase();
        const contact = (c.contactPerson || '').toLowerCase();
        const city = (c.city || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const service = (c.serviceType || '').toLowerCase();
        return code.includes(q) || name.includes(q) || contact.includes(q) || city.includes(q) || phone.includes(q) || service.includes(q);
      }

      return true;
    });
  }, [contractors, statusFilter, tradeFilter, searchQuery]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredContractors.map(c => c.id));
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
    if (window.confirm(`Archive ${selectedIds.length} selected contractor(s)? Linked workers will also be marked Inactive.`)) {
      bulkArchiveContractors(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkRestore = () => {
    if (window.confirm(`Restore ${selectedIds.length} selected contractor(s) to Active?`)) {
      bulkRestoreContractors(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Agency / Company Name', 'Trade / Service', 'Contact Person', 'Phone', 'Email', 'City', 'Billing Basis', 'Rate', 'Payment Cycle', 'Active Workers', 'Status'];
    const rows = filteredContractors.map(c => {
      const workerCount = personnel.filter(p => (p.contractorId === c.id || p.contractorName === c.companyName) && p.type === 'Contractor Worker').length;
      return [
        `"${c.code || c.id}"`,
        `"${(c.companyName || '').replace(/"/g, '""')}"`,
        `"${c.serviceType || ''}"`,
        `"${c.contactPerson || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.email || ''}"`,
        `"${c.city || ''}"`,
        `"${c.billingBasis || ''}"`,
        c.ratePerUnit || 0,
        `"${c.paymentCycle || ''}"`,
        workerCount,
        `"${c.status || 'Active'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Contractors_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for worker count
  const getWorkerCount = (contractor) => {
    return personnel.filter(p => (p.contractorId === contractor.id || p.contractorName === contractor.companyName) && p.type === 'Contractor Worker').length;
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={handleSelectAll}
          checked={filteredContractors.length > 0 && selectedIds.length === filteredContractors.length}
          aria-label="Select all contractors"
          style={{ cursor: 'pointer' }}
        />
      ),
      accessor: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleToggleRow(row.id, e)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select contractor ${row.companyName}`}
          style={{ cursor: 'pointer' }}
        />
      ),
      style: { width: '40px', textAlign: 'center' }
    },
    {
      header: 'Contractor Code',
      accessor: 'code',
      render: (row) => (
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            onSelectContractor(row.id);
          }}
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-color)' }}
        >
          {row.code || row.id}
        </button>
      )
    },
    {
      header: 'Agency / Contractor Name',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--ink)' }}>{row.companyName}</strong>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
            <span className="badge badge-subtle" style={{ fontSize: '10px' }}>
              {row.serviceType || 'General Labour'}
            </span>
            {row.contactPerson && (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>• Rep: {row.contactPerson}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Trade & Billing Basis',
      render: (row) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
            ₹{row.ratePerUnit || 0} / {row.billingBasis || 'Per Day'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            Cycle: {row.paymentCycle || 'Weekly'}
          </div>
        </div>
      )
    },
    {
      header: 'Contact & City',
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
      header: 'Linked Workforce',
      render: (row) => {
        const count = getWorkerCount(row);
        return (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '12px', color: 'var(--teal-700)', backgroundColor: 'var(--teal-50, #F0FDFA)', padding: '2px 8px', borderRadius: '4px' }}>
              <Users size={12} />
              <span>{count} Registered Worker{count !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
              Active in HR & Payroll
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status || 'Active'} />
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const isInactive = row.status === 'Inactive';
        return (
          <ActionDropdown
            items={[
              {
                label: 'View Dossier / Workers',
                icon: Eye,
                onClick: () => onSelectContractor(row.id)
              },
              {
                label: 'Edit Contractor',
                icon: Edit,
                onClick: () => onOpenEdit(row)
              },
              ...(isInactive ? [
                {
                  label: 'Restore Contractor',
                  icon: RotateCcw,
                  onClick: () => onRestoreContractor(row.id)
                }
              ] : [
                {
                  label: 'Archive Contractor',
                  icon: Trash2,
                  danger: true,
                  confirm: `Archive contractor ${row.companyName}? Linked workers will also be marked Inactive.`,
                  onClick: () => onDeleteContractor(row.id)
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
            Contractors
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAdd}
          >
            <Plus size={14} />
            <span>Add Contractor</span>
          </button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={contractors}
        onRowClick={(row) => onSelectContractor(row.id)}
        emptyMessage="No contractors registered."
      />
    </div>
  );
}
