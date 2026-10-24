import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const HomeSolutionsSection = () => {
  return (
    <section id="solutions" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
          Giải pháp chuyên biệt
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tạm biệt chuỗi ngày xếp ca đau đầu bằng Excel và sổ tay
        </h2>
        <p className="text-sm text-slate-600">
          Hãy xem Ca Làm Online biến đổi quy trình quản lý của cửa hàng bạn như thế nào.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Traditional Way */}
        <div className="bg-red-50/50 border-2 border-red-200/80 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-red-700">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center font-bold">
              ✕
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cách làm thủ công truyền thống</h3>
          </div>
          <ul className="space-y-4 text-xs text-slate-700">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </span>
              <span>
                <b>Trùng lặp & Xung đột ca:</b> Dễ xếp nhầm 1 nhân viên vào 2 ca cùng lúc hoặc xếp
                vào ngày nhân viên đã xin nghỉ.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </span>
              <span>
                <b>Tính lương cuối tháng sai sót:</b> Đếm từng giờ trên sổ sách rất dễ nhầm lẫn, dẫn
                đến tranh cãi không đáng có với nhân sự.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </span>
              <span>
                <b>Hỏi đi hỏi lại lịch qua Zalo:</b> Nhân viên quên ca, chụp ảnh màn hình lịch mờ
                nhạt, không nắm được giờ làm của mình.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </span>
              <span>
                <b>Bỏ ca không thể trừ lương minh bạch:</b> Nhân viên vắng mặt nhưng cuối tháng quản
                lý quên trừ tiền, gây thất thoát chi phí.
              </span>
            </li>
          </ul>
        </div>

        {/* Ca Làm Online Way */}
        <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Với hệ thống Ca Làm Online</h3>
          </div>
          <ul className="space-y-4 text-xs text-slate-700">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>Tự động xếp lịch thông minh (Auto Schedule):</b> Cân bằng công bằng số ca cho các
                nhân viên và ngăn chặn 100% việc trùng khung giờ.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>Bảng lương tự động cập nhật:</b> Hệ thống tính sẵn tiền lương theo giờ thực tế cho
                từng nhân viên, minh bạch và tức thời.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>Tự động gửi Email chuyên nghiệp:</b> Xuất bản lịch biểu là hệ thống gửi ngay danh
                sách ca và lương dự toán về email cá nhân của từng nhân viên.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <b>Đánh giá ca làm & Khấu trừ tự động:</b> Nhân viên bỏ ca hoặc đi trễ sẽ được ghi nhận,
                tự động trừ lương chuẩn xác và gửi email minh bạch cho nhân viên.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HomeSolutionsSection;
