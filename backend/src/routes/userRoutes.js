import express from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/userValidator.js';

const router = express.Router();

// Tất cả các routes của User đều yêu cầu đăng nhập (Token)
router.use(protect);

// Route cập nhật thông tin cá nhân
router.put('/profile', validateBody(updateProfileSchema), updateProfile);

// Route đổi mật khẩu
router.put('/change-password', validateBody(changePasswordSchema), changePassword);

export default router;
