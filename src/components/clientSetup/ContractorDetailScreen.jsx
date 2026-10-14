import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  HardHat,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  FileText,
  Clock,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  Eye,
  EyeOff,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DataTable } from '../CommonComponents';

export function ContractorDetailScreen({ contractorId, onBack, onEdit, onDelete, onRestore }) {
  const {
    contractors,
    personnel,
    attendance,
    overtimeApprovals,
    contractorPayments,
    auditLogs,
    addContractorWorker,
    updateContractorWorker,
    deleteContractorWorker,
    restoreContractorWorker,
    addContractorContact,
    updateContractorContact,
    deleteContractorContact,
    addContractorDocument,
    updateContractorDocument,
    deleteContractorDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'workers' | 'contacts' | 'documents' | 'activity' | 'linked'
  const [showBankAcc, setShowBankAcc] = useState(false);

  // Sub-modal states
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    role: 'Gang Saw Operator',
    phone: '',
    aadhaar: '',
    skillLevel: 'Skilled',
    wageRate: 650,
    status: 'Active'
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', designation: '', phone: '', email: '', isPrimary: false });

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docForm, setDocForm] = useState({ name: '', type: 'Labour Licence', number: '', issueDate: '', expiryDate: '', fileUrl: '' });

  const contractor = contractors.find(c => c.id === contractorId || c.code === contractorId);

  if (!contractor) {
    return (
      <div className="table-card" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Contractor not found or removed.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginTop: '10px' }}>
          Back to Contractors
        </button>
      </div>
    );
  }

  // Linked workers from shared personnel store
  const linkedWorkers = personnel.filter(p =>
    (p.contractorId === contractor.id || p.contractorName === contractor.companyName) &&
    p.type === 'Contractor Worker'
  );

  const linkedWorkerIds = new Set(linkedWorkers.map(w => w.id));

  // Linked transactions & activity
  const linkedAttendance = attendance.filter(a => linkedWorkerIds.has(a.personnelId));
  const linkedOvertime = overtimeApprovals.filter(ot => linkedWorkerIds.has(ot.personnelId));
  const linkedPayments = contractorPayments.filter(cp => cp.contractorId === contractor.id || cp.contractorName === contractor.companyName);
  const linkedLogs = auditLogs.filter(a => a.entityId === contractor.id || a.entityId === contractor.code || a.details?.includes(contractor.companyName));

  const totalPaid = linkedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Worker Modal Handlers
  const handleOpenAddWorker = () => {
    setEditingWorker(null);
    setWorkerForm({
      name: '',
      role: contractor.serviceType ? `${contractor.serviceType} Specialist` : 'General Labour',
      phone: '',
      aadhaar: '',
      skillLevel: 'Skilled',
      wageRate: Number(contractor.ratePerUnit) || 650,
      status: 'Active'
    });
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorker = (w) => {
    setEditingWorker(w);
    setWorkerForm({
      name: w.name || '',
      role: w.role || w.designation || 'Labour',
      phone: w.phone || '',
      aadhaar: w.aadhaar || '',
      skillLevel: w.skillLevel || 'Skilled',
      wageRate: w.wageRate || w.dailyRate || 650,
      status: w.status || 'Active'
    });
    setIsWorkerModalOpen(true);
  };

  const handleSaveWorker = (e) => {
    e.preventDefault();
    if (!workerForm.name.trim()) return;

    if (editingWorker) {
      updateContractorWorker(editingWorker.id, {
        ...workerForm,
        contractorId: contractor.id,
        contractorName: contractor.companyName
      });
    } else {
      addContractorWorker({
        ...workerForm,
        contractorId: contractor.id,
        contractorName: contractor.companyName
      });
    }
    setIsWorkerModalOpen(false);
  };

  // Contact Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', designation: '', phone: '', email: '', isPrimary: false });
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c) => {
    setEditingContact(c);
    setContactForm({ ...c });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    if (editingContact) {
      updateContractorContact(contractor.id, editingContact.id, contactForm);
    } else {
      addContractorContact(contractor.id, contactForm);
    }
    setIsContactModalOpen(false);
  };

  // Document Handlers
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocForm({ name: '', type: 'Labour Licence', number: '', issueDate: '', expiryDate: '', fileUrl: '' });
    setIsDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc);
    setDocForm({ ...doc });
    setIsDocModalOpen(true);
  };

  const handleSaveDoc = (e) => {
    e.preventDefault();
    if (!docForm.name.trim()) return;
    if (editingDoc) {
      updateContractorDocument(contractor.id, editingDoc.id, docForm);
    } else {
      addContractorDocument(contractor.id, docForm);
    }
    setIsDocModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onBack}
              style={{ marginBottom: '8px', paddingLeft: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted)' }}
            >
              <ArrowLeft size={14} /> Back to Contractors
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {contractor.companyName}
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-color)', fontFamily: 'monospace', backgroundColor: 'var(--brand-surface, #EEF2F6)', padding: '2px 8px', borderRadius: '4px' }}>
                {contractor.code || contractor.id}
              </span>
              <span className="badge badge-subtle">{contractor.serviceType || 'Contractor'}</span>
              {contractor.status === 'Inactive' ? (
                <span className="badge badge-neutral">Inactive</span>
              ) : (
                <span className="badge badge-success">Active</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              {contractor.contactPerson && (
                <span><strong>Supervisor:</strong> {contractor.contactPerson}</span>
              )}
              {contractor.phone && (
                <span><strong>Phone:</strong> {contractor.phone}</span>
              )}
              {contractor.city && (
                <span><strong>Location:</strong> {contractor.city}, {contractor.state}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddWorker}
            >
              <Plus size={14} />
              <span>Add Worker</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(contractor)}
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </button>

            {contractor.status === 'Inactive' ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onRestore(contractor.id)}
              >
                <RotateCcw size={14} />
                <span>Restore Active</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => onDelete(contractor.id)}
              >
                <Trash2 size={14} />
                <span>Archive</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Agreed Compensation</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              ₹{contractor.ratePerUnit || 0} / {contractor.billingBasis || 'Per Day'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Cycle: {contractor.paymentCycle || 'Weekly'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Workers</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--teal-700)' }}>
              {linkedWorkers.filter(w => w.status === 'Active').length} Deployed
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Total {linkedWorkers.length} enrolled</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Attendance Logged</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              {linkedAttendance.length} Records
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Biometric punch verified</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Disbursed</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{linkedPayments.length} Payments recorded</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Suppliers & Buyers have Linked; Contractors have Workers tab) */}
      <div style={{ borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px' }}>
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'workers', label: `Workers (${linkedWorkers.length})` },
          { key: 'contacts', label: `Contacts (${(contractor.contacts || []).length})` },
          { key: 'documents', label: `Documents (${(contractor.documents || []).length})` },
          { key: 'activity', label: 'Activity' },
          { key: 'linked', label: `Linked (${linkedPayments.length + linkedAttendance.length})` }
        ].map(t => (
          <button
            key={t.key}
            type="button"
            className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(t.key)}
            style={{ fontWeight: activeTab === t.key ? 700 : 500 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Card: Agency Info */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Contractor Identity & Trade
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Code:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{contractor.code || contractor.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Trade / Service:</span>
                <span style={{ fontWeight: 600 }}>{contractor.serviceType || 'Labour Agency'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Contact Lead:</span>
                <span style={{ fontWeight: 600 }}>{contractor.contactPerson || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Phone:</span>
                <span style={{ fontWeight: 600 }}>{contractor.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Email:</span>
                <span style={{ fontWeight: 600 }}>{contractor.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>GSTIN:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{contractor.gst || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>PAN:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{contractor.pan || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card: Contract Terms */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Contract Terms & Compensation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Billing Basis:</span>
                <span style={{ fontWeight: 600 }}>{contractor.billingBasis || 'Per Day'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Agreed Rate:</span>
                <span style={{ fontWeight: 600 }}>₹{contractor.ratePerUnit || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Disbursal Cycle:</span>
                <span style={{ fontWeight: 600 }}>{contractor.paymentCycle || 'Weekly'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Contract Start Date:</span>
                <span style={{ fontWeight: 600 }}>{contractor.contractStartDate || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Contract End Date:</span>
                <span style={{ fontWeight: 600 }}>{contractor.contractEndDate || 'Continuous'}</span>
              </div>
            </div>
          </div>

          {/* Card: Bank Details */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Bank Disbursal Details</div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowBankAcc(!showBankAcc)}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {showBankAcc ? <><EyeOff size={12} /> Hide Mask</> : <><Eye size={12} /> Reveal</>}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Account Holder:</span>
                <span style={{ fontWeight: 600 }}>{contractor.bankHolder || contractor.companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Bank Name:</span>
                <span style={{ fontWeight: 600 }}>{contractor.bankName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Account Number:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {contractor.bankAccount ? (showBankAcc ? contractor.bankAccount : '•••• •••• ' + contractor.bankAccount.slice(-4)) : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>IFSC Code:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{contractor.bankIfsc || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Branch:</span>
                <span style={{ fontWeight: 600 }}>{contractor.bankBranch || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKERS (Synchronized with HR shared personnel store) */}
      {activeTab === 'workers' && (
        <div className="table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                Contractor Workforce ({linkedWorkers.length})
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>
                Directly enrolled into Biometric punch & Attendance systems
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddWorker}
            >
              <Plus size={14} />
              <span>Add Worker</span>
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Worker Code',
                accessor: (w) => (
                  <span style={{ fontWeight: 700, color: 'var(--brand-color)', fontFamily: 'monospace' }}>
                    {w.code || w.id}
                  </span>
                )
              },
              {
                header: 'Worker Name',
                accessor: (w) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{w.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {w.role || w.designation || 'Labour'} • {w.skillLevel || 'Skilled'}
                    </div>
                  </div>
                )
              },
              { header: 'Mobile Phone', accessor: 'phone' },
              {
                header: 'Aadhaar / ID',
                accessor: (w) => (
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {w.aadhaar ? `•••• •••• ${w.aadhaar.slice(-4)}` : 'ID Not Given'}
                  </span>
                )
              },
              {
                header: 'Daily Wage Rate',
                accessor: (w) => (
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    ₹{w.wageRate || w.dailyRate || 650}/day
                  </span>
                )
              },
              {
                header: 'Status',
                accessor: (w) => (
                  w.status === 'Inactive' ? (
                    <span className="badge badge-neutral">Inactive</span>
                  ) : (
                    <span className="badge badge-success">Active</span>
                  )
                )
              },
              {
                header: 'Actions',
                accessor: (w) => (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenEditWorker(w)}
                      title="Edit Worker"
                    >
                      <Edit size={13} />
                    </button>
                    {w.status === 'Inactive' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-success"
                        onClick={() => restoreContractorWorker(w.id)}
                        title="Restore Worker"
                      >
                        <RotateCcw size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => deleteContractorWorker(w.id)}
                        title="Archive Worker"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ),
                style: { textAlign: 'right' }
              }
            ]}
            data={linkedWorkers}
            emptyMessage="No workers registered under this contractor yet."
          />
        </div>
      )}

      {/* TAB 3: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Agency Site Supervisors & Leads</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddContact}
            >
              <Plus size={14} />
              <span>Add Contact</span>
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Supervisor Name',
                accessor: (c) => (
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                    {c.isPrimary && (
                      <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '10px' }}>
                        Primary
                      </span>
                    )}
                  </div>
                )
              },
              { header: 'Role / Designation', accessor: 'designation' },
              { header: 'Phone', accessor: 'phone' },
              { header: 'Email', accessor: 'email' },
              {
                header: 'Actions',
                accessor: (c) => (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenEditContact(c)}
                      title="Edit Contact"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => deleteContractorContact(contractor.id, c.id)}
                      title="Remove Contact"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
                style: { textAlign: 'right' }
              }
            ]}
            data={contractor.contacts || []}
            emptyMessage="No supervisors recorded for this contractor."
          />
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Agency Compliance & Licences</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddDoc}
            >
              <Plus size={14} />
              <span>Upload Document</span>
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Document Name',
                accessor: (d) => (
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{d.name}</span>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Type: {d.type}</div>
                  </div>
                )
              },
              { header: 'Licence / Reg #', accessor: 'number' },
              { header: 'Issue Date', accessor: 'issueDate' },
              { header: 'Expiry Date', accessor: (d) => d.expiryDate || 'Continuous' },
              {
                header: 'Actions',
                accessor: (d) => (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenEditDoc(d)}
                      title="Edit Document"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => deleteContractorDocument(contractor.id, d.id)}
                      title="Remove Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
                style: { textAlign: 'right' }
              }
            ]}
            data={contractor.documents || []}
            emptyMessage="No documents uploaded for this contractor."
          />
        </div>
      )}

      {/* TAB 5: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="table-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
            Audit Trail for {contractor.companyName}
          </div>
          {linkedLogs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No audit logs recorded for this contractor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {linkedLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', borderLeft: '3px solid var(--brand-color)', backgroundColor: 'var(--surface-sunken)', borderRadius: '4px' }}>
                  <Clock size={16} color="var(--muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{log.details || log.action}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      By {log.user || 'Admin'} • {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: LINKED TRANSACTIONS */}
      {activeTab === 'linked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Disbursals */}
          <div className="table-card">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
              Contractor Billing Disbursals ({linkedPayments.length})
            </div>
            <DataTable
              columns={[
                { header: 'Payment Ref', accessor: 'id' },
                { header: 'Period', accessor: 'period' },
                { header: 'Amount (₹)', accessor: (p) => (Number(p.amount) || 0).toLocaleString('en-IN') },
                { header: 'Date', accessor: 'date' },
                { header: 'Mode', accessor: 'mode' }
              ]}
              data={linkedPayments}
              emptyMessage="No payments disbursed to this contractor yet."
            />
          </div>

          {/* Attendance of Linked Workers */}
          <div className="table-card">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
              Recent Workforce Attendance ({linkedAttendance.length})
            </div>
            <DataTable
              columns={[
                { header: 'Worker Code', accessor: 'personnelCode' },
                { header: 'Worker Name', accessor: 'personnelName' },
                { header: 'Date', accessor: 'date' },
                { header: 'Status', accessor: 'status' },
                { header: 'Work Hours', accessor: 'workHours' }
              ]}
              data={linkedAttendance.slice(0, 15)}
              emptyMessage="No attendance logs found for linked workers."
            />
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT WORKER */}
      {isWorkerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>
              {editingWorker ? 'Edit Contractor Worker' : `Register Worker for ${contractor.companyName}`}
            </h3>
            <form onSubmit={handleSaveWorker} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Worker Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  placeholder="e.g. Mukesh Gurjar"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Role / Trade</label>
                  <input
                    type="text"
                    className="form-control"
                    value={workerForm.role}
                    onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                    placeholder="e.g. Gang Saw Operator"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Skill Level</label>
                  <select
                    className="form-control"
                    value={workerForm.skillLevel}
                    onChange={(e) => setWorkerForm({ ...workerForm, skillLevel: e.target.value })}
                  >
                    <option value="Unskilled">Unskilled</option>
                    <option value="Semi-Skilled">Semi-Skilled</option>
                    <option value="Skilled">Skilled</option>
                    <option value="Highly Skilled">Highly Skilled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Mobile Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    placeholder="+91 98290 55443"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Aadhaar Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={workerForm.aadhaar}
                    onChange={(e) => setWorkerForm({ ...workerForm, aadhaar: e.target.value })}
                    placeholder="12-digit UID"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Daily Wage Rate (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={workerForm.wageRate}
                    onChange={(e) => setWorkerForm({ ...workerForm, wageRate: e.target.value })}
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Status</label>
                  <select
                    className="form-control"
                    value={workerForm.status}
                    onChange={(e) => setWorkerForm({ ...workerForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsWorkerModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SUPERVISOR CONTACT */}
      {isContactModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>
              {editingContact ? 'Edit Contractor Supervisor' : 'Add Contractor Supervisor'}
            </h3>
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Rameshwar Gurjar"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Role / Designation</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  placeholder="e.g. Site Supervisor"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                />
                <span>Set as Key / Primary Contact for this Agency</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsContactModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT DOCUMENT */}
      {isDocModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>
              {editingDoc ? 'Edit Document' : 'Upload Contractor Document'}
            </h3>
            <form onSubmit={handleSaveDoc} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Document Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  placeholder="e.g. Labour Welfare Licence"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Doc Category</label>
                  <select
                    className="form-control"
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                  >
                    <option value="Labour Licence">Labour Licence</option>
                    <option value="Agreement">Contractor Agreement</option>
                    <option value="Insurance">Workmen Insurance</option>
                    <option value="Cancelled Cheque">Cancelled Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Licence / ID #</label>
                  <input
                    type="text"
                    className="form-control"
                    value={docForm.number}
                    onChange={(e) => setDocForm({ ...docForm, number: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Issue Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={docForm.issueDate}
                    onChange={(e) => setDocForm({ ...docForm, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={docForm.expiryDate}
                    onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsDocModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
