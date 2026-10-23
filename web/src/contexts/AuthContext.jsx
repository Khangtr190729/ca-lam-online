import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, storeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [roleInStore, setRoleInStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('ca_lam_token');
    if (!token) {
      setUser(null);
      setStore(null);
      setRoleInStore(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.getMe();
      const rawUser = res.user || res.data?.user;

      if (res.success && rawUser) {
        // Normalize fields
        const normalizedUser = {
          ...rawUser,
          name: rawUser.fullName || rawUser.name,
          role: rawUser.systemRole || rawUser.role
        };
        setUser(normalizedUser);

        // Fetch store for current user
        try {
          const storeRes = await storeApi.getMyStore();
          if (storeRes.success && storeRes.hasStore) {
            setStore(storeRes.store);
            setRoleInStore(storeRes.roleInStore || normalizedUser.role);
          } else {
            setStore(null);
            setRoleInStore(normalizedUser.role);
          }
        } catch {
          setStore(null);
          setRoleInStore(normalizedUser.role);
        }
      } else {
        localStorage.removeItem('ca_lam_token');
        setUser(null);
        setStore(null);
        setRoleInStore(null);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('ca_lam_token');
      setUser(null);
      setStore(null);
      setRoleInStore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    setError(null);
    const res = await authApi.login({ email, password });
    const token = res.token || res.data?.token;
    const rawUser = res.user || res.data?.user;

    if (res.success && token) {
      localStorage.setItem('ca_lam_token', token);
      const normalizedUser = {
        ...rawUser,
        name: rawUser?.fullName || rawUser?.name,
        role: rawUser?.systemRole || rawUser?.role
      };
      setUser(normalizedUser);
      await loadCurrentUser();
      return { token, user: normalizedUser };
    }
    throw new Error(res.message || 'Đăng nhập không thành công');
  };

  const register = async (formData) => {
    setError(null);
    const res = await authApi.register(formData);
    const token = res.token || res.data?.token;
    const rawUser = res.user || res.data?.user;

    if (res.success && token) {
      localStorage.setItem('ca_lam_token', token);
      const normalizedUser = {
        ...rawUser,
        name: rawUser?.fullName || rawUser?.name,
        role: rawUser?.systemRole || rawUser?.role
      };
      setUser(normalizedUser);
      await loadCurrentUser();
      return { token, user: normalizedUser };
    }
    throw new Error(res.message || 'Đăng ký không thành công');
  };

  const logout = () => {
    localStorage.removeItem('ca_lam_token');
    setUser(null);
    setStore(null);
    setRoleInStore(null);
  };

  const value = {
    user,
    store,
    roleInStore,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser: loadCurrentUser,
    setUser,
    setStore
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
