import { createRateLimiter } from './createLimiter.js';

/**
 * Giới hạn thử mã mời gia nhập cửa hàng
 * Quy tắc: Tối đa 5 lần thử nhập mã mời trong 15 phút
 * Mục đích: Chống dò quét (Brute-force) mã mời cửa hàng 6 chữ số
 */
export const joinCodeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Bạn đã thử nhập mã mời cửa hàng quá nhiều lần. Vui lòng thử lại sau 15 phút.',
});
