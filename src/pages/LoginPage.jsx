import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Building2, Users, ShoppingCart } from 'lucide-react';

export function LoginPage() {
  const { login, clients } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('theme-superadmin');
    document.body.classList.add('theme-superadmin');
    return () => {
      document.documentElement.classList.remove('theme-superadmin');
      document.body.classList.remove('theme-superadmin');
    };
  }, []);

  const [selectedRole, setSelectedRole] = useState('Supplier/Client Admin');
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || 'CLI-001');
  const [email, setEmail] = useState('rajesh@vengogranites.com');

  const roles = [
    {
      id: 'QT Super Admin',
      label: 'QT Super Admin',
      icon: Shield,
      email: 'aditya@quantira.io'
    },
    {
      id: 'Supplier/Client Admin',
      label: 'Supplier/Client Admin',
      icon: Building2,
      email: 'rajesh@vengogranites.com'
    },
    {
      id: 'Client HR Admin',
      label: 'Client HR Admin',
      icon: Users,
      email: 'ananya.hr@vengogranites.com'
    },
    {
      id: 'Buyer Admin',
      label: 'Buyer Admin',
      icon: ShoppingCart,
      email: 'karan.buyer@apexbuilders.com'
    }
  ];

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.id);
    setEmail(roleObj.email);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(selectedRole, email, selectedRole === 'QT Super Admin' ? null : selectedClient);
    if (selectedRole === 'QT Super Admin') {
      navigate('/masters');
    } else if (selectedRole === 'Client HR Admin') {
      navigate('/hr?tab=personnel');
    } else {
      navigate('/dashboard');
    }
  };

  const activeClientObj = clients.find(c => c.id === selectedClient);

  return (
    <div
      className="theme-superadmin"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-16)',
        padding: '32px 28px',
        boxShadow: 'var(--sh-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header / Logo - Constant Quantira Technologies Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '8px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--line)'
        }}>
          <img
            src="/quantira-logo.png"
            alt="Quantira Technologies"
            style={{
              height: '84px',
              maxWidth: '360px',
              width: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Role Switcher */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Select Role
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {roles.map(r => {
              const Icon = r.icon;
              const isSel = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`btn btn-sm ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    justifyContent: 'flex-start',
                    padding: '8px 10px',
                    height: 'auto',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onClick={() => handleRoleSelect(r)}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@quantira.io"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value="••••••••••••"
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
}
