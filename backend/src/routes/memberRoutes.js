import express from 'express';
import {
  getStoreMembers,
  updateMemberWage,
  updateMemberRole,
  updateMemberEmploymentType,
  removeMember,
} from '../controllers/memberController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Cho phép router con truy cập tham số :storeId từ router cha
const router = express.Router({ mergeParams: true });

// Tất cả các routes nhân sự đều yêu cầu đăng nhập
router.use(protect);

// 1. Lấy danh sách thành viên trong quán kèm mức lương/h (Chủ / Quản lý)
router.get('/', getStoreMembers);

// 2. Gắn / Cập nhật mức lương theo giờ (VNĐ/h) cho nhân viên (Chủ / Quản lý)
router.put('/:memberId/wage', updateMemberWage);

// 3. Bổ nhiệm Quản lý (MANAGER) hoặc hạ quyền xuống Nhân viên (Chỉ Chủ quán)
router.put('/:memberId/role', updateMemberRole);

// 4. Đổi hình thức làm việc (Full-time / Part-time) (Chủ / Quản lý)
router.put('/:memberId/type', updateMemberEmploymentType);

// 5. Xóa nhân viên khỏi quán (Chỉ Chủ quán)
router.delete('/:memberId', removeMember);

export default router;
