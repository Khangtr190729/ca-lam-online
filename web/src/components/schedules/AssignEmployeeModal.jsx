import React from 'react';
import { Clock, Users, X, Trash2, AlertTriangle, Lock, Plus } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const AssignEmployeeModal = ({
  assignModal,
  setAssignModal,
  shifts,
  members,
  assignments,
  daysOfWeek,
  getShiftId,
  getUserId,
  getConflictingShift,
  getAssignmentConflict,
  isShiftPassedOrCompleted,
  onAddEmployee,
  onRemoveSingleAssignment,
  onClearShiftAssignments,
}) => {
  if (!assignModal.isOpen) return null;

  const currentShiftId = getShiftId(assignModal.shiftId);
  const targetShift = shifts.find((s) => getShiftId(s._id) === currentShiftId);
  const isShiftPassed = isShiftPassedOrCompleted(assignModal.date, targetShift);
  const currentCellAssignments = assignments.filter(
    (a) => a.date === assignModal.date && getShiftId(a.shiftId) === currentShiftId
  );

  const selectedCandidateId = getUserId(assignModal.selectedUserId);
  const selectedConflict = selectedCandidateId
    ? getConflictingShift(selectedCandidateId, assignModal.date, currentShiftId)
    : null;
  const isSelectedAlready = selectedCandidateId
    ? currentCellAssignments.some((a) => getUserId(a.userId) === selectedCandidateId)
    : false;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FFF0E5] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  Phân công ca: {targetShift?.name || 'Ca làm việc'}
                </h3>
                {isShiftPassed && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Đã kết thúc (Đã khóa ca)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {targetShift?.startTime} — {targetShift?.endTime} •{' '}
                {daysOfWeek.find((d) => d.dateStr === assignModal.date)?.fullDisplay || assignModal.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', selectedUserId: '' })}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* SECTION 1: Current Assigned Employees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#EA701B]" />
                <span>Nhân viên trong ca này ({currentCellAssignments.length} người)</span>
              </label>
              {currentCellAssignments.length > 0 && !isShiftPassed && (
                <button
                  type="button"
                  onClick={() => onClearShiftAssignments(assignModal.date, assignModal.shiftId)}
                  className="text-[11px] text-red-600 hover:underline font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {currentCellAssignments.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
                {isShiftPassed
                  ? 'Không có nhân viên nào được xếp trong ca này.'
                  : 'Chưa có nhân viên nào trong ca này. Hãy chọn nhân viên bên dưới để thêm vào ca.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {currentCellAssignments.map((a, idx) => {
                  const aUserId = getUserId(a.userId);
                  const member = members.find((m) => getUserId(m.user?._id || m.userId) === aUserId);
                  const name = member?.user?.name || member?.fullName || a.userObj?.name || 'Nhân viên';
                  const email = member?.user?.email || member?.email;
                  const wage = member?.hourlyWage || 20000;
                  const conflictShift = getAssignmentConflict(a);

                  return (
                    <div
                      key={`${aUserId}_${idx}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                        conflictShift ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                            conflictShift ? 'bg-red-500' : isShiftPassed ? 'bg-slate-500' : 'bg-[#EA701B]'
                          }`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatVND(wage)}/h {email ? `• ${email}` : ''}
                          </p>
                          {conflictShift && (
                            <p className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              Trùng giờ với ca "{conflictShift.name}" ({conflictShift.startTime} - {conflictShift.endTime})
                            </p>
                          )}
                        </div>
                      </div>

                      {!isShiftPassed && (
                        <button
                          type="button"
                          onClick={() => onRemoveSingleAssignment(a.date, a.shiftId, a.userId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                          title="Xóa khỏi ca"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Add New Employee to Shift */}
          {isShiftPassed ? (
            <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Ca làm việc đã kết thúc — Không thể chỉnh sửa</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Ca làm <strong>{targetShift?.name} ({targetShift?.startTime} — {targetShift?.endTime}, {assignModal.date})</strong> đã qua. Hệ thống tự động khóa ca để bảo toàn giờ làm và tiền lương của nhân viên, không thể sửa đổi hoặc xóa.
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Thêm nhân viên vào ca này
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={assignModal.selectedUserId}
                  onChange={(e) =>
                    setAssignModal((prev) => ({ ...prev, selectedUserId: e.target.value }))
                  }
                  className="flex-1 min-w-0 w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA701B] truncate"
                >
                  <option value="">-- Chọn nhân viên để thêm --</option>
                  {members.map((m) => {
                    const uid = getUserId(m.user?._id || m.userId);
                    const alreadyIn = currentCellAssignments.some((a) => getUserId(a.userId) === uid);
                    const conflict = getConflictingShift(uid, assignModal.date, currentShiftId);

                    let note = '';
                    if (alreadyIn) {
                      note = `[Đã có trong ca này] ${m.user?.name || m.fullName}`;
                    } else if (conflict) {
                      note = `[Trùng ca: ${conflict.name} (${conflict.startTime} - ${conflict.endTime})] ${m.user?.name || m.fullName}`;
                    }

                    return (
                      <option
                        key={uid}
                        value={uid}
                        disabled={alreadyIn || !!conflict}
                        className={alreadyIn || conflict ? 'text-slate-400 bg-slate-50' : ''}
                      >
                        {note || `${m.user?.name || m.fullName} (${m.user?.email || m.email}) — ${formatVND(m.hourlyWage)}/h`}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  disabled={!assignModal.selectedUserId || !!selectedConflict || isSelectedAlready}
                  onClick={onAddEmployee}
                  className="px-4 py-2.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm vào ca</span>
                </button>
              </div>

              {/* Conflict alert for selected candidate */}
              {selectedConflict && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-fade-in mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800">Cảnh báo: Trùng giờ làm việc!</p>
                    <p className="mt-0.5 text-slate-600">
                      Nhân viên này đã được phân ca <b>"{selectedConflict.name}" ({selectedConflict.startTime} - {selectedConflict.endTime})</b> vào ngày này. Không thể phân 2 ca cùng khung giờ!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModal({ isOpen: false, date: '', shiftId: '', selectedUserId: '' })}
              className="px-5 py-2 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-xs"
            >
              Xong & Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;
