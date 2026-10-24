import React from 'react';

export const HomeStepsSection = () => {
  return (
    <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
          Dễ dàng sử dụng
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Vận hành chỉ với 3 bước đơn giản
        </h2>
        <p className="text-sm text-slate-600">
          Không cần hướng dẫn phức tạp, bạn có thể đưa quán vào hoạt động ngay trong vài phút.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Step 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
          <span className="text-4xl font-extrabold text-orange-200 font-mono">01</span>
          <h3 className="text-base font-bold text-slate-900">Tạo quán & Định nghĩa ca làm</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nhập tên quán, tạo các ca làm chuẩn (Ca Sáng, Ca Chiều, Ca Tối...) và gán mức lương theo giờ
            cho các nhân viên.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
          <span className="text-4xl font-extrabold text-orange-200 font-mono">02</span>
          <h3 className="text-base font-bold text-slate-900">Mời nhân viên & Xếp lịch</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gửi mã mời 6 số hoặc email cho nhân viên. Bấm nút <b>"Tự động xếp lịch"</b> để hệ thống tự
            chia ca hoàn hảo trong tích tắc.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-4 hover-lift relative">
          <span className="text-4xl font-extrabold text-orange-200 font-mono">03</span>
          <h3 className="text-base font-bold text-slate-900">Xuất bản & Tự động gửi Email</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Xem lại bảng lương dự toán tuần, bấm <b>"Xuất bản"</b>. Hệ thống tự động gửi email thông
            báo chi tiết đến từng nhân sự.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeStepsSection;
