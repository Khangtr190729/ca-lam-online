import express from 'express';
import {
  getStoreSchedule,
  saveDraftSchedule,
  publishSchedule,
  getMySchedule,
} from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Router con cho đường dẫn lồng: /api/stores/:storeId/schedules
const storeScheduleRouter = express.Router({ mergeParams: true });
storeScheduleRouter.use(protect);

// 1. Lấy lịch làm việc của quán theo tuần: GET /api/stores/:storeId/schedules?week=43&year=2026
storeScheduleRouter.get('/', getStoreSchedule);

// 2. Lưu bản nháp (DRAFT) xếp lịch tuần: POST /api/stores/:storeId/schedules/save-draft
storeScheduleRouter.post('/save-draft', saveDraftSchedule);

// 3. Xuất bản (PUBLISHED) & Gửi Email kèm lương: POST /api/stores/:storeId/schedules/publish
storeScheduleRouter.post('/publish', publishSchedule);

// Router riêng cho nhân viên xem lịch cá nhân: /api/schedules/my-schedule
const personalScheduleRouter = express.Router();
personalScheduleRouter.use(protect);

// 4. Nhân viên xem lịch và tiền lương tuần của riêng mình: GET /api/schedules/my-schedule?week=43&year=2026
personalScheduleRouter.get('/my-schedule', getMySchedule);

export { storeScheduleRouter, personalScheduleRouter };
export default storeScheduleRouter;
