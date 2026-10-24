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
import { validateBody } from '../middlewares/validateMiddleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

// Route đăng ký tài khoản (Public)
router.post('/register', validateBody(registerSchema), register);

// Route đăng nhập tài khoản (Public)
router.post('/login', validateBody(loginSchema), login);

// Route lấy thông tin cá nhân hiện tại (Yêu cầu đăng nhập - Token)
router.get('/me', protect, getMe);

// Route Quên mật khẩu: Yêu cầu gửi mã OTP 6 số qua Email (Public)
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);

// Route Xác thực mã OTP 6 số (Public)
router.post('/verify-reset-otp', validateBody(verifyResetOtpSchema), verifyResetOtp);

// Route Đổi mật khẩu mới bằng mã OTP (Public)
router.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordWithOtp);

export default router;
