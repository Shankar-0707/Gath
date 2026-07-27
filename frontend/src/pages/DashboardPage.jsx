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
    </div>
  );
};

export default DashboardPage;
