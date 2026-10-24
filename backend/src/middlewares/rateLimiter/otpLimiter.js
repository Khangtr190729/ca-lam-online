import { createRateLimiter } from './createLimiter.js';

/**
 * Giới hạn yêu cầu gửi mã OTP quên mật khẩu
 * Quy tắc: Tối đa 3 lần gửi mã trong 15 phút
 * Mục đích: Bảo vệ hạn ngạch Nodemailer/Gmail SMTP và tránh làm phiền hộp thư người dùng
 */
export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Bạn đã yêu cầu gửi mã OTP quá nhiều lần. Vui lòng kiểm tra hộp thư hoặc thử lại sau 15 phút.',
});

/**
 * Giới hạn thử mã OTP xác thực và đặt lại mật khẩu
 * Quy tắc: Tối đa 5 lần thử trong 15 phút
 * Mục đích: Chống dò quét vét cạn (Brute-force) mã xác thực 6 số
 */
export const otpVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Bạn đã nhập sai mã xác thực OTP quá 5 lần. Vui lòng đợi 15 phút trước khi thử lại.',
});
