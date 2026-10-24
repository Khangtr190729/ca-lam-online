/**
 * Định dạng tiền tệ VNĐ chuẩn xác
 */
export const formatVND = (amount) => {
  if (amount === undefined || amount === null) return '0 đ';
  const num = Number(amount);
  if (isNaN(num)) return '0 đ';
  return num.toLocaleString('vi-VN') + ' đ';
};

/**
 * Định dạng ngày sang YYYY-MM-DD
 */
export const formatDateToISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Lấy ngày Thứ Hai của tuần chứa ngày được truyền vào
 */
export const getMondayOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Thêm hoặc trừ số tuần từ một ngày mốc
 */
export const addWeeks = (date, weeks) => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

/**
 * Tính số thứ tự của tuần trong năm theo chuẩn ISO 8601
 */
export const getWeekNumberAndYear = (d = new Date()) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return {
    week: weekNumber,
    year: date.getFullYear(),
  };
};

/**
 * Lấy danh sách 7 ngày trong tuần từ Thứ Hai
 */
export const getDaysOfWeek = (mondayDate) => {
  const days = [];
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const fullNames = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
  ];
  const todayISO = formatDateToISO(new Date());

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateStr = formatDateToISO(d);
    days.push({
      date: d,
      dateStr,
      dayOfWeek: dayLabels[i],
      fullName: fullNames[i],
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      isToday: dateStr === todayISO,
      fullDisplay: `${fullNames[i]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return days;
};

/**
 * Định dạng khoảng thời gian tuần
 */
export const formatWeekRange = (mondayDate) => {
  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);
  const m1 = String(mondayDate.getDate()).padStart(2, '0');
  const mo1 = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const m2 = String(sundayDate.getDate()).padStart(2, '0');
  const mo2 = String(sundayDate.getMonth() + 1).padStart(2, '0');
  const y = sundayDate.getFullYear();
  return `${m1}/${mo1} — ${m2}/${mo2}/${y}`;
};
