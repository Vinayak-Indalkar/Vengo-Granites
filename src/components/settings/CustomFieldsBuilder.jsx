import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Box,
  Scissors,
  Layers,
  Receipt,
  HardHat,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Sparkles,
  Sliders,
  FileText,
  Calendar,
  Hash,
  Type,
  List,
  CheckSquare,
  Upload,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Save,
  RotateCcw,
  X,
  BadgeAlert,
  ChevronRight,
  Grid
} from 'lucide-react';
import { FormDrawer } from '../CommonComponents';

export const MODULE_DEFINITIONS = [
  {
    id: 'client-setup',
    name: 'Client Setup & Counterparties',
    shortName: 'Client Setup',
    icon: Users,
    description: 'Configure and tailor standard & custom fields for Suppliers, Buyers, and Contractors.',
    forms: [
      {
        id: 'suppliers',
        name: 'Suppliers (Quarries & Vendors)',
        tabs: ['Profile Details', 'Quarry & Mining Concession', 'Bank & Remittance', 'Terms & Delivery']
      },
      {
        id: 'buyers',
        name: 'Buyers & Clients',
        tabs: ['Profile & Tax', 'Shipping Addresses', 'Credit Terms & Limits', 'Quality Specs']
      },
      {
        id: 'contractors',
        name: 'Contractors & Labour Agencies',
        tabs: ['Agency Profile', 'Compliance & Licenses', 'Bank & Remittance', 'Rate Contracts']
      }
    ]
  },
  {
    id: 'inbound',
    name: 'Inventory & Inbound Operations',
    shortName: 'Inbound',
    icon: Box,
    description: 'Fields for Gate Pass, Weighbridge Slips, Raw Block Registries, and Storage Tags.',
    forms: [
      {
        id: 'gate-entry',
        name: 'Gate Pass & Vehicle Entry',
        tabs: ['Vehicle & Transporter', 'Consignment Info', 'Security Check']
      },
      {
        id: 'weighbridge',
        name: 'Weighbridge Ticket',
        tabs: ['Gross & Tare Weights', 'Moisture & Tare Deduction', 'Axle Calibration']
      },
      {
        id: 'raw-blocks',
        name: 'Raw Block Inward Registry',
        tabs: ['Block Geometry & Dimensions', 'Quarry Mine Tag', 'Physical Defects']
      },
      {
        id: 'storage-tags',
        name: 'Storage & Barcode Tagging',
        tabs: ['Barcode/QR Parameters', 'Bay Assignment', 'Packing Unit']
      }
    ]
  },
  {
    id: 'processing',
    name: 'Processing & Quality Control',
    shortName: 'Processing & QC',
    icon: Scissors,
    description: 'Tailor fields for Block Dressing, Gang Saw Slicing, Polishing, and QA Inspections.',
    forms: [
      {
        id: 'block-dressing',
        name: 'Block Dressing & Squaring',
        tabs: ['Wire Saw Parameters', 'Trim Losses', 'Surface Finish']
      },
      {
        id: 'gang-saw',
        name: 'Gang Saw Slicing Job',
        tabs: ['Blade Batch & Tension', 'Slicing Speed', 'Water Jet Cooling']
      },
      {
        id: 'qc1-inspection',
        name: 'QC-1 Block Inspection',
        tabs: ['Structural Crack Severity', 'Color Uniformity', 'Porosity Index']
      },
      {
        id: 'qc2-inspection',
        name: 'QC-2 Slab Inspection',
        tabs: ['Thickness Caliper', 'Gloss Level GU', 'Line Deviation']
      },
      {
        id: 'polishing',
        name: 'Polishing & Line Sizing',
        tabs: ['Abrasive Grit Progression', 'Epoxy Resin Treatment', 'Edge Chamfer']
      }
    ]
  },
  {
    id: 'yard',
    name: 'Yard & Spatial Management',
    shortName: 'Yard & Storage',
    icon: Layers,
    description: 'Attributes for Bay/Racks, Pallet Bundling, and Stock Relocations.',
    forms: [
      {
        id: 'bay-master',
        name: 'Bay & Rack Master',
        tabs: ['Zone Coordinates', 'Weight Capacity Limit', 'Crane Access Clearance']
      },
      {
        id: 'pallet-box',
        name: 'Pallet & Box Bundling',
        tabs: ['Crate Dimensions', 'Strapping Specs', 'Sea-Freight Fumigation']
      },
      {
        id: 'relocation',
        name: 'Inter-Bay Relocation Order',
        tabs: ['Movement Authorization', 'Forklift Operator', 'Safety Signoff']
      }
    ]
  },
  {
    id: 'sales',
    name: 'Sales, Invoicing & Dispatch',
    shortName: 'Sales & Dispatch',
    icon: Receipt,
    description: 'Commercial attributes for Sales Orders, Invoices, and Dispatch Slips.',
    forms: [
      {
        id: 'sales-order',
        name: 'Sales Order & Contract',
        tabs: ['Buyer Purchase Order', 'Commercial Currency', 'Delivery Incoterms']
      },
      {
        id: 'commercial-invoice',
        name: 'Commercial Invoice & Packing List',
        tabs: ['Tax HS Codes', 'Bank Remittance', 'Export Clearance']
      },
      {
        id: 'dispatch-slip',
        name: 'Dispatch & Loading Slip',
        tabs: ['Container Seal No.', 'Lashing & Chocking', 'Driver Signoff']
      }
    ]
  },
  {
    id: 'hr',
    name: 'HR & Workforce Management',
    shortName: 'HR & Workforce',
    icon: HardHat,
    description: 'Worker onboarding, statutory biometrics, and subcontractor worker passes.',
    forms: [
      {
        id: 'worker-onboarding',
        name: 'Worker & Staff Onboarding',
        tabs: ['Personal Details', 'Statutory PF/ESI/UAN', 'Safety Gear PPE']
      },
      {
        id: 'daily-shift',
        name: 'Daily Shift & Attendance Log',
        tabs: ['Biometric Verification', 'Hazard Allowance', 'Shift Roster']
      },
      {
        id: 'contractor-workers',
        name: 'Subcontractor Worker Pass',
        tabs: ['Agency Linkage', 'Skill Badge', 'Site Clearance']
      }
    ]
  }
];

