import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('studymate_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải thông tin người dùng hiện tại từ token đã lưu
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('studymate_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await authApi.getMe();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.warn('Phiên đăng nhập hết hạn hoặc không hợp lệ:', err.message);
      localStorage.removeItem('studymate_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lắng nghe sự kiện token hết hạn từ api.js
  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('studymate:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('studymate:unauthorized', handleUnauthorized);
    };
  }, [fetchCurrentUser]);

  // Đăng nhập
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authApi.login(email, password);
      const { user: loggedInUser, token: receivedToken } = result;

      localStorage.setItem('studymate_token', receivedToken);
      setToken(receivedToken);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Đăng ký tài khoản
  const register = async (name, email, password) => {
    setError(null);
    try {
      const result = await authApi.register(name, email, password);
      const { user: registeredUser, token: receivedToken } = result;

      localStorage.setItem('studymate_token', receivedToken);
      setToken(receivedToken);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('studymate_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong một AuthProvider');
  }
  return context;
}

export default AuthContext;
