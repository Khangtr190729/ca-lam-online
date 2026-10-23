import mongoose from 'mongoose';
import Store from '../models/Store.js';
import StoreMember from '../models/StoreMember.js';
import Shift from '../models/Shift.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import { sendScheduleEmail } from '../services/emailService.js';

/**
 * Hàm kiểm tra quyền hạn của người gọi trong cửa hàng
 */
const verifyStoreAccess = async (storeId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return { error: 'Mã cửa hàng (storeId) không hợp lệ.' };
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return { error: 'Không tìm thấy cửa hàng.' };
  }

  const isOwner = store.ownerId.toString() === userId;

  const member = await StoreMember.findOne({
    storeId,
    userId,
    status: 'ACTIVE',
  });

  const isMember = isOwner || !!member;
  const isManager = isOwner || (member && ['MANAGER', 'ADMIN'].includes(member.roleInStore));

  return { store, isOwner, isManager, isMember };
};

/**
 * Chuyển đổi định dạng thời gian "HH:MM" sang số phút
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Kiểm tra xem 2 ca làm việc có bị trùng hoặc giao thoa khung giờ hay không
 */
const checkShiftOverlap = (shift1, shift2) => {
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
const extractId = (val) => {
  if (!val) return '';
  if (typeof val === 'object') return String(val._id || val.id || '');
  return String(val);
};

/**
 * Lấy ngày hôm nay theo định dạng "YYYY-MM-DD" (chuẩn múi giờ Việt Nam UTC+7)
 */
const getTodayDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

/**
 * Kiểm tra các ca phân công mới có bị rơi vào ngày trong quá khứ không.
 * Các ca đã tồn tại từ trước trong DB của tuần này vẫn được giữ lại,
 * nhưng người dùng KHÔNG ĐƯỢC PHÉP thêm mới hoặc sửa vào các ngày trong quá khứ.
 */
const validateNoNewPastAssignments = (rawAssignments, existingAssignments = []) => {
  const todayStr = getTodayDateString();
  const existingSet = new Set(
    existingAssignments.map(
      (a) => `${a.date}_${extractId(a.shiftId)}_${extractId(a.userId)}`
    )
  );

  for (const item of rawAssignments) {
    if (item.date && item.date < todayStr) {
      const sId = extractId(item.shiftId);
      const uId = extractId(item.userId);
      const key = `${item.date}_${sId}_${uId}`;
      if (!existingSet.has(key)) {
        const err = new Error(
          `Lỗi xếp lịch: Ngày ${item.date} đã qua trong quá khứ. Hệ thống chỉ cho phép xếp lịch cho ngày hiện tại (${todayStr}) và các ngày tương lai!`
        );
        err.statusCode = 400;
        throw err;
      }
    }
  }
};

/**
 * Xử lý tính toán tiền lương cho từng ca và tổng kết lương cả tuần
 */
const processAssignmentsAndSalary = async (storeId, rawAssignments) => {
  // 1. Lấy toàn bộ ca làm việc của quán để map số giờ
  const shifts = await Shift.find({ storeId });
  const shiftMap = {};
  shifts.forEach((s) => {
    shiftMap[s._id.toString()] = s;
  });

  const store = await Store.findById(storeId);

  // 2. Lấy toàn bộ thành viên của quán để map mức lương theo giờ
  const members = await StoreMember.find({ storeId, status: 'ACTIVE' }).populate(
    'userId',
    'fullName email'
  );
  const memberMap = {};
  members.forEach((m) => {
    if (m.userId) {
      memberMap[m.userId._id.toString()] = m;
    }
  });

  // 3. Kiểm tra logic trùng giờ làm việc: 1 người không thể làm 2 ca trùng/giao thoa giờ trong 1 ngày
  const userDateShifts = {};
  for (const item of rawAssignments) {
    const sId = extractId(item.shiftId);
    const uId = extractId(item.userId);
    if (!item.date || !sId || !uId) continue;
    const shift = shiftMap[sId];
    const member = memberMap[uId];
    if (!shift || !member) continue;

    // 0. Không cho phép xếp Chủ cửa hàng (ADMIN) vào ca làm việc
    const isOwner = (store && store.ownerId.toString() === uId) || member.roleInStore === 'ADMIN';
    if (isOwner) {
      const memberName = member.userId ? (member.userId.fullName || member.userId.name) : 'Chủ cửa hàng';
      const err = new Error(
        `Lỗi phân công: "${memberName}" là Chủ cửa hàng (ADMIN). Chủ cửa hàng không thể được phân công vào ca làm việc!`
      );
      err.statusCode = 400;
      throw err;
    }

    const key = `${item.date}_${uId}`;
    if (!userDateShifts[key]) {
      userDateShifts[key] = [];
    }

    for (const existingShift of userDateShifts[key]) {
      // 1. Kiểm tra nếu bị phân trùng 2 lần cùng 1 ca
      if (existingShift._id.toString() === shift._id.toString()) {
        const memberName = member.userId ? (member.userId.fullName || member.userId.name) : 'Nhân viên';
        const err = new Error(
          `Lỗi trùng lặp: Nhân viên "${memberName}" đã được phân công vào ca "${shift.name}" ngày ${item.date}. Không thể thêm cùng một nhân viên nhiều lần vào cùng một ca!`
        );
        err.statusCode = 400;
        throw err;
      }

      // 2. Kiểm tra nếu trùng khung giờ giữa 2 ca khác nhau
      if (checkShiftOverlap(shift, existingShift)) {
        const memberName = member.userId ? (member.userId.fullName || member.userId.name) : 'Nhân viên';
        const err = new Error(
          `Lỗi trùng ca: Nhân viên "${memberName}" bị trùng giờ làm việc vào ngày ${item.date} giữa ca "${existingShift.name}" (${existingShift.startTime} - ${existingShift.endTime}) và ca "${shift.name}" (${shift.startTime} - ${shift.endTime}). Một người không thể làm 2 ca trong cùng khung giờ!`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    userDateShifts[key].push(shift);
  }

  // 4. Tính toán cho từng ca phân công
  const processedAssignments = [];
  const salaryMap = {};

  for (const item of rawAssignments) {
    const sId = extractId(item.shiftId);
    const uId = extractId(item.userId);
    const shift = shiftMap[sId];
    const member = memberMap[uId];

    if (!shift || !member) continue;

    const hours = shift.durationHours || 0;
    // Ưu tiên mức lương truyền vào hoặc mức lương mặc định của nhân viên
    const wage =
      item.hourlyWage !== undefined && !isNaN(Number(item.hourlyWage))
        ? Number(item.hourlyWage)
        : member.hourlyWage || 0;
    const totalPay = Math.round(hours * wage);

    processedAssignments.push({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      shiftId: shift._id,
      userId: member.userId._id,
      hourlyWage: wage,
      hours: hours,
      totalPay: totalPay,
    });

    // Gom nhóm tổng lương theo nhân viên
    const uid = member.userId._id.toString();
    if (!salaryMap[uid]) {
      salaryMap[uid] = {
        userId: member.userId._id,
        fullName: member.userId.fullName,
        email: member.userId.email,
        hourlyWage: wage,
        totalHours: 0,
        totalSalary: 0,
        shiftCount: 0,
        shifts: [],
      };
    }

    salaryMap[uid].totalHours += hours;
    salaryMap[uid].totalSalary += totalPay;
    salaryMap[uid].shiftCount += 1;
    salaryMap[uid].shifts.push({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      shiftName: shift.name,
      timeRange: `${shift.startTime} - ${shift.endTime}`,
      hours: hours,
      totalPay: totalPay,
    });
  }

  return {
    processedAssignments,
    salarySummary: Object.values(salaryMap),
    salaryMap,
  };
};

/**
 * @desc    Lấy bảng lịch làm việc của một tuần/năm
 * @route   GET /api/stores/:storeId/schedules?week=43&year=2026
 * @access  Private (Mọi thành viên trong quán)
 */
export const getStoreSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { week, year } = req.query;
    const userId = req.user.id;

    if (!week || !year) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tham số tuần (week) và năm (year). Ví dụ: ?week=43&year=2026',
      });
    }

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isMember) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không thuộc cửa hàng này.',
      });
    }

    const schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    })
      .populate('assignments.shiftId', 'name startTime endTime durationHours color')
      .populate('assignments.userId', 'fullName email systemRole');

    if (!schedule) {
      return res.status(200).json({
        success: true,
        hasSchedule: false,
        week: Number(week),
        year: Number(year),
        message: `Chưa có lịch làm việc cho Tuần ${week}/${year}. Bạn có thể bắt đầu tạo bản nháp.`,
        assignments: [],
        salarySummary: [],
      });
    }

    // Tính toán bảng tổng kết lương từ assignments đã lưu
    const salaryMap = {};
    schedule.assignments.forEach((a) => {
      if (!a.userId) return;
      const uid = a.userId._id.toString();
      if (!salaryMap[uid]) {
        salaryMap[uid] = {
          userId: a.userId._id,
          fullName: a.userId.fullName,
          email: a.userId.email,
          hourlyWage: a.hourlyWage,
          totalHours: 0,
          totalSalary: 0,
          shiftCount: 0,
        };
      }
      salaryMap[uid].totalHours += a.hours;
      salaryMap[uid].totalSalary += a.totalPay;
      salaryMap[uid].shiftCount += 1;
    });

    return res.status(200).json({
      success: true,
      hasSchedule: true,
      storeName: access.store.name,
      schedule,
      salarySummary: Object.values(salaryMap),
    });
  } catch (error) {
    console.error('Lỗi lấy lịch tuần:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi lấy lịch: ${error.message}`,
    });
  }
};

