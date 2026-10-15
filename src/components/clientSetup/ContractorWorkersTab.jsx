import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HardHat,
  Phone,
  Calendar,
  Briefcase,
  BadgeAlert,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';

const INITIAL_WORKERS = [
  {
    id: 'WRK-1001',
    code: 'WRK-1001',
    name: 'Rameshwar Naik',
    contractorId: 'CON-001',
    contractorName: 'Apex Quarry Labor Agency',
    trade: 'Block Cutting Specialist',
    phone: '+91 98451 22310',
    idProof: 'Aadhaar: 4521 8892 1029',
    dailyRate: 750,
    shift: 'General',
    status: 'Active',
    joinDate: '2023-04-12'
  },
  {
    id: 'WRK-1002',
    code: 'WRK-1002',
    name: 'Suresh Kumar Yadav',
    contractorId: 'CON-001',
    contractorName: 'Apex Quarry Labor Agency',
    trade: 'Gang Saw Operator',
    phone: '+91 94402 11984',
    idProof: 'Aadhaar: 6632 9901 4455',
    dailyRate: 850,
    shift: 'Morning',
    status: 'Active',
    joinDate: '2023-06-18'
  },
  {
    id: 'WRK-1003',
    code: 'WRK-1003',
    name: 'Dharmendra Majhi',
    contractorId: 'CON-002',
    contractorName: 'Deccan Granite Logistics & Crew',
    trade: 'Heavy Crane Rigging',
    phone: '+91 91210 55432',
    idProof: 'Aadhaar: 8812 3421 9081',
    dailyRate: 900,
    shift: 'General',
    status: 'Active',
    joinDate: '2023-08-01'
  },
  {
    id: 'WRK-1004',
    code: 'WRK-1004',
    name: 'Babu Rao Patra',
    contractorId: 'CON-002',
    contractorName: 'Deccan Granite Logistics & Crew',
    trade: 'Yard Loading & Unloading',
    phone: '+91 97761 44321',
    idProof: 'Aadhaar: 3124 7765 8901',
    dailyRate: 650,
    shift: 'Night',
    status: 'Inactive',
    joinDate: '2023-09-10'
  }
];

