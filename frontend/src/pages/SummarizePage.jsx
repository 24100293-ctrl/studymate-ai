import React, { useState } from 'react';
import { aiApi, historyApi } from '../services/api.js';

export default function SummarizePage() {
  const [content, setContent] = useState('');
  const [length, setLength] = useState('medium');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSummary('');
    setCopySuccess(false);

    if (!content.trim()) {
      setError('Vui lòng dán hoặc nhập nội dung văn bản cần tóm tắt.');
      return;
    }

    try {
      setLoading(true);
      const result = await aiApi.summarize(content.trim(), length);
      const aiSummary = result?.summary || 'Không thể tạo bản tóm tắt.';
      setSummary(aiSummary);

      // Tự động lưu vào lịch sử
      try {
        const inputSnippet = content.trim().length > 120
          ? content.trim().substring(0, 120) + '...'
          : content.trim();

        await historyApi.create(
          'summarize',
          `[Mức độ: ${length}] ${inputSnippet}`,
          aiSummary
        );
      } catch (histErr) {
        console.warn('Lưu lịch sử tóm tắt không thành công:', histErr.message);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tóm tắt nội dung qua AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-800)' }}>
          📝 Tóm tắt bài giảng & tài liệu
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Chắt lọc những ý chính từ giáo trình, bài báo hoặc slide lý thuyết dài chỉ trong vài giây.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form nhập tài liệu */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="content">
              Nội dung văn bản cần tóm tắt <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="content"
              className="form-textarea"
              placeholder="Dán nội dung bài học, chương sách hoặc tài liệu nghiên cứu vào đây..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={8}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chọn mức độ tóm tắt</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'short', label: 'Ngắn gọn', desc: '3 - 5 ý chính cốt lõi' },
                { id: 'medium', label: 'Vừa phải', desc: 'Cân bằng giữa tóm tắt & diễn giải' },
                { id: 'detailed', label: 'Chi tiết', desc: 'Phân tích sâu theo từng đề mục' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => !loading && setLength(opt.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${length === opt.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                    backgroundColor: length === opt.id ? 'var(--primary-light)' : 'var(--white)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: length === opt.id ? 'var(--primary)' : 'var(--gray-800)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setContent(''); setSummary(''); setError(''); }}
              disabled={loading || (!content && !summary)}
            >
              Làm mới
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Gemini đang tóm tắt...</span>
                </>
              ) : (
                'Tạo bản tóm tắt'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Kết quả tóm tắt */}
      {summary && (
        <div className="card" style={{ borderLeft: '4px solid var(--success)', backgroundColor: 'var(--white)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                Bản tóm tắt cốt lõi
              </h3>
            </div>
            <button onClick={handleCopy} className="btn btn-secondary btn-sm">
              {copySuccess ? 'Đã sao chép! ✓' : 'Sao chép kết quả'}
            </button>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              color: 'var(--gray-800)',
              border: '1px solid var(--gray-200)',
            }}
          >
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
