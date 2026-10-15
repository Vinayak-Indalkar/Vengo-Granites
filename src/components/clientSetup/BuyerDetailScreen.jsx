import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Users,
  CreditCard,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Ban,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Truck,
  Download,
  Percent
} from 'lucide-react';
import { DataTable } from '../CommonComponents';

export function BuyerDetailScreen({ buyerId, onBack, onEdit, onDelete, onRestore }) {
  const {
    customers,
    salesOrders,
    invoices,
    dispatches,
    customerPayments,
    auditLogs,
    toggleCustomerBlock,
    addCustomerContact,
    updateCustomerContact,
    deleteCustomerContact,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    addCustomerDocument,
    updateCustomerDocument,
    deleteCustomerDocument,
    currentRole
  } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'contacts' | 'documents' | 'activity' | 'linked'
  const [showBankAcc, setShowBankAcc] = useState(false);

  // Sub-modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', designation: '', phone: '', email: '', isPrimary: false });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: 'Site / Warehouse', address: '', city: '', state: '', pincode: '', isDefault: false });

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docForm, setDocForm] = useState({ name: '', type: 'GST Certificate', number: '', issueDate: '', expiryDate: '', fileUrl: '' });

  // Block modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  const buyer = customers.find(c => c.id === buyerId || c.code === buyerId);

  if (!buyer) {
    return (
      <div className="table-card" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Buyer not found or removed.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginTop: '10px' }}>
          Back to Buyers List
        </button>
      </div>
    );
  }

  // Linked records
  const linkedOrders = salesOrders.filter(so => so.customerId === buyer.id || so.customer === buyer.name || (buyer.legacyId && so.customerId === buyer.legacyId));
  const linkedInvoices = invoices.filter(inv => inv.customerId === buyer.id || inv.customer === buyer.name || (buyer.legacyId && inv.customerId === buyer.legacyId));
  const linkedDispatches = dispatches.filter(d => d.customer === buyer.name);
  const linkedPayments = customerPayments.filter(p => p.customer === buyer.name);

  // Linked audit logs
  const linkedLogs = auditLogs.filter(a => a.entityId === buyer.id || a.entityId === buyer.code || a.details?.includes(buyer.name));

  // Financials
  const creditLimit = Number(buyer.creditLimit) || 0;
  const balance = Number(buyer.balance) || 0;
  const availableCredit = Math.max(0, creditLimit - balance);
  const creditUsagePct = creditLimit > 0 ? Math.min(100, Math.round((balance / creditLimit) * 100)) : 0;

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
      updateCustomerContact(buyer.id, editingContact.id, contactForm);
    } else {
      addCustomerContact(buyer.id, contactForm);
    }
    setIsContactModalOpen(false);
  };

  // Address Handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ label: 'Site / Warehouse', address: '', city: buyer.city || '', state: buyer.state || '', pincode: '', isDefault: false });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.address.trim()) return;
    if (editingAddress) {
      updateCustomerAddress(buyer.id, editingAddress.id, addressForm);
    } else {
      addCustomerAddress(buyer.id, addressForm);
    }
    setIsAddressModalOpen(false);
  };

  // Document Handlers
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setDocForm({ name: '', type: 'GST Certificate', number: '', issueDate: '', expiryDate: '', fileUrl: '' });
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
      updateCustomerDocument(buyer.id, editingDoc.id, docForm);
    } else {
      addCustomerDocument(buyer.id, docForm);
    }
    setIsDocModalOpen(false);
  };

  const handleToggleBlockAction = () => {
    if (buyer.isBlocked) {
      toggleCustomerBlock(buyer.id);
    } else {
      setBlockReasonInput('');
      setIsBlockModalOpen(true);
    }
  };

  const handleConfirmBlock = (e) => {
    e.preventDefault();
    toggleCustomerBlock(buyer.id, blockReasonInput.trim() || 'Credit limit exceeded / Account on hold');
    setIsBlockModalOpen(false);
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
              <ArrowLeft size={14} /> Back to Buyers
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {buyer.name}
              </h2>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-color)', fontFamily: 'monospace', backgroundColor: 'var(--brand-surface, #EEF2F6)', padding: '2px 8px', borderRadius: '4px' }}>
                {buyer.code || buyer.id}
              </span>
              <span className="badge badge-subtle">{buyer.type || 'Buyer'}</span>
              {buyer.isBlocked ? (
                <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Ban size={12} /> BLOCKED
                </span>
              ) : buyer.isArchived || buyer.status === 'Inactive' ? (
                <span className="badge badge-neutral">Inactive</span>
              ) : (
                <span className="badge badge-success">Active</span>
              )}
            </div>

            {buyer.isBlocked && buyer.blockReason && (
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--rose-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> <strong>Block Reason:</strong> {buyer.blockReason}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${buyer.isBlocked ? 'btn-secondary' : 'btn-ghost text-danger'}`}
              onClick={handleToggleBlockAction}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Ban size={14} />
              <span>{buyer.isBlocked ? 'Unblock Buyer' : 'Block Account'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(buyer)}
            >
              <Edit size={14} />
              <span>Edit Profile</span>
            </button>

            {buyer.isArchived || buyer.status === 'Inactive' ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onRestore(buyer.id)}
              >
                <RotateCcw size={14} />
                <span>Restore Active</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => onDelete(buyer.id)}
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
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Credit Limit</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>₹{creditLimit.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Term: {buyer.creditDays || 30} Days</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Outstanding</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: balance > 0 ? (creditUsagePct > 80 ? 'var(--rose-600)' : 'var(--ink)') : 'var(--teal-600)' }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{creditUsagePct}% Limit Utilized</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Available Credit</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: availableCredit > 0 ? 'var(--teal-700)' : 'var(--rose-600)' }}>
              ₹{availableCredit.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>For new orders</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sales Orders</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{linkedOrders.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{linkedInvoices.length} Invoices Issued</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px' }}>
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'contacts', label: `Contacts (${(buyer.contacts || []).length})` },
          { key: 'documents', label: `Documents (${(buyer.documents || []).length})` },
          { key: 'activity', label: 'Activity & Audit' },
          { key: 'linked', label: `Linked (${linkedOrders.length + linkedInvoices.length})` }
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
          {/* Card: Identity & Registration */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Buyer Identity & Tax
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Code:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{buyer.code || buyer.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Type:</span>
                <span style={{ fontWeight: 600 }}>{buyer.type || 'Direct End-User'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>GSTIN / Tax ID:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{buyer.taxId || 'Not Registered'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>PAN:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{buyer.pan || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Phone:</span>
                <span style={{ fontWeight: 600 }}>{buyer.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Email:</span>
                <span style={{ fontWeight: 600 }}>{buyer.email || 'N/A'}</span>
              </div>
              {buyer.website && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Website:</span>
                  <a href={buyer.website.startsWith('http') ? buyer.website : `https://${buyer.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-color)', fontWeight: 600 }}>
                    {buyer.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card: Billing Address */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Billing Address
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Address:</div>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>{buyer.address || 'Address line not provided'}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '11px' }}>City:</div>
                  <div style={{ fontWeight: 600 }}>{buyer.city || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '11px' }}>State:</div>
                  <div style={{ fontWeight: 600 }}>{buyer.state || 'N/A'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Country:</div>
                  <div style={{ fontWeight: 600 }}>{buyer.country || 'India'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--muted)', fontSize: '11px' }}>Pincode / ZIP:</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{buyer.pincode || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Commercial & Credit Terms */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              Commercial & Credit Terms
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Assigned Price List:</span>
                <span style={{ fontWeight: 600 }}>{buyer.priceList || 'Standard Retail 2026'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Payment Terms:</span>
                <span style={{ fontWeight: 600 }}>{buyer.paymentTerms || 'Net 30 Days'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Delivery Terms:</span>
                <span style={{ fontWeight: 600 }}>{buyer.deliveryTerms || 'Ex-Factory / Yard'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Tolerance (Area/Weight):</span>
                <span style={{ fontWeight: 600 }}>±{buyer.tolerance || 2.0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Operating Currency:</span>
                <span style={{ fontWeight: 600 }}>{buyer.currency || 'INR'}</span>
              </div>
            </div>
          </div>

          {/* Card: Bank Account */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Bank Account</div>
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
                <span style={{ color: 'var(--muted)' }}>Bank:</span>
                <span style={{ fontWeight: 600 }}>{buyer.bankName || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Account Number:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {buyer.bankAccount ? (showBankAcc ? buyer.bankAccount : '•••• •••• ' + buyer.bankAccount.slice(-4)) : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>IFSC / SWIFT:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{buyer.bankIfsc || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card: Shipping Addresses (Multiple Destination Delivery) */}
          <div className="card" style={{ padding: '16px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '8px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Shipping / Delivery Addresses</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>For site dispatches and gate passes</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleOpenAddAddress}
              >
                <Plus size={13} />
                <span>Add Shipping Location</span>
              </button>
            </div>

            {(!buyer.shippingAddresses || buyer.shippingAddresses.length === 0) ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                No dedicated shipping sites added. Orders default to the registered billing address.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {buyer.shippingAddresses.map((addr) => (
                  <div key={addr.id} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: '6px', backgroundColor: 'var(--surface-sunken)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--brand-color)' }}>
                        {addr.label || 'Delivery Site'}
                      </span>
                      {addr.isDefault && <span className="badge badge-success" style={{ fontSize: '10px' }}>Default</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink)', marginTop: '4px' }}>
                      {addr.address}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleOpenEditAddress(addr)} style={{ padding: '2px 6px' }}>
                        <Edit size={12} />
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => deleteCustomerAddress(buyer.id, addr.id)} style={{ padding: '2px 6px' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Buyer Representatives & Key Contacts</span>
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
                header: 'Representative Name',
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
              { header: 'Designation / Role', accessor: 'designation' },
              { header: 'Direct Phone', accessor: 'phone' },
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
                      onClick={() => deleteCustomerContact(buyer.id, c.id)}
                      title="Remove Contact"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
                style: { textAlign: 'right' }
              }
            ]}
            data={buyer.contacts || []}
            emptyMessage="No contacts recorded for this buyer yet."
          />
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="table-card">
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Buyer KYC & Legal Documents</span>
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
              { header: 'Doc Number / Reg ID', accessor: (d) => <span style={{ fontFamily: 'monospace' }}>{d.number || 'N/A'}</span> },
              { header: 'Issue Date', accessor: 'issueDate' },
              { header: 'Expiry Date', accessor: (d) => d.expiryDate || 'Perpetual' },
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
                      onClick={() => deleteCustomerDocument(buyer.id, d.id)}
                      title="Remove Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ),
                style: { textAlign: 'right' }
              }
            ]}
            data={buyer.documents || []}
            emptyMessage="No documents uploaded for this buyer yet."
          />
        </div>
      )}

      {/* TAB 4: ACTIVITY & AUDIT */}
      {activeTab === 'activity' && (
        <div className="table-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '12px' }}>
            Audit Log History for {buyer.name}
          </div>
          {linkedLogs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No audit trail events logged for this account yet.
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

      {/* TAB 5: LINKED TRANSACTIONS */}
      {activeTab === 'linked' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sales Orders */}
          <div className="table-card">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
              Linked Sales Orders ({linkedOrders.length})
            </div>
            <DataTable
              columns={[
                { header: 'Order #', accessor: 'orderNo' },
                { header: 'Order Date', accessor: 'date' },
                { header: 'Total Value (₹)', accessor: (o) => (Number(o.totalAmount) || 0).toLocaleString('en-IN') },
                { header: 'Status', accessor: (o) => <span className="badge badge-subtle">{o.status || 'Active'}</span> }
              ]}
              data={linkedOrders}
              emptyMessage="No sales orders placed by this buyer yet."
            />
          </div>

          {/* Invoices */}
          <div className="table-card">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
              Sales Invoices ({linkedInvoices.length})
            </div>
            <DataTable
              columns={[
                { header: 'Invoice #', accessor: 'invoiceNo' },
                { header: 'Invoice Date', accessor: 'date' },
                { header: 'Total (₹)', accessor: (inv) => (Number(inv.total) || 0).toLocaleString('en-IN') },
                { header: 'Payment Status', accessor: (inv) => <span className="badge badge-subtle">{inv.status || 'Issued'}</span> }
              ]}
              data={linkedInvoices}
              emptyMessage="No invoices generated for this buyer."
            />
          </div>

          {/* Dispatches */}
          <div className="table-card">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
              Dispatches & Challans ({linkedDispatches.length})
            </div>
            <DataTable
              columns={[
                { header: 'Dispatch #', accessor: 'dispatchNo' },
                { header: 'Vehicle #', accessor: 'vehicleNo' },
                { header: 'Driver', accessor: 'driver' },
                { header: 'Status', accessor: 'status' }
              ]}
              data={linkedDispatches}
              emptyMessage="No dispatches recorded for this buyer."
            />
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CONTACT */}
      {isContactModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>
              {editingContact ? 'Edit Buyer Representative' : 'Add Buyer Representative'}
            </h3>
            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Designation / Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  placeholder="e.g. Project Architect"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Direct Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="ramesh@buyer.com"
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })}
                />
                <span>Set as Primary Representative for this account</span>
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

      {/* MODAL: ADD / EDIT SHIPPING ADDRESS */}
      {isAddressModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--ink)' }}>
              {editingAddress ? 'Edit Shipping Location' : 'Add Shipping Location'}
            </h3>
            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Location / Project Site Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="e.g. Palm Meadows Villa Site 14"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Full Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  placeholder="Plot 42, Green Avenue, Sector 82"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
                <span>Set as Default Delivery Location</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddressModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Address
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
              {editingDoc ? 'Edit Document' : 'Upload Buyer Document'}
            </h3>
            <form onSubmit={handleSaveDoc} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Document Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  placeholder="e.g. GST Registration Certificate"
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
                    <option value="GST Certificate">GST Certificate</option>
                    <option value="PAN Copy">PAN Copy</option>
                    <option value="Buyer Agreement">Buyer Agreement</option>
                    <option value="Blank Cheque">Cancelled Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Number / Identifier</label>
                  <input
                    type="text"
                    className="form-control"
                    value={docForm.number}
                    onChange={(e) => setDocForm({ ...docForm, number: e.target.value })}
                    placeholder="Reg / Certificate #"
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

      {/* MODAL: BLOCK ACCOUNT PROMPT */}
      {isBlockModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--white)', borderRadius: '8px', width: '480px', maxWidth: '90%', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-600)', marginBottom: '12px' }}>
              <Ban size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--rose-700)' }}>
                Block Buyer Account: {buyer.name}
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink)', marginBottom: '12px' }}>
              Blocking an account immediately prevents new sales orders from being created or confirmed for this buyer. Existing invoices and dispatches remain accessible.
            </p>
            <form onSubmit={handleConfirmBlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Reason for Blocking</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="e.g. Over credit limit (₹3.5L unpaid over 60 days) or Cheque bounce on invoice #INV-401"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsBlockModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--rose-600)', borderColor: 'var(--rose-600)' }}>
                  Confirm & Block Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
