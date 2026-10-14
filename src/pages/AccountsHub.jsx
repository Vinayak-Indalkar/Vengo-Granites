import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/CommonComponents';
import {
  SupplierBillsScreen,
  SupplierPaymentsScreen,
  CustomerPaymentsScreen,
  ContractorPaymentsScreen,
  AgeingScreen
} from './AccountsPages';

export function AccountsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'bills';

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
        <button className={`btn btn-sm ${tab === 'bills' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('bills')}>
          Supplier Bills
        </button>
        <button className={`btn btn-sm ${tab === 'suppay' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('suppay')}>
          Supplier Payments
        </button>
        <button className={`btn btn-sm ${tab === 'custpay' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('custpay')}>
          Customer Receipts
        </button>
        <button className={`btn btn-sm ${tab === 'conpay' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('conpay')}>
          Contractor Pay
        </button>
        <button className={`btn btn-sm ${tab === 'ageing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('ageing')}>
          Ageing
        </button>
      </div>

      {tab === 'bills' && <SupplierBillsScreen />}
      {tab === 'suppay' && <SupplierPaymentsScreen />}
      {tab === 'custpay' && <CustomerPaymentsScreen />}
      {tab === 'conpay' && <ContractorPaymentsScreen />}
      {tab === 'ageing' && <AgeingScreen />}
    </div>
  );
}
