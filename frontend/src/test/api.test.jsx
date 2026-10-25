import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { authApi, historyApi, aiApi } from '../services/api.js';

describe('Frontend API Client (fetch wrapper)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Tự động đính kèm Authorization: Bearer <token> khi đã lưu token', async () => {
    localStorage.setItem('studymate_token', 'mock_jwt_token_xyz_123');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        success: true,
        data: { id: 1, name: 'Sinh viên Test', email: 'test@uni.edu.vn' },
      }),
    });

    global.fetch = mockFetch;

    const user = await authApi.getMe();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];

    expect(calledUrl).toContain('/auth/me');
    expect(calledOptions.headers).toHaveProperty('Authorization', 'Bearer mock_jwt_token_xyz_123');
    expect(user.name).toBe('Sinh viên Test');
  });

  test('Tự động kích hoạt sự kiện unauthorized và xóa token khi backend trả về 401', async () => {
    localStorage.setItem('studymate_token', 'expired_token');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn.',
      }),
    });

    global.fetch = mockFetch;

    await expect(authApi.getMe()).rejects.toThrow(/Phiên đăng nhập đã hết hạn/i);
    expect(localStorage.getItem('studymate_token')).toBeNull();
  });
});
