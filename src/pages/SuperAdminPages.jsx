import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown, StatCard, DatePicker, PhotoUpload } from '../components/CommonComponents';
import { Plus, Users, Shield, Lock, Unlock, Key, Layers, Award, FileText, Check, AlertCircle } from 'lucide-react';

// 1. Clients Management (All Clients, New Client, Block/Unblock)
export function SuperAdminClientsScreen() {
  const { clients, addClient, updateClient, toggleClientBlock, resetClientAdminPassword } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    logo: '',
    brandColor: '#222350',
    adminName: '',
    adminEmail: '',
    plan: 'Professional',
    validity: '2028-12-31'
  });

  const openCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      taxId: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      logo: '',
      brandColor: '#222350',
      adminName: '',
      adminEmail: '',
      plan: 'Professional',
      validity: '2028-12-31'
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setFormData({
      name: c.name || '',
      taxId: c.taxId || '',
      address: c.address || '',
      contactPerson: c.contactPerson || '',
      phone: c.phone || '',
      email: c.email || '',
      logo: c.logo || '',
      brandColor: c.brandColor || '#222350',
      adminName: c.adminName || '',
      adminEmail: c.adminEmail || '',
      plan: c.plan || 'Professional',
      validity: c.validity || '2028-12-31'
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateClient(editId, formData);
    } else {
      addClient(formData);
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Client ID', accessor: 'id' },
    {
      header: 'Company Name',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={r.logo || '/default-client-logo.png'}
            alt={r.name}
            onError={e => { e.currentTarget.src = '/default-client-logo.png'; }}
            style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 600 }}>{r.name}</span>
        </div>
      )
    },
    { header: 'Tax ID', accessor: 'taxId' },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Email', accessor: 'email' },
    { header: 'Validity', accessor: 'validity' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Client', onClick: () => openEdit(r) },
            {
              label: r.status === 'Blocked' ? 'Unblock Client' : 'Block Client',
              danger: r.status !== 'Blocked',
              confirm: `Are you sure you want to ${r.status === 'Blocked' ? 'unblock' : 'block'} client ${r.name}?`,
              onClick: () => toggleClientBlock(r.id)
            },
            {
              label: 'Reset Password',
              confirm: `Reset admin account password for ${r.name}? A temporary access link will be dispatched.`,
              onClick: () => resetClientAdminPassword(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Supplier / Client Instances</h1>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={14} />
          <span>New Supplier / Client</span>
        </button>
      </div>

      <DataTable columns={columns} data={clients} emptyMessage="No clients onboarded." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Supplier / Client" : "New Supplier / Client Instance"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Save Changes" : "Onboard Supplier / Client"}
      >
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input className="form-input" placeholder="Enter company name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Tax ID</label>
          <input className="form-input" placeholder="e.g. IT-089234101" value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" placeholder="Enter business address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Person</label>
          <input className="form-input" placeholder="Enter contact person" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" placeholder="+1-555-0100" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" placeholder="admin@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="form-group">
          <PhotoUpload
            label="Attached Company Logo"
            value={formData.logo}
            onChange={val => setFormData({ ...formData, logo: val })}
            shape="rounded"
            isLogo={true}
            helperText="PNG, JPG, SVG or WEBP up to 5MB"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Brand Color</label>
          <input type="color" className="form-input" style={{ height: '36px', padding: '2px' }} value={formData.brandColor} onChange={e => setFormData({ ...formData, brandColor: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Admin Name</label>
          <input className="form-input" placeholder="Enter admin name" value={formData.adminName} onChange={e => setFormData({ ...formData, adminName: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Admin Email</label>
          <input className="form-input" placeholder="Enter admin email" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Validity</label>
          <DatePicker
            value={formData.validity}
            onChange={val => setFormData({ ...formData, validity: val })}
            placeholder="DD/MM/YYYY"
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// 2. Branding (Logo, Colors)
export function SuperAdminBrandingScreen() {
  const { clients, updateClient } = useApp();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || 'CLI-001');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleUpdate = (field, val) => {
    updateClient(selectedClientId, { [field]: val });
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Client Branding</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          className="form-select"
          style={{ maxWidth: '280px' }}
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="table-card" style={{ padding: '24px', maxWidth: '540px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <PhotoUpload
              label="Attached Company Logo"
              value={selectedClient?.logo || ''}
              onChange={val => handleUpdate('logo', val)}
              shape="rounded"
              isLogo={true}
              helperText="PNG, JPG, SVG or WEBP up to 5MB"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="color"
                style={{ width: '48px', height: '36px', padding: 0, border: 'none', borderRadius: '6px' }}
                value={selectedClient?.brandColor || '#222350'}
                onChange={e => handleUpdate('brandColor', e.target.value)}
              />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedClient?.brandColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. App Assignment (Modules, Users, Validity)
export function SuperAdminAppAssignmentScreen() {
  const { clients, updateClient } = useApp();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || 'CLI-001');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const allModules = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'purchase', label: 'Purchase Orders' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'sales', label: 'Sales Invoices' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'returns', label: 'Returns & Defects' },
    { id: 'reports', label: 'Reports' },
    { id: 'hr', label: 'HR & Biometrics' }
  ];

  const handleToggleModule = (modId) => {
    const cur = selectedClient?.modules || [];
    const next = cur.includes(modId) ? cur.filter(m => m !== modId) : [...cur, modId];
    updateClient(selectedClientId, { modules: next });
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">App Assignment</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          className="form-select"
          style={{ maxWidth: '280px' }}
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
        >
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="table-card" style={{ padding: '24px', maxWidth: '540px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Permitted Modules</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {allModules.map(m => {
                const isChecked = selectedClient?.modules?.includes(m.id);
                return (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleModule(m.id)}
                    />
                    <span>{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Validity Date</label>
            <DatePicker
              value={selectedClient?.validity || '2028-12-31'}
              onChange={val => updateClient(selectedClientId, { validity: val })}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Plans Screen (Plans & Limits)
export function SuperAdminPlansScreen() {
  const { plans } = useApp();

  const columns = [
    { header: 'Plan ID', accessor: 'id' },
    { header: 'Plan Name', accessor: 'name' },
    { header: 'Price ($/Mo)', accessor: 'price', render: r => <span className="table-num">${r.price}</span> },
    { header: 'Max Users', accessor: 'maxUsers', render: r => <span className="table-num">{r.maxUsers}</span> },
    { header: 'Max Employees', accessor: 'maxEmployees', render: r => <span className="table-num">{r.maxEmployees}</span> },
    { header: 'Max Yards', accessor: 'maxYards', render: r => <span className="table-num">{r.maxYards}</span> },
    { header: 'Max Modules', accessor: 'maxModules', render: r => <span className="table-num">{r.maxModules}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Plans & Limits</h1>
      </div>
      <DataTable columns={columns} data={plans} emptyMessage="No plans defined." />
    </div>
  );
}

// 5. Reports Screen (Clients & Usage)
export function SuperAdminReportsScreen() {
  const { clients, users, personnel, rawBlocks, bundles } = useApp();

  const clientUsageData = clients.map(c => {
    const cliUsers = users.filter(u => u.clientId === c.id).length;
    const cliStaff = personnel.filter(p => p.clientId === c.id).length;
    const blocksCount = rawBlocks.filter(b => b.clientId === c.id).length;
    const bundlesCount = bundles.filter(b => b.clientId === c.id).length;

    return {
      id: c.id,
      name: c.name,
      plan: c.plan,
      users: cliUsers,
      personnel: cliStaff,
      blocks: blocksCount,
      bundles: bundlesCount,
      status: c.status
    };
  });

  const columns = [
    { header: 'Client ID', accessor: 'id' },
    { header: 'Company Name', accessor: 'name' },
    { header: 'Plan', accessor: 'plan' },
    { header: 'Users Count', accessor: 'users', render: r => <span className="table-num">{r.users}</span> },
    { header: 'Staff & Workers', accessor: 'personnel', render: r => <span className="table-num">{r.personnel}</span> },
    { header: 'Raw Blocks', accessor: 'blocks', render: r => <span className="table-num">{r.blocks}</span> },
    { header: 'Bundles Sold/Avail', accessor: 'bundles', render: r => <span className="table-num">{r.bundles}</span> },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Clients Usage Report</h1>
      </div>
      <DataTable columns={columns} data={clientUsageData} emptyMessage="No usage records." />
    </div>
  );
}

// 6. Activity Log Screen
export function SuperAdminActivityLogScreen() {
  const { auditLogs } = useApp();

  const columns = [
    { header: 'Log ID', accessor: 'id' },
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'Client', accessor: 'clientId' },
    { header: 'Action', accessor: 'action', render: r => <span className="badge badge-teal">{r.action}</span> },
    { header: 'Entity', accessor: 'entity' },
    { header: 'User', accessor: 'user' },
    { header: 'Role', accessor: 'role' },
    { header: 'Details', accessor: 'details' }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
      </div>
      <DataTable columns={columns} data={auditLogs} emptyMessage="No activity logs found." />
    </div>
  );
}