/**
 * @desc    Lưu bản nháp xếp lịch tuần (DRAFT) và tự động tính lương
 * @route   POST /api/stores/:storeId/schedules/save-draft
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const saveDraftSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { week, year, startDate, endDate, assignments } = req.body;
    const userId = req.user.id;

    if (!week || !year || !startDate || !endDate || !Array.isArray(assignments)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: week, year, startDate, endDate và mảng assignments.',
      });
    }

    const parsedWeek = Number(week);
    const parsedYear = Number(year);
    if (isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 53) {
      return res.status(400).json({
        success: false,
        message: 'Số tuần không hợp lệ (Tuần trong năm từ 1 đến 53).',
      });
    }
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Năm không hợp lệ (Năm từ 2000 đến 2100).',
      });
    }

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền xếp lịch làm việc.',
      });
    }

    // Kiểm tra tuần đã kết thúc hoàn toàn trong quá khứ chưa
    const todayStr = getTodayDateString();
    const formattedEndDate = typeof endDate === 'string' ? endDate.split('T')[0] : '';
    if (formattedEndDate && formattedEndDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Không thể chỉnh sửa hoặc lưu lịch làm việc cho tuần đã kết thúc trong quá khứ.',
      });
    }

    // Tìm lịch tuần hiện tại trong DB để đối chiếu ca đã có
    let schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    });

    // Xác thực không cho phép thêm mới hoặc gán ca vào ngày trong quá khứ
    validateNoNewPastAssignments(assignments, schedule?.assignments || []);

    // 1. Tính toán lương tự động cho từng ca
    const { processedAssignments, salarySummary } = await processAssignmentsAndSalary(
      storeId,
      assignments
    );

    // 2. Tìm hoặc tạo bản ghi lịch tuần
    if (schedule) {
      schedule.startDate = new Date(startDate);
      schedule.endDate = new Date(endDate);
      schedule.assignments = processedAssignments;
      schedule.status = 'DRAFT';
      schedule.createdBy = userId;
    } else {
      schedule = new Schedule({
        storeId,
        week: Number(week),
        year: Number(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'DRAFT',
        createdBy: userId,
        assignments: processedAssignments,
      });
    }

    await schedule.save();

    return res.status(200).json({
      success: true,
      message: `Đã lưu bản nháp lịch Tuần ${week}/${year} thành công! Tiền lương đã được tự động tính toán.`,
      status: schedule.status,
      totalAssignedShifts: processedAssignments.length,
      schedule,
      salarySummary,
    });
  } catch (error) {
    console.error('Lỗi lưu bản nháp lịch:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ khi lưu bản nháp',
    });
  }
};

/**
 * @desc    Xác nhận xuất bản lịch tuần (PUBLISHED) & TỰ ĐỘNG GỬI EMAIL LỊCH KÈM LƯƠNG
 * @route   POST /api/stores/:storeId/schedules/publish
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const publishSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { week, year, assignments, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!week || !year) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tuần (week) và năm (year).',
      });
    }

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền xuất bản lịch làm.',
      });
    }

    const todayStr = getTodayDateString();
    const formattedEndDate = typeof endDate === 'string' ? endDate.split('T')[0] : '';
    if (formattedEndDate && formattedEndDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xuất bản lịch làm việc cho tuần đã kết thúc trong quá khứ.',
      });
    }

    let schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    });

    let processedData;

    // Nếu người dùng gửi kèm assignments mới trước khi bấm xuất bản
    if (Array.isArray(assignments)) {
      validateNoNewPastAssignments(assignments, schedule?.assignments || []);
      processedData = await processAssignmentsAndSalary(storeId, assignments);

      if (!schedule) {
        schedule = new Schedule({
          storeId,
          week: Number(week),
          year: Number(year),
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(),
          createdBy: userId,
        });
      }
      schedule.assignments = processedData.processedAssignments;
    } else {
      if (!schedule || schedule.assignments.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có ca làm nào trong tuần này để xuất bản. Vui lòng xếp lịch trước.',
        });
      }
      // Tái tính toán dữ liệu gửi mail từ assignments đã có
      processedData = await processAssignmentsAndSalary(storeId, schedule.assignments);
    }

    // Chốt trạng thái PUBLISHED và thời gian xuất bản
    schedule.status = 'PUBLISHED';
    schedule.publishedAt = new Date();
    await schedule.save();

    // 3. TỰ ĐỘNG GỬI EMAIL ĐẾN TỪNG NHÂN VIÊN
    const emailResults = [];
    const recipients = Object.values(processedData.salaryMap);

    for (const emp of recipients) {
      if (emp.email && emp.shifts.length > 0) {
        const sendResult = await sendScheduleEmail({
          toEmail: emp.email,
          employeeName: emp.fullName,
          storeName: access.store.name,
          week: Number(week),
          year: Number(year),
          assignments: emp.shifts,
          totalHours: emp.totalHours,
          hourlyWage: emp.hourlyWage,
          totalSalary: emp.totalSalary,
        });
        emailResults.push(sendResult);
      }
    }

    const failedEmails = emailResults.filter((r) => !r.success);
    const successEmails = emailResults.filter((r) => r.success && !r.simulated);
    const simulatedEmails = emailResults.filter((r) => r.simulated);

    let emailMsg = '';
    if (failedEmails.length > 0) {
      const isAuthError = failedEmails.some(
        (f) =>
          f.error &&
          (f.error.includes('535') ||
            f.error.includes('Username and Password not accepted') ||
            f.error.includes('BadCredentials'))
      );
      if (isAuthError) {
        emailMsg =
          ' (LƯU Ý: Gửi email thất bại do mật khẩu Gmail trong .env là mật khẩu thường. Google yêu cầu dùng "Mật khẩu ứng dụng" - App Password 16 chữ số để gửi thư tự động qua Nodemailer).';
      } else {
        emailMsg = ` (Lưu ý: Có ${failedEmails.length} email gửi thất bại: ${failedEmails[0].error}).`;
      }
    } else if (simulatedEmails.length > 0) {
      emailMsg = ' (Chưa cấu hình EMAIL_USER/EMAIL_PASS trong .env nên hệ thống mô phỏng và bỏ qua gửi thật).';
    } else if (successEmails.length > 0) {
      emailMsg = ` Đã gửi email thông báo chi tiết lịch trực kèm tiền lương đến ${successEmails.length} nhân viên.`;
    }

    return res.status(200).json({
      success: true,
      message: `Xuất bản lịch Tuần ${week}/${year} thành công!${emailMsg}`,
      schedule,
      salarySummary: processedData.salarySummary,
      emailsSent: emailResults,
      hasEmailError: failedEmails.length > 0,
    });
  } catch (error) {
    console.error('Lỗi xuất bản lịch & gửi mail:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ khi xuất bản lịch',
    });
  }
};

/**
 * @desc    Nhân viên xem lịch làm việc và tiền lương tuần của riêng mình
 * @route   GET /api/schedules/my-schedule?week=43&year=2026
 * @access  Private (Nhân viên đã đăng nhập)
 */
