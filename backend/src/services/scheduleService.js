import Store from '../models/Store.js';
import StoreMember from '../models/StoreMember.js';
import Shift from '../models/Shift.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import {
  extractId,
  getTodayDateString,
  isShiftTimePassed,
  isShiftStartedOrPassed,
  checkShiftOverlap,
  getCurrentVNTime,
  timeToMinutes,
} from '../utils/timeScheduleHelpers.js';
import { sendMissedShiftEmail } from './emailService.js';

/**
 * Service: Xác thực bảo toàn ca đã qua (Immutability Validation)
 * TUYỆT ĐỐI KHÔNG THỂ XÓA, SỬA HOẶC THAY ĐỔI CA ĐÃ QUA
 */
export const validatePassedShiftImmutability = async (
  storeId,
  rawAssignments,
  existingAssignments = [],
  isPublishedSchedule = false
) => {
  const shifts = await Shift.find({ storeId });
  const shiftMap = {};
  shifts.forEach((s) => {
    shiftMap[s._id.toString()] = s;
  });

  const members = await StoreMember.find({ storeId }).populate('userId', 'fullName');
  const memberMap = {};
  members.forEach((m) => {
    if (m.userId) {
      memberMap[m.userId._id.toString()] = m;
    }
  });

  const todayStr = getTodayDateString();

  // Danh sách các ca đã qua trong DB
  const existingKeySet = new Set();
  const existingPassedList = [];

  for (const a of existingAssignments) {
    const sId = extractId(a.shiftId);
    const uId = extractId(a.userId);
    const shift = shiftMap[sId];
    const key = `${a.date}_${sId}_${uId}`;
    existingKeySet.add(key);

    if (shift && isShiftTimePassed(a.date, shift)) {
      existingPassedList.push({
        date: a.date,
        shiftId: sId,
        userId: uId,
        shiftName: shift.name,
        timeRange: `${shift.startTime} - ${shift.endTime}`,
        key,
      });
    }
  }

  // Tập hợp các ca mới gửi lên
  const incomingKeySet = new Set();
  for (const item of rawAssignments) {
    const sId = extractId(item.shiftId);
    const uId = extractId(item.userId);
    const key = `${item.date}_${sId}_${uId}`;
    incomingKeySet.add(key);
  }

  // 1. KIỂM TRA BỊ XÓA: Chỉ áp dụng khi lịch ĐÃ XUẤT BẢN (PUBLISHED)
  // Nếu là lịch nháp (DRAFT), quản lý có quyền bỏ các ca nháp ở ngày shop nghỉ mà không bị lỗi
  if (isPublishedSchedule) {
    for (const passed of existingPassedList) {
      if (!incomingKeySet.has(passed.key)) {
        const member = memberMap[passed.userId];
        const empName = member?.userId?.fullName || 'nhân viên';
        const err = new Error(
          `Không thể xóa ca làm việc đã kết thúc của lịch đã xuất bản: Ca "${passed.shiftName}" (${passed.timeRange}) ngày ${passed.date} của nhân viên "${empName}" đã diễn ra. Hệ thống khóa các ca đã qua để bảo toàn giờ làm và tiền lương của nhân viên!`
        );
        err.statusCode = 400;
        throw err;
      }
    }
  }

  // 2. KIỂM TRA THÊM MỚI HOẶC SỬA: Tuyệt đối không được phép thêm mới hay đổi nhân viên vào một ca đã qua
  for (const item of rawAssignments) {
    const sId = extractId(item.shiftId);
    const uId = extractId(item.userId);
    const shift = shiftMap[sId];

    if (shift && isShiftTimePassed(item.date, shift)) {
      const key = `${item.date}_${sId}_${uId}`;
      if (!existingKeySet.has(key)) {
        const err = new Error(
          `Không thể sửa hoặc thêm mới vào ca làm việc đã kết thúc: Ca "${shift.name}" (${shift.startTime} - ${shift.endTime}) ngày ${item.date} đã qua giờ làm. Không thể thay đổi người trực ca đã hoàn thành!`
        );
        err.statusCode = 400;
        throw err;
      }
    } else if (item.date && item.date < todayStr) {
      const key = `${item.date}_${sId}_${uId}`;
      if (!existingKeySet.has(key)) {
        const err = new Error(
          `Lỗi xếp lịch: Ngày ${item.date} đã qua trong quá khứ. Hệ thống chỉ cho phép xếp lịch cho ngày hiện tại và tương lai!`
        );
        err.statusCode = 400;
        throw err;
      }
    }
  }
};

