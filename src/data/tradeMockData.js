// Comprehensive Master & Trade Flow Mock Data for Granite ERP
// Implements full trade chain across Supplier/Client Admin and Buyer Admin

// ============================================================================
// 1. NEW MASTER SETUP COLLECTIONS
// ============================================================================

export const initialUnits = [
  { id: 'UNT-001', code: 'Sq.Ft', name: 'Square Feet', type: 'Area', decimals: 2, status: 'Active' },
  { id: 'UNT-002', code: 'Sq.M', name: 'Square Meters', type: 'Area', decimals: 3, status: 'Active' },
  { id: 'UNT-003', code: 'Ton', name: 'Metric Ton', type: 'Weight', decimals: 3, status: 'Active' },
  { id: 'UNT-004', code: 'CBM', name: 'Cubic Meter', type: 'Volume', decimals: 3, status: 'Active' },
  { id: 'UNT-005', code: 'Nos', name: 'Count / Pieces', type: 'Count', decimals: 0, status: 'Active' }
];

export const initialUnitConversions = [
  { id: 'CNV-001', fromUnit: 'Sq.Ft', toUnit: 'Sq.M', factor: 0.092903, status: 'Active' },
  { id: 'CNV-002', fromUnit: 'Sq.M', toUnit: 'Sq.Ft', factor: 10.7639, status: 'Active' },
  { id: 'CNV-003', fromUnit: 'CBM', toUnit: 'Ton', factor: 2.75, status: 'Active' }, // Typical granite density ~2.75 MT/CBM
  { id: 'CNV-004', fromUnit: 'Ton', toUnit: 'CBM', factor: 0.3636, status: 'Active' }
];

export const initialPaymentTerms = [
  { id: 'PT-0001', code: 'ADV', name: '100% Advance Payment', days: 0, graceDays: 0, description: 'Payment required prior to dispatch', status: 'Active' },
  { id: 'PT-0002', code: 'NET15', name: 'Net 15 Days', days: 15, graceDays: 3, description: 'Full payment due within 15 calendar days', status: 'Active' },
  { id: 'PT-0003', code: 'NET30', name: 'Net 30 Days', days: 30, graceDays: 5, description: 'Standard commercial term 30 days', status: 'Active' },
  { id: 'PT-0004', code: 'NET60', name: 'Net 60 Days', days: 60, graceDays: 7, description: 'Extended corporate credit 60 days', status: 'Active' }
];

export const initialPaymentModes = [
  { id: 'PM-0001', code: 'CASH', name: 'Cash in Hand', requiresReference: 'No', linkedBankAccount: 'None', status: 'Active' },
  { id: 'PM-0002', code: 'NEFT', name: 'Bank Transfer (NEFT/RTGS)', requiresReference: 'Yes', linkedBankAccount: 'HDFC Corporate Current', status: 'Active' },
  { id: 'PM-0003', code: 'UPI', name: 'UPI / Immediate Payment', requiresReference: 'Yes', linkedBankAccount: 'ICICI Granite Operations', status: 'Active' },
  { id: 'PM-0004', code: 'CHQ', name: 'Cheque / Demand Draft', requiresReference: 'Yes', linkedBankAccount: 'SBI Commercial Escrow', status: 'Active' },
  { id: 'PM-0005', code: 'CARD', name: 'Corporate Credit Card', requiresReference: 'Yes', linkedBankAccount: 'HDFC Corporate Current', status: 'Active' }
];

export const initialCurrencies = [
  { id: 'CUR-0001', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1.0, rateDate: '2026-10-15', isBase: 'Yes', status: 'Active' },
  { id: 'CUR-0002', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 83.50, rateDate: '2026-10-15', isBase: 'No', status: 'Active' },
  { id: 'CUR-0003', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 91.20, rateDate: '2026-10-15', isBase: 'No', status: 'Active' },
  { id: 'CUR-0004', code: 'AED', name: 'UAE Dirham', symbol: 'AED', exchangeRate: 22.75, rateDate: '2026-10-15', isBase: 'No', status: 'Active' }
];

export const initialDiscountTypes = [
  { id: 'DSC-0001', code: 'TRADE-5', name: 'Standard Trade Discount', method: 'Percent', defaultValue: 5, appliesTo: 'Invoice', status: 'Active' },
  { id: 'DSC-0002', code: 'VOL-SLAB', name: 'Volume Incentive', method: 'Amount', defaultValue: 15000, appliesTo: 'Line', status: 'Active' },
  { id: 'DSC-0003', code: 'EARLY-2', name: 'Early Settlement Rebate', method: 'Percent', defaultValue: 2, appliesTo: 'Invoice', status: 'Active' }
];

export const initialOtherCharges = [
  { id: 'CHG-0001', code: 'FREIGHT', name: 'Road Transport Freight', type: 'Fixed', defaultValue: 18000, taxRate: 5, appliesTo: 'Invoice', status: 'Active' },
  { id: 'CHG-0002', code: 'CRANE-LD', name: 'Hydraulic Crane Loading', type: 'Fixed', defaultValue: 3500, taxRate: 18, appliesTo: 'Invoice', status: 'Active' },
  { id: 'CHG-0003', code: 'WOOD-PACK', name: 'Seaworthy Wooden Fumigation', type: 'Fixed', defaultValue: 8500, taxRate: 12, appliesTo: 'Invoice', status: 'Active' },
  { id: 'CHG-0004', code: 'INS-TRANS', name: 'Transit Marine Insurance', type: 'Percent', defaultValue: 0.75, taxRate: 18, appliesTo: 'PO', status: 'Active' }
];

export const initialCreditPolicies = [
  { id: 'CP-0001', code: 'STD-TIER1', name: 'Tier 1 Prime Distributor', defaultCreditLimit: 5000000, defaultPaymentDays: 30, graceDays: 7, autoBlockOnOverdue: 'Yes', overdueDaysToBlock: 15, status: 'Active' },
  { id: 'CP-0002', code: 'STD-TIER2', name: 'Tier 2 Regional Dealer', defaultCreditLimit: 2500000, defaultPaymentDays: 15, graceDays: 5, autoBlockOnOverdue: 'Yes', overdueDaysToBlock: 10, status: 'Active' },
  { id: 'CP-0003', code: 'NEW-CLIENT', name: 'New Client Provisional', defaultCreditLimit: 500000, defaultPaymentDays: 0, graceDays: 2, autoBlockOnOverdue: 'Yes', overdueDaysToBlock: 5, status: 'Active' }
];

