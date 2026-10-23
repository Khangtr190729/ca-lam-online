/**
 * Các hàm tiện ích thuần túy (pure helpers) xử lý thời gian và ca làm việc
 */

/**
 * Chuyển đổi định dạng thời gian "HH:MM" sang số phút
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Kiểm tra xem 2 ca làm việc có bị trùng hoặc giao thoa khung giờ hay không
 */
export const checkShiftOverlap = (shift1, shift2) => {
  if (!shift1 || !shift2) return false;
  let start1 = timeToMinutes(shift1.startTime);
  let end1 = timeToMinutes(shift1.endTime);
  let start2 = timeToMinutes(shift2.startTime);
  let end2 = timeToMinutes(shift2.endTime);

  if (end1 <= start1) end1 += 1440;
  if (end2 <= start2) end2 += 1440;

  return start1 < end2 && start2 < end1;
};

/**
 * Trích xuất ID dạng chuỗi an toàn (hỗ trợ cả ObjectId, String, hoặc Object {_id})
 */
export const extractId = (val) => {
  if (!val) return '';
  if (typeof val === 'object') return String(val._id || val.id || '');
  return String(val);
};

/**
 * Lấy ngày hôm nay theo định dạng "YYYY-MM-DD" (chuẩn múi giờ Việt Nam UTC+7)
 */
export const getTodayDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

/**
 * Lấy giờ hiện tại theo định dạng "HH:MM" (chuẩn múi giờ Việt Nam UTC+7)
 */
export const getCurrentVNTime = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};

/**
 * Kiểm tra xem một ca làm việc vào ngày dateStr đã qua/đã kết thúc chưa
 * - Ngày trong quá khứ (dateStr < todayStr) -> ĐÃ QUA
 * - Ngày hôm nay (dateStr === todayStr):
 *     + Giờ hiện tại >= giờ kết thúc của ca (currentTime >= endTime) -> ĐÃ QUA / ĐÃ HOÀN THÀNH
 *     + Hoặc ca qua đêm (startTime > endTime) nếu hiện tại >= startTime -> ĐÃ BẮT ĐẦU
 * - Ngày tương lai (dateStr > todayStr) -> CHƯA QUA
 */
export const isShiftTimePassed = (dateStr, shift) => {
  if (!dateStr || !shift) return false;
  const todayStr = getTodayDateString();

  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  // Nếu là ngày hôm nay: so sánh giờ hiện tại với giờ kết thúc của ca
  const currentMinutes = timeToMinutes(getCurrentVNTime());
  const startMinutes = timeToMinutes(shift.startTime);
  let endMinutes = timeToMinutes(shift.endTime);

  if (endMinutes <= startMinutes) {
    // Ca qua đêm của ngày hôm nay (VD: 22:00 -> 06:00):
    // Nếu hiện tại đã từ 22:00 trở đi thì ca tối nay đã bắt đầu
    return currentMinutes >= startMinutes;
  }

  // Ca trong ngày thông thường (VD: 08:00 -> 12:00):
  // Ca đã qua khi giờ hiện tại >= giờ kết thúc của ca
  return currentMinutes >= endMinutes;
};
