# StudyMate AI – Nền tảng trợ lý học tập thông minh

## 1. Giới thiệu dự án

StudyMate AI là ứng dụng web hỗ trợ sinh viên học tập thông minh. Ứng dụng hướng đến việc giúp người học tiếp cận kiến thức, ôn tập bài học và luyện tập thông qua các tính năng sử dụng trí tuệ nhân tạo.

Đây là đồ án môn học **Lập trình Web Nâng Cao**.

## 2. Công nghệ sử dụng

- **Frontend:** React
- **Backend:** Node.js và Express
- **Cơ sở dữ liệu:** SQLite
- **Trí tuệ nhân tạo:** Google Gemini API
- **Kiến trúc:** Client–Server

## 3. Chức năng chính

### 3.1. Hỏi đáp kiến thức
Hỗ trợ người học tìm hiểu khái niệm, giải đáp câu hỏi và tham khảo lời giải bài tập thông qua Gemini AI.

### 3.2. Tóm tắt bài học
Hỗ trợ tóm tắt nội dung học tập để người dùng dễ dàng nắm bắt những kiến thức trọng tâm.

### 3.3. Tạo câu hỏi trắc nghiệm
Hỗ trợ tạo câu hỏi trắc nghiệm để người học tự kiểm tra và ôn tập kiến thức.

## 4. Kiến trúc hệ thống

Ứng dụng được tổ chức theo mô hình Client–Server:

- **Client:** Giao diện React, tiếp nhận thao tác từ người dùng và hiển thị kết quả.
- **Server:** Node.js và Express xử lý các yêu cầu từ client.
- **Database:** SQLite lưu trữ dữ liệu của ứng dụng.
- **AI Service:** Gemini API hỗ trợ các chức năng học tập sử dụng trí tuệ nhân tạo.

## 5. Yêu cầu trước khi chạy

Cần chuẩn bị:

- Node.js và npm.
- API key của Google Gemini nếu sử dụng các chức năng AI.
- Các gói phụ thuộc được khai báo trong dự án.

## 6. Cài đặt và chạy dự án

Các lệnh chính xác phụ thuộc vào cấu trúc thư mục và cấu hình của dự án.

1. Mở thư mục dự án trong VS Code.
2. Cài đặt các gói phụ thuộc theo file `package.json` tương ứng.
3. Cấu hình API key trong file môi trường theo hướng dẫn của dự án.
4. Khởi chạy frontend và backend theo các script đã khai báo.
5. Mở địa chỉ localhost được hiển thị trong terminal để sử dụng ứng dụng.

**Lưu ý:** Không đưa API key, mật khẩu hoặc thông tin bí mật vào README hay kho mã nguồn công khai.

## 7. Mục tiêu dự án

- Xây dựng ứng dụng web hỗ trợ học tập.
- Áp dụng kiến trúc Client–Server.
- Thực hành phát triển frontend và backend.
- Tích hợp dịch vụ AI vào ứng dụng web.
- Rèn luyện kỹ năng xây dựng, kiểm thử và quản lý mã nguồn.

## 8. Trạng thái dự án

Dự án được phát triển trong khuôn khổ môn học Lập trình Web Nâng Cao. Các chức năng và hướng dẫn sử dụng sẽ được cập nhật theo tiến độ triển khai thực tế.
