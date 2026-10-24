import { z } from 'zod';
import { objectIdSchema } from './commonValidators.js';

/**
 * Schema kiểm tra tham số storeId & memberId
 */
export const memberParamsSchema = z.object({
  storeId: objectIdSchema,
  memberId: objectIdSchema,
});

/**
 * Schema cập nhật mức lương theo giờ
 */
export const updateMemberWageSchema = z.object({
  hourlyWage: z.coerce
    .number({
      required_error: 'Vui lòng cung cấp mức lương theo giờ.',
      invalid_type_error: 'Mức lương theo giờ phải là một số hợp lệ.',
    })
    .min(0, 'Mức lương theo giờ phải lớn hơn hoặc bằng 0 (ví dụ: 20000 = 20.000 VNĐ/h).'),
});

/**
 * Schema bổ nhiệm / phân quyền thành viên
 */
export const updateMemberRoleSchema = z.object({
  roleInStore: z.enum(['MANAGER', 'EMPLOYEE'], {
    errorMap: () => ({
      message: 'Vai trò trong cửa hàng chỉ có thể là "MANAGER" hoặc "EMPLOYEE".',
    }),
  }),
});

/**
 * Schema cập nhật hình thức làm việc
 */
export const updateMemberTypeSchema = z.object({
  employmentType: z.enum(['FULL_TIME', 'PART_TIME'], {
    errorMap: () => ({
      message: 'Hình thức làm việc phải là "FULL_TIME" (Chính thức) hoặc "PART_TIME" (Bán thời gian).',
    }),
  }),
});