export const getMySchedule = async (req, res) => {
  try {
    const { week, year } = req.query;
    const userId = req.user.id;

    if (!week || !year) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tham số week và year (ví dụ: ?week=43&year=2026).',
      });
    }

    // Tìm lịch đã xuất bản có ca của nhân viên này
    const schedule = await Schedule.findOne({
      week: Number(week),
      year: Number(year),
      'assignments.userId': userId,
    })
      .populate('storeId', 'name address')
      .populate('assignments.shiftId', 'name startTime endTime durationHours color');

    if (!schedule) {
      return res.status(200).json({
        success: true,
        hasSchedule: false,
        week: Number(week),
        year: Number(year),
        message: 'Bạn không có ca làm việc nào trong tuần này.',
        shifts: [],
        totalHours: 0,
        totalSalary: 0,
      });
    }

    // Lọc các ca của chính mình
    const myShifts = schedule.assignments
      .filter((a) => a.userId.toString() === userId)
      .map((a) => ({
        assignmentId: a._id,
        date: a.date,
        dayOfWeek: a.dayOfWeek,
        shiftName: a.shiftId ? a.shiftId.name : 'N/A',
        startTime: a.shiftId ? a.shiftId.startTime : '',
        endTime: a.shiftId ? a.shiftId.endTime : '',
        hours: a.hours,
        hourlyWage: a.hourlyWage,
        totalPay: a.totalPay,
        color: a.shiftId ? a.shiftId.color : '#3B82F6',
      }));

    const totalHours = myShifts.reduce((acc, cur) => acc + cur.hours, 0);
    const totalSalary = myShifts.reduce((acc, cur) => acc + cur.totalPay, 0);
    const hourlyWage = myShifts.length > 0 ? myShifts[0].hourlyWage : 0;

    return res.status(200).json({
      success: true,
      hasSchedule: true,
      storeName: schedule.storeId ? schedule.storeId.name : 'N/A',
      week: schedule.week,
      year: schedule.year,
      status: schedule.status,
      publishedAt: schedule.publishedAt,
      shifts: myShifts,
      totalHours,
      hourlyWage,
      totalSalary,
    });
  } catch (error) {
    console.error('Lỗi lấy lịch cá nhân:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi lấy lịch cá nhân: ${error.message}`,
    });
  }
};

