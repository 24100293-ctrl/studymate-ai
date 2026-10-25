import { verifyJwtToken } from '../utils/jwt.helper.js';
import userModel from '../models/user.model.js';

/**
 * Middleware xác thực Bearer Token JWT
 * Bảo vệ các endpoint riêng tư và gán thông tin user hợp lệ vào req.user
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối: Vui lòng cung cấp token xác thực hợp lệ dạng Bearer.',
    });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Truy cập bị từ chối: Token không được để trống.',
    });
  }

  try {
    // 1. Xác minh chữ ký và thời hạn token
    const decoded = verifyJwtToken(token);

    // 2. Không tin tưởng dữ liệu client tự gửi, kiểm tra ID từ token vào database
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Token không chứa định danh người dùng hợp lệ.',
      });
    }

    const user = userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản người dùng liên kết với token này không tồn tại hoặc đã bị xóa.',
      });
    }

    // 3. Gán user đã xác minh vào request (không bao gồm password_hash)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token xác thực không hợp lệ.',
    });
  }
}

export default verifyToken;
