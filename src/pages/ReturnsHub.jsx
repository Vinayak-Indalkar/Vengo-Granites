import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/CommonComponents';
import { useApp } from '../context/AppContext';
import { DefectiveStoreScreen, DebitNotesScreen, CreditNotesScreen, ScrapWriteOffScreen } from './ReturnsPages';

export function ReturnsHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'defective';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const isAdmin = currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin';

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
          className={`btn btn-sm ${tab === 'defective' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('defective')}
        >
          Defective Store / Damage
        </button>
        {isAdmin && (
          <>
            <button
              className={`btn btn-sm ${tab === 'debit' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('debit')}
            >
              Debit Notes
            </button>
            <button
              className={`btn btn-sm ${tab === 'credit' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('credit')}
            >
              Credit Notes
            </button>
            <button
              className={`btn btn-sm ${tab === 'scrap' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('scrap')}
            >
              Scrap Write-Off
            </button>
          </>
        )}
      </div>

      {tab === 'defective' && <DefectiveStoreScreen />}
      {tab === 'debit' && <DebitNotesScreen />}
      {tab === 'credit' && <CreditNotesScreen />}
      {tab === 'scrap' && <ScrapWriteOffScreen />}
    </div>
  );
}
