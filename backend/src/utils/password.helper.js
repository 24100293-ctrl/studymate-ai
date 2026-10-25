import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Băm mật khẩu thô bằng bcryptjs
 * @param {string} password Mật khẩu gốc người dùng nhập
 * @returns {Promise<string>} Chuỗi hash an toàn
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * So khớp mật khẩu thô với chuỗi hash đã lưu trong database
 * @param {string} password Mật khẩu người dùng nhập khi login
 * @param {string} hash Chuỗi password_hash từ database
 * @returns {Promise<boolean>} true nếu khớp, false nếu sai
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
