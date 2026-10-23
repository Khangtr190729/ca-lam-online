import express from 'express';
import {
  createStore,
  getMyStore,
  updateMyStore,
  generateInviteCode,
  joinByCode,
  inviteById,
} from '../controllers/storeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import memberRoutes from './memberRoutes.js';

const router = express.Router();

// Tất cả các routes Store đều yêu cầu đăng nhập
router.use(protect);

// Nhánh con quản lý thành viên và gán lương: /api/stores/:storeId/members
router.use('/:storeId/members', memberRoutes);

// 1. Tạo cửa hàng mới (ADMIN)
router.post('/', createStore);

// 2. Lấy thông tin cửa hàng của tôi (ADMIN hoặc EMPLOYEE)
router.get('/my-store', getMyStore);

// 3. Cập nhật thông tin cửa hàng (ADMIN)
router.put('/my-store', updateMyStore);

// 4. Sinh mã mời 6 số ngẫu nhiên (ADMIN) - Hiệu lực 1h, vô hiệu mã cũ
router.post('/generate-invite-code', generateInviteCode);

// 5. Nhân viên nhập mã mời 6 số để gia nhập (EMPLOYEE)
router.post('/join-by-code', joinByCode);

// 6. Chủ quán mời trực tiếp nhân viên qua ID hoặc Email (ADMIN)
router.post('/invite-by-id', inviteById);

export default router;
