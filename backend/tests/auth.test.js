import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../src/utils/jwt.helper.js';

describe('BƯỚC 2.3: Kiểm thử toàn diện Authentication API (Jest + Supertest)', () => {
  // Dọn dẹp dữ liệu bảng users trước mỗi test case để đảm bảo tính độc lập
  beforeEach(() => {
    db.prepare('DELETE FROM users').run();
  });

  const validUserData = {
    name: 'Nguyễn Văn A',
    email: 'sinhvien.a@university.edu.vn',
    password: 'SecurePassword123!',
  };

  // ----------------------------------------------------------------------------
  // 1. KIỂM THỬ ĐĂNG KÝ (POST /api/auth/register)
  // ----------------------------------------------------------------------------
  describe('POST /api/auth/register', () => {
    test('1. Đăng ký tài khoản hợp lệ thành công trả về 201 và JWT token', async () => {
      const res = await request(app).post('/api/auth/register').send(validUserData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.name).toBe(validUserData.name);
      expect(res.body.data.user.email).toBe(validUserData.email.toLowerCase());
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('created_at');

      // 10. Đảm bảo phản hồi không chứa password hay password_hash
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    test('2. Mật khẩu lưu trong database phải được băm an toàn bằng bcryptjs', async () => {
      await request(app).post('/api/auth/register').send(validUserData);

      const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(validUserData.email.toLowerCase());
      expect(dbUser).toBeDefined();
      expect(dbUser.password_hash).toBeDefined();
      // Chuỗi hash của bcrypt luôn bắt đầu bằng $2a$ hoặc $2b$ và không bao giờ bằng mật khẩu gốc
      expect(dbUser.password_hash).toMatch(/^\$2[ab]\$\d+\$/);
      expect(dbUser.password_hash).not.toBe(validUserData.password);
    });

    test('3. Từ chối dữ liệu đăng ký thiếu trường hoặc không hợp lệ (HTTP 400)', async () => {
      // Thiếu name
      const resNoName = await request(app).post('/api/auth/register').send({
        email: 'noname@test.com',
        password: 'Password123!',
      });
      expect(resNoName.status).toBe(400);
      expect(resNoName.body.success).toBe(false);

      // Email sai định dạng
      const resBadEmail = await request(app).post('/api/auth/register').send({
        name: 'Bad Email User',
        email: 'invalid-email-format',
        password: 'Password123!',
      });
      expect(resBadEmail.status).toBe(400);
      expect(resBadEmail.body.message).toMatch(/email không hợp lệ/i);

      // Mật khẩu ngắn hơn 6 ký tự
      const resShortPass = await request(app).post('/api/auth/register').send({
        name: 'Short Password User',
        email: 'shortpass@test.com',
        password: '123',
      });
      expect(resShortPass.status).toBe(400);
      expect(resShortPass.body.message).toMatch(/tối thiểu từ 6 ký tự/i);
    });

    test('4. Từ chối đăng ký khi email đã tồn tại (HTTP 400)', async () => {
      // Đăng ký lần 1
      await request(app).post('/api/auth/register').send(validUserData);

      // Đăng ký lần 2 với cùng email (thử cả viết hoa để kiểm tra tính năng chuẩn hóa)
      const resDuplicate = await request(app).post('/api/auth/register').send({
        name: 'Người Khác',
        email: validUserData.email.toUpperCase(),
        password: 'OtherPassword456!',
      });

      expect(resDuplicate.status).toBe(400);
      expect(resDuplicate.body.success).toBe(false);
      expect(resDuplicate.body.message).toMatch(/đã được đăng ký/i);
    });
  });

  // ----------------------------------------------------------------------------
  // 2. KIỂM THỬ ĐĂNG NHẬP (POST /api/auth/login)
  // ----------------------------------------------------------------------------
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Tạo sẵn 1 user mẫu cho các test đăng nhập
      await request(app).post('/api/auth/register').send(validUserData);
    });

    test('5. Đăng nhập đúng thông tin thành công và nhận JWT hợp lệ (HTTP 200)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUserData.email,
        password: validUserData.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe(validUserData.email.toLowerCase());
      expect(res.body.data.user.password_hash).toBeUndefined();

      // Kiểm tra token có thể giải mã và chứa đúng user id
      const decoded = jwt.decode(res.body.data.token);
      expect(decoded).toHaveProperty('id', res.body.data.user.id);
      expect(decoded).toHaveProperty('email', validUserData.email.toLowerCase());
    });

    test('6. Đăng nhập sai thông tin trả về 401 và không tiết lộ email có tồn tại hay không', async () => {
      // Trường hợp 1: Sai mật khẩu
      const resWrongPass = await request(app).post('/api/auth/login').send({
        email: validUserData.email,
        password: 'IncorrectPassword999!',
      });
      expect(resWrongPass.status).toBe(401);
      expect(resWrongPass.body.success).toBe(false);
      expect(resWrongPass.body.message).toBe('Email hoặc mật khẩu không chính xác.');

      // Trường hợp 2: Email không tồn tại
      const resWrongEmail = await request(app).post('/api/auth/login').send({
        email: 'does_not_exist@university.edu.vn',
        password: validUserData.password,
      });
      expect(resWrongEmail.status).toBe(401);
      expect(resWrongEmail.body.success).toBe(false);
      // Thông báo lỗi phải giống hệt trường hợp sai mật khẩu để bảo mật
      expect(resWrongEmail.body.message).toBe('Email hoặc mật khẩu không chính xác.');
    });
  });

  // ----------------------------------------------------------------------------
  // 3. KIỂM THỬ XÁC THỰC HIỆN TẠI (GET /api/auth/me) VÀ MIDDLEWARE BẢO MẬT
  // ----------------------------------------------------------------------------
  describe('GET /api/auth/me & verifyToken Middleware', () => {
    let validToken;
    let registeredUser;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send(validUserData);
      validToken = registerRes.body.data.token;
      registeredUser = registerRes.body.data.user;
    });

    test('7. /api/auth/me trả về thông tin người dùng chính xác khi có Bearer token hợp lệ (HTTP 200)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(registeredUser.id);
      expect(res.body.data.name).toBe(registeredUser.name);
      expect(res.body.data.email).toBe(registeredUser.email);
      expect(res.body.data.password_hash).toBeUndefined();
    });

    test('8. /api/auth/me từ chối truy cập khi không gửi header token (HTTP 401)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Vui lòng cung cấp token/i);
    });

    test('9. Từ chối token giả mạo, sai chữ ký hoặc token đã hết hạn (HTTP 401)', async () => {
      // Trường hợp 1: Token sai chữ ký bí mật
      const fakeToken = jwt.sign({ id: registeredUser.id }, 'wrong_secret_key');
      const resFake = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(resFake.status).toBe(401);
      expect(resFake.body.success).toBe(false);
      expect(resFake.body.message).toMatch(/không hợp lệ/i);

      // Trường hợp 2: Token đã hết hạn (expiresIn: 0s)
      const secret = getJwtSecret();
      const expiredToken = jwt.sign({ id: registeredUser.id }, secret, { expiresIn: '0s' });
      const resExpired = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(resExpired.status).toBe(401);
      expect(resExpired.body.success).toBe(false);
      expect(resExpired.body.message).toMatch(/đã hết hạn/i);
    });

    test('10. Không tin tưởng dữ liệu user_id do client tự gửi; định danh luôn lấy từ token', async () => {
      // Giả sử có một user thứ hai
      const user2Res = await request(app).post('/api/auth/register').send({
        name: 'Sinh viên B',
        email: 'sinhvien.b@university.edu.vn',
        password: 'PasswordB456!',
      });
      const user2Id = user2Res.body.data.user.id;

      // User 1 gửi request nhưng cố tình truyền kèm user_id của User 2 trong query / body
      const res = await request(app)
        .get('/api/auth/me?user_id=' + user2Id)
        .send({ user_id: user2Id })
        .set('Authorization', `Bearer ${validToken}`); // Token của User 1

      expect(res.status).toBe(200);
      // Kết quả PHẢI là User 1, bỏ qua hoàn toàn user_id client mạo danh
      expect(res.body.data.id).toBe(registeredUser.id);
      expect(res.body.data.id).not.toBe(user2Id);
    });

    test('11. Báo lỗi cấu hình rõ ràng khi JWT_SECRET chưa được thiết lập hoặc dùng secret không an toàn', () => {
      const originalSecret = process.env.JWT_SECRET;
      try {
        // Giả lập biến JWT_SECRET bị thiếu
        delete process.env.JWT_SECRET;
        expect(() => getJwtSecret()).toThrow(/chưa được thiết lập/i);

        // Giả lập biến JWT_SECRET đang dùng giá trị mẫu chưa đổi
        process.env.JWT_SECRET = 'YOUR_JWT_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION';
        expect(() => getJwtSecret()).toThrow(/đang sử dụng giá trị mẫu/i);
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});
