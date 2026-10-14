import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  DataTable,
  FormDrawer,
  StatusBadge,
  ActionDropdown
} from '../CommonComponents';
import {
  Plus,
  Search,
  Layers,
  Cpu,
  MapPin,
  Truck,
  Box,
  Sliders,
  Settings,
  ShieldAlert,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Building,
  Grid
} from 'lucide-react';

// Master Tabs & Entities configuration
const MASTER_TABS = [
  {
    key: 'source',
    label: 'Source',
    icon: Truck,
    description: 'Quarry extraction, raw stone types, surface textures, gauge thickness, and grading standards',
    entities: [
      { key: 'suppliers', label: 'Suppliers / Quarries', singular: 'Supplier / Quarry' },
      { key: 'stones', label: 'Stone Types', singular: 'Stone Type' },
      { key: 'finishes', label: 'Finishes', singular: 'Finish' },
      { key: 'thickness', label: 'Thickness', singular: 'Thickness Spec' },
      { key: 'grades', label: 'Grades', singular: 'Grade' }
    ]
  },
  {
    key: 'process',
    label: 'Process',
    icon: Cpu,
    description: 'Chemicals & mesh consumables, gangsaw & line polisher machinery, defect catalogs, and dynamic tag templates',
    entities: [
      { key: 'materials', label: 'Materials', singular: 'Consumable Material' },
      { key: 'machines', label: 'Machines', singular: 'Machine Workstation' },
      { key: 'defects', label: 'Defect Types', singular: 'Defect Type' },
      { key: 'templates', label: 'Label Templates', singular: 'Label Template' }
    ]
  },
  {
    key: 'location',
    label: 'Location',
    icon: MapPin,
    description: 'Physical yards, logistical processing zones, A-frames & ground bays, and transport crates/pallets',
    entities: [
      { key: 'yards', label: 'Yards', singular: 'Yard Facility' },
      { key: 'zones', label: 'Zones', singular: 'Yard Zone' },
      { key: 'racks', label: 'Racks / Bays', singular: 'Rack / Bay' },
      { key: 'boxes', label: 'Boxes / Pallets', singular: 'Box / Pallet' }
    ]
  }
];

