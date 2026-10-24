import { z } from 'zod';

const validGenders = {
  Nam: 'Nam',
  nam: 'Nam',
  Nữ: 'Nữ',
  nữ: 'Nữ',
  Nu: 'Nữ',
  nu: 'Nữ',
  Khác: 'Khác',
  khác: 'Khác',
  Khac: 'Khác',
  khac: 'Khác',
};

/**
 * Schema đăng ký tài khoản mới (Chủ cửa hàng hoặc Người đi làm)
 */
export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập địa chỉ Email.' })
    .trim()
    .toLowerCase()
    .email('Định dạng email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: user@gmail.com).'),

  password: z
    .string({ required_error: 'Vui lòng nhập mật khẩu.' })
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.'),

  fullName: z
    .string({ required_error: 'Vui lòng nhập họ và tên.' })
    .trim()
    .min(1, 'Họ và tên không được để trống.'),

  gender: z
    .string({ required_error: 'Vui lòng chọn giới tính.' })
    .refine((val) => Boolean(validGenders[val]), {
      message: 'Giới tính phải là một trong: Nam, Nữ, Khác.',
    })
    .transform((val) => validGenders[val]),

  age: z.coerce
    .number({
      required_error: 'Vui lòng nhập tuổi.',
      invalid_type_error: 'Tuổi phải là một số hợp lệ.',
    })
    .int('Tuổi phải là số nguyên.')
    .min(15, 'Độ tuổi làm việc hợp lệ từ 15 đến 100 tuổi.')
    .max(100, 'Độ tuổi làm việc hợp lệ từ 15 đến 100 tuổi.'),

  systemRole: z.enum(['ADMIN', 'EMPLOYEE'], {
    errorMap: () => ({
      message:
        'Vai trò không hợp lệ. Bạn chỉ có thể đăng ký là "Chủ cửa hàng" (ADMIN) hoặc "Người đi làm" (EMPLOYEE).',
    }),
  }),
});

/**
 * Schema đăng nhập
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng nhập Email.' })
    .trim()
    .toLowerCase()
    .email('Định dạng Email không hợp lệ.'),

  password: z
    .string({ required_error: 'Vui lòng nhập Mật khẩu.' })
    .min(1, 'Mật khẩu không được để trống.'),
});

/**
 * Schema yêu cầu OTP quên mật khẩu
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng cung cấp địa chỉ Email.' })
    .trim()
    .toLowerCase()
    .email('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.'),
});

/**
 * Schema xác thực mã OTP 6 số
 */
export const verifyResetOtpSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng cung cấp địa chỉ Email.' })
    .trim()
    .toLowerCase()
    .email('Định dạng email không hợp lệ.'),

  otp: z
    .string({ required_error: 'Vui lòng nhập mã OTP.' })
    .trim()
    .regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số.'),
});

/**
 * Schema đặt lại mật khẩu bằng OTP
 */
export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Vui lòng cung cấp địa chỉ Email.' })
    .trim()
    .toLowerCase()
    .email('Định dạng email không hợp lệ.'),

  otp: z
    .string({ required_error: 'Vui lòng nhập mã OTP.' })
    .trim()
    .regex(/^\d{6}$/, 'Mã OTP phải gồm đúng 6 chữ số.'),

  newPassword: z
    .string({ required_error: 'Vui lòng nhập mật khẩu mới.' })
    .min(6, 'Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn.'),
});