/**
 * @desc    Tự động xếp ca làm việc thông minh và tối ưu cho nhân viên (Lưu bản nháp DRAFT)
 * @route   POST /api/stores/:storeId/schedules/auto-generate
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const autoGenerateSchedule = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      week,
      year,
      startDate,
      endDate,
      days,
      staffPerShift = 1,
      maxShiftsPerDay = 1,
      preserveExisting = false,
      existingAssignments = [],
    } = req.body;
    const userId = req.user.id;

    if (!week || !year || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: week, year, startDate, endDate.',
      });
    }

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền sử dụng tính năng tự động xếp lịch.',
      });
    }

    const todayStr = getTodayDateString();
    const formattedEndDate = typeof endDate === 'string' ? endDate.split('T')[0] : '';
    if (formattedEndDate && formattedEndDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự động xếp lịch cho tuần đã kết thúc trong quá khứ. Vui lòng chọn tuần hiện tại hoặc tương lai.',
      });
    }

    // 1. Lấy danh sách ca làm việc của quán
    const shifts = await Shift.find({ storeId, isActive: { $ne: false } }).sort({ startTime: 1 });
    if (!shifts || shifts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cửa hàng chưa có ca làm việc nào. Vui lòng tạo ca làm việc trước khi tự động chia ca.',
      });
    }

    // 2. Lấy danh sách nhân viên đang hoạt động (ACTIVE) - Loại trừ Chủ cửa hàng (ADMIN)
    const activeMembers = await StoreMember.find({ storeId, status: 'ACTIVE' }).populate(
      'userId',
      'fullName email systemRole'
    );
    const validMembers = activeMembers.filter(
      (m) =>
        m.userId &&
        m.userId._id &&
        m.roleInStore !== 'ADMIN' &&
        access.store.ownerId.toString() !== m.userId._id.toString()
    );

    if (validMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cửa hàng chưa có nhân viên hoặc quản lý nào để chia ca làm việc. Vui lòng thêm nhân viên trước khi tự động chia ca.',
      });
    }

    // 3. Chuẩn bị danh sách 7 ngày trong tuần
    let weekDays = days;
    if (!Array.isArray(weekDays) || weekDays.length === 0) {
      const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
      const baseDate = new Date(startDate);
      weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        weekDays.push({
          date: `${y}-${m}-${dayNum}`,
          dayOfWeek: dayNames[i],
        });
      }
    }

    // 4. Khởi tạo theo dõi phân công (workload tracking)
    const memberStats = {};
    validMembers.forEach((m) => {
      const uId = m.userId._id.toString();
      memberStats[uId] = {
        member: m,
        userId: m.userId._id,
        hourlyWage: m.hourlyWage || 20000,
        shiftCount: 0,
        totalHours: 0,
        shiftsByDate: {}, // dateStr -> [shiftObj]
      };
    });

    const shiftMap = {};
    shifts.forEach((s) => {
      shiftMap[s._id.toString()] = s;
    });

    let workingAssignments = [];

    // Nếu người quản lý chọn giữ lại các ca đã xếp thủ công
    if (preserveExisting && Array.isArray(existingAssignments) && existingAssignments.length > 0) {
      for (const item of existingAssignments) {
        const uId = String(item.userId?._id || item.userId || '');
        const sId = String(item.shiftId?._id || item.shiftId || '');
        const shift = shiftMap[sId];
        const stat = memberStats[uId];
        if (shift && stat && item.date) {
          if (!stat.shiftsByDate[item.date]) stat.shiftsByDate[item.date] = [];
          stat.shiftsByDate[item.date].push(shift);
          stat.shiftCount += 1;
          stat.totalHours += shift.durationHours || 4;
          workingAssignments.push({
            date: item.date,
            dayOfWeek: item.dayOfWeek,
            shiftId: shift._id,
            userId: stat.userId,
            hourlyWage: stat.hourlyWage,
          });
        }
      }
    }

    const targetStaffPerShift = Math.max(1, parseInt(staffPerShift, 10) || 1);
    const maxPerDay = Math.max(1, parseInt(maxShiftsPerDay, 10) || 1);

    // 5. Thuật toán tự động xếp ca thông minh & cân bằng tải (Fair & Optimal Scheduling)
    for (const day of weekDays) {
      // Vá lỗi logic: Không chia ca cho các ngày đã qua trong quá khứ, chỉ chia cho ngày hiện tại và tương lai
      if (day.date < todayStr) {
        continue;
      }

      for (const shift of shifts) {
        const sId = shift._id.toString();

        // Đếm xem ca này trong ngày đã có bao nhiêu người
        const currentAssigned = workingAssignments.filter(
          (a) => a.date === day.date && a.shiftId.toString() === sId
        );
        let needed = targetStaffPerShift - currentAssigned.length;

        while (needed > 0) {
          // Lọc ra các ứng viên hợp lệ:
          // 1. Chưa được phân vào ca này trong ngày (không trùng lặp duplicate)
          // 2. Không bị vượt quá maxShiftsPerDay trong ngày
          // 3. Không bị trùng / giao thoa khung giờ với bất kỳ ca nào đã phân trong ngày (checkShiftOverlap)
          const eligibleCandidates = validMembers.filter((m) => {
            const uId = m.userId._id.toString();
            const stat = memberStats[uId];
            const dateShifts = stat.shiftsByDate[day.date] || [];

            // 1. Không trùng cùng 1 ca
            const alreadyInThisShift = dateShifts.some((s) => s._id.toString() === sId);
            if (alreadyInThisShift) return false;

            // 2. Kiểm tra giới hạn ca/ngày
            if (dateShifts.length >= maxPerDay) return false;

            // 3. Kiểm tra trùng/giao thoa giờ (no overlap)
            const hasTimeConflict = dateShifts.some((s) => checkShiftOverlap(shift, s));
            if (hasTimeConflict) return false;

            return true;
          });

          // Nếu không còn ứng viên dưới maxPerDay, nhưng quán ít người và cần xếp thêm ca trong ngày
          // (nhưng TUYỆT ĐỐI KHÔNG vi phạm trùng giờ hoặc trùng ca)
          let candidatePool = eligibleCandidates;
          if (candidatePool.length === 0 && maxPerDay < shifts.length) {
            candidatePool = validMembers.filter((m) => {
              const uId = m.userId._id.toString();
              const stat = memberStats[uId];
              const dateShifts = stat.shiftsByDate[day.date] || [];

              const alreadyInThisShift = dateShifts.some((s) => s._id.toString() === sId);
              if (alreadyInThisShift) return false;

              // Vẫn tuyệt đối cấm trùng giờ
              const hasTimeConflict = dateShifts.some((s) => checkShiftOverlap(shift, s));
              if (hasTimeConflict) return false;

              return true;
            });
          }

          if (candidatePool.length === 0) {
            // Không có ứng viên nào có thể nhận ca này mà không bị trùng giờ -> dừng cho ca này
            break;
          }

          // Tiêu chuẩn tối ưu hóa công bằng:
          // - Ưu tiên người có tổng số ca tuần ít nhất
          // - Ưu tiên người có tổng số giờ làm tuần ít nhất
          // - Ưu tiên người chưa làm ca nào trong ngày hôm nay
          // - Tie-breaker ngẫu nhiên nhỏ
          candidatePool.sort((a, b) => {
            const statA = memberStats[a.userId._id.toString()];
            const statB = memberStats[b.userId._id.toString()];

            if (statA.shiftCount !== statB.shiftCount) {
              return statA.shiftCount - statB.shiftCount;
            }

            if (statA.totalHours !== statB.totalHours) {
              return statA.totalHours - statB.totalHours;
            }

            const todayA = (statA.shiftsByDate[day.date] || []).length;
            const todayB = (statB.shiftsByDate[day.date] || []).length;
            if (todayA !== todayB) {
              return todayA - todayB;
            }

            return Math.random() - 0.5;
          });

          const chosenMember = candidatePool[0];
          const chosenUId = chosenMember.userId._id.toString();
          const chosenStat = memberStats[chosenUId];

          // Phân công ca
          workingAssignments.push({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            shiftId: shift._id,
            userId: chosenMember.userId._id,
            hourlyWage: chosenStat.hourlyWage,
          });

          // Cập nhật thống kê nhân viên
          if (!chosenStat.shiftsByDate[day.date]) {
            chosenStat.shiftsByDate[day.date] = [];
          }
          chosenStat.shiftsByDate[day.date].push(shift);
          chosenStat.shiftCount += 1;
          chosenStat.totalHours += shift.durationHours || 4;

          needed--;
        }
      }
    }

    // 6. Tính toán lại lương chi tiết và xác thực lần cuối qua processAssignmentsAndSalary
    const { processedAssignments, salarySummary } = await processAssignmentsAndSalary(
      storeId,
      workingAssignments
    );

    // 7. Lưu hoặc cập nhật lịch làm việc với trạng thái DRAFT (BẢN NHÁP)
    let schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    });

    if (schedule) {
      schedule.startDate = new Date(startDate);
      schedule.endDate = new Date(endDate);
      schedule.assignments = processedAssignments;
      schedule.status = 'DRAFT'; // Luôn lưu dạng bản nháp để quản lý xem xét và xác nhận sau
      schedule.createdBy = userId;
    } else {
      schedule = new Schedule({
        storeId,
        week: Number(week),
        year: Number(year),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'DRAFT', // Luôn lưu dạng bản nháp
        createdBy: userId,
        assignments: processedAssignments,
      });
    }

    await schedule.save();

    await schedule.populate([
      { path: 'assignments.shiftId', select: 'name startTime endTime durationHours color' },
      { path: 'assignments.userId', select: 'fullName email systemRole' },
    ]);

    return res.status(200).json({
      success: true,
      message: `Đã tự động xếp lịch tuần tối ưu thành công (${processedAssignments.length} lượt phân ca)! Lịch đang ở trạng thái "Bản nháp", bạn có thể xem lại, tinh chỉnh và xác nhận sau.`,
      status: 'DRAFT',
      totalAssignedShifts: processedAssignments.length,
      schedule,
      salarySummary,
    });
  } catch (error) {
    console.error('Lỗi tự động xếp lịch:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ khi tự động xếp lịch',
    });
  }
};

