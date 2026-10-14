import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Camera, User } from 'lucide-react';

export function FacePunchScreen() {
  const { personnel, punchDevices, addPunch, activeClient, clients } = useApp();

  const [selectedDevice, setSelectedDevice] = useState(punchDevices[0]?.id || 'DEV-01');
  const [selectedPerson, setSelectedPerson] = useState(personnel[0]?.id || 'EMP-101');
  const [punchType, setPunchType] = useState('In'); // 'In' | 'Out'
  const [step, setStep] = useState('idle'); // 'idle' | 'scanning' | 'liveness' | 'success' | 'failed'
  const [retryCount, setRetryCount] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const device = punchDevices.find(d => d.id === selectedDevice) || punchDevices[0];
  const person = personnel.find(p => p.id === selectedPerson) || personnel[0];

  const handleSimulatePunch = (forceFail = false) => {
    setStep('scanning');

    setTimeout(() => {
      setStep('liveness'); // simulated liveness step

      setTimeout(() => {
        if (forceFail) {
          const nextRetry = retryCount + 1;
          setRetryCount(nextRetry);
          if (nextRetry >= 3) {
            // Saved as Unmatched after 3 retries
            addPunch({ personId: selectedPerson, punchType, deviceId: selectedDevice, forceUnmatched: true });
            setLastResult({ status: 'Unmatched', message: 'Saved as Unmatched for Review' });
            setStep('failed');
          } else {
            setLastResult({ status: 'Retry', message: `Face match failed (Attempt ${nextRetry}/3)` });
            setStep('failed');
          }
        } else {
          // Success
          setRetryCount(0);
          addPunch({ personId: selectedPerson, punchType, deviceId: selectedDevice, forceUnmatched: false });
          setLastResult({ status: 'Success', message: `Punch ${punchType} Recorded` });
          setStep('success');
        }
      }, 700);
    }, 800);
  };

  const resetKiosk = () => {
    setStep('idle');
    setLastResult(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px'
    }}>
      {/* Top Bar for Kiosk */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Face Punch Kiosk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{device?.name} ({device?.id})</span>
          <Link to="/login" style={{ fontSize: '11px', color: '#38bdf8', textDecoration: 'none' }}>
            Exit to Login
          </Link>
        </div>
      </div>

      {/* Main Kiosk Container (Mobile-first centered) */}
      <div style={{
        flex: 1,
        maxWidth: '440px',
        width: '100%',
        margin: '20px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Device & Person Selector for Demo simulation */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Device Registration
          </div>
          <select
            className="form-select"
            style={{ backgroundColor: '#0f172a', color: '#fff', borderColor: '#334155' }}
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
          >
            {punchDevices.map(d => (
              <option key={d.id} value={d.id}>{d.name} - {d.location}</option>
            ))}
          </select>

          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>
            Select Person
          </div>
          <select
            className="form-select"
            style={{ backgroundColor: '#0f172a', color: '#fff', borderColor: '#334155' }}
            value={selectedPerson}
            onChange={e => setSelectedPerson(e.target.value)}
          >
            {personnel.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name} ({p.type})</option>
            ))}
          </select>
        </div>

        {/* Biometric Camera Viewport (Simulated) */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          minHeight: '260px',
          border: '2px solid #334155',
          position: 'relative'
        }}>
          {/* Camera Oval Outline */}
          <div style={{
            width: '150px',
            height: '190px',
            borderRadius: '50%',
            border: step === 'liveness' ? '3px solid #38bdf8' : (step === 'success' ? '3px solid #10b981' : (step === 'failed' ? '3px solid #ef4444' : '2px dashed #64748b')),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            position: 'relative',
            boxShadow: step === 'liveness' ? '0 0 20px rgba(56, 189, 248, 0.4)' : 'none'
          }}>
            {person?.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: step === 'scanning' ? 0.7 : 1 }}
              />
            ) : (
              <User size={64} color="#64748b" />
            )}

            {/* Scanning Laser Animation */}
            {step === 'scanning' && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 10px #38bdf8'
              }} />
            )}
          </div>

          <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 600 }}>
            {step === 'idle' && person?.name}
            {step === 'scanning' && 'Scanning face...'}
            {step === 'liveness' && 'Checking liveness...'}
            {step === 'success' && <span style={{ color: '#10b981' }}>{lastResult?.message}</span>}
            {step === 'failed' && <span style={{ color: '#ef4444' }}>{lastResult?.message}</span>}
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            {step === 'idle' && 'Position face inside the oval'}
            {step === 'liveness' && 'Blink or nod'}
            {step === 'failed' && retryCount < 3 && `Retries remaining: ${3 - retryCount}`}
          </div>
        </div>

        {/* Punch In / Out Mode Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: punchType === 'In' ? '#0284c7' : '#334155',
              color: '#fff',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700
            }}
            onClick={() => setPunchType('In')}
          >
            Punch In
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: punchType === 'Out' ? '#0284c7' : '#334155',
              color: '#fff',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700
            }}
            onClick={() => setPunchType('Out')}
          >
            Punch Out
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {step === 'idle' ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
                onClick={() => handleSimulatePunch(false)}
              >
                Scan Face & Punch
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', color: '#f87171', borderColor: '#7f1d1d' }}
                onClick={() => handleSimulatePunch(true)}
              >
                Simulate Match Failure
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px' }}
              onClick={resetKiosk}
            >
              <RefreshCw size={14} />
              <span>Next Person</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
