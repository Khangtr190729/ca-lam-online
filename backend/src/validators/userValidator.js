import { z } from 'zod';

/**
 * Schema cập nhật thông tin cá nhân
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Họ tên không được để trống.')
    .optional(),

  gender: z
    .enum(['Nam', 'Nữ', 'Khác'], {
      errorMap: () => ({ message: 'Giới tính phải là một trong: Nam, Nữ, Khác.' }),
    })
    .optional(),

  age: z.coerce
    .number({ invalid_type_error: 'Tuổi phải là một số hợp lệ.' })
    .int('Tuổi phải là số nguyên.')
    .min(15, 'Tuổi không hợp lệ (Độ tuổi từ 15 đến 100 tuổi).')
    .max(100, 'Tuổi không hợp lệ (Độ tuổi từ 15 đến 100 tuổi).')
    .optional(),

  avatar: z.string().optional(),
});

/**
 * Schema đổi mật khẩu
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Vui lòng nhập mật khẩu hiện tại.' })
    .min(1, 'Vui lòng nhập mật khẩu hiện tại.'),

  newPassword: z
    .string({ required_error: 'Vui lòng nhập mật khẩu mới.' })
    .min(6, 'Mật khẩu mới phải có tối thiểu 6 ký tự.'),
});
