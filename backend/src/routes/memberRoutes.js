import express from 'express';
import {
  getStoreMembers,
  updateMemberWage,
  updateMemberRole,
  updateMemberEmploymentType,
  removeMember,
} from '../controllers/memberController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateMiddleware.js';
import { storeParamsSchema } from '../validators/commonValidators.js';
import {
  memberParamsSchema,
  updateMemberWageSchema,
  updateMemberRoleSchema,
  updateMemberTypeSchema,
} from '../validators/memberValidator.js';

// Cho phép router con truy cập tham số :storeId từ router cha
const router = express.Router({ mergeParams: true });

// Tất cả các routes nhân sự đều yêu cầu đăng nhập
router.use(protect);

// 1. Lấy danh sách thành viên trong quán kèm mức lương/h (Chủ / Quản lý)
router.get('/', validateRequest({ params: storeParamsSchema }), getStoreMembers);

// 2. Gắn / Cập nhật mức lương theo giờ (VNĐ/h) cho nhân viên (Chủ / Quản lý)
router.put(
  '/:memberId/wage',
  validateRequest({ params: memberParamsSchema, body: updateMemberWageSchema }),
  updateMemberWage
);

// 3. Bổ nhiệm Quản lý (MANAGER) hoặc hạ quyền xuống Nhân viên (Chỉ Chủ quán)
router.put(
  '/:memberId/role',
  validateRequest({ params: memberParamsSchema, body: updateMemberRoleSchema }),
  updateMemberRole
);

// 4. Đổi hình thức làm việc (Full-time / Part-time) (Chủ / Quản lý)
router.put(
  '/:memberId/type',
  validateRequest({ params: memberParamsSchema, body: updateMemberTypeSchema }),
  updateMemberEmploymentType
);

// 5. Xóa nhân viên khỏi quán (Chỉ Chủ quán)
router.delete(
  '/:memberId',
  validateRequest({ params: memberParamsSchema }),
  removeMember
);

export default router;
