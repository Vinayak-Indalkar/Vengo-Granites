import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Box,
  Receipt,
  Layers,
  FileCheck2,
  Scale,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sliders,
  Type,
  Hash,
  List,
  Calendar,
  CheckSquare,
  Upload,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  FolderTree,
  Menu,
  Bookmark,
  FileSpreadsheet
} from 'lucide-react';
import {
  DataTable,
  FormDrawer,
  ConfirmDialog,
  StatusBadge,
  StatCard,
  ActionDropdown
} from '../CommonComponents';
import {
  DEFAULT_MODULES,
  DEFAULT_SUBMENUS,
  DEFAULT_TABS,
  APPLICATION_STANDARD_FIELDS,
  ICON_MAP,
  AVAILABLE_ICONS
} from './systemSchemaDefaults';

export { APPLICATION_STANDARD_FIELDS };

// Backwards compatibility export
export const MODULE_DEFINITIONS = DEFAULT_MODULES.map(m => ({
  id: m.id,
  name: m.name,
  shortName: m.name,
  icon: ICON_MAP[m.iconName] || Layers,
  description: m.description,
  forms: (DEFAULT_SUBMENUS.filter(s => s.moduleId === m.id)).map(s => ({
    id: s.id,
    name: s.name,
    tabs: DEFAULT_TABS.filter(t => t.submenuId === s.id).map(t => t.name)
  }))
}));