export const initialBankAccounts = [
  { id: 'BA-0001', code: 'HDFC-01', accountName: 'Vengo Granites Primary Operations', bankName: 'HDFC Bank Ltd', accountNumber: '50200089211029', ifscSwift: 'HDFC0001245', branch: 'Industrial Finance Branch, Warangal', currency: 'INR', openingBalance: 4250000, currentBalance: 5120000, status: 'Active' },
  { id: 'BA-0002', code: 'ICICI-02', accountName: 'Vengo Collections & Processing', bankName: 'ICICI Bank Ltd', accountNumber: '003205019842', ifscSwift: 'ICIC0000032', branch: 'Commercial Hub, Hyderabad', currency: 'INR', openingBalance: 1850000, currentBalance: 2435000, status: 'Active' },
  { id: 'BA-0003', code: 'SBI-03', accountName: 'Quarry Royalty & Statutory Account', bankName: 'State Bank of India', accountNumber: '30918239019', ifscSwift: 'SBIN0004112', branch: 'Chimakurthy Main', currency: 'INR', openingBalance: 820000, currentBalance: 1150000, status: 'Active' }
];

export const initialAccountHeads = [
  { id: 'AH-0001', code: 'REV-SALES', name: 'Granite & Marble Slab Sales', type: 'Income', parentHead: null, status: 'Active' },
  { id: 'AH-0002', code: 'REV-BLOCK', name: 'Raw Block Sales', type: 'Income', parentHead: null, status: 'Active' },
  { id: 'AH-0003', code: 'EXP-RAWBLK', name: 'Quarry Block Procurement', type: 'Expense', parentHead: null, status: 'Active' },
  { id: 'AH-0004', code: 'EXP-FREIGHT', name: 'Inward Freight & Haulage', type: 'Expense', parentHead: null, status: 'Active' },
  { id: 'AH-0005', code: 'EXP-LABOR', name: 'Contractor Dressing & Cutting Wages', type: 'Expense', parentHead: null, status: 'Active' },
  { id: 'AH-0006', code: 'AST-BANK', name: 'Bank Accounts & Deposits', type: 'Asset', parentHead: null, status: 'Active' },
  { id: 'AH-0007', code: 'LIA-SUPS', name: 'Supplier Accounts Payable', type: 'Liability', parentHead: null, status: 'Active' }
];

export const initialFinancialYears = [
  { id: 'FY-2024-25', name: 'FY 2024 - 2025', startDate: '2024-04-01', endDate: '2025-03-31', status: 'Closed', lockDate: '2025-04-15' },
  { id: 'FY-2025-26', name: 'FY 2025 - 2026', startDate: '2025-04-01', endDate: '2026-03-31', status: 'Closed', lockDate: '2026-04-15' },
  { id: 'FY-2026-27', name: 'FY 2026 - 2027', startDate: '2026-04-01', endDate: '2027-03-31', status: 'Open', lockDate: '2027-04-15' }
];

export const initialDocumentNumbering = [
  { id: 'DOC-01', docType: 'Purchase Request (PR)', prefix: 'PR', nextNumber: 7, padding: 4, resetYearly: 'Yes', sample: 'PR-0007' },
  { id: 'DOC-02', docType: 'Buyer PO (BPO)', prefix: 'BPO', nextNumber: 6, padding: 4, resetYearly: 'Yes', sample: 'BPO-0006' },
  { id: 'DOC-03', docType: 'Quarry PO (QPO)', prefix: 'QPO', nextNumber: 4, padding: 4, resetYearly: 'Yes', sample: 'QPO-0004' },
  { id: 'DOC-04', docType: 'Goods Receipt Note (GRN)', prefix: 'GRN', nextNumber: 6, padding: 4, resetYearly: 'Yes', sample: 'GRN-0006' },
  { id: 'DOC-05', docType: 'Sales Order (SO)', prefix: 'SO', nextNumber: 6, padding: 4, resetYearly: 'Yes', sample: 'SO-0006' },
  { id: 'DOC-06', docType: 'Tax Invoice (INV)', prefix: 'INV', nextNumber: 7, padding: 4, resetYearly: 'Yes', sample: 'INV-0007' },
  { id: 'DOC-07', docType: 'Delivery Challan (CH)', prefix: 'CH', nextNumber: 7, padding: 4, resetYearly: 'Yes', sample: 'CH-0007' },
  { id: 'DOC-08', docType: 'Dispatch Order (DSP)', prefix: 'DSP', nextNumber: 7, padding: 4, resetYearly: 'Yes', sample: 'DSP-0007' },
  { id: 'DOC-09', docType: 'Customer Payment (RCP)', prefix: 'RCP', nextNumber: 5, padding: 4, resetYearly: 'Yes', sample: 'RCP-0005' },
  { id: 'DOC-10', docType: 'Supplier Bill (SB)', prefix: 'SB', nextNumber: 5, padding: 4, resetYearly: 'Yes', sample: 'SB-0005' },
  { id: 'DOC-11', docType: 'Supplier Payment (PAY)', prefix: 'PAY', nextNumber: 4, padding: 4, resetYearly: 'Yes', sample: 'PAY-0004' },
  { id: 'DOC-12', docType: 'Buyer Material GRN (BGRN)', prefix: 'BGRN', nextNumber: 5, padding: 4, resetYearly: 'Yes', sample: 'BGRN-0005' },
  { id: 'DOC-13', docType: 'Buyer Return (RET)', prefix: 'RET', nextNumber: 3, padding: 4, resetYearly: 'Yes', sample: 'RET-0003' },
  { id: 'DOC-14', docType: 'Credit Note (CN)', prefix: 'CN', nextNumber: 3, padding: 4, resetYearly: 'Yes', sample: 'CN-0003' },
  { id: 'DOC-15', docType: 'Debit Note (DN)', prefix: 'DN', nextNumber: 3, padding: 4, resetYearly: 'Yes', sample: 'DN-0003' }
];

export const initialReturnReasons = [
  { id: 'RR-0001', code: 'BRK', name: 'Broken / Cracked in Transit', restock: 'No', defaultAction: 'Credit', status: 'Active' },
  { id: 'RR-0002', code: 'SZ-MIS', name: 'Size / Gauge Mismatch', restock: 'Yes', defaultAction: 'Replace', status: 'Active' },
  { id: 'RR-0003', code: 'COL-VAR', name: 'Severe Color / Veining Variation', restock: 'Yes', defaultAction: 'Credit', status: 'Active' },
  { id: 'RR-0004', code: 'SHT-SUP', name: 'Short Supply / Missing Bundles', restock: 'No', defaultAction: 'Credit', status: 'Active' },
  { id: 'RR-0005', code: 'WRG-ITM', name: 'Wrong Item Delivered', restock: 'Yes', defaultAction: 'Replace', status: 'Active' },
  { id: 'RR-0006', code: 'OTH', name: 'Other Specific Discrepancy', restock: 'No', defaultAction: 'Credit', status: 'Active' }
];

