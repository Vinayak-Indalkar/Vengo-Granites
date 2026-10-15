import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BuyerAccountsTab } from '../components/buyer/BuyerAccountsTab';

export function BuyerAccountsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'payables';
  const tab = searchParams.get('tab') || (submenu === 'payables' ? 'invoices' : '3-way-match');

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
        {submenu === 'payables' && (
          <>
            <button className={`btn btn-sm ${tab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('invoices')} style={{ fontWeight: tab === 'invoices' ? 600 : 500 }}>
              Invoices
            </button>
            <button className={`btn btn-sm ${tab === 'payments' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('payments')} style={{ fontWeight: tab === 'payments' ? 600 : 500 }}>
              Payments
            </button>
            <button className={`btn btn-sm ${tab === 'ageing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('ageing')} style={{ fontWeight: tab === 'ageing' ? 600 : 500 }}>
              Ageing
            </button>
            <button className={`btn btn-sm ${tab === 'statement' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('statement')} style={{ fontWeight: tab === 'statement' ? 600 : 500 }}>
              Statement
            </button>
          </>
        )}

        {submenu === 'match' && (
          <button className={`btn btn-sm ${tab === '3-way-match' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('3-way-match')} style={{ fontWeight: tab === '3-way-match' ? 600 : 500 }}>
            3-Way Match
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <BuyerAccountsTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
