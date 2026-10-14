// Comprehensive Realistic Mock Data for Granite/Marble ERP
// Multi-Client Architecture: QT Super Admin onboards clients, each client runs its own business.

export const initialClients = [
  {
    id: 'CLI-001',
    name: 'Vengo Granites',
    type: 'Supplier',
    taxId: 'IT-089234101',
    address: 'Via Carriona 42, 54033 Carrara, Italy',
    contactPerson: 'Rajesh Sharma',
    phone: '+91-98290-23450',
    email: 'rajesh@vengogranites.com',
    logo: '/vengo-logo.svg',
    brandColor: '#222350',
    modules: ['inventory', 'purchase', 'receipts', 'sales', 'accounts', 'returns', 'reports', 'hr'],
    adminName: 'Rajesh Sharma',
    adminEmail: 'rajesh@vengogranites.com',
    plan: 'Enterprise',
    validity: '2028-12-31',
    status: 'Active',
    limits: { users: 25, employees: 100, yards: 5, modules: 10 },
    settings: {
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Europe/Rome (UTC+1)',
      language: 'English',
      currency: 'USD',
      areaUnit: 'Sq.Ft',
      weightUnit: 'Tons',
      taxRate: 18,
      dailyOvertimeCapHours: 4,
      overtimeMultiplier: 1.5,
      weightVarianceToleranceKg: 200,
      docPrefixes: { pr: 'PR', po: 'PO', grn: 'GRN', inv: 'INV', dc: 'DC' }
    }
  },
  {
    id: 'CLI-002',
    name: 'Rajasthan Black Quarries',
    type: 'Supplier',
    taxId: 'IN-08AABCR1234F1Z5',
    address: 'Plot 14, RIICO Industrial Area, Kishangarh, Rajasthan, India',
    contactPerson: 'Vikram Singhania',
    phone: '+91-141-8976210',
    email: 'vikram@rajgranite.in',
    logo: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=100&auto=format&fit=crop&q=80',
    brandColor: '#ffab00',
    modules: ['inventory', 'purchase', 'receipts', 'sales', 'accounts', 'returns', 'reports', 'hr'],
    adminName: 'Vikram Singhania',
    adminEmail: 'vikram@rajgranite.in',
    plan: 'Professional',
    validity: '2027-06-30',
    status: 'Active',
    limits: { users: 15, employees: 50, yards: 3, modules: 8 },
    settings: {
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Asia/Kolkata (UTC+5:30)',
      language: 'English',
      currency: 'USD',
      areaUnit: 'Sq.Ft',
      weightUnit: 'Tons',
      taxRate: 18,
      dailyOvertimeCapHours: 3,
      overtimeMultiplier: 1.5,
      weightVarianceToleranceKg: 150,
      docPrefixes: { pr: 'PR', po: 'PO', grn: 'GRN', inv: 'INV', dc: 'DC' }
    }
  }
];

export const initialPlans = [
  { id: 'PLAN-01', name: 'Starter', price: 299, maxUsers: 5, maxEmployees: 20, maxYards: 1, maxModules: 5, status: 'Active' },
  { id: 'PLAN-02', name: 'Professional', price: 699, maxUsers: 15, maxEmployees: 50, maxYards: 3, maxModules: 8, status: 'Active' },
  { id: 'PLAN-03', name: 'Enterprise', price: 1499, maxUsers: 50, maxEmployees: 200, maxYards: 10, maxModules: 12, status: 'Active' }
];

export const initialCustomers = [
  { id: 'CUST-001', clientId: 'CLI-001', name: 'Apex Builders Ltd', contact: '+1-555-0192', email: 'orders@apexbuilders.com', city: 'Dallas', country: 'USA', creditLimit: 250000, balance: 142000, paymentTerms: 'Net 30', isBlocked: false, status: 'Active' },
  { id: 'CUST-002', clientId: 'CLI-001', name: 'Royal Marvel Infra', contact: '+1-555-0143', email: 'accounts@royalmarvel.com', city: 'Houston', country: 'USA', creditLimit: 100000, balance: 108500, paymentTerms: 'Net 15', isBlocked: true, status: 'Blocked' },
  { id: 'CUST-003', clientId: 'CLI-001', name: 'Prestige Stone Studio', contact: '+1-555-0821', email: 'purchasing@prestigestone.com', city: 'Denver', country: 'USA', creditLimit: 500000, balance: 220000, paymentTerms: 'Net 30', isBlocked: false, status: 'Active' },
  { id: 'CUST-004', clientId: 'CLI-002', name: 'Crown Flooring Co', contact: '+1-555-0774', email: 'supply@crownflooring.com', city: 'Phoenix', country: 'USA', creditLimit: 80000, balance: 45000, paymentTerms: 'Advance', isBlocked: false, status: 'Active' }
];

export const initialSuppliers = [
  { id: 'SUP-001', clientId: 'CLI-001', name: 'Monte Altissimo Quarry', contact: '+39-0585-8812', email: 'quarry@altissimo.it', city: 'Seravezza', country: 'Italy', materialType: 'Marble', paymentTerms: 'Net 30', rating: 'A', status: 'Active' },
  { id: 'SUP-002', clientId: 'CLI-001', name: 'Apuana Extraction Consortium', contact: '+39-0585-7731', email: 'sales@apuana.it', city: 'Massa', country: 'Italy', materialType: 'Marble', paymentTerms: 'Net 15', rating: 'A+', status: 'Active' },
  { id: 'SUP-003', clientId: 'CLI-002', name: 'Makrana Marble Miners', contact: '+91-141-2288', email: 'mines@makrana.in', city: 'Makrana', country: 'India', materialType: 'Marble', paymentTerms: 'Net 30', rating: 'B+', status: 'Active' },
  { id: 'SUP-004', clientId: 'CLI-002', name: 'Warangal Black Granite Co', contact: '+91-870-2441', email: 'blocks@warangal.in', city: 'Warangal', country: 'India', materialType: 'Granite', paymentTerms: 'Net 15', rating: 'A', status: 'Active' }
];

export const initialStoneTypes = [
  { id: 'ST-001', clientId: 'CLI-001', code: 'BLK-GAL', name: 'Black Galaxy Granite', category: 'Granite', baseRateSqFt: 65, densityKgM3: 2900, minStockSqFt: 1500 },
  { id: 'ST-002', clientId: 'CLI-001', code: 'CAR-WHT', name: 'Carrara White Marble', category: 'Marble', baseRateSqFt: 110, densityKgM3: 2700, minStockSqFt: 2000 },
  { id: 'ST-003', clientId: 'CLI-001', code: 'STA-GLD', name: 'Statuario Gold Quartzite', category: 'Quartzite', baseRateSqFt: 185, densityKgM3: 2650, minStockSqFt: 1000 },
  { id: 'ST-004', clientId: 'CLI-002', code: 'TAN-BRN', name: 'Tan Brown Granite', category: 'Granite', baseRateSqFt: 45, densityKgM3: 2800, minStockSqFt: 2500 },
  { id: 'ST-005', clientId: 'CLI-002', code: 'KAS-WHT', name: 'Kashmir White Granite', category: 'Granite', baseRateSqFt: 55, densityKgM3: 2750, minStockSqFt: 1800 }
];

export const initialRateLists = [
  { id: 'RL-001', clientId: 'CLI-001', name: 'Export Luxury Carrara', stoneCode: 'CAR-WHT', grade: 'Grade A', rateSqFt: 110, effectiveFrom: '2026-01-01' },
  { id: 'RL-002', clientId: 'CLI-001', name: 'Standard Commercial 2026', stoneCode: 'BLK-GAL', grade: 'Premium', rateSqFt: 65, effectiveFrom: '2026-01-01' },
  { id: 'RL-003', clientId: 'CLI-001', name: 'High-End Architectural', stoneCode: 'STA-GLD', grade: 'Super Select', rateSqFt: 185, effectiveFrom: '2026-03-01' },
  { id: 'RL-004', clientId: 'CLI-002', name: 'Domestic Infrastructure', stoneCode: 'TAN-BRN', grade: 'Commercial', rateSqFt: 45, effectiveFrom: '2026-02-15' }
];

