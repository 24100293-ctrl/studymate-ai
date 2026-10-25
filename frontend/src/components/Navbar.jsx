import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">🎓</span>
          <span>StudyMate AI</span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav>
              <ul className="nav-links">
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📊 Tổng quan
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/ask" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    💬 Hỏi đáp AI
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/summarize" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    📝 Tóm tắt
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    🎯 Trắc nghiệm
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    ⏱ Lịch sử
                  </NavLink>
                </li>
              </ul>
            </nav>

            <div className="nav-user">
              <div className="user-badge" title={user?.email}>
                <span className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                <span>{user?.name || 'Sinh viên'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Đăng xuất khỏi hệ thống">
                Đăng xuất
              </button>
            </div>
          </>
        ) : (
          <div className="nav-user">
            <Link to="/login" className="btn btn-secondary btn-sm">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
