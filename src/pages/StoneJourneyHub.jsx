import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTrade } from '../context/TradeContext';
import {
  resolveBlockIdFromAnyQuery,
  buildStoneJourneyGraph,
  getRecentJourneysList
} from '../utils/stoneJourneyResolver';
import { StoneJourneyTree } from '../components/journey/StoneJourneyTree';
import { StoneJourneyTimeline } from '../components/journey/StoneJourneyTimeline';
import { StoneJourneyDrawer } from '../components/journey/StoneJourneyDrawer';
import {
  Search,
  Route as RouteIcon,
  Clock,
  Layers,
  Percent,
  TrendingDown,
  DollarSign,
  TrendingUp,
  Maximize2,
  Minimize2,
  Calendar,
  Building,
  Box,
  FileText,
  Printer,
  Download,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Check,
  ShieldCheck,
  Truck,
  Scissors,
  Package,
  Receipt,
  Scale,
  X,
  Tag
} from 'lucide-react';

const DEFAULT_EXPANDED = {
  root: true,
  source: true,
  inbound: true,
  moves: true,
  cutting: true,
  lot: true,
  qc2: true,
  defects: true,
  cutToSize: true,
  storage: true,
  labels: true,
  stock: true,
  sales: true,
  summary: true
};

const SAMPLE_BENCHMARK_BLOCKS = [
  { id: 'BLK-0001', label: 'BLK-0001', desc: 'Black Galaxy (Complete 17-Stage)', status: 'Sold', statusBg: '#059669' },
  { id: 'BLK-0004', label: 'BLK-0004', desc: 'Imperial Gold (In-Process Cutting)', status: 'In Process', statusBg: '#d97706' },
  { id: 'BLK-0003', label: 'BLK-0003', desc: 'Tan Brown (Partly Sold Split)', status: 'Partly Sold', statusBg: '#2563eb' }
];

