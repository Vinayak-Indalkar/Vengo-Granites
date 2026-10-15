import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, StatusBadge, ActionDropdown, FormDrawer, ViewDrawer, ConfirmDialog } from '../CommonComponents';
import { Search, Plus, FileSpreadsheet, Printer, Eye, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

export function BuyerMaterialReceiptsTab({ tab = 'expected' }) {
  const {
    tradeBuyerGRNs = [],
    tradeDispatches = [],
    tradeChallans = [],
    tradeInvoices = [],
    addBuyerGRN,
    activeBuyerId,
    buyers = [],
    customers = [],
    showToast
  } = useApp();

  const buyerList = buyers.length > 0 ? buyers : customers;
  const currentBuyer = buyerList.find(b => b.id === activeBuyerId) || buyerList[0] || { id: 'CUST-001', name: 'Carrara Marble Importers' };

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  // Form for New GRN
  const [grnForm, setGrnForm] = useState({
    dispatchId: '',
    challanId: '',
    invoiceId: '',
    bundleId: 'BUN-2024-001',
    stoneName: 'Black Galaxy',
    receivedSqFt: 1800,
    damagedSqFt: 0,
    shortageSqFt: 0,
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav',
    remarks: 'Bundles unloaded at Bay B-2'
  });

  // Expected inbound shipments for activeBuyerId
  const expectedShipments = useMemo(() => {
    return tradeDispatches.filter(dsp => {
      const challan = tradeChallans.find(c => c.id === dsp.challanId);
      return (challan?.buyerId === activeBuyerId) && (dsp.status !== 'Delivered' || tab === 'expected');
    }).map(dsp => {
      const challan = tradeChallans.find(c => c.id === dsp.challanId);
      return {
        id: dsp.id,
        date: dsp.date,
        challanId: dsp.challanId,
        invoiceId: dsp.invoiceId,
        vehicleNo: dsp.vehicleNo,
        driverName: dsp.driverName,
        bundles: challan?.bundles || ['BUN-2024-001'],
        totalSqFt: challan?.totalSqFt || 1800,
        status: dsp.status,
        proofOfDelivery: dsp.proofOfDelivery
      };
    });
  }, [tradeDispatches, tradeChallans, activeBuyerId, tab]);

  // Buyer GRNs for activeBuyerId
  const buyerGRNs = useMemo(() => {
    return tradeBuyerGRNs.filter(g => g.buyerId === activeBuyerId || !g.buyerId);
  }, [tradeBuyerGRNs, activeBuyerId]);

  const filteredGRNs = useMemo(() => {
    let list = buyerGRNs;
    if (tab === 'received') {
      list = list.filter(g => (g.damagedSqFt || 0) === 0 && g.status !== 'Discrepancy');
    } else if (tab === 'discrepancies') {
      list = list.filter(g => (g.damagedSqFt || 0) > 0 || g.status === 'Discrepancy' || g.status === 'Accepted with Damage');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(g =>
      g.id?.toLowerCase().includes(q) ||
      g.challanId?.toLowerCase().includes(q) ||
      g.bundleId?.toLowerCase().includes(q) ||
      g.stoneName?.toLowerCase().includes(q)
    );
  }, [buyerGRNs, tab, searchQuery]);

  useEffect(() => {
    if (tab === 'new-grn') {
      const targetDsp = expectedShipments.find(d => d.status !== 'Delivered') || expectedShipments[0];
      handleOpenGRNModal(targetDsp);
    }
  }, [tab]);

  // Handlers
  const handleOpenGRNModal = (dsp) => {
    setActiveDispatch(dsp);
    const ch = tradeChallans.find(c => c.id === dsp?.challanId);
    setGrnForm({
      dispatchId: dsp?.id || 'DSP-0001',
      challanId: dsp?.challanId || 'CH-0001',
      invoiceId: dsp?.invoiceId || 'INV-0001',
      bundleId: ch?.bundles?.[0] || 'BUN-2024-001',
      stoneName: 'Black Galaxy Mirror Polished',
      receivedSqFt: ch?.totalSqFt || 1800,
      damagedSqFt: 0,
      shortageSqFt: 0,
      vehicleNo: dsp?.vehicleNo || 'AP 39 TB 4920',
      driverName: dsp?.driverName || 'Kishan Yadav',
      remarks: 'Inspected at Unloading Dock Bay B-2'
    });
    setIsDrawerOpen(true);
  };

  const handleSaveGRN = (e) => {
    e.preventDefault();
    const newBGRN = addBuyerGRN({
      buyerId: currentBuyer.id,
      buyerName: currentBuyer.name,
      dispatchId: grnForm.dispatchId,
      challanId: grnForm.challanId,
      invoiceId: grnForm.invoiceId,
      bundleId: grnForm.bundleId,
      stoneName: grnForm.stoneName,
      receivedSqFt: Number(grnForm.receivedSqFt) || 0,
      damagedSqFt: Number(grnForm.damagedSqFt) || 0,
      shortageSqFt: Number(grnForm.shortageSqFt) || 0,
      vehicleNo: grnForm.vehicleNo,
      driverName: grnForm.driverName,
      remarks: grnForm.remarks
    });

    setIsDrawerOpen(false);
    if (showToast) showToast(`Material GRN ${newBGRN.id} created & added to Yard Stock`, 'success');
  };

  // COLUMNS
  const expectedColumns = [
    { header: 'Shipment DSP No.', accessor: 'id', render: r => <span style={{ fontWeight: 600 }}>{r.id}</span> },
    { header: 'Dispatch Date', accessor: 'date' },
    { header: 'Challan Ref', accessor: 'challanId' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Vehicle No.', accessor: 'vehicleNo' },
    { header: 'Driver', accessor: 'driverName' },
    { header: 'Bundle Count', accessor: 'bundles', render: r => (r.bundles || []).length },
    { header: 'Total Sq.Ft', accessor: 'totalSqFt', render: r => Number(r.totalSqFt || 0).toLocaleString() },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <button className="btn btn-primary btn-sm" onClick={() => handleOpenGRNModal(r)}>
          <CheckCircle2 size={13} />
          <span>Confirm Receipt (GRN)</span>
        </button>
      )
    }
  ];

  const grnColumns = [
    { header: 'BGRN No.', accessor: 'id', render: r => <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.id}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Challan Ref', accessor: 'challanId' },
    { header: 'Invoice Ref', accessor: 'invoiceId' },
    { header: 'Bundle ID', accessor: 'bundleId', render: r => <span className="badge badge-subtle">{r.bundleId}</span> },
    { header: 'Stone Item', accessor: 'stoneName' },
    { header: 'Received Sq.Ft', accessor: 'receivedSqFt', render: r => Number(r.receivedSqFt || 0).toLocaleString() },
    {
      header: 'Damaged Sq.Ft',
      accessor: 'damagedSqFt',
      render: r => Number(r.damagedSqFt || 0) > 0 ? (
        <span style={{ color: 'var(--ruby-text)', fontWeight: 700 }}>{r.damagedSqFt}</span>
      ) : '-'
    },
    { header: 'Vehicle No.', accessor: 'vehicleNo' },
    { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'View GRN Details',
              icon: Eye,
              onClick: () => setViewItem(r)
            }
          ]}
        />
      )
    }
  ];

  const getTabTitle = () => {
    switch (tab) {
      case 'expected':
        return 'Expected Inbound Dispatches';
      case 'new-grn':
        return 'Create Material Receipt Note (GRN)';
      case 'received':
        return 'Material Receipts Register (GRN)';
      case 'discrepancies':
        return 'Receipt Discrepancies & Damage Log';
      default:
        return 'Material Receipts';
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
        {tab !== 'expected' && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenGRNModal(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>New GRN</span>
          </button>
        )}
      </div>

      {tab === 'expected' ? (
        <DataTable
          columns={expectedColumns}
          data={expectedShipments}
          emptyMessage="No pending inbound shipments expected."
        />
      ) : (
        <DataTable
          columns={grnColumns}
          data={filteredGRNs}
          emptyMessage="No material receipt records found."
        />
      )}

      {/* New GRN Drawer */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create Material Receipt Note (GRN)"
        onSubmit={handleSaveGRN}
        submitLabel="Register Material GRN"
      >
        <div className="form-group col-span-2">
          <label className="form-label">Buyer</label>
          <input
            className="form-input"
            value={`${currentBuyer.name} (${currentBuyer.id})`}
            disabled
            style={{ background: 'var(--surface-subtle)', color: 'var(--ink)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Challan Number</label>
          <input
            className="form-input"
            placeholder="e.g. CH-2026-9041"
            value={grnForm.challanId}
            onChange={e => setGrnForm({ ...grnForm, challanId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Invoice Number</label>
          <input
            className="form-input"
            placeholder="e.g. INV-2026-0081"
            value={grnForm.invoiceId}
            onChange={e => setGrnForm({ ...grnForm, invoiceId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bundle ID</label>
          <input
            className="form-input"
            placeholder="e.g. BUN-2026-0819"
            value={grnForm.bundleId}
            onChange={e => setGrnForm({ ...grnForm, bundleId: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Stone Type</label>
          <input
            className="form-input"
            placeholder="e.g. Black Galaxy"
            value={grnForm.stoneName}
            onChange={e => setGrnForm({ ...grnForm, stoneName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Received Quantity (Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 1200"
            value={grnForm.receivedSqFt}
            onChange={e => setGrnForm({ ...grnForm, receivedSqFt: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Damaged Quantity (Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 0"
            value={grnForm.damagedSqFt}
            onChange={e => setGrnForm({ ...grnForm, damagedSqFt: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Shortage Quantity (Sq.Ft)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 0"
            value={grnForm.shortageSqFt}
            onChange={e => setGrnForm({ ...grnForm, shortageSqFt: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Truck Registration Number</label>
          <input
            className="form-input"
            placeholder="e.g. RJ-14-GA-9012"
            value={grnForm.vehicleNo}
            onChange={e => setGrnForm({ ...grnForm, vehicleNo: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Driver Name</label>
          <input
            className="form-input"
            placeholder="e.g. Ramesh Kumar"
            value={grnForm.driverName}
            onChange={e => setGrnForm({ ...grnForm, driverName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Driver Phone</label>
          <input
            className="form-input"
            placeholder="e.g. +91 98765 43210"
            value={grnForm.driverPhone || ''}
            onChange={e => setGrnForm({ ...grnForm, driverPhone: e.target.value })}
          />
        </div>

        <div className="form-group col-span-2">
          <label className="form-label">Remarks</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="Enter remarks or arrival notes..."
            value={grnForm.remarks}
            onChange={e => setGrnForm({ ...grnForm, remarks: e.target.value })}
          />
        </div>
      </FormDrawer>

      {/* View GRN Details */}
      <ViewDrawer
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Material Receipt: ${viewItem?.id || ''}`}
      >
        {viewItem && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">GRN Number</label>
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
              <label className="form-label">Date</label>
              <div className="detail-value">{viewItem.date}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Challan Number</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.challanId || '—'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Number</label>
              <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                {viewItem.invoiceId || '—'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bundle ID</label>
              <div className="detail-value" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {viewItem.bundleId || '—'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <div className="detail-value">{viewItem.stoneName || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Received Quantity</label>
              <div className="detail-value" style={{ fontWeight: 600 }}>
                {viewItem.receivedSqFt} Sq.Ft
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Damaged Quantity</label>
              <div className="detail-value" style={{ color: Number(viewItem.damagedSqFt || 0) > 0 ? 'var(--ruby-text)' : 'inherit', fontWeight: 600 }}>
                {viewItem.damagedSqFt || '0'} Sq.Ft
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Shortage Quantity</label>
              <div className="detail-value" style={{ color: Number(viewItem.shortageSqFt || 0) > 0 ? 'var(--ruby-text)' : 'inherit' }}>
                {viewItem.shortageSqFt || '0'} Sq.Ft
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Truck Registration Number</label>
              <div className="detail-value">{viewItem.vehicleNo || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <div className="detail-value">{viewItem.driverName || '—'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <div className="detail-value">{viewItem.driverPhone || '—'}</div>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <div className="detail-value">{viewItem.remarks || 'No remarks recorded.'}</div>
            </div>
          </>
        )}
      </ViewDrawer>
    </div>
  );
}
