import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint công khai
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint được bảo vệ bằng JWT middleware
router.get('/me', verifyToken, authController.getMe);

export default router;
