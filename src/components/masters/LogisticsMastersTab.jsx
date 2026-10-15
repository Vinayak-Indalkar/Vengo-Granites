import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function LogisticsMastersTab({ activeSubTab = 'vehicles' }) {
  const {
    vehicles = [], setVehicles,
    drivers = [], setDrivers,
    dispatchLocations = [], setDispatchLocations,
    yardsMaster = [],
    suppliers = [],
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [formState, setFormState] = useState({});

  const handleOpenAdd = () => {
    setEditingItem(null);
    let nextCode = '';
    if (activeSubTab === 'vehicles') nextCode = `VEH-${String(vehicles.length + 1).padStart(4, '0')}`;
    else if (activeSubTab === 'drivers') nextCode = `DRV-${String(drivers.length + 1).padStart(2, '0')}`;
    else if (activeSubTab === 'dispatch-locations') nextCode = `LOC-${String(dispatchLocations.length + 1).padStart(4, '0')}`;

    setFormState({ code: nextCode, status: 'Active' });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormState({ ...item });
    setIsDrawerOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeSubTab === 'vehicles') {
      if (editingItem) setVehicles(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setVehicles(prev => [{ id: formState.vehicleNo || `VEH-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'drivers') {
      if (editingItem) setDrivers(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setDrivers(prev => [{ id: formState.code || `DRV-${Date.now()}`, ...formState }, ...prev]);
    } else if (activeSubTab === 'dispatch-locations') {
      if (editingItem) setDispatchLocations(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formState } : i));
      else setDispatchLocations(prev => [{ id: formState.code || `LOC-${Date.now()}`, ...formState }, ...prev]);
    }

    if (showToast) showToast('Master updated successfully');
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Archive Master Item',
      message: `Archive "${item.vehicleNo || item.name || item.code}"?`,
      onConfirm: () => {
        const toggle = (list, setter) => setter(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
        if (activeSubTab === 'vehicles') toggle(vehicles, setVehicles);
        else if (activeSubTab === 'drivers') toggle(drivers, setDrivers);
        else if (activeSubTab === 'dispatch-locations') toggle(dispatchLocations, setDispatchLocations);
      }
    });
  };

  let currentData = vehicles;
  let currentColumns = [];
  let exportTitle = 'Vehicles';

  if (activeSubTab === 'vehicles') {
    currentData = vehicles;
    exportTitle = 'Logistics Vehicles';
    currentColumns = [
      { key: 'vehicleNo', title: 'Vehicle Number', width: '130px', render: v => <strong>{v}</strong> },
      { key: 'type', title: 'Vehicle Type' },
      { key: 'capacity', title: 'Capacity (Ton)', width: '110px', align: 'center' },
      { key: 'owner', title: 'Ownership', width: '90px' },
      { key: 'transporter', title: 'Transporter Agency' },
      { key: 'fitnessExpiry', title: 'Fitness Expiry', width: '110px' },
      { key: 'permitExpiry', title: 'Permit Expiry', width: '110px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'drivers') {
    currentData = drivers;
    exportTitle = 'Logistics Drivers';
    currentColumns = [
      { key: 'code', title: 'Driver Code', width: '110px' },
      { key: 'name', title: 'Driver Name' },
      { key: 'phone', title: 'Contact Phone' },
      { key: 'licenceNo', title: 'Driving License No.' },
      { key: 'licenceExpiry', title: 'License Expiry', width: '110px' },
      { key: 'linkedVehicle', title: 'Assigned Vehicle', width: '130px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  } else if (activeSubTab === 'dispatch-locations') {
    currentData = dispatchLocations;
    exportTitle = 'Dispatch Locations';
    currentColumns = [
      { key: 'code', title: 'Location Code', width: '120px' },
      { key: 'name', title: 'Location Name' },
      { key: 'yard', title: 'Linked Yard Facility' },
      { key: 'type', title: 'Location Type', width: '120px' },
      { key: 'status', title: 'Status', width: '90px', render: (val) => <StatusBadge status={val} /> }
    ];
  }

  const filtered = useMemo(() => {
    return currentData.filter(item => {
      const q = searchQuery.toLowerCase();
      return Object.values(item).some(v => String(v).toLowerCase().includes(q));
    });
  }, [currentData, searchQuery]);

  const fullColumns = [
    ...currentColumns,
    {
      key: 'actions',
      title: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <ActionDropdown
          items={[
            { label: 'Edit', icon: Edit2, onClick: () => handleOpenEdit(row) },
            { label: row.status === 'Active' ? 'Archive' : 'Restore', icon: row.status === 'Active' ? XCircle : CheckCircle2, onClick: () => handleDeletePrompt(row) }
          ]}
        />
      )
    }
  ];

  const tabTitles = {
    'vehicles': 'Vehicles',
    'drivers': 'Drivers',
    'dispatch-locations': 'Dispatch Locations'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Row matching Inbound Pattern */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {tabTitles[activeSubTab] || 'Logistics Masters'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportToExcel(currentColumns, filtered, exportTitle)} title="Export to Excel">
            <FileSpreadsheet size={13} />
            <span>Excel</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportToPDF(currentColumns, filtered, exportTitle)} title="Print / PDF">
            <Printer size={13} />
            <span>PDF</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>Add {tabTitles[activeSubTab] ? tabTitles[activeSubTab].replace(/s$/, '') : 'Record'}</span>
          </button>
        </div>
      </div>

      <DataTable columns={fullColumns} data={filtered} pageSize={10} hoverable />

      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Record' : 'Add Record'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {activeSubTab === 'vehicles' && (
            <>
              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input type="text" className="form-input" value={formState.vehicleNo || ''} onChange={e => setFormState(p => ({ ...p, vehicleNo: e.target.value }))} placeholder="e.g. AP 39 TB 4920" />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={formState.type || 'Multi-Axle Trailer (28T)'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Multi-Axle Trailer (28T)">Multi-Axle Trailer (28T)</option>
                  <option value="Heavy Tipper (16T)">Heavy Tipper (16T)</option>
                  <option value="Hydraulic Longbed (35T)">Hydraulic Longbed (35T)</option>
                  <option value="Container Carrier (20ft)">Container Carrier (20ft)</option>
                  <option value="Pickup Truck">Pickup Truck</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (Ton)</label>
                <input type="number" className="form-input" value={formState.capacity ?? ''} onChange={e => setFormState(p => ({ ...p, capacity: Number(e.target.value) }))} placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Ownership</label>
                <select className="form-select" value={formState.owner || 'Own'} onChange={e => setFormState(p => ({ ...p, owner: e.target.value }))}>
                  <option value="Own">Own Fleet</option>
                  <option value="Hired">Hired / Contractor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transporter Agency</label>
                <input type="text" className="form-input" value={formState.transporter || ''} onChange={e => setFormState(p => ({ ...p, transporter: e.target.value }))} placeholder="Transporter name" />
              </div>
              <div className="form-group">
                <label className="form-label">Fitness Expiry</label>
                <input type="date" className="form-input" value={formState.fitnessExpiry || ''} onChange={e => setFormState(p => ({ ...p, fitnessExpiry: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label className="form-label">Permit Expiry</label>
                <input type="date" className="form-input" value={formState.permitExpiry || ''} onChange={e => setFormState(p => ({ ...p, permitExpiry: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
            </>
          )}

          {activeSubTab === 'drivers' && (
            <>
              <div className="form-group">
                <label className="form-label">Driver Code</label>
                <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="DRV-01" />
              </div>
              <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input type="text" className="form-input" value={formState.phone || ''} onChange={e => setFormState(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98..." />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input type="text" className="form-input" value={formState.licenceNo || ''} onChange={e => setFormState(p => ({ ...p, licenceNo: e.target.value }))} placeholder="License number" />
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input type="date" className="form-input" value={formState.licenceExpiry || ''} onChange={e => setFormState(p => ({ ...p, licenceExpiry: e.target.value }))} placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Vehicle</label>
                <input type="text" className="form-input" value={formState.linkedVehicle || ''} onChange={e => setFormState(p => ({ ...p, linkedVehicle: e.target.value }))} placeholder="Vehicle number" />
              </div>
            </>
          )}

          {activeSubTab === 'dispatch-locations' && (
            <>
              <div className="form-group">
                <label className="form-label">Location Code</label>
                <input type="text" className="form-input" value={formState.code || ''} onChange={e => setFormState(p => ({ ...p, code: e.target.value }))} placeholder="LOC-0001" />
              </div>
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input type="text" className="form-input" value={formState.name || ''} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} placeholder="Gate / Bay name" />
              </div>
              <div className="form-group">
                <label className="form-label">Linked Yard</label>
                <select className="form-select" value={formState.yard || ''} onChange={e => setFormState(p => ({ ...p, yard: e.target.value }))}>
                  <option value="">Select yard</option>
                  {(yardsMaster || []).map(y => <option key={y.id || y.code} value={y.name || y.code}>{y.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location Type</label>
                <select className="form-select" value={formState.type || 'Gate'} onChange={e => setFormState(p => ({ ...p, type: e.target.value }))}>
                  <option value="Gate">Gate</option>
                  <option value="Bay">Bay</option>
                  <option value="Loading Area">Loading Area</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formState.status || 'Active'} onChange={e => setFormState(p => ({ ...p, status: e.target.value }))}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog(p => ({ ...p, isOpen: false })); }}
        onCancel={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
