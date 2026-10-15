import React, { createContext, useContext, useState, useEffect } from 'react';
import * as tradeData from '../data/tradeMockData';

export const TradeContext = createContext();

const loadPersisted = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`granite_erp_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const savePersisted = (key, data) => {
  try {
    localStorage.setItem(`granite_erp_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
};

export function TradeProvider({ children }) {
  // Active Buyer selection for Buyer Admin role
  const [activeBuyerId, setActiveBuyerIdState] = useState(() => {
    return loadPersisted('activeBuyerId', 'CUST-001');
  });

  const setActiveBuyerId = (id) => {
    setActiveBuyerIdState(id);
    savePersisted('activeBuyerId', id);
  };

  // 1. MASTER COLLECTIONS
  const [units, setUnits] = useState(() => loadPersisted('units', tradeData.initialUnits));
  const [unitConversions, setUnitConversions] = useState(() => loadPersisted('unitConversions', tradeData.initialUnitConversions));
  const [paymentTerms, setPaymentTerms] = useState(() => loadPersisted('paymentTerms', tradeData.initialPaymentTerms));
  const [paymentModes, setPaymentModes] = useState(() => loadPersisted('paymentModes', tradeData.initialPaymentModes));
  const [currencies, setCurrencies] = useState(() => loadPersisted('currencies', tradeData.initialCurrencies));
  const [discountTypes, setDiscountTypes] = useState(() => loadPersisted('discountTypes', tradeData.initialDiscountTypes));
  const [otherCharges, setOtherCharges] = useState(() => loadPersisted('otherCharges', tradeData.initialOtherCharges));
  const [creditPolicies, setCreditPolicies] = useState(() => loadPersisted('creditPolicies', tradeData.initialCreditPolicies));
  const [bankAccounts, setBankAccounts] = useState(() => loadPersisted('bankAccounts', tradeData.initialBankAccounts));
  const [accountHeads, setAccountHeads] = useState(() => loadPersisted('accountHeads', tradeData.initialAccountHeads));
  const [financialYears, setFinancialYears] = useState(() => loadPersisted('financialYears', tradeData.initialFinancialYears));
  const [documentNumbering, setDocumentNumbering] = useState(() => loadPersisted('documentNumbering', tradeData.initialDocumentNumbering));
  const [returnReasons, setReturnReasons] = useState(() => loadPersisted('returnReasons', tradeData.initialReturnReasons));
  const [noteReasons, setNoteReasons] = useState(() => loadPersisted('noteReasons', tradeData.initialNoteReasons));
  const [scrapReasons, setScrapReasons] = useState(() => loadPersisted('scrapReasons', tradeData.initialScrapReasons));
  const [rejectionReasons, setRejectionReasons] = useState(() => loadPersisted('rejectionReasons', tradeData.initialRejectionReasons));
  const [vehicles, setVehicles] = useState(() => loadPersisted('vehicles', tradeData.initialVehicles));
  const [drivers, setDrivers] = useState(() => loadPersisted('drivers', tradeData.initialDrivers));
  const [dispatchLocations, setDispatchLocations] = useState(() => loadPersisted('dispatchLocations', tradeData.initialDispatchLocations));
  const [approvalRules, setApprovalRules] = useState(() => loadPersisted('approvalRules', tradeData.initialApprovalRules));
  const [varianceTolerances, setVarianceTolerances] = useState(() => loadPersisted('varianceTolerances', tradeData.initialVarianceTolerances));
  const [taxRates, setTaxRates] = useState(() => loadPersisted('taxRates', tradeData.initialEnrichedTaxRates));
  const [tradeRateLists, setTradeRateLists] = useState(() => loadPersisted('tradeRateLists', tradeData.initialEnrichedRateLists));

  // 2. TRADE FLOW COLLECTIONS
  const [tradePRs, setTradePRs] = useState(() => loadPersisted('tradePRs', tradeData.initialTradePRs));
  const [tradeBuyerPOs, setTradeBuyerPOs] = useState(() => loadPersisted('tradeBuyerPOs', tradeData.initialTradeBuyerPOs));
  const [tradeQuarryPOs, setTradeQuarryPOs] = useState(() => loadPersisted('tradeQuarryPOs', tradeData.initialTradeQuarryPOs));
  const [tradeGRNs, setTradeGRNs] = useState(() => loadPersisted('tradeGRNs', tradeData.initialTradeGRNs));
  const [tradeSalesOrders, setTradeSalesOrders] = useState(() => loadPersisted('tradeSalesOrders', tradeData.initialTradeSalesOrders));
  const [tradeInvoices, setTradeInvoices] = useState(() => loadPersisted('tradeInvoices', tradeData.initialTradeInvoices));
  const [tradeChallans, setTradeChallans] = useState(() => loadPersisted('tradeChallans', tradeData.initialTradeChallans));
  const [tradeDispatches, setTradeDispatches] = useState(() => loadPersisted('tradeDispatches', tradeData.initialTradeDispatches));
  const [tradeCustomerPayments, setTradeCustomerPayments] = useState(() => loadPersisted('tradeCustomerPayments', tradeData.initialTradeCustomerPayments));
  const [tradeSupplierBills, setTradeSupplierBills] = useState(() => loadPersisted('tradeSupplierBills', tradeData.initialTradeSupplierBills));
  const [tradeSupplierPayments, setTradeSupplierPayments] = useState(() => loadPersisted('tradeSupplierPayments', tradeData.initialTradeSupplierPayments));
  const [tradeContractorPayments, setTradeContractorPayments] = useState(() => loadPersisted('tradeContractorPayments', tradeData.initialTradeContractorPayments));
  const [tradeBuyerGRNs, setTradeBuyerGRNs] = useState(() => loadPersisted('tradeBuyerGRNs', tradeData.initialTradeBuyerGRNs));
  const [tradeReturns, setTradeReturns] = useState(() => loadPersisted('tradeReturns', tradeData.initialTradeReturns));
  const [tradeCreditNotes, setTradeCreditNotes] = useState(() => loadPersisted('tradeCreditNotes', tradeData.initialTradeCreditNotes));
  const [tradeDebitNotes, setTradeDebitNotes] = useState(() => loadPersisted('tradeDebitNotes', tradeData.initialTradeDebitNotes));
  const [tradeScrapWriteOffs, setTradeScrapWriteOffs] = useState(() => loadPersisted('tradeScrapWriteOffs', tradeData.initialTradeScrapWriteOffs));

  // Sync to localStorage
  useEffect(() => { savePersisted('units', units); }, [units]);
  useEffect(() => { savePersisted('unitConversions', unitConversions); }, [unitConversions]);
  useEffect(() => { savePersisted('paymentTerms', paymentTerms); }, [paymentTerms]);
  useEffect(() => { savePersisted('paymentModes', paymentModes); }, [paymentModes]);
  useEffect(() => { savePersisted('currencies', currencies); }, [currencies]);
  useEffect(() => { savePersisted('discountTypes', discountTypes); }, [discountTypes]);
  useEffect(() => { savePersisted('otherCharges', otherCharges); }, [otherCharges]);
  useEffect(() => { savePersisted('creditPolicies', creditPolicies); }, [creditPolicies]);
  useEffect(() => { savePersisted('bankAccounts', bankAccounts); }, [bankAccounts]);
  useEffect(() => { savePersisted('accountHeads', accountHeads); }, [accountHeads]);
  useEffect(() => { savePersisted('financialYears', financialYears); }, [financialYears]);
  useEffect(() => { savePersisted('documentNumbering', documentNumbering); }, [documentNumbering]);
  useEffect(() => { savePersisted('returnReasons', returnReasons); }, [returnReasons]);
  useEffect(() => { savePersisted('noteReasons', noteReasons); }, [noteReasons]);
  useEffect(() => { savePersisted('scrapReasons', scrapReasons); }, [scrapReasons]);
  useEffect(() => { savePersisted('rejectionReasons', rejectionReasons); }, [rejectionReasons]);
  useEffect(() => { savePersisted('vehicles', vehicles); }, [vehicles]);
  useEffect(() => { savePersisted('drivers', drivers); }, [drivers]);
  useEffect(() => { savePersisted('dispatchLocations', dispatchLocations); }, [dispatchLocations]);
  useEffect(() => { savePersisted('approvalRules', approvalRules); }, [approvalRules]);
  useEffect(() => { savePersisted('varianceTolerances', varianceTolerances); }, [varianceTolerances]);
  useEffect(() => { savePersisted('taxRates', taxRates); }, [taxRates]);
  useEffect(() => { savePersisted('tradeRateLists', tradeRateLists); }, [tradeRateLists]);

  useEffect(() => { savePersisted('tradePRs', tradePRs); }, [tradePRs]);
  useEffect(() => { savePersisted('tradeBuyerPOs', tradeBuyerPOs); }, [tradeBuyerPOs]);
  useEffect(() => { savePersisted('tradeQuarryPOs', tradeQuarryPOs); }, [tradeQuarryPOs]);
  useEffect(() => { savePersisted('tradeGRNs', tradeGRNs); }, [tradeGRNs]);
  useEffect(() => { savePersisted('tradeSalesOrders', tradeSalesOrders); }, [tradeSalesOrders]);
  useEffect(() => { savePersisted('tradeInvoices', tradeInvoices); }, [tradeInvoices]);
  useEffect(() => { savePersisted('tradeChallans', tradeChallans); }, [tradeChallans]);
  useEffect(() => { savePersisted('tradeDispatches', tradeDispatches); }, [tradeDispatches]);
  useEffect(() => { savePersisted('tradeCustomerPayments', tradeCustomerPayments); }, [tradeCustomerPayments]);
  useEffect(() => { savePersisted('tradeSupplierBills', tradeSupplierBills); }, [tradeSupplierBills]);
  useEffect(() => { savePersisted('tradeSupplierPayments', tradeSupplierPayments); }, [tradeSupplierPayments]);
  useEffect(() => { savePersisted('tradeContractorPayments', tradeContractorPayments); }, [tradeContractorPayments]);
  useEffect(() => { savePersisted('tradeBuyerGRNs', tradeBuyerGRNs); }, [tradeBuyerGRNs]);
  useEffect(() => { savePersisted('tradeReturns', tradeReturns); }, [tradeReturns]);
  useEffect(() => { savePersisted('tradeCreditNotes', tradeCreditNotes); }, [tradeCreditNotes]);
  useEffect(() => { savePersisted('tradeDebitNotes', tradeDebitNotes); }, [tradeDebitNotes]);
  useEffect(() => { savePersisted('tradeScrapWriteOffs', tradeScrapWriteOffs); }, [tradeScrapWriteOffs]);

  // Helper: Auto Document Number Generator
  const getNextDocNumber = (prefix) => {
    const rule = documentNumbering.find(d => d.prefix === prefix);
    if (rule) {
      const numStr = String(rule.nextNumber).padStart(rule.padding || 4, '0');
      const generated = `${rule.prefix}-${numStr}`;
      // Advance next number
      setDocumentNumbering(prev =>
        prev.map(r => r.prefix === prefix ? { ...r, nextNumber: r.nextNumber + 1 } : r)
      );
      return generated;
    }
    return `${prefix}-${Date.now().toString().slice(-4)}`;
  };

  // --- TRADE ACTION: 1. CREATE PURCHASE REQUEST (Buyer Admin) ---
  const addTradePR = (prData) => {
    const nextId = getNextDocNumber('PR');
    const newPR = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      lines: [],
      totalAmount: 0,
      ...prData
    };
    setTradePRs(prev => [newPR, ...prev]);

    // Also automatically create corresponding Buyer PO in Pending state on Supplier side
    const nextBPOId = getNextDocNumber('BPO');
    const newBPO = {
      id: nextBPOId,
      date: newPR.date,
      buyerId: newPR.buyerId,
      buyerName: newPR.buyerName,
      prId: newPR.id,
      creditCheckResult: 'Approved (Available Credit Check Passed)',
      lines: newPR.lines.map(l => ({ ...l, rate: l.expectedRate, amount: l.lineTotal })),
      subtotal: newPR.totalAmount,
      taxPercent: 18,
      taxAmount: Math.round(newPR.totalAmount * 0.18),
      totalAmount: Math.round(newPR.totalAmount * 1.18),
      status: 'Pending',
      remarks: newPR.remarks || 'Generated from PR'
    };
    setTradeBuyerPOs(prev => [newBPO, ...prev]);
    return newPR;
  };

  // --- TRADE ACTION: 2. APPROVE BUYER PO (Supplier Admin) ---
  const approveBuyerPO = (bpoId) => {
    setTradeBuyerPOs(prev =>
      prev.map(b => b.id === bpoId ? { ...b, status: 'Approved' } : b)
    );
    const targetBPO = tradeBuyerPOs.find(b => b.id === bpoId);
    if (targetBPO) {
      // Update linked PR status to Approved
      if (targetBPO.prId) {
        setTradePRs(prev =>
          prev.map(p => p.id === targetBPO.prId ? { ...p, status: 'Approved' } : p)
        );
      }
      // Create Sales Order and reserve bundles
      const nextSOId = getNextDocNumber('SO');
      const reservedBundleId = `BUN-2024-${String(tradeSalesOrders.length + 1).padStart(3, '0')}`;
      const newSO = {
        id: nextSOId,
        date: new Date().toISOString().split('T')[0],
        buyerId: targetBPO.buyerId,
        buyerName: targetBPO.buyerName,
        bpoId: targetBPO.id,
        shippingAddress: 'Standard Delivery Depot',
        priceList: 'Standard Contract Price',
        creditStatus: 'Cleared',
        lines: targetBPO.lines.map((l, i) => ({
          ...l,
          bundleId: `BUN-2024-${String(i + 1).padStart(3, '0')}`
        })),
        totalAmount: targetBPO.totalAmount,
        reservedBundles: [reservedBundleId],
        status: 'Reserved'
      };
      setTradeSalesOrders(prev => [newSO, ...prev]);
    }
  };

  // --- TRADE ACTION: 3. REJECT BUYER PO ---
  const rejectBuyerPO = (bpoId, reason) => {
    setTradeBuyerPOs(prev =>
      prev.map(b => b.id === bpoId ? { ...b, status: 'Rejected', remarks: reason || 'Rejected' } : b)
    );
    const targetBPO = tradeBuyerPOs.find(b => b.id === bpoId);
    if (targetBPO && targetBPO.prId) {
      setTradePRs(prev =>
        prev.map(p => p.id === targetBPO.prId ? { ...p, status: 'Rejected', remarks: reason || 'Rejected' } : p)
      );
    }
  };

  // --- TRADE ACTION: 4. PARTIALLY APPROVE BUYER PO ---
  const partiallyApproveBuyerPO = (bpoId, updatedLines) => {
    const subtotal = updatedLines.reduce((sum, l) => sum + (Number(l.amount) || (Number(l.qtySqFt || 0) * Number(l.rate || 0))), 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    setTradeBuyerPOs(prev =>
      prev.map(b => {
        if (b.id !== bpoId) return b;
        return {
          ...b,
          lines: updatedLines,
          subtotal,
          taxAmount,
          totalAmount,
          status: 'Approved',
          remarks: 'Partially Approved with adjusted quantities'
        };
      })
    );

    const targetBPO = tradeBuyerPOs.find(b => b.id === bpoId);
    if (targetBPO) {
      if (targetBPO.prId) {
        setTradePRs(prev =>
          prev.map(p => p.id === targetBPO.prId ? { ...p, status: 'Approved', remarks: 'Partially approved with adjusted quantities' } : p)
        );
      }
      const nextSOId = getNextDocNumber('SO');
      const reservedBundleId = `BUN-2024-${String(tradeSalesOrders.length + 1).padStart(3, '0')}`;
      const newSO = {
        id: nextSOId,
        date: new Date().toISOString().split('T')[0],
        buyerId: targetBPO.buyerId,
        buyerName: targetBPO.buyerName,
        bpoId: targetBPO.id,
        shippingAddress: 'Standard Delivery Depot',
        priceList: 'Standard Contract Price',
        creditStatus: 'Cleared',
        lines: updatedLines.map((l, i) => ({
          ...l,
          bundleId: `BUN-2024-${String(i + 1).padStart(3, '0')}`
        })),
        totalAmount,
        reservedBundles: [reservedBundleId],
        status: 'Reserved'
      };
      setTradeSalesOrders(prev => [newSO, ...prev]);
    }
  };

  // --- TRADE ACTION: 5. ISSUE INVOICE & CHALLAN (Supplier Admin) ---
  const issueInvoice = (soId, invoiceDetails = {}) => {
    const targetSO = tradeSalesOrders.find(s => s.id === soId);
    const nextInvId = getNextDocNumber('INV');
    const nextChId = getNextDocNumber('CH');
    const nextDspId = getNextDocNumber('DSP');

    const totalAmt = targetSO?.totalAmount || invoiceDetails.totalAmount || 500000;

    const newInvoice = {
      id: nextInvId,
      date: new Date().toISOString().split('T')[0],
      buyerId: targetSO?.buyerId || invoiceDetails.buyerId,
      buyerName: targetSO?.buyerName || invoiceDetails.buyerName,
      soId: targetSO?.id || null,
      bpoId: targetSO?.bpoId || null,
      subtotal: Math.round(totalAmt / 1.18),
      discountAmount: invoiceDetails.discountAmount || 0,
      taxPercent: 18,
      taxAmount: Math.round((totalAmt / 1.18) * 0.18),
      freightAmount: invoiceDetails.freightAmount || 15000,
      totalAmount: totalAmt,
      paidAmount: 0,
      outstandingAmount: totalAmt,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Issued',
      challanId: nextChId,
      dispatchId: nextDspId
    };

    const newChallan = {
      id: nextChId,
      date: newInvoice.date,
      invoiceId: nextInvId,
      buyerId: newInvoice.buyerId,
      buyerName: newInvoice.buyerName,
      vehicleNo: invoiceDetails.vehicleNo || 'AP 39 TB 4920',
      driverName: invoiceDetails.driverName || 'Kishan Yadav',
      bundles: targetSO?.reservedBundles || ['BUN-2024-001'],
      totalSqFt: targetSO?.lines?.reduce((s, l) => s + (l.qtySqFt || 0), 0) || 1500,
      weightKg: 7500,
      status: 'Dispatched'
    };

    const newDispatch = {
      id: nextDspId,
      date: newInvoice.date,
      challanId: nextChId,
      invoiceId: nextInvId,
      vehicleNo: newChallan.vehicleNo,
      driverName: newChallan.driverName,
      outTime: '10:30 AM',
      status: 'Dispatched',
      proofOfDelivery: 'In Transit'
    };

    setTradeInvoices(prev => [newInvoice, ...prev]);
    setTradeChallans(prev => [newChallan, ...prev]);
    setTradeDispatches(prev => [newDispatch, ...prev]);

    // Update SO status to Invoiced
    if (targetSO) {
      setTradeSalesOrders(prev =>
        prev.map(s => s.id === soId ? { ...s, status: 'Invoiced' } : s)
      );
    }

    return { invoice: newInvoice, challan: newChallan, dispatch: newDispatch };
  };

  // --- TRADE ACTION: 6. CANCEL INVOICE ---
  const cancelInvoice = (invId, reason) => {
    setTradeInvoices(prev =>
      prev.map(inv => inv.id === invId ? { ...inv, status: 'Cancelled', cancelReason: reason } : inv)
    );
    // Also mark linked challan as cancelled
    setTradeChallans(prev =>
      prev.map(ch => ch.invoiceId === invId ? { ...ch, status: 'Cancelled' } : ch)
    );
  };

  // --- TRADE ACTION: 7. REISSUE INVOICE ---
  const reissueInvoice = (oldInvId, newDetails = {}) => {
    cancelInvoice(oldInvId, 'Reissued with corrections');
    const old = tradeInvoices.find(i => i.id === oldInvId);
    if (!old) return;
    const nextInvId = getNextDocNumber('INV');
    const reissued = {
      ...old,
      id: nextInvId,
      date: new Date().toISOString().split('T')[0],
      status: 'Issued',
      reissuedFrom: oldInvId,
      ...newDetails
    };
    setTradeInvoices(prev => [reissued, ...prev]);
    return reissued;
  };

  // --- TRADE ACTION: 8. DISPATCH & CONFIRM DELIVERY ---
  const updateDispatchStatus = (dspId, status, proof = '') => {
    setTradeDispatches(prev =>
      prev.map(d => d.id === dspId ? { ...d, status, proofOfDelivery: proof || d.proofOfDelivery } : d)
    );
    const dsp = tradeDispatches.find(d => d.id === dspId);
    if (dsp && dsp.challanId) {
      setTradeChallans(prev =>
        prev.map(c => c.id === dsp.challanId ? { ...c, status } : c)
      );
    }
  };

  // --- TRADE ACTION: 9. CREATE BUYER MATERIAL GRN (Buyer Admin) ---
  const addBuyerGRN = (bgrnData) => {
    const nextId = getNextDocNumber('BGRN');
    const newBGRN = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: bgrnData.damagedSqFt > 0 ? 'Accepted with Damage' : 'Accepted',
      ...bgrnData
    };
    setTradeBuyerGRNs(prev => [newBGRN, ...prev]);

    // Automatically transition linked Dispatch & Challan to Delivered
    if (bgrnData.dispatchId) {
      setTradeDispatches(prev =>
        prev.map(d => d.id === bgrnData.dispatchId ? {
          ...d,
          status: 'Delivered',
          proofOfDelivery: 'Delivered & Accepted in GRN ' + nextId
        } : d)
      );
      const dsp = tradeDispatches.find(d => d.id === bgrnData.dispatchId);
      if (dsp && dsp.challanId) {
        setTradeChallans(prev =>
          prev.map(c => c.id === dsp.challanId ? { ...c, status: 'Delivered' } : c)
        );
      }
    }

    return newBGRN;
  };

  // --- TRADE ACTION: 10. RECORD CUSTOMER PAYMENT ---
  const addCustomerPayment = (paymentData) => {
    const nextId = getNextDocNumber('RCP');
    const newPayment = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      ...paymentData
    };
    setTradeCustomerPayments(prev => [newPayment, ...prev]);

    // Update allocated invoice(s)
    if (Array.isArray(paymentData.allocatedInvoices)) {
      paymentData.allocatedInvoices.forEach(alloc => {
        setTradeInvoices(prev =>
          prev.map(inv => {
            if (inv.id !== alloc.invoiceId) return inv;
            const newPaid = (inv.paidAmount || 0) + alloc.amount;
            const newOutstanding = Math.max(0, inv.totalAmount - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status: newOutstanding === 0 ? 'Paid' : 'Part Paid'
            };
          })
        );
      });
    }
    return newPayment;
  };

  // --- TRADE ACTION: 11. RECORD SUPPLIER BILL & PAYMENT ---
  const addSupplierBill = (billData) => {
    const nextId = getNextDocNumber('SB');
    const newBill = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      paidAmount: 0,
      outstandingAmount: billData.totalAmount || billData.amount,
      ...billData
    };
    setTradeSupplierBills(prev => [newBill, ...prev]);
    return newBill;
  };

  const addSupplierPayment = (payData) => {
    const nextId = getNextDocNumber('PAY');
    const newPay = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      ...payData
    };
    setTradeSupplierPayments(prev => [newPay, ...prev]);
    return newPay;
  };

  // --- TRADE ACTION: 12. CREATE QUARRY PO & GRN ---
  const addQuarryPO = (qpoData) => {
    const nextId = getNextDocNumber('QPO');
    const newQPO = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
      ...qpoData
    };
    setTradeQuarryPOs(prev => [newQPO, ...prev]);
    return newQPO;
  };

  const addGRN = (grnData) => {
    const nextId = getNextDocNumber('GRN');
    const newGRN = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      approvalStatus: Math.abs(grnData.variancePercent || 0) > 1.5 ? 'Pending Approval' : 'Accepted',
      ...grnData
    };
    setTradeGRNs(prev => [newGRN, ...prev]);
    return newGRN;
  };

  const approveGRNVariance = (grnId) => {
    setTradeGRNs(prev =>
      prev.map(g => g.id === grnId ? { ...g, approvalStatus: 'Accepted', remarks: 'Variance approved by Supplier/Client Admin' } : g)
    );
  };

  // --- TRADE ACTION: 13. RAISE RETURN & ISSUE CREDIT NOTE ---
  const addReturn = (returnData) => {
    const nextId = getNextDocNumber('RET');
    const newRet = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Raised',
      resolutionAction: 'Pending Review',
      ...returnData
    };
    setTradeReturns(prev => [newRet, ...prev]);
    return newRet;
  };

  const approveReturn = (retId, creditAmount = 0) => {
    const nextCNId = getNextDocNumber('CN');
    setTradeReturns(prev =>
      prev.map(r => {
        if (r.id !== retId) return r;
        return {
          ...r,
          status: 'Approved',
          resolutionAction: 'Credit Note',
          creditNoteId: nextCNId,
          remarks: `Credit Note ${nextCNId} issued for ₹${creditAmount.toLocaleString()}`
        };
      })
    );

    const targetRet = tradeReturns.find(r => r.id === retId);
    if (targetRet) {
      const newCN = {
        id: nextCNId,
        date: new Date().toISOString().split('T')[0],
        buyerId: targetRet.buyerId,
        buyerName: targetRet.buyerName,
        invoiceId: targetRet.invoiceId,
        returnId: targetRet.id,
        amount: creditAmount || 25000,
        taxAdjusted: Math.round((creditAmount || 25000) * 0.18),
        totalCredit: Math.round((creditAmount || 25000) * 1.18),
        status: 'Applied to Invoice Balance'
      };
      setTradeCreditNotes(prev => [newCN, ...prev]);

      // Deduct from linked invoice outstanding amount
      if (targetRet.invoiceId) {
        setTradeInvoices(prev =>
          prev.map(inv => {
            if (inv.id !== targetRet.invoiceId) return inv;
            const newOutstanding = Math.max(0, (inv.outstandingAmount || inv.totalAmount) - newCN.totalCredit);
            return {
              ...inv,
              outstandingAmount: newOutstanding
            };
          })
        );
      }
    }
  };

  // --- TRADE ACTION: 14. DEBIT NOTE & SCRAP WRITE-OFF ---
  const addDebitNote = (dnData) => {
    const nextId = getNextDocNumber('DN');
    const newDN = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
      ...dnData
    };
    setTradeDebitNotes(prev => [newDN, ...prev]);
    return newDN;
  };

  const addScrapWriteOff = (scrapData) => {
    const nextId = `SWO-${Date.now().toString().slice(-4)}`;
    const newScrap = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      status: 'Approved',
      ...scrapData
    };
    setTradeScrapWriteOffs(prev => [newScrap, ...prev]);
    return newScrap;
  };

  return (
    <TradeContext.Provider value={{
      // Active Buyer
      activeBuyerId,
      setActiveBuyerId,

      // Masters
      units, setUnits,
      unitConversions, setUnitConversions,
      paymentTerms, setPaymentTerms,
      paymentModes, setPaymentModes,
      currencies, setCurrencies,
      discountTypes, setDiscountTypes,
      otherCharges, setOtherCharges,
      creditPolicies, setCreditPolicies,
      bankAccounts, setBankAccounts,
      accountHeads, setAccountHeads,
      financialYears, setFinancialYears,
      documentNumbering, setDocumentNumbering,
      returnReasons, setReturnReasons,
      noteReasons, setNoteReasons,
      scrapReasons, setScrapReasons,
      rejectionReasons, setRejectionReasons,
      vehicles, setVehicles,
      drivers, setDrivers,
      dispatchLocations, setDispatchLocations,
      approvalRules, setApprovalRules,
      varianceTolerances, setVarianceTolerances,
      taxRates, setTaxRates,
      tradeRateLists, setTradeRateLists,

      // Trade Collections
      tradePRs, setTradePRs,
      tradeBuyerPOs, setTradeBuyerPOs,
      tradeQuarryPOs, setTradeQuarryPOs,
      tradeGRNs, setTradeGRNs,
      tradeSalesOrders, setTradeSalesOrders,
      tradeInvoices, setTradeInvoices,
      tradeChallans, setTradeChallans,
      tradeDispatches, setTradeDispatches,
      tradeCustomerPayments, setTradeCustomerPayments,
      tradeSupplierBills, setTradeSupplierBills,
      tradeSupplierPayments, setTradeSupplierPayments,
      tradeContractorPayments, setTradeContractorPayments,
      tradeBuyerGRNs, setTradeBuyerGRNs,
      tradeReturns, setTradeReturns,
      tradeCreditNotes, setTradeCreditNotes,
      tradeDebitNotes, setTradeDebitNotes,
      tradeScrapWriteOffs, setTradeScrapWriteOffs,

      // Trade Functions
      getNextDocNumber,
      addTradePR,
      approveBuyerPO,
      rejectBuyerPO,
      partiallyApproveBuyerPO,
      addQuarryPO,
      addGRN,
      approveGRNVariance,
      issueInvoice,
      cancelInvoice,
      reissueInvoice,
      updateDispatchStatus,
      addBuyerGRN,
      addCustomerPayment,
      addSupplierBill,
      addSupplierPayment,
      addReturn,
      approveReturn,
      addDebitNote,
      addScrapWriteOff
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
}
