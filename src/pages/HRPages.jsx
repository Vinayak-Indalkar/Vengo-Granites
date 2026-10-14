import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown, DatePicker, ConfirmDialog, PhotoUpload, FileUpload, Pagination } from '../components/CommonComponents';
import {
  Plus,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  Clock,
  Calendar,
  AlertTriangle,
  UserCheck,
  Building,
  UserPlus,
  Lock,
  Unlock,
  Copy,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Sun,
  Moon,
  Sunrise,
  Coffee,
  Palmtree,
  Trash2,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// 1. PERSONNEL SCREEN (Employees, Contractors, Contractor Workers)
// ============================================================================
export function PersonnelScreen({ defaultSubTab = 'employees', onSubTabChange } = {}) {
  const {
    personnel,
    contractors,
    departments,
    designations,
    shifts,
    leaveBalances,
    attendance,
    payrollPeriods,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
    addContractor,
    updateContractor,
    deleteContractor,
    restoreContractor,
    addContractorWorker,
    updateContractorWorker,
    deleteContractorWorker,
    restoreContractorWorker
  } = useApp();

  // Sub-tabs: 'employees' | 'contractors' | 'workers'
  const [internalSubTab, setInternalSubTab] = useState(defaultSubTab);
  const subTab = defaultSubTab || internalSubTab;
  const setSubTab = (newSub) => {
    setInternalSubTab(newSub);
    if (onSubTabChange) onSubTabChange(newSub);
  };

  const [statusFilter, setStatusFilter] = useState('All'); // 'Active' | 'Inactive' | 'All'

  // Drawers and Modals
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [profileItem, setProfileItem] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Form State
  const [empForm, setEmpForm] = useState({
    code: '',
    name: '',
    photo: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    emergencyContact: '',
    department: 'Yard Operations',
    designation: 'Worker',
    shift: 'Shift 1',
    joiningDate: '',
    status: 'Active',
    idType: 'National ID',
    idNumber: '',
    idExpiry: '',
    bankHolder: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: '',
    wageType: 'Monthly',
    wageRate: '',
    faceEnrolled: false,
    consentBiometric: true
  });

  const [conForm, setConForm] = useState({
    companyName: '',
    taxId: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    contractStart: '',
    contractEnd: '',
    contractDoc: '',
    agreementRate: '',
    rateUnit: 'Per Ton',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    status: 'Active'
  });

  const [wrkForm, setWrkForm] = useState({
    code: '',
    name: '',
    contractorId: '',
    photo: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    emergencyContact: '',
    department: 'Quarry Logistics',
    designation: 'Contract Rigging Laborer',
    shift: 'Shift 1',
    joiningDate: '',
    status: 'Active',
    idType: 'National ID',
    idNumber: '',
    idExpiry: '',
    idCardFront: '',
    idCardBack: '',
    bankHolder: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    wageType: 'Daily',
    wageRate: '',
    faceEnrolled: false,
    consentBiometric: true
  });

  // Calculate dynamic worker count for contractors
  const contractorsWithCount = useMemo(() => {
    return contractors.map(c => {
      const count = personnel.filter(p => p.type === 'Contractor Worker' && p.contractorId === c.id).length;
      return { ...c, workerCount: count };
    });
  }, [contractors, personnel]);

  // Filtered lists
  const filteredEmployees = useMemo(() => {
    return personnel.filter(p => {
      if (p.type !== 'Employee') return false;
      if (statusFilter === 'All') return true;
      return (p.status || 'Active') === statusFilter;
    });
  }, [personnel, statusFilter]);

  const filteredContractors = useMemo(() => {
    return contractorsWithCount.filter(c => {
      if (statusFilter === 'All') return true;
      return (c.status || 'Active') === statusFilter;
    });
  }, [contractorsWithCount, statusFilter]);

  const filteredWorkers = useMemo(() => {
    return personnel.filter(p => {
      if (p.type !== 'Contractor Worker') return false;
      if (statusFilter === 'All') return true;
      return (p.status || 'Active') === statusFilter;
    });
  }, [personnel, statusFilter]);

  // Handlers: Open Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    if (subTab === 'employees') {
      const nextNum = personnel.filter(p => p.type === 'Employee').length + 1;
      setEmpForm({
        code: `EMP-${String(nextNum).padStart(4, '0')}`,
        name: '',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        phone: '',
        email: '',
        dob: '1992-05-15',
        gender: 'Male',
        address: '',
        emergencyContact: '',
        department: departments[0]?.name || 'Yard Operations',
        designation: designations[0]?.title || 'Worker',
        shift: shifts[0]?.name || 'Shift 1',
        joiningDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        idType: 'National ID',
        idNumber: '',
        idExpiry: '2030-12-31',
        bankHolder: '',
        bankName: '',
        bankAccount: '',
        bankIfsc: '',
        bankBranch: '',
        wageType: 'Monthly',
        wageRate: 3200,
        faceEnrolled: false,
        consentBiometric: true
      });
    } else if (subTab === 'contractors') {
      const nextNum = contractors.length + 1;
      setConForm({
        code: `CON-${String(nextNum).padStart(4, '0')}`,
        companyName: '',
        taxId: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        contractStart: new Date().toISOString().slice(0, 10),
        contractEnd: '2027-12-31',
        contractDoc: 'https://docs.granite.io/contracts/sample.pdf',
        agreementRate: 150,
        rateUnit: 'Per Ton',
        bankName: '',
        bankAccount: '',
        bankIfsc: '',
        status: 'Active'
      });
    } else {
      const nextNum = personnel.filter(p => p.type === 'Contractor Worker').length + 1;
      setWrkForm({
        code: `WRK-${String(nextNum).padStart(4, '0')}`,
        name: '',
        contractorId: contractors[0]?.id || '',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
        phone: '',
        email: '',
        dob: '1995-08-20',
        gender: 'Male',
        address: '',
        emergencyContact: '',
        department: departments[0]?.name || 'Quarry Logistics',
        designation: designations[0]?.title || 'Contract Rigging Laborer',
        shift: shifts[0]?.name || 'Shift 1',
        joiningDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        idType: 'National ID',
        idNumber: '',
        idExpiry: '2030-12-31',
        idCardFront: '',
        idCardBack: '',
        bankHolder: '',
        bankName: '',
        bankAccount: '',
        bankIfsc: '',
        wageType: 'Daily',
        wageRate: 120,
        faceEnrolled: false,
        consentBiometric: true
      });
    }
    setIsFormDrawerOpen(true);
  };

  // Handlers: Open Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    if (subTab === 'employees') {
      setEmpForm({ ...item });
    } else if (subTab === 'contractors') {
      setConForm({ ...item });
    } else {
      setWrkForm({ ...item });
    }
    setIsFormDrawerOpen(true);
  };

  // Handlers: Save
  const handleSaveForm = (e) => {
    e?.preventDefault?.();
    if (subTab === 'employees') {
      if (editingItem) {
        updateEmployee(editingItem.id, empForm);
      } else {
        addEmployee(empForm);
      }
    } else if (subTab === 'contractors') {
      if (editingItem) {
        updateContractor(editingItem.id, conForm);
      } else {
        addContractor(conForm);
      }
    } else {
      if (editingItem) {
        updateContractorWorker(editingItem.id, wrkForm);
      } else {
        addContractorWorker(wrkForm);
      }
    }
    setIsFormDrawerOpen(false);
  };

  // Handlers: Delete Trigger
  const triggerDelete = (item) => {
    let confirmMsg = `Are you sure you want to delete ${item.name || item.companyName} (${item.code || item.id})?`;
    if (subTab === 'contractors') {
      const count = personnel.filter(p => p.contractorId === item.id).length;
      if (count > 0) {
        confirmMsg = `This contractor has ${count} linked workers. Archiving this contractor will mark all linked workers Inactive. Proceed?`;
      }
    } else {
      const hasHistory = attendance.some(a => a.personId === item.id || a.employeeId === item.id);
      if (hasHistory) {
        confirmMsg = `${item.name} has attendance history. Deleting will archive the record (status Inactive) to preserve history. Proceed?`;
      }
    }

    setDeleteConfirmTarget({
      item,
      message: confirmMsg
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { item } = deleteConfirmTarget;
    if (subTab === 'employees') {
      deleteEmployee(item.id);
    } else if (subTab === 'contractors') {
      deleteContractor(item.id);
    } else {
      deleteContractorWorker(item.id);
    }
    setDeleteConfirmTarget(null);
  };

  // Detail Drawer Profile Data
  const profileDetails = useMemo(() => {
    if (!profileItem) return null;
    const empAtt = attendance.filter(a => a.personId === profileItem.id || a.employeeId === profileItem.id);
    const empLeave = leaveBalances.find(b => b.personId === profileItem.id || b.employeeId === profileItem.id);
    return {
      person: profileItem,
      attendance: empAtt,
      leave: empLeave
    };
  }, [profileItem, attendance, leaveBalances]);

  // 1. Employees Columns
  const employeeColumns = [
    {
      header: 'Employee',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={r.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={r.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{r.code || r.id}</div>
          </div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Shift', render: r => <span className="badge badge-soft">{r.shift || 'Shift 1'}</span> },
    {
      header: 'Face Status',
      render: r => r.faceEnrolled ? (
        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Check size={11} /> Enrolled
        </span>
      ) : (
        <span className="badge badge-soft" style={{ color: 'var(--muted)' }}>Not enrolled</span>
      )
    },
    { header: 'Wage', render: r => `${r.wageType || 'Monthly'} ($${r.wageRate || 0})` },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Employee', onClick: () => handleOpenEdit(r) },
            r.status === 'Inactive'
              ? { label: 'Restore Employee', onClick: () => restoreEmployee(r.id) }
              : {
                  label: 'Delete Employee',
                  danger: true,
                  confirm: `Remove ${r.name} (${r.code || r.id}) from active records?`,
                  onClick: () => triggerDelete(r)
                }
          ]}
        />
      )
    }
  ];

  // 2. Contractors Columns
  const contractorColumns = [
    {
      header: 'Company Name',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.companyName}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{r.code || r.id} • Tax: {r.taxId || 'N/A'}</div>
        </div>
      )
    },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Phone / Email', render: r => `${r.phone || ''} • ${r.email || ''}` },
    {
      header: 'Workers',
      render: r => <span className="badge badge-teal" style={{ fontWeight: 700 }}>{r.workerCount} Workers</span>
    },
    { header: 'Agreement', render: r => `$${r.agreementRate} / ${r.rateUnit || 'Ton'}` },
    { header: 'Contract End', accessor: 'contractEnd' },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Contractor', onClick: () => handleOpenEdit(r) },
            r.status === 'Inactive'
              ? { label: 'Restore Contractor', onClick: () => restoreContractor(r.id) }
              : {
                  label: 'Delete Contractor',
                  danger: true,
                  confirm: `Remove contractor ${r.companyName}? Linked workers will be set to Inactive.`,
                  onClick: () => triggerDelete(r)
                }
          ]}
        />
      )
    }
  ];

  // 3. Contractor Workers Columns
  const workerColumns = [
    {
      header: 'Worker',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={r.photo || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'}
            alt={r.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{r.code || r.id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Contractor',
      render: r => {
        const con = contractors.find(c => c.id === r.contractorId);
        return <span style={{ fontWeight: 600 }}>{con?.companyName || r.contractorName || 'Linked Contractor'}</span>;
      }
    },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    {
      header: 'Face Status',
      render: r => r.faceEnrolled ? (
        <span className="badge badge-emerald"><Check size={11} /> Enrolled</span>
      ) : (
        <span className="badge badge-soft">Not enrolled</span>
      )
    },
    { header: 'Wage', render: r => `${r.wageType || 'Daily'} ($${r.wageRate || 0})` },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Worker', onClick: () => handleOpenEdit(r) },
            r.status === 'Inactive'
              ? { label: 'Restore Worker', onClick: () => restoreContractorWorker(r.id) }
              : {
                  label: 'Delete Worker',
                  danger: true,
                  confirm: `Remove contractor worker ${r.name}?`,
                  onClick: () => triggerDelete(r)
                }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Page Header and Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {subTab === 'employees' ? 'Employees' : subTab === 'contractors' ? 'Contractors' : 'Contractor Workers'}
          </h2>
        </div>

        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={14} />
            <span>
              {subTab === 'employees' ? 'Add Employee' : subTab === 'contractors' ? 'Add Contractor' : 'Add Worker'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {subTab === 'employees' && (
        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          emptyMessage="No employee records found matching filter."
          onRowClick={r => setProfileItem(r)}
        />
      )}

      {subTab === 'contractors' && (
        <DataTable
          columns={contractorColumns}
          data={filteredContractors}
          emptyMessage="No contractor records found matching filter."
          onRowClick={r => setProfileItem(r)}
        />
      )}

      {subTab === 'workers' && (
        <DataTable
          columns={workerColumns}
          data={filteredWorkers}
          emptyMessage="No contractor worker records found matching filter."
          onRowClick={r => setProfileItem(r)}
        />
      )}

      {/* Unified Add / Edit Form Drawer */}
      <FormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        title={editingItem ? `Edit ${subTab === 'employees' ? 'Employee' : subTab === 'contractors' ? 'Contractor' : 'Worker'}` : `New ${subTab === 'employees' ? 'Employee' : subTab === 'contractors' ? 'Contractor' : 'Worker'}`}
        onSubmit={handleSaveForm}
        submitLabel={editingItem ? "Save Changes" : "Save Record"}
      >
        {subTab === 'employees' && (
          <>
            <div className="form-group">
              <label className="form-label">Employee Code</label>
              <input className="form-input" placeholder="e.g. EMP-0001" value={empForm.code} onChange={e => setEmpForm({ ...empForm, code: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Enter full name" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+39-555-0100" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="worker@carrara.it" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <DatePicker value={empForm.dob} onChange={val => setEmpForm({ ...empForm, dob: val })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={empForm.gender} onChange={e => setEmpForm({ ...empForm, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Enter residential address" value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input className="form-input" placeholder="+39-555-0999" value={empForm.emergencyContact} onChange={e => setEmpForm({ ...empForm, emergencyContact: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={empForm.department} onChange={e => setEmpForm({ ...empForm, department: e.target.value })}>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select className="form-select" value={empForm.designation} onChange={e => setEmpForm({ ...empForm, designation: e.target.value })}>
                {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Shift</label>
              <select className="form-select" value={empForm.shift} onChange={e => setEmpForm({ ...empForm, shift: e.target.value })}>
                {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <DatePicker value={empForm.joiningDate} onChange={val => setEmpForm({ ...empForm, joiningDate: val })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="form-group">
              <label className="form-label">ID Type</label>
              <select className="form-select" value={empForm.idType} onChange={e => setEmpForm({ ...empForm, idType: e.target.value })}>
                <option value="National ID">National ID</option>
                <option value="Passport">Passport</option>
                <option value="Tax Code">Tax Code</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ID Number</label>
              <input className="form-input" placeholder="e.g. IT-98212-A" value={empForm.idNumber} onChange={e => setEmpForm({ ...empForm, idNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">ID Expiry</label>
              <DatePicker value={empForm.idExpiry} onChange={val => setEmpForm({ ...empForm, idExpiry: val })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input className="form-input" placeholder="e.g. Intesa Sanpaolo" value={empForm.bankName} onChange={e => setEmpForm({ ...empForm, bankName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account (IBAN)</label>
              <input className="form-input" placeholder="IT88B0103011100000000543210" value={empForm.bankAccount} onChange={e => setEmpForm({ ...empForm, bankAccount: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Wage Type</label>
              <select className="form-select" value={empForm.wageType} onChange={e => setEmpForm({ ...empForm, wageType: e.target.value })}>
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
                <option value="Per Piece">Per Piece</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Wage Rate ($)</label>
              <input type="number" className="form-input" placeholder="0.00" value={empForm.wageRate} onChange={e => setEmpForm({ ...empForm, wageRate: e.target.value })} />
            </div>
            <div className="form-group col-span-2">
              <PhotoUpload
                label="Employee Photo"
                value={empForm.photo}
                onChange={val => setEmpForm({ ...empForm, photo: val })}
                helperText="Upload official staff portrait (PNG, JPG, WEBP up to 5MB)"
              />
            </div>
            <div className="form-group col-span-2">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={empForm.faceEnrolled} onChange={e => setEmpForm({ ...empForm, faceEnrolled: e.target.checked })} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Enroll Face Recognition for Kiosk Punching</span>
              </label>
            </div>
          </>
        )}

        {subTab === 'contractors' && (
          <>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="Enter contractor company name" value={conForm.companyName} onChange={e => setConForm({ ...conForm, companyName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax ID / VAT No.</label>
              <input className="form-input" placeholder="e.g. IT-099182301" value={conForm.taxId} onChange={e => setConForm({ ...conForm, taxId: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="form-input" placeholder="Enter representative name" value={conForm.contactPerson} onChange={e => setConForm({ ...conForm, contactPerson: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+39-555-0100" value={conForm.phone} onChange={e => setConForm({ ...conForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="contractor@company.it" value={conForm.email} onChange={e => setConForm({ ...conForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Agreement Rate ($)</label>
              <input type="number" className="form-input" placeholder="140" value={conForm.agreementRate} onChange={e => setConForm({ ...conForm, agreementRate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Rate Unit</label>
              <select className="form-select" value={conForm.rateUnit} onChange={e => setConForm({ ...conForm, rateUnit: e.target.value })}>
                <option value="Per Ton">Per Ton</option>
                <option value="Per Slab">Per Slab</option>
                <option value="Per Hour">Per Hour</option>
                <option value="Monthly Fixed">Monthly Fixed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contract Start Date</label>
              <DatePicker value={conForm.contractStart} onChange={val => setConForm({ ...conForm, contractStart: val })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="form-group">
              <label className="form-label">Contract End Date</label>
              <DatePicker value={conForm.contractEnd} onChange={val => setConForm({ ...conForm, contractEnd: val })} placeholder="DD/MM/YYYY" />
            </div>
            <div className="form-group col-span-2">
              <FileUpload
                label="Contract Agreement Document"
                value={conForm.contractDoc}
                onChange={val => setConForm({ ...conForm, contractDoc: val })}
                helperText="Signed vendor contract / rate agreement (PDF or scan)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input className="form-input" placeholder="Intesa Sanpaolo" value={conForm.bankName} onChange={e => setConForm({ ...conForm, bankName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account</label>
              <input className="form-input" placeholder="IT99W0306911104000000112233" value={conForm.bankAccount} onChange={e => setConForm({ ...conForm, bankAccount: e.target.value })} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Business Address</label>
              <input className="form-input" placeholder="Enter address" value={conForm.address} onChange={e => setConForm({ ...conForm, address: e.target.value })} />
            </div>
          </>
        )}

        {subTab === 'workers' && (
          <>
            <div className="form-group">
              <label className="form-label">Worker Code</label>
              <input className="form-input" placeholder="e.g. WRK-0001" value={wrkForm.code} onChange={e => setWrkForm({ ...wrkForm, code: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Enter worker name" value={wrkForm.name} onChange={e => setWrkForm({ ...wrkForm, name: e.target.value })} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Contractor Company (Required)</label>
              <select className="form-select" value={wrkForm.contractorId} onChange={e => setWrkForm({ ...wrkForm, contractorId: e.target.value })}>
                <option value="">Select Contractor...</option>
                {contractors.map(c => <option key={c.id} value={c.id}>{c.companyName} ({c.code || c.id})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+39-555-0100" value={wrkForm.phone} onChange={e => setWrkForm({ ...wrkForm, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" placeholder="worker@carrara.it" value={wrkForm.email} onChange={e => setWrkForm({ ...wrkForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={wrkForm.department} onChange={e => setWrkForm({ ...wrkForm, department: e.target.value })}>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select className="form-select" value={wrkForm.designation} onChange={e => setWrkForm({ ...wrkForm, designation: e.target.value })}>
                {designations.map(d => <option key={d.id} value={d.title}>{d.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Daily Wage ($)</label>
              <input type="number" className="form-input" placeholder="110" value={wrkForm.wageRate} onChange={e => setWrkForm({ ...wrkForm, wageRate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Shift</label>
              <select className="form-select" value={wrkForm.shift} onChange={e => setWrkForm({ ...wrkForm, shift: e.target.value })}>
                {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group col-span-2">
              <PhotoUpload
                label="Worker Photo"
                value={wrkForm.photo}
                onChange={val => setWrkForm({ ...wrkForm, photo: val })}
                helperText="Upload worker photo for biometric kiosk face enrollment"
              />
            </div>
            <div className="form-group">
              <PhotoUpload
                label="Government ID Card (Front)"
                shape="rounded"
                value={wrkForm.idCardFront}
                onChange={val => setWrkForm({ ...wrkForm, idCardFront: val })}
                helperText="Aadhaar / National ID Front"
              />
            </div>
            <div className="form-group">
              <PhotoUpload
                label="Government ID Card (Back)"
                shape="rounded"
                value={wrkForm.idCardBack}
                onChange={val => setWrkForm({ ...wrkForm, idCardBack: val })}
                helperText="Aadhaar / National ID Back"
              />
            </div>
            <div className="form-group col-span-2">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={wrkForm.faceEnrolled} onChange={e => setWrkForm({ ...wrkForm, faceEnrolled: e.target.checked })} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Enroll Face Recognition for Kiosk Punching</span>
              </label>
            </div>
          </>
        )}
      </FormDrawer>

      {/* Profile Details Drawer on Row Click */}
      {profileItem && (
        <div className="drawer-backdrop" onClick={() => setProfileItem(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '560px' }}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={profileItem.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={profileItem.name || profileItem.companyName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--line)' }}
                />
                <div>
                  <div className="drawer-title">{profileItem.name || profileItem.companyName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {profileItem.code || profileItem.id} • {profileItem.department || profileItem.type}
                  </div>
                </div>
              </div>
              <button className="iconbtn" onClick={() => setProfileItem(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--soft)', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Designation / Role</span>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{profileItem.designation || profileItem.contactPerson || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                  <div style={{ marginTop: '2px' }}><StatusBadge status={profileItem.status || 'Active'} /></div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                  <div style={{ fontSize: '13px', marginTop: '2px' }}>{profileItem.phone || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                  <div style={{ fontSize: '13px', marginTop: '2px' }}>{profileItem.email || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bank Account</span>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{profileItem.bankAccount || '—'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Wage / Agreement</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                    ${profileItem.wageRate || profileItem.agreementRate || 0} ({profileItem.wageType || profileItem.rateUnit || 'Rate'})
                  </div>
                </div>
              </div>

              {/* Leave Balance Snapshot */}
              {profileDetails?.leave && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Current Leave Balance</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#065f46' }}>{profileDetails.leave.annualLeave || 0}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#047857' }}>Annual Leave</div>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{profileDetails.leave.sickLeave || 0}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#1d4ed8' }}>Sick Leave</div>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#92400e' }}>{profileDetails.leave.casualLeave || 0}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#b45309' }}>Casual Leave</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance History */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Recent Attendance Logs</h4>
                {profileDetails?.attendance?.length > 0 ? (
                  <div style={{ border: '1px solid var(--line)', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--soft)' }}>
                        <tr>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Shift</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>In / Out</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Worked</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileDetails.attendance.slice(0, 5).map(att => (
                          <tr key={att.id} style={{ borderTop: '1px solid var(--line)' }}>
                            <td style={{ padding: '8px 12px' }}>{att.date}</td>
                            <td style={{ padding: '8px 12px' }}>{att.shift}</td>
                            <td style={{ padding: '8px 12px' }}>{att.punchIn || att.inTime || '--'} - {att.punchOut || att.outTime || '--'}</td>
                            <td style={{ padding: '8px 12px' }}>{att.workedHours}h</td>
                            <td style={{ padding: '8px 12px' }}><StatusBadge status={att.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px', border: '1px dashed var(--line)', borderRadius: '6px' }}>
                    No recorded attendance logs for this profile.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Confirm Record Deletion"
          message={deleteConfirmTarget.message}
          confirmLabel="Delete / Archive"
          danger={true}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteConfirmTarget(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// 2. ATTENDANCE SCREEN (Daily logs, flags, corrections, void, unmatched)
// ============================================================================
export function AttendanceScreen({ defaultSubTab = 'daily', onSubTabChange } = {}) {
  const {
    attendance,
    personnel,
    shifts,
    addAttendance,
    correctAttendance,
    voidAttendance,
    restoreAttendance,
    assignUnmatchedPunch,
    rejectUnmatchedPunch,
    isDateInLockedPayroll
  } = useApp();

  const [internalTab, setInternalTab] = useState(defaultSubTab);
  const activeTab = defaultSubTab || internalTab;
  const setActiveTab = (newTab) => {
    setInternalTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

  // Drawers
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isCorrectDrawerOpen, setIsCorrectDrawerOpen] = useState(false);
  const [selectedAtt, setSelectedAtt] = useState(null);
  const [voidConfirmAtt, setVoidConfirmAtt] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Form State
  const [addForm, setAddForm] = useState({
    personId: '',
    date: new Date().toISOString().slice(0, 10),
    shift: 'Shift 1',
    punchIn: '08:00',
    punchOut: '17:00',
    status: 'Present',
    device: 'Manual Entry'
  });

  const [correctForm, setCorrectForm] = useState({
    punchIn: '',
    punchOut: '',
    shift: 'Shift 1',
    status: 'Present',
    correctionReason: ''
  });

  // Open Manual Add
  const handleOpenAdd = () => {
    setAddForm({
      personId: personnel[0]?.id || '',
      date: dateFilter || new Date().toISOString().slice(0, 10),
      shift: shifts[0]?.name || 'Shift 1',
      punchIn: '08:00',
      punchOut: '17:00',
      status: 'Present',
      device: 'Manual Entry'
    });
    setIsAddDrawerOpen(true);
  };

  const handleSaveAdd = (e) => {
    e?.preventDefault?.();
    addAttendance(addForm);
    setIsAddDrawerOpen(false);
  };

  // Open Correction
  const handleOpenCorrect = (att) => {
    setSelectedAtt(att);
    setCorrectForm({
      punchIn: att.punchIn || att.inTime || '08:00',
      punchOut: att.punchOut || att.outTime || '17:00',
      shift: att.shift || 'Shift 1',
      status: att.status || 'Present',
      correctionReason: ''
    });
    setIsCorrectDrawerOpen(true);
  };

  const handleSaveCorrect = (e) => {
    e?.preventDefault?.();
    if (!selectedAtt) return;
    correctAttendance(selectedAtt.id, correctForm);
    setIsCorrectDrawerOpen(false);
  };

  // Void Handler
  const handleConfirmVoid = () => {
    if (!voidConfirmAtt) return;
    voidAttendance(voidConfirmAtt.id, voidReason);
    setVoidConfirmAtt(null);
    setVoidReason('');
  };

  // Flag computation for late, early departure, or missing punches
  const getPunchFlags = (row) => {
    const flags = [];
    const inTime = row.punchIn || row.inTime;
    const outTime = row.punchOut || row.outTime;

    if (!inTime) flags.push({ label: 'Missing In', type: 'ruby' });
    if (!outTime && row.status !== 'Leave' && row.status !== 'Week Off') flags.push({ label: 'Missing Out', type: 'ruby' });

    // Late if inTime > 08:15 (or morning shift start + 15m)
    if (inTime && inTime > '08:15') {
      flags.push({ label: 'Late Arrival', type: 'amber' });
    }
    // Early out if outTime < 16:45
    if (outTime && outTime < '16:45') {
      flags.push({ label: 'Early Departure', type: 'amber' });
    }

    return flags;
  };

  // Filtered rows
  const dailyRows = useMemo(() => {
    return attendance.filter(a => a.status !== 'Voided' && a.status !== 'Unmatched');
  }, [attendance]);

  const unmatchedRows = useMemo(() => {
    return attendance.filter(a => a.status === 'Unmatched' || a.matchStatus === 'Unmatched');
  }, [attendance]);

  const voidedRows = useMemo(() => {
    return attendance.filter(a => a.status === 'Voided');
  }, [attendance]);

  // Columns for Daily View
  const dailyColumns = [
    {
      header: 'Person',
      render: r => {
        const person = personnel.find(p => p.id === (r.personId || r.employeeId));
        const photo = person?.photo || r.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
        const name = r.personName || person?.name || 'Personnel';
        const code = r.personId || r.employeeId;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={photo}
              alt={name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--line)',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
              }}
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{code}</div>
            </div>
          </div>
        );
      }
    },
    { header: 'Date', accessor: 'date' },
    { header: 'Shift', render: r => <span className="badge badge-soft">{r.shift}</span> },
    { header: 'Punch In', render: r => <span className="table-num">{r.punchIn || r.inTime || '--:--'}</span> },
    { header: 'Punch Out', render: r => <span className="table-num">{r.punchOut || r.outTime || '--:--'}</span> },
    { header: 'Worked (Hrs)', render: r => <span className="table-num">{r.workedHours || 0}h</span> },
    { header: 'OT (Hrs)', render: r => <span className="table-num">{r.overtimeHours || 0}h</span> },
    {
      header: 'Flags & Anomalies',
      render: r => {
        const flags = getPunchFlags(r);
        if (flags.length === 0) return <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Clean</span>;
        return (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {flags.map((f, i) => (
              <span key={i} className={`badge badge-${f.type}`} style={{ fontSize: '10px' }}>
                {f.label}
              </span>
            ))}
          </div>
        );
      }
    },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Correct Punch', onClick: () => handleOpenCorrect(r) },
            {
              label: 'Void Record',
              danger: true,
              confirm: `Mark attendance for ${r.personName} on ${r.date} as Voided?`,
              onClick: () => setVoidConfirmAtt(r)
            }
          ]}
        />
      )
    }
  ];

  // Columns for Unmatched Punches
  const unmatchedColumns = [
    { header: 'Punch ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', render: r => r.punchIn || r.time || '--:--' },
    { header: 'Device / Location', render: r => r.device || 'Gate Kiosk' },
    { header: 'Confidence Score', render: r => <span className="badge badge-amber">{r.confidence ? `${Math.round(r.confidence * 100)}%` : 'Low Match'}</span> },
    {
      header: 'Assign Person',
      render: r => (
        <select
          className="form-select"
          style={{ height: '28px', fontSize: '11px', width: '180px' }}
          defaultValue=""
          onChange={e => {
            if (e.target.value) {
              assignUnmatchedPunch(r.id, e.target.value);
            }
          }}
        >
          <option value="">Choose Employee...</option>
          {personnel.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code || p.id})</option>)}
        </select>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Reject Punch',
              danger: true,
              confirm: 'Reject and discard this unmatched punch?',
              onClick: () => rejectUnmatchedPunch(r.id)
            }
          ]}
        />
      )
    }
  ];

  // Columns for Voided Records
  const voidedColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Person', accessor: 'personName' },
    { header: 'Date', accessor: 'date' },
    { header: 'Void Reason', render: r => <span style={{ color: 'var(--ruby-text)', fontStyle: 'italic' }}>{r.voidReason || 'Voided by Admin'}</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Restore Record', onClick: () => restoreAttendance(r.id) }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Header and action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {activeTab === 'daily' ? 'Daily Attendance' : activeTab === 'unmatched' ? 'Unmatched Face Punches' : 'Voided Records'}
          </h2>
        </div>

        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>Add Attendance</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeTab === 'daily' && (
        <DataTable columns={dailyColumns} data={dailyRows} emptyMessage="No attendance logs found." />
      )}

      {activeTab === 'unmatched' && (
        <DataTable columns={unmatchedColumns} data={unmatchedRows} emptyMessage="No unmatched biometric punches." />
      )}

      {activeTab === 'voided' && (
        <DataTable columns={voidedColumns} data={voidedRows} emptyMessage="No voided attendance records." />
      )}

      {/* Add Attendance Drawer */}
      <FormDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title="Add Manual Attendance"
        onSubmit={handleSaveAdd}
        submitLabel="Record Attendance"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Employee / Worker</label>
          <select className="form-select" value={addForm.personId} onChange={e => setAddForm({ ...addForm, personId: e.target.value })}>
            {personnel.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code || p.id})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <DatePicker value={addForm.date} onChange={val => setAddForm({ ...addForm, date: val })} placeholder="DD/MM/YYYY" />
        </div>
        <div className="form-group">
          <label className="form-label">Shift</label>
          <select className="form-select" value={addForm.shift} onChange={e => setAddForm({ ...addForm, shift: e.target.value })}>
            {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Punch In Time</label>
          <input type="time" className="form-input" value={addForm.punchIn} onChange={e => setAddForm({ ...addForm, punchIn: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Punch Out Time</label>
          <input type="time" className="form-input" value={addForm.punchOut} onChange={e => setAddForm({ ...addForm, punchOut: e.target.value })} />
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Status</label>
          <select className="form-select" value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })}>
            <option value="Present">Present</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
            <option value="Week Off">Week Off</option>
          </select>
        </div>
      </FormDrawer>

      {/* Correct Punch Drawer */}
      <FormDrawer
        isOpen={isCorrectDrawerOpen}
        onClose={() => setIsCorrectDrawerOpen(false)}
        title="Correct Attendance Record"
        onSubmit={handleSaveCorrect}
        submitLabel="Save Correction"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Person</label>
          <input className="form-input" disabled value={selectedAtt?.personName || 'Personnel'} />
        </div>
        <div className="form-group">
          <label className="form-label">Punch In</label>
          <input type="time" className="form-input" value={correctForm.punchIn} onChange={e => setCorrectForm({ ...correctForm, punchIn: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Punch Out</label>
          <input type="time" className="form-input" value={correctForm.punchOut} onChange={e => setCorrectForm({ ...correctForm, punchOut: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Shift</label>
          <select className="form-select" value={correctForm.shift} onChange={e => setCorrectForm({ ...correctForm, shift: e.target.value })}>
            {shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={correctForm.status} onChange={e => setCorrectForm({ ...correctForm, status: e.target.value })}>
            <option value="Present">Present</option>
            <option value="Half Day">Half Day</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
            <option value="Week Off">Week Off</option>
          </select>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Reason for Correction (Required for Audit Trail)</label>
          <input
            className="form-input"
            placeholder="e.g. Device failure, forgotten badge, supervisor authorized"
            value={correctForm.correctionReason}
            onChange={e => setCorrectForm({ ...correctForm, correctionReason: e.target.value })}
            required
          />
        </div>

        {/* Existing Correction History */}
        {selectedAtt?.correctionHistory?.length > 0 && (
          <div className="col-span-2" style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Correction Audit History</span>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedAtt.correctionHistory.map((h, i) => (
                <div key={i} style={{ padding: '8px 10px', background: 'var(--soft)', borderRadius: '6px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 600 }}>{h.user} • {h.date}</div>
                  <div style={{ color: 'var(--muted)' }}>Reason: {h.reason}</div>
                  <div>In: {h.oldIn || '--'} → {h.newIn || '--'} | Out: {h.oldOut || '--'} → {h.newOut || '--'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </FormDrawer>

      {/* Void Attendance Modal */}
      {voidConfirmAtt && (
        <div className="drawer-backdrop" onClick={() => setVoidConfirmAtt(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '450px', height: 'auto', alignSelf: 'center', borderRadius: '12px' }}>
            <div className="drawer-header">
              <div className="drawer-title">Void Attendance Record</div>
              <button className="iconbtn" onClick={() => setVoidConfirmAtt(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--ink)' }}>
                Are you sure you want to void the attendance for <strong>{voidConfirmAtt.personName}</strong> on {voidConfirmAtt.date}?
                Voided records will be hidden from reports and payroll.
              </p>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Reason for Voiding</label>
                <input
                  className="form-input"
                  placeholder="e.g. Accidental double entry"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                />
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setVoidConfirmAtt(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--ruby-text)' }} onClick={handleConfirmVoid}>Void Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. SHIFT & ROSTER SCREEN (Weekly Matrix, Cell Click, Copy Week, Lock icon)
// ============================================================================
export function ShiftRosterScreen() {
  const {
    personnel,
    shifts,
    rosters,
    holidays,
    leaveRequests,
    assignRosterCell,
    bulkAssignRoster,
    copyRosterWeek,
    clearRosterDay
  } = useApp();

  const [selectedWeek, setSelectedWeek] = useState('2026-10-12'); // Monday of current test week
  const [filterDept, setFilterDept] = useState('All');
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);

  // Quick shift picker modal on cell click
  const [cellPicker, setCellPicker] = useState(null); // { personId, dayKey, personName, currentShift }

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);

  const daysOfWeek = [
    { key: 'mon', label: 'Mon', date: '2026-10-12' },
    { key: 'tue', label: 'Tue', date: '2026-10-13' },
    { key: 'wed', label: 'Wed', date: '2026-10-14' },
    { key: 'thu', label: 'Thu', date: '2026-10-15' },
    { key: 'fri', label: 'Fri', date: '2026-10-16' },
    { key: 'sat', label: 'Sat', date: '2026-10-17' },
    { key: 'sun', label: 'Sun', date: '2026-10-18' }
  ];

  const todayStr = '2026-10-13'; // Tue is today in mock scenario

  // Filter people by department and search query
  const filteredPeople = useMemo(() => {
    return personnel.filter(p => {
      if (filterDept !== 'All' && p.department !== filterDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = String(p.name || '').toLowerCase().includes(q);
        const matchCode = String(p.code || p.id || '').toLowerCase().includes(q);
        const matchRole = String(p.designation || p.type || '').toLowerCase().includes(q);
        const matchDept = String(p.department || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchRole && !matchDept) return false;
      }
      return true;
    });
  }, [personnel, filterDept, searchQuery]);

  // Paginated people
  const totalPages = Math.max(1, Math.ceil(filteredPeople.length / pageSize));
  const paginatedPeople = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPeople.slice(start, start + pageSize);
  }, [filteredPeople, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedPeople.map(p => p.id);
      setSelectedPersonIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedPeople.map(p => p.id));
      setSelectedPersonIds(prev => prev.filter(id => !pageIds.has(id)));
    }
  };

  const handleTogglePerson = (id) => {
    setSelectedPersonIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllPageSelected = paginatedPeople.length > 0 && paginatedPeople.every(p => selectedPersonIds.includes(p.id));

  // Handle cell click
  const handleCellClick = (person, day) => {
    // Check if locked by holiday or leave
    const isHoliday = holidays.some(h => h.date === day.date);
    const isApprovedLeave = leaveRequests.some(l => (l.personId === person.id || l.employeeId === person.id) && l.status === 'Approved' && l.fromDate <= day.date && l.toDate >= day.date);

    if (isHoliday || isApprovedLeave) {
      alert(`This day is locked by ${isHoliday ? 'Holiday' : 'Approved Leave'}. To change this, modify the Leave or Holiday calendar.`);
      return;
    }

    const roster = rosters.find(r => (r.personId === person.id || r.employeeId === person.id) && r.weekStart === selectedWeek);
    const currentShift = roster ? roster[day.key] : '';

    setCellPicker({
      personId: person.id,
      personName: person.name,
      personCode: person.code || person.id,
      personPhoto: person.photo,
      personRole: person.designation || person.type || 'Personnel',
      dayKey: day.key,
      dayLabel: day.label,
      dayDate: day.date,
      currentShift
    });
  };

  const handleSelectShift = (shiftCode) => {
    if (!cellPicker) return;
    assignRosterCell({
      personId: cellPicker.personId,
      weekStart: selectedWeek,
      dayKey: cellPicker.dayKey,
      shiftCode
    });
    setCellPicker(null);
  };

  const handleBulkApplyShift = (shiftCode, targetDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) => {
    selectedPersonIds.forEach(pid => {
      targetDays.forEach(dKey => {
        assignRosterCell({
          personId: pid,
          weekStart: selectedWeek,
          dayKey: dKey,
          shiftCode
        });
      });
    });
    setBulkDrawerOpen(false);
    setSelectedPersonIds([]);
  };

  const handleCopyLastWeek = () => {
    // Assume previous week is 7 days prior
    copyRosterWeek({
      fromWeekStart: '2026-10-05',
      toWeekStart: selectedWeek
    });
    setCopyConfirmOpen(false);
  };

  return (
    <div className="page-wrapper">
      {/* Header and action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            Weekly Shift Roster
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Filter input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search personnel / code..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: '32px', fontSize: '12px', paddingLeft: '30px', width: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Week Starting:</span>
            <input
              type="date"
              className="form-input"
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              style={{ height: '32px', fontSize: '12px', width: '135px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Department:</span>
            <select
              className="form-select"
              value={filterDept}
              onChange={e => {
                setFilterDept(e.target.value);
                setCurrentPage(1);
              }}
              style={{ height: '32px', fontSize: '12px' }}
            >
              <option value="All">All Departments</option>
              <option value="Yard Operations">Yard Operations</option>
              <option value="Gangsaw Cutting">Gangsaw Cutting</option>
              <option value="Quality Inspection">Quality Inspection</option>
              <option value="Quarry Logistics">Quarry Logistics</option>
            </select>
          </div>

          {selectedPersonIds.length > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setBulkDrawerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Assign Shift ({selectedPersonIds.length})</span>
            </button>
          )}

          <button className="btn btn-secondary btn-sm" onClick={() => setCopyConfirmOpen(true)}>
            <Copy size={13} />
            <span>Copy Last Week</span>
          </button>
        </div>
      </div>

      {/* Roster Grid Matrix */}
      <div
        className="table-card"
        style={{
          border: '1px solid var(--line)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--white)'
        }}
      >
        <div
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 240px)',
            width: '100%',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <table className="data-table" style={{ minWidth: '1100px', width: '100%', margin: 0, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                <th
                  style={{
                    width: '44px',
                    textAlign: 'center',
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    zIndex: 20,
                    backgroundColor: 'var(--soft)',
                    borderRight: '1px solid var(--line)',
                    borderBottom: '1px solid var(--line)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={handleSelectAll}
                    title="Select all on this page"
                    style={{ cursor: 'pointer', accentColor: 'var(--teal-600)' }}
                  />
                </th>
                <th
                  style={{
                    width: '240px',
                    minWidth: '240px',
                    position: 'sticky',
                    left: '44px',
                    top: 0,
                    zIndex: 20,
                    backgroundColor: 'var(--soft)',
                    borderRight: '2px solid var(--line)',
                    borderBottom: '1px solid var(--line)',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.03)'
                  }}
                >
                  Person
                </th>
                {daysOfWeek.map(d => {
                  const isToday = d.date === todayStr;
                  const isHol = holidays.some(h => h.date === d.date);
                  return (
                    <th
                      key={d.key}
                      style={{
                        textAlign: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        background: isToday ? 'var(--teal-050)' : isHol ? '#fef3c7' : 'var(--soft)',
                        borderLeft: '1px solid var(--line)',
                        borderBottom: '1px solid var(--line)',
                        padding: '10px 12px',
                        minWidth: '115px'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: isToday ? 'var(--teal-900)' : 'var(--ink)' }}>{d.label}</div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: isToday ? 'var(--teal-700)' : 'var(--muted)', marginTop: '1px' }}>
                        {d.date.slice(5)}
                      </div>
                      {isToday && (
                        <span className="badge badge-teal" style={{ fontSize: '9px', padding: '1px 6px', marginTop: '3px', fontWeight: 700 }}>
                          Today
                        </span>
                      )}
                      {isHol && (
                        <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 6px', marginTop: '3px', fontWeight: 700 }}>
                          Holiday
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedPeople.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>No personnel found</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your search query or department filter.</div>
                  </td>
                </tr>
              ) : (
                paginatedPeople.map(person => {
                  const roster = rosters.find(r => (r.personId === person.id || r.employeeId === person.id) && r.weekStart === selectedWeek);
                  const isChecked = selectedPersonIds.includes(person.id);
                  const displayName = person.name || (person.code ? `Personnel (${person.code})` : 'Team Member');
                  const displayCode = person.code || person.id;
                  const displayDept = person.department || person.designation || 'Operations';

                  return (
                    <tr
                      key={person.id}
                      style={{
                        backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td
                        style={{
                          textAlign: 'center',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: isChecked ? '#f4f8ff' : 'var(--white)',
                          zIndex: 5,
                          borderRight: '1px solid var(--line)',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePerson(person.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--teal-600)' }}
                        />
                      </td>
                      <td
                        style={{
                          fontWeight: 600,
                          position: 'sticky',
                          left: '44px',
                          backgroundColor: isChecked ? '#f4f8ff' : 'var(--white)',
                          zIndex: 5,
                          borderRight: '2px solid var(--line)',
                          borderBottom: '1px solid var(--line)',
                          boxShadow: '2px 0 4px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={person.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={displayName}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--line)',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {displayName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {displayCode} • {displayDept}
                            </div>
                          </div>
                        </div>
                      </td>

                      {daysOfWeek.map(d => {
                        const isHol = holidays.some(h => h.date === d.date);
                        const isApprovedLeave = leaveRequests.some(l => (l.personId === person.id || l.employeeId === person.id) && l.status === 'Approved' && l.fromDate <= d.date && l.toDate >= d.date);
                        const shiftVal = roster ? roster[d.key] : '';

                        let cellDisplay = shiftVal || 'Week Off';
                        let shiftTime = '';
                        let isLocked = false;
                        let badgeClass = 'badge-soft';

                        if (isHol) {
                          cellDisplay = 'Holiday';
                          isLocked = true;
                          badgeClass = 'badge-amber';
                        } else if (isApprovedLeave || shiftVal === 'Leave' || shiftVal === 'On Leave') {
                          cellDisplay = 'Leave';
                          isLocked = isApprovedLeave;
                          badgeClass = 'badge-amber';
                        } else if (shiftVal === 'Off' || shiftVal === 'Week Off') {
                          cellDisplay = 'Week Off';
                          badgeClass = 'badge-soft';
                        } else if (shiftVal === 'SH-01' || shiftVal === 'Shift 1' || shiftVal === 'Morning Shift') {
                          cellDisplay = 'Shift 1';
                          shiftTime = '06:00 – 14:00';
                          badgeClass = 'badge-teal';
                        } else if (shiftVal === 'SH-02' || shiftVal === 'Shift 2' || shiftVal === 'Evening Shift') {
                          cellDisplay = 'Shift 2';
                          shiftTime = '14:00 – 22:00';
                          badgeClass = 'badge-emerald';
                        } else if (shiftVal === 'SH-03' || shiftVal === 'Shift 3' || shiftVal === 'Night Shift') {
                          cellDisplay = 'Shift 3';
                          shiftTime = '22:00 – 06:00';
                          badgeClass = 'badge-soft';
                        }

                        const isCellToday = d.date === todayStr;

                        return (
                          <td
                            key={d.key}
                            onClick={() => handleCellClick(person, d)}
                            style={{
                              textAlign: 'center',
                              borderLeft: '1px solid var(--line)',
                              borderBottom: '1px solid var(--line)',
                              padding: '8px 6px',
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              backgroundColor: isCellToday ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                              transition: 'background-color 0.15s ease'
                            }}
                            title={isLocked ? 'Locked by policy' : `Click to change shift for ${d.label}`}
                          >
                            <span
                              className={`badge ${badgeClass}`}
                              style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                minWidth: '88px',
                                fontWeight: 600,
                                userSelect: 'none',
                                lineHeight: 1.2
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                {isLocked && <Lock size={10} />}
                                {cellDisplay}
                              </span>
                              {shiftTime && (
                                <span style={{ fontSize: '9px', fontWeight: 500, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                                  {shiftTime}
                                </span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Bar */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--line)',
            backgroundColor: 'var(--soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Rows per page:</span>
            <select
              className="filter-select"
              style={{ height: '30px', fontSize: '12px', paddingLeft: '8px', paddingRight: '26px' }}
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px' }}>
              Showing {filteredPeople.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredPeople.length)} of {filteredPeople.length} records
            </span>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Cell Shift Assignment Drawer (Full Height Slide-over) */}
      {cellPicker && (
        <div className="drawer-backdrop" onClick={() => setCellPicker(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            {/* Header with Date & Day badge */}
            <div className="drawer-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="drawer-title" style={{ fontSize: '16px', fontWeight: 700 }}>Assign Shift</div>
                  <span className="badge badge-teal" style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                    {cellPicker.dayLabel} • {cellPicker.dayDate}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Schedule assignment for the selected date
                </div>
              </div>
              <button className="iconbtn" onClick={() => setCellPicker(null)} title="Close"><X size={16} /></button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Personnel Summary Profile Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  background: 'var(--soft)',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <img
                  src={cellPicker.personPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={cellPicker.personName}
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>{cellPicker.personName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{cellPicker.personCode}</span>
                    <span>•</span>
                    <span>{cellPicker.personRole}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', fontWeight: 600, marginBottom: '2px' }}>
                    Current Status
                  </div>
                  {cellPicker.currentShift ? (
                    <span className="badge badge-teal" style={{ fontWeight: 600, fontSize: '11px' }}>
                      {cellPicker.currentShift === 'Leave' ? 'On Leave' : cellPicker.currentShift}
                    </span>
                  ) : (
                    <span className="badge badge-soft" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              {/* Working Shifts Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                    Production Shifts
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>8-Hour Scheduled Rotations</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    {
                      id: 'Shift 1',
                      title: 'Shift 1 (Morning)',
                      time: '06:00 – 14:00',
                      desc: 'Quarry Block Extraction, Sawing & Yard Loading',
                      icon: <Sunrise size={18} color="#0284c7" />,
                      iconBg: 'rgba(2, 132, 199, 0.1)',
                      borderColor: '#0284c7'
                    },
                    {
                      id: 'Shift 2',
                      title: 'Shift 2 (Evening)',
                      time: '14:00 – 22:00',
                      desc: 'Line Polishing, Resin Treatment & Slab QA Inspection',
                      icon: <Sun size={18} color="#059669" />,
                      iconBg: 'rgba(5, 150, 105, 0.1)',
                      borderColor: '#059669'
                    },
                    {
                      id: 'Shift 3',
                      title: 'Shift 3 (Night)',
                      time: '22:00 – 06:00',
                      desc: 'Overnight Block Curing, Yard Maintenance & Logistics',
                      icon: <Moon size={18} color="#6366f1" />,
                      iconBg: 'rgba(99, 102, 241, 0.1)',
                      borderColor: '#6366f1'
                    }
                  ].map(shift => {
                    const isSelected = cellPicker.currentShift === shift.id;
                    return (
                      <div
                        key={shift.id}
                        onClick={() => handleSelectShift(shift.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${shift.borderColor}` : '1px solid var(--line)',
                          background: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--ink)';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--line)';
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: shift.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {shift.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{shift.title}</span>
                            <span className="badge badge-soft" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>
                              {shift.time}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {shift.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: shift.borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={13} color="#fff" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Off & Leaves Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
                    Leave & Rest
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Non-working schedules</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* On Leave Card */}
                  <div
                    onClick={() => handleSelectShift('Leave')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: cellPicker.currentShift === 'Leave' ? '2px solid #d97706' : '1px solid var(--line)',
                      background: cellPicker.currentShift === 'Leave' ? 'rgba(217, 119, 6, 0.06)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (cellPicker.currentShift !== 'Leave') e.currentTarget.style.borderColor = '#d97706';
                    }}
                    onMouseLeave={e => {
                      if (cellPicker.currentShift !== 'Leave') e.currentTarget.style.borderColor = 'var(--line)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Palmtree size={17} color="#d97706" />
                      </div>
                      {cellPicker.currentShift === 'Leave' && (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>On Leave</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Personal / Paid absence</div>
                  </div>

                  {/* Week Off Card */}
                  <div
                    onClick={() => handleSelectShift('Off')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: cellPicker.currentShift === 'Off' ? '2px solid var(--ink)' : '1px solid var(--line)',
                      background: cellPicker.currentShift === 'Off' ? 'var(--soft)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      if (cellPicker.currentShift !== 'Off') e.currentTarget.style.borderColor = 'var(--ink)';
                    }}
                    onMouseLeave={e => {
                      if (cellPicker.currentShift !== 'Off') e.currentTarget.style.borderColor = 'var(--line)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Coffee size={17} color="var(--muted)" />
                      </div>
                      {cellPicker.currentShift === 'Off' && (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>Week Off</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Scheduled weekly rest</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="drawer-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
              {cellPicker.currentShift && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--ruby-text)', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleSelectShift('')}
                >
                  <Trash2 size={13} />
                  <span>Clear Assignment</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCellPicker(null)}
                style={{ marginLeft: cellPicker.currentShift ? '0' : 'auto' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Shift Assignment Drawer for Selected Personnel */}
      {bulkDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setBulkDrawerOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
            <div className="drawer-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="drawer-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                    Bulk Assign Shift
                  </div>
                  <span className="badge badge-teal" style={{ fontWeight: 600, fontSize: '11px' }}>
                    {selectedPersonIds.length} Personnel Selected
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  Assign shift across the scheduled week ({selectedWeek})
                </div>
              </div>
              <button className="iconbtn" onClick={() => setBulkDrawerOpen(false)} title="Close"><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Selected List Chips Preview */}
              <div style={{ padding: '12px 14px', background: 'var(--soft)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Assigning to ({selectedPersonIds.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                  {selectedPersonIds.map(pid => {
                    const person = personnel.find(p => p.id === pid);
                    return (
                      <span key={pid} className="badge badge-soft" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {person?.name || pid}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Shift Options */}
              <div>
                <label className="form-label" style={{ marginBottom: '10px', display: 'block', fontWeight: 700 }}>
                  Choose Shift to Apply (Mon – Sun)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'Shift 1', title: 'Shift 1 (Morning)', time: '06:00 – 14:00', icon: <Sunrise size={18} color="#0284c7" />, bg: 'rgba(2, 132, 199, 0.1)', border: '#0284c7' },
                    { id: 'Shift 2', title: 'Shift 2 (Evening)', time: '14:00 – 22:00', icon: <Sun size={18} color="#059669" />, bg: 'rgba(5, 150, 105, 0.1)', border: '#059669' },
                    { id: 'Shift 3', title: 'Shift 3 (Night)', time: '22:00 – 06:00', icon: <Moon size={18} color="#6366f1" />, bg: 'rgba(99, 102, 241, 0.1)', border: '#6366f1' },
                    { id: 'Leave', title: 'On Leave', time: 'Paid / Personal absence', icon: <Palmtree size={18} color="#d97706" />, bg: 'rgba(217, 119, 6, 0.12)', border: '#d97706' },
                    { id: 'Off', title: 'Week Off', time: 'Non-working rest days', icon: <Coffee size={18} color="var(--muted)" />, bg: 'var(--soft)', border: 'var(--line)' }
                  ].map(shift => (
                    <div
                      key={shift.id}
                      onClick={() => handleBulkApplyShift(shift.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        background: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = shift.border; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: shift.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {shift.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>{shift.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{shift.time}</div>
                      </div>
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>Apply All</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="drawer-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--ruby-text)', marginRight: 'auto' }}
                onClick={() => handleBulkApplyShift('')}
              >
                Clear Shifts for Selected
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBulkDrawerOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Last Week Confirmation */}
      {copyConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          title="Copy Previous Week Roster"
          message="Are you sure you want to copy the roster from the previous week to the current week? This will overwrite existing assignments for this week."
          confirmLabel="Copy & Overwrite"
          onConfirm={handleCopyLastWeek}
          onClose={() => setCopyConfirmOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// 4. LEAVE & HOLIDAYS SCREEN (Leave Requests, Balances, Types, Holidays)
// ============================================================================
export function LeaveHolidaysScreen({ defaultSubTab = 'requests', onSubTabChange } = {}) {
  const {
    personnel,
    leaveRequests,
    leaveBalances,
    leaveTypes,
    holidays,
    addLeaveRequest,
    updateLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
    deleteLeaveRequest,
    adjustLeaveBalance,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    addHoliday,
    updateHoliday,
    deleteHoliday
  } = useApp();

  const [internalTab, setInternalTab] = useState(defaultSubTab);
  const activeTab = defaultSubTab || internalTab;
  const setActiveTab = (newTab) => {
    setInternalTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };
  const [statusFilter, setStatusFilter] = useState('All');

  // Drawers
  const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [isHolidayDrawerOpen, setIsHolidayDrawerOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  // Forms
  const [reqForm, setReqForm] = useState({
    personId: '',
    type: 'Annual Leave',
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    halfDay: false,
    reason: ''
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    yearlyAllowance: 15,
    isPaid: true
  });

  const [holForm, setHolForm] = useState({
    name: '',
    date: new Date().toISOString().slice(0, 10),
    mandatory: true
  });

  // Calculate days live in form
  const computedDays = useMemo(() => {
    if (reqForm.halfDay) return 0.5;
    if (!reqForm.fromDate || !reqForm.toDate) return 1;
    const d1 = new Date(reqForm.fromDate);
    const d2 = new Date(reqForm.toDate);
    const diff = d2.getTime() - d1.getTime();
    if (diff < 0) return 1;
    return Math.round(diff / (1000 * 3600 * 24)) + 1;
  }, [reqForm.fromDate, reqForm.toDate, reqForm.halfDay]);

  // Handlers: Leave Requests
  const handleOpenAddRequest = () => {
    setEditingRequest(null);
    setReqForm({
      personId: personnel[0]?.id || '',
      type: leaveTypes[0]?.name || 'Annual Leave',
      fromDate: new Date().toISOString().slice(0, 10),
      toDate: new Date().toISOString().slice(0, 10),
      halfDay: false,
      reason: ''
    });
    setIsRequestDrawerOpen(true);
  };

  const handleOpenEditRequest = (req) => {
    setEditingRequest(req);
    setReqForm({
      personId: req.personId || req.employeeId,
      type: req.type,
      fromDate: req.fromDate,
      toDate: req.toDate,
      halfDay: !!req.halfDay,
      reason: req.reason || ''
    });
    setIsRequestDrawerOpen(true);
  };

  const handleSaveRequest = (e) => {
    e?.preventDefault?.();
    if (editingRequest) {
      updateLeaveRequest(editingRequest.id, reqForm);
    } else {
      addLeaveRequest(reqForm);
    }
    setIsRequestDrawerOpen(false);
  };

  // Handlers: Leave Types
  const handleOpenAddType = () => {
    setEditingType(null);
    setTypeForm({ name: '', yearlyAllowance: 12, isPaid: true });
    setIsTypeDrawerOpen(true);
  };

  const handleOpenEditType = (lt) => {
    setEditingType(lt);
    setTypeForm({ name: lt.name, yearlyAllowance: lt.yearlyAllowance, isPaid: lt.isPaid });
    setIsTypeDrawerOpen(true);
  };

  const handleSaveType = (e) => {
    e?.preventDefault?.();
    if (editingType) {
      updateLeaveType(editingType.id, typeForm);
    } else {
      addLeaveType(typeForm);
    }
    setIsTypeDrawerOpen(false);
  };

  // Handlers: Holidays
  const handleOpenAddHoliday = () => {
    setEditingHoliday(null);
    setHolForm({ name: '', date: new Date().toISOString().slice(0, 10), mandatory: true });
    setIsHolidayDrawerOpen(true);
  };

  const handleOpenEditHoliday = (h) => {
    setEditingHoliday(h);
    setHolForm({ name: h.name, date: h.date, mandatory: h.mandatory });
    setIsHolidayDrawerOpen(true);
  };

  const handleSaveHoliday = (e) => {
    e?.preventDefault?.();
    if (editingHoliday) {
      updateHoliday(editingHoliday.id, holForm);
    } else {
      addHoliday(holForm);
    }
    setIsHolidayDrawerOpen(false);
  };

  // Columns: Requests
  const requestColumns = [
    { header: 'Req ID', accessor: 'id' },
    {
      header: 'Person',
      render: r => {
        const person = personnel.find(p => p.id === (r.personId || r.employeeId));
        return <span style={{ fontWeight: 600 }}>{r.personName || person?.name || 'Personnel'}</span>;
      }
    },
    { header: 'Leave Type', render: r => <span className="badge badge-soft">{r.type}</span> },
    { header: 'From - To', render: r => `${r.fromDate} → ${r.toDate}` },
    { header: 'Days', render: r => <span className="badge badge-teal" style={{ fontWeight: 700 }}>{r.days} day(s)</span> },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            r.status === 'Pending' && { label: 'Approve Leave', onClick: () => approveLeaveRequest(r.id) },
            r.status === 'Pending' && { label: 'Reject Leave', danger: true, onClick: () => rejectLeaveRequest(r.id) },
            r.status === 'Pending' && { label: 'Edit Request', onClick: () => handleOpenEditRequest(r) },
            r.status === 'Pending' && {
              label: 'Delete Request',
              danger: true,
              confirm: 'Delete this pending leave request?',
              onClick: () => deleteLeaveRequest(r.id)
            },
            r.status === 'Approved' && {
              label: 'Cancel Leave',
              danger: true,
              confirm: 'Cancel approved leave? Restores deducted days to employee balance.',
              onClick: () => cancelLeaveRequest(r.id)
            }
          ]}
        />
      )
    }
  ];

  // Columns: Balances
  const balanceColumns = [
    {
      header: 'Employee',
      render: r => {
        const person = personnel.find(p => p.id === (r.personId || r.employeeId));
        return <span style={{ fontWeight: 600 }}>{r.personName || person?.name || r.personId}</span>;
      }
    },
    { header: 'Annual Leave', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.annualLeave || 0}</span> },
    { header: 'Sick Leave', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.sickLeave || 0}</span> },
    { header: 'Casual Leave', render: r => <span className="table-num" style={{ fontWeight: 700 }}>{r.casualLeave || 0}</span> },
    {
      header: 'Manual Adjustment',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Adjust Annual Leave',
              onClick: () => {
                const added = prompt(`Adjust Annual Leave for ${r.personName || r.personId} (+/- days):`, "0");
                if (added !== null && !isNaN(Number(added))) {
                  adjustLeaveBalance(r.personId || r.employeeId, 'annualLeave', Number(added));
                }
              }
            },
            {
              label: 'Adjust Sick Leave',
              onClick: () => {
                const added = prompt(`Adjust Sick Leave for ${r.personName || r.personId} (+/- days):`, "0");
                if (added !== null && !isNaN(Number(added))) {
                  adjustLeaveBalance(r.personId || r.employeeId, 'sickLeave', Number(added));
                }
              }
            },
            {
              label: 'Adjust Casual Leave',
              onClick: () => {
                const added = prompt(`Adjust Casual Leave for ${r.personName || r.personId} (+/- days):`, "0");
                if (added !== null && !isNaN(Number(added))) {
                  adjustLeaveBalance(r.personId || r.employeeId, 'casualLeave', Number(added));
                }
              }
            }
          ]}
        />
      )
    }
  ];

  // Columns: Leave Types
  const leaveTypeColumns = [
    { header: 'Code', accessor: 'id' },
    { header: 'Leave Name', accessor: 'name' },
    { header: 'Yearly Allowance', render: r => `${r.yearlyAllowance} Days` },
    { header: 'Paid Status', render: r => r.isPaid ? <span className="badge badge-emerald">Paid</span> : <span className="badge badge-ruby">Unpaid</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Leave Type', onClick: () => handleOpenEditType(r) },
            {
              label: 'Delete Leave Type',
              danger: true,
              confirm: `Delete leave type ${r.name}?`,
              onClick: () => deleteLeaveType(r.id)
            }
          ]}
        />
      )
    }
  ];

  // Columns: Holidays
  const holidayColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Holiday Name', accessor: 'name' },
    { header: 'Type', render: r => r.mandatory ? <span className="badge badge-amber">Public Holiday</span> : <span className="badge badge-soft">Optional</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Holiday', onClick: () => handleOpenEditHoliday(r) },
            {
              label: 'Delete Holiday',
              danger: true,
              confirm: `Delete holiday ${r.name} on ${r.date}?`,
              onClick: () => deleteHoliday(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Page Header and Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {activeTab === 'requests' ? 'Leave Requests' : activeTab === 'balances' ? 'Leave Balances' : activeTab === 'types' ? 'Leave Types' : 'Holiday Calendar'}
          </h2>
        </div>

        <div>
          {activeTab === 'requests' && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddRequest}>
              <Plus size={14} />
              <span>Apply Leave</span>
            </button>
          )}
          {activeTab === 'types' && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddType}>
              <Plus size={14} />
              <span>Add Leave Type</span>
            </button>
          )}
          {activeTab === 'holidays' && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddHoliday}>
              <Plus size={14} />
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </div>

      {/* Render tables */}
      {activeTab === 'requests' && (
        <DataTable columns={requestColumns} data={leaveRequests} emptyMessage="No leave requests submitted." />
      )}

      {activeTab === 'balances' && (
        <DataTable columns={balanceColumns} data={leaveBalances} emptyMessage="No leave balances configured." />
      )}

      {activeTab === 'types' && (
        <DataTable columns={leaveTypeColumns} data={leaveTypes} emptyMessage="No leave types configured." />
      )}

      {activeTab === 'holidays' && (
        <DataTable columns={holidayColumns} data={holidays} emptyMessage="No calendar holidays." />
      )}

      {/* Request Form Drawer */}
      <FormDrawer
        isOpen={isRequestDrawerOpen}
        onClose={() => setIsRequestDrawerOpen(false)}
        title={editingRequest ? "Edit Leave Request" : "New Leave Request"}
        onSubmit={handleSaveRequest}
        submitLabel={editingRequest ? "Save Request" : "Submit Leave Request"}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Employee / Worker</label>
          <select className="form-select" value={reqForm.personId} onChange={e => setReqForm({ ...reqForm, personId: e.target.value })}>
            {personnel.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code || p.id})</option>)}
          </select>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Leave Type</label>
          <select className="form-select" value={reqForm.type} onChange={e => setReqForm({ ...reqForm, type: e.target.value })}>
            {leaveTypes.map(lt => <option key={lt.id} value={lt.name}>{lt.name} ({lt.yearlyAllowance}d)</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">From Date</label>
          <DatePicker value={reqForm.fromDate} onChange={val => setReqForm({ ...reqForm, fromDate: val })} placeholder="DD/MM/YYYY" />
        </div>
        <div className="form-group">
          <label className="form-label">To Date</label>
          <DatePicker value={reqForm.toDate} onChange={val => setReqForm({ ...reqForm, toDate: val })} placeholder="DD/MM/YYYY" />
        </div>
        <div className="form-group col-span-2">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={reqForm.halfDay} onChange={e => setReqForm({ ...reqForm, halfDay: e.target.checked })} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Half Day Request (0.5 days)</span>
          </label>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Calculated Duration</label>
          <div style={{ padding: '8px 12px', background: 'var(--soft)', borderRadius: '6px', fontWeight: 700, fontSize: '14px', color: 'var(--teal-900)' }}>
            {computedDays} Day(s) (Auto-calculated from dates)
          </div>
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Reason</label>
          <input className="form-input" placeholder="Enter reason for leave" value={reqForm.reason} onChange={e => setReqForm({ ...reqForm, reason: e.target.value })} />
        </div>
      </FormDrawer>

      {/* Leave Type Form Drawer */}
      <FormDrawer
        isOpen={isTypeDrawerOpen}
        onClose={() => setIsTypeDrawerOpen(false)}
        title={editingType ? "Edit Leave Type" : "New Leave Type"}
        onSubmit={handleSaveType}
        submitLabel={editingType ? "Save Changes" : "Create Leave Type"}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Leave Type Name</label>
          <input className="form-input" placeholder="e.g. Maternity / Paternity Leave" value={typeForm.name} onChange={e => setTypeForm({ ...typeForm, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Yearly Allowance (Days)</label>
          <input type="number" className="form-input" placeholder="15" value={typeForm.yearlyAllowance} onChange={e => setTypeForm({ ...typeForm, yearlyAllowance: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Payment Category</label>
          <select className="form-select" value={typeForm.isPaid ? 'Paid' : 'Unpaid'} onChange={e => setTypeForm({ ...typeForm, isPaid: e.target.value === 'Paid' })}>
            <option value="Paid">Paid Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>
      </FormDrawer>

      {/* Holiday Form Drawer */}
      <FormDrawer
        isOpen={isHolidayDrawerOpen}
        onClose={() => setIsHolidayDrawerOpen(false)}
        title={editingHoliday ? "Edit Holiday" : "New Holiday"}
        onSubmit={handleSaveHoliday}
        submitLabel={editingHoliday ? "Save Changes" : "Add Holiday"}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Holiday Name</label>
          <input className="form-input" placeholder="e.g. Republic Day" value={holForm.name} onChange={e => setHolForm({ ...holForm, name: e.target.value })} />
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Holiday Date</label>
          <DatePicker value={holForm.date} onChange={val => setHolForm({ ...holForm, date: val })} placeholder="DD/MM/YYYY" />
        </div>
      </FormDrawer>
    </div>
  );
}

// ============================================================================
// 5. PAYROLL & ADVANCES SCREEN (Periods Lock/Unlock, Advances CRUD, Payslips)
// ============================================================================
export function PayrollScreen({ defaultSubTab = 'periods', onSubTabChange } = {}) {
  const {
    payrollPeriods,
    advances,
    personnel,
    lockPayrollPeriod,
    unlockPayrollPeriod,
    addAdvance,
    updateAdvance,
    deleteAdvance
  } = useApp();

  const [internalTab, setInternalTab] = useState(defaultSubTab);
  const activeTab = defaultSubTab || internalTab;
  const setActiveTab = (newTab) => {
    setInternalTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };
  const [isAdvanceDrawerOpen, setIsAdvanceDrawerOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [viewPayslipPeriod, setViewPayslipPeriod] = useState(null);

  const [advForm, setAdvForm] = useState({
    personId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'Advance',
    reason: '',
    status: 'Approved'
  });

  const handleOpenAddAdvance = () => {
    setEditingAdvance(null);
    setAdvForm({
      personId: personnel[0]?.id || '',
      amount: 500,
      date: new Date().toISOString().slice(0, 10),
      type: 'Advance',
      reason: 'Medical expense',
      status: 'Approved'
    });
    setIsAdvanceDrawerOpen(true);
  };

  const handleOpenEditAdvance = (adv) => {
    setEditingAdvance(adv);
    setAdvForm({
      personId: adv.personId || adv.employeeId,
      amount: adv.amount,
      date: adv.date,
      type: adv.type || 'Advance',
      reason: adv.reason || '',
      status: adv.status || 'Approved'
    });
    setIsAdvanceDrawerOpen(true);
  };

  const handleSaveAdvance = (e) => {
    e?.preventDefault?.();
    if (editingAdvance) {
      updateAdvance(editingAdvance.id, advForm);
    } else {
      addAdvance(advForm);
    }
    setIsAdvanceDrawerOpen(false);
  };

  // Payroll Period Columns
  const periodCols = [
    { header: 'Period ID', accessor: 'id' },
    { header: 'Payroll Month', accessor: 'month' },
    { header: 'Gross Pay ($)', render: r => <span className="table-num">${r.totalGross?.toLocaleString() || 0}</span> },
    { header: 'Deductions ($)', render: r => <span className="table-num">${r.totalDeductions?.toLocaleString() || 0}</span> },
    { header: 'Net Pay ($)', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.totalNet?.toLocaleString() || 0}</span> },
    {
      header: 'Lock Status',
      render: r => r.isLocked || r.status === 'Locked' ? (
        <span className="badge badge-ruby" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Lock size={11} /> Locked
        </span>
      ) : (
        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Unlock size={11} /> Open
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'View Payslips', onClick: () => setViewPayslipPeriod(r) },
            r.isLocked || r.status === 'Locked'
              ? {
                  label: 'Unlock Period',
                  onClick: () => unlockPayrollPeriod(r.id)
                }
              : {
                  label: 'Lock Period',
                  danger: true,
                  confirm: `Lock payroll period ${r.month}? This prevents attendance updates for this month.`,
                  onClick: () => lockPayrollPeriod(r.id)
                }
          ]}
        />
      )
    }
  ];

  // Advances Columns
  const advanceCols = [
    { header: 'Code', accessor: 'id' },
    {
      header: 'Personnel',
      render: r => {
        const person = personnel.find(p => p.id === (r.personId || r.employeeId));
        return <span style={{ fontWeight: 600 }}>{r.personName || person?.name || r.personId}</span>;
      }
    },
    { header: 'Type', render: r => <span className="badge badge-soft">{r.type || 'Advance'}</span> },
    { header: 'Amount ($)', render: r => <span className="table-num" style={{ fontWeight: 700 }}>${r.amount}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Advance', onClick: () => handleOpenEditAdvance(r) },
            {
              label: 'Delete Advance',
              danger: true,
              confirm: `Delete advance record ${r.id}?`,
              onClick: () => deleteAdvance(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Page Header and Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {activeTab === 'periods' ? 'Payroll Periods' : 'Salary Advances & Deductions'}
          </h2>
        </div>

        <div>
          {activeTab === 'advances' && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddAdvance}>
              <Plus size={14} />
              <span>Record Advance</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'periods' && (
        <DataTable columns={periodCols} data={payrollPeriods} emptyMessage="No payroll periods." />
      )}

      {activeTab === 'advances' && (
        <DataTable columns={advanceCols} data={advances} emptyMessage="No advance records." />
      )}

      {/* Advance Drawer */}
      <FormDrawer
        isOpen={isAdvanceDrawerOpen}
        onClose={() => setIsAdvanceDrawerOpen(false)}
        title={editingAdvance ? "Edit Advance" : "New Advance / Deduction"}
        onSubmit={handleSaveAdvance}
        submitLabel={editingAdvance ? "Save Record" : "Save Advance"}
      >
        <div className="form-group col-span-2">
          <label className="form-label">Employee / Worker</label>
          <select className="form-select" value={advForm.personId} onChange={e => setAdvForm({ ...advForm, personId: e.target.value })}>
            {personnel.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code || p.id})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={advForm.type} onChange={e => setAdvForm({ ...advForm, type: e.target.value })}>
            <option value="Advance">Salary Advance</option>
            <option value="Deduction">Deduction / Penalty</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount ($)</label>
          <input type="number" className="form-input" placeholder="500" value={advForm.amount} onChange={e => setAdvForm({ ...advForm, amount: e.target.value })} />
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Date</label>
          <DatePicker value={advForm.date} onChange={val => setAdvForm({ ...advForm, date: val })} placeholder="DD/MM/YYYY" />
        </div>
        <div className="form-group col-span-2">
          <label className="form-label">Reason / Notes</label>
          <input className="form-input" placeholder="e.g. Advance for festival" value={advForm.reason} onChange={e => setAdvForm({ ...advForm, reason: e.target.value })} />
        </div>
      </FormDrawer>

      {/* Payslips Viewer Modal */}
      {viewPayslipPeriod && (
        <div className="drawer-backdrop" onClick={() => setViewPayslipPeriod(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '680px' }}>
            <div className="drawer-header">
              <div className="drawer-title">Generated Payslips: {viewPayslipPeriod.month}</div>
              <button className="iconbtn" onClick={() => setViewPayslipPeriod(null)}><X size={16} /></button>
            </div>
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--soft)', borderRadius: '6px', fontSize: '12px' }}>
                Total Net Payout: <strong>${viewPayslipPeriod.totalNet?.toLocaleString()}</strong> | Status: <strong>{viewPayslipPeriod.isLocked ? 'Locked & Disbursed' : 'Open Draft'}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {personnel.map(emp => {
                  const basic = emp.wageRate || 3200;
                  const otPay = 250;
                  const deduct = 120;
                  const net = basic + otPay - deduct;
                  return (
                    <div key={emp.id} style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '14px', background: 'var(--white)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '13px' }}>{emp.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>{emp.code || emp.id} • {emp.designation}</span>
                        </div>
                        <span className="badge badge-emerald">Ready</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                        <div>Basic: <strong className="table-num">${basic}</strong></div>
                        <div>OT: <strong className="table-num">+${otPay}</strong></div>
                        <div>Deductions: <strong className="table-num" style={{ color: 'var(--ruby-text)' }}>-${deduct}</strong></div>
                        <div>Net Pay: <strong className="table-num" style={{ color: 'var(--teal-900)', fontSize: '13px' }}>${net}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. HR MASTERS SCREEN (Departments, Designations, Shifts, Biometric Devices)
// ============================================================================
export function HRMastersScreen({ defaultSubTab = 'departments', onSubTabChange } = {}) {
  const {
    departments,
    designations,
    shifts,
    punchDevices,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    restoreDepartment,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    restoreDesignation,
    addShift,
    updateShift,
    deleteShift,
    addPunchDevice,
    updatePunchDevice,
    deletePunchDevice
  } = useApp();

  const [internalTab, setInternalTab] = useState(defaultSubTab);
  const activeTab = defaultSubTab || internalTab;
  const setActiveTab = (newTab) => {
    setInternalTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: '', headOfDept: '' });
  const [desForm, setDesForm] = useState({ title: '', department: '' });
  const [shiftForm, setShiftForm] = useState({ name: '', startTime: '08:00', endTime: '16:00', standardHours: 8, breakMins: 45 });
  const [devForm, setDevForm] = useState({
    name: '',
    location: '',
    ipAddress: '',
    serialNumber: '',
    deviceModel: 'ZK-FacePass Pro',
    authMode: 'Face Only',
    status: 'Online'
  });

  // Open Handlers
  const handleOpenCreate = () => {
    setEditItem(null);
    if (activeTab === 'departments') {
      setDeptForm({ name: '', headOfDept: '' });
    } else if (activeTab === 'designations') {
      setDesForm({ title: '', department: departments[0]?.name || '' });
    } else if (activeTab === 'shifts') {
      setShiftForm({ name: '', startTime: '06:00', endTime: '14:00', standardHours: 8, breakMins: 45 });
    } else {
      const nextNum = punchDevices.length + 1;
      setDevForm({
        name: '',
        location: 'Zone A - Main Gate',
        ipAddress: `192.168.1.${100 + nextNum}`,
        serialNumber: `SN-ZK-${202600 + nextNum}`,
        deviceModel: 'ZK-FacePass Pro',
        authMode: 'Face + Card',
        status: 'Online'
      });
    }
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    if (activeTab === 'departments') {
      setDeptForm({ name: item.name, headOfDept: item.headOfDept || '' });
    } else if (activeTab === 'designations') {
      setDesForm({ title: item.title, department: item.department || '' });
    } else if (activeTab === 'shifts') {
      setShiftForm({ ...item });
    } else {
      setDevForm({
        name: item.name || '',
        location: item.location || '',
        ipAddress: item.ipAddress || '192.168.1.105',
        serialNumber: item.serialNumber || 'SN-ZK-99182',
        deviceModel: item.deviceModel || 'ZK-FacePass Pro',
        authMode: item.authMode || 'Face Only',
        status: item.status || 'Online'
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (activeTab === 'departments') {
      if (editItem) updateDepartment(editItem.id, deptForm);
      else addDepartment(deptForm);
    } else if (activeTab === 'designations') {
      if (editItem) updateDesignation(editItem.id, desForm);
      else addDesignation(desForm);
    } else if (activeTab === 'shifts') {
      if (editItem) updateShift(editItem.id, shiftForm);
      else addShift(shiftForm);
    } else {
      if (editItem) updatePunchDevice(editItem.id, devForm);
      else addPunchDevice(devForm);
    }
    setIsDrawerOpen(false);
  };

  // 1. Departments Columns
  const deptColumns = [
    { header: 'Code', accessor: 'id' },
    { header: 'Department Name', accessor: 'name' },
    { header: 'Department Head', accessor: 'headOfDept' },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Department', onClick: () => handleOpenEdit(r) },
            r.status === 'Inactive' ? {
              label: 'Restore Department',
              onClick: () => restoreDepartment(r.id)
            } : {
              label: 'Delete Department',
              danger: true,
              confirm: `Archive / delete department "${r.name}"?`,
              onClick: () => deleteDepartment(r.id)
            }
          ]}
        />
      )
    }
  ];

  // 2. Designations Columns
  const desColumns = [
    { header: 'Code', accessor: 'id' },
    { header: 'Designation Title', accessor: 'title' },
    { header: 'Department', accessor: 'department' },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Designation', onClick: () => handleOpenEdit(r) },
            r.status === 'Inactive' ? {
              label: 'Restore Designation',
              onClick: () => restoreDesignation(r.id)
            } : {
              label: 'Delete Designation',
              danger: true,
              confirm: `Archive / delete designation "${r.title}"?`,
              onClick: () => deleteDesignation(r.id)
            }
          ]}
        />
      )
    }
  ];

  // 3. Shifts Columns
  const shiftColumns = [
    { header: 'Code', accessor: 'id' },
    { header: 'Shift Name', accessor: 'name' },
    { header: 'Timings', render: r => `${r.startTime} - ${r.endTime}` },
    { header: 'Standard Hours', render: r => `${r.standardHours}h` },
    { header: 'Break', render: r => `${r.breakMins || 45} mins` },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Shift', onClick: () => handleOpenEdit(r) },
            {
              label: 'Delete Shift',
              danger: true,
              confirm: `Delete shift schedule "${r.name}"?`,
              onClick: () => deleteShift(r.id)
            }
          ]}
        />
      )
    }
  ];

  // 4. Biometric Devices Columns
  const devColumns = [
    {
      header: 'Device Code',
      accessor: 'id',
      render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.code || r.id}</span>
    },
    {
      header: 'Device Name',
      render: r => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Model: {r.deviceModel || 'ZK-FacePass Pro'} • SN: {r.serialNumber || 'SN-901'}</div>
        </div>
      )
    },
    { header: 'Location / Zone', accessor: 'location' },
    { header: 'IP Address', render: r => <span className="table-num">{r.ipAddress || '192.168.1.100'}</span> },
    { header: 'Auth Mode', render: r => <span className="badge badge-soft">{r.authMode || 'Face + Card'}</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status || 'Online'} /> },
    { header: 'Last Heartbeat', accessor: 'lastSync' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Edit Device', onClick: () => handleOpenEdit(r) },
            {
              label: 'Delete Device',
              danger: true,
              confirm: `Delete biometric device "${r.name}" (${r.code || r.id})? Unregistered kiosks will no longer push punches.`,
              onClick: () => deletePunchDevice(r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Page Header and Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
            {activeTab === 'departments' ? 'Departments' : activeTab === 'designations' ? 'Designations' : activeTab === 'shifts' ? 'Shift Schedules' : 'Biometric Kiosks'}
          </h2>
        </div>

        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
            <Plus size={14} />
            <span>Add {activeTab === 'departments' ? 'Department' : activeTab === 'designations' ? 'Designation' : activeTab === 'shifts' ? 'Shift' : 'Device'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'departments' && <DataTable columns={deptColumns} data={departments} emptyMessage="No departments." />}
      {activeTab === 'designations' && <DataTable columns={desColumns} data={designations} emptyMessage="No designations." />}
      {activeTab === 'shifts' && <DataTable columns={shiftColumns} data={shifts} emptyMessage="No shift schedules." />}
      {activeTab === 'devices' && <DataTable columns={devColumns} data={punchDevices} emptyMessage="No biometric kiosks." />}

      {/* Unified Master Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editItem ? `Edit Master Record` : `New Master Record`}
        onSubmit={handleSave}
        submitLabel={editItem ? "Save Changes" : "Create Master"}
      >
        {activeTab === 'departments' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Department Name</label>
              <input className="form-input" placeholder="e.g. Polishing Line 02" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Head of Department</label>
              <input className="form-input" placeholder="Enter HOD name" value={deptForm.headOfDept} onChange={e => setDeptForm({ ...deptForm, headOfDept: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'designations' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Designation Title</label>
              <input className="form-input" placeholder="e.g. Master Saw Operator" value={desForm.title} onChange={e => setDesForm({ ...desForm, title: e.target.value })} />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Department</label>
              <select className="form-select" value={desForm.department} onChange={e => setDesForm({ ...desForm, department: e.target.value })}>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </>
        )}

        {activeTab === 'shifts' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Shift Name</label>
              <input className="form-input" placeholder="e.g. General Day Shift" value={shiftForm.name} onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={shiftForm.startTime} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={shiftForm.endTime} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Standard Hours</label>
              <input type="number" className="form-input" value={shiftForm.standardHours} onChange={e => setShiftForm({ ...shiftForm, standardHours: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Break (Mins)</label>
              <input type="number" className="form-input" value={shiftForm.breakMins} onChange={e => setShiftForm({ ...shiftForm, breakMins: e.target.value })} />
            </div>
          </>
        )}

        {activeTab === 'devices' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Device Name / Kiosk Tag</label>
              <input
                className="form-input"
                placeholder="e.g. Weighbridge Face Station 01"
                value={devForm.name}
                onChange={e => setDevForm({ ...devForm, name: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Physical Location / Zone</label>
              <input
                className="form-input"
                placeholder="e.g. Zone A - South Gate"
                value={devForm.location}
                onChange={e => setDevForm({ ...devForm, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IP Address</label>
              <input
                className="form-input"
                placeholder="e.g. 192.168.1.105"
                value={devForm.ipAddress}
                onChange={e => setDevForm({ ...devForm, ipAddress: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                className="form-input"
                placeholder="e.g. SN-ZK-202601"
                value={devForm.serialNumber}
                onChange={e => setDevForm({ ...devForm, serialNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hardware Device Model</label>
              <input
                className="form-input"
                placeholder="e.g. ZK-FacePass Pro"
                value={devForm.deviceModel}
                onChange={e => setDevForm({ ...devForm, deviceModel: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Authentication Mode</label>
              <select
                className="form-select"
                value={devForm.authMode}
                onChange={e => setDevForm({ ...devForm, authMode: e.target.value })}
              >
                <option value="Face Only">Face Only</option>
                <option value="Face + Card">Face + Card</option>
                <option value="Face + PIN">Face + PIN</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Device Status</label>
              <select
                className="form-select"
                value={devForm.status}
                onChange={e => setDevForm({ ...devForm, status: e.target.value })}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </>
        )}
      </FormDrawer>
    </div>
  );
}

// ============================================================================
// 7. HR AUDIT & REPORTS SCREEN (Read-Only Audit Log, Summary Metrics)
// ============================================================================
export function HRAuditReportsScreen() {
  const { auditLogs, personnel, attendance, leaveRequests, payrollPeriods } = useApp();

  // Filter HR specific audit logs
  const hrLogs = useMemo(() => {
    return auditLogs.filter(l =>
      l.action?.includes('EMPLOYEE') ||
      l.action?.includes('CONTRACTOR') ||
      l.action?.includes('WORKER') ||
      l.action?.includes('ATTENDANCE') ||
      l.action?.includes('PUNCH') ||
      l.action?.includes('LEAVE') ||
      l.action?.includes('ROSTER') ||
      l.action?.includes('PAYROLL') ||
      l.action?.includes('ADVANCE') ||
      l.action?.includes('DEPARTMENT') ||
      l.action?.includes('SHIFT')
    );
  }, [auditLogs]);

  const auditColumns = [
    { header: 'Timestamp', accessor: 'timestamp' },
    { header: 'Action', render: r => <span className="badge badge-teal">{r.action}</span> },
    { header: 'Target ID', accessor: 'targetId' },
    { header: 'User', accessor: 'user' },
    { header: 'Details', accessor: 'details' }
  ];

  return (
    <div className="page-wrapper">
      {/* Metric Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Active Personnel</span>
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{personnel.filter(p => p.status === 'Active').length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending Leave Requests</span>
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{leaveRequests.filter(l => l.status === 'Pending').length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Today's Attendance</span>
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✅</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{attendance.filter(a => a.status === 'Present').length} Present</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Current Payroll Status</span>
            <span className="stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💼</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: payrollPeriods[0]?.isLocked ? 'var(--ruby-text)' : 'var(--teal-900)' }}>
            {payrollPeriods[0]?.month}: {payrollPeriods[0]?.isLocked ? 'Locked' : 'Open Draft'}
          </div>
        </div>
      </div>

      <div className="page-header">
        <h2 style={{ fontSize: '15px', fontWeight: 700 }}>HR Audit Trail (Read-Only Activity Log)</h2>
      </div>

      <DataTable columns={auditColumns} data={hrLogs.length > 0 ? hrLogs : auditLogs} emptyMessage="No HR audit logs found." />
    </div>
  );
}

// Backwards compatibility alias export
export const OvertimeScreen = PayrollScreen;
