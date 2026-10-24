import React from 'react';

export const HomeMetricsSection = () => {
  return (
    <section className="py-12 bg-white border-y border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-[#EA701B] font-mono">99.8%</p>
            <p className="text-xs font-bold text-slate-800">Không lo trùng ca</p>
            <p className="text-[11px] text-slate-500">Phát hiện xung đột giờ tức thời</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">4+ Giờ</p>
            <p className="text-xs font-bold text-slate-800">Tiết kiệm mỗi tuần</p>
            <p className="text-[11px] text-slate-500">Xếp lịch tự động chỉ 1 cú click</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">100%</p>
            <p className="text-xs font-bold text-slate-800">Chuẩn xác tiền lương</p>
            <p className="text-[11px] text-slate-500">Tự động tính lương theo giờ & ca</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-600 font-mono">Tức thì</p>
            <p className="text-xs font-bold text-slate-800">Gửi Email thông báo</p>
            <p className="text-[11px] text-slate-500">Báo lịch & lương về hộp thư nhân viên</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeMetricsSection;
