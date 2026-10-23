import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Store,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Wallet,
  CalendarCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleApi, memberApi, shiftApi } from '../services/api';
import {
  getMondayOfWeek,
  formatWeekRange,
  formatVND,
  getRoleLabel,
  getWeekNumberAndYear,
} from '../utils/formatters';

export const DashboardPage = () => {
  const { user, store, roleInStore } = useAuth();
  const navigate = useNavigate();
  const roleInfo = getRoleLabel(roleInStore || user?.role);

  // Month navigation state (mặc định là tháng và năm hiện tại)
  const now = new Date();
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(currentYearNum);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    memberCount: 0,
    shiftCount: 0,
    assignedShiftsCount: 0,
    totalPayroll: 0,
    scheduleStatus: 'DRAFT',
    // Thống kê theo tháng được chọn
    monthAssignedShifts: 0,
    monthCompletedShifts: 0,
    monthMissedShifts: 0,
    monthTotalPayroll: 0,
    monthTotalHours: 0,
  });

  const currentMonday = getMondayOfWeek();
  const { week, year } = getWeekNumberAndYear(currentMonday);

  // Điều hướng chuyển tháng
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(currentMonthNum);
    setSelectedYear(currentYearNum);
  };

  const isCurrentMonth = selectedMonth === currentMonthNum && selectedYear === currentYearNum;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!store?._id) return;
      try {
        setLoading(true);
        const [membersRes, shiftsRes, schedRes, monthlyRes] = await Promise.all([
          memberApi.getMembers(store._id),
          shiftApi.getShifts(store._id),
          scheduleApi.getWeekSchedule(store._id, week, year),
          scheduleApi.getMonthlyStats(store._id, selectedMonth, selectedYear),
        ]);

        const rawMembers = membersRes?.success ? (membersRes.members || []) : [];
        const activeMembers = rawMembers.filter((m) => {
          if (m.status && m.status !== 'ACTIVE') return false;
          const uId = String(m.user?._id || m.userId || '');
          const isOwner = m.isOwner || (store?.ownerId && String(store.ownerId) === uId);
          return !isOwner;
        });

        const shifts = shiftsRes?.success ? (shiftsRes.shifts || []) : [];
        const schedule = (schedRes?.success && schedRes?.hasSchedule) ? schedRes.schedule : null;

        // Tính dự toán tiền lương tuần và số ca đã phân trong tuần này
        let totalPayroll = 0;
        let assignedCount = 0;

        if (schedule?.assignments && Array.isArray(schedule.assignments)) {
          assignedCount = schedule.assignments.length;
          schedule.assignments.forEach((a) => {
            // Không tính tiền cho các ca bị đánh dấu Không hoàn thành (MISSED)
            if (a.attendanceStatus === 'MISSED') return;

            if (typeof a.totalPay === 'number' && a.totalPay > 0) {
              totalPayroll += a.totalPay;
            } else {
              const sId = String(
                typeof a.shiftId === 'object' && a.shiftId !== null ? a.shiftId._id : (a.shiftId || '')
              );
              const uId = String(
                typeof a.userId === 'object' && a.userId !== null ? a.userId._id : (a.userId || '')
              );
              const shiftObj = shifts.find((s) => String(s._id) === sId);
              const memberObj = activeMembers.find(
                (m) => String(m.user?._id || m.userId) === uId
              );
              const hours = a.hours || shiftObj?.durationHours || 4;
              const wage = a.hourlyWage || memberObj?.hourlyWage || 20000;
              totalPayroll += hours * wage;
            }
          });
        }

        setStats({
          memberCount: activeMembers.length,
          shiftCount: shifts.length,
          assignedShiftsCount: assignedCount,
          totalPayroll,
          scheduleStatus: schedule?.status || 'DRAFT',
          monthAssignedShifts: monthlyRes?.monthAssignedShifts || 0,
          monthCompletedShifts: monthlyRes?.monthCompletedShifts || 0,
          monthMissedShifts: monthlyRes?.monthMissedShifts || 0,
          monthTotalPayroll: monthlyRes?.monthTotalPayroll || 0,
          monthTotalHours: monthlyRes?.monthTotalHours || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [store?._id, currentMonday, week, year, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF0E5] via-white to-[#FFF7F0] p-6 lg:p-8 rounded-3xl border border-orange-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.color}`}>
              {roleInfo.text}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Cơ sở: <b className="text-slate-800">{store?.name}</b>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Chào mừng trở lại, {user?.name}!</span>
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hôm nay bạn có thể nhanh chóng xếp ca tuần, theo dõi dự toán bảng lương và quản lý nhân sự cửa hàng.
          </p>
        </div>
      </div>

      {/* SECTION 1: Weekly Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-[#EA701B]" />
            <span>Chỉ số tuần này ({formatWeekRange(currentMonday)})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Nhân viên */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân sự cửa hàng</p>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {stats.memberCount} <span className="text-xs font-semibold text-slate-400 font-sans">người</span>
              </h3>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Đang hoạt động</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#EA701B] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 2: Ca tuần này */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ca đã phân tuần này</p>
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {stats.assignedShiftsCount} <span className="text-xs font-semibold text-slate-400 font-sans">ca</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                Tuần {week}/{year}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 3: Dự toán lương tuần */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dự toán lương tuần</p>
              <h3 className="text-xl font-extrabold text-[#EA701B] font-mono mt-1">
                {formatVND(stats.totalPayroll)}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">Tính theo giờ phân ca</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 4: Trạng thái lịch */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái lịch tuần</p>
              <div className="mt-2">
                {stats.scheduleStatus === 'PUBLISHED' ? (
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
              <span className="text-[11px] text-slate-400 mt-1.5 block">Sẵn sàng gửi email</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Monthly Stats with Month Navigator */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isCurrentMonth ? 'Chỉ số tháng này' : `Thống kê Tháng ${selectedMonth}/${selectedYear}`}
            </h3>
            {isCurrentMonth && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tháng {selectedMonth}/{selectedYear}
              </span>
            )}
          </div>

          {/* Month Navigation Control */}
          <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-lg transition text-slate-600 shadow-xs"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCurrentMonth}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                isCurrentMonth
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-emerald-600'
              }`}
            >
              Tháng này
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:text-emerald-600 rounded-lg transition text-slate-600 shadow-xs"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 font-mono px-2 py-0.5 border-l border-slate-200 ml-1">
              Tháng {selectedMonth}/{selectedYear}
            </span>
          </div>
        </div>

        {/* 2 Key Monthly Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Stat 1: Dự toán lương tháng */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isCurrentMonth ? 'Dự đoán lương tháng này' : `Dự toán lương Tháng ${selectedMonth}/${selectedYear}`}
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 font-mono mt-1.5">
                {formatVND(stats.monthTotalPayroll)}
              </h3>
              <span className="text-xs text-emerald-600/90 font-medium mt-1 inline-block">
                {stats.monthTotalHours} giờ làm việc trong tháng
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Wallet className="w-7 h-7" />
            </div>
          </div>

          {/* Monthly Stat 2: Ca đã phân trong tháng */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-200/80 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-indigo-50/30">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isCurrentMonth ? 'Ca đã phân tháng này' : `Ca đã phân Tháng ${selectedMonth}/${selectedYear}`}
              </p>
              <h3 className="text-2xl font-extrabold text-indigo-900 font-mono mt-1.5">
                {stats.monthAssignedShifts} <span className="text-xs font-semibold text-slate-400 font-sans">ca</span>
              </h3>
              <span className="text-xs text-indigo-600/90 font-medium mt-1 inline-block">
                {stats.monthCompletedShifts} ca hoàn thành {stats.monthMissedShifts > 0 ? `• Trừ ${stats.monthMissedShifts} ca vắng` : ''}
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarCheck className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Action 1 */}
        <div
          onClick={() => navigate('/schedules')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#EA701B] transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#EA701B] transition">
              Xếp lịch làm việc tuần này
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Phân chia ca sáng/chiều/tối trên lưới 7 ngày và xuất bản gửi email cho nhân viên.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA701B] mt-4">
            <span>Mở bảng xếp ca</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 2 */}
        <div
          onClick={() => navigate('/employees')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#EA701B] transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
              Quản lý nhân viên & Lương theo giờ
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Thiết lập mức lương VNĐ/h, gán vai trò Quản lý và theo dõi hình thức làm việc.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-4">
            <span>Danh sách nhân sự</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Action 3 */}
        <div
          onClick={() => navigate('/shifts')}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#EA701B] transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
              Cài đặt Khung giờ / Ca làm
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Thêm mới hoặc tinh chỉnh khung giờ vào/ra, số tiếng và màu sắc đại diện cho từng ca.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-4">
            <span>Cài đặt ca làm</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