/**
 * Service: Xử lý tính toán tiền lương cho từng ca và tổng kết lương
 */
export const processAssignmentsAndSalary = async (storeId, rawAssignments) => {
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

    // Không cho phép xếp Chủ cửa hàng (ADMIN) vào ca làm việc
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

    const isMissed = item.attendanceStatus === 'MISSED';
    const hours = shift.durationHours || 0;
    const wage =
      item.hourlyWage !== undefined && !isNaN(Number(item.hourlyWage))
        ? Number(item.hourlyWage)
        : member.hourlyWage || 0;
    const totalPay = isMissed ? 0 : Math.round(hours * wage);

    processedAssignments.push({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      shiftId: shift._id,
      userId: member.userId._id,
      hourlyWage: wage,
      hours: hours,
      totalPay: totalPay,
      attendanceStatus: isMissed ? 'MISSED' : 'COMPLETED',
      missedReason: item.missedReason || '',
      evaluatedAt: item.evaluatedAt || null,
      evaluatedBy: item.evaluatedBy || null,
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
        completedShifts: 0,
        missedShifts: 0,
        shifts: [],
      };
    }

    if (!isMissed) {
      salaryMap[uid].totalHours += hours;
      salaryMap[uid].totalSalary += totalPay;
      salaryMap[uid].completedShifts += 1;
    } else {
      salaryMap[uid].missedShifts += 1;
    }
    salaryMap[uid].shiftCount += 1;
    salaryMap[uid].shifts.push({
      date: item.date,
      dayOfWeek: item.dayOfWeek,
      shiftName: shift.name,
      timeRange: `${shift.startTime} - ${shift.endTime}`,
      hours: hours,
      totalPay: totalPay,
      attendanceStatus: isMissed ? 'MISSED' : 'COMPLETED',
      missedReason: item.missedReason || '',
    });
  }

  return {
    processedAssignments,
    salarySummary: Object.values(salaryMap),
    salaryMap,
  };
};

/**
 * Service: Tạo bảng tổng kết lương từ danh sách assignments đã lưu trong DB
 */
export const calculateSalarySummaryFromAssignments = (assignments) => {
  const salaryMap = {};
  assignments.forEach((a) => {
    if (!a.userId) return;
    const uid = a.userId._id ? a.userId._id.toString() : a.userId.toString();
    if (!salaryMap[uid]) {
      salaryMap[uid] = {
        userId: a.userId._id || a.userId,
        fullName: a.userId.fullName || a.userId.name || 'Nhân viên',
        email: a.userId.email || '',
        hourlyWage: a.hourlyWage,
        totalHours: 0,
        totalSalary: 0,
        shiftCount: 0,
        completedShifts: 0,
        missedShifts: 0,
      };
    }
    const isMissed = a.attendanceStatus === 'MISSED';
    if (!isMissed) {
      salaryMap[uid].totalHours += a.hours || 0;
      salaryMap[uid].totalSalary += a.totalPay || 0;
      salaryMap[uid].completedShifts += 1;
    } else {
      salaryMap[uid].missedShifts += 1;
    }
    salaryMap[uid].shiftCount += 1;
  });
  return Object.values(salaryMap);
};

/**
 * Service: Thuật toán tự động xếp ca làm việc thông minh & cân bằng tải (Fair Scheduling)
 */
