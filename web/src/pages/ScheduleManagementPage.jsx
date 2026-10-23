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
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Info,
  X,
  FileCheck,
  Sparkles,
  Users,
  Store as StoreIcon
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
  getWeekNumberAndYear
} from '../utils/formatters';

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

  // Create initial store modal state if owner doesn't have a store yet
  const [createStoreModal, setCreateStoreModal] = useState(false);
  const [newStoreForm, setNewStoreForm] = useState({ name: '', address: '' });
  const [creatingStore, setCreatingStore] = useState(false);

  // Modal State for Assigning / Editing a cell
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    date: '',
    shiftId: '',
    userId: '',
    assignmentIndex: -1
  });

  const daysOfWeek = useMemo(() => getDaysOfWeek(currentMonday), [currentMonday]);
  const { week, year } = useMemo(() => getWeekNumberAndYear(currentMonday), [currentMonday]);

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
        const normalized = rawMembers.map((m) => ({
          ...m,
          _id: m.memberId || m._id,
          hourlyWage: m.hourlyWage || 20000,
          user: {
            _id: m.userId || m.user?._id,
            name: m.fullName || m.user?.fullName || m.user?.name,
            email: m.email || m.user?.email
          }
        }));
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
        const formatted = rawAssignments.map((a) => ({
          date: a.date,
          dayOfWeek: a.dayOfWeek,
          shiftId: typeof a.shiftId === 'object' ? a.shiftId?._id : a.shiftId,
          userId: typeof a.userId === 'object' ? a.userId?._id : a.userId,
          userObj: typeof a.userId === 'object' ? { _id: a.userId._id, name: a.userId.fullName || a.userId.name } : null,
          shiftObj: typeof a.shiftId === 'object' ? a.shiftId : null
        }));
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

  // Open modal to assign or change an assignment
  const handleCellClick = (dateStr, shiftId) => {
    const existingIndex = assignments.findIndex(
      (a) => a.date === dateStr && a.shiftId === shiftId
    );
    const existing = assignments[existingIndex];

    setAssignModal({
      isOpen: true,
      date: dateStr,
      shiftId: shiftId,
      userId: existing ? existing.userId : '',
      assignmentIndex: existingIndex
    });
  };

  // Save assignment from modal
  const handleSaveAssignment = () => {
    if (!assignModal.userId) {
      if (assignModal.assignmentIndex >= 0) {
        setAssignments((prev) =>
          prev.filter((_, idx) => idx !== assignModal.assignmentIndex)
        );
      }
    } else {
      const selectedMember = members.find((m) => (m.user?._id || m.userId) === assignModal.userId);
      const selectedShift = shifts.find((s) => s._id === assignModal.shiftId);
      const day = daysOfWeek.find((d) => d.dateStr === assignModal.date);

      const newAssignment = {
        date: assignModal.date,
        dayOfWeek: day?.dayName || 'Thứ Hai',
        shiftId: assignModal.shiftId,
        userId: assignModal.userId,
        userObj: selectedMember?.user || { _id: assignModal.userId, name: 'Nhân viên' },
        shiftObj: selectedShift
      };

      setAssignments((prev) => {
        const filtered = prev.filter(
          (a) => !(a.date === assignModal.date && a.shiftId === assignModal.shiftId)
        );
        return [...filtered, newAssignment];
      });
    }

    setAssignModal({ isOpen: false, date: '', shiftId: '', userId: '', assignmentIndex: -1 });
  };

  // Remove assignment directly
  const handleRemoveAssignment = () => {
    if (assignModal.assignmentIndex >= 0) {
      setAssignments((prev) =>
        prev.filter((_, idx) => idx !== assignModal.assignmentIndex)
      );
    }
    setAssignModal({ isOpen: false, date: '', shiftId: '', userId: '', assignmentIndex: -1 });
  };

  // Save Draft Schedule
  const handleSaveDraft = async () => {
    if (!store?._id) return;
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
            shiftId: a.shiftId,
            userId: a.userId
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

  // Publish Schedule & Send Emails
  const handleConfirmPublish = async () => {
    if (!store?._id) return;
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
            shiftId: a.shiftId,
            userId: a.userId
          };
        })
      };
      const res = await scheduleApi.publish(store._id, payload);
      if (res.success) {
        setScheduleStatus('PUBLISHED');
        setPublishModalOpen(false);
        setFeedback({
          type: 'success',
          message: 'Xuất bản lịch thành công! Email thông báo ca làm đã được gửi tới từng nhân viên.'
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
      const uid = m.user?._id || m.userId;
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
      const shift = shifts.find((s) => s._id === a.shiftId) || a.shiftObj;
      const duration = shift?.durationHours || 4;
      if (employeeMap[a.userId]) {
        employeeMap[a.userId].totalShifts += 1;
        employeeMap[a.userId].totalHours += duration;
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
          <div className="flex items-center">
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
            disabled={saving}
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold bg-white hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => setPublishModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA701B] hover:bg-[#D55E0D] text-white text-sm font-bold transition shadow-md shadow-orange-500/20 disabled:opacity-50"
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
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
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
                        day.isToday ? 'bg-orange-200/60 font-extrabold text-[#EA701B]' : ''
                      }`}
                    >
                      <div className="text-xs uppercase font-bold tracking-tight text-slate-800">
                        {day.dayName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                        {day.displayDate}
                      </div>
                      {day.isToday && (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] bg-[#EA701B] text-white rounded-full mt-0.5">
                          Hôm nay
                        </span>
                      )}
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
                      const assignment = assignments.find(
                        (a) => a.date === day.dateStr && a.shiftId === shift._id
                      );

                      const assignedUser = assignment
                        ? members.find((m) => (m.user?._id || m.userId) === assignment.userId)?.user ||
                          assignment.userObj
                        : null;

                      return (
                        <td
                          key={day.dateStr}
                          className="p-2 border-r border-slate-100 last:border-r-0 align-top h-24 hover:bg-orange-50/20 transition"
                        >
                          {assignment && assignedUser ? (
                            <div
                              onClick={() => handleCellClick(day.dateStr, shift._id)}
                              className="group relative h-full bg-[#FFF0E5] hover:bg-[#FFE5D1] border border-orange-200/80 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer transition shadow-xs"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA701B]">
                                    Đã phân ca
                                  </span>
                                  <div className="w-5 h-5 rounded-full bg-[#EA701B] text-white text-[10px] font-bold flex items-center justify-center">
                                    {assignedUser.name ? assignedUser.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                  {assignedUser.name}
                                </p>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#EA701B]" />
                                <span>{shift.startTime} - {shift.endTime}</span>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCellClick(day.dateStr, shift._id)}
                              className="w-full h-full min-h-[70px] border border-dashed border-slate-200 hover:border-[#EA701B] hover:bg-[#FFF7F0] rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-[#EA701B] transition group"
                            >
                              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span className="text-[11px] font-medium mt-1">+ Phân ca</span>
                            </button>
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

      {/* MODAL: Assign / Change Shift Cell */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#FFF0E5] border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#EA701B]" />
                <h3 className="font-bold text-slate-900 text-sm">Phân công ca làm việc</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', userId: '', assignmentIndex: -1 })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ngày làm việc</label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                  {daysOfWeek.find((d) => d.dateStr === assignModal.date)?.fullDisplay || assignModal.date}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Khung giờ ca</label>
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex justify-between">
                  <span>{shifts.find((s) => s._id === assignModal.shiftId)?.name}</span>
                  <span className="font-mono text-slate-500">
                    {shifts.find((s) => s._id === assignModal.shiftId)?.startTime} —{' '}
                    {shifts.find((s) => s._id === assignModal.shiftId)?.endTime}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Chọn nhân viên làm ca này <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignModal.userId}
                  onChange={(e) => setAssignModal((prev) => ({ ...prev, userId: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                >
                  <option value="">-- Chưa chọn nhân viên (Trống) --</option>
                  {members.map((m) => {
                    const uid = m.user?._id || m.userId;
                    return (
                      <option key={uid} value={uid}>
                        {m.user?.name || m.fullName} ({m.user?.email || m.email}) — {formatVND(m.hourlyWage)}/h
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {assignModal.assignmentIndex >= 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveAssignment}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hủy phân ca này
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', userId: '', assignmentIndex: -1 })}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-xs"
                >
                  Lưu phân ca
                </button>
              </div>
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
