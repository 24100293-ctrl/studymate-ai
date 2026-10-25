import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';

describe('BƯỚC 2.4: Kiểm thử toàn diện History API (Jest + Supertest)', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;

  // Dọn dẹp sạch sẽ dữ liệu trước mỗi test case để đảm bảo tính độc lập
  beforeEach(async () => {
    db.prepare('DELETE FROM history').run();
    db.prepare('DELETE FROM users').run();

    // Tạo User 1
    const resUser1 = await request(app).post('/api/auth/register').send({
      name: 'Sinh viên 1',
      email: 'user1@studymate.ai',
      password: 'Password123!',
    });
    user1Token = resUser1.body.data.token;
    user1Id = resUser1.body.data.user.id;

    // Tạo User 2
    const resUser2 = await request(app).post('/api/auth/register').send({
      name: 'Sinh viên 2',
      email: 'user2@studymate.ai',
      password: 'Password456!',
    });
    user2Token = resUser2.body.data.token;
    user2Id = resUser2.body.data.user.id;
  });

  // ----------------------------------------------------------------------------
  // 1. KIỂM THỬ XÁC THỰC KHI TRUY CẬP LỊCH SỬ
  // ----------------------------------------------------------------------------
  test('1. Không có token thì không thể đọc hoặc tạo lịch sử (HTTP 401)', async () => {
    const resGet = await request(app).get('/api/history');
    expect(resGet.status).toBe(401);
    expect(resGet.body.success).toBe(false);

    const resPost = await request(app).post('/api/history').send({
      type: 'ask',
      input: 'Test',
      output: 'Test',
    });
    expect(resPost.status).toBe(401);
    expect(resPost.body.success).toBe(false);
  });

  // ----------------------------------------------------------------------------
  // 2. TẠO BẢN GHI LỊCH SỬ (POST /api/history)
  // ----------------------------------------------------------------------------
  test('2. Người dùng đăng nhập có thể tạo bản ghi lịch sử hợp lệ (HTTP 201)', async () => {
    const historyPayload = {
      type: 'ask',
      input: 'Giải thuật Dijkstra hoạt động như thế nào?',
      output: 'Giải thuật Dijkstra tìm đường đi ngắn nhất từ một đỉnh nguồn đến tất cả các đỉnh còn lại...',
    };

    const res = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(historyPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.user_id).toBe(user1Id);
    expect(res.body.data.type).toBe('ask');
    expect(res.body.data.input).toBe(historyPayload.input);
    expect(res.body.data.output).toBe(historyPayload.output);
    expect(res.body.data).toHaveProperty('created_at');
  });

  test('3. Từ chối loại lịch sử (type) không hợp lệ (HTTP 400)', async () => {
    const res = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'invalid_feature_type',
        input: 'Đầu vào',
        output: 'Đầu ra',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/không hợp lệ/i);
  });

  test('4. Từ chối dữ liệu đầu vào thiếu hoặc rỗng (HTTP 400)', async () => {
    // Thiếu input
    const resNoInput = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'summarize',
        output: 'Chỉ có output',
      });
    expect(resNoInput.status).toBe(400);
    expect(resNoInput.body.message).toMatch(/đầu vào.*không được để trống/i);

    // Thiếu output
    const resNoOutput = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'summarize',
        input: 'Chỉ có input',
      });
    expect(resNoOutput.status).toBe(400);
    expect(resNoOutput.body.message).toMatch(/kết quả.*không được để trống/i);
  });

  // ----------------------------------------------------------------------------
  // 3. LẤY DANH SÁCH LỊCH SỬ (GET /api/history) VÀ BẢO VỆ PHÂN QUYỀN
  // ----------------------------------------------------------------------------
  test('5. GET /api/history chỉ trả về lịch sử thuộc tài khoản đang đăng nhập, sắp xếp mới nhất trước', async () => {
    // Tạo 2 bản ghi cho User 1
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ type: 'ask', input: 'Câu hỏi 1 của User 1', output: 'Đáp án 1' });

    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ type: 'quiz', input: 'Câu hỏi 2 của User 1', output: 'Đáp án 2' });

    // Tạo 1 bản ghi cho User 2
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'summarize', input: 'Bài học của User 2', output: 'Tóm tắt User 2' });

    // User 1 lấy lịch sử
    const resUser1 = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(resUser1.status).toBe(200);
    expect(resUser1.body.success).toBe(true);
    expect(resUser1.body.data).toHaveLength(2);
    // Cả 2 bản ghi đều phải thuộc user1
    resUser1.body.data.forEach((item) => {
      expect(item.user_id).toBe(user1Id);
      expect(item.user_id).not.toBe(user2Id);
    });

    // Bản ghi tạo sau (quiz) phải xuất hiện trước bản ghi tạo trước (ask)
    expect(resUser1.body.data[0].type).toBe('quiz');
    expect(resUser1.body.data[1].type).toBe('ask');

    // User 2 lấy lịch sử
    const resUser2 = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(resUser2.status).toBe(200);
    expect(resUser2.body.data).toHaveLength(1);
    expect(resUser2.body.data[0].user_id).toBe(user2Id);
  });

  test('6. Người dùng không thể đọc lịch sử người khác bằng cách truyền user_id vào query hoặc body', async () => {
    // Tạo dữ liệu cho User 2
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'ask', input: 'Bí mật của User 2', output: 'Lời giải kín' });

    // User 1 cố tình gửi request với query ?user_id=<user2Id>
    const resAttacker = await request(app)
      .get(`/api/history?user_id=${user2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(resAttacker.status).toBe(200);
    // User 1 chưa có lịch sử nào, kết quả PHẢI là mảng rỗng, không được thấy bài của User 2
    expect(resAttacker.body.data).toEqual([]);
  });

  test('7. Hỗ trợ lọc theo loại lịch sử (query ?type=ask)', async () => {
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ type: 'ask', input: 'Hỏi 1', output: 'Đáp 1' });
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ type: 'quiz', input: 'Quiz 1', output: 'Đáp quiz 1' });

    const resFiltered = await request(app)
      .get('/api/history?type=ask')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(resFiltered.status).toBe(200);
    expect(resFiltered.body.data).toHaveLength(1);
    expect(resFiltered.body.data[0].type).toBe('ask');
  });

  // ----------------------------------------------------------------------------
  // 4. XÓA BẢN GHI LỊCH SỬ (DELETE /api/history/:id)
  // ----------------------------------------------------------------------------
  test('8. Người dùng có thể xóa bản ghi lịch sử của chính mình (HTTP 200)', async () => {
    const createRes = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ type: 'ask', input: 'Cần xóa', output: 'Nội dung' });

    const recordId = createRes.body.data.id;

    // Tiến hành xóa
    const deleteRes = await request(app)
      .delete(`/api/history/${recordId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toMatch(/xóa.*thành công/i);

    // Kiểm tra lại danh sách lịch sử sau khi xóa
    const getRes = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(getRes.body.data).toHaveLength(0);
  });

  test('9. Người dùng không thể xóa bản ghi lịch sử của tài khoản khác (HTTP 404)', async () => {
    // User 2 tạo 1 bản ghi
    const createRes = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ type: 'quiz', input: 'Bài quiz của User 2', output: 'Đáp án User 2' });

    const user2RecordId = createRes.body.data.id;

    // User 1 cố tình gọi API xóa bản ghi của User 2
    const attackDeleteRes = await request(app)
      .delete(`/api/history/${user2RecordId}`)
      .set('Authorization', `Bearer ${user1Token}`); // Token của User 1

    expect(attackDeleteRes.status).toBe(404);
    expect(attackDeleteRes.body.success).toBe(false);
    expect(attackDeleteRes.body.message).toMatch(/không tìm thấy.*hoặc.*không có quyền/i);

    // Xác nhận bản ghi của User 2 vẫn an toàn trong database
    const verifyUser2 = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${user2Token}`);
    expect(verifyUser2.body.data).toHaveLength(1);
    expect(verifyUser2.body.data[0].id).toBe(user2RecordId);
  });

  test('10. Xử lý ID không tồn tại hoặc không hợp lệ đúng theo quy ước API', async () => {
    // Trường hợp 1: ID không tồn tại
    const resNotFound = await request(app)
      .delete('/api/history/999999')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(resNotFound.status).toBe(404);
    expect(resNotFound.body.success).toBe(false);

    // Trường hợp 2: ID không phải số (ví dụ chuỗi chữ abc)
    const resInvalidId = await request(app)
      .delete('/api/history/invalid_id_format')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(resInvalidId.status).toBe(400);
    expect(resInvalidId.body.success).toBe(false);
    expect(resInvalidId.body.message).toMatch(/không hợp lệ/i);
  });
});
