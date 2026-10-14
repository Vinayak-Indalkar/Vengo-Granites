import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  Search,
  Columns3,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { Pagination } from '../molecules/NavigationControls';
import { ViewDrawer } from './ModalsAndDrawers';

/**
 * DataTable (Organism)
 * Full-featured enterprise data table:
 * - Client-side pagination & row count configuration
 * - Instant global search & per-column multi-filter
 * - Column visibility customization
 * - Multi-format export: CSV, Excel (.xls), Print/PDF
 * - Row click inspection via ViewDrawer
 */
export function DataTable({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  pageSize: initialPageSize = 5,
  onRowClick = null
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tableSearch, setTableSearch] = useState('');
  const [selectedRowDetails, setSelectedRowDetails] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [draftFilters, setDraftFilters] = useState({});
  const [hiddenColumns, setHiddenColumns] = useState({});

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const [filterPos, setFilterPos] = useState({ top: '0px', left: '0px' });
  const [downloadPos, setDownloadPos] = useState({ top: '0px', left: '0px' });
  const [colPickerPos, setColPickerPos] = useState({ top: '0px', left: '0px' });

  const filterRef = useRef(null);
  const filterMenuRef = useRef(null);

  const downloadRef = useRef(null);
  const downloadMenuRef = useRef(null);

  const columnPickerRef = useRef(null);
  const colPickerMenuRef = useRef(null);

  const calcMenuPos = (btnRef, menuWidth) => {
    if (!btnRef.current) return { top: '0px', left: '0px' };
    const rect = btnRef.current.getBoundingClientRect();
    let left = rect.right - menuWidth;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;
    return {
      top: `${rect.bottom + 6}px`,
      left: `${left}px`
    };
  };

  const toggleFilter = () => {
    if (!isFilterOpen) {
      setDraftFilters({ ...columnFilters });
      setFilterPos(calcMenuPos(filterRef, 280));
    }
    setIsFilterOpen(!isFilterOpen);
    setIsDownloadOpen(false);
    setIsColumnPickerOpen(false);
  };

  const toggleDownload = () => {
    if (!isDownloadOpen) {
      setDownloadPos(calcMenuPos(downloadRef, 170));
    }
    setIsDownloadOpen(!isDownloadOpen);
    setIsFilterOpen(false);
    setIsColumnPickerOpen(false);
  };

  const toggleColPicker = () => {
    if (!isColumnPickerOpen) {
      setColPickerPos(calcMenuPos(columnPickerRef, 220));
    }
    setIsColumnPickerOpen(!isColumnPickerOpen);
    setIsFilterOpen(false);
    setIsDownloadOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        filterRef.current && !filterRef.current.contains(e.target) &&
        filterMenuRef.current && !filterMenuRef.current.contains(e.target)
      ) {
        setIsFilterOpen(false);
      }
      if (
        downloadRef.current && !downloadRef.current.contains(e.target) &&
        downloadMenuRef.current && !downloadMenuRef.current.contains(e.target)
      ) {
        setIsDownloadOpen(false);
      }
      if (
        columnPickerRef.current && !columnPickerRef.current.contains(e.target) &&
        colPickerMenuRef.current && !colPickerMenuRef.current.contains(e.target)
      ) {
        setIsColumnPickerOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isFilterOpen) setFilterPos(calcMenuPos(filterRef, 280));
      if (isDownloadOpen) setDownloadPos(calcMenuPos(downloadRef, 170));
      if (isColumnPickerOpen) setColPickerPos(calcMenuPos(columnPickerRef, 220));
    }

    if (isFilterOpen || isDownloadOpen || isColumnPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isFilterOpen, isDownloadOpen, isColumnPickerOpen]);

  // Export handlers
  const exportData = (format) => {
    setIsDownloadOpen(false);
    const exportCols = visibleColumns.filter(c => c.header !== 'Action' && c.header !== 'Actions');
    const headers = exportCols.map(c => c.header);
    
    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...sortedData.map(row => 
          exportCols.map(c => {
            const val = c.accessor ? (row[c.accessor] ?? '') : '';
            const cleaned = String(val).replace(/"/g, '""');
            return `"${cleaned}"`;
          }).join(',')
        )
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'excel') {
      let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
      excelContent += `<head><meta charset="utf-8"/></head><body><table border="1"><thead><tr>`;
      headers.forEach(h => { excelContent += `<th style="background:#222350;color:#fff;font-weight:bold;">${h}</th>`; });
      excelContent += `</tr></thead><tbody>`;
      sortedData.forEach(row => {
        excelContent += `<tr>`;
        exportCols.forEach(c => {
          const val = c.accessor ? (row[c.accessor] ?? '') : '';
          excelContent += `<td>${String(val)}</td>`;
        });
        excelContent += `</tr>`;
      });
      excelContent += `</tbody></table></body></html>`;
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `export_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        let html = `<html><head><title>Export Report</title><style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #172B4D; }
          h2 { color: #222350; margin-bottom: 8px; }
          .meta { font-size: 12px; color: #6B778C; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background-color: #222350; color: #ffffff; text-align: left; padding: 8px; font-weight: 600; }
          td { padding: 8px; border-bottom: 1px solid #DFE1E6; }
          tr:nth-child(even) td { background-color: #FAFBFC; }
        </style></head><body>`;
        html += `<h2>Granite ERP - Report Export</h2>`;
        html += `<div class="meta">Generated: ${new Date().toLocaleString()} | Total Records: ${sortedData.length}</div>`;
        html += `<table><thead><tr>`;
        headers.forEach(h => { html += `<th>${h}</th>`; });
        html += `</tr></thead><tbody>`;
        sortedData.forEach(row => {
          html += `<tr>`;
          exportCols.forEach(c => {
            const val = c.accessor ? (row[c.accessor] ?? '') : '';
            html += `<td>${String(val)}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table><script>window.onload = function() { window.print(); };</script></body></html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
      }
    }
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setDraftFilters({});
    setTableSearch('');
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (colKey) => {
    setHiddenColumns(prev => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length;

  const requestSort = (key) => {
    if (!key) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      key = null;
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const visibleColumns = useMemo(() => {
    return columns.filter(col => {
      const colId = col.accessor || col.header;
      return !hiddenColumns[colId];
    });
  }, [columns, hiddenColumns]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        const matchesGlobal = Object.values(row).some(val =>
          String(val ?? '').toLowerCase().includes(query)
        );
        if (!matchesGlobal) return false;
      }

      for (const [key, val] of Object.entries(columnFilters)) {
        if (!val) continue;
        const cellValue = String(row[key] ?? '').toLowerCase();
        if (!cellValue.includes(String(val).toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [data, tableSearch, columnFilters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = sortedData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="table-card" style={{ overflow: 'visible', position: 'relative' }}>
      {/* Table Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--soft)',
        borderTopLeftRadius: 'var(--r-16)',
        borderTopRightRadius: 'var(--r-16)',
        gap: '12px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 25
      }}>
        {/* Left Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="search-box" style={{ width: '220px', height: '32px', backgroundColor: 'var(--white)' }}>
            <Search size={13} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search in table..."
              value={tableSearch}
              onChange={e => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {tableSearch && (
              <button
                type="button"
                className="iconbtn"
                style={{ width: '18px', height: '18px', border: 'none', background: 'transparent' }}
                onClick={() => setTableSearch('')}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {(activeFilterCount > 0 || tableSearch) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={clearAllFilters}
              style={{ height: '32px', padding: '0 8px', fontSize: '11px', color: 'var(--ruby-text)' }}
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div ref={filterRef} style={{ display: 'inline-block' }}>
            <button
              type="button"
              className={`iconbtn ${isFilterOpen || activeFilterCount > 0 ? 'btn-primary' : ''}`}
              style={{
                width: '32px',
                height: '32px',
                position: 'relative'
              }}
              onClick={toggleFilter}
              title={activeFilterCount > 0 ? `${activeFilterCount} Active Filters` : "Filter Columns"}
            >
              <Filter size={14} />
              {activeFilterCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--ruby-text)',
                  color: 'var(--white)',
                  fontSize: '9px',
                  fontWeight: 700,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {isFilterOpen && createPortal(
            <div
              ref={filterMenuRef}
              style={{
                position: 'fixed',
                top: filterPos.top,
                left: filterPos.left,
                width: '280px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-12)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.04)',
                zIndex: 99999,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--line)'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Filter size={12} />
                  <span>Filter Columns</span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setColumnFilters({});
                      setDraftFilters({});
                    }}
                    style={{ height: '22px', padding: '0 6px', fontSize: '11px', color: 'var(--ruby-text)' }}
                  >
                    Reset All
                  </button>
                )}
              </div>

              <div style={{
                maxHeight: '320px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '2px'
              }}>
                {columns.filter(c => c.accessor).map((col, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>
                      {col.header}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: '30px', fontSize: '12px', padding: '0 8px' }}
                      placeholder={`Filter by ${col.header.toLowerCase()}...`}
                      value={draftFilters[col.accessor] || ''}
                      onChange={e => setDraftFilters(prev => ({ ...prev, [col.accessor]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setColumnFilters(draftFilters);
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid var(--line)',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ height: '28px', padding: '0 12px', fontSize: '12px' }}
                  onClick={() => {
                    setDraftFilters({});
                    setColumnFilters({});
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ height: '28px', padding: '0 14px', fontSize: '12px' }}
                  onClick={() => {
                    setColumnFilters(draftFilters);
                    setCurrentPage(1);
                    setIsFilterOpen(false);
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>,
            document.body
          )}

          <div ref={downloadRef} style={{ display: 'inline-block' }}>
            <button
              type="button"
              className={`iconbtn ${isDownloadOpen ? 'btn-primary' : ''}`}
              style={{ width: '32px', height: '32px' }}
              onClick={toggleDownload}
              title="Export / Download Options"
            >
              <Download size={14} />
            </button>
          </div>

          {isDownloadOpen && createPortal(
            <div
              ref={downloadMenuRef}
              style={{
                position: 'fixed',
                top: downloadPos.top,
                left: downloadPos.left,
                width: '170px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-12)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.04)',
                zIndex: 99999,
                padding: '6px 0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                padding: '4px 12px 6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                borderBottom: '1px solid var(--line)',
                textTransform: 'uppercase'
              }}>
                Export Options
              </div>
              <button
                type="button"
                onClick={() => exportData('csv')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--ink)',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--soft)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileSpreadsheet size={13} color="#0284c7" />
                <span>CSV Spreadsheet</span>
              </button>
              <button
                type="button"
                onClick={() => exportData('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--ink)',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--soft)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileSpreadsheet size={13} color="#107C41" />
                <span>Excel (.xls)</span>
              </button>
              <button
                type="button"
                onClick={() => exportData('pdf')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--ink)',
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--soft)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '13px' }}>📄</span>
                <span>Print / Save PDF</span>
              </button>
            </div>,
            document.body
          )}

          <div ref={columnPickerRef} style={{ display: 'inline-block' }}>
            <button
              type="button"
              className={`btn btn-sm ${isColumnPickerOpen ? 'btn-primary' : 'btn-secondary'}`}
              style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
              onClick={toggleColPicker}
              title="Toggle Visible Columns"
            >
              <Columns3 size={14} />
              <span>Columns</span>
            </button>
          </div>

          {isColumnPickerOpen && createPortal(
            <div
              ref={colPickerMenuRef}
              style={{
                position: 'fixed',
                top: colPickerPos.top,
                left: colPickerPos.left,
                width: '220px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-12)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.04)',
                zIndex: 99999,
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                padding: '4px 12px 8px 12px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                borderBottom: '1px solid var(--line)',
                textTransform: 'uppercase'
              }}>
                Visible Columns
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '4px 0' }}>
                {columns.map((col, idx) => {
                  const colId = col.accessor || col.header;
                  const isVisible = !hiddenColumns[colId];
                  return (
                    <label
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: 'var(--ink)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--soft)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumnVisibility(colId)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{col.header}</span>
                    </label>
                  );
                })}
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.map((col, idx) => {
                const isActionCol = col.header === 'Action' || col.header === 'Actions';
                const isSorted = sortConfig.key === col.accessor;
                return (
                  <th
                    key={idx}
                    style={{
                      textAlign: col.align || 'left',
                      width: col.width,
                      cursor: col.accessor ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: isActionCol ? 'sticky' : 'static',
                      right: isActionCol ? 0 : 'auto',
                      backgroundColor: 'var(--soft)',
                      zIndex: isActionCol ? 2 : 1
                    }}
                    onClick={() => col.accessor && requestSort(col.accessor)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col.header}</span>
                      {col.accessor && (
                        <span style={{ color: isSorted ? 'var(--teal-600)' : 'var(--faint)' }}>
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length || 1} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentRows.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="data-table-row"
                  onClick={(e) => {
                    if (e.target.closest('button, a, input, select, .iconbtn, .btn, .action-dropdown')) {
                      return;
                    }
                    if (onRowClick) {
                      onRowClick(row);
                    } else {
                      setSelectedRowDetails(row);
                    }
                  }}
                >
                  {visibleColumns.map((col, cIdx) => {
                    const isActionCol = col.header === 'Action' || col.header === 'Actions';
                    return (
                      <td
                        key={cIdx}
                        style={{
                          textAlign: col.align || 'left',
                          position: isActionCol ? 'sticky' : 'static',
                          right: isActionCol ? 0 : 'auto',
                          backgroundColor: isActionCol ? 'var(--white)' : 'transparent',
                          zIndex: isActionCol ? 1 : 'auto',
                          boxShadow: isActionCol ? '-2px 0 6px rgba(0,0,0,0.03)' : 'none'
                        }}
                      >
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--line)',
        backgroundColor: 'var(--soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Rows per page:</span>
          <select
            className="filter-select"
            style={{ height: '30px', fontSize: '12px', paddingLeft: '8px', paddingRight: '26px' }}
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedRowDetails && (
        <ViewDrawer
          isOpen={true}
          onClose={() => setSelectedRowDetails(null)}
          data={selectedRowDetails}
          columns={columns}
        />
      )}
    </div>
  );
}
