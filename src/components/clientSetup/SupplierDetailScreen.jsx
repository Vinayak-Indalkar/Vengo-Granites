import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  Layers,
  Clock,
  ShieldCheck,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  FileText,
  Users,
  Activity,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import { StatusBadge, DataTable } from '../CommonComponents';

export function SupplierDetailScreen({
  supplierId,
  onBack,
  onEdit,
  onDelete,
  onRestore
}) {
  const {
    suppliers,
    purchaseOrders,
    gateEntries,
    detailedRawBlocks,
    supplierBills,
    supplierPayments,
    auditLogs,
    currentRole,
    addSupplierContact,
    updateSupplierContact,
    deleteSupplierContact,
    addSupplierDocument,
    updateSupplierDocument,
    deleteSupplierDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [revealBank, setRevealBank] = useState(false);
  const [revealPan, setRevealPan] = useState(false);

  // Sub-modal state for Contacts
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', designation: '', phone: '', email: '', isPrimary: false });

  // Sub-modal state for Documents
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docForm, setDocForm] = useState({ type: 'Licence', name: '', docNo: '', issueDate: '', expiryDate: '', fileUrl: '' });

  // Locate supplier
  const supplier = useMemo(() => {
    return suppliers.find(s => s.id === supplierId || s.code === supplierId);
  }, [suppliers, supplierId]);

  if (!supplier) {
    return (
      <div className="table-card" style={{ padding: '40px', textAlign: 'center' }}>
        <AlertTriangle size={32} color="var(--amber-text)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>Supplier Record Not Found</h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>The requested supplier record could not be loaded.</p>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Suppliers List</span>
        </button>
      </div>
    );
  }

  const isInactive = supplier.status === 'Inactive' || supplier.isArchived;
  const canManageBank = currentRole === 'Supplier/Client Admin' || currentRole === 'QT Super Admin';

  // Linked records
  const linkedPOs = useMemo(() => {
    return purchaseOrders.filter(po => po.supplierId === supplier.id || po.supplier === supplier.name || (supplier.legacyId && po.supplierId === supplier.legacyId));
  }, [purchaseOrders, supplier]);

  const linkedGateEntries = useMemo(() => {
    return gateEntries.filter(g => g.supplier === supplier.name);
  }, [gateEntries, supplier]);

  const linkedRawBlocks = useMemo(() => {
    return detailedRawBlocks.filter(b => b.supplier === supplier.name);
  }, [detailedRawBlocks, supplier]);

  const linkedBills = useMemo(() => {
    return supplierBills.filter(b => b.supplierId === supplier.id || b.supplier === supplier.name || (supplier.legacyId && b.supplierId === supplier.legacyId));
  }, [supplierBills, supplier]);

  const linkedPayments = useMemo(() => {
    return supplierPayments.filter(p => p.supplier === supplier.name || p.supplierName === supplier.name);
  }, [supplierPayments, supplier]);

  const linkedActivity = useMemo(() => {
    return auditLogs.filter(a => a.entity === supplier.id || (a.details && a.details.includes(supplier.name)));
  }, [auditLogs, supplier]);

  // Contact Handlers
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', designation: '', phone: '', email: '', isPrimary: (supplier.contacts || []).length === 0 });
    setIsContactModalOpen(true);
  };

  const handleOpenEditContact = (c) => {
    setEditingContact(c);
    setContactForm({ name: c.name, designation: c.designation || '', phone: c.phone || '', email: c.email || '', isPrimary: Boolean(c.isPrimary) });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim()) return;
    if (editingContact) {
      updateSupplierContact(supplier.id, editingContact.id, contactForm);
    } else {
      addSupplierContact(supplier.id, contactForm);
    }
    setIsContactModalOpen(false);
  };

  // Document Handlers
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocForm({ type: 'Licence', name: '', docNo: '', issueDate: '', expiryDate: '', fileUrl: '' });
    setIsDocModalOpen(true);
  };

  const handleOpenEditDoc = (d) => {
    setEditingDoc(d);
    setDocForm({ type: d.type || 'Licence', name: d.name || '', docNo: d.docNo || '', issueDate: d.issueDate || '', expiryDate: d.expiryDate || '', fileUrl: d.fileUrl || '' });
    setIsDocModalOpen(true);
  };

  const handleSaveDoc = (e) => {
    e.preventDefault();
    if (!docForm.name.trim()) return;
    if (editingDoc) {
      updateSupplierDocument(supplier.id, editingDoc.id, docForm);
    } else {
      addSupplierDocument(supplier.id, docForm);
    }
    setIsDocModalOpen(false);
  };

  const formatMasked = (str, visibleEnd = 4) => {
    if (!str) return '—';
    if (str.length <= visibleEnd) return str;
    const maskedPart = '•'.repeat(Math.max(4, str.length - visibleEnd));
    return `${maskedPart}${str.slice(-visibleEnd)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Card */}
      <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onBack}
              title="Return to Supplier Directory"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--teal-200)',
              fontWeight: 700,
              fontSize: '18px'
            }}>
              {supplier.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                  {supplier.name}
                </h2>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--surface-sunken)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  color: 'var(--muted)'
                }}>
                  {supplier.code || supplier.id}
                </span>
                <span className="badge badge-cobalt">{supplier.type || 'Quarry'}</span>
                <StatusBadge status={supplier.status || 'Active'} />
                <span className="badge badge-emerald">Rating {supplier.rating || 'A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)', marginTop: '6px', flexWrap: 'wrap' }}>
                <span><MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />{supplier.city ? `${supplier.city}, ${supplier.country}` : supplier.country || 'Global'}</span>
                <span><Phone size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />{supplier.phone || supplier.contact || 'No phone'}</span>
                <span><Mail size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />{supplier.email || 'No email'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(supplier)}
            >
              <Edit size={14} />
              <span>Edit Profile</span>
            </button>
            {isInactive ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onRestore(supplier.id)}
              >
                <RotateCcw size={14} />
                <span>Restore Supplier</span>
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onDelete(supplier.id)}
                style={{ color: 'var(--ruby-text)' }}
              >
                <Trash2 size={14} />
                <span>Archive</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--line)'
        }}>
          <div style={{ padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quality Score</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--emerald-text)', marginTop: '2px' }}>
              {supplier.qualityScore || 95}% <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>Pass Rate</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Delivery Timeliness</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--teal-600)', marginTop: '2px' }}>
              {supplier.deliveryScore || 92}% <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>On-Time</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Commercial Terms</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
              {supplier.paymentDays || 30} Days <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>Net Period</span>
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--surface-sunken)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active POs / Blocks</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', marginTop: '2px' }}>
              {linkedPOs.length} POs • {linkedRawBlocks.length} Blocks
            </div>
          </div>
        </div>

        {/* Secondary Sub-Tabs: Profile, Contacts, Documents, Activity, Linked */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', marginTop: '4px' }}>
          {[
            { key: 'profile', label: 'Profile', icon: Building2 },
            { key: 'contacts', label: `Contacts (${(supplier.contacts || []).length})`, icon: Users },
            { key: 'documents', label: `Documents (${(supplier.documents || []).length})`, icon: FileText },
            { key: 'activity', label: `Activity (${linkedActivity.length})`, icon: Activity },
            { key: 'linked', label: `Linked (${linkedPOs.length + linkedRawBlocks.length + linkedBills.length})`, icon: Link2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  borderRadius: '6px 6px 0 0',
                  borderBottom: isActive ? '2px solid var(--brand-color)' : 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Card 1: Legal & Company Info */}
          <div className="table-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="var(--teal-600)" />
              <span>Company & Tax Registrations</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>Legal Name:</span>
              <strong style={{ color: 'var(--ink)' }}>{supplier.name}</strong>

              <span style={{ color: 'var(--muted)' }}>Supplier Type:</span>
              <span><span className="badge badge-cobalt">{supplier.type || 'Quarry'}</span></span>

              <span style={{ color: 'var(--muted)' }}>Tax ID / GSTIN:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{supplier.taxId || '—'}</strong>

              <div style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>PAN Number:</span>
                {canManageBank && (
                  <button type="button" onClick={() => setRevealPan(!revealPan)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    {revealPan ? <EyeOff size={11} color="var(--muted)" /> : <Eye size={11} color="var(--muted)" />}
                  </button>
                )}
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {revealPan || !canManageBank ? (supplier.pan || '—') : formatMasked(supplier.pan, 4)}
              </strong>

              <span style={{ color: 'var(--muted)' }}>Website:</span>
              <span>
                {supplier.website ? (
                  <a href={supplier.website} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-color)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} /> {supplier.website}
                  </a>
                ) : '—'}
              </span>

              <span style={{ color: 'var(--muted)' }}>Full Address:</span>
              <span>{supplier.address ? `${supplier.address}, ${supplier.city || ''}, ${supplier.state || ''} ${supplier.pincode || ''}, ${supplier.country}` : '—'}</span>
            </div>
          </div>

          {/* Card 2: Quarry & Mine Details */}
          <div className="table-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--teal-600)" />
              <span>Quarry & Extraction Concession</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>Quarry / Mine Name:</span>
              <strong style={{ color: 'var(--ink)' }}>{supplier.quarryName || `${supplier.name} Pit`}</strong>

              <span style={{ color: 'var(--muted)' }}>Geological Zone:</span>
              <span>{supplier.quarryLocation || `${supplier.city || ''}, ${supplier.country}`}</span>

              <span style={{ color: 'var(--muted)' }}>Mining Lease No:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{supplier.miningLeaseNo || 'ML-REG-VALID'}</strong>

              <span style={{ color: 'var(--muted)' }}>Lease Validity:</span>
              <span>{supplier.leaseValidity || '2032-12-31'}</span>

              <span style={{ color: 'var(--muted)' }}>Stone Materials:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(supplier.stoneTypesSupplied && supplier.stoneTypesSupplied.length > 0) ? (
                  supplier.stoneTypesSupplied.map((st, i) => (
                    <span key={i} className="badge badge-soft" style={{ fontSize: '11px' }}>{st}</span>
                  ))
                ) : (
                  <span className="badge badge-soft">{supplier.materialType || 'Natural Stone'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Bank & Settlement */}
          <div className="table-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} color="var(--teal-600)" />
                <span>Bank & Remittance Details</span>
              </div>
              {canManageBank && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setRevealBank(!revealBank)}
                  style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}
                >
                  {revealBank ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{revealBank ? 'Mask Details' : 'Reveal Details'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>Beneficiary Name:</span>
              <strong style={{ color: 'var(--ink)' }}>{supplier.accountHolder || supplier.name}</strong>

              <span style={{ color: 'var(--muted)' }}>Bank Name:</span>
              <span>{supplier.bankName || 'Standard Chartered Bank'}</span>

              <span style={{ color: 'var(--muted)' }}>Account Number:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {revealBank || !canManageBank ? (supplier.accountNumber || '—') : formatMasked(supplier.accountNumber, 4)}
              </strong>

              <span style={{ color: 'var(--muted)' }}>IFSC / SWIFT Code:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{supplier.ifscSwift || 'SCBL000291'}</strong>

              <span style={{ color: 'var(--muted)' }}>Branch Location:</span>
              <span>{supplier.branch || `${supplier.city || 'Main'} Branch`}</span>
            </div>
          </div>

          {/* Card 4: Commercial Terms & Ratings */}
          <div className="table-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--teal-600)" />
              <span>Commercial Terms & Tolerances</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: 'var(--muted)' }}>Payment Days:</span>
              <strong>{supplier.paymentDays || 30} Days (Net)</strong>

              <span style={{ color: 'var(--muted)' }}>Credit Period:</span>
              <strong>{supplier.creditDays || 45} Days</strong>

              <span style={{ color: 'var(--muted)' }}>Currency:</span>
              <span><span className="badge badge-emerald">{supplier.currency || 'INR'}</span></span>

              <span style={{ color: 'var(--muted)' }}>Delivery Terms:</span>
              <span>{supplier.deliveryTerms || 'Ex-Quarry Gate'}</span>

              <span style={{ color: 'var(--muted)' }}>Weight Tolerance:</span>
              <strong style={{ color: 'var(--teal-600)' }}>± {supplier.weightTolerance || 2.0}% allowed</strong>

              <span style={{ color: 'var(--muted)' }}>Quality Grade:</span>
              <span><span className="badge badge-emerald">{supplier.rating || 'A'} (Grade Certified)</span></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Supplier Key Contacts</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Authorized coordinators, quarry managers, and dispatch leads</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddContact}>
              <Plus size={14} />
              <span>Add Contact</span>
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Name',
                render: r => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{r.name}</strong>
                      {r.isPrimary && <span className="badge badge-emerald" style={{ marginLeft: '6px', fontSize: '10px' }}>Primary</span>}
                    </div>
                  </div>
                )
              },
              { header: 'Designation', accessor: 'designation' },
              { header: 'Phone', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.phone}</span> },
              { header: 'Email', accessor: 'email' },
              {
                header: 'Actions',
                align: 'right',
                render: r => (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditContact(r)} title="Edit Contact">
                      <Edit size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        if (window.confirm(`Remove contact ${r.name}?`)) {
                          deleteSupplierContact(supplier.id, r.id);
                        }
                      }}
                      title="Remove Contact"
                      style={{ color: 'var(--ruby-text)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              }
            ]}
            data={supplier.contacts || []}
            emptyMessage="No contacts added yet. Click 'Add Contact' to register an executive."
          />
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Statutory & Commercial Documents</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Mining leases, VAT/GST certificates, supply agreements, and licences</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddDoc}>
              <Plus size={14} />
              <span>Upload Document</span>
            </button>
          </div>

          <DataTable
            columns={[
              {
                header: 'Document Name & Type',
                render: r => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="var(--brand-color)" />
                    <div>
                      <strong>{r.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.type}</div>
                    </div>
                  </div>
                )
              },
              { header: 'Doc Number', render: r => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.docNo || '—'}</span> },
              { header: 'Issue Date', accessor: 'issueDate' },
              { header: 'Expiry Date', accessor: 'expiryDate' },
              {
                header: 'Status',
                render: r => {
                  if (!r.expiryDate) return <span className="badge badge-soft">Permanent</span>;
                  const exp = new Date(r.expiryDate);
                  const now = new Date();
                  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) return <span className="badge badge-ruby">Expired</span>;
                  if (diffDays < 60) return <span className="badge badge-amber">Expiring Soon ({diffDays}d)</span>;
                  return <span className="badge badge-emerald">Valid</span>;
                }
              },
              {
                header: 'Actions',
                align: 'right',
                render: r => (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => alert(`Simulating download for: ${r.name}`)} title="Download Document">
                      <Download size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEditDoc(r)} title="Edit Details">
                      <Edit size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        if (window.confirm(`Delete document record ${r.name}?`)) {
                          deleteSupplierDocument(supplier.id, r.id);
                        }
                      }}
                      title="Remove Document"
                      style={{ color: 'var(--ruby-text)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              }
            ]}
            data={supplier.documents || []}
            emptyMessage="No documents recorded yet. Click 'Upload Document' to add licences or agreements."
          />
        </div>
      )}

      {/* TAB 4: ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="table-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Supplier Audit Trail</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Chronological record of registrations, profile changes, and transaction events</div>
          </div>

          <DataTable
            columns={[
              { header: 'Timestamp', accessor: 'timestamp' },
              { header: 'Action', render: r => <span className="badge badge-soft">{r.action}</span> },
              { header: 'Performed By', render: r => <strong>{r.user}</strong> },
              { header: 'Role', accessor: 'role' },
              { header: 'Event Details', accessor: 'details' }
            ]}
            data={linkedActivity}
            emptyMessage="No activity logs found for this supplier."
          />
        </div>
      )}

      {/* TAB 5: LINKED TRANSACTIONS */}
      {activeTab === 'linked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Purchase Orders */}
          <div className="table-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Linked Purchase Orders ({linkedPOs.length})</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Raw stone purchase agreements issued to this vendor</div>
              </div>
            </div>
            <DataTable
              columns={[
                { header: 'PO Number', render: r => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.id}</strong> },
                { header: 'Date', accessor: 'date' },
                { header: 'Stone Type', accessor: 'stoneCode' },
                { header: 'Quantity (Tons)', render: r => <span className="table-num">{r.tons} MT</span> },
                { header: 'Rate / Ton', render: r => <span className="table-num">${r.ratePerTon}</span> },
                { header: 'Total Value', render: r => <strong className="table-num" style={{ color: 'var(--emerald-text)' }}>${r.totalCost?.toLocaleString()}</strong> },
                { header: 'Status', render: r => <StatusBadge status={r.status} /> }
              ]}
              data={linkedPOs}
              emptyMessage="No purchase orders linked to this supplier."
            />
          </div>

          {/* Section 2: Raw Blocks in Stock */}
          <div className="table-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Blocks in Stock from this Quarry ({linkedRawBlocks.length})</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Inventory stones currently residing in yard bays</div>
              </div>
            </div>
            <DataTable
              columns={[
                { header: 'Block Number', render: r => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.blockNo || r.id}</strong> },
                { header: 'Stone Material', accessor: 'stoneType' },
                { header: 'Dimensions (L x W x H)', render: r => `${r.length}" x ${r.width}" x ${r.height}"` },
                { header: 'Weight', render: r => <span className="table-num">{r.weightTons || 28} Tons</span> },
                { header: 'Yard Location', render: r => <span style={{ color: 'var(--teal-600)', fontWeight: 600 }}>{r.location || 'Bay 01'}</span> },
                { header: 'Status', render: r => <StatusBadge status={r.status} /> }
              ]}
              data={linkedRawBlocks}
              emptyMessage="No raw blocks in yard from this quarry."
            />
          </div>

          {/* Section 3: Gate Entries & Inbound */}
          <div className="table-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Gate Entries & Inbound Trucks ({linkedGateEntries.length})</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Transport arrivals recorded at factory security gate</div>
              </div>
            </div>
            <DataTable
              columns={[
                { header: 'Entry #', render: r => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.entryNo || r.id}</strong> },
                { header: 'Truck Registration', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.truckNo}</span> },
                { header: 'Driver', accessor: 'driverName' },
                { header: 'Date', accessor: 'date' },
                { header: 'Challan #', accessor: 'challanNo' },
                { header: 'Status', render: r => <StatusBadge status={r.status} /> }
              ]}
              data={linkedGateEntries}
              emptyMessage="No gate arrivals recorded for this supplier."
            />
          </div>

          {/* Section 4: Supplier Bills & Payments */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            <div className="table-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
                Supplier Invoices & Bills ({linkedBills.length})
              </div>
              <DataTable
                columns={[
                  { header: 'Bill #', render: r => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.billNo || r.id}</strong> },
                  { header: 'Date', accessor: 'date' },
                  { header: 'Amount', render: r => <strong className="table-num">${r.amount?.toLocaleString()}</strong> },
                  { header: 'Status', render: r => <StatusBadge status={r.status} /> }
                ]}
                data={linkedBills}
                emptyMessage="No supplier bills generated."
              />
            </div>

            <div className="table-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
                Payments Disbursed ({linkedPayments.length})
              </div>
              <DataTable
                columns={[
                  { header: 'Payment ID', render: r => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.id}</strong> },
                  { header: 'Date', accessor: 'date' },
                  { header: 'Mode', accessor: 'paymentMode' },
                  { header: 'Net Paid', render: r => <strong className="table-num" style={{ color: 'var(--emerald-text)' }}>${r.netPaid?.toLocaleString()}</strong> }
                ]}
                data={linkedPayments}
                emptyMessage="No payment disbursements recorded."
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Contact */}
      {isContactModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh-3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {editingContact ? 'Edit Key Contact' : 'Add New Contact'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsContactModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveContact} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marco Vieri"
                  value={contactForm.name}
                  onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Quarry Operations Manager"
                  value={contactForm.designation}
                  onChange={e => setContactForm({ ...contactForm, designation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. +39 335 123456"
                  value={contactForm.phone}
                  onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. m.vieri@altissimo.it"
                  value={contactForm.email}
                  onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={e => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                />
                <span>Designate as Primary Point of Contact</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
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

      {/* Modal for Uploading/Editing Document */}
      {isDocModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh-3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {editingDoc ? 'Edit Document Record' : 'Upload Document'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsDocModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveDoc} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select
                  className="form-select"
                  value={docForm.type}
                  onChange={e => setDocForm({ ...docForm, type: e.target.value })}
                >
                  <option value="Licence">Mining / Environmental Licence</option>
                  <option value="Tax Certificate">Tax Certificate (GST / VAT)</option>
                  <option value="Agreement">Supply Contract / Agreement</option>
                  <option value="Cancelled Cheque">Cancelled Cheque / Bank Letter</option>
                  <option value="Other">Other Registration</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Quarry Exploitation Permit"
                  value={docForm.name}
                  onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document / Registration #</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. LIC-2020-8821"
                  value={docForm.docNo}
                  onChange={e => setDocForm({ ...docForm, docNo: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={docForm.issueDate}
                    onChange={e => setDocForm({ ...docForm, issueDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={docForm.expiryDate}
                    onChange={e => setDocForm({ ...docForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attached File (PDF / Image)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setDocForm({ ...docForm, fileUrl: file.name });
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsDocModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
