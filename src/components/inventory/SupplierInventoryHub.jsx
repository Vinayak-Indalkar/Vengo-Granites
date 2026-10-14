import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  DataTable,
  FormDrawer,
  StatusBadge,
  StatCard,
  ActionDropdown,
  DatePicker,
  PhotoUpload
} from '../CommonComponents';
import {
  Layers,
  Truck,
  Box,
  ShieldCheck,
  Scissors,
  CheckCircle2,
  Move,
  Printer,
  AlertTriangle,
  ClipboardList,
  Plus,
  Search,
  Scale,
  QrCode,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Activity,
  ArrowRight,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StepTracker } from './StepTracker';
import { TraceabilityModal } from './TraceabilityModal';
import { LabelPrintModal } from './LabelPrintModal';
import { QRScanModal } from './QRScanModal';

// Submenu and tab definitions
const SUB_MENUS = [
  {
    key: 'inbound',
    label: 'Inbound',
    icon: Truck,
    tabs: [
      { key: 'gate', label: 'Gate Entry' },
      { key: 'weighbridge', label: 'Weighbridge' },
      { key: 'blocks', label: 'Raw Blocks' }
    ]
  },
  {
    key: 'qc',
    label: 'Quality Control',
    icon: ShieldCheck,
    tabs: [
      { key: 'qc1_pending', label: 'QC 1 Pending' },
      { key: 'qc1_inspections', label: 'QC 1 Inspections' },
      { key: 'qc2_pending', label: 'QC 2 Pending' },
      { key: 'qc2_inspections', label: 'QC 2 Inspections' },
      { key: 'qc_results', label: 'Results' }
    ]
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: Scissors,
    tabs: [
      { key: 'material', label: 'Apply Material' },
      { key: 'slicing', label: 'Slicing' },
      { key: 'cut', label: 'Cut to Size' },
      { key: 'lots', label: 'Lots & Slabs' },
      { key: 'pieces', label: 'Pieces' }
    ]
  },
  {
    key: 'storage',
    label: 'Storage & Labels',
    icon: Move,
    tabs: [
      { key: 'putaway', label: 'Putaway' },
      { key: 'yard_map', label: 'Yard Map' },
      { key: 'boxes', label: 'Boxes' },
      { key: 'move', label: 'Move' },
      { key: 'transfer', label: 'Transfer' },
      { key: 'gen_label', label: 'Generate Label' },
      { key: 'print', label: 'Print' },
      { key: 'reprint', label: 'Reprint' },
      { key: 'scan', label: 'Scan' }
    ]
  },
  {
    key: 'stock',
    label: 'Stock',
    icon: Layers,
    tabs: [
      { key: 'stock_grid', label: 'Stock Grid' },
      { key: 'stock_blocks', label: 'Blocks' },
      { key: 'stock_slabs', label: 'Slabs' },
      { key: 'stock_pieces', label: 'Pieces' },
      { key: 'stock_reserved', label: 'Reserved' },
      { key: 'stock_low', label: 'Low Stock' },
      { key: 'stock_movements', label: 'Movements' }
    ]
  },
  {
    key: 'exceptions',
    label: 'Exceptions',
    icon: AlertTriangle,
    tabs: [
      { key: 'defective', label: 'Defective Store' },
      { key: 'rework', label: 'Rework' },
      { key: 'scrap', label: 'Scrap' },
      { key: 'writeoff', label: 'Write-off' },
      { key: 'count_sheets', label: 'Count Sheets' },
      { key: 'variances', label: 'Variances' },
      { key: 'adjustments', label: 'Adjustments' }
    ]
  }
];

