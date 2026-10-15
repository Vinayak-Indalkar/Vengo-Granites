import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SalesOrdersBillingTab } from '../components/trade/SalesOrdersBillingTab';

export function SalesHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'orders';
  const tab = searchParams.get('tab') || (submenu === 'orders' ? 'sales-orders' : submenu === 'billing' ? 'invoices' : 'to-dispatch');

  const {
    tradeSalesOrders = [],
    tradeInvoices = [],
    tradeDispatches = []
  } = useApp();

  const setSubmenuAndTab = (newSubmenu, defaultTab) => {
    setSearchParams({ submenu: newSubmenu, tab: defaultTab });
  };

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  // Badge calculations
  const pendingOverrideCount = tradeSalesOrders.filter(
    s => s.creditStatus?.toLowerCase().includes('warning') || s.status === 'Held'
  ).length;

  const toDispatchCount = tradeDispatches.filter(
    d => d.status === 'Pending' || d.status === 'To Dispatch'
  ).length;

  const overdueInvoiceCount = tradeInvoices.filter(
    i => i.status === 'Overdue'
  ).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Level 3: Tabs Navigation */}
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
        {submenu === 'orders' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'sales-orders' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('sales-orders')}
              style={{ fontWeight: tab === 'sales-orders' ? 700 : 500 }}
            >
              Sales Orders
            </button>
            <button
              className={`btn btn-sm ${tab === 'reservations' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('reservations')}
              style={{ fontWeight: tab === 'reservations' ? 700 : 500 }}
            >
              Reservations
            </button>
            <button
              className={`btn btn-sm ${tab === 'credit-override' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('credit-override')}
              style={{ fontWeight: tab === 'credit-override' ? 600 : 500 }}
            >
              Credit Override
            </button>
          </>
        )}

        {submenu === 'billing' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('invoices')}
              style={{ fontWeight: tab === 'invoices' ? 600 : 500 }}
            >
              Invoices
            </button>
            <button
              className={`btn btn-sm ${tab === 'challans' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('challans')}
              style={{ fontWeight: tab === 'challans' ? 600 : 500 }}
            >
              Challans
            </button>
            <button
              className={`btn btn-sm ${tab === 'cancel-reissue' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('cancel-reissue')}
              style={{ fontWeight: tab === 'cancel-reissue' ? 600 : 500 }}
            >
              Cancel/Reissue
            </button>
          </>
        )}

        {submenu === 'dispatch' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'to-dispatch' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('to-dispatch')}
              style={{ fontWeight: tab === 'to-dispatch' ? 600 : 500 }}
            >
              To Dispatch
            </button>
            <button
              className={`btn btn-sm ${tab === 'dispatched' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('dispatched')}
              style={{ fontWeight: tab === 'dispatched' ? 700 : 500 }}
            >
              Dispatched
            </button>
            <button
              className={`btn btn-sm ${tab === 'delivered' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('delivered')}
              style={{ fontWeight: tab === 'delivered' ? 700 : 500 }}
            >
              Delivered
            </button>
          </>
        )}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <SalesOrdersBillingTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
