# Quy Chuẩn Làm Việc Với Git & Hợp Nhất Mã Nguồn (Git Workflow)

> **Dành cho**: Cả 4 thành viên nhóm StudyMate AI  
> **Người phụ trách tích hợp & review**: Person 4  

---

## 1. Mô Hình Nhánh (Branching Strategy)

Nhóm áp dụng mô hình Git Feature Branch đơn giản, tránh ghi đè trực tiếp lên nhánh chính:

```
[main]       ───────────────────────● (Bản nộp cuối kỳ / demo ổn định)
               ▲
               │ (Merge khi kết thúc mỗi milestone)
[develop]    ──●────────────●───────● (Nhánh tích hợp chung)
                 \         /
[feat/auth]       ●───────●           (Person 4: Xác thực & Quản lý user)
                   \     /
[feat/ai-chat]      ●───●             (Person 1: Giao diện & tính năng Chat AI)
```

### Quy ước đặt tên nhánh:
- `main`: Nhánh ổn định cao nhất, chỉ merge khi tính năng đã qua kiểm thử và hoạt động trơn tru.
- `develop`: Nhánh làm việc chung. Mọi người đều rẽ nhánh từ `develop` và tạo Pull Request (PR) về `develop`.
- Nhánh tính năng mới: `feat/<tên-tính-năng>` (ví dụ: `feat/auth`, `feat/ai-ask`, `feat/quiz-ui`, `feat/history-page`).
- Nhánh sửa lỗi: `fix/<tên-lỗi>` (ví dụ: `fix/cors-issue`, `fix/login-redirect`).
- Nhánh tài liệu: `docs/<tên-tài-liệu>` (ví dụ: `docs/api-update`).

---

## 2. Quy Trình 6 Bước Khi Phát Triển Một Tính Năng Mới

### Bước 1: Luôn cập nhật mã nguồn mới nhất từ `develop`
Trước khi bắt đầu code một tính năng mới, hãy chuyển về nhánh `develop` và kéo code mới nhất về:
```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo nhánh mới cho tính năng của bạn
```bash
git checkout -b feat/ten-tinh-nang
# Ví dụ: git checkout -b feat/ai-chat
```

### Bước 3: Viết code và commit thường xuyên với thông điệp rõ ràng
Quy ước viết commit:
- `feat: thêm form đăng nhập ở frontend`
- `feat: tích hợp API Gemini tóm tắt văn bản`
- `fix: sửa lỗi token không tự đính kèm vào header`
- `docs: bổ sung hướng dẫn chạy test`

Lệnh commit:
```bash
git add .
git commit -m "feat: mô tả ngắn gọn công việc vừa làm"
```

### Bước 4: Đẩy nhánh của bạn lên GitHub
```bash
git push origin feat/ten-tinh-nang
```

### Bước 5: Mở Pull Request (PR) trên GitHub
- Truy cập vào repository GitHub của nhóm.
- Nhấn **New Pull Request**.
- Chọn: **Base: `develop`** $\leftarrow$ **Compare: `feat/ten-tinh-nang`**.
- Ghi rõ những gì bạn đã làm, đã test chưa, và gắn tag Person 4 vào mục **Reviewers**.

### Bước 6: Review và Hợp nhất (Merge)
- **Person 4** sẽ kiểm tra mã nguồn (chạy thử test, kiểm tra không có file `.env` hay database rác).
- Nếu không có xung đột (conflict) và code chạy tốt, Person 4 sẽ thực hiện **Squash and Merge** vào nhánh `develop`.
- Sau khi merge, xóa nhánh `feat/...` cũ trên GitHub để giữ repo gọn gàng.

---

## 3. Cách Xử Lý Khi Bị Xung Đột Code (Merge Conflict)

Nếu nhánh của bạn bị conflict với `develop`, bạn tự giải quyết trên máy mình trước khi nhờ Person 4 merge:

1. Chuyển về nhánh tính năng của bạn:
   ```bash
   git checkout feat/ten-tinh-nang
   ```
2. Kéo code mới nhất từ `develop` vào nhánh của bạn:
   ```bash
   git merge develop
   ```
3. VS Code sẽ hiển thị các file bị xung đột (màu đỏ). Mở từng file, chọn giữ lại code phù hợp (Current Change, Incoming Change, hoặc kết hợp cả hai).
4. Sau khi sửa xong:
   ```bash
   git add .
   git commit -m "fix: giải quyết xung đột với nhánh develop"
   git push origin feat/ten-tinh-nang
   ```

---

## 4. Những Điều Tuyệt Đối CẤM Khi Dùng Git

1. ❌ **KHÔNG BAO GIỜ commit trực tiếp lên nhánh `main`**.
2. ❌ **KHÔNG BAO GIỜ commit file `.env`** chứa API Key thật hoặc JWT Secret.
3. ❌ **KHÔNG BAO GIỜ commit thư mục `node_modules`** hoặc file database thật (`*.db`).
4. ❌ **KHÔNG DÙNG lệnh `git push --force`** lên nhánh `develop` hoặc `main` vì sẽ làm mất code của thành viên khác.
