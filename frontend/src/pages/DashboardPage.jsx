import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { historyApi } from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRecentHistory() {
      try {
        setLoading(true);
        const data = await historyApi.getAll(null, 4);
        setRecentHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRecentHistory();
  }, []);

  const features = [
    {
      title: 'Hỏi đáp bài tập AI',
      desc: 'Đặt câu hỏi mọi môn học. Trợ lý Gemini sẽ phân tích, giải thích phương pháp và cung cấp ví dụ trực quan.',
      path: '/ask',
      icon: '💬',
      badge: 'ask',
      badgeText: 'Hỏi đáp',
    },
    {
      title: 'Tóm tắt bài giảng & tài liệu',
      desc: 'Dán tài liệu học tập hoặc slide lý thuyết dài. Rút trích các luận điểm cốt lõi với 3 cấp độ tóm tắt.',
      path: '/summarize',
      icon: '📝',
      badge: 'summarize',
      badgeText: 'Tóm tắt',
    },
    {
      title: 'Ôn luyện trắc nghiệm',
      desc: 'Nhập chủ đề môn học và số câu hỏi mong muốn. Tự động sinh đề kiểm tra kèm giải thích chi tiết đáp án.',
      path: '/quiz',
      icon: '🎯',
      badge: 'quiz',
      badgeText: 'Trắc nghiệm',
    },
    {
      title: 'Lịch sử học tập cá nhân',
      desc: 'Tra cứu lại các phiên hỏi đáp, bài tóm tắt và các bài trắc nghiệm đã làm. Quản lý và xóa khi cần.',
      path: '/history',
      icon: '⏱',
      badge: 'ask',
      badgeText: 'Lịch sử',
    },
  ];

  return (
    <div>
      {/* Banner Chào Mừng */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
          color: 'var(--white)',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          border: 'none',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
          Nền Tảng Trợ Lý Học Tập Sinh Viên
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
          Xin chào, {user?.name || 'Bạn'}! 👋
        </h1>
        <p style={{ marginTop: '0.5rem', opacity: 0.9, maxWidth: '650px', fontSize: '0.95rem' }}>
          Hôm nay bạn muốn nghiên cứu kiến thức gì? Hãy chọn một tính năng bên dưới để bắt đầu phiên học tập cùng AI nhé.
        </p>
      </div>

      {/* 4 Khối Tính Năng Chính */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--gray-800)' }}>
          🚀 Tính năng học tập
        </h2>
        <div className="grid-2">
          {features.map((feat) => (
            <Link
              key={feat.path}
              to={feat.path}
              className="card"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{feat.icon}</span>
                  <span className={`badge badge-${feat.badge}`}>{feat.badgeText}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.4rem' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>Bắt đầu ngay</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hoạt Động Gần Đây (Recent History) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)' }}>
            📋 Hoạt động gần đây của bạn
          </h2>
          <Link to="/history" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
            Xem toàn bộ lịch sử →
          </Link>
        </div>

        {loading ? (
          <div className="loading-container" style={{ padding: '2rem' }}>
            <div className="spinner spinner-primary"></div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải lịch sử gần đây...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>Không thể tải hoạt động gần đây: {error}</span>
          </div>
        ) : recentHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--gray-500)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📖</span>
            <p style={{ fontWeight: 600 }}>Bạn chưa có hoạt động học tập nào.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Hãy thử đặt một câu hỏi hoặc tóm tắt tài liệu để lưu lại phiên học đầu tiên nhé!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <span className={`badge badge-${item.type}`}>{item.type}</span>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--gray-800)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '500px',
                    }}
                  >
                    {item.input}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
