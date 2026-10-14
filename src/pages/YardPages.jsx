import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, FormDrawer, StatusBadge, ActionDropdown } from '../components/CommonComponents';
import { Search, Move, Layers, Box, CheckSquare } from 'lucide-react';

// Yard Stock Grid & Search
export function YardStockGridScreen() {
  const { blocks, slabLots, yardLocations } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('slabs'); // 'slabs' | 'blocks'

  const filteredSlabs = slabLots.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.bundleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.stoneCode.toLowerCase().includes(search.toLowerCase()) ||
    s.yardLocation.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBlocks = blocks.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.stoneCode.toLowerCase().includes(search.toLowerCase()) ||
    b.yardLocation.toLowerCase().includes(search.toLowerCase())
  );

  const slabCols = [
    { header: 'Lot ID', accessor: 'id' },
    { header: 'Bundle', accessor: 'bundleNumber' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Slabs', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Area (Sq.Ft)', accessor: 'totalSqFt', render: r => <span className="table-num">{r.totalSqFt.toLocaleString()}</span> },
    { header: 'A-Frame Bay', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  const blockCols = [
    { header: 'Block ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Dimensions', render: r => `${r.lengthCm} × ${r.widthCm} × ${r.heightCm} cm` },
    { header: 'Weight (Kg)', accessor: 'weightKg', render: r => <span className="table-num">{r.weightKg.toLocaleString()}</span> },
    { header: 'Yard Bay', accessor: 'yardLocation' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Yard Stock Grid</h1>
      </div>

      <div className="toolbar">
        <div className="toolbar-group">
          <div className="search-box">
            <Search size={14} color="var(--muted)" />
            <input
              placeholder="Search yard inventory..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`btn btn-sm ${activeTab === 'slabs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('slabs')}
          >
            Slabs ({slabLots.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'blocks' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('blocks')}
          >
            Blocks ({blocks.length})
          </button>
        </div>
      </div>

      {activeTab === 'slabs' ? (
        <DataTable columns={slabCols} data={filteredSlabs} emptyMessage="No slab bundles found in yard." />
      ) : (
        <DataTable columns={blockCols} data={filteredBlocks} emptyMessage="No blocks found in yard." />
      )}
    </div>
  );
}

// Move Bundle / Relocation Screen
export function MoveBundleScreen() {
  const { slabLots, yardLocations, moveBundleLocation } = useApp();
  const [search, setSearch] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);
  const [targetLocation, setTargetLocation] = useState(yardLocations[0]?.id || 'LOC-C1');

  const filtered = slabLots.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.bundleNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.yardLocation.toLowerCase().includes(search.toLowerCase())
  );

  const handleMove = (e) => {
    e.preventDefault();
    if (selectedLot) {
      moveBundleLocation(selectedLot.id, targetLocation);
      setSelectedLot(null);
    }
  };

  const columns = [
    { header: 'Bundle', accessor: 'bundleNumber' },
    { header: 'Lot ID', accessor: 'id' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'Current Bay', accessor: 'yardLocation' },
    { header: 'Total Sq.Ft', accessor: 'totalSqFt', render: r => <span className="table-num">{r.totalSqFt}</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Move Bundle',
              icon: Move,
              onClick: () => { setSelectedLot(r); setTargetLocation(yardLocations[0]?.id || 'LOC-C1'); }
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Move Bundle & Relocation</h1>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} color="var(--muted)" />
          <input
            placeholder="Search bundles to move..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No bundles in yard." />

      <FormDrawer
        isOpen={!!selectedLot}
        onClose={() => setSelectedLot(null)}
        title={`Relocate Bundle: ${selectedLot?.bundleNumber}`}
        onSubmit={handleMove}
        submitLabel="Confirm Move"
      >
        <div className="form-group">
          <label className="form-label">Current Yard Bay</label>
          <input className="form-input" disabled value={selectedLot?.yardLocation || ''} />
        </div>
        <div className="form-group">
          <label className="form-label">Stone & Sq.Ft</label>
          <input className="form-input" disabled value={`${selectedLot?.stoneCode} (${selectedLot?.totalSqFt} Sq.Ft)`} />
        </div>
        <div className="form-group">
          <label className="form-label">Destination Yard Bay</label>
          <select
            className="form-select"
            value={targetLocation}
            onChange={e => setTargetLocation(e.target.value)}
          >
            {yardLocations.map(y => <option key={y.id} value={y.id}>{y.id} ({y.zone} - {y.bay})</option>)}
          </select>
        </div>
      </FormDrawer>
    </div>
  );
}

// Physical Stock Count & Audit
export function StockCountScreen() {
  const { slabLots, yardLocations } = useApp();
  const [counts, setCounts] = useState({});

  const handleVerify = (lotId) => {
    setCounts(prev => ({ ...prev, [lotId]: true }));
  };

  const columns = [
    { header: 'Lot ID', accessor: 'id' },
    { header: 'Bundle', accessor: 'bundleNumber' },
    { header: 'Stone', accessor: 'stoneCode' },
    { header: 'System Slabs', accessor: 'slabsCount', render: r => <span className="table-num">{r.slabsCount}</span> },
    { header: 'Yard Bay', accessor: 'yardLocation' },
    {
      header: 'Count Verification',
      render: r => counts[r.id] ? (
        <span className="badge badge-emerald">Verified</span>
      ) : (
        <button className="btn btn-secondary btn-sm" onClick={() => handleVerify(r.id)}>
          <CheckSquare size={14} />
          <span>Mark Counted</span>
        </button>
      )
    }
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Physical Stock Audit</h1>
      </div>

      <div className="toolbar">
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Verified: {Object.keys(counts).length} of {slabLots.length} Bundles
        </span>
      </div>

      <DataTable columns={columns} data={slabLots} emptyMessage="No stock bundles to count." />
    </div>
  );
}
