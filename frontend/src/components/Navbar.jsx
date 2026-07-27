import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(10, 13, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-main)' }}>
        <div style={{
          padding: '8px',
          background: 'var(--accent-gradient)',
          borderRadius: '10px',
          display: 'flex'
        }}>
          <Shield size={22} color="#fff" />
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
            Sentinel<span style={{ color: 'var(--accent-primary)' }}>Auth</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)' }}>Dual-Token Security</span>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <User size={16} />
              <span>{user?.name || user?.email}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Create Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
