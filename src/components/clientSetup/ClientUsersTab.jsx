import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DataTable,
  FormDrawer,
  StatusBadge,
  ActionDropdown,
  ConfirmDialog
} from '../CommonComponents';
import { Plus, User, Mail, Phone, Shield, Building2, Edit, Trash2, Power } from 'lucide-react';

const initialUsersData = [
  // Supplier Users
  {
    id: 'USR-SUP-01',
    name: 'Marco Vieri',
    email: 'marco.vieri@carrara.it',
    phone: '+39 335 123456',
    scope: 'Supplier',
    entityId: 'SUP-0001',
    entityName: 'Carrara Quarry Holdings',
    role: 'Supplier Admin',
    status: 'Active',
    lastLogin: 'Today, 09:15 AM'
  },
  {
    id: 'USR-SUP-02',
    name: 'K. Rajeshwar Rao',
    email: 'operations@galaxymining.com',
    phone: '+91 98490 88771',
    scope: 'Supplier',
    entityId: 'SUP-0002',
    entityName: 'Galaxy Mining Corp',
    role: 'Quarry Dispatch Supervisor',
    status: 'Active',
    lastLogin: 'Yesterday, 04:30 PM'
  },
  // Buyer Users
  {
    id: 'USR-BUY-01',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@apexbuilders.com',
    phone: '+91 98200 12345',
    scope: 'Buyer',
    entityId: 'BUY-0001',
    entityName: 'Apex Builders & Developers Ltd',
    role: 'Procurement Head',
    status: 'Active',
    lastLogin: 'Today, 08:45 AM'
  },
  {
    id: 'USR-BUY-02',
    name: 'Sofia Alessi',
    email: 'sofia@monarchstone.it',
    phone: '+39 0585 99887',
    scope: 'Buyer',
    entityId: 'BUY-0002',
    entityName: 'Monarch Stone Imports',
    role: 'Import Specialist',
    status: 'Active',
    lastLogin: 'Oct 12, 2026'
  },
  // Contractor Users
  {
    id: 'USR-CON-01',
    name: 'Rameshwar Gurjar',
    email: 'balaji.rigging@gmail.com',
    phone: '+91 98290 88776',
    scope: 'Contractor',
    entityId: 'CON-0001',
    entityName: 'Balaji Heavy Rigging & Cranes',
    role: 'Site Supervisor',
    status: 'Active',
    lastLogin: 'Today, 07:30 AM'
  },
  {
    id: 'USR-CON-02',
    name: 'Dinesh Kumar Sahu',
    email: 'om.gangsaw@contractor.in',
    phone: '+91 94140 33221',
    scope: 'Contractor',
    entityId: 'CON-0002',
    entityName: 'Om Gangsaw Cutting Works',
    role: 'Shift Master',
    status: 'Active',
    lastLogin: 'Oct 14, 2026'
  }
];

