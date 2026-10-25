import request from 'supertest';
import app from '../src/app.js';

describe('Bước 2.1: Kiểm tra Backend Skeleton, ES Modules & Jest/Supertest', () => {
  test('GET /api/health trả về 200 và định dạng envelope thành công', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.service).toBe('StudyMate AI Backend API');
  });

  test('Truy cập endpoint không tồn tại trả về 404', async () => {
    const response = await request(app).get('/api/not-found-endpoint');
    expect(response.status).toBe(404);
  });
});
