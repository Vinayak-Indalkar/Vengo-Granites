import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Box,
  Truck,
  Scale,
  FileCheck2,
  Receipt,
  DollarSign,
  AlertTriangle,
  Scissors,
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Maximize2,
  FolderTree,
  RotateCcw,
  Workflow
} from 'lucide-react';
import { StatusBadge } from '../CommonComponents';

export function StoneJourneyTree({
  graph,
  currentRole = 'Supplier/Client Admin',
  expandedNodes,
  onToggleNode,
  onSelectNode,
  onOpenModule,
  searchFilter = '',
  highlightedId = null
}) {
  const [expandGroupedSlabs, setExpandGroupedSlabs] = useState(false);
  const [expandGroupedPieces, setExpandGroupedPieces] = useState(false);

  if (!graph) return null;

  // Role permissions
  const canSeeCost = currentRole === 'Supplier/Client Admin' || currentRole === 'QT Super Admin';
  const canSeeSource = currentRole !== 'Buyer Admin' && currentRole !== 'Seller';
  const canSeeInbound = currentRole !== 'Buyer Admin' && currentRole !== 'Seller';
  const canSeeProduction = currentRole !== 'Buyer Admin' && currentRole !== 'Seller';
  const canSeeQC = currentRole !== 'Buyer Admin' && currentRole !== 'Seller' && currentRole !== 'Yard Operator';
  const canSeeStorage = currentRole !== 'Buyer Admin';
  const canSeeSales = currentRole !== 'Inventory Manager' && currentRole !== 'QC Inspector' && currentRole !== 'Yard Operator';

  // Helper to test if node matches search filter
  const matchesSearch = (text, id) => {
    if (!searchFilter.trim()) return false;
    const q = searchFilter.toLowerCase();
    return String(text).toLowerCase().includes(q) || String(id).toLowerCase().includes(q);
  };

  // Helper to render tree node row
  const renderNodeRow = ({
    id,
    name,
    category,
    icon: Icon = Layers,
    status = 'Active',
    keyFigure = '',
    timestamp = '',
    operator = '',
    level = 1,
    hasChildren = false,
    isExpanded = true,
    onToggle = null,
    raw = {},
    isException = false,
    exceptionCount = 0,
    moduleRoute = null,
    isPending = false
  }) => {
    const isHighlighted = (highlightedId && (id === highlightedId || String(name).toLowerCase().includes(highlightedId.toLowerCase()))) || matchesSearch(name, id);
    const nodeObj = { id, name, category, icon: Icon, status, keyFigure, timestamp, operator, raw, isException, moduleRoute };

    // Hierarchy depth indentation
    const indentPx = (level - 1) * 26;
    const isLevel1 = level === 1;
    const isLevel2 = level === 2;

    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isLevel1 ? '12px 18px' : isLevel2 ? '10px 16px' : '8px 14px',
          marginLeft: `${indentPx}px`,
          borderRadius: isLevel1 ? '12px' : '10px',
          backgroundColor: isHighlighted ? 'rgba(34, 35, 80, 0.08)' :
                           isException ? '#fff1f2' :
                           isPending ? 'var(--surface-sunken)' :
                           isLevel1 ? 'var(--surface)' : 'var(--surface)',
          border: isHighlighted ? '2px solid var(--brand-color, #222350)' :
                  isException ? '1px solid #fecdd3' :
                  isLevel1 ? '1.5px solid var(--border)' :
                  isLevel2 ? '1px solid var(--border)' : '1px solid var(--border)',
          opacity: isPending ? 0.65 : 1,
          marginBottom: isLevel1 ? '10px' : '6px',
          boxShadow: isHighlighted ? '0 0 0 3px rgba(34,35,80,0.1)' :
                     isLevel1 ? '0 2px 6px rgba(0,0,0,0.04)' :
                     '0 1px 2px rgba(0,0,0,0.02)',
          transition: 'all 0.15s ease',
          cursor: isPending ? 'default' : 'pointer'
        }}
        onClick={() => !isPending && onSelectNode(nodeObj)}
      >
        {/* Visual tree guide line for child levels */}
        {level > 1 && (
          <div style={{
            position: 'absolute',
            left: '-14px',
            top: '50%',
            width: '12px',
            height: '2px',
            backgroundColor: 'var(--border)',
            pointerEvents: 'none'
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {/* Expand / Collapse arrow */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggle) onToggle();
              }}
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground)',
                flexShrink: 0,
                transition: 'transform 0.15s ease'
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div style={{ width: '24px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isException ? '#ef4444' : 'var(--border)' }} />
            </div>
          )}

          {/* Node Icon */}
          <div style={{
            width: isLevel1 ? '34px' : '30px',
            height: isLevel1 ? '34px' : '30px',
            borderRadius: '8px',
            backgroundColor: isException ? '#fee2e2' :
                             isLevel1 ? 'var(--brand-color, #222350)' :
                             isLevel2 ? 'rgba(34, 35, 80, 0.08)' : 'var(--surface-sunken)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isException ? '#e11d48' : isLevel1 ? '#fff' : 'var(--brand-color, #222350)',
            flexShrink: 0
          }}>
            <Icon size={isLevel1 ? 18 : 15} />
          </div>

          {/* Title, Category & ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: isLevel1 ? '15px' : isLevel2 ? '13.5px' : '13px',
              fontWeight: isLevel1 ? 800 : isLevel2 ? 700 : 600,
              color: isException ? '#e11d48' : 'var(--foreground)'
            }}>
              {name}
            </span>

            {category && (
              <span style={{
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-sunken)',
                color: 'var(--muted)',
                border: '1px solid var(--border)'
              }}>
                {category}
              </span>
            )}

            {id && (
              <span style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0,0,0,0.03)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                {id}
              </span>
            )}
          </div>

          {/* Exception count badge when collapsed */}
          {!isExpanded && exceptionCount > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: '#ef4444',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(239, 68, 68, 0.3)'
            }}>
              {exceptionCount} exception{exceptionCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Right side metrics & status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {operator && (
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ opacity: 0.7 }}>👤</span> {operator}
            </span>
          )}

          {keyFigure && (
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--foreground)',
              backgroundColor: 'var(--surface-sunken)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)'
            }}>
              {keyFigure}
            </span>
          )}

          {timestamp && (
            <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              {timestamp}
            </span>
          )}

          <StatusBadge status={status} />

          {/* Direct module link button */}
          {moduleRoute && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenModule) onOpenModule(moduleRoute);
              }}
              title="Open record in dedicated screen"
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)'
              }}
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const isExpanded = (nodeKey) => !!expandedNodes[nodeKey];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* ========================================================= */}
      {/* 1. ROOT BLOCK */}
      {/* ========================================================= */}
      {renderNodeRow({
        id: graph.id,
        name: `Block (Root): ${graph.stoneType}`,
        category: 'Root Block',
        icon: Box,
        status: graph.currentStatus,
        keyFigure: `${graph.inputCBM} CBM • ${graph.inputTons} Ton`,
        timestamp: graph.receivingDate,
        operator: graph.supplier,
        level: 1,
        hasChildren: true,
        isExpanded: isExpanded('root'),
        onToggle: () => onToggleNode('root'),
        raw: graph.rawBlock,
        moduleRoute: '/inventory?submenu=inbound'
      })}

      {isExpanded('root') && (
        <>
          {/* ========================================================= */}
          {/* 2. SOURCE BRANCH */}
          {/* ========================================================= */}
          {canSeeSource && (
            <>
              {renderNodeRow({
                id: graph.source.qpo?.id || 'SRC-01',
                name: `Source: ${graph.supplier}`,
                category: 'Source & Quarry',
                icon: Truck,
                status: graph.source.qpo?.status || 'Closed',
                keyFigure: canSeeCost ? `Rate: ₹${graph.source.qpo?.rate?.toLocaleString()}/Ton` : `Quarry Block #${graph.quarryBlockNo}`,
                timestamp: graph.source.qpo?.date,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('source'),
                onToggle: () => onToggleNode('source'),
                raw: { ...graph.source.qpo, quarryBlockNo: graph.quarryBlockNo, supplier: graph.supplier },
                moduleRoute: '/purchase-orders?submenu=quarry-pos'
              })}

              {isExpanded('source') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderNodeRow({
                    id: graph.source.qpo?.id || 'QPO-0001',
                    name: `Quarry PO: ${graph.source.qpo?.id}`,
                    category: 'Procurement',
                    icon: FileCheck2,
                    status: graph.source.qpo?.status || 'Closed',
                    keyFigure: canSeeCost ? `Total: ₹${graph.source.qpo?.totalAmount?.toLocaleString()}` : `Qty: ${graph.source.qpo?.expectedQty} Ton`,
                    timestamp: graph.source.qpo?.date,
                    level: 3,
                    raw: graph.source.qpo,
                    moduleRoute: '/purchase-orders?submenu=quarry-pos'
                  })}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 3. INBOUND BRANCH */}
          {/* ========================================================= */}
          {canSeeInbound && (
            <>
              {renderNodeRow({
                id: graph.inbound.gateEntry?.id || 'INB-01',
                name: 'Inbound Verification & Weighbridge',
                category: 'Inbound',
                icon: Scale,
                status: graph.inbound.weighbridge?.status || 'Approved',
                keyFigure: `Net: ${graph.inbound.weighbridge?.netWeightTon || 28.25} MT (Var: ${graph.inbound.weighbridge?.varianceKg || 0} kg)`,
                timestamp: graph.inbound.gateEntry?.timeIn,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('inbound'),
                onToggle: () => onToggleNode('inbound'),
                raw: graph.inbound,
                moduleRoute: '/receipts'
              })}

              {isExpanded('inbound') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderNodeRow({
                    id: graph.inbound.gateEntry?.id,
                    name: `Gate Entry: Truck ${graph.inbound.gateEntry?.truckNo}`,
                    category: 'Gate Security',
                    icon: Truck,
                    status: graph.inbound.gateEntry?.status,
                    keyFigure: `Driver: ${graph.inbound.gateEntry?.driverName}`,
                    timestamp: graph.inbound.gateEntry?.timeIn,
                    level: 3,
                    raw: graph.inbound.gateEntry,
                    moduleRoute: '/inventory?submenu=inbound'
                  })}

                  {renderNodeRow({
                    id: graph.inbound.weighbridge?.id,
                    name: `Weighbridge Ticket: ${graph.inbound.weighbridge?.id}`,
                    category: 'Gross / Tare Scales',
                    icon: Scale,
                    status: graph.inbound.weighbridge?.status,
                    keyFigure: `Variance: ${graph.inbound.weighbridge?.varianceKg} Kg (${graph.inbound.weighbridge?.variancePercent}%)`,
                    timestamp: graph.inbound.weighbridge?.date,
                    operator: graph.inbound.weighbridge?.weighedBy,
                    level: 3,
                    raw: graph.inbound.weighbridge,
                    moduleRoute: '/receipts'
                  })}

                  {renderNodeRow({
                    id: graph.inbound.deliveryAcceptance?.id,
                    name: 'Delivery Note Check & Acceptance',
                    category: 'Factory Acceptance',
                    icon: CheckCircle2,
                    status: 'Accepted',
                    keyFigure: graph.inbound.deliveryAcceptance?.sealCondition,
                    timestamp: graph.inbound.deliveryAcceptance?.checkDate,
                    operator: graph.inbound.deliveryAcceptance?.checkedBy,
                    level: 3,
                    raw: graph.inbound.deliveryAcceptance
                  })}

                  {renderNodeRow({
                    id: graph.inbound.grn?.id,
                    name: `GRN: ${graph.inbound.grn?.id}`,
                    category: 'Goods Receipt Note',
                    icon: FileCheck2,
                    status: graph.inbound.grn?.approvalStatus,
                    keyFigure: 'Variance Approved',
                    timestamp: graph.inbound.grn?.date,
                    level: 3,
                    raw: graph.inbound.grn,
                    moduleRoute: '/receipts'
                  })}

                  {canSeeCost && (
                    <>
                      {renderNodeRow({
                        id: graph.inbound.supplierBill?.id,
                        name: `Supplier Bill: ${graph.inbound.supplierBill?.billNo}`,
                        category: 'Payables',
                        icon: Receipt,
                        status: graph.inbound.supplierBill?.status,
                        keyFigure: `₹${graph.inbound.supplierBill?.totalAmount?.toLocaleString()}`,
                        timestamp: graph.inbound.supplierBill?.date,
                        level: 3,
                        raw: graph.inbound.supplierBill,
                        moduleRoute: '/accounts?submenu=payables'
                      })}

                      {renderNodeRow({
                        id: graph.inbound.supplierPayment?.id,
                        name: `Supplier Payment: ${graph.inbound.supplierPayment?.reference}`,
                        category: 'Disbursements',
                        icon: DollarSign,
                        status: graph.inbound.supplierPayment?.status,
                        keyFigure: `Paid: ₹${graph.inbound.supplierPayment?.amount?.toLocaleString()}`,
                        timestamp: graph.inbound.supplierPayment?.date,
                        level: 3,
                        raw: graph.inbound.supplierPayment,
                        moduleRoute: '/accounts?submenu=payables'
                      })}

                      {graph.inbound.debitNote && renderNodeRow({
                        id: graph.inbound.debitNote.id,
                        name: `Debit Note: ${graph.inbound.debitNote.id}`,
                        category: 'Deductions',
                        icon: AlertTriangle,
                        status: graph.inbound.debitNote.status,
                        keyFigure: `Adjustment: ₹${graph.inbound.debitNote.amount?.toLocaleString()}`,
                        timestamp: graph.inbound.debitNote.date,
                        level: 3,
                        raw: graph.inbound.debitNote,
                        moduleRoute: '/accounts?submenu=payables'
                      })}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 4. QC 1 INSPECTION */}
          {/* ========================================================= */}
          {canSeeQC && (
            <>
              {renderNodeRow({
                id: graph.qc1.id,
                name: `QC 1: Raw Block Inspection (${graph.qc1.grade})`,
                category: 'Quality Control 1',
                icon: ShieldCheck,
                status: graph.qc1.result,
                keyFigure: `Moisture: ${graph.qc1.moisture || '1.2%'}`,
                timestamp: graph.qc1.date,
                operator: graph.qc1.inspector,
                level: 2,
                raw: graph.qc1,
                moduleRoute: '/inventory?submenu=qc'
              })}
            </>
          )}

          {/* ========================================================= */}
          {/* 5. BLOCK DRESSING */}
          {/* ========================================================= */}
          {canSeeProduction && (
            <>
              {renderNodeRow({
                id: graph.dressing.id,
                name: `Block Dressing: ${graph.dressing.machine}`,
                category: 'Dressing & Squaring',
                icon: Scissors,
                status: graph.dressing.status,
                keyFigure: `Loss: ${graph.dressing.dressingLossCBM} CBM (${graph.dressing.dressingLossPercent})`,
                timestamp: graph.dressing.date,
                operator: graph.dressing.team,
                level: 2,
                raw: graph.dressing,
                moduleRoute: '/inventory?submenu=processing'
              })}
            </>
          )}

          {/* ========================================================= */}
          {/* 6. DRESSED STORAGE & MOVEMENTS */}
          {/* ========================================================= */}
          {canSeeProduction && (
            <>
              {renderNodeRow({
                id: 'MOVES-01',
                name: `Dressed Block Movements (${graph.dressedMoves.length} moves)`,
                category: 'Logistics',
                icon: Workflow,
                status: 'Completed',
                keyFigure: 'Gangsaw Ready',
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('moves'),
                onToggle: () => onToggleNode('moves'),
                raw: { movements: graph.dressedMoves }
              })}

              {isExpanded('moves') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.dressedMoves.map(mv => renderNodeRow({
                    key: mv.id,
                    id: mv.id,
                    name: `${mv.fromLoc} ➔ ${mv.toLoc}`,
                    category: 'Yard Crane Transfer',
                    icon: ArrowRight,
                    status: 'Done',
                    keyFigure: mv.equipment || 'Crane 40T',
                    timestamp: mv.date,
                    operator: mv.person,
                    level: 3,
                    raw: mv
                  }))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 7. BLOCK CUTTING & LOT */}
          {/* ========================================================= */}
          {canSeeProduction && (
            <>
              {renderNodeRow({
                id: graph.cutting.slicingJob.id,
                name: `Block Cutting: ${graph.cutting.slicingJob.machine}`,
                category: 'Gangsaw Slicing',
                icon: Scissors,
                status: graph.cutting.slicingJob.status,
                keyFigure: `${graph.cutting.slicingJob.slabCount} Slabs (${graph.cutting.slicingJob.yieldPercent} yield)`,
                timestamp: graph.cutting.slicingJob.startTime,
                operator: graph.cutting.slicingJob.operator,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('cutting'),
                onToggle: () => onToggleNode('cutting'),
                raw: graph.cutting.slicingJob,
                moduleRoute: '/inventory?submenu=processing'
              })}

              {isExpanded('cutting') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Lot node */}
                  {renderNodeRow({
                    id: graph.cutting.lot.id,
                    name: `Lot ${graph.cutting.lot.lotNo} (${graph.cutting.lot.slabCount} Slabs • ${graph.cutting.lot.totalSqFt} Sq.Ft)`,
                    category: 'Slab Lot',
                    icon: Layers,
                    status: graph.cutting.lot.status,
                    keyFigure: `Gauge: ${graph.cutting.lot.avgThickness}`,
                    level: 3,
                    hasChildren: true,
                    isExpanded: isExpanded('lot'),
                    onToggle: () => onToggleNode('lot'),
                    raw: graph.cutting.lot
                  })}

                  {/* Slabs under Lot */}
                  {isExpanded('lot') && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        marginLeft: '40px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        color: 'var(--muted)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>Showing {expandGroupedSlabs ? graph.cutting.slabs.length : Math.min(4, graph.cutting.slabs.length)} of {graph.cutting.slabs.length} Slabs in Lot</span>
                        {graph.cutting.slabs.length > 4 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: '11px', padding: '2px 6px', height: '22px' }}
                            onClick={() => setExpandGroupedSlabs(!expandGroupedSlabs)}
                          >
                            {expandGroupedSlabs ? 'Collapse to sample' : `Expand all (${graph.cutting.slabs.length})`}
                          </button>
                        )}
                      </div>

                      {(expandGroupedSlabs ? graph.cutting.slabs : graph.cutting.slabs.slice(0, 4)).map(sl => renderNodeRow({
                        key: sl.id,
                        id: sl.id,
                        name: `Slab ${sl.slabNo} (${sl.length}" x ${sl.width}", ${sl.sqft} Sq.Ft)`,
                        category: 'Gangsaw Cut Slab',
                        icon: Layers,
                        status: sl.status,
                        keyFigure: sl.grade,
                        isException: sl.status === 'Defective' || sl.grade === 'Rejected',
                        level: 4,
                        raw: sl,
                        moduleRoute: '/inventory?submenu=processing'
                      }))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 8. SLAB PROCESSING (RESIN, MESH, POLISH) */}
          {/* ========================================================= */}
          {canSeeProduction && (
            <>
              {renderNodeRow({
                id: graph.processing.materialJob.id,
                name: `Slab Processing: ${graph.processing.materialJob.materialType}`,
                category: 'Surface Treatment',
                icon: Sparkles,
                status: graph.processing.materialJob.status,
                keyFigure: canSeeCost ? `Cost: ₹${graph.processing.materialJob.costAdded}` : `Batch: ${graph.processing.materialJob.materialBatchNo}`,
                timestamp: graph.processing.materialJob.date,
                operator: graph.processing.materialJob.operator,
                level: 2,
                raw: graph.processing.materialJob,
                moduleRoute: '/inventory?submenu=processing'
              })}
            </>
          )}

          {/* ========================================================= */}
          {/* 9. QC 2 (REWORK & REJECTION CHILD NODES) */}
          {/* ========================================================= */}
          {canSeeQC && (
            <>
              {renderNodeRow({
                id: 'QC2-GRP',
                name: `QC 2 Inspections & Rework (${graph.qc2.length} slabs)`,
                category: 'Quality Control 2',
                icon: ShieldCheck,
                status: graph.qc2.some(q => q.isException) ? 'Exceptions Flagged' : 'Pass',
                isException: graph.qc2.some(q => q.isException),
                exceptionCount: graph.qc2.filter(q => q.isException).length,
                keyFigure: 'Gloss & Gauge Test',
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('qc2'),
                onToggle: () => onToggleNode('qc2'),
                raw: { qc2Records: graph.qc2 },
                moduleRoute: '/inventory?submenu=qc'
              })}

              {isExpanded('qc2') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.qc2.map(qc => (
                    <React.Fragment key={qc.id}>
                      {renderNodeRow({
                        id: qc.id,
                        name: `${qc.slabId}: ${qc.grade} (${qc.result})`,
                        category: qc.isRework ? 'Rework Round 1' : 'QC 2 Inspection',
                        icon: qc.isException ? AlertTriangle : CheckCircle2,
                        status: qc.result,
                        keyFigure: qc.glossUnits ? `${qc.glossUnits} GU` : qc.defectLocation,
                        timestamp: qc.date,
                        operator: qc.inspector,
                        isException: qc.isException,
                        hasChildren: !!(qc.children && qc.children.length > 0),
                        isExpanded: isExpanded(qc.id),
                        onToggle: () => onToggleNode(qc.id),
                        level: 3,
                        raw: qc,
                        moduleRoute: '/inventory?submenu=qc'
                      })}

                      {/* Rework children */}
                      {qc.children && isExpanded(qc.id) && qc.children.map(child => renderNodeRow({
                        key: child.id,
                        id: child.id,
                        name: `Rework Action: ${child.action || child.name || child.result}`,
                        category: 'Rework Process',
                        icon: RotateCcw,
                        status: child.result || child.status || 'Pass',
                        timestamp: child.date,
                        operator: child.operator || child.inspector,
                        level: 4,
                        raw: child
                      }))}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 10. DEFECTS & SCRAP STORE */}
          {/* ========================================================= */}
          {canSeeQC && graph.defects.length > 0 && (
            <>
              {renderNodeRow({
                id: 'DEF-GRP',
                name: `Defective Store & Scrap (${graph.defects.length} records)`,
                category: 'Exceptions & Salvage',
                icon: AlertTriangle,
                status: 'Defective',
                isException: true,
                keyFigure: `${graph.defects.reduce((a, d) => a + (d.sqftLost || 0), 0)} Sq.Ft Lost`,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('defects'),
                onToggle: () => onToggleNode('defects'),
                raw: { defects: graph.defects },
                moduleRoute: '/returns?submenu=defects'
              })}

              {isExpanded('defects') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.defects.map(df => renderNodeRow({
                    key: df.id,
                    id: df.id,
                    name: `${df.slabId || df.itemId}: ${df.defectType || df.reason}`,
                    category: 'Scrap Write-off',
                    icon: AlertTriangle,
                    status: 'Defective',
                    keyFigure: `${df.sqftLost} Sq.Ft`,
                    timestamp: df.date,
                    isException: true,
                    level: 3,
                    raw: df,
                    moduleRoute: '/returns?submenu=defects'
                  }))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 11. FABRICATION (CUT TO SIZE) */}
          {/* ========================================================= */}
          {canSeeProduction && graph.fabrication && (
            <>
              {renderNodeRow({
                id: graph.fabrication.id,
                name: `Fabrication: ${graph.fabrication.cutSizeName}`,
                category: 'Cut-to-Size CNC',
                icon: Scissors,
                status: 'Completed',
                keyFigure: `${graph.fabrication.piecesCount} Pieces (${graph.fabrication.totalSqFt} Sq.Ft)`,
                timestamp: graph.fabrication.date,
                operator: graph.fabrication.operator,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('cutToSize'),
                onToggle: () => onToggleNode('cutToSize'),
                raw: graph.fabrication,
                moduleRoute: '/inventory?submenu=processing'
              })}

              {isExpanded('cutToSize') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.fabrication.pieces.map(pc => renderNodeRow({
                    key: pc.id,
                    id: pc.id,
                    name: `Piece ${pc.pieceNo} (${pc.size})`,
                    category: 'Finished Cut Tile',
                    icon: Box,
                    status: pc.status,
                    keyFigure: `${pc.sqft} Sq.Ft`,
                    level: 3,
                    raw: pc
                  }))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 12. STORAGE & BUNDLES */}
          {/* ========================================================= */}
          {canSeeStorage && (
            <>
              {renderNodeRow({
                id: graph.storage.putaway.id,
                name: `Storage & Putaway: ${graph.storage.putaway.yard}`,
                category: 'Yard Management',
                icon: Box,
                status: 'Secured',
                keyFigure: `${graph.storage.bundles.length} Bundles Created`,
                timestamp: graph.storage.putaway.date,
                operator: graph.storage.putaway.putawayBy,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('storage'),
                onToggle: () => onToggleNode('storage'),
                raw: graph.storage.putaway,
                moduleRoute: '/inventory?submenu=storage'
              })}

              {isExpanded('storage') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.storage.bundles.map(bndl => renderNodeRow({
                    key: bndl.id,
                    id: bndl.id,
                    name: `Bundle ${bndl.bundleNo} (${bndl.slabCount} Slabs • ${bndl.totalSqFt} Sq.Ft)`,
                    category: 'A-Frame Packaged Bundle',
                    icon: Box,
                    status: bndl.status,
                    keyFigure: bndl.location,
                    level: 3,
                    raw: bndl,
                    moduleRoute: '/inventory?submenu=storage'
                  }))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 13. LABELS */}
          {/* ========================================================= */}
          {canSeeStorage && (
            <>
              {renderNodeRow({
                id: 'LBL-GRP',
                name: `Labels & Barcodes (${graph.labels.length} active prints)`,
                category: 'Label Studio',
                icon: Tag,
                status: 'Printed',
                keyFigure: 'QR & Barcode Verified',
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('labels'),
                onToggle: () => onToggleNode('labels'),
                raw: { labels: graph.labels },
                moduleRoute: '/inventory?submenu=storage'
              })}

              {isExpanded('labels') && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {graph.labels.map(lbl => renderNodeRow({
                    key: lbl.id,
                    id: lbl.id,
                    name: `${lbl.type} (${lbl.dimensions})`,
                    category: 'Thermal Label',
                    icon: Tag,
                    status: 'Active',
                    keyFigure: `Prints: ${lbl.printCount}`,
                    timestamp: lbl.date,
                    operator: lbl.printedBy,
                    level: 3,
                    raw: lbl,
                    moduleRoute: '/inventory?submenu=storage'
                  }))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 14. STOCK (AVAILABLE vs SOLD SPLIT) */}
          {/* ========================================================= */}
          {canSeeStorage && (
            <>
              {renderNodeRow({
                id: 'STK-01',
                name: `Stock Allocation (${graph.stock.totalProducedSqFt} Sq.Ft Total Output)`,
                category: 'Inventory Balance',
                icon: Layers,
                status: graph.stock.inStockSqFt > 0 ? 'Partly Available' : 'Sold Out',
                keyFigure: `Sold: ${graph.stock.soldSqFt} Sq.Ft | Stock: ${graph.stock.inStockSqFt} Sq.Ft`,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('stock'),
                onToggle: () => onToggleNode('stock'),
                raw: graph.stock,
                moduleRoute: '/inventory?submenu=stock'
              })}

              {isExpanded('stock') && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginLeft: '20px', marginBottom: '8px' }}>
                  {/* Sold Branch Card */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--brand-surface, #EEF2F6)'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-color)', textTransform: 'uppercase' }}>
                      Sold Branch
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', margin: '4px 0' }}>
                      {graph.stock.soldSqFt.toLocaleString()} Sq.Ft Sold
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Allocated across {graph.salesChains.length} buyer order{graph.salesChains.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* In Stock Branch Card */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    backgroundColor: graph.stock.inStockSqFt > 0 ? 'var(--emerald-subtle, #ecfdf5)' : 'var(--surface-subtle, #f8fafc)'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: graph.stock.inStockSqFt > 0 ? 'var(--emerald-text, #047857)' : 'var(--muted)', textTransform: 'uppercase' }}>
                      In Stock Branch
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: graph.stock.inStockSqFt > 0 ? 'var(--emerald-solid, #10b981)' : 'var(--muted)', margin: '4px 0' }}>
                      {graph.stock.inStockSqFt.toLocaleString()} Sq.Ft Available
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Stored on A-Frames ready for immediate reservation
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 15. SALES BRANCH (SIDE-BY-SIDE BUYER BRANCHES) */}
          {/* ========================================================= */}
          {canSeeSales && (
            <>
              {renderNodeRow({
                id: 'SALES-GRP',
                name: `Sales & Fulfillment (${graph.salesChains.length} Buyer Fulfillment${graph.salesChains.length > 1 ? 's' : ''})`,
                category: 'Outbound Commerce',
                icon: Receipt,
                status: graph.salesChains.some(c => c.returns?.length > 0) ? 'Returns Raised' : 'Dispatched',
                isException: graph.salesChains.some(c => c.returns?.length > 0),
                exceptionCount: graph.salesChains.reduce((a, c) => a + (c.returns?.length || 0), 0),
                keyFigure: canSeeCost ? `Total Invoiced: ₹${graph.totalSaleValue?.toLocaleString()}` : `${graph.salesChains.length} Orders`,
                level: 2,
                hasChildren: true,
                isExpanded: isExpanded('sales'),
                onToggle: () => onToggleNode('sales'),
                raw: { salesChains: graph.salesChains },
                moduleRoute: '/sales-invoices?submenu=orders'
              })}

              {isExpanded('sales') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {graph.salesChains.map((chain, cIdx) => (
                    <div
                      key={chain.buyerId || cIdx}
                      style={{
                        marginLeft: '20px',
                        padding: '10px 14px',
                        backgroundColor: chain.returns?.length > 0 ? '#fff1f2' : 'var(--surface-subtle, #f8fafc)',
                        border: chain.returns?.length > 0 ? '1px solid #fecdd3' : '1px solid var(--line)',
                        borderRadius: '8px'
                      }}
                    >
                      {/* Buyer Branch Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-color)', textTransform: 'uppercase' }}>
                            {chain.branchTitle}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                            {chain.buyerName}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                            {chain.inv?.totalAmount ? `₹${chain.inv.totalAmount.toLocaleString()}` : '—'}
                          </span>
                          <StatusBadge status={chain.inv?.status || 'Active'} />
                        </div>
                      </div>

                      {/* Sub-steps of Buyer Chain */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {chain.pr && renderNodeRow({
                          id: chain.pr.id,
                          name: `Buyer PR: ${chain.pr.id}`,
                          category: 'Purchase Request',
                          icon: FileCheck2,
                          status: chain.pr.status,
                          keyFigure: `Req Date: ${chain.pr.requiredDate}`,
                          timestamp: chain.pr.date,
                          level: 2,
                          raw: chain.pr,
                          moduleRoute: '/purchase-requests?submenu=requests'
                        })}

                        {chain.bpo && renderNodeRow({
                          id: chain.bpo.id,
                          name: `Buyer PO: ${chain.bpo.id}`,
                          category: 'Commercial PO',
                          icon: FileCheck2,
                          status: chain.bpo.status,
                          keyFigure: `${chain.bpo.qtySqFt} Sq.Ft @ ₹${chain.bpo.rate}`,
                          timestamp: chain.bpo.date,
                          level: 2,
                          raw: chain.bpo,
                          moduleRoute: '/purchase-orders?submenu=buyer-pos'
                        })}

                        {chain.so && renderNodeRow({
                          id: chain.so.id,
                          name: `Sales Order: ${chain.so.id}`,
                          category: 'Order Confirmation',
                          icon: Receipt,
                          status: chain.so.status,
                          keyFigure: `Credit: ${chain.so.creditStatus}`,
                          timestamp: chain.so.date,
                          level: 2,
                          raw: chain.so,
                          moduleRoute: '/sales-invoices?submenu=orders'
                        })}

                        {chain.inv && renderNodeRow({
                          id: chain.inv.id,
                          name: `Tax Invoice: ${chain.inv.id}`,
                          category: 'Billing',
                          icon: Receipt,
                          status: chain.inv.status,
                          keyFigure: `₹${chain.inv.totalAmount?.toLocaleString()}`,
                          timestamp: chain.inv.date,
                          level: 2,
                          raw: chain.inv,
                          moduleRoute: '/sales-invoices?submenu=billing'
                        })}

                        {chain.challan && renderNodeRow({
                          id: chain.challan.id,
                          name: `Delivery Challan: ${chain.challan.id} (${chain.challan.vehicleNo})`,
                          category: 'Dispatch & Haulage',
                          icon: Truck,
                          status: chain.challan.status,
                          keyFigure: `Driver: ${chain.challan.driverName}`,
                          timestamp: chain.challan.date,
                          level: 2,
                          raw: chain.challan,
                          moduleRoute: '/sales-invoices?submenu=dispatch'
                        })}

                        {chain.dispatch && renderNodeRow({
                          id: chain.dispatch.id,
                          name: `Dispatch: ${chain.dispatch.id} (${chain.dispatch.pod || 'POD In Transit'})`,
                          category: 'Logistics Exit',
                          icon: Truck,
                          status: chain.dispatch.status,
                          keyFigure: chain.dispatch.outTime,
                          timestamp: chain.dispatch.date,
                          level: 2,
                          raw: chain.dispatch,
                          moduleRoute: '/sales-invoices?submenu=dispatch'
                        })}

                        {chain.bgrn && renderNodeRow({
                          id: chain.bgrn.id,
                          name: `Buyer GRN: ${chain.bgrn.id}`,
                          category: 'Customer Receipt',
                          icon: CheckCircle2,
                          status: chain.bgrn.status,
                          keyFigure: chain.bgrn.condition,
                          isException: chain.bgrn.isException,
                          timestamp: chain.bgrn.date,
                          level: 2,
                          raw: chain.bgrn,
                          moduleRoute: '/material-receipts?submenu=receiving'
                        })}

                        {canSeeCost && chain.payments && chain.payments.map(py => renderNodeRow({
                          key: py.id,
                          id: py.id,
                          name: `Customer Payment: ${py.reference}`,
                          category: 'Accounts Receivable',
                          icon: DollarSign,
                          status: py.status,
                          keyFigure: `₹${py.amount?.toLocaleString()}`,
                          timestamp: py.date,
                          level: 2,
                          raw: py,
                          moduleRoute: '/accounts?submenu=receivables'
                        }))}

                        {/* Returns & Credit Note */}
                        {chain.returns && chain.returns.map(ret => (
                          <React.Fragment key={ret.id}>
                            {renderNodeRow({
                              id: ret.id,
                              name: `Buyer Claim: ${ret.id} (${ret.reason})`,
                              category: 'Return & Claim',
                              icon: AlertTriangle,
                              status: ret.status,
                              keyFigure: `${ret.qtySqFt} Sq.Ft Claimed`,
                              isException: true,
                              timestamp: ret.date,
                              level: 2,
                              raw: ret,
                              moduleRoute: '/returns?submenu=returns'
                            })}

                            {ret.creditNote && renderNodeRow({
                              id: ret.creditNote.id,
                              name: `Credit Note: ${ret.creditNote.id}`,
                              category: 'Refund Adjustment',
                              icon: DollarSign,
                              status: ret.creditNote.status,
                              keyFigure: `Credit: ₹${ret.creditNote.totalCredit?.toLocaleString()}`,
                              timestamp: ret.creditNote.date,
                              level: 3,
                              raw: ret.creditNote,
                              moduleRoute: '/accounts?submenu=receivables'
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* 16. OVERALL SUMMARY & YIELD STAGES */}
          {/* ========================================================= */}
          {renderNodeRow({
            id: 'SUM-01',
            name: `Lifecycle Summary: ${graph.stoneType}`,
            category: 'Performance Metrics',
            icon: FolderTree,
            status: 'Verified',
            keyFigure: `Overall Yield: ${graph.overallYieldPercent}%`,
            level: 2,
            hasChildren: true,
            isExpanded: isExpanded('summary'),
            onToggle: () => onToggleNode('summary'),
            raw: {
              overallYield: `${graph.overallYieldPercent}%`,
              lossRate: `${graph.overallLossPercent}%`,
              totalCost: canSeeCost ? `₹${graph.totalCost?.toLocaleString()}` : 'Protected',
              totalRevenue: canSeeCost ? `₹${graph.totalSaleValue?.toLocaleString()}` : 'Protected',
              grossMargin: canSeeCost ? `₹${graph.marginAmount?.toLocaleString()} (${graph.marginPercent}%)` : 'Protected'
            }
          })}

          {isExpanded('summary') && (
            <div style={{ marginLeft: '20px', padding: '14px', backgroundColor: 'var(--surface-subtle, #f8fafc)', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '10px 12px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Block to Dressed Yield</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>95.4% (0.42 CBM Loss)</div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Dressed to Sawn Slabs</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>88.5% (0.65 CBM Kerf)</div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Slabs to QC 2 Passing</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>97.4% (1 Rejection)</div>
                </div>

                <div style={{ padding: '10px 12px', background: 'var(--white)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Finished Tiles to Pieces</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>89.2% (5.8 Sq.Ft Offcut)</div>
                </div>
              </div>

              {canSeeCost && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Cost Build-up & Financial Outcome
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {graph.costBreakdown.map(cb => (
                      <div key={cb.category} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--white)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>{cb.category}:</span>
                        <strong style={{ color: 'var(--ink)' }}>₹{cb.amount.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
