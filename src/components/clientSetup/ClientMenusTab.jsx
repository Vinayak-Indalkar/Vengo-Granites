import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderTree,
  ChevronRight,
  Filter,
  Layers,
  LayoutDashboard,
  Users,
  Box,
  FileCheck2,
  Scale,
  Receipt,
  Settings,
  Clock,
  Calendar,
  Briefcase,
  Building2,
  BarChart3,
  AlertTriangle,
  PlusCircle,
  Calculator
} from 'lucide-react';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';

// All actual existing menus and submenus across the Granite ERP application
const EXISTING_APP_MENUS = [
  // 1. Dashboard
  {
    id: 'MN-001',
    code: 'MN-001',
    label: 'Dashboard',
    type: 'Root Menu',
    route: '/dashboard',
    parent: null,
    icon: 'LayoutDashboard',
    order: 1,
    roles: ['Admin', 'Manager', 'Staff'],
    status: 'Active',
    scope: 'all'
  },

  // 2. Client Setup & Submenus
  {
    id: 'MN-002',
    code: 'MN-002',
    label: 'Client Setup',
    type: 'Root Menu',
    route: '/client-setup?submenu=suppliers',
    parent: null,
    icon: 'Users',
    order: 2,
    roles: ['Admin'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-003',
    code: 'MN-003',
    label: 'Suppliers',
    type: 'Submenu',
    route: '/client-setup?submenu=suppliers',
    parent: 'Client Setup',
    icon: 'ChevronRight',
    order: 1,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'supplier'
  },
  {
    id: 'MN-004',
    code: 'MN-004',
    label: 'Buyers',
    type: 'Submenu',
    route: '/client-setup?submenu=buyers',
    parent: 'Client Setup',
    icon: 'ChevronRight',
    order: 2,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'buyer'
  },
  {
    id: 'MN-005',
    code: 'MN-005',
    label: 'Contractors',
    type: 'Submenu',
    route: '/client-setup?submenu=contractors',
    parent: 'Client Setup',
    icon: 'ChevronRight',
    order: 3,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'contractor'
  },

  // 3. Masters & Submenus
  {
    id: 'MN-006',
    code: 'MN-006',
    label: 'Masters',
    type: 'Root Menu',
    route: '/masters?submenu=inventory',
    parent: null,
    icon: 'Layers',
    order: 3,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-007',
    code: 'MN-007',
    label: 'Inventory Masters',
    type: 'Submenu',
    route: '/masters?submenu=inventory',
    parent: 'Masters',
    icon: 'ChevronRight',
    order: 1,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'all'
  },

  // 4. Inventory & Submenus
  {
    id: 'MN-008',
    code: 'MN-008',
    label: 'Inventory',
    type: 'Root Menu',
    route: '/inventory',
    parent: null,
    icon: 'Box',
    order: 4,
    roles: ['Admin', 'Manager', 'Operator'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-009',
    code: 'MN-009',
    label: 'Inbound',
    type: 'Submenu',
    route: '/inventory?submenu=inbound',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 1,
    roles: ['Admin', 'Manager', 'Operator'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-010',
    code: 'MN-010',
    label: 'Quality Control',
    type: 'Submenu',
    route: '/inventory?submenu=qc',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 2,
    roles: ['Admin', 'Quality Inspector', 'Manager'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-011',
    code: 'MN-011',
    label: 'Processing',
    type: 'Submenu',
    route: '/inventory?submenu=processing',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 3,
    roles: ['Admin', 'Production Manager', 'Operator'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-012',
    code: 'MN-012',
    label: 'Storage & Labels',
    type: 'Submenu',
    route: '/inventory?submenu=storage',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 4,
    roles: ['Admin', 'Yard Supervisor'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-013',
    code: 'MN-013',
    label: 'Stock',
    type: 'Submenu',
    route: '/inventory?submenu=stock',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 5,
    roles: ['Admin', 'Manager', 'Staff'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-014',
    code: 'MN-014',
    label: 'Exceptions',
    type: 'Submenu',
    route: '/inventory?submenu=exceptions',
    parent: 'Inventory',
    icon: 'ChevronRight',
    order: 6,
    roles: ['Admin', 'Manager'],
    status: 'Active',
    scope: 'all'
  },

  // 5. Purchase Orders
  {
    id: 'MN-015',
    code: 'MN-015',
    label: 'Purchase Orders',
    type: 'Root Menu',
    route: '/purchase-orders',
    parent: null,
    icon: 'FileCheck2',
    order: 5,
    roles: ['Admin', 'Manager', 'Procurement Officer'],
    status: 'Active',
    scope: 'supplier'
  },

  // 6. Purchase Requests
  {
    id: 'MN-016',
    code: 'MN-016',
    label: 'Purchase Requests',
    type: 'Root Menu',
    route: '/purchase-requests',
    parent: null,
    icon: 'PlusCircle',
    order: 6,
    roles: ['Buyer Admin', 'Procurement Officer'],
    status: 'Active',
    scope: 'buyer'
  },

  // 7. Receipts
  {
    id: 'MN-017',
    code: 'MN-017',
    label: 'Receipts',
    type: 'Root Menu',
    route: '/receipts',
    parent: null,
    icon: 'Scale',
    order: 7,
    roles: ['Admin', 'Weighbridge Operator', 'Gatekeeper'],
    status: 'Active',
    scope: 'all'
  },

  // 8. Sales Invoices
  {
    id: 'MN-018',
    code: 'MN-018',
    label: 'Sales Invoices',
    type: 'Root Menu',
    route: '/sales-invoices',
    parent: null,
    icon: 'Receipt',
    order: 8,
    roles: ['Admin', 'Billing Clerk', 'Accountant'],
    status: 'Active',
    scope: 'all'
  },

  // 9. Accounts
  {
    id: 'MN-019',
    code: 'MN-019',
    label: 'Accounts',
    type: 'Root Menu',
    route: '/accounts',
    parent: null,
    icon: 'Calculator',
    order: 9,
    roles: ['Admin', 'Finance Manager', 'Accountant'],
    status: 'Active',
    scope: 'all'
  },

  // 10. HR & Workforce Menus
  {
    id: 'MN-020',
    code: 'MN-020',
    label: 'Personnel',
    type: 'Root Menu',
    route: '/hr?tab=personnel',
    parent: null,
    icon: 'Users',
    order: 10,
    roles: ['Client HR Admin', 'HR Manager'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-021',
    code: 'MN-021',
    label: 'Attendance',
    type: 'Root Menu',
    route: '/hr?tab=attendance',
    parent: null,
    icon: 'Clock',
    order: 11,
    roles: ['Client HR Admin', 'Timekeeper'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-022',
    code: 'MN-022',
    label: 'Shift & Roster',
    type: 'Root Menu',
    route: '/hr?tab=roster',
    parent: null,
    icon: 'Calendar',
    order: 12,
    roles: ['Client HR Admin', 'Supervisor'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-023',
    code: 'MN-023',
    label: 'Leave & Holidays',
    type: 'Root Menu',
    route: '/hr?tab=leave',
    parent: null,
    icon: 'Briefcase',
    order: 13,
    roles: ['Client HR Admin', 'Staff'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-024',
    code: 'MN-024',
    label: 'HR Masters',
    type: 'Root Menu',
    route: '/hr?tab=masters',
    parent: null,
    icon: 'Building2',
    order: 14,
    roles: ['Client HR Admin'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-025',
    code: 'MN-025',
    label: 'Audit & Reports',
    type: 'Root Menu',
    route: '/hr?tab=audit',
    parent: null,
    icon: 'BarChart3',
    order: 15,
    roles: ['Client HR Admin', 'Auditor'],
    status: 'Active',
    scope: 'all'
  },

  // 11. Returns & Reports
  {
    id: 'MN-026',
    code: 'MN-026',
    label: 'Damage Logging',
    type: 'Root Menu',
    route: '/returns?tab=defective',
    parent: null,
    icon: 'AlertTriangle',
    order: 16,
    roles: ['Buyer Admin', 'Quality Inspector'],
    status: 'Active',
    scope: 'buyer'
  },
  {
    id: 'MN-027',
    code: 'MN-027',
    label: 'Daily Reports',
    type: 'Root Menu',
    route: '/reports?tab=sales',
    parent: null,
    icon: 'BarChart3',
    order: 17,
    roles: ['Buyer Admin', 'Manager'],
    status: 'Active',
    scope: 'buyer'
  },

  // 12. Settings & Submenus
  {
    id: 'MN-028',
    code: 'MN-028',
    label: 'Settings',
    type: 'Root Menu',
    route: '/settings',
    parent: null,
    icon: 'Settings',
    order: 18,
    roles: ['Admin'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-029',
    code: 'MN-029',
    label: 'General Settings',
    type: 'Submenu',
    route: '/settings?submenu=general',
    parent: 'Settings',
    icon: 'ChevronRight',
    order: 1,
    roles: ['Admin'],
    status: 'Active',
    scope: 'all'
  },
  {
    id: 'MN-030',
    code: 'MN-030',
    label: 'Custom Fields Builder',
    type: 'Submenu',
    route: '/settings?submenu=custom-fields',
    parent: 'Settings',
    icon: 'ChevronRight',
    order: 2,
    roles: ['Admin'],
    status: 'Active',
    scope: 'all'
  }
];

export function ClientMenusTab({ scope = 'supplier' }) {
  const [menus, setMenus] = useState(EXISTING_APP_MENUS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'ROOT' | 'SUBMENU'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    route: '',
    parent: '',
    icon: 'FolderTree',
    order: 1,
    roles: ['Admin'],
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

  const availableParents = useMemo(() => {
    return Array.from(new Set(menus.filter(m => !m.parent).map(m => m.label)));
  }, [menus]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextCode = `MN-${String(menus.length + 1).padStart(3, '0')}`;
    setFormData({
      code: nextCode,
      label: '',
      route: '',
      parent: '',
      icon: 'FolderTree',
      order: menus.length + 1,
      roles: ['Admin'],
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (menu) => {
    setEditingItem(menu);
    setFormData({
      code: menu.code,
      label: menu.label,
      route: menu.route,
      parent: menu.parent || '',
      icon: menu.icon || 'FolderTree',
      order: menu.order || 1,
      roles: Array.isArray(menu.roles) ? [...menu.roles] : ['Admin'],
      status: menu.status || 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label) return;

    const determinedType = formData.parent ? 'Submenu' : 'Root Menu';

    if (editingItem) {
      setMenus(prev =>
        prev.map(m =>
          m.id === editingItem.id
            ? {
                ...m,
                ...formData,
                type: determinedType,
                parent: formData.parent ? formData.parent : null
              }
            : m
        )
      );
    } else {
      const newMenu = {
        id: formData.code || `MN-${Date.now()}`,
        ...formData,
        type: determinedType,
        parent: formData.parent ? formData.parent : null,
        scope: scope
      };
      setMenus(prev => [...prev, newMenu]);
    }

    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleToggleStatus = (menu) => {
    const nextStatus = menu.status === 'Active' ? 'Inactive' : 'Active';
    setMenus(prev =>
      prev.map(m => (m.id === menu.id ? { ...m, status: nextStatus } : m))
    );
  };

  const handleDeletePrompt = (menu) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Menu / Submenu Item',
      message: `Are you sure you want to delete menu item "${menu.label}" (${menu.route})?`,
      danger: true,
      confirmLabel: 'Delete Menu Item',
      onConfirm: () => {
        setMenus(prev => prev.filter(m => m.id !== menu.id));
      }
    });
  };

  const toggleRole = (role) => {
    setFormData(prev => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter(r => r !== role) : [...prev.roles, role]
      };
    });
  };

  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      // Type filter
      if (typeFilter === 'ROOT' && m.parent) return false;
      if (typeFilter === 'SUBMENU' && !m.parent) return false;

      // Search filter
      const q = searchQuery.toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.route.toLowerCase().includes(q) ||
        (m.parent && m.parent.toLowerCase().includes(q))
      );
    });
  }, [menus, searchQuery, typeFilter]);

  const columns = [
    {
      key: 'code',
      title: 'Menu Code',
      width: '110px',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 600, fontSize: '12px' }}>
          {val}
        </span>
      )
    },
    {
      key: 'label',
      title: 'Menu / Submenu Label',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.parent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted)',
                background: 'var(--surface-sunken)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {row.parent}
              </span>
              <ChevronRight size={13} style={{ color: 'var(--muted)' }} />
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.label}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: 'rgba(34, 35, 80, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-color, #222350)'
              }}>
                <FolderTree size={14} />
              </div>
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>{row.label}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      width: '110px',
      render: (_, row) => (
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '12px',
          background: row.parent ? '#f1f5f9' : '#e0e7ff',
          color: row.parent ? '#475569' : '#3730a3'
        }}>
          {row.parent ? 'Submenu' : 'Root Menu'}
        </span>
      )
    },
    {
      key: 'route',
      title: 'Navigation Route',
      render: (val) => (
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11.5px',
          background: 'var(--surface-sunken)',
          padding: '2.5px 7px',
          borderRadius: '4px',
          color: 'var(--ink)'
        }}>
          {val}
        </span>
      )
    },
    {
      key: 'order',
      title: 'Order',
      width: '70px',
      align: 'center',
      render: (val) => (
        <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--muted)' }}>
          #{val}
        </span>
      )
    },
    {
      key: 'roles',
      title: 'Roles Permitted',
      render: (roles) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {(roles || []).map((r, i) => (
            <span
              key={i}
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '1.5px 6px',
                borderRadius: '4px',
                background: 'rgba(34, 35, 80, 0.08)',
                color: 'var(--brand-color, #222350)'
              }}
            >
              {r}
            </span>
          ))}
        </div>
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
            label: 'Edit Menu Item',
            icon: Edit2,
            onClick: () => handleOpenEdit(row)
          },
          {
            label: row.status === 'Active' ? 'Deactivate Menu' : 'Activate Menu',
            icon: row.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleStatus(row)
          },
          { divider: true },
          {
            label: 'Delete Menu Item',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            Menus & Submenus
          </h2>

          {/* Type Filter Buttons without count badges */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-sunken)', padding: '2px', borderRadius: '6px' }}>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('ALL')}
              style={{ fontSize: '12px', padding: '3px 10px', height: '28px' }}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === 'ROOT' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('ROOT')}
              style={{ fontSize: '12px', padding: '3px 10px', height: '28px' }}
            >
              Root Menus
            </button>
            <button
              type="button"
              className={`btn btn-sm ${typeFilter === 'SUBMENU' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTypeFilter('SUBMENU')}
              style={{ fontSize: '12px', padding: '3px 10px', height: '28px' }}
            >
              Submenus
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenAdd}
        >
          <Plus size={14} />
          <span>Add Menu / Submenu</span>
        </button>
      </div>

      {/* Menus Table */}
      <DataTable
        columns={columns}
        data={filteredMenus}
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
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Menu / Submenu' : 'Add Menu / Submenu Item'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsDrawerOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {editingItem ? 'Save Changes' : 'Create Menu Item'}
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
              <label className="form-label">Menu Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                disabled
                style={{ background: 'var(--surface-sunken)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Menu / Submenu Label</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Inbound Stock or Dispatches"
                value={formData.label}
                onChange={(e) => setFormData(p => ({ ...p, label: e.target.value }))}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Route / Navigation Path</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. /inventory?submenu=inbound"
                value={formData.route}
                onChange={(e) => setFormData(p => ({ ...p, route: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parent Menu</label>
              <select
                className="form-select"
                value={formData.parent}
                onChange={(e) => setFormData(p => ({ ...p, parent: e.target.value }))}
              >
                <option value="">None (Top Level Root Menu)</option>
                {availableParents.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="99"
                value={formData.order}
                onChange={(e) => setFormData(p => ({ ...p, order: Number(e.target.value) || 1 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Box, Users, Layers, Receipt"
                value={formData.icon}
                onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Permitted Roles</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Admin', 'Manager', 'Staff', 'Operator', 'Billing Clerk', 'Client HR Admin', 'Buyer Admin', 'Quality Inspector', 'Weighbridge Operator'].map((role) => (
                <label
                  key={role}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  <span>{role}</span>
                </label>
              ))}
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
