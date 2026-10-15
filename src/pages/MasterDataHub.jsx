import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MastersHub } from '../components/settings/MastersHub';
import { CommercialMastersTab } from '../components/masters/CommercialMastersTab';
import { AccountsMastersTab } from '../components/masters/AccountsMastersTab';
import { ReturnsDefectsMastersTab } from '../components/masters/ReturnsDefectsMastersTab';
import { LogisticsMastersTab } from '../components/masters/LogisticsMastersTab';
import { RulesMastersTab } from '../components/masters/RulesMastersTab';
import { UnitsMastersTab } from '../components/masters/UnitsMastersTab';
import {
  SuperAdminClientsScreen,
  SuperAdminAppAssignmentScreen,
  SuperAdminActivityLogScreen
} from './SuperAdminPages';

export function MasterDataHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = currentRole === 'QT Super Admin';

  // 1. QT Super Admin: Master Setup Hub
  if (isSuperAdmin) {
    const rawTab = searchParams.get('tab');
    const validSuperTabs = ['clients', 'apps', 'activity'];
    const tab = validSuperTabs.includes(rawTab) ? rawTab : 'clients';

    const setTab = (newTab) => {
      setSearchParams({ tab: newTab });
    };

    return (
      <div>
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--white)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          <button
            className={`btn btn-sm ${tab === 'clients' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('clients')}
          >
            Supplier / Clients
          </button>
          <button
            className={`btn btn-sm ${tab === 'apps' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('apps')}
          >
            App Assignment
          </button>
          <button
            className={`btn btn-sm ${tab === 'activity' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('activity')}
          >
            Activity Log
          </button>
        </div>

        {tab === 'clients' && <SuperAdminClientsScreen />}
        {tab === 'apps' && <SuperAdminAppAssignmentScreen />}
        {tab === 'activity' && <SuperAdminActivityLogScreen />}
      </div>
    );
  }

  // 2. Client / Supplier Admin: Master Setup Submenus
  // Submenu: 'inventory' | 'commercial' | 'accounts' | 'returns-defects' | 'logistics' | 'rules' | 'units'
  const submenu = searchParams.get('submenu') || 'inventory';

  // Tab definitions per submenu
  const tabsConfig = {
    commercial: [
      { key: 'payment-terms', label: 'Payment Terms' },
      { key: 'payment-modes', label: 'Payment Modes' },
      { key: 'currencies', label: 'Currencies' },
      { key: 'discount-types', label: 'Discount Types' },
      { key: 'other-charges', label: 'Other Charges' },
      { key: 'credit-policy', label: 'Credit Policy' }
    ],
    accounts: [
      { key: 'bank-accounts', label: 'Bank Accounts' },
      { key: 'accountHeads', label: 'Account Heads' },
      { key: 'financial-years', label: 'Financial Years' },
      { key: 'document-numbering', label: 'Document Numbering' }
    ],
    'returns-defects': [
      { key: 'return-reasons', label: 'Return Reasons' },
      { key: 'note-reasons', label: 'Note Reasons' },
      { key: 'scrap-reasons', label: 'Scrap Reasons' },
      { key: 'rejection-reasons', label: 'Rejection Reasons' }
    ],
    logistics: [
      { key: 'vehicles', label: 'Vehicles' },
      { key: 'drivers', label: 'Drivers' },
      { key: 'dispatch-locations', label: 'Dispatch Locations' }
    ],
    rules: [
      { key: 'approval-rules', label: 'Approval Rules' },
      { key: 'variance-tolerance', label: 'Variance Tolerance' }
    ],
    units: [
      { key: 'units', label: 'Units' },
      { key: 'conversions', label: 'Conversions' }
    ]
  };

  const activeTabsList = tabsConfig[submenu] || [];
  const defaultTab = activeTabsList.length > 0 ? activeTabsList[0].key : '';
  const currentTab = searchParams.get('tab') || defaultTab;

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  // If on existing Inventory submenu, render existing MastersHub
  if (submenu === 'inventory') {
    return <MastersHub />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Top Secondary Tabs Bar matching AquaPulse / Inbound UI */}
      {activeTabsList.length > 0 && (
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
                fontWeight: currentTab === t.key ? 700 : 500,
                fontSize: '13px'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          {submenu === 'commercial' && <CommercialMastersTab activeSubTab={currentTab} />}
          {submenu === 'accounts' && <AccountsMastersTab activeSubTab={currentTab} />}
          {submenu === 'returns-defects' && <ReturnsDefectsMastersTab activeSubTab={currentTab} />}
          {submenu === 'logistics' && <LogisticsMastersTab activeSubTab={currentTab} />}
          {submenu === 'rules' && <RulesMastersTab activeSubTab={currentTab} />}
          {submenu === 'units' && <UnitsMastersTab activeSubTab={currentTab} />}
        </div>
      </div>
    </div>
  );
}
