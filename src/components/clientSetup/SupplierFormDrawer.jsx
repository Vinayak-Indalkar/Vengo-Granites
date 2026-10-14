import React, { useState, useEffect, useMemo } from 'react';
import { FormDrawer } from '../CommonComponents';
import { AlertTriangle, Eye, EyeOff, ShieldCheck, Building2, MapPin, CreditCard, Clock, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SupplierFormDrawer({
  isOpen,
  onClose,
  initialData = null,
  supplier = null,
  onSubmit
}) {
  const { suppliers, stoneTypes, currentRole } = useApp();
  const activeInitial = supplier || initialData;
  const isEdit = Boolean(activeInitial?.id || activeInitial?.code);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Quarry',
    taxId: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    status: 'Active',
    quarryName: '',
    quarryLocation: '',
    stoneTypesSupplied: [],
    miningLeaseNo: '',
    leaseValidity: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscSwift: '',
    branch: '',
    paymentDays: 30,
    creditDays: 30,
    currency: 'INR',
    deliveryTerms: 'Ex-Quarry Gate',
    weightTolerance: 2.0,
    qualityScore: 92,
    deliveryScore: 90,
    rating: 'A'
  });

  const [showMaskedAccount, setShowMaskedAccount] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (activeInitial) {
        setFormData({
          code: activeInitial.code || activeInitial.id || '',
          name: activeInitial.name || '',
          type: activeInitial.type || 'Quarry',
          taxId: activeInitial.taxId || '',
          pan: activeInitial.pan || '',
          address: activeInitial.address || '',
          city: activeInitial.city || '',
          state: activeInitial.state || '',
          country: activeInitial.country || 'India',
          pincode: activeInitial.pincode || '',
          phone: activeInitial.phone || activeInitial.contact || '',
          email: activeInitial.email || '',
          website: activeInitial.website || '',
          status: activeInitial.status || 'Active',
          quarryName: activeInitial.quarryName || '',
          quarryLocation: activeInitial.quarryLocation || '',
          stoneTypesSupplied: Array.isArray(activeInitial.stoneTypesSupplied)
            ? activeInitial.stoneTypesSupplied
            : (activeInitial.materialType ? [activeInitial.materialType] : []),
          miningLeaseNo: activeInitial.miningLeaseNo || '',
          leaseValidity: activeInitial.leaseValidity || '',
          accountHolder: activeInitial.accountHolder || activeInitial.name || '',
          bankName: activeInitial.bankName || '',
          accountNumber: activeInitial.accountNumber || '',
          ifscSwift: activeInitial.ifscSwift || '',
          branch: activeInitial.branch || '',
          paymentDays: activeInitial.paymentDays || 30,
          creditDays: activeInitial.creditDays || 30,
          currency: activeInitial.currency || (activeInitial.country === 'Italy' ? 'EUR' : activeInitial.country === 'USA' ? 'USD' : 'INR'),
          deliveryTerms: activeInitial.deliveryTerms || 'Ex-Quarry Gate',
          weightTolerance: activeInitial.weightTolerance || 2.0,
          qualityScore: activeInitial.qualityScore || 92,
          deliveryScore: activeInitial.deliveryScore || 90,
          rating: activeInitial.rating || 'A'
        });
      } else {
        const maxCodeNum = suppliers.reduce((max, s) => {
          const match = (s.code || s.id || '').match(/SUP-(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        const autoCode = `SUP-${String(maxCodeNum + 1).padStart(4, '0')}`;
        setFormData({
          code: autoCode,
          name: '',
          type: 'Quarry',
          taxId: '',
          pan: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          pincode: '',
          phone: '',
          email: '',
          website: '',
          status: 'Active',
          quarryName: '',
          quarryLocation: '',
          stoneTypesSupplied: ['Black Galaxy Granite'],
          miningLeaseNo: '',
          leaseValidity: '',
          accountHolder: '',
          bankName: '',
          accountNumber: '',
          ifscSwift: '',
          branch: '',
          paymentDays: 30,
          creditDays: 30,
          currency: 'INR',
          deliveryTerms: 'Ex-Quarry Gate',
          weightTolerance: 2.0,
          qualityScore: 90,
          deliveryScore: 90,
          rating: 'A'
        });
      }
      setShowMaskedAccount(false);
      setDuplicateWarning(null);
    }
  }, [isOpen, activeInitial, suppliers.length]);

  // Real-time Duplicate Check: Warning if Tax ID or Phone matches an existing record
  useEffect(() => {
    if (!isOpen) return;
    const cleanTax = formData.taxId.trim().toUpperCase();
    const cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');

    const currentId = activeInitial?.id || activeInitial?.code;
    const duplicate = suppliers.find(s => {
      if (s.id === currentId || s.code === currentId) return false;
      const sTax = (s.taxId || '').trim().toUpperCase();
      const sPhone = (s.phone || s.contact || '').trim().replace(/[^0-9]/g, '');
      if (cleanTax && sTax && cleanTax === sTax) return true;
      if (cleanPhone && sPhone && cleanPhone.length > 6 && cleanPhone === sPhone) return true;
      return false;
    });

    if (duplicate) {
      setDuplicateWarning(`Tax ID or Phone number matches existing record: "${duplicate.name}" (${duplicate.code || duplicate.id}). You may still proceed with saving.`);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.taxId, formData.phone, isOpen, suppliers, activeInitial]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStoneTypeToggle = (stoneName) => {
    setFormData(prev => {
      const current = prev.stoneTypesSupplied || [];
      if (current.includes(stoneName)) {
        return { ...prev, stoneTypesSupplied: current.filter(s => s !== stoneName) };
      } else {
        return { ...prev, stoneTypesSupplied: [...current, stoneName] };
      }
    });
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter supplier name.');
      return;
    }
    onSubmit(formData);
  };

  const canRevealBank = currentRole === 'Supplier/Client Admin' || currentRole === 'QT Super Admin';

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Supplier (${formData.code})` : 'Add New Supplier'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Update Supplier' : 'Save Supplier'}
      confirmSubmit={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Duplicate Check Warning */}
        {duplicateWarning && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#b45309',
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span><strong>Duplicate Alert:</strong> {duplicateWarning}</span>
          </div>
        )}

        {/* Section 1: Basic Profile */}
        <div style={{
          padding: '16px',
          background: 'var(--white)',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--ink)',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '8px'
          }}>
            <Building2 size={16} color="var(--teal-600)" />
            <span>1. Profile & Registration Details</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Supplier Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                disabled
                style={{ background: 'var(--surface-sunken)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Carrara Quarry Holdings"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supplier Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
              >
                <option value="Quarry">Quarry</option>
                <option value="Mine">Mine</option>
                <option value="Material Vendor">Material Vendor</option>
                <option value="Transporter">Transporter</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tax ID / GSTIN</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 36AAACW1234E1Z5 or IT-0192837465"
                value={formData.taxId}
                onChange={e => handleChange('taxId', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AAACM1234F"
                value={formData.pan}
                onChange={e => handleChange('pan', e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Phone *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. sales@quarrycorp.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="e.g. https://www.quarrycorp.com"
                value={formData.website}
                onChange={e => handleChange('website', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Plot 14, Mining Industrial Belt"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Warangal"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Telangana"
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. India"
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode / Zipcode</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 506003"
                value={formData.pincode}
                onChange={e => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Quarry & Mine Details */}
        <div style={{
          padding: '16px',
          background: 'var(--white)',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--ink)',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '8px'
          }}>
            <Layers size={16} color="var(--teal-600)" />
            <span>2. Quarry, Pit & Extraction Concession</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Quarry / Mine Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Chimakurthy Ridge Pit #3"
                value={formData.quarryName}
                onChange={e => handleChange('quarryName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location / Geological Zone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Chimakurthy-Warangal Belt"
                value={formData.quarryLocation}
                onChange={e => handleChange('quarryLocation', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mining Lease Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ML-2018-091"
                value={formData.miningLeaseNo}
                onChange={e => handleChange('miningLeaseNo', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lease Validity Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.leaseValidity}
                onChange={e => handleChange('leaseValidity', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Stone Types Supplied</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {stoneTypes.map(st => {
                  const isSelected = (formData.stoneTypesSupplied || []).includes(st.name);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleStoneTypeToggle(st.name)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 500,
                        border: isSelected ? '1px solid var(--teal-600)' : '1px solid var(--line)',
                        background: isSelected ? 'var(--teal-50)' : 'var(--white)',
                        color: isSelected ? 'var(--teal-700)' : 'var(--ink)'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {st.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Bank Details */}
        <div style={{
          padding: '16px',
          background: 'var(--white)',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--ink)'
            }}>
              <CreditCard size={16} color="var(--teal-600)" />
              <span>3. Bank & Settlement Account</span>
            </div>
            {canRevealBank && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowMaskedAccount(prev => !prev)}
                style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}
              >
                {showMaskedAccount ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showMaskedAccount ? 'Mask Account #' : 'Reveal Account #'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Account Holder Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Warangal Black Granite Pvt Ltd"
                value={formData.accountHolder}
                onChange={e => handleChange('accountHolder', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. State Bank of India"
                value={formData.bankName}
                onChange={e => handleChange('bankName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                type={showMaskedAccount ? 'text' : 'password'}
                className="form-input"
                placeholder="e.g. 38491029384"
                value={formData.accountNumber}
                onChange={e => handleChange('accountNumber', e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC / SWIFT Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SBIN0001234 or CHASUS33"
                value={formData.ifscSwift}
                onChange={e => handleChange('ifscSwift', e.target.value.toUpperCase())}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Branch Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kazipet Industrial Area Branch"
                value={formData.branch}
                onChange={e => handleChange('branch', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Commercial Terms & Ratings */}
        <div style={{
          padding: '16px',
          background: 'var(--white)',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--ink)',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '8px'
          }}>
            <Clock size={16} color="var(--teal-600)" />
            <span>4. Commercial Terms & Quality Tolerance</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Payment Terms (Days)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 30"
                value={formData.paymentDays}
                onChange={e => handleChange('paymentDays', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Credit Days Allowed</label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 45"
                value={formData.creditDays}
                onChange={e => handleChange('creditDays', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Settlement Currency</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Terms</label>
              <select
                className="form-select"
                value={formData.deliveryTerms}
                onChange={e => handleChange('deliveryTerms', e.target.value)}
              >
                <option value="Ex-Quarry Gate">Ex-Quarry Gate</option>
                <option value="FOB Carrara Port">FOB Port</option>
                <option value="CIF Mundra Port">CIF Port</option>
                <option value="FOR Factory Yard">FOR Factory Yard</option>
                <option value="DDP Site">DDP Site</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weight Variance Tolerance (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="form-input"
                placeholder="e.g. 2.0"
                value={formData.weightTolerance}
                onChange={e => handleChange('weightTolerance', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overall Vendor Rating</label>
              <select
                className="form-select"
                value={formData.rating}
                onChange={e => handleChange('rating', e.target.value)}
              >
                <option value="A+">A+ (Elite Supplier)</option>
                <option value="A">A (Approved & Reliable)</option>
                <option value="B+">B+ (Good / Standard)</option>
                <option value="B">B (Conditional)</option>
                <option value="C">C (Probation)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </FormDrawer>
  );
}
