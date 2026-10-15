import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AccountsModuleTab } from '../components/trade/AccountsModuleTab';

export function AccountsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'receivables';
  const tab = searchParams.get('tab') || (submenu === 'receivables' ? 'customer-payments' : submenu === 'payables' ? 'supplier-bills' : '3-way-match');

  const {
    tradeInvoices = [],
    tradeSupplierBills = [],
    tradeGRNs = [],
    tradeQuarryPOs = []
  } = useApp();

  const setSubmenuAndTab = (newSubmenu, defaultTab) => {
    setSearchParams({ submenu: newSubmenu, tab: defaultTab });
  };

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

  // Badge counts
  const overdueInvoicesCount = tradeInvoices.filter(i => i.status === 'Overdue' || (i.outstandingAmount > 0 && new Date(i.dueDate) < new Date('2026-10-15'))).length;
  const pendingSupplierBillsCount = tradeSupplierBills.filter(b => b.status === 'Pending').length;

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
        {submenu === 'receivables' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'customer-payments' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('customer-payments')}
              style={{ fontWeight: tab === 'customer-payments' ? 700 : 500 }}
            >
              Customer Payments
            </button>
            <button
              className={`btn btn-sm ${tab === 'ageing' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('ageing')}
              style={{ fontWeight: tab === 'ageing' ? 600 : 500 }}
            >
              Ageing
            </button>
            <button
              className={`btn btn-sm ${tab === 'statements' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('statements')}
              style={{ fontWeight: tab === 'statements' ? 600 : 500 }}
            >
              Statements
            </button>
          </>
        )}

        {submenu === 'payables' && (
          <>
            <button
              className={`btn btn-sm ${tab === 'supplier-bills' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('supplier-bills')}
              style={{ fontWeight: tab === 'supplier-bills' ? 600 : 500 }}
            >
              Supplier Bills
            </button>
            <button
              className={`btn btn-sm ${tab === 'supplier-payments' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('supplier-payments')}
              style={{ fontWeight: tab === 'supplier-payments' ? 700 : 500 }}
            >
              Supplier Payments
            </button>
            <button
              className={`btn btn-sm ${tab === 'contractor-payments' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('contractor-payments')}
              style={{ fontWeight: tab === 'contractor-payments' ? 700 : 500 }}
            >
              Contractor Payments
            </button>
          </>
        )}

        {submenu === 'match' && (
          <button
            className={`btn btn-sm ${tab === '3-way-match' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('3-way-match')}
            style={{ fontWeight: tab === '3-way-match' ? 700 : 500 }}
          >
            3-Way Match
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <AccountsModuleTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
