import React from 'react';
import { AlertCircle } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

/**
 * Modal hiển thị chi tiết ca làm việc cho nhân viên:
 * - Thời gian, ngày làm, cơ sở làm việc
 * - Đồng nghiệp cùng ca
 * - Cảnh báo và giải trình khấu trừ nếu ca bị đánh giá PARTIAL hoặc MISSED
 */
export const EmployeeShiftDetailModal = ({ activeShiftDetail, onClose, storeName }) => {
  if (!activeShiftDetail) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-backdrop-fade">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-modal-pop">
        <div className="p-5 bg-[#FFF0E5] border-b border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EA701B] uppercase tracking-wider">
              Chi tiết ca làm việc
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-1">
            {activeShiftDetail.shift?.name || activeShiftDetail.shiftName || 'Ca làm việc'}
          </h3>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Ngày làm:</span>
            <span className="font-bold text-slate-800 font-mono">{activeShiftDetail.date}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Thời gian ca:</span>
            <span className="font-bold text-slate-800 font-mono">
              {activeShiftDetail.shift?.startTime || activeShiftDetail.startTime} —{' '}
              {activeShiftDetail.shift?.endTime || activeShiftDetail.endTime} (
              {activeShiftDetail.shift?.durationHours || activeShiftDetail.hours || 0} giờ)
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-500">Cơ sở làm việc:</span>
            <span className="font-bold text-slate-800">{storeName}</span>
          </div>

          {/* Attendance Evaluation Warning Box if any */}
          {activeShiftDetail.attendanceStatus === 'PARTIAL' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Chưa hoàn thành tốt
                </span>
                <span className="text-rose-600 font-mono">
                  Khấu trừ: -{formatVND(activeShiftDetail.deductedPay || 0)}
                </span>
              </div>
              {activeShiftDetail.missedReason && (
                <p className="text-[11px] text-amber-800 mt-1">
                  <strong>Lý do:</strong> {activeShiftDetail.missedReason}
                </p>
              )}
              <div className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-amber-200/80 flex items-center justify-between">
                <span>Lương ca thực nhận:</span>
                <span className="font-bold font-mono text-xs">
                  {formatVND(
                    activeShiftDetail.totalPay !== undefined ? activeShiftDetail.totalPay : 0
                  )}
                </span>
              </div>
            </div>
          )}

          {activeShiftDetail.attendanceStatus === 'MISSED' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Không hoàn thành ca làm
                </span>
                <span className="text-rose-600 font-mono">Trừ 100% lương</span>
              </div>
              {activeShiftDetail.missedReason && (
                <p className="text-[11px] text-rose-800 mt-1">
                  <strong>Lý do:</strong> {activeShiftDetail.missedReason}
                </p>
              )}
            </div>
          )}

          <div>
            <span className="text-slate-500 block mb-2 font-semibold">
              Đồng nghiệp cùng ca ({activeShiftDetail.coworkers?.length || 0}):
            </span>
            {!activeShiftDetail.coworkers || activeShiftDetail.coworkers.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">
                Bạn là nhân sự duy nhất được phân ca này.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeShiftDetail.coworkers.map((c) => (
                  <div key={c._id} className="p-2 bg-slate-50 rounded-xl flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-[#EA701B] font-bold text-[10px] flex items-center justify-center">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#EA701B] text-white font-bold rounded-xl text-xs hover:bg-[#D55E0D] transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeShiftDetailModal;
