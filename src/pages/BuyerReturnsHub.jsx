import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BuyerReturnsTab } from '../components/buyer/BuyerReturnsTab';

export function BuyerReturnsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'returns';
  const tab = searchParams.get('tab') || (submenu === 'returns' ? 'my-returns' : 'damage-log');

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
        {submenu === 'returns' && (
          <>
            <button className={`btn btn-sm ${tab === 'new-return' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('new-return')} style={{ fontWeight: tab === 'new-return' ? 600 : 500 }}>
              New Return
            </button>
            <button className={`btn btn-sm ${tab === 'my-returns' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('my-returns')} style={{ fontWeight: tab === 'my-returns' ? 600 : 500 }}>
              My Returns
            </button>
            <button className={`btn btn-sm ${tab === 'credit-notes' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('credit-notes')} style={{ fontWeight: tab === 'credit-notes' ? 600 : 500 }}>
              Credit Notes
            </button>
          </>
        )}

        {submenu === 'damage' && (
          <button className={`btn btn-sm ${tab === 'damage-log' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('damage-log')} style={{ fontWeight: tab === 'damage-log' ? 600 : 500 }}>
            Damage Log
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <BuyerReturnsTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
