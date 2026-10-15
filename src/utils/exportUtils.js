/**
 * Universal Export Utilities for Excel (CSV) and PDF
 * Follows AquaPulse Enterprise design system guidelines
 */

function extractText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (Array.isArray(val)) {
    return val.map(extractText).join('; ');
  }
  if (typeof val === 'object') {
    // If React element or object with label/name
    if (val.props && val.props.children) {
      return extractText(val.props.children);
    }
    if (val.name) return String(val.name);
    if (val.label) return String(val.label);
    if (val.code) return String(val.code);
  }
  return '';
}

export function exportToExcel(columns = [], data = [], filename = 'Export') {
  if (!columns.length || !data.length) return;

  const validCols = columns.filter(c => c.key !== 'actions' && c.title !== 'Actions');
  const headers = validCols.map(c => `"${(c.title || c.header || c.key).replace(/"/g, '""')}"`);

  const rows = data.map(item => {
    return validCols.map(c => {
      let rawVal = item[c.key];
      if (c.render && typeof c.render === 'function') {
        try {
          rawVal = c.render(rawVal, item);
        } catch {
          rawVal = item[c.key];
        }
      }
      const textVal = extractText(rawVal);
      return `"${textVal.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(columns = [], data = [], title = 'Report') {
  if (!columns.length || !data.length) return;

  const validCols = columns.filter(c => c.key !== 'actions' && c.title !== 'Actions');
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headersHtml = validCols.map(c => `<th style="padding: 8px 10px; border-bottom: 2px solid #222350; text-align: left; font-size: 11px; text-transform: uppercase;">${c.title || c.header || c.key}</th>`).join('');

  const rowsHtml = data.map((item, idx) => {
    const cellsHtml = validCols.map(c => {
      let rawVal = item[c.key];
      if (c.render && typeof c.render === 'function') {
        try {
          rawVal = c.render(rawVal, item);
        } catch {
          rawVal = item[c.key];
        }
      }
      const textVal = extractText(rawVal);
      return `<td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11.5px;">${textVal}</td>`;
    }).join('');
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `<tr style="background: ${bg};">${cellsHtml}</tr>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Granite ERP</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #222350; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 18px; font-weight: bold; color: #222350; margin: 0; }
          .meta { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${title}</h1>
            <div class="meta">AquaPulse Enterprise Report • Total Records: ${data.length}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div>Granite ERP System</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
