import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layers, UploadCloud } from 'lucide-react';
import { SupplierListScreen } from '../components/clientSetup/SupplierListScreen';
import { SupplierDetailScreen } from '../components/clientSetup/SupplierDetailScreen';
import { SupplierFormDrawer } from '../components/clientSetup/SupplierFormDrawer';
import { BuyerListScreen } from '../components/clientSetup/BuyerListScreen';
import { BuyerDetailScreen } from '../components/clientSetup/BuyerDetailScreen';
import { BuyerFormDrawer } from '../components/clientSetup/BuyerFormDrawer';
import { ContractorListScreen } from '../components/clientSetup/ContractorListScreen';
import { ContractorDetailScreen } from '../components/clientSetup/ContractorDetailScreen';
import { ContractorFormDrawer } from '../components/clientSetup/ContractorFormDrawer';
import { PlantTab } from '../components/clientSetup/PlantTab';
import { ClientUsersTab } from '../components/clientSetup/ClientUsersTab';
import { ClientRolesTab } from '../components/clientSetup/ClientRolesTab';
import { ClientMenusTab } from '../components/clientSetup/ClientMenusTab';
import { ContractorWorkersTab } from '../components/clientSetup/ContractorWorkersTab';
import { CustomFieldsModal } from '../components/clientSetup/CustomFieldsModal';
import { ImportExcelModal } from '../components/clientSetup/ImportExcelModal';
import { ConfirmDialog } from '../components/CommonComponents';

