import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DataTable,
  FormDrawer,
  StatusBadge,
  ActionDropdown,
  ConfirmDialog
} from '../CommonComponents';
import { Plus, Shield, CheckSquare, Edit, Trash2, Power, Users } from 'lucide-react';

const initialRolesData = [
  // Supplier Roles
  {
    id: 'ROL-SUP-01',
    code: 'SUP-ADMIN',
    name: 'Supplier Portal Administrator',
    scope: 'Supplier',
    description: 'Full administrative access to quarry records, block dispatches, bills, and plant operations',
    modules: ['Gate Entries', 'Weighbridge Logs', 'Raw Block Stock', 'QC Inspections', 'Plants & Quarry', 'Invoices & Bills'],
    usersCount: 3,
    status: 'Active'
  },
  {
    id: 'ROL-SUP-02',
    code: 'SUP-DISP',
    name: 'Quarry Dispatch Supervisor',
    scope: 'Supplier',
    description: 'Generates gate passes, verifies block lorry loading, and tracks transit e-way bills',
    modules: ['Gate Entries', 'Weighbridge Logs', 'Raw Block Stock'],
    usersCount: 2,
    status: 'Active'
  },
  // Buyer Roles
  {
    id: 'ROL-BUY-01',
    code: 'BUY-ADMIN',
    name: 'Buyer Operations Head',
    scope: 'Buyer',
    description: 'Full access to purchase requests, material inspection, inventory reservations, and billing',
    modules: ['Purchase Requests', 'Material Receipts', 'Slab Stock', 'Invoices', 'Damage Claims'],
    usersCount: 2,
    status: 'Active'
  },
  {
    id: 'ROL-BUY-02',
    code: 'BUY-SITE',
    name: 'Site Receiving Officer',
    scope: 'Buyer',
    description: 'Receives cut slabs at construction projects and registers delivery sign-offs',
    modules: ['Material Receipts', 'Damage Claims'],
    usersCount: 4,
    status: 'Active'
  },
  // Contractor Roles
  {
    id: 'ROL-CON-01',
    code: 'CON-MGR',
    name: 'Contractor Agency Manager',
    scope: 'Contractor',
    description: 'Manages contractor work orders, labour allocations, piece-rate billing, and muster rolls',
    modules: ['Labour Workforce', 'Job Work Orders', 'Disbursals', 'Attendance Logs'],
    usersCount: 2,
    status: 'Active'
  },
  {
    id: 'ROL-CON-02',
    code: 'CON-SUPV',
    name: 'Gangsaw Shift Master',
    scope: 'Contractor',
    description: 'Supervises slicing gang saws, wire cutters, and block dressing operations',
    modules: ['Job Work Orders', 'Attendance Logs'],
    usersCount: 3,
    status: 'Active'
  }
];

const AVAILABLE_MODULES = [
  'Gate Entries',
  'Weighbridge Logs',
  'Raw Block Stock',
  'QC Inspections',
  'Plants & Quarry',
  'Invoices & Bills',
  'Purchase Requests',
  'Material Receipts',
  'Slab Stock',
  'Damage Claims',
  'Labour Workforce',
  'Job Work Orders',
  'Disbursals',
  'Attendance Logs',
  'Reports & Audit'
];

