import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cấu hình PRAGMA và khởi tạo các bảng, index theo đúng docs/database-schema.sql
 * @param {import('better-sqlite3').Database} dbInstance
 * @returns {import('better-sqlite3').Database}
 */
export function setupDatabase(dbInstance) {
  // 1. Bật ràng buộc khóa ngoại (bắt buộc trong SQLite)
  dbInstance.pragma('foreign_keys = ON');

  // 2. Xác minh ràng buộc khóa ngoại đã thực sự được bật
  const fkStatus = dbInstance.pragma('foreign_keys', { simple: true });
  if (fkStatus !== 1) {
    throw new Error('Lỗi: Không thể kích hoạt PRAGMA foreign_keys = ON trong SQLite');
  }

  // 3. Khởi tạo schema đúng theo docs/database-schema.sql
  dbInstance.exec(`
    -- 1. BẢNG NGƯỜI DÙNG (users)
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Index tìm kiếm nhanh theo email khi đăng nhập
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- 2. BẢNG LỊCH SỬ TƯƠNG TÁC (history)
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('ask', 'summarize', 'quiz')),
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Index truy vấn lịch sử theo user_id và thời gian tạo
    CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
  `);

  return dbInstance;
}

/**
 * Khởi tạo kết nối cơ sở dữ liệu SQLite.
 * Tự động chọn :memory: khi chạy môi trường test để bảo vệ database phát triển.
 * @param {string|null} customPath
 * @returns {import('better-sqlite3').Database}
 */
export function createDatabase(customPath = null) {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const resolvedPath = customPath || (
    isTestEnv
      ? ':memory:'
      : (process.env.DB_PATH
          ? path.resolve(process.cwd(), process.env.DB_PATH)
          : path.join(__dirname, '../../data/studymate.db'))
  );

  // Tạo thư mục chứa file db nếu đường dẫn là file thật và thư mục chưa tồn tại
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const dbInstance = new Database(resolvedPath);
  return setupDatabase(dbInstance);
}

let defaultDbInstance = null;

/**
 * Lấy instance database mặc định (singleton)
 * @returns {import('better-sqlite3').Database}
 */
export function getDb() {
  if (!defaultDbInstance || !defaultDbInstance.open) {
    defaultDbInstance = createDatabase();
  }
  return defaultDbInstance;
}

/**
 * Đóng kết nối database hiện tại nếu đang mở
 */
export function closeDb() {
  if (defaultDbInstance && defaultDbInstance.open) {
    defaultDbInstance.close();
    defaultDbInstance = null;
  }
}

// Proxy linh hoạt cho phép: import db from './config/db.js'; db.prepare(...);
const dbProxy = new Proxy({}, {
  get(target, prop) {
    const instance = getDb();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default dbProxy;