export function CustomFieldsBuilder() {
  const {
    customFields,
    addCustomField,
    updateCustomField,
    deleteCustomField,
    showToast,
    t
  } = useApp();

  // Active top-level Tab: 'modules' | 'submenus' | 'tabs' | 'forms'
  const [activeTab, setActiveTab] = useState('modules');

  // --- PERSISTED STATE FOR MODULES, SUBMENUS, TABS ---
  const [modules, setModules] = useState(() => {
    try {
      const stored = localStorage.getItem('granite_custom_modules');
      return stored ? JSON.parse(stored) : DEFAULT_MODULES;
    } catch (e) {
      return DEFAULT_MODULES;
    }
  });

  const [submenus, setSubmenus] = useState(() => {
    try {
      const stored = localStorage.getItem('granite_custom_submenus');
      return stored ? JSON.parse(stored) : DEFAULT_SUBMENUS;
    } catch (e) {
      return DEFAULT_SUBMENUS;
    }
  });

  const [tabsList, setTabsList] = useState(() => {
    try {
      const stored = localStorage.getItem('granite_custom_tabs');
      return stored ? JSON.parse(stored) : DEFAULT_TABS;
    } catch (e) {
      return DEFAULT_TABS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('granite_custom_modules', JSON.stringify(modules));
    } catch (e) {}
  }, [modules]);

  useEffect(() => {
    try {
      localStorage.setItem('granite_custom_submenus', JSON.stringify(submenus));
    } catch (e) {}
  }, [submenus]);

  useEffect(() => {
    try {
      localStorage.setItem('granite_custom_tabs', JSON.stringify(tabsList));
    } catch (e) {}
  }, [tabsList]);

  // --- FILTERS ---
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [selectedSubmenuFilter, setSelectedSubmenuFilter] = useState('all');
  const [selectedTabFilter, setSelectedTabFilter] = useState('all');
  const [fieldScopeFilter, setFieldScopeFilter] = useState('All'); // 'All' | 'Standard' | 'Custom'

  // Reset sub-filters if parent filter changes
  const handleModuleFilterChange = (modId) => {
    setSelectedModuleFilter(modId);
    setSelectedSubmenuFilter('all');
    setSelectedTabFilter('all');
  };

  const handleSubmenuFilterChange = (subId) => {
    setSelectedSubmenuFilter(subId);
    setSelectedTabFilter('all');
  };

  // --- CONFIRM DIALOG STATE ---
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false
  });

  // --- RESET TO SYSTEM DEFAULTS ---
  const handleResetDefaults = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to System Defaults',
      message: 'Are you sure you want to reset all Modules, Submenus, and Tabs to factory defaults? Any custom structural additions will be restored.',
      danger: true,
      onConfirm: () => {
        setModules(DEFAULT_MODULES);
        setSubmenus(DEFAULT_SUBMENUS);
        setTabsList(DEFAULT_TABS);
        localStorage.removeItem('granite_custom_modules');
        localStorage.removeItem('granite_custom_submenus');
        localStorage.removeItem('granite_custom_tabs');
        if (showToast) showToast('System navigation and schema restored to factory defaults.', 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ==========================================
  // TAB 1: MODULES CRUD
  // ==========================================
  const [isModuleDrawerOpen, setIsModuleDrawerOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    name: '',
    code: '',
    route: '',
    iconName: 'Layers',
    order: 1,
    status: 'Active',
    description: ''
  });

  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleForm({
      name: '',
      code: `MOD-${Date.now().toString().slice(-4)}`,
      route: '',
      iconName: 'Layers',
      order: modules.length + 1,
      status: 'Active',
      description: ''
    });
    setIsModuleDrawerOpen(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({
      name: mod.name || '',
      code: mod.code || mod.id || '',
      route: mod.route || '',
      iconName: mod.iconName || 'Layers',
      order: mod.order || 1,
      status: mod.status || 'Active',
      description: mod.description || ''
    });
    setIsModuleDrawerOpen(true);
  };

  const handleSaveModule = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalName = moduleForm.name.trim() || 'New Module';
    const finalId = editingModule ? editingModule.id : (moduleForm.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `mod-${Date.now()}`);

    if (editingModule) {
      setModules(prev => prev.map(m => m.id === editingModule.id ? {
        ...m,
        ...moduleForm,
        name: finalName,
        order: Number(moduleForm.order) || 1
      } : m));
      if (showToast) showToast(`Module "${finalName}" updated successfully.`);
    } else {
      const newMod = {
        id: finalId,
        name: finalName,
        code: moduleForm.code.trim() || `MOD-${finalId.toUpperCase()}`,
        route: moduleForm.route.trim() || `/${finalId}`,
        iconName: moduleForm.iconName,
        order: Number(moduleForm.order) || (modules.length + 1),
        status: moduleForm.status,
        description: moduleForm.description.trim()
      };
      setModules(prev => [...prev, newMod]);
      if (showToast) showToast(`Module "${finalName}" created successfully.`);
    }
    setIsModuleDrawerOpen(false);
  };

  const handleToggleModuleStatus = (mod) => {
    const nextStatus = mod.status === 'Active' ? 'Inactive' : 'Active';
    setModules(prev => prev.map(m => m.id === mod.id ? { ...m, status: nextStatus } : m));
    if (showToast) showToast(`Module "${mod.name}" is now ${nextStatus}.`);
  };

  const handleDeleteModule = (mod) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Module: ${mod.name}`,
      message: `Are you sure you want to delete "${mod.name}"? Submenus and tabs associated with this module will be archived.`,
      danger: true,
      onConfirm: () => {
        setModules(prev => prev.filter(m => m.id !== mod.id));
        setSubmenus(prev => prev.filter(s => s.moduleId !== mod.id));
        setTabsList(prev => prev.filter(t => t.moduleId !== mod.id));
        if (showToast) showToast(`Module "${mod.name}" deleted.`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Modules Table Columns
  const moduleColumns = [
    {
      header: 'Module Name',
      accessor: 'name',
      render: r => {
        const IconComp = ICON_MAP[r.iconName] || Layers;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--brand-surface, #EEF2F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-color)'
            }}>
              <IconComp size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
              {r.description && (
                <div style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.description}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Code / Key',
      accessor: 'code',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--muted)' }}>{r.code || r.id}</span>
    },
    {
      header: 'Route Path',
      accessor: 'route',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--brand-color)' }}>{r.route || '—'}</span>
    },
    {
      header: 'Submenus',
      accessor: r => submenus.filter(s => s.moduleId === r.id).length,
      render: r => {
        const count = submenus.filter(s => s.moduleId === r.id).length;
        return <span className="badge badge-subtle">{count} submenus</span>;
      }
    },
    {
      header: 'Order',
      accessor: 'order',
      width: '70px',
      align: 'center',
      render: r => <span>{r.order || 1}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => (
        <button
          type="button"
          onClick={() => handleToggleModuleStatus(r)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Toggle status"
        >
          <StatusBadge status={r.status || 'Active'} />
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'Edit Module',
            icon: Edit2,
            onClick: () => handleOpenEditModule(r)
          },
          {
            label: r.status === 'Active' ? 'Deactivate' : 'Activate',
            icon: r.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleModuleStatus(r)
          },
          { divider: true },
          {
            label: 'Delete Module',
            icon: Trash2,
            danger: true,
            onClick: () => handleDeleteModule(r)
          }
        ];
        return <ActionDropdown items={items} />;
      }
    }
  ];

  // ==========================================
  // TAB 2: SUBMENUS CRUD
  // ==========================================
  const [isSubmenuDrawerOpen, setIsSubmenuDrawerOpen] = useState(false);
  const [editingSubmenu, setEditingSubmenu] = useState(null);
  const [submenuForm, setSubmenuForm] = useState({
    moduleId: 'client-setup',
    name: '',
    code: '',
    route: '',
    order: 1,
    status: 'Active',
    description: ''
  });

  const filteredSubmenus = useMemo(() => {
    if (selectedModuleFilter === 'all') return submenus;
    return submenus.filter(s => s.moduleId === selectedModuleFilter);
  }, [submenus, selectedModuleFilter]);

  const handleOpenAddSubmenu = () => {
    setEditingSubmenu(null);
    const defaultMod = selectedModuleFilter !== 'all' ? selectedModuleFilter : (modules[0]?.id || 'client-setup');
    setSubmenuForm({
      moduleId: defaultMod,
      name: '',
      code: `SUB-${Date.now().toString().slice(-4)}`,
      route: '',
      order: filteredSubmenus.length + 1,
      status: 'Active',
      description: ''
    });
    setIsSubmenuDrawerOpen(true);
  };

  const handleOpenEditSubmenu = (sub) => {
    setEditingSubmenu(sub);
    setSubmenuForm({
      moduleId: sub.moduleId || 'client-setup',
      name: sub.name || '',
      code: sub.code || sub.id || '',
      route: sub.route || '',
      order: sub.order || 1,
      status: sub.status || 'Active',
      description: sub.description || ''
    });
    setIsSubmenuDrawerOpen(true);
  };

  const handleSaveSubmenu = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalName = submenuForm.name.trim() || 'New Submenu';
    const finalId = editingSubmenu ? editingSubmenu.id : (submenuForm.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `sub-${Date.now()}`);

    if (editingSubmenu) {
      setSubmenus(prev => prev.map(s => s.id === editingSubmenu.id ? {
        ...s,
        ...submenuForm,
        name: finalName,
        order: Number(submenuForm.order) || 1
      } : s));
      if (showToast) showToast(`Submenu "${finalName}" updated.`);
    } else {
      const newSub = {
        id: finalId,
        moduleId: submenuForm.moduleId,
        name: finalName,
        code: submenuForm.code.trim() || `SUB-${finalId.toUpperCase()}`,
        route: submenuForm.route.trim() || `/module?submenu=${finalId}`,
        order: Number(submenuForm.order) || 1,
        status: submenuForm.status,
        description: submenuForm.description.trim()
      };
      setSubmenus(prev => [...prev, newSub]);
      if (showToast) showToast(`Submenu "${finalName}" created.`);
    }
    setIsSubmenuDrawerOpen(false);
  };

  const handleToggleSubmenuStatus = (sub) => {
    const nextStatus = sub.status === 'Active' ? 'Inactive' : 'Active';
    setSubmenus(prev => prev.map(s => s.id === sub.id ? { ...s, status: nextStatus } : s));
    if (showToast) showToast(`Submenu "${sub.name}" is now ${nextStatus}.`);
  };

  const handleDeleteSubmenu = (sub) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Submenu: ${sub.name}`,
      message: `Are you sure you want to delete "${sub.name}"? Child tabs in this submenu will also be removed.`,
      danger: true,
      onConfirm: () => {
        setSubmenus(prev => prev.filter(s => s.id !== sub.id));
        setTabsList(prev => prev.filter(t => t.submenuId !== sub.id));
        if (showToast) showToast(`Submenu "${sub.name}" deleted.`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const submenuColumns = [
    {
      header: 'Submenu Name',
      accessor: 'name',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          {r.description && (
            <div style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.description}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Parent Module',
      accessor: 'moduleId',
      render: r => {
        const mod = modules.find(m => m.id === r.moduleId);
        return <span className="badge badge-cobalt">{mod?.name || r.moduleId}</span>;
      }
    },
    {
      header: 'Code / Key',
      accessor: 'code',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--muted)' }}>{r.code || r.id}</span>
    },
    {
      header: 'Route Path',
      accessor: 'route',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--brand-color)' }}>{r.route || '—'}</span>
    },
    {
      header: 'Tabs',
      accessor: r => tabsList.filter(t => t.submenuId === r.id).length,
      render: r => {
        const count = tabsList.filter(t => t.submenuId === r.id).length;
        return <span className="badge badge-subtle">{count} tabs</span>;
      }
    },
    {
      header: 'Order',
      accessor: 'order',
      width: '70px',
      align: 'center',
      render: r => <span>{r.order || 1}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => (
        <button
          type="button"
          onClick={() => handleToggleSubmenuStatus(r)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Toggle status"
        >
          <StatusBadge status={r.status || 'Active'} />
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'Edit Submenu',
            icon: Edit2,
            onClick: () => handleOpenEditSubmenu(r)
          },
          {
            label: r.status === 'Active' ? 'Deactivate' : 'Activate',
            icon: r.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleSubmenuStatus(r)
          },
          { divider: true },
          {
            label: 'Delete Submenu',
            icon: Trash2,
            danger: true,
            onClick: () => handleDeleteSubmenu(r)
          }
        ];
        return <ActionDropdown items={items} />;
      }
    }
  ];

  // ==========================================
  // TAB 3: TABS CRUD
  // ==========================================
  const [isTabDrawerOpen, setIsTabDrawerOpen] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [tabForm, setTabForm] = useState({
    moduleId: 'client-setup',
    submenuId: 'sub-suppliers',
    name: '',
    code: '',
    hasCountBadge: false,
    order: 1,
    status: 'Active',
    description: ''
  });

  const availableSubmenusForTabForm = useMemo(() => {
    return submenus.filter(s => s.moduleId === tabForm.moduleId);
  }, [submenus, tabForm.moduleId]);

  const filteredTabs = useMemo(() => {
    return tabsList.filter(t => {
      const matchMod = selectedModuleFilter === 'all' || t.moduleId === selectedModuleFilter;
      const matchSub = selectedSubmenuFilter === 'all' || t.submenuId === selectedSubmenuFilter;
      return matchMod && matchSub;
    });
  }, [tabsList, selectedModuleFilter, selectedSubmenuFilter]);

  const handleOpenAddTab = () => {
    setEditingTab(null);
    const modId = selectedModuleFilter !== 'all' ? selectedModuleFilter : (modules[0]?.id || 'client-setup');
    const firstSub = submenus.find(s => s.moduleId === modId)?.id || submenus[0]?.id || 'sub-suppliers';
    setTabForm({
      moduleId: modId,
      submenuId: selectedSubmenuFilter !== 'all' ? selectedSubmenuFilter : firstSub,
      name: '',
      code: `TAB-${Date.now().toString().slice(-4)}`,
      hasCountBadge: false,
      order: filteredTabs.length + 1,
      status: 'Active',
      description: ''
    });
    setIsTabDrawerOpen(true);
  };

  const handleOpenEditTab = (t) => {
    setEditingTab(t);
    setTabForm({
      moduleId: t.moduleId || 'client-setup',
      submenuId: t.submenuId || 'sub-suppliers',
      name: t.name || '',
      code: t.code || t.id || '',
      hasCountBadge: !!t.hasCountBadge,
      order: t.order || 1,
      status: t.status || 'Active',
      description: t.description || ''
    });
    setIsTabDrawerOpen(true);
  };

  const handleSaveTab = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalName = tabForm.name.trim() || 'New Tab';
    const finalId = editingTab ? editingTab.id : (tabForm.code.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `tab-${Date.now()}`);

    if (editingTab) {
      setTabsList(prev => prev.map(t => t.id === editingTab.id ? {
        ...t,
        ...tabForm,
        name: finalName,
        order: Number(tabForm.order) || 1
      } : t));
      if (showToast) showToast(`Tab "${finalName}" updated.`);
    } else {
      const newT = {
        id: finalId,
        moduleId: tabForm.moduleId,
        submenuId: tabForm.submenuId,
        name: finalName,
        code: tabForm.code.trim() || `TAB-${finalId.toUpperCase()}`,
        hasCountBadge: tabForm.hasCountBadge,
        order: Number(tabForm.order) || 1,
        status: tabForm.status,
        description: tabForm.description.trim()
      };
      setTabsList(prev => [...prev, newT]);
      if (showToast) showToast(`Tab "${finalName}" created.`);
    }
    setIsTabDrawerOpen(false);
  };

  const handleToggleTabStatus = (t) => {
    const nextStatus = t.status === 'Active' ? 'Inactive' : 'Active';
    setTabsList(prev => prev.map(item => item.id === t.id ? { ...item, status: nextStatus } : item));
    if (showToast) showToast(`Tab "${t.name}" is now ${nextStatus}.`);
  };

  const handleDeleteTab = (t) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Tab: ${t.name}`,
      message: `Are you sure you want to delete tab "${t.name}"?`,
      danger: true,
      onConfirm: () => {
        setTabsList(prev => prev.filter(item => item.id !== t.id));
        if (showToast) showToast(`Tab "${t.name}" deleted.`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const tabColumns = [
    {
      header: 'Tab Name',
      accessor: 'name',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          {r.description && (
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.description}</div>
          )}
        </div>
      )
    },
    {
      header: 'Parent Submenu',
      accessor: 'submenuId',
      render: r => {
        const sub = submenus.find(s => s.id === r.submenuId);
        return <span className="badge badge-teal">{sub?.name || r.submenuId}</span>;
      }
    },
    {
      header: 'Parent Module',
      accessor: 'moduleId',
      render: r => {
        const mod = modules.find(m => m.id === r.moduleId);
        return <span className="badge badge-cobalt">{mod?.name || r.moduleId}</span>;
      }
    },
    {
      header: 'Code / Key',
      accessor: 'code',
      render: r => <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--muted)' }}>{r.code || r.id}</span>
    },
    {
      header: 'Count Badge',
      accessor: 'hasCountBadge',
      width: '110px',
      render: r => r.hasCountBadge ? (
        <span className="badge badge-amber" style={{ fontSize: '10px' }}>Enabled</span>
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Disabled</span>
      )
    },
    {
      header: 'Order',
      accessor: 'order',
      width: '70px',
      align: 'center',
      render: r => <span>{r.order || 1}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => (
        <button
          type="button"
          onClick={() => handleToggleTabStatus(r)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Toggle status"
        >
          <StatusBadge status={r.status || 'Active'} />
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'Edit Tab',
            icon: Edit2,
            onClick: () => handleOpenEditTab(r)
          },
          {
            label: r.status === 'Active' ? 'Deactivate' : 'Activate',
            icon: r.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleTabStatus(r)
          },
          { divider: true },
          {
            label: 'Delete Tab',
            icon: Trash2,
            danger: true,
            onClick: () => handleDeleteTab(r)
          }
        ];
        return <ActionDropdown items={items} />;
      }
    }
  ];

  // ==========================================
  // TAB 4: FORMS & FIELDS CRUD
  // ==========================================
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    label: '',
    key: '',
    type: 'text',
    optionsStr: '',
    placeholder: '',
    helpText: '',
    required: false,
    status: 'Active',
    isStandard: false
  });

  // Calculate merged fields catalog (Standard + Custom)
  const allMergedFields = useMemo(() => {
    const stdMapped = APPLICATION_STANDARD_FIELDS.map(std => {
      const override = (customFields || []).find(c => c.key === std.key || c.id === `STD-${std.formId}-${std.key}`);
      if (override) {
        return {
          ...std,
          ...override,
          isStandard: true,
          isOverridden: true
        };
      }
      return {
        ...std,
        id: `STD-${std.formId}-${std.key}`,
        status: std.status || 'Active',
        isStandard: true,
        isOverridden: false
      };
    });

    const pureCustom = (customFields || []).filter(c => {
      return !APPLICATION_STANDARD_FIELDS.some(std => std.key === c.key || c.id === `STD-${std.formId}-${std.key}`);
    }).map(c => ({
      ...c,
      isStandard: false
    }));

    return [...stdMapped, ...pureCustom];
  }, [customFields]);

  // Filtered fields based on dropdown selections
  const filteredFields = useMemo(() => {
    return allMergedFields.filter(f => {
      if (selectedModuleFilter !== 'all' && f.moduleId !== selectedModuleFilter) return false;
      if (selectedSubmenuFilter !== 'all' && f.formId !== selectedSubmenuFilter && f.formId !== selectedSubmenuFilter.replace('sub-', '')) return false;
      if (selectedTabFilter !== 'all' && f.tab !== selectedTabFilter) return false;
      if (fieldScopeFilter === 'Standard' && !f.isStandard) return false;
      if (fieldScopeFilter === 'Custom' && f.isStandard) return false;
      return true;
    });
  }, [allMergedFields, selectedModuleFilter, selectedSubmenuFilter, selectedTabFilter, fieldScopeFilter]);

  const handleOpenAddField = () => {
    setEditingField(null);
    const modId = selectedModuleFilter !== 'all' ? selectedModuleFilter : 'client-setup';
    const subId = selectedSubmenuFilter !== 'all' ? selectedSubmenuFilter : 'suppliers';
    const tabName = selectedTabFilter !== 'all' ? selectedTabFilter : 'General';
    setFieldForm({
      moduleId: modId,
      formId: subId,
      tab: tabName,
      label: '',
      key: '',
      type: 'text',
      optionsStr: '',
      placeholder: '',
      helpText: '',
      required: false,
      status: 'Active',
      isStandard: false
    });
    setIsFieldDrawerOpen(true);
  };

  const handleOpenEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      moduleId: field.moduleId || 'client-setup',
      formId: field.formId || 'suppliers',
      tab: field.tab || 'General',
      label: field.label || field.name || '',
      key: field.key || '',
      type: field.type || 'text',
      optionsStr: Array.isArray(field.options) ? field.options.join(', ') : '',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      required: !!field.required,
      status: field.status || 'Active',
      isStandard: !!field.isStandard
    });
    setIsFieldDrawerOpen(true);
  };

  const handleFieldLabelChange = (val) => {
    setFieldForm(prev => {
      const updates = { label: val };
      if (!editingField || !editingField.isStandard) {
        if (!editingField) {
          updates.key = val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        }
      }
      return { ...prev, ...updates };
    });
  };

  const handleSaveField = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalLabel = fieldForm.label.trim() || 'New Field';
    const finalKey = (fieldForm.key.trim() || finalLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    const optionsArray = fieldForm.type === 'select'
      ? fieldForm.optionsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (editingField) {
      if (editingField.isStandard) {
        const existingOverride = (customFields || []).find(c => c.key === editingField.key || c.id === editingField.id);
        if (existingOverride) {
          updateCustomField(existingOverride.id, {
            label: finalLabel,
            placeholder: fieldForm.placeholder.trim(),
            helpText: fieldForm.helpText.trim(),
            required: fieldForm.required,
            status: fieldForm.status,
            options: optionsArray,
            isStandard: true
          });
        } else {
          addCustomField({
            id: `STD-${editingField.formId}-${editingField.key}`,
            moduleId: fieldForm.moduleId,
            formId: fieldForm.formId,
            tab: fieldForm.tab,
            key: editingField.key,
            label: finalLabel,
            type: editingField.type,
            options: optionsArray,
            placeholder: fieldForm.placeholder.trim(),
            helpText: fieldForm.helpText.trim(),
            required: fieldForm.required,
            status: fieldForm.status,
            isStandard: true
          });
        }
        if (showToast) showToast(`Standard field "${finalLabel}" updated.`);
      } else {
        updateCustomField(editingField.id, {
          label: finalLabel,
          key: finalKey,
          type: fieldForm.type,
          options: optionsArray,
          placeholder: fieldForm.placeholder.trim(),
          helpText: fieldForm.helpText.trim(),
          tab: fieldForm.tab,
          required: fieldForm.required,
          status: fieldForm.status
        });
      }
    } else {
      addCustomField({
        moduleId: fieldForm.moduleId,
        formId: fieldForm.formId,
        tab: fieldForm.tab,
        label: finalLabel,
        key: finalKey,
        type: fieldForm.type,
        options: optionsArray,
        placeholder: fieldForm.placeholder.trim(),
        helpText: fieldForm.helpText.trim(),
        required: fieldForm.required,
        status: fieldForm.status,
        isStandard: false
      });
    }
    setIsFieldDrawerOpen(false);
  };

  const handleToggleFieldStatus = (field) => {
    const nextStatus = field.status === 'Inactive' ? 'Active' : 'Inactive';
    if (field.isStandard) {
      const existingOverride = (customFields || []).find(c => c.key === field.key || c.id === field.id);
      if (existingOverride) {
        updateCustomField(existingOverride.id, { status: nextStatus });
      } else {
        addCustomField({
          id: `STD-${field.formId}-${field.key}`,
          moduleId: field.moduleId,
          formId: field.formId,
          tab: field.tab,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          status: nextStatus,
          isStandard: true
        });
      }
    } else {
      updateCustomField(field.id, { status: nextStatus });
    }
    if (showToast) showToast(`Field "${field.label || field.name}" is now ${nextStatus}.`);
  };

  const handleResetStandardField = (field) => {
    const existingOverride = (customFields || []).find(c => c.key === field.key || c.id === field.id);
    if (existingOverride) {
      deleteCustomField(existingOverride.id);
      if (showToast) showToast(`Field "${field.label}" reset to default.`);
    }
  };

  const handleDeleteCustomField = (field) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Custom Field: ${field.label || field.name}`,
      message: `Are you sure you want to permanently remove field "${field.label || field.name}"?`,
      danger: true,
      onConfirm: () => {
        deleteCustomField(field.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'number':
        return <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Hash size={11} /> Number</span>;
      case 'select':
        return <span className="badge badge-cobalt" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><List size={11} /> Dropdown</span>;
      case 'date':
        return <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} /> Date</span>;
      case 'checkbox':
        return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckSquare size={11} /> Boolean</span>;
      case 'file':
        return <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Upload size={11} /> File</span>;
      case 'textarea':
        return <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><FileText size={11} /> Textarea</span>;
      default:
        return <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Type size={11} /> Text</span>;
    }
  };

  const fieldColumns = [
    {
      header: 'Field Label & Key',
      accessor: 'label',
      render: r => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.label || r.name}</span>
            {r.isOverridden && (
              <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 5px' }}>Modified</span>
            )}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            {r.key}
          </div>
          {r.helpText && (
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', marginTop: '2px', maxWidth: '300px' }}>
              {r.helpText}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Target Tab',
      accessor: 'tab',
      render: r => <span className="badge badge-subtle">{r.tab || 'General'}</span>
    },
    {
      header: 'Form / Submenu',
      accessor: 'formId',
      render: r => {
        const sub = submenus.find(s => s.id === r.formId || s.id === `sub-${r.formId}`);
        return <span>{sub?.name || r.formId}</span>;
      }
    },
    {
      header: 'Module',
      accessor: 'moduleId',
      render: r => {
        const mod = modules.find(m => m.id === r.moduleId);
        return <span className="badge badge-cobalt">{mod?.name || r.moduleId}</span>;
      }
    },
    {
      header: 'Type',
      accessor: 'type',
      width: '110px',
      render: r => renderTypeBadge(r.type)
    },
    {
      header: 'Scope',
      accessor: 'isStandard',
      width: '110px',
      render: r => r.isStandard ? (
        <span className="badge badge-subtle" style={{ fontSize: '10px' }}>Standard</span>
      ) : (
        <span className="badge badge-cobalt" style={{ fontSize: '10px' }}>Custom</span>
      )
    },
    {
      header: 'Mandatory',
      accessor: 'required',
      width: '90px',
      render: r => r.required ? (
        <span className="badge badge-rose" style={{ fontSize: '10px' }}>Required</span>
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Optional</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => (
        <button
          type="button"
          onClick={() => handleToggleFieldStatus(r)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Toggle status"
        >
          <StatusBadge status={r.status || 'Active'} />
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '80px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'Edit Field',
            icon: Edit2,
            onClick: () => handleOpenEditField(r)
          },
          {
            label: r.status === 'Active' ? 'Deactivate' : 'Activate',
            icon: r.status === 'Active' ? XCircle : CheckCircle2,
            onClick: () => handleToggleFieldStatus(r)
          }
        ];

        if (r.isStandard && r.isOverridden) {
          items.push(
            { divider: true },
            {
              label: 'Reset to System Default',
              icon: RotateCcw,
              onClick: () => handleResetStandardField(r)
            }
          );
        }

        if (!r.isStandard) {
          items.push(
            { divider: true },
            {
              label: 'Delete Custom Field',
              icon: Trash2,
              danger: true,
              onClick: () => handleDeleteCustomField(r)
            }
          );
        }

        return <ActionDropdown items={items} />;
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 4 PRIMARY TABS (Module, Sub menu, Tabs, Forms) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { id: 'modules', label: 'Module', icon: FolderTree },
            { id: 'submenus', label: 'Sub menu', icon: Menu },
            { id: 'tabs', label: 'Tabs', icon: Bookmark },
            { id: 'forms', label: 'Forms', icon: Sliders }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px'
                }}
              >
                <Icon size={14} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleResetDefaults}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          title="Restore factory system schema"
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 1. MODULE TAB CONTENT */}
      {/* ==================================================== */}
      {activeTab === 'modules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                System Modules
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Manage top-level navigation modules for Granite ERP Client/Supplier Admin.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddModule}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Module</span>
            </button>
          </div>

          {/* Metric Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <StatCard label="Total Modules" value={modules.length} icon={FolderTree} />
            <StatCard label="Active Modules" value={modules.filter(m => m.status === 'Active').length} icon={CheckCircle2} status="positive" />
            <StatCard label="Inactive Modules" value={modules.filter(m => m.status !== 'Active').length} icon={XCircle} status="neutral" />
          </div>

          {/* Modules Table */}
          <DataTable
            columns={moduleColumns}
            data={modules}
            pageSize={10}
            emptyMessage="No system modules found."
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SUB MENU TAB CONTENT */}
      {/* ==================================================== */}
      {activeTab === 'submenus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar & Header Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                  Submenus
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Manage second-level navigation submenus grouped by parent module.
                </div>
              </div>

              {/* Module Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Filter Module:
                </span>
                <select
                  className="form-select"
                  value={selectedModuleFilter}
                  onChange={e => handleModuleFilterChange(e.target.value)}
                  style={{ fontSize: '12px', height: '32px', minWidth: '160px' }}
                >
                  <option value="all">All Modules</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddSubmenu}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Add Submenu</span>
            </button>
          </div>

          {/* Metric Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <StatCard label="Total Submenus" value={filteredSubmenus.length} icon={Menu} />
            <StatCard label="Active Submenus" value={filteredSubmenus.filter(s => s.status === 'Active').length} icon={CheckCircle2} status="positive" />
            <StatCard label="Parent Modules" value={new Set(filteredSubmenus.map(s => s.moduleId)).size} icon={FolderTree} status="neutral" />
          </div>

          {/* Submenus Table */}
          <DataTable
            columns={submenuColumns}
            data={filteredSubmenus}
            pageSize={10}
            emptyMessage="No submenus match the selected criteria."
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. TABS TAB CONTENT */}
      {/* ==================================================== */}
      {activeTab === 'tabs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Bar & Header Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                Page Tabs
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Manage third-level tabs configured across application pages.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Module Filter */}
              <select
                className="form-select"
                value={selectedModuleFilter}
                onChange={e => handleModuleFilterChange(e.target.value)}
                style={{ fontSize: '12px', height: '32px', minWidth: '140px' }}
              >
                <option value="all">All Modules</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              {/* Submenu Filter */}
              <select
                className="form-select"
                value={selectedSubmenuFilter}
                onChange={e => handleSubmenuFilterChange(e.target.value)}
                style={{ fontSize: '12px', height: '32px', minWidth: '150px' }}
              >
                <option value="all">All Submenus</option>
                {(selectedModuleFilter === 'all' ? submenus : submenus.filter(s => s.moduleId === selectedModuleFilter)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddTab}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Tab</span>
              </button>
            </div>
          </div>

          {/* Metric Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <StatCard label="Total Tabs" value={filteredTabs.length} icon={Bookmark} />
            <StatCard label="Active Tabs" value={filteredTabs.filter(t => t.status === 'Active').length} icon={CheckCircle2} status="positive" />
            <StatCard label="Configured Tabs" value={filteredTabs.length} icon={Sliders} status="neutral" />
          </div>

          {/* Tabs Table */}
          <DataTable
            columns={tabColumns}
            data={filteredTabs}
            pageSize={10}
            emptyMessage="No tabs match the selected filters."
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. FORMS TAB CONTENT */}
      {/* ==================================================== */}
      {activeTab === 'forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header & Filter Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                Forms & Custom Fields
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Customize system standard fields or create tailored business inputs.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Module Filter */}
              <select
                className="form-select"
                value={selectedModuleFilter}
                onChange={e => handleModuleFilterChange(e.target.value)}
                style={{ fontSize: '12px', height: '32px', minWidth: '130px' }}
              >
                <option value="all">All Modules</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              {/* Submenu Filter */}
              <select
                className="form-select"
                value={selectedSubmenuFilter}
                onChange={e => handleSubmenuFilterChange(e.target.value)}
                style={{ fontSize: '12px', height: '32px', minWidth: '130px' }}
              >
                <option value="all">All Forms / Submenus</option>
                {(selectedModuleFilter === 'all' ? submenus : submenus.filter(s => s.moduleId === selectedModuleFilter)).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Scope Filter */}
              <select
                className="form-select"
                value={fieldScopeFilter}
                onChange={e => setFieldScopeFilter(e.target.value)}
                style={{ fontSize: '12px', height: '32px', minWidth: '120px' }}
              >
                <option value="All">All Scopes</option>
                <option value="Standard">Standard Only</option>
                <option value="Custom">Custom Only</option>
              </select>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddField}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Custom Field</span>
              </button>
            </div>
          </div>

          {/* Metric Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <StatCard label="Total Fields" value={filteredFields.length} icon={Sliders} />
            <StatCard label="Standard Fields" value={filteredFields.filter(f => f.isStandard).length} icon={Layers} status="neutral" />
            <StatCard label="Custom Fields" value={filteredFields.filter(f => !f.isStandard).length} icon={Plus} status="positive" />
            <StatCard label="Active Fields" value={filteredFields.filter(f => f.status === 'Active').length} icon={CheckCircle2} status="positive" />
          </div>

          {/* Fields Table */}
          <DataTable
            columns={fieldColumns}
            data={filteredFields}
            pageSize={10}
            emptyMessage="No form fields found for this selection."
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* DRAWERS: ADD / EDIT MODULE */}
      {/* ==================================================== */}
      {/* ==================================================== */}
      {/* DRAWERS: ADD / EDIT MODULE */}
      {/* ==================================================== */}
      <FormDrawer
        isOpen={isModuleDrawerOpen}
        onClose={() => setIsModuleDrawerOpen(false)}
        title={editingModule ? `Edit Module: ${editingModule.name}` : 'Add New Module'}
        onSubmit={handleSaveModule}
        submitLabel={editingModule ? 'Save Module' : 'Create Module'}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Module Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Asset Management"
            value={moduleForm.name}
            onChange={e => {
              const val = e.target.value;
              setModuleForm(prev => ({
                ...prev,
                name: val,
                code: editingModule ? prev.code : `MOD-${val.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
                route: editingModule ? prev.route : `/${val.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Module Code / Identifier</label>
          <input
            type="text"
            className="form-input"
            placeholder="MOD-KEY"
            value={moduleForm.code}
            onChange={e => setModuleForm(prev => ({ ...prev, code: e.target.value }))}
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Route Path</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. /asset-management"
            value={moduleForm.route}
            onChange={e => setModuleForm(prev => ({ ...prev, route: e.target.value }))}
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Icon</label>
          <select
            className="form-select"
            value={moduleForm.iconName}
            onChange={e => setModuleForm(prev => ({ ...prev, iconName: e.target.value }))}
          >
            {AVAILABLE_ICONS.map(ic => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Display Order</label>
          <input
            type="number"
            className="form-input"
            placeholder="1"
            value={moduleForm.order}
            onChange={e => setModuleForm(prev => ({ ...prev, order: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Enter brief module description"
            value={moduleForm.description}
            onChange={e => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status: Active</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Module is visible in the sidebar navigation</div>
            </div>
            <input
              type="checkbox"
              checked={moduleForm.status === 'Active'}
              onChange={e => setModuleForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </FormDrawer>

      {/* ==================================================== */}
      {/* DRAWERS: ADD / EDIT SUBMENU */}
      {/* ==================================================== */}
      <FormDrawer
        isOpen={isSubmenuDrawerOpen}
        onClose={() => setIsSubmenuDrawerOpen(false)}
        title={editingSubmenu ? `Edit Submenu: ${editingSubmenu.name}` : 'Add New Submenu'}
        onSubmit={handleSaveSubmenu}
        submitLabel={editingSubmenu ? 'Save Submenu' : 'Create Submenu'}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Parent Module</label>
          <select
            className="form-select"
            value={submenuForm.moduleId}
            onChange={e => setSubmenuForm(prev => ({ ...prev, moduleId: e.target.value }))}
          >
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Submenu Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Quarry Inward"
            value={submenuForm.name}
            onChange={e => {
              const val = e.target.value;
              setSubmenuForm(prev => ({
                ...prev,
                name: val,
                code: editingSubmenu ? prev.code : `SUB-${val.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
                route: editingSubmenu ? prev.route : `/${submenuForm.moduleId}?submenu=${val.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Submenu Code / Identifier</label>
          <input
            type="text"
            className="form-input"
            placeholder="SUB-KEY"
            value={submenuForm.code}
            onChange={e => setSubmenuForm(prev => ({ ...prev, code: e.target.value }))}
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Display Order</label>
          <input
            type="number"
            className="form-input"
            placeholder="1"
            value={submenuForm.order}
            onChange={e => setSubmenuForm(prev => ({ ...prev, order: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Route Path</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. /inventory?submenu=quarry-inward"
            value={submenuForm.route}
            onChange={e => setSubmenuForm(prev => ({ ...prev, route: e.target.value }))}
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Enter brief submenu description"
            value={submenuForm.description}
            onChange={e => setSubmenuForm(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status: Active</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Submenu is visible under parent module</div>
            </div>
            <input
              type="checkbox"
              checked={submenuForm.status === 'Active'}
              onChange={e => setSubmenuForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </FormDrawer>

      {/* ==================================================== */}
      {/* DRAWERS: ADD / EDIT TAB */}
      {/* ==================================================== */}
      <FormDrawer
        isOpen={isTabDrawerOpen}
        onClose={() => setIsTabDrawerOpen(false)}
        title={editingTab ? `Edit Tab: ${editingTab.name}` : 'Add New Tab'}
        onSubmit={handleSaveTab}
        submitLabel={editingTab ? 'Save Tab' : 'Create Tab'}
      >
        <div className="form-group">
          <label className="form-label">Parent Module</label>
          <select
            className="form-select"
            value={tabForm.moduleId}
            onChange={e => {
              const mId = e.target.value;
              const firstSub = submenus.find(s => s.moduleId === mId)?.id || '';
              setTabForm(prev => ({ ...prev, moduleId: mId, submenuId: firstSub }));
            }}
          >
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Parent Submenu</label>
          <select
            className="form-select"
            value={tabForm.submenuId}
            onChange={e => setTabForm(prev => ({ ...prev, submenuId: e.target.value }))}
          >
            {availableSubmenusForTabForm.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Tab Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Pending Approvals"
            value={tabForm.name}
            onChange={e => {
              const val = e.target.value;
              setTabForm(prev => ({
                ...prev,
                name: val,
                code: editingTab ? prev.code : `TAB-${val.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`
              }));
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tab Code / Key</label>
          <input
            type="text"
            className="form-input"
            placeholder="TAB-KEY"
            value={tabForm.code}
            onChange={e => setTabForm(prev => ({ ...prev, code: e.target.value }))}
            style={{ fontFamily: 'monospace' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Display Order</label>
          <input
            type="number"
            className="form-input"
            placeholder="1"
            value={tabForm.order}
            onChange={e => setTabForm(prev => ({ ...prev, order: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Show Pending Count Badge</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Displays live counter badge on the tab</div>
            </div>
            <input
              type="checkbox"
              checked={tabForm.hasCountBadge}
              onChange={e => setTabForm(prev => ({ ...prev, hasCountBadge: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status: Active</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Tab is visible in page navigation</div>
            </div>
            <input
              type="checkbox"
              checked={tabForm.status === 'Active'}
              onChange={e => setTabForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </FormDrawer>

      {/* ==================================================== */}
      {/* DRAWERS: ADD / EDIT FIELD */}
      {/* ==================================================== */}
      <FormDrawer
        isOpen={isFieldDrawerOpen}
        onClose={() => setIsFieldDrawerOpen(false)}
        title={editingField ? (editingField.isStandard ? `Edit Standard Field: ${editingField.label}` : `Edit Custom Field: ${editingField.label}`) : 'Add Custom Field'}
        onSubmit={handleSaveField}
        submitLabel={editingField ? 'Save Field' : 'Create Field'}
      >
        <div className="form-group">
          <label className="form-label">Target Module</label>
          <select
            className="form-select"
            value={fieldForm.moduleId}
            disabled={fieldForm.isStandard}
            onChange={e => setFieldForm(prev => ({ ...prev, moduleId: e.target.value }))}
          >
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Form / Submenu</label>
          <select
            className="form-select"
            value={fieldForm.formId}
            disabled={fieldForm.isStandard}
            onChange={e => setFieldForm(prev => ({ ...prev, formId: e.target.value }))}
          >
            {submenus.filter(s => s.moduleId === fieldForm.moduleId).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Target Tab</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Profile Details"
            value={fieldForm.tab}
            onChange={e => setFieldForm(prev => ({ ...prev, tab: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Database Identifier</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. vein_grade"
            value={fieldForm.key}
            disabled={fieldForm.isStandard}
            onChange={e => setFieldForm(prev => ({ ...prev, key: e.target.value }))}
            style={{ fontFamily: 'monospace', opacity: fieldForm.isStandard ? 0.7 : 1 }}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Field Label</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Geological Vein Grade"
            value={fieldForm.label}
            onChange={e => handleFieldLabelChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Field Type</label>
          <select
            className="form-select"
            value={fieldForm.type}
            disabled={fieldForm.isStandard}
            onChange={e => setFieldForm(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="text">Single-line Text</option>
            <option value="textarea">Multi-line Textarea</option>
            <option value="number">Numeric / Decimal</option>
            <option value="select">Dropdown / Select</option>
            <option value="date">Date Picker</option>
            <option value="checkbox">Checkbox / Boolean</option>
            <option value="file">File / Document Upload</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Placeholder / Hint</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Enter value..."
            value={fieldForm.placeholder}
            onChange={e => setFieldForm(prev => ({ ...prev, placeholder: e.target.value }))}
          />
        </div>

        {fieldForm.type === 'select' && (
          <div className="form-group col-span-2">
            <label className="form-label">Options (Comma-Separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Option 1, Option 2, Option 3"
              value={fieldForm.optionsStr}
              onChange={e => setFieldForm(prev => ({ ...prev, optionsStr: e.target.value }))}
            />
          </div>
        )}

        <div className="form-group col-span-2">
          <label className="form-label">Description / Tooltip</label>
          <input
            type="text"
            className="form-input"
            placeholder="Operator guidance"
            value={fieldForm.helpText}
            onChange={e => setFieldForm(prev => ({ ...prev, helpText: e.target.value }))}
          />
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Mandatory Field</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Highlights field for required completion</div>
            </div>
            <input
              type="checkbox"
              checked={fieldForm.required}
              onChange={e => setFieldForm(prev => ({ ...prev, required: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="form-group col-span-2">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status: Active / Visible</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Inactive fields are hidden from operators</div>
            </div>
            <input
              type="checkbox"
              checked={fieldForm.status === 'Active'}
              onChange={e => setFieldForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </FormDrawer>

      {/* ==================================================== */}
      {/* CONFIRM DIALOG */}
      {/* ==================================================== */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
}