export function ClientRolesTab({ scope = 'Supplier' }) {
  const { t, showToast } = useApp();

  const [allRoles, setAllRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('granite_client_portal_roles');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialRolesData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('granite_client_portal_roles', JSON.stringify(allRoles));
    } catch (e) {}
  }, [allRoles]);

  const scopedRoles = useMemo(() => {
    return allRoles.filter(r => r.scope.toLowerCase() === scope.toLowerCase());
  }, [allRoles, scope]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    description: '',
    modules: [],
    status: 'Active'
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  const handleOpenAdd = () => {
    setEditingRole(null);
    const count = scopedRoles.length + 1;
    const prefix = scope === 'Supplier' ? 'SUP' : scope === 'Buyer' ? 'BUY' : 'CON';
    setFormData({
      id: `ROL-${prefix}-${String(count).padStart(2, '0')}`,
      code: `${prefix}-ROLE-${count}`,
      name: '',
      description: '',
      modules: ['Gate Entries', 'Invoices & Bills'],
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormData({
      ...role,
      modules: Array.isArray(role.modules) ? role.modules : []
    });
    setIsDrawerOpen(true);
  };

  const handleModuleToggle = (mod) => {
    setFormData(prev => {
      const current = prev.modules || [];
      if (current.includes(mod)) {
        return { ...prev, modules: current.filter(m => m !== mod) };
      } else {
        return { ...prev, modules: [...current, mod] };
      }
    });
  };

  const handleSaveRole = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editingRole) {
      setAllRoles(prev => prev.map(r => r.id === editingRole.id ? {
        ...formData,
        id: editingRole.id,
        scope,
        usersCount: editingRole.usersCount || 0
      } : r));
      showToast(t('Role profile updated successfully'), 'success');
    } else {
      const newRole = {
        ...formData,
        id: formData.id || `ROL-${Date.now().toString().slice(-4)}`,
        scope,
        usersCount: 0
      };
      setAllRoles(prev => [newRole, ...prev]);
      showToast(t('New role created successfully'), 'success');
    }

    setIsDrawerOpen(false);
    setEditingRole(null);
  };

  const handleDeletePrompt = (role) => {
    setConfirmDialog({
      isOpen: true,
      title: t('Delete Role Profile'),
      message: `Are you sure you want to remove role "${role.name}" (${role.code})? Any users assigned to this role will need to be reassigned.`,
      danger: true,
      confirmLabel: t('Confirm Delete'),
      onConfirm: () => {
        setAllRoles(prev => prev.filter(r => r.id !== role.id));
        showToast(t('Role removed successfully'), 'info');
      }
    });
  };

  const handleToggleStatus = (role) => {
    const nextStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    setAllRoles(prev => prev.map(r => r.id === role.id ? { ...r, status: nextStatus } : r));
    showToast(`Role marked as ${nextStatus}`, 'info');
  };

  const columns = useMemo(() => [
    {
      header: t('Role Code'),
      accessor: 'code',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenEdit(row)}
          className="btn btn-ghost btn-xs"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            color: 'var(--teal-700, #0f766e)',
            backgroundColor: 'var(--teal-50, #f0fdfa)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid var(--teal-200, #99f6e4)'
          }}
          title={t('Edit Role Configuration')}
        >
          {row.code}
        </button>
      )
    },
    {
      header: t('Role Title'),
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            {row.description}
          </div>
        </div>
      )
    },
    {
      header: t('Scope'),
      accessor: 'scope',
      render: (row) => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--surface-sunken)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--brand-color, #222350)'
        }}>
          {row.scope}
        </span>
      )
    },
    {
      header: t('Module Permissions'),
      accessor: 'modules',
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(row.modules || []).slice(0, 3).map(m => (
            <span key={m} style={{
              fontSize: '10.5px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--teal-50, #f0fdfa)',
              color: 'var(--teal-700, #0f766e)',
              border: '1px solid var(--teal-200, #99f6e4)'
            }}>
              {m}
            </span>
          ))}
          {(row.modules || []).length > 3 && (
            <span style={{ fontSize: '10.5px', color: 'var(--muted)', alignSelf: 'center' }}>
              +{row.modules.length - 3} {t('more')}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('Assigned Users'),
      accessor: 'usersCount',
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--ink)'
        }}>
          <Users size={12} color="var(--muted)" />
          {row.usersCount || 0} {t('Users')}
        </span>
      )
    },
    {
      header: t('Status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('Actions'),
      render: (row) => (
        <ActionDropdown
          items={[
            {
              label: t('Edit Role'),
              icon: <Edit size={14} />,
              onClick: () => handleOpenEdit(row)
            },
            {
              label: row.status === 'Active' ? t('Mark Inactive') : t('Mark Active'),
              icon: <Power size={14} />,
              onClick: () => handleToggleStatus(row)
            },
            {
              label: t('Delete Role'),
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDeletePrompt(row)
            }
          ]}
        />
      )
    }
  ], [t]);

  return (
    <>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {scope} {t('Roles & Security Profiles')}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {t('Configure user permission templates, operational scopes, and access restrictions.')}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>{t('Add Role')}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={scopedRoles}
        emptyMessage={`${t('No')} ${scope} ${t('roles configured.')}`}
      />

      {/* Add / Edit FormDrawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingRole(null); }}
        title={editingRole ? `${t('Edit Role')}: ${formData.code}` : `${t('Create')} ${scope} ${t('Role')}`}
        onSubmit={handleSaveRole}
        submitLabel={editingRole ? t('Update Role') : t('Save Role')}
        confirmSubmit={true}
      >
        {/* Section 1: Role Information */}
        <div className="col-span-2" style={{
          gridColumn: '1 / -1',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--ink)',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '6px',
          marginTop: '2px'
        }}>
          <Shield size={16} color="var(--brand-color, #222350)" />
          <span>1. {t('Role Specification')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Role Code')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. SUP-DISPATCH"
            style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Role Title / Name')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Quarry Logistics Coordinator"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">{t('Role Description')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="Describe the duties and authorization scope for this role"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Section 2: Module Permissions */}
        <div className="col-span-2" style={{
          gridColumn: '1 / -1',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '13px',
          color: 'var(--ink)',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '6px',
          marginTop: '10px'
        }}>
          <CheckSquare size={16} color="var(--brand-color, #222350)" />
          <span>2. {t('Authorized ERP Modules & Permissions')}</span>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">{t('Select Modules Accessible to this Role')}</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
            marginTop: '4px'
          }}>
            {AVAILABLE_MODULES.map(mod => {
              const isChecked = (formData.modules || []).includes(mod);
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => handleModuleToggle(mod)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: isChecked ? '1px solid var(--teal-600)' : '1px solid var(--line)',
                    backgroundColor: isChecked ? 'var(--teal-50, #f0fdfa)' : 'var(--white)',
                    color: isChecked ? 'var(--teal-800, #115e59)' : 'var(--ink)',
                    fontSize: '12px',
                    fontWeight: isChecked ? 600 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '13px', color: isChecked ? 'var(--teal-600)' : 'var(--muted)' }}>
                    {isChecked ? '✓' : '○'}
                  </span>
                  <span>{mod}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">{t('Status')}</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Active">{t('Active')}</option>
            <option value="Inactive">{t('Inactive')}</option>
          </select>
        </div>
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
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
