import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  const validClientTabs = ['customers', 'suppliers', 'stones', 'rates', 'yards', 'users'];

  const tab = isSuperAdmin
    ? (validSuperTabs.includes(rawTab) ? rawTab : 'clients')
    : (validClientTabs.includes(rawTab) ? rawTab : 'customers');

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

  // 2. Client / Supplier Admin: Master Data Hub
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
          className={`btn btn-sm ${tab === 'customers' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('customers')}
        >
          Customers / Buyers
        </button>
        <button
          className={`btn btn-sm ${tab === 'suppliers' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('suppliers')}
        >
          Suppliers
        </button>
        <button
          className={`btn btn-sm ${tab === 'stones' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('stones')}
        >
          Stone Types
        </button>
        <button
          className={`btn btn-sm ${tab === 'rates' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('rates')}
        >
          Rate Lists
        </button>
        <button
          className={`btn btn-sm ${tab === 'yards' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('yards')}
        >
          Yard Locations
        </button>
        <button
          className={`btn btn-sm ${tab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('users')}
        >
          Users & Roles
        </button>
      </div>

      {tab === 'customers' && <ClientsScreen />}
      {tab === 'suppliers' && <ClientsScreen />}
      {tab === 'stones' && <StoneTypesScreen />}
      {tab === 'rates' && <RateListsScreen />}
      {tab === 'yards' && <YardLocationsScreen />}
      {tab === 'users' && <UsersScreen />}
    </div>
  );
}
