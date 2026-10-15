import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BuyerYardStockTab } from '../components/buyer/BuyerYardStockTab';

export function BuyerYardStockHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const submenu = searchParams.get('submenu') || 'stock';
  const tab = searchParams.get('tab') || (submenu === 'stock' ? 'stock-grid' : 'move');

  const setSubmenuAndTab = (newSubmenu, defaultTab) => {
    setSearchParams({ submenu: newSubmenu, tab: defaultTab });
  };

  const setTab = (newTab) => {
    setSearchParams({ submenu, tab: newTab });
  };

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
        {submenu === 'stock' && (
          <>
            <button className={`btn btn-sm ${tab === 'stock-grid' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('stock-grid')} style={{ fontWeight: tab === 'stock-grid' ? 600 : 500 }}>
              Stock Grid
            </button>
            <button className={`btn btn-sm ${tab === 'search' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('search')} style={{ fontWeight: tab === 'search' ? 600 : 500 }}>
              Search
            </button>
            <button className={`btn btn-sm ${tab === 'reserved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('reserved')} style={{ fontWeight: tab === 'reserved' ? 600 : 500 }}>
              Reserved
            </button>
            <button className={`btn btn-sm ${tab === 'low-stock' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('low-stock')} style={{ fontWeight: tab === 'low-stock' ? 600 : 500 }}>
              Low Stock
            </button>
          </>
        )}

        {submenu === 'yard' && (
          <>
            <button className={`btn btn-sm ${tab === 'move' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('move')} style={{ fontWeight: tab === 'move' ? 600 : 500 }}>
              Move
            </button>
            <button className={`btn btn-sm ${tab === 'stock-count' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('stock-count')} style={{ fontWeight: tab === 'stock-count' ? 600 : 500 }}>
              Stock Count
            </button>
            <button className={`btn btn-sm ${tab === 'adjustments' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('adjustments')} style={{ fontWeight: tab === 'adjustments' ? 600 : 500 }}>
              Adjustments
            </button>
          </>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          <BuyerYardStockTab submenu={submenu} tab={tab} />
        </div>
      </div>
    </div>
  );
}
