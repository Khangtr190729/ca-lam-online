import React from 'react';
import { Star } from 'lucide-react';

export const HomeTestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white border-y border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-extrabold text-[#EA701B] uppercase tracking-wider bg-orange-100/80 px-3 py-1 rounded-full">
            Khách hàng nói gì
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Được tin dùng bởi các chủ quán và chuỗi cửa hàng
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              "Trước đây cuối tuần nào mình cũng mất nửa ngày để sắp xếp ca cho 12 bạn nhân viên part-time
              trên Excel rồi gửi lên nhóm Zalo. Giờ bấm Tự động xếp lịch là xong, có cả email báo lương
              rất minh bạch!"
            </p>
            <div className="pt-2 border-t border-orange-200/60">
              <p className="text-xs font-bold text-slate-900">Anh Hoàng Khang</p>
              <p className="text-[10px] text-slate-500">Chủ chuỗi Shop Trái Cây & Nước ép</p>
            </div>
          </div>

          <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              "Thích nhất tính năng đánh giá ca làm việc linh hoạt. Bạn nào đi trễ hay xin về sớm thì chọn
              trừ số tiếng tương ứng, bạn nào bỏ ca thì trừ cả ca, hệ thống gửi email cảnh báo rõ ràng nên nhân
              viên rất có trách nhiệm."
            </p>
            <div className="pt-2 border-t border-orange-200/60">
              <p className="text-xs font-bold text-slate-900">Chị Thu Thảo</p>
              <p className="text-[10px] text-slate-500">Quản lý The Sense Coffee</p>
            </div>
          </div>

          <div className="p-6 bg-[#FFF7F0] rounded-3xl border border-orange-100 space-y-4 hover-lift">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              "Em là sinh viên đi làm thêm, vào màn hình Lịch làm của tôi xem được ngay tuần này đi làm
              những ngày nào, dự kiến nhận được bao nhiêu tiền lương. Giao diện trên điện thoại cũng rất
              nhanh và mượt."
            </p>
            <div className="pt-2 border-t border-orange-200/60">
              <p className="text-xs font-bold text-slate-900">Bạn Minh Quân</p>
              <p className="text-[10px] text-slate-500">Nhân viên pha chế Part-time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonialsSection;
