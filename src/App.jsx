import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, Topbar } from './components/Navigation';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { MasterDataHub } from './pages/MasterDataHub';
import { InventoryHub } from './pages/InventoryHub';
import { HRHub } from './pages/HRHub';
import { AccountsHub } from './pages/AccountsHub';
import { PurchaseOrderHub } from './pages/PurchaseOrderHub';
import { PurchaseRequestsScreen } from './pages/PurchasePages';
import { ReceiptsHub } from './pages/ReceiptsHub';
import { SalesHub } from './pages/SalesHub';
import { ReturnsHub } from './pages/ReturnsHub';
import { DefectiveStoreScreen } from './pages/ReturnsPages';
import { ReportsHub } from './pages/ReportsHub';
import { SettingsScreen } from './pages/SettingsScreen';
import { NotificationsScreen } from './pages/NotificationsScreen';
import { LoginPage } from './pages/LoginPage';
import { FacePunchScreen } from './pages/FacePunchScreen';

// Super Admin Screen Imports
import {
  SuperAdminClientsScreen,
  SuperAdminBrandingScreen,
  SuperAdminAppAssignmentScreen,
  SuperAdminPlansScreen,
  SuperAdminReportsScreen,
  SuperAdminActivityLogScreen
} from './pages/SuperAdminPages';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrapper" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="table-card" style={{ maxWidth: '520px', margin: '40px auto', padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px' }}>
              An unexpected error occurred while loading this view. You can return to home or reload.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              >
                Go to Home
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  const { isAuthenticated, currentRole, activeClient, toast } = useApp();

  const isSuperAdmin = currentRole === 'QT Super Admin';

  useEffect(() => {
    if (isSuperAdmin) {
      document.documentElement.classList.add('theme-superadmin');
      document.body.classList.add('theme-superadmin');
    } else {
      document.documentElement.classList.remove('theme-superadmin');
      document.body.classList.remove('theme-superadmin');
    }
  }, [isSuperAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const defaultHome = isSuperAdmin
    ? '/masters'
    : currentRole === 'Client HR Admin'
      ? '/hr?tab=personnel'
      : '/dashboard';

  const brandColor = isSuperAdmin ? '#2563eb' : (activeClient?.brandColor || '#222350');

  return (
    <div className={`app-container ${isSuperAdmin ? 'theme-superadmin' : ''}`} style={{ '--brand-color': brandColor }}>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <ErrorBoundary>
          <Routes>
          <Route path="/" element={<Navigate to={defaultHome} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* QT Super Admin Routes */}
          <Route path="/clients" element={<SuperAdminClientsScreen />} />
          <Route path="/branding" element={<SuperAdminBrandingScreen />} />
          <Route path="/app-assignment" element={<SuperAdminAppAssignmentScreen />} />
          <Route path="/plans" element={<SuperAdminPlansScreen />} />
          <Route path="/super-reports" element={<SuperAdminReportsScreen />} />
          <Route path="/activity-log" element={<SuperAdminActivityLogScreen />} />

          {/* Core ERP Routes */}
          <Route path="/masters" element={<MasterDataHub />} />
          <Route path="/hr" element={<HRHub />} />
          <Route path="/inventory" element={<InventoryHub />} />
          <Route path="/purchase-orders" element={<PurchaseOrderHub />} />
          <Route path="/purchase-requests" element={<PurchaseRequestsScreen />} />
          <Route path="/receipts" element={<ReceiptsHub />} />
          <Route path="/sales-invoices" element={<SalesHub />} />
          <Route path="/accounts" element={<AccountsHub />} />
          <Route path="/returns" element={<ReturnsHub />} />
          <Route path="/damage-logging" element={<DefectiveStoreScreen />} />
          <Route path="/reports" element={<ReportsHub />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={defaultHome} replace />} />
        </Routes>
        </ErrorBoundary>
      </div>

      {/* Global Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 24,
          zIndex: 99999,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 600,
          fontSize: '0.875rem',
          animation: 'slideIn 0.25s ease-out',
          maxWidth: 420
        }}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Kiosk / Face Punch Screen (no login required) */}
          <Route path="/face-punch" element={<FacePunchScreen />} />

          {/* Login Screen */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Layout */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
