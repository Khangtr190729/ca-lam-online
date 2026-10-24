import { rateLimit } from 'express-rate-limit';

/**
 * Factory tạo Rate Limiter với cấu hình và phản hồi chuẩn hóa theo hệ thống
 *
 * @param {Object} options
 * @param {number} options.windowMs - Khoảng thời gian tính giới hạn (milliseconds)
 * @param {number} options.max - Số request tối đa trong khoảng windowMs
 * @param {string} options.message - Thông báo tiếng Việt trả về khi bị giới hạn
 * @param {number} [options.statusCode=429] - Mã trạng thái HTTP
 * @param {boolean} [options.skipSuccessfulRequests=false] - Có bỏ qua request thành công không
 * @returns {import('express').RequestHandler}
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
  statusCode = 429,
  skipSuccessfulRequests = false,
}) => {
  return rateLimit({
    windowMs,
    max,
    statusCode,
    standardHeaders: true, // Trả về RateLimit-* headers (draft-6 / draft-7)
    legacyHeaders: false, // Vô hiệu hóa X-RateLimit-* cũ
    skipSuccessfulRequests,
    handler: (req, res) => {
      const retryAfterMinutes = Math.ceil(windowMs / (60 * 1000));
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfterMinutes,
      });
    },
  });
};
