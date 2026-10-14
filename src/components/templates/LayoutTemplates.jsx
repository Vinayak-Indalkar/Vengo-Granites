import React from 'react';
import { Sidebar, Topbar } from '../Navigation';

/**
 * AppLayout (Template)
 * Standard application frame with sidebar, topbar, and main content view container
 */
export function AppLayout({ children, isSuperAdmin = false, brandColor = '#222350' }) {
  return (
    <div
      className={`app-container ${isSuperAdmin ? 'theme-superadmin' : ''}`}
      style={{ '--brand-color': brandColor }}
    >
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

/**
 * HubLayout (Template)
 * Standard layout for tabbed hubs with sticky sub-menu bar
 */
export function HubLayout({ tabs = [], activeTab, onTabChange, children }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {tabs.length > 0 && (
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--white)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          alignItems: 'center'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onTabChange(tab.key)}
                style={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