// Complete catalog of ALL standard application fields used in Granite ERP across every tab
export const APPLICATION_STANDARD_FIELDS = [
  // --- CLIENT SETUP: SUPPLIERS ---
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'code',
    label: 'Supplier Code',
    type: 'text',
    required: true,
    placeholder: 'e.g. SUP-0001',
    helpText: 'Unique system identifier for the supplier / quarry vendor.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'name',
    label: 'Supplier / Quarry Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Monte Altissimo Quarry',
    helpText: 'Full legal name of the natural stone quarry or vendor.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'type',
    label: 'Supplier Type',
    type: 'select',
    options: ['Quarry', 'Mine', 'Material Vendor', 'Transporter', 'Other'],
    required: true,
    placeholder: 'Select supplier category',
    helpText: 'Classification determining mining or commercial handling.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'taxId',
    label: 'Tax ID / GSTIN',
    type: 'text',
    required: true,
    placeholder: 'e.g. 08AABCV1234F1Z5',
    helpText: 'Goods & Services Tax Identification Number or VAT Registration.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'pan',
    label: 'PAN Number',
    type: 'text',
    required: true,
    placeholder: 'e.g. AAACV1234F',
    helpText: 'Permanent Account Number for statutory withholding & tax reports.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'phone',
    label: 'Primary Phone',
    type: 'text',
    required: true,
    placeholder: 'e.g. +91 98290 11223',
    helpText: 'Direct line or dispatch communication contact.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'email',
    label: 'Official Email',
    type: 'text',
    required: false,
    placeholder: 'e.g. orders@altissimo.it',
    helpText: 'Accounts and purchase order delivery email.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'website',
    label: 'Corporate Website',
    type: 'text',
    required: false,
    placeholder: 'e.g. https://altissimo-quarries.it',
    helpText: 'Web address of the supplier.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'address',
    label: 'Street Address',
    type: 'text',
    required: false,
    placeholder: 'e.g. Via Altissimo, 45',
    helpText: 'Registered office or pit dispatch yard street address.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'city',
    label: 'City / District',
    type: 'text',
    required: false,
    placeholder: 'e.g. Seravezza',
    helpText: 'City of registered operations.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'state',
    label: 'State / Province',
    type: 'text',
    required: false,
    placeholder: 'e.g. Lucca / Rajasthan',
    helpText: 'State or geographical territory.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'country',
    label: 'Country',
    type: 'text',
    required: true,
    placeholder: 'e.g. Italy / India',
    helpText: 'Country of origin.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Profile Details',
    key: 'status',
    label: 'Supplier Status',
    type: 'select',
    options: ['Active', 'Inactive', 'Blocked'],
    required: true,
    placeholder: 'Select status',
    helpText: 'Determines whether POs and Gate Entries can be raised.',
    isStandard: true
  },
  // Suppliers Tab 2: Quarry & Mining Concession
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Quarry & Mining Concession',
    key: 'quarryName',
    label: 'Quarry / Mine Concession Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Monte Altissimo Quarry #4',
    helpText: 'Name of the specific quarry pit or natural deposit.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Quarry & Mining Concession',
    key: 'quarryLocation',
    label: 'GPS Coordinates / Location',
    type: 'text',
    required: false,
    placeholder: 'e.g. 44.0123 N, 10.2345 E',
    helpText: 'Geographical latitude and longitude of the quarry pit.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Quarry & Mining Concession',
    key: 'stoneTypesSupplied',
    label: 'Stone Varieties Extracted',
    type: 'text',
    required: false,
    placeholder: 'e.g. Black Galaxy, Tan Brown, Steel Grey',
    helpText: 'List of granite and marble colors supplied.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Quarry & Mining Concession',
    key: 'miningLeaseNo',
    label: 'Mining Lease Concession No',
    type: 'text',
    required: true,
    placeholder: 'e.g. ML-IT-2019-8812',
    helpText: 'Statutory government mining permit / concession registration.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Quarry & Mining Concession',
    key: 'leaseValidity',
    label: 'Lease Validity Date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
    helpText: 'Expiration date of the environmental & mining concession.',
    isStandard: true
  },
  // Suppliers Tab 3: Bank & Remittance
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Bank & Remittance',
    key: 'accountHolder',
    label: 'Beneficiary Account Holder',
    type: 'text',
    required: true,
    placeholder: 'e.g. Monte Altissimo S.p.A.',
    helpText: 'Legal name on the beneficiary bank account.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Bank & Remittance',
    key: 'bankName',
    label: 'Bank Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Intesa Sanpaolo / State Bank of India',
    helpText: 'Financial institution handling supplier settlement.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Bank & Remittance',
    key: 'accountNumber',
    label: 'Bank Account Number',
    type: 'text',
    required: true,
    placeholder: 'e.g. IT99A0123456789012345678901',
    helpText: 'Masked IBAN or account number.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Bank & Remittance',
    key: 'ifscSwift',
    label: 'IFSC / SWIFT BIC Code',
    type: 'text',
    required: true,
    placeholder: 'e.g. BCITITMM / SBIN0004122',
    helpText: 'Routing identifier for electronic bank transfer.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Bank & Remittance',
    key: 'branch',
    label: 'Branch Location',
    type: 'text',
    required: false,
    placeholder: 'e.g. Carrara Central',
    helpText: 'Branch city or code.',
    isStandard: true
  },
  // Suppliers Tab 4: Terms & Delivery
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'paymentDays',
    label: 'Payment Terms (Net Days)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    helpText: 'Agreed invoice credit maturity in calendar days.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'creditDays',
    label: 'Credit Days',
    type: 'number',
    required: false,
    placeholder: 'e.g. 30',
    helpText: 'Grace period before penal interest triggers.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'currency',
    label: 'Settlement Currency',
    type: 'select',
    options: ['INR', 'USD', 'EUR'],
    required: true,
    placeholder: 'Select currency',
    helpText: 'Base currency for purchase orders and billing.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'deliveryTerms',
    label: 'Incoterms Delivery Point',
    type: 'select',
    options: ['Ex-Quarry Gate', 'FOB Carrara Port', 'CIF Mundra Port', 'FOR Factory Yard', 'DDP Site'],
    required: true,
    placeholder: 'Select Incoterm',
    helpText: 'Freight and risk transfer location.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'weightTolerance',
    label: 'Weight Variance Tolerance (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2.0',
    helpText: 'Acceptable weighbridge discrepancy between quarry and gate.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'suppliers',
    tab: 'Terms & Delivery',
    key: 'rating',
    label: 'Overall Vendor Rating',
    type: 'select',
    options: ['A+', 'A', 'B+', 'B', 'C'],
    required: false,
    placeholder: 'Select grade',
    helpText: 'Composite vendor score derived from QC and delivery timeliness.',
    isStandard: true
  },

  // --- CLIENT SETUP: BUYERS ---
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'code',
    label: 'Buyer / Client Code',
    type: 'text',
    required: true,
    placeholder: 'e.g. BUY-0001',
    helpText: 'Unique ERP identifier for the buyer / customer.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'name',
    label: 'Buyer / Client Company Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Apex Builders Ltd',
    helpText: 'Full legal commercial entity name.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'type',
    label: 'Customer Category',
    type: 'select',
    options: ['Dealer', 'Contractor', 'Builder', 'Exporter', 'Retail', 'Other'],
    required: true,
    placeholder: 'Select customer type',
    helpText: 'Pricing and tax category mapping.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'taxId',
    label: 'Tax ID / GSTIN',
    type: 'text',
    required: false,
    placeholder: 'e.g. TX-8829102-B',
    helpText: 'GSTIN / VAT ID for GST invoice generation.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'pan',
    label: 'PAN Number',
    type: 'text',
    required: false,
    placeholder: 'e.g. AAACA9012D',
    helpText: 'Tax identification PAN.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'phone',
    label: 'Primary Phone',
    type: 'text',
    required: true,
    placeholder: 'e.g. +1-555-0192',
    helpText: 'Main telephone contact.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'email',
    label: 'Billing Email',
    type: 'text',
    required: false,
    placeholder: 'e.g. orders@apexbuilders.com',
    helpText: 'Email address for e-invoices and dispatches.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Profile & Tax',
    key: 'status',
    label: 'Customer Status',
    type: 'select',
    options: ['Active', 'Inactive', 'Blocked'],
    required: true,
    placeholder: 'Select status',
    helpText: 'Blocked clients cannot have dispatches created.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Credit Terms & Limits',
    key: 'creditLimit',
    label: 'Approved Credit Limit (₹)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 500000',
    helpText: 'Maximum permissible outstanding invoice balance.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Credit Terms & Limits',
    key: 'creditDays',
    label: 'Credit Terms (Days)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    helpText: 'Days allowed from dispatch invoice date.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Credit Terms & Limits',
    key: 'priceList',
    label: 'Assigned Price List',
    type: 'select',
    options: ['Standard Retail 2026', 'Commercial Wholesale', 'Export Slab 2026'],
    required: false,
    placeholder: 'Select price catalog',
    helpText: 'Default rate schedule automatically pulled into sales orders.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Quality Specs',
    key: 'thicknessToleranceMm',
    label: 'Thickness Tolerance (mm)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 1.0',
    helpText: 'Maximum acceptable caliper variance across slab corners.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'buyers',
    tab: 'Quality Specs',
    key: 'minGlossLevel',
    label: 'Minimum Gloss Level (GU)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 85',
    helpText: 'Minimum required 60 degree gloss unit reading.',
    isStandard: true
  },

  // --- CLIENT SETUP: CONTRACTORS ---
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Agency Profile',
    key: 'code',
    label: 'Contractor Code',
    type: 'text',
    required: true,
    placeholder: 'e.g. CON-0001',
    helpText: 'ERP reference code for labor subcontractor agency.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Agency Profile',
    key: 'companyName',
    label: 'Contractor Agency Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Makrana Cutting Works',
    helpText: 'Registered business name of the contracting crew.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Agency Profile',
    key: 'serviceType',
    label: 'Primary Trade / Service',
    type: 'select',
    options: ['Gang Saw Slicing', 'Block Squaring', 'Polishing & Line Sizing', 'Crate Packing', 'General Labour'],
    required: true,
    placeholder: 'Select specialized trade',
    helpText: 'Technical operational service executed by this team.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Agency Profile',
    key: 'contactPerson',
    label: 'Lead Supervisor / Contact',
    type: 'text',
    required: true,
    placeholder: 'e.g. Aslam Khan',
    helpText: 'Site supervisor responsible for headcount and roster.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Agency Profile',
    key: 'phone',
    label: 'Supervisor Phone',
    type: 'text',
    required: true,
    placeholder: 'e.g. +91 98290 55443',
    helpText: 'Direct phone number of supervisor.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Compliance & Licenses',
    key: 'pan',
    label: 'Contractor PAN',
    type: 'text',
    required: true,
    placeholder: 'e.g. AABCM4432G',
    helpText: 'PAN for statutory TDS 194C deduction.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Compliance & Licenses',
    key: 'labourLicenceNo',
    label: 'Contract Labour License No',
    type: 'text',
    required: true,
    placeholder: 'e.g. CL-RAJ-2024-9982',
    helpText: 'State labor department concession license.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Rate Contracts',
    key: 'billingBasis',
    label: 'Billing Metric Basis',
    type: 'select',
    options: ['Per Sq.Ft', 'Per Metric Ton', 'Per Day', 'Fixed Monthly'],
    required: true,
    placeholder: 'Select basis',
    helpText: 'Unit of measure used to calculate production payout.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Rate Contracts',
    key: 'ratePerUnit',
    label: 'Contract Rate (₹ / Unit)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 18.5',
    helpText: 'Contracted piece rate per unit produced.',
    isStandard: true
  },
  {
    moduleId: 'client-setup',
    formId: 'contractors',
    tab: 'Rate Contracts',
    key: 'paymentCycle',
    label: 'Settlement Disbursement Cycle',
    type: 'select',
    options: ['Weekly', 'Fortnightly', 'Monthly'],
    required: true,
    placeholder: 'Select cycle',
    helpText: 'Frequency of job sheet signoff and billing.',
    isStandard: true
  },

  // --- INBOUND / INVENTORY: GATE ENTRY ---
  {
    moduleId: 'inbound',
    formId: 'gate-entry',
    tab: 'Vehicle & Transporter',
    key: 'vehicleNumber',
    label: 'Truck / Trailer Plate No',
    type: 'text',
    required: true,
    placeholder: 'e.g. RJ-14-GA-9912',
    helpText: 'Registration plate number of the incoming heavy vehicle.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'gate-entry',
    tab: 'Vehicle & Transporter',
    key: 'driverName',
    label: 'Driver Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Vikram Singh',
    helpText: 'Full name on the commercial driving license.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'gate-entry',
    tab: 'Consignment Info',
    key: 'challanNo',
    label: 'Delivery Challan / Invoice No',
    type: 'text',
    required: true,
    placeholder: 'e.g. DC-9921',
    helpText: 'Physical transport dispatch slip number.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'gate-entry',
    tab: 'Consignment Info',
    key: 'declaredWeightTons',
    label: 'Declared Invoice Weight (Tons)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 28.5',
    helpText: 'Tonnage printed on quarry supplier challan.',
    isStandard: true
  },

  // --- INBOUND: WEIGHBRIDGE TICKET ---
  {
    moduleId: 'inbound',
    formId: 'weighbridge',
    tab: 'Gross & Tare Weights',
    key: 'grossWeightKg',
    label: 'Gross Weight (Kg)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 42350',
    helpText: 'Electronic scale loaded truck reading.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'weighbridge',
    tab: 'Gross & Tare Weights',
    key: 'tareWeightKg',
    label: 'Tare Weight (Kg)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 13800',
    helpText: 'Empty truck weight measured upon exit.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'weighbridge',
    tab: 'Moisture & Tare Deduction',
    key: 'moistureDeductionKg',
    label: 'Moisture & Mud Allowance (Kg)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 150',
    helpText: 'Water slurry deduction calibrated after rain.',
    isStandard: true
  },

  // --- INBOUND: RAW BLOCKS ---
  {
    moduleId: 'inbound',
    formId: 'raw-blocks',
    tab: 'Block Geometry & Dimensions',
    key: 'blockNumber',
    label: 'Raw Block Number',
    type: 'text',
    required: true,
    placeholder: 'e.g. BLK-2026-0042',
    helpText: 'Quarry or inward physical serial stencil number.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'raw-blocks',
    tab: 'Block Geometry & Dimensions',
    key: 'lengthCm',
    label: 'Length (cm)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 310',
    helpText: 'Longitudinal dimension measured tape-to-tape.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'raw-blocks',
    tab: 'Block Geometry & Dimensions',
    key: 'widthCm',
    label: 'Width / Height (cm)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 185',
    helpText: 'Vertical face dimension.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'raw-blocks',
    tab: 'Block Geometry & Dimensions',
    key: 'heightCm',
    label: 'Thickness / Depth (cm)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 175',
    helpText: 'Cross-sectional thickness.',
    isStandard: true
  },
  {
    moduleId: 'inbound',
    formId: 'raw-blocks',
    tab: 'Physical Defects',
    key: 'crackSeverity',
    label: 'Crack Severity Grade',
    type: 'select',
    options: ['Sound (No Cracks)', 'Hairline Surface (<2cm)', 'Open Structural Crack', 'Dressed Corner Split'],
    required: false,
    placeholder: 'Select crack condition',
    helpText: 'Ultrasonic or visual fracture classification.',
    isStandard: true
  },

  // --- PROCESSING: GANG SAW ---
  {
    moduleId: 'processing',
    formId: 'gang-saw',
    tab: 'Blade Batch & Tension',
    key: 'bladeCount',
    label: 'Number of Slicing Blades',
    type: 'number',
    required: true,
    placeholder: 'e.g. 80',
    helpText: 'Simultaneous diamond segment blades fitted in frame.',
    isStandard: true
  },
  {
    moduleId: 'processing',
    formId: 'gang-saw',
    tab: 'Blade Batch & Tension',
    key: 'hydraulicTensionPsi',
    label: 'Hydraulic Tension (Bar / PSI)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 180',
    helpText: 'Hydraulic tie rod tension on blade holder.',
    isStandard: true
  },
  {
    moduleId: 'processing',
    formId: 'gang-saw',
    tab: 'Slicing Speed',
    key: 'downfeedRateCmHr',
    label: 'Downfeed Speed (cm/hr)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 18.5',
    helpText: 'Frame descent speed through natural granite.',
    isStandard: true
  },

  // --- PROCESSING: QC-2 SLAB ---
  {
    moduleId: 'processing',
    formId: 'qc2-inspection',
    tab: 'Thickness Caliper',
    key: 'thicknessMm',
    label: 'Actual Thickness (mm)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 20.2',
    helpText: 'Micrometer caliper average across 4 corners.',
    isStandard: true
  },
  {
    moduleId: 'processing',
    formId: 'qc2-inspection',
    tab: 'Gloss Level GU',
    key: 'glossMeterGu',
    label: '60° Specular Gloss (GU)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 92.0',
    helpText: 'Standard ASTM gloss reading after polishing.',
    isStandard: true
  },

  // --- YARD & STORAGE ---
  {
    moduleId: 'yard',
    formId: 'bay-master',
    tab: 'Zone Coordinates',
    key: 'bayCode',
    label: 'Storage Bay Code',
    type: 'text',
    required: true,
    placeholder: 'e.g. BAY-A-04',
    helpText: 'Unique yard grid identifier.',
    isStandard: true
  },
  {
    moduleId: 'yard',
    formId: 'bay-master',
    tab: 'Weight Capacity Limit',
    key: 'maxTonsCapacity',
    label: 'Max Structural Load (Tons)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 250',
    helpText: 'Reinforced concrete apron load limit.',
    isStandard: true
  },

  // --- SALES: SALES ORDER ---
  {
    moduleId: 'sales',
    formId: 'sales-order',
    tab: 'Buyer Purchase Order',
    key: 'buyerPoNo',
    label: 'Buyer PO Reference Number',
    type: 'text',
    required: true,
    placeholder: 'e.g. PO-APEX-9921',
    helpText: 'Client official purchase order number.',
    isStandard: true
  },
  {
    moduleId: 'sales',
    formId: 'sales-order',
    tab: 'Commercial Currency',
    key: 'salesCurrency',
    label: 'Contract Currency',
    type: 'select',
    options: ['INR', 'USD', 'EUR'],
    required: true,
    placeholder: 'Select currency',
    helpText: 'Billing forex denomination.',
    isStandard: true
  },

  // --- HR: WORKER ONBOARDING ---
  {
    moduleId: 'hr',
    formId: 'worker-onboarding',
    tab: 'Personal Details',
    key: 'workerName',
    label: 'Worker Full Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ramesh Patel',
    helpText: 'Official identity as per Aadhaar / Government ID.',
    isStandard: true
  },
  {
    moduleId: 'hr',
    formId: 'worker-onboarding',
    tab: 'Statutory PF/ESI/UAN',
    key: 'aadhaarNo',
    label: 'Aadhaar / National ID',
    type: 'text',
    required: true,
    placeholder: 'e.g. 1234 5678 9012',
    helpText: 'Biometric identification number for statutory verification.',
    isStandard: true
  }
];

