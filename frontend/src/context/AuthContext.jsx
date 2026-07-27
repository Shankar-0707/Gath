import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { axiosInstance, setMemoryToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Ref prevents double-invocation from React Strict Mode from revoking the
  // just-rotated refresh token on the second call.
  const initDone = useRef(false);

  const updateAuth = useCallback((userData, token) => {
    setUser(userData);
    setAccessToken(token);
    setMemoryToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setMemoryToken(null);
  }, []);

  // Silent session restore on every page load / F5 refresh
  useEffect(() => {
    // Guard: only run once (prevents React Strict Mode double-invocation
    // from revoking the freshly-rotated refresh token on the 2nd call)
    if (initDone.current) return;
    initDone.current = true;

    const checkAuthOnLoad = async () => {
      try {
        const res = await axiosInstance.post('/api/auth/refresh');
        const { accessToken: newAT, user: userData } = res.data;
        updateAuth(userData, newAT);
      } catch (err) {
        // Only clear auth on proper 401/403 (no valid refresh token).
        // Do NOT redirect on network errors (ECONNREFUSED / 503) — backend may just be starting up.
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        } else if (!status) {
          // Network error (proxy/backend not reachable) — don't clear auth
          console.warn('[Auth] Backend unreachable during session check. Retrying is possible.');
          clearAuth(); // Still clear since we can't confirm the session
        } else {
          clearAuth();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthOnLoad();
  }, []); // empty deps — intentional, guard ref handles it

  const login = async (email, password) => {
    const res = await axiosInstance.post('/api/auth/login', { email, password });
    const { user: userData, accessToken: token } = res.data;
    updateAuth(userData, token);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axiosInstance.post('/api/auth/register', { name, email, password });
    const { user: userData, accessToken: token } = res.data;
    updateAuth(userData, token);
    return res.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
    }
  };

  const manualRefresh = async () => {
    const res = await axiosInstance.post('/api/auth/refresh');
    const { accessToken: newAT, user: userData } = res.data;
    updateAuth(userData, newAT);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isInitializing,
        login,
        register,
        logout,
        manualRefresh,
        updateAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