export function MastersHub() {
  const {
    // Source
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    stoneTypes,
    addStoneType,
    updateStoneType,
    deleteStoneType,
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

    // Process
    materialsStock,
    addMaterialStock,
    updateMaterialStock,
    deleteMaterialStock,
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

    // Location
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
    boxes,
    addBox,
    updateBox,
    deleteBox
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'source';
  const activeTabKey = MASTER_TABS.some(t => t.key === rawTab) ? rawTab : 'source';

  const currentTabObj = useMemo(() => {
    return MASTER_TABS.find(t => t.key === activeTabKey) || MASTER_TABS[0];
  }, [activeTabKey]);

  const rawEntity = searchParams.get('entity');
  const activeEntityKey = useMemo(() => {
    if (rawEntity && currentTabObj.entities.some(e => e.key === rawEntity)) {
      return rawEntity;
    }
    return currentTabObj.entities[0]?.key || 'suppliers';
  }, [rawEntity, currentTabObj]);

  const currentEntityObj = useMemo(() => {
    return currentTabObj.entities.find(e => e.key === activeEntityKey) || currentTabObj.entities[0];
  }, [currentTabObj, activeEntityKey]);

  const location = useLocation();
  const isSettingsRoute = location.pathname.startsWith('/settings');

  // Tab switch
  const handleTabChange = (newTabKey) => {
    const targetTab = MASTER_TABS.find(t => t.key === newTabKey) || MASTER_TABS[0];
    const firstEntity = targetTab.entities[0]?.key || 'suppliers';
    const currentSubmenu = searchParams.get('submenu') || (isSettingsRoute ? 'masters' : 'inventory');
    setSearchParams({ submenu: currentSubmenu, tab: newTabKey, entity: firstEntity });
    setSearchQuery('');
  };

  // Entity switch
  const handleEntityChange = (newEntityKey) => {
    const currentSubmenu = searchParams.get('submenu') || (isSettingsRoute ? 'masters' : 'inventory');
    setSearchParams({ submenu: currentSubmenu, tab: activeTabKey, entity: newEntityKey });
    setSearchQuery('');
  };

  // Local Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Open Add Drawer with clean defaults
  const handleOpenAdd = () => {
    setEditingItem(null);
    switch (activeEntityKey) {
      case 'suppliers':
        setFormData({
          name: '',
          materialType: 'Marble',
          contact: '',
          email: '',
          city: '',
          country: 'Italy',
          paymentTerms: 'Net 30',
          rating: 'A',
          status: 'Active'
        });
        break;
      case 'stones':
        setFormData({
          code: '',
          name: '',
          category: 'Granite',
          baseRateSqFt: 75,
          densityKgM3: 2800,
          minStockSqFt: 1500
        });
        break;
      case 'finishes':
        setFormData({
          code: '',
          name: '',
          glossLevel: '>85 GU Mirror Finish',
          suitableFor: 'Interior Flooring, Wall Panels',
          extraCostSqFt: 10,
          status: 'Active'
        });
        break;
      case 'thickness':
        setFormData({
          code: '',
          thicknessValue: 20,
          unit: 'mm',
          tolerance: '+/- 0.3mm',
          commonUse: 'Standard Slabs & Countertops',
          weightFactorKgSqFt: 4.8,
          status: 'Active'
        });
        break;
      case 'grades':
        setFormData({
          code: '',
          name: '',
          allowableDefects: 'Zero cracks, consistent shade and uniform texture',
          priceMultiplier: 1.0,
          status: 'Active'
        });
        break;
      case 'materials':
        setFormData({
          name: '',
          type: 'Resin',
          unit: 'Ltr',
          currentStock: 100,
          costPerUnit: 12.5,
          minStock: 25,
          batchNo: `BAT-${Date.now().toString().slice(-4)}`
        });
        break;
      case 'machines':
        setFormData({
          code: '',
          name: '',
          type: 'Gangsaw Slicer',
          manufacturer: '',
          bladeSpec: 'Diamond Blades (2.5mm)',
          powerKW: 90,
          dailyCapacitySqFt: 1500,
          operator: '',
          shed: 'Sawing Shed A',
          status: 'Operational'
        });
        break;
      case 'defects':
        setFormData({
          code: '',
          name: '',
          stageFound: 'QC 1 (Raw Block)',
          severity: 'Moderate',
          remediation: 'Rework / Trim',
          description: '',
          status: 'Active'
        });
        break;
      case 'templates':
        setFormData({
          code: '',
          name: '',
          targetType: 'Slab',
          dimensions: '3" x 4"',
          codeType: 'Dynamic QR Code',
          showLogo: true,
          showQuarry: false,
          primaryColor: '#0d9488',
          status: 'Active'
        });
        break;
      case 'yards':
        setFormData({
          code: '',
          name: '',
          type: 'Integrated Processing & Storage',
          totalAreaSqFt: 50000,
          capacityMT: 8000,
          manager: '',
          address: '',
          status: 'Active'
        });
        break;
      case 'zones':
        setFormData({
          code: '',
          name: '',
          yard: yardsMaster[0]?.name || 'Carrara Yard Main',
          itemType: 'Slabs',
          capacity: '500 Units',
          supervisor: '',
          status: 'Active'
        });
        break;
      case 'racks':
        setFormData({
          code: '',
          name: '',
          yard: yardsMaster[0]?.name || 'Carrara Yard Main',
          zone: zonesMaster[0]?.name || 'Zone C - Polished Slabs & A-Frames',
          structureType: 'Heavy Duty Steel A-Frame',
          capacityUnits: 24,
          maxLoadMT: 15,
          status: 'Active'
        });
        break;
      case 'boxes':
        setFormData({
          boxNo: `BOX-${String(boxes.length + 1).padStart(4, '0')}`,
          type: 'A-Frame',
          stoneType: stoneTypes[0]?.name || 'Black Galaxy Granite',
          thickness: 20,
          size: '114" x 68"',
          grade: 'Grade A',
          pieceCount: 0,
          sqft: 0,
          weight: 0,
          yard: yardsMaster[0]?.name || 'Carrara Yard Main',
          zone: zonesMaster[0]?.name || 'Zone C',
          bay: racksBaysMaster[0]?.name || 'A-Frame 01',
          capacity: 20,
          currentLoad: 0,
          status: 'Open'
        });
        break;
      default:
        setFormData({});
    }
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDrawerOpen(true);
  };

  // Submit Handler
  const handleSave = (e) => {
    e?.preventDefault?.();
    const isEdit = Boolean(editingItem);

    switch (activeEntityKey) {
      case 'suppliers':
        if (isEdit) updateSupplier(editingItem.id, formData);
        else addSupplier(formData);
        break;
      case 'stones':
        if (isEdit) updateStoneType(editingItem.id, formData);
        else addStoneType(formData);
        break;
      case 'finishes':
        if (isEdit) updateFinish(editingItem.id, formData);
        else addFinish(formData);
        break;
      case 'thickness':
        if (isEdit) updateThickness(editingItem.id, formData);
        else addThickness(formData);
        break;
      case 'grades':
        if (isEdit) updateGrade(editingItem.id, formData);
        else addGrade(formData);
        break;
      case 'materials':
        if (isEdit) updateMaterialStock(editingItem.id, formData);
        else addMaterialStock(formData);
        break;
      case 'machines':
        if (isEdit) updateMachine(editingItem.id, formData);
        else addMachine(formData);
        break;
      case 'defects':
        if (isEdit) updateDefectTypeMaster(editingItem.id, formData);
        else addDefectTypeMaster(formData);
        break;
      case 'templates':
        if (isEdit) updateLabelTemplateMaster(editingItem.id, formData);
        else addLabelTemplateMaster(formData);
        break;
      case 'yards':
        if (isEdit) updateYardMaster(editingItem.id, formData);
        else addYardMaster(formData);
        break;
      case 'zones':
        if (isEdit) updateZoneMaster(editingItem.id, formData);
        else addZoneMaster(formData);
        break;
      case 'racks':
        if (isEdit) updateRackBayMaster(editingItem.id, formData);
        else addRackBayMaster(formData);
        break;
      case 'boxes':
        if (isEdit) updateBox(editingItem.id, formData);
        else addBox(formData);
        break;
      default:
        break;
    }
    setIsDrawerOpen(false);
  };

  // Delete Handler
  const handleDelete = (id) => {
    switch (activeEntityKey) {
      case 'suppliers':
        deleteSupplier(id);
        break;
      case 'stones':
        deleteStoneType(id);
        break;
      case 'finishes':
        deleteFinish(id);
        break;
      case 'thickness':
        deleteThickness(id);
        break;
      case 'grades':
        deleteGrade(id);
        break;
      case 'materials':
        deleteMaterialStock(id);
        break;
      case 'machines':
        deleteMachine(id);
        break;
      case 'defects':
        deleteDefectTypeMaster(id);
        break;
      case 'templates':
        deleteLabelTemplateMaster(id);
        break;
      case 'yards':
        deleteYardMaster(id);
        break;
      case 'zones':
        deleteZoneMaster(id);
        break;
      case 'racks':
        deleteRackBayMaster(id);
        break;
      case 'boxes':
        deleteBox(id);
        break;
      default:
        break;
    }
  };

  // Filtered rows based on current entity & search query
  const filteredData = useMemo(() => {
    let sourceArray = [];
    switch (activeEntityKey) {
      case 'suppliers': sourceArray = suppliers || []; break;
      case 'stones': sourceArray = stoneTypes || []; break;
      case 'finishes': sourceArray = finishes || []; break;
      case 'thickness': sourceArray = thicknesses || []; break;
      case 'grades': sourceArray = grades || []; break;
      case 'materials': sourceArray = materialsStock || []; break;
      case 'machines': sourceArray = machines || []; break;
      case 'defects': sourceArray = defectTypesMaster || []; break;
      case 'templates': sourceArray = labelTemplatesMaster || []; break;
      case 'yards': sourceArray = yardsMaster || []; break;
      case 'zones': sourceArray = zonesMaster || []; break;
      case 'racks': sourceArray = racksBaysMaster || []; break;
      case 'boxes': sourceArray = boxes || []; break;
      default: sourceArray = [];
    }

    if (!searchQuery.trim()) return sourceArray;
    const q = searchQuery.toLowerCase();
    return sourceArray.filter(item => {
      return Object.values(item).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return val.toString().includes(q);
        return false;
      });
    });
  }, [
    activeEntityKey,
    searchQuery,
    suppliers,
    stoneTypes,
    finishes,
    thicknesses,
    grades,
    materialsStock,
    machines,
    defectTypesMaster,
    labelTemplatesMaster,
    yardsMaster,
    zonesMaster,
    racksBaysMaster,
    boxes
  ]);

  // ActionDropdown generator
  const getActionDropdown = (row, entityTitle) => (
    <ActionDropdown
      items={[
        { label: `Edit ${entityTitle}`, onClick: () => handleOpenEdit(row) },
        {
          label: `Delete ${entityTitle}`,
          danger: true,
          confirm: `Are you sure you want to delete ${row.name || row.code || row.boxNo || row.id}?`,
          onClick: () => handleDelete(row.id)
        }
      ]}
    />
  );

  // Column configurations
  const columns = useMemo(() => {
    switch (activeEntityKey) {
      case 'suppliers':
        return [
          { header: 'ID', accessor: 'id', width: '90px' },
          {
            header: 'Supplier / Quarry Name',
            render: r => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.city ? `${r.city}, ${r.country}` : r.country}</div>
              </div>
            )
          },
          { header: 'Material Type', accessor: 'materialType' },
          {
            header: 'Contact Info',
            render: r => (
              <div style={{ fontSize: '12px' }}>
                <div>{r.contact || '—'}</div>
                <div style={{ color: 'var(--muted)' }}>{r.email || '—'}</div>
              </div>
            )
          },
          {
            header: 'Rating',
            render: r => (
              <span className="badge badge-subtle" style={{ fontWeight: 600, color: 'var(--teal-600)' }}>
                {r.rating || 'A'}
              </span>
            )
          },
          { header: 'Payment Terms', accessor: 'paymentTerms' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Supplier') }
        ];

      case 'stones':
        return [
          { header: 'Stone Code', accessor: 'code', width: '110px' },
          {
            header: 'Stone Name',
            render: r => (
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
            )
          },
          {
            header: 'Category',
            render: r => (
              <span className="badge badge-subtle">{r.category}</span>
            )
          },
          {
            header: 'Base Rate / Sq.Ft',
            render: r => (
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                ${r.baseRateSqFt || 0}
              </span>
            )
          },
          {
            header: 'Density',
            render: r => <span>{r.densityKgM3 ? `${r.densityKgM3} kg/m³` : '—'}</span>
          },
          {
            header: 'Min Stock Level',
            render: r => <span>{r.minStockSqFt ? `${r.minStockSqFt} Sq.Ft` : '—'}</span>
          },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Stone Type') }
        ];

      case 'finishes':
        return [
          { header: 'Code', accessor: 'code', width: '90px' },
          {
            header: 'Finish Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          { header: 'Gloss / Texture Sheen', accessor: 'glossLevel' },
          { header: 'Recommended Applications', accessor: 'suitableFor' },
          {
            header: 'Extra Cost / Sq.Ft',
            render: r => (
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                +${r.extraCostSqFt || 0}
              </span>
            )
          },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Finish') }
        ];

      case 'thickness':
        return [
          { header: 'Spec Code', accessor: 'code', width: '100px' },
          {
            header: 'Nominal Thickness',
            render: r => (
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '13px' }}>
                {r.thicknessValue} {r.unit || 'mm'}
              </span>
            )
          },
          { header: 'Tolerance', accessor: 'tolerance' },
          {
            header: 'Weight Factor',
            render: r => <span>{r.weightFactorKgSqFt ? `${r.weightFactorKgSqFt} kg/sq.ft` : '—'}</span>
          },
          { header: 'Common Industry Use', accessor: 'commonUse' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Thickness') }
        ];

      case 'grades':
        return [
          { header: 'Grade Code', accessor: 'code', width: '110px' },
          {
            header: 'Grade Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          { header: 'Allowable Quality Criteria', accessor: 'allowableDefects' },
          {
            header: 'Price Factor',
            render: r => (
              <span className="badge badge-subtle" style={{ fontWeight: 700 }}>
                {r.priceMultiplier ? `${r.priceMultiplier}x` : '1.0x'}
              </span>
            )
          },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Grade') }
        ];

      case 'materials':
        return [
          { header: 'ID', accessor: 'id', width: '95px' },
          {
            header: 'Material Name',
            render: r => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Batch: {r.batchNo || 'N/A'}</div>
              </div>
            )
          },
          {
            header: 'Type',
            render: r => <span className="badge badge-subtle">{r.type}</span>
          },
          {
            header: 'Available Stock',
            render: r => (
              <span style={{ fontWeight: 600, color: r.currentStock <= (r.minStock || 0) ? 'var(--ruby-text)' : 'var(--ink)' }}>
                {r.currentStock} {r.unit}
              </span>
            )
          },
          {
            header: 'Cost / Unit',
            render: r => <span>${Number(r.costPerUnit || 0).toFixed(2)}</span>
          },
          {
            header: 'Reorder Threshold',
            render: r => <span>{r.minStock || 0} {r.unit}</span>
          },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Material') }
        ];

      case 'machines':
        return [
          { header: 'Code', accessor: 'code', width: '90px' },
          {
            header: 'Machine Name',
            render: r => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.manufacturer}</div>
              </div>
            )
          },
          { header: 'Machine Type', accessor: 'type' },
          { header: 'Shed / Bay', accessor: 'shed' },
          {
            header: 'Daily Capacity',
            render: r => <span>{r.dailyCapacitySqFt ? `${r.dailyCapacitySqFt} Sq.Ft` : '—'}</span>
          },
          { header: 'Designated Operator', accessor: 'operator' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Operational'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Machine') }
        ];

      case 'defects':
        return [
          { header: 'Code', accessor: 'code', width: '100px' },
          {
            header: 'Defect Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          { header: 'Discovered At', accessor: 'stageFound' },
          {
            header: 'Severity',
            render: r => {
              const s = r.severity || 'Minor';
              const color = s === 'Critical' ? 'var(--ruby-text)' : s === 'Moderate' ? 'var(--amber-text, #b45309)' : 'var(--teal-600)';
              return <span style={{ fontWeight: 700, color }}>{s}</span>;
            }
          },
          { header: 'Remediation Action', accessor: 'remediation' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Defect Type') }
        ];

      case 'templates':
        return [
          { header: 'Code', accessor: 'code', width: '95px' },
          {
            header: 'Template Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          {
            header: 'Target Item Form',
            render: r => <span className="badge badge-subtle">{r.targetType}</span>
          },
          { header: 'Label Size', accessor: 'dimensions' },
          { header: 'Barcode / QR Format', accessor: 'codeType' },
          {
            header: 'Branding',
            render: r => (
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {r.showLogo ? '✓ Logo ' : ''}{r.showQuarry ? '✓ Quarry' : ''}
              </span>
            )
          },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Template') }
        ];

      case 'yards':
        return [
          { header: 'Code', accessor: 'code', width: '95px' },
          {
            header: 'Yard Facility',
            render: r => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.address}</div>
              </div>
            )
          },
          { header: 'Yard Role', accessor: 'type' },
          {
            header: 'Total Area',
            render: r => <span>{r.totalAreaSqFt ? `${r.totalAreaSqFt.toLocaleString()} Sq.Ft` : '—'}</span>
          },
          {
            header: 'Capacity (MT)',
            render: r => <span style={{ fontWeight: 600 }}>{r.capacityMT ? `${r.capacityMT} MT` : '—'}</span>
          },
          { header: 'Yard Manager', accessor: 'manager' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Yard') }
        ];

      case 'zones':
        return [
          { header: 'Code', accessor: 'code', width: '90px' },
          {
            header: 'Zone Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          { header: 'Belongs to Yard', accessor: 'yard' },
          {
            header: 'Dedicated Type',
            render: r => <span className="badge badge-subtle">{r.itemType}</span>
          },
          { header: 'Storage Capacity', accessor: 'capacity' },
          { header: 'Supervisor', accessor: 'supervisor' },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Zone') }
        ];

      case 'racks':
        return [
          { header: 'Bay Code', accessor: 'code', width: '90px' },
          {
            header: 'Rack / Bay Name',
            render: r => <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          },
          { header: 'Yard', accessor: 'yard' },
          { header: 'Zone', accessor: 'zone' },
          { header: 'Structure Spec', accessor: 'structureType' },
          {
            header: 'Max Capacity',
            render: r => <span>{r.capacityUnits ? `${r.capacityUnits} Units (${r.maxLoadMT || 0} MT)` : '—'}</span>
          },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Active'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Rack / Bay') }
        ];

      case 'boxes':
        return [
          { header: 'Box / Crate No', accessor: 'boxNo', width: '120px' },
          {
            header: 'Structure Type',
            render: r => <span className="badge badge-subtle">{r.type}</span>
          },
          { header: 'Stone Type', accessor: 'stoneType' },
          {
            header: 'Thickness & Grade',
            render: r => <span>{r.thickness ? `${r.thickness}mm` : '—'} • {r.grade || 'Grade A'}</span>
          },
          {
            header: 'Enclosed Content',
            render: r => (
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {r.pieceCount || 0} pcs ({r.sqft || 0} Sq.Ft)
              </span>
            )
          },
          {
            header: 'Yard Location',
            render: r => <span style={{ fontSize: '12px' }}>{r.location || `${r.yard || ''} / ${r.zone || ''}`}</span>
          },
          {
            header: 'Load / Cap',
            render: r => (
              <span>{r.currentLoad || 0} / {r.capacity || 20}</span>
            )
          },
          { header: 'Status', render: r => <StatusBadge status={r.status || 'Open'} /> },
          { header: 'Actions', align: 'right', render: r => getActionDropdown(r, 'Box / Pallet') }
        ];

      default:
        return [];
    }
  }, [activeEntityKey]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* 1. Primary Top Tabs Header: Source | Process | Location */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        alignItems: 'center'
      }}>
        {MASTER_TABS.map((t) => {
          const isActive = activeTabKey === t.key;
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleTabChange(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px'
              }}
            >
              <TabIcon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Entity Tabs / Pills */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
          Entity:
        </span>
        {currentTabObj.entities.map((ent) => {
          const isSelected = activeEntityKey === ent.key;
          return (
            <button
              key={ent.key}
              type="button"
              className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => handleEntityChange(ent.key)}
              style={{
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                border: isSelected ? '1px solid var(--ink)' : '1px solid transparent'
              }}
            >
              {ent.label}
            </button>
          );
        })}
      </div>

      {/* 3. Main Master View Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="page-wrapper">
          {/* Header Row: Title & Action (Matching Attendance Pattern) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                {currentEntityObj.label}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                {isSettingsRoute ? 'Settings • Masters' : 'Masters • Inventory'} &bull; {currentTabObj.label} &bull; {filteredData.length} Records
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  className="form-input form-input-sm"
                  placeholder={`Search ${currentEntityObj.label}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>

              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                <Plus size={14} />
                <span>Add {currentEntityObj.singular}</span>
              </button>
            </div>
          </div>

          {/* Unified DataTable */}
          <DataTable
            columns={columns}
            data={filteredData}
            emptyMessage={`No ${currentEntityObj.label.toLowerCase()} found.`}
          />
        </div>
      </div>

      {/* 4. Unified FormDrawer for Add & Edit */}
      <FormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingItem ? `Edit ${currentEntityObj.singular}` : `New ${currentEntityObj.singular}`}
        onSubmit={handleSave}
        submitLabel={editingItem ? "Save Changes" : `Create ${currentEntityObj.singular}`}
      >
        {activeEntityKey === 'suppliers' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Supplier / Quarry Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Monte Altissimo Quarry"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Material Type</label>
              <select
                className="form-select"
                value={formData.materialType || 'Marble'}
                onChange={e => setFormData({ ...formData, materialType: e.target.value })}
              >
                <option value="Marble">Marble</option>
                <option value="Granite">Granite</option>
                <option value="Quartzite">Quartzite</option>
                <option value="Sandstone">Sandstone</option>
                <option value="Limestone">Limestone</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quality Rating</label>
              <select
                className="form-select"
                value={formData.rating || 'A'}
                onChange={e => setFormData({ ...formData, rating: e.target.value })}
              >
                <option value="A+">A+ (Premium Export)</option>
                <option value="A">A (Standard Grade)</option>
                <option value="B+">B+ (Commercial)</option>
                <option value="B">B (Economy)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                className="form-input"
                placeholder="e.g. Seravezza"
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                className="form-input"
                placeholder="e.g. Italy"
                value={formData.country || ''}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                className="form-input"
                placeholder="+39-0585-8812"
                value={formData.contact || ''}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="quarry@altissimo.it"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms</label>
              <select
                className="form-select"
                value={formData.paymentTerms || 'Net 30'}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Advance">Advance</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'stones' && (
          <>
            <div className="form-group">
              <label className="form-label">Stone Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. BLK-GAL"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stone Category</label>
              <select
                className="form-select"
                value={formData.category || 'Granite'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Granite">Granite</option>
                <option value="Marble">Marble</option>
                <option value="Quartzite">Quartzite</option>
                <option value="Onyx">Onyx</option>
                <option value="Travertine">Travertine</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Stone Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Black Galaxy Granite"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Base Rate / Sq.Ft ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="65"
                value={formData.baseRateSqFt || ''}
                onChange={e => setFormData({ ...formData, baseRateSqFt: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Density (kg/m³)</label>
              <input
                type="number"
                className="form-input"
                placeholder="2900"
                value={formData.densityKgM3 || ''}
                onChange={e => setFormData({ ...formData, densityKgM3: Number(e.target.value) })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Minimum Stock Alert Threshold (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="1500"
                value={formData.minStockSqFt || ''}
                onChange={e => setFormData({ ...formData, minStockSqFt: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        {activeEntityKey === 'finishes' && (
          <>
            <div className="form-group">
              <label className="form-label">Finish Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. POL"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Finish Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Polished High Gloss"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Gloss Sheen & Surface Specification</label>
              <input
                className="form-input"
                placeholder="e.g. >90 GU Mirror Finish"
                value={formData.glossLevel || ''}
                onChange={e => setFormData({ ...formData, glossLevel: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Suitable Architectural Applications</label>
              <input
                className="form-input"
                placeholder="e.g. Interior Flooring, Vanity Tops, Wall Panels"
                value={formData.suitableFor || ''}
                onChange={e => setFormData({ ...formData, suitableFor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Extra Cost / Sq.Ft ($)</label>
              <input
                type="number"
                className="form-input"
                placeholder="12"
                value={formData.extraCostSqFt ?? ''}
                onChange={e => setFormData({ ...formData, extraCostSqFt: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'thickness' && (
          <>
            <div className="form-group">
              <label className="form-label">Spec Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. 20MM"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thickness Value (mm) *</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="20"
                value={formData.thicknessValue ?? ''}
                onChange={e => setFormData({ ...formData, thicknessValue: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tolerance Gauge</label>
              <input
                className="form-input"
                placeholder="+/- 0.3mm"
                value={formData.tolerance || ''}
                onChange={e => setFormData({ ...formData, tolerance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight Factor (Kg / Sq.Ft)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="4.8"
                value={formData.weightFactorKgSqFt ?? ''}
                onChange={e => setFormData({ ...formData, weightFactorKgSqFt: Number(e.target.value) })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Common Commercial Use</label>
              <input
                className="form-input"
                placeholder="e.g. International Export Slabs & Kitchen Tops"
                value={formData.commonUse || ''}
                onChange={e => setFormData({ ...formData, commonUse: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'grades' && (
          <>
            <div className="form-group">
              <label className="form-label">Grade Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. GRADE-A"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Grade Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Grade A (Premium Export)"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Allowable Quality Criteria & Defects</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Zero cracks, flawless veining, mirror gloss >90"
                value={formData.allowableDefects || ''}
                onChange={e => setFormData({ ...formData, allowableDefects: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Multiplier</label>
              <input
                type="number"
                step="0.05"
                className="form-input"
                placeholder="1.25"
                value={formData.priceMultiplier ?? ''}
                onChange={e => setFormData({ ...formData, priceMultiplier: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'materials' && (
          <>
            <div className="form-group col-span-2">
              <label className="form-label">Material Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Epoxy Resin Clear Coat (Tenax / Akemi)"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Material Type</label>
              <select
                className="form-select"
                value={formData.type || 'Resin'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Resin">Resin</option>
                <option value="Mesh">Fiberglass Mesh</option>
                <option value="Chemical">Stone Chemical / Hardener</option>
                <option value="Abrasive">Polishing Abrasive Puck</option>
                <option value="Blade">Diamond Blade / Wire</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                className="form-select"
                value={formData.unit || 'Ltr'}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="Ltr">Ltr (Liters)</option>
                <option value="Rolls">Rolls</option>
                <option value="Kgs">Kgs (Kilograms)</option>
                <option value="Units">Units / Pcs</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current Stock Available</label>
              <input
                type="number"
                className="form-input"
                placeholder="425"
                value={formData.currentStock ?? ''}
                onChange={e => setFormData({ ...formData, currentStock: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="14.50"
                value={formData.costPerUnit ?? ''}
                onChange={e => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Batch / Lot Reference</label>
              <input
                className="form-input"
                placeholder="RES-BATCH-2026-A"
                value={formData.batchNo || ''}
                onChange={e => setFormData({ ...formData, batchNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert</label>
              <input
                type="number"
                className="form-input"
                placeholder="50"
                value={formData.minStock ?? ''}
                onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </div>
          </>
        )}

        {activeEntityKey === 'machines' && (
          <>
            <div className="form-group">
              <label className="form-label">Machine Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. GS-01"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Machine Type</label>
              <select
                className="form-select"
                value={formData.type || 'Gangsaw Slicer'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Gangsaw Slicer">Gangsaw Slicer</option>
                <option value="Bridge Saw CNC">Bridge Saw CNC</option>
                <option value="Line Polisher">Line Polisher</option>
                <option value="Resin Vacuum Line">Resin Vacuum Line</option>
                <option value="Wire Saw">Wire Saw Profiler</option>
                <option value="Calibrator">Thickness Calibrator</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Machine Name & Model *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Gangsaw 01 - Gaspari Menotti"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                className="form-input"
                placeholder="e.g. Gaspari Menotti (Italy)"
                value={formData.manufacturer || ''}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shed Location</label>
              <input
                className="form-input"
                placeholder="e.g. Sawing Shed A"
                value={formData.shed || ''}
                onChange={e => setFormData({ ...formData, shed: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Blade / Tooling Specification</label>
              <input
                className="form-input"
                placeholder="e.g. 80 Diamond Blades (2.5mm)"
                value={formData.bladeSpec || ''}
                onChange={e => setFormData({ ...formData, bladeSpec: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Power Rating (KW)</label>
              <input
                type="number"
                className="form-input"
                placeholder="110"
                value={formData.powerKW ?? ''}
                onChange={e => setFormData({ ...formData, powerKW: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Capacity (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="1800"
                value={formData.dailyCapacitySqFt ?? ''}
                onChange={e => setFormData({ ...formData, dailyCapacitySqFt: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designated Operator</label>
              <input
                className="form-input"
                placeholder="Ramesh Patel"
                value={formData.operator || ''}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Status</label>
              <select
                className="form-select"
                value={formData.status || 'Operational'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Standby">Standby</option>
                <option value="Under Repair">Under Repair</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'defects' && (
          <>
            <div className="form-group">
              <label className="form-label">Defect Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. CRK-HAIR"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Defect Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Hairline Structural Crack"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stage Discovered</label>
              <select
                className="form-select"
                value={formData.stageFound || 'QC 1 (Raw Block)'}
                onChange={e => setFormData({ ...formData, stageFound: e.target.value })}
              >
                <option value="QC 1 (Raw Block)">QC 1 (Raw Block)</option>
                <option value="Apply Material">Apply Material</option>
                <option value="QC 2 (Polished Slab)">QC 2 (Polished Slab)</option>
                <option value="Cut to Size (Piece)">Cut to Size (Piece)</option>
                <option value="Storage & Packaging">Storage & Packaging</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Defect Severity</label>
              <select
                className="form-select"
                value={formData.severity || 'Moderate'}
                onChange={e => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="Critical">Critical (Immediate Rejection / Scrap)</option>
                <option value="Moderate">Moderate (Rework Required)</option>
                <option value="Minor">Minor (Touch-up / Acceptable)</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Standard Remediation Directive</label>
              <input
                className="form-input"
                placeholder="e.g. Downgrade / Scrap or Chemical Bleaching"
                value={formData.remediation || ''}
                onChange={e => setFormData({ ...formData, remediation: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Technical Description</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Describe visible indicators and root cause"
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'templates' && (
          <>
            <div className="form-group">
              <label className="form-label">Template Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. LBL-SLB"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Stone Form</label>
              <select
                className="form-select"
                value={formData.targetType || 'Slab'}
                onChange={e => setFormData({ ...formData, targetType: e.target.value })}
              >
                <option value="Block">Quarry Block</option>
                <option value="Slab">Polished Slab</option>
                <option value="Box">Pallet / Crate Box</option>
                <option value="Piece">Cut Piece / Tile</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Template Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Polished Slab Export Tag (3 x 4)"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Label Dimensions</label>
              <input
                className="form-input"
                placeholder='e.g. 3" x 4"'
                value={formData.dimensions || ''}
                onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode / QR Format</label>
              <select
                className="form-select"
                value={formData.codeType || 'Dynamic QR Code'}
                onChange={e => setFormData({ ...formData, codeType: e.target.value })}
              >
                <option value="Dynamic QR Code">Dynamic QR Code</option>
                <option value="GS1-128 Barcode">GS1-128 Barcode</option>
                <option value="QR Code + Code 128 Barcode">QR Code + Code 128 Barcode</option>
                <option value="High Density 2D DataMatrix">High Density 2D DataMatrix</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Show Corporate Logo</label>
              <select
                className="form-select"
                value={formData.showLogo ? 'yes' : 'no'}
                onChange={e => setFormData({ ...formData, showLogo: e.target.value === 'yes' })}
              >
                <option value="yes">Yes (Include Logo)</option>
                <option value="no">No (Minimalist)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Show Quarry Origin</label>
              <select
                className="form-select"
                value={formData.showQuarry ? 'yes' : 'no'}
                onChange={e => setFormData({ ...formData, showQuarry: e.target.value === 'yes' })}
              >
                <option value="yes">Yes (Display Quarry)</option>
                <option value="no">No (Internal Only)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'yards' && (
          <>
            <div className="form-group">
              <label className="form-label">Yard Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. YRD-CAR"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yard Facility Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Carrara Yard Main"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Yard Operational Role</label>
              <select
                className="form-select"
                value={formData.type || 'Integrated Processing & Storage'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Integrated Processing & Storage">Integrated Processing & Storage</option>
                <option value="Raw Block Holding">Raw Block Holding</option>
                <option value="Finished Crate Dispatch Terminal">Finished Crate Dispatch Terminal</option>
                <option value="Quarry Mine Head">Quarry Mine Head</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Footprint Area (Sq.Ft)</label>
              <input
                type="number"
                className="form-input"
                placeholder="85000"
                value={formData.totalAreaSqFt ?? ''}
                onChange={e => setFormData({ ...formData, totalAreaSqFt: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight Capacity (Metric Tons)</label>
              <input
                type="number"
                className="form-input"
                placeholder="12000"
                value={formData.capacityMT ?? ''}
                onChange={e => setFormData({ ...formData, capacityMT: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yard Manager</label>
              <input
                className="form-input"
                placeholder="Rajesh Sharma"
                value={formData.manager || ''}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Address / Location</label>
              <input
                className="form-input"
                placeholder="Via Carriona 45, Carrara"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </>
        )}

        {activeEntityKey === 'zones' && (
          <>
            <div className="form-group">
              <label className="form-label">Zone Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. ZN-A"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Belongs to Yard Facility</label>
              <select
                className="form-select"
                value={formData.yard || yardsMaster[0]?.name || ''}
                onChange={e => setFormData({ ...formData, yard: e.target.value })}
              >
                {yardsMaster.map(y => (
                  <option key={y.id} value={y.name}>{y.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Zone Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Zone A - Block Unloading & Weighment"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dedicated Stone Form</label>
              <select
                className="form-select"
                value={formData.itemType || 'Raw Blocks'}
                onChange={e => setFormData({ ...formData, itemType: e.target.value })}
              >
                <option value="Raw Blocks">Raw Blocks</option>
                <option value="Blocks in Sawing">Blocks in Sawing</option>
                <option value="Slabs">Slabs</option>
                <option value="Boxes & Pallets">Boxes & Pallets</option>
                <option value="Pieces / Tiles">Pieces / Tiles</option>
                <option value="Defective Store">Defective Store</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Capacity</label>
              <input
                className="form-input"
                placeholder="e.g. 200 Blocks"
                value={formData.capacity || ''}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zone Supervisor</label>
              <input
                className="form-input"
                placeholder="Ramesh Patel"
                value={formData.supervisor || ''}
                onChange={e => setFormData({ ...formData, supervisor: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'racks' && (
          <>
            <div className="form-group">
              <label className="form-label">Rack / Bay Code *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. AF-01"
                value={formData.code || ''}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yard Facility</label>
              <select
                className="form-select"
                value={formData.yard || yardsMaster[0]?.name || ''}
                onChange={e => setFormData({ ...formData, yard: e.target.value })}
              >
                {yardsMaster.map(y => (
                  <option key={y.id} value={y.name}>{y.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Rack / Bay Name *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. A-Frame 01 (Export Slabs)"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Associated Zone</label>
              <select
                className="form-select"
                value={formData.zone || zonesMaster[0]?.name || ''}
                onChange={e => setFormData({ ...formData, zone: e.target.value })}
              >
                {zonesMaster.map(z => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Structure Specification</label>
              <select
                className="form-select"
                value={formData.structureType || 'Heavy Duty Steel A-Frame'}
                onChange={e => setFormData({ ...formData, structureType: e.target.value })}
              >
                <option value="Heavy Duty Steel A-Frame">Heavy Duty Steel A-Frame</option>
                <option value="Cantilever Rack">Cantilever Rack</option>
                <option value="Reinforced Concrete Plinth">Reinforced Concrete Plinth</option>
                <option value="Ground Plinth">Ground Plinth</option>
                <option value="Floor Stacking Grid">Floor Stacking Grid</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (Units / Slabs)</label>
              <input
                type="number"
                className="form-input"
                placeholder="24"
                value={formData.capacityUnits ?? ''}
                onChange={e => setFormData({ ...formData, capacityUnits: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Load (Metric Tons)</label>
              <input
                type="number"
                className="form-input"
                placeholder="15"
                value={formData.maxLoadMT ?? ''}
                onChange={e => setFormData({ ...formData, maxLoadMT: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}

        {activeEntityKey === 'boxes' && (
          <>
            <div className="form-group">
              <label className="form-label">Box / Crate No *</label>
              <input
                className="form-input"
                required
                placeholder="e.g. BOX-0001"
                value={formData.boxNo || ''}
                onChange={e => setFormData({ ...formData, boxNo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Crate Structure Type</label>
              <select
                className="form-select"
                value={formData.type || 'A-Frame'}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="A-Frame">Steel A-Frame</option>
                <option value="Wooden Crate">Wooden Crate</option>
                <option value="Pallet">Export Pallet</option>
                <option value="Steel Stillage">Steel Stillage</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Stone Type</label>
              <select
                className="form-select"
                value={formData.stoneType || stoneTypes[0]?.name || ''}
                onChange={e => setFormData({ ...formData, stoneType: e.target.value })}
              >
                {stoneTypes.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thickness (mm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="20"
                value={formData.thickness ?? ''}
                onChange={e => setFormData({ ...formData, thickness: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select
                className="form-select"
                value={formData.grade || 'Grade A'}
                onChange={e => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Commercial)</option>
                <option value="Grade C">Grade C (Economy)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Piece Count</label>
              <input
                type="number"
                className="form-input"
                placeholder="2"
                value={formData.pieceCount ?? ''}
                onChange={e => setFormData({ ...formData, pieceCount: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Sq.Ft</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="107.66"
                value={formData.sqft ?? ''}
                onChange={e => setFormData({ ...formData, sqft: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yard Facility</label>
              <select
                className="form-select"
                value={formData.yard || yardsMaster[0]?.name || ''}
                onChange={e => {
                  const y = e.target.value;
                  setFormData({
                    ...formData,
                    yard: y,
                    location: `${y} / ${formData.zone || 'Zone C'} / ${formData.bay || 'A-Frame 01'}`
                  });
                }}
              >
                {yardsMaster.map(y => (
                  <option key={y.id} value={y.name}>{y.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bay Location</label>
              <input
                className="form-input"
                placeholder="A-Frame 01"
                value={formData.bay || ''}
                onChange={e => {
                  const b = e.target.value;
                  setFormData({
                    ...formData,
                    bay: b,
                    location: `${formData.yard || 'Carrara Yard Main'} / ${formData.zone || 'Zone C'} / ${b}`
                  });
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status || 'Open'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="Sealed">Sealed</option>
                <option value="Loaded">Loaded</option>
                <option value="Dispatched">Dispatched</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Capacity (Pieces)</label>
              <input
                type="number"
                className="form-input"
                placeholder="20"
                value={formData.capacity ?? ''}
                onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
          </>
        )}
      </FormDrawer>
    </div>
  );
}
