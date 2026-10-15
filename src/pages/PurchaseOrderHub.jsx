import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BuyerPOList } from '../components/trade/BuyerPOList';
import { QuarryPOList } from '../components/trade/QuarryPOList';

export function PurchaseOrderHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tradeBuyerPOs = [], tradeQuarryPOs = [] } = useApp();

  const submenu = searchParams.get('submenu') || 'buyer-pos';

  // Count pending badges
  const pendingBuyerPOCount = tradeBuyerPOs.filter(b => b.status === 'Pending').length;
  const pendingQuarryPOCount = tradeQuarryPOs.filter(q => q.status === 'Pending Approval').length;

  const tabsConfig = {
    'buyer-pos': [
      { key: 'pending', label: 'Pending', count: pendingBuyerPOCount },
      { key: 'approved', label: 'Approved' },
      { key: 'all', label: 'All' }
    ],
    'quarry-pos': [
      { key: 'open', label: 'Open' },
      { key: 'approvals', label: 'Approvals', count: pendingQuarryPOCount },
      { key: 'closed', label: 'Closed' },
      { key: 'new-po', label: 'New PO' }
    ]
  };

  const activeTabsList = tabsConfig[submenu] || tabsConfig['buyer-pos'];
  const defaultTab = submenu === 'quarry-pos' ? 'open' : activeTabsList[0].key;
  const currentTab = searchParams.get('tab') || defaultTab;

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Secondary Horizontal Tab Bar */}
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
        {activeTabsList.map(t => (
          <button
            key={t.key}
            type="button"
            className={`btn btn-sm ${currentTab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.key)}
            style={{
              whiteSpace: 'nowrap',
              fontWeight: currentTab === t.key ? 600 : 500,
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
          {submenu === 'buyer-pos' && <BuyerPOList activeTab={currentTab} />}
          {submenu === 'quarry-pos' && <QuarryPOList activeTab={currentTab} />}
        </div>
      </div>
    </div>
  );
}
