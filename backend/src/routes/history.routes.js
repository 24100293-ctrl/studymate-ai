import { Router } from 'express';
import historyController from '../controllers/history.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = Router();

// Toàn bộ các endpoint lịch sử bắt buộc phải được bảo vệ bằng JWT middleware
router.use(verifyToken);

// GET /api/history - Lấy danh sách lịch sử của người dùng
router.get('/', historyController.getAll);

// POST /api/history - Lưu bản ghi lịch sử mới
router.post('/', historyController.create);

// DELETE /api/history/:id - Xóa bản ghi lịch sử cá nhân
router.delete('/:id', historyController.deleteById);

export default router;
