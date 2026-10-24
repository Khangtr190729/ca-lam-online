import React from 'react';
import { Clock, Plus, Lock, CheckCircle2, AlertTriangle, Star } from 'lucide-react';

export const ScheduleTimetableGrid = ({
  shifts,
  daysOfWeek,
  assignments,
  members,
  getShiftId,
  getUserId,
  getAssignmentConflict,
  isShiftPassedOrCompleted,
  onOpenAssignModal,
  onUpdateShiftStars,
}) => {
  if (shifts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
        <Clock className="w-12 h-12 text-orange-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">Chưa có khung giờ ca làm nào</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
          Bạn cần tạo các khung giờ (ví dụ: Ca Sáng 08:00 - 12:00) trước khi xếp lịch làm việc cho nhân viên.
        </p>
        <a
          href="/shifts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA701B] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#D55E0D]"
        >
          <Plus className="w-4 h-4" />
          Tạo ca làm ngay
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[960px]">
          {/* Header row: Days of the week */}
          <thead>
            <tr className="bg-[#FFF0E5] border-b border-orange-100 text-slate-700">
              <th className="w-48 p-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 border-r border-orange-100">
                Khung Giờ / Ca
              </th>
              {daysOfWeek.map((day) => (
                <th
                  key={day.dateStr}
                  className={`p-3 text-center border-r border-orange-100 last:border-r-0 ${
                    day.isToday ? 'bg-orange-200/60 font-extrabold text-[#EA701B]' : day.isPast ? 'bg-slate-100/70' : ''
                  }`}
                >
                  <div className={`text-xs uppercase font-bold tracking-tight ${day.isPast && !day.isToday ? 'text-slate-400' : 'text-slate-800'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-xs font-mono mt-0.5 font-medium ${day.isPast && !day.isToday ? 'text-slate-400' : 'text-slate-500'}`}>
                    {day.displayDate}
                  </div>
                  {day.isToday ? (
                    <span className="inline-block px-1.5 py-0.2 text-[10px] bg-[#EA701B] text-white rounded-full mt-0.5">
                      Hôm nay
                    </span>
                  ) : day.isPast ? (
                    <span className="inline-block px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-500 rounded-full mt-0.5 font-medium">
                      Đã qua
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body: Shift Slots (Rows) */}
          <tbody className="divide-y divide-slate-100">
            {shifts.map((shift) => (
              <tr key={shift._id} className="hover:bg-slate-50/50 transition">
                {/* Shift Label Header Cell */}
                <td className="p-3.5 bg-slate-50/80 border-r border-slate-200 text-left align-top">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: shift.color || '#EA701B' }}
                    />
                    <span className="font-bold text-sm text-slate-800">{shift.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{shift.startTime} — {shift.endTime}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {shift.durationHours || 4} tiếng / ca
                  </div>

                  {/* Đánh dấu mức độ cao điểm (1 - 3 sao) - Tối giản */}
                  <div className="mt-2 pt-1.5 flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[1, 2, 3].map((starVal) => {
                        const currentStars = shift.peakLevel || 1;
                        const isFilled = starVal <= currentStars;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateShiftStars) {
                                onUpdateShiftStars(shift._id, starVal);
                              }
                            }}
                            className="p-0.5 hover:scale-110 transition cursor-pointer"
                            title={`${starVal} sao - ${
                              starVal === 1
                                ? 'Bình thường'
                                : starVal === 2
                                ? 'Khá cao điểm'
                                : 'Rất cao điểm'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFilled
                                  ? 'fill-amber-400 stroke-amber-500'
                                  : 'fill-slate-100 stroke-slate-300 hover:stroke-amber-400'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 select-none">
                      {(shift.peakLevel || 1) === 3
                        ? 'Rất cao điểm'
                        : (shift.peakLevel || 1) === 2
                        ? 'Khá cao điểm'
                        : 'Bình thường'}
                    </span>
                  </div>
                </td>

                {/* 7 Daily cells for this shift */}
                {daysOfWeek.map((day) => {
                  const currentShiftId = getShiftId(shift._id);
                  const cellAssignments = assignments.filter(
                    (a) => a.date === day.dateStr && getShiftId(a.shiftId) === currentShiftId
                  );
                  const hasAnyConflict = cellAssignments.some((a) => !!getAssignmentConflict(a));
                  const isPassed = isShiftPassedOrCompleted(day.dateStr, shift);

                  return (
                    <td
                      key={day.dateStr}
                      className="p-1.5 border-r border-slate-100 last:border-r-0 align-top min-h-24 hover:bg-orange-50/20 transition"
                    >
                      {cellAssignments.length === 0 ? (
                        isPassed ? (
                          <div
                            title="Ca làm việc này đã kết thúc trong quá khứ"
                            className="w-full h-full min-h-[84px] border border-dashed border-slate-200/80 bg-slate-50/60 rounded-xl flex flex-col items-center justify-center text-slate-300 select-none cursor-not-allowed p-2"
                          >
                            <Clock className="w-4 h-4 text-slate-300" />
                            <span className="text-[10px] font-medium text-slate-400 mt-1">Đã kết thúc</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenAssignModal(day.dateStr, shift._id)}
                            className="w-full h-full min-h-[84px] border border-dashed border-slate-200 hover:border-[#EA701B] hover:bg-[#FFF7F0] rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-[#EA701B] transition group p-2"
                          >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-medium mt-1">+ Phân ca</span>
                          </button>
                        )
                      ) : (
                        <div
                          onClick={() => onOpenAssignModal(day.dateStr, shift._id)}
                          className={`group relative w-full h-full min-h-[84px] rounded-xl p-2 flex flex-col justify-between cursor-pointer transition shadow-xs ${
                            hasAnyConflict
                              ? 'bg-red-50/90 hover:bg-red-100/90 border-2 border-red-400 ring-1 ring-red-400/50'
                              : isPassed
                              ? 'bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200 text-slate-600'
                              : 'bg-[#FFF8F2] hover:bg-[#FFF0E5] border border-orange-200/90'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                  hasAnyConflict ? 'text-red-700' : isPassed ? 'text-slate-500' : 'text-[#EA701B]'
                                }`}
                              >
                                {isPassed && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                                <span>{cellAssignments.length} nhân viên</span>
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold text-white ${
                                  hasAnyConflict ? 'bg-red-500' : isPassed ? 'bg-slate-400' : 'bg-[#EA701B]'
                                }`}
                              >
                                {cellAssignments.length}
                              </span>
                            </div>

                              <div className="space-y-1">
                              {cellAssignments.map((a, idx) => {
                                const aUserId = getUserId(a.userId);
                                const assignedUser =
                                  members.find((m) => getUserId(m.user?._id || m.userId) === aUserId)?.user ||
                                  a.userObj || { name: 'Nhân viên' };
                                const conflictShift = getAssignmentConflict(a);
                                const isMissed = a.attendanceStatus === 'MISSED';
                                const isPartial = a.attendanceStatus === 'PARTIAL';

                                return (
                                  <div
                                    key={`${a.userId}_${idx}`}
                                    className={`flex items-center justify-between gap-1 px-1.5 py-1 rounded-lg border text-xs transition ${
                                      isMissed
                                        ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                                        : isPartial
                                        ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                                        : conflictShift
                                        ? 'bg-red-100/80 border-red-300 text-red-900 font-bold'
                                        : isPassed
                                        ? 'bg-white border-slate-200 text-slate-700'
                                        : 'bg-white border-orange-100 text-slate-800 hover:border-orange-200'
                                    }`}
                                    title={
                                      isMissed
                                        ? `Vắng mặt / Không hoàn thành (Trừ cả ca)${a.missedReason ? ': ' + a.missedReason : ''}`
                                        : isPartial
                                        ? `Chưa hoàn thành tốt: Trừ -${a.deductedPay ? a.deductedPay.toLocaleString('vi-VN') + 'đ' : ''} (${a.deductedHours ? a.deductedHours + 'h' : ''})${a.missedReason ? ' — ' + a.missedReason : ''}`
                                        : undefined
                                    }
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <div
                                        className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                          isMissed
                                            ? 'bg-rose-500'
                                            : isPartial
                                            ? 'bg-amber-500'
                                            : conflictShift
                                            ? 'bg-red-600'
                                            : isPassed
                                            ? 'bg-slate-500'
                                            : 'bg-[#EA701B]'
                                        }`}
                                      >
                                        {assignedUser.name ? assignedUser.name.charAt(0).toUpperCase() : 'U'}
                                      </div>
                                      <span
                                        className={`truncate font-semibold text-[11px] leading-tight ${
                                          isMissed
                                            ? 'line-through text-slate-400'
                                            : isPartial
                                            ? 'text-amber-950 font-bold'
                                            : ''
                                        }`}
                                      >
                                        {assignedUser.name}
                                      </span>
                                    </div>

                                    {isMissed && (
                                      <span className="shrink-0 px-1 py-0.2 rounded bg-rose-200/80 text-rose-800 text-[9px] font-bold">
                                        Vắng
                                      </span>
                                    )}

                                    {isPartial && (
                                      <span
                                        className="shrink-0 px-1 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-extrabold"
                                        title={`Trừ -${a.deductedPay ? a.deductedPay.toLocaleString('vi-VN') + 'đ' : ''}`}
                                      >
                                        {a.deductedHours ? `-${a.deductedHours}h` : 'Trừ lương'}
                                      </span>
                                    )}

                                    {conflictShift && (
                                      <span
                                        title={`Trùng giờ với ca "${conflictShift.name}" (${conflictShift.startTime}-${conflictShift.endTime})`}
                                        className="shrink-0"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="mt-2 pt-1 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{shift.startTime} - {shift.endTime}</span>
                            </span>
                            {isPassed ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Đã xong
                              </span>
                            ) : (
                              <span className="text-[#EA701B] font-bold group-hover:underline">
                                + Thêm
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTimetableGrid;