export function StoneJourneyHub() {
  const { blockId: urlBlockId } = useParams();
  const navigate = useNavigate();
  const appContext = useApp();
  const tradeContext = useTrade();
  const { currentRole = 'Supplier/Client Admin', t } = appContext;

  // Role permissions
  const canSeeCost = currentRole === 'Supplier/Client Admin' || currentRole === 'QT Super Admin' || currentRole === 'Client Super Admin';

  // Search state
  const [searchInput, setSearchInput] = useState(urlBlockId || 'BLK-0001');
  const [activeIdentifier, setActiveIdentifier] = useState(urlBlockId || 'BLK-0001');
  const [matchedItemId, setMatchedItemId] = useState(null);

  // View state
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'timeline'
  const [expandLevel, setExpandLevel] = useState(2);
  const [findText, setFindText] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(DEFAULT_EXPANDED);

  // Recent journeys filters
  const [filterStoneType, setFilterStoneType] = useState('All');
  const [filterSupplier, setFilterSupplier] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showRecentFilters, setShowRecentFilters] = useState(false);

  // Sync with URL param
  useEffect(() => {
    if (urlBlockId && urlBlockId !== activeIdentifier) {
      setActiveIdentifier(urlBlockId);
      setSearchInput(urlBlockId);
    }
  }, [urlBlockId]);

  // Combined context for resolver
  const combinedStore = useMemo(() => ({
    ...appContext,
    ...tradeContext
  }), [appContext, tradeContext]);

  // Resolve root block ID
  const resolvedBlockId = useMemo(() => {
    return resolveBlockIdFromAnyQuery(activeIdentifier, combinedStore);
  }, [activeIdentifier, combinedStore]);

  // Build full stone journey graph
  const graph = useMemo(() => {
    return buildStoneJourneyGraph(resolvedBlockId, combinedStore, currentRole);
  }, [resolvedBlockId, combinedStore, currentRole]);

  // Recent journeys list
  const recentJourneys = useMemo(() => {
    return getRecentJourneysList(combinedStore, {
      stoneType: filterStoneType,
      supplier: filterSupplier,
      status: filterStatus
    });
  }, [combinedStore, filterStoneType, filterSupplier, filterStatus]);

  // Handle Search Submit
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = (searchInput || '').trim();
    if (!query) return;

    const blockId = resolveBlockIdFromAnyQuery(query, combinedStore);
    if (blockId) {
      setActiveIdentifier(blockId);
      setMatchedItemId(query.toUpperCase() !== blockId.toUpperCase() ? query : null);
      navigate(`/stone-journey/${blockId}`, { replace: true });
    }
  };

  // Select a recent block
  const handleSelectRecent = (block) => {
    setSearchInput(block.id);
    setActiveIdentifier(block.id);
    setMatchedItemId(null);
    navigate(`/stone-journey/${block.id}`, { replace: true });
  };

  // Toggle node expansion in tree
  const handleToggleNode = (nodeKey) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  // Level selector shortcuts
  const handleLevelChange = (level) => {
    setExpandLevel(level);
    if (level === 1) {
      setExpandedNodes({ root: false });
    } else if (level === 2) {
      setExpandedNodes({
        root: true,
        source: true,
        inbound: true,
        moves: false,
        cutting: true,
        lot: false,
        qc2: true,
        defects: true,
        cutToSize: true,
        storage: true,
        labels: true,
        stock: true,
        sales: true,
        summary: true
      });
    } else if (level === 3 || level === 4) {
      setExpandedNodes({
        root: true,
        source: true,
        inbound: true,
        moves: true,
        cutting: true,
        lot: true,
        qc2: true,
        defects: true,
        cutToSize: true,
        storage: true,
        labels: true,
        stock: true,
        sales: true,
        summary: true
      });
    }
  };

  const handleExpandAll = () => {
    setExpandLevel(4);
    setExpandedNodes({
      root: true,
      source: true,
      inbound: true,
      moves: true,
      cutting: true,
      lot: true,
      qc2: true,
      defects: true,
      cutToSize: true,
      storage: true,
      labels: true,
      stock: true,
      sales: true,
      summary: true
    });
  };

  const handleCollapseAll = () => {
    setExpandLevel(1);
    setExpandedNodes({});
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export handler
  const handleExport = () => {
    if (!graph) return;
    const exportData = {
      blockNo: graph.id,
      stoneType: graph.stoneType,
      supplier: graph.supplier,
      receivingDate: graph.receivingDate,
      status: graph.currentStatus,
      inputCBM: graph.inputCBM,
      inputTons: graph.inputTons,
      finishedSqFt: graph.finishedSqFt,
      yieldPct: graph.overallYieldPercent,
      lossPct: graph.overallLossPercent,
      totalCost: canSeeCost ? graph.totalCost : undefined,
      totalSaleValue: canSeeCost ? graph.totalSaleValue : undefined,
      margin: canSeeCost ? graph.marginPercent : undefined,
      events: graph.events,
      exportTimestamp: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stone-journey-${graph.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Stages for the top lifecycle progress tracker
  const lifecycleStages = useMemo(() => {
    const isCompleted = graph?.currentStatus === 'Sold';
    const isPartly = graph?.currentStatus === 'Partly Sold';
    const isInProcess = graph?.currentStatus === 'In Process';

    return [
      { id: 'inbound', label: 'Inbound & Weigh', icon: Truck, status: 'completed' },
      { id: 'qc1', label: 'QC 1 Ultrasonic', icon: ShieldCheck, status: 'completed' },
      { id: 'dressing', label: 'Wire Dressing', icon: Scissors, status: 'completed' },
      { id: 'cutting', label: 'Gangsaw Cutting', icon: Layers, status: 'completed' },
      { id: 'polishing', label: 'Polishing & QC 2', icon: Sparkles, status: isInProcess ? 'current' : 'completed' },
      { id: 'storage', label: 'Storage Bundles', icon: Package, status: isInProcess ? 'upcoming' : 'completed' },
      { id: 'sales', label: 'Sales & Dispatch', icon: Receipt, status: isCompleted ? 'completed' : isPartly ? 'current' : 'upcoming' },
      { id: 'settlement', label: 'Settlement / Return', icon: CheckCircle2, status: isCompleted ? 'completed' : 'upcoming' }
    ];
  }, [graph]);

  return (
    <div className="page-wrapper" style={{ padding: '24px 32px', maxWidth: '1680px', margin: '0 auto' }}>
      {/* ========================================================= */}
      {/* 1. TOP HEADER & BREADCRUMBS */}
      {/* ========================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1e2350 0%, #2f3475 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(34, 35, 80, 0.25)'
          }}>
            <RouteIcon size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Genealogical Traceability
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>•</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--brand-color, #222350)',
                backgroundColor: 'rgba(34, 35, 80, 0.08)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                17-Stage Engine
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--foreground)', margin: 0, lineHeight: 1.15, letterSpacing: '-0.3px' }}>
              Stone Journey
            </h1>
          </div>
        </div>

        {/* Quick Benchmark Sample Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Benchmarks:</span>
          {SAMPLE_BENCHMARK_BLOCKS.map(sj => {
            const isSelected = activeIdentifier === sj.id;
            return (
              <button
                key={sj.id}
                type="button"
                onClick={() => handleSelectRecent({ id: sj.id })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isSelected ? '1.5px solid var(--brand-color, #222350)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--brand-color, #222350)' : 'var(--surface)',
                  color: isSelected ? '#ffffff' : 'var(--foreground)',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(34,35,80,0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#fff' : sj.statusBg
                }} />
                <span>{sj.label}</span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 500,
                  opacity: isSelected ? 0.85 : 0.65
                }}>
                  ({sj.status})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. UNIVERSAL SEARCH BAR & RECENT JOURNEYS FILTER */}
      {/* ========================================================= */}
      <div className="table-card" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        borderRadius: '14px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid var(--border)'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              className="form-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Block No, Quarry Block No, Label Tag, Lot ID, Slab No, Cut Piece, Bundle, Box, Gate Entry, Weighbridge, PO, Invoice, Challan, or Buyer..."
              style={{
                paddingLeft: '44px',
                paddingRight: searchInput ? '36px' : '16px',
                fontSize: '13.5px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-sunken)',
                border: '1px solid var(--border)'
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              height: '46px',
              padding: '0 24px',
              fontSize: '13.5px',
              fontWeight: 700,
              gap: '8px',
              borderRadius: '10px',
              backgroundColor: 'var(--brand-color, #222350)',
              boxShadow: '0 2px 8px rgba(34,35,80,0.2)'
            }}
          >
            <RouteIcon size={16} />
            Track Journey
          </button>

          <button
            type="button"
            className={`btn ${showRecentFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowRecentFilters(!showRecentFilters)}
            style={{ height: '46px', padding: '0 16px', fontSize: '13px', gap: '6px', borderRadius: '10px' }}
            title="Filter Recent Journeys"
          >
            <Filter size={15} />
            Filters
            <ChevronDown size={14} style={{ transform: showRecentFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </form>

        {/* Filter controls collapse */}
        {showRecentFilters && (
          <div style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Stone Type</label>
              <select
                className="form-select"
                value={filterStoneType}
                onChange={(e) => setFilterStoneType(e.target.value)}
                style={{ fontSize: '12.5px', height: '36px', borderRadius: '8px' }}
              >
                <option value="All">All Stone Types</option>
                <option value="Black Galaxy Granite">Black Galaxy Granite</option>
                <option value="Tan Brown Granite">Tan Brown Granite</option>
                <option value="Imperial Gold Granite">Imperial Gold Granite</option>
                <option value="Carrara White Marble">Carrara White Marble</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Supplier / Quarry</label>
              <select
                className="form-select"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                style={{ fontSize: '12.5px', height: '36px', borderRadius: '8px' }}
              >
                <option value="All">All Suppliers / Quarries</option>
                <option value="Monte Altissimo Quarry">Monte Altissimo Quarry</option>
                <option value="Warangal Black Granite Co">Warangal Black Granite Co</option>
                <option value="Apuana Extraction Consortium">Apuana Extraction Consortium</option>
                <option value="Bethesda Natural Stone Inc">Bethesda Natural Stone Inc</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ fontSize: '12.5px', height: '36px', borderRadius: '8px' }}
              >
                <option value="All">All Statuses</option>
                <option value="In Process">In Process</option>
                <option value="In Stock">In Stock</option>
                <option value="Partly Sold">Partly Sold</option>
                <option value="Sold">Sold</option>
                <option value="Defective">Defective</option>
                <option value="Scrap">Scrap</option>
              </select>
            </div>
          </div>
        )}

        {/* Recent journeys list pills */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            Recent Blocks:
          </span>
          {recentJourneys.map(b => {
            const isMatch = activeIdentifier === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectRecent(b)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isMatch ? '1.5px solid var(--brand-color, #222350)' : '1px solid var(--border)',
                  backgroundColor: isMatch ? 'rgba(34, 35, 80, 0.08)' : 'var(--surface-sunken)',
                  color: isMatch ? 'var(--brand-color, #222350)' : 'var(--foreground)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontWeight: 800 }}>{b.id}</span>
                <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 500 }}>{b.stoneType.split(' ')[0]}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  backgroundColor: b.status === 'Sold' ? 'rgba(16, 185, 129, 0.15)' :
                                   b.status === 'Partly Sold' ? 'rgba(245, 158, 11, 0.15)' :
                                   'rgba(59, 130, 246, 0.15)',
                  color: b.status === 'Sold' ? '#059669' :
                         b.status === 'Partly Sold' ? '#d97706' :
                         '#2563eb',
                  fontWeight: 700
                }}>
                  {b.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. EXECUTIVE STONE PASSPORT BANNER & PIPELINE TRACKER */}
      {/* ========================================================= */}
      {graph && (
        <div style={{
          marginBottom: '20px',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
          color: '#fff',
          overflow: 'hidden'
        }}>
          {/* Passport Top Bar */}
          <div style={{
            padding: '22px 28px 18px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* Block Hero Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Block No.
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '0.5px' }}>
                  {graph.id}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
                    {graph.stoneType}
                  </h2>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    backgroundColor: graph.currentStatus === 'Sold' ? 'rgba(16, 185, 129, 0.25)' :
                                     graph.currentStatus === 'Partly Sold' ? 'rgba(245, 158, 11, 0.25)' :
                                     'rgba(59, 130, 246, 0.25)',
                    color: graph.currentStatus === 'Sold' ? '#34d399' :
                           graph.currentStatus === 'Partly Sold' ? '#fbbf24' :
                           '#60a5fa',
                    border: `1px solid ${
                      graph.currentStatus === 'Sold' ? 'rgba(52, 211, 153, 0.4)' :
                      graph.currentStatus === 'Partly Sold' ? 'rgba(251, 191, 36, 0.4)' :
                      'rgba(96, 165, 250, 0.4)'
                    }`
                  }}>
                    ● {graph.currentStatus}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <span><Building size={14} style={{ verticalAlign: '-2px', marginRight: '5px', color: '#94a3b8' }} />{graph.supplier}</span>
                  <span>•</span>
                  <span><Tag size={13} style={{ verticalAlign: '-2px', marginRight: '5px', color: '#94a3b8' }} />Quarry Tag: <strong style={{ color: '#fff' }}>{graph.quarryBlockNo}</strong></span>
                  <span>•</span>
                  <span><Calendar size={14} style={{ verticalAlign: '-2px', marginRight: '5px', color: '#94a3b8' }} />Inward: {graph.receivingDate}</span>
                  <span>•</span>
                  <span><Clock size={14} style={{ verticalAlign: '-2px', marginRight: '5px', color: '#94a3b8' }} /><strong style={{ color: '#38bdf8' }}>{graph.daysInFactory} Days</strong> in Plant</span>
                </div>
              </div>
            </div>

            {/* Matched Identifier Pill (if searched item was a child or invoice) */}
            {matchedItemId && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontSize: '12.5px',
                color: '#fbbf24',
                fontWeight: 600
              }}>
                <Sparkles size={15} />
                <span>Search hit highlighted:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, textDecoration: 'underline' }}>{matchedItemId}</span>
              </div>
            )}
          </div>

          {/* Stepper Pipeline Bar */}
          <div style={{
            padding: '16px 28px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${lifecycleStages.length}, 1fr)`,
              gap: '6px',
              position: 'relative'
            }}>
              {lifecycleStages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPast = stage.status === 'completed';
                const isCurrent = stage.status === 'current';

                return (
                  <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPast ? '#059669' : isCurrent ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                      color: isPast || isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.35)',
                      border: isCurrent ? '2px solid #60a5fa' : 'none',
                      boxShadow: isCurrent ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
                      marginBottom: '6px',
                      zIndex: 2,
                      transition: 'all 0.2s'
                    }}>
                      {isPast ? <Check size={16} strokeWidth={3} /> : <Icon size={14} />}
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPast ? '#34d399' : isCurrent ? '#60a5fa' : 'rgba(255, 255, 255, 0.4)',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metric Tiles Grid */}
          <div style={{
            padding: '20px 28px',
            display: 'grid',
            gridTemplateColumns: canSeeCost
              ? 'repeat(auto-fit, minmax(170px, 1fr))'
              : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            {/* 1. Input Volume & Weight */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Gross Inward
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#fff' }}>
                {graph.inputCBM} CBM
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                {graph.inputTons} Tons Net Wt.
              </div>
            </div>

            {/* 2. Finished Sq.Ft & Slabs */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Finished Output
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
                {graph.finishedSqFt ? `${graph.finishedSqFt.toLocaleString()} sq.ft` : 'In Process'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                {graph.cutting?.slabs?.length || 38} slabs produced
              </div>
            </div>

            {/* 3. Overall Yield % */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Overall Yield
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#34d399' }}>
                {graph.overallYieldPercent}%
              </div>
              <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '2px' }}>
                High recovery efficiency
              </div>
            </div>

            {/* 4. Total Loss % */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Loss
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#f87171' }}>
                {graph.overallLossPercent}%
              </div>
              <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '2px' }}>
                Dressing & Gangsaw Kerf
              </div>
            </div>

            {/* 5. Total Cost Build-up (Strictly Role-Protected) */}
            {canSeeCost && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Cost Build-up
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#fff' }}>
                  ₹{Number(graph.totalCost || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                  ₹{graph.costPerSqFt} / sq.ft unit cost
                </div>
              </div>
            )}

            {/* 6. Revenue & Profit Margin (Strictly Role-Protected) */}
            {canSeeCost && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)'
              }}>
                <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Realized Value & Margin
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px', color: '#34d399' }}>
                  ₹{Number(graph.totalSaleValue || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '2px', fontWeight: 600 }}>
                  +{graph.marginPercent}% (₹{Number(graph.marginAmount || 0).toLocaleString()})
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CONTROLS TOOLBAR & VIEW MODE SWITCHER */}
      {/* ========================================================= */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        padding: '12px 18px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: View Mode Segmented Switch + Expand Levels */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Segmented Switch: Tree vs Timeline */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--surface-sunken)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'tree' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'tree' ? 'var(--brand-color, #222350)' : 'var(--muted)',
                boxShadow: viewMode === 'tree' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={15} />
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'timeline' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'timeline' ? 'var(--brand-color, #222350)' : 'var(--muted)',
                boxShadow: viewMode === 'timeline' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={15} />
              Timeline View
            </button>
          </div>

          {/* Quick Level Pills (Tree mode only) */}
          {viewMode === 'tree' && (
            <>
              <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Depth:
                </span>
                {[
                  { level: 1, label: 'L1 Root' },
                  { level: 2, label: 'L2 Stages' },
                  { level: 3, label: 'L3 Lots & Slabs' },
                  { level: 4, label: 'L4 All Items' }
                ].map(lvl => {
                  const isActive = expandLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      type="button"
                      onClick={() => handleLevelChange(lvl.level)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isActive ? '1px solid var(--brand-color, #222350)' : '1px solid var(--border)',
                        backgroundColor: isActive ? 'var(--brand-color, #222350)' : 'var(--surface-sunken)',
                        color: isActive ? '#fff' : 'var(--foreground)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleExpandAll}
                style={{ padding: '6px 10px', fontSize: '12px', gap: '4px', borderRadius: '6px' }}
                title="Expand All Nodes"
              >
                <Maximize2 size={13} />
                Expand All
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCollapseAll}
                style={{ padding: '6px 10px', fontSize: '12px', gap: '4px', borderRadius: '6px' }}
                title="Collapse All Nodes"
              >
                <Minimize2 size={13} />
                Collapse All
              </button>
            </>
          )}
        </div>

        {/* Right: Search Inside Tree / Print / Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              className="form-input"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find node / item..."
              style={{ fontSize: '12px', height: '34px', paddingLeft: '32px', width: '180px', borderRadius: '8px' }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ padding: '6px 14px', fontSize: '12.5px', gap: '6px', borderRadius: '8px' }}
          >
            <Printer size={14} />
            Print
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            style={{ padding: '6px 14px', fontSize: '12.5px', gap: '6px', borderRadius: '8px' }}
          >
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MAIN CONTENT DISPLAY (TREE OR TIMELINE) */}
      {/* ========================================================= */}
      <div style={{ position: 'relative' }}>
        {graph ? (
          viewMode === 'tree' ? (
            <StoneJourneyTree
              graph={graph}
              currentRole={currentRole}
              expandedNodes={expandedNodes}
              onToggleNode={handleToggleNode}
              onSelectNode={setSelectedNode}
              onOpenModule={(path) => navigate(path)}
              searchFilter={findText}
              highlightedId={matchedItemId}
            />
          ) : (
            <StoneJourneyTimeline
              events={graph.events}
              onSelectNode={setSelectedNode}
              highlightedId={matchedItemId}
            />
          )
        ) : (
          <div className="table-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '14px' }}>
            <AlertCircle size={40} style={{ color: 'var(--muted)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>
              No Stone Record Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '420px', margin: '6px auto 18px auto' }}>
              We could not find any stone record matching "{activeIdentifier}". Please try one of the sample benchmark blocks above.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSelectRecent({ id: 'BLK-0001' })}
              style={{ backgroundColor: 'var(--brand-color, #222350)', padding: '8px 18px' }}
            >
              Load Benchmark Journey (BLK-0001)
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. RIGHT-SIDE DETAIL DRAWER */}
      {/* ========================================================= */}
      <StoneJourneyDrawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        node={selectedNode}
        onOpenModule={(path) => navigate(path)}
      />
    </div>
  );
}
