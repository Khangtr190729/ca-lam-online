import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Info,
  X,
  FileCheck,
  Sparkles,
  Users,
  Store as StoreIcon,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleApi, shiftApi, memberApi, storeApi } from '../services/api';
import {
  getMondayOfWeek,
  getDaysOfWeek,
  addWeeks,
  formatWeekRange,
  formatVND,
  formatDateToISO,
  getWeekNumberAndYear,
  checkShiftOverlap
} from '../utils/formatters';

// Helpers chuẩn hóa ID về dạng chuỗi an toàn tuyệt đối
export const getUserId = (userOrId) => {
  if (!userOrId) return '';
  if (typeof userOrId === 'object') {
    return String(userOrId._id || userOrId.id || userOrId.userId || '');
  }
  return String(userOrId);
};

export const getShiftId = (shiftOrId) => {
  if (!shiftOrId) return '';
  if (typeof shiftOrId === 'object') {
    return String(shiftOrId._id || shiftOrId.id || shiftOrId.shiftId || '');
  }
  return String(shiftOrId);
};

// Chuyển đổi định dạng giờ "HH:mm" sang số phút
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Lấy giờ hiện tại theo định dạng HH:mm chuẩn múi giờ Việt Nam
export const getCurrentVNTime = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};

// Kiểm tra ca làm việc đã kết thúc/đã qua hay chưa (kể cả ca sáng hôm nay đã làm rồi)
export const isShiftPassedOrCompleted = (dateStr, shift) => {
  if (!dateStr || !shift) return false;
  const todayStr = formatDateToISO(new Date());

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
  // Ca đã kết thúc khi giờ hiện tại >= giờ kết thúc của ca
  return currentMinutes >= endMinutes;
};