export function SupplierInventoryHub() {
  const {
    activeClient,
    currentUser,
    detailedRawBlocks,
    addDetailedRawBlock,
    updateDetailedRawBlock,
    deleteDetailedRawBlock,
    gateEntries,
    addGateEntry,
    updateGateEntry,
    deleteGateEntry,
    weighbridgeTickets,
    addWeighbridgeTicket,
    updateWeighbridgeTicket,
    deleteWeighbridgeTicket,
    qc1Inspections,
    addQC1Inspection,
    updateQC1Inspection,
    deleteQC1Inspection,
    materialsStock,
    materialJobs,
    addMaterialJob,
    updateMaterialJob,
    deleteMaterialJob,
    slicingJobs,
    addSlicingJob,
    updateSlicingJob,
    deleteSlicingJob,
    lots,
    slabs,
    updateSlab,
    markSlabScrapOrDefect,
    qc2Inspections,
    addQC2Inspection,
    updateQC2Inspection,
    deleteQC2Inspection,
    cutToSizeJobs,
    addCutToSizeJob,
    updateCutToSizeJob,
    deleteCutToSizeJob,
    pieces,
    updatePiece,
    boxes,
    addBox,
    updateBox,
    deleteBox,
    moveStorageItem,
    storageMovements,
    labels,
    addLabel,
    reprintLabel,
    deleteLabel,
    defectStoreRecords,
    addDefectRecord,
    updateDefectRecord,
    deleteDefectRecord,
    countSheets,
    addCountSheet,
    approveCountSheet,
    deleteCountSheet,
    suppliers,
    stoneTypes,
    yardLocations,
    showToast
  } = useApp();

  // Active Submenu & Tab State linked to URL search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSubMenu = searchParams.get('submenu') || 'inbound';
  const activeSubMenu = SUB_MENUS.some(m => m.key === rawSubMenu) ? rawSubMenu : 'inbound';

  const currentSubMenuObj = useMemo(() => {
    return SUB_MENUS.find(m => m.key === activeSubMenu) || SUB_MENUS[0];
  }, [activeSubMenu]);

  const rawTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (rawTab && currentSubMenuObj.tabs.some(t => t.key === rawTab)) {
      return rawTab;
    }
    return currentSubMenuObj.tabs[0]?.key || 'gate';
  }, [rawTab, currentSubMenuObj]);

  const [showWorkflowTracker, setShowWorkflowTracker] = useState(false);

  // Modals state
  const [traceTargetId, setTraceTargetId] = useState(null);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [activeLabelToPrint, setActiveLabelToPrint] = useState(null);
  const [isScanOpen, setIsScanOpen] = useState(false);

  // FormDrawer state
  const [drawerMode, setDrawerMode] = useState(null); // 'add' | 'edit' | null
  const [drawerType, setDrawerType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Active workflow block for StepTracker
  const [selectedBlockId, setSelectedBlockId] = useState(detailedRawBlocks[0]?.id || 'BLK-0001');

  const selectedBlock = useMemo(() => {
    return detailedRawBlocks.find(b => b.id === selectedBlockId) || detailedRawBlocks[0] || null;
  }, [detailedRawBlocks, selectedBlockId]);

  // Handle Submenu Switch
  const handleSubMenuChange = (menuKey) => {
    const targetMenu = SUB_MENUS.find(m => m.key === menuKey);
    const firstTab = targetMenu?.tabs[0]?.key || 'gate';
    setSearchParams({ submenu: menuKey, tab: firstTab });
  };

  // Handle Tab Switch
  const handleTabChange = (tabKey) => {
    if (tabKey === 'scan') {
      setIsScanOpen(true);
    } else {
      setSearchParams({ submenu: activeSubMenu, tab: tabKey });
    }
  };

  // Active Tab Metadata (title and action button)
  const activeTabMeta = useMemo(() => {
    switch (activeTab) {
      case 'gate':
        return { title: 'Gate Entry & Security Log', actionLabel: 'New Gate Entry', actionType: 'gate' };
      case 'weighbridge':
        return { title: 'Weighbridge Tickets & Weight Variance', actionLabel: 'New Weigh Ticket', actionType: 'weighbridge' };
      case 'blocks':
        return { title: 'Raw Blocks Inventory', actionLabel: 'Register Raw Block', actionType: 'block' };
      case 'qc1_pending':
        return { title: 'QC 1 Pending Inspection Queue', actionLabel: 'Perform QC 1', actionType: 'qc1' };
      case 'qc1_inspections':
        return { title: 'QC 1 Inspection Records', actionLabel: 'New QC 1 Inspection', actionType: 'qc1' };
      case 'qc2_pending':
        return { title: 'QC 2 Pending Inspection Queue', actionLabel: 'Perform QC 2', actionType: 'qc2' };
      case 'qc2_inspections':
        return { title: 'QC 2 Inspection Records (Slabs & Lots)', actionLabel: 'New QC 2 Inspection', actionType: 'qc2' };
      case 'qc_results':
        return { title: 'Quality Control Summary & Results', actionLabel: null, actionType: null };
      case 'material':
        return { title: 'Apply Material Treatments (Resin / Mesh / Chemical)', actionLabel: 'New Material Job', actionType: 'material' };
      case 'slicing':
        return { title: 'Gangsaw Slicing Operations', actionLabel: 'New Slicing Job', actionType: 'slicing' };
      case 'cut':
        return { title: 'Bridge Saw Cut to Size Operations', actionLabel: 'New Cutting Job', actionType: 'cut' };
      case 'lots':
        return { title: 'Lots & Slabs Register', actionLabel: null, actionType: null };
      case 'pieces':
        return { title: 'Dimensional Cut Pieces Register', actionLabel: null, actionType: null };
      case 'putaway':
        return { title: 'Putaway & Storage Assignment', actionLabel: 'New Putaway', actionType: 'putaway' };
      case 'yard_map':
        return { title: 'Interactive Yard & Bay Map', actionLabel: 'Create Box / Pallet', actionType: 'box' };
      case 'boxes':
        return { title: 'Boxes & Pallets Storage', actionLabel: 'Create Box / Pallet', actionType: 'box' };
      case 'move':
        return { title: 'Internal Yard Movement History', actionLabel: 'Record Movement', actionType: 'putaway' };
      case 'transfer':
        return { title: 'Inter-Yard Stock Transfers', actionLabel: 'Record Transfer', actionType: 'putaway' };
      case 'gen_label':
        return { title: 'Generate Product Tags & Barcodes', actionLabel: null, actionType: null };
      case 'print':
        return { title: 'Label Print Queue', actionLabel: null, actionType: null };
      case 'reprint':
        return { title: 'Label Reprint Audit Log', actionLabel: null, actionType: null };
      case 'scan':
        return { title: 'Optical Tag Scanner', actionLabel: 'Open Scanner', actionType: 'scan' };
      case 'stock_grid':
        return { title: 'Stock Grid (Universal Inventory)', actionLabel: null, actionType: null };
      case 'stock_blocks':
        return { title: 'Block Stock Inventory', actionLabel: 'Register Block', actionType: 'block' };
      case 'stock_slabs':
        return { title: 'Slab Stock Inventory', actionLabel: null, actionType: null };
      case 'stock_pieces':
        return { title: 'Piece Stock Inventory', actionLabel: null, actionType: null };
      case 'stock_reserved':
        return { title: 'Reserved Stock Allocations', actionLabel: null, actionType: null };
      case 'stock_low':
        return { title: 'Low Stock & Reorder Alerts', actionLabel: null, actionType: null };
      case 'stock_movements':
        return { title: 'Audit Movements Ledger', actionLabel: null, actionType: null };
      case 'defective':
        return { title: 'Defective Store Pool', actionLabel: null, actionType: null };
      case 'rework':
        return { title: 'Rework & Remediation Queue', actionLabel: null, actionType: null };
      case 'scrap':
      case 'writeoff':
        return { title: 'Scrap & Write-Off Loss Register', actionLabel: null, actionType: null };
      case 'count_sheets':
        return { title: 'Physical Stock Count Sheets', actionLabel: 'New Count Sheet', actionType: 'count' };
      case 'variances':
        return { title: 'Stock Audit Variances', actionLabel: null, actionType: null };
      case 'adjustments':
        return { title: 'Stock Adjustments Approval Queue', actionLabel: null, actionType: null };
      default:
        return { title: 'Inventory Management', actionLabel: null, actionType: null };
    }
  }, [activeTab]);

  // Submenu specific KPI counters
  const qc1PassedCount = useMemo(() => {
    return qc1Inspections.filter(q => q.result === 'Pass').length;
  }, [qc1Inspections]);

  const qc2PassedCount = useMemo(() => {
    return qc2Inspections.filter(q => q.result === 'Pass').length;
  }, [qc2Inspections]);

  const reworkCount = useMemo(() => {
    return qc1Inspections.filter(q => q.result === 'Rework').length + qc2Inspections.filter(q => q.result === 'Rework').length;
  }, [qc1Inspections, qc2Inspections]);

  const totalLabelsCount = useMemo(() => {
    return labels.reduce((acc, l) => acc + (Number(l.printCount) || 1), 0);
  }, [labels]);

  // Open Traceability Helper
  const openTrace = (id) => {
    setTraceTargetId(id);
    setIsTraceOpen(true);
  };

  // Open Print Label Helper
  const openPrintLabel = (item, type = 'Block') => {
    const itemId = item.id || item.blockNo || item.slabNo || item.pieceNo || item.boxNo;
    const existing = labels.find(l => l.linkedRecordId === itemId);
    if (existing) {
      setActiveLabelToPrint(existing);
    } else {
      const newLbl = addLabel({
        labelType: type,
        linkedRecordId: itemId,
        stoneType: item.stoneType || 'Granite',
        size: item.size || `${item.length || 100} x ${item.width || 60}`,
        thickness: item.thickness ? `${item.thickness}mm` : 'Block',
        grade: item.grade || 'Grade A',
        finish: item.finish || 'Polished High Gloss',
        sqft: item.sqft || item.estimatedSqFt || 0,
        location: item.location || 'Carrara Yard Main',
        supplier: item.supplier || 'Monte Altissimo Quarry'
      });
      setActiveLabelToPrint(newLbl);
    }
  };

  // KPI Totals
  const kpiTotals = useMemo(() => {
    const activeBlocks = detailedRawBlocks.filter(b => !b.isArchived);
    const activeSlabs = slabs.filter(s => !s.isArchived);
    const activePieces = pieces.filter(p => !p.isArchived);

    const totalBlockTons = activeBlocks.reduce((acc, b) => acc + (Number(b.netWeight) || 0), 0).toFixed(1);
    const totalSlabSqFt = activeSlabs.reduce((acc, s) => acc + (Number(s.sqft) || 0), 0).toFixed(1);
    const totalPieceSqFt = activePieces.reduce((acc, p) => acc + (Number(p.sqft) || 0), 0).toFixed(1);
    const defectiveCount = defectStoreRecords.filter(d => !d.isArchived).length;

    return {
      blockTons: totalBlockTons,
      slabSqFt: totalSlabSqFt,
      pieceSqFt: totalPieceSqFt,
      defective: defectiveCount
    };
  }, [detailedRawBlocks, slabs, pieces, defectStoreRecords]);

  // Open Drawer Handlers
  const openAddDrawer = (type) => {
    setDrawerType(type);
    setDrawerMode('add');
    setEditingItem(null);
    if (type === 'gate') {
      setFormData({
        truckNo: '',
        driverName: '',
        driverPhone: '',
        transporter: '',
        supplier: suppliers[0]?.name || 'Monte Altissimo Quarry',
        poNo: 'PO-2026-101',
        challanNo: '',
        challanWeight: '',
        remarks: '',
        photo: ''
      });
    } else if (type === 'weighbridge') {
      const activeGE = gateEntries.find(g => !g.isArchived) || gateEntries[0];
      setFormData({
        gateEntryId: activeGE?.id || 'GE-0001',
        grossWeight: 42.0,
        tareWeight: 14.0,
        challanWeight: activeGE?.challanWeight || 28.0,
        unit: 'Tons',
        inTime: '08:15',
        outTime: '08:45',
        weighedBy: currentUser.name
      });
    } else if (type === 'block') {
      const activeGE = gateEntries.find(g => !g.isArchived) || gateEntries[0];
      const activeWB = weighbridgeTickets.find(w => w.gateEntryId === activeGE?.id) || weighbridgeTickets[0];
      setFormData({
        supplier: activeGE?.supplier || suppliers[0]?.name || 'Monte Altissimo Quarry',
        quarryBlockNo: `Q-BLK-${Date.now().toString().slice(-4)}`,
        stoneType: stoneTypes[0]?.name || 'Black Galaxy Granite',
        color: 'Deep Black with Flecks',
        gateEntryId: activeGE?.id || 'GE-0001',
        weighbridgeTicketId: activeWB?.id || 'WB-0001',
        length: 114,
        width: 68,
        height: 70,
        netWeight: activeWB?.netWeight || 28.25,
        receivingYard: yardLocations[0]?.name || 'Carrara Yard Main',
        location: 'Bay 01',
        grade: 'Grade A',
        itemCost: 5900,
        remarks: ''
      });
    } else if (type === 'qc1') {
      setFormData({
        blockId: selectedBlockId || detailedRawBlocks[0]?.id || 'BLK-0001',
        inspector: currentUser.name,
        colorMatch: 'Uniform Deep Color',
        veining: 'Natural Consistent Veining',
        cracks: 'None',
        stains: 'None',
        moisture: 'Dry (1.0%)',
        sizeCheck: 'Verified dimensions match challan',
        defectType: 'None',
        defectLocation: 'N/A',
        defectSeverity: 'None',
        grade: 'Grade A',
        result: 'Pass',
        remarks: ''
      });
    } else if (type === 'material') {
      setFormData({
        blockId: selectedBlockId || detailedRawBlocks[0]?.id || 'BLK-0001',
        slabLotId: '',
        materialType: 'Resin',
        materialBatchNo: `BATCH-${Date.now().toString().slice(-4)}`,
        quantityUsed: 20,
        unit: 'Ltr',
        areaCovered: 450,
        method: 'Vacuum Surface Infusion & Mesh',
        operator: currentUser.name,
        shift: 'Morning Shift',
        curingTime: '4 Hours',
        remarks: ''
      });
    } else if (type === 'slicing') {
      setFormData({
        blockId: selectedBlockId || detailedRawBlocks[0]?.id || 'BLK-0001',
        machine: 'Gangsaw 01 - Breton Diamond',
        operator: currentUser.name,
        shift: 'Morning Shift',
        bladeWireDetails: 'Diamond Gangsaw Blades (3.5mm Kerf)',
        thickness: 20,
        slabCount: 38,
        slabLength: selectedBlock?.length || 114,
        slabWidth: selectedBlock?.width || 68,
        breakageCount: 0,
        offcutWeight: 2.1,
        powerOrConsumableUsed: '420 kWh',
        remarks: ''
      });
    } else if (type === 'qc2') {
      setFormData({
        lotId: lots[0]?.id || 'LOT-0001',
        slabId: slabs[0]?.id || 'SLB-0001',
        inspector: currentUser.name,
        thicknessCheck: '20mm (+/- 0.2mm precision)',
        flatness: 'Flat (no bowing or warping)',
        edges: 'Crisp Arris, no chipping',
        surface: 'Mirror Polish (>90 Gloss)',
        colorMatch: 'Consistent with Lot standard',
        cracks: 'None',
        resinQuality: 'Fully Cured and clear',
        defectType: 'None',
        defectCount: 0,
        grade: 'Grade A',
        result: 'Pass',
        remarks: ''
      });
    } else if (type === 'cut') {
      setFormData({
        slabId: slabs.find(s => s.status === 'QC 2 Passed' || s.status === 'Stored')?.id || slabs[0]?.id || 'SLB-0001',
        machine: 'Bridge Saw 02 - Pedrini CNC',
        operator: currentUser.name,
        cutSizeName: '24" x 24" Flooring Tiles',
        length: 24,
        width: 24,
        thickness: 20,
        piecesCount: 12,
        breakage: 0,
        offcutAction: 'Keep as Stock',
        remarks: ''
      });
    } else if (type === 'box') {
      setFormData({
        type: 'A-Frame',
        stoneType: stoneTypes[0]?.name || 'Black Galaxy Granite',
        thickness: 20,
        size: '114" x 68"',
        grade: 'Grade A',
        pieceCount: 0,
        sqft: 0,
        weight: 0,
        yard: 'Carrara Yard Main',
        zone: 'Zone C',
        bay: 'A-Frame 01',
        capacity: 20,
        status: 'Open'
      });
    } else if (type === 'putaway') {
      setFormData({
        itemId: slabs[0]?.id || 'SLB-0001',
        itemType: 'Slab',
        fromLoc: 'Gangsaw Shed',
        toYard: 'Carrara Yard Main',
        toZone: 'Zone C',
        toBay: 'A-Frame 01',
        toBox: '',
        reason: 'Putaway into storage after inspection'
      });
    } else if (type === 'count') {
      setFormData({
        yard: 'Carrara Yard Main',
        zone: 'Zone C',
        countedBy: currentUser.name,
        item: slabs[0]?.id || 'SLB-0001',
        systemQuantity: 1,
        physicalQuantity: 1,
        reason: 'Monthly Verification Audit'
      });
    }
  };

  const openEditDrawer = (type, item) => {
    setDrawerType(type);
    setDrawerMode('edit');
    setEditingItem(item);
    setFormData({ ...item });
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setDrawerType('');
    setEditingItem(null);
    setFormData({});
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e?.preventDefault?.();

    if (drawerType === 'gate') {
      if (drawerMode === 'add') addGateEntry(formData);
      else updateGateEntry(editingItem.id, formData);
    } else if (drawerType === 'weighbridge') {
      if (drawerMode === 'add') addWeighbridgeTicket(formData);
      else updateWeighbridgeTicket(editingItem.id, formData);
    } else if (drawerType === 'block') {
      if (drawerMode === 'add') addDetailedRawBlock(formData);
      else updateDetailedRawBlock(editingItem.id, formData);
    } else if (drawerType === 'qc1') {
      if (drawerMode === 'add') addQC1Inspection(formData);
      else updateQC1Inspection(editingItem.id, formData);
    } else if (drawerType === 'material') {
      if (drawerMode === 'add') addMaterialJob(formData);
      else updateMaterialJob(editingItem.id, formData);
    } else if (drawerType === 'slicing') {
      if (drawerMode === 'add') addSlicingJob(formData);
      else updateSlicingJob(editingItem.id, formData);
    } else if (drawerType === 'qc2') {
      if (drawerMode === 'add') addQC2Inspection(formData);
      else updateQC2Inspection(editingItem.id, formData);
    } else if (drawerType === 'cut') {
      if (drawerMode === 'add') addCutToSizeJob(formData);
      else updateCutToSizeJob(editingItem.id, formData);
    } else if (drawerType === 'box') {
      if (drawerMode === 'add') addBox(formData);
      else updateBox(editingItem.id, formData);
    } else if (drawerType === 'putaway') {
      const ok = moveStorageItem({
        itemId: formData.itemId,
        itemType: formData.itemType,
        fromLoc: formData.fromLoc,
        toYard: formData.toYard,
        toZone: formData.toZone,
        toBay: formData.toBay,
        toBox: formData.toBox,
        reason: formData.reason,
        person: currentUser.name
      });
      if (!ok) return;
    } else if (drawerType === 'count') {
      if (drawerMode === 'add') addCountSheet(formData);
    }

    closeDrawer();
  };

  // Delete Handler
  const handleDeleteItem = (type, id) => {
    if (type === 'gate') deleteGateEntry(id);
    else if (type === 'block') deleteDetailedRawBlock(id);
    else if (type === 'qc1') deleteQC1Inspection(id);
    else if (type === 'material') deleteMaterialJob(id);
    else if (type === 'slicing') deleteSlicingJob(id);
    else if (type === 'qc2') deleteQC2Inspection(id);
    else if (type === 'cut') deleteCutToSizeJob(id);
    else if (type === 'box') deleteBox(id);
    else if (type === 'label') deleteLabel(id);
    else if (type === 'count') deleteCountSheet(id);
    else if (type === 'slab') markSlabScrapOrDefect(id, 'Scrap', 'User marked as scrap');
  };

  // Step Tracker Click
  const handleStepClick = (step) => {
    if (step === 1) { setSearchParams({ submenu: 'inbound', tab: 'gate' }); }
    else if (step === 2) { setSearchParams({ submenu: 'inbound', tab: 'blocks' }); }
    else if (step === 3) { setSearchParams({ submenu: 'qc', tab: 'qc1_inspections' }); }
    else if (step === 4) { setSearchParams({ submenu: 'processing', tab: 'material' }); }
    else if (step === 5) { setSearchParams({ submenu: 'processing', tab: 'slicing' }); }
    else if (step === 6) { setSearchParams({ submenu: 'qc', tab: 'qc2_inspections' }); }
    else if (step === 7) { setSearchParams({ submenu: 'processing', tab: 'cut' }); }
    else if (step === 8) { setSearchParams({ submenu: 'storage', tab: 'boxes' }); }
    else if (step === 9) { setSearchParams({ submenu: 'storage', tab: 'print' }); }
    else if (step === 10) { setSearchParams({ submenu: 'stock', tab: 'stock_grid' }); }
  };

  // ==========================================
  // UNIFIED ROWS & FILTERED DATASETS
  // ==========================================
  const unifiedStockRows = useMemo(() => {
    const rows = [];
    detailedRawBlocks.filter(b => !b.isArchived).forEach(b => {
      rows.push({
        id: b.id,
        stage: 'Block',
        stoneType: b.stoneType,
        thickness: `${b.height || 0}"`,
        size: `${b.length || 0}" x ${b.width || 0}"`,
        finish: 'Rough',
        grade: b.grade || 'Grade A',
        pieces: 1,
        sqft: b.estimatedSqFt || 0,
        location: `${b.receivingYard} / ${b.location}`,
        box: 'N/A',
        status: b.status,
        rawItem: b
      });
    });

    slabs.filter(s => !s.isArchived).forEach(s => {
      rows.push({
        id: s.id,
        stage: 'Slab',
        stoneType: s.stoneType,
        thickness: `${s.thickness || 20}mm`,
        size: `${s.length || 114}" x ${s.width || 68}"`,
        finish: 'Polished',
        grade: s.grade || 'Grade A',
        pieces: 1,
        sqft: s.sqft || 0,
        location: `${s.yard} / ${s.bay}`,
        box: s.boxId || 'Loose',
        status: s.status,
        rawItem: s
      });
    });

    pieces.filter(p => !p.isArchived).forEach(p => {
      rows.push({
        id: p.id,
        stage: 'Piece',
        stoneType: p.stoneType,
        thickness: `${p.thickness || 20}mm`,
        size: p.size || 'Tiles',
        finish: 'Polished',
        grade: p.grade || 'Grade A',
        pieces: 1,
        sqft: p.sqft || 0,
        location: `${p.yard} / ${p.bay}`,
        box: p.boxId || 'Pallet',
        status: p.status,
        rawItem: p
      });
    });

    return rows;
  }, [detailedRawBlocks, slabs, pieces]);

  // QC 1 Pending Blocks
  const qc1PendingBlocks = useMemo(() => {
    return detailedRawBlocks.filter(b => !b.isArchived && (b.status === 'Received' || b.status === 'In QC 1'));
  }, [detailedRawBlocks]);

  // QC 2 Pending Slabs
  const qc2PendingSlabs = useMemo(() => {
    return slabs.filter(s => !s.isArchived && (s.status === 'Sliced' || s.status === 'In QC 2'));
  }, [slabs]);

  // Combined QC Results
  const combinedQCResults = useMemo(() => {
    const list = [];
    qc1Inspections.forEach(q => list.push({ ...q, stage: 'QC 1 (Block)', target: q.blockId }));
    qc2Inspections.forEach(q => list.push({ ...q, stage: 'QC 2 (Slab)', target: q.slabId || q.lotId }));
    return list;
  }, [qc1Inspections, qc2Inspections]);

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return materialsStock.filter(m => m.currentStock <= (m.minStock || 100));
  }, [materialsStock]);

  // Variances from count sheets
  const varianceSheets = useMemo(() => {
    return countSheets.filter(c => c.variance !== 0);
  }, [countSheets]);

  // ==========================================
  // TABLE COLUMNS (Matching HRPages patterns)
  // ==========================================
  const stockGridColumns = [
    {
      header: 'Stage',
      render: r => (
        <span className={`badge ${r.stage === 'Block' ? 'badge-cobalt' : r.stage === 'Slab' ? 'badge-teal' : 'badge-emerald'}`}>
          {r.stage}
        </span>
      )
    },
    {
      header: 'Item ID',
      render: r => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>
          {r.id}
        </span>
      )
    },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Thickness', accessor: 'thickness' },
    { header: 'Dimensions', accessor: 'size' },
    { header: 'Finish', accessor: 'finish' },
    { header: 'Grade', render: r => <span className="badge badge-soft">{r.grade}</span> },
    { header: 'Pieces', render: r => <span className="table-num">{r.pieces}</span> },
    { header: 'Total Sq.Ft', render: r => <span className="table-num" style={{ fontWeight: 600 }}>{r.sqft}</span> },
    { header: 'Yard & Location', accessor: 'location' },
    { header: 'Box / Pallet', accessor: 'box' },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Lineage', icon: Search, onClick: () => openTrace(r.id) },
            { label: 'Print / Reprint Label', icon: Printer, onClick: () => openPrintLabel(r.rawItem, r.stage) },
            { label: 'Edit Record', icon: Edit3, onClick: () => openEditDrawer(r.stage === 'Block' ? 'block' : r.stage === 'Slab' ? 'slab' : 'cut', r.rawItem) },
            {
              label: 'Archive Record',
              icon: Trash2,
              danger: true,
              confirm: `Archive ${r.id}?`,
              onClick: () => handleDeleteItem(r.stage === 'Block' ? 'block' : 'slab', r.id)
            }
          ]}
        />
      )
    }
  ];

  const gateEntryColumns = [
    { header: 'Entry No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.entryNo}</span> },
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Truck No', render: r => <strong>{r.truckNo}</strong> },
    { header: 'Driver', accessor: 'driverName' },
    { header: 'Phone', accessor: 'driverPhone' },
    { header: 'Transporter', accessor: 'transporter' },
    { header: 'Supplier / Quarry', accessor: 'supplier' },
    { header: 'Challan No', accessor: 'challanNo' },
    { header: 'Challan Wt', render: r => <span className="table-num">{r.challanWeight} Tons</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Record', icon: Search, onClick: () => openTrace(r.id) },
            { label: 'Edit Entry', icon: Edit3, onClick: () => openEditDrawer('gate', r) },
            {
              label: 'Archive Entry',
              icon: Trash2,
              danger: true,
              confirm: `Archive Gate Entry ${r.id}?`,
              onClick: () => handleDeleteItem('gate', r.id)
            }
          ]}
        />
      )
    }
  ];

  const weighbridgeColumns = [
    { header: 'Ticket No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.ticketNo}</span> },
    { header: 'Gate Entry', accessor: 'gateEntryId' },
    { header: 'Gross Weight', render: r => <span className="table-num">{r.grossWeight} {r.unit}</span> },
    { header: 'Tare Weight', render: r => <span className="table-num">{r.tareWeight} {r.unit}</span> },
    {
      header: 'Net Weight (Calc)',
      render: r => <span className="table-num" style={{ fontWeight: 700, color: 'var(--emerald-text)' }}>{r.netWeight} {r.unit}</span>
    },
    { header: 'Challan Wt', render: r => <span className="table-num">{r.challanWeight} {r.unit}</span> },
    {
      header: 'Variance (Calc)',
      render: r => (
        <span className="table-num" style={{ fontWeight: 600, color: r.variance < 0 ? 'var(--amber-text)' : 'var(--emerald-text)' }}>
          {r.variance > 0 ? `+${r.variance}` : r.variance} {r.unit}
        </span>
      )
    },
    { header: 'Weighed By', accessor: 'weighedBy' },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Weights', icon: Search, onClick: () => openTrace(r.id) },
            {
              label: 'Delete Ticket',
              icon: Trash2,
              danger: true,
              confirm: `Delete Weighbridge Ticket ${r.id}?`,
              onClick: () => handleDeleteItem('weighbridge', r.id)
            }
          ]}
        />
      )
    }
  ];

  const rawBlockColumns = [
    {
      header: 'Block No',
      render: r => (
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={() => setSelectedBlockId(r.id)}
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: selectedBlockId === r.id ? 'var(--teal-600)' : 'var(--ink)' }}
        >
          {r.blockNo}
        </button>
      )
    },
    { header: 'Quarry Block #', accessor: 'quarryBlockNo' },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Gate / Weighbridge', render: r => `${r.gateEntryId} / ${r.weighbridgeTicketId}` },
    { header: 'Dimensions', render: r => `${r.length}" x ${r.width}" x ${r.height}"` },
    { header: 'Volume (Calc)', render: r => <span className="table-num">{r.grossVolume} cu.ft</span> },
    { header: 'Net Weight', render: r => <span className="table-num">{r.netWeight} Tons</span> },
    { header: 'Est. Sq.Ft (Calc)', render: r => <span className="table-num" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>{r.estimatedSqFt}</span> },
    { header: 'Location', render: r => `${r.receivingYard} / ${r.location}` },
    { header: 'Grade', render: r => <span className="badge badge-soft">{r.grade}</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Lineage', icon: Search, onClick: () => openTrace(r.id) },
            { label: 'Print Label', icon: Printer, onClick: () => openPrintLabel(r, 'Block') },
            { label: 'Edit Block', icon: Edit3, onClick: () => openEditDrawer('block', r) },
            {
              label: 'Archive Block',
              icon: Trash2,
              danger: true,
              confirm: `Archive Raw Block ${r.id}?`,
              onClick: () => handleDeleteItem('block', r.id)
            }
          ]}
        />
      )
    }
  ];

  const qcInspectionsColumns = [
    { header: 'Inspection No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.inspectionNo}</span> },
    { header: 'Target Item', render: r => <strong>{r.target || r.blockId || r.slabId || r.lotId}</strong> },
    { header: 'Stage', render: r => <span className="badge badge-soft">{r.stage || 'Inspection'}</span> },
    { header: 'Inspector', accessor: 'inspector' },
    { header: 'Date', accessor: 'date' },
    { header: 'Grade', render: r => <span className="badge badge-soft">{r.grade}</span> },
    { header: 'Result', render: r => <StatusBadge status={r.result} /> },
    { header: 'Remarks', accessor: 'remarks' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Item', icon: Search, onClick: () => openTrace(r.target || r.blockId || r.slabId || r.lotId) }
          ]}
        />
      )
    }
  ];

  const materialColumns = [
    { header: 'Job No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.jobNo}</span> },
    { header: 'Target Block / Lot', render: r => r.blockId || r.slabLotId },
    { header: 'Date', accessor: 'date' },
    { header: 'Material Type', render: r => <span className="badge badge-cobalt">{r.materialType}</span> },
    { header: 'Batch No', accessor: 'materialBatchNo' },
    { header: 'Qty Used', render: r => <span className="table-num">{r.quantityUsed} {r.unit}</span> },
    { header: 'Area Covered', render: r => <span className="table-num">{r.areaCovered} Sq.Ft</span> },
    {
      header: 'Cost Added (Calc)',
      render: r => <span className="table-num" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>+${r.costAdded}</span>
    },
    { header: 'Operator', accessor: 'operator' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Target', icon: Search, onClick: () => openTrace(r.blockId || r.slabLotId) },
            { label: 'Edit Job', icon: Edit3, onClick: () => openEditDrawer('material', r) }
          ]}
        />
      )
    }
  ];

  const slicingColumns = [
    { header: 'Job No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.jobNo}</span> },
    { header: 'Block No', accessor: 'blockId' },
    {
      header: 'Lot Created',
      render: r => <strong style={{ color: 'var(--teal-600)', fontFamily: 'var(--font-mono)' }}>{r.lotId}</strong>
    },
    { header: 'Machine', accessor: 'machine' },
    { header: 'Operator', accessor: 'operator' },
    { header: 'Slabs Cut', render: r => <span className="table-num">{r.slabCount} slabs</span> },
    { header: 'Dimensions', render: r => `${r.slabLength}" x ${r.slabWidth}" (${r.thickness}mm)` },
    {
      header: 'Total Sq.Ft (Calc)',
      render: r => <span className="table-num" style={{ fontWeight: 700, color: 'var(--emerald-text)' }}>{r.totalSqFt}</span>
    },
    {
      header: 'Yield % (Calc)',
      render: r => <span className="badge badge-emerald">{r.yieldPct}%</span>
    },
    { header: 'Offcut Wt', render: r => <span className="table-num">{r.offcutWeight} Tons</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Lot', icon: Search, onClick: () => openTrace(r.lotId) },
            { label: 'Edit Job', icon: Edit3, onClick: () => openEditDrawer('slicing', r) }
          ]}
        />
      )
    }
  ];

  const cutColumns = [
    { header: 'Job No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.jobNo}</span> },
    { header: 'Source Slab', accessor: 'slabId' },
    { header: 'Cut Name', accessor: 'cutSizeName' },
    { header: 'Dimensions', render: r => `${r.length}" x ${r.width}"` },
    { header: 'Pieces Count', render: r => <span className="table-num">{r.piecesCount} pcs</span> },
    { header: 'Sq.Ft / Pc', render: r => <span className="table-num">{r.sqftPerPiece}</span> },
    { header: 'Total Sq.Ft', render: r => <span className="table-num" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>{r.totalSqFt}</span> },
    { header: 'Offcut Sq.Ft', render: r => <span className="table-num">{r.offcutSqFt}</span> },
    { header: 'Offcut Action', render: r => <span className="badge badge-soft">{r.offcutAction}</span> },
    { header: 'Operator', accessor: 'operator' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Source Slab', icon: Search, onClick: () => openTrace(r.slabId) }
          ]}
        />
      )
    }
  ];

  const boxColumns = [
    { header: 'Box No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.boxNo}</span> },
    { header: 'Type', render: r => <span className="badge badge-cobalt">{r.type}</span> },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Dimensions', accessor: 'size' },
    { header: 'Grade', render: r => <span className="badge badge-soft">{r.grade}</span> },
    { header: 'Pieces Loaded', render: r => <span className="table-num">{r.pieceCount} pcs</span> },
    { header: 'Total Sq.Ft', render: r => <span className="table-num" style={{ fontWeight: 600 }}>{r.sqft}</span> },
    { header: 'Location', accessor: 'location' },
    { header: 'Capacity', render: r => <span className="table-num">{r.currentLoad} / {r.capacity}</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Box', icon: Search, onClick: () => openTrace(r.id) },
            { label: 'Print Label', icon: Printer, onClick: () => openPrintLabel(r, 'Box') },
            { label: 'Edit Box', icon: Edit3, onClick: () => openEditDrawer('box', r) },
            {
              label: 'Delete Box',
              icon: Trash2,
              danger: true,
              confirm: `Delete Box ${r.id}?`,
              onClick: () => handleDeleteItem('box', r.id)
            }
          ]}
        />
      )
    }
  ];

  const labelColumns = [
    { header: 'Label No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.labelNo}</span> },
    { header: 'Type', render: r => <span className="badge badge-cobalt">{r.labelType}</span> },
    { header: 'Linked Record', render: r => <strong>{r.linkedRecordId}</strong> },
    { header: 'Template', accessor: 'template' },
    { header: 'QR Tag', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{r.qrCode}</span> },
    { header: 'Barcode', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{r.barcode}</span> },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Location', accessor: 'location' },
    { header: 'Print Count', render: r => <strong style={{ color: 'var(--teal-600)' }}>{r.printCount}</strong> },
    { header: 'Printed By', accessor: 'printedBy' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Print / Reprint Label', icon: Printer, onClick: () => setActiveLabelToPrint(r) },
            { label: 'Trace Linked Record', icon: Search, onClick: () => openTrace(r.linkedRecordId) },
            {
              label: 'Archive Label',
              icon: Trash2,
              danger: true,
              confirm: `Archive Label ${r.id}?`,
              onClick: () => handleDeleteItem('label', r.id)
            }
          ]}
        />
      )
    }
  ];

  const defectColumns = [
    { header: 'Defect No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.defectNo}</span> },
    { header: 'Item / Material', render: r => <strong>{r.item}</strong> },
    { header: 'Step Found', accessor: 'stepFound' },
    { header: 'Defect Type', accessor: 'defectType' },
    { header: 'Severity', render: r => <span className={`badge ${r.severity === 'High' ? 'badge-ruby' : 'badge-amber'}`}>{r.severity}</span> },
    { header: 'Action', render: r => <span className="badge badge-ruby">{r.action}</span> },
    { header: 'Sq.Ft / Wt Lost', render: r => <span className="table-num" style={{ fontWeight: 600 }}>{r.sqftOrWeightLost}</span> },
    { header: 'Date', accessor: 'date' },
    { header: 'Remarks', accessor: 'remarks' },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            { label: 'Trace Defective Item', icon: Search, onClick: () => openTrace(r.item) }
          ]}
        />
      )
    }
  ];

  const countColumns = [
    { header: 'Sheet No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.countSheetNo}</span> },
    { header: 'Yard & Zone', render: r => `${r.yard} / ${r.zone}` },
    { header: 'Item ID', render: r => <strong>{r.item}</strong> },
    { header: 'Counted By', accessor: 'countedBy' },
    { header: 'Date', accessor: 'date' },
    { header: 'System Qty', render: r => <span className="table-num">{r.systemQuantity}</span> },
    { header: 'Physical Qty', render: r => <span className="table-num">{r.physicalQuantity}</span> },
    {
      header: 'Variance (Calc)',
      render: r => (
        <span className="table-num" style={{ fontWeight: 700, color: r.variance !== 0 ? 'var(--ruby-text)' : 'var(--emerald-text)' }}>
          {r.variance > 0 ? `+${r.variance}` : r.variance}
        </span>
      )
    },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { header: 'Approved By', render: r => r.approvedBy || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Pending</span> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            ...(r.status !== 'Approved' ? [
              { label: 'Approve Adjustment', icon: CheckCircle2, onClick: () => approveCountSheet(r.id) }
            ] : []),
            { label: 'Trace Item', icon: Search, onClick: () => openTrace(r.item) },
            {
              label: 'Archive Sheet',
              icon: Trash2,
              danger: true,
              confirm: `Archive Count Sheet ${r.id}?`,
              onClick: () => handleDeleteItem('count', r.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Tier 1: Top Sub-menus Bar (Clean white bar matching HRHub style) */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
          Sub Menu:
        </span>
        {SUB_MENUS.map(m => {
          const Icon = m.icon;
          const isActive = activeSubMenu === m.key;
          return (
            <button
              key={m.key}
              type="button"
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleSubMenuChange(m.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px'
              }}
            >
              <Icon size={14} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tier 2: Tabs Bar under active Sub-menu */}
      <div style={{
        padding: '8px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
          Tabs:
        </span>
        {currentSubMenuObj.tabs.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleTabChange(t.key)}
              style={{
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px'
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          {/* Header Row: Title & Action Buttons (matching Attendance module pattern) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {activeTabMeta.title}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                Inventory &bull; {currentSubMenuObj.label} &bull; {currentSubMenuObj.tabs.find(t => t.key === activeTab)?.label || activeTab}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsScanOpen(true)}>
                <QrCode size={14} />
                <span>Scan Tag</span>
              </button>

              {activeTabMeta.actionLabel && (
                <button className="btn btn-primary btn-sm" onClick={() => openAddDrawer(activeTabMeta.actionType)}>
                  <Plus size={14} />
                  <span>{activeTabMeta.actionLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Workflow Process StepTracker */}
          <div style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-8)',
            padding: '10px 14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} style={{ color: 'var(--teal-600)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Process Workflow Tracker:</span>
                <select
                  className="form-select"
                  value={selectedBlockId}
                  onChange={e => setSelectedBlockId(e.target.value)}
                  style={{ width: 'auto', height: '28px', fontSize: '12px', fontWeight: 600, padding: '2px 8px' }}
                >
                  {detailedRawBlocks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.blockNo} - {b.stoneType} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button className="btn btn-xs btn-secondary" onClick={() => openTrace(selectedBlockId)}>
                  <Eye size={12} />
                  <span>Trace Lineage</span>
                </button>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={() => setShowWorkflowTracker(!showWorkflowTracker)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <span>{showWorkflowTracker ? 'Hide 10-Step Flow' : 'Show 10-Step Flow'}</span>
                  {showWorkflowTracker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {showWorkflowTracker && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <StepTracker
                  currentStep={selectedBlock?.currentStep || 2}
                  status={selectedBlock?.status || 'Received'}
                  onStepClick={handleStepClick}
                />
              </div>
            )}
          </div>

          {/* Submenu-specific KPI StatCards */}
          {activeSubMenu === 'inbound' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="Gate Entries" value={`${gateEntries.length} Recorded`} icon={Truck} subtext="Truck arrivals at security gate" />
              <StatCard label="Weighbridge Tickets" value={`${weighbridgeTickets.length} Tickets`} icon={Scale} subtext="Gross, tare & net weighments" />
              <StatCard label="Raw Blocks Received" value={`${detailedRawBlocks.length} Blocks`} icon={Box} subtext="Quarry blocks unloaded in yard" />
              <StatCard label="Total Block Tonnage" value={`${kpiTotals.blockTons} MT`} icon={Layers} subtext="Net verified block weight" />
            </div>
          )}

          {activeSubMenu === 'qc' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="QC 1 Pending" value={`${qc1PendingBlocks.length} Blocks`} icon={AlertTriangle} subtext="Raw block inspection queue" />
              <StatCard label="QC 1 Passed" value={`${qc1PassedCount} Blocks`} icon={CheckCircle2} subtext="Approved for processing/slicing" />
              <StatCard label="QC 2 Pending" value={`${qc2PendingSlabs.length} Slabs`} icon={Clock} subtext="Slabs awaiting final QA inspection" />
              <StatCard label="QC 2 Passed" value={`${qc2PassedCount} Slabs`} icon={ShieldCheck} subtext="Ready for storage / sale allocation" />
            </div>
          )}

          {activeSubMenu === 'processing' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="Material Applications" value={`${materialJobs.length} Jobs`} icon={Activity} subtext="Resin, mesh & chemical coats" />
              <StatCard label="Slicing Operations" value={`${slicingJobs.length} Runs`} icon={Scissors} subtext="Gangsaw block cutting jobs" />
              <StatCard label="Cut to Size Jobs" value={`${cutToSizeJobs.length} Jobs`} icon={Box} subtext="Bridge saw precision cutting" />
              <StatCard label="Total Yield Output" value={`${(Number(kpiTotals.slabSqFt) + Number(kpiTotals.pieceSqFt)).toFixed(1)} Sq.Ft`} icon={Layers} subtext="Total processed surface area" />
            </div>
          )}

          {activeSubMenu === 'storage' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="Boxes & Pallets" value={`${boxes.length} Units`} icon={Box} subtext="Stored across yard bays & A-frames" />
              <StatCard label="Internal Moves" value={`${storageMovements.length} Movements`} icon={Move} subtext="Bay & box relocations logged" />
              <StatCard label="Labels Generated" value={`${labels.length} Active`} icon={QrCode} subtext="QR & barcode tracking tags" />
              <StatCard label="Label Prints Log" value={`${totalLabelsCount} Printed`} icon={Printer} subtext="Total physical print count" />
            </div>
          )}

          {activeSubMenu === 'stock' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="Blocks Stock" value={`${kpiTotals.blockTons} MT`} icon={Box} subtext="Raw inflow & QC 1 passed" />
              <StatCard label="Slabs Stock" value={`${kpiTotals.slabSqFt} Sq.Ft`} icon={Layers} subtext="Gangsaw sliced & polished" />
              <StatCard label="Pieces Stock" value={`${kpiTotals.pieceSqFt} Sq.Ft`} icon={Scissors} subtext="Cut-to-size dimensional tiles" />
              <StatCard label="Defective Store" value={`${kpiTotals.defective} Records`} icon={AlertTriangle} subtext="QC rejects & rework pool" />
            </div>
          )}

          {activeSubMenu === 'exceptions' && (
            <div className="stats-grid" style={{ marginBottom: '16px' }}>
              <StatCard label="Defective Pool" value={`${kpiTotals.defective} Records`} icon={AlertTriangle} subtext="Segregated non-conforming items" />
              <StatCard label="Rework Queue" value={`${reworkCount} Items`} icon={RefreshCw} subtext="Items flagged for re-processing" />
              <StatCard label="Scrap / Write-off" value={`${defectStoreRecords.filter(d => d.action === 'Scrap').length} Records`} icon={Trash2} subtext="Scrapped & write-off material losses" />
              <StatCard label="Audit Variances" value={`${varianceSheets.length} Variances`} icon={FileText} subtext="Physical count audit discrepancies" />
            </div>
          )}

      {/* ==================================================== */}
      {/* SUB MENU 1: INBOUND                                  */}
      {/* ==================================================== */}
      {activeSubMenu === 'inbound' && (
        <>
          {activeTab === 'gate' && (
            <DataTable
              columns={gateEntryColumns}
              data={gateEntries}
              emptyMessage="No gate entries recorded."
            />
          )}

          {activeTab === 'weighbridge' && (
            <DataTable
              columns={weighbridgeColumns}
              data={weighbridgeTickets}
              emptyMessage="No weighbridge tickets recorded."
            />
          )}

          {activeTab === 'blocks' && (
            <DataTable
              columns={rawBlockColumns}
              data={detailedRawBlocks}
              emptyMessage="No raw blocks recorded."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 2: QUALITY CONTROL                          */}
      {/* ==================================================== */}
      {activeSubMenu === 'qc' && (
        <>
          {activeTab === 'qc1_pending' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Blocks Pending Initial QC 1 ({qc1PendingBlocks.length})
              </div>
              <DataTable
                columns={rawBlockColumns}
                data={qc1PendingBlocks}
                emptyMessage="No blocks pending QC 1."
              />
            </div>
          )}

          {activeTab === 'qc1_inspections' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                QC 1 Block Inspections Log ({qc1Inspections.length})
              </div>
              <DataTable
                columns={qcInspectionsColumns}
                data={qc1Inspections.map(q => ({ ...q, target: q.blockId, stage: 'QC 1 (Block)' }))}
                emptyMessage="No QC 1 inspections recorded."
              />
            </div>
          )}

          {activeTab === 'qc2_pending' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Slabs Pending QC 2 Polishing Inspection ({qc2PendingSlabs.length})
              </div>
              <DataTable
                columns={stockGridColumns.filter(c => c.header !== 'Stage')}
                data={qc2PendingSlabs.map(s => ({
                  id: s.id,
                  stoneType: s.stoneType,
                  thickness: `${s.thickness}mm`,
                  size: `${s.length}" x ${s.width}"`,
                  finish: 'Polished',
                  grade: s.grade,
                  pieces: 1,
                  sqft: s.sqft,
                  location: s.location,
                  box: s.boxId || 'Loose',
                  status: s.status,
                  rawItem: s
                }))}
                emptyMessage="No slabs pending QC 2."
              />
            </div>
          )}

          {activeTab === 'qc2_inspections' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                QC 2 Slab Inspections Log ({qc2Inspections.length})
              </div>
              <DataTable
                columns={qcInspectionsColumns}
                data={qc2Inspections.map(q => ({ ...q, target: q.slabId || q.lotId, stage: 'QC 2 (Slab)' }))}
                emptyMessage="No QC 2 inspections recorded."
              />
            </div>
          )}

          {activeTab === 'qc_results' && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                All Quality Control Outcomes ({combinedQCResults.length})
              </div>
              <DataTable
                columns={qcInspectionsColumns}
                data={combinedQCResults}
                emptyMessage="No quality control results logged."
              />
            </div>
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 3: PROCESSING                               */}
      {/* ==================================================== */}
      {activeSubMenu === 'processing' && (
        <>
          {activeTab === 'material' && (
            <div>
              <div className="stats-grid" style={{ marginBottom: '16px' }}>
                {materialsStock.map(m => (
                  <StatCard
                    key={m.id}
                    label={`${m.type} Stock`}
                    value={`${m.currentStock} ${m.unit}`}
                    icon={ShieldCheck}
                    subtext={`$${m.costPerUnit}/${m.unit} • ${m.name}`}
                  />
                ))}
              </div>
              <DataTable
                columns={materialColumns}
                data={materialJobs}
                emptyMessage="No material application jobs logged."
              />
            </div>
          )}

          {activeTab === 'slicing' && (
            <DataTable
              columns={slicingColumns}
              data={slicingJobs}
              emptyMessage="No gangsaw slicing jobs recorded."
            />
          )}

          {activeTab === 'cut' && (
            <DataTable
              columns={cutColumns}
              data={cutToSizeJobs}
              emptyMessage="No cut to size jobs recorded."
            />
          )}

          {activeTab === 'lots' && (
            <DataTable
              columns={stockGridColumns.filter(c => c.header !== 'Stage')}
              data={slabs.map(s => ({
                id: s.id,
                stoneType: s.stoneType,
                thickness: `${s.thickness}mm`,
                size: `${s.length}" x ${s.width}"`,
                finish: 'Polished',
                grade: s.grade,
                pieces: 1,
                sqft: s.sqft,
                location: s.location,
                box: s.boxId || 'Loose',
                status: s.status,
                rawItem: s
              }))}
              emptyMessage="No slabs in system."
            />
          )}

          {activeTab === 'pieces' && (
            <DataTable
              columns={stockGridColumns.filter(c => c.header !== 'Stage')}
              data={pieces.map(p => ({
                id: p.id,
                stoneType: p.stoneType,
                thickness: `${p.thickness}mm`,
                size: p.size,
                finish: 'Polished Tiles',
                grade: p.grade,
                pieces: 1,
                sqft: p.sqft,
                location: p.location,
                box: p.boxId || 'Pallet',
                status: p.status,
                rawItem: p
              }))}
              emptyMessage="No dimensional pieces created."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 4: STORAGE & LABELS                         */}
      {/* ==================================================== */}
      {activeSubMenu === 'storage' && (
        <>
          {activeTab === 'putaway' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  Items Ready for Location Putaway
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => openAddDrawer('putaway')}>
                  <Move size={14} />
                  <span>Execute Putaway</span>
                </button>
              </div>
              <DataTable
                columns={stockGridColumns}
                data={unifiedStockRows.filter(r => r.status === 'QC 2 Passed' || r.status === 'Sliced' || r.status === 'Received')}
                emptyMessage="No items pending putaway."
              />
            </div>
          )}

          {activeTab === 'yard_map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                Yard Map & Utilization Visualizer
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px'
              }}>
                {yardLocations.map(loc => {
                  const utilPct = Math.min(100, Math.round(((loc.currentStock || 0) / (loc.capacityTonnes || 500)) * 100));
                  return (
                    <div key={loc.id} className="card" style={{ padding: '16px', borderLeft: `4px solid ${utilPct > 85 ? 'var(--ruby-text)' : 'var(--teal-600)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ color: 'var(--ink)', fontSize: '14px' }}>{loc.zone} • {loc.bay}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Type: {loc.type}</div>
                        </div>
                        <span className={`badge ${utilPct > 85 ? 'badge-ruby' : 'badge-emerald'}`}>
                          {utilPct}% Utilized
                        </span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden', margin: '10px 0' }}>
                        <div style={{ width: `${utilPct}%`, height: '100%', background: utilPct > 85 ? 'var(--ruby-text)' : 'var(--teal-600)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                        <span>Current: {loc.currentStock} MT</span>
                        <span>Capacity: {loc.capacityTonnes} MT</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'boxes' && (
            <DataTable
              columns={boxColumns}
              data={boxes}
              emptyMessage="No storage boxes or pallets created."
            />
          )}

          {(activeTab === 'move' || activeTab === 'transfer') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  {activeTab === 'move' ? 'Internal Move Movements' : 'Inter-Yard Stock Transfers'}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => openAddDrawer('putaway')}>
                  <Move size={14} />
                  <span>Log Movement</span>
                </button>
              </div>
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Item Type', accessor: 'itemType' },
                  { header: 'Item ID', render: r => <strong>{r.itemId}</strong> },
                  { header: 'From Location', accessor: 'fromLoc' },
                  { header: 'To Location', render: r => <strong style={{ color: 'var(--emerald-text)' }}>{r.toLoc}</strong> },
                  { header: 'Date', accessor: 'date' },
                  { header: 'Operator', accessor: 'person' },
                  { header: 'Reason', accessor: 'reason' }
                ]}
                data={storageMovements}
                emptyMessage="No movement records logged."
              />
            </div>
          )}

          {activeTab === 'gen_label' && (
            <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0' }}>Generate New Item Label</h3>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Item / Record to Label</label>
                <select
                  className="form-select"
                  onChange={e => {
                    const found = unifiedStockRows.find(r => r.id === e.target.value);
                    if (found) openPrintLabel(found.rawItem, found.stage);
                  }}
                  defaultValue=""
                >
                  <option value="">Select Item...</option>
                  {unifiedStockRows.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} ({r.stage} - {r.stoneType})
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Selecting an item will immediately compile its dimensions, grade, finish, and quarry traceability into a printable barcode / QR label.
              </p>
            </div>
          )}

          {(activeTab === 'print' || activeTab === 'reprint') && (
            <DataTable
              columns={labelColumns}
              data={activeTab === 'reprint' ? [...labels].sort((a, b) => (b.printCount || 1) - (a.printCount || 1)) : labels}
              emptyMessage="No labels created."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 5: STOCK                                    */}
      {/* ==================================================== */}
      {activeSubMenu === 'stock' && (
        <>
          {activeTab === 'stock_grid' && (
            <DataTable
              columns={stockGridColumns}
              data={unifiedStockRows}
              emptyMessage="No stock records found."
            />
          )}

          {activeTab === 'stock_blocks' && (
            <DataTable
              columns={rawBlockColumns}
              data={detailedRawBlocks}
              emptyMessage="No raw blocks in stock."
            />
          )}

          {activeTab === 'stock_slabs' && (
            <DataTable
              columns={stockGridColumns.filter(c => c.header !== 'Stage')}
              data={slabs.map(s => ({
                id: s.id,
                stoneType: s.stoneType,
                thickness: `${s.thickness}mm`,
                size: `${s.length}" x ${s.width}"`,
                finish: 'Polished',
                grade: s.grade,
                pieces: 1,
                sqft: s.sqft,
                location: s.location,
                box: s.boxId || 'Loose',
                status: s.status,
                rawItem: s
              }))}
              emptyMessage="No slabs in stock."
            />
          )}

          {activeTab === 'stock_pieces' && (
            <DataTable
              columns={stockGridColumns.filter(c => c.header !== 'Stage')}
              data={pieces.map(p => ({
                id: p.id,
                stoneType: p.stoneType,
                thickness: `${p.thickness}mm`,
                size: p.size,
                finish: 'Polished Tiles',
                grade: p.grade,
                pieces: 1,
                sqft: p.sqft,
                location: p.location,
                box: p.boxId || 'Pallet',
                status: p.status,
                rawItem: p
              }))}
              emptyMessage="No pieces in stock."
            />
          )}

          {activeTab === 'stock_reserved' && (
            <DataTable
              columns={stockGridColumns}
              data={unifiedStockRows.filter(r => r.status === 'Reserved')}
              emptyMessage="No stock currently reserved for orders."
            />
          )}

          {activeTab === 'stock_low' && (
            <DataTable
              columns={[
                { header: 'Material Name', accessor: 'name' },
                { header: 'Category', render: r => <span className="badge badge-soft">{r.type}</span> },
                { header: 'Current Stock', render: r => <strong style={{ color: 'var(--ruby-text)' }}>{r.currentStock} {r.unit}</strong> },
                { header: 'Min Threshold', render: r => <span>{r.minStock} {r.unit}</span> },
                { header: 'Unit Cost', render: r => `$${r.costPerUnit}` },
                { header: 'Reorder Status', render: () => <span className="badge badge-amber">Reorder Required</span> }
              ]}
              data={lowStockItems}
              emptyMessage="All materials stock levels are optimal."
            />
          )}

          {activeTab === 'stock_movements' && (
            <DataTable
              columns={[
                { header: 'ID', accessor: 'id' },
                { header: 'Item Type', accessor: 'itemType' },
                { header: 'Item ID', render: r => <strong>{r.itemId}</strong> },
                { header: 'From Location', accessor: 'fromLoc' },
                { header: 'To Location', render: r => <strong style={{ color: 'var(--emerald-text)' }}>{r.toLoc}</strong> },
                { header: 'Date', accessor: 'date' },
                { header: 'Operator', accessor: 'person' },
                { header: 'Reason', accessor: 'reason' }
              ]}
              data={storageMovements}
              emptyMessage="No stock movements logged."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 6: EXCEPTIONS                               */}
      {/* ==================================================== */}
      {activeSubMenu === 'exceptions' && (
        <>
          {activeTab === 'defective' && (
            <DataTable
              columns={defectColumns}
              data={defectStoreRecords}
              emptyMessage="No defective store records."
            />
          )}

          {activeTab === 'rework' && (
            <DataTable
              columns={defectColumns}
              data={defectStoreRecords.filter(d => d.action === 'Rework')}
              emptyMessage="No items in rework."
            />
          )}

          {(activeTab === 'scrap' || activeTab === 'writeoff') && (
            <DataTable
              columns={defectColumns}
              data={defectStoreRecords.filter(d => d.action === 'Scrap' || d.action === 'Downgrade')}
              emptyMessage="No scrap write-off records."
            />
          )}

          {activeTab === 'count_sheets' && (
            <DataTable
              columns={countColumns}
              data={countSheets}
              emptyMessage="No count sheets found."
            />
          )}

          {activeTab === 'variances' && (
            <DataTable
              columns={countColumns}
              data={varianceSheets}
              emptyMessage="No count variances identified."
            />
          )}

          {activeTab === 'adjustments' && (
            <DataTable
              columns={countColumns}
              data={countSheets.filter(c => c.status === 'Approved')}
              emptyMessage="No approved stock adjustments."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* UNIVERSAL FORMDRAWER (AquaPulse Organism)             */}
      {/* ==================================================== */}
      <FormDrawer
        isOpen={drawerMode !== null}
        onClose={closeDrawer}
        title={drawerMode === 'add' ? `Add ${drawerType.toUpperCase()}` : `Edit ${drawerType.toUpperCase()}`}
        onSubmit={handleFormSubmit}
        submitLabel={drawerMode === 'add' ? 'Save Record' : 'Save Changes'}
        confirmSubmit={true}
      >
        {/* Gate Entry Form */}
        {drawerType === 'gate' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Truck Registration Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. RJ-14-GA-9012"
                value={formData.truckNo || ''}
                onChange={e => setFormData({ ...formData, truckNo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Driver Name"
                value={formData.driverName || ''}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-..."
                value={formData.driverPhone || ''}
                onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Transporter Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Marwar Logistics"
                value={formData.transporter || ''}
                onChange={e => setFormData({ ...formData, transporter: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier / Quarry *</label>
              <select
                className="form-select"
                value={formData.supplier || ''}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                required
              >
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Challan Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="CH-XXXX"
                value={formData.challanNo || ''}
                onChange={e => setFormData({ ...formData, challanNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Challan Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="28.5"
                value={formData.challanWeight || ''}
                onChange={e => setFormData({ ...formData, challanWeight: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Weighbridge Form */}
        {drawerType === 'weighbridge' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Gate Entry *</label>
              <select
                className="form-select"
                value={formData.gateEntryId || ''}
                onChange={e => setFormData({ ...formData, gateEntryId: e.target.value })}
                required
              >
                {gateEntries.map(g => (
                  <option key={g.id} value={g.id}>{g.entryNo} - {g.truckNo} ({g.supplier})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gross Weight (Tons) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.grossWeight || ''}
                onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tare Weight (Tons) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.tareWeight || ''}
                onChange={e => setFormData({ ...formData, tareWeight: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Challan Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.challanWeight || ''}
                onChange={e => setFormData({ ...formData, challanWeight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calculated Net (Preview)</label>
              <input
                className="form-input"
                disabled
                value={`${Number(((formData.grossWeight || 0) - (formData.tareWeight || 0)).toFixed(2))} Tons`}
              />
            </div>
          </div>
        )}

        {/* Raw Block Form */}
        {drawerType === 'block' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Quarry Source / Supplier *</label>
              <select
                className="form-select"
                value={formData.supplier || ''}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                required
              >
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stone Type *</label>
              <select
                className="form-select"
                value={formData.stoneType || ''}
                onChange={e => setFormData({ ...formData, stoneType: e.target.value })}
                required
              >
                {stoneTypes.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quarry Block #</label>
              <input
                type="text"
                className="form-input"
                value={formData.quarryBlockNo || ''}
                onChange={e => setFormData({ ...formData, quarryBlockNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Length (in)</label>
              <input
                type="number"
                className="form-input"
                value={formData.length || ''}
                onChange={e => setFormData({ ...formData, length: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Width (in)</label>
              <input
                type="number"
                className="form-input"
                value={formData.width || ''}
                onChange={e => setFormData({ ...formData, width: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (in)</label>
              <input
                type="number"
                className="form-input"
                value={formData.height || ''}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Net Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.netWeight || ''}
                onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Receiving Yard</label>
              <input
                type="text"
                className="form-input"
                value={formData.receivingYard || ''}
                onChange={e => setFormData({ ...formData, receivingYard: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* QC 1 Form */}
        {drawerType === 'qc1' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Block to Inspect *</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => setFormData({ ...formData, blockId: e.target.value })}
                required
              >
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Inspection Result *</label>
              <select
                className="form-select"
                value={formData.result || 'Pass'}
                onChange={e => setFormData({ ...formData, result: e.target.value })}
                style={{ fontWeight: 700 }}
              >
                <option value="Pass">Pass (Proceed to Material / Slicing)</option>
                <option value="Rework">Rework (Return to Raw Stage)</option>
                <option value="Reject">Reject (Move to Defective Store)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Grade</label>
              <select
                className="form-select"
                value={formData.grade || 'Grade A'}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cracks / Fissures</label>
              <input
                type="text"
                className="form-input"
                placeholder="None"
                value={formData.cracks || ''}
                onChange={e => setFormData({ ...formData, cracks: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Material Form */}
        {drawerType === 'material' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Target Block</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => setFormData({ ...formData, blockId: e.target.value })}
              >
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Material Type *</label>
              <select
                className="form-select"
                value={formData.materialType || 'Resin'}
                onChange={e => setFormData({ ...formData, materialType: e.target.value })}
                required
              >
                <option value="Resin">Resin</option>
                <option value="Mesh">Mesh</option>
                <option value="Chemical">Chemical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Used *</label>
              <input
                type="number"
                className="form-input"
                value={formData.quantityUsed || ''}
                onChange={e => setFormData({ ...formData, quantityUsed: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area Covered (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                value={formData.areaCovered || ''}
                onChange={e => setFormData({ ...formData, areaCovered: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Curing Time</label>
              <input
                type="text"
                className="form-input"
                value={formData.curingTime || ''}
                onChange={e => setFormData({ ...formData, curingTime: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Slicing Form */}
        {drawerType === 'slicing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Block to Slice *</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => setFormData({ ...formData, blockId: e.target.value })}
                required
              >
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Machine *</label>
              <input
                type="text"
                className="form-input"
                value={formData.machine || ''}
                onChange={e => setFormData({ ...formData, machine: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Slab Count *</label>
              <input
                type="number"
                className="form-input"
                value={formData.slabCount || ''}
                onChange={e => setFormData({ ...formData, slabCount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thickness (mm)</label>
              <input
                type="number"
                className="form-input"
                value={formData.thickness || ''}
                onChange={e => setFormData({ ...formData, thickness: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* QC 2 Form */}
        {drawerType === 'qc2' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Target Slab *</label>
              <select
                className="form-select"
                value={formData.slabId || ''}
                onChange={e => setFormData({ ...formData, slabId: e.target.value })}
                required
              >
                {slabs.map(s => (
                  <option key={s.id} value={s.id}>{s.slabNo} - {s.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Inspection Result *</label>
              <select
                className="form-select"
                value={formData.result || 'Pass'}
                onChange={e => setFormData({ ...formData, result: e.target.value })}
                style={{ fontWeight: 700 }}
              >
                <option value="Pass">Pass (Unlocks for Storage & Sale)</option>
                <option value="Rework">Rework (Return to Polish Line)</option>
                <option value="Reject">Reject (Send to Defective Store)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Flatness</label>
              <input
                type="text"
                className="form-input"
                value={formData.flatness || ''}
                onChange={e => setFormData({ ...formData, flatness: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Surface Gloss</label>
              <input
                type="text"
                className="form-input"
                value={formData.surface || ''}
                onChange={e => setFormData({ ...formData, surface: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Cut to Size Form */}
        {drawerType === 'cut' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Source Slab *</label>
              <select
                className="form-select"
                value={formData.slabId || ''}
                onChange={e => setFormData({ ...formData, slabId: e.target.value })}
                required
              >
                {slabs.map(s => (
                  <option key={s.id} value={s.id}>{s.slabNo} ({s.sqft} Sq.Ft)</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Cut Size Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 24x24 Inch Tiles"
                value={formData.cutSizeName || ''}
                onChange={e => setFormData({ ...formData, cutSizeName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pieces Count *</label>
              <input
                type="number"
                className="form-input"
                value={formData.piecesCount || ''}
                onChange={e => setFormData({ ...formData, piecesCount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Offcuts Action</label>
              <select
                className="form-select"
                value={formData.offcutAction || 'Keep as Stock'}
                onChange={e => setFormData({ ...formData, offcutAction: e.target.value })}
              >
                <option value="Keep as Stock">Keep as Stock</option>
                <option value="Scrap">Mark as Scrap</option>
              </select>
            </div>
          </div>
        )}

        {/* Box Form */}
        {drawerType === 'box' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Box Type</label>
              <select
                className="form-select"
                value={formData.type || 'A-Frame'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="A-Frame">A-Frame</option>
                <option value="Pallet Crate">Pallet Crate</option>
                <option value="Box">Box</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <select
                className="form-select"
                value={formData.stoneType || ''}
                onChange={e => setFormData({ ...formData, stoneType: e.target.value })}
              >
                {stoneTypes.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (Pcs)</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacity || ''}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.bay || ''}
                onChange={e => setFormData({ ...formData, bay: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Putaway Form */}
        {drawerType === 'putaway' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Item ID to Move *</label>
              <input
                type="text"
                className="form-input"
                placeholder="SLB-0001, PC-0001, BLK-0001"
                value={formData.itemId || ''}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Yard *</label>
              <input
                type="text"
                className="form-input"
                value={formData.toYard || ''}
                onChange={e => setFormData({ ...formData, toYard: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Zone *</label>
              <input
                type="text"
                className="form-input"
                value={formData.toZone || ''}
                onChange={e => setFormData({ ...formData, toZone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Bay / Rack *</label>
              <input
                type="text"
                className="form-input"
                value={formData.toBay || ''}
                onChange={e => setFormData({ ...formData, toBay: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Box (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="BOX-0001"
                value={formData.toBox || ''}
                onChange={e => setFormData({ ...formData, toBox: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Reason</label>
              <input
                type="text"
                className="form-input"
                value={formData.reason || ''}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Count Sheet Form */}
        {drawerType === 'count' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group col-span-2">
              <label className="form-label">Item ID *</label>
              <input
                type="text"
                className="form-input"
                value={formData.item || ''}
                onChange={e => setFormData({ ...formData, item: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">System Quantity</label>
              <input
                type="number"
                className="form-input"
                value={formData.systemQuantity || ''}
                onChange={e => setFormData({ ...formData, systemQuantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Physical Quantity *</label>
              <input
                type="number"
                className="form-input"
                value={formData.physicalQuantity || ''}
                onChange={e => setFormData({ ...formData, physicalQuantity: e.target.value })}
                required
              />
            </div>
          </div>
        )}
      </FormDrawer>
        </div>
      </div>

      {/* Traceability Modal */}
      <TraceabilityModal
        isOpen={isTraceOpen}
        targetId={traceTargetId}
        onClose={() => setIsTraceOpen(false)}
        onSelectId={id => setTraceTargetId(id)}
      />

      {/* Label Print Modal */}
      <LabelPrintModal
        isOpen={Boolean(activeLabelToPrint)}
        label={activeLabelToPrint}
        onClose={() => setActiveLabelToPrint(null)}
        onReprint={() => {}}
      />

      {/* Optical QR Scanner Modal */}
      <QRScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={scannedId => openTrace(scannedId)}
      />
    </div>
  );
}
