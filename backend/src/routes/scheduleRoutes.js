import express from 'express';
import {
  getStoreSchedule,
  saveDraftSchedule,
  publishSchedule,
  getMySchedule,
  autoGenerateSchedule,
  evaluateShift,
  getMonthlyScheduleStats,
} from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateMiddleware.js';
import { storeParamsSchema } from '../validators/commonValidators.js';
import {
  weekScheduleQuerySchema,
  monthlyStatsQuerySchema,
  saveDraftScheduleSchema,
  publishScheduleSchema,
  autoGenerateScheduleSchema,
  evaluateShiftSchema,
  myScheduleQuerySchema,
} from '../validators/scheduleValidator.js';

// Router con cho đường dẫn lồng: /api/stores/:storeId/schedules
const storeScheduleRouter = express.Router({ mergeParams: true });
storeScheduleRouter.use(protect);

// 1. Lấy lịch làm việc của quán theo tuần: GET /api/stores/:storeId/schedules?week=43&year=2026
storeScheduleRouter.get(
  '/',
  validateRequest({ params: storeParamsSchema, query: weekScheduleQuerySchema }),
  getStoreSchedule
);

// Thống kê lịch làm việc & dự toán lương theo tháng: GET /api/stores/:storeId/schedules/monthly-stats
storeScheduleRouter.get(
  '/monthly-stats',
  validateRequest({ params: storeParamsSchema, query: monthlyStatsQuerySchema }),
  getMonthlyScheduleStats
);

// 2. Lưu bản nháp (DRAFT) xếp lịch tuần: POST /api/stores/:storeId/schedules/save-draft
storeScheduleRouter.post(
  '/save-draft',
  validateRequest({ params: storeParamsSchema, body: saveDraftScheduleSchema }),
  saveDraftSchedule
);

// 3. Tự động xếp lịch tối ưu (DRAFT): POST /api/stores/:storeId/schedules/auto-generate
storeScheduleRouter.post(
  '/auto-generate',
  validateRequest({ params: storeParamsSchema, body: autoGenerateScheduleSchema }),
  autoGenerateSchedule
);

// 4. Xuất bản (PUBLISHED) & Gửi Email kèm lương: POST /api/stores/:storeId/schedules/publish
storeScheduleRouter.post(
  '/publish',
  validateRequest({ params: storeParamsSchema, body: publishScheduleSchema }),
  publishSchedule
);

// 5. Đánh giá ca làm việc (Hoàn thành / Không hoàn thành): PUT /api/stores/:storeId/schedules/evaluate-shift
storeScheduleRouter.put(
  '/evaluate-shift',
  validateRequest({ params: storeParamsSchema, body: evaluateShiftSchema }),
  evaluateShift
);

// Router riêng cho nhân viên xem lịch cá nhân: /api/schedules/my-schedule
const personalScheduleRouter = express.Router();
personalScheduleRouter.use(protect);

// 4. Nhân viên xem lịch và tiền lương tuần của riêng mình: GET /api/schedules/my-schedule?week=43&year=2026
personalScheduleRouter.get(
  '/my-schedule',
  validateRequest({ query: myScheduleQuerySchema }),
  getMySchedule
);

export { storeScheduleRouter, personalScheduleRouter };
export default storeScheduleRouter;