export const ScheduleManagementPage = () => {
  const { store, user, roleInStore, refreshUser } = useAuth();
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek());
  const [shifts, setShifts] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState('DRAFT'); // 'DRAFT' | 'PUBLISHED'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Auto-schedule Modal State
  const [autoScheduleModalOpen, setAutoScheduleModalOpen] = useState(false);
  const [autoConfig, setAutoConfig] = useState({
    staffPerShift: 1,
    maxShiftsPerDay: 1,
    preserveExisting: false
  });
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Create initial store modal state if owner doesn't have a store yet
  const [createStoreModal, setCreateStoreModal] = useState(false);
  const [newStoreForm, setNewStoreForm] = useState({ name: '', address: '' });
  const [creatingStore, setCreatingStore] = useState(false);

  // Modal State for Managing Shift Roster (supports multiple employees per shift)
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    date: '',
    shiftId: '',
    selectedUserId: ''
  });

  const daysOfWeek = useMemo(() => getDaysOfWeek(currentMonday), [currentMonday]);
  const { week, year } = useMemo(() => getWeekNumberAndYear(currentMonday), [currentMonday]);
  const todayDateStr = useMemo(() => formatDateToISO(new Date()), []);
  const isPastWeek = useMemo(
    () => Boolean(daysOfWeek[6]?.dateStr && daysOfWeek[6].dateStr < todayDateStr),
    [daysOfWeek, todayDateStr]
  );

  // Load shifts and members for the current store
  const loadStoreData = useCallback(async () => {
    if (!store?._id) return;
    try {
      const [shiftsRes, membersRes] = await Promise.all([
        shiftApi.getShifts(store._id),
        memberApi.getMembers(store._id)
      ]);
      if (shiftsRes.success) setShifts(shiftsRes.shifts || shiftsRes.data || []);
      if (membersRes.success) {
        const rawMembers = membersRes.members || membersRes.data || [];
        // Lọc bỏ hoàn toàn Chủ cửa hàng (ADMIN) - Chỉ cho phép xếp ca cho Quản lý và Nhân viên
        const assignable = rawMembers.filter((m) => {
          const uId = String(m.userId?._id || m.userId || m.user?._id || '');
          const isStoreOwner = m.isOwner || m.roleInStore === 'ADMIN' || (store?.ownerId && String(store.ownerId) === uId);
          return !isStoreOwner;
        });

        const normalized = assignable.map((m) => {
          const userObj = typeof m.userId === 'object' && m.userId !== null ? m.userId : (m.user || {});
          const actualUserId = String(userObj._id || (typeof m.userId === 'string' ? m.userId : (m.user?._id || m._id)));
          const actualName = userObj.fullName || m.fullName || userObj.name || 'Nhân viên';
          const actualEmail = userObj.email || m.email || '';
          return {
            ...m,
            _id: String(m.memberId || m._id),
            userId: actualUserId,
            hourlyWage: m.hourlyWage || 20000,
            fullName: actualName,
            email: actualEmail,
            user: {
              _id: actualUserId,
              name: actualName,
              email: actualEmail
            }
          };
        });
        setMembers(normalized);
      }
    } catch (err) {
      console.error('Error loading store meta:', err);
    }
  }, [store?._id]);

  // Load weekly schedule assignments
  const loadSchedule = useCallback(async () => {
    if (!store?._id) return;
    try {
      setLoading(true);
      const res = await scheduleApi.getWeeklySchedule(store._id, week, year);
      if (res.success && (res.schedule || res.assignments)) {
        const sched = res.schedule || res;
        setScheduleStatus(sched.status || 'DRAFT');
        const rawAssignments = sched.assignments || res.assignments || [];
        const validAssignments = rawAssignments.filter((a) => {
          const uId = getUserId(a.userId);
          const isOwner = store?.ownerId && String(store.ownerId) === uId;
          return !isOwner;
        });
        const formatted = validAssignments.map((a) => {
          const sId = getShiftId(a.shiftId);
          const uId = getUserId(a.userId);
          const uName =
            (typeof a.userId === 'object' && a.userId !== null
              ? (a.userId.fullName || a.userId.name)
              : '') || 'Nhân viên';
          return {
            date: a.date,
            dayOfWeek: a.dayOfWeek,
            shiftId: sId,
            userId: uId,
            userObj: { _id: uId, name: uName },
            shiftObj: typeof a.shiftId === 'object' && a.shiftId !== null ? a.shiftId : null
          };
        });
        setAssignments(formatted);
      } else {
        setAssignments([]);
        setScheduleStatus('DRAFT');
      }
    } catch (err) {
      console.error('Error loading schedule:', err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [store?._id, week, year]);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Handle week navigation
  const handlePrevWeek = () => setCurrentMonday((prev) => addWeeks(prev, -1));
  const handleNextWeek = () => setCurrentMonday((prev) => addWeeks(prev, 1));
  const handleCurrentWeek = () => setCurrentMonday(getMondayOfWeek());

  // Check if current week is today's week
  const isCurrentWeek = currentMonday === getMondayOfWeek();

  // Create store for new owner
  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreForm.name.trim()) return;
    try {
      setCreatingStore(true);
      const res = await storeApi.createStore(newStoreForm);
      if (res.success) {
        setCreateStoreModal(false);
        await refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi tạo cửa hàng' });
    } finally {
      setCreatingStore(false);
    }
  };

  // Kiểm tra ca bị trùng khung giờ của một nhân viên trong ngày chỉ định
  const getConflictingShift = useCallback(
    (userId, dateStr, targetShiftId) => {
      if (!userId || !dateStr || !targetShiftId) return null;
      const tShiftId = getShiftId(targetShiftId);
      const uId = getUserId(userId);
      const targetShift = shifts.find((s) => getShiftId(s._id) === tShiftId);
      if (!targetShift) return null;

      const otherAssignments = assignments.filter(
        (a) => a.date === dateStr && getUserId(a.userId) === uId && getShiftId(a.shiftId) !== tShiftId
      );

      for (const a of otherAssignments) {
        const otherShift = shifts.find((s) => getShiftId(s._id) === getShiftId(a.shiftId)) || a.shiftObj;
        if (otherShift && checkShiftOverlap(targetShift, otherShift)) {
          return otherShift;
        }
      }
      return null;
    },
    [assignments, shifts]
  );

  // Kiểm tra xem một phân công cụ thể có đang bị xung đột trùng ca trên bảng không
  const getAssignmentConflict = useCallback(
    (assignment) => {
      if (!assignment || !assignment.userId || !assignment.date) return null;
      const targetUserId = getUserId(assignment.userId);
      const targetShiftId = getShiftId(assignment.shiftId);
      const targetShift = shifts.find((s) => getShiftId(s._id) === targetShiftId) || assignment.shiftObj;
      if (!targetShift) return null;

      const conflicting = assignments.find((a) => {
        if (
          a === assignment ||
          a.date !== assignment.date ||
          getUserId(a.userId) !== targetUserId
        ) {
          return false;
        }
        // Nếu trùng cùng 1 ca: coi là conflict duplicate
        if (getShiftId(a.shiftId) === targetShiftId) {
          return true;
        }
        const otherShift = shifts.find((s) => getShiftId(s._id) === getShiftId(a.shiftId)) || a.shiftObj;
        return otherShift && checkShiftOverlap(targetShift, otherShift);
      });

      if (conflicting) {
        return shifts.find((s) => getShiftId(s._id) === getShiftId(conflicting.shiftId)) || conflicting.shiftObj;
      }
      return null;
    },
    [assignments, shifts]
  );

  // Danh sách các ca bị trùng lặp thời gian của cùng một nhân viên trong tuần
  const scheduleConflicts = useMemo(() => {
    const conflicts = [];
    assignments.forEach((a1, idx1) => {
      const uId1 = getUserId(a1.userId);
      const sId1 = getShiftId(a1.shiftId);
      if (!uId1 || !a1.date || !sId1) return;
      const shift1 = shifts.find((s) => getShiftId(s._id) === sId1) || a1.shiftObj;
      if (!shift1) return;

      assignments.forEach((a2, idx2) => {
        if (idx1 >= idx2) return;
        const uId2 = getUserId(a2.userId);
        const sId2 = getShiftId(a2.shiftId);
        // Chỉ xét xung đột nếu là CÙNG 1 NHÂN VIÊN trong CÙNG 1 NGÀY
        if (a1.date !== a2.date || uId1 !== uId2) return;

        const shift2 = shifts.find((s) => getShiftId(s._id) === sId2) || a2.shiftObj;
        if (!shift2) return;

        const emp = members.find((m) => getUserId(m.user?._id || m.userId) === uId1);
        const empName = emp?.user?.name || emp?.fullName || a1.userObj?.name || 'Nhân viên';

        // 1. Trùng lặp do thêm 2 lần cùng 1 người vào 1 ca
        if (sId1 === sId2) {
          conflicts.push({
            date: a1.date,
            userId: uId1,
            employeeName: empName,
            shift1,
            shift2,
            isDuplicate: true,
            message: `Lỗi trùng lặp: Nhân viên "${empName}" đã được phân công 2 lần vào ca "${shift1.name}" ngày ${a1.date}!`
          });
          return;
        }

        // 2. Trùng lặp do 2 ca khác nhau có khung giờ giao thoa
        if (checkShiftOverlap(shift1, shift2)) {
          conflicts.push({
            date: a1.date,
            userId: uId1,
            employeeName: empName,
            shift1,
            shift2,
            isDuplicate: false,
            message: `Lỗi trùng ca: Nhân viên "${empName}" bị trùng giờ làm việc vào ngày ${a1.date} giữa ca "${shift1.name}" (${shift1.startTime} - ${shift1.endTime}) và ca "${shift2.name}" (${shift2.startTime} - ${shift2.endTime})!`
          });
        }
      });
    });
    return conflicts;
  }, [assignments, shifts, members]);

  // Hàm xác thực toàn bộ bảng phân ca không có xung đột giờ làm
  const validateAssignmentsNoOverlap = useCallback(() => {
    if (scheduleConflicts.length > 0) {
      const first = scheduleConflicts[0];
      return {
        hasError: true,
        message: first.message || `Lỗi trùng ca: Nhân viên "${first.employeeName}" bị trùng giờ làm việc vào ngày ${first.date}!`
      };
    }
    return { hasError: false };
  }, [scheduleConflicts]);

  // Mở modal quản lý danh sách nhân viên trong ca làm việc
  const handleOpenAssignModal = (dateStr, shiftId) => {
    const currentShiftId = getShiftId(shiftId);
    const targetShift = shifts.find((s) => getShiftId(s._id) === currentShiftId);
    const currentCellAssignments = assignments.filter(
      (a) => a.date === dateStr && getShiftId(a.shiftId) === currentShiftId
    );

    const isPassed = isShiftPassedOrCompleted(dateStr, targetShift);

    // Nếu ca đã kết thúc/đã qua và ô trống chưa xếp ai, không cho phép mở phân ca
    if (isPassed && currentCellAssignments.length === 0) {
      setFeedback({
        type: 'error',
        message: `Ca làm việc "${targetShift?.name || 'Ca làm'}" ngày ${dateStr} đã kết thúc. Hệ thống không cho phép xếp lịch cho các ca đã qua trong quá khứ!`
      });
      return;
    }

    setAssignModal({
      isOpen: true,
      date: dateStr,
      shiftId: currentShiftId,
      selectedUserId: ''
    });
  };

  // Thêm một nhân viên vào ca làm việc
  const handleAddEmployeeToShift = () => {
    if (!assignModal.selectedUserId || !assignModal.date || !assignModal.shiftId) return;
    const uid = getUserId(assignModal.selectedUserId);
    const sid = getShiftId(assignModal.shiftId);
    const targetShift = shifts.find((s) => getShiftId(s._id) === sid);

    // Tuyệt đối không cho phép thêm ca đã kết thúc/đã qua (kể cả ca sáng hôm nay đã làm rồi)
    if (isShiftPassedOrCompleted(assignModal.date, targetShift)) {
      setFeedback({
        type: 'error',
        message: `Ca làm việc "${targetShift?.name || 'Ca làm'}" ngày ${assignModal.date} đã kết thúc. Hệ thống đã khóa ca để bảo toàn giờ làm và tiền lương của nhân viên!`
      });
      return;
    }

    // 0. Kiểm tra không được phân công Chủ cửa hàng (ADMIN) vào ca làm việc
    if (store?.ownerId && String(store.ownerId) === uid) {
      setFeedback({
        type: 'error',
        message: 'Chủ cửa hàng (ADMIN) không được phân công vào ca làm việc.'
      });
      return;
    }

    // 1. Kiểm tra nhân viên này đã có trong ca này chưa
    const alreadyIn = assignments.some(
      (a) => a.date === assignModal.date && getShiftId(a.shiftId) === sid && getUserId(a.userId) === uid
    );
    if (alreadyIn) {
      setFeedback({
        type: 'error',
        message: 'Nhân viên này đã được phân công vào ca này rồi! Không thể thêm cùng một nhân viên nhiều lần vào cùng một ca.'
      });
      return;
    }

    // 2. Kiểm tra xung đột với ca khác của cùng nhân viên trong ngày
    const conflict = getConflictingShift(uid, assignModal.date, sid);
    if (conflict) {
      const selectedMember = members.find((m) => getUserId(m.user?._id || m.userId) === uid);
      const name = selectedMember?.user?.name || selectedMember?.fullName || 'Nhân viên';
      setFeedback({
        type: 'error',
        message: `Không thể phân ca: Nhân viên "${name}" đã có ca "${conflict.name}" (${conflict.startTime} - ${conflict.endTime}) trong cùng khung giờ ngày ${assignModal.date}!`
      });
      return;
    }

    const selectedMember = members.find((m) => getUserId(m.user?._id || m.userId) === uid);
    const day = daysOfWeek.find((d) => d.dateStr === assignModal.date);

    const newAssignment = {
      date: assignModal.date,
      dayOfWeek: day?.dayName || 'Thứ Hai',
      shiftId: sid,
      userId: uid,
      userObj: selectedMember?.user || { _id: uid, name: 'Nhân viên' },
      shiftObj: targetShift
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setAssignModal((prev) => ({ ...prev, selectedUserId: '' }));
  };

  // Xóa một nhân viên cụ thể khỏi ca
  const handleRemoveSingleAssignment = (dateStr, shiftId, userId) => {
    const sId = getShiftId(shiftId);
    const targetShift = shifts.find((s) => getShiftId(s._id) === sId);

    // Không cho phép xóa ca đã kết thúc/đã qua (bảo toàn quyền lợi và lương nhân viên)
    if (isShiftPassedOrCompleted(dateStr, targetShift)) {
      setFeedback({
        type: 'error',
        message: `Ca làm việc "${targetShift?.name || 'Ca làm'}" ngày ${dateStr} đã kết thúc. Hệ thống đã khóa ca để bảo toàn giờ làm và tiền lương của nhân viên, không thể xóa!`
      });
      return;
    }

    const uId = getUserId(userId);
    setAssignments((prev) =>
      prev.filter(
        (a) => !(a.date === dateStr && getShiftId(a.shiftId) === sId && getUserId(a.userId) === uId)
      )
    );
  };

  // Xóa toàn bộ nhân viên khỏi ca này
  const handleClearShiftAssignments = (dateStr, shiftId) => {
    const sId = getShiftId(shiftId);
    const targetShift = shifts.find((s) => getShiftId(s._id) === sId);

    // Không cho phép xóa ca đã kết thúc/đã qua (bảo toàn quyền lợi và lương nhân viên)
    if (isShiftPassedOrCompleted(dateStr, targetShift)) {
      setFeedback({
        type: 'error',
        message: `Ca làm việc "${targetShift?.name || 'Ca làm'}" ngày ${dateStr} đã kết thúc. Hệ thống đã khóa ca để bảo toàn giờ làm và tiền lương của nhân viên, không thể xóa!`
      });
      return;
    }

    setAssignments((prev) =>
      prev.filter(
        (a) => !(a.date === dateStr && getShiftId(a.shiftId) === sId)
      )
    );
  };

  // Save Draft Schedule
  const handleSaveDraft = async () => {
    if (!store?._id) return;
    if (isPastWeek) {
      setFeedback({
        type: 'error',
        message: 'Tuần này đã kết thúc trong quá khứ. Không thể chỉnh sửa hoặc lưu lịch làm việc.'
      });
      return;
    }
    const validation = validateAssignmentsNoOverlap();
    if (validation.hasError) {
      setFeedback({ type: 'error', message: validation.message });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const payload = {
        week,
        year,
        startDate: currentMonday,
        endDate: daysOfWeek[6]?.dateStr || addWeeks(currentMonday, 1),
        assignments: assignments.map((a) => {
          const day = daysOfWeek.find((d) => d.dateStr === a.date);
          return {
            date: a.date,
            dayOfWeek: day?.dayName || 'Thứ Hai',
            shiftId: getShiftId(a.shiftId),
            userId: getUserId(a.userId)
          };
        })
      };
      const res = await scheduleApi.saveDraft(store._id, payload);
      if (res.success) {
        setScheduleStatus('DRAFT');
        setFeedback({
          type: 'success',
          message: 'Đã lưu bản nháp thành công! Bạn có thể tiếp tục chỉnh sửa.'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể lưu bản nháp' });
    } finally {
      setSaving(false);
    }
  };

  // Auto Generate Schedule (Draft)
  const handleAutoSchedule = async () => {
    if (!store?._id) return;
    if (isPastWeek) {
      setFeedback({
        type: 'error',
        message: 'Tuần này đã kết thúc trong quá khứ. Không thể tự động xếp lịch. Vui lòng chọn tuần hiện tại hoặc tương lai.'
      });
      return;
    }
    if (shifts.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Cửa hàng chưa có ca làm việc nào. Vui lòng tạo ca làm trước khi tự động chia ca.'
      });
      return;
    }
    if (members.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Cửa hàng chưa có nhân viên nào. Vui lòng mời nhân viên vào quán trước khi tự động chia ca.'
      });
      return;
    }

    try {
      setAutoGenerating(true);
      setFeedback(null);

      const payload = {
        week,
        year,
        startDate: currentMonday,
        endDate: daysOfWeek[6]?.dateStr || addWeeks(currentMonday, 1),
        days: daysOfWeek.map((d) => ({
          date: d.dateStr,
          dayOfWeek: d.dayName
        })),
        staffPerShift: Number(autoConfig.staffPerShift) || 1,
        maxShiftsPerDay: Number(autoConfig.maxShiftsPerDay) || 1,
        preserveExisting: Boolean(autoConfig.preserveExisting),
        existingAssignments: autoConfig.preserveExisting
          ? assignments.map((a) => {
              const day = daysOfWeek.find((d) => d.dateStr === a.date);
              return {
                date: a.date,
                dayOfWeek: day?.dayName || 'Thứ Hai',
                shiftId: getShiftId(a.shiftId),
                userId: getUserId(a.userId)
              };
            })
          : []
      };

      const res = await scheduleApi.autoGenerate(store._id, payload);
      if (res.success && res.schedule) {
        setScheduleStatus('DRAFT');
        const rawAssignments = res.schedule.assignments || [];
        const formatted = rawAssignments.map((a) => {
          const sId = getShiftId(a.shiftId);
          const uId = getUserId(a.userId);
          const uName =
            (typeof a.userId === 'object' && a.userId !== null
              ? (a.userId.fullName || a.userId.name)
              : '') || 'Nhân viên';
          return {
            date: a.date,
            dayOfWeek: a.dayOfWeek,
            shiftId: sId,
            userId: uId,
            userObj: { _id: uId, name: uName },
            shiftObj: typeof a.shiftId === 'object' && a.shiftId !== null ? a.shiftId : null
          };
        });
        setAssignments(formatted);
        setAutoScheduleModalOpen(false);
        setFeedback({
          type: 'success',
          message: res.message || 'Đã tự động xếp lịch nháp thành công! Bạn có thể xem lại và chỉnh sửa trước khi xuất bản.'
        });
      }
    } catch (err) {
      console.error('Error auto-generating schedule:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Không thể tự động xếp lịch'
      });
    } finally {
      setAutoGenerating(false);
    }
  };

  // Publish Schedule & Send Emails
  const handleConfirmPublish = async () => {
    if (!store?._id) return;
    if (isPastWeek) {
      setPublishModalOpen(false);
      setFeedback({
        type: 'error',
        message: 'Tuần này đã kết thúc trong quá khứ. Không thể xuất bản lịch làm việc.'
      });
      return;
    }
    const validation = validateAssignmentsNoOverlap();
    if (validation.hasError) {
      setPublishModalOpen(false);
      setFeedback({ type: 'error', message: validation.message });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const payload = {
        week,
        year,
        startDate: currentMonday,
        endDate: daysOfWeek[6]?.dateStr || addWeeks(currentMonday, 1),
        assignments: assignments.map((a) => {
          const day = daysOfWeek.find((d) => d.dateStr === a.date);
          return {
            date: a.date,
            dayOfWeek: day?.dayName || 'Thứ Hai',
            shiftId: getShiftId(a.shiftId),
            userId: getUserId(a.userId)
          };
        })
      };
      const res = await scheduleApi.publish(store._id, payload);
      if (res.success) {
        setScheduleStatus('PUBLISHED');
        setPublishModalOpen(false);
        setFeedback({
          type: res.hasEmailError ? 'warning' : 'success',
          message:
            res.message ||
            'Xuất bản lịch thành công! Email thông báo ca làm đã được gửi tới từng nhân viên.'
        });
      }
    } catch (err) {
      setPublishModalOpen(false);
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi xuất bản lịch' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate Payroll Breakdown per Employee
  const payrollSummary = useMemo(() => {
    const employeeMap = {};

    members.forEach((m) => {
      const uid = getUserId(m.user?._id || m.userId);
      if (uid) {
        employeeMap[uid] = {
          name: m.user?.name || m.fullName,
          email: m.user?.email || m.email,
          hourlyWage: m.hourlyWage || 20000,
          totalShifts: 0,
          totalHours: 0,
          totalWage: 0
        };
      }
    });

    assignments.forEach((a) => {
      const shift = shifts.find((s) => getShiftId(s._id) === getShiftId(a.shiftId)) || a.shiftObj;
      const duration = shift?.durationHours || 4;
      const uId = getUserId(a.userId);
      if (employeeMap[uId]) {
        employeeMap[uId].totalShifts += 1;
        employeeMap[uId].totalHours += duration;
      }
    });

    let storeTotalPayroll = 0;
    let storeTotalHours = 0;
    let storeTotalShifts = assignments.length;

    const list = Object.values(employeeMap)
      .filter((e) => e.totalShifts > 0)
      .map((e) => {
        const wage = e.totalHours * e.hourlyWage;
        e.totalWage = wage;
        storeTotalPayroll += wage;
        storeTotalHours += e.totalHours;
        return e;
      });

    return {
      employees: list,
      storeTotalPayroll,
      storeTotalHours,
      storeTotalShifts
    };
  }, [members, assignments, shifts]);

  // If Store Owner has not created a store yet
  if (!store) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-orange-200/80 shadow-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#EA701B] flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Tạo cửa hàng của bạn
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn vừa tạo tài khoản Chủ cửa hàng. Hãy đặt tên quán và địa chỉ để bắt đầu tạo ca làm và mời nhân sự.
          </p>

          <form onSubmit={handleCreateStore} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên cửa hàng / Quán <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: The Coffee House — Cơ sở 1"
                value={newStoreForm.name}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ quán
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP. HCM"
                value={newStoreForm.address}
                onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
              />
            </div>
            <button
              type="submit"
              disabled={creatingStore}
              className="w-full mt-3 py-3 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {creatingStore ? 'Đang tạo cửa hàng...' : 'Bắt đầu sử dụng Ca Làm Online'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Week Selector & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Left: Week selector & dates */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
              title="Tuần trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                isCurrentWeek
                  ? 'bg-[#EA701B] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Tuần hiện tại
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
              title="Tuần kế tiếp"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl text-slate-800 text-sm font-semibold">
            <Calendar className="w-4 h-4 text-[#EA701B]" />
            <span>
              {formatWeekRange(currentMonday)} (Tuần {week}/{year})
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isPastWeek && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Tuần đã qua (Chỉ xem)
              </span>
            )}
            {scheduleStatus === 'PUBLISHED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã xuất bản
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Bản nháp
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving || autoGenerating || isPastWeek}
            onClick={() => setAutoScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 text-sm font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title={isPastWeek ? 'Tuần này đã kết thúc trong quá khứ' : 'Tự động phân bổ ca làm tối ưu cho nhân viên và lưu bản nháp'}
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Tự động xếp lịch</span>
          </button>

          <button
            type="button"
            disabled={saving || autoGenerating || isPastWeek}
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold bg-white hover:bg-slate-50 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title={isPastWeek ? 'Không thể lưu hoặc sửa đổi lịch của tuần đã qua' : 'Lưu bản nháp'}
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
          </button>

          <button
            type="button"
            disabled={saving || autoGenerating || isPastWeek}
            onClick={() => {
              if (isPastWeek) {
                setFeedback({
                  type: 'error',
                  message: 'Tuần này đã kết thúc trong quá khứ. Không thể xuất bản lịch làm việc.'
                });
                return;
              }
              const val = validateAssignmentsNoOverlap();
              if (val.hasError) {
                setFeedback({ type: 'error', message: val.message });
                return;
              }
              setPublishModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA701B] hover:bg-[#D55E0D] text-white text-sm font-bold transition shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            title={isPastWeek ? 'Tuần này đã kết thúc trong quá khứ' : 'Xuất bản lịch & gửi email'}
          >
            <Send className="w-4 h-4" />
            <span>Xác nhận & gửi email</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : feedback.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Draft Schedule Notice Banner */}
      {scheduleStatus === 'DRAFT' && assignments.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-center justify-between text-xs font-medium animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Lịch hiện tại đang ở trạng thái <strong>Bản nháp</strong>. Bạn có thể bấm vào từng ca để xem, thêm/bớt nhân viên, sau đó bấm <strong>"Xác nhận & gửi email"</strong> khi đã sẵn sàng công bố cho nhân viên.
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-200/70 text-amber-800 text-[11px] font-bold rounded-lg shrink-0 hidden sm:inline-block">
            Bản nháp chờ quản lý duyệt
          </span>
        </div>
      )}

      {/* Schedule Conflicts Banner */}
      {scheduleConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-extrabold text-sm text-red-900 mb-1 flex items-center gap-1.5">
              <span>Phát hiện {scheduleConflicts.length} ca làm việc bị trùng khung giờ!</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Các ca có nhân viên bị phân công trùng giờ làm đã được <b>đánh dấu viền đỏ</b> trên bảng xếp ca bên dưới.
              Một nhân viên không thể làm 2 ca trong cùng một khoảng thời gian. Vui lòng bấm vào các ô viền đỏ để đổi nhân viên hoặc hủy ca trước khi lưu / xuất bản lịch.
            </p>
            <ul className="mt-2.5 space-y-1.5 bg-white/70 p-2.5 rounded-xl border border-red-100">
              {scheduleConflicts.map((c, i) => (
                <li key={i} className="font-semibold text-red-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>
                    <b>{c.employeeName}</b> ngày {c.date}: Trùng giữa <u>{c.shift1.name}</u> ({c.shift1.startTime} - {c.shift1.endTime}) và <u>{c.shift2.name}</u> ({c.shift2.startTime} - {c.shift2.endTime})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 7-Day Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {shifts.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-orange-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có khung giờ ca làm nào</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
              Bạn cần tạo các khung giờ (ví dụ: Ca Sáng 08:00 - 12:00) trước khi xếp lịch làm việc cho nhân viên.
            </p>
            <a
              href="/shifts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA701B] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#D55E0D]"
            >
              <Plus className="w-4 h-4" />
              Tạo ca làm ngay
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[960px]">
              {/* Header row: Days of the week */}
              <thead>
                <tr className="bg-[#FFF0E5] border-b border-orange-100 text-slate-700">
                  <th className="w-44 p-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-r border-orange-100">
                    Khung Giờ / Ca
                  </th>
                  {daysOfWeek.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`p-3 text-center border-r border-orange-100 last:border-r-0 ${
                        day.isToday ? 'bg-orange-200/60 font-extrabold text-[#EA701B]' : day.isPast ? 'bg-slate-100/70' : ''
                      }`}
                    >
                      <div className={`text-xs uppercase font-bold tracking-tight ${day.isPast && !day.isToday ? 'text-slate-400' : 'text-slate-800'}`}>
                        {day.dayName}
                      </div>
                      <div className={`text-xs font-mono mt-0.5 font-medium ${day.isPast && !day.isToday ? 'text-slate-400' : 'text-slate-500'}`}>
                        {day.displayDate}
                      </div>
                      {day.isToday ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] bg-[#EA701B] text-white rounded-full mt-0.5">
                          Hôm nay
                        </span>
                      ) : day.isPast ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-500 rounded-full mt-0.5 font-medium">
                          Đã qua
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body: Shift Slots (Rows) */}
              <tbody className="divide-y divide-slate-100">
                {shifts.map((shift) => (
                  <tr key={shift._id} className="hover:bg-slate-50/50 transition">
                    {/* Shift Label Header Cell */}
                    <td className="p-3.5 bg-slate-50/80 border-r border-slate-200 text-left align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: shift.color || '#EA701B' }}
                        />
                        <span className="font-bold text-sm text-slate-800">{shift.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{shift.startTime} — {shift.endTime}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {shift.durationHours || 4} tiếng / ca
                      </div>
                    </td>

                    {/* 7 Daily cells for this shift */}
                    {daysOfWeek.map((day) => {
                      const currentShiftId = getShiftId(shift._id);
                      const cellAssignments = assignments.filter(
                        (a) => a.date === day.dateStr && getShiftId(a.shiftId) === currentShiftId
                      );
                      const hasAnyConflict = cellAssignments.some((a) => !!getAssignmentConflict(a));
                      const isPassed = isShiftPassedOrCompleted(day.dateStr, shift);

                      return (
                        <td
                          key={day.dateStr}
                          className="p-1.5 border-r border-slate-100 last:border-r-0 align-top min-h-24 hover:bg-orange-50/20 transition"
                        >
                          {cellAssignments.length === 0 ? (
                            isPassed ? (
                              <div
                                title="Ca làm việc này đã kết thúc trong quá khứ"
                                className="w-full h-full min-h-[84px] border border-dashed border-slate-200/80 bg-slate-50/60 rounded-xl flex flex-col items-center justify-center text-slate-300 select-none cursor-not-allowed p-2"
                              >
                                <Clock className="w-4 h-4 text-slate-300" />
                                <span className="text-[10px] font-medium text-slate-400 mt-1">Đã kết thúc</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(day.dateStr, shift._id)}
                                className="w-full h-full min-h-[84px] border border-dashed border-slate-200 hover:border-[#EA701B] hover:bg-[#FFF7F0] rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-[#EA701B] transition group p-2"
                              >
                                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-medium mt-1">+ Phân ca</span>
                              </button>
                            )
                          ) : (
                            <div
                              onClick={() => handleOpenAssignModal(day.dateStr, shift._id)}
                              className={`group relative w-full h-full min-h-[84px] rounded-xl p-2 flex flex-col justify-between cursor-pointer transition shadow-xs ${
                                hasAnyConflict
                                  ? 'bg-red-50/90 hover:bg-red-100/90 border-2 border-red-400 ring-1 ring-red-400/50'
                                  : isPassed
                                  ? 'bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200 text-slate-600'
                                  : 'bg-[#FFF8F2] hover:bg-[#FFF0E5] border border-orange-200/90'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                      hasAnyConflict ? 'text-red-700' : isPassed ? 'text-slate-500' : 'text-[#EA701B]'
                                    }`}
                                  >
                                    {isPassed && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                                    <span>{cellAssignments.length} nhân viên</span>
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold text-white ${
                                      hasAnyConflict ? 'bg-red-500' : isPassed ? 'bg-slate-400' : 'bg-[#EA701B]'
                                    }`}
                                  >
                                    {cellAssignments.length}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {cellAssignments.map((a, idx) => {
                                    const aUserId = getUserId(a.userId);
                                    const assignedUser =
                                      members.find((m) => getUserId(m.user?._id || m.userId) === aUserId)?.user ||
                                      a.userObj || { name: 'Nhân viên' };
                                    const conflictShift = getAssignmentConflict(a);

                                    return (
                                      <div
                                        key={`${a.userId}_${idx}`}
                                        className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg border text-xs transition ${
                                          conflictShift
                                            ? 'bg-red-100/80 border-red-300 text-red-900 font-bold'
                                            : isPassed
                                            ? 'bg-white border-slate-200 text-slate-700'
                                            : 'bg-white border-orange-100 text-slate-800 hover:border-orange-200'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                          <div
                                            className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                              conflictShift ? 'bg-red-600' : isPassed ? 'bg-slate-500' : 'bg-[#EA701B]'
                                            }`}
                                          >
                                            {assignedUser.name ? assignedUser.name.charAt(0).toUpperCase() : 'U'}
                                          </div>
                                          <span className="truncate font-semibold text-[11px] leading-tight">
                                            {assignedUser.name}
                                          </span>
                                        </div>

                                        {conflictShift && (
                                          <span
                                            title={`Trùng giờ với ca "${conflictShift.name}" (${conflictShift.startTime}-${conflictShift.endTime})`}
                                            className="shrink-0"
                                          >
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="mt-2 pt-1 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{shift.startTime} - {shift.endTime}</span>
                                </span>
                                {isPassed ? (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 border border-emerald-200">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    Đã xong
                                  </span>
                                ) : (
                                  <span className="text-[#EA701B] font-bold group-hover:underline">
                                    + Thêm
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Payroll Summary (Sticky / Dedicated Bottom Card) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dự toán bảng lương theo ca (Tuần này)</h3>
              <p className="text-xs text-slate-500">
                Tính toán dựa trên số ca phân công × số giờ ca × mức lương từng nhân viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Tổng số ca:</span>
              <span className="font-bold text-slate-800 font-mono">{payrollSummary.storeTotalShifts} ca</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Tổng số giờ:</span>
              <span className="font-bold text-slate-800 font-mono">{payrollSummary.storeTotalHours} giờ</span>
            </div>
            <div className="bg-[#FFF0E5] px-3.5 py-1.5 rounded-xl border border-orange-200">
              <span className="text-[11px] text-[#EA701B] font-bold block uppercase tracking-wider">
                Tổng dự toán quán:
              </span>
              <span className="text-base font-extrabold text-[#EA701B] font-mono">
                {formatVND(payrollSummary.storeTotalPayroll)}
              </span>
            </div>
          </div>
        </div>

        {/* Employee breakdown list */}
        {payrollSummary.employees.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">
            Chưa có nhân viên nào được phân ca trong tuần này.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {payrollSummary.employees.map((emp) => (
              <div
                key={emp.email}
                className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA701B] font-bold text-xs flex items-center justify-center shrink-0">
                    {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {emp.totalShifts} ca ({emp.totalHours}h) × {formatVND(emp.hourlyWage)}/h
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 font-bold text-xs text-[#EA701B] font-mono">
                  {formatVND(emp.totalWage)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Manage Shift Roster / Multi-Employee Assignment */}
      {assignModal.isOpen && (() => {
        const currentShiftId = getShiftId(assignModal.shiftId);
        const targetShift = shifts.find((s) => getShiftId(s._id) === currentShiftId);
        const isShiftPassed = isShiftPassedOrCompleted(assignModal.date, targetShift);
        const currentCellAssignments = assignments.filter(
          (a) => a.date === assignModal.date && getShiftId(a.shiftId) === currentShiftId
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#FFF0E5] border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        Phân công ca: {targetShift?.name || 'Ca làm việc'}
                      </h3>
                      {isShiftPassed && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Đã kết thúc (Đã khóa ca)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {targetShift?.startTime} — {targetShift?.endTime} •{' '}
                      {daysOfWeek.find((d) => d.dateStr === assignModal.date)?.fullDisplay || assignModal.date}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', selectedUserId: '' })}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* SECTION 1: Current Assigned Employees */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#EA701B]" />
                      <span>Nhân viên trong ca này ({currentCellAssignments.length} người)</span>
                    </label>
                    {currentCellAssignments.length > 0 && !isShiftPassed && (
                      <button
                        type="button"
                        onClick={() => handleClearShiftAssignments(assignModal.date, assignModal.shiftId)}
                        className="text-[11px] text-red-600 hover:underline font-semibold"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {currentCellAssignments.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
                      {isShiftPassed
                        ? 'Không có nhân viên nào được xếp trong ca này.'
                        : 'Chưa có nhân viên nào trong ca này. Hãy chọn nhân viên bên dưới để thêm vào ca.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {currentCellAssignments.map((a, idx) => {
                        const aUserId = getUserId(a.userId);
                        const member = members.find((m) => getUserId(m.user?._id || m.userId) === aUserId);
                        const name = member?.user?.name || member?.fullName || a.userObj?.name || 'Nhân viên';
                        const email = member?.user?.email || member?.email;
                        const wage = member?.hourlyWage || 20000;
                        const conflictShift = getAssignmentConflict(a);

                        return (
                          <div
                            key={`${aUserId}_${idx}`}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              conflictShift ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                                  conflictShift ? 'bg-red-500' : isShiftPassed ? 'bg-slate-500' : 'bg-[#EA701B]'
                                }`}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {formatVND(wage)}/h {email ? `• ${email}` : ''}
                                </p>
                                {conflictShift && (
                                  <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    Trùng giờ với ca "{conflictShift.name}" ({conflictShift.startTime} - {conflictShift.endTime})
                                  </p>
                                )}
                              </div>
                            </div>

                            {!isShiftPassed && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleAssignment(a.date, a.shiftId, a.userId)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                                title="Xóa khỏi ca"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SECTION 2: Add New Employee to Shift */}
                {isShiftPassed ? (
                  <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">Ca làm việc đã kết thúc — Không thể chỉnh sửa</p>
                      <p className="mt-0.5 text-amber-800 leading-relaxed">
                        Ca làm <strong>{targetShift?.name} ({targetShift?.startTime} — {targetShift?.endTime}, {assignModal.date})</strong> đã qua. Hệ thống tự động khóa ca để bảo toàn giờ làm và tiền lương của nhân viên, không thể sửa đổi hoặc xóa.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Thêm nhân viên vào ca này
                    </label>
                    {(() => {
                      const selectedCandidateId = getUserId(assignModal.selectedUserId);
                      const selectedConflict = selectedCandidateId
                        ? getConflictingShift(selectedCandidateId, assignModal.date, currentShiftId)
                        : null;
                      const isSelectedAlready = selectedCandidateId
                        ? currentCellAssignments.some((a) => getUserId(a.userId) === selectedCandidateId)
                        : false;

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                              value={assignModal.selectedUserId}
                              onChange={(e) =>
                                setAssignModal((prev) => ({ ...prev, selectedUserId: e.target.value }))
                              }
                              className="flex-1 min-w-0 w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA701B] truncate"
                            >
                              <option value="">-- Chọn nhân viên để thêm --</option>
                              {members.map((m) => {
                                const uid = getUserId(m.user?._id || m.userId);
                                const alreadyIn = currentCellAssignments.some((a) => getUserId(a.userId) === uid);
                                const conflict = getConflictingShift(uid, assignModal.date, currentShiftId);

                                let note = '';
                                if (alreadyIn) {
                                  note = `[Đã có trong ca này] ${m.user?.name || m.fullName}`;
                                } else if (conflict) {
                                  note = `[Trùng ca: ${conflict.name} (${conflict.startTime} - ${conflict.endTime})] ${m.user?.name || m.fullName}`;
                                }

                                return (
                                  <option
                                    key={uid}
                                    value={uid}
                                    disabled={alreadyIn || !!conflict}
                                    className={alreadyIn || conflict ? 'text-slate-400 bg-slate-50' : ''}
                                  >
                                    {note || `${m.user?.name || m.fullName} (${m.user?.email || m.email}) — ${formatVND(m.hourlyWage)}/h`}
                                  </option>
                                );
                              })}
                            </select>

                            <button
                              type="button"
                              disabled={!assignModal.selectedUserId || !!selectedConflict || isSelectedAlready}
                              onClick={handleAddEmployeeToShift}
                              className="px-4 py-2.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap transition"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Thêm vào ca</span>
                            </button>
                          </div>

                          {/* Conflict alert for selected candidate */}
                          {selectedConflict && (
                            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-fade-in mt-1">
                              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-red-800">Cảnh báo: Trùng giờ làm việc!</p>
                                <p className="mt-0.5 text-slate-600">
                                  Nhân viên này đã được phân ca <b>"{selectedConflict.name}" ({selectedConflict.startTime} - {selectedConflict.endTime})</b> vào ngày này. Không thể phân 2 ca cùng khung giờ!
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Modal Footer */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', selectedUserId: '' })}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-xs"
                  >
                    Xong & Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: Auto-Generate Schedule */}
      {autoScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-amber-50/80 via-orange-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Tự động xếp lịch thông minh
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phân chia ca làm tối ưu & lưu thành bản nháp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* How it works note */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Quy tắc tối ưu tự động:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>Cân bằng số ca và tổng số giờ làm việc đều giữa các nhân viên.</li>
                  <li>Tuyệt đối không trùng ca và không giao thoa khung giờ trong cùng ngày.</li>
                  <li>Lưu dưới dạng <b>Bản nháp (DRAFT)</b> — quản lý có thể xem lại, tinh chỉnh từng ca và xác nhận sau.</li>
                </ul>
              </div>

              {/* Past week / Past days notice */}
              {isPastWeek ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Tuần này đã kết thúc trong quá khứ. Bạn không thể tự động xếp ca cho tuần trong quá khứ.</span>
                </div>
              ) : daysOfWeek.some((d) => d.isPast) ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2 animate-fade-in">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tuần này có ngày đã qua. Hệ thống sẽ tự động bỏ qua các ngày đã qua và chỉ xếp ca từ hôm nay ({todayDateStr}) trở đi.</span>
                </div>
              ) : null}

              {/* Store context stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Tổng ca/ngày: <strong className="text-slate-800">{shifts.length} ca</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Nhân viên sẵn sàng: <strong className="text-slate-800">{members.length} người</strong></span>
                </div>
              </div>

              {/* Form Options */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số nhân viên cần cho mỗi ca làm:
                  </label>
                  <select
                    value={autoConfig.staffPerShift}
                    onChange={(e) =>
                      setAutoConfig((prev) => ({ ...prev, staffPerShift: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#EA701B] outline-hidden transition"
                  >
                    <option value={1}>1 nhân viên / ca (Tiêu chuẩn)</option>
                    <option value={2}>2 nhân viên / ca (Quán đông khách)</option>
                    <option value={3}>3 nhân viên / ca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tối đa số ca làm / ngày của 1 nhân viên:
                  </label>
                  <select
                    value={autoConfig.maxShiftsPerDay}
                    onChange={(e) =>
                      setAutoConfig((prev) => ({ ...prev, maxShiftsPerDay: Number(e.target.value) }))
                    }
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#EA701B] outline-hidden transition"
                  >
                    <option value={1}>Tối đa 1 ca / ngày (Khuyên dùng - Tránh quá tải)</option>
                    <option value={2}>Tối đa 2 ca / ngày (Ca không trùng giờ)</option>
                  </select>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoConfig.preserveExisting}
                      onChange={(e) =>
                        setAutoConfig((prev) => ({ ...prev, preserveExisting: e.target.checked }))
                      }
                      className="mt-0.5 rounded-sm border-slate-300 text-[#EA701B] focus:ring-[#EA701B]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">
                        Giữ lại các ca đã xếp thủ công hiện tại
                      </span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Hệ thống sẽ giữ nguyên những ai đã được xếp ca và chỉ tự động chia vào các vị trí còn trống.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAutoScheduleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={autoGenerating || shifts.length === 0 || members.length === 0 || isPastWeek}
                onClick={handleAutoSchedule}
                className="px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-amber-500 to-[#EA701B] hover:from-amber-600 hover:to-[#D55E0D] rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{autoGenerating ? 'Đang tự động tính toán & xếp ca...' : 'Bắt đầu tự động xếp ca'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Publish Confirmation Dialog */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-[#EA701B] mx-auto flex items-center justify-center">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Xác nhận xuất bản lịch & gửi email?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống sẽ chuyển trạng thái lịch sang <b>Đã xuất bản</b>, đồng thời tự động gửi email thông báo chi tiết danh sách ca làm và bảng lương ước tính tới từng nhân viên có ca trong tuần này.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-left text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-[#EA701B] mb-1">
                  <Info className="w-4 h-4" />
                  <span>Tuần áp dụng:</span>
                </div>
                <span>
                  {formatWeekRange(currentMonday)} (Tuần {week}/{year})
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmPublish}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {saving ? 'Đang gửi email...' : 'Đồng ý & Xuất bản ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagementPage;
