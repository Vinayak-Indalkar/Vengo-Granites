import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../CommonComponents';
import { X, ExternalLink, ArrowRight, CheckCircle2, AlertTriangle, Layers, Truck, Box, ShieldCheck, Scissors } from 'lucide-react';

export function TraceabilityModal({ isOpen, onClose, targetId, onSelectId }) {
  const { getTraceabilityChain, detailedRawBlocks } = useApp();

  if (!isOpen || !targetId) return null;

  const chain = getTraceabilityChain(targetId);

  if (!chain) {
    return (
      <div className="drawer-backdrop" onClick={onClose}>
        <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '480px', height: 'auto', alignSelf: 'center', borderRadius: 'var(--r-16)' }}>
          <div className="drawer-header">
            <div className="drawer-title">Item Traceability</div>
            <button className="iconbtn" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="drawer-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <p style={{ color: 'var(--ink)' }}>No traceability records found for ID: <strong>{targetId}</strong></p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const {
    searchedId,
    piece,
    slab,
    block,
    box,
    gateEntry,
    weighbridge,
    qc1Inspections = [],
    materialJobs = [],
    slicingJob,
    lot,
    qc2Inspections = [],
    cutToSizeJob,
    labels = [],
    movements = []
  } = chain;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer"
        onClick={e => e.stopPropagation()}
        style={{
          width: '780px',
          maxWidth: '94vw',
          height: '90vh',
          alignSelf: 'center',
          borderRadius: 'var(--r-16)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--white)',
          boxShadow: 'var(--sh-menu)'
        }}
      >
        <div className="drawer-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 700 }}>
              End-to-End Product Traceability
            </div>
            <div className="drawer-title" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Lineage: <span style={{ color: 'var(--teal-600)', fontFamily: 'var(--font-mono)' }}>{searchedId}</span></span>
              <span className="badge badge-soft" style={{ fontSize: '11px' }}>
                {piece ? 'Finished Piece' : slab ? 'Slab' : block ? 'Raw Block' : box ? 'Storage Box' : 'Item'}
              </span>
            </div>
          </div>
          <button className="iconbtn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Summary Box */}
          <div style={{
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            padding: '14px 18px',
            borderRadius: 'var(--r-12)',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: 'var(--muted)' }}>Quarry / Supplier</div>
              <strong style={{ color: 'var(--ink)' }}>{block?.supplier || gateEntry?.supplier || 'N/A'}</strong>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Stone Type</div>
              <strong style={{ color: 'var(--ink)' }}>{block?.stoneType || slab?.stoneType || piece?.stoneType || 'N/A'}</strong>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Current Location</div>
              <strong style={{ color: 'var(--ink)' }}>{piece?.location || slab?.location || block?.location || box?.location || 'In Yard'}</strong>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Yield / Loss Tracked</div>
              <strong style={{ color: 'var(--emerald-text)' }}>
                {slicingJob ? `Yield: ${slicingJob.yieldPct}%` : 'Standard Raw Inflow'}
              </strong>
            </div>
          </div>

          {/* Timeline of linked records */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 1. Gate Entry & Weighbridge */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={14} />
                  <span>1. Gate Entry & Weighbridge Inward</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {gateEntry?.dateTime || weighbridge?.date || 'N/A'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>Gate Entry: <strong>{gateEntry?.entryNo || 'N/A'}</strong></div>
                <div>Truck No: <strong>{gateEntry?.truckNo || 'N/A'}</strong></div>
                <div>Driver: <strong>{gateEntry?.driverName || 'N/A'}</strong></div>
                <div>Transporter: <strong>{gateEntry?.transporter || 'N/A'}</strong></div>
                <div>Challan No: <strong>{gateEntry?.challanNo || 'N/A'}</strong></div>
                <div>Challan Weight: <strong>{gateEntry?.challanWeight ? `${gateEntry.challanWeight} Tons` : 'N/A'}</strong></div>
                <div>Weigh Ticket: <strong>{weighbridge?.ticketNo || 'N/A'}</strong></div>
                <div>Net Weight: <strong style={{ color: 'var(--emerald-text)' }}>{weighbridge?.netWeight ? `${weighbridge.netWeight} Tons` : 'N/A'}</strong></div>
                <div>Weight Variance: <strong style={{ color: weighbridge?.variance < 0 ? 'var(--amber-text)' : 'var(--emerald-text)' }}>{weighbridge?.variance ? `${weighbridge.variance} Tons` : '0 Tons'}</strong></div>
              </div>
            </div>

            {/* 2. Raw Block */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box size={14} />
                  <span>2. Raw Block Record</span>
                </div>
                {block && (
                  <button className="btn btn-xs btn-ghost" onClick={() => onSelectId && onSelectId(block.id)}>
                    View Block
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>Block No: <strong>{block?.blockNo || 'N/A'}</strong></div>
                <div>Quarry Block #: <strong>{block?.quarryBlockNo || 'N/A'}</strong></div>
                <div>Dimensions: <strong>{block ? `${block.length}" x ${block.width}" x ${block.height}"` : 'N/A'}</strong></div>
                <div>Gross Volume: <strong>{block ? `${block.grossVolume} cu.ft` : 'N/A'}</strong></div>
                <div>Estimated Sq.Ft: <strong>{block ? `${block.estimatedSqFt} Sq.Ft` : 'N/A'}</strong></div>
                <div>Block Status: <StatusBadge status={block?.status} /></div>
              </div>
            </div>

            {/* 3. QC 1 Block Inspection */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} />
                  <span>3. QC 1 Block Inspection</span>
                </div>
              </div>
              {qc1Inspections.length > 0 ? (
                qc1Inspections.map(q => (
                  <div key={q.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px', borderTop: '1px dashed var(--line)', paddingTop: '6px', marginTop: '6px' }}>
                    <div>Inspection No: <strong>{q.inspectionNo}</strong></div>
                    <div>Inspector: <strong>{q.inspector}</strong></div>
                    <div>Result: <StatusBadge status={q.result} /></div>
                    <div>Grade: <strong>{q.grade}</strong></div>
                    <div>Cracks / Fissures: <strong>{q.cracks}</strong></div>
                    <div>Color Match: <strong>{q.colorMatch}</strong></div>
                    <div style={{ gridColumn: 'span 3', color: 'var(--muted)' }}>Remarks: {q.remarks || 'None'}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No QC 1 inspection logged yet for this block.</div>
              )}
            </div>

            {/* 4. Applied Material */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={14} />
                  <span>4. Material Application (Resin / Mesh)</span>
                </div>
              </div>
              {materialJobs.length > 0 ? (
                materialJobs.map(m => (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px', borderTop: '1px dashed var(--line)', paddingTop: '6px', marginTop: '6px' }}>
                    <div>Job No: <strong>{m.jobNo}</strong></div>
                    <div>Material Type: <strong>{m.materialType}</strong></div>
                    <div>Batch No: <strong>{m.materialBatchNo}</strong></div>
                    <div>Quantity Used: <strong>{m.quantityUsed} {m.unit}</strong></div>
                    <div>Area Covered: <strong>{m.areaCovered} Sq.Ft</strong></div>
                    <div>Cost Added: <strong style={{ color: 'var(--emerald-text)' }}>+${m.costAdded}</strong></div>
                    <div>Method: <strong>{m.method}</strong></div>
                    <div>Operator: <strong>{m.operator}</strong></div>
                    <div>Curing Time: <strong>{m.curingTime}</strong></div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No resin or mesh jobs applied.</div>
              )}
            </div>

            {/* 5. Slicing & Lot */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={14} />
                  <span>5. Slicing & Gangsaw Processing</span>
                </div>
              </div>
              {slicingJob ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div>Slicing Job: <strong>{slicingJob.jobNo}</strong></div>
                  <div>Machine: <strong>{slicingJob.machine}</strong></div>
                  <div>Operator: <strong>{slicingJob.operator}</strong></div>
                  <div>Created Lot ID: <strong style={{ color: 'var(--teal-600)', fontFamily: 'var(--font-mono)' }}>{slicingJob.lotId}</strong></div>
                  <div>Slabs Produced: <strong>{slicingJob.slabCount} slabs</strong></div>
                  <div>Slab Dimensions: <strong>{slicingJob.slabLength}" x {slicingJob.slabWidth}" ({slicingJob.thickness}mm)</strong></div>
                  <div>Total Output Sq.Ft: <strong style={{ color: 'var(--emerald-text)' }}>{slicingJob.totalSqFt} Sq.Ft</strong></div>
                  <div>Yield %: <span className="badge badge-emerald">{slicingJob.yieldPct}%</span></div>
                  <div>Offcut Weight: <strong>{slicingJob.offcutWeight} Tons</strong></div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Block has not been sliced yet.</div>
              )}
            </div>

            {/* 6. QC 2 Slab Inspection */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={14} />
                  <span>6. QC 2 Slab Inspection (Selling Gate)</span>
                </div>
              </div>
              {qc2Inspections.length > 0 ? (
                qc2Inspections.map(q => (
                  <div key={q.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px', borderTop: '1px dashed var(--line)', paddingTop: '6px', marginTop: '6px' }}>
                    <div>Inspection No: <strong>{q.inspectionNo}</strong></div>
                    <div>Inspector: <strong>{q.inspector}</strong></div>
                    <div>Result: <StatusBadge status={q.result} /></div>
                    <div>Flatness: <strong>{q.flatness}</strong></div>
                    <div>Surface / Gloss: <strong>{q.surface}</strong></div>
                    <div>Edges: <strong>{q.edges}</strong></div>
                    <div>Resin Quality: <strong>{q.resinQuality}</strong></div>
                    <div>Grade: <strong>{q.grade}</strong></div>
                    <div>Workflow Gate: <strong style={{ color: 'var(--emerald-text)' }}>Saleable (QC 2 Passed)</strong></div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No QC 2 inspections logged for this slab lot yet.</div>
              )}
            </div>

            {/* 7. Cut to Size & Pieces */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scissors size={14} />
                  <span>7. Cut to Size Processing</span>
                </div>
              </div>
              {cutToSizeJob ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div>Job No: <strong>{cutToSizeJob.jobNo}</strong></div>
                  <div>Machine: <strong>{cutToSizeJob.machine}</strong></div>
                  <div>Operator: <strong>{cutToSizeJob.operator}</strong></div>
                  <div>Cut Size: <strong>{cutToSizeJob.cutSizeName}</strong></div>
                  <div>Pieces Produced: <strong>{cutToSizeJob.piecesCount} pcs</strong></div>
                  <div>Total Sq.Ft: <strong style={{ color: 'var(--emerald-text)' }}>{cutToSizeJob.totalSqFt} Sq.Ft</strong></div>
                  <div>Offcut Sq.Ft: <strong>{cutToSizeJob.offcutSqFt} Sq.Ft</strong></div>
                  <div>Offcut Action: <span className="badge badge-soft">{cutToSizeJob.offcutAction}</span></div>
                  <div>Breakage: <strong>{cutToSizeJob.breakage} pcs</strong></div>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Full slab intact (no cut to size jobs performed).</div>
              )}
            </div>

            {/* 8. Storage, Box & Location */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Move size={14} />
                  <span>8. Storage Hierarchy (Yard → Zone → Bay → Box)</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div>Yard: <strong>{slab?.yard || piece?.yard || block?.receivingYard || 'Carrara Yard Main'}</strong></div>
                <div>Zone: <strong>{slab?.zone || piece?.zone || 'Zone C'}</strong></div>
                <div>Rack / Bay: <strong>{slab?.bay || piece?.bay || block?.location || 'A-Frame 01'}</strong></div>
                <div>Box / Pallet: <strong>{slab?.boxId || piece?.boxId || box?.boxNo || 'None / Loose'}</strong></div>
                <div>Putaway By: <strong>{box?.putawayBy || 'Ramesh Patel'}</strong></div>
                <div>Putaway Date: <strong>{box?.putawayDate || '2026-10-13'}</strong></div>
              </div>
            </div>

            {/* 9. Labels & Audit Movements */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-8)', padding: '14px', backgroundColor: 'var(--white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Printer size={14} />
                  <span>9. Labels & Movement Audit</span>
                </div>
              </div>
              <div style={{ fontSize: '12px' }}>
                {labels.length > 0 ? (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Generated Labels:</strong>
                    {labels.map(l => (
                      <span key={l.id} className="badge badge-soft" style={{ marginLeft: '6px' }}>
                        {l.labelNo} ({l.labelType} • Prints: {l.printCount})
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--muted)', marginBottom: '8px' }}>No direct labels printed yet.</div>
                )}

                {movements.length > 0 && (
                  <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '6px' }}>
                    <strong>Movements History:</strong>
                    {movements.map(m => (
                      <div key={m.id} style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '3px' }}>
                        • {m.date} - From {m.fromLoc} to {m.toLoc} ({m.reason}) by {m.person}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="drawer-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Traceability</button>
        </div>
      </div>
    </div>
  );
}
