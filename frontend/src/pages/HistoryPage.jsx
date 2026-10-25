import React, { useState, useEffect, useCallback } from 'react';
import { historyApi } from '../services/api.js';

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = useCallback(async (type) => {
    try {
      setLoading(true);
      setError('');
      const data = await historyApi.getAll(type === 'all' ? null : type);
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách lịch sử.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab, fetchHistory]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi lịch sử này không?')) {
      return;
    }

    try {
      setDeletingId(id);
      await historyApi.delete(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert('Lỗi khi xóa bản ghi: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả hoạt động' },
    { id: 'ask', label: '💬 Hỏi đáp' },
    { id: 'summarize', label: '📝 Tóm tắt' },
    { id: 'quiz', label: '🎯 Trắc nghiệm' },
  ];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-800)' }}>
          ⏱ Lịch sử học tập của bạn
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Xem lại và tra cứu các phiên hỏi đáp, văn bản tóm tắt và bài thi trắc nghiệm đã hoàn thành.
        </p>
      </div>

      {/* Tabs Bộ Lọc */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner spinner-primary"></div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.95rem' }}>Đang tải danh sách lịch sử...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>📂</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-800)' }}>
            Chưa có bản ghi nào trong mục này
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Các phiên học tập trên StudyMate AI sẽ tự động xuất hiện tại đây khi bạn sử dụng.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {historyList.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft:
                  item.type === 'ask'
                    ? '4px solid #3b82f6'
                    : item.type === 'summarize'
                    ? '4px solid #10b981'
                    : '4px solid #a855f7',
              }}
              onClick={() => setSelectedItem(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span className={`badge badge-${item.type}`}>
                      {item.type === 'ask' ? 'Hỏi đáp' : item.type === 'summarize' ? 'Tóm tắt' : 'Trắc nghiệm'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--gray-800)',
                      marginBottom: '0.4rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.input}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--gray-600)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.output}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === item.id}
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    {deletingId === item.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Xem Chi Tiết Bản Ghi Lịch Sử */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1000,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: 'var(--white)',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`badge badge-${selectedItem.type}`}>{selectedItem.type}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                  {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('vi-VN') : ''}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedItem(null)}
              >
                Đóng ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Đầu vào (Input)
              </label>
              <div
                style={{
                  marginTop: '0.35rem',
                  padding: '1rem',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedItem.input}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                Kết quả trả về từ AI (Output)
              </label>
              <div
                style={{
                  marginTop: '0.35rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--gray-200)',
                }}
              >
                {selectedItem.output}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedItem(null)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
