import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import AskPage from '../pages/AskPage.jsx';
import SummarizePage from '../pages/SummarizePage.jsx';
import QuizPage from '../pages/QuizPage.jsx';
import HistoryPage from '../pages/HistoryPage.jsx';

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Route gốc: Điều hướng thông minh */}
      <Route
        path="/"
        element={
          loading ? (
            <div className="loading-container">
              <div className="spinner spinner-primary"></div>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Routes công khai (Authentication) */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Routes được bảo vệ (Bắt buộc phải đăng nhập) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ask"
        element={
          <ProtectedRoute>
            <AskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/summarize"
        element={
          <ProtectedRoute>
            <SummarizePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Route 404 Not Found */}
      <Route
        path="*"
        element={
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>404</h1>
            <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Trở về Trang chủ
            </a>
          </div>
        }
      />
    </Routes>
  );
}
