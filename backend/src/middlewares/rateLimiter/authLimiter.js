import { createRateLimiter } from './createLimiter.js';

/**
 * Giới hạn tần suất cho API Đăng nhập & Đăng ký tài khoản
 * Quy tắc: Tối đa 10 lần thử trong 15 phút trên mỗi IP
 * Mục đích: Chống tấn công vét cạn mật khẩu (Brute-force) và spam tạo tài khoản ảo
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Để bảo mật tài khoản, vui lòng thử lại sau 15 phút.',
});
