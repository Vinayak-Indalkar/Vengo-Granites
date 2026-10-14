import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export function SettingsScreen() {
  const {
    activeClient,
    updateClient
  } = useApp();

  const clientSettings = activeClient?.settings || {
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Europe/Rome (UTC+1)',
    language: 'English',
    currency: 'USD',
    areaUnit: 'Sq.Ft',
    weightUnit: 'Tons',
    taxRate: 18,
    dailyOvertimeCapHours: 4,
    overtimeMultiplier: 1.5,
    weightVarianceToleranceKg: 200
  };
  const [generalForm, setGeneralForm] = useState({ ...clientSettings });

  const handleGeneralChange = (field, val) => {
    const updated = { ...generalForm, [field]: val };
    setGeneralForm(updated);
    if (activeClient) {
      updateClient(activeClient.id, { settings: updated });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">General Settings</h1>
      </div>

      <div className="table-card" style={{ padding: '24px', maxWidth: '780px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Date Format</label>
            <select className="form-select" value={generalForm.dateFormat} onChange={e => handleGeneralChange('dateFormat', e.target.value)}>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Zone</label>
            <select className="form-select" value={generalForm.timeZone} onChange={e => handleGeneralChange('timeZone', e.target.value)}>
              <option value="Europe/Rome (UTC+1)">Europe/Rome (UTC+1)</option>
              <option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option>
              <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-select" value={generalForm.language} onChange={e => handleGeneralChange('language', e.target.value)}>
              <option value="English">English</option>
              <option value="Italian">Italian</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-select" value={generalForm.currency} onChange={e => handleGeneralChange('currency', e.target.value)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Area Unit</label>
            <select className="form-select" value={generalForm.areaUnit} onChange={e => handleGeneralChange('areaUnit', e.target.value)}>
              <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
              <option value="Sq.M">Sq.M (Square Meters)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Weight Unit</label>
            <select className="form-select" value={generalForm.weightUnit} onChange={e => handleGeneralChange('weightUnit', e.target.value)}>
              <option value="Tons">Tons (Metric Tons)</option>
              <option value="CBM">CBM (Cubic Meters)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tax Rate (%)</label>
            <input type="number" className="form-input" placeholder="18" value={generalForm.taxRate} onChange={e => handleGeneralChange('taxRate', Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label className="form-label">Daily Overtime Cap (Hours)</label>
            <input type="number" className="form-input" placeholder="4" value={generalForm.dailyOvertimeCapHours} onChange={e => handleGeneralChange('dailyOvertimeCapHours', Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label className="form-label">Overtime Rate Multiplier</label>
            <input type="number" step="0.1" className="form-input" placeholder="1.5" value={generalForm.overtimeMultiplier} onChange={e => handleGeneralChange('overtimeMultiplier', Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label className="form-label">Weighbridge Tolerance (Kg)</label>
            <input type="number" className="form-input" placeholder="200" value={generalForm.weightVarianceToleranceKg} onChange={e => handleGeneralChange('weightVarianceToleranceKg', Number(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}
