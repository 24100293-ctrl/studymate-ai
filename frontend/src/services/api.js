const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Hàm gọi API chung bằng fetch có tự động gắn token xác thực
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('studymate_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error('Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra server đang chạy tại ' + API_BASE_URL);
  }

  let result = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    result = await response.json();
  }

  // Xử lý khi Backend trả về mã lỗi HTTP (400, 401, 403, 404, 500...)
  if (!response.ok) {
    // Nếu token hết hạn hoặc không hợp lệ (401), phát sự kiện tự động đăng xuất
    if (response.status === 401) {
      localStorage.removeItem('studymate_token');
      window.dispatchEvent(new Event('studymate:unauthorized'));
    }

    const errorMessage = result?.message || `Lỗi máy chủ (${response.status}): ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = result;
    throw error;
  }

  return result?.data !== undefined ? result.data : result;
}

// ----------------------------------------------------------------------------
// 1. NHÓM API XÁC THỰC (AUTHENTICATION)
// ----------------------------------------------------------------------------
export const authApi = {
  async register(name, email, password) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe() {
    return await request('/auth/me', {
      method: 'GET',
    });
  },
};

// ----------------------------------------------------------------------------
// 2. NHÓM API TRỢ LÝ HỌC TẬP AI
// ----------------------------------------------------------------------------
export const aiApi = {
  async ask(question, context = '') {
    return await request('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  },

  async summarize(content, length = 'medium') {
    return await request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content, length }),
    });
  },

  async quiz(topic, numQuestions = 3) {
    return await request('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, numQuestions }),
    });
  },
};

// ----------------------------------------------------------------------------
// 3. NHÓM API LỊCH SỬ HỌC TẬP (HISTORY)
// ----------------------------------------------------------------------------
export const historyApi = {
  async getAll(type = null, limit = null) {
    const params = new URLSearchParams();
    if (type && type !== 'all') params.append('type', type);
    if (limit) params.append('limit', limit);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return await request(`/history${queryStr}`, {
      method: 'GET',
    });
  },

  async create(type, input, output) {
    return await request('/history', {
      method: 'POST',
      body: JSON.stringify({ type, input, output }),
    });
  },

  async delete(id) {
    return await request(`/history/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authApi,
  ai: aiApi,
  history: historyApi,
};