export const initialNoteReasons = [
  { id: 'NR-0001', code: 'CN-RET', name: 'Goods Returned by Customer', type: 'Credit', taxTreatment: 'Adjust Output GST', status: 'Active' },
  { id: 'NR-0002', code: 'CN-RATE', name: 'Post-Sale Price Difference Discount', type: 'Credit', taxTreatment: 'Commercial Credit Only', status: 'Active' },
  { id: 'NR-0003', code: 'DN-QC1', name: 'Quarry Block QC Rejection', type: 'Debit', taxTreatment: 'Reversal of Input Tax', status: 'Active' },
  { id: 'NR-0004', code: 'DN-WT', name: 'Weighbridge Net Weight Shortage', type: 'Debit', taxTreatment: 'Adjust Invoice Value', status: 'Active' }
];

export const initialScrapReasons = [
  { id: 'SR-0001', code: 'GANG-BRK', name: 'Catastrophic Gangsaw Breakage', approvalNeeded: 'Yes', status: 'Active' },
  { id: 'SR-0002', code: 'RESIN-FAIL', name: 'Severe Epoxy Delamination', approvalNeeded: 'Yes', status: 'Active' },
  { id: 'SR-0003', code: 'TRIM-OFF', name: 'End Dressing Edge Offcuts', approvalNeeded: 'No', status: 'Active' }
];

export const initialRejectionReasons = [
  { id: 'RJR-0001', code: 'NAT-CRACK', name: 'Deep Geological Dry Line / Crack', approvalNeeded: 'Yes', status: 'Active' },
  { id: 'RJR-0002', code: 'FE-STAIN', name: 'Excessive Iron Concentration Spotting', approvalNeeded: 'Yes', status: 'Active' },
  { id: 'RJR-0003', code: 'GANGUE-MUD', name: 'Gangue / Soft Soil Inclusion Hole', approvalNeeded: 'Yes', status: 'Active' }
];

export const initialVehicles = [
  { id: 'VEH-0001', vehicleNo: 'AP 39 TB 4920', type: 'Multi-Axle Trailer (28T)', capacity: 32, owner: 'Own', transporter: 'Vengo Logistics Fleet', insuranceExpiry: '2027-05-10', fitnessExpiry: '2027-04-18', permitExpiry: '2028-01-30', status: 'Active' },
  { id: 'VEH-0002', vehicleNo: 'TS 09 UA 8831', type: 'Heavy Tipper (16T)', capacity: 20, owner: 'Own', transporter: 'Vengo Logistics Fleet', insuranceExpiry: '2026-11-20', fitnessExpiry: '2027-02-15', permitExpiry: '2027-09-12', status: 'Active' },
  { id: 'VEH-0003', vehicleNo: 'KA 01 MG 1290', type: 'Hydraulic Longbed (35T)', capacity: 40, owner: 'Hired', transporter: 'Deccan Express Logistics (SUP-0004)', insuranceExpiry: '2027-08-14', fitnessExpiry: '2027-06-30', permitExpiry: '2027-12-31', status: 'Active' },
  { id: 'VEH-0004', vehicleNo: 'MH 12 QX 5504', type: 'Container Carrier (20ft)', capacity: 26, owner: 'Hired', transporter: 'Apex Quarry Transporters (SUP-0005)', insuranceExpiry: '2026-12-05', fitnessExpiry: '2026-11-30', permitExpiry: '2027-04-20', status: 'Active' }
];

export const initialDrivers = [
  { id: 'DRV-0001', code: 'DRV-01', name: 'Kishan Yadav', phone: '+91 98451 90214', licenceNo: 'AP03201400291', licenceExpiry: '2029-08-15', linkedVehicle: 'AP 39 TB 4920', idUpload: 'Aadhaar Verified', status: 'Active' },
  { id: 'DRV-0002', code: 'DRV-02', name: 'Balaram Naik', phone: '+91 97011 88321', licenceNo: 'TS09201800184', licenceExpiry: '2028-02-10', linkedVehicle: 'TS 09 UA 8831', idUpload: 'Aadhaar Verified', status: 'Active' },
  { id: 'DRV-0003', code: 'DRV-03', name: 'Manzoor Ahmed', phone: '+91 91210 44512', licenceNo: 'KA01201600892', licenceExpiry: '2027-11-04', linkedVehicle: 'KA 01 MG 1290', idUpload: 'Aadhaar Verified', status: 'Active' }
];

export const initialDispatchLocations = [
  { id: 'LOC-0001', code: 'DSP-GATE-1', name: 'Main Yard Inbound/Outbound Weigh Gate', yard: 'Carrara Yard Main', type: 'Gate', status: 'Active' },
  { id: 'LOC-0002', code: 'DSP-CRANE-A', name: 'Overhead Gantry Crane Bay #3', yard: 'Carrara Yard Main', type: 'Loading Area', status: 'Active' },
  { id: 'LOC-0003', code: 'DSP-SLAB-EXP', name: 'Export A-Frame Loading Ramp #2', yard: 'Central Processing Depot West', type: 'Bay', status: 'Active' }
];

