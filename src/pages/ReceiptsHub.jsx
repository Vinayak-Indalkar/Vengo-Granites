import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReceiptsGRNTab } from '../components/trade/ReceiptsGRNTab';
import { useApp } from '../context/AppContext';

export function ReceiptsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'grn';
  const { tradeGRNs = [] } = useApp();

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const pendingVarianceCount = tradeGRNs.filter(g => g.approvalStatus === 'Pending Approval').length;

  const tabs = [
    { key: 'grn', label: 'GRN' },
    { key: 'live-weights', label: 'Live Weights' },
    { key: 'block-check', label: 'Block Check' },
    { key: 'variance', label: 'Variance', count: pendingVarianceCount }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Horizontal Tabs Bar */}
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

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <ReceiptsGRNTab activeTab={tab} />
        </div>
      </div>
    </div>
  );
}

