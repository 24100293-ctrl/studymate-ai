-- ==============================================================================
-- StudyMate AI - SQLite Database Schema
-- Môn học: Lập trình Web Nâng Cao
-- Bảng thống nhất: users, history
-- ==============================================================================

-- Bật tính năng ràng buộc khóa ngoại trong SQLite (bắt buộc cho SQLite)
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG (users)
-- Quản lý thông tin tài khoản của sinh viên
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index tìm kiếm nhanh theo email khi đăng nhập
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ------------------------------------------------------------------------------
-- 2. BẢNG LỊCH SỬ TƯƠNG TÁC (history)
-- Lưu lại các câu hỏi, tóm tắt và quiz của từng sinh viên
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('ask', 'summarize', 'quiz')),
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index truy vấn lịch sử theo user_id (rất quan trọng khi lọc lịch sử cá nhân)
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
