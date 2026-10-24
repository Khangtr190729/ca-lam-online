import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import tokenStorage from '../storage/tokenStorage';
import { authApi, storeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [roleInStore, setRoleInStore] = useState(null);
  const [hourlyWage, setHourlyWage] = useState(0);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tải lại thông tin cửa hàng hiện tại của nhân viên
  const fetchMyStore = useCallback(async () => {
    try {
      const res = await storeApi.getMyStore();
      if (res && res.success && res.store) {
        setStore(res.store);
        setRoleInStore(res.roleInStore || 'EMPLOYEE');
        setHourlyWage(res.hourlyWage || 0);
        return res.store;
      } else {
        setStore(null);
        setRoleInStore(null);
        setHourlyWage(0);
        return null;
      }
    } catch {
      // Nhân viên chưa gia nhập cửa hàng nào
      setStore(null);
      setRoleInStore(null);
      setHourlyWage(0);
      return null;
    }
  }, []);

  // Khôi phục phiên đăng nhập khi khởi động ứng dụng
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await tokenStorage.getToken();
        if (storedToken) {
          setToken(storedToken);
          // Kiểm tra tính hợp lệ của token qua API me
          const meRes = await authApi.getMe();
          if (meRes && meRes.success && meRes.user) {
            setUser(meRes.user);
            await tokenStorage.saveUser(meRes.user);
            await fetchMyStore();
          } else {
            await tokenStorage.clearAll();
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Bootstrap auth failed:', err.message);
        // Nếu lỗi 401 token hết hạn, xóa token
        if (err.message?.includes('401') || err.message?.includes('hết hạn')) {
          await tokenStorage.clearAll();
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, [fetchMyStore]);

  // Đăng nhập
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res && res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      await tokenStorage.saveToken(res.token);
      await tokenStorage.saveUser(res.user);
      await fetchMyStore();
      return res;
    }
    throw new Error(res?.message || 'Đăng nhập không thành công');
  };

  // Đăng ký
  const register = async (data) => {
    const res = await authApi.register(data);
    if (res && res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      await tokenStorage.saveToken(res.token);
      await tokenStorage.saveUser(res.user);
      await fetchMyStore();
      return res;
    }
    throw new Error(res?.message || 'Đăng ký không thành công');
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await tokenStorage.clearAll();
    } catch (e) {
      console.warn('Logout clear error:', e);
    }
    setToken(null);
    setUser(null);
    setStore(null);
    setRoleInStore(null);
    setHourlyWage(0);
  };

  // Refresh user and store
  const refreshUserAndStore = async () => {
    try {
      const meRes = await authApi.getMe();
      if (meRes && meRes.success && meRes.user) {
        setUser(meRes.user);
        await tokenStorage.saveUser(meRes.user);
      }
      await fetchMyStore();
    } catch (e) {
      console.warn('Refresh user error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        roleInStore,
        hourlyWage,
        token,
        isLoading,
        login,
        register,
        logout,
        fetchMyStore,
        refreshUserAndStore,
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

export default AuthContext;
