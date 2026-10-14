import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Breadcrumb } from '../components/CommonComponents';
import { POApprovalsScreen, OpenPOsScreen, PurchaseRequestsScreen } from './PurchasePages';

export function PurchaseOrderHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const isApprover = currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin';
  const defaultTab = isApprover ? 'approvals' : 'open';
  const tab = searchParams.get('tab') || defaultTab;

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
        gap: '8px'
      }}>
        {isApprover && (
          <button
            className={`btn btn-sm ${tab === 'approvals' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('approvals')}
          >
            Approvals
          </button>
        )}
        <button
          className={`btn btn-sm ${tab === 'open' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('open')}
        >
          Open Orders
        </button>
        <button
          className={`btn btn-sm ${tab === 'new' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('new')}
        >
          New Request / PO
        </button>
      </div>

      {tab === 'approvals' && <POApprovalsScreen />}
      {tab === 'open' && <OpenPOsScreen />}
      {tab === 'new' && <PurchaseRequestsScreen />}
    </div>
  );
}
