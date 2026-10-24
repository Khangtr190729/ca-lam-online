import express from 'express';
import {
  getStoreShifts,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shiftController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateMiddleware.js';
import { storeParamsSchema } from '../validators/commonValidators.js';
import {
  shiftParamsSchema,
  createShiftSchema,
  updateShiftSchema,
} from '../validators/shiftValidator.js';

// Cho phép router con truy cập tham số :storeId từ router cha
const router = express.Router({ mergeParams: true });

// Tất cả các routes Slot ca làm đều yêu cầu đăng nhập
router.use(protect);

// 1. Lấy danh sách các Slot/ca làm của cửa hàng (Mọi thành viên trong quán)
router.get('/', validateRequest({ params: storeParamsSchema }), getStoreShifts);

// 2. Tạo mới Slot ca làm việc (Chủ quán / Quản lý)
router.post(
  '/',
  validateRequest({ params: storeParamsSchema, body: createShiftSchema }),
  createShift
);

// 3. Cập nhật thông tin Slot ca làm (Chủ quán / Quản lý)
router.put(
  '/:shiftId',
  validateRequest({ params: shiftParamsSchema, body: updateShiftSchema }),
  updateShift
);

// 4. Xóa Slot ca làm (Chủ quán / Quản lý)
router.delete('/:shiftId', validateRequest({ params: shiftParamsSchema }), deleteShift);

export default router;
