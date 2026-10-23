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
  const isManager = isOwner || (member && member.roleInStore === 'MANAGER');

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
 * Xử lý tính toán tiền lương cho từng ca và tổng kết lương cả tuần
 */
const processAssignmentsAndSalary = async (storeId, rawAssignments) => {
  // 1. Lấy toàn bộ ca làm việc của quán để map số giờ
  const shifts = await Shift.find({ storeId });
  const shiftMap = {};
  shifts.forEach((s) => {
    shiftMap[s._id.toString()] = s;
  });

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

  // Helper trích xuất ID dạng chuỗi (hỗ trợ cả ObjectId, String, hoặc Object {_id})
  const extractId = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return String(val._id || val.id || '');
    return String(val);
  };

  // 3. Kiểm tra logic trùng giờ làm việc: 1 người không thể làm 2 ca trùng/giao thoa giờ trong 1 ngày
  const userDateShifts = {};
  for (const item of rawAssignments) {
    const sId = extractId(item.shiftId);
    const uId = extractId(item.userId);
    if (!item.date || !sId || !uId) continue;
    const shift = shiftMap[sId];
    const member = memberMap[uId];
    if (!shift || !member) continue;

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

    // 1. Tính toán lương tự động cho từng ca
    const { processedAssignments, salarySummary } = await processAssignmentsAndSalary(
      storeId,
      assignments
    );

    // 2. Tìm hoặc tạo bản ghi lịch tuần
    let schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    });

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

    let schedule = await Schedule.findOne({
      storeId,
      week: Number(week),
      year: Number(year),
    });

    let processedData;

    // Nếu người dùng gửi kèm assignments mới trước khi bấm xuất bản
    if (Array.isArray(assignments)) {
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

    return res.status(200).json({
      success: true,
      message: `Xuất bản lịch Tuần ${week}/${year} thành công! Đã gửi email thông báo chi tiết lịch trực kèm tiền lương đến ${recipients.length} nhân viên.`,
      schedule,
      salarySummary: processedData.salarySummary,
      emailsSent: emailResults,
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