export const initialYardLocations = [
  { id: 'LOC-A1', clientId: 'CLI-001', zone: 'Zone A', bay: 'Bay 01', type: 'Raw Blocks', capacityTonnes: 500, currentStock: 320 },
  { id: 'LOC-A2', clientId: 'CLI-001', zone: 'Zone A', bay: 'Bay 02', type: 'Raw Blocks', capacityTonnes: 500, currentStock: 280 },
  { id: 'LOC-B1', clientId: 'CLI-001', zone: 'Zone B', bay: 'Gangsaw 01', type: 'Sawing', capacityTonnes: 300, currentStock: 140 },
  { id: 'LOC-C1', clientId: 'CLI-001', zone: 'Zone C', bay: 'A-Frame 01', type: 'Slab Bundles', capacityTonnes: 200, currentStock: 180 },
  { id: 'LOC-C2', clientId: 'CLI-001', zone: 'Zone C', bay: 'A-Frame 02', type: 'Slab Bundles', capacityTonnes: 200, currentStock: 165 },
  { id: 'LOC-D1', clientId: 'CLI-001', zone: 'Zone D', bay: 'Bay 99', type: 'Defect Store', capacityTonnes: 150, currentStock: 45 },
  { id: 'LOC-RJ1', clientId: 'CLI-002', zone: 'Zone North', bay: 'Bay 10', type: 'Raw Blocks', capacityTonnes: 600, currentStock: 390 },
  { id: 'LOC-RJ2', clientId: 'CLI-002', zone: 'Zone South', bay: 'A-Frame 05', type: 'Slab Bundles', capacityTonnes: 250, currentStock: 120 }
];

