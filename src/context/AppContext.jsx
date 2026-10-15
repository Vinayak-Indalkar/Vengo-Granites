import React, { createContext, useContext, useState, useEffect } from 'react';
import * as initialData from '../data/mockData';
import { translate, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { TradeProvider, TradeContext } from './TradeContext';

const AppContext = createContext();

const loadPersisted = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`granite_erp_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  // Roles: 'QT Super Admin' | 'Supplier/Client Admin' | 'Client HR Admin' | 'Buyer Admin'
  const [currentRole, setCurrentRole] = useState('Supplier/Client Admin');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Active Client: for multi-client separation. When null, QT Super Admin view.
  const [activeClient, setActiveClient] = useState(initialData.initialClients[0]);

  // Multilingual System: English | Hindi | Odia | Telugu
  const [language, setLanguageState] = useState(() => {
    return loadPersisted('language', 'English') || 'English';
  });

  const [currentUser, setCurrentUser] = useState({
    name: 'Rajesh Sharma',
    email: 'rajesh@vengogranites.com',
    role: 'Supplier/Client Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  });

  // Clients & Plans (QT Super Admin level)
  // Clients & Plans (QT Super Admin level)
  const [clients, setClients] = useState(() => {
    const loaded = loadPersisted('clients', initialData.initialClients || []);
    if (Array.isArray(loaded)) {
      return loaded.map(c => {
        const match = (initialData.initialClients || []).find(ic => ic.id === c.id);
        if (match) {
          return { ...c, adminName: match.adminName, adminEmail: match.adminEmail, contactPerson: match.contactPerson, email: match.email };
        }
        return c;
      });
    }
    return initialData.initialClients || [];
  });
  const [plans, setPlans] = useState(initialData.initialPlans || []);

  // Masters
  const [customers, setCustomers] = useState(() => {
    let loaded = loadPersisted('customers', null);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return initialData.initialCustomers || [];
    }
    const existingIds = new Set(loaded.map(c => c.id || c.code || c.legacyId));
    const missing = (initialData.initialCustomers || []).filter(ic => !existingIds.has(ic.id) && !existingIds.has(ic.code) && !existingIds.has(ic.legacyId));
    loaded = [...loaded, ...missing];

    return loaded.map(c => {
      const match = (initialData.initialCustomers || []).find(ic =>
        ic.id === c.id || ic.code === c.code || ic.legacyId === c.id || ic.legacyId === c.legacyId || ic.name === c.name
      );
      if (match) {
        return {
          ...match,
          ...c,
          id: c.id || match.id,
          code: c.code || match.code || c.id,
          name: c.name || match.name,
          type: c.type || match.type || 'Dealer',
          status: c.status || match.status || 'Active',
          contacts: (c.contacts && c.contacts.length > 0) ? c.contacts : (match.contacts || []),
          documents: (c.documents && c.documents.length > 0) ? c.documents : (match.documents || []),
          shippingAddresses: (c.shippingAddresses && c.shippingAddresses.length > 0) ? c.shippingAddresses : (match.shippingAddresses || [])
        };
      }
      return c;
    });
  });
  const [suppliers, setSuppliers] = useState(() => {
    let loaded = loadPersisted('suppliers', null);
    if (!Array.isArray(loaded) || loaded.length === 0) {
      return initialData.initialSuppliers || [];
    }
    const existingIds = new Set(loaded.map(s => s.id || s.code || s.legacyId));
    const missing = (initialData.initialSuppliers || []).filter(isup => !existingIds.has(isup.id) && !existingIds.has(isup.code) && !existingIds.has(isup.legacyId));
    loaded = [...loaded, ...missing];

    return loaded.map(s => {
      const match = (initialData.initialSuppliers || []).find(isup =>
        isup.id === s.id || isup.code === s.code || isup.legacyId === s.id || isup.legacyId === s.legacyId || isup.name === s.name
      );
      if (match) {
        return {
          ...match,
          ...s,
          id: s.id || match.id,
          code: s.code || match.code || s.id,
          name: s.name || match.name,
          type: s.type || match.type || 'Quarry',
          status: s.status || match.status || 'Active',
          contacts: (s.contacts && s.contacts.length > 0) ? s.contacts : (match.contacts || []),
          documents: (s.documents && s.documents.length > 0) ? s.documents : (match.documents || [])
        };
      }
      return s;
    });
  });
  const [stoneTypes, setStoneTypes] = useState(initialData.initialStoneTypes || []);
  const [rateLists, setRateLists] = useState(initialData.initialRateLists || []);
  const [yardLocations, setYardLocations] = useState(initialData.initialYardLocations || []);
  const [users, setUsers] = useState(() => {
    const loaded = loadPersisted('users', initialData.initialUsers || []);
    if (Array.isArray(loaded)) {
      return loaded.map(u => {
        const match = (initialData.initialUsers || []).find(iu => iu.id === u.id);
        if (match) {
          return { ...u, name: match.name, email: match.email };
        }
        return u;
      });
    }
    return initialData.initialUsers || [];
  });
  const [clientRoles, setClientRoles] = useState(() => loadPersisted('clientRoles', initialData.initialClientRoles || []));
  const [customFields, setCustomFields] = useState(() => loadPersisted('customFields', initialData.initialCustomFields || []));

  // HR & Biometrics with localStorage persistence
  const [personnel, setPersonnel] = useState(() => {
    let loaded = loadPersisted('personnel', initialData.initialPersonnel || []);
    if (Array.isArray(loaded)) {
      if (loaded.length < (initialData.initialPersonnel || []).length) {
        const existingIds = new Set(loaded.map(p => p.id));
        const missing = (initialData.initialPersonnel || []).filter(p => !existingIds.has(p.id));
        loaded = [...loaded, ...missing];
      }
      return loaded.map(p => {
        const match = (initialData.initialPersonnel || []).find(ip => ip.id === p.id || ip.code === p.code);
        if (match) {
          return {
            ...p,
            name: match.name,
            email: match.email,
            phone: match.phone,
            address: match.address,
            bankHolder: match.bankHolder,
            bankName: match.bankName,
            bankAccount: match.bankAccount,
            bankIfsc: match.bankIfsc,
            bankBranch: match.bankBranch
          };
        }
        if (!p.name || !p.name.trim()) {
          return {
            ...p,
            name: p.code ? `Personnel ${p.code}` : 'Team Member'
          };
        }
        return p;
      });
    }
    return loaded;
  });
  const [contractors, setContractors] = useState(() => {
    const loaded = loadPersisted('contractors', initialData.initialContractors || []);
    if (Array.isArray(loaded)) {
      return loaded.map(c => {
        const match = (initialData.initialContractors || []).find(ic => ic.id === c.id || ic.code === c.code);
        if (match) {
          return {
            ...c,
            companyName: match.companyName,
            contactPerson: match.contactPerson,
            phone: match.phone,
            email: match.email,
            address: match.address,
            bankName: match.bankName,
            bankAccount: match.bankAccount
          };
        }
        return c;
      });
    }
    return loaded;
  });
  const [departments, setDepartments] = useState(() => {
    const loaded = loadPersisted('departments', initialData.initialDepartments || []);
    if (Array.isArray(loaded)) {
      return loaded.map(d => {
        const match = (initialData.initialDepartments || []).find(id => id.id === d.id);
        if (match) {
          return { ...d, headOfDept: match.headOfDept };
        }
        return d;
      });
    }
    return loaded;
  });
  const [designations, setDesignations] = useState(() => loadPersisted('designations', initialData.initialDesignations || []));
  const [shifts, setShifts] = useState(() => loadPersisted('shifts', initialData.initialShifts || []));
  const [rosters, setRosters] = useState(() => {
    const loaded = loadPersisted('rosters', initialData.initialRosters || []);
    if (Array.isArray(loaded) && loaded.length < (initialData.initialRosters || []).length) {
      const existingIds = new Set(loaded.map(r => r.id));
      const missing = (initialData.initialRosters || []).filter(r => !existingIds.has(r.id));
      return [...loaded, ...missing];
    }
    return loaded;
  });
  const [leaveBalances, setLeaveBalances] = useState(() => loadPersisted('leaveBalances', initialData.initialLeaveBalances || []));
  const [leaveRequests, setLeaveRequests] = useState(() => loadPersisted('leaveRequests', initialData.initialLeaveRequests || []));
  const [leaveTypes, setLeaveTypes] = useState(() => loadPersisted('leaveTypes', initialData.initialLeaveTypes || []));
  const [holidays, setHolidays] = useState(() => {
    const loaded = loadPersisted('holidays', initialData.initialHolidays || []);
    if (Array.isArray(loaded)) {
      return loaded.map(h => {
        const match = (initialData.initialHolidays || []).find(ih => ih.id === h.id);
        if (match) {
          return { ...h, name: match.name, date: match.date };
        }
        return h;
      });
    }
    return initialData.initialHolidays || [];
  });
  const [punchDevices, setPunchDevices] = useState(() => loadPersisted('punchDevices', initialData.initialPunchDevices || []));
  const [attendance, setAttendance] = useState(() => loadPersisted('attendance', initialData.initialAttendance || []));
  const [overtimeApprovals, setOvertimeApprovals] = useState(() => loadPersisted('overtimeApprovals', initialData.initialOvertimeApprovals || []));
  const [advances, setAdvances] = useState(() => loadPersisted('advances', initialData.initialAdvances || []));
  const [payrollPeriods, setPayrollPeriods] = useState(() => loadPersisted('payrollPeriods', initialData.initialPayrollPeriods || []));
  const [biometricSettings, setBiometricSettings] = useState(() => loadPersisted('biometricSettings', {
    minConfidenceThreshold: 0.75,
    allowKioskSelfPunch: true,
    requireLocationCheck: false,
    duplicatePunchWindowMinutes: 5,
    faceMatchAlgorithm: 'High-Precision 3D Mesh',
    autoAssignConfidenceThreshold: 0.90,
    livenessDetection: true,
    offlinePunchSync: true,
    kioskTimeoutSeconds: 15,
    alertOnFailedAttempts: true
  }));
  const [toast, setToast] = useState(null);

  // Procurement & Receipts
  const [purchaseRequests, setPurchaseRequests] = useState(initialData.initialPurchaseRequests || []);
  const [purchaseOrders, setPurchaseOrders] = useState(initialData.initialPurchaseOrders || []);
  const [receipts, setReceipts] = useState(initialData.initialReceipts || []);

  // 4-Stage Inventory
  const [rawBlocks, setRawBlocks] = useState(initialData.initialRawBlocks || []);
  const [qa1Records, setQa1Records] = useState(initialData.initialQA1Records || []);
  const [cutSlabs, setCutSlabs] = useState(initialData.initialCutSlabs || []);
  const [polishedSlabs, setPolishedSlabs] = useState(initialData.initialPolishedSlabs || []);
  const [qa2Records, setQa2Records] = useState(initialData.initialQA2Records || []);
  const [bundles, setBundles] = useState(initialData.initialBundles || []);
  const [stockMovements, setStockMovements] = useState(initialData.initialStockMovements || []);
  const [stockTransfers, setStockTransfers] = useState(initialData.initialStockTransfers || []);
  const [stockCounts, setStockCounts] = useState(initialData.initialStockCounts || []);
  const [stockAdjustments, setStockAdjustments] = useState(initialData.initialStockAdjustments || []);

  // Helper to load persisted items and merge any missing initial items by id
  const loadAndMerge = (key, initialList) => {
    const loaded = loadPersisted(key, initialList || []);
    if (Array.isArray(loaded)) {
      const existingIds = new Set(loaded.map(x => x.id));
      const missing = (initialList || []).filter(x => !existingIds.has(x.id));
      if (missing.length > 0) return [...loaded, ...missing];
    }
    return loaded || initialList || [];
  };

  // 10-Step Sequential Inventory System (Supplier/Client Admin)
  const [gateEntries, setGateEntries] = useState(() => loadAndMerge('gateEntries', initialData.initialGateEntries || []));
  const [weighbridgeTickets, setWeighbridgeTickets] = useState(() => loadAndMerge('weighbridgeTickets', initialData.initialWeighbridgeTickets || []));
  const [detailedRawBlocks, setDetailedRawBlocks] = useState(() => loadAndMerge('detailedRawBlocks', initialData.initialDetailedRawBlocks || []));
  const [qc1Inspections, setQc1Inspections] = useState(() => loadAndMerge('qc1Inspections', initialData.initialQC1Inspections || []));
  const [materialsStock, setMaterialsStock] = useState(() => loadAndMerge('materialsStock', initialData.initialMaterialsStock || []));
  const [materialJobs, setMaterialJobs] = useState(() => loadAndMerge('materialJobs', initialData.initialMaterialJobs || []));
  const [slicingJobs, setSlicingJobs] = useState(() => loadAndMerge('slicingJobs', initialData.initialSlicingJobs || []));
  const [lots, setLots] = useState(() => loadAndMerge('lots', initialData.initialLots || []));
  const [slabs, setSlabs] = useState(() => loadAndMerge('slabs', initialData.initialSlabs || []));
  const [qc2Inspections, setQc2Inspections] = useState(() => loadAndMerge('qc2Inspections', initialData.initialQC2Inspections || []));
  const [cutToSizeJobs, setCutToSizeJobs] = useState(() => loadAndMerge('cutToSizeJobs', initialData.initialCutToSizeJobs || []));
  const [pieces, setPieces] = useState(() => loadAndMerge('pieces', initialData.initialPieces || []));
  const [boxes, setBoxes] = useState(() => loadAndMerge('boxes', initialData.initialBoxes || []));
  const [storageMovements, setStorageMovements] = useState(() => loadAndMerge('storageMovements', initialData.initialStorageMovements || []));
  const [labels, setLabels] = useState(() => loadAndMerge('labels', initialData.initialLabels || []));
  const [defectStoreRecords, setDefectStoreRecords] = useState(() => loadAndMerge('defectStoreRecords', initialData.initialDefectStoreRecords || []));
  const [countSheets, setCountSheets] = useState(() => loadAndMerge('countSheets', initialData.initialCountSheets || []));

  // Settings Masters (Supplier/Client Admin)
  const [finishes, setFinishes] = useState(() => loadAndMerge('finishes', initialData.initialFinishes || []));
  const [thicknesses, setThicknesses] = useState(() => loadAndMerge('thicknesses', initialData.initialThicknesses || []));
  const [grades, setGrades] = useState(() => loadAndMerge('grades', initialData.initialGrades || []));
  const [machines, setMachines] = useState(() => loadAndMerge('machines', initialData.initialMachines || []));
  const [defectTypesMaster, setDefectTypesMaster] = useState(() => loadAndMerge('defectTypesMaster', initialData.initialDefectTypes || []));
  const [labelTemplatesMaster, setLabelTemplatesMaster] = useState(() => loadAndMerge('labelTemplatesMaster', initialData.initialLabelTemplates || []));
  const [yardsMaster, setYardsMaster] = useState(() => loadAndMerge('yardsMaster', initialData.initialYardsMaster || []));
  const [zonesMaster, setZonesMaster] = useState(() => loadAndMerge('zonesMaster', initialData.initialZonesMaster || []));
  const [racksBaysMaster, setRacksBaysMaster] = useState(() => loadAndMerge('racksBaysMaster', initialData.initialRacksBaysMaster || []));

  // Sales & Commercial
  const [salesOrders, setSalesOrders] = useState(initialData.initialSalesOrders || []);
  const [invoices, setInvoices] = useState(initialData.initialInvoices || []);
  const [challans, setChallans] = useState(initialData.initialChallans || []);
  const [dispatches, setDispatches] = useState(initialData.initialDispatches || []);

  // Accounts
  const [supplierBills, setSupplierBills] = useState(initialData.initialSupplierBills || []);
  const [supplierPayments, setSupplierPayments] = useState(initialData.initialSupplierPayments || []);
  const [customerPayments, setCustomerPayments] = useState(initialData.initialCustomerPayments || []);
  const [contractorPayments, setContractorPayments] = useState(initialData.initialContractorPayments || []);

  // Returns, Defects, Scrap
  const [defectiveStore, setDefectiveStore] = useState(initialData.initialDefectiveStore || []);
  const [debitNotes, setDebitNotes] = useState(initialData.initialDebitNotes || []);
  const [creditNotes, setCreditNotes] = useState(initialData.initialCreditNotes || []);
  const [scrapWriteOffs, setScrapWriteOffs] = useState(initialData.initialScrapWriteOffs || []);

  // Notifications & Audit
  const [notifications, setNotifications] = useState(initialData.initialNotifications || []);
  const [auditLogs, setAuditLogs] = useState(() => {
    const loaded = loadPersisted('auditLogs', initialData.initialAuditLogs || []);
    if (Array.isArray(loaded)) {
      return loaded.map(a => {
        const match = (initialData.initialAuditLogs || []).find(ia => ia.id === a.id);
        if (match) {
          return { ...a, user: match.user };
        }
        return a;
      });
    }
    return initialData.initialAuditLogs || [];
  });

  // Toast Notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3500);
  };

  // Audit Logging helper
  const logAudit = (action, entity, details) => {
    const newEntry = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      clientId: activeClient ? activeClient.id : 'SYSTEM',
      action,
      entity,
      user: currentUser.name,
      role: currentRole,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Language switcher & translation helper
  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('granite_erp_language', JSON.stringify(newLang));
    } catch (e) {}
    if (activeClient && activeClient.id) {
      setClients(prev => prev.map(c => c.id === activeClient.id ? {
        ...c,
        settings: { ...(c.settings || {}), language: newLang }
      } : c));
    }
    logAudit('LANGUAGE_CHANGE', newLang, `Changed system language to ${newLang}`);
    showToast(`Language set to ${newLang}`, 'success');
  };

  const t = (key, fallback = null) => translate(key, language, fallback);

  // LocalStorage Auto-persistence
  useEffect(() => { try { localStorage.setItem('granite_erp_language', JSON.stringify(language)); } catch (e) {} }, [language]);
  useEffect(() => { try { localStorage.setItem('granite_erp_personnel', JSON.stringify(personnel)); } catch (e) {} }, [personnel]);
  useEffect(() => { try { localStorage.setItem('granite_erp_contractors', JSON.stringify(contractors)); } catch (e) {} }, [contractors]);
  useEffect(() => { try { localStorage.setItem('granite_erp_departments', JSON.stringify(departments)); } catch (e) {} }, [departments]);
  useEffect(() => { try { localStorage.setItem('granite_erp_designations', JSON.stringify(designations)); } catch (e) {} }, [designations]);
  useEffect(() => { try { localStorage.setItem('granite_erp_shifts', JSON.stringify(shifts)); } catch (e) {} }, [shifts]);
  useEffect(() => { try { localStorage.setItem('granite_erp_rosters', JSON.stringify(rosters)); } catch (e) {} }, [rosters]);
  useEffect(() => { try { localStorage.setItem('granite_erp_leaveBalances', JSON.stringify(leaveBalances)); } catch (e) {} }, [leaveBalances]);
  useEffect(() => { try { localStorage.setItem('granite_erp_leaveRequests', JSON.stringify(leaveRequests)); } catch (e) {} }, [leaveRequests]);
  useEffect(() => { try { localStorage.setItem('granite_erp_leaveTypes', JSON.stringify(leaveTypes)); } catch (e) {} }, [leaveTypes]);
  useEffect(() => { try { localStorage.setItem('granite_erp_holidays', JSON.stringify(holidays)); } catch (e) {} }, [holidays]);
  useEffect(() => { try { localStorage.setItem('granite_erp_punchDevices', JSON.stringify(punchDevices)); } catch (e) {} }, [punchDevices]);
  useEffect(() => { try { localStorage.setItem('granite_erp_attendance', JSON.stringify(attendance)); } catch (e) {} }, [attendance]);
  useEffect(() => { try { localStorage.setItem('granite_erp_advances', JSON.stringify(advances)); } catch (e) {} }, [advances]);
  useEffect(() => { try { localStorage.setItem('granite_erp_payrollPeriods', JSON.stringify(payrollPeriods)); } catch (e) {} }, [payrollPeriods]);
  useEffect(() => { try { localStorage.setItem('granite_erp_biometricSettings', JSON.stringify(biometricSettings)); } catch (e) {} }, [biometricSettings]);
  useEffect(() => { try { localStorage.setItem('granite_erp_auditLogs', JSON.stringify(auditLogs)); } catch (e) {} }, [auditLogs]);
  useEffect(() => { try { localStorage.setItem('granite_erp_customFields', JSON.stringify(customFields)); } catch (e) {} }, [customFields]);
  useEffect(() => { try { localStorage.setItem('granite_erp_clientRoles', JSON.stringify(clientRoles)); } catch (e) {} }, [clientRoles]);
  useEffect(() => { try { localStorage.setItem('granite_erp_suppliers', JSON.stringify(suppliers)); } catch (e) {} }, [suppliers]);
  useEffect(() => { try { localStorage.setItem('granite_erp_customers', JSON.stringify(customers)); } catch (e) {} }, [customers]);

  // 10-Step Sequential Inventory Auto-persistence
  useEffect(() => { try { localStorage.setItem('granite_erp_gateEntries', JSON.stringify(gateEntries)); } catch (e) {} }, [gateEntries]);
  useEffect(() => { try { localStorage.setItem('granite_erp_weighbridgeTickets', JSON.stringify(weighbridgeTickets)); } catch (e) {} }, [weighbridgeTickets]);
  useEffect(() => { try { localStorage.setItem('granite_erp_detailedRawBlocks', JSON.stringify(detailedRawBlocks)); } catch (e) {} }, [detailedRawBlocks]);
  useEffect(() => { try { localStorage.setItem('granite_erp_qc1Inspections', JSON.stringify(qc1Inspections)); } catch (e) {} }, [qc1Inspections]);
  useEffect(() => { try { localStorage.setItem('granite_erp_materialsStock', JSON.stringify(materialsStock)); } catch (e) {} }, [materialsStock]);
  useEffect(() => { try { localStorage.setItem('granite_erp_materialJobs', JSON.stringify(materialJobs)); } catch (e) {} }, [materialJobs]);
  useEffect(() => { try { localStorage.setItem('granite_erp_slicingJobs', JSON.stringify(slicingJobs)); } catch (e) {} }, [slicingJobs]);
  useEffect(() => { try { localStorage.setItem('granite_erp_lots', JSON.stringify(lots)); } catch (e) {} }, [lots]);
  useEffect(() => { try { localStorage.setItem('granite_erp_slabs', JSON.stringify(slabs)); } catch (e) {} }, [slabs]);
  useEffect(() => { try { localStorage.setItem('granite_erp_qc2Inspections', JSON.stringify(qc2Inspections)); } catch (e) {} }, [qc2Inspections]);
  useEffect(() => { try { localStorage.setItem('granite_erp_cutToSizeJobs', JSON.stringify(cutToSizeJobs)); } catch (e) {} }, [cutToSizeJobs]);
  useEffect(() => { try { localStorage.setItem('granite_erp_pieces', JSON.stringify(pieces)); } catch (e) {} }, [pieces]);
  useEffect(() => { try { localStorage.setItem('granite_erp_boxes', JSON.stringify(boxes)); } catch (e) {} }, [boxes]);
  useEffect(() => { try { localStorage.setItem('granite_erp_storageMovements', JSON.stringify(storageMovements)); } catch (e) {} }, [storageMovements]);
  useEffect(() => { try { localStorage.setItem('granite_erp_labels', JSON.stringify(labels)); } catch (e) {} }, [labels]);
  useEffect(() => { try { localStorage.setItem('granite_erp_defectStoreRecords', JSON.stringify(defectStoreRecords)); } catch (e) {} }, [defectStoreRecords]);
  useEffect(() => { try { localStorage.setItem('granite_erp_countSheets', JSON.stringify(countSheets)); } catch (e) {} }, [countSheets]);
  useEffect(() => { try { localStorage.setItem('granite_erp_finishes', JSON.stringify(finishes)); } catch (e) {} }, [finishes]);
  useEffect(() => { try { localStorage.setItem('granite_erp_thicknesses', JSON.stringify(thicknesses)); } catch (e) {} }, [thicknesses]);
  useEffect(() => { try { localStorage.setItem('granite_erp_grades', JSON.stringify(grades)); } catch (e) {} }, [grades]);
  useEffect(() => { try { localStorage.setItem('granite_erp_machines', JSON.stringify(machines)); } catch (e) {} }, [machines]);
  useEffect(() => { try { localStorage.setItem('granite_erp_defectTypesMaster', JSON.stringify(defectTypesMaster)); } catch (e) {} }, [defectTypesMaster]);
  useEffect(() => { try { localStorage.setItem('granite_erp_labelTemplatesMaster', JSON.stringify(labelTemplatesMaster)); } catch (e) {} }, [labelTemplatesMaster]);
  useEffect(() => { try { localStorage.setItem('granite_erp_yardsMaster', JSON.stringify(yardsMaster)); } catch (e) {} }, [yardsMaster]);
  useEffect(() => { try { localStorage.setItem('granite_erp_zonesMaster', JSON.stringify(zonesMaster)); } catch (e) {} }, [zonesMaster]);
  useEffect(() => { try { localStorage.setItem('granite_erp_racksBaysMaster', JSON.stringify(racksBaysMaster)); } catch (e) {} }, [racksBaysMaster]);

  // Log Stock Movement helper
  const logMovement = (itemId, itemType, fromLoc, toLoc, reason) => {
    const mov = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      clientId: activeClient ? activeClient.id : 'CLI-001',
      itemId,
      itemType,
      fromLoc,
      toLoc,
      date: new Date().toISOString().slice(0, 10),
      user: currentUser.name,
      reason
    };
    setStockMovements(prev => [mov, ...prev]);
  };

  // Role switch & login
  const login = (role, email, clientId = null) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    const userAvatars = {
      'Aditya Varma': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'Rajesh Sharma': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'Ananya Iyer': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      'Karan Malhotra': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      'Vikram Singhania': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      'Pooja Verma': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      'Rohan Sharma': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    };
    if (role === 'QT Super Admin') {
      setActiveClient(null);
      setCurrentUser({
        name: 'Aditya Varma',
        email: email || 'aditya@quantira.io',
        role,
        avatar: userAvatars['Aditya Varma']
      });
    } else {
      const cli = clients.find(c => c.id === clientId) || clients[0];
      setActiveClient(cli);
      const names = {
        'Supplier/Client Admin': cli.adminName || 'Rajesh Sharma',
        'Client HR Admin': 'Ananya Iyer',
        'Buyer Admin': 'Karan Malhotra'
      };
      const userName = names[role] || 'Staff Member';
      setCurrentUser({
        name: userName,
        email: email || cli.adminEmail || 'user@granite.io',
        role,
        avatar: userAvatars[userName] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      });
    }
    logAudit('LOGIN', role, `Logged in as ${role}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAudit('LOGOUT', currentRole, 'Logged out');
  };

  const switchClient = (clientId) => {
    const userAvatars = {
      'Aditya Varma': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'Rajesh Sharma': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    };
    if (!clientId || clientId === 'MASTER') {
      setActiveClient(null);
      setCurrentRole('QT Super Admin');
      setCurrentUser({
        name: 'Aditya Varma',
        email: 'aditya@quantira.io',
        role: 'QT Super Admin',
        avatar: userAvatars['Aditya Varma']
      });
    } else {
      const cli = clients.find(c => c.id === clientId);
      if (cli) {
        setActiveClient(cli);
        if (currentRole === 'QT Super Admin') {
          setCurrentRole('Supplier/Client Admin');
        }
        const name = cli.adminName || `${cli.name} Admin`;
        setCurrentUser({
          name,
          email: cli.adminEmail,
          role: currentRole === 'QT Super Admin' ? 'Supplier/Client Admin' : currentRole,
          avatar: userAvatars[name] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
        });
      }
    }
  };

  // --- CLIENT ONBOARDING & MANAGEMENT (QT Super Admin) ---
  const addClient = (data) => {
    const newId = `CLI-00${clients.length + 1}`;
    const newCli = {
      ...data,
      id: newId,
      logo: data.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=100&auto=format&fit=crop&q=80',
      brandColor: data.brandColor || '#222350',
      status: 'Active',
      modules: data.modules || ['inventory', 'purchase', 'receipts', 'sales', 'accounts', 'returns', 'reports', 'hr'],
      limits: data.limits || { users: 15, employees: 50, yards: 3, modules: 8 },
      settings: {
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'UTC',
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
    };
    setClients(prev => [newCli, ...prev]);

    // Provision admin user
    const adminUsr = {
      id: `USR-00${users.length + 1}`,
      clientId: newId,
      name: data.adminName || `${data.name} Admin`,
      email: data.adminEmail || `admin@${newId.toLowerCase()}.io`,
      role: 'Company Admin',
      status: 'Active'
    };
    setUsers(prev => [adminUsr, ...prev]);

    logAudit('CREATE_CLIENT', newId, `Onboarded client ${newCli.name}`);
    return newCli;
  };

  const updateClient = (id, data) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    if (activeClient && activeClient.id === id) {
      setActiveClient(prev => ({ ...prev, ...data }));
    }
    logAudit('UPDATE_CLIENT', id, `Updated client ${id}`);
  };

  const toggleClientBlock = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Blocked' ? 'Active' : 'Blocked';
        logAudit('STATUS_CLIENT', id, `Client ${c.name} ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const resetClientAdminPassword = (clientId) => {
    logAudit('RESET_PASSWORD', clientId, `Reset admin password for client ${clientId}`);
  };

  // --- MASTERS CRUD ---
  // --- MASTERS CRUD: CUSTOMERS / BUYERS ---
  const addCustomer = (item) => {
    const maxCodeNum = customers.reduce((max, c) => {
      const match = (c.code || c.id || '').match(/BUY-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const generatedCode = `BUY-${String(maxCodeNum + 1).padStart(4, '0')}`;
    const code = item.code || item.id || generatedCode;
    const id = code;

    const newBuyer = {
      ...item,
      id,
      code,
      legacyId: item.legacyId || null,
      clientId: activeClient ? activeClient.id : 'CLI-001',
      name: item.name || '',
      type: item.type || 'Direct End-User',
      taxId: item.taxId || '',
      pan: item.pan || '',
      phone: item.phone || '',
      email: item.email || '',
      website: item.website || '',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      country: item.country || 'India',
      pincode: item.pincode || '',
      shippingAddresses: Array.isArray(item.shippingAddresses) ? item.shippingAddresses : [],
      creditLimit: Number(item.creditLimit) || 500000,
      balance: Number(item.balance) || 0,
      creditDays: Number(item.creditDays) || 30,
      priceList: item.priceList || 'Standard Retail 2026',
      currency: item.currency || 'INR',
      deliveryTerms: item.deliveryTerms || 'Ex-Factory / Yard',
      paymentTerms: item.paymentTerms || 'Net 30 Days',
      tolerance: Number(item.tolerance) || 2.0,
      bankName: item.bankName || '',
      bankAccount: item.bankAccount || '',
      bankIfsc: item.bankIfsc || '',
      contacts: Array.isArray(item.contacts) ? item.contacts : [],
      documents: Array.isArray(item.documents) ? item.documents : [],
      status: item.status || 'Active',
      isBlocked: !!item.isBlocked,
      blockReason: item.blockReason || '',
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [newBuyer, ...prev]);
    logAudit('CREATE_BUYER', id, `Registered buyer ${newBuyer.name} (${id})`);
    showToast(`Buyer ${newBuyer.name} created successfully!`, 'success');
    return newBuyer;
  };

  const updateCustomer = (id, data) => {
    let oldBuyer = null;
    setCustomers(prev => prev.map(c => {
      if (c.id === id || c.code === id) {
        oldBuyer = c;
        return { ...c, ...data, id: c.id, code: c.code || c.id };
      }
      return c;
    }));

    // Data sync: update salesOrders, invoices, payments, dispatches if name changes
    if (data.name && oldBuyer && oldBuyer.name !== data.name) {
      setSalesOrders(prev => prev.map(so => (so.customerId === id || so.customer === oldBuyer.name) ? { ...so, customer: data.name } : so));
      setInvoices(prev => prev.map(inv => (inv.customerId === id || inv.customer === oldBuyer.name) ? { ...inv, customer: data.name } : inv));
      setDispatches(prev => prev.map(d => (d.customer === oldBuyer.name) ? { ...d, customer: data.name } : d));
      setCustomerPayments(prev => prev.map(cp => (cp.customer === oldBuyer.name) ? { ...cp, customer: data.name } : cp));
    }

    logAudit('UPDATE_BUYER', id, `Updated details for buyer ${data.name || oldBuyer?.name || id}`);
    showToast(`Buyer ${data.name || oldBuyer?.name || id} updated successfully!`, 'success');
  };

  const deleteCustomer = (id) => {
    const target = customers.find(c => c.id === id || c.code === id);
    if (!target) return { action: 'not_found' };

    const isUsed = 
      salesOrders.some(so => so.customerId === id || so.customer === target.name || (target.legacyId && so.customerId === target.legacyId)) ||
      invoices.some(inv => inv.customerId === id || inv.customer === target.name || (target.legacyId && inv.customerId === target.legacyId)) ||
      customerPayments.some(p => p.customer === target.name) ||
      dispatches.some(d => d.customer === target.name);

    if (isUsed) {
      setCustomers(prev => prev.map(c => (c.id === id || c.code === id) ? { ...c, status: 'Inactive', isArchived: true } : c));
      logAudit('ARCHIVE_BUYER', id, `Archived buyer ${target.name} (has active sales orders/invoices)`);
      showToast(`Buyer ${target.name} has active orders/invoices and was marked Inactive (Archived).`, 'info');
      return { action: 'archived' };
    } else {
      setCustomers(prev => prev.filter(c => c.id !== id && c.code !== id));
      logAudit('DELETE_BUYER', id, `Permanently removed unused buyer ${target.name}`);
      showToast(`Buyer ${target.name} permanently removed.`, 'success');
      return { action: 'deleted' };
    }
  };

  const restoreCustomer = (id) => {
    const target = customers.find(c => c.id === id || c.code === id);
    if (!target) return;
    setCustomers(prev => prev.map(c => (c.id === id || c.code === id) ? { ...c, status: 'Active', isArchived: false } : c));
    logAudit('RESTORE_BUYER', id, `Restored buyer ${target.name} to Active`);
    showToast(`Buyer ${target.name} restored to Active!`, 'success');
  };

  const toggleCustomerBlock = (id, reason = '') => {
    const target = customers.find(c => c.id === id || c.code === id);
    if (!target) return;
    const willBlock = !target.isBlocked;
    setCustomers(prev => prev.map(c => (c.id === id || c.code === id) ? {
      ...c,
      isBlocked: willBlock,
      blockReason: willBlock ? (reason || 'Admin block applied') : ''
    } : c));

    if (willBlock) {
      logAudit('BLOCK_BUYER', id, `Blocked buyer ${target.name}. Reason: ${reason || 'Unspecified'}`);
      showToast(`Buyer ${target.name} has been BLOCKED. New sales orders restricted.`, 'error');
    } else {
      logAudit('UNBLOCK_BUYER', id, `Unblocked buyer ${target.name}`);
      showToast(`Buyer ${target.name} unblocked successfully!`, 'success');
    }
  };

  const bulkArchiveCustomers = (ids) => {
    setCustomers(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Inactive', isArchived: true } : c));
    logAudit('BULK_ARCHIVE_BUYERS', 'BUYERS', `Archived ${ids.length} buyers`);
    showToast(`${ids.length} buyers archived.`, 'info');
  };

  const bulkRestoreCustomers = (ids) => {
    setCustomers(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Active', isArchived: false } : c));
    logAudit('BULK_RESTORE_BUYERS', 'BUYERS', `Restored ${ids.length} buyers to Active`);
    showToast(`${ids.length} buyers restored to Active.`, 'success');
  };

  const addCustomerContact = (customerId, contact) => {
    const contactId = `CNT-${Date.now().toString().slice(-4)}`;
    const newContact = { ...contact, id: contactId };
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        const existing = c.contacts || [];
        const updated = newContact.isPrimary ? existing.map(ct => ({ ...ct, isPrimary: false })) : existing;
        return { ...c, contacts: [...updated, newContact] };
      }
      return c;
    }));
    logAudit('ADD_BUYER_CONTACT', customerId, `Added contact ${newContact.name} to buyer`);
    showToast(`Contact ${newContact.name} added!`, 'success');
  };

  const updateCustomerContact = (customerId, contactId, contactData) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        const updated = (c.contacts || []).map(ct => {
          if (ct.id === contactId) {
            return { ...ct, ...contactData };
          }
          if (contactData.isPrimary) {
            return { ...ct, isPrimary: false };
          }
          return ct;
        });
        return { ...c, contacts: updated };
      }
      return c;
    }));
    logAudit('UPDATE_BUYER_CONTACT', customerId, `Updated contact ${contactId}`);
    showToast(`Contact updated!`, 'success');
  };

  const deleteCustomerContact = (customerId, contactId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        return { ...c, contacts: (c.contacts || []).filter(ct => ct.id !== contactId) };
      }
      return c;
    }));
    logAudit('DELETE_BUYER_CONTACT', customerId, `Removed contact ${contactId}`);
    showToast(`Contact removed.`, 'info');
  };

  const addCustomerAddress = (customerId, address) => {
    const addrId = `ADR-${Date.now().toString().slice(-4)}`;
    const newAddr = { ...address, id: addrId };
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        const existing = c.shippingAddresses || [];
        const updated = newAddr.isDefault ? existing.map(a => ({ ...a, isDefault: false })) : existing;
        return { ...c, shippingAddresses: [...updated, newAddr] };
      }
      return c;
    }));
    logAudit('ADD_BUYER_ADDRESS', customerId, `Added shipping address ${newAddr.label || addrId}`);
    showToast(`Shipping address added!`, 'success');
  };

  const updateCustomerAddress = (customerId, addressId, addressData) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        const updated = (c.shippingAddresses || []).map(a => {
          if (a.id === addressId) {
            return { ...a, ...addressData };
          }
          if (addressData.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        return { ...c, shippingAddresses: updated };
      }
      return c;
    }));
    logAudit('UPDATE_BUYER_ADDRESS', customerId, `Updated shipping address ${addressId}`);
    showToast(`Shipping address updated!`, 'success');
  };

  const deleteCustomerAddress = (customerId, addressId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        return { ...c, shippingAddresses: (c.shippingAddresses || []).filter(a => a.id !== addressId) };
      }
      return c;
    }));
    logAudit('DELETE_BUYER_ADDRESS', customerId, `Removed shipping address ${addressId}`);
    showToast(`Shipping address removed.`, 'info');
  };

  const addCustomerDocument = (customerId, doc) => {
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    const newDoc = { ...doc, id: docId };
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        return { ...c, documents: [...(c.documents || []), newDoc] };
      }
      return c;
    }));
    logAudit('ADD_BUYER_DOCUMENT', customerId, `Uploaded document ${newDoc.name}`);
    showToast(`Document ${newDoc.name} uploaded!`, 'success');
  };

  const updateCustomerDocument = (customerId, docId, docData) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        const updated = (c.documents || []).map(d => d.id === docId ? { ...d, ...docData } : d);
        return { ...c, documents: updated };
      }
      return c;
    }));
    logAudit('UPDATE_BUYER_DOCUMENT', customerId, `Updated document ${docId}`);
    showToast(`Document updated!`, 'success');
  };

  const deleteCustomerDocument = (customerId, docId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId || c.code === customerId) {
        return { ...c, documents: (c.documents || []).filter(d => d.id !== docId) };
      }
      return c;
    }));
    logAudit('DELETE_BUYER_DOCUMENT', customerId, `Removed document ${docId}`);
    showToast(`Document removed.`, 'info');
  };

  const addSupplier = (item) => {
    const maxCodeNum = suppliers.reduce((max, s) => {
      const match = (s.code || s.id || '').match(/SUP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const generatedCode = `SUP-${String(maxCodeNum + 1).padStart(4, '0')}`;
    const code = item.code || item.id || generatedCode;
    const id = code;

    const newSupplier = {
      ...item,
      id,
      code,
      legacyId: item.legacyId || null,
      clientId: activeClient ? activeClient.id : 'CLI-001',
      status: item.status || 'Active',
      isArchived: false,
      contacts: Array.isArray(item.contacts) ? item.contacts : [],
      documents: Array.isArray(item.documents) ? item.documents : [],
      rating: item.rating || 'A',
      qualityScore: Number(item.qualityScore) || 90,
      deliveryScore: Number(item.deliveryScore) || 90,
      paymentDays: Number(item.paymentDays) || 30,
      creditDays: Number(item.creditDays) || 30,
      currency: item.currency || 'INR',
      weightTolerance: Number(item.weightTolerance) || 2.0,
      createdAt: new Date().toISOString()
    };

    setSuppliers(prev => [newSupplier, ...prev]);
    logAudit('CREATE', id, `Registered supplier ${newSupplier.name} (${id})`);
    showToast(`Supplier ${newSupplier.name} created successfully!`, 'success');
    return newSupplier;
  };

  const updateSupplier = (id, data) => {
    let oldSupplier = null;
    setSuppliers(prev => prev.map(s => {
      if (s.id === id || s.code === id) {
        oldSupplier = s;
        return { ...s, ...data, id: s.id, code: s.code || s.id };
      }
      return s;
    }));

    // Data sync: Editing supplier updates every PO, GRN, Raw Block, bill, payment that uses it
    if (data.name && oldSupplier && oldSupplier.name !== data.name) {
      setPurchaseOrders(prev => prev.map(po => (po.supplierId === id || po.supplier === oldSupplier.name) ? { ...po, supplier: data.name } : po));
      setGateEntries(prev => prev.map(g => (g.supplier === oldSupplier.name) ? { ...g, supplier: data.name } : g));
      setDetailedRawBlocks(prev => prev.map(b => (b.supplier === oldSupplier.name) ? { ...b, supplier: data.name } : b));
      setSupplierBills(prev => prev.map(sb => (sb.supplierId === id || sb.supplier === oldSupplier.name) ? { ...sb, supplier: data.name } : sb));
      setSupplierPayments(prev => prev.map(sp => (sp.supplier === oldSupplier.name) ? { ...sp, supplier: data.name } : sp));
    }

    logAudit('UPDATE', id, `Updated details for supplier ${data.name || oldSupplier?.name || id}`);
    showToast(`Supplier ${data.name || oldSupplier?.name || id} updated successfully!`, 'success');
  };

  const deleteSupplier = (id) => {
    const target = suppliers.find(s => s.id === id || s.code === id);
    if (!target) return { action: 'not_found' };

    // Check if supplier is used in downstream transactions
    const isUsed = 
      purchaseOrders.some(po => po.supplierId === id || po.supplier === target.name || (target.legacyId && po.supplierId === target.legacyId)) ||
      gateEntries.some(g => g.supplier === target.name) ||
      detailedRawBlocks.some(b => b.supplier === target.name) ||
      supplierBills.some(b => b.supplierId === id || b.supplier === target.name || (target.legacyId && b.supplierId === target.legacyId)) ||
      supplierPayments.some(p => p.supplier === target.name);

    if (isUsed) {
      // Archive instead of remove
      setSuppliers(prev => prev.map(s => (s.id === id || s.code === id) ? { ...s, status: 'Inactive', isArchived: true } : s));
      logAudit('ARCHIVE', id, `Archived supplier ${target.name} (has active linked transactions)`);
      showToast(`Supplier ${target.name} has linked transactions and was moved to Inactive (Archived).`, 'info');
      return { action: 'archived' };
    } else {
      // Permanently remove
      setSuppliers(prev => prev.filter(s => s.id !== id && s.code !== id));
      logAudit('DELETE', id, `Permanently removed unused supplier ${target.name}`);
      showToast(`Supplier ${target.name} permanently removed.`, 'success');
      return { action: 'deleted' };
    }
  };

  const restoreSupplier = (id) => {
    const target = suppliers.find(s => s.id === id || s.code === id);
    if (!target) return;
    setSuppliers(prev => prev.map(s => (s.id === id || s.code === id) ? { ...s, status: 'Active', isArchived: false } : s));
    logAudit('RESTORE', id, `Restored supplier ${target.name} to Active`);
    showToast(`Supplier ${target.name} restored to Active!`, 'success');
  };

  const bulkArchiveSuppliers = (ids) => {
    setSuppliers(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: 'Inactive', isArchived: true } : s));
    logAudit('BULK_ARCHIVE', 'SUPPLIERS', `Archived ${ids.length} suppliers`);
    showToast(`${ids.length} suppliers archived.`, 'info');
  };

  const bulkRestoreSuppliers = (ids) => {
    setSuppliers(prev => prev.map(s => ids.includes(s.id) ? { ...s, status: 'Active', isArchived: false } : s));
    logAudit('BULK_RESTORE', 'SUPPLIERS', `Restored ${ids.length} suppliers to Active`);
    showToast(`${ids.length} suppliers restored to Active.`, 'success');
  };

  const addSupplierContact = (supplierId, contact) => {
    const contactId = `CNT-${Date.now().toString().slice(-4)}`;
    const newContact = { ...contact, id: contactId };
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        const existing = s.contacts || [];
        const updated = newContact.isPrimary ? existing.map(c => ({ ...c, isPrimary: false })) : existing;
        return { ...s, contacts: [...updated, newContact] };
      }
      return s;
    }));
    logAudit('ADD_CONTACT', supplierId, `Added contact ${newContact.name} to supplier`);
    showToast(`Contact ${newContact.name} added!`, 'success');
  };

  const updateSupplierContact = (supplierId, contactId, contactData) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        const updated = (s.contacts || []).map(c => {
          if (c.id === contactId) {
            return { ...c, ...contactData };
          }
          if (contactData.isPrimary) {
            return { ...c, isPrimary: false };
          }
          return c;
        });
        return { ...s, contacts: updated };
      }
      return s;
    }));
    logAudit('UPDATE_CONTACT', supplierId, `Updated contact ${contactId}`);
    showToast(`Contact updated!`, 'success');
  };

  const deleteSupplierContact = (supplierId, contactId) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        return { ...s, contacts: (s.contacts || []).filter(c => c.id !== contactId) };
      }
      return s;
    }));
    logAudit('DELETE_CONTACT', supplierId, `Removed contact ${contactId}`);
    showToast(`Contact removed.`, 'info');
  };

  const addSupplierDocument = (supplierId, doc) => {
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    const newDoc = { ...doc, id: docId };
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        return { ...s, documents: [...(s.documents || []), newDoc] };
      }
      return s;
    }));
    logAudit('ADD_DOCUMENT', supplierId, `Uploaded document ${newDoc.name}`);
    showToast(`Document ${newDoc.name} uploaded!`, 'success');
  };

  const updateSupplierDocument = (supplierId, docId, docData) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        const updated = (s.documents || []).map(d => d.id === docId ? { ...d, ...docData } : d);
        return { ...s, documents: updated };
      }
      return s;
    }));
    logAudit('UPDATE_DOCUMENT', supplierId, `Updated document ${docId}`);
    showToast(`Document updated!`, 'success');
  };

  const deleteSupplierDocument = (supplierId, docId) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId || s.code === supplierId) {
        return { ...s, documents: (s.documents || []).filter(d => d.id !== docId) };
      }
      return s;
    }));
    logAudit('DELETE_DOCUMENT', supplierId, `Removed document ${docId}`);
    showToast(`Document removed.`, 'info');
  };

  const addStoneType = (item) => {
    const newItem = { ...item, id: `ST-${String(stoneTypes.length + 1).padStart(3, '0')}`, clientId: activeClient?.id };
    setStoneTypes(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created stone type ${newItem.name}`);
  };
  const updateStoneType = (id, data) => {
    setStoneTypes(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    logAudit('UPDATE', id, `Updated stone type ${id}`);
  };
  const deleteStoneType = (id) => {
    setStoneTypes(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE', id, `Deleted stone type ${id}`);
  };

  const addRateList = (item) => {
    const newItem = { ...item, id: `RL-${String(rateLists.length + 1).padStart(3, '0')}`, clientId: activeClient?.id };
    setRateLists(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created rate list ${newItem.name}`);
  };
  const updateRateList = (id, data) => {
    setRateLists(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logAudit('UPDATE', id, `Updated rate list ${id}`);
  };
  const deleteRateList = (id) => {
    setRateLists(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE', id, `Deleted rate list ${id}`);
  };

  const addYardLocation = (item) => {
    const newItem = { ...item, id: `LOC-${Date.now().toString().slice(-4)}`, clientId: activeClient?.id, currentStock: 0 };
    setYardLocations(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Added yard location ${newItem.bay}`);
  };
  const updateYardLocation = (id, data) => {
    setYardLocations(prev => prev.map(y => y.id === id ? { ...y, ...data } : y));
    logAudit('UPDATE', id, `Updated yard location ${id}`);
  };
  const deleteYardLocation = (id) => {
    setYardLocations(prev => prev.filter(y => y.id !== id));
    logAudit('DELETE', id, `Deleted yard location ${id}`);
  };

  // Masters CRUD (Supplier/Client Admin)
  const addMaterialStock = (item) => {
    const newItem = { ...item, id: item.id || `MAT-${String(materialsStock.length + 1).padStart(4, '0')}` };
    setMaterialsStock(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created material ${newItem.name}`);
  };
  const updateMaterialStock = (id, data) => {
    setMaterialsStock(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    logAudit('UPDATE', id, `Updated material ${id}`);
  };
  const deleteMaterialStock = (id) => {
    setMaterialsStock(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', id, `Deleted material ${id}`);
  };

  const addFinish = (item) => {
    const newItem = { ...item, id: item.id || `FIN-${String(finishes.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setFinishes(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created finish ${newItem.name}`);
  };
  const updateFinish = (id, data) => {
    setFinishes(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    logAudit('UPDATE', id, `Updated finish ${id}`);
  };
  const deleteFinish = (id) => {
    setFinishes(prev => prev.filter(f => f.id !== id));
    logAudit('DELETE', id, `Deleted finish ${id}`);
  };

  const addThickness = (item) => {
    const newItem = { ...item, id: item.id || `THK-${String(thicknesses.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setThicknesses(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created thickness ${newItem.code || newItem.thicknessValue}`);
  };
  const updateThickness = (id, data) => {
    setThicknesses(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    logAudit('UPDATE', id, `Updated thickness ${id}`);
  };
  const deleteThickness = (id) => {
    setThicknesses(prev => prev.filter(t => t.id !== id));
    logAudit('DELETE', id, `Deleted thickness ${id}`);
  };

  const addGrade = (item) => {
    const newItem = { ...item, id: item.id || `GRD-${String(grades.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setGrades(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created grade ${newItem.name}`);
  };
  const updateGrade = (id, data) => {
    setGrades(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    logAudit('UPDATE', id, `Updated grade ${id}`);
  };
  const deleteGrade = (id) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    logAudit('DELETE', id, `Deleted grade ${id}`);
  };

  const addMachine = (item) => {
    const newItem = { ...item, id: item.id || `MCH-${String(machines.length + 1).padStart(3, '0')}`, status: item.status || 'Operational' };
    setMachines(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created machine ${newItem.name}`);
  };
  const updateMachine = (id, data) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    logAudit('UPDATE', id, `Updated machine ${id}`);
  };
  const deleteMachine = (id) => {
    setMachines(prev => prev.filter(m => m.id !== id));
    logAudit('DELETE', id, `Deleted machine ${id}`);
  };

  const addDefectTypeMaster = (item) => {
    const newItem = { ...item, id: item.id || `DEF-${String(defectTypesMaster.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setDefectTypesMaster(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created defect type ${newItem.name}`);
  };
  const updateDefectTypeMaster = (id, data) => {
    setDefectTypesMaster(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    logAudit('UPDATE', id, `Updated defect type ${id}`);
  };
  const deleteDefectTypeMaster = (id) => {
    setDefectTypesMaster(prev => prev.filter(d => d.id !== id));
    logAudit('DELETE', id, `Deleted defect type ${id}`);
  };

  const addLabelTemplateMaster = (item) => {
    const newItem = { ...item, id: item.id || `TMP-${String(labelTemplatesMaster.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setLabelTemplatesMaster(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created label template ${newItem.name}`);
  };
  const updateLabelTemplateMaster = (id, data) => {
    setLabelTemplatesMaster(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    logAudit('UPDATE', id, `Updated label template ${id}`);
  };
  const deleteLabelTemplateMaster = (id) => {
    setLabelTemplatesMaster(prev => prev.filter(t => t.id !== id));
    logAudit('DELETE', id, `Deleted label template ${id}`);
  };

  const addYardMaster = (item) => {
    const newItem = { ...item, id: item.id || `YRD-${String(yardsMaster.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setYardsMaster(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created yard ${newItem.name}`);
  };
  const updateYardMaster = (id, data) => {
    setYardsMaster(prev => prev.map(y => y.id === id ? { ...y, ...data } : y));
    logAudit('UPDATE', id, `Updated yard ${id}`);
  };
  const deleteYardMaster = (id) => {
    setYardsMaster(prev => prev.filter(y => y.id !== id));
    logAudit('DELETE', id, `Deleted yard ${id}`);
  };

  const addZoneMaster = (item) => {
    const newItem = { ...item, id: item.id || `ZON-${String(zonesMaster.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setZonesMaster(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created zone ${newItem.name}`);
  };
  const updateZoneMaster = (id, data) => {
    setZonesMaster(prev => prev.map(z => z.id === id ? { ...z, ...data } : z));
    logAudit('UPDATE', id, `Updated zone ${id}`);
  };
  const deleteZoneMaster = (id) => {
    setZonesMaster(prev => prev.filter(z => z.id !== id));
    logAudit('DELETE', id, `Deleted zone ${id}`);
  };

  const addRackBayMaster = (item) => {
    const newItem = { ...item, id: item.id || `BAY-${String(racksBaysMaster.length + 1).padStart(3, '0')}`, status: item.status || 'Active' };
    setRacksBaysMaster(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created rack/bay ${newItem.name}`);
  };
  const updateRackBayMaster = (id, data) => {
    setRacksBaysMaster(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    logAudit('UPDATE', id, `Updated rack/bay ${id}`);
  };
  const deleteRackBayMaster = (id) => {
    setRacksBaysMaster(prev => prev.filter(b => b.id !== id));
    logAudit('DELETE', id, `Deleted rack/bay ${id}`);
  };

  const addUser = (item) => {
    const newItem = { ...item, id: `USR-${String(users.length + 1).padStart(3, '0')}`, clientId: activeClient?.id, status: 'Active' };
    setUsers(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Added user ${newItem.name}`);
  };
  const updateUser = (id, data) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    logAudit('UPDATE', id, `Updated user ${id}`);
  };
  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logAudit('DELETE', id, `Deleted user ${id}`);
  };

  const addClientRole = (item) => {
    const newItem = { ...item, id: `ROLE-${Date.now().toString().slice(-4)}`, clientId: item.clientId || activeClient?.id };
    setClientRoles(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created custom role ${newItem.name}`);
    showToast('Role created successfully');
  };
  const updateClientRole = (id, data) => {
    setClientRoles(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logAudit('UPDATE', id, `Updated custom role ${id}`);
    showToast('Role updated successfully');
  };
  const deleteClientRole = (id) => {
    setClientRoles(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE', id, `Deleted custom role ${id}`);
    showToast('Role deleted');
  };

  const addCustomField = (item) => {
    const newItem = {
      ...item,
      id: item.id || `CF-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      createdAt: item.createdAt || new Date().toISOString(),
      status: item.status || 'Active'
    };
    setCustomFields(prev => [newItem, ...prev]);
    logAudit('CREATE', newItem.id, `Created custom field ${newItem.label || newItem.name}`);
    showToast(`Custom field "${newItem.label || newItem.name}" created successfully`);
    return newItem;
  };

  const updateCustomField = (id, updates) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
    logAudit('UPDATE', id, `Updated custom field ${id}`);
    showToast('Custom field updated');
  };

  const deleteCustomField = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
    logAudit('DELETE', id, `Deleted custom field ${id}`);
    showToast('Custom field deleted');
  };

  // --- HR & ATTENDANCE ---
  // --- HR & ATTENDANCE SUITE ---
  const isDateInLockedPayroll = (dateStr) => {
    if (!dateStr) return false;
    const monthPrefix = dateStr.slice(0, 7);
    return payrollPeriods.some(p => p.isLocked && (p.id?.includes(monthPrefix) || p.month?.includes(monthPrefix)));
  };

  // 1. Employees
  const addEmployee = (item) => {
    const nextNum = personnel.filter(p => p.type === 'Employee').length + 1;
    const code = item.code || `EMP-${String(nextNum).padStart(4, '0')}`;
    const newEmp = {
      ...item,
      id: code,
      code,
      type: 'Employee',
      clientId: activeClient?.id || 'CLI-001',
      status: item.status || 'Active',
      faceEnrolled: !!item.faceEnrolled,
      consentBiometric: !!item.consentBiometric
    };
    setPersonnel(prev => [newEmp, ...prev]);

    if (!leaveBalances.some(b => b.personId === newEmp.id || b.employeeId === newEmp.id)) {
      setLeaveBalances(prev => [
        {
          id: `LB-${Date.now().toString().slice(-4)}`,
          clientId: activeClient?.id || 'CLI-001',
          personId: newEmp.id,
          employeeId: newEmp.id,
          personName: newEmp.name,
          annualLeave: 18,
          sickLeave: 7,
          casualLeave: 5
        },
        ...prev
      ]);
    }

    logAudit('CREATE_EMPLOYEE', newEmp.id, `Created employee ${newEmp.name} (${newEmp.code})`);
    showToast(`Employee ${newEmp.name} (${newEmp.code}) created successfully`, 'success');
    return newEmp;
  };

  const updateEmployee = (id, data) => {
    setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    if (data.name) {
      setAttendance(prev => prev.map(a => (a.personId === id || a.employeeId === id ? { ...a, personName: data.name } : a)));
      setRosters(prev => prev.map(r => (r.personId === id || r.employeeId === id ? { ...r, personName: data.name } : r)));
      setLeaveRequests(prev => prev.map(l => (l.personId === id || l.employeeId === id ? { ...l, personName: data.name } : l)));
      setLeaveBalances(prev => prev.map(b => (b.personId === id || b.employeeId === id ? { ...b, personName: data.name } : b)));
    }
    logAudit('UPDATE_EMPLOYEE', id, `Updated employee ${id}`);
    showToast(`Employee ${id} updated successfully`, 'success');
  };

  const deleteEmployee = (id) => {
    const emp = personnel.find(p => p.id === id);
    const empName = emp?.name || id;
    const hasHistory = attendance.some(a => a.personId === id || a.employeeId === id) ||
                       payrollPeriods.some(p => p.employeeId === id) ||
                       rosters.some(r => r.personId === id || r.employeeId === id) ||
                       leaveRequests.some(l => l.personId === id || l.employeeId === id);

    if (hasHistory) {
      setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, status: 'Inactive' } : p)));
      logAudit('ARCHIVE_EMPLOYEE', id, `Archived employee ${empName} (status Inactive) due to linked history`);
      showToast(`${empName} has linked history and was archived (status Inactive)`, 'info');
    } else {
      setPersonnel(prev => prev.filter(p => p.id !== id));
      logAudit('DELETE_EMPLOYEE', id, `Deleted employee ${empName}`);
      showToast(`Employee ${empName} deleted successfully`, 'success');
    }
  };

  const restoreEmployee = (id) => {
    const emp = personnel.find(p => p.id === id);
    setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, status: 'Active' } : p)));
    logAudit('RESTORE_EMPLOYEE', id, `Restored employee ${emp?.name || id}`);
    showToast(`${emp?.name || id} restored to Active`, 'success');
  };

  // Backwards compatible aliases
  const addPersonnel = (item) => item.type === 'Contractor Worker' ? addContractorWorker(item) : addEmployee(item);
  const updatePersonnel = (id, data) => updateEmployee(id, data);
  const deletePersonnel = (id) => deleteEmployee(id);

  // 2. Contractors
  const addContractor = (item) => {
    const nextNum = contractors.length + 1;
    const code = item.code || `CON-${String(nextNum).padStart(4, '0')}`;
    const newCon = {
      ...item,
      id: code,
      code,
      clientId: activeClient?.id || 'CLI-001',
      status: item.status || 'Active'
    };
    setContractors(prev => [newCon, ...prev]);
    logAudit('CREATE_CONTRACTOR', newCon.id, `Created contractor ${newCon.companyName}`);
    showToast(`Contractor ${newCon.companyName} (${code}) created successfully`, 'success');
    return newCon;
  };

  const updateContractor = (id, data) => {
    setContractors(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
    if (data.companyName) {
      setPersonnel(prev => prev.map(p => (p.contractorId === id ? { ...p, contractorName: data.companyName } : p)));
    }
    logAudit('UPDATE_CONTRACTOR', id, `Updated contractor ${id}`);
    showToast(`Contractor updated successfully`, 'success');
  };

  const deleteContractor = (id) => {
    const con = contractors.find(c => c.id === id);
    const conName = con?.companyName || id;
    const linkedWorkers = personnel.filter(p => p.contractorId === id);

    if (linkedWorkers.length > 0) {
      setContractors(prev => prev.map(c => (c.id === id ? { ...c, status: 'Inactive' } : c)));
      setPersonnel(prev => prev.map(p => (p.contractorId === id ? { ...p, status: 'Inactive' } : p)));
      logAudit('ARCHIVE_CONTRACTOR', id, `Archived contractor ${conName} and ${linkedWorkers.length} linked workers`);
      showToast(`${conName} and ${linkedWorkers.length} linked workers were archived (Inactive)`, 'info');
    } else {
      setContractors(prev => prev.filter(c => c.id !== id));
      logAudit('DELETE_CONTRACTOR', id, `Deleted contractor ${conName}`);
      showToast(`Contractor ${conName} deleted successfully`, 'success');
    }
  };

  const restoreContractor = (id) => {
    const con = contractors.find(c => c.id === id);
    setContractors(prev => prev.map(c => (c.id === id ? { ...c, status: 'Active' } : c)));
    setPersonnel(prev => prev.map(p => (p.contractorId === id ? { ...p, status: 'Active' } : p)));
    logAudit('RESTORE_CONTRACTOR', id, `Restored contractor ${con?.companyName || id} and linked workers`);
    showToast(`Contractor and linked workers restored to Active`, 'success');
  };

  const bulkArchiveContractors = (ids) => {
    setContractors(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Inactive' } : c));
    setPersonnel(prev => prev.map(p => ids.includes(p.contractorId) ? { ...p, status: 'Inactive' } : p));
    logAudit('BULK_ARCHIVE_CONTRACTORS', 'CONTRACTORS', `Archived ${ids.length} contractors and their workers`);
    showToast(`${ids.length} contractors archived.`, 'info');
  };

  const bulkRestoreContractors = (ids) => {
    setContractors(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: 'Active' } : c));
    setPersonnel(prev => prev.map(p => ids.includes(p.contractorId) ? { ...p, status: 'Active' } : p));
    logAudit('BULK_RESTORE_CONTRACTORS', 'CONTRACTORS', `Restored ${ids.length} contractors to Active`);
    showToast(`${ids.length} contractors restored to Active.`, 'success');
  };

  const addContractorContact = (contractorId, contact) => {
    const contactId = `CNT-${Date.now().toString().slice(-4)}`;
    const newContact = { ...contact, id: contactId };
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        const existing = c.contacts || [];
        const updated = newContact.isPrimary ? existing.map(ct => ({ ...ct, isPrimary: false })) : existing;
        return { ...c, contacts: [...updated, newContact] };
      }
      return c;
    }));
    logAudit('ADD_CONTRACTOR_CONTACT', contractorId, `Added contact ${newContact.name} to contractor`);
    showToast(`Contact ${newContact.name} added!`, 'success');
  };

  const updateContractorContact = (contractorId, contactId, contactData) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        const updated = (c.contacts || []).map(ct => {
          if (ct.id === contactId) {
            return { ...ct, ...contactData };
          }
          if (contactData.isPrimary) {
            return { ...ct, isPrimary: false };
          }
          return ct;
        });
        return { ...c, contacts: updated };
      }
      return c;
    }));
    logAudit('UPDATE_CONTRACTOR_CONTACT', contractorId, `Updated contact ${contactId}`);
    showToast(`Contact updated!`, 'success');
  };

  const deleteContractorContact = (contractorId, contactId) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        return { ...c, contacts: (c.contacts || []).filter(ct => ct.id !== contactId) };
      }
      return c;
    }));
    logAudit('DELETE_CONTRACTOR_CONTACT', contractorId, `Removed contact ${contactId}`);
    showToast(`Contact removed.`, 'info');
  };

  const addContractorDocument = (contractorId, doc) => {
    const docId = `DOC-${Date.now().toString().slice(-4)}`;
    const newDoc = { ...doc, id: docId };
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        return { ...c, documents: [...(c.documents || []), newDoc] };
      }
      return c;
    }));
    logAudit('ADD_CONTRACTOR_DOCUMENT', contractorId, `Uploaded document ${newDoc.name}`);
    showToast(`Document ${newDoc.name} uploaded!`, 'success');
  };

  const updateContractorDocument = (contractorId, docId, docData) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        const updated = (c.documents || []).map(d => d.id === docId ? { ...d, ...docData } : d);
        return { ...c, documents: updated };
      }
      return c;
    }));
    logAudit('UPDATE_CONTRACTOR_DOCUMENT', contractorId, `Updated document ${docId}`);
    showToast(`Document updated!`, 'success');
  };

  const deleteContractorDocument = (contractorId, docId) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId || c.code === contractorId) {
        return { ...c, documents: (c.documents || []).filter(d => d.id !== docId) };
      }
      return c;
    }));
    logAudit('DELETE_CONTRACTOR_DOCUMENT', contractorId, `Removed document ${docId}`);
    showToast(`Document removed.`, 'info');
  };

  // 3. Contractor Workers
  const addContractorWorker = (item) => {
    const nextNum = personnel.filter(p => p.type === 'Contractor Worker').length + 1;
    const code = item.code || `WRK-${String(nextNum).padStart(4, '0')}`;
    const con = contractors.find(c => c.id === item.contractorId);
    const newWorker = {
      ...item,
      id: code,
      code,
      type: 'Contractor Worker',
      contractorName: con?.companyName || item.contractorName || 'Contractor',
      clientId: activeClient?.id || 'CLI-001',
      status: item.status || 'Active',
      faceEnrolled: false,
      consentBiometric: !!item.consentBiometric
    };
    setPersonnel(prev => [newWorker, ...prev]);
    logAudit('CREATE_WORKER', newWorker.id, `Added contractor worker ${newWorker.name} for ${newWorker.contractorName}`);
    showToast(`Worker ${newWorker.name} (${code}) added and linked to ${newWorker.contractorName}`, 'success');
    return newWorker;
  };

  const updateContractorWorker = (id, data) => {
    setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    logAudit('UPDATE_WORKER', id, `Updated worker ${id}`);
    showToast(`Worker updated successfully`, 'success');
  };

  const deleteContractorWorker = (id) => {
    const wrk = personnel.find(p => p.id === id);
    const wrkName = wrk?.name || id;
    const hasHistory = attendance.some(a => a.personId === id || a.employeeId === id) ||
                       rosters.some(r => r.personId === id || r.employeeId === id);

    if (hasHistory) {
      setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, status: 'Inactive' } : p)));
      logAudit('ARCHIVE_WORKER', id, `Archived worker ${wrkName} (status Inactive) due to linked records`);
      showToast(`${wrkName} has linked history and was archived (status Inactive)`, 'info');
    } else {
      setPersonnel(prev => prev.filter(p => p.id !== id));
      logAudit('DELETE_WORKER', id, `Deleted worker ${wrkName}`);
      showToast(`Worker ${wrkName} deleted successfully`, 'success');
    }
  };

  const restoreContractorWorker = (id) => {
    const wrk = personnel.find(p => p.id === id);
    setPersonnel(prev => prev.map(p => (p.id === id ? { ...p, status: 'Active' } : p)));
    logAudit('RESTORE_WORKER', id, `Restored worker ${wrk?.name || id}`);
    showToast(`${wrk?.name || id} restored to Active`, 'success');
  };

  // 4. Weekly Roster
  const assignRosterCell = ({ personId, weekStart, dayKey, shiftCode }) => {
    const person = personnel.find(p => p.id === personId);
    setRosters(prev => {
      const existing = prev.find(r => (r.personId === personId || r.employeeId === personId) && r.weekStart === weekStart);
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, [dayKey]: shiftCode } : r);
      } else {
        const newRoster = {
          id: `ROS-${Date.now().toString().slice(-4)}`,
          clientId: activeClient?.id || 'CLI-001',
          personId,
          employeeId: personId,
          personName: person?.name || 'Personnel',
          weekStart,
          mon: dayKey === 'mon' ? shiftCode : '',
          tue: dayKey === 'tue' ? shiftCode : '',
          wed: dayKey === 'wed' ? shiftCode : '',
          thu: dayKey === 'thu' ? shiftCode : '',
          fri: dayKey === 'fri' ? shiftCode : '',
          sat: dayKey === 'sat' ? shiftCode : '',
          sun: dayKey === 'sun' ? shiftCode : ''
        };
        return [newRoster, ...prev];
      }
    });
    logAudit('UPDATE_ROSTER', personId, `Assigned ${shiftCode || 'Empty'} on ${dayKey} for ${person?.name}`);
    showToast(`Roster updated for ${person?.name || personId}`, 'success');
  };

  const bulkAssignRoster = ({ personId, weekStart, days, shiftCode }) => {
    const person = personnel.find(p => p.id === personId);
    setRosters(prev => {
      const existing = prev.find(r => (r.personId === personId || r.employeeId === personId) && r.weekStart === weekStart);
      const updates = {};
      days.forEach(d => { updates[d] = shiftCode; });
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, ...updates } : r);
      } else {
        const newRoster = {
          id: `ROS-${Date.now().toString().slice(-4)}`,
          clientId: activeClient?.id || 'CLI-001',
          personId,
          employeeId: personId,
          personName: person?.name || 'Personnel',
          weekStart,
          mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '',
          ...updates
        };
        return [newRoster, ...prev];
      }
    });
    showToast(`Assigned ${shiftCode || 'Week Off'} across selected days for ${person?.name}`, 'success');
  };

  const copyRosterWeek = ({ fromWeekStart, toWeekStart }) => {
    setRosters(prev => {
      const prevRows = prev.filter(r => r.weekStart === fromWeekStart);
      if (prevRows.length === 0) return prev;
      const filtered = prev.filter(r => r.weekStart !== toWeekStart);
      const copied = prevRows.map(r => ({
        ...r,
        id: `ROS-${Date.now().toString().slice(-4)}-${Math.random().toString().slice(-3)}`,
        weekStart: toWeekStart
      }));
      return [...copied, ...filtered];
    });
    logAudit('COPY_ROSTER', toWeekStart, `Copied weekly roster from ${fromWeekStart} to ${toWeekStart}`);
    showToast(`Copied previous week roster to ${toWeekStart}`, 'success');
  };

  const clearRosterDay = ({ weekStart, dayKey }) => {
    setRosters(prev => prev.map(r => r.weekStart === weekStart ? { ...r, [dayKey]: '' } : r));
    showToast(`Cleared all shift assignments for ${dayKey.toUpperCase()}`, 'info');
  };

  const updateRoster = (id, data) => {
    setRosters(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    logAudit('UPDATE_ROSTER', id, 'Updated weekly roster');
    showToast(`Roster updated`, 'success');
  };

  // 5. Leave Management
  const calculateLeaveDays = (fromDate, toDate, isHalfDay) => {
    if (isHalfDay) return 0.5;
    if (!fromDate || !toDate) return 1;
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    const diff = d2.getTime() - d1.getTime();
    if (diff < 0) return 1;
    return Math.round(diff / (1000 * 3600 * 24)) + 1;
  };

  const addLeaveRequest = (req) => {
    const person = personnel.find(p => p.id === req.personId || p.code === req.personId);
    const days = calculateLeaveDays(req.fromDate, req.toDate, req.halfDay);
    const nextNum = leaveRequests.length + 1;
    const code = `LV-${String(nextNum).padStart(4, '0')}`;
    const newReq = {
      ...req,
      id: code,
      code,
      clientId: activeClient?.id || 'CLI-001',
      personId: person?.id || req.personId,
      personName: person?.name || 'Employee',
      days,
      status: 'Pending'
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    logAudit('CREATE_LEAVE', code, `Leave requested (${days} days) for ${person?.name}`);
    showToast(`Leave request ${code} submitted (${days} day(s))`, 'success');
    return newReq;
  };

  const updateLeaveRequest = (id, data) => {
    setLeaveRequests(prev => prev.map(l => {
      if (l.id === id) {
        const fromDate = data.fromDate || l.fromDate;
        const toDate = data.toDate || l.toDate;
        const halfDay = data.halfDay !== undefined ? data.halfDay : l.halfDay;
        const days = calculateLeaveDays(fromDate, toDate, halfDay);
        return { ...l, ...data, days };
      }
      return l;
    }));
    logAudit('UPDATE_LEAVE', id, `Updated leave request ${id}`);
    showToast(`Leave request updated`, 'success');
  };

  const approveLeaveRequest = (id) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;
    const person = personnel.find(p => p.id === req.personId);

    // 1. Deduct balance
    setLeaveBalances(prev => prev.map(b => {
      if (b.personId === req.personId || b.employeeId === req.personId) {
        const typeKey = req.type?.toLowerCase().includes('sick') ? 'sickLeave' : (req.type?.toLowerCase().includes('casual') ? 'casualLeave' : 'annualLeave');
        return {
          ...b,
          [typeKey]: Math.max(0, (b[typeKey] || 15) - req.days)
        };
      }
      return b;
    }));

    // 2. Fill Attendance as Leave for dates
    const dStart = new Date(req.fromDate);
    const dEnd = new Date(req.toDate);
    const attEntries = [];
    for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      attEntries.push({
        id: `ATT-${Date.now().toString().slice(-4)}-${Math.random().toString().slice(-3)}`,
        clientId: activeClient?.id || 'CLI-001',
        personId: req.personId,
        personName: person?.name || req.personName,
        date: dateStr,
        shift: 'Shift 1',
        punchIn: '',
        punchOut: '',
        device: 'System',
        matchStatus: 'Matched',
        workedHours: 0,
        overtimeHours: 0,
        status: 'Leave',
        correctionReason: `${req.type} Leave Approved`
      });
    }
    setAttendance(prev => [...attEntries, ...prev]);

    // 3. Mark Approved
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    logAudit('APPROVE_LEAVE', id, `Approved ${req.days} days ${req.type} for ${person?.name || req.personName}`);
    showToast(`Approved leave request for ${person?.name || req.personName}`, 'success');
  };

  const rejectLeaveRequest = (id, reason) => {
    const req = leaveRequests.find(l => l.id === id);
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected', rejectReason: reason } : l));
    logAudit('REJECT_LEAVE', id, `Rejected leave for ${req?.personName}. Reason: ${reason || 'N/A'}`);
    showToast(`Leave request ${id} rejected`, 'info');
  };

  const cancelLeaveRequest = (id) => {
    const req = leaveRequests.find(l => l.id === id);
    if (!req) return;

    if (req.status === 'Approved') {
      setLeaveBalances(prev => prev.map(b => {
        if (b.personId === req.personId || b.employeeId === req.personId) {
          const typeKey = req.type?.toLowerCase().includes('sick') ? 'sickLeave' : (req.type?.toLowerCase().includes('casual') ? 'casualLeave' : 'annualLeave');
          return {
            ...b,
            [typeKey]: (b[typeKey] || 0) + req.days
          };
        }
        return b;
      }));

      setAttendance(prev => prev.filter(a => !(a.personId === req.personId && a.status === 'Leave' && a.date >= req.fromDate && a.date <= req.toDate)));
    }

    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Cancelled' } : l));
    logAudit('CANCEL_LEAVE', id, `Cancelled leave request for ${req.personName}`);
    showToast(`Leave request cancelled and balance restored`, 'info');
  };

  const deleteLeaveRequest = (id) => {
    const req = leaveRequests.find(l => l.id === id);
    if (req?.status === 'Approved') {
      cancelLeaveRequest(id);
      return;
    }
    setLeaveRequests(prev => prev.filter(l => l.id !== id));
    logAudit('DELETE_LEAVE', id, `Deleted leave request ${id}`);
    showToast(`Leave request removed`, 'success');
  };

  const adjustLeaveBalance = ({ personId, leaveType, adjustment, reason }) => {
    const person = personnel.find(p => p.id === personId);
    setLeaveBalances(prev => prev.map(b => {
      if (b.personId === personId || b.employeeId === personId) {
        const typeKey = leaveType === 'Sick' ? 'sickLeave' : (leaveType === 'Casual' ? 'casualLeave' : 'annualLeave');
        return {
          ...b,
          [typeKey]: Math.max(0, (b[typeKey] || 0) + Number(adjustment))
        };
      }
      return b;
    }));
    logAudit('ADJUST_LEAVE_BALANCE', personId, `Adjusted ${leaveType} by ${adjustment} for ${person?.name}. Reason: ${reason}`);
    showToast(`Leave balance adjusted for ${person?.name}`, 'success');
  };

  // 6. Attendance & Punch Operations
  const addPunch = ({ personId, punchType, deviceId, isSimulation, forceUnmatched }) => {
    const person = personnel.find(p => p.id === personId);
    const device = punchDevices.find(d => d.id === deviceId) || punchDevices[0];
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let matchStatus = forceUnmatched ? 'Unmatched' : 'Matched';
    const status = forceUnmatched ? 'Unmatched' : 'Present';

    const existing = attendance.find(a => a.personId === personId && a.date === today);

    if (existing) {
      const punchInTime = existing.punchIn || nowTime;
      const punchOutTime = nowTime;
      const [h1, m1] = punchInTime.split(':').map(Number);
      const [h2, m2] = punchOutTime.split(':').map(Number);
      let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
      if (diff < 0) diff += 24;
      const workedHours = Number(diff.toFixed(1));
      const overtime = workedHours > 8 ? Math.ceil(workedHours - 8) : 0;

      setAttendance(prev => prev.map(a => a.id === existing.id ? {
        ...a,
        punchOut: punchOutTime,
        workedHours,
        overtimeHours: overtime,
        device: device?.name || a.device
      } : a));
    } else {
      const newAtt = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        clientId: activeClient?.id || 'CLI-001',
        personId: person?.id || 'UNKNOWN',
        personName: person?.name || 'Unmatched Person',
        date: today,
        shift: 'Shift 1',
        punchIn: nowTime,
        punchOut: '',
        device: device?.name || 'Kiosk',
        matchStatus,
        workedHours: 8.0,
        overtimeHours: 0.0,
        status,
        correctionReason: ''
      };
      setAttendance(prev => [newAtt, ...prev]);
    }

    logAudit('FACE_PUNCH', personId || 'UNMATCHED', `Punch ${punchType} on ${device?.name}: ${matchStatus}`);
    return { success: true, matchStatus };
  };

  const addAttendance = (att) => {
    if (isDateInLockedPayroll(att.date)) {
      showToast('Action blocked: This date is inside a locked payroll period', 'error');
      return { error: 'LOCKED_PERIOD' };
    }

    const person = personnel.find(p => p.id === att.personId);
    const nextNum = attendance.length + 1;
    const code = `ATT-${String(nextNum).padStart(4, '0')}`;

    let workedHours = 8.0;
    let overtime = 0.0;
    if (att.punchIn && att.punchOut) {
      const [h1, m1] = att.punchIn.split(':').map(Number);
      const [h2, m2] = att.punchOut.split(':').map(Number);
      let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
      if (diff < 0) diff += 24;
      workedHours = Number(diff.toFixed(1));
      overtime = workedHours > 8 ? Math.ceil(workedHours - 8) : 0;
    }

    const newAtt = {
      ...att,
      id: code,
      clientId: activeClient?.id || 'CLI-001',
      personName: person?.name || att.personName || 'Personnel',
      matchStatus: att.matchStatus || 'Matched',
      workedHours,
      overtimeHours: overtime,
      correctionHistory: []
    };

    setAttendance(prev => [newAtt, ...prev]);
    logAudit('CREATE_ATTENDANCE', code, `Manual attendance for ${newAtt.personName} on ${att.date}`);
    showToast(`Attendance recorded for ${newAtt.personName}`, 'success');
    return newAtt;
  };

  const correctAttendance = (id, { punchIn, punchOut, shift, status, correctionReason }) => {
    const existing = attendance.find(a => a.id === id);
    if (existing && isDateInLockedPayroll(existing.date)) {
      showToast('Action blocked: This date is inside a locked payroll period', 'error');
      return { error: 'LOCKED_PERIOD' };
    }

    setAttendance(prev => prev.map(a => {
      if (a.id === id) {
        let workedHours = a.workedHours;
        let overtime = a.overtimeHours;
        const inTime = punchIn ?? a.punchIn;
        const outTime = punchOut ?? a.punchOut;
        if (inTime && outTime) {
          const [h1, m1] = inTime.split(':').map(Number);
          const [h2, m2] = outTime.split(':').map(Number);
          let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
          if (diff < 0) diff += 24;
          workedHours = Number(diff.toFixed(1));
          overtime = workedHours > 8 ? Math.ceil(workedHours - 8) : 0;
        }

        const historyItem = {
          date: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: currentUser.name,
          oldIn: a.punchIn,
          oldOut: a.punchOut,
          newIn: inTime,
          newOut: outTime,
          oldStatus: a.status,
          newStatus: status ?? a.status,
          reason: correctionReason || 'Manual correction'
        };

        return {
          ...a,
          punchIn: inTime,
          punchOut: outTime,
          shift: shift ?? a.shift,
          status: status ?? a.status,
          correctionReason: correctionReason ?? a.correctionReason,
          workedHours,
          overtimeHours: overtime,
          correctionHistory: [historyItem, ...(a.correctionHistory || [])]
        };
      }
      return a;
    }));

    logAudit('CORRECT_ATTENDANCE', id, `Reason: ${correctionReason}`);
    showToast(`Attendance record corrected successfully`, 'success');
  };

  const voidAttendance = (id, reason) => {
    const existing = attendance.find(a => a.id === id);
    if (existing && isDateInLockedPayroll(existing.date)) {
      showToast('Action blocked: This date is inside a locked payroll period', 'error');
      return { error: 'LOCKED_PERIOD' };
    }

    setAttendance(prev => prev.map(a => a.id === id ? { ...a, status: 'Voided', voidReason: reason } : a));
    logAudit('VOID_ATTENDANCE', id, `Voided attendance. Reason: ${reason || 'N/A'}`);
    showToast(`Attendance record marked as Voided`, 'info');
  };

  const restoreAttendance = (id) => {
    const existing = attendance.find(a => a.id === id);
    if (existing && isDateInLockedPayroll(existing.date)) {
      showToast('Action blocked: This date is inside a locked payroll period', 'error');
      return { error: 'LOCKED_PERIOD' };
    }

    setAttendance(prev => prev.map(a => a.id === id ? { ...a, status: 'Present', voidReason: null } : a));
    logAudit('RESTORE_ATTENDANCE', id, `Restored voided attendance`);
    showToast(`Attendance record restored`, 'success');
  };

  const assignUnmatchedPunch = (id, personId) => {
    const person = personnel.find(p => p.id === personId);
    setAttendance(prev => prev.map(a => a.id === id ? {
      ...a,
      personId: person?.id,
      personName: person?.name || 'Assigned Person',
      matchStatus: 'Matched',
      status: 'Present'
    } : a));
    logAudit('ASSIGN_UNMATCHED', id, `Assigned punch to ${person?.name}`);
    showToast(`Punch assigned to ${person?.name}`, 'success');
  };

  const rejectUnmatchedPunch = (id) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
    logAudit('REJECT_UNMATCHED', id, `Rejected unmatched punch`);
    showToast(`Unmatched punch rejected`, 'info');
  };

  // 7. Masters Full CRUD
  const addDepartment = (item) => {
    const code = `DEP-${String(departments.length + 1).padStart(4, '0')}`;
    const newDep = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001', status: 'Active' };
    setDepartments(prev => [newDep, ...prev]);
    logAudit('CREATE_DEPARTMENT', code, `Created department ${item.name}`);
    showToast(`Department ${item.name} created`, 'success');
  };
  const updateDepartment = (id, data) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    logAudit('UPDATE_DEPARTMENT', id, `Updated department ${id}`);
    showToast(`Department updated`, 'success');
  };
  const deleteDepartment = (id) => {
    const inUse = personnel.some(p => p.department === id || p.department === departments.find(d => d.id === id)?.name);
    if (inUse) {
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: 'Inactive' } : d));
      showToast(`Department in use by personnel and was archived (Inactive)`, 'info');
    } else {
      setDepartments(prev => prev.filter(d => d.id !== id));
      showToast(`Department deleted`, 'success');
    }
  };
  const restoreDepartment = (id) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: 'Active' } : d));
    showToast(`Department restored`, 'success');
  };

  const addDesignation = (item) => {
    const code = `DES-${String(designations.length + 1).padStart(4, '0')}`;
    const newDes = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001', status: 'Active' };
    setDesignations(prev => [newDes, ...prev]);
    logAudit('CREATE_DESIGNATION', code, `Created designation ${item.title}`);
    showToast(`Designation ${item.title} created`, 'success');
  };
  const updateDesignation = (id, data) => {
    setDesignations(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    logAudit('UPDATE_DESIGNATION', id, `Updated designation ${id}`);
    showToast(`Designation updated`, 'success');
  };
  const deleteDesignation = (id) => {
    const inUse = personnel.some(p => p.designation === id || p.designation === designations.find(d => d.id === id)?.title);
    if (inUse) {
      setDesignations(prev => prev.map(d => d.id === id ? { ...d, status: 'Inactive' } : d));
      showToast(`Designation in use and was archived (Inactive)`, 'info');
    } else {
      setDesignations(prev => prev.filter(d => d.id !== id));
      showToast(`Designation deleted`, 'success');
    }
  };
  const restoreDesignation = (id) => {
    setDesignations(prev => prev.map(d => d.id === id ? { ...d, status: 'Active' } : d));
    showToast(`Designation restored`, 'success');
  };

  const addShift = (item) => {
    const code = `SH-${String(shifts.length + 1).padStart(4, '0')}`;
    const newShift = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001', status: 'Active' };
    setShifts(prev => [newShift, ...prev]);
    logAudit('CREATE_SHIFT', code, `Created shift ${item.name} (${item.startTime}-${item.endTime})`);
    showToast(`Shift ${item.name} created`, 'success');
  };
  const updateShift = (id, data) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    logAudit('UPDATE_SHIFT', id, `Updated shift ${id} times`);
    showToast(`Shift updated successfully`, 'success');
  };
  const deleteShift = (id) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    logAudit('DELETE_SHIFT', id, `Deleted shift ${id}`);
    showToast(`Shift deleted`, 'success');
  };

  const addLeaveType = (item) => {
    const code = `LT-${String(leaveTypes.length + 1).padStart(4, '0')}`;
    const newLT = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001', status: 'Active' };
    setLeaveTypes(prev => [newLT, ...prev]);
    logAudit('CREATE_LEAVE_TYPE', code, `Created leave type ${item.name}`);
    showToast(`Leave type ${item.name} created`, 'success');
  };
  const updateLeaveType = (id, data) => {
    setLeaveTypes(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    logAudit('UPDATE_LEAVE_TYPE', id, `Updated leave type ${id}`);
    showToast(`Leave type updated`, 'success');
  };
  const deleteLeaveType = (id) => {
    setLeaveTypes(prev => prev.filter(l => l.id !== id));
    logAudit('DELETE_LEAVE_TYPE', id, `Deleted leave type ${id}`);
    showToast(`Leave type deleted`, 'success');
  };

  const addHoliday = (item) => {
    const code = `HOL-${String(holidays.length + 1).padStart(4, '0')}`;
    const newHol = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001' };
    setHolidays(prev => [newHol, ...prev]);
    logAudit('CREATE_HOLIDAY', code, `Added holiday ${item.name} on ${item.date}`);
    showToast(`Holiday ${item.name} added to calendar`, 'success');
  };
  const updateHoliday = (id, data) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
    logAudit('UPDATE_HOLIDAY', id, `Updated holiday ${id}`);
    showToast(`Holiday updated`, 'success');
  };
  const deleteHoliday = (id) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    logAudit('DELETE_HOLIDAY', id, `Deleted holiday ${id}`);
    showToast(`Holiday removed`, 'success');
  };

  const addPunchDevice = (item) => {
    const code = `DEV-${String(punchDevices.length + 1).padStart(4, '0')}`;
    const newDev = { ...item, id: code, code, clientId: activeClient?.id || 'CLI-001', status: item.status || 'Online', lastSync: 'Just now' };
    setPunchDevices(prev => [newDev, ...prev]);
    logAudit('CREATE_DEVICE', code, `Registered biometric device ${item.name}`);
    showToast(`Biometric device ${item.name} registered`, 'success');
  };
  const updatePunchDevice = (id, data) => {
    setPunchDevices(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    logAudit('UPDATE_DEVICE', id, `Updated device ${id}`);
    showToast(`Device updated`, 'success');
  };
  const deletePunchDevice = (id) => {
    setPunchDevices(prev => prev.filter(d => d.id !== id));
    logAudit('DELETE_DEVICE', id, `Removed device ${id}`);
    showToast(`Device removed`, 'success');
  };

  const updateBiometricSettings = (newSettings) => {
    setBiometricSettings(prev => ({ ...prev, ...newSettings }));
    logAudit('UPDATE_BIOMETRIC_SETTINGS', 'CONFIG', `Updated biometric matching & kiosk settings`);
    showToast(`Biometric settings updated successfully`, 'success');
  };

  const addAdvance = (item) => {
    const code = `ADV-${String(advances.length + 1).padStart(4, '0')}`;
    const person = personnel.find(p => p.id === item.personId);
    const newAdv = {
      ...item,
      id: code,
      code,
      clientId: activeClient?.id || 'CLI-001',
      personName: person?.name || 'Personnel',
      date: item.date || new Date().toISOString().slice(0, 10),
      status: item.status || 'Approved'
    };
    setAdvances(prev => [newAdv, ...prev]);
    logAudit('CREATE_ADVANCE', code, `${item.type || 'Advance'} of $${item.amount} for ${person?.name}`);
    showToast(`${item.type || 'Advance'} recorded for ${person?.name}`, 'success');
  };
  const updateAdvance = (id, data) => {
    setAdvances(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    showToast(`Advance record updated`, 'success');
  };
  const deleteAdvance = (id) => {
    setAdvances(prev => prev.filter(a => a.id !== id));
    showToast(`Advance record deleted`, 'success');
  };

  const approveOvertime = (id) => {
    setOvertimeApprovals(prev => prev.map(o => o.id === id ? { ...o, status: 'Approved' } : o));
    logAudit('APPROVE_OT', id, `Approved overtime ${id}`);
    showToast(`Overtime approved`, 'success');
  };

  const lockPayrollPeriod = (id) => {
    setPayrollPeriods(prev => prev.map(p => p.id === id ? { ...p, isLocked: true, status: 'Locked', lockedBy: currentUser.name, lockedAt: new Date().toISOString().slice(0, 10) } : p));
    logAudit('LOCK_PAYROLL', id, `Locked payroll period ${id}`);
    showToast(`Payroll period ${id} locked successfully`, 'info');
  };
  const unlockPayrollPeriod = (id) => {
    setPayrollPeriods(prev => prev.map(p => p.id === id ? { ...p, isLocked: false, status: 'Open', lockedBy: null, lockedAt: null } : p));
    logAudit('UNLOCK_PAYROLL', id, `Unlocked payroll period ${id}`);
    showToast(`Payroll period ${id} unlocked`, 'success');
  };

  // --- PROCUREMENT SYNC CHAIN (PR -> PO -> GRN -> Raw Block) ---
  const addPurchaseRequest = (pr) => {
    const newPR = {
      ...pr,
      id: `PR-2026-${String(purchaseRequests.length + 1).padStart(3, '0')}`,
      clientId: activeClient?.id,
      requestedBy: currentUser.name,
      status: 'Pending Approval',
      date: new Date().toISOString().slice(0, 10)
    };
    setPurchaseRequests(prev => [newPR, ...prev]);
    logAudit('CREATE_PR', newPR.id, `Created PR for ${newPR.quantityTons}t ${newPR.stoneCode}`);
  };

  const approvePurchaseRequest = (prId, ratePerTon = 580) => {
    const pr = purchaseRequests.find(p => p.id === prId);
    if (!pr) return;
    setPurchaseRequests(prev => prev.map(p => p.id === prId ? { ...p, status: 'Approved' } : p));

    const sup = suppliers.find(s => s.id === pr.supplierId);
    const newPO = {
      id: `PO-2026-${String(purchaseOrders.length + 101)}`,
      clientId: activeClient?.id,
      prId: pr.id,
      supplier: sup?.name || 'Monte Altissimo Quarry',
      supplierId: pr.supplierId,
      stoneCode: pr.stoneCode,
      tons: Number(pr.quantityTons),
      ratePerTon: Number(ratePerTon),
      totalCost: Number(pr.quantityTons) * Number(ratePerTon),
      status: 'Open',
      date: new Date().toISOString().slice(0, 10)
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    logAudit('APPROVE_PR', prId, `Approved PR and generated ${newPO.id}`);
  };

  const addReceipt = (data) => {
    const gross = Number(data.grossKg || 0);
    const tare = Number(data.tareKg || 0);
    const net = gross - tare;
    const po = purchaseOrders.find(p => p.id === data.poId);

    const newGRN = {
      id: `GRN-${8800 + receipts.length + 1}`,
      clientId: activeClient?.id,
      poId: data.poId,
      truckNumber: data.truckNumber,
      stoneCode: data.stoneCode || po?.stoneCode || 'CAR-WHT',
      grossKg: gross,
      tareKg: tare,
      netKg: net,
      blockCount: Number(data.blockCount || 1),
      yardLocation: data.yardLocation || 'LOC-A1',
      status: 'Weighed',
      date: new Date().toISOString().slice(0, 10)
    };
    setReceipts(prev => [newGRN, ...prev]);

    // Automatically spawn Stage 1: Raw Block
    const newBlock = {
      id: `BLK-${900 + rawBlocks.length + 1}`,
      clientId: activeClient?.id,
      grnId: newGRN.id,
      poId: data.poId,
      quarry: po?.supplier || 'Quarry',
      stoneCode: newGRN.stoneCode,
      lengthCm: Number(data.lengthCm || 290),
      widthCm: Number(data.widthCm || 160),
      heightCm: Number(data.heightCm || 155),
      weightKg: net,
      weightTons: Number((net / 1000).toFixed(1)),
      qa1Status: 'In QA',
      status: 'In QA',
      yardLocation: newGRN.yardLocation
    };
    setRawBlocks(prev => [newBlock, ...prev]);

    // Feed 3-Way Match: generate Supplier Bill
    const newBill = {
      id: `BILL-${100 + supplierBills.length + 1}`,
      clientId: activeClient?.id,
      poId: data.poId,
      grnId: newGRN.id,
      supplier: po?.supplier || 'Supplier',
      supplierId: po?.supplierId || 'SUP-001',
      amount: Number(po?.totalCost || (newBlock.weightTons * 580)),
      matchStatus: 'Matched',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'Pending'
    };
    setSupplierBills(prev => [newBill, ...prev]);

    logAudit('CREATE_GRN', newGRN.id, `GRN net weight ${net}kg; Created ${newBlock.id} (Stage 1 Raw Block)`);
    logMovement(newBlock.id, 'Raw Block', 'Weighbridge', newBlock.yardLocation, 'Intake GRN');
  };

  // --- QA 1: BETWEEN RAW BLOCK & CUT SLAB ---
  const recordQA1 = ({ blockId, grade, result, remarks, photo }) => {
    const block = rawBlocks.find(b => b.id === blockId);
    let debitNoteId = null;

    if (result === 'Reject') {
      // Trigger Debit Note to supplier
      debitNoteId = `DN-2026-${String(debitNotes.length + 1).padStart(2, '0')}`;
      const newDN = {
        id: debitNoteId,
        clientId: activeClient?.id,
        supplierId: 'SUP-001',
        supplier: block?.quarry || 'Supplier',
        grnId: block?.grnId,
        itemRefId: blockId,
        amount: Math.round((block?.weightTons || 25) * 150),
        reason: `QA 1 Reject: ${remarks || 'Internal fissure defect'}`,
        status: 'Sent',
        date: new Date().toISOString().slice(0, 10)
      };
      setDebitNotes(prev => [newDN, ...prev]);

      // Move block to Defective Store
      const newDef = {
        id: `DEF-${100 + defectiveStore.length + 1}`,
        clientId: activeClient?.id,
        stage: 'Raw Block',
        itemRefId: blockId,
        stoneCode: block?.stoneCode,
        reason: remarks || 'QA 1 Rejected',
        quantity: `${block?.weightKg} Kg`,
        detectedAt: 'QA 1 Inspection',
        status: 'Debit Note Raised',
        date: new Date().toISOString().slice(0, 10)
      };
      setDefectiveStore(prev => [newDef, ...prev]);
    }

    const newQA = {
      id: `QA1-${String(qa1Records.length + 1).padStart(3, '0')}`,
      clientId: activeClient?.id,
      blockId,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      grade: grade || 'A',
      result: result || 'Pass',
      remarks: remarks || '',
      photo: photo || '',
      debitNoteId
    };
    setQa1Records(prev => [newQA, ...prev]);

    // Update block status
    setRawBlocks(prev => prev.map(b => b.id === blockId ? {
      ...b,
      qa1Status: result,
      status: result === 'Pass' ? 'Available' : (result === 'Reject' ? 'Defective' : 'In QA')
    } : b));

    logAudit('QA1_INSPECT', blockId, `QA 1 Result: ${result} (${grade})`);
  };

  const overruleQA1 = (blockId, mandatoryReason) => {
    setRawBlocks(prev => prev.map(b => b.id === blockId ? { ...b, qa1Status: 'Pass', status: 'Available' } : b));
    logAudit('QA1_OVERRULE', blockId, `Company Admin overrule reason: ${mandatoryReason}`);
  };

  // --- STAGE 2: BLOCK TO CUT SLAB ---
  const convertBlockToCutSlabs = (blockId, { slabsCount, lengthIn, heightIn, thicknessMm, yardLocation }) => {
    const block = rawBlocks.find(b => b.id === blockId);
    if (!block || block.qa1Status !== 'Pass') {
      alert('Cannot cut block until QA 1 has passed.');
      return;
    }

    const count = Number(slabsCount || 40);
    const l = Number(lengthIn || 114);
    const h = Number(heightIn || 64);
    const totalSqFt = Math.round((count * l * h) / 144);

    setRawBlocks(prev => prev.map(b => b.id === blockId ? { ...b, status: 'Cut Sawn' } : b));

    const newCut = {
      id: `CUT-${400 + cutSlabs.length + 1}`,
      clientId: activeClient?.id,
      blockId,
      stoneCode: block.stoneCode,
      slabsCount: count,
      lengthIn: l,
      heightIn: h,
      thicknessMm: Number(thicknessMm || 20),
      totalSqFt,
      yardLocation: yardLocation || 'LOC-B1',
      status: 'Available'
    };
    setCutSlabs(prev => [newCut, ...prev]);

    logAudit('STAGE2_CUT', blockId, `Sawed block into ${newCut.id}: ${count} slabs, ${totalSqFt} Sq.Ft`);
    logMovement(newCut.id, 'Cut Slab', block.yardLocation, newCut.yardLocation, 'Gangsaw Sawing');
  };

  // --- STAGE 3: CUT SLAB TO POLISHED SLAB ---
  const polishCutSlabs = (cutLotId, { finishType, breakageSlabs = 0, yardLocation }) => {
    const cut = cutSlabs.find(c => c.id === cutLotId);
    if (!cut) return;

    const breakage = Number(breakageSlabs || 0);
    const finalCount = Math.max(0, cut.slabsCount - breakage);
    const sqFt = Math.round((finalCount * cut.lengthIn * cut.heightIn) / 144);

    setCutSlabs(prev => prev.map(c => c.id === cutLotId ? { ...c, status: 'Processed' } : c));

    const newPolished = {
      id: `POL-${500 + polishedSlabs.length + 1}`,
      clientId: activeClient?.id,
      cutLotId,
      blockId: cut.blockId,
      stoneCode: cut.stoneCode,
      slabsCount: finalCount,
      lengthIn: cut.lengthIn,
      heightIn: cut.heightIn,
      thicknessMm: cut.thicknessMm,
      finishType: finishType || 'Mirror Polished',
      totalSqFt: sqFt,
      breakageSlabs: breakage,
      qa2Status: 'In QA',
      yardLocation: yardLocation || 'LOC-C1',
      status: 'In QA'
    };
    setPolishedSlabs(prev => [newPolished, ...prev]);

    logAudit('STAGE3_POLISH', cutLotId, `Polished to ${newPolished.id}: ${finalCount} slabs (loss ${breakage})`);
    logMovement(newPolished.id, 'Polished Slab', cut.yardLocation, newPolished.yardLocation, 'Line Polishing');
  };

  // --- QA 2: BETWEEN POLISHED SLAB & FINAL SLAB / BUNDLES ---
  const recordQA2 = ({ polishedLotId, grade, result, remarks, photo }) => {
    const lot = polishedSlabs.find(p => p.id === polishedLotId);

    const newQA = {
      id: `QA2-${String(qa2Records.length + 1).padStart(3, '0')}`,
      clientId: activeClient?.id,
      polishedLotId,
      inspector: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      grade: grade || 'A',
      result: result || 'Pass',
      remarks: remarks || '',
      photo: photo || ''
    };
    setQa2Records(prev => [newQA, ...prev]);

    setPolishedSlabs(prev => prev.map(p => p.id === polishedLotId ? {
      ...p,
      qa2Status: result,
      status: result === 'Pass' ? 'Passed' : (result === 'Reject' ? 'Defective' : 'Rework')
    } : p));

    if (result === 'Reject') {
      const newDef = {
        id: `DEF-${100 + defectiveStore.length + 1}`,
        clientId: activeClient?.id,
        stage: 'Polished Slab',
        itemRefId: polishedLotId,
        stoneCode: lot?.stoneCode,
        reason: remarks || 'QA 2 Rejected (Polish defect)',
        quantity: `${lot?.totalSqFt} Sq.Ft`,
        detectedAt: 'QA 2 Final Line',
        status: 'Scrapped',
        date: new Date().toISOString().slice(0, 10)
      };
      setDefectiveStore(prev => [newDef, ...prev]);
    }

    logAudit('QA2_INSPECT', polishedLotId, `QA 2 Result: ${result} (${grade})`);
  };

  const overruleQA2 = (polishedLotId, mandatoryReason) => {
    setPolishedSlabs(prev => prev.map(p => p.id === polishedLotId ? { ...p, qa2Status: 'Pass', status: 'Passed' } : p));
    logAudit('QA2_OVERRULE', polishedLotId, `Company Admin overrule reason: ${mandatoryReason}`);
  };

  // --- STAGE 4: BUNDLES (FINAL SLABS ONLY CAN BE SOLD) ---
  const bundleFinalSlabs = (polishedLotId, { bundleNumber, grade = 'A', yardLocation }) => {
    const lot = polishedSlabs.find(p => p.id === polishedLotId);
    if (!lot || lot.qa2Status !== 'Pass') {
      alert('Cannot bundle slabs until QA 2 has passed.');
      return;
    }

    setPolishedSlabs(prev => prev.map(p => p.id === polishedLotId ? { ...p, status: 'Completed' } : p));

    const bdlId = bundleNumber || `BDL-${String(bundles.length + 1).padStart(2, '0')}`;
    const newBundle = {
      id: bdlId,
      clientId: activeClient?.id,
      bundleNumber: bdlId,
      stoneCode: lot.stoneCode,
      stage: 'Final Slab',
      blockId: lot.blockId,
      polishedLotId,
      slabsCount: lot.slabsCount,
      lengthIn: lot.lengthIn,
      heightIn: lot.heightIn,
      thicknessMm: lot.thicknessMm,
      finish: lot.finishType,
      grade,
      totalSqFt: lot.totalSqFt,
      reservedSqFt: 0,
      availableSqFt: lot.totalSqFt,
      yardLocation: yardLocation || 'LOC-C1',
      status: 'Available',
      qrCode: `QR-${bdlId}-${lot.stoneCode}`
    };
    setBundles(prev => [newBundle, ...prev]);

    logAudit('STAGE4_BUNDLE', bdlId, `Created Stage 4 Final Bundle ${bdlId} (${lot.totalSqFt} Sq.Ft)`);
    logMovement(bdlId, 'Final Slab Bundle', lot.yardLocation, newBundle.yardLocation, 'Bundled for Sale');
  };

  // Move Bundle location
  const moveBundleLocation = (bundleId, newLocation) => {
    setBundles(prev => prev.map(b => b.id === bundleId ? { ...b, yardLocation: newLocation } : b));
    logMovement(bundleId, 'Bundle', 'Current', newLocation, 'Internal Transfer');
    logAudit('TRANSFER', bundleId, `Moved bundle ${bundleId} to ${newLocation}`);
  };

  // Stock Transfer between yards
  const transferStock = ({ itemId, fromYard, toYard, reason }) => {
    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      itemId,
      fromYard,
      toYard,
      date: new Date().toISOString().slice(0, 10),
      status: 'Completed',
      user: currentUser.name
    };
    setStockTransfers(prev => [newTrf, ...prev]);
    logMovement(itemId, 'Stock Transfer', fromYard, toYard, reason || 'Inter-yard Transfer');
    logAudit('STOCK_TRANSFER', itemId, `Transferred ${itemId} from ${fromYard} to ${toYard}`);
  };

  // Stock Count & Adjustment
  const addStockCount = ({ stage, itemId, physicalSqFt }) => {
    const bundle = bundles.find(b => b.id === itemId);
    const systemSqFt = bundle ? bundle.totalSqFt : 0;
    const diff = Number(physicalSqFt) - systemSqFt;

    const newCnt = {
      id: `CNT-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      stage,
      itemId,
      systemSqFt,
      physicalSqFt: Number(physicalSqFt),
      diffSqFt: diff,
      status: diff === 0 ? 'Matched' : 'Discrepancy',
      date: new Date().toISOString().slice(0, 10)
    };
    setStockCounts(prev => [newCnt, ...prev]);

    if (diff !== 0) {
      // Create pending adjustment needing Company Admin approval
      const newAdj = {
        id: `ADJ-${Date.now().toString().slice(-4)}`,
        clientId: activeClient?.id,
        itemId,
        stage,
        adjustmentSqFt: diff,
        reason: 'Physical Stock Count Variance',
        status: 'Pending',
        approvedBy: '',
        date: new Date().toISOString().slice(0, 10)
      };
      setStockAdjustments(prev => [newAdj, ...prev]);
    }

    logAudit('STOCK_COUNT', itemId, `Count variance: ${diff} Sq.Ft`);
  };

  const approveStockAdjustment = (adjId) => {
    const adj = stockAdjustments.find(a => a.id === adjId);
    if (!adj) return;

    setStockAdjustments(prev => prev.map(a => a.id === adjId ? { ...a, status: 'Approved', approvedBy: currentUser.name } : a));

    // Apply to bundle stock
    if (adj.stage === 'Final Slab') {
      setBundles(prev => prev.map(b => b.id === adj.itemId ? {
        ...b,
        totalSqFt: b.totalSqFt + adj.adjustmentSqFt,
        availableSqFt: Math.max(0, b.availableSqFt + adj.adjustmentSqFt)
      } : b));
    }
    logAudit('STOCK_ADJUSTMENT', adjId, `Company Admin approved adjustment: ${adj.adjustmentSqFt} Sq.Ft`);
  };

  // --- SALES, RESERVATION, INVOICE, CHALLAN, DISPATCH ---
  const createSalesOrder = ({ customerId, bundleId, sqFt, rateSqFt }) => {
    const cust = customers.find(c => c.id === customerId);
    const bundle = bundles.find(b => b.id === bundleId);
    const totalSqFt = Number(sqFt || bundle?.availableSqFt || 500);
    const rate = Number(rateSqFt || 110);
    const total = totalSqFt * rate;

    // Checks
    const isBlocked = cust?.isBlocked;
    const isExceeded = cust && ((cust.balance + total) > cust.creditLimit);

    let status = 'Confirmed';
    let heldReason = '';

    if (isBlocked) {
      status = 'Held';
      heldReason = 'Customer Account Blocked';
    } else if (isExceeded) {
      status = 'Held';
      heldReason = `Credit Limit Exceeded ($${cust.balance + total} > $${cust.creditLimit})`;
    }

    const newSO = {
      id: `SO-2026-${500 + salesOrders.length + 1}`,
      clientId: activeClient?.id,
      customerId,
      customerName: cust?.name || 'Customer',
      stoneCode: bundle?.stoneCode || 'Stone',
      bundleId,
      sqFt: totalSqFt,
      rateSqFt: rate,
      totalAmount: total,
      status,
      overrideReason: heldReason,
      date: new Date().toISOString().slice(0, 10)
    };
    setSalesOrders(prev => [newSO, ...prev]);

    // Reserve stock on Final Slab bundle
    if (bundle && status === 'Confirmed') {
      setBundles(prev => prev.map(b => b.id === bundleId ? {
        ...b,
        reservedSqFt: b.reservedSqFt + totalSqFt,
        availableSqFt: Math.max(0, b.availableSqFt - totalSqFt)
      } : b));
    }

    logAudit('CREATE_SO', newSO.id, `Created order for ${cust?.name} ($${total}). Status: ${status}`);
    return { order: newSO, isHeld: status === 'Held', reason: heldReason };
  };

  const overrideSalesOrderCredit = (orderId, mandatoryReason) => {
    setSalesOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Now confirm reservation
        const bundle = bundles.find(b => b.id === o.bundleId);
        if (bundle) {
          setBundles(prevB => prevB.map(b => b.id === o.bundleId ? {
            ...b,
            reservedSqFt: b.reservedSqFt + o.sqFt,
            availableSqFt: Math.max(0, b.availableSqFt - o.sqFt)
          } : b));
        }
        return {
          ...o,
          status: 'Confirmed',
          overrideReason: `Company Admin Override: ${mandatoryReason}`
        };
      }
      return o;
    }));
    logAudit('OVERRIDE_CREDIT', orderId, `Reason: ${mandatoryReason}`);
  };

  const cancelSalesOrder = (orderId) => {
    const order = salesOrders.find(o => o.id === orderId);
    if (!order) return;

    setSalesOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));

    // Release reservation
    if (order.bundleId) {
      setBundles(prev => prev.map(b => b.id === order.bundleId ? {
        ...b,
        reservedSqFt: Math.max(0, b.reservedSqFt - order.sqFt),
        availableSqFt: b.availableSqFt + order.sqFt
      } : b));
    }
    logAudit('CANCEL_SO', orderId, `Cancelled order and released reservation`);
  };

  const generateInvoice = (orderId) => {
    const order = salesOrders.find(o => o.id === orderId);
    if (!order) return;

    const tax = Math.round(order.totalAmount * 0.18);
    const total = order.totalAmount + tax;

    const newInv = {
      id: `INV-2026-${String(invoices.length + 82).padStart(3, '0')}`,
      clientId: activeClient?.id,
      soId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      sqFt: order.sqFt,
      rateSqFt: order.rateSqFt,
      taxAmount: tax,
      totalAmount: total,
      status: 'Issued',
      date: new Date().toISOString().slice(0, 10),
      originalInvoiceId: null
    };

    setInvoices(prev => [newInv, ...prev]);
    setSalesOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Invoiced' } : o));

    // Update customer credit balance & ageing
    setCustomers(prev => prev.map(c => c.id === order.customerId ? { ...c, balance: c.balance + total } : c));

    logAudit('GENERATE_INVOICE', newInv.id, `Issued invoice $${total} for ${order.customerName}`);
  };

  const cancelAndReissueInvoice = (invoiceId, { newSqFt, newRateSqFt, reason }) => {
    const oldInv = invoices.find(i => i.id === invoiceId);
    if (!oldInv) return;

    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'Cancelled' } : i));

    const sqFt = Number(newSqFt || oldInv.sqFt);
    const rate = Number(newRateSqFt || oldInv.rateSqFt);
    const subtotal = sqFt * rate;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const reissuedInv = {
      id: `INV-2026-${String(invoices.length + 83).padStart(3, '0')}`,
      clientId: activeClient?.id,
      soId: oldInv.soId,
      customerId: oldInv.customerId,
      customerName: oldInv.customerName,
      sqFt,
      rateSqFt: rate,
      taxAmount: tax,
      totalAmount: total,
      status: 'Issued',
      date: new Date().toISOString().slice(0, 10),
      originalInvoiceId: oldInv.id
    };

    setInvoices(prev => [reissuedInv, ...prev]);
    logAudit('CANCEL_REISSUE', invoiceId, `Cancelled ${oldInv.id} and reissued ${reissuedInv.id}. Reason: ${reason}`);
  };

  const createDeliveryChallan = ({ invoiceId, vehicleNo, driverName, slabsCount, bundleNumber }) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const newDC = {
      id: `DC-2026-${String(challans.length + 301).padStart(3, '0')}`,
      clientId: activeClient?.id,
      invoiceId,
      customerName: inv.customerName,
      bundleNumber: bundleNumber || 'BDL-01',
      slabsCount: Number(slabsCount || 16),
      vehicleNo: vehicleNo || 'TR-8812',
      driverName: driverName || 'Driver',
      status: 'Dispatched',
      date: new Date().toISOString().slice(0, 10)
    };
    setChallans(prev => [newDC, ...prev]);

    // Dispatch tracking
    const newDsp = {
      id: `DSP-${String(dispatches.length + 1).padStart(3, '0')}`,
      clientId: activeClient?.id,
      challanId: newDC.id,
      customerName: inv.customerName,
      vehicleNo: newDC.vehicleNo,
      driverName: newDC.driverName,
      dispatchTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'In Transit'
    };
    setDispatches(prev => [newDsp, ...prev]);

    // Deduct stock from Final Slab Bundle permanently (Stock Sold)
    const order = salesOrders.find(o => o.id === inv.soId);
    if (order?.bundleId) {
      setBundles(prev => prev.map(b => b.id === order.bundleId ? {
        ...b,
        reservedSqFt: Math.max(0, b.reservedSqFt - inv.sqFt),
        totalSqFt: Math.max(0, b.totalSqFt - inv.sqFt),
        status: (b.totalSqFt - inv.sqFt) <= 0 ? 'Sold' : 'Available'
      } : b));
      logMovement(order.bundleId, 'Bundle', 'A-Frame', 'Customer Site', `Dispatched on ${newDC.id}`);
    }

    logAudit('DISPATCH', newDC.id, `Dispatched challan for ${inv.customerName} via Vehicle ${newDC.vehicleNo}`);
  };

  // --- ACCOUNTS & PAYMENTS ---
  const recordCustomerPayment = ({ invoiceId, amount, mode, refNo }) => {
    const inv = invoices.find(i => i.id === invoiceId);
    const payment = {
      id: `CPAY-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      invoiceId,
      customerId: inv?.customerId,
      customerName: inv?.customerName || 'Customer',
      amountReceived: Number(amount),
      mode: mode || 'Wire Transfer',
      refNo: refNo || 'TXN-REF',
      date: new Date().toISOString().slice(0, 10)
    };
    setCustomerPayments(prev => [payment, ...prev]);

    // Reduce balance
    if (inv?.customerId) {
      setCustomers(prev => prev.map(c => c.id === inv.customerId ? {
        ...c,
        balance: Math.max(0, c.balance - Number(amount)),
        isBlocked: (c.balance - Number(amount)) <= c.creditLimit ? false : c.isBlocked
      } : c));
    }
    logAudit('CUSTOMER_PAYMENT', payment.id, `Received $${amount} from ${inv?.customerName}`);
  };

  const recordSupplierPayment = ({ billId, amount, mode, refNo, debitNoteDeducted = 0 }) => {
    const bill = supplierBills.find(b => b.id === billId);
    const payment = {
      id: `SPAY-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      billId,
      supplier: bill?.supplier,
      amountPaid: Number(amount),
      mode: mode || 'Wire Transfer',
      refNo: refNo || 'TXN-REF',
      debitNoteDeducted: Number(debitNoteDeducted || 0),
      date: new Date().toISOString().slice(0, 10)
    };
    setSupplierPayments(prev => [payment, ...prev]);

    setSupplierBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'Paid' } : b));
    logAudit('SUPPLIER_PAYMENT', payment.id, `Paid $${amount} to ${bill?.supplier}`);
  };

  const recordContractorPayment = ({ contractorId, amount, period }) => {
    const con = personnel.find(p => p.id === contractorId);
    const payment = {
      id: `CNPAY-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      contractorId,
      contractorName: con?.name,
      amount: Number(amount),
      period: period || 'Current Week',
      date: new Date().toISOString().slice(0, 10),
      status: 'Settled'
    };
    setContractorPayments(prev => [payment, ...prev]);
    logAudit('CONTRACTOR_PAYMENT', payment.id, `Paid $${amount} to ${con?.name}`);
  };

  // --- RETURNS, DEFECTS, CREDIT NOTES & SCRAP ---
  const logDamage = (data) => {
    const newDef = {
      id: `DEF-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      stage: data.stage || 'Cut Slab',
      itemRefId: data.itemRefId,
      stoneCode: data.stoneCode || 'CAR-WHT',
      reason: data.reason,
      quantity: data.quantity || '1 Slab',
      detectedAt: data.detectedAt || 'Handling',
      status: 'Under Review',
      date: new Date().toISOString().slice(0, 10)
    };
    setDefectiveStore(prev => [newDef, ...prev]);
    logAudit('LOG_DAMAGE', newDef.id, `Damage logged: ${data.reason}`);
  };

  const addCreditNote = ({ customerId, invoiceId, amount, reason }) => {
    const cust = customers.find(c => c.id === customerId);
    const newCN = {
      id: `CN-2026-${String(creditNotes.length + 1).padStart(2, '0')}`,
      clientId: activeClient?.id,
      customerId,
      customer: cust?.name,
      invoiceId,
      amount: Number(amount),
      reason,
      status: 'Settled',
      date: new Date().toISOString().slice(0, 10)
    };
    setCreditNotes(prev => [newCN, ...prev]);
    if (customerId) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, balance: Math.max(0, c.balance - Number(amount)) } : c));
    }
    logAudit('CREDIT_NOTE', newCN.id, `Issued credit note $${amount} to ${cust?.name}`);
  };

  const approveScrapWriteOff = (defId, { material, quantityKg, estimatedValue }) => {
    const newScrap = {
      id: `SCRAP-${Date.now().toString().slice(-4)}`,
      clientId: activeClient?.id,
      itemId: defId,
      material: material || 'Scrapped Offcuts',
      quantityKg: Number(quantityKg || 100),
      estimatedValue: Number(estimatedValue || 20),
      approvedBy: currentUser.name,
      date: new Date().toISOString().slice(0, 10)
    };
    setScrapWriteOffs(prev => [newScrap, ...prev]);
    setDefectiveStore(prev => prev.map(d => d.id === defId ? { ...d, status: 'Scrapped' } : d));
    logAudit('SCRAP_WRITEOFF', newScrap.id, `Approved scrap write-off for item ${defId}`);
  };

  // ====================================================
  // 10-STEP INVENTORY WORKFLOW ENGINES & CRUD OPERATIONS
  // ====================================================

  // Step 1: Gate Entry
  const addGateEntry = (data) => {
    const nextNum = gateEntries.length + 1;
    const entryNo = `GE-${String(nextNum).padStart(4, '0')}`;
    const newEntry = {
      id: entryNo,
      entryNo,
      clientId: activeClient?.id || 'CLI-001',
      dateTime: data.dateTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
      truckNo: data.truckNo || '',
      driverName: data.driverName || '',
      driverPhone: data.driverPhone || '',
      transporter: data.transporter || '',
      supplier: data.supplier || '',
      poNo: data.poNo || '',
      challanNo: data.challanNo || '',
      challanWeight: Number(data.challanWeight) || 0,
      remarks: data.remarks || '',
      photo: data.photo || '',
      status: 'Entered',
      isArchived: false,
      createdAt: new Date().toISOString()
    };
    setGateEntries(prev => [newEntry, ...prev]);
    logAudit('CREATE_GATE_ENTRY', entryNo, `Truck ${newEntry.truckNo} from ${newEntry.supplier}`);
    showToast(`Gate Entry ${entryNo} registered successfully`);
    return newEntry;
  };

  const updateGateEntry = (id, patch) => {
    setGateEntries(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
    logAudit('UPDATE_GATE_ENTRY', id, `Updated gate entry details`);
    showToast(`Gate Entry ${id} updated`);
  };

  const deleteGateEntry = (id) => {
    // Check if referenced in weighbridge or blocks
    const isUsed = weighbridgeTickets.some(w => w.gateEntryId === id) || detailedRawBlocks.some(b => b.gateEntryId === id);
    if (isUsed) {
      setGateEntries(prev => prev.map(item => item.id === id ? { ...item, isArchived: true } : item));
      showToast(`Gate Entry ${id} is referenced in downstream steps. Archived instead of removed.`, 'warning');
    } else {
      setGateEntries(prev => prev.filter(item => item.id !== id));
      showToast(`Gate Entry ${id} deleted`);
    }
    logAudit('DELETE_GATE_ENTRY', id, `Archived/Deleted gate entry`);
  };

  const restoreGateEntry = (id) => {
    setGateEntries(prev => prev.map(item => item.id === id ? { ...item, isArchived: false } : item));
    showToast(`Gate Entry ${id} restored`);
    logAudit('RESTORE_GATE_ENTRY', id, `Restored gate entry`);
  };

  // Step 1: Weighbridge
  const addWeighbridgeTicket = (data) => {
    const nextNum = weighbridgeTickets.length + 1;
    const ticketNo = `WB-${String(nextNum).padStart(4, '0')}`;
    const gross = Number(data.grossWeight) || 0;
    const tare = Number(data.tareWeight) || 0;
    const net = Number((gross - tare).toFixed(2));
    const challanWt = Number(data.challanWeight) || 0;
    const variance = Number((net - challanWt).toFixed(2));

    const newTicket = {
      id: ticketNo,
      ticketNo,
      clientId: activeClient?.id || 'CLI-001',
      gateEntryId: data.gateEntryId || '',
      grossWeight: gross,
      tareWeight: tare,
      netWeight: net,
      unit: data.unit || 'Tons',
      challanWeight: challanWt,
      variance,
      inTime: data.inTime || '08:00',
      outTime: data.outTime || '08:30',
      weighedBy: data.weighedBy || currentUser.name,
      status: 'Approved',
      isArchived: false,
      date: new Date().toISOString().slice(0, 10)
    };

    setWeighbridgeTickets(prev => [newTicket, ...prev]);

    // Update Gate Entry status to 'Weighed'
    if (data.gateEntryId) {
      setGateEntries(prev => prev.map(g => g.id === data.gateEntryId ? { ...g, status: 'Weighed' } : g));
    }

    logAudit('CREATE_WEIGHBRIDGE', ticketNo, `Net: ${net} Tons, Variance: ${variance} Tons vs Challan`);
    showToast(`Weighbridge ticket ${ticketNo} created`);
    return newTicket;
  };

  const updateWeighbridgeTicket = (id, patch) => {
    setWeighbridgeTickets(prev => prev.map(item => {
      if (item.id === id) {
        const gross = patch.grossWeight !== undefined ? Number(patch.grossWeight) : item.grossWeight;
        const tare = patch.tareWeight !== undefined ? Number(patch.tareWeight) : item.tareWeight;
        const net = Number((gross - tare).toFixed(2));
        const challanWt = patch.challanWeight !== undefined ? Number(patch.challanWeight) : item.challanWeight;
        const variance = Number((net - challanWt).toFixed(2));
        return { ...item, ...patch, grossWeight: gross, tareWeight: tare, netWeight: net, variance };
      }
      return item;
    }));
    logAudit('UPDATE_WEIGHBRIDGE', id, `Updated weighbridge weights`);
    showToast(`Weighbridge ticket ${id} updated`);
  };

  const deleteWeighbridgeTicket = (id) => {
    const isUsed = detailedRawBlocks.some(b => b.weighbridgeTicketId === id);
    if (isUsed) {
      setWeighbridgeTickets(prev => prev.map(w => w.id === id ? { ...w, isArchived: true } : w));
      showToast(`Weighbridge ${id} is linked to Raw Block. Archived instead of removed.`, 'warning');
    } else {
      setWeighbridgeTickets(prev => prev.filter(w => w.id !== id));
      showToast(`Weighbridge ticket ${id} deleted`);
    }
    logAudit('DELETE_WEIGHBRIDGE', id, `Archived/Deleted weighbridge ticket`);
  };

  const restoreWeighbridgeTicket = (id) => {
    setWeighbridgeTickets(prev => prev.map(w => w.id === id ? { ...w, isArchived: false } : w));
    showToast(`Weighbridge ticket ${id} restored`);
  };

  // Step 2: Raw Blocks
  const addDetailedRawBlock = (data) => {
    const nextNum = detailedRawBlocks.length + 1;
    const blockNo = `BLK-${String(nextNum).padStart(4, '0')}`;
    const length = Number(data.length) || 0;
    const width = Number(data.width) || 0;
    const height = Number(data.height) || 0;
    const grossVolume = Number(((length * width * height) / 1728).toFixed(1)); // cu.ft
    const netWeight = Number(data.netWeight) || 0;
    const estimatedSqFt = Math.round((length * height / 144) * (width / 1.5)) || Math.round(netWeight * 75);

    const newBlock = {
      id: blockNo,
      blockNo,
      clientId: activeClient?.id || 'CLI-001',
      supplier: data.supplier || '',
      quarryBlockNo: data.quarryBlockNo || `Q-${blockNo}`,
      stoneType: data.stoneType || 'Granite',
      color: data.color || '',
      gateEntryId: data.gateEntryId || '',
      weighbridgeTicketId: data.weighbridgeTicketId || '',
      length,
      width,
      height,
      grossVolume,
      netWeight,
      estimatedSqFt,
      receivingDate: data.receivingDate || new Date().toISOString().slice(0, 10),
      receivingYard: data.receivingYard || 'Carrara Yard Main',
      location: data.location || 'Bay 01',
      grade: data.grade || 'Grade A',
      photos: Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : []),
      status: 'Received',
      currentStep: 2,
      itemCost: Number(data.itemCost) || Math.round(netWeight * 210),
      remarks: data.remarks || '',
      isArchived: false
    };

    setDetailedRawBlocks(prev => [newBlock, ...prev]);

    // Update Gate Entry to 'Completed'
    if (data.gateEntryId) {
      setGateEntries(prev => prev.map(g => g.id === data.gateEntryId ? { ...g, status: 'Completed' } : g));
    }

    logMovement(blockNo, 'Block', 'Gate Unloading', `${newBlock.receivingYard} / ${newBlock.location}`, 'Raw Block Putaway');
    logAudit('CREATE_RAW_BLOCK', blockNo, `Block ${blockNo} (${grossVolume} cu.ft, ${netWeight} Tons) received`);
    showToast(`Raw Block ${blockNo} created successfully`);
    return newBlock;
  };

  const updateDetailedRawBlock = (id, patch) => {
    setDetailedRawBlocks(prev => prev.map(item => {
      if (item.id === id) {
        const length = patch.length !== undefined ? Number(patch.length) : item.length;
        const width = patch.width !== undefined ? Number(patch.width) : item.width;
        const height = patch.height !== undefined ? Number(patch.height) : item.height;
        const grossVolume = Number(((length * width * height) / 1728).toFixed(1));
        const netWeight = patch.netWeight !== undefined ? Number(patch.netWeight) : item.netWeight;
        const estimatedSqFt = Math.round((length * height / 144) * (width / 1.5)) || Math.round(netWeight * 75);
        return { ...item, ...patch, length, width, height, grossVolume, estimatedSqFt };
      }
      return item;
    }));
    logAudit('UPDATE_RAW_BLOCK', id, `Updated raw block details`);
    showToast(`Raw Block ${id} updated`);
  };

  const deleteDetailedRawBlock = (id) => {
    const isUsed = slicingJobs.some(s => s.blockId === id) || slabs.some(s => s.blockId === id) || qc1Inspections.some(q => q.blockId === id);
    if (isUsed) {
      setDetailedRawBlocks(prev => prev.map(b => b.id === id ? { ...b, isArchived: true } : b));
      showToast(`Block ${id} is referenced downstream. Archived instead of removed.`, 'warning');
    } else {
      setDetailedRawBlocks(prev => prev.filter(b => b.id !== id));
      showToast(`Raw Block ${id} deleted`);
    }
    logAudit('DELETE_RAW_BLOCK', id, `Archived/Deleted raw block`);
  };

  const restoreDetailedRawBlock = (id) => {
    setDetailedRawBlocks(prev => prev.map(b => b.id === id ? { ...b, isArchived: false } : b));
    showToast(`Raw Block ${id} restored`);
  };

  // Step 3: QC 1 Inspection
  const addQC1Inspection = (data) => {
    const nextNum = qc1Inspections.length + 1;
    const inspectionNo = `QC1-${String(nextNum).padStart(4, '0')}`;
    const newQC = {
      id: inspectionNo,
      inspectionNo,
      blockId: data.blockId,
      inspector: data.inspector || currentUser.name,
      date: data.date || new Date().toISOString().slice(0, 10),
      colorMatch: data.colorMatch || 'Standard Uniform',
      veining: data.veining || 'Regular',
      cracks: data.cracks || 'None',
      stains: data.stains || 'None',
      moisture: data.moisture || 'Dry (<2%)',
      sizeCheck: data.sizeCheck || 'Verified',
      defectType: data.defectType || 'None',
      defectLocation: data.defectLocation || 'N/A',
      defectSeverity: data.defectSeverity || 'None',
      grade: data.grade || 'Grade A',
      result: data.result || 'Pass', // Pass | Rework | Reject
      remarks: data.remarks || '',
      photos: Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : []),
      isArchived: false
    };

    setQc1Inspections(prev => [newQC, ...prev]);

    // Workflow logic per specification:
    // Pass -> updates block status to QC 1 Passed, step 3
    // Rework -> returns block to previous step (Received)
    // Reject -> moves block to Defective Store
    if (data.blockId) {
      if (newQC.result === 'Pass') {
        setDetailedRawBlocks(prev => prev.map(b => b.id === data.blockId ? {
          ...b,
          status: 'QC 1 Passed',
          currentStep: 3,
          grade: newQC.grade
        } : b));
        showToast(`QC 1 Passed for Block ${data.blockId}`);
      } else if (newQC.result === 'Rework') {
        setDetailedRawBlocks(prev => prev.map(b => b.id === data.blockId ? {
          ...b,
          status: 'Received',
          currentStep: 2,
          remarks: `Rework Required: ${newQC.remarks}`
        } : b));
        showToast(`Block ${data.blockId} marked for Rework. Returned to Raw Block stage.`, 'warning');
      } else if (newQC.result === 'Reject') {
        setDetailedRawBlocks(prev => prev.map(b => b.id === data.blockId ? {
          ...b,
          status: 'Rejected',
          currentStep: 3
        } : b));
        // Route to Defective Store
        const defId = `DEF-${String(defectStoreRecords.length + 1).padStart(4, '0')}`;
        const newDefect = {
          id: defId,
          defectNo: defId,
          item: data.blockId,
          stepFound: 'QC 1',
          defectType: newQC.defectType || 'Block Structural Reject',
          severity: newQC.defectSeverity || 'High',
          photo: newQC.photos[0] || '',
          action: 'Return to Supplier',
          sqftOrWeightLost: 'Full Block Weight',
          remarks: newQC.remarks || 'Rejected at initial QC',
          date: new Date().toISOString().slice(0, 10),
          isArchived: false
        };
        setDefectStoreRecords(prev => [newDefect, ...prev]);
        showToast(`Block ${data.blockId} Rejected and moved to Defective Store (${defId})`, 'error');
      }
    }

    logAudit('CREATE_QC1', inspectionNo, `Inspected Block ${data.blockId}: Result ${newQC.result}, Grade ${newQC.grade}`);
    return newQC;
  };

  const updateQC1Inspection = (id, patch) => {
    setQc1Inspections(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...patch };
        const blockId = updated.blockId || patch.blockId;
        if (blockId && patch.result) {
          if (patch.result === 'Pass') {
            setDetailedRawBlocks(blocks => blocks.map(b => b.id === blockId ? {
              ...b,
              status: 'QC 1 Passed',
              currentStep: 3,
              grade: patch.grade || b.grade
            } : b));
          } else if (patch.result === 'Rework') {
            setDetailedRawBlocks(blocks => blocks.map(b => b.id === blockId ? {
              ...b,
              status: 'Received',
              currentStep: 2,
              remarks: `Rework Required: ${patch.remarks || ''}`
            } : b));
          } else if (patch.result === 'Reject') {
            setDetailedRawBlocks(blocks => blocks.map(b => b.id === blockId ? {
              ...b,
              status: 'Rejected',
              currentStep: 3
            } : b));
          }
        }
        return updated;
      }
      return q;
    }));
    logAudit('UPDATE_QC1', id, `Updated QC 1 inspection`);
    showToast(`QC 1 Inspection ${id} updated`);
  };

  const deleteQC1Inspection = (id) => {
    setQc1Inspections(prev => prev.map(q => q.id === id ? { ...q, isArchived: true } : q));
    logAudit('DELETE_QC1', id, `Archived QC 1 inspection`);
    showToast(`QC 1 Inspection ${id} archived`);
  };

  // Step 4: Apply Material (Resin, Mesh, Chemical)
  const addMaterialJob = (data) => {
    const nextNum = materialJobs.length + 1;
    const jobNo = `AM-${String(nextNum).padStart(4, '0')}`;
    const qtyUsed = Number(data.quantityUsed) || 0;

    // Look up material cost
    const mat = materialsStock.find(m => m.type === data.materialType || m.id === data.materialId);
    const unitCost = mat?.costPerUnit || 15;
    const costAdded = Number((qtyUsed * unitCost).toFixed(2));

    const newJob = {
      id: jobNo,
      jobNo,
      clientId: activeClient?.id || 'CLI-001',
      blockId: data.blockId || null,
      slabLotId: data.slabLotId || null,
      date: data.date || new Date().toISOString().slice(0, 10),
      operator: data.operator || currentUser.name,
      shift: data.shift || 'Morning Shift',
      materialType: data.materialType || 'Resin',
      materialBatchNo: data.materialBatchNo || `BATCH-${Date.now().toString().slice(-4)}`,
      quantityUsed: qtyUsed,
      unit: data.unit || 'Ltr',
      areaCovered: Number(data.areaCovered) || 0,
      method: data.method || 'Manual Application & Vacuum Cure',
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '11:00',
      curingTime: data.curingTime || '4 Hours',
      costAdded,
      remarks: data.remarks || '',
      isArchived: false
    };

    setMaterialJobs(prev => [newJob, ...prev]);

    // Material used reduces Materials stock and is added to the item's cost!
    setMaterialsStock(prev => prev.map(m => {
      if (m.type === newJob.materialType || m.id === data.materialId) {
        return { ...m, currentStock: Math.max(0, m.currentStock - qtyUsed) };
      }
      return m;
    }));

    if (data.blockId) {
      setDetailedRawBlocks(prev => prev.map(b => b.id === data.blockId ? {
        ...b,
        itemCost: Number((b.itemCost + costAdded).toFixed(2)),
        status: 'In Material',
        currentStep: 4
      } : b));
    }

    if (data.slabLotId) {
      setSlabs(prev => prev.map(s => s.lotId === data.slabLotId ? {
        ...s,
        cost: Number((s.cost + (costAdded / (slabs.filter(x => x.lotId === data.slabLotId).length || 1))).toFixed(2))
      } : b));
    }

    logAudit('CREATE_MATERIAL_JOB', jobNo, `Applied ${qtyUsed} ${newJob.unit} ${newJob.materialType} to ${data.blockId || data.slabLotId}. Stock deducted & Cost +$${costAdded}`);
    showToast(`Material Job ${jobNo} saved. Materials stock updated and cost added to item.`);
    return newJob;
  };

  const updateMaterialJob = (id, patch) => {
    setMaterialJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
    logAudit('UPDATE_MATERIAL_JOB', id, `Updated material job`);
    showToast(`Material Job ${id} updated`);
  };

  const deleteMaterialJob = (id) => {
    setMaterialJobs(prev => prev.map(j => j.id === id ? { ...j, isArchived: true } : j));
    logAudit('DELETE_MATERIAL_JOB', id, `Archived material job`);
    showToast(`Material Job ${id} archived`);
  };

  // Step 5: Slicing Jobs, Lots & Slabs
  const addSlicingJob = (data) => {
    const nextNum = slicingJobs.length + 1;
    const jobNo = `SL-${String(nextNum).padStart(4, '0')}`;
    const lotId = `LOT-${String(lots.length + 1).padStart(4, '0')}`;

    const slabCount = Number(data.slabCount) || 1;
    const slabLength = Number(data.slabLength) || 114;
    const slabWidth = Number(data.slabWidth) || 68;
    const thickness = Number(data.thickness) || 20;
    const sqftPerSlab = Number(((slabLength * slabWidth) / 144).toFixed(2));
    const totalSqFt = Number((slabCount * sqftPerSlab).toFixed(2));

    const block = detailedRawBlocks.find(b => b.id === data.blockId);
    const inputSqFt = block?.estimatedSqFt || (totalSqFt / 0.92);
    const yieldPct = Number(((totalSqFt / inputSqFt) * 100).toFixed(2));

    const newJob = {
      id: jobNo,
      jobNo,
      clientId: activeClient?.id || 'CLI-001',
      blockId: data.blockId,
      machine: data.machine || 'Gangsaw 01 - Breton Diamond',
      operator: data.operator || currentUser.name,
      shift: data.shift || 'Morning Shift',
      date: data.date || new Date().toISOString().slice(0, 10),
      bladeWireDetails: data.bladeWireDetails || 'Diamond Blades (3.5mm Kerf)',
      startTime: data.startTime || '08:00',
      endTime: data.endTime || '14:00',
      thickness,
      slabCount,
      slabLength,
      slabWidth,
      sqftPerSlab,
      totalSqFt,
      breakageCount: Number(data.breakageCount) || 0,
      offcutWeight: Number(data.offcutWeight) || 0,
      powerOrConsumableUsed: data.powerOrConsumableUsed || '400 kWh',
      yieldPct,
      lotId,
      remarks: data.remarks || '',
      isArchived: false
    };

    setSlicingJobs(prev => [newJob, ...prev]);

    // Create Lot Record
    const newLot = {
      id: lotId,
      lotNo: lotId,
      slicingJobId: jobNo,
      blockId: data.blockId,
      stoneType: block?.stoneType || 'Granite',
      thickness,
      totalSlabs: slabCount,
      totalSqFt,
      status: 'Sliced',
      date: newJob.date,
      isArchived: false
    };
    setLots(prev => [newLot, ...prev]);

    // Automatically create individual Slab records (Create only through previous step!)
    const costPerSlab = block ? Number(((block.itemCost + 500) / slabCount).toFixed(2)) : 160;
    const newSlabs = [];
    const createCount = Math.min(slabCount, 50); // safety cap for individual record generation
    for (let i = 1; i <= createCount; i++) {
      const slabNo = `SLB-${String(slabs.length + i).padStart(4, '0')}`;
      newSlabs.push({
        id: slabNo,
        slabNo,
        lotId,
        blockId: data.blockId,
        stoneType: block?.stoneType || 'Granite',
        thickness,
        length: slabLength,
        width: slabWidth,
        sqft: sqftPerSlab,
        grade: block?.grade || 'Grade A',
        status: 'Sliced',
        yard: block?.receivingYard || 'Carrara Yard Main',
        zone: 'Zone B',
        bay: 'Gangsaw Bay',
        boxId: null,
        location: `${block?.receivingYard || 'Carrara Yard Main'} / Zone B / Gangsaw Bay`,
        cost: costPerSlab,
        isArchived: false
      });
    }
    setSlabs(prev => [...newSlabs, ...prev]);

    // Update Raw Block status
    if (data.blockId) {
      setDetailedRawBlocks(prev => prev.map(b => b.id === data.blockId ? {
        ...b,
        status: 'Sliced',
        currentStep: 5
      } : b));
    }

    logAudit('CREATE_SLICING_JOB', jobNo, `Sliced Block ${data.blockId} into Lot ${lotId} (${slabCount} slabs, ${totalSqFt} Sq.Ft, Yield ${yieldPct}%)`);
    showToast(`Slicing Job ${jobNo} created. Lot ${lotId} and ${createCount} slabs generated.`);
    return newJob;
  };

  const updateSlicingJob = (id, patch) => {
    setSlicingJobs(prev => prev.map(j => {
      if (j.id === id) {
        const slabCount = patch.slabCount !== undefined ? Number(patch.slabCount) : j.slabCount;
        const slabLength = patch.slabLength !== undefined ? Number(patch.slabLength) : j.slabLength;
        const slabWidth = patch.slabWidth !== undefined ? Number(patch.slabWidth) : j.slabWidth;
        const sqftPerSlab = Number(((slabLength * slabWidth) / 144).toFixed(2));
        const totalSqFt = Number((slabCount * sqftPerSlab).toFixed(2));
        const block = detailedRawBlocks.find(b => b.id === (patch.blockId || j.blockId));
        const inputSqFt = block?.estimatedSqFt || totalSqFt;
        const yieldPct = Number(((totalSqFt / inputSqFt) * 100).toFixed(2));
        return { ...j, ...patch, slabCount, slabLength, slabWidth, sqftPerSlab, totalSqFt, yieldPct };
      }
      return j;
    }));
    logAudit('UPDATE_SLICING_JOB', id, `Updated slicing job parameters & recalculated yield`);
    showToast(`Slicing Job ${id} updated`);
  };

  const deleteSlicingJob = (id) => {
    setSlicingJobs(prev => prev.map(j => j.id === id ? { ...j, isArchived: true } : j));
    logAudit('DELETE_SLICING_JOB', id, `Archived slicing job`);
    showToast(`Slicing Job ${id} archived`);
  };

  // Slab updates (Read & Update for grade, location, status. No manual delete per spec)
  const updateSlab = (id, patch) => {
    setSlabs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    logAudit('UPDATE_SLAB', id, `Updated slab attributes`);
    showToast(`Slab ${id} updated`);
  };

  const markSlabScrapOrDefect = (id, action, reason) => {
    setSlabs(prev => prev.map(s => s.id === id ? { ...s, status: action === 'Scrap' ? 'Scrap' : 'Defective' } : s));
    const defId = `DEF-${String(defectStoreRecords.length + 1).padStart(4, '0')}`;
    const newDef = {
      id: defId,
      defectNo: defId,
      item: id,
      stepFound: 'Slab Handling',
      defectType: reason || 'Handling Damage',
      severity: 'Medium',
      photo: '',
      action,
      sqftOrWeightLost: '53.8 Sq.Ft',
      remarks: reason || 'Marked as non-saleable',
      date: new Date().toISOString().slice(0, 10),
      isArchived: false
    };
    setDefectStoreRecords(prev => [newDef, ...prev]);
    showToast(`Slab ${id} moved to Defective/Scrap store (${action})`);
  };

  // Step 6: QC 2 Inspections
  const addQC2Inspection = (data) => {
    const nextNum = qc2Inspections.length + 1;
    const inspectionNo = `QC2-${String(nextNum).padStart(4, '0')}`;

    const newQC = {
      id: inspectionNo,
      inspectionNo,
      lotId: data.lotId || null,
      slabId: data.slabId || null,
      inspector: data.inspector || currentUser.name,
      date: data.date || new Date().toISOString().slice(0, 10),
      thicknessCheck: data.thicknessCheck || '20mm (+/- 0.2mm)',
      flatness: data.flatness || 'Flat',
      edges: data.edges || 'Clean Bevel',
      surface: data.surface || 'High Polish Gloss',
      colorMatch: data.colorMatch || 'Matches Master Batch',
      cracks: data.cracks || 'None',
      resinQuality: data.resinQuality || 'Fully Cured',
      defectType: data.defectType || 'None',
      defectCount: Number(data.defectCount) || 0,
      grade: data.grade || 'Grade A',
      result: data.result || 'Pass', // Pass | Rework | Reject
      remarks: data.remarks || '',
      photos: Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : []),
      isArchived: false
    };

    setQc2Inspections(prev => [newQC, ...prev]);

    // Apply outcome to slabs
    if (newQC.result === 'Pass') {
      if (data.slabId) {
        setSlabs(prev => prev.map(s => s.id === data.slabId ? { ...s, status: 'QC 2 Passed', grade: newQC.grade } : s));
      } else if (data.lotId) {
        setSlabs(prev => prev.map(s => s.lotId === data.lotId ? { ...s, status: 'QC 2 Passed', grade: newQC.grade } : s));
      }
      showToast(`QC 2 Passed for ${data.slabId || `Lot ${data.lotId}`}. Unlocked for Stock Storage and Sale.`);
    } else if (newQC.result === 'Rework') {
      if (data.slabId) {
        setSlabs(prev => prev.map(s => s.id === data.slabId ? { ...s, status: 'In Material' } : s));
      } else if (data.lotId) {
        setSlabs(prev => prev.map(s => s.lotId === data.lotId ? { ...s, status: 'In Material' } : s));
      }
      showToast(`Item returned to Material stage for rework/refinish.`, 'warning');
    } else if (newQC.result === 'Reject') {
      if (data.slabId) {
        setSlabs(prev => prev.map(s => s.id === data.slabId ? { ...s, status: 'Rejected' } : s));
      } else if (data.lotId) {
        setSlabs(prev => prev.map(s => s.lotId === data.lotId ? { ...s, status: 'Rejected' } : s));
      }
      const defId = `DEF-${String(defectStoreRecords.length + 1).padStart(4, '0')}`;
      const newDef = {
        id: defId,
        defectNo: defId,
        item: data.slabId || data.lotId,
        stepFound: 'QC 2',
        defectType: newQC.defectType || 'Slab Surface Defect',
        severity: 'High',
        photo: newQC.photos[0] || '',
        action: 'Downgrade',
        sqftOrWeightLost: 'Surface Loss',
        remarks: newQC.remarks || 'Rejected at QC 2',
        date: new Date().toISOString().slice(0, 10),
        isArchived: false
      };
      setDefectStoreRecords(prev => [newDef, ...prev]);
      showToast(`Item Rejected and sent to Defective Store (${defId})`, 'error');
    }

    logAudit('CREATE_QC2', inspectionNo, `QC 2 for ${data.slabId || data.lotId}: ${newQC.result}`);
    return newQC;
  };

  const updateQC2Inspection = (id, patch) => {
    setQc2Inspections(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...patch };
        const slabId = updated.slabId || patch.slabId;
        const lotId = updated.lotId || patch.lotId;
        if (patch.result) {
          if (patch.result === 'Pass') {
            if (slabId) setSlabs(slabs => slabs.map(s => s.id === slabId ? { ...s, status: 'QC 2 Passed', grade: patch.grade || s.grade } : s));
            else if (lotId) setSlabs(slabs => slabs.map(s => s.lotId === lotId ? { ...s, status: 'QC 2 Passed', grade: patch.grade || s.grade } : s));
          } else if (patch.result === 'Rework') {
            if (slabId) setSlabs(slabs => slabs.map(s => s.id === slabId ? { ...s, status: 'In Material' } : s));
            else if (lotId) setSlabs(slabs => slabs.map(s => s.lotId === lotId ? { ...s, status: 'In Material' } : s));
          } else if (patch.result === 'Reject') {
            if (slabId) setSlabs(slabs => slabs.map(s => s.id === slabId ? { ...s, status: 'Rejected' } : s));
            else if (lotId) setSlabs(slabs => slabs.map(s => s.lotId === lotId ? { ...s, status: 'Rejected' } : s));
          }
        }
        return updated;
      }
      return q;
    }));
    logAudit('UPDATE_QC2', id, `Updated QC 2 record`);
    showToast(`QC 2 Inspection ${id} updated`);
  };

  const deleteQC2Inspection = (id) => {
    setQc2Inspections(prev => prev.map(q => q.id === id ? { ...q, isArchived: true } : q));
    logAudit('DELETE_QC2', id, `Archived QC 2 record`);
    showToast(`QC 2 Inspection ${id} archived`);
  };

  // Step 7: Cut to Size & Pieces
  const addCutToSizeJob = (data) => {
    const nextNum = cutToSizeJobs.length + 1;
    const jobNo = `CS-${String(nextNum).padStart(4, '0')}`;

    const length = Number(data.length) || 24;
    const width = Number(data.width) || 24;
    const thickness = Number(data.thickness) || 20;
    const piecesCount = Number(data.piecesCount) || 1;
    const sqftPerPiece = Number(((length * width) / 144).toFixed(2));
    const totalSqFt = Number((piecesCount * sqftPerPiece).toFixed(2));

    const slab = slabs.find(s => s.id === data.slabId);
    const sourceSqFt = slab ? slab.sqft : 53.83;
    const offcutSqFt = Math.max(0, Number((sourceSqFt - totalSqFt).toFixed(2)));

    const newJob = {
      id: jobNo,
      jobNo,
      clientId: activeClient?.id || 'CLI-001',
      slabId: data.slabId || '',
      lotId: slab?.lotId || data.lotId || '',
      blockId: slab?.blockId || '',
      machine: data.machine || 'Bridge Saw 02 - Pedrini CNC',
      operator: data.operator || currentUser.name,
      date: data.date || new Date().toISOString().slice(0, 10),
      cutSizeName: data.cutSizeName || `${length}" x ${width}" Tiles`,
      length,
      width,
      thickness,
      piecesCount,
      sqftPerPiece,
      totalSqFt,
      breakage: Number(data.breakage) || 0,
      offcutSqFt,
      offcutAction: data.offcutAction || 'Keep as Stock', // Keep as Stock | Scrap
      remarks: data.remarks || '',
      isArchived: false
    };

    setCutToSizeJobs(prev => [newJob, ...prev]);

    // Create piece records
    const newPieces = [];
    for (let i = 1; i <= piecesCount; i++) {
      const pieceNo = `PC-${String(pieces.length + i).padStart(4, '0')}`;
      newPieces.push({
        id: pieceNo,
        pieceNo,
        slabId: data.slabId,
        lotId: newJob.lotId,
        blockId: newJob.blockId,
        stoneType: slab?.stoneType || 'Granite',
        size: `${length}" x ${width}"`,
        length,
        width,
        thickness,
        sqft: sqftPerPiece,
        grade: slab?.grade || 'Grade A',
        status: 'Cut',
        yard: slab?.yard || 'Carrara Yard Main',
        zone: 'Zone C',
        bay: 'Sizing Bay',
        boxId: null,
        location: `${slab?.yard || 'Carrara Yard Main'} / Zone C / Sizing Bay`,
        isArchived: false
      });
    }
    setPieces(prev => [...newPieces, ...prev]);

    // Update source slab status
    if (data.slabId) {
      setSlabs(prev => prev.map(s => s.id === data.slabId ? { ...s, status: 'Cut to Size' } : s));
    }

    // Offcuts handling
    if (newJob.offcutAction === 'Scrap' && offcutSqFt > 0) {
      const defId = `DEF-${String(defectStoreRecords.length + 1).padStart(4, '0')}`;
      setDefectStoreRecords(prev => [{
        id: defId,
        defectNo: defId,
        item: `${data.slabId}-Offcut`,
        stepFound: 'Cut to Size',
        defectType: 'Sizing Offcut Scrap',
        severity: 'Low',
        photo: '',
        action: 'Scrap',
        sqftOrWeightLost: `${offcutSqFt} Sq.Ft`,
        remarks: 'Offcut marked as loss scrap',
        date: new Date().toISOString().slice(0, 10),
        isArchived: false
      }, ...prev]);
    }

    logAudit('CREATE_CUT_TO_SIZE', jobNo, `Cut slab ${data.slabId} into ${piecesCount} pieces (${newJob.cutSizeName}, ${totalSqFt} Sq.Ft). Offcut: ${offcutSqFt} Sq.Ft`);
    showToast(`Cut to Size job ${jobNo} created. ${piecesCount} pieces generated.`);
    return newJob;
  };

  const updateCutToSizeJob = (id, patch) => {
    setCutToSizeJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
    logAudit('UPDATE_CUT_TO_SIZE', id, `Updated cutting job`);
    showToast(`Cut to Size job ${id} updated`);
  };

  const deleteCutToSizeJob = (id) => {
    setCutToSizeJobs(prev => prev.map(j => j.id === id ? { ...j, isArchived: true } : j));
    logAudit('DELETE_CUT_TO_SIZE', id, `Archived cutting job`);
    showToast(`Cut to Size job ${id} archived`);
  };

  const updatePiece = (id, patch) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    logAudit('UPDATE_PIECE', id, `Updated piece`);
    showToast(`Piece ${id} updated`);
  };

  // Step 8: Storage Hierarchy (Yard -> Zone -> Bay -> Box/Pallet -> Item)
  const addBox = (data) => {
    const nextNum = boxes.length + 1;
    const boxNo = `BOX-${String(nextNum).padStart(4, '0')}`;
    const newBox = {
      id: boxNo,
      boxNo,
      clientId: activeClient?.id || 'CLI-001',
      type: data.type || 'Box', // Box | Pallet | A-Frame
      stoneType: data.stoneType || 'Granite',
      thickness: Number(data.thickness) || 20,
      size: data.size || 'Standard',
      grade: data.grade || 'Grade A',
      pieceCount: Number(data.pieceCount) || 0,
      sqft: Number(data.sqft) || 0,
      weight: Number(data.weight) || 0,
      yard: data.yard || 'Carrara Yard Main',
      zone: data.zone || 'Zone C',
      bay: data.bay || 'Bay 01',
      location: `${data.yard || 'Carrara Yard Main'} / ${data.zone || 'Zone C'} / ${data.bay || 'Bay 01'}`,
      label: boxNo,
      status: 'Open', // Open | Sealed | Shipped
      capacity: Number(data.capacity) || 20,
      currentLoad: Number(data.currentLoad) || Number(data.pieceCount) || 0,
      putawayDate: data.putawayDate || new Date().toISOString().slice(0, 10),
      putawayBy: data.putawayBy || currentUser.name,
      isArchived: false
    };

    setBoxes(prev => [newBox, ...prev]);
    logAudit('CREATE_BOX', boxNo, `Created ${newBox.type} ${boxNo} at ${newBox.location}`);
    showToast(`Storage ${newBox.type} ${boxNo} created`);
    return newBox;
  };

  const updateBox = (id, patch) => {
    setBoxes(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    logAudit('UPDATE_BOX', id, `Updated box details`);
    showToast(`Box ${id} updated`);
  };

  const deleteBox = (id) => {
    const hasItems = slabs.some(s => s.boxId === id) || pieces.some(p => p.boxId === id);
    if (hasItems) {
      setBoxes(prev => prev.map(b => b.id === id ? { ...b, isArchived: true } : b));
      showToast(`Box ${id} contains stored items. Archived instead of removed.`, 'warning');
    } else {
      setBoxes(prev => prev.filter(b => b.id !== id));
      showToast(`Box ${id} deleted`);
    }
    logAudit('DELETE_BOX', id, `Archived/Deleted box`);
  };

  // Move and Transfer storage records
  const moveStorageItem = ({ itemId, itemType, fromLoc, toYard, toZone, toBay, toBox, reason, person }) => {
    // Workflow Gate: Stock cannot be stored without a location!
    if (!toYard || !toZone || !toBay) {
      showToast('Workflow Gate: An item cannot be stored without a valid Yard, Zone, and Bay/Rack location!', 'error');
      return false;
    }

    const toLoc = `${toYard} / ${toZone} / ${toBay}${toBox ? ` / ${toBox}` : ''}`;
    const newMov = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      itemType: itemType || 'Item',
      itemId,
      fromLoc: fromLoc || 'Yard Transit',
      toLoc,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      person: person || currentUser.name,
      reason: reason || 'Putaway to Rack/Bay'
    };

    setStorageMovements(prev => [newMov, ...prev]);

    // Update item location in corresponding collection
    if (itemId.startsWith('BLK-')) {
      setDetailedRawBlocks(prev => prev.map(b => b.id === itemId ? {
        ...b,
        receivingYard: toYard,
        location: toBay,
        status: b.status === 'Received' ? 'Stored' : b.status
      } : b));
    } else if (itemId.startsWith('SLB-')) {
      setSlabs(prev => prev.map(s => s.id === itemId ? {
        ...s,
        yard: toYard,
        zone: toZone,
        bay: toBay,
        boxId: toBox || s.boxId,
        location: toLoc,
        status: s.status === 'QC 2 Passed' ? 'Stored' : s.status
      } : s));
    } else if (itemId.startsWith('PC-')) {
      setPieces(prev => prev.map(p => p.id === itemId ? {
        ...p,
        yard: toYard,
        zone: toZone,
        bay: toBay,
        boxId: toBox || p.boxId,
        location: toLoc,
        status: 'Stored'
      } : p));
    } else if (itemId.startsWith('BOX-')) {
      setBoxes(prev => prev.map(b => b.id === itemId ? {
        ...b,
        yard: toYard,
        zone: toZone,
        bay: toBay,
        location: `${toYard} / ${toZone} / ${toBay}`
      } : b));
    }

    logAudit('PUTAWAY_MOVE', itemId, `Moved from ${fromLoc} to ${toLoc}. Reason: ${newMov.reason}`);
    showToast(`Item ${itemId} successfully stored at ${toLoc}`);
    return true;
  };

  // Step 9: Labels & QR / Barcode
  const addLabel = (data) => {
    const nextNum = labels.length + 1;
    const labelNo = `LBL-${String(nextNum).padStart(4, '0')}`;
    const qrCode = `QR-${(data.labelType || 'ITEM').toUpperCase()}-${data.linkedRecordId || labelNo}`;
    const barcode = `8901${String(nextNum).padStart(8, '0')}`;

    const newLabel = {
      id: labelNo,
      labelNo,
      clientId: activeClient?.id || 'CLI-001',
      labelType: data.labelType || 'Block', // Block | Slab | Box | Piece
      linkedRecordId: data.linkedRecordId || '',
      template: data.template || 'Standard Industrial Label',
      qrCode,
      barcode,
      stoneType: data.stoneType || 'Granite',
      size: data.size || '',
      thickness: data.thickness || '',
      grade: data.grade || 'Grade A',
      finish: data.finish || 'Polished High Gloss',
      sqft: Number(data.sqft) || 0,
      location: data.location || '',
      date: new Date().toISOString().slice(0, 10),
      supplier: data.supplier || 'Monte Altissimo Quarry',
      printCount: 1,
      printedBy: currentUser.name,
      status: 'Active',
      isArchived: false
    };

    setLabels(prev => [newLabel, ...prev]);
    logAudit('CREATE_LABEL', labelNo, `Generated ${newLabel.labelType} label for ${newLabel.linkedRecordId}`);
    showToast(`Label ${labelNo} generated`);
    return newLabel;
  };

  const reprintLabel = (id) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, printCount: (l.printCount || 1) + 1, printedBy: currentUser.name } : l));
    const target = labels.find(l => l.id === id);
    const newCount = (target?.printCount || 1) + 1;
    logAudit('REPRINT_LABEL', id, `Reprinted label for ${target?.linkedRecordId}. New count: ${newCount}`);
    showToast(`Label ${id} reprinted (Count: ${newCount})`);
  };

  const updateLabel = (id, patch) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
    logAudit('UPDATE_LABEL', id, `Updated label details`);
    showToast(`Label ${id} updated`);
  };

  const deleteLabel = (id) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, isArchived: true } : l));
    logAudit('DELETE_LABEL', id, `Archived label`);
    showToast(`Label ${id} archived`);
  };

  // Defects & Scrap Store Operations
  const addDefectRecord = (data) => {
    const nextNum = defectStoreRecords.length + 1;
    const defectNo = `DEF-${String(nextNum).padStart(4, '0')}`;
    const newDef = {
      id: defectNo,
      defectNo,
      clientId: activeClient?.id || 'CLI-001',
      item: data.item || '',
      stepFound: data.stepFound || 'QC',
      defectType: data.defectType || 'Fracture',
      severity: data.severity || 'Medium',
      photo: data.photo || '',
      action: data.action || 'Rework', // Rework | Downgrade | Scrap | Return to Supplier
      sqftOrWeightLost: data.sqftOrWeightLost || '0',
      remarks: data.remarks || '',
      date: new Date().toISOString().slice(0, 10),
      isArchived: false
    };

    setDefectStoreRecords(prev => [newDef, ...prev]);
    logAudit('CREATE_DEFECT', defectNo, `Defect on ${newDef.item}: Action ${newDef.action}`);
    showToast(`Defect ${defectNo} logged`);
    return newDef;
  };

  const updateDefectRecord = (id, patch) => {
    setDefectStoreRecords(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
    logAudit('UPDATE_DEFECT', id, `Updated defect`);
    showToast(`Defect ${id} updated`);
  };

  const deleteDefectRecord = (id) => {
    setDefectStoreRecords(prev => prev.map(d => d.id === id ? { ...d, isArchived: true } : d));
    logAudit('DELETE_DEFECT', id, `Archived defect`);
    showToast(`Defect ${id} archived`);
  };

  // Stock Count Sheets
  const addCountSheet = (data) => {
    const nextNum = countSheets.length + 1;
    const sheetNo = `STK-${String(nextNum).padStart(4, '0')}`;
    const sysQty = Number(data.systemQuantity) || 0;
    const physQty = Number(data.physicalQuantity) || 0;
    const variance = physQty - sysQty;

    const newSheet = {
      id: sheetNo,
      countSheetNo: sheetNo,
      clientId: activeClient?.id || 'CLI-001',
      yard: data.yard || 'Carrara Yard Main',
      zone: data.zone || 'Zone A',
      date: data.date || new Date().toISOString().slice(0, 10),
      countedBy: data.countedBy || currentUser.name,
      item: data.item || '',
      systemQuantity: sysQty,
      physicalQuantity: physQty,
      variance,
      reason: data.reason || 'Periodic Physical Stock Audit',
      status: variance === 0 ? 'Approved' : 'Pending Approval',
      approvedBy: variance === 0 ? currentUser.name : null,
      isArchived: false
    };

    setCountSheets(prev => [newSheet, ...prev]);
    logAudit('CREATE_STOCK_COUNT', sheetNo, `Counted ${newSheet.item}: Sys ${sysQty}, Phys ${physQty}, Var ${variance}`);
    showToast(`Stock count sheet ${sheetNo} created`);
    return newSheet;
  };

  const approveCountSheet = (id) => {
    const sheet = countSheets.find(c => c.id === id);
    if (!sheet) return;

    setCountSheets(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'Approved',
      approvedBy: currentUser.name
    } : c));

    // Post to movements
    logMovement(sheet.item, 'Stock Adjustment', sheet.yard, sheet.yard, `Count Audit Approval: Variance ${sheet.variance}`);
    logAudit('APPROVE_STOCK_COUNT', id, `Supplier Admin approved count adjustment (${sheet.variance}) for ${sheet.item}`);
    showToast(`Stock count sheet ${id} approved and adjustment recorded in movements`);
  };

  const rejectCountSheet = (id, reason) => {
    setCountSheets(prev => prev.map(c => c.id === id ? {
      ...c,
      status: 'Rejected',
      reason: `${c.reason || ''} [Rejected: ${reason || 'Recount requested'}]`
    } : c));
    logAudit('REJECT_STOCK_COUNT', id, `Rejected count sheet`);
    showToast(`Stock count sheet ${id} rejected`);
  };

  const deleteCountSheet = (id) => {
    setCountSheets(prev => prev.map(c => c.id === id ? { ...c, isArchived: true } : c));
    logAudit('DELETE_STOCK_COUNT', id, `Archived stock count sheet`);
    showToast(`Count sheet ${id} archived`);
  };

  // Traceability Chain Resolver:
  // Pick any label, piece, slab, or block and trace the full chain back to quarry, truck, weighbridge, QC, materials, machines, operators, storage
  const getTraceabilityChain = (searchId) => {
    if (!searchId) return null;
    const cleanId = String(searchId).trim();

    let targetPiece = pieces.find(p => p.id === cleanId || p.pieceNo === cleanId);
    let targetSlab = slabs.find(s => s.id === cleanId || s.slabNo === cleanId);
    let targetBlock = detailedRawBlocks.find(b => b.id === cleanId || b.blockNo === cleanId);
    let targetBox = boxes.find(bx => bx.id === cleanId || bx.boxNo === cleanId);
    let targetLabel = labels.find(l => l.id === cleanId || l.labelNo === cleanId || l.qrCode === cleanId || l.barcode === cleanId);

    // If searching by label
    if (targetLabel && !targetPiece && !targetSlab && !targetBlock && !targetBox) {
      const linked = targetLabel.linkedRecordId;
      targetPiece = pieces.find(p => p.id === linked);
      targetSlab = slabs.find(s => s.id === linked);
      targetBlock = detailedRawBlocks.find(b => b.id === linked);
      targetBox = boxes.find(bx => bx.id === linked);
    }

    // If searching by QC inspection ID
    const targetQC1 = qc1Inspections.find(q => q.id === cleanId || q.inspectionNo === cleanId);
    const targetQC2 = qc2Inspections.find(q => q.id === cleanId || q.inspectionNo === cleanId);
    if (targetQC1 && !targetBlock && !targetSlab && !targetPiece) {
      if (targetQC1.blockId) targetBlock = detailedRawBlocks.find(b => b.id === targetQC1.blockId);
    }
    if (targetQC2 && !targetBlock && !targetSlab && !targetPiece) {
      if (targetQC2.slabId) targetSlab = slabs.find(s => s.id === targetQC2.slabId);
      if (targetQC2.lotId && !targetSlab) targetSlab = slabs.find(s => s.lotId === targetQC2.lotId);
      if (targetSlab?.blockId) targetBlock = detailedRawBlocks.find(b => b.id === targetSlab.blockId);
    }

    // If target is Piece, resolve parent slab and block
    if (targetPiece) {
      if (!targetSlab && targetPiece.slabId) {
        targetSlab = slabs.find(s => s.id === targetPiece.slabId);
      }
      if (!targetBlock && targetPiece.blockId) {
        targetBlock = detailedRawBlocks.find(b => b.id === targetPiece.blockId);
      }
    }

    // If target is Slab, resolve parent block
    if (targetSlab && !targetBlock && targetSlab.blockId) {
      targetBlock = detailedRawBlocks.find(b => b.id === targetSlab.blockId);
    }

    // Resolve Gate Entry & Weighbridge from Block
    let targetWB = null;
    let targetGE = null;
    if (targetBlock) {
      if (targetBlock.weighbridgeTicketId) {
        targetWB = weighbridgeTickets.find(w => w.id === targetBlock.weighbridgeTicketId);
      }
      if (targetBlock.gateEntryId) {
        targetGE = gateEntries.find(g => g.id === targetBlock.gateEntryId);
      } else if (targetWB?.gateEntryId) {
        targetGE = gateEntries.find(g => g.id === targetWB.gateEntryId);
      }
    }

    // Resolve QC 1
    const blockQC1 = targetBlock ? qc1Inspections.filter(q => q.blockId === targetBlock.id) : [];

    // Resolve Apply Material
    const appliedMaterials = targetBlock ? materialJobs.filter(m => m.blockId === targetBlock.id || (targetSlab && m.slabLotId === targetSlab.lotId)) : [];

    // Resolve Slicing Job & Lot
    const relatedSlicing = targetBlock ? slicingJobs.find(s => s.blockId === targetBlock.id) : null;
    const relatedLot = targetSlab?.lotId ? lots.find(l => l.id === targetSlab.lotId) : (relatedSlicing ? lots.find(l => l.id === relatedSlicing.lotId) : null);

    // Resolve QC 2
    const slabQC2 = targetSlab ? qc2Inspections.filter(q => q.slabId === targetSlab.id || q.lotId === targetSlab.lotId) : [];

    // Resolve Cut to Size
    const relatedCutting = targetPiece?.slabId ? cutToSizeJobs.find(c => c.slabId === targetPiece.slabId) : (targetSlab ? cutToSizeJobs.find(c => c.slabId === targetSlab.id) : null);

    // Resolve Enclosed Items if Box
    const boxSlabs = targetBox ? slabs.filter(s => s.boxId === targetBox.id) : [];
    const boxPieces = targetBox ? pieces.filter(p => p.boxId === targetBox.id) : [];

    // Resolve Labels
    const allRelatedIds = [
      cleanId,
      targetPiece?.id,
      targetSlab?.id,
      targetBlock?.id,
      targetBox?.id,
      targetGE?.id,
      targetWB?.id
    ].filter(Boolean);

    const relatedLabels = labels.filter(l => allRelatedIds.includes(l.linkedRecordId) || l.id === cleanId);
    const relatedMovements = storageMovements.filter(m => allRelatedIds.includes(m.itemId));

    return {
      searchedId: cleanId,
      piece: targetPiece || null,
      slab: targetSlab || null,
      block: targetBlock || null,
      box: targetBox || null,
      boxSlabs,
      boxPieces,
      gateEntry: targetGE || null,
      weighbridge: targetWB || null,
      qc1Inspections: blockQC1,
      materialJobs: appliedMaterials,
      slicingJob: relatedSlicing || null,
      lot: relatedLot || null,
      qc2Inspections: slabQC2,
      cutToSizeJob: relatedCutting || null,
      labels: relatedLabels,
      movements: relatedMovements
    };
  };

  return (
    <TradeProvider>
      <AppContext.Provider value={{
      // Core state
      currentRole,
      setCurrentRole,
      isAuthenticated,
      currentUser,
      activeClient,
      switchClient,
      login,
      logout,

      // Entities
      clients,
      plans,
      customers,
      suppliers,
      stoneTypes,
      rateLists,
      yardLocations,
      users,
      clientRoles,
      customFields,

      // HR & Attendance
      personnel,
      contractors,
      departments,
      designations,
      leaveTypes,
      punchDevices,
      attendance,
      shifts,
      rosters,
      leaveBalances,
      leaveRequests,
      holidays,
      overtimeApprovals,
      advances,
      payrollPeriods,
      biometricSettings,
      updateBiometricSettings,

      // UI Feedback & Toast
      toast,
      showToast,

      // Procurement
      purchaseRequests,
      purchaseOrders,
      receipts,

      // 4-Stage Inventory
      rawBlocks,
      qa1Records,
      cutSlabs,
      polishedSlabs,
      qa2Records,
      bundles,
      stockMovements,
      stockTransfers,
      stockCounts,
      stockAdjustments,

      // Commercial
      salesOrders,
      invoices,
      challans,
      dispatches,

      // Accounts
      supplierBills,
      supplierPayments,
      customerPayments,
      contractorPayments,

      // Defects & Returns
      defectiveStore,
      setDefectiveStore,
      debitNotes,
      creditNotes,
      scrapWriteOffs,

      // System
      notifications,
      auditLogs,

      // Operations & CRUD
      logAudit,
      logMovement,
      addCustomField,
      updateCustomField,
      deleteCustomField,
      addClient,
      updateClient,
      toggleClientBlock,
      resetClientAdminPassword,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      restoreCustomer,
      toggleCustomerBlock,
      bulkArchiveCustomers,
      bulkRestoreCustomers,
      addCustomerContact,
      updateCustomerContact,
      deleteCustomerContact,
      addCustomerAddress,
      updateCustomerAddress,
      deleteCustomerAddress,
      addCustomerDocument,
      updateCustomerDocument,
      deleteCustomerDocument,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      restoreSupplier,
      bulkArchiveSuppliers,
      bulkRestoreSuppliers,
      addSupplierContact,
      updateSupplierContact,
      deleteSupplierContact,
      addSupplierDocument,
      updateSupplierDocument,
      deleteSupplierDocument,
      addStoneType,
      updateStoneType,
      deleteStoneType,
      addRateList,
      updateRateList,
      deleteRateList,
      addYardLocation,
      updateYardLocation,
      deleteYardLocation,
      addUser,
      updateUser,
      deleteUser,
      addClientRole,
      updateClientRole,
      deleteClientRole,
      addPersonnel,
      updatePersonnel,
      deletePersonnel,
      // Comprehensive HR CRUD
      addEmployee,
      updateEmployee,
      deleteEmployee,
      restoreEmployee,
      addContractor,
      updateContractor,
      deleteContractor,
      restoreContractor,
      bulkArchiveContractors,
      bulkRestoreContractors,
      addContractorContact,
      updateContractorContact,
      deleteContractorContact,
      addContractorDocument,
      updateContractorDocument,
      deleteContractorDocument,
      addContractorWorker,
      updateContractorWorker,
      deleteContractorWorker,
      restoreContractorWorker,
      assignRosterCell,
      bulkAssignRoster,
      copyRosterWeek,
      clearRosterDay,
      updateRoster,
      addLeaveRequest,
      updateLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      cancelLeaveRequest,
      deleteLeaveRequest,
      adjustLeaveBalance,
      addLeaveType,
      updateLeaveType,
      deleteLeaveType,
      addAttendance,
      addPunch,
      correctAttendance,
      voidAttendance,
      restoreAttendance,
      assignUnmatchedPunch,
      rejectUnmatchedPunch,
      isDateInLockedPayroll,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      restoreDepartment,
      addDesignation,
      updateDesignation,
      deleteDesignation,
      restoreDesignation,
      addShift,
      updateShift,
      deleteShift,
      addHoliday,
      updateHoliday,
      deleteHoliday,
      addPunchDevice,
      updatePunchDevice,
      deletePunchDevice,
      addAdvance,
      updateAdvance,
      deleteAdvance,
      approveOvertime,
      lockPayrollPeriod,
      unlockPayrollPeriod,
      addPurchaseRequest,
      approvePurchaseRequest,
      addReceipt,
      recordQA1,
      overruleQA1,
      convertBlockToCutSlabs,
      polishCutSlabs,
      recordQA2,
      overruleQA2,
      bundleFinalSlabs,
      moveBundleLocation,
      transferStock,
      addStockCount,
      approveStockAdjustment,
      createSalesOrder,
      overrideSalesOrderCredit,
      cancelSalesOrder,
      generateInvoice,
      cancelAndReissueInvoice,
      createDeliveryChallan,
      recordCustomerPayment,
      recordSupplierPayment,
      recordContractorPayment,
      logDamage,
      addCreditNote,
      approveScrapWriteOff,

      // 10-Step Sequential Inventory System Exports
      gateEntries,
      addGateEntry,
      updateGateEntry,
      deleteGateEntry,
      restoreGateEntry,

      weighbridgeTickets,
      addWeighbridgeTicket,
      updateWeighbridgeTicket,
      deleteWeighbridgeTicket,
      restoreWeighbridgeTicket,

      detailedRawBlocks,
      addDetailedRawBlock,
      updateDetailedRawBlock,
      deleteDetailedRawBlock,
      restoreDetailedRawBlock,

      qc1Inspections,
      addQC1Inspection,
      updateQC1Inspection,
      deleteQC1Inspection,

      materialsStock,
      setMaterialsStock,

      materialJobs,
      addMaterialJob,
      updateMaterialJob,
      deleteMaterialJob,

      slicingJobs,
      addSlicingJob,
      updateSlicingJob,
      deleteSlicingJob,

      lots,
      setLots,

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

      storageMovements,
      moveStorageItem,

      labels,
      addLabel,
      updateLabel,
      reprintLabel,
      deleteLabel,

      defectStoreRecords,
      addDefectRecord,
      updateDefectRecord,
      deleteDefectRecord,

      countSheets,
      addCountSheet,
      approveCountSheet,
      rejectCountSheet,
      deleteCountSheet,

      // Settings Masters (Supplier/Client Admin)
      addMaterialStock,
      updateMaterialStock,
      deleteMaterialStock,

      finishes,
      addFinish,
      updateFinish,
      deleteFinish,

      thicknesses,
      addThickness,
      updateThickness,
      deleteThickness,

      grades,
      addGrade,
      updateGrade,
      deleteGrade,

      machines,
      addMachine,
      updateMachine,
      deleteMachine,

      defectTypesMaster,
      addDefectTypeMaster,
      updateDefectTypeMaster,
      deleteDefectTypeMaster,

      labelTemplatesMaster,
      addLabelTemplateMaster,
      updateLabelTemplateMaster,
      deleteLabelTemplateMaster,

      yardsMaster,
      addYardMaster,
      updateYardMaster,
      deleteYardMaster,

      zonesMaster,
      addZoneMaster,
      updateZoneMaster,
      deleteZoneMaster,

      racksBaysMaster,
      addRackBayMaster,
      updateRackBayMaster,
      deleteRackBayMaster,

      language,
      setLanguage,
      t,
      SUPPORTED_LANGUAGES,

      getTraceabilityChain
    }}>
      {children}
      </AppContext.Provider>
    </TradeProvider>
  );
}

export function useApp() {
  const app = useContext(AppContext);
  const trade = useContext(TradeContext);
  return { ...app, ...(trade || {}) };
}