export function ContractorWorkersTab() {
  const { contractors = [] } = useApp();
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contractorId: '',
    trade: 'General Labor',
    phone: '',
    idProof: '',
    dailyRate: 700,
    shift: 'General',
    status: 'Active'
  });

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  const handleOpenAdd = () => {
    setEditingWorker(null);
    const nextCode = `WRK-${1000 + workers.length + 1}`;
    const defaultContractor = contractors[0] || { id: 'CON-001', companyName: 'Apex Quarry Labor Agency' };
    setFormData({
      code: nextCode,
      name: '',
      contractorId: defaultContractor.id || defaultContractor.code || '',
      trade: 'Block Cutting Specialist',
      phone: '',
      idProof: '',
      dailyRate: 750,
      shift: 'General',
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      code: worker.code,
      name: worker.name,
      contractorId: worker.contractorId,
      trade: worker.trade,
      phone: worker.phone || '',
      idProof: worker.idProof || '',
      dailyRate: worker.dailyRate || 750,
      shift: worker.shift || 'General',
      status: worker.status || 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const matchedContractor = contractors.find(
      c => c.id === formData.contractorId || c.code === formData.contractorId
    );
    const contractorName = matchedContractor ? (matchedContractor.companyName || matchedContractor.name) : 'Agency Assigned';

    if (editingWorker) {
      setWorkers(prev =>
        prev.map(w =>
          w.id === editingWorker.id
            ? { ...w, ...formData, contractorName }
            : w
        )
      );
    } else {
      const newWorker = {
        id: formData.code || `WRK-${Date.now()}`,
        ...formData,
        contractorName,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setWorkers(prev => [newWorker, ...prev]);
    }

    setIsDrawerOpen(false);
    setEditingWorker(null);
  };

  const handleToggleStatus = (worker) => {
    const nextStatus = worker.status === 'Active' ? 'Inactive' : 'Active';
    setWorkers(prev =>
      prev.map(w => (w.id === worker.id ? { ...w, status: nextStatus } : w))
    );
  };

  const handleDeletePrompt = (worker) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Contractor Worker',
      message: `Are you sure you want to remove worker "${worker.name}" (${worker.code})?`,
      danger: true,
      confirmLabel: 'Delete Worker',
      onConfirm: () => {
        setWorkers(prev => prev.filter(w => w.id !== worker.id));
      }
    });
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      const q = searchQuery.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        w.trade.toLowerCase().includes(q) ||
        w.contractorName.toLowerCase().includes(q) ||
        (w.phone && w.phone.includes(q))
      );
    });
  }, [workers, searchQuery]);

  const columns = [
    {
      key: 'code',
      title: 'Worker ID',
      width: '110px',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, fontSize: '12px' }}>
          {val}
        </span>
      )
    },
    {
      key: 'name',
      title: 'Worker Name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--surface-sunken)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-color, #222350)'
          }}>
            <HardHat size={14} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{row.idProof || 'ID Verified'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contractorName',
      title: 'Contractor Agency',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '12.5px' }}>
          {val}
        </span>
      )
    },
    {
      key: 'trade',
      title: 'Trade / Skill',
      render: (val) => (
        <span style={{
          fontSize: '11.5px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'var(--surface-sunken)',
          color: 'var(--ink)'
        }}>
          {val}
        </span>
      )
    },
    {
      key: 'dailyRate',
      title: 'Daily Rate',
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, color: 'var(--ink)' }}>
          ₹{Number(val).toLocaleString()}
        </span>
      )
    },
    {
      key: 'shift',
      title: 'Shift',
      width: '100px',
      render: (val) => (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{val} Shift</span>
      )
    },
    {
      key: 'phone',
      title: 'Contact Phone',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12px' }}>
          {val || '—'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '100px',
      render: (status) => <StatusBadge status={status} />
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => {
        const actionItems = [
          {
            label: 'Edit Worker',
            icon: Edit2,
            onClick: () => handleOpenEdit(row)
          },
          {
            label: row.status === 'Active' ? 'Mark Inactive' : 'Mark Active',
            icon: row.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleStatus(row)
          },
          { divider: true },
          {
            label: 'Delete Worker',
            icon: Trash2,
            danger: true,
            onClick: () => handleDeletePrompt(row)
          }
        ];

        return <ActionDropdown items={actionItems} />;
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            Contractor Workers
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={14} />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Workers Table */}
      <DataTable
        columns={columns}
        data={filteredWorkers}
        defaultSortKey="code"
        defaultSortDirection="asc"
        pageSize={15}
        hoverable
      />

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingWorker(null);
        }}
        title={editingWorker ? 'Edit Contractor Worker' : 'Register Contractor Worker'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsDrawerOpen(false);
                setEditingWorker(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {editingWorker ? 'Save Changes' : 'Register Worker'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            <div className="form-group">
              <label className="form-label">Worker ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                disabled
                style={{ background: 'var(--surface-sunken)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Worker Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rameshwar Naik"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contractor Agency</label>
              <select
                className="form-select"
                value={formData.contractorId}
                onChange={(e) => setFormData(p => ({ ...p, contractorId: e.target.value }))}
              >
                {contractors.length > 0 ? (
                  contractors.map(c => (
                    <option key={c.id || c.code} value={c.id || c.code}>
                      {c.companyName || c.name} ({c.code || c.id})
                    </option>
                  ))
                ) : (
                  <option value="CON-001">Apex Quarry Labor Agency (CON-001)</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Trade / Skill Category</label>
              <select
                className="form-select"
                value={formData.trade}
                onChange={(e) => setFormData(p => ({ ...p, trade: e.target.value }))}
              >
                <option value="Block Cutting Specialist">Block Cutting Specialist</option>
                <option value="Gang Saw Operator">Gang Saw Operator</option>
                <option value="Line Polishing Tech">Line Polishing Tech</option>
                <option value="Heavy Crane Rigging">Heavy Crane Rigging</option>
                <option value="Yard Loading & Unloading">Yard Loading & Unloading</option>
                <option value="Maintenance Welder">Maintenance Welder</option>
                <option value="General Quarry Labor">General Quarry Labor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Daily Wage Rate (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 750"
                value={formData.dailyRate}
                onChange={(e) => setFormData(p => ({ ...p, dailyRate: Number(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shift Preference</label>
              <select
                className="form-select"
                value={formData.shift}
                onChange={(e) => setFormData(p => ({ ...p, shift: e.target.value }))}
              >
                <option value="General">General (08:00 - 17:00)</option>
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Contact Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98451 22310"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Aadhaar / National ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aadhaar: 4521 8892 1029"
                value={formData.idProof}
                onChange={(e) => setFormData(p => ({ ...p, idProof: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </FormDrawer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(p => ({ ...p, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
