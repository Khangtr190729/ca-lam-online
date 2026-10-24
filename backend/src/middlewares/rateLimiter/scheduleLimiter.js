import { createRateLimiter } from './createLimiter.js';

/**
 * Giới hạn tần suất gọi thuật toán Tự động xếp lịch (Auto Schedule)
 * Quy tắc: Tối đa 10 lần trong 5 phút
 * Mục đích: Chống quá tải CPU (Event Loop block) và nghẽn Connection MongoDB
 */
export const autoScheduleLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Hệ thống đang xử lý nhiều tác vụ xếp lịch tự động. Vui lòng chờ 5 phút trước khi tạo mới.',
});
