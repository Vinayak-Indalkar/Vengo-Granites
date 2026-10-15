import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DataTable,
  FormDrawer,
  StatusBadge,
  ActionDropdown,
  ConfirmDialog
} from '../CommonComponents';
import { Plus, Factory, Building2, MapPin, Eye, Edit, Trash2, Power, Layers } from 'lucide-react';

const initialPlantsData = [
  {
    id: 'PLT-001',
    code: 'PLT-001',
    name: 'Carrara Main Slicing & Dressing Plant',
    supplierId: 'SUP-0001',
    supplierName: 'Carrara Quarry Holdings',
    location: 'Plot 12, Mining Industrial Corridor, Warangal',
    plantType: 'Block Dressing & Slicing',
    gangSawsCount: 8,
    dailyCapacitySqFt: 14000,
    managerName: 'Rameshwar Rao',
    phone: '+91 98490 12345',
    status: 'Active'
  },
  {
    id: 'PLT-002',
    code: 'PLT-002',
    name: 'Chimakurthy Galaxy Primary Processing Unit',
    supplierId: 'SUP-0002',
    supplierName: 'Galaxy Mining Corp',
    location: 'Ridge Industrial Zone, Chimakurthy, AP',
    plantType: 'Polishing & Epoxy Line',
    gangSawsCount: 6,
    dailyCapacitySqFt: 9500,
    managerName: 'K. Venkat Reddy',
    phone: '+91 98480 99881',
    status: 'Active'
  },
  {
    id: 'PLT-003',
    code: 'PLT-003',
    name: 'Khammam Block Dressing Yard & Unit',
    supplierId: 'SUP-0003',
    supplierName: 'Deccan Stone Works',
    location: 'Granite Industrial Area, Khammam',
    plantType: 'Quarry Extraction & Dressing',
    gangSawsCount: 4,
    dailyCapacitySqFt: 6000,
    managerName: 'Suresh Chandra',
    phone: '+91 99120 44552',
    status: 'Active'
  }
];

