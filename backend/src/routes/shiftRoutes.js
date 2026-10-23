import express from 'express';
import {
  getStoreShifts,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shiftController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Cho phép router con truy cập tham số :storeId từ router cha
const router = express.Router({ mergeParams: true });

// Tất cả các routes Slot ca làm đều yêu cầu đăng nhập
router.use(protect);

// 1. Lấy danh sách các Slot/ca làm của cửa hàng (Mọi thành viên trong quán)
router.get('/', getStoreShifts);

// 2. Tạo mới Slot ca làm việc (Chủ quán / Quản lý)
router.post('/', createShift);

// 3. Cập nhật thông tin Slot ca làm (Chủ quán / Quản lý)
router.put('/:shiftId', updateShift);

// 4. Xóa Slot ca làm (Chủ quán / Quản lý)
router.delete('/:shiftId', deleteShift);

export default router;
