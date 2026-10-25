import db from '../config/db.js';

export const userModel = {
  /**
   * Tìm người dùng theo email (dùng khi đăng ký kiểm tra trùng lặp hoặc đăng nhập)
   * @param {string} email
   * @returns {object|undefined}
   */
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  /**
   * Tìm người dùng theo ID (trả về các trường an toàn, không có password_hash)
   * @param {number|string} id
   * @returns {object|undefined}
   */
  findById(id) {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Tạo tài khoản người dùng mới
   * @param {object} param0 { name, email, passwordHash }
   * @returns {object} Thông tin người dùng mới tạo (không có password_hash)
   */
  create({ name, email, passwordHash }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, email, passwordHash);
    return this.findById(result.lastInsertRowid);
  },
};

export default userModel;