export function PlantTab() {
  const { suppliers, t, showToast } = useApp();

  const [plants, setPlants] = useState(() => {
    try {
      const saved = localStorage.getItem('granite_client_plants');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialPlantsData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('granite_client_plants', JSON.stringify(plants));
    } catch (e) {}
  }, [plants]);

  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    supplierId: '',
    supplierName: '',
    location: '',
    plantType: 'Block Dressing & Slicing',
    gangSawsCount: 4,
    dailyCapacitySqFt: 8000,
    managerName: '',
    phone: '',
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
    setEditingPlant(null);
    const nextNum = plants.length + 1;
    const autoCode = `PLT-${String(nextNum).padStart(3, '0')}`;
    setFormData({
      code: autoCode,
      name: '',
      supplierId: suppliers[0]?.id || '',
      supplierName: suppliers[0]?.name || '',
      location: '',
      plantType: 'Block Dressing & Slicing',
      gangSawsCount: 4,
      dailyCapacitySqFt: 8000,
      managerName: '',
      phone: '',
      status: 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (plant) => {
    setEditingPlant(plant);
    setFormData({ ...plant });
    setIsDrawerOpen(true);
  };

  const handleSavePlant = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetSupplier = suppliers.find(s => s.id === formData.supplierId || s.code === formData.supplierId);
    const resolvedSupplierName = targetSupplier ? targetSupplier.name : (formData.supplierName || 'Primary Quarry');

    if (editingPlant) {
      setPlants(prev => prev.map(p => p.id === editingPlant.id ? {
        ...formData,
        id: editingPlant.id,
        supplierName: resolvedSupplierName,
        gangSawsCount: Number(formData.gangSawsCount) || 0,
        dailyCapacitySqFt: Number(formData.dailyCapacitySqFt) || 0
      } : p));
      showToast(t('Plant updated successfully'), 'success');
    } else {
      const newPlant = {
        ...formData,
        id: formData.code || `PLT-${Date.now().toString().slice(-4)}`,
        supplierName: resolvedSupplierName,
        gangSawsCount: Number(formData.gangSawsCount) || 0,
        dailyCapacitySqFt: Number(formData.dailyCapacitySqFt) || 0
      };
      setPlants(prev => [newPlant, ...prev]);
      showToast(t('New plant created successfully'), 'success');
    }

    setIsDrawerOpen(false);
    setEditingPlant(null);
  };

  const handleDeletePrompt = (plant) => {
    setConfirmDialog({
      isOpen: true,
      title: t('Delete Plant'),
      message: `Are you sure you want to remove plant "${plant.name}" (${plant.code})? This will archive the unit.`,
      danger: true,
      confirmLabel: t('Confirm Delete'),
      onConfirm: () => {
        setPlants(prev => prev.filter(p => p.id !== plant.id));
        showToast(t('Plant removed successfully'), 'info');
      }
    });
  };

  const handleToggleStatus = (plant) => {
    const nextStatus = plant.status === 'Active' ? 'Inactive' : 'Active';
    setPlants(prev => prev.map(p => p.id === plant.id ? { ...p, status: nextStatus } : p));
    showToast(`Plant marked as ${nextStatus}`, 'info');
  };

  const columns = useMemo(() => [
    {
      header: t('Plant Code'),
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
          title={t('Edit Plant Details')}
        >
          {row.code}
        </button>
      )
    },
    {
      header: t('Plant Name'),
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            {row.plantType}
          </div>
        </div>
      )
    },
    {
      header: t('Supplier'),
      accessor: 'supplierName',
      render: (row) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: 500,
          color: 'var(--brand-color, #222350)'
        }}>
          <Building2 size={13} color="var(--teal-600)" />
          {row.supplierName}
        </span>
      )
    },
    {
      header: t('Location'),
      accessor: 'location',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--ink)' }}>
          {row.location}
        </span>
      )
    },
    {
      header: t('Capacity & Machinery'),
      accessor: 'dailyCapacitySqFt',
      render: (row) => (
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
          {Number(row.dailyCapacitySqFt || 0).toLocaleString()} Sq.Ft/Day <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({row.gangSawsCount} Gang Saws)</span>
        </span>
      )
    },
    {
      header: t('Manager / Contact'),
      accessor: 'managerName',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{row.managerName}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{row.phone}</div>
        </div>
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
              label: t('Edit Plant'),
              icon: <Edit size={14} />,
              onClick: () => handleOpenEdit(row)
            },
            {
              label: row.status === 'Active' ? t('Mark Inactive') : t('Mark Active'),
              icon: <Power size={14} />,
              onClick: () => handleToggleStatus(row)
            },
            {
              label: t('Delete Plant'),
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => handleDeletePrompt(row)
            }
          ]}
        />
      )
    }
  ], [suppliers, t]);

  return (
    <>
      {/* Header Row (matching Inbound pattern: clean title + action button) */}
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
            {t('Processing Plants & Quarry Facilities')}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {t('Manage cutting sheds, dressing units, gang saw facilities, and processing sites.')}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          <span>{t('Add Plant')}</span>
        </button>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={plants}
        emptyMessage={t('No plants configured yet.')}
      />

      {/* Add / Edit FormDrawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingPlant(null); }}
        title={editingPlant ? `${t('Edit Plant')}: ${formData.code}` : t('Add New Plant')}
        onSubmit={handleSavePlant}
        submitLabel={editingPlant ? t('Update Plant') : t('Save Plant')}
        confirmSubmit={true}
      >
        {/* Section 1: Basic Plant Profile */}
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
          <Factory size={16} color="var(--brand-color, #222350)" />
          <span>1. {t('Plant & Facility Identity')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Plant Code')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.code}
            disabled
            style={{ background: 'var(--surface-sunken)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Plant Name')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Warangal Main Gangsaw Unit #2"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Parent Supplier / Quarry')}</label>
          <select
            className="form-select"
            value={formData.supplierId}
            onChange={e => {
              const selectedSup = suppliers.find(s => s.id === e.target.value);
              setFormData({
                ...formData,
                supplierId: e.target.value,
                supplierName: selectedSup ? selectedSup.name : formData.supplierName
              });
            }}
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code || s.id})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Facility Type')}</label>
          <select
            className="form-select"
            value={formData.plantType}
            onChange={e => setFormData({ ...formData, plantType: e.target.value })}
          >
            <option value="Block Dressing & Slicing">Block Dressing & Slicing</option>
            <option value="Polishing & Epoxy Line">Polishing & Epoxy Line</option>
            <option value="Comprehensive Processing">Comprehensive Processing</option>
            <option value="Quarry Extraction & Dressing">Quarry Extraction & Dressing</option>
            <option value="Bridge Saw & Cut-to-Size">Bridge Saw & Cut-to-Size</option>
          </select>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">{t('Location / Street Address')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Plot 14, Mining Industrial Area, Phase 2"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Section 2: Capacity & Machinery */}
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
          <Layers size={16} color="var(--brand-color, #222350)" />
          <span>2. {t('Capacity & Machinery Configuration')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Gang Saws / Slicers Installed')}</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={formData.gangSawsCount}
            onChange={e => setFormData({ ...formData, gangSawsCount: parseInt(e.target.value, 10) || 0 })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Daily Production Capacity (Sq.Ft)')}</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={formData.dailyCapacitySqFt}
            onChange={e => setFormData({ ...formData, dailyCapacitySqFt: parseInt(e.target.value, 10) || 0 })}
          />
        </div>

        {/* Section 3: Manager & Operations */}
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
          <MapPin size={16} color="var(--brand-color, #222350)" />
          <span>3. {t('Operations Contact & Status')}</span>
        </div>

        <div className="form-group">
          <label className="form-label">{t('Plant Manager Name')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Rameshwar Rao"
            value={formData.managerName}
            onChange={e => setFormData({ ...formData, managerName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('Contact Phone')}</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. +91 98490 12345"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
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
