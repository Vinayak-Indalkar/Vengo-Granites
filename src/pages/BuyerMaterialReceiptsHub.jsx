import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BuyerMaterialReceiptsTab } from '../components/buyer/BuyerMaterialReceiptsTab';

export function BuyerMaterialReceiptsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'receiving';
  const tab = searchParams.get('tab') || 'expected';
  const { tradeDispatches = [], tradeChallans = [], activeBuyerId } = useApp();

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  const tabs = [
    { key: 'expected', label: 'Expected' },
    { key: 'new-grn', label: 'New GRN' },
    { key: 'received', label: 'Received' },
    { key: 'discrepancies', label: 'Discrepancies' }
  ];

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
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.key)}
            style={{
              whiteSpace: 'nowrap',
              fontWeight: tab === t.key ? 600 : 500,
              fontSize: '13px'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <BuyerMaterialReceiptsTab tab={tab} />
        </div>
      </div>
    </div>
  );
}
