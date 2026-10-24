import { z } from 'zod';

/**
 * Kiểm tra chuỗi định dạng MongoDB ObjectId hợp lệ (24 ký tự hex)
 */
export const objectIdSchema = z
  .string({ required_error: 'Mã định danh (ID) không được để trống.' })
  .regex(/^[0-9a-fA-F]{24}$/, 'Mã định danh không đúng định dạng ObjectId (24 ký tự hex).');

/**
 * Schema kiểm tra tham số storeId trong params
 */
export const storeParamsSchema = z.object({
  storeId: objectIdSchema,
});
