# StudyMate AI - Nền Tảng Trợ Lý Học Tập Thông Minh

> **Đồ án môn học**: Lập trình Web Nâng Cao  
> **Kiến trúc**: Client-Server (Frontend React + Backend Node.js Express)  
> **Cơ sở dữ liệu**: SQLite  
> **Trí tuệ nhân tạo**: Google Gemini API  

---

## 1. Giới Thiệu Dự Án

**StudyMate AI** là một ứng dụng web hỗ trợ sinh viên học tập thông minh. Ứng dụng cung cấp các tính năng trọng tâm:
- **Hỏi đáp kiến thức**: Giải đáp các khái niệm, bài tập thông qua Gemini AI.
- **Tóm tắt bài học**: Chắt lọc kiến thức cốt lõi từ các tài liệu hoặc bài giảng dài.
- **Tạo câu hỏi trắc nghiệm ôn tập**: Sinh ngẫu nhiên các câu hỏi trắc nghiệm kèm giải thích chi tiết theo từng chủ đề môn học.
- **Lưu trữ lịch sử học tập**: Tự động lưu lại các phiên hỏi đáp, tóm tắt và quiz vào cơ sở dữ liệu cá nhân của từng sinh viên.

---

## 2. Phân Công Trách Nhiệm Trong Nhóm

| Thành viên | Phụ trách | Phạm vi công việc |
| :--- | :--- | :--- |
| **Person 1** | Chat AI & Hỏi đáp | Giao diện Chat, xử lý luồng gửi câu hỏi và nhận phản hồi |
| **Person 2** | Tóm tắt bài học | Giao diện Upload/Nhập văn bản, cấu hình độ dài tóm tắt |
| **Person 3** | Trắc nghiệm (Quiz) | Giao diện làm bài trắc nghiệm, tính điểm và chấm bài |
| **Person 4** (Trưởng nhóm kỹ thuật) | Auth, Tích hợp, Test, Deploy, Docs | Xác thực JWT, cấu hình SQLite, middleware, kết nối Gemini backend, Jest/Supertest, tài liệu nhóm |

---

## 3. Công Nghệ Sử Dụng

- **Frontend**: React (JavaScript), Vite, Axios, React Router DOM, Lucide Icons.
- **Backend**: Node.js, Express (ES Modules), SQLite (`better-sqlite3`), BcryptJS, JSON Web Token (JWT).
- **AI Service**: Google Gemini API (gọi độc quyền và bảo mật tại Backend qua `@google/genai`).
- **Kiểm thử tự động**: Jest, Supertest.

---

## 4. Yêu Cầu Môi Trường Cài Đặt

Trước khi chạy dự án, hãy đảm bảo máy tính đã cài đặt:
1. **Node.js**: Phiên bản `>= 18.0.0` (Khuyến nghị phiên bản LTS `v20.x` hoặc `v24.x`).
2. **npm**: Phiên bản `>= 9.x` (đi kèm sẵn với Node.js).
3. **Git**: Phiên bản mới nhất để quản lý phiên bản.

Kiểm tra bằng terminal:
```bash
node -v
npm -v
git --version
```

---

## 5. Hướng Dẫn Thiết Lập & Khởi Chạy Dự Án (Sau Khi Hoàn Tất Cài Đặt)

### Bước 1: Clone mã nguồn về máy
```bash
git clone <URL_REPOSITORY_GITHUB>
cd studymate-ai
```

### Bước 2: Thiết lập Backend
```bash
cd backend
# 1. Cài đặt các thư viện cần thiết (khi đến Giai đoạn 2)
npm install

# 2. Tạo file biến môi trường từ mẫu
cp .env.example .env
# (Trên Windows PowerShell: Copy-Item .env.example .env)

# 3. Mở file .env và điền:
# - Tạo mã JWT_SECRET ngẫu nhiên bằng lệnh:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - Điền GEMINI_API_KEY lấy từ Google AI Studio

# 4. Khởi chạy server backend ở chế độ phát triển
npm run dev
# Server lắng nghe tại http://localhost:5000
```

### Bước 3: Thiết lập Frontend
Mở một cửa sổ terminal mới:
```bash
cd frontend
# 1. Cài đặt thư viện frontend
npm install

# 2. Khởi chạy giao diện React với Vite
npm run dev
# Mở trình duyệt tại http://localhost:5173
```

### Bước 4: Chạy kiểm thử tự động (Testing)
Tại thư mục `backend/`:
```bash
npm test
```

---

## 6. Tài Liệu Tham Khảo Dành Cho Thành Viên Nhóm

- [Đặc tả toàn bộ API Contract (Request / Response / Error Codes)](file:///docs/api-specs.md)
- [Quy chuẩn làm việc nhóm với Git & Pull Request](file:///docs/git-workflow.md)
- [Cơ sở dữ liệu SQLite Schema](file:///docs/database-schema.sql)
