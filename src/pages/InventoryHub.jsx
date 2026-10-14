import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/CommonComponents';
import { useApp } from '../context/AppContext';
import {
  StockGridScreen,
  RawBlocksScreen,
  CutSlabsScreen,
  PolishedSlabsScreen,
  BundlesScreen,
  StockTransferScreen,
  StockValuationScreen
} from './StageInventoryPages';
import { MoveBundleScreen, StockCountScreen } from './YardPages';
import { SupplierInventoryHub } from '../components/inventory/SupplierInventoryHub';

export function InventoryHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'grid';

  // Strict isolation: When Supplier/Client Admin is logged in, show the comprehensive 10-step inventory hub
  if (currentRole === 'Supplier/Client Admin') {
    return <SupplierInventoryHub />;
  }

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const isBuyer = currentRole === 'Buyer Admin';
  const isAdmin = currentRole === 'QT Super Admin' || currentRole === 'Supplier/Client Admin';

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
        <button className={`btn btn-sm ${tab === 'grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('grid')}>
          Stock Grid
        </button>

        {!isBuyer && (
          <>
            <button className={`btn btn-sm ${tab === 'raw' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('raw')}>
              Raw Blocks & QA 1
            </button>
            <button className={`btn btn-sm ${tab === 'cut' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('cut')}>
              Cut Slabs
            </button>
            <button className={`btn btn-sm ${tab === 'polished' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('polished')}>
              Polished & QA 2
            </button>
          </>
        )}

        <button className={`btn btn-sm ${tab === 'bundles' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('bundles')}>
          Final Bundles
        </button>

        <button className={`btn btn-sm ${tab === 'move' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('move')}>
          Move Bundle
        </button>
        <button className={`btn btn-sm ${tab === 'transfer' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('transfer')}>
          Transfer
        </button>
        <button className={`btn btn-sm ${tab === 'count' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('count')}>
          Stock Count
        </button>

        {isAdmin && (
          <button className={`btn btn-sm ${tab === 'valuation' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('valuation')}>
            Valuation
          </button>
        )}
      </div>

      {tab === 'grid' && <StockGridScreen />}
      {tab === 'raw' && <RawBlocksScreen />}
      {tab === 'cut' && <CutSlabsScreen />}
      {tab === 'polished' && <PolishedSlabsScreen />}
      {tab === 'bundles' && <BundlesScreen />}
      {tab === 'move' && <MoveBundleScreen />}
      {tab === 'transfer' && <StockTransferScreen />}
      {tab === 'count' && <StockCountScreen />}
      {tab === 'valuation' && <StockValuationScreen />}
    </div>
  );
}
