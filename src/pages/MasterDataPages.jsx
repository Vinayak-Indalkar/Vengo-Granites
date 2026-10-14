import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown, ConfirmDialog, DatePicker, PhotoUpload } from '../components/CommonComponents';
import { Plus, Search, Lock, Unlock, Edit, Trash2, ExternalLink, Menu, Layers, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

// 1. Clients Screen (Unified Buyer & Vendor CRM with Dedicated Instance Provisioning: Logo, Domain, Yard & Admin)
export function ClientsScreen() {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    toggleClientBlock,
    currentRole,
    users,
    yardLocations,
    activeClient,
    switchClientInstance
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, danger: false });
  const [formData, setFormData] = useState({
    name: '',
    type: 'Buyer',
    contact: '',
    city: '',
    country: 'India',
    creditLimit: 100000,
    materialType: 'Granite',
    paymentTerms: 'Net 30',
    logo: '',
    domain: '',
    brandColor: '#222350',
    adminName: '',
    adminEmail: '',
    yardZone: 'Zone C - Slabs Yard',
    yardBay: 'Bay 01',
    yardCapacity: 400
  });

  const filtered = clients
    .filter(c => typeFilter === 'All' || c.type === typeFilter)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.country && c.country.toLowerCase().includes(search.toLowerCase())) ||
      (c.domain && c.domain.toLowerCase().includes(search.toLowerCase()))
    );

  const openCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      type: 'Buyer',
      contact: '',
      city: '',
      country: 'India',
      creditLimit: 100000,
      materialType: 'Granite',
      paymentTerms: 'Net 30',
      logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=80&auto=format&fit=crop&q=80',
      domain: '',
      brandColor: '#222350',
      adminName: '',
      adminEmail: '',
      yardZone: 'Zone C - Slabs Yard',
      yardBay: `Bay ${String(yardLocations.length + 1).padStart(2, '0')}`,
      yardCapacity: 400
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setFormData({
      name: c.name,
      type: c.type || 'Buyer',
      contact: c.contact || '',
      city: c.city || '',
      country: c.country || 'India',
      creditLimit: c.creditLimit || 0,
      materialType: c.materialType || 'Granite',
      paymentTerms: c.paymentTerms || 'Net 30',
      logo: c.logo || '',
      domain: c.domain || '',
      brandColor: c.brandColor || '#222350',
      adminName: c.adminName || '',
      adminEmail: c.adminEmail || '',
      yardZone: 'Zone C - Slabs Yard',
      yardBay: 'Bay 01',
      yardCapacity: 400
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateClient(editId, {
        ...formData,
        creditLimit: Number(formData.creditLimit || 0)
      });
    } else {
      addClient({
        ...formData,
        creditLimit: Number(formData.creditLimit || 0),
        balance: 0,
        isBlocked: false
      });
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    {
      header: 'Client / Brand',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={r.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=80&auto=format&fit=crop&q=80'}
            alt={r.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid var(--line)',
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--black)' }}>{r.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
              {r.domain || `${r.id.toLowerCase()}.vengoerp.com`}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: r => (
        <span className={`badge ${r.type === 'Buyer' ? 'badge-teal' : 'badge-soft'}`}>
          {r.type}
        </span>
      )
    },
    { header: 'Contact', accessor: 'contact' },
    { header: 'Location', render: r => `${r.city ? r.city + ', ' : ''}${r.country || 'India'}` },
    {
      header: 'Dedicated Users',
      render: r => {
        const clientUsers = users.filter(u => u.clientId === r.id);
        return (
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {clientUsers.length > 0 ? (
              <span className="badge badge-soft" title={clientUsers.map(u => `${u.name} (${u.role})`).join(', ')}>
                {clientUsers.length} user{clientUsers.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>None</span>
            )}
          </span>
        );
      }
    },
    {
      header: 'Dedicated Yard',
      render: r => {
        const clientYards = yardLocations.filter(y => y.clientId === r.id);
        return (
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {clientYards.length > 0 ? (
              <span className="badge badge-emerald" title={clientYards.map(y => `${y.bay} - ${y.zone}`).join(', ')}>
                {clientYards.map(y => y.bay).join(', ')}
              </span>
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: '11px' }}>None</span>
            )}
          </span>
        );
      }
    },
    {
      header: 'Instance Action',
      render: r => (
        <button
          type="button"
          className="btn btn-sm"
          style={{
            height: '28px',
            fontSize: '11px',
            backgroundColor: activeClient?.id === r.id ? 'var(--emerald-surface)' : 'var(--soft)',
            borderColor: activeClient?.id === r.id ? 'var(--emerald-border)' : 'var(--line)',
            color: activeClient?.id === r.id ? 'var(--emerald-text)' : 'var(--ink)'
          }}
          onClick={() => switchClientInstance(activeClient?.id === r.id ? 'MASTER' : r.id)}
          title={`Launch separate app workspace for ${r.name}`}
        >
          {activeClient?.id === r.id ? '✓ In Instance' : 'Launch Instance'}
        </button>
      )
    },
    {
      header: 'Status',
      accessor: 'isBlocked',
      render: r => (
        <span className={`badge ${r.isBlocked ? 'badge-ruby' : 'badge-emerald'}`}>
          {r.isBlocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: activeClient?.id === r.id ? 'Exit Instance (Back to HQ)' : 'Launch Instance',
              icon: ExternalLink,
              onClick: () => switchClientInstance(activeClient?.id === r.id ? 'MASTER' : r.id)
            },
            {
              label: 'Edit Client & Instance',
              icon: Edit,
              onClick: () => openEdit(r)
            },
            {
              label: r.isBlocked ? 'Unblock Client' : 'Block Client',
              icon: r.isBlocked ? Unlock : Lock,
              onClick: () => setConfirmDialog({
                isOpen: true,
                title: r.isBlocked ? 'Unblock Client' : 'Block Client',
                message: `Are you sure you want to ${r.isBlocked ? 'unblock' : 'block'} client ${r.name}?`,
                confirmLabel: r.isBlocked ? 'Unblock' : 'Block',
                danger: !r.isBlocked,
                onConfirm: () => toggleClientBlock(r.id)
              })
            },
            { divider: true },
            {
              label: 'Delete Client',
              icon: Trash2,
              danger: true,
              onClick: () => setConfirmDialog({
                isOpen: true,
                title: 'Delete Client',
                message: `Delete client ${r.name} and remove dedicated instance? This cannot be undone.`,
                confirmLabel: 'Delete',
                danger: true,
                onConfirm: () => deleteClient(r.id)
              })
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Clients Master</h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Client</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {['All', 'Buyer', 'Vendor'].map(t => (
          <button
            key={t}
            className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTypeFilter(t)}
            style={{ fontSize: '12px', height: '30px' }}
          >
            {t === 'All' ? 'All Clients' : `${t}s`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No clients found." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Client" : "Add Client"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Client" : "Create Client"}
      >
        <div className="form-group">
          <label className="form-label">Client Type</label>
          <select
            className="form-select"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Buyer">Buyer (Customer)</option>
            <option value="Vendor">Vendor (Supplier)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Client / Company Name</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Apex Builders Ltd or Carrara Quarry"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input
            className="form-input"
            required
            placeholder="e.g. +1-555-0192"
            value={formData.contact}
            onChange={e => setFormData({ ...formData, contact: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            className="form-input"
            placeholder="e.g. Dallas, Jaipur, Carrara"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <input
            className="form-input"
            placeholder="e.g. USA, India, Italy"
            value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        {formData.type === 'Buyer' ? (
          <div className="form-group">
            <label className="form-label">Credit Limit ($)</label>
            <input
              type="number"
              className="form-input"
              required
              placeholder="e.g. 250000"
              value={formData.creditLimit}
              onChange={e => setFormData({ ...formData, creditLimit: e.target.value })}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Material Type</label>
              <select
                className="form-select"
                value={formData.materialType}
                onChange={e => setFormData({ ...formData, materialType: e.target.value })}
              >
                <option value="Granite">Granite</option>
                <option value="Marble">Marble</option>
                <option value="Both">Granite & Marble</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Advance">Advance</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
              </select>
            </div>
          </>
        )}

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--soft)',
          borderRadius: 'var(--r-8)',
          border: '1px solid var(--line)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--black)', marginBottom: '8px' }}>
            Dedicated Instance & Branding Settings
          </div>

          <div className="form-group">
            <PhotoUpload
              label="Attached Client Logo"
              value={formData.logo}
              onChange={val => setFormData({ ...formData, logo: val })}
              shape="rounded"
              isLogo={true}
              helperText="PNG, JPG, SVG or WEBP up to 5MB"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dedicated Application Domain</label>
            <input
              className="form-input"
              placeholder="e.g. clientname.vengoerp.com"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client Admin User Name</label>
            <input
              className="form-input"
              placeholder="e.g. Rajesh Sharma"
              value={formData.adminName}
              onChange={e => setFormData({ ...formData, adminName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client Admin User Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@clientdomain.com"
              value={formData.adminEmail}
              onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
            />
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--black)', margin: '12px 0 8px 0' }}>
            Dedicated Yard Bay Allocation
          </div>

          <div className="form-group">
            <label className="form-label">Yard Bay Name</label>
            <input
              className="form-input"
              placeholder="e.g. Bay 07 - Client Dedicated"
              value={formData.yardBay}
              onChange={e => setFormData({ ...formData, yardBay: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yard Zone</label>
            <input
              className="form-input"
              placeholder="e.g. Zone C - Slabs Yard"
              value={formData.yardZone}
              onChange={e => setFormData({ ...formData, yardZone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Capacity (Tonnes)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 500"
              value={formData.yardCapacity}
              onChange={e => setFormData({ ...formData, yardCapacity: e.target.value })}
            />
          </div>
        </div>
      </FormDrawer>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        danger={confirmDialog.danger}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// Backwards compatibility alias exports
export const CustomersScreen = ClientsScreen;
export const SuppliersScreen = ClientsScreen;

// 3. Stone Types Screen (Full CRUD for Super Admin)
export function StoneTypesScreen() {
  const { stoneTypes, addStoneType, updateStoneType, deleteStoneType, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', category: 'Granite', baseRateSqFt: 50, densityKgM3: 2800 });

  const filtered = stoneTypes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setFormData({ code: '', name: '', category: 'Granite', baseRateSqFt: 50, densityKgM3: 2800 });
    setIsDrawerOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setFormData({ code: s.code, name: s.name, category: s.category, baseRateSqFt: s.baseRateSqFt, densityKgM3: s.densityKgM3 });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateStoneType(editId, formData);
    } else {
      addStoneType(formData);
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Code', accessor: 'code' },
    { header: 'Stone Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Base Rate ($/Sq.Ft)', accessor: 'baseRateSqFt', render: r => <span className="table-num">${r.baseRateSqFt}</span> },
    { header: 'Density (Kg/m³)', accessor: 'densityKgM3', render: r => <span className="table-num">{r.densityKgM3}</span> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Stone Type', icon: Edit, onClick: () => openEdit(r) },
            { divider: true },
            {
              label: 'Delete Stone Type',
              icon: Trash2,
              danger: true,
              confirm: `Delete ${r.name}? This will remove it from the master catalog.`,
              onClick: () => deleteStoneType(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Stone Types Master</h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Stone</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={stoneTypes} emptyMessage="No stone types defined." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Stone Type" : "Add Stone Type"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Stone" : "Create Stone"}
      >
        <div className="form-group">
          <label className="form-label">Stone Code (e.g. BLK-GAL)</label>
          <input
            className="form-input"
            required
            placeholder="e.g. BLK-GAL"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Stone Name</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Black Galaxy Granite"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Granite">Granite</option>
            <option value="Marble">Marble</option>
            <option value="Quartzite">Quartzite</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Base Rate ($/Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 50"
            value={formData.baseRateSqFt}
            onChange={e => setFormData({ ...formData, baseRateSqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Density (Kg/m³)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 2800"
            value={formData.densityKgM3}
            onChange={e => setFormData({ ...formData, densityKgM3: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// 4. Rate Lists Screen (Full CRUD for Super Admin, Read-only for Client Admin)
export function RateListsScreen() {
  const { rateLists, stoneTypes, addRateList, updateRateList, deleteRateList, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', stoneCode: 'BLK-GAL', grade: 'A', rateSqFt: 65, effectiveFrom: '2026-10-01' });

  const filtered = rateLists.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.stoneCode.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setFormData({ name: '', stoneCode: 'BLK-GAL', grade: 'A', rateSqFt: 65, effectiveFrom: '2026-10-01' });
    setIsDrawerOpen(true);
  };

  const openEdit = (r) => {
    setEditId(r.id);
    setFormData({ name: r.name, stoneCode: r.stoneCode, grade: r.grade, rateSqFt: r.rateSqFt, effectiveFrom: r.effectiveFrom });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateRateList(editId, { ...formData, rateSqFt: Number(formData.rateSqFt) });
    } else {
      addRateList({ ...formData, rateSqFt: Number(formData.rateSqFt) });
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Rate List Name', accessor: 'name' },
    { header: 'Stone Code', accessor: 'stoneCode' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Rate ($/Sq.Ft)', accessor: 'rateSqFt', render: r => <span className="table-num">${r.rateSqFt}</span> },
    { header: 'Effective From', accessor: 'effectiveFrom' },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Rate List', icon: Edit, onClick: () => openEdit(r) },
            { divider: true },
            {
              label: 'Delete Rate List',
              icon: Trash2,
              danger: true,
              confirm: `Delete rate list ${r.name}?`,
              onClick: () => deleteRateList(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Rate Lists Master</h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Rate List</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={rateLists} emptyMessage="No rate lists active." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Rate List" : "Add Rate List"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Rate List" : "Save Rate List"}
      >
        <div className="form-group">
          <label className="form-label">Price List Title</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Standard Commercial 2026"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Stone Code</label>
          <select
            className="form-select"
            value={formData.stoneCode}
            onChange={e => setFormData({ ...formData, stoneCode: e.target.value })}
          >
            {stoneTypes.map(s => <option key={s.id} value={s.code}>{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Grade</label>
          <input
            className="form-input"
            placeholder="e.g. Premium, Standard, Commercial"
            value={formData.grade}
            onChange={e => setFormData({ ...formData, grade: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rate ($/Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 65"
            value={formData.rateSqFt}
            onChange={e => setFormData({ ...formData, rateSqFt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Effective Date</label>
          <DatePicker
            value={formData.effectiveFrom}
            onChange={val => setFormData({ ...formData, effectiveFrom: val })}
            placeholder="DD/MM/YYYY"
          />
        </div>
      </FormDrawer>
    </div>
  );
}



// 5. Yard Locations Screen (Full CRUD for Super Admin & Client Instance dedicated yards)
export function YardLocationsScreen() {
  const { yardLocations, addYardLocation, updateYardLocation, deleteYardLocation, currentRole, clients, activeClient } = useApp();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || 'CLI-001',
    zone: 'Zone A - Blocks',
    bay: 'Bay 05',
    capacityTonnes: 400,
    type: 'Raw Blocks'
  });

  const displayYards = activeClient
    ? yardLocations.filter(y => y.clientId === activeClient.id)
    : yardLocations.filter(y => clientFilter === 'All' || y.clientId === clientFilter);

  const filtered = displayYards.filter(y =>
    y.bay.toLowerCase().includes(search.toLowerCase()) ||
    y.zone.toLowerCase().includes(search.toLowerCase()) ||
    (y.clientName && y.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditId(null);
    setFormData({
      clientId: activeClient ? activeClient.id : (clients[0]?.id || 'CLI-001'),
      zone: 'Zone A - Blocks',
      bay: `Bay ${String(yardLocations.length + 1).padStart(2, '0')}`,
      capacityTonnes: 400,
      type: 'Raw Blocks'
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (y) => {
    setEditId(y.id);
    setFormData({
      clientId: y.clientId || clients[0]?.id || 'CLI-001',
      zone: y.zone,
      bay: y.bay,
      capacityTonnes: y.capacityTonnes,
      type: y.type
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === formData.clientId);
    if (editId) {
      updateYardLocation(editId, {
        ...formData,
        clientName: selClient ? selClient.name : 'Dedicated Client',
        capacityTonnes: Number(formData.capacityTonnes)
      });
    } else {
      addYardLocation({
        ...formData,
        clientName: selClient ? selClient.name : 'Dedicated Client',
        capacityTonnes: Number(formData.capacityTonnes),
        currentStock: 0
      });
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Loc ID', accessor: 'id' },
    {
      header: 'Assigned Client',
      render: r => {
        const client = clients.find(c => c.id === r.clientId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {client?.logo && (
              <img
                src={client.logo}
                alt={r.clientName}
                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <span style={{ fontWeight: 600 }}>{r.clientName || client?.name || 'General'}</span>
          </div>
        );
      }
    },
    { header: 'Zone', accessor: 'zone' },
    { header: 'Bay / Frame', accessor: 'bay' },
    { header: 'Type', accessor: 'type' },
    { header: 'Capacity (Tons)', accessor: 'capacityTonnes', render: r => <span className="table-num">{r.capacityTonnes}t</span> },
    { header: 'Current Stock', accessor: 'currentStock', render: r => <span className="table-num">{r.currentStock}t</span> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Location', icon: Edit, onClick: () => openEdit(r) },
            { divider: true },
            {
              label: 'Delete Location',
              icon: Trash2,
              danger: true,
              confirm: `Delete yard location ${r.bay}?`,
              onClick: () => deleteYardLocation(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          {activeClient ? `${activeClient.name} - Yard Locations` : 'Yard Locations Master'}
        </h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Yard Bay</span>
          </button>
        )}
      </div>

      {!activeClient && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Filter by Client:</span>
          <select
            className="form-select"
            style={{ width: '220px', height: '30px', fontSize: '12px' }}
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
          >
            <option value="All">All Client Yards</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
      )}

      <DataTable columns={columns} data={filtered} emptyMessage="No yard locations configured." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Yard Location" : "Add Dedicated Yard Location"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Location" : "Create Location"}
      >
        <div className="form-group">
          <label className="form-label">Client Instance Assignment</label>
          <select
            className="form-select"
            value={formData.clientId}
            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            disabled={!!activeClient}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Zone</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Zone A - Blocks"
            value={formData.zone}
            onChange={e => setFormData({ ...formData, zone: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Bay / Stand</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Bay 05"
            value={formData.bay}
            onChange={e => setFormData({ ...formData, bay: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Storage Type</label>
          <select
            className="form-select"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Raw Blocks">Raw Blocks</option>
            <option value="Sawing">Sawing</option>
            <option value="Slab Bundles">Slab Bundles</option>
            <option value="Defect Store">Defect Store</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Capacity (Tonnes)</label>
          <input
            type="number"
            className="form-input"
            required
            placeholder="e.g. 400"
            value={formData.capacityTonnes}
            onChange={e => setFormData({ ...formData, capacityTonnes: e.target.value })}
          />
        </div>
      </FormDrawer>
    </div>
  );
}

// 6. Users Screen (Separate users per Client with Client instance filtering)
export function UsersScreen() {
  const { users, addUser, updateUser, deleteUser, currentRole, clients, clientRoles, activeClient } = useApp();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || 'CLI-001',
    name: '',
    email: '',
    role: 'Client Admin'
  });

  const displayUsers = activeClient
    ? users.filter(u => u.clientId === activeClient.id)
    : users.filter(u => clientFilter === 'All' || u.clientId === clientFilter);

  const filtered = displayUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.clientName && u.clientName.toLowerCase().includes(search.toLowerCase())) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setFormData({
      clientId: activeClient ? activeClient.id : (clients[0]?.id || 'CLI-001'),
      name: '',
      email: '',
      role: 'Client Admin'
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setFormData({
      clientId: u.clientId || clients[0]?.id || 'CLI-001',
      name: u.name,
      email: u.email,
      role: u.role
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetCli = clients.find(c => c.id === formData.clientId);
    if (editId) {
      updateUser(editId, {
        ...formData,
        clientName: targetCli ? targetCli.name : 'Dedicated Client'
      });
    } else {
      addUser({
        ...formData,
        clientName: targetCli ? targetCli.name : 'Dedicated Client'
      });
    }
    setIsDrawerOpen(false);
  };

  const availableRolesForClient = [
    'Supplier/Client Admin',
    'Client HR Admin',
    'Buyer Admin',
    'Yard Incharge',
    'Accountant',
    ...(clientRoles || []).filter(r => r.clientId === formData.clientId).map(r => r.name)
  ];

  const columns = [
    { header: 'User ID', accessor: 'id' },
    {
      header: 'Assigned Client',
      render: r => {
        const client = clients.find(c => c.id === r.clientId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {client?.logo && (
              <img
                src={client.logo}
                alt={r.clientName}
                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <span style={{ fontWeight: 600 }}>{r.clientName || client?.name || 'Vengo HQ'}</span>
          </div>
        );
      }
    },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      accessor: 'role',
      render: r => (
        <span className={`badge ${r.role === 'Super Admin' ? 'badge-teal' : 'badge-emerald'}`}>
          {r.role}
        </span>
      )
    },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit User', icon: Edit, onClick: () => openEdit(r) },
            { divider: true },
            {
              label: 'Delete User',
              icon: Trash2,
              danger: true,
              confirm: `Delete user ${r.name}?`,
              onClick: () => deleteUser(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          {activeClient ? `${activeClient.name} - Users & Team` : 'Users & Permissions'}
        </h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New User</span>
          </button>
        )}
      </div>

      {!activeClient && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Filter by Client:</span>
          <select
            className="form-select"
            style={{ width: '220px', height: '30px', fontSize: '12px' }}
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
          >
            <option value="All">All Client Users</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
      )}

      <DataTable columns={columns} data={filtered} emptyMessage="No users found." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit User" : "Add Dedicated Client User"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update User" : "Create User"}
      >
        <div className="form-group">
          <label className="form-label">Client Instance</label>
          <select
            className="form-select"
            value={formData.clientId}
            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            disabled={!!activeClient}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            required
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            required
            placeholder="e.g. john@clientdomain.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Role Assignment</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            {availableRolesForClient.map(roleName => (
              <option key={roleName} value={roleName}>{roleName}</option>
            ))}
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}

// 7. Client Roles & Module Permission Assignment Screen
export function ClientRolesScreen() {
  const { clientRoles, addClientRole, updateClientRole, deleteClientRole, clients, currentRole, activeClient } = useApp();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const availableModulesList = [
    { id: 'dashboard', label: 'Dashboard & KPIs' },
    { id: 'masters', label: 'Master Data (Stones, Rates)' },
    { id: 'inventory', label: 'Yard Stock & Slabs' },
    { id: 'purchase', label: 'Purchase Requests & POs' },
    { id: 'receipts', label: 'Weighbridge Intake GRN' },
    { id: 'sales', label: 'Sales Orders & Invoicing' },
    { id: 'returns', label: 'Damage Logging & Returns' },
    { id: 'reports', label: 'Reports & Audit Ledger' },
    { id: 'settings', label: 'Instance Settings' }
  ];

  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || 'CLI-001',
    name: '',
    description: '',
    modules: ['dashboard', 'sales', 'reports']
  });

  const displayRoles = activeClient
    ? (clientRoles || []).filter(r => r.clientId === activeClient.id)
    : (clientRoles || []).filter(r => clientFilter === 'All' || r.clientId === clientFilter);

  const filtered = displayRoles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setEditId(null);
    setFormData({
      clientId: activeClient ? activeClient.id : (clients[0]?.id || 'CLI-001'),
      name: '',
      description: '',
      modules: ['dashboard', 'inventory', 'sales']
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (r) => {
    setEditId(r.id);
    setFormData({
      clientId: r.clientId || clients[0]?.id || 'CLI-001',
      name: r.name,
      description: r.description || '',
      modules: r.modules || ['dashboard']
    });
    setIsDrawerOpen(true);
  };

  const handleToggleModule = (modId) => {
    setFormData(prev => {
      const exists = prev.modules.includes(modId);
      return {
        ...prev,
        modules: exists ? prev.modules.filter(m => m !== modId) : [...prev.modules, modId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateClientRole(editId, formData);
    } else {
      addClientRole(formData);
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    { header: 'Role ID', accessor: 'id' },
    {
      header: 'Client Instance',
      render: r => {
        const client = clients.find(c => c.id === r.clientId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {client?.logo && (
              <img
                src={client.logo}
                alt={client.name}
                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <span style={{ fontWeight: 600 }}>{client?.name || 'General'}</span>
          </div>
        );
      }
    },
    { header: 'Role Title', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Permitted Modules',
      render: r => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(r.modules || []).map(m => (
            <span key={m} className="badge badge-teal" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
              {m}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Role & Modules', icon: Edit, onClick: () => openEdit(r) },
            { divider: true },
            {
              label: 'Delete Role',
              icon: Trash2,
              danger: true,
              confirm: `Delete role ${r.name}?`,
              onClick: () => deleteClientRole(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          {activeClient ? `${activeClient.name} - Custom Roles & Modules` : 'Client Roles & Module Permissions'}
        </h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Role</span>
          </button>
        )}
      </div>

      {!activeClient && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Filter by Client:</span>
          <select
            className="form-select"
            style={{ width: '220px', height: '30px', fontSize: '12px' }}
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
          >
            <option value="All">All Client Roles</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>
      )}

      <DataTable columns={columns} data={filtered} emptyMessage="No custom client roles created." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Client Role" : "Create Client Role & Assign Modules"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Role" : "Save Role"}
      >
        <div className="form-group">
          <label className="form-label">Client Instance</label>
          <select
            className="form-select"
            value={formData.clientId}
            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            disabled={!!activeClient}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Role Title</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Sales Coordinator, Yard Foreman, Quality Inspector"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Purpose</label>
          <input
            className="form-input"
            placeholder="e.g. Grants access to view stock and raise weighbridge receipts"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '8px' }}>Assign Accessible Modules</label>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'var(--soft)',
            padding: '12px',
            borderRadius: 'var(--r-8)',
            border: '1px solid var(--line)'
          }}>
            {availableModulesList.map(mod => {
              const isChecked = formData.modules.includes(mod.id);
              return (
                <label
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleModule(mod.id)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--emerald-600)' }}
                  />
                  <span>{mod.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}

// 8. Menus Master Screen (Full CRUD for Menus & Modules with ActionDropdown)
export function MenusScreen() {
  const { menus, addMenu, updateMenu, deleteMenu, currentRole, activeClient } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    label: '',
    category: 'Operations',
    path: '',
    icon: 'Layers',
    description: '',
    status: 'Active'
  });

  const categories = ['All', 'Core', 'Operations', 'Procurement', 'Commercial', 'Quality', 'Reports', 'Administration'];

  const filtered = (menus || [])
    .filter(m => categoryFilter === 'All' || m.category === categoryFilter)
    .filter(m =>
      (m.label && m.label.toLowerCase().includes(search.toLowerCase())) ||
      (m.id && m.id.toLowerCase().includes(search.toLowerCase())) ||
      (m.path && m.path.toLowerCase().includes(search.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
    );

  const openCreate = () => {
    setEditId(null);
    setFormData({
      id: '',
      label: '',
      category: 'Operations',
      path: '/custom',
      icon: 'Layers',
      description: '',
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (menu) => {
    setEditId(menu.id);
    setFormData({
      id: menu.id,
      label: menu.label || '',
      category: menu.category || 'Operations',
      path: menu.path || '',
      icon: menu.icon || 'Layers',
      description: menu.description || '',
      status: menu.status || 'Active'
    });
    setIsDrawerOpen(true);
  };

  const toggleMenuStatus = (menu) => {
    const nextStatus = menu.status === 'Active' ? 'Disabled' : 'Active';
    updateMenu(menu.id, { status: nextStatus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateMenu(editId, formData);
    } else {
      const generatedId = formData.id || formData.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      addMenu({
        ...formData,
        id: generatedId
      });
    }
    setIsDrawerOpen(false);
  };

  const columns = [
    {
      header: 'Menu ID',
      accessor: 'id',
      render: r => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>
          {r.id}
        </span>
      )
    },
    {
      header: 'Menu Label',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--r-4)',
            backgroundColor: 'var(--soft)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ink)'
          }}>
            <Menu size={13} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.label}</div>
            {r.description && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.description}</div>}
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: r => (
        <span className="badge badge-soft" style={{ fontSize: '11px' }}>
          {r.category || 'Operations'}
        </span>
      )
    },
    {
      header: 'Route / Path',
      accessor: 'path',
      render: r => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--primary)' }}>
          {r.path}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: r => (
        <span className={`badge ${r.status === 'Active' ? 'badge-emerald' : 'badge-ruby'}`}>
          {r.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Edit Menu',
              icon: Edit,
              onClick: () => openEdit(r)
            },
            {
              label: r.status === 'Active' ? 'Disable Menu' : 'Enable Menu',
              icon: r.status === 'Active' ? XCircle : CheckCircle2,
              confirm: `Change menu ${r.label} status to ${r.status === 'Active' ? 'Disabled' : 'Active'}?`,
              onClick: () => toggleMenuStatus(r)
            },
            { divider: true },
            {
              label: 'Delete Menu',
              icon: Trash2,
              danger: true,
              confirm: `Delete module menu ${r.label}?`,
              onClick: () => deleteMenu(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          {activeClient ? `${activeClient.name} - Menu Modules` : 'Menus & Navigation Master'}
        </h1>
        {(currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin') && (
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} />
            <span>New Menu</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Category:</span>
        <select
          className="form-select"
          style={{ width: '180px', height: '30px', fontSize: '12px' }}
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No menu modules found." />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editId ? "Edit Menu Module" : "Create New Menu Module"}
        onSubmit={handleSubmit}
        submitLabel={editId ? "Update Menu" : "Save Menu"}
      >
        <div className="form-group">
          <label className="form-label">Menu ID (Unique Key)</label>
          <input
            className="form-input"
            required
            disabled={!!editId}
            placeholder="e.g. logistics, billing, inspection"
            value={formData.id}
            onChange={e => setFormData({ ...formData, id: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Menu Title / Label</label>
          <input
            className="form-input"
            required
            placeholder="e.g. Quarry Logistics & Dispatch"
            value={formData.label}
            onChange={e => setFormData({ ...formData, label: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Core">Core</option>
            <option value="Operations">Operations</option>
            <option value="Procurement">Procurement</option>
            <option value="Commercial">Commercial</option>
            <option value="Quality">Quality</option>
            <option value="Reports">Reports</option>
            <option value="Administration">Administration</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Route / URL Path</label>
          <input
            className="form-input"
            required
            placeholder="e.g. /logistics or /masters"
            value={formData.path}
            onChange={e => setFormData({ ...formData, path: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Scope</label>
          <input
            className="form-input"
            placeholder="e.g. Manages vehicle gate passes, weigh slips and carrier notes"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}
