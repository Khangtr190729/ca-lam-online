import { z } from 'zod';
import { objectIdSchema } from './commonValidators.js';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Schema kiểm tra tham số storeId & shiftId
 */
export const shiftParamsSchema = z.object({
  storeId: objectIdSchema,
  shiftId: objectIdSchema,
});

/**
 * Schema tạo mới Slot ca làm việc
 */
export const createShiftSchema = z.object({
  name: z
    .string({ required_error: 'Vui lòng nhập tên ca làm việc.' })
    .trim()
    .min(1, 'Tên ca làm việc không được để trống.'),

  startTime: z
    .string({ required_error: 'Vui lòng nhập giờ bắt đầu (HH:mm).' })
    .trim()
    .regex(timeRegex, 'Định dạng giờ bắt đầu không hợp lệ (HH:mm, ví dụ: 07:00, 13:30).'),

  endTime: z
    .string({ required_error: 'Vui lòng nhập giờ kết thúc (HH:mm).' })
    .trim()
    .regex(timeRegex, 'Định dạng giờ kết thúc không hợp lệ (HH:mm, ví dụ: 11:30, 22:00).'),

  durationHours: z.coerce.number().min(0).optional(),

  color: z.string().trim().optional().default('#3B82F6'),

  peakLevel: z.coerce
    .number()
    .int()
    .min(1, 'Mức độ cao điểm từ 1 đến 3 sao.')
    .max(3, 'Mức độ cao điểm từ 1 đến 3 sao.')
    .optional(),

  stars: z.coerce
    .number()
    .int()
    .min(1)
    .max(3)
    .optional(),
});

/**
 * Schema cập nhật thông tin Slot ca làm việc
 */
export const updateShiftSchema = z.object({
  name: z.string().trim().min(1, 'Tên ca không được để trống.').optional(),

  startTime: z
    .string()
    .trim()
    .regex(timeRegex, 'Định dạng giờ bắt đầu không hợp lệ (HH:mm, ví dụ: 07:00, 13:30).')
    .optional(),

  endTime: z
    .string()
    .trim()
    .regex(timeRegex, 'Định dạng giờ kết thúc không hợp lệ (HH:mm, ví dụ: 11:30, 22:00).')
    .optional(),

  durationHours: z.coerce.number().min(0).optional(),

  color: z.string().trim().optional(),

  peakLevel: z.coerce.number().int().min(1).max(3).optional(),

  stars: z.coerce.number().int().min(1).max(3).optional(),
});
