import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormDrawer } from '../CommonComponents';
import { HardHat, Phone, MapPin, CreditCard, ShieldCheck, Eye, EyeOff, Calendar, AlertCircle } from 'lucide-react';

export function ContractorFormDrawer({ isOpen, onClose, contractor, onSubmit }) {
  const { contractors } = useApp();

  const [formData, setFormData] = useState({
    companyName: '',
    serviceType: 'Gang Saw Slicing',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'Active',
    address: '',
    city: '',
    state: '',
    pincode: '',
    pan: '',
    gst: '',
    billingBasis: 'Per Sq.Ft',
    ratePerUnit: 18,
    paymentCycle: 'Weekly',
    contractStartDate: '',
    contractEndDate: '',
    bankHolder: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    bankBranch: ''
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [showBankAcc, setShowBankAcc] = useState(false);

  useEffect(() => {
    if (contractor) {
      setFormData({
        companyName: contractor.companyName || '',
        serviceType: contractor.serviceType || 'Gang Saw Slicing',
        contactPerson: contractor.contactPerson || '',
        phone: contractor.phone || '',
        email: contractor.email || '',
        status: contractor.status || 'Active',
        address: contractor.address || '',
        city: contractor.city || '',
        state: contractor.state || '',
        pincode: contractor.pincode || '',
        pan: contractor.pan || '',
        gst: contractor.gst || '',
        billingBasis: contractor.billingBasis || 'Per Sq.Ft',
        ratePerUnit: contractor.ratePerUnit !== undefined ? contractor.ratePerUnit : 18,
        paymentCycle: contractor.paymentCycle || 'Weekly',
        contractStartDate: contractor.contractStartDate || '',
        contractEndDate: contractor.contractEndDate || '',
        bankHolder: contractor.bankHolder || contractor.companyName || '',
        bankName: contractor.bankName || '',
        bankAccount: contractor.bankAccount || '',
        bankIfsc: contractor.bankIfsc || '',
        bankBranch: contractor.bankBranch || ''
      });
    } else {
      setFormData({
        companyName: '',
        serviceType: 'Gang Saw Slicing',
        contactPerson: '',
        phone: '',
        email: '',
        status: 'Active',
        address: '',
        city: '',
        state: '',
        pincode: '',
        pan: '',
        gst: '',
        billingBasis: 'Per Sq.Ft',
        ratePerUnit: 18,
        paymentCycle: 'Weekly',
        contractStartDate: new Date().toISOString().slice(0, 10),
        contractEndDate: '',
        bankHolder: '',
        bankName: '',
        bankAccount: '',
        bankIfsc: '',
        bankBranch: ''
      });
    }
    setErrors({});
    setDuplicateWarning('');
    setShowBankAcc(false);
  }, [contractor, isOpen]);

  // Duplicate check for phone or companyName
  const handlePhoneBlur = () => {
    if (!formData.phone) return;
    const cleanPhone = formData.phone.trim();
    const existing = contractors.find(c =>
      c.id !== contractor?.id &&
      c.phone &&
      c.phone.trim() === cleanPhone
    );
    if (existing) {
      setDuplicateWarning(`Warning: Phone number matches another contractor: ${existing.companyName} (${existing.code || existing.id}).`);
    } else {
      setDuplicateWarning('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const submission = {
      ...formData,
      companyName: formData.companyName.trim() || 'New Contractor',
      ratePerUnit: Number(formData.ratePerUnit) || 0
    };

    onSubmit(submission);
  };

  return (
    <FormDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={contractor ? `Edit Contractor: ${contractor.companyName}` : 'Register New Contractor / Labour Agency'}
      onSubmit={handleSubmit}
      submitLabel={contractor ? 'Update Contractor' : 'Register Contractor'}
      confirmSubmit={true}
    >
      {duplicateWarning && (
        <div className="form-group col-span-2" style={{
          gridColumn: '1 / -1',
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

      {/* SECTION 1: PROFILE & TRADE */}
      <div className="col-span-2" style={{
        gridColumn: '1 / -1',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 700,
        fontSize: '13px',
        color: 'var(--ink)',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '6px',
        marginTop: '2px'
      }}>
        <HardHat size={15} color="var(--brand-color)" />
        <span>1. Agency Identity & Trade</span>
      </div>

      <div className="form-group">
        <label className="form-label">Agency / Contractor Name</label>
        <input
          type="text"
          name="companyName"
          className="form-input"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="e.g. Balaji Heavy Rigging & Cranes"
        />
        {errors.companyName && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.companyName}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Trade / Specialty</label>
        <select
          name="serviceType"
          className="form-select"
          value={formData.serviceType}
          onChange={handleChange}
        >
          <option value="Quarry Mining">Quarry Mining</option>
          <option value="Block Dressing">Block Dressing</option>
          <option value="Gang Saw Slicing">Gang Saw Slicing</option>
          <option value="Wire Saw Cutting">Wire Saw Cutting</option>
          <option value="Epoxy & Resin Line">Epoxy & Resin Line</option>
          <option value="Polishing & Honing">Polishing & Honing</option>
          <option value="CNC Edge Profiling">CNC Edge Profiling</option>
          <option value="Heavy Rigging & Yard Crane">Heavy Rigging & Yard Crane</option>
          <option value="Material Handling & Crating">Material Handling & Crating</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Managing Partner / Rep</label>
        <input
          type="text"
          name="contactPerson"
          className="form-input"
          value={formData.contactPerson}
          onChange={handleChange}
          placeholder="e.g. Rameshwar Gurjar"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone / Mobile</label>
        <input
          type="text"
          name="phone"
          className="form-input"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handlePhoneBlur}
          placeholder="+91 98290 88776"
        />
        {errors.phone && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.phone}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          name="status"
          className="form-select"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* SECTION 2: LOCATION & TAX */}
      <div className="col-span-2" style={{
        gridColumn: '1 / -1',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 700,
        fontSize: '13px',
        color: 'var(--ink)',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '6px',
        marginTop: '10px'
      }}>
        <MapPin size={15} color="var(--brand-color)" />
        <span>2. Address & Tax Registration</span>
      </div>

      <div className="form-group col-span-2">
        <label className="form-label">Operating Address</label>
        <input
          type="text"
          name="address"
          className="form-input"
          value={formData.address}
          onChange={handleChange}
          placeholder="Plot 12, Industrial Area, Phase II"
        />
      </div>

      <div className="form-group">
        <label className="form-label">City</label>
        <input
          type="text"
          name="city"
          className="form-input"
          value={formData.city}
          onChange={handleChange}
          placeholder="Makrana"
        />
        {errors.city && <div style={{ color: 'var(--rose-600)', fontSize: '11px', marginTop: '2px' }}>{errors.city}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">State</label>
        <input
          type="text"
          name="state"
          className="form-input"
          value={formData.state}
          onChange={handleChange}
          placeholder="Rajasthan"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Pincode</label>
        <input
          type="text"
          name="pincode"
          className="form-input"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="341505"
        />
      </div>

      <div className="form-group">
        <label className="form-label">GSTIN</label>
        <input
          type="text"
          name="gst"
          className="form-input"
          value={formData.gst}
          onChange={handleChange}
          placeholder="08AAEFB4491J1ZP"
        />
      </div>

      <div className="form-group">
        <label className="form-label">PAN Number</label>
        <input
          type="text"
          name="pan"
          className="form-input"
          value={formData.pan}
          onChange={handleChange}
          placeholder="AAEFB4491J"
        />
      </div>

      {/* SECTION 3: CONTRACT TERMS & RATES */}
      <div className="col-span-2" style={{
        gridColumn: '1 / -1',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 700,
        fontSize: '13px',
        color: 'var(--ink)',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '6px',
        marginTop: '10px'
      }}>
        <Calendar size={15} color="var(--brand-color)" />
        <span>3. Contract Terms & Compensation</span>
      </div>

      <div className="form-group">
        <label className="form-label">Billing Basis</label>
        <select
          name="billingBasis"
          className="form-select"
          value={formData.billingBasis}
          onChange={handleChange}
        >
          <option value="Per Sq.Ft">Per Sq.Ft</option>
          <option value="Per Tonne">Per Tonne</option>
          <option value="Per Hour">Per Hour</option>
          <option value="Per Day">Per Day</option>
          <option value="Fixed Monthly">Fixed Monthly</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Rate Per Unit (₹)</label>
        <input
          type="number"
          name="ratePerUnit"
          className="form-input"
          value={formData.ratePerUnit}
          onChange={handleChange}
          min="0"
          step="1"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Payment Cycle</label>
        <select
          name="paymentCycle"
          className="form-select"
          value={formData.paymentCycle}
          onChange={handleChange}
        >
          <option value="Weekly">Weekly</option>
          <option value="Bi-weekly">Bi-weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Contract Start Date</label>
        <input
          type="date"
          name="contractStartDate"
          className="form-input"
          value={formData.contractStartDate}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contract End Date</label>
        <input
          type="date"
          name="contractEndDate"
          className="form-input"
          value={formData.contractEndDate}
          onChange={handleChange}
        />
      </div>

      {/* SECTION 4: BANK ACCOUNT */}
      <div className="col-span-2" style={{
        gridColumn: '1 / -1',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '6px',
        marginTop: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--ink)' }}>
          <ShieldCheck size={15} color="var(--brand-color)" />
          <span>4. Bank Account for Disbursals</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => setShowBankAcc(!showBankAcc)}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          {showBankAcc ? <><EyeOff size={12} /> Hide Mask</> : <><Eye size={12} /> Reveal</>}
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Account Holder Name</label>
        <input
          type="text"
          name="bankHolder"
          className="form-input"
          value={formData.bankHolder}
          onChange={handleChange}
          placeholder="Balaji Heavy Rigging"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Bank Name</label>
        <input
          type="text"
          name="bankName"
          className="form-input"
          value={formData.bankName}
          onChange={handleChange}
          placeholder="State Bank of India"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Account Number</label>
        <input
          type={showBankAcc ? 'text' : 'password'}
          name="bankAccount"
          className="form-input"
          value={formData.bankAccount}
          onChange={handleChange}
          placeholder="30911244889"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">IFSC Code</label>
        <input
          type="text"
          name="bankIfsc"
          className="form-input"
          value={formData.bankIfsc}
          onChange={handleChange}
          placeholder="SBIN0004122"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      <div className="form-group col-span-2">
        <label className="form-label">Branch</label>
        <input
          type="text"
          name="bankBranch"
          className="form-input"
          value={formData.bankBranch}
          onChange={handleChange}
          placeholder="Makrana Main"
        />
      </div>
    </FormDrawer>
  );
}
