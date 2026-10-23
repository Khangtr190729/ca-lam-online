import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route đăng ký tài khoản (Public)
router.post('/register', register);

// Route đăng nhập tài khoản (Public)
router.post('/login', login);

// Route lấy thông tin cá nhân hiện tại (Yêu cầu đăng nhập - Token)
router.get('/me', protect, getMe);

export default router;
