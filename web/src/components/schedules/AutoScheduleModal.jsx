import React from 'react';
import { Sparkles, X, Info, AlertCircle, Clock, Users } from 'lucide-react';

export const AutoScheduleModal = ({
  isOpen,
  onClose,
  autoConfig,
  setAutoConfig,
  autoGenerating,
  onAutoSchedule,
  isPastWeek,
  daysOfWeek,
  todayDateStr,
  shiftsCount,
  membersCount,
}) => {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
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
              <span>
                Tuần này có ngày hoặc ca đã qua. Hệ thống sẽ tự động bỏ qua các ngày/ca đã qua (ví dụ Thứ Hai hoặc ca sáng đã qua), giữ nguyên người trực cũ và chỉ tự động xếp ca cho các ca sắp tới.
              </span>
            </div>
          ) : null}

          {/* Store context stats */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Tổng ca/ngày: <strong className="text-slate-800">{shiftsCount} ca</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Nhân viên sẵn sàng: <strong className="text-slate-800">{membersCount} người</strong></span>
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
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={autoGenerating || shiftsCount === 0 || membersCount === 0 || isPastWeek}
            onClick={onAutoSchedule}
            className="px-5 py-2.5 text-xs font-bold text-white bg-linear-to-r from-amber-500 to-[#EA701B] hover:from-amber-600 hover:to-[#D55E0D] rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{autoGenerating ? 'Đang tự động tính toán & xếp ca...' : 'Bắt đầu tự động xếp ca'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoScheduleModal;
