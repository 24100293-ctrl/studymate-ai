import jwt from 'jsonwebtoken';

/**
 * Lấy JWT Secret từ biến môi trường và kiểm tra tính an toàn
 * @returns {string}
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '' || secret === 'YOUR_JWT_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION') {
    throw new Error(
      'Lỗi cấu hình hệ thống: JWT_SECRET chưa được thiết lập hoặc đang sử dụng giá trị mẫu trong .env. Vui lòng cấu hình JWT_SECRET an toàn.'
    );
  }
  return secret;
}

/**
 * Ký tạo Access Token JWT
 * @param {object} payload Thông tin đưa vào token (ví dụ { id, email })
 * @returns {string} Chuỗi JWT
 */
export function signToken(payload) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Xác minh tính hợp lệ và giải mã token JWT
 * @param {string} token Chuỗi token
 * @returns {object} Payload đã giải mã
 */
export function verifyJwtToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}
