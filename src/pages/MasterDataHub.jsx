import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MastersHub } from '../components/settings/MastersHub';
import {
  ClientsScreen,
  YardLocationsScreen,
  UsersScreen,
  StoneTypesScreen,
  RateListsScreen
} from './MasterDataPages';
import {
  SuperAdminClientsScreen,
  SuperAdminBrandingScreen,
  SuperAdminAppAssignmentScreen,
  SuperAdminPlansScreen,
  SuperAdminReportsScreen,
  SuperAdminActivityLogScreen
} from './SuperAdminPages';

export function MasterDataHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = currentRole === 'QT Super Admin';
  const rawTab = searchParams.get('tab');
  const validSuperTabs = ['clients', 'apps', 'activity'];

  const tab = validSuperTabs.includes(rawTab) ? rawTab : 'clients';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // 1. QT Super Admin: Master Setup Hub
  if (isSuperAdmin) {
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

  // 2. Client / Supplier Admin: Masters -> Inventory Hub
  return <MastersHub />;
}
