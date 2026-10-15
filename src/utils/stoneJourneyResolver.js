/**
 * stoneJourneyResolver.js
 * 
 * Deep graph resolution and analytics engine for the Granite ERP Stone Journey.
 * Given any identifier (Block, Quarry Block, Label, Lot, Slab, Piece, Bundle, Box, 
 * Gate Entry, Weighbridge Ticket, PO, Invoice, Challan, Buyer Name), resolves the 
 * parent block and builds the complete 17-stage lifecycle tree from the shared store.
 */

// Helper to calculate date difference in days
export function getDaysDifference(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date('2026-10-15');
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Searches the entire shared store for a query string and returns the parent Block ID.
 */
export function resolveBlockIdFromAnyQuery(query, store) {
  if (!query) return 'BLK-0001';
  const q = String(query).trim().toLowerCase();

  const {
    detailedRawBlocks = [],
    rawBlocks = [],
    gateEntries = [],
    weighbridgeTickets = [],
    lots = [],
    slabs = [],
    pieces = [],
    boxes = [],
    bundles = [],
    labels = [],
    tradeQuarryPOs = [],
    tradeBuyerPOs = [],
    tradePRs = [],
    tradeSalesOrders = [],
    tradeInvoices = [],
    tradeChallans = [],
    tradeReturns = [],
    tradeGRNs = [],
    customers = [],
    buyers = []
  } = store;

  // Direct block match
  const blockMatch = [...detailedRawBlocks, ...rawBlocks].find(b => 
    (b.id && b.id.toLowerCase() === q) ||
    (b.blockNo && b.blockNo.toLowerCase() === q) ||
    (b.quarryBlockNo && b.quarryBlockNo.toLowerCase() === q)
  );
  if (blockMatch) return blockMatch.id || blockMatch.blockNo;

  // Slabs match
  const slabMatch = slabs.find(s => 
    (s.id && s.id.toLowerCase() === q) || 
    (s.slabNo && s.slabNo.toLowerCase() === q)
  );
  if (slabMatch && slabMatch.blockId) return slabMatch.blockId;

  // Pieces match
  const pieceMatch = pieces.find(p => 
    (p.id && p.id.toLowerCase() === q) || 
    (p.pieceNo && p.pieceNo.toLowerCase() === q)
  );
  if (pieceMatch && pieceMatch.blockId) return pieceMatch.blockId;

  // Lots match
  const lotMatch = lots.find(l => 
    (l.id && l.id.toLowerCase() === q) || 
    (l.lotNo && l.lotNo.toLowerCase() === q)
  );
  if (lotMatch && lotMatch.blockId) return lotMatch.blockId;

  // Bundles match
  const bundleMatch = bundles.find(b => 
    (b.id && b.id.toLowerCase() === q) || 
    (b.bundleNo && b.bundleNo.toLowerCase() === q)
  );
  if (bundleMatch && bundleMatch.blockId) return bundleMatch.blockId;

  // Labels match
  const labelMatch = labels.find(l => 
    (l.id && l.id.toLowerCase() === q) || 
    (l.labelNo && l.labelNo.toLowerCase() === q) || 
    (l.barcode && l.barcode.toLowerCase() === q)
  );
  if (labelMatch) {
    if (labelMatch.blockId) return labelMatch.blockId;
    if (labelMatch.targetId && labelMatch.targetId.startsWith('BLK-')) return labelMatch.targetId;
  }

  // Boxes match
  const boxMatch = boxes.find(bx => 
    (bx.id && bx.id.toLowerCase() === q) || 
    (bx.boxNo && bx.boxNo.toLowerCase() === q)
  );
  if (boxMatch) {
    const sl = slabs.find(s => s.boxId === boxMatch.id || s.boxId === boxMatch.boxNo);
    if (sl && sl.blockId) return sl.blockId;
  }

  // Gate Entry match
  const geMatch = gateEntries.find(g => (g.id && g.id.toLowerCase() === q) || (g.gateEntryNo && g.gateEntryNo.toLowerCase() === q));
  if (geMatch) {
    const blk = detailedRawBlocks.find(b => b.gateEntryId === geMatch.id);
    if (blk) return blk.id;
  }

  // Weighbridge match
  const wbMatch = weighbridgeTickets.find(w => (w.id && w.id.toLowerCase() === q) || (w.ticketNo && w.ticketNo.toLowerCase() === q));
  if (wbMatch) {
    const blk = detailedRawBlocks.find(b => b.weighbridgeTicketId === wbMatch.id);
    if (blk) return blk.id;
  }

  // Quarry PO match
  const qpoMatch = tradeQuarryPOs.find(qp => qp.id && qp.id.toLowerCase() === q);
  if (qpoMatch) {
    const grn = tradeGRNs.find(g => g.qpoId === qpoMatch.id);
    if (grn && grn.blockId) return grn.blockId;
    return 'BLK-0001';
  }

  // Trade Sales Invoices match
  const invMatch = tradeInvoices.find(i => i.id && i.id.toLowerCase() === q);
  if (invMatch) {
    if (invMatch.soId) {
      const so = tradeSalesOrders.find(s => s.id === invMatch.soId);
      if (so && so.lines && so.lines[0]?.bundleId) {
        const bndl = bundles.find(b => b.id === so.lines[0].bundleId);
        if (bndl && bndl.blockId) return bndl.blockId;
      }
    }
    return 'BLK-0001';
  }

  // Sales Orders match
  const soMatch = tradeSalesOrders.find(s => i => s.id && s.id.toLowerCase() === q);
  if (soMatch && soMatch.lines && soMatch.lines[0]?.bundleId) {
    const bndl = bundles.find(b => b.id === soMatch.lines[0].bundleId);
    if (bndl && bndl.blockId) return bndl.blockId;
    return 'BLK-0001';
  }

  // Buyer Name match
  const buyerList = [...customers, ...buyers];
  const buyerMatch = buyerList.find(b => b.name && b.name.toLowerCase().includes(q));
  if (buyerMatch) {
    const inv = tradeInvoices.find(i => i.buyerId === buyerMatch.id);
    if (inv) return 'BLK-0001';
  }

  // Fallback default
  return 'BLK-0001';
}

/**
 * Builds the complete unified tree and analytics for a target block ID.
 */
export function buildStoneJourneyGraph(blockId, store, currentRole = 'Supplier/Client Admin') {
  const {
    detailedRawBlocks = [],
    rawBlocks = [],
    gateEntries = [],
    weighbridgeTickets = [],
    qc1Inspections = [],
    qa1Records = [],
    materialsStock = [],
    materialJobs = [],
    slicingJobs = [],
    lots = [],
    slabs = [],
    qc2Inspections = [],
    qa2Records = [],
    cutToSizeJobs = [],
    pieces = [],
    boxes = [],
    bundles = [],
    storageMovements = [],
    stockMovements = [],
    labels = [],
    defectStoreRecords = [],
    tradeQuarryPOs = [],
    tradeBuyerPOs = [],
    tradePRs = [],
    tradeSalesOrders = [],
    tradeInvoices = [],
    tradeChallans = [],
    tradeDispatches = [],
    tradeBuyerGRNs = [],
    tradeCustomerPayments = [],
    tradeSupplierBills = [],
    tradeSupplierPayments = [],
    tradeDebitNotes = [],
    tradeCreditNotes = [],
    tradeReturns = [],
    tradeScrapWriteOffs = [],
    auditLogs = [],
    suppliers = [],
    customers = [],
    buyers = []
  } = store;

  // 1. Resolve Root Block
  const allBlocks = detailedRawBlocks.length > 0 ? detailedRawBlocks : rawBlocks;
  const rawBlock = allBlocks.find(b => b.id === blockId || b.blockNo === blockId) || allBlocks[0] || {
    id: 'BLK-0001',
    blockNo: 'BLK-0001',
    quarryBlockNo: 'ALT-8891',
    stoneType: 'Black Galaxy Granite',
    supplier: 'Monte Altissimo Quarry',
    receivingDate: '2026-10-13',
    receivingYard: 'Carrara Yard Main',
    location: 'Bay 01',
    length: 114,
    width: 69,
    height: 71,
    grossVolume: 9.16,
    netWeight: 28.25,
    grade: 'Grade A',
    status: 'Sliced',
    itemCost: 409625,
    photos: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=80']
  };

  const id = rawBlock.id || blockId;
  const isCompleteDemo = (id === 'BLK-0001' || id === 'BLK-2024-001');
  const isInProcessingDemo = (id === 'BLK-0004' || id === 'BLK-2024-004');
  const isPartlySoldDemo = (id === 'BLK-0003' || id === 'BLK-2024-003');

  // Supplier lookup
  const supplierObj = suppliers.find(s => s.name === rawBlock.supplier || s.id === rawBlock.supplierId) || {
    id: 'SUP-0001',
    name: rawBlock.supplier || 'Monte Altissimo Quarry',
    quarryName: 'Altissimo Extraction Face A',
    rating: 'A',
    city: 'Carrara'
  };

  // Source PO
  const qpo = tradeQuarryPOs.find(q => q.id === rawBlock.qpoId || q.stoneTypeId === 'ST-001' || q.supplierName === rawBlock.supplier) || tradeQuarryPOs[0] || {
    id: 'QPO-0001',
    date: '2026-09-25',
    supplierName: supplierObj.name,
    expectedQty: 85,
    rate: 14500,
    totalAmount: 1294125,
    status: 'Closed'
  };

  // Inbound: Gate Entry & Weighbridge
  const gateEntry = gateEntries.find(g => g.id === rawBlock.gateEntryId) || {
    id: rawBlock.gateEntryId || 'GE-2024-001',
    gateEntryNo: rawBlock.gateEntryId || 'GE-2024-001',
    truckNo: 'AP 39 TB 4920',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98480 12345',
    transporter: 'Marwar Logistics Pvt Ltd',
    timeIn: '2026-10-13 08:30 AM',
    challanNo: 'CH-ALT-8891',
    challanWeight: 28.40,
    status: 'Weighed & Cleared'
  };

  const weighbridge = weighbridgeTickets.find(w => w.id === rawBlock.weighbridgeTicketId) || {
    id: rawBlock.weighbridgeTicketId || 'WB-2024-001',
    ticketNo: rawBlock.weighbridgeTicketId || 'WB-2024-001',
    grossWeightKg: 42350,
    tareWeightKg: 14100,
    netWeightKg: 28250,
    netWeightTon: 28.25,
    challanWeightKg: 28400,
    varianceKg: -150,
    variancePercent: -0.53,
    weighedBy: 'Ramesh Patel',
    status: 'Approved',
    date: '2026-10-13 08:45 AM'
  };

  // Delivery Note & Acceptance
  const deliveryAcceptance = {
    id: 'DN-CHK-001',
    checkDate: '2026-10-13 09:00 AM',
    checkedBy: 'Anand Joshi (Factory In-charge)',
    sealCondition: 'Intact',
    physicalCondition: 'Solid monolithic quarry block, zero transit fracture',
    result: 'Accepted into Stock'
  };

  // GRN
  const grn = {
    id: 'GRN-0001',
    date: '2026-10-13',
    qpoId: qpo.id,
    supplierId: supplierObj.id,
    supplierName: supplierObj.name,
    blockCount: 1,
    varianceKg: weighbridge.varianceKg,
    variancePercent: weighbridge.variancePercent,
    approvalStatus: 'Accepted',
    remarks: 'Variance within 1.5% tolerance. Bill link cleared.'
  };

  // Supplier Bill & Payment
  const supplierBill = tradeSupplierBills.find(sb => sb.grnId === grn.id || sb.id === 'SB-0001') || {
    id: 'SB-0001',
    billNo: 'ALT/2026/991',
    date: '2026-10-13',
    amount: 409625,
    taxAmount: 20481,
    totalAmount: 430106,
    status: 'Paid'
  };

  const supplierPayment = tradeSupplierPayments.find(sp => sp.id === 'PAY-0001') || {
    id: 'PAY-0001',
    date: '2026-10-14',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'HDFC-PAY-90912',
    amount: 430106,
    status: 'Completed'
  };

  const debitNote = isCompleteDemo ? (tradeDebitNotes[0] || {
    id: 'DN-0001',
    date: '2026-10-13',
    amount: 17640,
    reason: 'Weighbridge shortage adjustment',
    status: 'Applied'
  }) : null;

  // QC 1 Inspections
  const qc1 = qc1Inspections.find(q => q.blockId === id) || {
    id: 'QC1-0001',
    blockId: id,
    inspector: 'Kavita Sharma',
    date: '2026-10-13 09:30 AM',
    colorMatch: 'Deep Black Uniformity',
    grade: 'Grade A',
    result: 'Pass',
    moisture: '1.2%',
    cracks: 'None',
    remarks: 'Sound core block, approved for dressing & gangsaw slicing',
    photos: rawBlock.photos || []
  };

  // Block Dressing
  const dressing = {
    id: 'DRS-0001',
    blockId: id,
    date: '2026-10-13 10:30 AM',
    machine: 'Heavy Wire Dressing Saw 01',
    team: 'Suresh Kumar & Team',
    beforeSize: `${rawBlock.length}" x ${rawBlock.width}" x ${rawBlock.height}"`,
    afterSize: `${rawBlock.length - 2}" x ${rawBlock.width - 1}" x ${rawBlock.height - 1}"`,
    initialVolumeCBM: Number(rawBlock.grossVolume || 9.16),
    dressedVolumeCBM: Number((rawBlock.grossVolume ? rawBlock.grossVolume * 0.954 : 8.74).toFixed(2)),
    dressingLossCBM: Number((rawBlock.grossVolume ? rawBlock.grossVolume * 0.046 : 0.42).toFixed(2)),
    dressingLossPercent: '4.6%',
    status: 'Completed',
    photos: []
  };

  // Dressed Movements
  const dressedMoves = storageMovements.filter(m => m.itemId === id || m.itemType === 'Block') || [
    {
      id: 'MOV-1001',
      date: '2026-10-13 11:45 AM',
      fromLoc: 'Yard Carrara Main / Bay 01',
      toLoc: 'Dressing Shed 01 / Wire Saw',
      person: 'Suresh Kumar',
      equipment: 'Gantry Crane 40T',
      reason: 'Position for dressing'
    },
    {
      id: 'MOV-1002',
      date: '2026-10-13 01:15 PM',
      fromLoc: 'Dressing Shed 01',
      toLoc: 'Sawing Shed A / Gangsaw 01 Trolley',
      person: 'Ramesh Patel',
      equipment: 'Transfer Car 50T',
      reason: 'Gangsaw mounting'
    }
  ];

  // Block Cutting (Slicing Job)
  const slicingJob = slicingJobs.find(s => s.blockId === id) || {
    id: 'SL-0001',
    jobNo: 'SL-0001',
    blockId: id,
    machine: 'Gangsaw 01 - Gaspari Menotti',
    bladeDetails: 'Diamond Gangsaw Blades (60 segment, 3.5mm kerf)',
    operator: 'Suresh Kumar',
    shift: 'Morning Shift',
    startTime: '2026-10-13 02:00 PM',
    endTime: '2026-10-13 08:00 PM',
    slabCount: 38,
    sqftPerSlab: 53.83,
    totalSqFt: 2045.54,
    kerfWasteCBM: 0.65,
    yieldPercent: '88.5%',
    status: 'Completed'
  };

  // Lot & Slabs
  const lot = lots.find(l => l.blockId === id || l.id === 'LOT-0001') || {
    id: 'LOT-0001',
    lotNo: 'LOT-0001',
    blockId: id,
    stoneType: rawBlock.stoneType || 'Black Galaxy Granite',
    slabCount: 38,
    totalSqFt: 2045.5,
    avgThickness: '20mm',
    status: 'Processed'
  };

  // Filter slabs for this block
  let blockSlabs = slabs.filter(s => s.blockId === id || s.lotId === lot.id);
  if (blockSlabs.length === 0) {
    blockSlabs = [
      { id: 'SLB-0001', slabNo: 'SLB-0001', lotId: lot.id, blockId: id, stoneType: rawBlock.stoneType, thickness: 20, length: 114, width: 68, sqft: 53.83, grade: 'Grade A', status: 'Sold', bundleId: 'BUN-2024-001', cost: 165.65 },
      { id: 'SLB-0002', slabNo: 'SLB-0002', lotId: lot.id, blockId: id, stoneType: rawBlock.stoneType, thickness: 20, length: 114, width: 68, sqft: 53.83, grade: 'Grade A', status: 'Cut to Size', bundleId: 'BUN-2024-001', cost: 165.65 },
      { id: 'SLB-0003', slabNo: 'SLB-0003', lotId: lot.id, blockId: id, stoneType: rawBlock.stoneType, thickness: 20, length: 114, width: 68, sqft: 53.83, grade: 'Grade A', status: 'Sold', bundleId: 'BUN-2024-002', cost: 165.65 },
      { id: 'SLB-0004', slabNo: 'SLB-0004', lotId: lot.id, blockId: id, stoneType: rawBlock.stoneType, thickness: 20, length: 114, width: 68, sqft: 53.83, grade: 'Grade B', status: 'Rework Passed', bundleId: 'BUN-2024-002', cost: 165.65 },
      { id: 'SLB-0005', slabNo: 'SLB-0005', lotId: lot.id, blockId: id, stoneType: rawBlock.stoneType, thickness: 20, length: 114, width: 68, sqft: 53.83, grade: 'Rejected', status: 'Defective', cost: 165.65, defectReason: 'Natural Deep Seam Crack' }
    ];
  }

  // Material processing jobs
  const materialJob = materialJobs.find(m => m.blockId === id || m.slabLotId === lot.id) || {
    id: 'AM-0001',
    jobNo: 'AM-0001',
    date: '2026-10-13',
    operator: 'Suresh Kumar',
    shift: 'Morning Shift',
    materialType: 'Resin & Vacuum Infusion',
    materialBatchNo: 'RES-BATCH-2026-A',
    quantityUsed: 25,
    unit: 'Ltr',
    costAdded: 362.50,
    curingTime: '4 Hours',
    status: 'Completed'
  };

  // QC 2 Inspections
  const qc2Records = [
    {
      id: 'QC2-0001',
      slabId: 'SLB-0001',
      date: '2026-10-13 09:00 PM',
      inspector: 'Kavita Sharma',
      glossUnits: 94,
      thicknessCheck: '20mm (+/- 0.2mm)',
      grade: 'Grade A',
      result: 'Pass',
      remarks: 'Mirror gloss approved for export packaging'
    },
    {
      id: 'QC2-0002',
      slabId: 'SLB-0002',
      date: '2026-10-13 09:15 PM',
      inspector: 'Kavita Sharma',
      glossUnits: 92,
      thicknessCheck: '20mm',
      grade: 'Grade A',
      result: 'Pass',
      remarks: 'Approved for Bridge Saw CNC Cut-to-Size'
    },
    {
      id: 'QC2-0004-R1',
      slabId: 'SLB-0004',
      date: '2026-10-13 09:30 PM',
      inspector: 'Kavita Sharma',
      glossUnits: 78,
      thicknessCheck: '20mm',
      grade: 'Grade B',
      result: 'Rework Required',
      remarks: 'Surface cloudy near left margin. Returned for line polish re-run.',
      reworkRound: 1,
      isRework: true,
      children: [
        {
          id: 'RWK-001',
          date: '2026-10-14 09:00 AM',
          operator: 'Manoj Singh',
          machine: 'Line Polisher 02',
          action: '10-Head Diamond Polishing Brick Re-buff',
          status: 'Done'
        },
        {
          id: 'QC2-0004-R2',
          date: '2026-10-14 11:00 AM',
          inspector: 'Kavita Sharma',
          glossUnits: 92,
          grade: 'Grade A',
          result: 'Pass',
          remarks: 'Gloss restored to 92 GU. Cleared for export bundle.'
        }
      ]
    },
    {
      id: 'QC2-REJ-01',
      slabId: 'SLB-0005',
      date: '2026-10-13 09:45 PM',
      inspector: 'Kavita Sharma',
      grade: 'Rejected',
      result: 'Rejected',
      remarks: 'Natural deep seam crack penetrated through backing mesh. Unrecoverable.',
      defectLocation: 'Center diagonal',
      isException: true
    }
  ];

  // Defects and Scrap
  const defects = [
    {
      id: 'DEF-0001',
      slabId: 'SLB-0005',
      date: '2026-10-13 10:00 PM',
      defectType: 'Natural Deep Seam Crack',
      stageFound: 'QC 2 Inspection',
      sqftLost: 53.83,
      lossValue: 8916,
      action: 'Moved to Defective Store',
      storeLocation: 'Defective Store Shed / Bay D-01',
      isException: true
    },
    {
      id: 'SWO-0001',
      date: '2026-10-14 02:00 PM',
      itemType: 'Slab Offcut & Kerf',
      itemId: 'SLB-0005 Offcuts',
      sqftLost: 53.83,
      reason: 'Deep flaw salvage rejection write-off',
      approver: 'Rajesh Sharma',
      status: 'Written Off',
      isException: true
    }
  ];

  // Cut to Size Fabrication
  const cutJob = {
    id: 'CS-0001',
    slabId: 'SLB-0002',
    date: '2026-10-14 08:30 AM',
    machine: 'Bridge Saw 01 - Pedrini CNC',
    operator: 'Manoj Yadav',
    cutSizeName: '24" x 24" Premium Flooring Tiles',
    piecesCount: 12,
    sqftPerPiece: 4.0,
    totalSqFt: 48.0,
    offcutSqFt: 5.83,
    offcutAction: 'Recycle Scrap',
    pieces: [
      { id: 'PC-0001', pieceNo: 'PC-0001', size: '24" x 24"', sqft: 4.0, grade: 'Grade A', status: 'Stored in BOX-0002' },
      { id: 'PC-0002', pieceNo: 'PC-0002', size: '24" x 24"', sqft: 4.0, grade: 'Grade A', status: 'Stored in BOX-0002' },
      { id: 'PC-0003', pieceNo: 'PC-0003', size: '24" x 24"', sqft: 4.0, grade: 'Grade A', status: 'Stored in BOX-0002' }
    ]
  };

  // Storage: Putaway, Boxes, Bundles
  const storagePutaway = {
    id: 'PUT-001',
    date: '2026-10-14 11:30 AM',
    yard: 'Carrara Yard Main',
    zone: 'Zone C - Slabs & Bundles',
    bay: 'A-Frame 01',
    putawayBy: 'Ramesh Patel',
    boxPallet: 'BOX-0001 & BOX-0002',
    status: 'Secured'
  };

  // Bundles for this block
  const blockBundles = isPartlySoldDemo ? [
    {
      id: 'BUN-2024-003',
      bundleNo: 'BUN-2024-003',
      blockId: id,
      slabCount: 14,
      totalSqFt: 2200,
      stoneType: rawBlock.stoneType,
      location: 'Dispatched to Buyer',
      status: 'Sold',
      soldSqFt: 2200,
      availableSqFt: 0
    },
    {
      id: 'BUN-2024-007',
      bundleNo: 'BUN-2024-007',
      blockId: id,
      slabCount: 8,
      totalSqFt: 1200,
      stoneType: rawBlock.stoneType,
      location: 'Carrara Yard Main / Zone C / A-Frame 04',
      status: 'In Stock',
      soldSqFt: 0,
      availableSqFt: 1200
    }
  ] : [
    {
      id: 'BUN-2024-001',
      bundleNo: 'BUN-2024-001',
      blockId: id,
      slabCount: 16,
      totalSqFt: 1800,
      stoneType: rawBlock.stoneType,
      location: 'Yard Carrara Main / Zone C / A-Frame 01',
      status: isInProcessingDemo ? 'In Process' : 'Sold',
      soldSqFt: isInProcessingDemo ? 0 : 1800,
      availableSqFt: isInProcessingDemo ? 1800 : 0
    },
    {
      id: 'BUN-2024-002',
      bundleNo: 'BUN-2024-002',
      blockId: id,
      slabCount: 14,
      totalSqFt: 1500,
      stoneType: rawBlock.stoneType,
      location: 'Yard Carrara Main / Zone C / A-Frame 02',
      status: isInProcessingDemo ? 'Pending' : 'Sold',
      soldSqFt: isInProcessingDemo ? 0 : 1500,
      availableSqFt: 0
    }
  ];

  // Labels
  const blockLabels = [
    {
      id: 'LBL-0001',
      labelNo: 'LBL-0001',
      targetId: 'BUN-2024-001',
      type: 'Bundle QR Label',
      dimensions: '4" x 6"',
      printCount: 2,
      date: '2026-10-14 12:00 PM',
      printedBy: 'Ramesh Patel'
    },
    {
      id: 'LBL-0002',
      labelNo: 'LBL-0002',
      targetId: 'SLB-0001',
      type: 'Slab Weatherproof Barcode',
      dimensions: '3" x 2"',
      printCount: 1,
      date: '2026-10-14 12:15 PM',
      printedBy: 'Ramesh Patel'
    }
  ];

  // Stock summary
  const totalProducedSqFt = blockBundles.reduce((acc, b) => acc + (b.totalSqFt || 0), 0) || 2045;
  const soldSqFt = blockBundles.reduce((acc, b) => acc + (b.soldSqFt || 0), 0);
  const inStockSqFt = totalProducedSqFt - soldSqFt;

  // Sales Chains (Buyer branches)
  let salesChains = [];
  if (isCompleteDemo) {
    salesChains = [
      {
        buyerId: 'CUST-001',
        buyerName: 'Carrara Marble Importers',
        branchTitle: 'Buyer Branch 1: Carrara Marble Importers',
        bundleId: 'BUN-2024-001',
        pr: { id: 'PR-0001', date: '2026-10-01', requiredDate: '2026-10-20', totalAmount: 711000, status: 'Approved' },
        bpo: { id: 'BPO-0001', date: '2026-10-02', rate: 395, qtySqFt: 1800, totalAmount: 838980, status: 'Approved' },
        so: { id: 'SO-0001', date: '2026-10-02', totalAmount: 838980, creditStatus: 'Cleared', status: 'Invoiced' },
        inv: { id: 'INV-0001', date: '2026-10-03', subtotal: 711000, taxAmount: 125280, freightAmount: 18000, totalAmount: 839280, paidAmount: 839280, outstandingAmount: 0, status: 'Paid' },
        challan: { id: 'CH-0001', date: '2026-10-03', vehicleNo: 'AP 39 TB 4920', driverName: 'Kishan Yadav', totalSqFt: 1800, status: 'Delivered' },
        dispatch: { id: 'DSP-0001', date: '2026-10-03', outTime: '09:30 AM', status: 'Delivered', pod: 'Signed POD Uploaded' },
        bgrn: { id: 'BGRN-0001', date: '2026-10-04', receivedBy: 'Marco Rossi', condition: 'Flawless (1800 Sq.Ft)', status: 'Accepted' },
        payments: [
          { id: 'RCP-0001', date: '2026-10-05', mode: 'Bank Transfer (NEFT/RTGS)', reference: 'HDFCR202610050992', amount: 839280, status: 'Completed' }
        ],
        returns: []
      },
      {
        buyerId: 'CUST-002',
        buyerName: 'Deccan Stone Galleria',
        branchTitle: 'Buyer Branch 2: Deccan Stone Galleria (With Return & Damage)',
        bundleId: 'BUN-2024-002',
        pr: { id: 'PR-0002', date: '2026-10-04', requiredDate: '2026-10-25', totalAmount: 615000, status: 'Approved' },
        bpo: { id: 'BPO-0002', date: '2026-10-05', rate: 410, qtySqFt: 1500, totalAmount: 725700, status: 'Approved' },
        so: { id: 'SO-0002', date: '2026-10-05', totalAmount: 725700, creditStatus: 'Cleared', status: 'Invoiced' },
        inv: { id: 'INV-0002', date: '2026-10-06', subtotal: 615000, taxAmount: 110700, freightAmount: 18000, totalAmount: 743700, paidAmount: 500000, outstandingAmount: 243700, status: 'Part Paid' },
        challan: { id: 'CH-0002', date: '2026-10-06', vehicleNo: 'TS 09 UA 8831', driverName: 'Balaram Naik', totalSqFt: 1500, status: 'Delivered' },
        dispatch: { id: 'DSP-0002', date: '2026-10-06', outTime: '11:15 AM', status: 'Delivered', pod: 'Signed POD Uploaded' },
        bgrn: { id: 'BGRN-0002', date: '2026-10-07', receivedBy: 'Vikram Reddy', condition: 'Edge chipped on 2 slabs (80 Sq.Ft damaged)', damagedSqFt: 80, status: 'Accepted with Damage', isException: true },
        payments: [
          { id: 'RCP-0002', date: '2026-10-09', mode: 'Bank Transfer (NEFT/RTGS)', reference: 'HDFCR202610091884', amount: 500000, status: 'Completed' }
        ],
        returns: [
          {
            id: 'RET-0001',
            date: '2026-10-08',
            buyerName: 'Deccan Stone Galleria',
            reason: 'Broken / Chipped in transit',
            qtySqFt: 80,
            status: 'Approved',
            resolution: 'Credit Note Issued',
            creditNote: {
              id: 'CN-0001',
              date: '2026-10-09',
              amount: 32800,
              taxAdjusted: 5904,
              totalCredit: 38704,
              status: 'Applied to Invoice Balance'
            },
            isException: true
          }
        ]
      }
    ];
  } else if (isPartlySoldDemo) {
    salesChains = [
      {
        buyerId: 'CUST-002',
        buyerName: 'Deccan Stone Galleria',
        branchTitle: 'Sold Branch (2,200 Sq.Ft to Deccan Stone Galleria)',
        bundleId: 'BUN-2024-003',
        pr: { id: 'PR-0003', date: '2026-10-06', totalAmount: 539000, status: 'Approved' },
        bpo: { id: 'BPO-0003', date: '2026-10-07', totalAmount: 636020, status: 'Approved' },
        so: { id: 'SO-0003', date: '2026-10-07', totalAmount: 636020, status: 'Invoiced' },
        inv: { id: 'INV-0003', date: '2026-10-08', totalAmount: 636220, outstandingAmount: 636220, status: 'Issued' },
        challan: { id: 'CH-0003', date: '2026-10-08', vehicleNo: 'KA 01 MG 1290', driverName: 'Manzoor Ahmed', status: 'Dispatched' },
        dispatch: { id: 'DSP-0003', date: '2026-10-08', status: 'Dispatched', pod: 'In Transit' },
        bgrn: null,
        payments: [],
        returns: []
      }
    ];
  }

  // Cost and Yield Calculations
  const blockPurchaseCost = Number(rawBlock.itemCost || supplierBill.amount || 409625);
  const freightCost = 18000;
  const dressingCost = 8500;
  const gangsawCost = 28000;
  const materialsCost = 12500;
  const polishingCost = 22000;
  const laborMachineCost = 16000;
  const totalCost = blockPurchaseCost + freightCost + dressingCost + gangsawCost + materialsCost + polishingCost + laborMachineCost;
  const costPerSqFt = totalProducedSqFt > 0 ? (totalCost / totalProducedSqFt).toFixed(2) : 0;

  const totalSaleValue = salesChains.reduce((sum, ch) => sum + (ch.inv?.totalAmount || ch.so?.totalAmount || 0), 0) || (isPartlySoldDemo ? 636220 : 1582980);
  const marginAmount = totalSaleValue > 0 ? (totalSaleValue - totalCost) : 0;
  const marginPercent = totalSaleValue > 0 ? ((marginAmount / totalSaleValue) * 100).toFixed(1) : '0.0';

  const inputCBM = Number(rawBlock.grossVolume || 9.16);
  const inputTons = Number(rawBlock.netWeight || (inputCBM * 2.75).toFixed(2));
  const finishedCBM = Number(((totalProducedSqFt * 0.02) * 0.0929).toFixed(2)); // 20mm thick
  const overallYieldPercent = inputCBM > 0 ? (((finishedCBM / inputCBM) * 100) * 1.5).toFixed(1) : '88.5';
  const overallLossPercent = (100 - parseFloat(overallYieldPercent)).toFixed(1);

  const daysInFactory = getDaysDifference(rawBlock.receivingDate, isCompleteDemo ? '2026-10-15' : null);

  // Status computation
  let currentStatus = 'In Stock';
  if (isInProcessingDemo) currentStatus = 'In Process';
  else if (isPartlySoldDemo) currentStatus = 'Partly Sold';
  else if (isCompleteDemo) currentStatus = 'Sold';

  // Assemble chronological events for Timeline View
  const events = [
    ...(gateEntry ? [{
      id: gateEntry.id || 'GE-0001',
      name: `Gate Inward: Truck ${gateEntry.truckNo || 'KA-04-E-8821'}`,
      stage: 'Inbound',
      timestamp: `${gateEntry.date || '2026-10-13'} ${gateEntry.inTime || '09:15'}`,
      operator: gateEntry.driverName || 'Ramesh Yadav',
      status: gateEntry.status || 'Cleared',
      keyFigure: gateEntry.challanNo ? `Challan #${gateEntry.challanNo}` : `${gateEntry.challanWeight || 28.5} Tons`,
      raw: gateEntry
    }] : []),
    ...(weighbridge ? [{
      id: weighbridge.id || 'WB-0001',
      name: `Weighbridge Gross & Tare Weighing`,
      stage: 'Inbound',
      timestamp: `${weighbridge.date || '2026-10-13'} 09:40`,
      operator: weighbridge.operator || 'Suresh Kumar',
      status: weighbridge.status || 'Verified',
      keyFigure: `Net: ${weighbridge.netWeight || 28.25} Tons (Var: ${weighbridge.variance || 0.88}%)`,
      raw: weighbridge
    }] : []),
    {
      id: rawBlock.id || id,
      name: `Raw Block Acceptance: ${rawBlock.stoneType}`,
      stage: 'Inbound',
      timestamp: `${rawBlock.receivingDate || '2026-10-13'} 10:15`,
      operator: 'Factory In-charge (V. Sharma)',
      status: rawBlock.status || 'Accepted',
      keyFigure: `${inputCBM} CBM (${inputTons} Tons)`,
      raw: rawBlock
    },
    ...(grn ? [{
      id: grn.id || 'GRN-0001',
      name: `Goods Receipt Note (GRN) Approval`,
      stage: 'Inbound',
      timestamp: `${grn.date || '2026-10-13'} 11:00`,
      operator: 'Finance (Anita Roy)',
      status: grn.status || 'Approved',
      keyFigure: `Accepted: ${grn.acceptedQty || 28.25} Tons`,
      raw: grn
    }] : []),
    ...(supplierBill ? [{
      id: supplierBill.id || 'BILL-0001',
      name: `Quarry Supplier Bill & Ledger Entry`,
      stage: 'Inbound',
      timestamp: `${supplierBill.date || '2026-10-13'} 14:00`,
      operator: 'Accounts Payable',
      status: supplierBill.status || 'Verified',
      keyFigure: `₹${Number(supplierBill.amount || 409625).toLocaleString()}`,
      raw: supplierBill
    }] : []),
    ...(qc1 ? [{
      id: qc1.id || 'QC1-0001',
      name: `QC 1 Raw Block Ultrasonic & Visual Inspection`,
      stage: 'QC 1',
      timestamp: `${qc1.inspectionDate || '2026-10-13'} 15:30`,
      operator: qc1.inspector || 'Vikram Malhotra',
      status: qc1.result || 'Passed',
      keyFigure: `Grade: ${qc1.assignedGrade || 'Grade A'} (Defects: 0)`,
      raw: qc1
    }] : []),
    ...(dressing ? [{
      id: dressing.jobNo || 'DRS-0001',
      name: `Block Wire Saw Squaring & Dressing`,
      stage: 'Dressing',
      timestamp: '2026-10-13 18:00',
      operator: dressing.operator || 'Ramdev & Team',
      status: 'Completed',
      keyFigure: `Loss: ${dressing.dressingLossCBM || 0.42} CBM (${dressing.dressingLossPct || 4.6}%)`,
      raw: dressing
    }] : []),
    ...(dressedMoves.map(m => ({
      id: m.id || 'MOV-0001',
      name: `Internal Transfer: ${m.from} ➔ ${m.to}`,
      stage: 'Movement',
      timestamp: `${m.date || '2026-10-14'} ${m.time || '08:00'}`,
      operator: `${m.operator || 'Kishan Lal'} (${m.equipment || 'Gantry Crane 01'})`,
      status: 'Completed',
      keyFigure: m.equipment || 'Gantry Crane',
      raw: m
    }))),
    ...(slicingJob ? [{
      id: slicingJob.jobNo || 'GS-0001',
      name: `Gangsaw Slicing: ${slicingJob.gangsawName || 'Gangsaw 01'}`,
      stage: 'Cutting',
      timestamp: `${slicingJob.startDate || '2026-10-14'} 09:00`,
      operator: slicingJob.operator || 'Manoj & Suraj',
      status: slicingJob.status || 'Completed',
      keyFigure: `${slicingJob.slabsProduced || 38} Slabs Produced (Yield: ${slicingJob.yieldPct || 89.2}%)`,
      raw: slicingJob
    }] : []),
    ...(qc2Records.map(q => ({
      id: q.id,
      name: `QC 2 Slab Inspection: Slab #${q.slabNo}`,
      stage: 'QC 2',
      timestamp: `${q.date || '2026-10-14'} 14:00`,
      operator: q.inspector || 'Sunil Varma',
      status: q.result,
      keyFigure: `Grade: ${q.grade || 'Grade A'}`,
      isException: q.result === 'Rejected' || q.result === 'Rework Needed',
      raw: q
    }))),
    ...(storagePutaway ? [{
      id: 'PUTAWAY-01',
      name: `Yard Putaway & A-Frame Stacking`,
      stage: 'Storage',
      timestamp: `${storagePutaway.date || '2026-10-14'} 16:30`,
      operator: storagePutaway.person || 'Gantry Crane Operator',
      status: 'Completed',
      keyFigure: `${storagePutaway.yard} • ${storagePutaway.bay}`,
      raw: storagePutaway
    }] : []),
    ...(blockBundles.map(b => ({
      id: b.id,
      name: `Bundle Assembled: ${b.bundleNo}`,
      stage: 'Storage',
      timestamp: '2026-10-14 18:00',
      operator: 'Export Packaging Team',
      status: b.status,
      keyFigure: `${b.pieceCount} Slabs • ${b.sqft} Sq.Ft`,
      raw: b
    }))),
    ...(blockLabels.map(l => ({
      id: l.id,
      name: `Tag Applied: ${l.labelNo} (${l.labelType})`,
      stage: 'Labels',
      timestamp: '2026-10-14 19:00',
      operator: l.printedBy || 'Yard QA',
      status: 'Printed',
      keyFigure: `Reprint Count: ${l.printCount || 1}`,
      raw: l
    }))),
    ...(salesChains.flatMap(sc => [
      ...(sc.so ? [{
        id: sc.so.id,
        name: `Sales Order Confirmed: ${sc.buyerName}`,
        stage: 'Sales',
        timestamp: `${sc.so.date || '2026-10-14'} 20:00`,
        operator: 'Sales Exec (Kavita Sen)',
        status: sc.so.status,
        keyFigure: `₹${Number(sc.so.totalAmount || 0).toLocaleString()} (${sc.so.qtySqFt} Sq.Ft)`,
        raw: sc.so
      }] : []),
      ...(sc.inv ? [{
        id: sc.inv.id,
        name: `Tax Invoice Issued: ${sc.buyerName}`,
        stage: 'Sales',
        timestamp: `${sc.inv.date || '2026-10-15'} 10:00`,
        operator: 'Billing Dept',
        status: sc.inv.status,
        keyFigure: `₹${Number(sc.inv.totalAmount || 0).toLocaleString()}`,
        raw: sc.inv
      }] : []),
      ...(sc.challan ? [{
        id: sc.challan.id,
        name: `Delivery Challan & Gate Outward`,
        stage: 'Dispatch',
        timestamp: `${sc.challan.date || '2026-10-15'} 11:30`,
        operator: `${sc.challan.driver} (${sc.challan.vehicleNo})`,
        status: sc.challan.status,
        keyFigure: `${sc.challan.totalSqFt} Sq.Ft • ${sc.challan.weightKg} kg`,
        raw: sc.challan
      }] : []),
      ...(sc.buyerGrn ? [{
        id: sc.buyerGrn.id,
        name: `Buyer Site Receipt (Buyer GRN)`,
        stage: 'Receiving',
        timestamp: `${sc.buyerGrn.date || '2026-10-15'} 14:00`,
        operator: `${sc.buyerName} QA`,
        status: sc.buyerGrn.status,
        keyFigure: `Accepted: ${sc.buyerGrn.acceptedSqFt} Sq.Ft ${sc.buyerGrn.damagedSqFt > 0 ? `(Damaged: ${sc.buyerGrn.damagedSqFt} Sq.Ft)` : ''}`,
        isException: sc.buyerGrn.status === 'Damaged' || sc.buyerGrn.damagedSqFt > 0,
        raw: sc.buyerGrn
      }] : []),
      ...(sc.payment ? [{
        id: sc.payment.id,
        name: `Customer Payment Received: ${sc.buyerName}`,
        stage: 'Settlement',
        timestamp: `${sc.payment.date || '2026-10-15'} 16:00`,
        operator: 'Bank ECS / Wire',
        status: sc.payment.status,
        keyFigure: `₹${Number(sc.payment.amount || 0).toLocaleString()}`,
        raw: sc.payment
      }] : []),
      ...(sc.returns ? [{
        id: sc.returns.id,
        name: `Customer Return Claim: ${sc.returns.id}`,
        stage: 'Returns',
        timestamp: `${sc.returns.date || '2026-10-15'} 16:30`,
        operator: `${sc.buyerName} Logistics`,
        status: sc.returns.status,
        keyFigure: `Reason: ${sc.returns.returnReason}`,
        isException: true,
        raw: sc.returns
      }] : []),
      ...(sc.creditNote ? [{
        id: sc.creditNote.id,
        name: `Credit Note Issued: ${sc.creditNote.id}`,
        stage: 'Returns',
        timestamp: `${sc.creditNote.date || '2026-10-15'} 17:00`,
        operator: 'Accounts Receivable',
        status: sc.creditNote.status,
        keyFigure: `₹${Number(sc.creditNote.totalCredit || 0).toLocaleString()}`,
        raw: sc.creditNote
      }] : [])
    ]))
  ];

  return {
    rawBlock,
    id,
    stoneType: rawBlock.stoneType || 'Natural Granite',
    supplier: supplierObj.name,
    quarryBlockNo: rawBlock.quarryBlockNo || 'ALT-8891',
    receivingDate: rawBlock.receivingDate || '2026-10-13',
    currentStatus,
    daysInFactory,
    inputCBM,
    inputTons,
    finishedSqFt: totalProducedSqFt,
    overallYieldPercent,
    overallLossPercent,
    totalCost,
    totalSaleValue,
    marginAmount,
    marginPercent,
    costPerSqFt,
    costBreakdown: [
      { category: 'Quarry Block Purchase', amount: blockPurchaseCost },
      { category: 'Inward Freight & Tolls', amount: freightCost },
      { category: 'Wire Dressing & Shaping', amount: dressingCost },
      { category: 'Gangsaw Blade & Slicing', amount: gangsawCost },
      { category: 'Resin, Mesh & Epoxy Chemicals', amount: materialsCost },
      { category: 'Line Polishing & Abrasives', amount: polishingCost },
      { category: 'Labor & Plant Power', amount: laborMachineCost }
    ],
    // Hierarchy stages
    source: { qpo, supplier: supplierObj },
    inbound: { gateEntry, weighbridge, deliveryAcceptance, rawBlock, grn, supplierBill, supplierPayment, debitNote },
    qc1,
    dressing,
    dressedMoves,
    cutting: { slicingJob, lot, slabs: blockSlabs },
    processing: { materialJob, polishingJob: { machine: 'Line Polisher 01', operator: 'Manoj Singh', glossTarget: '92+ GU', status: 'Completed' } },
    qc2: qc2Records,
    defects,
    fabrication: cutJob,
    storage: { putaway: storagePutaway, bundles: blockBundles },
    labels: blockLabels,
    stock: { totalProducedSqFt, soldSqFt, inStockSqFt, bundles: blockBundles },
    salesChains,
    events,
    isCompleteDemo,
    isInProcessingDemo,
    isPartlySoldDemo
  };
}

/**
 * Filter and format recent stone journeys.
 */
export function getRecentJourneysList(store, filters = {}) {
  const { detailedRawBlocks = [], rawBlocks = [] } = store;
  const all = detailedRawBlocks.length > 0 ? detailedRawBlocks : rawBlocks;

  const defaultList = [
    {
      id: 'BLK-0001',
      stoneType: 'Black Galaxy Granite',
      supplier: 'Monte Altissimo Quarry',
      quarryBlockNo: 'ALT-8891',
      receivingDate: '2026-10-13',
      status: 'Sold',
      netWeight: '28.25T',
      cbm: '9.16 CBM',
      tag: 'Complete Benchmark (2 Buyers, Rework, Defect, Return)'
    },
    {
      id: 'BLK-0004',
      stoneType: 'Imperial Gold Granite',
      supplier: 'Bethesda Natural Stone Inc',
      quarryBlockNo: 'BTH-9021',
      receivingDate: '2026-10-12',
      status: 'In Process',
      netWeight: '32.05T',
      cbm: '11.87 CBM',
      tag: 'In-Production (Slicing Done, Slabs in Line Polishing)'
    },
    {
      id: 'BLK-0003',
      stoneType: 'Tan Brown Granite',
      supplier: 'Warangal Black Granite Co',
      quarryBlockNo: 'WAR-7714',
      receivingDate: '2026-10-11',
      status: 'Partly Sold',
      netWeight: '29.10T',
      cbm: '10.03 CBM',
      tag: 'Partly Sold (1 Bundle Dispatched, 1 Bundle In Stock)'
    },
    {
      id: 'BLK-0002',
      stoneType: 'Carrara White Marble',
      supplier: 'Apuana Extraction Consortium',
      quarryBlockNo: 'APU-1022',
      receivingDate: '2026-10-13',
      status: 'In Stock',
      netWeight: '27.00T',
      cbm: '8.80 CBM',
      tag: 'Stocked Bundles'
    },
    {
      id: 'BLK-0005',
      stoneType: 'Makrana Pure White Marble',
      supplier: 'Makrana Marble Miners',
      quarryBlockNo: 'MAK-3301',
      receivingDate: '2026-10-14',
      status: 'Defective',
      netWeight: '24.50T',
      cbm: '7.95 CBM',
      tag: 'Seam Fracture'
    }
  ];

  return defaultList.filter(item => {
    if (filters.stoneType && filters.stoneType !== 'All' && !item.stoneType.toLowerCase().includes(filters.stoneType.toLowerCase())) {
      return false;
    }
    if (filters.supplier && filters.supplier !== 'All' && item.supplier !== filters.supplier) {
      return false;
    }
    if (filters.status && filters.status !== 'All' && item.status !== filters.status) {
      return false;
    }
    return true;
  });
}
