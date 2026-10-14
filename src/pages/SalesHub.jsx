import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SalesOrdersScreen, InvoicesScreen, CreditOverrideScreen, DispatchScreen } from './SalesPages';

export function SalesHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'orders';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const canOverrideCredit = currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin';

  return (
    <div>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          className={`btn btn-sm ${tab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>
        <button
          className={`btn btn-sm ${tab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('invoices')}
        >
          Invoices
        </button>
        {canOverrideCredit && (
          <button
            className={`btn btn-sm ${tab === 'override' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('override')}
          >
            Credit Override
          </button>
        )}
        <button
          className={`btn btn-sm ${tab === 'dispatch' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('dispatch')}
        >
          Challans & Dispatch
        </button>
      </div>

      {tab === 'orders' && <SalesOrdersScreen />}
      {tab === 'invoices' && <InvoicesScreen />}
      {tab === 'override' && <CreditOverrideScreen />}
      {tab === 'dispatch' && <DispatchScreen />}
    </div>
  );
}
