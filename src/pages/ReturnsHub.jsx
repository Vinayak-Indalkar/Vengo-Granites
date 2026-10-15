import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ReturnsDefectsModuleTab } from '../components/trade/ReturnsDefectsModuleTab';

export function ReturnsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'returns';
  const tab = searchParams.get('tab') || (submenu === 'returns' ? 'buyer-returns' : 'defective-store');

  const { tradeReturns = [] } = useApp();

  const setSubmenuAndTab = (newSubmenu, defaultTab) => {
    setSearchParams({ submenu: newSubmenu, tab: defaultTab });
  };

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  const pendingReturnsCount = tradeReturns.filter(r => r.status === 'Raised').length;

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
        {submenu === 'returns' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'buyer-returns' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('buyer-returns')}
              style={{ fontWeight: tab === 'buyer-returns' ? 600 : 500 }}
            >
              Buyer Returns
            </button>
            <button
              className={`btn btn-sm ${tab === 'credit-notes' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('credit-notes')}
              style={{ fontWeight: tab === 'credit-notes' ? 600 : 500 }}
            >
              Credit Notes
            </button>
          </>
        )}

        {submenu === 'defects' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'defective-store' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('defective-store')}
              style={{ fontWeight: tab === 'defective-store' ? 700 : 500 }}
            >
              Defective Store
            </button>
            <button
              className={`btn btn-sm ${tab === 'debit-notes' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('debit-notes')}
              style={{ fontWeight: tab === 'debit-notes' ? 700 : 500 }}
            >
              Debit Notes
            </button>
            <button
              className={`btn btn-sm ${tab === 'scrap-write-off' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('scrap-write-off')}
              style={{ fontWeight: tab === 'scrap-write-off' ? 700 : 500 }}
            >
              Scrap Write-off
            </button>
          </>
        )}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <ReturnsDefectsModuleTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