export function CustomFieldsBuilder() {
  const { customFields, addCustomField, updateCustomField, deleteCustomField, showToast, t } = useApp();

  // Selected Module & Form State
  const [selectedModuleId, setSelectedModuleId] = useState('client-setup');
  const [selectedFormId, setSelectedFormId] = useState('suppliers');
  const [selectedTab, setSelectedTab] = useState('Profile Details');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('All'); // 'All' | 'Standard' | 'Custom'

  // Drawer state for adding / editing field
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Field Form State
  const [formState, setFormState] = useState({
    label: '',
    key: '',
    type: 'text',
    optionsStr: '',
    placeholder: '',
    defaultValue: '',
    helpText: '',
    tab: '',
    required: false,
    status: 'Active',
    isStandard: false
  });

  const activeModule = useMemo(() => {
    return MODULE_DEFINITIONS.find(m => m.id === selectedModuleId) || MODULE_DEFINITIONS[0];
  }, [selectedModuleId]);

  const activeForm = useMemo(() => {
    return activeModule.forms.find(f => f.id === selectedFormId) || activeModule.forms[0];
  }, [activeModule, selectedFormId]);

  // When switching module, ensure activeForm and selectedTab are valid
  const handleSelectModule = (modId) => {
    setSelectedModuleId(modId);
    const mod = MODULE_DEFINITIONS.find(m => m.id === modId);
    if (mod && mod.forms.length > 0) {
      setSelectedFormId(mod.forms[0].id);
      setSelectedTab(mod.forms[0].tabs[0] || 'General');
    }
  };

  const handleSelectForm = (fId) => {
    setSelectedFormId(fId);
    const form = activeModule.forms.find(f => f.id === fId);
    if (form && form.tabs.length > 0) {
      setSelectedTab(form.tabs[0]);
    }
  };

  // Compile full list of ALL fields used in the application for this Form & Tab
  // (Merges Standard Built-in Fields + Custom Fields + Overrides)
  const allFormFields = useMemo(() => {
    // 1. Get standard built-in fields for this module & form
    const standardMatches = APPLICATION_STANDARD_FIELDS.filter(f => {
      const matchMod = f.moduleId === selectedModuleId;
      const matchForm = f.formId === selectedFormId;
      const matchTab = !selectedTab || f.tab === selectedTab;
      return matchMod && matchForm && matchTab;
    });

    // 2. Get user custom fields and overrides stored in customFields
    const customMatches = (customFields || []).filter(f => {
      const matchMod = f.moduleId === selectedModuleId ||
        (selectedModuleId === 'client-setup' && (!f.moduleId || ['Supplier', 'Buyer', 'Contractor'].includes(f.entity)));
      
      let matchForm = true;
      if (f.formId) {
        matchForm = f.formId === selectedFormId;
      } else if (f.entity) {
        if (selectedFormId === 'suppliers') matchForm = f.entity.toLowerCase() === 'supplier';
        if (selectedFormId === 'buyers') matchForm = f.entity.toLowerCase() === 'buyer';
        if (selectedFormId === 'contractors') matchForm = f.entity.toLowerCase() === 'contractor';
      }

      const matchTab = !selectedTab || !f.tab || f.tab === selectedTab;
      return matchMod && matchForm && matchTab;
    });

    // 3. Map standard fields, applying any custom overrides stored in customFields
    const standardMerged = standardMatches.map(std => {
      const override = customMatches.find(c => c.key === std.key || c.id === `STD-${std.formId}-${std.key}`);
      if (override) {
        return {
          ...std,
          ...override,
          isStandard: true,
          isOverridden: true
        };
      }
      return {
        ...std,
        id: `STD-${std.formId}-${std.key}`,
        status: 'Active',
        isStandard: true,
        isOverridden: false
      };
    });

    // 4. Pure custom fields (those not matching a standard field key)
    const pureCustom = customMatches.filter(c => {
      return !standardMatches.some(std => std.key === c.key || c.id === `STD-${std.formId}-${std.key}`);
    }).map(c => ({
      ...c,
      isStandard: false
    }));

    const combined = [...standardMerged, ...pureCustom];

    // Filter by Scope & Search Query
    return combined.filter(f => {
      if (scopeFilter === 'Standard' && !f.isStandard) return false;
      if (scopeFilter === 'Custom' && f.isStandard) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const label = (f.label || f.name || '').toLowerCase();
        const key = (f.key || '').toLowerCase();
        const help = (f.helpText || '').toLowerCase();
        return label.includes(q) || key.includes(q) || help.includes(q);
      }
      return true;
    });
  }, [selectedModuleId, selectedFormId, selectedTab, customFields, scopeFilter, searchQuery]);

  // Count fields per module for indicator badges
  const moduleFieldCounts = useMemo(() => {
    const counts = {};
    MODULE_DEFINITIONS.forEach(m => {
      const stdCount = APPLICATION_STANDARD_FIELDS.filter(f => f.moduleId === m.id).length;
      const customCount = (customFields || []).filter(f => {
        return f.moduleId === m.id || (m.id === 'client-setup' && (!f.moduleId || ['Supplier', 'Buyer', 'Contractor'].includes(f.entity)));
      }).length;
      counts[m.id] = stdCount + customCount;
    });
    return counts;
  }, [customFields]);

  // Open Drawer to Add New Custom Field
  const handleOpenAdd = () => {
    setEditingField(null);
    setFormState({
      label: '',
      key: '',
      type: 'text',
      optionsStr: '',
      placeholder: '',
      defaultValue: '',
      helpText: '',
      tab: selectedTab,
      required: false,
      status: 'Active',
      isStandard: false
    });
    setIsDrawerOpen(true);
  };

  // Open Drawer to Edit Any Field (Standard or Custom)
  const handleOpenEdit = (field) => {
    setEditingField(field);
    setFormState({
      label: field.label || field.name || '',
      key: field.key || '',
      type: field.type || 'text',
      optionsStr: Array.isArray(field.options) ? field.options.join(', ') : '',
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue || '',
      helpText: field.helpText || '',
      tab: field.tab || selectedTab,
      required: !!field.required,
      status: field.status || 'Active',
      isStandard: !!field.isStandard
    });
    setIsDrawerOpen(true);
  };

  // Auto-slugify key when typing label for custom fields
  const handleLabelChange = (val) => {
    setFormState(prev => {
      const updates = { label: val };
      if (!editingField || !editingField.isStandard) {
        if (!editingField) {
          updates.key = val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        }
      }
      return { ...prev, ...updates };
    });
  };

  // Save changes to field
  const handleSaveField = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formState.label.trim()) {
      alert('Please enter a field label.');
      return;
    }

    const fieldKey = (formState.key.trim() || formState.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    const optionsArray = formState.type === 'select'
      ? formState.optionsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (editingField) {
      if (editingField.isStandard) {
        // Standard Field Override: Check if already stored, else add as standard override
        const existingOverride = (customFields || []).find(c => c.key === editingField.key || c.id === editingField.id);
        if (existingOverride) {
          updateCustomField(existingOverride.id, {
            label: formState.label.trim(),
            name: formState.label.trim(),
            placeholder: formState.placeholder.trim(),
            helpText: formState.helpText.trim(),
            required: formState.required,
            status: formState.status,
            options: optionsArray,
            isStandard: true
          });
        } else {
          addCustomField({
            id: `STD-${selectedFormId}-${editingField.key}`,
            moduleId: selectedModuleId,
            formId: selectedFormId,
            tab: formState.tab || selectedTab,
            key: editingField.key,
            label: formState.label.trim(),
            name: formState.label.trim(),
            type: formState.type,
            options: optionsArray,
            placeholder: formState.placeholder.trim(),
            helpText: formState.helpText.trim(),
            required: formState.required,
            status: formState.status,
            isStandard: true
          });
        }
        showToast(`Standard field "${formState.label.trim()}" customized!`, 'success');
      } else {
        // Pure Custom Field Update
        updateCustomField(editingField.id, {
          label: formState.label.trim(),
          name: formState.label.trim(),
          key: fieldKey,
          type: formState.type,
          options: optionsArray,
          placeholder: formState.placeholder.trim(),
          defaultValue: formState.defaultValue,
          helpText: formState.helpText.trim(),
          tab: formState.tab || selectedTab,
          required: formState.required,
          status: formState.status
        });
      }
    } else {
      // Add Brand New Custom Field
      addCustomField({
        moduleId: selectedModuleId,
        formId: selectedFormId,
        tab: formState.tab || selectedTab,
        entity: selectedFormId === 'suppliers' ? 'Supplier' : selectedFormId === 'buyers' ? 'Buyer' : selectedFormId === 'contractors' ? 'Contractor' : activeForm.name,
        label: formState.label.trim(),
        name: formState.label.trim(),
        key: fieldKey,
        type: formState.type,
        options: optionsArray,
        placeholder: formState.placeholder.trim(),
        defaultValue: formState.defaultValue,
        helpText: formState.helpText.trim(),
        required: formState.required,
        status: formState.status,
        isStandard: false
      });
    }

    setIsDrawerOpen(false);
  };

  // Toggle active/inactive
  const handleToggleStatus = (field) => {
    const nextStatus = field.status === 'Inactive' ? 'Active' : 'Inactive';
    if (field.isStandard) {
      const existingOverride = (customFields || []).find(c => c.key === field.key || c.id === field.id);
      if (existingOverride) {
        updateCustomField(existingOverride.id, { status: nextStatus });
      } else {
        addCustomField({
          id: `STD-${selectedFormId}-${field.key}`,
          moduleId: selectedModuleId,
          formId: selectedFormId,
          tab: field.tab || selectedTab,
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required,
          status: nextStatus,
          isStandard: true
        });
      }
    } else {
      updateCustomField(field.id, { status: nextStatus });
    }
  };

  // Reset standard field to system default
  const handleResetStandard = (field) => {
    const existingOverride = (customFields || []).find(c => c.key === field.key || c.id === field.id);
    if (existingOverride) {
      deleteCustomField(existingOverride.id);
      showToast(`Field "${field.label}" reset to default system parameters.`, 'info');
    }
  };

  // Delete pure custom field
  const handleDeleteField = (field) => {
    if (window.confirm(`Are you sure you want to delete the custom field "${field.label || field.name}"?`)) {
      deleteCustomField(field.id);
    }
  };

  // Type badge helper
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'number':
        return <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Hash size={11} /> Number</span>;
      case 'select':
        return <span className="badge badge-cobalt" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><List size={11} /> Dropdown</span>;
      case 'date':
        return <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} /> Date</span>;
      case 'checkbox':
        return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckSquare size={11} /> Boolean</span>;
      case 'file':
        return <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Upload size={11} /> File</span>;
      case 'textarea':
        return <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><FileText size={11} /> Textarea</span>;
      default:
        return <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Type size={11} /> Text</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)',
        borderRadius: '12px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sliders size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>
                {t('Custom Fields & Master Attributes Builder')}
              </h2>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
                {t('Browse all application fields across all modules and tabs. Customize labels, validation, visibility, or create new fields.')}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* MODULE SELECTOR (6 Core ERP Modules) */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          1. Select ERP Module:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          {MODULE_DEFINITIONS.map(mod => {
            const Icon = mod.icon;
            const isSelected = selectedModuleId === mod.id;
            const count = moduleFieldCounts[mod.id] || 0;
            return (
              <div
                key={mod.id}
                onClick={() => handleSelectModule(mod.id)}
                style={{
                  backgroundColor: isSelected ? 'var(--white)' : 'var(--surface-sunken)',
                  border: isSelected ? '2px solid var(--brand-color)' : '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'var(--brand-surface, #EEF2F6)' : 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--brand-color)' : 'var(--muted)'
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? 'var(--ink)' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {mod.shortName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    {count} Total Fields
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FORM AND ALL TAB PAGES SELECTOR */}
      <div className="table-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Target Form Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              2. Module Form:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {activeModule.forms.map(form => (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => handleSelectForm(form.id)}
                  className={`btn btn-sm ${selectedFormId === form.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '12px', fontWeight: selectedFormId === form.id ? 700 : 500 }}
                >
                  {form.name}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Filter & Search */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="form-select"
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value)}
              style={{ width: '130px', fontSize: '12px', height: '32px' }}
            >
              <option value="All">All Fields</option>
              <option value="Standard">Standard Only</option>
              <option value="Custom">Custom Only</option>
            </select>

            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search label, key..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '12px', height: '32px' }}
              />
            </div>
          </div>
        </div>

        {/* ALL TAB PAGES FOR THIS FORM */}
        <div style={{
          display: 'flex',
          gap: '6px',
          borderTop: '1px solid var(--line)',
          paddingTop: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginRight: '6px' }}>
            3. Tab Pages:
          </span>
          {activeForm.tabs.map(tab => {
            const isTabActive = selectedTab === tab;
            // Count total fields in this specific tab
            const tabStdCount = APPLICATION_STANDARD_FIELDS.filter(f => f.moduleId === selectedModuleId && f.formId === selectedFormId && f.tab === tab).length;
            const tabCustCount = (customFields || []).filter(f => {
              const matchMod = f.moduleId === selectedModuleId || (selectedModuleId === 'client-setup' && (!f.moduleId || ['Supplier', 'Buyer', 'Contractor'].includes(f.entity)));
              let matchForm = f.formId === selectedFormId;
              if (!f.formId && f.entity) {
                if (selectedFormId === 'suppliers') matchForm = f.entity.toLowerCase() === 'supplier';
                if (selectedFormId === 'buyers') matchForm = f.entity.toLowerCase() === 'buyer';
                if (selectedFormId === 'contractors') matchForm = f.entity.toLowerCase() === 'contractor';
              }
              return matchMod && matchForm && f.tab === tab;
            }).length;
            const totalTabFields = tabStdCount + tabCustCount;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                style={{
                  border: isTabActive ? '1px solid var(--brand-color)' : '1px solid var(--line)',
                  backgroundColor: isTabActive ? 'var(--brand-surface, #EEF2F6)' : 'var(--white)',
                  color: isTabActive ? 'var(--brand-color)' : 'var(--ink)',
                  fontWeight: isTabActive ? 700 : 500,
                  fontSize: '12px',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab}</span>
                <span style={{
                  backgroundColor: isTabActive ? 'var(--brand-color)' : 'var(--surface-sunken)',
                  color: isTabActive ? '#fff' : 'var(--muted)',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  {totalTabFields}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: COMPLETE FIELDS LIST + LIVE INTERACTIVE PREVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: COMPLETE FIELDS LIST */}
        <div className="table-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--white)'
          }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                Field Catalog: {activeForm.name} &gt; {selectedTab} ({allFormFields.length})
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                All application fields used on this tab. Click <strong>Edit</strong> on any field to modify labels or rules.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleOpenAdd}
              style={{ fontSize: '12px' }}
            >
              <Plus size={13} />
              <span>Add Custom Field</span>
            </button>
          </div>

          {allFormFields.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <Sliders size={24} color="var(--muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                No fields match your filter for this tab.
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAdd}
                style={{ marginTop: '12px' }}
              >
                <Plus size={13} />
                <span>Create New Field</span>
              </button>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field Label & Key</th>
                    <th>Scope</th>
                    <th>Type</th>
                    <th>Mandatory</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allFormFields.map(field => {
                    const isInactive = field.status === 'Inactive';
                    return (
                      <tr key={field.id} style={{ opacity: isInactive ? 0.6 : 1 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>
                              {field.label || field.name}
                            </span>
                            {field.isOverridden && (
                              <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                Modified
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                            {field.key}
                          </div>
                          {field.helpText && (
                            <div style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic', marginTop: '2px', maxWidth: '300px' }}>
                              {field.helpText}
                            </div>
                          )}
                        </td>
                        <td>
                          {field.isStandard ? (
                            <span className="badge badge-subtle" style={{ fontSize: '10px' }}>
                              Standard System
                            </span>
                          ) : (
                            <span className="badge badge-cobalt" style={{ fontSize: '10px' }}>
                              Custom Field
                            </span>
                          )}
                        </td>
                        <td>{renderTypeBadge(field.type)}</td>
                        <td>
                          {field.required ? (
                            <span className="badge badge-rose" style={{ fontSize: '10px' }}>Required</span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Optional</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(field)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Click to toggle Active/Inactive"
                          >
                            {field.status === 'Inactive' ? (
                              <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <XCircle size={10} /> Inactive
                              </span>
                            ) : (
                              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={10} /> Active
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleOpenEdit(field)}
                              title="Edit Field Label & Parameters"
                              style={{ padding: '4px 6px', color: 'var(--brand-color)' }}
                            >
                              <Edit2 size={14} />
                            </button>

                            {field.isStandard ? (
                              field.isOverridden && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => handleResetStandard(field)}
                                  title="Reset to Original Default"
                                  style={{ padding: '4px 6px', color: 'var(--muted)' }}
                                >
                                  <RotateCcw size={13} />
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleDeleteField(field)}
                                title="Delete Custom Field"
                                style={{ padding: '4px 6px', color: 'var(--ruby-text)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE TAB FORM PREVIEW */}
        <div className="table-card" style={{ padding: '20px', border: '1px solid var(--line)', background: 'var(--white)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="var(--brand-color)" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                Live Form Tab Preview
              </h3>
            </div>
            <span className="badge badge-subtle" style={{ fontSize: '10px' }}>
              Live UI Sandbox
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
            Interactive preview of <strong>{activeForm.name}</strong> • <strong>{selectedTab}</strong> with your customized labels:
          </div>

          {/* Form sandbox container */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px',
            border: '1px dashed var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: '680px',
            overflowY: 'auto'
          }}>
            {allFormFields.filter(f => f.status !== 'Inactive').map(field => {
              return (
                <div key={field.id} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {field.label || field.name} {field.required && <span style={{ color: 'var(--ruby-text)' }}>*</span>}
                    </span>
                    <span style={{ fontSize: '10px', color: field.isStandard ? 'var(--muted)' : 'var(--brand-color)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                      [{field.isStandard ? 'Standard' : 'Custom'}: {field.key}]
                    </span>
                  </label>

                  {field.type === 'select' ? (
                    <select className="form-select" style={{ fontSize: '12px', backgroundColor: 'var(--white)' }}>
                      <option value="">{field.placeholder || `Select ${field.label}...`}</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                      <input type="checkbox" id={`preview-${field.id}`} style={{ cursor: 'pointer' }} />
                      <label htmlFor={`preview-${field.id}`} style={{ fontSize: '12px', cursor: 'pointer', margin: 0 }}>
                        {field.placeholder || 'Enable / Check this option'}
                      </label>
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      style={{ fontSize: '12px', backgroundColor: 'var(--white)' }}
                    />
                  ) : field.type === 'file' ? (
                    <div style={{
                      border: '1px dashed var(--brand-color)',
                      borderRadius: '6px',
                      padding: '10px',
                      backgroundColor: 'var(--white)',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: 'var(--brand-color)',
                      cursor: 'pointer'
                    }}>
                      <Upload size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                      <span>Upload Document</span>
                    </div>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      className="form-input"
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      style={{ fontSize: '12px', backgroundColor: 'var(--white)' }}
                    />
                  )}

                  {field.helpText && (
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                      {field.helpText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EDIT / ADD FIELD DRAWER */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingField ? (editingField.isStandard ? `Edit Standard Field: ${editingField.label}` : `Edit Custom Field: ${editingField.label}`) : `Add Custom Field to ${activeForm.name}`}
        onSubmit={handleSaveField}
        submitLabel={editingField ? 'Save Field Changes' : 'Create Field'}
        confirmSubmit={true}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--brand-surface, #EEF2F6)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--brand-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sliders size={16} />
            <span>Targeting <strong>{activeModule.shortName}</strong> &gt; <strong>{activeForm.name}</strong> &gt; <strong>{selectedTab}</strong></span>
          </div>

          {/* Field Label */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
              Field Label *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Geological Vein Grade"
              value={formState.label}
              onChange={e => handleLabelChange(e.target.value)}
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              The title displayed to users across forms and table columns.
            </div>
          </div>

          {/* Database Key */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
              Database Key / Identifier {formState.isStandard ? '(Standard System Key)' : '*'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. geological_vein_grade"
              value={formState.key}
              disabled={formState.isStandard}
              onChange={e => setFormState(prev => ({ ...prev, key: e.target.value }))}
              style={{ fontFamily: 'var(--font-mono)', opacity: formState.isStandard ? 0.7 : 1 }}
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
              {formState.isStandard ? 'Standard field identifiers cannot be renamed.' : 'Unique database identifier.'}
            </div>
          </div>

          {/* Field Type and Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Field Type</label>
              <select
                className="form-select"
                value={formState.type}
                disabled={formState.isStandard}
                onChange={e => setFormState(prev => ({ ...prev, type: e.target.value }))}
                style={{ opacity: formState.isStandard ? 0.7 : 1 }}
              >
                <option value="text">Single-line Text</option>
                <option value="textarea">Multi-line Textarea</option>
                <option value="number">Numeric / Decimal</option>
                <option value="select">Dropdown / Single Select</option>
                <option value="date">Date Picker</option>
                <option value="checkbox">Checkbox / Boolean</option>
                <option value="file">File / Document Upload</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Target Section / Tab</label>
              <select
                className="form-select"
                value={formState.tab || selectedTab}
                onChange={e => setFormState(prev => ({ ...prev, tab: e.target.value }))}
              >
                {activeForm.tabs.map(tab => (
                  <option key={tab} value={tab}>{tab}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropdown Options */}
          {formState.type === 'select' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
                Dropdown Options (Comma-Separated)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Option 1, Option 2, Option 3"
                value={formState.optionsStr}
                onChange={e => setFormState(prev => ({ ...prev, optionsStr: e.target.value }))}
              />
            </div>
          )}

          {/* Placeholder */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
              Placeholder / Hint Text
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Enter value..."
              value={formState.placeholder}
              onChange={e => setFormState(prev => ({ ...prev, placeholder: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>
              Description / Tooltip
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Operator guidance"
              value={formState.helpText}
              onChange={e => setFormState(prev => ({ ...prev, helpText: e.target.value }))}
            />
          </div>

          {/* Toggles */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Mandatory Field</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Prevent saving if left blank</div>
            </div>
            <input
              type="checkbox"
              checked={formState.required}
              onChange={e => setFormState(prev => ({ ...prev, required: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 14px',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status: Active / Visible</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Inactive fields are hidden from operators</div>
            </div>
            <input
              type="checkbox"
              checked={formState.status === 'Active'}
              onChange={e => setFormState(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}
