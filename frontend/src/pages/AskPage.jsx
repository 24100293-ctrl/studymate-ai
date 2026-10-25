import React, { useState } from 'react';
import { aiApi, historyApi } from '../services/api.js';

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAnswer('');
    setCopySuccess(false);

    if (!question.trim()) {
      setError('Vui lòng nhập câu hỏi cần giải đáp.');
      return;
    }

    try {
      setLoading(true);
      // 1. Gọi Backend gửi prompt sang Gemini AI
      const result = await aiApi.ask(question.trim(), context.trim());
      const aiAnswer = result?.answer || 'Không nhận được câu trả lời từ máy chủ.';
      setAnswer(aiAnswer);

      // 2. Tự động lưu vào lịch sử học tập
      try {
        await historyApi.create(
          'ask',
          context.trim() ? `[${context.trim()}] ${question.trim()}` : question.trim(),
          aiAnswer
        );
      } catch (histErr) {
        console.warn('Lưu lịch sử tự động không thành công:', histErr.message);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi gọi API hỏi đáp AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClear = () => {
    setQuestion('');
    setContext('');
    setAnswer('');
    setError('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-800)' }}>
          💬 Hỏi đáp bài học cùng AI
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Đặt bất kỳ câu hỏi nào về lý thuyết, giải thuật hoặc bài tập môn học. Trợ lý Gemini sẽ phân tích chi tiết.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form nhập câu hỏi */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="question">
              Nội dung câu hỏi <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="question"
              className="form-textarea"
              placeholder="Ví dụ: Giải thích giải thuật Dijkstra bằng ví dụ từng bước và vẽ bảng cập nhật trọng số?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="context">
              Ngữ cảnh môn học hoặc bài giảng liên quan (Tùy chọn)
            </label>
            <input
              id="context"
              type="text"
              className="form-input"
              placeholder="Ví dụ: Môn Cấu trúc dữ liệu và giải thuật / Chương Đồ thị"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading || (!question && !answer && !context)}
            >
              Làm mới
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Gemini đang suy nghĩ...</span>
                </>
              ) : (
                'Gửi câu hỏi tới AI'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Kết quả trả lời từ AI */}
      {answer && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--white)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                Câu trả lời từ StudyMate AI
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
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}
