import React, { useState } from 'react';
import {
  Clock,
  Users,
  X,
  Trash2,
  AlertTriangle,
  Lock,
  Plus,
  XCircle,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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
  isShiftStartedOrPassed,
  onEvaluateShift,
  saving,
  onAddEmployee,
  onRemoveSingleAssignment,
  onClearShiftAssignments,
}) => {
  const [evaluatingUserId, setEvaluatingUserId] = useState(null);
  const [missedReason, setMissedReason] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  if (!assignModal.isOpen) return null;

  const currentShiftId = getShiftId(assignModal.shiftId);
  const targetShift = shifts.find((s) => getShiftId(s._id) === currentShiftId);
  const isShiftPassed = isShiftPassedOrCompleted ? isShiftPassedOrCompleted(assignModal.date, targetShift) : false;
  const isShiftStarted = isShiftStartedOrPassed ? isShiftStartedOrPassed(assignModal.date, targetShift) : false;

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

  const handleStartEvaluateMissed = (userId) => {
    setEvaluatingUserId(userId);
    setMissedReason('');
  };

  const handleCancelEvaluate = () => {
    setEvaluatingUserId(null);
    setMissedReason('');
  };

  const handleConfirmMissed = async (userId) => {
    if (!onEvaluateShift) return;
    try {
      setSubmittingEvaluation(true);
      await onEvaluateShift({
        date: assignModal.date,
        shiftId: currentShiftId,
        userId,
        attendanceStatus: 'MISSED',
        missedReason: missedReason.trim(),
      });
      setEvaluatingUserId(null);
      setMissedReason('');
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const handleRestoreCompleted = async (userId) => {
    if (!onEvaluateShift) return;
    try {
      setSubmittingEvaluation(true);
      await onEvaluateShift({
        date: assignModal.date,
        shiftId: currentShiftId,
        userId,
        attendanceStatus: 'COMPLETED',
        missedReason: '',
      });
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const closeModal = () => {
    setEvaluatingUserId(null);
    setMissedReason('');
    setAssignModal({ isOpen: false, date: '', shiftId: '', selectedUserId: '' });
  };

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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  Phân công ca: {targetShift?.name || 'Ca làm việc'}
                </h3>
                {isShiftPassed ? (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Đã kết thúc
                  </span>
                ) : isShiftStarted ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                    Đang diễn ra
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold shrink-0">
                    Sắp diễn ra
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
            onClick={closeModal}
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
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {currentCellAssignments.map((a, idx) => {
                  const aUserId = getUserId(a.userId);
                  const member = members.find((m) => getUserId(m.user?._id || m.userId) === aUserId);
                  const name = member?.user?.name || member?.fullName || a.userObj?.name || 'Nhân viên';
                  const email = member?.user?.email || member?.email;
                  const wage = member?.hourlyWage || 20000;
                  const conflictShift = getAssignmentConflict(a);
                  const isMissed = a.attendanceStatus === 'MISSED';
                  const isEvaluatingThis = evaluatingUserId === aUserId;

                  return (
                    <div
                      key={`${aUserId}_${idx}`}
                      className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                        isMissed
                          ? 'bg-rose-50/70 border-rose-300'
                          : conflictShift
                          ? 'bg-red-50 border-red-300'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ${
                              isMissed
                                ? 'bg-rose-500'
                                : conflictShift
                                ? 'bg-red-500'
                                : isShiftPassed
                                ? 'bg-slate-500'
                                : 'bg-[#EA701B]'
                            }`}
                          >
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={`text-xs font-bold truncate ${isMissed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                {name}
                              </p>
                              {isMissed && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                                  Không hoàn thành (Đã trừ lương)
                                </span>
                              )}
                            </div>
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

                        {/* Actions Right Side */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Nút đánh giá: CHỈ HIỂN THỊ KHI CA ĐÃ BẮT ĐẦU HOẶC ĐÃ QUA */}
                          {isShiftStarted && (
                            <>
                              {isMissed ? (
                                <button
                                  type="button"
                                  disabled={submittingEvaluation || saving}
                                  onClick={() => handleRestoreCompleted(aUserId)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition disabled:opacity-50"
                                  title="Khôi phục trạng thái ca thành Hoàn thành và tính lại lương"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Khôi phục ca</span>
                                </button>
                              ) : (
                                !isEvaluatingThis && (
                                  <button
                                    type="button"
                                    disabled={submittingEvaluation || saving}
                                    onClick={() => handleStartEvaluateMissed(aUserId)}
                                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50"
                                    title="Đánh dấu nhân viên không đến làm hoặc không hoàn thành ca (tự động trừ lương và gửi email)"
                                  >
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Không hoàn thành</span>
                                  </button>
                                )
                              )}
                            </>
                          )}

                          {/* Xóa khỏi ca: Chỉ khi ca chưa kết thúc */}
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
                      </div>

                      {/* Display Missed Reason & Evaluator if already marked */}
                      {isMissed && (
                        <div className="mt-1 px-2.5 py-1.5 bg-rose-100/50 rounded-lg border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            {a.missedReason && (
                              <div>
                                <span className="font-semibold">Lý do:</span> {a.missedReason}
                              </div>
                            )}
                            {a.evaluatedBy && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                Đánh giá bởi:{' '}
                                <strong>
                                  {typeof a.evaluatedBy === 'object'
                                    ? a.evaluatedBy.fullName || a.evaluatedBy.name
                                    : 'Quản lý'}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Inline Form to Mark as Missed with Reason */}
                      {isEvaluatingThis && (
                        <div className="mt-2 p-3 bg-white border border-rose-200 rounded-xl shadow-xs space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Đánh dấu không hoàn thành & trừ lương
                            </span>
                            <span className="text-[10px] text-slate-400">Tự động gửi email</span>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={missedReason}
                              onChange={(e) => setMissedReason(e.target.value)}
                              placeholder="Nhập lý do (ví dụ: Nghỉ không phép, đi trễ không lý do...) — Tùy chọn"
                              className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                              autoFocus
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEvaluate}
                              disabled={submittingEvaluation}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              disabled={submittingEvaluation}
                              onClick={() => handleConfirmMissed(aUserId)}
                              className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>{submittingEvaluation ? 'Đang gửi...' : 'Xác nhận & Gửi email'}</span>
                            </button>
                          </div>
                        </div>
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
                <p className="font-bold text-amber-950">Ca làm việc đã kết thúc — Không thể thêm mới nhân viên</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Ca làm <strong>{targetShift?.name} ({targetShift?.startTime} — {targetShift?.endTime}, {assignModal.date})</strong> đã qua. Hệ thống khóa chỉnh sửa để bảo toàn giờ làm và tiền lương của nhân viên.
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
              onClick={closeModal}
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
