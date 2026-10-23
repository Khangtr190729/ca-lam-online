import express from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các routes của User đều yêu cầu đăng nhập (Token)
router.use(protect);

// Route cập nhật thông tin cá nhân
router.put('/profile', updateProfile);

// Route đổi mật khẩu
router.put('/change-password', changePassword);

export default router;
