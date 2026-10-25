import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-primary"></div>
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Chuyển hướng về login và lưu lại vị trí ban đầu muốn đến
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
