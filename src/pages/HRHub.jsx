import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PersonnelScreen,
  AttendanceScreen,
  ShiftRosterScreen,
  LeaveHolidaysScreen,
  PayrollScreen,
  HRMastersScreen,
  HRAuditReportsScreen
} from './HRPages';

export function HRHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs = ['personnel', 'attendance', 'roster', 'leave', 'payroll', 'masters', 'audit'];
  const tab = validTabs.includes(rawTab) ? rawTab : 'personnel';
  const subTab = searchParams.get('subTab');

  const setSubTab = (newSubTab) => {
    setSearchParams({ tab, subTab: newSubTab });
  };

  // Sub-menus configured for each main menu selection
  const subMenuConfig = {
    personnel: [
      { key: 'employees', label: 'Employees' },
      { key: 'contractors', label: 'Contractors' },
      { key: 'workers', label: 'Contractor Workers' }
    ],
    attendance: [
      { key: 'daily', label: 'Daily Attendance' },
      { key: 'unmatched', label: 'Unmatched Punches' },
      { key: 'voided', label: 'Voided History' }
    ],
    roster: [], // Roster is a single comprehensive weekly matrix view
    leave: [
      { key: 'requests', label: 'Leave Requests' },
      { key: 'balances', label: 'Leave Balances' },
      { key: 'types', label: 'Leave Types' },
      { key: 'holidays', label: 'Holidays Calendar' }
    ],
    payroll: [
      { key: 'periods', label: 'Payroll Periods' },
      { key: 'advances', label: 'Advances & Deductions' }
    ],
    masters: [
      { key: 'departments', label: 'Departments' },
      { key: 'designations', label: 'Designations' },
      { key: 'shifts', label: 'Shifts' },
      { key: 'devices', label: 'Biometric Devices' }
    ],
    audit: [] // Audit & Reports is a single view
  };

  const activeSubMenus = subMenuConfig[tab] || [];
  const currentSubTab = subTab || activeSubMenus[0]?.key;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Top Secondary Tab Header - Displays ONLY the relevant sub-menus */}
      {activeSubMenus.length > 0 && (
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--white)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          alignItems: 'center'
        }}>
          {activeSubMenus.map((sub) => {
            const isActive = currentSubTab === sub.key;
            return (
              <button
                key={sub.key}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSubTab(sub.key)}
                style={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px'
                }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Screen Renderers receiving the selected subTab */}
      {tab === 'personnel' && (
        <PersonnelScreen
          defaultSubTab={currentSubTab || 'employees'}
          onSubTabChange={setSubTab}
        />
      )}

      {tab === 'attendance' && (
        <AttendanceScreen
          defaultSubTab={currentSubTab || 'daily'}
          onSubTabChange={setSubTab}
        />
      )}

      {tab === 'roster' && <ShiftRosterScreen />}

      {tab === 'leave' && (
        <LeaveHolidaysScreen
          defaultSubTab={currentSubTab || 'requests'}
          onSubTabChange={setSubTab}
        />
      )}

      {tab === 'payroll' && (
        <PayrollScreen
          defaultSubTab={currentSubTab || 'periods'}
          onSubTabChange={setSubTab}
        />
      )}

      {tab === 'masters' && (
        <HRMastersScreen
          defaultSubTab={currentSubTab || 'departments'}
          onSubTabChange={setSubTab}
        />
      )}

      {tab === 'audit' && <HRAuditReportsScreen />}
    </div>
  );
}
