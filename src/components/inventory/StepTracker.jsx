import React from 'react';

const STEPS = [
  { step: 1, label: 'Gate & Weighbridge', key: 'gate' },
  { step: 2, label: 'Raw Block', key: 'block' },
  { step: 3, label: 'QC 1', key: 'qc1' },
  { step: 4, label: 'Apply Material', key: 'material' },
  { step: 5, label: 'Slicing', key: 'slicing' },
  { step: 6, label: 'QC 2', key: 'qc2' },
  { step: 7, label: 'Cut to Size', key: 'cut' },
  { step: 8, label: 'Storage', key: 'storage' },
  { step: 9, label: 'Labels', key: 'labels' },
  { step: 10, label: 'Stock (Saleable)', key: 'stock' }
];

export function StepTracker({ currentStep = 2, status = '', onStepClick }) {
  const isRejected = status === 'Rejected' || status === 'Defective';
  const isRework = status === 'Rework';

  return (
    <div style={{
      backgroundColor: 'var(--soft)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-12)',
      padding: '14px 18px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Sequential Production Flow (10 Steps)</span>
          <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--muted)' }}>
            (Strict ID-linked chain • No skipped steps)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {status && (
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 'var(--pill)',
              backgroundColor: isRejected ? 'var(--ruby-bg)' : isRework ? 'var(--amber-bg)' : 'var(--emerald-bg)',
              color: isRejected ? 'var(--ruby-text)' : isRework ? 'var(--amber-text)' : 'var(--emerald-text)',
              border: `1px solid ${isRejected ? 'var(--ruby-border)' : isRework ? 'var(--amber-border)' : 'var(--emerald-border)'}`
            }}>
              Status: {status}
            </span>
          )}
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
            Step {Math.min(currentStep, 10)} of 10
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {STEPS.map((s, idx) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          let stepBg = 'var(--line)';
          let textColor = 'var(--muted)';
          let borderColor = 'var(--line-strong)';

          if (isCompleted) {
            stepBg = 'var(--emerald-text)';
            textColor = '#ffffff';
            borderColor = 'var(--emerald-text)';
          } else if (isCurrent) {
            if (isRejected) {
              stepBg = 'var(--ruby-text)';
              textColor = '#ffffff';
              borderColor = 'var(--ruby-text)';
            } else if (isRework) {
              stepBg = 'var(--amber-text)';
              textColor = '#ffffff';
              borderColor = 'var(--amber-text)';
            } else {
              stepBg = 'var(--teal-600)';
              textColor = '#ffffff';
              borderColor = 'var(--teal-600)';
            }
          }

          return (
            <React.Fragment key={s.step}>
              <div
                onClick={() => onStepClick && onStepClick(s.step)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '85px',
                  cursor: onStepClick ? 'pointer' : 'default',
                  flexShrink: 0
                }}
                title={`Step ${s.step}: ${s.label}`}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: stepBg,
                  color: textColor,
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: isCurrent ? '0 0 0 3px rgba(34, 35, 80, 0.15)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {isCompleted ? '✓' : s.step}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--ink)' : isCompleted ? 'var(--emerald-text)' : 'var(--muted)',
                  textAlign: 'center',
                  marginTop: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  minWidth: '16px',
                  height: '2px',
                  backgroundColor: s.step < currentStep ? 'var(--emerald-text)' : 'var(--line)',
                  marginTop: '-16px'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