export const generateAutoSchedule = async ({
  storeId,
  week,
  year,
  startDate,
  endDate,
  days,
  staffPerShift = 1,
  maxShiftsPerDay = 1,
  preserveExisting = false,
  existingAssignments = [],
  userId,
}) => {
  const shifts = await Shift.find({ storeId, isActive: { $ne: false } }).sort({ startTime: 1 });
  if (!shifts || shifts.length === 0) {
    const err = new Error('Cửa hàng chưa có ca làm việc nào. Vui lòng tạo ca làm việc trước khi tự động chia ca.');
    err.statusCode = 400;
    throw err;
  }

  const store = await Store.findById(storeId);
  const activeMembers = await StoreMember.find({ storeId, status: 'ACTIVE' }).populate(
    'userId',
    'fullName email systemRole'
  );
  const validMembers = activeMembers.filter(
    (m) =>
      m.userId &&
      m.userId._id &&
      m.roleInStore !== 'ADMIN' &&
      store.ownerId.toString() !== m.userId._id.toString()
  );

  if (validMembers.length === 0) {
    const err = new Error('Cửa hàng chưa có nhân viên hoặc quản lý nào để chia ca làm việc. Vui lòng thêm nhân viên trước khi tự động chia ca.');
    err.statusCode = 400;
    throw err;
  }

  // Chuẩn bị danh sách 7 ngày trong tuần
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

  const memberStats = {};
  validMembers.forEach((m) => {
    const uId = m.userId._id.toString();
    memberStats[uId] = {
      member: m,
      userId: m.userId._id,
      hourlyWage: m.hourlyWage || 20000,
      shiftCount: 0,
      totalHours: 0,
      shiftsByDate: {},
    };
  });

  const shiftMap = {};
  shifts.forEach((s) => {
    shiftMap[s._id.toString()] = s;
  });

  let workingAssignments = [];

  // Tìm lịch hiện có trong DB để bảo toàn tuyệt đối toàn bộ ca đã qua
  const existingSchedule = await Schedule.findOne({
    storeId,
    week: Number(week),
    year: Number(year),
  });

  const isPublishedSchedule = existingSchedule?.status === 'PUBLISHED';
  const passedKeySet = new Set();

  // 1. Chỉ tự động giữ lại các ca đã qua NẾU:
  // - Lịch này ĐÃ ĐƯỢC XUẤT BẢN (PUBLISHED): nhân viên đã làm việc thực tế
  // - HOẶC người dùng bật tùy chọn "Giữ lại các ca đã xếp thủ công hiện tại" (preserveExisting === true)
  // Nếu là lịch nháp (DRAFT) và preserveExisting === false: BỎ QUA toàn bộ ngày/ca đã qua, để trống ngày nghỉ / ca đã qua, không xếp và không tính lương!
  if (isPublishedSchedule || preserveExisting) {
    const sourceAssignments = isPublishedSchedule
      ? (existingSchedule?.assignments || [])
      : (existingAssignments || []);

    for (const item of sourceAssignments) {
      const uId = extractId(item.userId);
      const sId = extractId(item.shiftId);
      const shift = shiftMap[sId];
      const stat = memberStats[uId];
      if (shift && isShiftTimePassed(item.date, shift)) {
        const key = `${item.date}_${sId}_${uId}`;
        if (!passedKeySet.has(key)) {
          passedKeySet.add(key);
          if (stat) {
            if (!stat.shiftsByDate[item.date]) stat.shiftsByDate[item.date] = [];
            stat.shiftsByDate[item.date].push(shift);
            stat.shiftCount += 1;
            stat.totalHours += shift.durationHours || 4;
          }
          workingAssignments.push({
            date: item.date,
            dayOfWeek: item.dayOfWeek,
            shiftId: shift._id,
            userId: uId,
            hourlyWage: item.hourlyWage || (stat ? stat.hourlyWage : 20000),
          });
        }
      }
    }
  }

  // 2. Nếu chọn giữ lại các ca đã xếp thủ công (chỉ áp dụng cho ca chưa qua)
  if (preserveExisting && Array.isArray(existingAssignments) && existingAssignments.length > 0) {
    for (const item of existingAssignments) {
      const uId = extractId(item.userId);
      const sId = extractId(item.shiftId);
      const shift = shiftMap[sId];
      const stat = memberStats[uId];
      const key = `${item.date}_${sId}_${uId}`;
      if (passedKeySet.has(key)) continue;

      if (shift && stat && item.date && !isShiftTimePassed(item.date, shift)) {
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
  const todayStr = getTodayDateString();
  const currentVNTime = getCurrentVNTime();
  const currentVNMins = timeToMinutes(currentVNTime);

  // 3. Thuật toán phân bổ ca tối ưu
  for (const day of weekDays) {
    // Bỏ qua các ngày đã qua trong quá khứ (ví dụ: đã qua Thứ Hai thì bỏ qua Thứ Hai)
    if (day.date < todayStr) continue;

    for (const shift of shifts) {
      // Bỏ qua các ca đã qua trong quá khứ
      if (isShiftTimePassed(day.date, shift)) continue;

      // Nếu là hôm nay: bỏ qua ca nếu ca đã bắt đầu hoặc kết thúc (ví dụ: qua ca sáng Thứ Ba thì bỏ qua ca sáng)
      if (day.date === todayStr) {
        const startMins = timeToMinutes(shift.startTime);
        if (currentVNMins >= startMins) continue;
      }

      const sId = shift._id.toString();
      const currentAssigned = workingAssignments.filter(
        (a) => a.date === day.date && a.shiftId.toString() === sId
      );
      let needed = targetStaffPerShift - currentAssigned.length;

      while (needed > 0) {
        const eligibleCandidates = validMembers.filter((m) => {
          const uId = m.userId._id.toString();
          const stat = memberStats[uId];
          const dateShifts = stat.shiftsByDate[day.date] || [];

          if (dateShifts.some((s) => s._id.toString() === sId)) return false;
          if (dateShifts.length >= maxPerDay) return false;
          if (dateShifts.some((s) => checkShiftOverlap(shift, s))) return false;

          return true;
        });

        let candidatePool = eligibleCandidates;
        if (candidatePool.length === 0 && maxPerDay < shifts.length) {
          candidatePool = validMembers.filter((m) => {
            const uId = m.userId._id.toString();
            const stat = memberStats[uId];
            const dateShifts = stat.shiftsByDate[day.date] || [];

            if (dateShifts.some((s) => s._id.toString() === sId)) return false;
            if (dateShifts.some((s) => checkShiftOverlap(shift, s))) return false;

            return true;
          });
        }

        if (candidatePool.length === 0) break;

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

        workingAssignments.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          shiftId: shift._id,
          userId: chosenMember.userId._id,
          hourlyWage: chosenStat.hourlyWage,
        });

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

  // Xác thực bảo toàn ca đã qua & tính toán lại lương chi tiết
  const baselineAssignments = [...(existingSchedule?.assignments || [])];
  if (Array.isArray(existingAssignments)) {
    const baselineKeys = new Set(
      baselineAssignments.map((a) => `${a.date}_${extractId(a.shiftId)}_${extractId(a.userId)}`)
    );
    for (const ea of existingAssignments) {
      const key = `${ea.date}_${extractId(ea.shiftId)}_${extractId(ea.userId)}`;
      if (!baselineKeys.has(key)) {
        baselineAssignments.push(ea);
      }
    }
  }

  await validatePassedShiftImmutability(
    storeId,
    workingAssignments,
    baselineAssignments,
    isPublishedSchedule
  );

  const { processedAssignments, salarySummary } = await processAssignmentsAndSalary(
    storeId,
    workingAssignments
  );

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

  await schedule.populate([
    { path: 'assignments.shiftId', select: 'name startTime endTime durationHours color' },
    { path: 'assignments.userId', select: 'fullName email systemRole' },
  ]);

  return { schedule, salarySummary };
};

/**
 * Service: Đánh giá ca làm việc (Hoàn thành hoặc Không hoàn thành/Vắng)
 * - Chỉ ca đang diễn ra hoặc đã kết thúc mới được đánh giá. Ca tương lai bị chặn.
 * - Khi ca bị đánh dấu MISSED: lương ca đó thành 0, trừ khỏi tổng lương tuần của nhân viên.
 * - Gửi email thông báo cho nhân viên nếu bị đánh dấu MISSED.
 */
export const evaluateShiftAttendance = async ({
  storeId,
  week,
  year,
  date,
  shiftId,
  userId,
  attendanceStatus, // 'MISSED' hoặc 'COMPLETED'
  missedReason,
  evaluatorId,
}) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const err = new Error('Không tìm thấy cửa hàng.');
    err.statusCode = 404;
    throw err;
  }

  const shift = await Shift.findById(shiftId);
  if (!shift) {
    const err = new Error('Không tìm thấy thông tin ca làm việc.');
    err.statusCode = 404;
    throw err;
  }

  // 1. Kiểm tra ràng buộc thời gian:
  // "lưu ý chỉ ca đang diễn ra hoặc quá khứ mới được, còn ca tương lai thì không được quyền đánh giá."
  if (!isShiftStartedOrPassed(date, shift)) {
    const err = new Error(
      `Không thể đánh giá ca làm việc trong tương lai: Ca "${shift.name}" (${shift.startTime} - ${shift.endTime}) ngày ${date} chưa diễn ra. Chỉ được đánh giá khi ca đang diễn ra hoặc đã kết thúc!`
    );
    err.statusCode = 400;
    throw err;
  }

  // 2. Tìm lịch làm việc của tuần
  let schedule = await Schedule.findOne({
    storeId,
    week: Number(week),
    year: Number(year),
  });

  if (!schedule) {
    const err = new Error('Không tìm thấy lịch làm việc của tuần này.');
    err.statusCode = 404;
    throw err;
  }

  // 3. Tìm phân công ca cụ thể
  const uIdStr = String(userId);
  const sIdStr = String(shiftId);
  const targetAssignment = schedule.assignments.find(
    (a) => a.date === date && extractId(a.shiftId) === sIdStr && extractId(a.userId) === uIdStr
  );

  if (!targetAssignment) {
    const err = new Error('Nhân viên này không được phân công trong ca làm việc được chọn.');
    err.statusCode = 404;
    throw err;
  }

  const newStatus = attendanceStatus === 'MISSED' ? 'MISSED' : 'COMPLETED';
  targetAssignment.attendanceStatus = newStatus;
  targetAssignment.missedReason = newStatus === 'MISSED' ? (missedReason || '').trim() : '';
  targetAssignment.evaluatedAt = new Date();
  targetAssignment.evaluatedBy = evaluatorId;

  const hours = targetAssignment.hours || shift.durationHours || 4;
  const wage = targetAssignment.hourlyWage || 20000;
  const fullPay = Math.round(hours * wage);

  if (newStatus === 'MISSED') {
    targetAssignment.totalPay = 0;
  } else {
    targetAssignment.totalPay = fullPay;
  }

  await schedule.save();

  // Populate lại để trả về frontend
  await schedule.populate([
    { path: 'assignments.shiftId', select: 'name startTime endTime durationHours color' },
    { path: 'assignments.userId', select: 'fullName email systemRole' },
    { path: 'assignments.evaluatedBy', select: 'fullName email' },
  ]);

  const salarySummary = calculateSalarySummaryFromAssignments(schedule.assignments);

  // 4. Gửi email thông báo nếu đánh dấu MISSED
  let emailResult = null;
  if (newStatus === 'MISSED') {
    const targetMember = await User.findById(userId);
    const toEmail = targetMember?.email;
    const employeeName = targetMember?.fullName || 'Nhân viên';

    // Tính lương tuần sau cập nhật của nhân viên này
    const empSalaryInfo = salarySummary.find(
      (s) => String(s.userId._id || s.userId) === uIdStr
    );
    const updatedTotalSalary = empSalaryInfo ? empSalaryInfo.totalSalary : 0;

    if (toEmail) {
      emailResult = await sendMissedShiftEmail({
        toEmail,
        employeeName,
        storeName: store.name,
        shiftName: shift.name,
        timeRange: `${shift.startTime} - ${shift.endTime}`,
        date: targetAssignment.date,
        dayOfWeek: targetAssignment.dayOfWeek,
        deductedHours: hours,
        deductedPay: fullPay,
        reason: targetAssignment.missedReason,
        updatedTotalSalary,
      });
    }
  }

  return {
    schedule,
    salarySummary,
    updatedAssignment: targetAssignment,
    emailResult,
  };
};
