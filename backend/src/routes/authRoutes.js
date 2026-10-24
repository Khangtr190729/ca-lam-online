import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPasswordWithOtp,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route đăng ký tài khoản (Public)
router.post('/register', register);

// Route đăng nhập tài khoản (Public)
router.post('/login', login);

// Route lấy thông tin cá nhân hiện tại (Yêu cầu đăng nhập - Token)
router.get('/me', protect, getMe);

// Route Quên mật khẩu: Yêu cầu gửi mã OTP 6 số qua Email (Public)
router.post('/forgot-password', forgotPassword);

// Route Xác thực mã OTP 6 số (Public)
router.post('/verify-reset-otp', verifyResetOtp);

// Route Đổi mật khẩu mới bằng mã OTP (Public)
router.post('/reset-password', resetPasswordWithOtp);

export default router;
