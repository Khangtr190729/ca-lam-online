import React from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const PayrollSummaryCard = ({ payrollSummary }) => {
  const hasMissedShifts = (payrollSummary.storeTotalMissedShifts || 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dự toán bảng lương theo ca (Tuần này)</h3>
            <p className="text-xs text-slate-500">
              Tính toán dựa trên số ca hoàn thành × số giờ ca × mức lương từng nhân viên (đã trừ ca không hoàn thành)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div>
            <span className="text-xs text-slate-400 block">Tổng ca phân công:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 font-mono">{payrollSummary.storeTotalShifts} ca</span>
              {hasMissedShifts && (
                <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                  Trừ {payrollSummary.storeTotalMissedShifts} ca vắng
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Tổng giờ tính lương:</span>
            <span className="font-bold text-slate-800 font-mono">{payrollSummary.storeTotalHours} giờ</span>
          </div>
          <div className="bg-[#FFF0E5] px-3.5 py-1.5 rounded-xl border border-orange-200">
            <span className="text-[11px] text-[#EA701B] font-bold block uppercase tracking-wider">
              Tổng thực nhận dự kiến:
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
          {payrollSummary.employees.map((emp) => {
            const hasEmpMissed = (emp.missedShifts || 0) > 0;

            return (
              <div
                key={emp.email || emp.name}
                className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#EA701B] font-bold text-xs flex items-center justify-center shrink-0">
                    {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                      {hasEmpMissed && (
                        <span className="px-1 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-bold shrink-0">
                          Trừ {emp.missedShifts} ca
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {emp.completedShifts || 0}/{emp.totalShifts} ca ({emp.totalHours}h) × {formatVND(emp.hourlyWage)}/h
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 font-bold text-xs text-[#EA701B] font-mono">
                  {formatVND(emp.totalWage)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PayrollSummaryCard;
