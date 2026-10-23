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
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleApi, memberApi, shiftApi } from '../services/api';
import {
  getMondayOfWeek,
  formatWeekRange,
  formatVND,
  getRoleLabel
} from '../utils/formatters';

export const DashboardPage = () => {
  const { user, store, roleInStore } = useAuth();
  const navigate = useNavigate();
  const roleInfo = getRoleLabel(roleInStore || user?.role);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    memberCount: 0,
    shiftCount: 0,
    assignedShiftsCount: 0,
    totalPayroll: 0,
    scheduleStatus: 'DRAFT'
  });

  const currentMonday = getMondayOfWeek();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!store?._id) return;
      try {
        setLoading(true);
        const [membersRes, shiftsRes, schedRes] = await Promise.all([
          memberApi.getMembers(store._id),
          shiftApi.getShifts(store._id),
          scheduleApi.getWeeklySchedule(store._id, currentMonday)
        ]);

        const members = membersRes.success ? membersRes.data : [];
        const shifts = shiftsRes.success ? shiftsRes.data : [];
        const schedule = schedRes.success ? schedRes.data : null;

        // Calculate estimated payroll
        let totalPayroll = 0;
        let assignedCount = 0;

        if (schedule?.assignments) {
          assignedCount = schedule.assignments.length;
          schedule.assignments.forEach((a) => {
            const shiftObj = shifts.find((s) => s._id === (a.shift?._id || a.shift));
            const memberObj = members.find((m) => m.user?._id === (a.user?._id || a.user));
            const hours = shiftObj?.durationHours || 4;
            const wage = memberObj?.hourlyWage || 20000;
            totalPayroll += hours * wage;
          });
        }

        setStats({
          memberCount: members.length,
          shiftCount: shifts.length,
          assignedShiftsCount: assignedCount,
          totalPayroll,
          scheduleStatus: schedule?.status || 'DRAFT'
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [store?._id, currentMonday]);

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
          <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Chào mừng trở lại, {user?.name}! 👋
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hôm nay bạn có thể nhanh chóng xếp ca tuần, theo dõi dự toán bảng lương và quản lý nhân sự cửa hàng.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
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
              {formatWeekRange(currentMonday)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Dự toán lương */}
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

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
