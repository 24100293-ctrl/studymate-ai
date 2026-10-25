import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = Router();

// Toàn bộ các API AI bắt buộc phải được bảo vệ bằng JWT middleware
router.use(verifyToken);

// POST /api/ai/ask - Hỏi đáp kiến thức học tập
router.post('/ask', aiController.ask);

// POST /api/ai/summarize - Tóm tắt bài học
router.post('/summarize', aiController.summarize);

// POST /api/ai/quiz - Tạo câu hỏi trắc nghiệm ôn tập
router.post('/quiz', aiController.quiz);

export default router;
