import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../api/axiosInstance';
import { ShieldCheck, Key, RefreshCw, Server, Activity, CheckCircle2, Lock } from 'lucide-react';

const DashboardPage = () => {
  const { user, accessToken, manualRefresh } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingToken, setRefreshingToken] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/dashboard');
      setDashboardData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load protected dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshingToken(true);
    try {
      await manualRefresh();
      await fetchDashboardData();
    } catch (err) {
      setError('Token refresh failed. Session expired.');
    } finally {
      setRefreshingToken(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '200px', height: '200px', background: 'var(--accent-glow)',
          filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} /> Authenticated Protected Session
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>
              Welcome back, <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'User'}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              Logged in as <strong style={{ color: 'var(--text-main)' }}>{user?.email}</strong>
            </p>
          </div>

          <button
            onClick={handleManualRefresh}
            className="btn btn-secondary"
            disabled={refreshingToken}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={refreshingToken ? 'spin' : ''} />
            {refreshingToken ? 'Rotating Token...' : 'Test Manual Token Rotation'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Security Architecture Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Token Status Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
              <Key size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Access Token (Memory)</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Short-lived JWT (15 min)</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a5b4fc' }}>
            {accessToken ? `${accessToken.substring(0, 45)}...[TRUNCATED]` : 'No Access Token in Memory'}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--success)' }}>
            <ShieldCheck size={14} /> Never stored in localStorage (XSS Protected)
          </div>
        </div>

        {/* Refresh Token Status Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '12px', color: '#c084fc' }}>
              <Lock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Refresh Token (HttpOnly)</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Long-lived JWT (7 days)</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Stored inside a secure <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>HttpOnly</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>SameSite</code> cookie. JavaScript cannot read or extract it.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--success)' }}>
            <ShieldCheck size={14} /> Rotates on every refresh & hashed in DB
          </div>
        </div>

        {/* System Metrics Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: 'var(--success)' }}>
              <Activity size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Backend Security Score</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Render API Response</span>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
            {dashboardData?.metrics?.securityScore || 'A+ (98/100)'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Rate Limited · Helmet JS Enabled · SHA-256 Hashed RTs
          </div>
        </div>

      </div>

      {/* Protected Data Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Server size={20} color="var(--accent-primary)" /> Protected Audit Logs (API Data)
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Fetching protected data over encrypted stream...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>EVENT ID</th>
                  <th style={{ padding: '12px 16px' }}>ACTION</th>
                  <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentActivities?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{item.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{item.action}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-dim)' }}>{new Date(item.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--success)',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        {item.status || item.ip}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
