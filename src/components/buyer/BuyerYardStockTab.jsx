import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, Move, CheckSquare, AlertTriangle, Layers, Box } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerYardStockTab({ submenu = 'stock', tab = 'stock-grid' }) {
  const {
    tradeBuyerGRNs = [],
    activeBuyerId,
    buyers = [],
    customers = [],
    yardsMaster = [],
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const currentBuyer = buyerList.find(b => b.id === activeBuyerId) || buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('move'); // 'move' | 'adjust'
  const [activeBundle, setActiveBundle] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  // Local adjustments (location moves, stock corrections)
  const [localAdjustments, setLocalAdjustments] = useState(() => {
    try {
      const stored = localStorage.getItem('granite_buyer_stock_adjustments');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Dynamic buyer inventory state derived from GRNs + default seeded lots
  const buyerInventory = useMemo(() => {
    const baseLots = [
      { id: 'BUN-2024-001', stoneName: 'Black Galaxy', finish: 'Mirror Polished', thickness: '20mm', size: '10ft x 6ft', qtySqFt: 1800, location: 'Bay B-1 (North Yard)', status: 'In Stock', reservedFor: null, minSafetyThreshold: 1000 },
      { id: 'BUN-2024-002', stoneName: 'Absolute Black', finish: 'Mirror Polished', thickness: '20mm', size: '9.5ft x 5.8ft', qtySqFt: 1500, location: 'Bay B-2 (Warehouse A)', status: 'In Stock', reservedFor: null, minSafetyThreshold: 1200 },
      { id: 'BUN-2024-003', stoneName: 'Tan Brown', finish: 'Honed Matte', thickness: '18mm', size: '9ft x 5ft', qtySqFt: 2200, location: 'Bay B-3 (Covered Shed)', status: 'Reserved', reservedFor: 'Skyline Plaza Villa Project', minSafetyThreshold: 2000 },
      { id: 'BUN-2024-004', stoneName: 'Steel Grey', finish: 'Leather Finish', thickness: '20mm', size: '10ft x 6ft', qtySqFt: 400, location: 'Bay A-4 (Open Gantry)', status: 'Low Stock', reservedFor: null, minSafetyThreshold: 800 },
      { id: 'BUN-2024-005', stoneName: 'Kashmir White', finish: 'Mirror Polished', thickness: '20mm', size: '9ft x 5.5ft', qtySqFt: 1950, location: 'Bay C-1 (Export Bay)', status: 'In Stock', reservedFor: null, minSafetyThreshold: 1500 }
    ];

    // Convert accepted Buyer GRNs into Yard & Stock Bundles preserving original Bundle IDs
    const grnLots = (tradeBuyerGRNs || [])
      .filter(g => g.buyerId === activeBuyerId || !g.buyerId)
      .map((g, idx) => {
        const netQty = Math.max(0, (Number(g.receivedSqFt) || 0) - (Number(g.damagedSqFt) || 0));
        return {
          id: g.bundleId || `BUN-REC-${String(idx + 1).padStart(3, '0')}`,
          stoneName: g.stoneName || 'Black Galaxy',
          finish: 'Mirror Polished',
          thickness: '20mm',
          size: '10ft x 6ft',
          qtySqFt: netQty,
          location: 'Bay B-2 (Warehouse A)',
          status: netQty <= 500 ? 'Low Stock' : 'In Stock',
          reservedFor: null,
          minSafetyThreshold: 800,
          grnId: g.id
        };
      });

    const map = new Map();
    baseLots.forEach(b => map.set(b.id, b));
    grnLots.forEach(b => map.set(b.id, { ...(map.get(b.id) || {}), ...b }));

    return Array.from(map.values()).map(bundle => {
      const adj = localAdjustments[bundle.id];
      return adj ? { ...bundle, ...adj } : bundle;
    });
  }, [tradeBuyerGRNs, activeBuyerId, localAdjustments]);

  // Yard Movement form state
  const [moveForm, setMoveForm] = useState({
    bundleId: 'BUN-2024-001',
    fromLocation: 'Bay B-1 (North Yard)',
    toLocation: 'Bay B-2 (Warehouse A)',
    handledBy: 'Yard Crane Operator #2'
  });

  const [adjustForm, setAdjustForm] = useState({
    bundleId: 'BUN-2024-001',
    currentQty: 1800,
    newQty: 1750,
    reason: 'Corner dressing chipping during internal relocation'
  });

  // Filter Stock
  const filteredStock = useMemo(() => {
    let list = buyerInventory;
    if (tab === 'reserved') {
      list = list.filter(b => b.status === 'Reserved' || b.reservedFor);
    } else if (tab === 'low-stock') {
      list = list.filter(b => b.qtySqFt <= b.minSafetyThreshold || b.status === 'Low Stock');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(b =>
      b.id?.toLowerCase().includes(q) ||
      b.stoneName?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.finish?.toLowerCase().includes(q)
    );
  }, [buyerInventory, tab, searchQuery]);

  // Handlers
  const handleOpenMove = (bundle) => {
    setActiveBundle(bundle);
    setMoveForm({
      bundleId: bundle.id,
      fromLocation: bundle.location,
      toLocation: 'Bay B-2 (Warehouse A)',
      handledBy: 'Yard Crane Operator #2'
    });
    setDrawerType('move');
    setIsDrawerOpen(true);
  };

  const handleSaveMove = (e) => {
    e.preventDefault();
    setLocalAdjustments(prev => {
      const updated = {
        ...prev,
        [moveForm.bundleId]: {
          ...(prev[moveForm.bundleId] || {}),
          location: moveForm.toLocation
        }
      };
      try {
        localStorage.setItem('granite_buyer_stock_adjustments', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Bundle ${moveForm.bundleId} moved to ${moveForm.toLocation}`, 'success');
  };

  const handleOpenAdjust = (bundle) => {
    setActiveBundle(bundle);
    setAdjustForm({
      bundleId: bundle.id,
      currentQty: bundle.qtySqFt,
      newQty: bundle.qtySqFt,
      reason: 'Physical recount adjustment'
    });
    setDrawerType('adjust');
    setIsDrawerOpen(true);
  };

  const handleSaveAdjust = (e) => {
    e.preventDefault();
    const newQ = Number(adjustForm.newQty) || 0;
    setLocalAdjustments(prev => {
      const updated = {
        ...prev,
        [adjustForm.bundleId]: {
          ...(prev[adjustForm.bundleId] || {}),
          qtySqFt: newQ,
          status: newQ <= 500 ? 'Low Stock' : 'In Stock'
        }
      };
      try {
        localStorage.setItem('granite_buyer_stock_adjustments', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    setIsDrawerOpen(false);
    if (showToast) showToast(`Stock adjusted for ${adjustForm.bundleId} to ${newQ} Sq.Ft`, 'success');
  };

  // COLUMNS
  const stockColumns = [
    { header: 'Bundle ID', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Finish', accessor: 'finish' },
    { header: 'Thickness', accessor: 'thickness' },
    { header: 'Slab Size', accessor: 'size' },
    { header: 'In-Stock (Sq.Ft)', accessor: 'qtySqFt', render: r => <span style={{ fontWeight: 700 }}>{Number(r.qtySqFt || 0).toLocaleString()}</span> },
    { header: 'Bay Location', accessor: 'location', render: r => <span className="badge badge-subtle">{r.location}</span> },
    {
      header: 'Reservation',
      accessor: 'reservedFor',
      render: r => r.reservedFor ? (
        <span style={{ fontSize: '12px', color: 'var(--indigo-text, #4f46e5)', fontWeight: 600 }}>{r.reservedFor}</span>
      ) : '-'
    },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'View Bundle Details',
              icon: Eye,
              onClick: () => setViewItem(r)
            },
            {
              label: 'Move Bay',
              icon: Move,
              onClick: () => handleOpenMove(r)
            },
            {
              label: 'Stock Adjustment',
              icon: CheckSquare,
              onClick: () => handleOpenAdjust(r)
            }
          ]}
        />
      )
    }
  ];

  const getTabTitle = () => {
    if (submenu === 'stock') {
      if (tab === 'stock-grid') return 'Yard Stock Grid';
      if (tab === 'search') return 'Stock Search & Locator';
      if (tab === 'reserved') return 'Reserved Stock Bundles';
      if (tab === 'low-stock') return 'Low Stock Reorder Alert';
      return 'Stock Inventory';
    }
    if (submenu === 'yard') {
      if (tab === 'move') return 'Stock Location Transfer';
      if (tab === 'stock-count') return 'Physical Stock Audit Count';
      if (tab === 'adjustments') return 'Stock Balance Adjustments';
      return 'Yard Operations';
    }
    return 'Yard & Stock';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Table Header / Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            {getTabTitle()}
          </h2>
        </div>
      </div>

      <DataTable
        columns={stockColumns}
        data={filteredStock}
        emptyMessage="No stock items found in yard."
      />

      {/* Form Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerType === 'move' ? 'Move Stock Location' : 'Stock Adjustment'}
        onSubmit={drawerType === 'move' ? handleSaveMove : handleSaveAdjust}
        submitLabel={drawerType === 'move' ? 'Confirm Relocation' : 'Save Adjustment'}
      >
        {drawerType === 'move' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Bundle ID</label>
              <input className="form-input" value={moveForm.bundleId} disabled style={{ background: 'var(--surface-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Bay Location</label>
              <input className="form-input" value={moveForm.fromLocation} disabled style={{ background: 'var(--surface-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Target Bay Location</label>
              <select
                className="form-select"
                value={moveForm.toLocation}
                onChange={e => setMoveForm({ ...moveForm, toLocation: e.target.value })}
              >
                <option value="Bay B-1 (North Yard)">Bay B-1 (North Yard)</option>
                <option value="Bay B-2 (Warehouse A)">Bay B-2 (Warehouse A)</option>
                <option value="Bay B-3 (Covered Shed)">Bay B-3 (Covered Shed)</option>
                <option value="Bay A-4 (Open Gantry)">Bay A-4 (Open Gantry)</option>
                <option value="Bay C-1 (Export Bay)">Bay C-1 (Export Bay)</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Equipment / Operator</label>
              <input
                className="form-input"
                placeholder="e.g. Ramesh Kumar (Forklift A-2)"
                value={moveForm.handledBy}
                onChange={e => setMoveForm({ ...moveForm, handledBy: e.target.value })}
              />
            </div>
          </>
        )}

        {drawerType === 'adjust' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Bundle ID</label>
              <input className="form-input" value={adjustForm.bundleId} disabled style={{ background: 'var(--surface-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Quantity (Sq.Ft)</label>
              <input className="form-input" value={adjustForm.currentQty} disabled style={{ background: 'var(--surface-subtle)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Adjusted Quantity (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1150"
                value={adjustForm.newQty}
                onChange={e => setAdjustForm({ ...adjustForm, newQty: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Reason for Adjustment</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter remarks or arrival notes..."
                value={adjustForm.reason}
                onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              />
            </div>
          </>
        )}
      </FormDrawer>

      {/* View Bundle Traceability Details */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Bundle Traceability: ${viewItem?.id || ''}`}
      >
        {viewItem && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Bundle ID</label>
              <div className="detail-value" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {viewItem.id}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="detail-value">
                <StatusBadge status={viewItem.status} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>
                {viewItem.location || 'Yard Stock'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Stone Item</label>
              <div className="detail-value">{viewItem.stoneName || '—'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Finish / Grade</label>
              <div className="detail-value">{viewItem.finish || 'Polished'} • {viewItem.grade || 'Standard'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Thickness</label>
              <div className="detail-value">{viewItem.thickness || '20mm'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Slab Size</label>
              <div className="detail-value">{viewItem.size || '320 x 185 cm'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Available In-Stock</label>
              <div className="detail-value" style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                {Number(viewItem.qtySqFt || 0).toLocaleString()} Sq.Ft
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation</label>
              <div className="detail-value">
                {viewItem.reservedFor ? (
                  <span style={{ color: 'var(--indigo-text, #4f46e5)', fontWeight: 600 }}>{viewItem.reservedFor}</span>
                ) : 'Not Reserved'}
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Barcode / Label</label>
              <div className="detail-value" style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--muted)' }}>
                *LBL-{viewItem.id}* | ISO Traceability Verified
              </div>
            </div>
          </>
        )}
      </ViewDrawer>
    </div>
  );
}
