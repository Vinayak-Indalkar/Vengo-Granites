import React from 'react';
import { Clock, User, ArrowRight, ExternalLink, AlertTriangle, CheckCircle2, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { StatusBadge } from '../CommonComponents';

export function StoneJourneyTimeline({ events = [], onSelectNode, highlightedId }) {
  if (!events || events.length === 0) {
    return (
      <div className="table-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '12px' }}>
        <Clock size={36} style={{ color: 'var(--muted)', margin: '0 auto 10px auto' }} />
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)' }}>
          No Timeline Events Recorded
        </h4>
        <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
          No chronological lifecycle events have been generated for this stone yet.
        </p>
      </div>
    );
  }

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const tA = new Date(a.timestamp || '2026-10-13').getTime();
    const tB = new Date(b.timestamp || '2026-10-13').getTime();
    return tA - tB;
  });

  // Group events by day
  const groupedEvents = sortedEvents.reduce((acc, evt) => {
    const dateKey = (evt.timestamp || '').split(' ')[0] || '2026-10-13';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(evt);
    return acc;
  }, {});

  const formatDateHeader = (dStr) => {
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', paddingBottom: '32px' }}>
      {Object.entries(groupedEvents).map(([dateStr, dayEvents], gIdx) => (
        <div key={dateStr} style={{ marginBottom: '28px' }}>
          {/* Day Group Header */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            marginBottom: '18px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)'
          }}>
            <Calendar size={13} style={{ color: 'var(--brand-color, #222350)' }} />
            <span>{formatDateHeader(dateStr)}</span>
            <span style={{
              fontSize: '10.5px',
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-sunken)',
              color: 'var(--muted)',
              fontWeight: 600
            }}>
              {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Timeline Track for Day */}
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{
              position: 'absolute',
              left: '11px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: 'var(--border)',
              zIndex: 1
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayEvents.map((evt, idx) => {
                const isHighlighted = highlightedId && (evt.id === highlightedId || String(evt.name).toLowerCase().includes(highlightedId.toLowerCase()));
                const isException = evt.isException || evt.status === 'Rejected' || evt.status === 'Defective';
                const Icon = evt.icon || Clock;

                return (
                  <div
                    key={evt.id || idx}
                    onClick={() => onSelectNode(evt)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Bullet Node */}
                    <div style={{
                      position: 'absolute',
                      left: '-27px',
                      top: '14px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: isException ? '#ef4444' : isHighlighted ? 'var(--brand-color, #222350)' : 'var(--surface)',
                      border: `2.5px solid ${isException ? '#ef4444' : isHighlighted ? 'var(--brand-color, #222350)' : 'var(--border)'}`,
                      zIndex: 2,
                      boxShadow: isHighlighted ? '0 0 0 4px rgba(34,35,80,0.15)' : '0 1px 3px rgba(0,0,0,0.08)'
                    }} />

                    {/* Event Card */}
                    <div
                      className="table-card"
                      style={{
                        flex: 1,
                        padding: '14px 18px',
                        border: isHighlighted ? '2px solid var(--brand-color, #222350)' : isException ? '1px solid #fecdd3' : '1px solid var(--border)',
                        backgroundColor: isHighlighted ? 'rgba(34, 35, 80, 0.05)' : isException ? '#fff1f2' : 'var(--surface)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        boxShadow: isHighlighted ? '0 4px 12px rgba(34,35,80,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: isException ? '#fee2e2' : 'rgba(34, 35, 80, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isException ? '#e11d48' : 'var(--brand-color, #222350)',
                          flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              {evt.stage || 'Stage'}
                            </span>
                            <StatusBadge status={evt.status || 'Completed'} />
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: isException ? '#e11d48' : 'var(--foreground)' }}>
                            {evt.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            ID: {evt.id}
                          </div>
                        </div>
                      </div>

                      {/* Right: Key Metric, Timestamp & Operator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                        {evt.keyFigure && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10.5px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Key Figure</div>
                            <div style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: 'var(--foreground)',
                              backgroundColor: 'var(--surface-sunken)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              marginTop: '2px'
                            }}>
                              {evt.keyFigure}
                            </div>
                          </div>
                        )}

                        <div style={{ textAlign: 'right', minWidth: '130px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            <Clock size={11} />
                            <span>{(evt.timestamp || '').split(' ')[1] || '09:00'}</span>
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--foreground)', marginTop: '2px' }}>
                            👤 {evt.operator || 'System'}
                          </div>
                        </div>

                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--surface-sunken)',
                          color: 'var(--muted)'
                        }}>
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
