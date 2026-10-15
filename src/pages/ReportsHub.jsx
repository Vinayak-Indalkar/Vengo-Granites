import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ComprehensiveReportsTab } from '../components/reports/ComprehensiveReportsTab';

export function ReportsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'sales';
  const tab = searchParams.get('tab') || (submenu === 'sales' ? 'sales' : submenu === 'purchase' ? 'purchase-register' : submenu === 'stock' ? 'stock-ledger' : submenu === 'quality' ? 'returns-summary' : 'audit-log');

  const setSubmenuAndTab = (newSubmenu, defaultTab) => {
    setSearchParams({ submenu: newSubmenu, tab: defaultTab });
  };

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Level 3: Tabs */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        {submenu === 'sales' && (
          <>
            <button className={`btn btn-sm ${tab === 'sales' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('sales')} style={{ fontWeight: tab === 'sales' ? 600 : 500 }}>
              Sales
            </button>
            <button className={`btn btn-sm ${tab === 'receivables-ageing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('receivables-ageing')} style={{ fontWeight: tab === 'receivables-ageing' ? 600 : 500 }}>
              Receivables Ageing
            </button>
            <button className={`btn btn-sm ${tab === 'buyer-statement' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('buyer-statement')} style={{ fontWeight: tab === 'buyer-statement' ? 600 : 500 }}>
              Buyer Statement
            </button>
            <button className={`btn btn-sm ${tab === 'tax-summary' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('tax-summary')} style={{ fontWeight: tab === 'tax-summary' ? 600 : 500 }}>
              Tax Summary
            </button>
          </>
        )}

        {submenu === 'purchase' && (
          <>
            <button className={`btn btn-sm ${tab === 'purchase-register' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('purchase-register')} style={{ fontWeight: tab === 'purchase-register' ? 600 : 500 }}>
              Purchase Register
            </button>
            <button className={`btn btn-sm ${tab === 'payables-ageing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('payables-ageing')} style={{ fontWeight: tab === 'payables-ageing' ? 600 : 500 }}>
              Payables Ageing
            </button>
            <button className={`btn btn-sm ${tab === '3-way-match' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('3-way-match')} style={{ fontWeight: tab === '3-way-match' ? 600 : 500 }}>
              3-Way Match
            </button>
            <button className={`btn btn-sm ${tab === 'supplier-performance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('supplier-performance')} style={{ fontWeight: tab === 'supplier-performance' ? 600 : 500 }}>
              Supplier Performance
            </button>
          </>
        )}

        {submenu === 'stock' && (
          <>
            <button className={`btn btn-sm ${tab === 'stock-ledger' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('stock-ledger')} style={{ fontWeight: tab === 'stock-ledger' ? 600 : 500 }}>
              Stock Ledger
            </button>
            <button className={`btn btn-sm ${tab === 'yield' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('yield')} style={{ fontWeight: tab === 'yield' ? 600 : 500 }}>
              Yield
            </button>
            <button className={`btn btn-sm ${tab === 'profit-by-block' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('profit-by-block')} style={{ fontWeight: tab === 'profit-by-block' ? 600 : 500 }}>
              Profit by Block
            </button>
          </>
        )}

        {submenu === 'quality' && (
          <>
            <button className={`btn btn-sm ${tab === 'returns-summary' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('returns-summary')} style={{ fontWeight: tab === 'returns-summary' ? 600 : 500 }}>
              Returns Summary
            </button>
            <button className={`btn btn-sm ${tab === 'defect-summary' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('defect-summary')} style={{ fontWeight: tab === 'defect-summary' ? 600 : 500 }}>
              Defect Summary
            </button>
          </>
        )}

        {submenu === 'audit' && (
          <button className={`btn btn-sm ${tab === 'audit-log' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('audit-log')} style={{ fontWeight: tab === 'audit-log' ? 600 : 500 }}>
            Audit Log
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <ComprehensiveReportsTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
