# Tài Liệu Đặc Tả API (API Specifications) - StudyMate AI

> **Dành cho**: Cả 4 thành viên nhóm StudyMate AI  
> **Base URL**: `http://localhost:5000/api`  
> **Định dạng dữ liệu**: `application/json` (trừ khi có ghi chú khác)  

---

## 1. Quy Chuẩn Chung Về Request & Response

### 1.1. Header Xác Thực
Mọi endpoint có ghi chú **"Yêu cầu xác thực: Có"** bắt buộc phải đính kèm Header HTTP:
```http
Authorization: Bearer <access_token>
```
Nếu thiếu header hoặc token không hợp lệ / hết hạn, server sẽ trả về mã `401 Unauthorized`.

### 1.2. Định Dạng Phản Hồi Thành Công (Standard Success Envelope)
```json
{
  "success": true,
  "data": { ... } // hoặc mảng [ ... ]
}
```

### 1.3. Định Dạng Phản Hồi Thất Bại (Standard Error Envelope)
```json
{
  "success": false,
  "message": "Mô tả nguyên nhân lỗi bằng tiếng Việt hoặc tiếng Anh rõ ràng"
}
```

### 1.4. Bảng Mã Lỗi HTTP Quy Chuẩn
| HTTP Code | Ý nghĩa | Khi nào áp dụng |
| :--- | :--- | :--- |
| `200 OK` | Thành công | Dành cho các request GET, PUT, DELETE thành công. |
| `201 Created` | Tạo mới thành công | Dành cho `POST /register`, `POST /history` khi tạo bản ghi mới. |
| `400 Bad Request` | Dữ liệu không hợp lệ | Thiếu trường bắt buộc (ví dụ thiếu email, password, input trống). |
| `401 Unauthorized` | Chưa xác thực | Không gửi token, token sai hoặc token đã hết hạn. |
| `403 Forbidden` | Không có quyền | Cố tình thao tác trên tài nguyên của người khác (ví dụ xóa lịch sử của user khác). |
| `404 Not Found` | Không tìm thấy | Bản ghi không tồn tại trong database hoặc sai URL endpoint. |
| `500 Server Error` | Lỗi máy chủ | Lỗi SQLite, lỗi kết nối Gemini API ngoài tầm kiểm soát. |

---

## 2. Danh Sách Chi Tiết Các Endpoint

### 2.1. Nhóm Xác Thực Người Dùng (`/api/auth`)

#### 1. Đăng ký tài khoản (`POST /api/auth/register`)
- **Yêu cầu xác thực**: Không
- **Request Body**:
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "Password123@"
}
```
- **Response thành công (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "created_at": "2026-10-24 15:30:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Response lỗi (`400 Bad Request`)**:
```json
{
  "success": false,
  "message": "Email này đã được đăng ký tài khoản."
}
```

---

#### 2. Đăng nhập (`POST /api/auth/login`)
- **Yêu cầu xác thực**: Không
- **Request Body**:
```json
{
  "email": "nguyenvana@example.com",
  "password": "Password123@"
}
```
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "created_at": "2026-10-24 15:30:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Response lỗi (`400 Bad Request` hoặc `401 Unauthorized`)**:
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không chính xác."
}
```

---

#### 3. Lấy thông tin tài khoản hiện tại (`GET /api/auth/me`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Request Body**: Trống
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "created_at": "2026-10-24 15:30:00"
  }
}
```

---

### 2.2. Nhóm Tính Năng Trợ Lý Học Tập AI (`/api/ai`)
> **Lưu ý quan trọng cho Person 1, 2, 3**: Frontend chỉ gọi đến các API này của Backend. Backend sẽ tự động lấy API Key bí mật để gọi sang Google Gemini và trả kết quả về.

#### 4. Hỏi đáp kiến thức học tập (`POST /api/ai/ask`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Request Body**:
```json
{
  "question": "Giải thích giúp tôi giải thuật Binary Search bằng ví dụ trực quan?",
  "context": "Môn học Cấu trúc dữ liệu và giải thuật" // tùy chọn (optional)
}
```
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "answer": "Binary Search (Tìm kiếm nhị phân) là giải thuật tìm kiếm trên một mảng ĐÃ ĐƯỢC SẮP XẾP...",
    "type": "ask"
  }
}
```

