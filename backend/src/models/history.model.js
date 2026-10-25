import db from "../config/db.js";
import { performance } from "node:perf_hooks";

export const historyModel = {
  /**
   * Tạo bản ghi lịch sử mới cho người dùng
   * @param {object} param0 { userId, type, input, output }
   * @returns {object} Bản ghi vừa tạo
   */
  create({ userId, type, input, output }) {
    const stmt = db.prepare(`
      INSERT INTO history (user_id, type, input, output)
      VALUES (?, ?, ?, ?)
    `);
    const startedAt = performance.now();
    try {
      const result = stmt.run(userId, type, input, output);
      return this.findById(result.lastInsertRowid);
    } finally {
      console.info(
        `[timing] history.write_ms=${Math.round(performance.now() - startedAt)}`,
      );
    }
  },

  /**
   * Lấy chi tiết bản ghi lịch sử theo ID
   * @param {number|string} id
   * @returns {object|undefined}
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, user_id, type, input, output, created_at
      FROM history
      WHERE id = ?
    `);
    return stmt.get(id);
  },

  /**
   * Lấy danh sách lịch sử của người dùng theo user_id, sắp xếp mới nhất trước
   * @param {number} userId
   * @param {object} options { type?: string, limit?: number }
   * @returns {Array<object>}
   */
  findByUserId(userId, options = {}) {
    const { type, limit } = options;
    let sql = `
      SELECT id, user_id, type, input, output, created_at
      FROM history
      WHERE user_id = ?
    `;
    const params = [userId];

    if (type && ["ask", "summarize", "quiz"].includes(type)) {
      sql += " AND type = ?";
      params.push(type);
    }

    sql += " ORDER BY created_at DESC, id DESC";

    if (limit && Number.isInteger(Number(limit)) && Number(limit) > 0) {
      sql += " LIMIT ?";
      params.push(Math.min(Number(limit), 100));
    }

    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * Xóa bản ghi lịch sử đảm bảo thuộc về chính user_id đó
   * @param {number} id
   * @param {number} userId
   * @returns {boolean} true nếu xóa thành công, false nếu không tìm thấy hoặc không thuộc về user
   */
  deleteByIdAndUserId(id, userId) {
    const stmt = db.prepare(`
      DELETE FROM history
      WHERE id = ? AND user_id = ?
    `);
    const result = stmt.run(id, userId);
    return result.changes > 0;
  },
};

export default historyModel;