export const initialApprovalRules = [
  { id: 'AR-0001', docType: 'Buyer PO', amountThreshold: 1000000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0002', docType: 'Quarry PO', amountThreshold: 1500000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0003', docType: 'Credit Override', amountThreshold: 500000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0004', docType: 'GRN Variance', amountThreshold: 50000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0005', docType: 'Credit Note', amountThreshold: 100000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0006', docType: 'Debit Note', amountThreshold: 100000, approverRole: 'Supplier/Client Admin', status: 'Active' },
  { id: 'AR-0007', docType: 'Write-off', amountThreshold: 25000, approverRole: 'Supplier/Client Admin', status: 'Active' }
];

export const initialVarianceTolerances = [
  { id: 'VT-0001', scope: 'Default', linkedRecord: 'All General Stock', toleranceWeightPercent: 2.0, toleranceQtyPercent: 1.5, status: 'Active' },
  { id: 'VT-0002', scope: 'Supplier', linkedRecord: 'Altissimo Quarries (SUP-0001)', toleranceWeightPercent: 1.5, toleranceQtyPercent: 1.0, status: 'Active' },
  { id: 'VT-0003', scope: 'Stone Type', linkedRecord: 'Black Galaxy (ST-001)', toleranceWeightPercent: 1.8, toleranceQtyPercent: 1.2, status: 'Active' }
];

// Enrich Existing Masters with missing fields
export const initialEnrichedTaxRates = [
  { id: 'TAX-001', code: 'GST-18', name: 'GST 18% (Standard Granite & Marble)', rate: 18, taxType: 'GST', appliesTo: 'Goods', effectiveFrom: '2017-07-01', effectiveTo: '2099-12-31', status: 'Active' },
  { id: 'TAX-002', code: 'GST-12', name: 'GST 12% (Rough Cut Slabs & Tiles)', rate: 12, taxType: 'GST', appliesTo: 'Goods', effectiveFrom: '2017-07-01', effectiveTo: '2099-12-31', status: 'Active' },
  { id: 'TAX-003', code: 'GST-5', name: 'GST 5% (Raw Block Transportation / GTA)', rate: 5, taxType: 'GST', appliesTo: 'Services', effectiveFrom: '2017-07-01', effectiveTo: '2099-12-31', status: 'Active' },
  { id: 'TAX-004', code: 'VAT-EX', name: 'Export Zero Rated (0%)', rate: 0, taxType: 'VAT', appliesTo: 'Goods', effectiveFrom: '2020-01-01', effectiveTo: '2099-12-31', status: 'Active' }
];

export const initialEnrichedRateLists = [
  { id: 'RL-001', code: 'RL-EXP-PREM', name: 'Premium Export Final Slabs', buyerId: null, stoneTypeId: 'ST-001', thicknessId: 'THK-003', finishId: 'FIN-001', gradeId: 'GRD-001', unit: 'Sq.Ft', rate: 420, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', status: 'Active' },
  { id: 'RL-002', code: 'RL-DOM-COMM', name: 'Domestic Commercial Gangsaw Slabs', buyerId: null, stoneTypeId: 'ST-004', thicknessId: 'THK-002', finishId: 'FIN-001', gradeId: 'GRD-002', unit: 'Sq.Ft', rate: 260, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31', status: 'Active' },
  { id: 'RL-003', code: 'RL-BUY-CARRARA', name: 'Carrara Marble Contract Price', buyerId: 'CUST-001', stoneTypeId: 'ST-001', thicknessId: 'THK-003', finishId: 'FIN-001', gradeId: 'GRD-001', unit: 'Sq.Ft', rate: 395, effectiveFrom: '2026-04-01', effectiveTo: '2027-03-31', status: 'Active' },
  { id: 'RL-004', code: 'RL-BUY-DECCAN', name: 'Deccan Stone Galleria Special Rate', buyerId: 'CUST-002', stoneTypeId: 'ST-003', thicknessId: 'THK-002', finishId: 'FIN-002', gradeId: 'GRD-002', unit: 'Sq.Ft', rate: 245, effectiveFrom: '2026-04-01', effectiveTo: '2027-03-31', status: 'Active' }
];


// ============================================================================
// 2. REALISTIC TRADE FLOW COLLECTIONS (6 PRs, 5 BPOs, 3 QPOs, 5 GRNs, 6 Invoices)
// ============================================================================

// 6 Purchase Requests raised by Buyer Admin
export const initialTradePRs = [
  {
    id: 'PR-0001',
    date: '2026-10-01',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries',
    requiredDate: '2026-10-20',
    deliveryAddress: 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
    status: 'Approved',
    remarks: 'High priority luxury villa consignment',
    lines: [
      { id: 'PRL-1', stoneTypeId: 'ST-001', stoneName: 'Black Galaxy', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '10ft x 6ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1800, expectedRate: 395, lineTotal: 711000 }
    ],
    totalAmount: 711000
  },
  {
    id: 'PR-0002',
    date: '2026-10-04',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    supplierId: null,
    supplierName: 'Open Quarry Sourcing',
    requiredDate: '2026-10-25',
    deliveryAddress: 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
    status: 'Approved',
    remarks: 'Bookmatched slabs for foyer cladding',
    lines: [
      { id: 'PRL-2', stoneTypeId: 'ST-002', stoneName: 'Absolute Black', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '9.5ft x 5.8ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1500, expectedRate: 410, lineTotal: 615000 }
    ],
    totalAmount: 615000
  },
  {
    id: 'PR-0003',
    date: '2026-10-06',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    supplierId: null,
    supplierName: 'Open Quarry Sourcing',
    requiredDate: '2026-10-28',
    deliveryAddress: 'Showroom Depot 8, Banjara Hills, Hyderabad, India',
    status: 'Approved',
    remarks: 'Commercial flooring project replenishment',
    lines: [
      { id: 'PRL-3', stoneTypeId: 'ST-003', stoneName: 'Tan Brown', finishId: 'FIN-002', finishName: 'Honed Matte', thicknessId: 'THK-002', thicknessName: '18mm', size: '9ft x 5ft', gradeId: 'GRD-002', gradeName: 'Commercial', qtySqFt: 2200, expectedRate: 245, lineTotal: 539000 }
    ],
    totalAmount: 539000
  },
  {
    id: 'PR-0004',
    date: '2026-10-08',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    supplierId: null,
    supplierName: 'Open Quarry Sourcing',
    requiredDate: '2026-11-02',
    deliveryAddress: 'Showroom Depot 8, Banjara Hills, Hyderabad, India',
    status: 'Submitted',
    remarks: 'Pending credit check approval',
    lines: [
      { id: 'PRL-4', stoneTypeId: 'ST-004', stoneName: 'Steel Grey', finishId: 'FIN-004', finishName: 'Leather Finish', thicknessId: 'THK-003', thicknessName: '20mm', size: '10ft x 6ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1400, expectedRate: 280, lineTotal: 392000 }
    ],
    totalAmount: 392000
  },
  {
    id: 'PR-0005',
    date: '2026-10-11',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    supplierId: null,
    supplierName: 'Open Quarry Sourcing',
    requiredDate: '2026-11-10',
    deliveryAddress: 'Container Depot 12, Nhava Sheva Terminal, Mumbai, India',
    status: 'Submitted',
    remarks: 'Export container shipment to Singapore',
    lines: [
      { id: 'PRL-5', stoneTypeId: 'ST-005', stoneName: 'Kashmir White', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '9ft x 5.5ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1950, expectedRate: 360, lineTotal: 702000 }
    ],
    totalAmount: 702000
  },
  {
    id: 'PR-0006',
    date: '2026-10-14',
    buyerId: 'CUST-004',
    buyerName: 'Heritage Monuments Co.',
    supplierId: null,
    supplierName: 'Open Quarry Sourcing',
    requiredDate: '2026-11-15',
    deliveryAddress: 'Yard 4, Architectural Stone Hub, Jaipur, India',
    status: 'Draft',
    remarks: 'Draft request for 30mm thick monoliths',
    lines: [
      { id: 'PRL-6', stoneTypeId: 'ST-002', stoneName: 'Absolute Black', finishId: 'FIN-003', finishName: 'Flamed Rustic', thicknessId: 'THK-004', thicknessName: '30mm', size: '8ft x 4ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 800, expectedRate: 520, lineTotal: 416000 }
    ],
    totalAmount: 416000
  }
];

// 5 Buyer POs (Supplier side perspective)
export const initialTradeBuyerPOs = [
  {
    id: 'BPO-0001',
    date: '2026-10-02',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    prId: 'PR-0001',
    creditCheckResult: 'Approved (Available: ₹38.2L)',
    lines: [
      { id: 'BPOL-1', stoneTypeId: 'ST-001', stoneName: 'Black Galaxy', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '10ft x 6ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1800, rate: 395, amount: 711000 }
    ],
    subtotal: 711000,
    taxPercent: 18,
    taxAmount: 127980,
    totalAmount: 838980,
    status: 'Approved',
    remarks: 'Sales Order SO-0001 generated'
  },
  {
    id: 'BPO-0002',
    date: '2026-10-05',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    prId: 'PR-0002',
    creditCheckResult: 'Approved (Available: ₹29.8L)',
    lines: [
      { id: 'BPOL-2', stoneTypeId: 'ST-002', stoneName: 'Absolute Black', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '9.5ft x 5.8ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1500, rate: 410, amount: 615000 }
    ],
    subtotal: 615000,
    taxPercent: 18,
    taxAmount: 110700,
    totalAmount: 725700,
    status: 'Approved',
    remarks: 'Sales Order SO-0002 generated'
  },
  {
    id: 'BPO-0003',
    date: '2026-10-07',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    prId: 'PR-0003',
    creditCheckResult: 'Approved (Available: ₹19.5L)',
    lines: [
      { id: 'BPOL-3', stoneTypeId: 'ST-003', stoneName: 'Tan Brown', finishId: 'FIN-002', finishName: 'Honed Matte', thicknessId: 'THK-002', thicknessName: '18mm', size: '9ft x 5ft', gradeId: 'GRD-002', gradeName: 'Commercial', qtySqFt: 2200, rate: 245, amount: 539000 }
    ],
    subtotal: 539000,
    taxPercent: 18,
    taxAmount: 97020,
    totalAmount: 636020,
    status: 'Approved',
    remarks: 'Sales Order SO-0003 generated'
  },
  {
    id: 'BPO-0004',
    date: '2026-10-09',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    prId: 'PR-0004',
    creditCheckResult: 'Warning: Close to Credit Limit (₹2.4L remaining)',
    lines: [
      { id: 'BPOL-4', stoneTypeId: 'ST-004', stoneName: 'Steel Grey', finishId: 'FIN-004', finishName: 'Leather Finish', thicknessId: 'THK-003', thicknessName: '20mm', size: '10ft x 6ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1400, rate: 280, amount: 392000 }
    ],
    subtotal: 392000,
    taxPercent: 18,
    taxAmount: 70560,
    totalAmount: 462560,
    status: 'Pending',
    remarks: 'Awaiting credit override approval by Admin'
  },
  {
    id: 'BPO-0005',
    date: '2026-10-12',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    prId: 'PR-0005',
    creditCheckResult: 'Approved (Available: ₹45.0L)',
    lines: [
      { id: 'BPOL-5', stoneTypeId: 'ST-005', stoneName: 'Kashmir White', finishId: 'FIN-001', finishName: 'Mirror Polished', thicknessId: 'THK-003', thicknessName: '20mm', size: '9ft x 5.5ft', gradeId: 'GRD-001', gradeName: 'Premium', qtySqFt: 1950, rate: 360, amount: 702000 }
    ],
    subtotal: 702000,
    taxPercent: 18,
    taxAmount: 126360,
    totalAmount: 828360,
    status: 'Pending',
    remarks: 'Scheduled for review'
  }
];

// 3 Quarry POs (Supplier buying Raw Blocks from Quarries)
export const initialTradeQuarryPOs = [
  {
    id: 'QPO-0001',
    date: '2026-09-25',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    expectedDate: '2026-10-02',
    stoneTypeId: 'ST-001',
    stoneName: 'Black Galaxy Gangsaw Blocks',
    expectedQty: 85,
    unit: 'Ton',
    rate: 14500,
    taxPercent: 5,
    totalAmount: 1294125,
    paymentTerms: 'Net 30 Days (PT-0003)',
    status: 'Closed',
    remarks: 'Fully received via GRN-0001 & GRN-0002'
  },
  {
    id: 'QPO-0002',
    date: '2026-10-02',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    expectedDate: '2026-10-12',
    stoneTypeId: 'ST-002',
    stoneName: 'Absolute Black Monumental Blocks',
    expectedQty: 60,
    unit: 'Ton',
    rate: 16800,
    taxPercent: 5,
    totalAmount: 1058400,
    paymentTerms: 'Net 30 Days (PT-0003)',
    status: 'Closed',
    remarks: 'Received via GRN-0003'
  },
  {
    id: 'QPO-0003',
    date: '2026-10-10',
    supplierId: 'SUP-0003',
    supplierName: 'Deccan Granite Mining Corp',
    expectedDate: '2026-10-22',
    stoneTypeId: 'ST-003',
    stoneName: 'Tan Brown Gangsaw Blocks',
    expectedQty: 75,
    unit: 'Ton',
    rate: 9800,
    taxPercent: 5,
    totalAmount: 771750,
    paymentTerms: '100% Advance Payment (PT-0001)',
    status: 'Open',
    remarks: 'In transit from quarry face'
  }
];

// 5 GRNs on Supplier side (Goods Receipt Note linking weighbridge & raw blocks)
export const initialTradeGRNs = [
  {
    id: 'GRN-0001',
    date: '2026-10-01',
    qpoId: 'QPO-0001',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    gateEntry: 'GE-2024-001',
    weighbridgeTicket: 'WB-2024-001',
    blockCount: 1,
    grossWeightKg: 42350,
    tareWeightKg: 14100,
    netWeightKg: 28250,
    challanWeightKg: 28400,
    varianceKg: -150,
    variancePercent: -0.53,
    toleranceThreshold: 1.5,
    approvalStatus: 'Accepted',
    remarks: 'Variance well within tolerance. Raw block BLK-2024-001 registered.'
  },
  {
    id: 'GRN-0002',
    date: '2026-10-02',
    qpoId: 'QPO-0001',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    gateEntry: 'GE-2024-002',
    weighbridgeTicket: 'WB-2024-002',
    blockCount: 1,
    grossWeightKg: 45800,
    tareWeightKg: 14200,
    netWeightKg: 31600,
    challanWeightKg: 31800,
    varianceKg: -200,
    variancePercent: -0.63,
    toleranceThreshold: 1.5,
    approvalStatus: 'Accepted',
    remarks: 'Raw block BLK-2024-002 registered.'
  },
  {
    id: 'GRN-0003',
    date: '2026-10-11',
    qpoId: 'QPO-0002',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    gateEntry: 'GE-2024-003',
    weighbridgeTicket: 'WB-2024-003',
    blockCount: 1,
    grossWeightKg: 43100,
    tareWeightKg: 14000,
    netWeightKg: 29100,
    challanWeightKg: 29200,
    varianceKg: -100,
    variancePercent: -0.34,
    toleranceThreshold: 1.5,
    approvalStatus: 'Accepted',
    remarks: 'Raw block BLK-2024-003 registered.'
  },
  {
    id: 'GRN-0004',
    date: '2026-10-12',
    qpoId: 'QPO-0002',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    gateEntry: 'GE-2024-004',
    weighbridgeTicket: 'WB-2024-004',
    blockCount: 1,
    grossWeightKg: 46200,
    tareWeightKg: 14150,
    netWeightKg: 32050,
    challanWeightKg: 33100,
    varianceKg: -1050,
    variancePercent: -3.17,
    toleranceThreshold: 1.5,
    approvalStatus: 'Pending Approval',
    remarks: 'Shortage of 1050 kg exceeds 1.5% tolerance. Needs Supplier/Client Admin override.'
  },
  {
    id: 'GRN-0005',
    date: '2026-10-14',
    qpoId: 'QPO-0003',
    supplierId: 'SUP-0003',
    supplierName: 'Deccan Granite Mining Corp',
    gateEntry: 'GE-2024-005',
    weighbridgeTicket: 'WB-2024-005',
    blockCount: 1,
    grossWeightKg: 40500,
    tareWeightKg: 13900,
    netWeightKg: 26600,
    challanWeightKg: 26750,
    varianceKg: -150,
    variancePercent: -0.56,
    toleranceThreshold: 2.0,
    approvalStatus: 'Accepted',
    remarks: 'Rough block received in good condition.'
  }
];

// 5 Sales Orders (linking BPOs, reserving Final Slab bundles)
export const initialTradeSalesOrders = [
  {
    id: 'SO-0001',
    date: '2026-10-02',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    bpoId: 'BPO-0001',
    shippingAddress: 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
    priceList: 'RL-BUY-CARRARA',
    creditStatus: 'Cleared',
    lines: [
      { id: 'SOL-1', bundleId: 'BUN-2024-001', stoneTypeId: 'ST-001', stoneName: 'Black Galaxy', thickness: '20mm', qtySqFt: 1800, rate: 395, amount: 711000 }
    ],
    totalAmount: 838980,
    reservedBundles: ['BUN-2024-001'],
    status: 'Invoiced'
  },
  {
    id: 'SO-0002',
    date: '2026-10-05',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    bpoId: 'BPO-0002',
    shippingAddress: 'Plot 45, Harbour Industrial Estate, Genoa, Italy',
    priceList: 'RL-BUY-CARRARA',
    creditStatus: 'Cleared',
    lines: [
      { id: 'SOL-2', bundleId: 'BUN-2024-002', stoneTypeId: 'ST-002', stoneName: 'Absolute Black', thickness: '20mm', qtySqFt: 1500, rate: 410, amount: 615000 }
    ],
    totalAmount: 725700,
    reservedBundles: ['BUN-2024-002'],
    status: 'Invoiced'
  },
  {
    id: 'SO-0003',
    date: '2026-10-07',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    bpoId: 'BPO-0003',
    shippingAddress: 'Showroom Depot 8, Banjara Hills, Hyderabad, India',
    priceList: 'RL-BUY-DECCAN',
    creditStatus: 'Cleared',
    lines: [
      { id: 'SOL-3', bundleId: 'BUN-2024-003', stoneTypeId: 'ST-003', stoneName: 'Tan Brown', thickness: '18mm', qtySqFt: 2200, rate: 245, amount: 539000 }
    ],
    totalAmount: 636020,
    reservedBundles: ['BUN-2024-003'],
    status: 'Invoiced'
  },
  {
    id: 'SO-0004',
    date: '2026-10-10',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    bpoId: 'BPO-0004',
    shippingAddress: 'Showroom Depot 8, Banjara Hills, Hyderabad, India',
    priceList: 'RL-BUY-DECCAN',
    creditStatus: 'Override Approved by Admin',
    lines: [
      { id: 'SOL-4', bundleId: 'BUN-2024-004', stoneTypeId: 'ST-004', stoneName: 'Steel Grey', thickness: '20mm', qtySqFt: 1400, rate: 280, amount: 392000 }
    ],
    totalAmount: 462560,
    reservedBundles: ['BUN-2024-004'],
    status: 'Reserved'
  },
  {
    id: 'SO-0005',
    date: '2026-10-13',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    bpoId: 'BPO-0005',
    shippingAddress: 'Container Depot 12, Nhava Sheva Terminal, Mumbai, India',
    priceList: 'RL-EXP-PREM',
    creditStatus: 'Cleared',
    lines: [
      { id: 'SOL-5', bundleId: 'BUN-2024-005', stoneTypeId: 'ST-005', stoneName: 'Kashmir White', thickness: '20mm', qtySqFt: 1950, rate: 360, amount: 702000 }
    ],
    totalAmount: 828360,
    reservedBundles: ['BUN-2024-005'],
    status: 'Draft'
  }
];

// 6 Invoices with Challans and Dispatches
export const initialTradeInvoices = [
  {
    id: 'INV-0001',
    date: '2026-10-03',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    soId: 'SO-0001',
    bpoId: 'BPO-0001',
    subtotal: 711000,
    discountAmount: 15000,
    taxPercent: 18,
    taxAmount: 125280,
    freightAmount: 18000,
    totalAmount: 839280,
    paidAmount: 839280,
    outstandingAmount: 0,
    dueDate: '2026-11-02',
    status: 'Paid',
    challanId: 'CH-0001',
    dispatchId: 'DSP-0001'
  },
  {
    id: 'INV-0002',
    date: '2026-10-06',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    soId: 'SO-0002',
    bpoId: 'BPO-0002',
    subtotal: 615000,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 110700,
    freightAmount: 18000,
    totalAmount: 743700,
    paidAmount: 500000,
    outstandingAmount: 243700,
    dueDate: '2026-11-05',
    status: 'Part Paid',
    challanId: 'CH-0002',
    dispatchId: 'DSP-0002'
  },
  {
    id: 'INV-0003',
    date: '2026-10-08',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    soId: 'SO-0003',
    bpoId: 'BPO-0003',
    subtotal: 539000,
    discountAmount: 10000,
    taxPercent: 18,
    taxAmount: 95220,
    freightAmount: 12000,
    totalAmount: 636220,
    paidAmount: 0,
    outstandingAmount: 636220,
    dueDate: '2026-10-23',
    status: 'Issued',
    challanId: 'CH-0003',
    dispatchId: 'DSP-0003'
  },
  {
    id: 'INV-0004',
    date: '2026-09-10',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    soId: null,
    bpoId: null,
    subtotal: 380000,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 68400,
    freightAmount: 10000,
    totalAmount: 458400,
    paidAmount: 0,
    outstandingAmount: 458400,
    dueDate: '2026-10-10', // Overdue!
    status: 'Overdue',
    challanId: 'CH-0004',
    dispatchId: 'DSP-0004'
  },
  {
    id: 'INV-0005',
    date: '2026-10-12',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    soId: null,
    bpoId: null,
    subtotal: 520000,
    discountAmount: 12000,
    taxPercent: 18,
    taxAmount: 91440,
    freightAmount: 22000,
    totalAmount: 621440,
    paidAmount: 621440,
    outstandingAmount: 0,
    dueDate: '2026-11-11',
    status: 'Paid',
    challanId: 'CH-0005',
    dispatchId: 'DSP-0005'
  },
  {
    id: 'INV-0006',
    date: '2026-10-14',
    buyerId: 'CUST-004',
    buyerName: 'Heritage Monuments Co.',
    soId: null,
    bpoId: null,
    subtotal: 290000,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 52200,
    freightAmount: 8500,
    totalAmount: 350700,
    paidAmount: 0,
    outstandingAmount: 350700,
    dueDate: '2026-10-29',
    status: 'Issued',
    challanId: 'CH-0006',
    dispatchId: 'DSP-0006'
  }
];

export const initialTradeChallans = [
  {
    id: 'CH-0001',
    date: '2026-10-03',
    invoiceId: 'INV-0001',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav',
    bundles: ['BUN-2024-001'],
    totalSqFt: 1800,
    weightKg: 8640,
    status: 'Delivered'
  },
  {
    id: 'CH-0002',
    date: '2026-10-06',
    invoiceId: 'INV-0002',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    vehicleNo: 'TS 09 UA 8831',
    driverName: 'Balaram Naik',
    bundles: ['BUN-2024-002'],
    totalSqFt: 1500,
    weightKg: 7200,
    status: 'Delivered'
  },
  {
    id: 'CH-0003',
    date: '2026-10-08',
    invoiceId: 'INV-0003',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    vehicleNo: 'KA 01 MG 1290',
    driverName: 'Manzoor Ahmed',
    bundles: ['BUN-2024-003'],
    totalSqFt: 2200,
    weightKg: 9500,
    status: 'Dispatched'
  },
  {
    id: 'CH-0004',
    date: '2026-09-10',
    invoiceId: 'INV-0004',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav',
    bundles: ['BUN-2024-004'],
    totalSqFt: 1400,
    weightKg: 6800,
    status: 'Delivered'
  },
  {
    id: 'CH-0005',
    date: '2026-10-12',
    invoiceId: 'INV-0005',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    vehicleNo: 'MH 12 QX 5504',
    driverName: 'Santosh Giri',
    bundles: ['BUN-2024-005'],
    totalSqFt: 1950,
    weightKg: 9360,
    status: 'Delivered'
  },
  {
    id: 'CH-0006',
    date: '2026-10-14',
    invoiceId: 'INV-0006',
    buyerId: 'CUST-004',
    buyerName: 'Heritage Monuments Co.',
    vehicleNo: 'TS 09 UA 8831',
    driverName: 'Balaram Naik',
    bundles: ['BUN-2024-006'],
    totalSqFt: 800,
    weightKg: 5760,
    status: 'Pending'
  }
];

export const initialTradeDispatches = [
  {
    id: 'DSP-0001',
    date: '2026-10-03',
    challanId: 'CH-0001',
    invoiceId: 'INV-0001',
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav',
    outTime: '09:30 AM',
    status: 'Delivered',
    proofOfDelivery: 'Signed POD Uploaded'
  },
  {
    id: 'DSP-0002',
    date: '2026-10-06',
    challanId: 'CH-0002',
    invoiceId: 'INV-0002',
    vehicleNo: 'TS 09 UA 8831',
    driverName: 'Balaram Naik',
    outTime: '11:15 AM',
    status: 'Delivered',
    proofOfDelivery: 'Signed POD Uploaded'
  },
  {
    id: 'DSP-0003',
    date: '2026-10-08',
    challanId: 'CH-0003',
    invoiceId: 'INV-0003',
    vehicleNo: 'KA 01 MG 1290',
    driverName: 'Manzoor Ahmed',
    outTime: '02:00 PM',
    status: 'Dispatched',
    proofOfDelivery: 'In Transit'
  },
  {
    id: 'DSP-0004',
    date: '2026-09-10',
    challanId: 'CH-0004',
    invoiceId: 'INV-0004',
    vehicleNo: 'AP 39 TB 4920',
    driverName: 'Kishan Yadav',
    outTime: '10:00 AM',
    status: 'Delivered',
    proofOfDelivery: 'Signed POD Uploaded'
  },
  {
    id: 'DSP-0005',
    date: '2026-10-12',
    challanId: 'CH-0005',
    invoiceId: 'INV-0005',
    vehicleNo: 'MH 12 QX 5504',
    driverName: 'Santosh Giri',
    outTime: '08:45 AM',
    status: 'Delivered',
    proofOfDelivery: 'Port Gate Pass #8892'
  },
  {
    id: 'DSP-0006',
    date: '2026-10-14',
    challanId: 'CH-0006',
    invoiceId: 'INV-0006',
    vehicleNo: 'TS 09 UA 8831',
    driverName: 'Balaram Naik',
    outTime: 'Pending',
    status: 'To Dispatch',
    proofOfDelivery: 'Awaiting loading'
  }
];

// Customer Payments (RCP)
export const initialTradeCustomerPayments = [
  {
    id: 'RCP-0001',
    date: '2026-10-05',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'HDFCR202610050992',
    amount: 839280,
    allocatedInvoices: [{ invoiceId: 'INV-0001', amount: 839280 }],
    unallocatedBalance: 0,
    status: 'Completed'
  },
  {
    id: 'RCP-0002',
    date: '2026-10-09',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'HDFCR202610091884',
    amount: 500000,
    allocatedInvoices: [{ invoiceId: 'INV-0002', amount: 500000 }],
    unallocatedBalance: 0,
    status: 'Completed'
  },
  {
    id: 'RCP-0003',
    date: '2026-10-13',
    buyerId: 'CUST-003',
    buyerName: 'Pacific Stoneworks',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'SWIFT-SG-990184',
    amount: 621440,
    allocatedInvoices: [{ invoiceId: 'INV-0005', amount: 621440 }],
    unallocatedBalance: 0,
    status: 'Completed'
  }
];

// Supplier Bills (SB)
export const initialTradeSupplierBills = [
  {
    id: 'SB-0001',
    date: '2026-10-02',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    billNo: 'ALT/2026/991',
    qpoId: 'QPO-0001',
    grnId: 'GRN-0001',
    amount: 409625,
    taxAmount: 20481,
    totalAmount: 430106,
    paidAmount: 430106,
    outstandingAmount: 0,
    dueDate: '2026-11-01',
    status: 'Paid',
    match3Way: 'Matched'
  },
  {
    id: 'SB-0002',
    date: '2026-10-03',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    billNo: 'ALT/2026/994',
    qpoId: 'QPO-0001',
    grnId: 'GRN-0002',
    amount: 458200,
    taxAmount: 22910,
    totalAmount: 481110,
    paidAmount: 481110,
    outstandingAmount: 0,
    dueDate: '2026-11-02',
    status: 'Paid',
    match3Way: 'Matched'
  },
  {
    id: 'SB-0003',
    date: '2026-10-12',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    billNo: 'CR/OCT/102',
    qpoId: 'QPO-0002',
    grnId: 'GRN-0003',
    amount: 488880,
    taxAmount: 24444,
    totalAmount: 513324,
    paidAmount: 0,
    outstandingAmount: 513324,
    dueDate: '2026-11-11',
    status: 'Approved',
    match3Way: 'Matched'
  },
  {
    id: 'SB-0004',
    date: '2026-10-13',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    billNo: 'CR/OCT/109',
    qpoId: 'QPO-0002',
    grnId: 'GRN-0004',
    amount: 556080,
    taxAmount: 27804,
    totalAmount: 583884,
    paidAmount: 0,
    outstandingAmount: 583884,
    dueDate: '2026-11-12',
    status: 'Pending',
    match3Way: 'Variance Discrepancy'
  }
];

// Supplier Payments (PAY)
export const initialTradeSupplierPayments = [
  {
    id: 'PAY-0001',
    date: '2026-10-04',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'HDFC-PAY-90912',
    amount: 430106,
    debitNotesAdjusted: 0,
    netPaid: 430106,
    status: 'Completed'
  },
  {
    id: 'PAY-0002',
    date: '2026-10-05',
    supplierId: 'SUP-0001',
    supplierName: 'Altissimo Quarries Holdings',
    mode: 'Bank Transfer (NEFT/RTGS)',
    reference: 'HDFC-PAY-90984',
    amount: 481110,
    debitNotesAdjusted: 0,
    netPaid: 481110,
    status: 'Completed'
  }
];

// Contractor Payments
export const initialTradeContractorPayments = [
  {
    id: 'PAY-CON-0001',
    date: '2026-10-01',
    contractorId: 'CON-001',
    contractorName: 'Apex Quarry Labor Agency',
    period: 'September 2026',
    attendanceDays: 620,
    agreementRate: 750,
    calculatedAmount: 465000,
    advances: 40000,
    netPaid: 425000,
    status: 'Completed'
  },
  {
    id: 'PAY-CON-002',
    date: '2026-10-01',
    contractorId: 'CON-002',
    contractorName: 'Deccan Granite Logistics & Crew',
    period: 'September 2026',
    attendanceDays: 480,
    agreementRate: 850,
    calculatedAmount: 408000,
    advances: 30000,
    netPaid: 378000,
    status: 'Completed'
  }
];

// Buyer Material Receipts (BGRN)
export const initialTradeBuyerGRNs = [
  {
    id: 'BGRN-0001',
    date: '2026-10-04',
    buyerId: 'CUST-001',
    challanNo: 'CH-0001',
    invoiceNo: 'INV-0001',
    vehicleNo: 'AP 39 TB 4920',
    expectedBundles: ['BUN-2024-001'],
    receivedBundles: ['BUN-2024-001'],
    bundleChecks: [
      { bundleId: 'BUN-2024-001', expectedSqFt: 1800, receivedSqFt: 1800, checkStatus: 'Received', condition: 'Flawless' }
    ],
    shortageSqFt: 0,
    damagedSqFt: 0,
    receivedBy: 'Marco Rossi',
    status: 'Accepted',
    photo: 'pod_carrara_01.jpg'
  },
  {
    id: 'BGRN-0002',
    date: '2026-10-07',
    buyerId: 'CUST-001',
    challanNo: 'CH-0002',
    invoiceNo: 'INV-0002',
    vehicleNo: 'TS 09 UA 8831',
    expectedBundles: ['BUN-2024-002'],
    receivedBundles: ['BUN-2024-002'],
    bundleChecks: [
      { bundleId: 'BUN-2024-002', expectedSqFt: 1500, receivedSqFt: 1420, checkStatus: 'Damaged', condition: 'Edge chipped on 2 slabs (80 sq.ft damaged)' }
    ],
    shortageSqFt: 0,
    damagedSqFt: 80,
    receivedBy: 'Marco Rossi',
    status: 'Accepted with Damage',
    photo: 'pod_carrara_02_damage.jpg'
  }
];

// 2 Returns raised by Buyer Admin
export const initialTradeReturns = [
  {
    id: 'RET-0001',
    date: '2026-10-08',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    invoiceId: 'INV-0002',
    bundleOrSlab: 'BUN-2024-002 (Slab #4 & #5)',
    reason: 'Broken',
    qtySqFt: 80,
    photo: 'damage_slab_chipped.jpg',
    status: 'Approved',
    resolutionAction: 'Credit Note',
    creditNoteId: 'CN-0001',
    remarks: 'Approved by Supplier/Client Admin. Credit Note CN-0001 generated for ₹32,800.'
  },
  {
    id: 'RET-0002',
    date: '2026-10-12',
    buyerId: 'CUST-002',
    buyerName: 'Deccan Stone Galleria',
    invoiceId: 'INV-0004',
    bundleOrSlab: 'BUN-2024-004 (Slab #8)',
    reason: 'Color Variation',
    qtySqFt: 45,
    photo: 'color_mismatch.jpg',
    status: 'Raised',
    resolutionAction: 'Pending Review',
    creditNoteId: null,
    remarks: 'Awaiting inspection by Supplier QA engineer'
  }
];

// Credit Notes (CN)
export const initialTradeCreditNotes = [
  {
    id: 'CN-0001',
    date: '2026-10-09',
    buyerId: 'CUST-001',
    buyerName: 'Carrara Marble Importers',
    invoiceId: 'INV-0002',
    returnId: 'RET-0001',
    amount: 32800,
    taxAdjusted: 5904,
    totalCredit: 38704,
    status: 'Applied to Invoice Balance'
  }
];

// 1 Debit Note (DN)
export const initialTradeDebitNotes = [
  {
    id: 'DN-0001',
    date: '2026-10-13',
    supplierId: 'SUP-0002',
    supplierName: 'Chimakurthy Ridge Pit #3',
    grnId: 'GRN-0004',
    qpoId: 'QPO-0002',
    amount: 17640,
    reason: 'Weighbridge shortage of 1050 Kg on Raw Block #ALT-4421',
    status: 'Adjusted against Supplier Bill SB-0004'
  }
];

// Scrap Write-offs
export const initialTradeScrapWriteOffs = [
  {
    id: 'SWO-0001',
    date: '2026-10-10',
    itemType: 'Slab Offcut',
    itemId: 'SLB-2024-092',
    stoneName: 'Tan Brown Offcuts',
    qtySqFt: 65,
    reason: 'Catastrophic Gangsaw Breakage',
    approver: 'Rajesh Sharma',
    estimatedValue: 12500,
    status: 'Approved'
  }
];
