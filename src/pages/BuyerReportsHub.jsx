import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BuyerReportsTab } from '../components/buyer/BuyerReportsTab';

export function BuyerReportsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'reports';
  const tab = searchParams.get('tab') || 'pr-status';

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
        <button className={`btn btn-sm ${tab === 'pr-status' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('pr-status')}>
          PR Status
        </button>
        <button className={`btn btn-sm ${tab === 'purchase-register' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('purchase-register')}>
          Purchase Register
        </button>
        <button className={`btn btn-sm ${tab === 'payables-ageing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('payables-ageing')}>
          Payables Ageing
        </button>
        <button className={`btn btn-sm ${tab === 'stock-ledger' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('stock-ledger')}>
          Stock Ledger
        </button>
        <button className={`btn btn-sm ${tab === 'receipt-variance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('receipt-variance')}>
          Receipt Variance
        </button>
        <button className={`btn btn-sm ${tab === 'returns-summary' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('returns-summary')}>
          Returns Summary
        </button>
        <button className={`btn btn-sm ${tab === 'supplier-performance' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('supplier-performance')}>
          Supplier Performance
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <BuyerReportsTab tab={tab} />
        </div>
      </div>
    </div>
  );
}
