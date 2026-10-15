import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, Plus, Trash2, CheckCircle2, X } from 'lucide-react';

export function CustomFieldsModal({ isOpen, onClose }) {
  const { customFields, addCustomField, showToast } = useApp();

  const [targetEntity, setTargetEntity] = useState('Supplier'); // 'Supplier' | 'Buyer' | 'Contractor'
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text'); // 'text' | 'number' | 'date' | 'select' | 'checkbox'
  const [isRequired, setIsRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState('');

  if (!isOpen) return null;

  const entityFields = (customFields || []).filter(f => (f.entity || 'Supplier') === targetEntity);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const newField = {
      id: `CF-${Date.now().toString().slice(-4)}`,
      name: fieldName.trim(),
      label: fieldName.trim(),
      entity: targetEntity,
      type: fieldType,
      required: isRequired,
      options: fieldType === 'select' ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    if (addCustomField) {
      addCustomField(newField);
    }
    setFieldName('');
    setOptionsStr('');
    setIsRequired(false);
    if (showToast) showToast(`Custom field "${newField.name}" added to ${targetEntity}!`, 'success');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', width: '560px', maxWidth: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--brand-color)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              Configure Custom Entity Fields
            </h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target entity selector tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            {['Supplier', 'Buyer', 'Contractor'].map(entity => (
              <button
                key={entity}
                type="button"
                className={`btn btn-sm ${targetEntity === entity ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTargetEntity(entity)}
                style={{ fontWeight: targetEntity === entity ? 700 : 500 }}
              >
                {entity} Fields
              </button>
            ))}
          </div>

          {/* Existing Fields List */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Configured {targetEntity} Attributes ({entityFields.length})
            </div>
            {entityFields.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-sunken)', borderRadius: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                No custom fields configured for {targetEntity} yet. Use the form below to add attributes.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entityFields.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--surface-sunken)', borderRadius: '6px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{f.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>
                        ({f.type}{f.required ? ' • required' : ''})
                      </span>
                    </div>
                    <span className="badge badge-subtle" style={{ fontSize: '10px' }}>Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Field Form */}
          <form onSubmit={handleCreate} style={{ padding: '14px', border: '1px solid var(--line)', borderRadius: '8px', backgroundColor: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Add New Custom Field for {targetEntity}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Field Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. Mine Certificate Validity"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Data Type</label>
                <select
                  className="form-control"
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Yes / No</option>
                </select>
              </div>
            </div>

            {fieldType === 'select' && (
              <div>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Dropdown Options (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={optionsStr}
                  onChange={(e) => setOptionsStr(e.target.value)}
                  placeholder="Option A, Option B, Option C"
                />
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              <span>Mandatory Field</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '4px' }}
            >
              <Plus size={13} />
              <span>Add Custom Field</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