export function ClientUsersTab({ scope = 'Supplier' }) {
  const { suppliers, customers, contractors, t, showToast } = useApp();

  const [allUsers, setAllUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('granite_client_portal_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialUsersData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('granite_client_portal_users', JSON.stringify(allUsers));
    } catch (e) {}
  }, [allUsers]);

  // Filter users by scope
  const scopedUsers = useMemo(() => {
    return allUsers.filter(u => u.scope.toLowerCase() === scope.toLowerCase());
  }, [allUsers, scope]);

  // Companies dropdown based on scope
  const availableCompanies = useMemo(() => {
    if (scope === 'Supplier') {
      return suppliers.map(s => ({ id: s.id, name: s.name, code: s.code || s.id }));
    }
    if (scope === 'Buyer') {
      return customers.map(c => ({ id: c.id, name: c.name, code: c.code || c.id }));
    }
    return contractors.map(c => ({ id: c.id, name: c.companyName, code: c.code || c.id }));
  }, [scope, suppliers, customers, contractors]);

  // Form Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    entityId: '',
    entityName: '',
    role: '',
    status: 'Active'
  });

  // Confirm Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    const count = scopedUsers.length + 1;
    const prefix = scope === 'Supplier' ? 'USR-SUP' : scope === 'Buyer' ? 'USR-BUY' : 'USR-CON';
    const autoId = `${prefix}-${String(count).padStart(2, '0')}`;
    const defaultCompany = availableCompanies[0];
    const defaultRole = scope === 'Supplier'
      ? 'Supplier Admin'
      : scope === 'Buyer'
        ? 'Procurement Specialist'
        : 'Contractor Supervisor';

    setFormData({
      id: autoId,
      name: '',
      email: '',
      phone: '',
      entityId: defaultCompany?.id || '',
      entityName: defaultCompany?.name || '',
      role: defaultRole,
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsDrawerOpen(true);
  };

  const handleSaveUser = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetComp = availableCompanies.find(c => c.id === formData.entityId || c.code === formData.entityId);
    const resolvedCompName = targetComp ? targetComp.name : (formData.entityName || 'General');

    if (editingUser) {
      setAllUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...formData,
        id: editingUser.id,
        scope,
        entityName: resolvedCompName
      } : u));
      showToast(t('User account updated successfully'), 'success');
    } else {
      const newUser = {
        ...formData,
        id: formData.id || `${scope.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        scope,
        entityName: resolvedCompName,
        lastLogin: 'Never logged in'
      };
      setAllUsers(prev => [newUser, ...prev]);
      showToast(t('New user created successfully'), 'success');
    }

    setIsDrawerOpen(false);
    setEditingUser(null);
  };

  const handleDeletePrompt = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: t('Delete User Account'),
      message: `Are you sure you want to remove user "${user.name}" (${user.email})? They will lose access to the portal.`,
      danger: true,
      confirmLabel: t('Confirm Delete'),
      onConfirm: () => {
        setAllUsers(prev => prev.filter(u => u.id !== user.id));
        showToast(t('User account deleted'), 'info');
      }
    });
  };

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    showToast(`User marked as ${nextStatus}`, 'info');
  };

  const columns = useMemo(() => [
    {
      header: t('User ID'),
      accessor: 'id',
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
          title={t('Edit User Account')}
        >
          {row.id}
        </button>
      )
    },
    {
      header: t('Full Name & Contact'),
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Mail size={11} /> {row.email}
          </div>
        </div>
      )
    },
    {
      header: scope === 'Supplier' ? t('Supplier Entity') : scope === 'Buyer' ? t('Buyer Company') : t('Contractor Agency'),
      accessor: 'entityName',
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: 500,
          color: 'var(--brand-color, #222350)'
        }}>
          <Building2 size={13} color="var(--teal-600)" />
          {row.entityName}
        </span>
      )
    },
    {
      header: t('Assigned Role'),
      accessor: 'role',
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '4px',
          backgroundColor: 'var(--surface-sunken)',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--ink)'
        }}>
          <Shield size={12} color="var(--teal-600)" />
          {row.role}
        </span>
      )
    },
    {
      header: t('Phone'),
      accessor: 'phone',
      render: (row) => (
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          {row.phone}
        </span>
      )
    },
    {
      header: t('Status'),
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: t('Last Login'),
      accessor: 'lastLogin',
      render: (row) => (
        <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
          {row.lastLogin || 'Never'}
        </span>
      )
    },
    {
      header: t('Actions'),
      render: (row) => (
        <ActionDropdown
          items={[
            {
              label: t('Edit User'),
              icon: <Edit size={14} />,
              onClick: () => handleOpenEdit(row)
            },
            {
              label: row.status === 'Active' ? t('Deactivate Account') : t('Activate Account'),
              icon: <Power size={14} />,
              onClick: () => handleToggleStatus(row)
            },
            {
              label: t('Delete User'),
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDeletePrompt(row)
            }
          ]}
        />
      )
    }
  ], [scope, t]);

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
            {scope} {t('Authorized Users & Portal Accounts')}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {t('Manage staff logins, portal representatives, roles, and security credentials.')}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>{t('Add User')}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={scopedUsers}
        emptyMessage={`${t('No')} ${scope} ${t('users found.')}`}
      />

      {/* Add / Edit FormDrawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingUser(null); }}
        title={editingUser ? `${t('Edit User Account')}: ${formData.id}` : `${t('Add New')} ${scope} ${t('User')}`}
        onSubmit={handleSaveUser}
        submitLabel={editingUser ? t('Update Account') : t('Create User Account')}
        confirmSubmit={true}
      >
        {/* Section 1: User Identity */}
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
          <User size={16} color="var(--brand-color, #222350)" />
          <span>1. {t('User Identity & Company Affiliation')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('User ID / Code')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.id}
            disabled
            style={{ background: 'var(--surface-sunken)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Full Name')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ramesh Patel"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{scope === 'Supplier' ? t('Supplier Organization') : scope === 'Buyer' ? t('Buyer Company') : t('Contractor Agency')}</label>
          <select
            className="form-select"
            value={formData.entityId}
            onChange={e => {
              const selectedComp = availableCompanies.find(c => c.id === e.target.value);
              setFormData({
                ...formData,
                entityId: e.target.value,
                entityName: selectedComp ? selectedComp.name : formData.entityName
              });
            }}
          >
            {availableCompanies.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code || c.id})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Official Email')}</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. user@company.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Section 2: Contact & Access */}
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
          <Shield size={16} color="var(--brand-color, #222350)" />
          <span>2. {t('Role & Access Credentials')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Primary Phone')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. +91 98200 12345"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Assigned Role')}</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            {scope === 'Supplier' && (
              <>
                <option value="Supplier Admin">Supplier Admin (Full Access)</option>
                <option value="Quarry Dispatch Supervisor">Quarry Dispatch Supervisor</option>
                <option value="Weighbridge Operator">Weighbridge Operator</option>
                <option value="Accounts Representative">Accounts Representative</option>
              </>
            )}
            {scope === 'Buyer' && (
              <>
                <option value="Buyer Admin">Buyer Admin (Full Access)</option>
                <option value="Procurement Head">Procurement Head</option>
                <option value="Site Receiving Officer">Site Receiving Officer</option>
                <option value="Billing & Invoicing Rep">Billing & Invoicing Rep</option>
              </>
            )}
            {scope === 'Contractor' && (
              <>
                <option value="Contractor Supervisor">Contractor Supervisor</option>
                <option value="Shift Master">Shift Master</option>
                <option value="Labour Coordinator">Labour Coordinator</option>
                <option value="Safety Officer">Safety Officer</option>
              </>
            )}
          </select>
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
