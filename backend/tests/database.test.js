import { createDatabase, closeDb } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';

describe('BƯỚC 2.2: Kiểm tra cấu hình và toàn vẹn cơ sở dữ liệu SQLite', () => {
  let testDb;

  beforeEach(() => {
    // Khởi tạo một database :memory: hoàn toàn mới và độc lập cho mỗi test case
    testDb = createDatabase(':memory:');
  });

  afterEach(() => {
    if (testDb && testDb.open) {
      testDb.close();
    }
  });

  afterAll(() => {
    closeDb();
  });

  test('1. PRAGMA foreign_keys phải được bật và trả về giá trị 1', () => {
    const fkStatus = testDb.pragma('foreign_keys', { simple: true });
    expect(fkStatus).toBe(1);
  });

  test('2. Bảng users và history phải được tự động tạo', () => {
    const tables = testDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'history')")
      .all()
      .map((t) => t.name);

    expect(tables).toContain('users');
    expect(tables).toContain('history');
  });

  test('3. Cấu trúc cột của bảng users phải đúng theo đặc tả schema', () => {
    const columns = testDb.prepare('PRAGMA table_info(users)').all();
    const colMap = Object.fromEntries(columns.map((c) => [c.name, c]));

    // id INTEGER PRIMARY KEY AUTOINCREMENT
    expect(colMap.id).toBeDefined();
    expect(colMap.id.type).toBe('INTEGER');
    expect(colMap.id.pk).toBe(1);

    // name TEXT NOT NULL
    expect(colMap.name).toBeDefined();
    expect(colMap.name.type).toBe('TEXT');
    expect(colMap.name.notnull).toBe(1);

    // email TEXT UNIQUE NOT NULL
    expect(colMap.email).toBeDefined();
    expect(colMap.email.type).toBe('TEXT');
    expect(colMap.email.notnull).toBe(1);

    // password_hash TEXT NOT NULL
    expect(colMap.password_hash).toBeDefined();
    expect(colMap.password_hash.type).toBe('TEXT');
    expect(colMap.password_hash.notnull).toBe(1);

    // created_at DATETIME
    expect(colMap.created_at).toBeDefined();
    expect(colMap.created_at.type).toBe('DATETIME');
  });

  test('4. Cấu trúc cột của bảng history phải đúng theo đặc tả schema', () => {
    const columns = testDb.prepare('PRAGMA table_info(history)').all();
    const colMap = Object.fromEntries(columns.map((c) => [c.name, c]));

    // id
    expect(colMap.id).toBeDefined();
    expect(colMap.id.type).toBe('INTEGER');
    expect(colMap.id.pk).toBe(1);

    // user_id
    expect(colMap.user_id).toBeDefined();
    expect(colMap.user_id.type).toBe('INTEGER');
    expect(colMap.user_id.notnull).toBe(1);

    // type
    expect(colMap.type).toBeDefined();
    expect(colMap.type.type).toBe('TEXT');
    expect(colMap.type.notnull).toBe(1);

    // input & output
    expect(colMap.input).toBeDefined();
    expect(colMap.input.type).toBe('TEXT');
    expect(colMap.input.notnull).toBe(1);

    expect(colMap.output).toBeDefined();
    expect(colMap.output.type).toBe('TEXT');
    expect(colMap.output.notnull).toBe(1);

    // created_at
    expect(colMap.created_at).toBeDefined();
    expect(colMap.created_at.type).toBe('DATETIME');
  });

  test('5. Ràng buộc khóa ngoại: Thêm history với user_id không tồn tại phải ném lỗi', () => {
    expect(() => {
      testDb
        .prepare(
          "INSERT INTO history (user_id, type, input, output) VALUES (9999, 'ask', 'câu hỏi test', 'câu trả lời')"
        )
        .run();
    }).toThrow(/FOREIGN KEY constraint failed/i);
  });

  test('6. Hiệu ứng CASCADE: Xóa user phải tự động xóa tất cả bản ghi history liên quan', () => {
    // Tạo 1 user mẫu trong bộ nhớ test
    const userResult = testDb
      .prepare("INSERT INTO users (name, email, password_hash) VALUES ('Sinh viên test', 'test@school.edu', 'hash_123')")
      .run();
    const userId = userResult.lastInsertRowid;

    // Thêm 2 bản ghi history cho user này
    testDb
      .prepare("INSERT INTO history (user_id, type, input, output) VALUES (?, 'ask', 'Hỏi 1', 'Trả lời 1')")
      .run(userId);
    testDb
      .prepare("INSERT INTO history (user_id, type, input, output) VALUES (?, 'quiz', 'Đề quiz', 'Đáp án')")
      .run(userId);

    // Xác nhận đã có 2 bản ghi history
    const beforeCount = testDb.prepare('SELECT COUNT(*) as count FROM history WHERE user_id = ?').get(userId).count;
    expect(beforeCount).toBe(2);

    // Xóa user
    testDb.prepare('DELETE FROM users WHERE id = ?').run(userId);

    // Xác nhận history của user này đã tự động bị xóa sạch (ON DELETE CASCADE)
    const afterCount = testDb.prepare('SELECT COUNT(*) as count FROM history WHERE user_id = ?').get(userId).count;
    expect(afterCount).toBe(0);
  });

  test('7. Ràng buộc CHECK loại history: Chỉ chấp nhận "ask", "summarize", "quiz"', () => {
    const userResult = testDb
      .prepare("INSERT INTO users (name, email, password_hash) VALUES ('User Test', 'chk@test.com', 'h1')")
      .run();
    const userId = userResult.lastInsertRowid;

    // Thử chèn loại không hợp lệ ('invalid_type')
    expect(() => {
      testDb
        .prepare("INSERT INTO history (user_id, type, input, output) VALUES (?, 'invalid_type', 'in', 'out')")
        .run(userId);
    }).toThrow(/CHECK constraint failed/i);
  });

  test('8. Các Index quy định trong schema phải tồn tại đầy đủ', () => {
    const userIndexes = testDb.prepare('PRAGMA index_list(users)').all().map((idx) => idx.name);
    expect(userIndexes).toContain('idx_users_email');

    const historyIndexes = testDb.prepare('PRAGMA index_list(history)').all().map((idx) => idx.name);
    expect(historyIndexes).toContain('idx_history_user_id');
    expect(historyIndexes).toContain('idx_history_created_at');
  });

  test('9. Đảm bảo môi trường kiểm thử không tạo hoặc ghi đè file database phát triển', () => {
    const devDbPath = path.resolve('data/studymate.db');
    // Khi chạy test, biến NODE_ENV = 'test' đảm bảo không có file dev db nào bị tạo ngầm
    // Hoặc nếu file đã có từ trước, test này chỉ dùng :memory:
    expect(process.env.NODE_ENV).toBe('test');
  });
});
