import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  RotateCcw,
  SlidersHorizontal,
  Package,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Route as RouteIcon
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
      { key: 'gen_label', label: 'Generate Label' }
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
    yardsMaster,
    zonesMaster,
    racksBaysMaster,
    labelTemplatesMaster,
    showToast
  } = useApp();

  // Active Submenu & Tab State linked to URL search parameters
  const navigate = useNavigate();
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

  // Interactive Yard Map State
  const [yardFilter, setYardFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [inspectingBay, setInspectingBay] = useState(null);

  // Label Studio State
  const [isLabelStudioOpen, setIsLabelStudioOpen] = useState(false);
  const [labelCategoryFilter, setLabelCategoryFilter] = useState('All');
  const [selectedLabelItemId, setSelectedLabelItemId] = useState('');
  const [selectedLabelTemplateId, setSelectedLabelTemplateId] = useState('TMP-001');
  const [labelPrintQty, setLabelPrintQty] = useState(1);
  const [labelOptions, setLabelOptions] = useState({
    showLogo: true,
    showBarcode: true,
    showQR: true,
    showQuarry: true
  });

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
    setSearchParams({ submenu: activeSubMenu, tab: tabKey });
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
        return { title: 'QC 1 Pending Inspection Queue', actionLabel: null, actionType: null };
      case 'qc1_inspections':
        return { title: 'QC 1 Inspection Records', actionLabel: null, actionType: null };
      case 'qc2_pending':
        return { title: 'QC 2 Pending Inspection Queue', actionLabel: null, actionType: null };
      case 'qc2_inspections':
        return { title: 'QC 2 Inspection Records (Slabs & Lots)', actionLabel: null, actionType: null };
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
        return {
          title: 'Generate Product Tags & Barcodes',
          actionLabel: 'Generate Label',
          actionType: 'gen_label_drawer'
        };
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
    navigate(`/stone-journey/${id}`);
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
      const targetBlock = qc1PendingBlocks[0] || detailedRawBlocks.find(b => b.id === selectedBlockId) || detailedRawBlocks[0];
      setFormData({
        blockId: targetBlock?.id || 'BLK-0001',
        inspector: currentUser.name,
        colorMatch: 'Uniform Deep Color',
        veining: 'Natural Consistent Veining',
        cracks: 'None',
        stains: 'None',
        moisture: 'Dry (1.0%)',
        sizeCheck: targetBlock ? `${targetBlock.length}" x ${targetBlock.width}" x ${targetBlock.height}" verified` : 'Verified dimensions match challan',
        defectType: 'None',
        defectLocation: 'N/A',
        defectSeverity: 'None',
        grade: targetBlock?.grade || 'Grade A',
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
      const targetSlab = qc2PendingSlabs[0] || slabs[0];
      setFormData({
        lotId: targetSlab?.lotId || lots[0]?.id || 'LOT-0001',
        slabId: targetSlab?.id || 'SLB-0001',
        inspector: currentUser.name,
        thicknessCheck: `${targetSlab?.thickness || 20}mm (+/- 0.2mm precision)`,
        flatness: 'Flat (no bowing or warping)',
        edges: 'Crisp Arris, no chipping',
        surface: 'Mirror Polish (>90 Gloss)',
        colorMatch: 'Consistent with Lot standard',
        cracks: 'None',
        resinQuality: 'Fully Cured and clear',
        defectType: 'None',
        defectCount: 0,
        grade: targetSlab?.grade || 'Grade A',
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
    setFormData({
      ...item,
      blockId: item.blockId || (item.stage?.includes('QC 1') ? item.target : item.blockId),
      slabId: item.slabId || (item.stage?.includes('QC 2') ? item.target : item.slabId)
    });
  };

  // Quick Pass QC 1 for a pending block
  const handleQuickPassQC1 = (block, grade = 'Grade A') => {
    addQC1Inspection({
      blockId: block.id,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      colorMatch: 'Uniform Deep Color',
      veining: 'Natural Consistent Veining',
      cracks: 'None',
      stains: 'None',
      moisture: 'Dry (1.0%)',
      sizeCheck: `${block.length}" x ${block.width}" x ${block.height}" verified`,
      defectType: 'None',
      defectLocation: 'N/A',
      defectSeverity: 'None',
      grade: grade,
      result: 'Pass',
      remarks: 'Passed from QC 1 Pending Queue'
    });
  };

  // Open QC 1 Drawer for a specific block
  const openQC1ForBlock = (block) => {
    setDrawerType('qc1');
    setDrawerMode('add');
    setEditingItem(null);
    setFormData({
      blockId: block.id,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      colorMatch: 'Uniform Deep Color',
      veining: 'Natural Consistent Veining',
      cracks: 'None',
      stains: 'None',
      moisture: 'Dry (1.0%)',
      sizeCheck: `${block.length}" x ${block.width}" x ${block.height}" verified`,
      defectType: 'None',
      defectLocation: 'N/A',
      defectSeverity: 'None',
      grade: block.grade || 'Grade A',
      result: 'Pass',
      remarks: ''
    });
  };

  // Quick Reject or Rework QC 1
  const handleQuickRejectQC1 = (block) => {
    addQC1Inspection({
      blockId: block.id,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      result: 'Reject',
      grade: 'Reject',
      defectType: 'Structural Fissure / Flaw',
      defectSeverity: 'Critical',
      remarks: 'Rejected directly from Pending Queue'
    });
  };

  const handleQuickReworkQC1 = (block) => {
    addQC1Inspection({
      blockId: block.id,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      result: 'Rework',
      grade: block.grade || 'Grade B',
      defectType: 'Surface Staining / Minor Irregularity',
      defectSeverity: 'Moderate',
      remarks: 'Marked for Rework from Pending Queue'
    });
  };

  // QC 2 Helpers
  const handleQuickPassQC2 = (slab, grade = 'Grade A') => {
    addQC2Inspection({
      slabId: slab.id,
      lotId: slab.lotId || '',
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      thicknessCheck: `${slab.thickness || 20}mm (+/- 0.2mm)`,
      flatness: 'Flat (no warping)',
      edges: 'Clean Arris, no chipping',
      surface: 'Mirror Polish (>90 GU)',
      colorMatch: 'Consistent with Lot',
      cracks: 'None',
      resinQuality: 'Fully Cured',
      defectType: 'None',
      defectCount: 0,
      grade: grade,
      result: 'Pass',
      remarks: 'Passed from QC 2 Pending Queue'
    });
  };

  const openQC2ForSlab = (slab) => {
    setDrawerType('qc2');
    setDrawerMode('add');
    setEditingItem(null);
    setFormData({
      slabId: slab.id,
      lotId: slab.lotId || '',
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      thicknessCheck: `${slab.thickness || 20}mm (+/- 0.2mm)`,
      flatness: 'Flat (no warping)',
      edges: 'Clean Arris, no chipping',
      surface: 'Mirror Polish (>90 GU)',
      colorMatch: 'Consistent with Lot',
      cracks: 'None',
      resinQuality: 'Fully Cured',
      defectType: 'None',
      defectCount: 0,
      grade: slab.grade || 'Grade A',
      result: 'Pass',
      remarks: ''
    });
  };

  const handleQuickRejectQC2 = (slab) => {
    addQC2Inspection({
      slabId: slab.id,
      lotId: slab.lotId || '',
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      result: 'Reject',
      grade: 'Reject',
      defectType: 'Surface Defect / Crack',
      defectCount: 1,
      remarks: 'Rejected directly from QC 2 Pending Queue'
    });
  };

  const handleQuickReworkQC2 = (slab) => {
    addQC2Inspection({
      slabId: slab.id,
      lotId: slab.lotId || '',
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      result: 'Rework',
      grade: slab.grade || 'Grade B',
      defectType: 'Dull Polish / Uneven Surface',
      defectCount: 1,
      remarks: 'Returned to Polish Line for Rework'
    });
  };

  // Send Block to QC 1 Queue
  const handleSendToQC1 = (block) => {
    if (!block || !block.id) return;
    updateDetailedRawBlock(block.id, {
      status: 'In QC 1',
      currentStep: 2
    });
    showToast(`Block ${block.blockNo || block.id} added to QC 1 Pending Queue`);
    setSearchParams({ submenu: 'qc', tab: 'qc1_pending' });
  };

  // Send Slab to QC 2 Queue
  const handleSendToQC2 = (slab) => {
    if (!slab || !slab.id) return;
    updateSlab(slab.id, {
      status: 'In QC 2'
    });
    showToast(`Slab ${slab.slabNo || slab.id} added to QC 2 Pending Queue`);
    setSearchParams({ submenu: 'qc', tab: 'qc2_pending' });
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
    else if (step === 9) { setSearchParams({ submenu: 'storage', tab: 'gen_label' }); }
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
            ...(r.stage === 'Block' ? [
              { label: 'Add to QC 1', icon: ShieldCheck, onClick: () => handleSendToQC1(r.rawItem || r) }
            ] : r.stage === 'Slab' ? [
              { label: 'Add to QC 2', icon: ShieldCheck, onClick: () => handleSendToQC2(r.rawItem || r) }
            ] : []),
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
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.blockNo || r.id}`)
            },
            {
              label: 'Add to QC 1',
              icon: ShieldCheck,
              confirm: `Send Block ${r.blockNo || r.id} to QC 1 Pending Queue?`,
              onClick: () => handleSendToQC1(r)
            },
            {
              label: 'Print Label',
              icon: Printer,
              confirm: `Print label for Block ${r.blockNo || r.id}?`,
              onClick: () => openPrintLabel(r, 'Block')
            },
            {
              label: 'Edit Block',
              icon: Edit3,
              confirm: `Open editor for Block ${r.blockNo || r.id}?`,
              onClick: () => openEditDrawer('block', r)
            },
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

  const lotsColumns = [
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
      render: r => {
        const slabItem = r.rawItem || r;
        return (
          <ActionDropdown
            items={[
              {
                label: 'Stone Journey',
                icon: RouteIcon,
                onClick: () => navigate(`/stone-journey/${slabItem.slabNo || slabItem.id || r.id}`)
              },
              {
                label: 'Add to QC 2',
                icon: ShieldCheck,
                confirm: `Send Slab ${slabItem.slabNo || slabItem.id} to QC 2 Pending Queue?`,
                onClick: () => handleSendToQC2(slabItem)
              },
              {
                label: 'Print / Reprint Label',
                icon: Printer,
                confirm: `Print label for Slab ${slabItem.id}?`,
                onClick: () => openPrintLabel(slabItem, 'Slab')
              },
              {
                label: 'Edit Record',
                icon: Edit3,
                confirm: `Open editor for Slab ${slabItem.id}?`,
                onClick: () => openEditDrawer('slab', slabItem)
              },
              {
                label: 'Archive Record',
                icon: Trash2,
                danger: true,
                confirm: `Archive Slab ${r.id}?`,
                onClick: () => handleDeleteItem('slab', r.id)
              }
            ]}
          />
        );
      }
    }
  ];

  const qc1PendingColumns = [
    { header: 'Block No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.blockNo}</span> },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Quarry / Supplier', accessor: 'quarrySupplier' },
    { header: 'Dimensions', render: r => `${r.length}" x ${r.width}" x ${r.height}"` },
    { header: 'Net Weight', render: r => <span className="table-num">{r.netWeight} Tons</span> },
    { header: 'Est. Sq.Ft', render: r => <span className="table-num" style={{ fontWeight: 600, color: 'var(--emerald-text)' }}>{r.estimatedSqFt}</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Pass to Inspection (Grade A)',
              icon: CheckCircle2,
              confirm: `Pass Block ${r.blockNo} with Grade A and record in QC 1 Inspections?`,
              onClick: () => handleQuickPassQC1(r, 'Grade A')
            },
            {
              label: 'Pass to Inspection (Grade B)',
              icon: CheckCircle2,
              confirm: `Pass Block ${r.blockNo} with Grade B and record in QC 1 Inspections?`,
              onClick: () => handleQuickPassQC1(r, 'Grade B')
            },
            {
              label: 'Open Detailed Inspection',
              icon: ShieldCheck,
              confirm: `Open detailed QC 1 inspection worksheet for Block ${r.blockNo}?`,
              onClick: () => openQC1ForBlock(r)
            },
            {
              label: 'Mark for Rework',
              icon: RotateCcw,
              confirm: `Mark Block ${r.blockNo} for rework?`,
              onClick: () => handleQuickReworkQC1(r)
            },
            {
              label: 'Reject Block',
              icon: X,
              danger: true,
              confirm: `Reject Block ${r.blockNo} and move to Defect Store?`,
              onClick: () => handleQuickRejectQC1(r)
            },
            {
              label: 'Print Label',
              icon: Printer,
              confirm: `Print label for Block ${r.blockNo}?`,
              onClick: () => openPrintLabel(r, 'Block')
            }
          ]}
        />
      )
    }
  ];

  const qc2PendingColumns = [
    { header: 'Slab No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.slabNo || r.id}</span> },
    { header: 'Stone Type', accessor: 'stoneType' },
    { header: 'Lot / Block', render: r => `${r.lotId || '-'} / ${r.blockId || '-'}` },
    { header: 'Dimensions', render: r => `${r.length}" x ${r.width}"` },
    { header: 'Thickness', render: r => `${r.thickness}mm` },
    { header: 'Sq.Ft', render: r => <span className="table-num">{r.sqft}</span> },
    { header: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: r => (
        <ActionDropdown
          items={[
            {
              label: 'Pass to Inspection (Grade A)',
              icon: CheckCircle2,
              confirm: `Pass Slab ${r.slabNo || r.id} with Grade A and record in QC 2 Inspections?`,
              onClick: () => handleQuickPassQC2(r, 'Grade A')
            },
            {
              label: 'Pass to Inspection (Grade B)',
              icon: CheckCircle2,
              confirm: `Pass Slab ${r.slabNo || r.id} with Grade B and record in QC 2 Inspections?`,
              onClick: () => handleQuickPassQC2(r, 'Grade B')
            },
            {
              label: 'Open Detailed Inspection',
              icon: ShieldCheck,
              confirm: `Open detailed QC 2 inspection worksheet for Slab ${r.slabNo || r.id}?`,
              onClick: () => openQC2ForSlab(r)
            },
            {
              label: 'Return for Re-polishing',
              icon: RotateCcw,
              confirm: `Return Slab ${r.slabNo || r.id} for re-polishing?`,
              onClick: () => handleQuickReworkQC2(r)
            },
            {
              label: 'Reject Slab',
              icon: X,
              danger: true,
              confirm: `Reject Slab ${r.slabNo || r.id}?`,
              onClick: () => handleQuickRejectQC2(r)
            },
            {
              label: 'Print Label',
              icon: Printer,
              confirm: `Print label for Slab ${r.slabNo || r.id}?`,
              onClick: () => openPrintLabel(r, 'Slab')
            }
          ]}
        />
      )
    }
  ];

  const qcInspectionsColumns = [
    { header: 'Inspection No', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.inspectionNo}</span> },
    { header: 'Target Item', render: r => <strong>{r.target || r.blockId || r.slabId || r.lotId}</strong> },
    { header: 'Stage', render: r => <span className="badge badge-soft">{r.stage || (r.blockId ? 'QC 1 (Block)' : 'QC 2 (Slab)')}</span> },
    { header: 'Inspector', accessor: 'inspector' },
    { header: 'Date', accessor: 'date' },
    { header: 'Grade', render: r => <span className="badge badge-soft">{r.grade}</span> },
    { header: 'Result', render: r => <StatusBadge status={r.result} /> },
    { header: 'Remarks', accessor: 'remarks' },
    {
      header: 'Actions',
      align: 'right',
      render: r => {
        const isQC1 = r.stage?.includes('QC 1') || Boolean(r.blockId);
        const itemType = isQC1 ? 'qc1' : 'qc2';
        return (
          <ActionDropdown
            items={[
              {
                label: 'Edit Inspection',
                icon: Edit3,
                onClick: () => openEditDrawer(itemType, r)
              },
              {
                label: 'Mark as Passed',
                icon: CheckCircle2,
                disabled: r.result === 'Pass',
                onClick: () => {
                  if (isQC1) updateQC1Inspection(r.id, { result: 'Pass', grade: r.grade || 'Grade A' });
                  else updateQC2Inspection(r.id, { result: 'Pass', grade: r.grade || 'Grade A' });
                }
              },
              {
                label: 'Mark for Rework',
                icon: RotateCcw,
                disabled: r.result === 'Rework',
                onClick: () => {
                  if (isQC1) updateQC1Inspection(r.id, { result: 'Rework' });
                  else updateQC2Inspection(r.id, { result: 'Rework' });
                }
              },
              {
                label: 'Mark as Rejected',
                icon: X,
                danger: true,
                disabled: r.result === 'Reject',
                confirm: `Change inspection ${r.inspectionNo} to Rejected?`,
                onClick: () => {
                  if (isQC1) updateQC1Inspection(r.id, { result: 'Reject' });
                  else updateQC2Inspection(r.id, { result: 'Reject' });
                }
              },
              {
                label: 'Print QC Tag',
                icon: Printer,
                confirm: `Print QC inspection tag for ${r.inspectionNo}?`,
                onClick: () => openPrintLabel(r, isQC1 ? 'Block' : 'Slab')
              },
              {
                label: 'Archive Inspection',
                icon: Trash2,
                danger: true,
                confirm: `Archive inspection record ${r.inspectionNo}?`,
                onClick: () => handleDeleteItem(itemType, r.id)
              }
            ]}
          />
        );
      }
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
            {
              label: 'Edit Job',
              icon: Edit3,
              confirm: `Edit material job ${r.jobNo}?`,
              onClick: () => openEditDrawer('material', r)
            },
            {
              label: 'Delete Job',
              icon: Trash2,
              danger: true,
              confirm: `Delete material application job ${r.jobNo}?`,
              onClick: () => handleDeleteItem('material', r.id)
            }
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
            {
              label: 'Edit Job',
              icon: Edit3,
              confirm: `Edit slicing job ${r.jobNo}?`,
              onClick: () => openEditDrawer('slicing', r)
            },
            {
              label: 'Delete Job',
              icon: Trash2,
              danger: true,
              confirm: `Delete slicing job ${r.jobNo}?`,
              onClick: () => handleDeleteItem('slicing', r.id)
            }
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
            {
              label: 'Edit Job',
              icon: Edit3,
              confirm: `Edit cut-to-size job ${r.jobNo}?`,
              onClick: () => openEditDrawer('cut', r)
            },
            {
              label: 'Delete Job',
              icon: Trash2,
              danger: true,
              confirm: `Delete cut-to-size job ${r.jobNo}?`,
              onClick: () => handleDeleteItem('cut', r.id)
            }
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
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.boxNo || r.id}`)
            },
            {
              label: 'Print Label',
              icon: Printer,
              confirm: `Print label for box ${r.boxNo || r.id}?`,
              onClick: () => openPrintLabel(r, 'Box')
            },
            {
              label: 'Edit Box',
              icon: Edit3,
              confirm: `Edit box ${r.boxNo || r.id}?`,
              onClick: () => openEditDrawer('box', r)
            },
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
            {
              label: 'Stone Journey',
              icon: RouteIcon,
              onClick: () => navigate(`/stone-journey/${r.linkedRecordId || r.qrCode || r.labelNo || r.id}`)
            },
            {
              label: 'Print / Reprint Label',
              icon: Printer,
              confirm: `Reprint physical barcode / QR tag for ${r.labelNo} (${r.stoneType})?`,
              onClick: () => setActiveLabelToPrint(r)
            },
            {
              label: 'Archive Label',
              icon: Trash2,
              danger: true,
              confirm: `Archive Label ${r.labelNo || r.id}?`,
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
            {
              label: 'Archive Record',
              icon: Trash2,
              danger: true,
              confirm: `Archive defect record ${r.defectNo}?`,
              onClick: () => handleDeleteItem('defect', r.id)
            }
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
              {
                label: 'Approve Adjustment',
                icon: CheckCircle2,
                confirm: `Approve count sheet adjustment for ${r.countSheetNo || r.id}?`,
                onClick: () => approveCountSheet(r.id)
              }
            ] : []),
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
      {/* Top Secondary Tab Header - Displays ONLY the tabs for the active sub-menu selected from the sidebar */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        alignItems: 'center',
        flexShrink: 0
      }}>
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
                fontSize: '13px'
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {activeTabMeta.title}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {activeTabMeta.actionLabel && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (activeTabMeta.actionType === 'gen_label_drawer') {
                      setIsLabelStudioOpen(true);
                    } else {
                      openAddDrawer(activeTabMeta.actionType);
                    }
                  }}
                >
                  <Plus size={14} />
                  <span>{activeTabMeta.actionLabel}</span>
                </button>
              )}
            </div>
          </div>




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
            <DataTable
              columns={qc1PendingColumns}
              data={qc1PendingBlocks}
              emptyMessage="No blocks pending QC 1."
            />
          )}

          {activeTab === 'qc1_inspections' && (
            <DataTable
              columns={qcInspectionsColumns}
              data={qc1Inspections.filter(q => !q.isArchived).map(q => ({ ...q, target: q.blockId, stage: 'QC 1 (Block)' }))}
              emptyMessage="No QC 1 inspections recorded."
            />
          )}

          {activeTab === 'qc2_pending' && (
            <DataTable
              columns={qc2PendingColumns}
              data={qc2PendingSlabs}
              emptyMessage="No slabs pending QC 2."
            />
          )}

          {activeTab === 'qc2_inspections' && (
            <DataTable
              columns={qcInspectionsColumns}
              data={qc2Inspections.filter(q => !q.isArchived).map(q => ({ ...q, target: q.slabId || q.lotId, stage: 'QC 2 (Slab)' }))}
              emptyMessage="No QC 2 inspections recorded."
            />
          )}

          {activeTab === 'qc_results' && (
            <DataTable
              columns={qcInspectionsColumns}
              data={combinedQCResults.filter(q => !q.isArchived)}
              emptyMessage="No quality control results logged."
            />
          )}
        </>
      )}

      {/* ==================================================== */}
      {/* SUB MENU 3: PROCESSING                               */}
      {/* ==================================================== */}
      {activeSubMenu === 'processing' && (
        <>
          {activeTab === 'material' && (
            <DataTable
              columns={materialColumns}
              data={materialJobs}
              emptyMessage="No material application jobs logged."
            />
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
              columns={lotsColumns}
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
            <DataTable
              columns={stockGridColumns}
              data={unifiedStockRows.filter(r => r.status === 'QC 2 Passed' || r.status === 'Sliced' || r.status === 'Received')}
              emptyMessage="No items pending putaway."
            />
          )}

          {activeTab === 'yard_map' && (() => {
            const allYards = ['All', ...new Set(yardLocations.map(l => l.yard || 'Carrara Yard Main'))];
            const allZones = ['All', ...new Set(yardLocations.map(l => l.zone))];

            const filteredBays = yardLocations.filter(loc => {
              const matchesYard = yardFilter === 'All' || (loc.yard || 'Carrara Yard Main') === yardFilter;
              const matchesZone = zoneFilter === 'All' || loc.zone === zoneFilter;
              return matchesYard && matchesZone;
            });

            const totalCap = filteredBays.reduce((acc, curr) => acc + (curr.capacityTonnes || 0), 0);
            const totalStock = filteredBays.reduce((acc, curr) => acc + (curr.currentStock || 0), 0);
            const overallPct = totalCap > 0 ? Math.round((totalStock / totalCap) * 100) : 0;
            const criticalCount = filteredBays.filter(b => Math.round(((b.currentStock || 0) / (b.capacityTonnes || 500)) * 100) > 85).length;

            const getItemsInBay = (loc) => {
              const bName = (loc.bay || '').toLowerCase();
              const zName = (loc.zone || '').toLowerCase();

              const matchingBlocks = detailedRawBlocks.filter(b =>
                (b.location && (b.location.toLowerCase().includes(bName) || b.location.toLowerCase().includes(zName)))
              ).map(b => ({
                id: b.id,
                name: b.blockNo || b.id,
                stage: 'Block',
                category: 'Raw Block',
                stoneType: b.stoneType,
                dimensions: `${b.length}" x ${b.width}" x ${b.height}"`,
                weightOrSqFt: `${b.netWeight || 0} MT`,
                grade: b.grade || 'Grade A',
                status: b.status,
                rawItem: b
              }));

              const matchingSlabs = slabs.filter(s =>
                (s.bay && s.bay.toLowerCase() === bName) ||
                (s.location && s.location.toLowerCase().includes(bName))
              ).map(s => ({
                id: s.id,
                name: s.slabNo || s.id,
                stage: 'Slab',
                category: 'Polished Slab',
                stoneType: s.stoneType,
                dimensions: `${s.length}" x ${s.width}" (${s.thickness || 20}mm)`,
                weightOrSqFt: `${s.sqft || 0} Sq.Ft`,
                grade: s.grade || 'Grade A',
                status: s.status,
                rawItem: s
              }));

              const matchingBoxes = boxes.filter(bx =>
                (bx.bay && bx.bay.toLowerCase() === bName) ||
                (bx.location && bx.location.toLowerCase().includes(bName))
              ).map(bx => ({
                id: bx.id,
                name: bx.boxNo || bx.id,
                stage: 'Box',
                category: bx.type || 'Storage Box',
                stoneType: bx.stoneType,
                dimensions: `${bx.size || 'Standard Crate'}`,
                weightOrSqFt: `${bx.pieceCount || 0} Items (${bx.sqft || 0} Sq.Ft)`,
                grade: bx.grade || 'Grade A',
                status: bx.status,
                rawItem: bx
              }));

              const matchingPieces = pieces.filter(p =>
                (p.bay && p.bay.toLowerCase() === bName) ||
                (p.location && p.location.toLowerCase().includes(bName))
              ).map(p => ({
                id: p.id,
                name: p.pieceNo || p.id,
                stage: 'Piece',
                category: 'Cut Piece',
                stoneType: p.stoneType,
                dimensions: `${p.size || `${p.length}" x ${p.width}"`}`,
                weightOrSqFt: `${p.sqft || 0} Sq.Ft`,
                grade: p.grade || 'Grade A',
                status: p.status,
                rawItem: p
              }));

              return [...matchingBlocks, ...matchingSlabs, ...matchingBoxes, ...matchingPieces];
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Spatial Metrics Strip with Tinted Background Colors */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {/* Metric 1: Active Storage Bays */}
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Active Storage Bays
                      </span>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: '#e2e8f0',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={15} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                        {filteredBays.length} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Bays Configured</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        Across {allYards.length - 1} Yard Facilities Monitored
                      </div>
                    </div>
                  </div>

                  {/* Metric 2: Total Storage Capacity */}
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Total Storage Capacity
                      </span>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: '#bbf7d0',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Scale size={15} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d' }}>
                        {totalCap.toLocaleString()} <span style={{ fontSize: '13px', color: '#166534', fontWeight: 500 }}>MT Metric Tonnes</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                        {(totalCap - totalStock).toLocaleString()} MT Free Space Available
                      </div>
                    </div>
                  </div>

                  {/* Metric 3: Current Utilization */}
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: overallPct > 80
                      ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
                      : 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                    border: overallPct > 80 ? '1px solid #fecdd3' : '1px solid #99f6e4',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px',
                        color: overallPct > 80 ? '#9f1239' : '#115e59',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                      }}>
                        Current Utilization
                      </span>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: overallPct > 80 ? '#fecdd3' : '#99f6e4',
                        color: overallPct > 80 ? '#be123c' : '#0f766e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Activity size={15} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: overallPct > 80 ? '#881337' : '#134e4a' }}>
                        {totalStock.toLocaleString()} MT <span style={{ fontSize: '14px', fontWeight: 700, color: overallPct > 80 ? '#be123c' : '#0f766e' }}>({overallPct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                        <div style={{
                          width: `${overallPct}%`,
                          height: '100%',
                          background: overallPct > 80 ? '#e11d48' : '#0d9488',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Metric 4: Capacity Alert / Health */}
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: criticalCount > 0
                      ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                      : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: criticalCount > 0 ? '1px solid #fde68a' : '1px solid #bfdbfe',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '11px',
                        color: criticalCount > 0 ? '#92400e' : '#1e40af',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                      }}>
                        {criticalCount > 0 ? 'Near-Capacity Alert' : 'Capacity Health'}
                      </span>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: criticalCount > 0 ? '#fde68a' : '#bfdbfe',
                        color: criticalCount > 0 ? '#b45309' : '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {criticalCount > 0 ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: criticalCount > 0 ? '#78350f' : '#172554' }}>
                        {criticalCount > 0 ? `${criticalCount} Bay${criticalCount === 1 ? '' : 's'} > 85% Load` : 'All Bays Optimal'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: criticalCount > 0 ? '#92400e' : '#1e40af', marginTop: '2px' }}>
                        {criticalCount === 0 ? 'Optimal Bay Load Distribution' : 'Action recommended for incoming trucks'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Selector Strip with Clean Background */}
                <div style={{
                  padding: '12px 18px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Facility:
                    </span>
                    {allYards.map(y => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYardFilter(y)}
                        style={{
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: yardFilter === y ? 600 : 500,
                          cursor: 'pointer',
                          background: yardFilter === y ? '#222350' : '#f1f5f9',
                          color: yardFilter === y ? '#ffffff' : '#475569',
                          boxShadow: yardFilter === y ? '0 1px 3px rgba(34, 35, 80, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Zone:
                    </span>
                    {allZones.map(z => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZoneFilter(z)}
                        style={{
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 11px',
                          fontSize: '12px',
                          fontWeight: zoneFilter === z ? 600 : 500,
                          cursor: 'pointer',
                          background: zoneFilter === z ? '#0d9488' : '#f1f5f9',
                          color: zoneFilter === z ? '#ffffff' : '#475569',
                          boxShadow: zoneFilter === z ? '0 1px 3px rgba(13, 148, 136, 0.25)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {z}
                      </button>
                    ))}
                  </div>

                  <div>
                    <span style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: 600,
                      background: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      Showing {filteredBays.length} of {yardLocations.length} Bays
                    </span>
                  </div>
                </div>

                {/* Spatial Bay Grid with Colored Background Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredBays.map(loc => {
                    const utilPct = Math.min(100, Math.round(((loc.currentStock || 0) / (loc.capacityTonnes || 500)) * 100));
                    const isHigh = utilPct > 85;
                    const isMedium = utilPct >= 60 && utilPct <= 85;
                    const itemsInBay = getItemsInBay(loc);

                    const cardBg = isHigh
                      ? 'linear-gradient(180deg, #fff1f2 0%, #ffffff 80px)'
                      : isMedium
                        ? 'linear-gradient(180deg, #fffbeb 0%, #ffffff 80px)'
                        : 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 80px)';

                    const borderColor = isHigh ? '#fecdd3' : isMedium ? '#fde68a' : '#bbf7d0';
                    const topBorderColor = isHigh ? '#e11d48' : isMedium ? '#d97706' : '#059669';

                    return (
                      <div
                        key={loc.id}
                        style={{
                          background: cardBg,
                          border: `1px solid ${borderColor}`,
                          borderTop: `4px solid ${topBorderColor}`,
                          borderRadius: '12px',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onClick={() => setInspectingBay({ ...loc, items: itemsInBay })}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
                        }}
                      >
                        <div>
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={15} style={{ color: topBorderColor }} />
                                <strong style={{ color: '#0f172a', fontSize: '15.5px' }}>{loc.zone} • {loc.bay}</strong>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="badge badge-soft" style={{ fontSize: '10.5px', padding: '1px 6px' }}>{loc.type}</span>
                                <span>•</span>
                                <span>{itemsInBay.length} active {itemsInBay.length === 1 ? 'item' : 'items'}</span>
                              </div>
                            </div>
                            <span className={`badge ${isHigh ? 'badge-ruby' : isMedium ? 'badge-amber' : 'badge-emerald'}`} style={{ fontWeight: 700, padding: '3px 8px' }}>
                              ● {utilPct}% Full
                            </span>
                          </div>

                          {/* Utilization Gauge */}
                          <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '12px 0 6px 0' }}>
                            <div style={{
                              width: `${utilPct}%`,
                              height: '100%',
                              background: topBorderColor,
                              borderRadius: '4px',
                              transition: 'width 0.4s ease'
                            }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b' }}>
                            <span>Load: <strong style={{ color: '#0f172a' }}>{loc.currentStock} MT</strong></span>
                            <span>Limit: <strong>{loc.capacityTonnes} MT</strong></span>
                            <span style={{ color: isHigh ? '#e11d48' : '#059669', fontWeight: 600 }}>
                              {Math.max(0, loc.capacityTonnes - loc.currentStock)} MT Free
                            </span>
                          </div>

                          {/* Stored Items Preview Box with Soft Background */}
                          <div style={{
                            marginTop: '12px',
                            padding: '10px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}>
                            <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>
                              Stored Inventory ({itemsInBay.length})
                            </div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                              {itemsInBay.slice(0, 3).map((item, idx) => (
                                <span key={idx} style={{
                                  fontSize: '11px',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 600,
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  padding: '2px 7px',
                                  color: '#0f172a',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                }}>
                                  {item.name}
                                </span>
                              ))}
                              {itemsInBay.length > 3 && (
                                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                                  +{itemsInBay.length - 3} more
                                </span>
                              )}
                              {itemsInBay.length === 0 && (
                                <span style={{ fontSize: '11.5px', color: '#94a3b8', fontStyle: 'italic' }}>
                                  Bay available • No items loaded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Bar */}
                        <div style={{
                          paddingTop: '10px',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            📍 {loc.yard || 'Carrara Yard Main'}
                          </span>

                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#0d9488',
                              fontWeight: 600,
                              background: '#f0fdfa',
                              border: '1px solid #ccfbf1',
                              padding: '3px 8px',
                              borderRadius: '5px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingBay({ ...loc, items: itemsInBay });
                            }}
                          >
                            <Eye size={13} />
                            <span>Inspect Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bay Detail Inspection Drawer / Modal */}
                {inspectingBay && (
                  <div className="modal-backdrop" style={{ zIndex: 1100 }}>
                    <div className="modal-card" style={{ maxWidth: '780px', width: '92%', borderRadius: '12px', overflow: 'hidden' }}>
                      <div className="modal-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--line)',
                        padding: '16px 20px',
                        background: 'var(--surface)'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 600 }}>
                            Bay Contents & Provenance Inspector
                          </div>
                          <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                            {inspectingBay.zone} • {inspectingBay.bay} ({inspectingBay.type})
                          </h3>
                        </div>
                        <button className="btn-icon" onClick={() => setInspectingBay(null)}>
                          <X size={18} />
                        </button>
                      </div>

                      <div className="modal-body" style={{ padding: '20px' }}>
                        {/* Bay Occupancy Summary Banner */}
                        <div style={{
                          padding: '12px 16px',
                          background: 'var(--surface-sunken)',
                          borderRadius: '8px',
                          border: '1px solid var(--line)',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Facility Location:</div>
                            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{inspectingBay.yard || 'Carrara Yard Main'}</strong>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Current / Max Capacity:</div>
                            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{inspectingBay.currentStock} MT / {inspectingBay.capacityTonnes} MT</strong>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Status:</div>
                            <span className="badge badge-emerald">Operational Bay</span>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setInspectingBay(null);
                                openAddDrawer('putaway');
                              }}
                            >
                              <Plus size={14} />
                              <span>Putaway to this Bay</span>
                            </button>
                          </div>
                        </div>

                        {/* Inventory Items in Bay */}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
                          Physical Items Stored in {inspectingBay.bay} ({inspectingBay.items?.length || 0}):
                        </div>

                        {(!inspectingBay.items || inspectingBay.items.length === 0) ? (
                          <div style={{
                            padding: '30px',
                            textAlign: 'center',
                            background: 'var(--surface-sunken)',
                            borderRadius: '8px',
                            color: 'var(--muted)',
                            fontSize: '13px'
                          }}>
                            No active stone blocks, slabs, or crates are currently mapped to this bay.
                          </div>
                        ) : (
                          <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: '8px' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                              <thead>
                                <tr style={{ background: 'var(--surface-sunken)', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                                  <th style={{ padding: '10px 12px' }}>Item ID</th>
                                  <th style={{ padding: '10px 12px' }}>Category</th>
                                  <th style={{ padding: '10px 12px' }}>Stone Type</th>
                                  <th style={{ padding: '10px 12px' }}>Dimensions / Weight</th>
                                  <th style={{ padding: '10px 12px' }}>Grade</th>
                                  <th style={{ padding: '10px 12px' }}>Status</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inspectingBay.items.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                      {item.name}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <span className="badge badge-soft">{item.category}</span>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                                      {item.stoneType}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                      {item.dimensions} ({item.weightOrSqFt})
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <span className="badge badge-emerald">{item.grade}</span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <StatusBadge status={item.status} />
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                      <ActionDropdown
                                        items={[
                                          {
                                            label: 'Print Barcode / QR Label',
                                            icon: Printer,
                                            confirm: `Print physical barcode tag for ${item.name}?`,
                                            onClick: () => {
                                              openPrintLabel(item.rawItem, item.stage);
                                            }
                                          },
                                          {
                                            label: 'Relocate / Move Item',
                                            icon: Move,
                                            confirm: `Initiate location transfer for ${item.name}?`,
                                            onClick: () => {
                                              setInspectingBay(null);
                                              openAddDrawer('putaway');
                                            }
                                          }
                                        ]}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="modal-footer" style={{
                        borderTop: '1px solid var(--line)',
                        padding: '12px 20px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        background: 'var(--surface-sunken)'
                      }}>
                        <button className="btn btn-secondary" onClick={() => setInspectingBay(null)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'boxes' && (
            <DataTable
              columns={boxColumns}
              data={boxes}
              emptyMessage="No storage boxes or pallets created."
            />
          )}

          {(activeTab === 'move' || activeTab === 'transfer') && (
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
          )}

          {activeTab === 'gen_label' && (() => {
            const categoryFilteredItems = unifiedStockRows.filter(r => {
              if (labelCategoryFilter === 'All') return true;
              if (labelCategoryFilter === 'Blocks') return r.stage === 'Block';
              if (labelCategoryFilter === 'Slabs') return r.stage === 'Slab';
              if (labelCategoryFilter === 'Pieces') return r.stage === 'Piece';
              if (labelCategoryFilter === 'Boxes') return r.stage === 'Box';
              return true;
            });

            const activeItem = unifiedStockRows.find(r => r.id === selectedLabelItemId) || categoryFilteredItems[0] || unifiedStockRows[0];
            const currentTemplate = labelTemplatesMaster.find(t => t.id === selectedLabelTemplateId) || labelTemplatesMaster[0];

            const handleQueueLabel = () => {
              if (!activeItem) return;
              const newLabelNo = `LBL-${String(labels.length + 1).padStart(4, '0')}`;
              const newLabel = {
                id: newLabelNo,
                labelNo: newLabelNo,
                labelType: activeItem.stage,
                linkedRecordId: activeItem.id,
                template: currentTemplate?.name || 'Standard QR Label',
                qrCode: `QR-${activeItem.id}-${Date.now().toString().slice(-4)}`,
                barcode: `8901${Math.floor(10000000 + Math.random() * 90000000)}`,
                stoneType: activeItem.stoneType,
                size: activeItem.size || 'Custom',
                thickness: activeItem.thickness || '20mm',
                grade: activeItem.grade || 'Grade A',
                finish: activeItem.finish || 'Polished High Gloss',
                sqft: activeItem.sqft || 50,
                location: activeItem.location || 'Carrara Yard Main',
                date: new Date().toISOString().split('T')[0],
                supplier: 'Monte Altissimo Quarry',
                printCount: Number(labelPrintQty) || 1,
                printedBy: currentUser?.name || 'Ramesh Patel',
                status: 'Active',
                isArchived: false
              };
              addLabel(newLabel);
              showToast(`Label ${newLabelNo} generated and queued for printing!`);
              setIsLabelStudioOpen(false);
            };

            return (
              <>
                <DataTable
                  columns={labelColumns}
                  data={labels}
                  emptyMessage="No product tags generated yet."
                />

                {/* Right-Side Slide-Over Drawer for Product Tag & Barcode Studio */}
                {isLabelStudioOpen && (
                  <div className="drawer-backdrop" onClick={() => setIsLabelStudioOpen(false)}>
                    <div
                      className="drawer"
                      style={{ width: '840px', maxWidth: '95vw' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Drawer Header */}
                      <div className="drawer-header" style={{ padding: '16px 20px', background: 'var(--white)' }}>
                        <div>
                          <div className="drawer-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                            Product Tag & Barcode Studio
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                            Design, preview and queue heavy-duty GS1-128 barcodes and dynamic QR tags with quarry-to-crate provenance
                          </div>
                        </div>
                        <button
                          type="button"
                          className="iconbtn"
                          onClick={() => setIsLabelStudioOpen(false)}
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Drawer Body */}
                      <div
                        style={{
                          flex: 1,
                          overflowY: 'auto',
                          padding: '20px',
                          background: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                          {/* Left Column: Label Configuration Form */}
                          <div
                            className="card"
                            style={{
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                              background: '#ffffff',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--line)',
                              borderRadius: '12px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                            }}
                          >
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                              1. Select Item & Template Parameters
                            </div>

                            {/* Category Filter Pills */}
                            <div>
                              <label className="form-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                                Filter Items by Category:
                              </label>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {['All', 'Blocks', 'Slabs', 'Pieces', 'Boxes'].map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setLabelCategoryFilter(cat)}
                                    style={{
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '5px 12px',
                                      fontSize: '12px',
                                      fontWeight: labelCategoryFilter === cat ? 600 : 500,
                                      cursor: 'pointer',
                                      background: labelCategoryFilter === cat ? '#222350' : 'var(--surface-sunken)',
                                      color: labelCategoryFilter === cat ? '#fff' : 'var(--ink)'
                                    }}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Item Picker */}
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>
                                Item / Record to Tag:
                              </label>
                              <select
                                className="form-select"
                                value={activeItem?.id || ''}
                                onChange={e => setSelectedLabelItemId(e.target.value)}
                              >
                                {categoryFilteredItems.map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.id} • {r.stage} ({r.stoneType} - {r.size})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Selected Item Quick Specs */}
                            {activeItem && (
                              <div style={{
                                padding: '12px 14px',
                                background: 'var(--surface-sunken)',
                                borderRadius: '8px',
                                border: '1px solid var(--line)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '8px',
                                fontSize: '11px'
                              }}>
                                <div><span style={{ color: 'var(--muted)' }}>Stone Material:</span> <strong style={{ color: 'var(--ink)' }}>{activeItem.stoneType}</strong></div>
                                <div><span style={{ color: 'var(--muted)' }}>Dimensions:</span> <strong style={{ color: 'var(--ink)' }}>{activeItem.size}</strong></div>
                                <div><span style={{ color: 'var(--muted)' }}>Thickness/Weight:</span> <strong style={{ color: 'var(--ink)' }}>{activeItem.thickness}</strong></div>
                                <div><span style={{ color: 'var(--muted)' }}>Quality Grade:</span> <span className="badge badge-emerald">{activeItem.grade}</span></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                  <span style={{ color: 'var(--muted)' }}>Location:</span> <strong style={{ color: 'var(--teal-600)' }}>{activeItem.location || 'Carrara Yard Main'}</strong>
                                </div>
                              </div>
                            )}

                            {/* Template Selector */}
                            <div className="form-group">
                              <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>
                                Label Format & Template:
                              </label>
                              <select
                                className="form-select"
                                value={selectedLabelTemplateId}
                                onChange={e => setSelectedLabelTemplateId(e.target.value)}
                              >
                                {labelTemplatesMaster.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} ({t.dimensions} • {t.codeType})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Print Quantity & Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px', alignItems: 'center' }}>
                              <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, fontSize: '12px' }}>Quantity:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  className="form-input"
                                  value={labelPrintQty}
                                  onChange={e => setLabelPrintQty(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px' }}>
                                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={labelOptions.showQR}
                                    onChange={e => setLabelOptions(prev => ({ ...prev, showQR: e.target.checked }))}
                                  />
                                  <span>Include Dynamic QR Traceability</span>
                                </label>
                                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={labelOptions.showBarcode}
                                    onChange={e => setLabelOptions(prev => ({ ...prev, showBarcode: e.target.checked }))}
                                  />
                                  <span>Include Code-128 / GS1 Barcode</span>
                                </label>
                                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={labelOptions.showQuarry}
                                    onChange={e => setLabelOptions(prev => ({ ...prev, showQuarry: e.target.checked }))}
                                  />
                                  <span>Include Quarry Traceability Certificate</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Live High-Definition Tag Preview */}
                          <div
                            className="card"
                            style={{
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '14px',
                              alignItems: 'center',
                              background: '#ffffff',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--line)',
                              borderRadius: '12px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                            }}
                          >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                                2. Live Industrial Tag Simulation
                              </span>
                              <span className="badge badge-soft" style={{ fontSize: '11px' }}>
                                {currentTemplate?.dimensions || '4" x 6"'} • Thermal Synthetic Tag
                              </span>
                            </div>

                            {/* Realistic Industrial Thermal Tag Card */}
                            <div style={{
                              width: '320px',
                              background: '#ffffff',
                              color: '#0f172a',
                              borderRadius: '8px',
                              border: '2px solid #334155',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              position: 'relative'
                            }}>
                              {/* Tag Punched Hole */}
                              <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '12px',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                border: '2px solid #94a3b8',
                                background: '#f1f5f9'
                              }} />

                              {/* Header */}
                              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '6px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#1e3a8a' }}>
                                  VENGO GRANITES CORP • CARRARA FACILITY
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', marginTop: '2px' }}>
                                  {activeItem?.stoneType || 'NATURAL STONE'}
                                </div>
                              </div>

                              {/* Barcode & QR Code Section */}
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                padding: '6px 0',
                                borderBottom: '1px dashed #cbd5e1'
                              }}>
                                {labelOptions.showQR && (
                                  <div style={{ border: '1px solid #0f172a', padding: '3px', borderRadius: '4px', background: '#fff' }}>
                                    <svg width="76" height="76" viewBox="0 0 84 84">
                                      <rect width="84" height="84" fill="#ffffff" />
                                      <rect x="6" y="6" width="24" height="24" fill="#0f172a" />
                                      <rect x="10" y="10" width="16" height="16" fill="#ffffff" />
                                      <rect x="14" y="14" width="8" height="8" fill="#0f172a" />
                                      <rect x="54" y="6" width="24" height="24" fill="#0f172a" />
                                      <rect x="58" y="10" width="16" height="16" fill="#ffffff" />
                                      <rect x="62" y="14" width="8" height="8" fill="#0f172a" />
                                      <rect x="6" y="54" width="24" height="24" fill="#0f172a" />
                                      <rect x="10" y="58" width="16" height="16" fill="#ffffff" />
                                      <rect x="14" y="62" width="8" height="8" fill="#0f172a" />
                                      <rect x="34" y="8" width="4" height="8" fill="#0f172a" />
                                      <rect x="42" y="12" width="6" height="4" fill="#0f172a" />
                                      <rect x="36" y="22" width="4" height="4" fill="#0f172a" />
                                      <rect x="32" y="32" width="8" height="8" fill="#0f172a" />
                                      <rect x="44" y="34" width="6" height="4" fill="#0f172a" />
                                      <rect x="54" y="36" width="8" height="4" fill="#0f172a" />
                                      <rect x="68" y="34" width="6" height="6" fill="#0f172a" />
                                      <rect x="34" y="44" width="4" height="8" fill="#0f172a" />
                                      <rect x="42" y="48" width="8" height="4" fill="#0f172a" />
                                      <rect x="54" y="44" width="4" height="6" fill="#0f172a" />
                                      <rect x="64" y="46" width="6" height="4" fill="#0f172a" />
                                      <rect x="74" y="42" width="4" height="6" fill="#0f172a" />
                                      <rect x="36" y="58" width="4" height="6" fill="#0f172a" />
                                      <rect x="44" y="56" width="6" height="4" fill="#0f172a" />
                                      <rect x="56" y="60" width="6" height="6" fill="#0f172a" />
                                      <rect x="66" y="58" width="4" height="8" fill="#0f172a" />
                                      <rect x="74" y="64" width="4" height="6" fill="#0f172a" />
                                    </svg>
                                  </div>
                                )}

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                  {labelOptions.showBarcode && (
                                    <svg width="190" height="44" viewBox="0 0 190 44">
                                      <rect x="4" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="8" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="14" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="18" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="24" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="28" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="34" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="38" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="42" y="2" width="4.5" height="30" fill="#0f172a" />
                                      <rect x="48" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="53" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="58" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="63" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="70" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="75" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="80" y="2" width="4.5" height="30" fill="#0f172a" />
                                      <rect x="87" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="92" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="98" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="103" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="110" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="115" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="121" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="126" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="132" y="2" width="2.5" height="30" fill="#0f172a" />
                                      <rect x="137" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="142" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="148" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="153" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="159" y="2" width="1.5" height="30" fill="#0f172a" />
                                      <rect x="164" y="2" width="4" height="30" fill="#0f172a" />
                                      <rect x="171" y="2" width="2" height="30" fill="#0f172a" />
                                      <rect x="176" y="2" width="3" height="30" fill="#0f172a" />
                                      <rect x="182" y="2" width="4" height="30" fill="#0f172a" />
                                      <text x="95" y="42" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="2" fill="#0f172a">
                                        8901000{activeItem?.id?.replace(/[^0-9]/g, '') || '1029'}
                                      </text>
                                    </svg>
                                  )}
                                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, marginTop: '2px' }}>
                                    {activeItem?.id}
                                  </div>
                                </div>
                              </div>

                              {/* Tag Property Grid */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '6px',
                                fontSize: '11px',
                                lineHeight: '1.3'
                              }}>
                                <div><strong style={{ color: '#64748b' }}>TYPE:</strong> <span style={{ fontWeight: 700 }}>{activeItem?.stage?.toUpperCase()}</span></div>
                                <div><strong style={{ color: '#64748b' }}>GRADE:</strong> <span style={{ fontWeight: 700, color: '#047857' }}>{activeItem?.grade || 'GRADE A'}</span></div>
                                <div><strong style={{ color: '#64748b' }}>DIMENSIONS:</strong> <span style={{ fontWeight: 700 }}>{activeItem?.size}</span></div>
                                <div><strong style={{ color: '#64748b' }}>THICKNESS:</strong> <span style={{ fontWeight: 700 }}>{activeItem?.thickness}</span></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                  <strong style={{ color: '#64748b' }}>YARD LOCATION:</strong> <span style={{ fontWeight: 700 }}>{activeItem?.location || 'CARRARA YARD MAIN'}</span>
                                </div>
                              </div>

                              {/* Tag Footer Guarantee */}
                              {labelOptions.showQuarry && (
                                <div style={{
                                  borderTop: '1px solid #0f172a',
                                  paddingTop: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  color: '#475569'
                                }}>
                                  <span>ORIGIN: MONTE ALTISSIMO QUARRY</span>
                                  <span style={{ color: '#047857' }}>✓ QC CERTIFIED</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drawer Footer */}
                      <div
                        className="drawer-footer"
                        style={{
                          padding: '14px 20px',
                          borderTop: '1px solid var(--line)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--soft)'
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setIsLabelStudioOpen(false)}
                        >
                          Cancel
                        </button>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              const target = activeItem?.rawItem;
                              if (target) openPrintLabel(target, activeItem.stage);
                            }}
                          >
                            <Printer size={14} />
                            <span>Print Directly</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleQueueLabel}
                          >
                            <Plus size={14} />
                            <span>Add to Printed Registry</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
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
              columns={lotsColumns}
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
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Truck Registration Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. RJ-14-GA-9012"
                value={formData.truckNo || ''}
                onChange={e => setFormData({ ...formData, truckNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.driverName || ''}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Driver Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={formData.driverPhone || ''}
                onChange={e => setFormData({ ...formData, driverPhone: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Transporter Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Marwar Logistics Pvt Ltd"
                value={formData.transporter || ''}
                onChange={e => setFormData({ ...formData, transporter: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier / Quarry</label>
              <select
                className="form-select"
                value={formData.supplier || ''}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Select Quarry / Supplier (Optional)</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Challan Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CH-2026-9041"
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
                placeholder="e.g. 28.50"
                value={formData.challanWeight || ''}
                onChange={e => setFormData({ ...formData, challanWeight: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter remarks or arrival notes..."
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Weighbridge Form */}
        {drawerType === 'weighbridge' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Gate Entry</label>
              <select
                className="form-select"
                value={formData.gateEntryId || ''}
                onChange={e => setFormData({ ...formData, gateEntryId: e.target.value })}
              >
                <option value="">Select Associated Gate Entry (Optional)</option>
                {gateEntries.map(g => (
                  <option key={g.id} value={g.id}>{g.entryNo} - {g.truckNo} ({g.supplier})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gross Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 42.50"
                value={formData.grossWeight || ''}
                onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tare Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 14.00"
                value={formData.tareWeight || ''}
                onChange={e => setFormData({ ...formData, tareWeight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Challan Weight (Tons)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 28.50"
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
          </>
        )}

        {/* Raw Block Form */}
        {drawerType === 'block' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Quarry Source / Supplier</label>
              <select
                className="form-select"
                value={formData.supplier || ''}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Select Quarry Source (Optional)</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <select
                className="form-select"
                value={formData.stoneType || ''}
                onChange={e => setFormData({ ...formData, stoneType: e.target.value })}
              >
                <option value="">Select Stone Type (Optional)</option>
                {stoneTypes.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quarry Block #</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q-BLK-8821"
                value={formData.quarryBlockNo || ''}
                onChange={e => setFormData({ ...formData, quarryBlockNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Length (in)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 120"
                value={formData.length || ''}
                onChange={e => setFormData({ ...formData, length: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Width (in)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 72"
                value={formData.width || ''}
                onChange={e => setFormData({ ...formData, width: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (in)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 68"
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
                placeholder="e.g. 28.50"
                value={formData.netWeight || ''}
                onChange={e => setFormData({ ...formData, netWeight: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Receiving Yard</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Carrara Yard Main"
                value={formData.receivingYard || ''}
                onChange={e => setFormData({ ...formData, receivingYard: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Zone A / Bay 02"
                value={formData.location || ''}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </>
        )}

        {/* QC 1 Form */}
        {drawerType === 'qc1' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Block to Inspect</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => {
                  const b = detailedRawBlocks.find(item => item.id === e.target.value);
                  setFormData({
                    ...formData,
                    blockId: e.target.value,
                    grade: b?.grade || formData.grade || 'Grade A',
                    sizeCheck: b ? `${b.length}" x ${b.width}" x ${b.height}" verified` : formData.sizeCheck
                  });
                }}
              >
                <option value="">Select Block to Inspect</option>
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType} ({b.status})</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Inspection Result</label>
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
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Inspector Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Inspector name"
                value={formData.inspector || currentUser.name || ''}
                onChange={e => setFormData({ ...formData, inspector: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cracks / Fissures</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. None or Minor hairline fissure"
                value={formData.cracks || ''}
                onChange={e => setFormData({ ...formData, cracks: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Defect Type</label>
              <select
                className="form-select"
                value={formData.defectType || 'None'}
                onChange={e => setFormData({ ...formData, defectType: e.target.value })}
              >
                <option value="None">None (Defect Free)</option>
                <option value="Structural Crack">Structural Crack</option>
                <option value="Hairline Fissure">Hairline Fissure</option>
                <option value="Color Banding / Patch">Color Banding / Patch</option>
                <option value="Quarry Stains">Quarry Stains</option>
                <option value="Corner / Edge Breakage">Corner / Edge Breakage</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter inspection remarks or notes..."
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Material Form */}
        {drawerType === 'material' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Target Block</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => setFormData({ ...formData, blockId: e.target.value })}
              >
                <option value="">Select Target Block (Optional)</option>
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Material Type</label>
              <select
                className="form-select"
                value={formData.materialType || 'Resin'}
                onChange={e => setFormData({ ...formData, materialType: e.target.value })}
              >
                <option value="Resin">Resin</option>
                <option value="Mesh">Mesh</option>
                <option value="Chemical">Chemical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Used</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 25"
                value={formData.quantityUsed || ''}
                onChange={e => setFormData({ ...formData, quantityUsed: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area Covered (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 450"
                value={formData.areaCovered || ''}
                onChange={e => setFormData({ ...formData, areaCovered: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Curing Time</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 4 Hours"
                value={formData.curingTime || ''}
                onChange={e => setFormData({ ...formData, curingTime: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Slicing Form */}
        {drawerType === 'slicing' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Block to Slice</label>
              <select
                className="form-select"
                value={formData.blockId || ''}
                onChange={e => setFormData({ ...formData, blockId: e.target.value })}
              >
                <option value="">Select Block to Slice (Optional)</option>
                {detailedRawBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.blockNo} - {b.stoneType}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Machine</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gangsaw 01 - Gaspari Menotti"
                value={formData.machine || ''}
                onChange={e => setFormData({ ...formData, machine: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Slab Count</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 32"
                value={formData.slabCount || ''}
                onChange={e => setFormData({ ...formData, slabCount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thickness (mm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 20"
                value={formData.thickness || ''}
                onChange={e => setFormData({ ...formData, thickness: e.target.value })}
              />
            </div>
          </>
        )}

        {/* QC 2 Form */}
        {drawerType === 'qc2' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Target Slab</label>
              <select
                className="form-select"
                value={formData.slabId || ''}
                onChange={e => {
                  const s = slabs.find(item => item.id === e.target.value);
                  setFormData({
                    ...formData,
                    slabId: e.target.value,
                    lotId: s?.lotId || formData.lotId || '',
                    grade: s?.grade || formData.grade || 'Grade A'
                  });
                }}
              >
                <option value="">Select Target Slab</option>
                {slabs.map(s => (
                  <option key={s.id} value={s.id}>{s.slabNo} - {s.stoneType} ({s.status})</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Inspection Result</label>
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
              <label className="form-label">Assigned Grade</label>
              <select
                className="form-select"
                value={formData.grade || 'Grade A'}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Inspector Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Inspector name"
                value={formData.inspector || currentUser.name || ''}
                onChange={e => setFormData({ ...formData, inspector: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flatness</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Flat +/- 0.5mm"
                value={formData.flatness || ''}
                onChange={e => setFormData({ ...formData, flatness: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Surface Gloss</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mirror Gloss >90 GU"
                value={formData.surface || ''}
                onChange={e => setFormData({ ...formData, surface: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thickness Check</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 20mm (+/- 0.2mm precision)"
                value={formData.thicknessCheck || ''}
                onChange={e => setFormData({ ...formData, thicknessCheck: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Defect Type</label>
              <select
                className="form-select"
                value={formData.defectType || 'None'}
                onChange={e => setFormData({ ...formData, defectType: e.target.value })}
              >
                <option value="None">None (Defect Free)</option>
                <option value="Scratches / Swirls">Scratches / Swirls</option>
                <option value="Dull Spots">Dull Spots</option>
                <option value="Chipped Edges">Chipped Edges</option>
                <option value="Thickness Variation">Thickness Variation</option>
                <option value="Pinhole Voids">Pinhole Voids</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Enter inspection remarks or notes..."
                value={formData.remarks || ''}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Cut to Size Form */}
        {drawerType === 'cut' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Source Slab</label>
              <select
                className="form-select"
                value={formData.slabId || ''}
                onChange={e => setFormData({ ...formData, slabId: e.target.value })}
              >
                <option value="">Select Source Slab (Optional)</option>
                {slabs.map(s => (
                  <option key={s.id} value={s.id}>{s.slabNo} ({s.sqft} Sq.Ft)</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Cut Size Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 24x24 Inch Tiles"
                value={formData.cutSizeName || ''}
                onChange={e => setFormData({ ...formData, cutSizeName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pieces Count</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 48"
                value={formData.piecesCount || ''}
                onChange={e => setFormData({ ...formData, piecesCount: e.target.value })}
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
          </>
        )}

        {/* Box Form */}
        {drawerType === 'box' && (
          <>
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
                <option value="">Select Stone Type (Optional)</option>
                {stoneTypes.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (Pcs)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 20"
                value={formData.capacity || ''}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Zone C / A-Frame 01"
                value={formData.bay || ''}
                onChange={e => setFormData({ ...formData, bay: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Putaway Form */}
        {drawerType === 'putaway' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Item ID to Move</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SLB-0001, PC-0001, BLK-0001"
                value={formData.itemId || ''}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Yard</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Carrara Yard Main"
                value={formData.toYard || ''}
                onChange={e => setFormData({ ...formData, toYard: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Zone</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Zone C - Slabs"
                value={formData.toZone || ''}
                onChange={e => setFormData({ ...formData, toZone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Bay / Rack</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A-Frame 03"
                value={formData.toBay || ''}
                onChange={e => setFormData({ ...formData, toBay: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Box (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BOX-0001"
                value={formData.toBox || ''}
                onChange={e => setFormData({ ...formData, toBox: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Relocated for export staging"
                value={formData.reason || ''}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </>
        )}

        {/* Count Sheet Form */}
        {drawerType === 'count' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Item ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SLB-0001 or BLK-0001"
                value={formData.item || ''}
                onChange={e => setFormData({ ...formData, item: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">System Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1"
                value={formData.systemQuantity || ''}
                onChange={e => setFormData({ ...formData, systemQuantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Physical Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1"
                value={formData.physicalQuantity || ''}
                onChange={e => setFormData({ ...formData, physicalQuantity: e.target.value })}
              />
            </div>
          </>
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
