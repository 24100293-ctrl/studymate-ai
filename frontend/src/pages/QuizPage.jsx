import React, { useState } from 'react';
import { aiApi, historyApi } from '../services/api.js';

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setQuestions([]);
    setUserAnswers({});
    setIsSubmitted(false);

    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề ôn tập cần tạo câu hỏi trắc nghiệm.');
      return;
    }

    try {
      setLoading(true);
      const result = await aiApi.quiz(topic.trim(), parseInt(numQuestions, 10));

      if (!result || !Array.isArray(result.questions) || result.questions.length === 0) {
        throw new Error('Dữ liệu bộ đề trắc nghiệm trả về không đúng cấu trúc yêu cầu.');
      }

      setQuestions(result.questions);

      // Lưu vào lịch sử học tập
      try {
        await historyApi.create(
          'quiz',
          `[Chủ đề: ${topic.trim()}] ${result.questions.length} câu hỏi`,
          JSON.stringify(result.questions)
        );
      } catch (histErr) {
        console.warn('Lưu lịch sử quiz không thành công:', histErr.message);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo đề trắc nghiệm từ AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      if (!window.confirm('Bạn vẫn còn câu hỏi chưa chọn đáp án. Bạn có chắc chắn muốn nộp bài ngay không?')) {
        return;
      }
    }
    setIsSubmitted(true);
  };

  // Tính điểm
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answerIndex) {
        correctCount++;
      }
    });
    return {
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
    };
  };

  const scoreInfo = isSubmitted && questions.length > 0 ? calculateScore() : null;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-800)' }}>
          🎯 Ôn luyện trắc nghiệm cùng AI
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Tự động sinh bộ đề thi thử theo bất kỳ chủ đề môn học nào, kèm đáp án và lời giải chi tiết.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form tạo đề */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleGenerateQuiz}>
          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="topic">
                Chủ đề môn học / Khái niệm cần ôn tập <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="topic"
                type="text"
                className="form-input"
                placeholder="Ví dụ: Lập trình mạng HTTP, Kiến trúc MVC, SQL Indexing..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="numQuestions">
                Số lượng câu hỏi (1 - 10)
              </label>
              <select
                id="numQuestions"
                className="form-select"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} câu hỏi trắc nghiệm
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Gemini đang soạn đề thi...</span>
                </>
              ) : (
                'Tạo bộ trắc nghiệm'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bảng điểm tổng kết sau khi nộp */}
      {scoreInfo && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            background: scoreInfo.percentage >= 70
              ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: 'none',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>{scoreInfo.percentage >= 70 ? '🎉' : '📚'}</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--gray-800)' }}>
            Kết quả bài làm: {scoreInfo.correct} / {scoreInfo.total} câu đúng ({scoreInfo.percentage}%)
          </h2>
          <p style={{ color: 'var(--gray-600)', marginTop: '0.25rem' }}>
            {scoreInfo.percentage === 100
              ? 'Xuất sắc! Bạn đã nắm vững toàn bộ kiến thức của chủ đề này.'
              : scoreInfo.percentage >= 70
              ? 'Rất tốt! Hãy xem lại phần giải thích bên dưới cho những câu còn băn khoăn nhé.'
              : 'Hãy xem kỹ các giải thích chi tiết bên dưới để củng cố lại kiến thức nhé!'}
          </p>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      {questions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map((q, qIndex) => {
            const isAnswered = userAnswers[qIndex] !== undefined;
            const selectedOption = userAnswers[qIndex];
            const isCorrect = isSubmitted && selectedOption === q.answerIndex;

            return (
              <div
                key={q.id || qIndex}
                className="card"
                style={{
                  borderLeft: isSubmitted
                    ? isCorrect
                      ? '4px solid var(--success)'
                      : '4px solid var(--danger)'
                    : '1px solid var(--gray-200)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    Câu {qIndex + 1} / {questions.length}
                  </span>
                  {isSubmitted && (
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: isCorrect ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {isCorrect ? '✓ Đúng' : '✗ Chưa chính xác'}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-800)' }}>
                  {q.question}
                </h3>

                {/* Các phương án lựa chọn */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {q.options.map((opt, optIndex) => {
                    let btnStyle = {
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--gray-200)',
                      backgroundColor: 'var(--white)',
                      textAlign: 'left',
                      cursor: isSubmitted ? 'default' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    };

                    if (!isSubmitted) {
                      if (selectedOption === optIndex) {
                        btnStyle.backgroundColor = 'var(--primary-light)';
                        btnStyle.borderColor = 'var(--primary)';
                        btnStyle.fontWeight = 700;
                        btnStyle.color = 'var(--primary)';
                      }
                    } else {
                      // Đã nộp bài
                      if (optIndex === q.answerIndex) {
                        btnStyle.backgroundColor = 'var(--success-light)';
                        btnStyle.borderColor = 'var(--success)';
                        btnStyle.color = '#065f46';
                        btnStyle.fontWeight = 700;
                      } else if (selectedOption === optIndex && optIndex !== q.answerIndex) {
                        btnStyle.backgroundColor = 'var(--danger-light)';
                        btnStyle.borderColor = 'var(--danger)';
                        btnStyle.color = '#991b1b';
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        style={btnStyle}
                        onClick={() => handleSelectOption(qIndex, optIndex)}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid currentColor',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lời giải thích chi tiết */}
                {isSubmitted && q.explanation && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                      borderLeft: '3px solid var(--accent)',
                      color: 'var(--gray-700)',
                    }}
                  >
                    <strong>💡 Lời giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {/* Nút nộp bài */}
          {!isSubmitted && (
            <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}
                onClick={handleSubmitQuiz}
              >
                Nộp bài & Chấm điểm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