export const initialUsers = [
  { id: 'USR-001', clientId: null, name: 'Aditya Varma', email: 'aditya@quantira.io', role: 'QT Super Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-002', clientId: 'CLI-001', name: 'Rajesh Sharma', email: 'rajesh@vengogranites.com', role: 'Supplier/Client Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-003', clientId: 'CLI-001', name: 'Ananya Iyer', email: 'ananya.hr@vengogranites.com', role: 'Client HR Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-004', clientId: 'CLI-001', name: 'Karan Malhotra', email: 'karan.buyer@apexbuilders.com', role: 'Buyer Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-005', clientId: 'CLI-002', name: 'Vikram Singhania', email: 'vikram@rajgranite.in', role: 'Supplier/Client Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-006', clientId: 'CLI-002', name: 'Pooja Verma', email: 'pooja.hr@rajgranite.in', role: 'Client HR Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
  { id: 'USR-007', clientId: 'CLI-002', name: 'Rohan Sharma', email: 'rohan.buyer@crownflooring.com', role: 'Buyer Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' }
];

export const initialClientRoles = [
  { id: 'ROLE-001', clientId: 'CLI-001', name: 'Plant Manager', description: 'Full access to production, yard and inventory', modules: ['dashboard', 'masters', 'inventory', 'reports'] },
  { id: 'ROLE-002', clientId: 'CLI-001', name: 'Sales Coordinator', description: 'Access to sales orders, pricing and dispatch', modules: ['dashboard', 'sales', 'reports'] },
  { id: 'ROLE-003', clientId: 'CLI-002', name: 'Site Supervisor', description: 'Manages incoming stone blocks and cutting slabs', modules: ['dashboard', 'inventory', 'receipts'] }
];

export const initialCustomFields = [
  { id: 'CF-001', clientId: 'CLI-001', entity: 'Employee', label: 'Safety Badge No', key: 'safetyBadgeNo', type: 'text', placeholder: 'e.g. SB-8891' },
  { id: 'CF-002', clientId: 'CLI-001', entity: 'Contractor', label: 'Insurance Policy', key: 'insurancePolicy', type: 'text', placeholder: 'e.g. POL-7721' }
];

// Employees and Contractors
export const initialPersonnel = [
  {
    id: 'EMP-101',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-01',
    name: 'Ramesh Patel',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-11223',
    email: 'ramesh.patel@vengogranites.com',
    dob: '1985-01-28',
    gender: 'Male',
    address: 'Sector 4, RIICO Industrial Area, Kishangarh',
    emergencyContact: '+91-98290-99887',
    department: 'Yard Operations',
    designation: 'Yard Foreman',
    joiningDate: '2021-03-15',
    idType: 'Aadhaar / National ID',
    idNumber: '8821-4902-1102',
    idExpiry: '2035-05-10',
    bankHolder: 'Ramesh Patel',
    bankName: 'State Bank of India (SBI)',
    bankAccount: 'SBIN002934101928',
    bankIfsc: 'SBIN0001234',
    bankBranch: 'Kishangarh Main',
    wageType: 'Monthly',
    wageRate: 34000,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-102',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-02',
    name: 'Suresh Kumar',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-44556',
    email: 'suresh.k@vengogranites.com',
    dob: '1989-12-02',
    gender: 'Male',
    address: 'Plot 22, Marble Market Road, Makrana',
    emergencyContact: '+91-98290-22110',
    department: 'Gangsaw Cutting',
    designation: 'Machine Operator',
    joiningDate: '2022-06-01',
    idType: 'Aadhaar / National ID',
    idNumber: '7731-8890-4412',
    idExpiry: '2035-08-20',
    bankHolder: 'Suresh Kumar',
    bankName: 'HDFC Bank',
    bankAccount: 'HDFC009823410291',
    bankIfsc: 'HDFC0002341',
    bankBranch: 'Makrana',
    wageType: 'Hourly',
    wageRate: 220,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-103',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-03',
    name: 'Kavita Sharma',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-77889',
    email: 'kavita.s@vengogranites.com',
    dob: '1989-03-27',
    gender: 'Female',
    address: 'B-12, Vaishali Nagar, Jaipur',
    emergencyContact: '+91-98290-55667',
    department: 'Quality Inspection',
    designation: 'QC Inspector',
    joiningDate: '2023-01-10',
    idType: 'Aadhaar / National ID',
    idNumber: '4491-0021-9983',
    idExpiry: '2035-11-15',
    bankHolder: 'Kavita Sharma',
    bankName: 'ICICI Bank',
    bankAccount: 'ICIC000128930192',
    bankIfsc: 'ICIC0000412',
    bankBranch: 'Jaipur West',
    wageType: 'Monthly',
    wageRate: 31000,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'CON-201',
    clientId: 'CLI-001',
    type: 'Contractor',
    code: 'CON-01',
    name: 'Deepak Chawla',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-88990',
    email: 'deepak.contracts@balajirigging.in',
    companyName: 'Shree Balaji Heavy Rigging & Logistics',
    contractorTaxId: 'GST-08AABCB9918K1Z3',
    address: 'Industrial Transport Nagar, Ajmer Road, Jaipur',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    agreementRate: 140, // Rate per ton
    workerCount: 12,
    department: 'Quarry Transport',
    designation: 'Contractor Lead',
    joiningDate: '2026-01-01',
    idType: 'PAN Card',
    idNumber: 'ABCDE1234F',
    idExpiry: '2035-12-31',
    bankHolder: 'Shree Balaji Rigging Logistics',
    bankName: 'State Bank of India (SBI)',
    bankAccount: 'SBIN003920194821',
    bankIfsc: 'SBIN0005521',
    bankBranch: 'Transport Nagar',
    wageType: 'Piece Rate',
    wageRate: 140,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'WRK-201',
    clientId: 'CLI-001',
    type: 'Contractor Worker',
    code: 'WRK-0001',
    name: 'Sunil Chauhan',
    contractorId: 'CON-0001',
    contractorName: 'Shree Balaji Heavy Rigging & Logistics',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-66554',
    email: 'sunil.c@balajirigging.in',
    dob: '1997-10-25',
    gender: 'Male',
    address: 'Near Old Bus Stand, Makrana',
    emergencyContact: '+91-98290-99112',
    department: 'Quarry Logistics',
    designation: 'Contract Rigging Laborer',
    joiningDate: '2026-01-15',
    idType: 'Aadhaar / National ID',
    idNumber: '5519-8802-3312',
    idExpiry: '2035-04-10',
    bankHolder: 'Sunil Chauhan',
    bankName: 'Punjab National Bank (PNB)',
    bankAccount: 'PUNB019283401928',
    bankIfsc: 'PUNB0003120',
    bankBranch: 'Makrana Town',
    wageType: 'Daily',
    wageRate: 1100,
    shift: 'Shift 1',
    status: 'Active',
    faceEnrolled: false,
    consentBiometric: true
  },
  {
    id: 'EMP-104',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-04',
    name: 'Manoj Yadav',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-22334',
    email: 'manoj.yadav@vengogranites.com',
    dob: '1984-08-14',
    gender: 'Male',
    address: 'Gangsaw Colony, RIICO Area, Kishangarh',
    emergencyContact: '+91-98290-88221',
    department: 'Gangsaw Cutting',
    designation: 'Senior Saw Operator',
    joiningDate: '2020-04-12',
    idType: 'Aadhaar / National ID',
    idNumber: '3312-9901-4456',
    idExpiry: '2035-09-12',
    bankHolder: 'Manoj Yadav',
    bankName: 'State Bank of India (SBI)',
    bankAccount: 'SBIN003312984102',
    bankIfsc: 'SBIN0001234',
    bankBranch: 'Kishangarh Main',
    wageType: 'Monthly',
    wageRate: 36000,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-105',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-05',
    name: 'Dinesh Verma',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-55668',
    email: 'dinesh.v@vengogranites.com',
    dob: '1987-05-01',
    gender: 'Male',
    address: 'Village Silora, Kishangarh',
    emergencyContact: '+91-98290-77441',
    department: 'Yard Operations',
    designation: 'Gantry Crane Driver',
    joiningDate: '2021-08-01',
    idType: 'Aadhaar / National ID',
    idNumber: '8821-0099-3312',
    idExpiry: '2035-12-15',
    bankHolder: 'Dinesh Verma',
    bankName: 'HDFC Bank',
    bankAccount: 'HDFC008821039281',
    bankIfsc: 'HDFC0002341',
    bankBranch: 'Kishangarh',
    wageType: 'Monthly',
    wageRate: 33000,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-106',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-06',
    name: 'Priya Nair',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-99881',
    email: 'priya.nair@vengogranites.com',
    dob: '1991-06-13',
    gender: 'Female',
    address: 'Flat 302, Green Valley Apartments, Ajmer',
    emergencyContact: '+91-98290-11228',
    department: 'Quality Inspection',
    designation: 'QC Inspector',
    joiningDate: '2022-11-15',
    idType: 'Aadhaar / National ID',
    idNumber: '5544-3312-8890',
    idExpiry: '2035-07-20',
    bankHolder: 'Priya Nair',
    bankName: 'ICICI Bank',
    bankAccount: 'ICIC005544391028',
    bankIfsc: 'ICIC0000412',
    bankBranch: 'Ajmer',
    wageType: 'Monthly',
    wageRate: 31500,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-107',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-07',
    name: 'Arjun Reddy',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-44119',
    email: 'arjun.reddy@vengogranites.com',
    dob: '1997-02-07',
    gender: 'Male',
    address: 'Yard Gate Colony, Kishangarh',
    emergencyContact: '+91-98290-66772',
    department: 'Yard Operations',
    designation: 'Loader & Forklift Operator',
    joiningDate: '2023-04-10',
    idType: 'Aadhaar / National ID',
    idNumber: '6671-2299-4411',
    idExpiry: '2035-03-01',
    bankHolder: 'Arjun Reddy',
    bankName: 'State Bank of India (SBI)',
    bankAccount: 'SBIN006671298410',
    bankIfsc: 'SBIN0001234',
    bankBranch: 'Kishangarh Main',
    wageType: 'Hourly',
    wageRate: 200,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'EMP-108',
    clientId: 'CLI-001',
    type: 'Employee',
    code: 'EMP-08',
    name: 'Sunita Joshi',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-77223',
    email: 'sunita.j@vengogranites.com',
    dob: '1990-04-23',
    gender: 'Female',
    address: 'Shivaji Nagar, Madanganj, Kishangarh',
    emergencyContact: '+91-98290-99334',
    department: 'Gangsaw Cutting',
    designation: 'Diamond Wire Technician',
    joiningDate: '2023-08-01',
    idType: 'Aadhaar / National ID',
    idNumber: '9988-1122-3344',
    idExpiry: '2035-06-18',
    bankHolder: 'Sunita Joshi',
    bankName: 'HDFC Bank',
    bankAccount: 'HDFC009988102938',
    bankIfsc: 'HDFC0002341',
    bankBranch: 'Madanganj',
    wageType: 'Monthly',
    wageRate: 32500,
    faceEnrolled: true,
    consentBiometric: true
  },
  {
    id: 'WRK-202',
    clientId: 'CLI-001',
    type: 'Contractor Worker',
    code: 'WRK-0002',
    name: 'Raju Shinde',
    contractorId: 'CON-0001',
    contractorName: 'Shree Balaji Heavy Rigging & Logistics',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    phone: '+91-98290-88112',
    email: 'raju.s@balajirigging.in',
    dob: '2000-05-08',
    gender: 'Male',
    address: 'Station Road, Makrana',
    emergencyContact: '+91-98290-44229',
    department: 'Quarry Logistics',
    designation: 'Heavy Rigging Crew',
    joiningDate: '2026-02-01',
    idType: 'Aadhaar / National ID',
    idNumber: '7721-9988-2211',
    idExpiry: '2035-01-20',
    bankHolder: 'Raju Shinde',
    bankName: 'Punjab National Bank (PNB)',
    bankAccount: 'PUNB077219830192',
    bankIfsc: 'PUNB0003120',
    bankBranch: 'Makrana Town',
    wageType: 'Daily',
    wageRate: 1150,
    shift: 'Shift 2',
    status: 'Active',
    faceEnrolled: false,
    consentBiometric: true
  }
];

export const initialContractors = [
  {
    id: 'CON-0001',
    code: 'CON-0001',
    clientId: 'CLI-001',
    companyName: 'Shree Balaji Heavy Rigging & Logistics',
    taxId: 'GST-08AABCB9918K1Z3',
    contactPerson: 'Deepak Chawla',
    phone: '+91-98290-88990',
    email: 'deepak.contracts@balajirigging.in',
    address: 'Industrial Transport Nagar, Ajmer Road, Jaipur',
    contractStart: '2026-01-01',
    contractEnd: '2026-12-31',
    agreementRate: 140,
    rateUnit: 'Per Ton',
    bankName: 'State Bank of India (SBI)',
    bankAccount: 'SBIN003920194821',
    bankIfsc: 'SBIN0005521',
    contractDoc: 'https://docs.granite.io/contracts/CON-0001.pdf',
    status: 'Active'
  },
  {
    id: 'CON-0002',
    code: 'CON-0002',
    clientId: 'CLI-001',
    companyName: 'Makrana Diamond Gangsaw Cutters',
    taxId: 'GST-08AACCD7712M1Z9',
    contactPerson: 'Mahesh Reddy',
    phone: '+91-98290-77665',
    email: 'mahesh@diamondcutters.in',
    address: 'Sector 3, RIICO Area, Makrana',
    contractStart: '2026-02-01',
    contractEnd: '2026-11-30',
    agreementRate: 180,
    rateUnit: 'Per Slab',
    bankName: 'HDFC Bank',
    bankAccount: 'HDFC005510293847',
    bankIfsc: 'HDFC0002341',
    contractDoc: 'https://docs.granite.io/contracts/CON-0002.pdf',
    status: 'Active'
  }
];

export const initialDepartments = [
  { id: 'DEP-0001', code: 'DEP-01', clientId: 'CLI-001', name: 'Yard Operations', headOfDept: 'Ramesh Patel', status: 'Active' },
  { id: 'DEP-0002', code: 'DEP-02', clientId: 'CLI-001', name: 'Gangsaw Cutting', headOfDept: 'Suresh Kumar', status: 'Active' },
  { id: 'DEP-0003', code: 'DEP-03', clientId: 'CLI-001', name: 'Polishing & Finishing', headOfDept: 'Manoj Yadav', status: 'Active' },
  { id: 'DEP-0004', code: 'DEP-04', clientId: 'CLI-001', name: 'Quality Inspection', headOfDept: 'Kavita Sharma', status: 'Active' },
  { id: 'DEP-0005', code: 'DEP-05', clientId: 'CLI-001', name: 'Quarry Logistics', headOfDept: 'Deepak Chawla', status: 'Active' }
];

export const initialDesignations = [
  { id: 'DES-0001', code: 'DES-01', clientId: 'CLI-001', title: 'Yard Foreman', department: 'Yard Operations', status: 'Active' },
  { id: 'DES-0002', code: 'DES-02', clientId: 'CLI-001', title: 'Machine Operator', department: 'Gangsaw Cutting', status: 'Active' },
  { id: 'DES-0003', code: 'DES-03', clientId: 'CLI-001', title: 'QC Inspector', department: 'Quality Inspection', status: 'Active' },
  { id: 'DES-0004', code: 'DES-04', clientId: 'CLI-001', title: 'Gantry Crane Driver', department: 'Yard Operations', status: 'Active' },
  { id: 'DES-0005', code: 'DES-05', clientId: 'CLI-001', title: 'Polishing Line Technician', department: 'Polishing & Finishing', status: 'Active' },
  { id: 'DES-0006', code: 'DES-06', clientId: 'CLI-001', title: 'Contract Rigging Laborer', department: 'Quarry Logistics', status: 'Active' }
];

export const initialLeaveTypes = [
  { id: 'LT-0001', code: 'LT-01', clientId: 'CLI-001', name: 'Annual Leave', yearlyAllowance: 18, isPaid: true, status: 'Active' },
  { id: 'LT-0002', code: 'LT-02', clientId: 'CLI-001', name: 'Sick Leave', yearlyAllowance: 7, isPaid: true, status: 'Active' },
  { id: 'LT-0003', code: 'LT-03', clientId: 'CLI-001', name: 'Casual Leave', yearlyAllowance: 5, isPaid: true, status: 'Active' },
  { id: 'LT-0004', code: 'LT-04', clientId: 'CLI-001', name: 'Unpaid Leave', yearlyAllowance: 15, isPaid: false, status: 'Active' }
];

export const initialPunchDevices = [
  { id: 'DEV-01', clientId: 'CLI-001', name: 'Gate 1 Weighbridge Kiosk', location: 'Zone A - Main Gate', status: 'Online', lastSync: 'Just now' },
  { id: 'DEV-02', clientId: 'CLI-001', name: 'Gangsaw Shed Kiosk', location: 'Zone B - Sawing Bay', status: 'Online', lastSync: '2 min ago' },
  { id: 'DEV-03', clientId: 'CLI-001', name: 'Polishing & QA Station', location: 'Zone C - A-Frame Yard', status: 'Online', lastSync: '5 min ago' }
];

export const initialAttendance = [
  { id: 'ATT-101', clientId: 'CLI-001', employeeId: 'EMP-101', date: '2026-10-13', inTime: '06:02', outTime: '15:15', workedHours: 9.2, overtimeHours: 2.0, status: 'Present', shift: 'Morning Shift', verifiedBy: 'Face Biometric' },
  { id: 'ATT-102', clientId: 'CLI-001', employeeId: 'EMP-102', date: '2026-10-13', inTime: '06:10', outTime: '14:30', workedHours: 8.3, overtimeHours: 1.0, status: 'Present', shift: 'Morning Shift', verifiedBy: 'Face Biometric' },
  { id: 'ATT-103', clientId: 'CLI-001', employeeId: 'EMP-103', date: '2026-10-13', inTime: '08:00', outTime: '17:00', workedHours: 9.0, overtimeHours: 1.0, status: 'Present', shift: 'Morning Shift', verifiedBy: 'Face Biometric' },
  { id: 'ATT-104', clientId: 'CLI-001', employeeId: 'CON-201', date: '2026-10-13', inTime: '06:30', outTime: '16:00', workedHours: 9.5, overtimeHours: 2.0, status: 'Present', shift: 'Morning Shift', verifiedBy: 'Face Biometric' }
];

export const initialShifts = [
  { id: 'SH-01', clientId: 'CLI-001', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', standardHours: 8, breakMins: 45 },
  { id: 'SH-02', clientId: 'CLI-001', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', standardHours: 8, breakMins: 45 },
  { id: 'SH-03', clientId: 'CLI-001', name: 'Night Shift', startTime: '22:00', endTime: '06:00', standardHours: 8, breakMins: 45 }
];

export const initialRosters = [
  { id: 'ROS-01', clientId: 'CLI-001', employeeId: 'EMP-101', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-02', clientId: 'CLI-001', employeeId: 'EMP-102', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Leave', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-03', clientId: 'CLI-001', employeeId: 'EMP-103', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-04', clientId: 'CLI-001', employeeId: 'EMP-104', weekStart: '2026-10-12', mon: 'Shift 2', tue: 'Shift 2', wed: 'Shift 2', thu: 'Shift 2', fri: 'Shift 2', sat: 'Off', sun: 'Off' },
  { id: 'ROS-05', clientId: 'CLI-001', employeeId: 'EMP-105', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-06', clientId: 'CLI-001', employeeId: 'EMP-106', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Leave', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-07', clientId: 'CLI-001', employeeId: 'EMP-107', weekStart: '2026-10-12', mon: 'Shift 2', tue: 'Shift 2', wed: 'Shift 2', thu: 'Shift 2', fri: 'Shift 2', sat: 'Off', sun: 'Off' },
  { id: 'ROS-08', clientId: 'CLI-001', employeeId: 'EMP-108', weekStart: '2026-10-12', mon: 'Shift 3', tue: 'Shift 3', wed: 'Shift 3', thu: 'Shift 3', fri: 'Shift 3', sat: 'Off', sun: 'Off' },
  { id: 'ROS-09', clientId: 'CLI-001', employeeId: 'CON-201', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-10', clientId: 'CLI-001', employeeId: 'WRK-201', weekStart: '2026-10-12', mon: 'Shift 1', tue: 'Shift 1', wed: 'Shift 1', thu: 'Shift 1', fri: 'Shift 1', sat: 'Off', sun: 'Off' },
  { id: 'ROS-11', clientId: 'CLI-001', employeeId: 'WRK-202', weekStart: '2026-10-12', mon: 'Shift 2', tue: 'Shift 2', wed: 'Shift 2', thu: 'Shift 2', fri: 'Shift 2', sat: 'Off', sun: 'Off' }
];

export const initialLeaveBalances = [
  { id: 'LB-01', clientId: 'CLI-001', employeeId: 'EMP-101', annualLeave: 18, sickLeave: 7, casualLeave: 4 },
  { id: 'LB-02', clientId: 'CLI-001', employeeId: 'EMP-102', annualLeave: 14, sickLeave: 6, casualLeave: 3 },
  { id: 'LB-03', clientId: 'CLI-001', employeeId: 'EMP-103', annualLeave: 20, sickLeave: 8, casualLeave: 5 }
];

export const initialLeaveRequests = [
  { id: 'LR-01', clientId: 'CLI-001', employeeId: 'EMP-102', type: 'Annual Leave', fromDate: '2026-10-20', toDate: '2026-10-22', days: 3, reason: 'Family event', status: 'Approved' }
];

export const initialHolidays = [
  { id: 'HOL-01', clientId: 'CLI-001', date: '2026-11-08', name: 'Diwali Festival', mandatory: true },
  { id: 'HOL-02', clientId: 'CLI-001', date: '2026-12-25', name: 'Christmas Day', mandatory: true },
  { id: 'HOL-03', clientId: 'CLI-001', date: '2026-08-15', name: 'Independence Day', mandatory: true }
];

export const initialOvertimeApprovals = [
  { id: 'OT-01', clientId: 'CLI-001', employeeId: 'EMP-101', date: '2026-10-13', actualOvertime: 1.25, roundedOvertime: 2, multiplier: 1.5, status: 'Approved', approvedBy: 'Rajesh Sharma' },
  { id: 'OT-02', clientId: 'CLI-001', employeeId: 'EMP-102', date: '2026-10-13', actualOvertime: 0.5, roundedOvertime: 1, multiplier: 1.5, status: 'Pending', approvedBy: null }
];

export const initialAdvances = [
  { id: 'ADV-01', clientId: 'CLI-001', employeeId: 'EMP-102', amount: 5000, date: '2026-10-05', reason: 'Medical', repaid: 0, status: 'Approved' }
];

export const initialPayrollPeriods = [
  { id: 'PAY-2026-09', clientId: 'CLI-001', month: 'September 2026', totalGross: 148000, totalDeductions: 12000, totalNet: 136000, status: 'Locked', lockedBy: 'Rajesh Sharma', lockedAt: '2026-10-01' },
  { id: 'PAY-2026-10', clientId: 'CLI-001', month: 'October 2026', totalGross: 154000, totalDeductions: 13500, totalNet: 140500, status: 'Open', lockedBy: null, lockedAt: null }
];

export const initialPurchaseRequests = [
  { id: 'PR-2026-001', clientId: 'CLI-001', stoneCode: 'BLK-GAL', quantityTons: 60, requestedBy: 'Neha Gupta', date: '2026-10-10', status: 'Approved' },
  { id: 'PR-2026-002', clientId: 'CLI-001', stoneCode: 'CAR-WHT', quantityTons: 85, requestedBy: 'Karan Malhotra', date: '2026-10-12', status: 'Pending Approval' }
];

export const initialPurchaseOrders = [
  { id: 'PO-2026-101', clientId: 'CLI-001', prId: 'PR-2026-001', supplier: 'Monte Altissimo Quarry', stoneCode: 'BLK-GAL', tons: 60, ratePerTon: 210, totalCost: 12600, date: '2026-10-11', status: 'Open' },
  { id: 'PO-2026-102', clientId: 'CLI-001', prId: null, supplier: 'Apuana Extraction Consortium', stoneCode: 'CAR-WHT', tons: 55, ratePerTon: 340, totalCost: 18700, date: '2026-10-08', status: 'Partially Received' }
];

export const initialReceipts = [
  { id: 'GRN-901', clientId: 'CLI-001', poId: 'PO-2026-101', truckNumber: 'IT-GR-9012', stoneCode: 'BLK-GAL', grossKg: 42350, tareKg: 14100, netKg: 28250, blockCount: 1, yardLocation: 'LOC-A1', date: '2026-10-13', status: 'Weighed' },
  { id: 'GRN-902', clientId: 'CLI-001', poId: 'PO-2026-102', truckNumber: 'IT-TR-4481', stoneCode: 'CAR-WHT', grossKg: 40800, tareKg: 13800, netKg: 27000, blockCount: 1, yardLocation: 'LOC-A2', date: '2026-10-12', status: 'Passed QA' }
];

// Stage 1: Raw Blocks
export const initialRawBlocks = [
  {
    id: 'BLK-901',
    clientId: 'CLI-001',
    grnId: 'GRN-901',
    stoneCode: 'BLK-GAL',
    quarrySource: 'Altissimo Q1',
    quarryBlockNumber: 'ALT-8891',
    weightKg: 28250,
    weightTons: 28.25,
    lengthCm: 290,
    widthCm: 175,
    heightCm: 180,
    volumeCbm: 9.14,
    densityKgM3: 3090,
    yardLocation: 'LOC-A1',
    stage: 'Stage 1: Raw Block',
    qa1Status: 'Pass', // Pass | Reject | Discrepancy
    qa1Overruled: false,
    qa1DefectType: null,
    qa1CrackDepthCm: 0,
    qa1ColourUniformity: 'Uniform',
    status: 'In Yard', // In Yard | Sawing | Converted
    date: '2026-10-13'
  },
  {
    id: 'BLK-902',
    clientId: 'CLI-001',
    grnId: 'GRN-902',
    stoneCode: 'CAR-WHT',
    quarrySource: 'Apuana Valley',
    quarryBlockNumber: 'APU-1022',
    weightKg: 27000,
    weightTons: 27.0,
    lengthCm: 280,
    widthCm: 165,
    heightCm: 170,
    volumeCbm: 7.85,
    densityKgM3: 3439,
    yardLocation: 'LOC-A2',
    stage: 'Stage 1: Raw Block',
    qa1Status: 'Pass',
    qa1Overruled: false,
    qa1DefectType: null,
    qa1CrackDepthCm: 0,
    qa1ColourUniformity: 'Uniform',
    status: 'In Yard',
    date: '2026-10-12'
  }
];

export const initialQA1Records = [
  { id: 'QA1-01', blockId: 'BLK-901', visualCracks: 'None', dimensionMatch: true, weightVarianceKg: 40, status: 'Pass', inspectedBy: 'Kavita Sharma', date: '2026-10-13' },
  { id: 'QA1-02', blockId: 'BLK-902', visualCracks: 'Hairline Corner', dimensionMatch: true, weightVarianceKg: -20, status: 'Pass', inspectedBy: 'Kavita Sharma', date: '2026-10-12' }
];

// Stage 2: Cut Slabs
export const initialCutSlabs = [
  {
    id: 'CUT-801',
    clientId: 'CLI-001',
    blockId: 'BLK-901',
    gangsawMachine: 'Gangsaw 01 - Breton Diamond',
    bladeKerfMm: 3.5,
    slabsCount: 38,
    thicknessMm: 20,
    lengthInches: 114,
    heightInches: 68,
    totalSqFt: 2045,
    cbmProduced: 3.8,
    slurryWasteTons: 6.2,
    sawingHours: 14.5,
    yardLocation: 'LOC-B1',
    stage: 'Stage 2: Cut Slab',
    status: 'Ready For Polish',
    date: '2026-10-13'
  }
];

// Stage 3: Polished Slabs
export const initialPolishedSlabs = [
  {
    id: 'POL-701',
    clientId: 'CLI-001',
    cutSlabId: 'CUT-801',
    finishType: 'Polished High Gloss',
    slabsCount: 38,
    thicknessMm: 20,
    totalSqFt: 2045,
    abrasiveGritMax: 1200,
    epoxyResinApplied: true,
    epoxyBatchNo: 'RES-998',
    netSaleableSqFt: 1980,
    lossCornerSqFt: 65,
    yardLocation: 'LOC-C1',
    stage: 'Stage 3: Polished Slab',
    qa2Status: 'Pass',
    qa2Overruled: false,
    status: 'Ready For Bundling',
    date: '2026-10-13'
  }
];

export const initialQA2Records = [
  { id: 'QA2-01', slabLotId: 'POL-701', glossGlossmeterUnits: 94, thicknessToleranceMm: 0.3, surfacePits: 0, status: 'Pass', inspector: 'Kavita Sharma', date: '2026-10-13' }
];

// Stage 4: Final Bundles
export const initialBundles = [
  {
    id: 'BUN-601',
    clientId: 'CLI-001',
    bundleNumber: 'BUN-2026-001',
    blockId: 'BLK-901',
    stoneCode: 'BLK-GAL',
    slabsCount: 38,
    totalSqFt: 1980,
    availableSqFt: 1980,
    reservedSqFt: 0,
    thicknessMm: 20,
    finishType: 'Polished High Gloss',
    grade: 'Export Grade A',
    aFrameBay: 'A-Frame 01',
    qrCodeData: 'VENGO-CLI001-BUN-601-BLK-GAL-1980SQFT',
    stage: 'Stage 4: Final Slabs',
    status: 'In Yard', // In Yard | Reserved | Sold
    date: '2026-10-13'
  }
];

export const initialStockMovements = [
  { id: 'MOV-01', clientId: 'CLI-001', refId: 'BUN-601', itemType: 'Bundle', fromLoc: 'LOC-B1 (Sawing)', toLoc: 'LOC-C1 (A-Frame 01)', qty: '1980 Sq.Ft', user: 'Ramesh Patel', date: '2026-10-13 14:20' }
];

export const initialStockTransfers = [
  { id: 'TRF-01', clientId: 'CLI-001', refId: 'BUN-601', fromYard: 'Carrara Yard Main', toYard: 'Livorno Port Depot', status: 'Completed', transferDate: '2026-10-13' }
];

export const initialStockCounts = [
  { id: 'STC-01', clientId: 'CLI-001', yardLocation: 'LOC-C1', countedBy: 'Ramesh Patel', systemQty: 180, physicalQty: 180, variance: 0, status: 'Reconciled', date: '2026-10-12' }
];

export const initialStockAdjustments = [];

export const initialSalesOrders = [
  {
    id: 'SO-2026-501',
    clientId: 'CLI-001',
    customerName: 'Apex Builders Ltd',
    customerId: 'CUST-001',
    bundleId: 'BUN-601',
    stoneCode: 'BLK-GAL',
    sqFt: 850,
    rateSqFt: 65,
    subtotal: 55250,
    taxRate: 18,
    taxAmount: 9945,
    totalAmount: 65195,
    status: 'Confirmed', // Draft | Credit Held | Confirmed | Invoiced | Dispatched
    creditApproved: true,
    date: '2026-10-13'
  }
];

export const initialInvoices = [
  {
    id: 'INV-2026-701',
    clientId: 'CLI-001',
    orderId: 'SO-2026-501',
    customerName: 'Apex Builders Ltd',
    customerId: 'CUST-001',
    stoneCode: 'BLK-GAL',
    sqFt: 850,
    rateSqFt: 65,
    subtotal: 55250,
    taxAmount: 9945,
    totalAmount: 65195,
    paidAmount: 0,
    balanceDue: 65195,
    dueDate: '2026-11-12',
    date: '2026-10-13',
    status: 'Unpaid'
  }
];

export const initialChallans = [
  {
    id: 'DC-2026-301',
    clientId: 'CLI-001',
    invoiceId: 'INV-2026-701',
    customerName: 'Apex Builders Ltd',
    vehicleNo: 'RJ-14-GA-9012',
    driverName: 'Gopal Singh',
    bundleId: 'BUN-601',
    sqFtDispatched: 850,
    date: '2026-10-13',
    status: 'Dispatched'
  }
];

export const initialDispatches = [
  { id: 'DSP-01', challanId: 'DC-2026-301', gatePassNo: 'GP-8891', dispatchedAt: '2026-10-13 16:30', status: 'Exit Gate Passed' }
];

export const initialSupplierBills = [
  {
    id: 'BILL-101',
    clientId: 'CLI-001',
    poId: 'PO-2026-101',
    supplierId: 'SUP-001',
    supplierName: 'Monte Altissimo Quarry',
    billNumber: 'MA-INV-2026-90',
    billDate: '2026-10-12',
    weightTons: 28.25,
    amount: 5932.50,
    poRate: 210,
    threeWayMatchStatus: 'Matched', // Matched | Weight Discrepancy | Rate Discrepancy
    status: 'Pending Payment'
  }
];

export const initialSupplierPayments = [
  { id: 'SPAY-01', clientId: 'CLI-001', supplierId: 'SUP-001', supplierName: 'Monte Altissimo Quarry', billId: 'BILL-101', debitNoteDeduction: 0, netPaid: 5932.50, paymentMode: 'Wire Transfer', date: '2026-10-13', status: 'Processed' }
];

export const initialCustomerPayments = [
  { id: 'CPAY-01', clientId: 'CLI-001', customerId: 'CUST-001', customerName: 'Apex Builders Ltd', invoiceId: 'INV-2026-701', amountPaid: 20000, paymentMode: 'Cheque', date: '2026-10-13', status: 'Cleared' }
];

export const initialContractorPayments = [
  { id: 'CONPAY-01', clientId: 'CLI-001', contractorId: 'CON-201', contractorName: 'Deepak Chawla', metricQuantity: 28.25, agreementRate: 140, totalEarned: 3955, advanceDeduction: 0, netPayable: 3955, date: '2026-10-13', status: 'Approved' }
];

export const initialDefectiveStore = [
  { id: 'DEF-01', clientId: 'CLI-001', sourceStage: 'Stage 1: Raw Block', refId: 'BLK-901-Corner', stoneCode: 'BLK-GAL', reason: 'Deep lateral cleavage crack', weightKg: 1200, yardLocation: 'LOC-D1', status: 'Stored', date: '2026-10-13' }
];

export const initialDebitNotes = [
  { id: 'DN-01', clientId: 'CLI-001', supplierId: 'SUP-001', supplierName: 'Monte Altissimo Quarry', grnId: 'GRN-901', defectiveWeightKg: 1200, ratePerKg: 0.21, amount: 252, reason: 'Natural internal crack over threshold', status: 'Applied to Bill' }
];

export const initialCreditNotes = [
  { id: 'CN-01', clientId: 'CLI-001', customerId: 'CUST-001', invoiceId: 'INV-2026-701', amount: 350, reason: 'Edge chip damage during uncrating', status: 'Approved' }
];

export const initialScrapWriteOffs = [
  { id: 'SCRAP-01', clientId: 'CLI-001', defectiveId: 'DEF-01', weightKg: 1200, scrapSalvageValue: 60, authorizedBy: 'Rajesh Sharma', date: '2026-10-13', status: 'Written Off' }
];

export const initialNotifications = [
  { id: 'NOTIF-01', clientId: 'CLI-001', title: 'Overtime Cap Approaching', message: 'Suresh Kumar has reached 3.5 hrs OT this week', type: 'warning', date: '10 mins ago', read: false },
  { id: 'NOTIF-02', clientId: 'CLI-001', title: 'Customer Credit Limit Exceeded', message: 'Royal Marvel Infra attempted order above $100,000', type: 'alert', date: '1 hour ago', read: false }
];

export const initialAuditLogs = [
  { id: 'AUD-001', clientId: 'CLI-001', action: 'ONBOARD', entity: 'Client', user: 'Aditya Varma', role: 'QT Super Admin', details: 'Initialized Carrara Quarry Mining instance', timestamp: '2026-10-01 09:00:00' },
  { id: 'AUD-002', clientId: 'CLI-001', action: 'CREATE', entity: 'PO-2026-101', user: 'Rajesh Sharma', role: 'Supplier/Client Admin', details: 'Created 60 MT Black Galaxy PO', timestamp: '2026-10-11 11:30:22' },
  { id: 'AUD-003', clientId: 'CLI-001', action: 'RECEIPT', entity: 'GRN-901', user: 'Karan Malhotra', role: 'Buyer Admin', details: 'Weighed 28.25 MT Raw Block from Altissimo', timestamp: '2026-10-13 08:45:10' }
];

// ==========================================
// 10-STEP INVENTORY SYSTEM INITIAL DATA
// ==========================================

// Step 1: Gate Entry
export const initialGateEntries = [
  {
    id: 'GE-0001',
    clientId: 'CLI-001',
    entryNo: 'GE-0001',
    dateTime: '2026-10-13 08:15',
    truckNo: 'RJ-14-GA-9012',
    driverName: 'Rameshwar Gurjar',
    driverPhone: '+91-98290-11223',
    transporter: 'Marwar Logistics Corp',
    supplier: 'Monte Altissimo Quarry',
    poNo: 'PO-2026-101',
    challanNo: 'CH-44812',
    challanWeight: 28.5,
    remarks: 'Pristine raw granite block, no transit fissures',
    photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80',
    status: 'Completed',
    isArchived: false,
    createdAt: '2026-10-13 08:15'
  },
  {
    id: 'GE-0002',
    clientId: 'CLI-001',
    entryNo: 'GE-0002',
    dateTime: '2026-10-13 09:30',
    truckNo: 'RJ-14-GA-4481',
    driverName: 'Jagdish Meena',
    driverPhone: '+91-98290-33445',
    transporter: 'Balaji Freight Movers',
    supplier: 'Apuana Extraction Consortium',
    poNo: 'PO-2026-102',
    challanNo: 'CH-55190',
    challanWeight: 27.2,
    remarks: 'Arrived at Main Weighing Gate',
    photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
    status: 'Weighed',
    isArchived: false,
    createdAt: '2026-10-13 09:30'
  }
];

// Step 1: Weighbridge Tickets
export const initialWeighbridgeTickets = [
  {
    id: 'WB-0001',
    clientId: 'CLI-001',
    ticketNo: 'WB-0001',
    gateEntryId: 'GE-0001',
    grossWeight: 42.45,
    tareWeight: 14.20,
    netWeight: 28.25,
    unit: 'Tons',
    challanWeight: 28.5,
    variance: -0.25,
    inTime: '08:20',
    outTime: '08:45',
    weighedBy: 'Ramesh Patel',
    status: 'Approved',
    isArchived: false,
    date: '2026-10-13'
  },
  {
    id: 'WB-0002',
    clientId: 'CLI-001',
    ticketNo: 'WB-0002',
    gateEntryId: 'GE-0002',
    grossWeight: 41.00,
    tareWeight: 14.00,
    netWeight: 27.00,
    unit: 'Tons',
    challanWeight: 27.2,
    variance: -0.20,
    inTime: '09:35',
    outTime: '09:55',
    weighedBy: 'Ramesh Patel',
    status: 'Approved',
    isArchived: false,
    date: '2026-10-13'
  }
];

// Step 2: Extended Raw Blocks
export const initialDetailedRawBlocks = [
  {
    id: 'BLK-0001',
    clientId: 'CLI-001',
    blockNo: 'BLK-0001',
    supplier: 'Monte Altissimo Quarry',
    quarryBlockNo: 'ALT-8891',
    stoneType: 'Black Galaxy Granite',
    color: 'Deep Black with Golden Flecks',
    gateEntryId: 'GE-0001',
    weighbridgeTicketId: 'WB-0001',
    length: 114,
    width: 69,
    height: 71,
    grossVolume: 323.5,
    netWeight: 28.25,
    estimatedSqFt: 2150,
    receivingDate: '2026-10-13',
    receivingYard: 'Carrara Yard Main',
    location: 'Bay 01',
    grade: 'Grade A',
    photos: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=300&auto=format&fit=crop&q=80'],
    status: 'Sliced',
    currentStep: 5,
    itemCost: 5932.50,
    remarks: 'Premium dimension block, ready for gangsaw slicing',
    isArchived: false
  },
  {
    id: 'BLK-0002',
    clientId: 'CLI-001',
    blockNo: 'BLK-0002',
    supplier: 'Apuana Extraction Consortium',
    quarryBlockNo: 'APU-1022',
    stoneType: 'Carrara White Marble',
    color: 'Pure White with Grey Veining',
    gateEntryId: 'GE-0002',
    weighbridgeTicketId: 'WB-0002',
    length: 110,
    width: 65,
    height: 67,
    grossVolume: 277.0,
    netWeight: 27.00,
    estimatedSqFt: 2000,
    receivingDate: '2026-10-13',
    receivingYard: 'Carrara Yard Main',
    location: 'Bay 02',
    grade: 'Grade A',
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80'],
    status: 'QC 1 Passed',
    currentStep: 3,
    itemCost: 5670.00,
    remarks: 'Under surface resin treatment planning',
    isArchived: false
  },
  {
    id: 'BLK-0003',
    clientId: 'CLI-001',
    blockNo: 'BLK-0003',
    supplier: 'Makrana Marble Miners',
    quarryBlockNo: 'MAK-4401',
    stoneType: 'Carrara White Marble',
    color: 'Translucent White',
    gateEntryId: 'GE-0001',
    weighbridgeTicketId: 'WB-0001',
    length: 105,
    width: 62,
    height: 64,
    grossVolume: 241.0,
    netWeight: 24.50,
    estimatedSqFt: 1800,
    receivingDate: '2026-10-14',
    receivingYard: 'Carrara Yard Main',
    location: 'Bay 03',
    grade: 'Grade B',
    photos: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=300&auto=format&fit=crop&q=80'],
    status: 'Received',
    currentStep: 2,
    itemCost: 4900.00,
    remarks: 'Freshly unloaded at Receiving Yard',
    isArchived: false
  }
];

// Step 3: QC 1 Inspections
export const initialQC1Inspections = [
  {
    id: 'QC1-0001',
    inspectionNo: 'QC1-0001',
    blockId: 'BLK-0001',
    inspector: 'Kavita Sharma',
    date: '2026-10-13',
    colorMatch: 'Deep Black Uniformity',
    veining: 'Even Golden Flecks',
    cracks: 'None',
    stains: 'None',
    moisture: '1.2% (Dry)',
    sizeCheck: 'Length 114 in, Width 69 in verified',
    defectType: 'None',
    defectLocation: 'N/A',
    defectSeverity: 'None',
    grade: 'Grade A',
    result: 'Pass',
    remarks: 'Approved for gangsaw slicing and resin backing',
    photos: [],
    isArchived: false
  },
  {
    id: 'QC1-0002',
    inspectionNo: 'QC1-0002',
    blockId: 'BLK-0002',
    inspector: 'Kavita Sharma',
    date: '2026-10-13',
    colorMatch: 'Good White Base',
    veining: 'Fine grey veins',
    cracks: 'Hairline corner crack < 2cm',
    stains: 'Minor quarry soil marks',
    moisture: '1.5%',
    sizeCheck: 'Verified matching challan',
    defectType: 'Corner Fissure',
    defectLocation: 'Top Left Corner',
    defectSeverity: 'Low',
    grade: 'Grade A',
    result: 'Pass',
    remarks: 'Corner will trim into offcut, core block intact',
    photos: [],
    isArchived: false
  }
];

// Materials Stock
export const initialMaterialsStock = [
  { id: 'MAT-0001', name: 'Epoxy Resin Clear Coat (Tenax / Akemi)', type: 'Resin', unit: 'Ltr', currentStock: 425, costPerUnit: 14.50, minStock: 100, batchNo: 'RES-BATCH-2026-A' },
  { id: 'MAT-0002', name: 'Fiberglass Reinforcement Mesh 75 GSM', type: 'Mesh', unit: 'Rolls', currentStock: 63, costPerUnit: 42.00, minStock: 20, batchNo: 'MSH-BATCH-401' },
  { id: 'MAT-0003', name: 'Stone Hardener & Penetrating Chemical', type: 'Chemical', unit: 'Ltr', currentStock: 320, costPerUnit: 8.75, minStock: 50, batchNo: 'CHM-BATCH-89' }
];

// Step 4: Apply Material Jobs
export const initialMaterialJobs = [
  {
    id: 'AM-0001',
    jobNo: 'AM-0001',
    blockId: 'BLK-0001',
    slabLotId: null,
    date: '2026-10-13',
    operator: 'Suresh Kumar',
    shift: 'Morning Shift',
    materialType: 'Resin',
    materialBatchNo: 'RES-BATCH-2026-A',
    quantityUsed: 25,
    unit: 'Ltr',
    areaCovered: 450,
    method: 'Vacuum Infusion & Surface Mesh Backing',
    startTime: '10:00',
    endTime: '12:00',
    curingTime: '4 Hours',
    costAdded: 362.50,
    remarks: 'Block reinforced prior to gangsaw loading',
    isArchived: false
  }
];

// Step 5: Slicing Jobs
export const initialSlicingJobs = [
  {
    id: 'SL-0001',
    jobNo: 'SL-0001',
    blockId: 'BLK-0001',
    machine: 'Gangsaw 01 - Breton Diamond',
    operator: 'Suresh Kumar',
    shift: 'Morning Shift',
    date: '2026-10-13',
    bladeWireDetails: 'Diamond Gangsaw Blades (60 segment, 3.5mm kerf)',
    startTime: '12:30',
    endTime: '18:30',
    thickness: 20,
    slabCount: 38,
    slabLength: 114,
    slabWidth: 68,
    sqftPerSlab: 53.83,
    totalSqFt: 2045.54,
    breakageCount: 0,
    offcutWeight: 2.1,
    powerOrConsumableUsed: '420 kWh / 1.2 cu.m water',
    yieldPct: 95.14,
    lotId: 'LOT-0001',
    remarks: 'Consistent thickness across all 38 slabs',
    isArchived: false
  }
];

// Step 5: Slabs & Lots
export const initialLots = [
  {
    id: 'LOT-0001',
    lotNo: 'LOT-0001',
    slicingJobId: 'SL-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    totalSlabs: 38,
    totalSqFt: 2045.54,
    status: 'QC 2 Passed',
    date: '2026-10-13',
    isArchived: false
  }
];

export const initialSlabs = [
  {
    id: 'SLB-0001',
    slabNo: 'SLB-0001',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    length: 114,
    width: 68,
    sqft: 53.83,
    grade: 'Grade A',
    status: 'Stored',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'A-Frame 01',
    boxId: 'BOX-0001',
    location: 'Carrara Yard Main / Zone C / A-Frame 01',
    cost: 165.65,
    isArchived: false
  },
  {
    id: 'SLB-0002',
    slabNo: 'SLB-0002',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    length: 114,
    width: 68,
    sqft: 53.83,
    grade: 'Grade A',
    status: 'Cut to Size',
    yard: 'Carrara Yard Main',
    zone: 'Zone B',
    bay: 'Gangsaw 01',
    boxId: null,
    location: 'Carrara Yard Main / Zone B / Gangsaw 01',
    cost: 165.65,
    isArchived: false
  },
  {
    id: 'SLB-0003',
    slabNo: 'SLB-0003',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    length: 114,
    width: 68,
    sqft: 53.83,
    grade: 'Grade A',
    status: 'QC 2 Passed',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'A-Frame 01',
    boxId: 'BOX-0001',
    location: 'Carrara Yard Main / Zone C / A-Frame 01',
    cost: 165.65,
    isArchived: false
  },
  {
    id: 'SLB-0004',
    slabNo: 'SLB-0004',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    length: 114,
    width: 68,
    sqft: 53.83,
    grade: 'Grade B',
    status: 'In QC 2',
    yard: 'Carrara Yard Main',
    zone: 'Zone B',
    bay: 'Polishing Station',
    boxId: null,
    location: 'Carrara Yard Main / Zone B / Polishing Station',
    cost: 165.65,
    isArchived: false
  }
];

// Step 6: QC 2 Inspections
export const initialQC2Inspections = [
  {
    id: 'QC2-0001',
    inspectionNo: 'QC2-0001',
    lotId: 'LOT-0001',
    slabId: 'SLB-0001',
    inspector: 'Kavita Sharma',
    date: '2026-10-13',
    thicknessCheck: '20mm (+/- 0.2mm precision)',
    flatness: 'True Flat (within 0.5mm deviation)',
    edges: 'Clean Arris, zero spalling',
    surface: 'Mirror Polish (>92 Gloss units)',
    colorMatch: 'Matches Master Sample standard',
    cracks: 'Zero microscopic cracks',
    resinQuality: 'Fully cured, bubble-free',
    defectType: 'None',
    defectCount: 0,
    grade: 'Grade A',
    result: 'Pass',
    remarks: 'Approved for premium sale and export storage',
    photos: [],
    isArchived: false
  },
  {
    id: 'QC2-0002',
    inspectionNo: 'QC2-0002',
    lotId: 'LOT-0001',
    slabId: 'SLB-0002',
    inspector: 'Kavita Sharma',
    date: '2026-10-13',
    thicknessCheck: '20mm uniform',
    flatness: 'Flat',
    edges: 'Minor 1cm chip at tail edge',
    surface: 'Glossy',
    colorMatch: 'Standard',
    cracks: 'None',
    resinQuality: 'Passed',
    defectType: 'Minor Tail Chip',
    defectCount: 1,
    grade: 'Grade A',
    result: 'Pass',
    remarks: 'Approved for tile cutting (chip will be trimmed)',
    photos: [],
    isArchived: false
  }
];

// Step 7: Cut to Size Jobs
export const initialCutToSizeJobs = [
  {
    id: 'CS-0001',
    jobNo: 'CS-0001',
    slabId: 'SLB-0002',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    machine: 'Bridge Saw 02 - Pedrini CNC',
    operator: 'Manoj Yadav',
    date: '2026-10-14',
    cutSizeName: '24" x 24" Flooring Tiles',
    length: 24,
    width: 24,
    thickness: 20,
    piecesCount: 12,
    sqftPerPiece: 4.0,
    totalSqFt: 48.0,
    breakage: 0,
    offcutSqFt: 5.83,
    offcutAction: 'Keep as Stock',
    remarks: 'High accuracy cutting with beveled edges',
    isArchived: false
  }
];

// Step 7: Piece Records
export const initialPieces = [
  {
    id: 'PC-0001',
    pieceNo: 'PC-0001',
    slabId: 'SLB-0002',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    size: '24" x 24"',
    length: 24,
    width: 24,
    thickness: 20,
    sqft: 4.0,
    grade: 'Grade A',
    status: 'Stored',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'Rack 04',
    boxId: 'BOX-0002',
    location: 'Carrara Yard Main / Zone C / Rack 04 / BOX-0002',
    isArchived: false
  },
  {
    id: 'PC-0002',
    pieceNo: 'PC-0002',
    slabId: 'SLB-0002',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    size: '24" x 24"',
    length: 24,
    width: 24,
    thickness: 20,
    sqft: 4.0,
    grade: 'Grade A',
    status: 'Stored',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'Rack 04',
    boxId: 'BOX-0002',
    location: 'Carrara Yard Main / Zone C / Rack 04 / BOX-0002',
    isArchived: false
  },
  {
    id: 'PC-0003',
    pieceNo: 'PC-0003',
    slabId: 'SLB-0002',
    lotId: 'LOT-0001',
    blockId: 'BLK-0001',
    stoneType: 'Black Galaxy Granite',
    size: '24" x 24"',
    length: 24,
    width: 24,
    thickness: 20,
    sqft: 4.0,
    grade: 'Grade A',
    status: 'Stored',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'Rack 04',
    boxId: 'BOX-0002',
    location: 'Carrara Yard Main / Zone C / Rack 04 / BOX-0002',
    isArchived: false
  }
];

// Step 8: Storage Boxes & Pallets
export const initialBoxes = [
  {
    id: 'BOX-0001',
    boxNo: 'BOX-0001',
    type: 'A-Frame',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    size: '114" x 68"',
    grade: 'Grade A',
    pieceCount: 2,
    sqft: 107.66,
    weight: 2.1,
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'A-Frame 01',
    location: 'Carrara Yard Main / Zone C / A-Frame 01',
    label: 'BOX-0001',
    status: 'Open',
    capacity: 20,
    currentLoad: 2,
    putawayDate: '2026-10-13',
    putawayBy: 'Ramesh Patel',
    isArchived: false
  },
  {
    id: 'BOX-0002',
    boxNo: 'BOX-0002',
    type: 'Pallet Crate',
    stoneType: 'Black Galaxy Granite',
    thickness: 20,
    size: '24" x 24"',
    grade: 'Grade A',
    pieceCount: 12,
    sqft: 48.0,
    weight: 0.95,
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    bay: 'Rack 04',
    location: 'Carrara Yard Main / Zone C / Rack 04',
    label: 'BOX-0002',
    status: 'Open',
    capacity: 25,
    currentLoad: 12,
    putawayDate: '2026-10-14',
    putawayBy: 'Manoj Yadav',
    isArchived: false
  }
];

// Step 8: Storage Move & Transfer Records
export const initialStorageMovements = [
  {
    id: 'MOV-1001',
    itemType: 'Slab',
    itemId: 'SLB-0001',
    fromLoc: 'Zone B / Gangsaw 01',
    toLoc: 'Zone C / A-Frame 01 / BOX-0001',
    date: '2026-10-13 19:15',
    person: 'Ramesh Patel',
    reason: 'Putaway after QC 2 Pass'
  },
  {
    id: 'MOV-1002',
    itemType: 'Piece Box',
    itemId: 'BOX-0002',
    fromLoc: 'Zone B / Bridge Saw 02',
    toLoc: 'Zone C / Rack 04',
    date: '2026-10-14 11:20',
    person: 'Manoj Yadav',
    reason: 'Stock pallet storage'
  }
];

// Step 9: Labels
export const initialLabels = [
  {
    id: 'LBL-0001',
    labelNo: 'LBL-0001',
    labelType: 'Block',
    linkedRecordId: 'BLK-0001',
    template: 'Standard QR Label',
    qrCode: 'QR-BLK-0001-ALT8891',
    barcode: '890100010001',
    stoneType: 'Black Galaxy Granite',
    size: '114 x 69 x 71 in',
    thickness: 'Block',
    grade: 'Grade A',
    finish: 'Quarry Rough',
    sqft: 2150,
    location: 'Bay 01',
    date: '2026-10-13',
    supplier: 'Monte Altissimo Quarry',
    printCount: 2,
    printedBy: 'Ramesh Patel',
    status: 'Active',
    isArchived: false
  },
  {
    id: 'LBL-0002',
    labelNo: 'LBL-0002',
    labelType: 'Slab',
    linkedRecordId: 'SLB-0001',
    template: 'Detailed Slab Barcode',
    qrCode: 'QR-SLB-0001-LOT0001',
    barcode: '890100010002',
    stoneType: 'Black Galaxy Granite',
    size: '114" x 68"',
    thickness: '20mm',
    grade: 'Grade A',
    finish: 'Polished High Gloss',
    sqft: 53.83,
    location: 'Carrara Yard Main / Zone C / A-Frame 01',
    date: '2026-10-13',
    supplier: 'Monte Altissimo Quarry',
    printCount: 1,
    printedBy: 'Kavita Sharma',
    status: 'Active',
    isArchived: false
  },
  {
    id: 'LBL-0003',
    labelNo: 'LBL-0003',
    labelType: 'Box',
    linkedRecordId: 'BOX-0002',
    template: 'Pallet Shipping Label',
    qrCode: 'QR-BOX-0002-TILES',
    barcode: '890100010003',
    stoneType: 'Black Galaxy Granite',
    size: '24" x 24"',
    thickness: '20mm',
    grade: 'Grade A',
    finish: 'Polished High Gloss',
    sqft: 48.0,
    location: 'Carrara Yard Main / Zone C / Rack 04',
    date: '2026-10-14',
    supplier: 'Monte Altissimo Quarry',
    printCount: 1,
    printedBy: 'Manoj Yadav',
    status: 'Active',
    isArchived: false
  }
];

// Defects & Scrap Store Records
export const initialDefectStoreRecords = [
  {
    id: 'DEF-0001',
    defectNo: 'DEF-0001',
    item: 'BLK-0001-Offcut',
    stepFound: 'Slicing',
    defectType: 'Edge Fissure Offcut',
    severity: 'Medium',
    photo: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=300&auto=format&fit=crop&q=80',
    action: 'Scrap',
    sqftOrWeightLost: '2.1 Tons',
    remarks: 'Natural edge loss during gangsaw squaring',
    date: '2026-10-13',
    isArchived: false
  }
];

// Stock Count Sheets
export const initialCountSheets = [
  {
    id: 'STK-0001',
    countSheetNo: 'STK-0001',
    yard: 'Carrara Yard Main',
    zone: 'Zone C',
    date: '2026-10-13',
    countedBy: 'Ramesh Patel',
    item: 'SLB-0001',
    systemQuantity: 1,
    physicalQuantity: 1,
    variance: 0,
    reason: 'Monthly Verification Audit',
    status: 'Approved',
    approvedBy: 'Rajesh Sharma',
    isArchived: false
  }
];

