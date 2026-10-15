import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Globe, CheckCircle2, Sliders, Calendar, DollarSign, Scale, Clock, Layers } from 'lucide-react';
import { CustomFieldsBuilder } from '../components/settings/CustomFieldsBuilder';

export function SettingsScreen() {
  const {
    currentRole,
    activeClient,
    updateClient,
    language,
    setLanguage,
    t,
    SUPPORTED_LANGUAGES
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'general';

  const clientSettings = activeClient?.settings || {
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Asia/Kolkata (UTC+5:30)',
    language: language || 'English',
    currency: 'INR',
    areaUnit: 'Sq.Ft',
    weightUnit: 'Tons',
    taxRate: 18,
    dailyOvertimeCapHours: 4,
    overtimeMultiplier: 1.5,
    weightVarianceToleranceKg: 200
  };
  const [generalForm, setGeneralForm] = useState({ ...clientSettings, language: language || clientSettings.language });

  useEffect(() => {
    setGeneralForm(prev => ({ ...prev, language }));
  }, [language]);

  const handleGeneralChange = (field, val) => {
    const updated = { ...generalForm, [field]: val };
    setGeneralForm(updated);

    if (field === 'language') {
      setLanguage(val);
    }

    if (activeClient) {
      updateClient(activeClient.id, { settings: updated });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">
          {submenu === 'custom-fields' ? t('Custom Fields Builder') : t('General Settings')}
        </h1>
        {currentRole === 'Supplier/Client Admin' && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {submenu === 'custom-fields'
              ? t('Settings • Custom Fields Builder')
              : t('Settings • General Configuration')}
          </div>
        )}
      </div>

      {/* RENDER ACTIVE SUBMENU */}
      {submenu === 'custom-fields' ? (
        <CustomFieldsBuilder />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', width: '100%', alignItems: 'stretch' }}>
        {/* Dedicated Languages Section Card (Left Column) */}
        <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <Globe size={20} color="var(--brand-color)" />
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {t('Language')} (Interface Localization)
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Select your preferred application language. Changes apply immediately across all navigation, tables, and actions.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {(SUPPORTED_LANGUAGES || [
              { code: 'English', label: 'English', native: 'English' },
              { code: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
              { code: 'Odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
              { code: 'Telugu', label: 'Telugu', native: 'తెలుగు' }
            ]).map((lang) => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleGeneralChange('language', lang.code)}
                  style={{
                    border: `2px solid ${isSelected ? 'var(--brand-color)' : 'var(--line)'}`,
                    borderRadius: '8px',
                    padding: '14px',
                    backgroundColor: isSelected ? 'var(--brand-surface, #EEF2F6)' : 'var(--white)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? 'var(--brand-color)' : 'var(--ink)' }}>
                      {lang.native}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={16} color="var(--brand-color)" />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {lang.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>{t('Select Language')} (Dropdown)</label>
            <select
              className="form-select"
              value={generalForm.language}
              onChange={e => handleGeneralChange('language', e.target.value)}
              style={{ width: '100%', maxWidth: '100%' }}
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Active Scope Summary */}
          <div style={{
            marginTop: 'auto',
            paddingTop: '16px'
          }}>
            <div style={{
              padding: '12px 14px',
              backgroundColor: 'var(--surface-sunken)',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                {t('Active Localization Scope')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Current Language:</span>
                <strong style={{ color: 'var(--brand-color)' }}>{language}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Global Currency:</span>
                <strong style={{ color: 'var(--ink)' }}>{generalForm.currency} (₹ / INR Standard)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>UI Translation:</span>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Active & Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Form Settings Card */}
        <div className="table-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            <Sliders size={18} color="var(--brand-color)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              {t('General Settings')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">{t('Date Format')}</label>
              <select className="form-select" value={generalForm.dateFormat} onChange={e => handleGeneralChange('dateFormat', e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Time Zone')}</label>
              <select className="form-select" value={generalForm.timeZone} onChange={e => handleGeneralChange('timeZone', e.target.value)}>
                <option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option>
                <option value="Europe/Rome (UTC+1)">Europe/Rome (UTC+1)</option>
                <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Currency')}</label>
              <select className="form-select" value={generalForm.currency} onChange={e => handleGeneralChange('currency', e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Area Unit')}</label>
              <select className="form-select" value={generalForm.areaUnit} onChange={e => handleGeneralChange('areaUnit', e.target.value)}>
                <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                <option value="Sq.M">Sq.M (Square Meters)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Weight Unit')}</label>
              <select className="form-select" value={generalForm.weightUnit} onChange={e => handleGeneralChange('weightUnit', e.target.value)}>
                <option value="Tons">Tons (Metric Tons)</option>
                <option value="CBM">CBM (Cubic Meters)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('Tax Rate (%)')}</label>
              <input type="number" className="form-input" placeholder="18" value={generalForm.taxRate} onChange={e => handleGeneralChange('taxRate', Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('Daily Overtime Cap (Hours)')}</label>
              <input type="number" className="form-input" placeholder="4" value={generalForm.dailyOvertimeCapHours} onChange={e => handleGeneralChange('dailyOvertimeCapHours', Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('Overtime Rate Multiplier')}</label>
              <input type="number" step="0.1" className="form-input" placeholder="1.5" value={generalForm.overtimeMultiplier} onChange={e => handleGeneralChange('overtimeMultiplier', Number(e.target.value))} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('Weighbridge Tolerance (Kg)')}</label>
              <input type="number" className="form-input" placeholder="200" value={generalForm.weightVarianceToleranceKg} onChange={e => handleGeneralChange('weightVarianceToleranceKg', Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
