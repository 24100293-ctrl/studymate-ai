import userModel from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.helper.js';
import { signToken } from '../utils/jwt.helper.js';

// Regex chuẩn kiểm tra định dạng email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authController = {
  /**
   * Đăng ký tài khoản người dùng mới
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // 1. Kiểm tra các trường bắt buộc
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp họ và tên hợp lệ.',
        });
      }

      if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp địa chỉ email.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng email không hợp lệ.',
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mật khẩu.',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.',
        });
      }

      // 2. Kiểm tra email đã được đăng ký chưa
      const existingUser = userModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được đăng ký tài khoản.',
        });
      }

      // 3. Băm mật khẩu bằng bcryptjs trước khi lưu
      const passwordHash = await hashPassword(password);

      // 4. Lưu người dùng vào database SQLite
      const newUser = userModel.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      });

      // 5. Ký phát hành JWT Token
      const token = signToken({
        id: newUser.id,
        email: newUser.email,
      });

      // 6. Phản hồi thành công (đảm bảo không bao giờ trả về password_hash)
      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            created_at: newUser.created_at,
          },
          token,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ trong quá trình đăng ký: ' + error.message,
      });
    }
  },

  /**
   * Đăng nhập tài khoản
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ email và mật khẩu.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // 1. Tìm tài khoản theo email
      const user = userModel.findByEmail(normalizedEmail);

      // Thông báo lỗi chung: không tiết lộ email có tồn tại hay không vì lý do an toàn bảo mật
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        });
      }

      // 2. So khớp mật khẩu với hash đã lưu
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác.',
        });
      }

      // 3. Ký phát hành JWT Token
      const token = signToken({
        id: user.id,
        email: user.email,
      });

      // 4. Phản hồi thành công
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
          },
          token,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ trong quá trình đăng nhập: ' + error.message,
      });
    }
  },

  /**
   * Lấy thông tin người dùng đang đăng nhập
   * GET /api/auth/me
   */
  async getMe(req, res) {
    // req.user đã được nạp an toàn từ middleware verifyToken
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  },
};

export default authController;
