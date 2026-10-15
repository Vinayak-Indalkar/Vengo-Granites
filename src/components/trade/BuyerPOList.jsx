import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, CheckCircle, XCircle, FileSpreadsheet, Printer, Eye, SlidersHorizontal, Check, X, Route as RouteIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerPOList({ activeTab = 'all' }) {
  const navigate = useNavigate();
  const {
    tradeBuyerPOs = [],
    approveBuyerPO,
    rejectBuyerPO,
    partiallyApproveBuyerPO,
    customers = [],
    stoneTypes = [],
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBPO, setSelectedBPO] = useState(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [partialModal, setPartialModal] = useState({ isOpen: false, bpo: null, lines: [] });
  const [rejectDialog, setRejectDialog] = useState({ isOpen: false, bpoId: null, reason: '' });

  // Filter based on activeTab: 'pending' | 'approved' | 'all'
  const filteredBPOs = useMemo(() => {
    return tradeBuyerPOs.filter(bpo => {
      if (activeTab === 'pending' && bpo.status !== 'Pending') return false;
      if (activeTab === 'approved' && bpo.status !== 'Approved') return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        bpo.id.toLowerCase().includes(q) ||
        (bpo.buyerName && bpo.buyerName.toLowerCase().includes(q)) ||
        (bpo.prId && bpo.prId.toLowerCase().includes(q)) ||
        (bpo.status && bpo.status.toLowerCase().includes(q))
      );
    });
  }, [tradeBuyerPOs, activeTab, searchQuery]);

  const handleApprove = (bpoId) => {
    approveBuyerPO(bpoId);
    if (showToast) showToast(`Buyer PO ${bpoId} approved. Sales Order & Bundle Reservation created.`);
  };

  const handleRejectPrompt = (bpoId) => {
    setRejectDialog({ isOpen: true, bpoId, reason: '' });
  };

  const confirmReject = () => {
    if (!rejectDialog.bpoId) return;
    rejectBuyerPO(rejectDialog.bpoId, rejectDialog.reason || 'Price or stock mismatch');
    if (showToast) showToast(`Buyer PO ${rejectDialog.bpoId} rejected.`);
    setRejectDialog({ isOpen: false, bpoId: null, reason: '' });
  };

  const handleOpenPartial = (bpo) => {
    setPartialModal({
      isOpen: true,
      bpo,
      lines: bpo.lines.map(l => ({ ...l }))
    });
  };

  const savePartialApprove = () => {
    if (!partialModal.bpo) return;
    partiallyApproveBuyerPO(partialModal.bpo.id, partialModal.lines);
    if (showToast) showToast(`Buyer PO ${partialModal.bpo.id} partially approved with adjusted quantity.`);
    setPartialModal({ isOpen: false, bpo: null, lines: [] });
  };

  const columns = [
    {
      header: 'BPO No.',
      accessor: 'id',
      width: '110px',
      render: r => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.id}</span>
    },
    { header: 'Date', accessor: 'date', width: '100px' },
    {
      header: 'Buyer Name',
      accessor: 'buyerName',
      render: r => <strong>{r.buyerName}</strong>
    },
    {
      header: 'Linked PR',
      accessor: 'prId',
      width: '100px',
      render: r => r.prId ? <span style={{ fontFamily: 'monospace' }}>{r.prId}</span> : '—'
    },
    {
      header: 'Credit Check',
      accessor: 'creditCheckResult',
      render: r => {
        const v = r.creditCheckResult;
        return (
          <span style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: (v && String(v).includes('Warning')) ? '#b45309' : '#047857'
          }}>
            {v}
          </span>
        );
      }
    },
    {
      header: 'Total (₹)',
      accessor: 'totalAmount',
      align: 'right',
      render: r => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '100px',
      render: r => <StatusBadge status={r.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: '90px',
      align: 'right',
      render: r => {
        const items = [
          {
            label: 'Stone Journey',
            icon: RouteIcon,
            onClick: () => navigate(`/stone-journey/${r.id}`)
          },
          {
            label: 'View Order Details',
            icon: Eye,
            onClick: () => { setSelectedBPO(r); setIsViewDrawerOpen(true); }
          }
        ];

        if (r.status === 'Pending') {
          items.push(
            { divider: true },
            {
              label: 'Approve Order',
              icon: CheckCircle,
              onClick: () => handleApprove(r.id)
            },
            {
              label: 'Partially Approve',
              icon: SlidersHorizontal,
              onClick: () => handleOpenPartial(r)
            },
            {
              label: 'Reject Order',
              icon: XCircle,
              danger: true,
              onClick: () => handleRejectPrompt(r.id)
            }
          );
        }

        return <ActionDropdown items={items} />;
      }
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Pending Buyer Purchase Orders';
      case 'approved':
        return 'Approved Buyer Purchase Orders';
      case 'all':
        return 'All Buyer Purchase Orders';
      default:
        return 'Buyer Purchase Orders';
    }
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

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredBPOs}
        pageSize={10}
        hoverable
      />

      {/* View Drawer */}
      <ViewDrawer
        isOpen={isViewDrawerOpen}
        onClose={() => { setIsViewDrawerOpen(false); setSelectedBPO(null); }}
        title={`Buyer PO Details: ${selectedBPO?.id || ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            {selectedBPO?.status === 'Pending' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleApprove(selectedBPO.id);
                  setIsViewDrawerOpen(false);
                }}
              >
                Approve & Generate SO
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsViewDrawerOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        {selectedBPO && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Buyer PO Number</label>
              <div className="detail-value" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {selectedBPO.id}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="detail-value">
                <StatusBadge status={selectedBPO.status} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">PO Date</label>
              <div className="detail-value">{selectedBPO.date}</div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Buyer Company</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>{selectedBPO.buyerName}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Linked Purchase Request</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {selectedBPO.prId || 'Direct PO'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Credit Evaluation</label>
              <div className="detail-value" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>
                Approved / Sufficient
              </div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Ordered Items & Stone Specifications</label>
              <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>Stone / Finish</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>Thk</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Qty (Sq.Ft)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Rate (₹)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedBPO.lines || []).map((l, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontWeight: 600 }}>{l.stoneName}</span>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{l.finishName} • {l.gradeName}</div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{l.thicknessName || '20mm'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>{l.qtySqFt}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>₹{l.rate}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>₹{Number(l.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subtotal</label>
              <div className="detail-value">₹{Number(selectedBPO.subtotal || 0).toLocaleString()}</div>
            </div>

            <div className="form-group">
              <label className="form-label">GST Tax (18%)</label>
              <div className="detail-value">₹{Number(selectedBPO.taxAmount || 0).toLocaleString()}</div>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Total Payable</label>
              <div className="detail-value" style={{ fontWeight: 800, color: 'var(--teal-700)', fontSize: '14px' }}>
                ₹{Number(selectedBPO.totalAmount || 0).toLocaleString()}
              </div>
            </div>
          </>
        )}
      </ViewDrawer>

      {/* Partial Approval Modal */}
      {partialModal.isOpen && (
        <div className="drawer-backdrop" onClick={() => setPartialModal({ isOpen: false, bpo: null, lines: [] })}>
          <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: '540px' }}>
            <div className="drawer-header">
              <div className="drawer-title">Partially Approve BPO: {partialModal.bpo?.id}</div>
              <button className="iconbtn" onClick={() => setPartialModal({ isOpen: false, bpo: null, lines: [] })}>
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="form-group col-span-2">
                <label className="form-label">Approval Guideline</label>
                <div className="detail-value" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  Adjust line quantities based on available slab stock:
                </div>
              </div>
              {partialModal.lines.map((line, idx) => (
                <React.Fragment key={idx}>
                  <div className="form-group">
                    <label className="form-label">{line.stoneName}</label>
                    <div className="detail-value" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      ₹{line.rate} / Sq.Ft
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Approved Quantity (Sq.Ft)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={line.qtySqFt}
                      onChange={(e) => {
                        const newQty = Number(e.target.value) || 0;
                        setPartialModal(p => {
                          const updated = [...p.lines];
                          updated[idx] = {
                            ...updated[idx],
                            qtySqFt: newQty,
                            amount: newQty * updated[idx].rate
                          };
                          return { ...p, lines: updated };
                        });
                      }}
                      placeholder="Enter qty"
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="drawer-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPartialModal({ isOpen: false, bpo: null, lines: [] })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={savePartialApprove}
              >
                Approve Adjusted Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectDialog.isOpen}
        title="Reject Buyer PO"
        message="Are you sure you want to reject this Buyer PO? A cancellation reason will be recorded."
        danger
        confirmLabel="Confirm Reject"
        onConfirm={confirmReject}
        onCancel={() => setRejectDialog({ isOpen: false, bpoId: null, reason: '' })}
      />
    </div>
  );
}
