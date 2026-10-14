import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/CommonComponents';
import { ReceiptsScreen, BlockCheckScreen, SlabLotsScreen, PrintLabelsScreen } from './ReceiptPages';

export function ReceiptsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'weights';

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
        <button
          className={`btn btn-sm ${tab === 'weights' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('weights')}
        >
          Live Weights (GRN)
        </button>
        <button
          className={`btn btn-sm ${tab === 'block' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('block')}
        >
          Block Check
        </button>
        <button
          className={`btn btn-sm ${tab === 'slabs' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('slabs')}
        >
          Block to Slab Lots
        </button>
        <button
          className={`btn btn-sm ${tab === 'labels' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('labels')}
        >
          Print Labels
        </button>
      </div>

      {tab === 'weights' && <ReceiptsScreen />}
      {tab === 'block' && <BlockCheckScreen />}
      {tab === 'slabs' && <SlabLotsScreen />}
      {tab === 'labels' && <PrintLabelsScreen />}
    </div>
  );
}
