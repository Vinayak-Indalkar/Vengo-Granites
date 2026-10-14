import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Box,
  FileCheck2,
  Scale,
  Receipt,
  AlertTriangle,
  BarChart3,
  Settings,
  PlusCircle,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Award,
  Layers,
  Bell,
  Search,
  LogOut,
  Calendar,
  Clock,
  Briefcase,
  Truck,
  ShieldCheck,
  Scissors,
  Move,
  Globe
} from 'lucide-react';
import { VengoLogo } from './VengoLogo';

export function Sidebar() {
  const { currentRole, activeClient, t } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Accordion state: At a time, only one submenu is open
  const getRouteMenu = () => {
    if (location.pathname.startsWith('/client-setup')) return 'Client Setup';
    if (location.pathname.startsWith('/inventory')) return 'Inventory';
    if (location.pathname.startsWith('/masters')) return 'Master Setup';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    return null;
  };
  const [openMenu, setOpenMenu] = useState(getRouteMenu);

  useEffect(() => {
    const routeMenu = getRouteMenu();
    if (routeMenu) {
      setOpenMenu(routeMenu);
    }
  }, [location.pathname]);

  // 1. QT Super Admin Menu: Master Setup
  const superAdminMenu = [
    { label: 'Master Setup', path: '/masters', icon: Building2 }
  ];

  // 2. Supplier/Client Admin Menu:
  // - Dashboard, Client Setup (Suppliers, Buyers, Contractors), Masters (Inventory submenu), Inventory (with Sub-menus), Purchase Orders, Receipts, Sales Invoices, Accounts, Settings
  const supplierClientAdminMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    {
      label: 'Client Setup',
      path: '/client-setup?tab=suppliers',
      icon: Users,
      children: [
        { label: 'Suppliers', path: '/client-setup?tab=suppliers' },
        { label: 'Buyers', path: '/client-setup?tab=buyers' },
        { label: 'Contractors', path: '/client-setup?tab=contractors' }
      ]
    },
    {
      label: 'Masters',
      path: '/masters?submenu=inventory',
      icon: Layers,
      children: [
        { label: 'Inventory', path: '/masters?submenu=inventory' }
      ]
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Box,
      children: [
        { label: 'Inbound', path: '/inventory?submenu=inbound' },
        { label: 'Quality Control', path: '/inventory?submenu=qc' },
        { label: 'Processing', path: '/inventory?submenu=processing' },
        { label: 'Storage & Labels', path: '/inventory?submenu=storage' },
        { label: 'Stock', path: '/inventory?submenu=stock' },
        { label: 'Exceptions', path: '/inventory?submenu=exceptions' }
      ]
    },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: FileCheck2 },
    { label: 'Receipts', path: '/receipts', icon: Scale },
    { label: 'Sales Invoices', path: '/sales-invoices', icon: Receipt },
    {
      label: 'Settings',
      path: '/settings?submenu=general',
      icon: Settings,
      children: [
        { label: 'General Settings', path: '/settings?submenu=general' },
        { label: 'Custom Fields Builder', path: '/settings?submenu=custom-fields' }
      ]
    }
  ];

  // 3. Client HR Admin Menu:
  // - Personnel, Attendance, Shift & Roster, Leave & Holidays, HR Masters, Audit & Reports, Settings
  const clientHRAdminMenu = [
    { label: 'Personnel', path: '/hr?tab=personnel', icon: Users },
    { label: 'Attendance', path: '/hr?tab=attendance', icon: Clock },
    { label: 'Shift & Roster', path: '/hr?tab=roster', icon: Calendar },
    { label: 'Leave & Holidays', path: '/hr?tab=leave', icon: Briefcase },
    { label: 'HR Masters', path: '/hr?tab=masters', icon: Building2 },
    { label: 'Audit & Reports', path: '/hr?tab=audit', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  // 4. Buyer Admin Menu:
  // - Dashboard, Purchase Requests, Material Receipts, Yard & Stock, Sales, Damage Logging, Daily Reports, Settings
  const buyerAdminMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Purchase Requests', path: '/purchase-requests', icon: PlusCircle },
    { label: 'Material Receipts', path: '/receipts', icon: Scale },
    { label: 'Yard & Stock', path: '/inventory', icon: Box },
    { label: 'Sales', path: '/sales-invoices', icon: Receipt },
    { label: 'Damage Logging', path: '/returns?tab=defective', icon: AlertTriangle },
    { label: 'Daily Reports', path: '/reports?tab=sales', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  let menuItems = supplierClientAdminMenu;
  if (currentRole === 'QT Super Admin') menuItems = superAdminMenu;
  else if (currentRole === 'Client HR Admin') menuItems = clientHRAdminMenu;
  else if (currentRole === 'Buyer Admin') menuItems = buyerAdminMenu;

  const isItemActive = (targetPath) => {
    if (targetPath.includes('?')) {
      const [pathBase, queryStr] = targetPath.split('?');
      if (location.pathname !== pathBase) return false;
      const targetParams = new URLSearchParams(queryStr);
      const currentParams = new URLSearchParams(location.search);
      // If target specifies 'submenu', check if current search has matching submenu
      if (targetParams.has('submenu')) {
        const defaultSub = location.pathname === '/settings'
          ? 'general'
          : location.pathname === '/masters'
            ? 'inventory'
            : 'inbound';
        const currentSub = currentParams.get('submenu') || defaultSub;
        return currentSub === targetParams.get('submenu');
      }
      // If target specifies 'tab', check if current search has the same 'tab'
      if (targetParams.has('tab')) {
        const defaultTab = location.pathname === '/client-setup' ? 'suppliers' : null;
        const currentTab = currentParams.get('tab') || defaultTab;
        return currentTab === targetParams.get('tab');
      }
      return location.search === `?${queryStr}`;
    }
    if (location.pathname !== targetPath) return false;
    const hasQuerySiblings = menuItems.some(m => m.path.startsWith(`${targetPath}?`));
    if (hasQuerySiblings && location.search) {
      return false;
    }
    return true;
  };

  const hasSettingsInMenu = menuItems.some(m => m.label === 'Settings');

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        {!collapsed ? (
          <div className="brand-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            {currentRole === 'QT Super Admin' ? (
              <img
                src="/quantira-logo.png"
                alt="Quantira Technologies"
                style={{
                  height: '46px',
                  maxWidth: '180px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <>
                {activeClient?.logo ? (
                  <img
                    src={activeClient.logo}
                    alt={activeClient.name}
                    onError={(e) => { e.currentTarget.src = '/default-client-logo.png'; }}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '1px solid var(--line)'
                    }}
                  />
                ) : (
                  <VengoLogo size={34} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 700, fontSize: '13px' }}>
                    {activeClient ? activeClient.name : 'Vengo Granites'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Powered By Quantira
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          currentRole === 'QT Super Admin' ? (
            <img
              src="/quantira-logo.png"
              alt="Quantira"
              style={{
                height: '22px',
                maxWidth: '32px',
                objectFit: 'contain',
                margin: '0 auto'
              }}
            />
          ) : activeClient?.logo ? (
            <img
              src={activeClient.logo}
              alt={activeClient.name}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                objectFit: 'cover',
                margin: '0 auto',
                border: '1px solid var(--line)'
              }}
            />
          ) : (
            <VengoLogo size={28} style={{ color: 'var(--black)', margin: '0 auto' }} />
          )
        )}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = openMenu === item.label;

          return (
            <div key={item.path + item.label} style={{ marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (hasChildren) {
                      setOpenMenu(item.label);
                    } else {
                      setOpenMenu(null);
                    }
                  }}
                  className={`sidebar-link ${active ? 'active' : ''}`}
                  title={collapsed ? t(item.label) : undefined}
                  style={{ flex: 1 }}
                >
                  <Icon size={16} className="sidebar-icon" />
                  {!collapsed && <span>{t(item.label)}</span>}
                </Link>
                {!collapsed && hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu(prev => (prev === item.label ? null : item.label));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>
                )}
              </div>

              {!collapsed && hasChildren && isExpanded && (
                <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {item.children.map(child => {
                    const childActive = isItemActive(child.path);
                    return (
                      <Link
                        key={child.path + child.label}
                        to={child.path}
                        className={`sidebar-sublink ${childActive ? 'active' : ''}`}
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(child.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!hasSettingsInMenu && (
        <div className="sidebar-footer">
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`} title={collapsed ? t("Settings") : undefined}>
            <Settings size={16} className="sidebar-icon" />
            {!collapsed && <span>{t('Settings')}</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}

export function Topbar() {
  const {
    currentRole,
    currentUser,
    logout,
    activeClient,
    clients,
    switchClient,
    notifications,
    language,
    setLanguage,
    t
  } = useApp();

  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
        <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{t('Welcome')},</span>
        <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{currentUser?.name || 'Aditya Varma'}</span>
      </div>

      <div className="topbar-actions">
        {/* Language Switcher in Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
          <Globe size={14} style={{ color: 'var(--muted)' }} />
          <select
            className="form-control"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              height: '28px',
              fontWeight: 600,
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title={t('Language')}
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी</option>
            <option value="Odia">ଓଡ଼ିଆ</option>
            <option value="Telugu">తెలుగు</option>
          </select>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="iconbtn"
            title={t('Notifications')}
            onClick={() => setShowNotif(!showNotif)}
            style={{ position: 'relative' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--red, #e53e3e)'
              }} />
            )}
          </button>

          {showNotif && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '36px',
                width: '280px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-8)',
                boxShadow: 'var(--sh-2)',
                zIndex: 100,
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{unreadCount} new</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.slice(0, 3).map(n => (
                  <div key={n.id} style={{ fontSize: '11px', padding: '6px', backgroundColor: 'var(--soft)', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600 }}>{n.title}</div>
                    <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/notifications"
                onClick={() => setShowNotif(false)}
                style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--teal-600, #222350)', fontWeight: 600 }}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Logout right after notification icon */}
        <button
          className="iconbtn"
          title="Sign Out"
          onClick={logout}
        >
          <LogOut size={15} />
        </button>

        {/* Profile Picture with User Name & Role */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '8px',
            paddingLeft: '10px',
            borderLeft: '1px solid var(--line)'
          }}
        >
          <div
            title={currentUser?.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              flexShrink: 0
            }}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'Aditya Varma'}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--line)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  flexShrink: 0
                }}
              />
            ) : null}
            <div
              className="avatar"
              style={{
                display: currentUser?.avatar ? 'none' : 'flex',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-color, #222350)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                flexShrink: 0
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Aditya Varma'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {currentRole || currentUser?.role || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
