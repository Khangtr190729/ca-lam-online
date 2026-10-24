import { createRateLimiter } from './createLimiter.js';

/**
 * Giới hạn tần suất chung cho toàn bộ API hệ thống
 * Quy tắc: Tối đa 300 requests trong 15 phút cho mỗi địa chỉ IP
 */
export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Bạn đã gửi quá nhiều yêu cầu đến hệ thống. Vui lòng thử lại sau 15 phút.',
});