export function ClientSetupHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    restoreSupplier,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    contractors,
    addContractor,
    updateContractor,
    deleteContractor,
    restoreContractor,
    t
  } = useApp();

  // Determine active Submenu: 'suppliers' | 'buyers' | 'contractors'
  const currentSubmenu = searchParams.get('submenu') || (
    searchParams.get('tab') === 'buyers' ? 'buyers' :
    searchParams.get('tab') === 'contractors' ? 'contractors' : 'suppliers'
  );

  // Tab definitions per submenu
  const submenuTabs = {
    suppliers: [
      { key: 'supplier', label: 'Supplier' },
      { key: 'plant', label: 'Plant' },
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' },
      { key: 'menus', label: 'Menu & Submenus' }
    ],
    buyers: [
      { key: 'buyers', label: 'Buyers' },
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' },
      { key: 'menus', label: 'Menu & Submenus' }
    ],
    contractors: [
      { key: 'contractors', label: 'Contractors' },
      { key: 'workers', label: 'Workers' },
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' },
      { key: 'menus', label: 'Menu & Submenus' }
    ]
  };

  const activeTabsList = submenuTabs[currentSubmenu] || submenuTabs.suppliers;
  const defaultTabForSubmenu = activeTabsList[0].key;

  // Active secondary tab
  const rawTab = searchParams.get('tab');
  const isRawTabValid = activeTabsList.some(t => t.key === rawTab);
  const currentTab = isRawTabValid ? rawTab : defaultTabForSubmenu;

  const setTab = (tabKey) => {
    setSearchParams({ submenu: currentSubmenu, tab: tabKey });
    setSelectedSupplierId(null);
    setSelectedBuyerId(null);
    setSelectedContractorId(null);
  };

  // Selection states for drill-down details
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [selectedContractorId, setSelectedContractorId] = useState(null);

  // Supplier Form Drawer State
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Buyer Form Drawer State
  const [isBuyerDrawerOpen, setIsBuyerDrawerOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState(null);

  // Contractor Form Drawer State
  const [isContractorDrawerOpen, setIsContractorDrawerOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);

  // Utility Modals
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Generic Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false
  });

  // --- SUPPLIER HANDLERS ---
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierDrawerOpen(true);
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setIsSupplierDrawerOpen(true);
  };

  const handleSupplierFormSubmit = (formData) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier(formData);
    }
    setIsSupplierDrawerOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplierPrompt = (supplierId) => {
    const target = suppliers.find(s => s.id === supplierId || s.code === supplierId);
    setConfirmDialog({
      isOpen: true,
      title: 'Archive or Delete Supplier',
      message: `Are you sure you want to remove or archive "${target?.name || supplierId}"? If the supplier has active purchase orders, blocks, or invoices, it will be safely archived to Inactive status.`,
      danger: true,
      confirmLabel: 'Confirm Remove / Archive',
      onConfirm: () => {
        deleteSupplier(supplierId);
        if (selectedSupplierId === supplierId) {
          setSelectedSupplierId(null);
        }
      }
    });
  };

  // --- BUYER HANDLERS ---
  const handleOpenAddBuyer = () => {
    setEditingBuyer(null);
    setIsBuyerDrawerOpen(true);
  };

  const handleOpenEditBuyer = (b) => {
    setEditingBuyer(b);
    setIsBuyerDrawerOpen(true);
  };

  const handleBuyerFormSubmit = (formData) => {
    if (editingBuyer) {
      updateCustomer(editingBuyer.id, formData);
    } else {
      addCustomer(formData);
    }
    setIsBuyerDrawerOpen(false);
    setEditingBuyer(null);
  };

  const handleDeleteBuyerPrompt = (buyerId) => {
    const target = customers.find(c => c.id === buyerId || c.code === buyerId);
    setConfirmDialog({
      isOpen: true,
      title: 'Archive or Delete Buyer',
      message: `Are you sure you want to remove or archive "${target?.name || buyerId}"? If the buyer has linked sales orders or invoices, it will be safely archived to Inactive status.`,
      danger: true,
      confirmLabel: 'Confirm Remove / Archive',
      onConfirm: () => {
        deleteCustomer(buyerId);
        if (selectedBuyerId === buyerId) {
          setSelectedBuyerId(null);
        }
      }
    });
  };

  // --- CONTRACTOR HANDLERS ---
  const handleOpenAddContractor = () => {
    setEditingContractor(null);
    setIsContractorDrawerOpen(true);
  };

  const handleOpenEditContractor = (con) => {
    setEditingContractor(con);
    setIsContractorDrawerOpen(true);
  };

  const handleContractorFormSubmit = (formData) => {
    if (editingContractor) {
      updateContractor(editingContractor.id, formData);
    } else {
      addContractor(formData);
    }
    setIsContractorDrawerOpen(false);
    setEditingContractor(null);
  };

  const handleDeleteContractorPrompt = (conId) => {
    const target = contractors.find(c => c.id === conId || c.code === conId);
    setConfirmDialog({
      isOpen: true,
      title: 'Archive or Delete Contractor',
      message: `Are you sure you want to remove or archive contractor "${target?.companyName || conId}"? Any linked workers will also be marked Inactive.`,
      danger: true,
      confirmLabel: 'Confirm Remove / Archive',
      onConfirm: () => {
        deleteContractor(conId);
        if (selectedContractorId === conId) {
          setSelectedContractorId(null);
        }
      }
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Top Secondary Tab Header (Like Inbound UI) */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Left: Clean Text-Only Tabs matching Inbound UI */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
          {activeTabsList.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm ${currentTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(tab.key)}
              style={{
                whiteSpace: 'nowrap',
                fontWeight: currentTab === tab.key ? 700 : 500,
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Master Utilities */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsCustomFieldsOpen(true)}
            style={{ fontSize: '12px' }}
            title="Configure Custom Entity Fields"
          >
            <Layers size={13} />
            <span>Custom Fields</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsImportOpen(true)}
            style={{ fontSize: '12px' }}
            title="Import Excel or CSV Master Data"
          >
            <UploadCloud size={13} />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          {/* ============================================================== */}
          {/* SUBMENU: SUPPLIERS                                            */}
          {/* ============================================================== */}
          {currentSubmenu === 'suppliers' && (
            <>
              {/* Tab 1: Supplier */}
              {currentTab === 'supplier' && (
                selectedSupplierId ? (
                  <SupplierDetailScreen
                    supplierId={selectedSupplierId}
                    onBack={() => setSelectedSupplierId(null)}
                    onEdit={handleOpenEditSupplier}
                    onDelete={handleDeleteSupplierPrompt}
                    onRestore={restoreSupplier}
                  />
                ) : (
                  <SupplierListScreen
                    onSelectSupplier={(id) => setSelectedSupplierId(id)}
                    onOpenAdd={handleOpenAddSupplier}
                    onOpenEdit={handleOpenEditSupplier}
                    onDeleteSupplier={handleDeleteSupplierPrompt}
                    onRestoreSupplier={restoreSupplier}
                  />
                )
              )}

              {/* Tab 2: Plant */}
              {currentTab === 'plant' && <PlantTab />}

              {/* Tab 3: Users */}
              {currentTab === 'users' && <ClientUsersTab scope="supplier" />}

              {/* Tab 4: Roles */}
              {currentTab === 'roles' && <ClientRolesTab scope="supplier" />}

              {/* Tab 5: Menu & Submenus */}
              {currentTab === 'menus' && <ClientMenusTab scope="supplier" />}
            </>
          )}

          {/* ============================================================== */}
          {/* SUBMENU: BUYERS                                               */}
          {/* ============================================================== */}
          {currentSubmenu === 'buyers' && (
            <>
              {/* Tab 1: Buyers */}
              {currentTab === 'buyers' && (
                selectedBuyerId ? (
                  <BuyerDetailScreen
                    buyerId={selectedBuyerId}
                    onBack={() => setSelectedBuyerId(null)}
                    onEdit={handleOpenEditBuyer}
                    onDelete={handleDeleteBuyerPrompt}
                    onRestore={restoreCustomer}
                  />
                ) : (
                  <BuyerListScreen
                    onSelectBuyer={(id) => setSelectedBuyerId(id)}
                    onOpenAdd={handleOpenAddBuyer}
                    onOpenEdit={handleOpenEditBuyer}
                    onDeleteBuyer={handleDeleteBuyerPrompt}
                    onRestoreBuyer={restoreCustomer}
                  />
                )
              )}

              {/* Tab 2: Users */}
              {currentTab === 'users' && <ClientUsersTab scope="buyer" />}

              {/* Tab 3: Roles */}
              {currentTab === 'roles' && <ClientRolesTab scope="buyer" />}

              {/* Tab 4: Menu & Submenus */}
              {currentTab === 'menus' && <ClientMenusTab scope="buyer" />}
            </>
          )}

          {/* ============================================================== */}
          {/* SUBMENU: CONTRACTORS                                          */}
          {/* ============================================================== */}
          {currentSubmenu === 'contractors' && (
            <>
              {/* Tab 1: Contractors */}
              {currentTab === 'contractors' && (
                selectedContractorId ? (
                  <ContractorDetailScreen
                    contractorId={selectedContractorId}
                    onBack={() => setSelectedContractorId(null)}
                    onEdit={handleOpenEditContractor}
                    onDelete={handleDeleteContractorPrompt}
                    onRestore={restoreContractor}
                  />
                ) : (
                  <ContractorListScreen
                    onSelectContractor={(id) => setSelectedContractorId(id)}
                    onOpenAdd={handleOpenAddContractor}
                    onOpenEdit={handleOpenEditContractor}
                    onDeleteContractor={handleDeleteContractorPrompt}
                    onRestoreContractor={restoreContractor}
                  />
                )
              )}

              {/* Tab 2: Workers */}
              {currentTab === 'workers' && <ContractorWorkersTab />}

              {/* Tab 3: Users */}
              {currentTab === 'users' && <ClientUsersTab scope="contractor" />}

              {/* Tab 4: Roles */}
              {currentTab === 'roles' && <ClientRolesTab scope="contractor" />}

              {/* Tab 5: Menu & Submenus */}
              {currentTab === 'menus' && <ClientMenusTab scope="contractor" />}
            </>
          )}
        </div>
      </div>

      {/* DRAWERS */}
      <SupplierFormDrawer
        isOpen={isSupplierDrawerOpen}
        onClose={() => {
          setIsSupplierDrawerOpen(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSubmit={handleSupplierFormSubmit}
      />

      <BuyerFormDrawer
        isOpen={isBuyerDrawerOpen}
        onClose={() => {
          setIsBuyerDrawerOpen(false);
          setEditingBuyer(null);
        }}
        buyer={editingBuyer}
        onSubmit={handleBuyerFormSubmit}
      />

      <ContractorFormDrawer
        isOpen={isContractorDrawerOpen}
        onClose={() => {
          setIsContractorDrawerOpen(false);
          setEditingContractor(null);
        }}
        contractor={editingContractor}
        onSubmit={handleContractorFormSubmit}
      />

      {/* UTILITY MODALS */}
      <CustomFieldsModal
        isOpen={isCustomFieldsOpen}
        onClose={() => setIsCustomFieldsOpen(false)}
      />

      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
