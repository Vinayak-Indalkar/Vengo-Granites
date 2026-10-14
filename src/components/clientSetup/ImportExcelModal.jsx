import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UploadCloud, Download, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export function ImportExcelModal({ isOpen, onClose }) {
  const { addSupplier, addCustomer, addContractor, showToast } = useApp();

  const [targetEntity, setTargetEntity] = useState('Supplier'); // 'Supplier' | 'Buyer' | 'Contractor'
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    let headers = [];
    let sampleRow = [];

    if (targetEntity === 'Supplier') {
      headers = ['Name', 'Type', 'TaxID', 'PAN', 'Phone', 'Email', 'City', 'State', 'PaymentDays', 'CreditDays'];
      sampleRow = ['Rajasthan Green Mines Ltd', 'Quarry', '08AABCR1234F1Z1', 'AABCR1234F', '+91 98290 11223', 'sales@rgm.com', 'Udaipur', 'Rajasthan', '30', '45'];
    } else if (targetEntity === 'Buyer') {
      headers = ['Name', 'Type', 'TaxID', 'PAN', 'Phone', 'Email', 'City', 'State', 'CreditLimit', 'CreditDays'];
      sampleRow = ['Grand Horizon Developers', 'Builder', '27AABCG5544H1Z9', 'AABCG5544H', '+91 98200 44332', 'procure@horizon.com', 'Mumbai', 'Maharashtra', '1000000', '45'];
    } else {
      headers = ['CompanyName', 'ServiceType', 'ContactPerson', 'Phone', 'Email', 'City', 'State', 'RatePerUnit', 'BillingBasis', 'PaymentCycle'];
      sampleRow = ['Shiv Shakti Heavy Cranes', 'Heavy Rigging & Yard Crane', 'Kalu Ram', '+91 98291 99887', 'info@shivcranes.com', 'Makrana', 'Rajasthan', '850', 'Per Day', 'Weekly'];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${targetEntity}_Import_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setErrorMsg('File contains no data rows.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const rowObj = {};
          headers.forEach((header, idx) => {
            rowObj[header] = values[idx] || '';
          });
          rows.push(rowObj);
        }

        setParsedRows(rows);
      } catch (err) {
        setErrorMsg('Failed to parse CSV file. Please check format.');
      }
    };

    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    let successCount = 0;
    parsedRows.forEach(row => {
      if (targetEntity === 'Supplier') {
        addSupplier({
          name: row.Name || row.name || 'Imported Supplier',
          type: row.Type || row.type || 'Material Vendor',
          taxId: row.TaxID || row.taxId || '',
          pan: row.PAN || row.pan || '',
          phone: row.Phone || row.phone || '',
          email: row.Email || row.email || '',
          city: row.City || row.city || '',
          state: row.State || row.state || '',
          paymentDays: Number(row.PaymentDays || row.paymentDays) || 30,
          creditDays: Number(row.CreditDays || row.creditDays) || 30
        });
        successCount++;
      } else if (targetEntity === 'Buyer') {
        addCustomer({
          name: row.Name || row.name || 'Imported Buyer',
          type: row.Type || row.type || 'Direct End-User',
          taxId: row.TaxID || row.taxId || '',
          pan: row.PAN || row.pan || '',
          phone: row.Phone || row.phone || '',
          email: row.Email || row.email || '',
          city: row.City || row.city || '',
          state: row.State || row.state || '',
          creditLimit: Number(row.CreditLimit || row.creditLimit) || 500000,
          creditDays: Number(row.CreditDays || row.creditDays) || 30
        });
        successCount++;
      } else {
        addContractor({
          companyName: row.CompanyName || row.companyName || 'Imported Contractor',
          serviceType: row.ServiceType || row.serviceType || 'Gang Saw Slicing',
          contactPerson: row.ContactPerson || row.contactPerson || '',
          phone: row.Phone || row.phone || '',
          email: row.Email || row.email || '',
          city: row.City || row.city || '',
          state: row.State || row.state || '',
          ratePerUnit: Number(row.RatePerUnit || row.ratePerUnit) || 18,
          billingBasis: row.BillingBasis || row.billingBasis || 'Per Sq.Ft',
          paymentCycle: row.PaymentCycle || row.paymentCycle || 'Weekly'
        });
        successCount++;
      }
    });

    if (showToast) showToast(`Successfully imported ${successCount} ${targetEntity} records!`, 'success');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '10px', width: '600px', maxWidth: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} color="var(--brand-color)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              Bulk Import Master Data (CSV / Excel)
            </h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Entity Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Supplier', 'Buyer', 'Contractor'].map(entity => (
                <button
                  key={entity}
                  type="button"
                  className={`btn btn-sm ${targetEntity === entity ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => {
                    setTargetEntity(entity);
                    setParsedRows([]);
                    setFileName('');
                  }}
                  style={{ fontWeight: targetEntity === entity ? 700 : 500 }}
                >
                  Import {entity}s
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadTemplate}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={13} />
              <span>Download {targetEntity} Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div style={{
            border: '2px dashed var(--line)',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-sunken)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UploadCloud size={32} color="var(--muted)" />
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Choose a CSV file to import
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              Ensure column headers match the downloadable template
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ marginTop: '8px', fontSize: '12px' }}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--rose-600)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Preview Rows ({parsedRows.length} total)</span>
                <span style={{ color: 'var(--teal-600)' }}>File: {fileName}</span>
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '6px' }}>
                <table className="table" style={{ fontSize: '11px', margin: 0 }}>
                  <thead>
                    <tr>
                      {Object.keys(parsedRows[0]).slice(0, 5).map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {Object.keys(parsedRows[0]).slice(0, 5).map(h => (
                          <td key={h}>{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExecuteImport}
            disabled={parsedRows.length === 0}
          >
            Import {parsedRows.length} {targetEntity} Records
          </button>
        </div>
      </div>
    </div>
  );
}