---

#### 5. Tóm tắt nội dung bài học (`POST /api/ai/summarize`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Request Body**:
```json
{
  "content": "Nội dung văn bản hoặc bài giảng cần tóm tắt dài khoảng 500 - 2000 từ...",
  "length": "short" // 'short' (ngắn gọn) | 'medium' (vừa) | 'detailed' (chi tiết) - mặc định 'medium'
}
```
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "summary": "1. Điểm cốt lõi thứ nhất...\n2. Điểm cốt lõi thứ hai...\n3. Kết luận...",
    "type": "summarize"
  }
}
```

---

#### 6. Sinh câu hỏi trắc nghiệm ôn tập (`POST /api/ai/quiz`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Request Body**:
```json
{
  "topic": "Lập trình mạng và giao thức HTTP/HTTPS",
  "numQuestions": 3 // số lượng câu hỏi mong muốn (mặc định 3, tối đa 10)
}
```
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "topic": "Lập trình mạng và giao thức HTTP/HTTPS",
    "questions": [
      {
        "id": 1,
        "question": "Mã trạng thái HTTP nào biểu thị tài nguyên được tạo thành công?",
        "options": ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
        "answerIndex": 1,
        "explanation": "Mã 201 Created được dùng khi một tài nguyên mới được tạo thành công trên máy chủ."
      }
    ],
    "type": "quiz"
  }
}
```

---

### 2.3. Nhóm Lịch Sử Học Tập (`/api/history`)
> **Nguyên tắc bảo mật**:
> 1. Frontend KHÔNG gửi `user_id` trong body hay params.
> 2. Backend lấy `user_id` từ token đã xác thực (`req.user.id`).
> 3. Người dùng chỉ xem và thao tác trên lịch sử của chính mình.

#### 7. Lấy danh sách lịch sử (`GET /api/history`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Query Params**:
  - `type`: lọc theo `ask`, `summarize`, hoặc `quiz` (tùy chọn)
  - `limit`: số lượng bản ghi (mặc định 20, tối đa 100)
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "user_id": 1,
      "type": "ask",
      "input": "Giải thích giúp tôi giải thuật Binary Search...",
      "output": "Binary Search (Tìm kiếm nhị phân) là...",
      "created_at": "2026-10-24 15:45:00"
    }
  ]
}
```

---

#### 8. Lưu một bản ghi lịch sử mới (`POST /api/history`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **Request Body**:
```json
{
  "type": "ask", // 'ask' | 'summarize' | 'quiz'
  "input": "Câu hỏi hoặc văn bản đầu vào",
  "output": "Câu trả lời của Gemini AI hoặc kết quả JSON chuỗi"
}
```
- **Response thành công (`201 Created`)**:
```json
{
  "success": true,
  "data": {
    "id": 11,
    "user_id": 1,
    "type": "ask",
    "input": "Câu hỏi hoặc văn bản đầu vào",
    "output": "Câu trả lời của Gemini AI hoặc kết quả JSON chuỗi",
    "created_at": "2026-10-24 15:50:00"
  }
}
```

---

#### 9. Xóa một bản ghi lịch sử (`DELETE /api/history/:id`)
- **Yêu cầu xác thực**: **Có** (Bearer Token)
- **URL Params**: `:id` (ID của bản ghi lịch sử cần xóa)
- **Quy tắc bảo mật**: Backend thực thi câu lệnh:
  `DELETE FROM history WHERE id = ? AND user_id = ?`
  Nếu bản ghi không tồn tại hoặc không thuộc về user đang đăng nhập, trả về lỗi `404 Not Found` hoặc `403 Forbidden`.
- **Response thành công (`200 OK`)**:
```json
{
  "success": true,
  "message": "Đã xóa bản ghi lịch sử thành công."
}
```
- **Response lỗi (`404 Not Found`)**:
```json
{
  "success": false,
  "message": "Không tìm thấy bản ghi lịch sử hoặc bạn không có quyền xóa."
}
```
