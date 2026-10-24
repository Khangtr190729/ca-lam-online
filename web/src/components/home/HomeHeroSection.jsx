import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export const HomeHeroSection = ({ scrollToSection }) => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Subtle decorative background gradient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-orange-300/25 via-amber-200/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/80 border border-orange-200/80 text-[#EA701B] text-xs font-bold shadow-xs animate-page-enter">
          <Sparkles className="w-4 h-4" />
          <span>Nền tảng Quản trị & Tự động Xếp ca 2026</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto animate-page-enter">
          Xếp ca thông minh — Tự động tính lương{' '}
          <span className="text-[#EA701B] underline decoration-orange-300/50 decoration-wavy decoration-2">
            chuẩn xác từng phút
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-page-enter">
          Giải pháp thay thế hoàn toàn việc xếp ca bằng giấy bút và bảng tính thủ công. Tối ưu thời gian,
          ngăn chặn trùng ca thời gian thực, đánh giá ca làm và tự động gửi email lịch trực kèm bảng
          lương chỉ với 1 cú nhấp chuột.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-page-enter">
          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-orange-500/30 btn-press hover-lift transition-all"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => scrollToSection('interactive-preview')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 bg-white hover:bg-orange-50/60 text-slate-700 text-sm font-bold rounded-2xl border border-slate-200 shadow-xs btn-press hover-lift transition cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#EA701B] fill-[#EA701B]" />
            <span>Xem giao diện thực tế</span>
          </button>
        </div>

        {/* Value check pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Không cần cài đặt phức tạp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tự động gửi email thông báo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dễ dàng dùng trên điện thoại & máy tính</span>
          </div>
        </div>

        {/* Interactive Timetable Mockup Preview */}
        <div
          id="interactive-preview"
          className="pt-10 max-w-5xl mx-auto relative group animate-page-enter"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-35 transition duration-500 -z-10" />

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-left">
            {/* Window Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-500 ml-3">
                  Lịch làm việc tuần
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã xuất bản & Đã gửi email
                </span>
              </div>
            </div>

            {/* Mockup Timetable Content */}
            <div className="p-6 overflow-x-auto space-y-4">
              <div className="grid grid-cols-4 gap-3 min-w-[650px]">
                {/* Column 1: Shift Info */}
                <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2 hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#EA701B]">Ca Sáng</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                      07:00 - 12:00
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Nguyễn Văn A</span>
                      <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Trần Thị B</span>
                      <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Shift Info */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-700">Ca Chiều</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                      12:30 - 17:30
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Lê Hoàng C</span>
                      <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Phạm Quỳnh D</span>
                      <span className="text-emerald-700 font-mono font-bold">125.000đ</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Shift Info */}
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 hover-lift">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-700">Ca Tối</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold">
                      18:00 - 22:30
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">2 Nhân viên:</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Vũ Minh E</span>
                      <span className="text-emerald-700 font-mono font-bold">112.500đ</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl shadow-xs">
                      <span className="font-semibold text-slate-700">Hoàng Thu F</span>
                      <span className="text-emerald-700 font-mono font-bold">112.500đ</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: Payroll & Metric Card */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col justify-between hover-lift">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      Dự toán tuần này
                    </span>
                    <h4 className="text-xl font-mono font-extrabold text-white mt-1">3.450.000đ</h4>
                    <p className="text-[11px] text-slate-400 mt-1">28 lượt ca • 6 nhân sự</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">● 0 xung đột</span>
                    <span className="text-slate-400">100% tự động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
