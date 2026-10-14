import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  YieldReportScreen,
  StockLedgerScreen,
  ThreeWayMatchScreen,
  SalesReportScreen,
  AttendanceReportScreen,
  AuditLogScreen,
  EndOfDayScreen
} from './ReportPages';

export function ReportsHub() {
  const { currentRole } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab = currentRole === 'Client HR Admin' ? 'attendance' : 'sales';
  const tab = searchParams.get('tab') || defaultTab;

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <div>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--line)',
        backgroundColor: 'var(--white)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <button
          className={`btn btn-sm ${tab === 'sales' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('sales')}
        >
          Sales
        </button>
        <button
          className={`btn btn-sm ${tab === 'stock' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('stock')}
        >
          Stock Ledger
        </button>
        <button
          className={`btn btn-sm ${tab === 'yield' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('yield')}
        >
          Yield
        </button>
        {(currentRole === 'Supplier/Client Admin' || currentRole === 'QT Super Admin' || currentRole === 'Client HR Admin') && (
          <>
            <button
              className={`btn btn-sm ${tab === 'threeway' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('threeway')}
            >
              3-Way Match
            </button>
            <button
              className={`btn btn-sm ${tab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('attendance')}
            >
              Attendance
            </button>
            <button
              className={`btn btn-sm ${tab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab('audit')}
            >
              Audit Log
            </button>
          </>
        )}
        <button
          className={`btn btn-sm ${tab === 'eod' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('eod')}
        >
          End-of-Day
        </button>
      </div>

      {tab === 'sales' && <SalesReportScreen />}
      {tab === 'stock' && <StockLedgerScreen />}
      {tab === 'yield' && <YieldReportScreen />}
      {tab === 'threeway' && <ThreeWayMatchScreen />}
      {tab === 'attendance' && <AttendanceReportScreen />}
      {tab === 'audit' && <AuditLogScreen />}
      {tab === 'eod' && <EndOfDayScreen />}
    </div>
  );
}
