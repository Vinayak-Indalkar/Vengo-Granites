import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormDrawer } from '../CommonComponents';
import { Building2, Phone, Mail, MapPin, CreditCard, ShieldCheck, AlertCircle, Eye, EyeOff, Ban, Percent } from 'lucide-react';

export function BuyerFormDrawer({ isOpen, onClose, buyer, onSubmit }) {
  const { customers, currentRole } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Dealer',
    taxId: '',
    pan: '',
    phone: '',
    email: '',
    website: '',
    status: 'Active',
    isBlocked: false,
    blockReason: '',
    // Billing Address
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    // Terms
    creditLimit: 500000,
    creditDays: 30,
    priceList: 'Standard Retail 2026',
    deliveryTerms: 'Ex-Factory / Yard',
    paymentTerms: 'Net 30 Days',
    tolerance: 2.0,
    // Bank
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    // Primary contact
    primaryContactName: '',
    primaryContactDesignation: '',
    primaryContactPhone: '',
    primaryContactEmail: ''
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showBankAcc, setShowBankAcc] = useState(false);

  useEffect(() => {
    if (buyer) {
      const primary = (buyer.contacts || []).find(c => c.isPrimary) || (buyer.contacts && buyer.contacts[0]) || {};
      setFormData({
        name: buyer.name || '',
        type: buyer.type || 'Dealer',
        taxId: buyer.taxId || '',
        pan: buyer.pan || '',
        phone: buyer.phone || '',
        email: buyer.email || '',
        website: buyer.website || '',
        status: buyer.status || 'Active',
        isBlocked: !!buyer.isBlocked,
        blockReason: buyer.blockReason || '',
        address: buyer.address || '',
        city: buyer.city || '',
        state: buyer.state || '',
        country: buyer.country || 'India',
        pincode: buyer.pincode || '',
        creditLimit: buyer.creditLimit !== undefined ? buyer.creditLimit : 500000,
        creditDays: buyer.creditDays !== undefined ? buyer.creditDays : 30,
        priceList: buyer.priceList || 'Standard Retail 2026',
        deliveryTerms: buyer.deliveryTerms || 'Ex-Factory / Yard',
        paymentTerms: buyer.paymentTerms || 'Net 30 Days',
        tolerance: buyer.tolerance !== undefined ? buyer.tolerance : 2.0,
        bankName: buyer.bankName || '',
        bankAccount: buyer.bankAccount || '',
        bankIfsc: buyer.bankIfsc || '',
        primaryContactName: primary.name || '',
        primaryContactDesignation: primary.designation || '',
        primaryContactPhone: primary.phone || '',
        primaryContactEmail: primary.email || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'Dealer',
        taxId: '',
        pan: '',
        phone: '',
        email: '',
        website: '',
        status: 'Active',
        isBlocked: false,
        blockReason: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        creditLimit: 500000,
        creditDays: 30,
        priceList: 'Standard Retail 2026',
        deliveryTerms: 'Ex-Factory / Yard',
        paymentTerms: 'Net 30 Days',
        tolerance: 2.0,
        bankName: '',
        bankAccount: '',
        bankIfsc: '',
        primaryContactName: '',
        primaryContactDesignation: '',
        primaryContactPhone: '',
        primaryContactEmail: ''
      });
    }
    setErrors({});
    setDuplicateWarning('');
    setShowBankAcc(false);
  }, [buyer, isOpen]);

  // Duplicate Check against Tax ID and Phone
  const handleTaxIdBlur = () => {
    if (!formData.taxId) return;
    const cleanTax = formData.taxId.trim().toUpperCase();
    const existing = customers.find(c =>
      c.id !== buyer?.id &&
      c.taxId &&
      c.taxId.trim().toUpperCase() === cleanTax
    );
    if (existing) {
      setDuplicateWarning(`Warning: Another buyer (${existing.name} - ${existing.code || existing.id}) already shares Tax ID / GSTIN "${cleanTax}".`);
    } else {
      setDuplicateWarning('');
    }
  };

  const handlePhoneBlur = () => {
    if (!formData.phone) return;
    const cleanPhone = formData.phone.trim();
    const existing = customers.find(c =>
      c.id !== buyer?.id &&
      c.phone &&
      c.phone.trim() === cleanPhone
    );
    if (existing) {
      setDuplicateWarning(`Warning: Phone number matches existing buyer: ${existing.name} (${existing.code || existing.id}).`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Buyer / Client Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    if (formData.isBlocked && !formData.blockReason.trim()) {
      newErrors.blockReason = 'A reason is required when placing an account on Block';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Assemble payload
    const submission = {
      ...formData,
      creditLimit: Number(formData.creditLimit) || 0,
      creditDays: Number(formData.creditDays) || 0,
      tolerance: Number(formData.tolerance) || 0
    };

    // Include primary contact if provided
    if (formData.primaryContactName.trim()) {
      const existingContacts = buyer?.contacts || [];
      const primaryContact = {
        id: existingContacts.find(c => c.isPrimary)?.id || `CNT-${Date.now().toString().slice(-4)}`,
        name: formData.primaryContactName.trim(),
        designation: formData.primaryContactDesignation.trim() || 'Key Representative',
        phone: formData.primaryContactPhone.trim() || formData.phone,
        email: formData.primaryContactEmail.trim() || formData.email,
        isPrimary: true
      };

      const otherContacts = existingContacts.filter(c => !c.isPrimary && c.id !== primaryContact.id);
      submission.contacts = [primaryContact, ...otherContacts];
    }

    onSubmit(submission);
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={buyer ? `Edit Buyer: ${buyer.name}` : 'Register New Buyer / Client'}
      onSubmit={handleSubmit}
      submitLabel={buyer ? 'Update Buyer' : 'Save & Register Buyer'}
      confirmSubmit={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {duplicateWarning && (
          <div style={{
            backgroundColor: 'var(--amber-50, #FFFBEB)',
            border: '1px solid var(--amber-300, #FCD34D)',
            color: 'var(--amber-900, #78350F)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* SECTION 1: BASIC PROFILE */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={15} color="var(--brand-color)" />
            <span>1. Profile & Identity</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Buyer / Client Business Name *</label>
              <input
                type="text"
                name="name"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apex Builders & Developers Ltd"
              />
              {errors.name && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.name}</div>}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Buyer Type</label>
              <select
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Dealer">Dealer</option>
                <option value="Architect">Architect</option>
                <option value="Builder">Builder</option>
                <option value="Direct End-User">Direct End-User</option>
                <option value="Exporter">Exporter</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>GSTIN / Tax ID</label>
              <input
                type="text"
                name="taxId"
                className="form-control"
                value={formData.taxId}
                onChange={handleChange}
                onBlur={handleTaxIdBlur}
                placeholder="27AABCU9603R1ZM"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>PAN Number</label>
              <input
                type="text"
                name="pan"
                className="form-control"
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Phone / Mobile *</label>
              <input
                type="text"
                name="phone"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder="+91 98290 11223"
              />
              {errors.phone && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.phone}</div>}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="orders@buyer.com"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Block Controls */}
          <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: formData.isBlocked ? 'var(--rose-50, #FFF1F2)' : 'var(--surface-sunken)', borderRadius: '6px', border: `1px solid ${formData.isBlocked ? 'var(--rose-200)' : 'var(--line)'}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: formData.isBlocked ? 'var(--rose-700)' : 'var(--ink)' }}>
              <input
                type="checkbox"
                name="isBlocked"
                checked={formData.isBlocked}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Ban size={14} /> Place Account on Block (Restricts new Sales Orders)
              </span>
            </label>
            {formData.isBlocked && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  name="blockReason"
                  className={`form-control ${errors.blockReason ? 'is-invalid' : ''}`}
                  value={formData.blockReason}
                  onChange={handleChange}
                  placeholder="Specify reason (e.g. Over credit limit / Payment default / Dispute)"
                  style={{ fontSize: '12px' }}
                />
                {errors.blockReason && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.blockReason}</div>}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: BILLING ADDRESS */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="var(--brand-color)" />
            <span>2. Billing Address</span>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Street Address / Premises</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="Suite 402, Signature Tower, Ring Road"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>City *</label>
              <input
                type="text"
                name="city"
                className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
              {errors.city && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.city}</div>}
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Pincode / ZIP</label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="400051"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMERCIAL & CREDIT TERMS */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={15} color="var(--brand-color)" />
            <span>3. Commercial & Credit Terms</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Credit Limit (₹)</label>
              <input
                type="number"
                name="creditLimit"
                className="form-control"
                value={formData.creditLimit}
                onChange={handleChange}
                min="0"
                step="50000"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Credit Days Allowance</label>
              <input
                type="number"
                name="creditDays"
                className="form-control"
                value={formData.creditDays}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Assigned Price List</label>
              <select
                name="priceList"
                className="form-control"
                value={formData.priceList}
                onChange={handleChange}
              >
                <option value="Standard Retail 2026">Standard Retail 2026</option>
                <option value="Wholesale Bulk Tier 1">Wholesale Bulk Tier 1</option>
                <option value="Architect Special Rate">Architect Special Rate</option>
                <option value="Export Global FOB">Export Global FOB</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Weight / Area Tolerance (%)</label>
              <input
                type="number"
                name="tolerance"
                className="form-control"
                value={formData.tolerance}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Default Delivery Terms</label>
              <input
                type="text"
                name="deliveryTerms"
                className="form-control"
                value={formData.deliveryTerms}
                onChange={handleChange}
                placeholder="Ex-Factory / Yard"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Payment Terms</label>
              <input
                type="text"
                name="paymentTerms"
                className="form-control"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="Net 30 Days"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: BANK ACCOUNT */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="var(--brand-color)" />
              <span>4. Bank Account Details</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowBankAcc(!showBankAcc)}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              {showBankAcc ? <><EyeOff size={12} /> Hide Mask</> : <><Eye size={12} /> Reveal Account</>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Bank Name</label>
              <input
                type="text"
                name="bankName"
                className="form-control"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Account Number</label>
              <input
                type={showBankAcc ? 'text' : 'password'}
                name="bankAccount"
                className="form-control"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="50200088992144"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>IFSC / SWIFT</label>
              <input
                type="text"
                name="bankIfsc"
                className="form-control"
                value={formData.bankIfsc}
                onChange={handleChange}
                placeholder="HDFC0001244"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: PRIMARY CONTACT */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={15} color="var(--brand-color)" />
            <span>5. Primary Representative</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Contact Name</label>
              <input
                type="text"
                name="primaryContactName"
                className="form-control"
                value={formData.primaryContactName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Designation</label>
              <input
                type="text"
                name="primaryContactDesignation"
                className="form-control"
                value={formData.primaryContactDesignation}
                onChange={handleChange}
                placeholder="e.g. Procurement VP"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Direct Phone</label>
              <input
                type="text"
                name="primaryContactPhone"
                className="form-control"
                value={formData.primaryContactPhone}
                onChange={handleChange}
                placeholder="+91 98200 44332"
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Direct Email</label>
              <input
                type="email"
                name="primaryContactEmail"
                className="form-control"
                value={formData.primaryContactEmail}
                onChange={handleChange}
                placeholder="rahul@buyer.com"
              />
            </div>
          </div>
        </div>
      </div>
    </FormDrawer>
  );
}
