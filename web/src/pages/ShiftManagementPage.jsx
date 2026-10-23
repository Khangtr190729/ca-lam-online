import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shiftApi } from '../services/api';
import { checkShiftOverlap } from '../utils/formatters';

export const ShiftManagementPage = () => {
  const { store } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Create / Edit Shift Modal
  const [shiftModal, setShiftModal] = useState({
    isOpen: false,
    isEdit: false,
    shiftId: null,
    name: '',
    startTime: '08:00',
    endTime: '12:00',
    durationHours: 4,
    color: '#EA701B'
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    shift: null
  });

  const loadShifts = useCallback(async () => {
    if (!store?._id) return;
    try {
      setLoading(true);
      const res = await shiftApi.getShifts(store._id);
      if (res.success) {
        setShifts(res.shifts || res.data || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải danh sách ca làm' });
    } finally {
      setLoading(false);
    }
  }, [store?._id]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Kiểm tra xung đột thời gian trong modal với các ca khác
  const modalConflict = useMemo(() => {
    if (!shiftModal.isOpen || !shiftModal.startTime || !shiftModal.endTime) return null;
    return shifts.find(
      (s) =>
        (!shiftModal.isEdit || s._id !== shiftModal.shiftId) &&
        checkShiftOverlap({ startTime: shiftModal.startTime, endTime: shiftModal.endTime }, s)
    );
  }, [shiftModal.isOpen, shiftModal.isEdit, shiftModal.shiftId, shiftModal.startTime, shiftModal.endTime, shifts]);

  // Tìm các cặp ca làm việc đang bị trùng khung giờ với nhau trong toàn quán
  const conflictingShiftMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        if (checkShiftOverlap(shifts[i], shifts[j])) {
          if (!map[shifts[i]._id]) map[shifts[i]._id] = [];
          if (!map[shifts[j]._id]) map[shifts[j]._id] = [];
          map[shifts[i]._id].push(shifts[j]);
          map[shifts[j]._id].push(shifts[i]);
        }
      }
    }
    return map;
  }, [shifts]);

  const conflictingCount = Object.keys(conflictingShiftMap).length;

  // Tự động tính số tiếng trực tiếp từ giờ bắt đầu và giờ kết thúc
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMin = (startH || 0) * 60 + (startM || 0);
      let endMin = (endH || 0) * 60 + (endM || 0);
      if (endMin < startMin) {
        endMin += 1440; // Ca đêm qua 0h
      } else if (endMin === startMin) {
        return 0;
      }
      return Math.round(((endMin - startMin) / 60) * 10) / 10;
    } catch {
      return 0;
    }
  };

  // Thời lượng (số tiếng) luôn được tính toán tự động theo thời gian thực từ startTime và endTime
  const computedDuration = useMemo(() => {
    return calculateDuration(shiftModal.startTime, shiftModal.endTime);
  }, [shiftModal.startTime, shiftModal.endTime]);

  const handleTimeChange = (field, value) => {
    setShiftModal((prev) => ({ ...prev, [field]: value }));
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setShiftModal({
      isOpen: true,
      isEdit: false,
      shiftId: null,
      name: `Ca ${shifts.length + 1}`,
      startTime: '08:00',
      endTime: '12:00',
      color: '#EA701B'
    });
  };

  // Open modal for Edit
  const handleOpenEdit = (shift) => {
    setShiftModal({
      isOpen: true,
      isEdit: true,
      shiftId: shift._id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      color: shift.color || '#EA701B'
    });
  };

  // Save Shift
  const handleSaveShift = async (e) => {
    e.preventDefault();
    if (!shiftModal.name.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập tên ca làm việc.' });
      return;
    }

    if (computedDuration <= 0) {
      setFeedback({
        type: 'error',
        message: 'Giờ kết thúc phải khác giờ bắt đầu (thời lượng ca phải lớn hơn 0 tiếng).'
      });
      return;
    }

    // Kiểm tra không cho phép tạo/cập nhật ca bị trùng khung giờ
    if (modalConflict) {
      setFeedback({
        type: 'error',
        message: `Khung giờ của ca (${shiftModal.startTime} - ${shiftModal.endTime}) bị trùng/giao thoa với ca "${modalConflict.name}" (${modalConflict.startTime} - ${modalConflict.endTime}). Mỗi ca làm việc trong quán phải có khung giờ riêng biệt!`
      });
      return;
    }

    try {
      const payload = {
        name: shiftModal.name.trim(),
        startTime: shiftModal.startTime,
        endTime: shiftModal.endTime,
        durationHours: computedDuration,
        color: shiftModal.color
      };

      if (shiftModal.isEdit) {
        await shiftApi.updateShift(store._id, shiftModal.shiftId, payload);
        setFeedback({ type: 'success', message: 'Cập nhật ca làm thành công!' });
      } else {
        await shiftApi.createShift(store._id, payload);
        setFeedback({ type: 'success', message: 'Tạo ca làm mới thành công!' });
      }

      setShiftModal({
        isOpen: false,
        isEdit: false,
        shiftId: null,
        name: '',
        startTime: '08:00',
        endTime: '12:00',
        color: '#EA701B'
      });
      loadShifts();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi lưu ca làm' });
    }
  };

  // Confirm delete shift
  const handleConfirmDelete = async () => {
    if (!deleteModal.shift) return;
    try {
      await shiftApi.deleteShift(store._id, deleteModal.shift._id);
      setFeedback({ type: 'success', message: 'Đã xóa ca làm thành công!' });
      setDeleteModal({ isOpen: false, shift: null });
      loadShifts();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi xóa ca làm' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#EA701B]" />
            <span>Quản lý Khung giờ Ca làm</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA701B] font-bold">
              {shifts.length} ca
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định nghĩa các khung thời gian (Slot 1, Slot 2, Ca Sáng, Ca Chiều...) để xếp lịch biểu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl transition shadow-xs btn-press hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ca làm mới</span>
        </button>
      </div>

      {/* Cảnh báo xung đột các ca đã có trong quán */}
      {conflictingCount > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-amber-900 text-sm">
              Cảnh báo: Có {conflictingCount} ca làm việc đang bị trùng/giao thoa khung giờ với nhau!
            </h4>
            <p className="text-amber-800 mt-1 leading-relaxed">
              Các ca làm việc trong cùng một cửa hàng phải có khung giờ phân biệt. Hãy nhấn vào biểu tượng <b>chỉnh sửa</b> trên các ca bị đánh dấu cảnh báo bên dưới để điều chỉnh giờ bắt đầu hoặc kết thúc, tránh xung đột khi xếp lịch làm việc cho nhân viên.
            </p>
          </div>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Shifts Grid Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Đang tải danh sách ca...</div>
      ) : shifts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center">
          <Clock className="w-12 h-12 text-orange-200 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Chưa có ca làm việc nào</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Hãy tạo các ca làm chuẩn (ví dụ: Ca Sáng 08:00 - 12:00, Ca Chiều 13:00 - 17:00).
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#EA701B] text-white text-xs font-bold rounded-xl"
          >
            Tạo ca đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => {
            const conflicts = conflictingShiftMap[shift._id] || [];
            const hasConflict = conflicts.length > 0;

            return (
              <div
                key={shift._id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover-lift transition-all duration-200 space-y-4 ${
                  hasConflict
                    ? 'border-amber-300 ring-1 ring-amber-300/60 bg-amber-50/10'
                    : 'border-slate-200/80 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                      style={{ backgroundColor: shift.color || '#EA701B' }}
                    />
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">{shift.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(shift)}
                      className="p-1.5 text-slate-400 hover:text-[#EA701B] hover:bg-orange-50 rounded-lg transition"
                      title="Chỉnh sửa ca"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ isOpen: true, shift })}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa ca"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-4 h-4 text-[#EA701B]" />
                    <span>
                      {shift.startTime} — {shift.endTime}
                    </span>
                  </div>
                  <span className="font-bold text-[#EA701B] bg-orange-100 px-2 py-0.5 rounded-md">
                    {shift.durationHours} tiếng
                  </span>
                </div>

                {/* Cảnh báo nếu ca này trùng giờ với ca khác trong quán */}
                {hasConflict && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 animate-fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Trùng giờ với: </span>
                      <span className="font-semibold text-amber-950">
                        {conflicts.map((c) => `${c.name} (${c.startTime} - ${c.endTime})`).join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT SHIFT MODAL */}
      {shiftModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-backdrop-fade">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-modal-pop">
            <div className="p-5 bg-[#FFF0E5] border-b border-orange-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#EA701B]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {shiftModal.isEdit ? 'Chỉnh sửa ca làm việc' : 'Tạo ca làm việc mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShiftModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-orange-100/60 btn-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên ca làm việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ca Sáng, Ca Gãy, Slot 1..."
                  value={shiftModal.name}
                  onChange={(e) => setShiftModal((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={shiftModal.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={shiftModal.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng ca (tự động tính)
                  </label>
                  <div className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#EA701B]" />
                      <span>{computedDuration > 0 ? `${computedDuration} tiếng` : '0 tiếng'}</span>
                    </div>
                    <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      Tự động
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Màu phân biệt</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={shiftModal.color}
                      onChange={(e) => setShiftModal((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-500 font-semibold">{shiftModal.color}</span>
                  </div>
                </div>
              </div>

              {/* Conflict warning in modal */}
              {modalConflict && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800">Cảnh báo: Trùng khung giờ ca làm!</p>
                    <p className="mt-0.5 text-slate-600">
                      Khung giờ ({shiftModal.startTime} — {shiftModal.endTime}) bị trùng/giao thoa với ca{' '}
                      <b>
                        "{modalConflict.name}" ({modalConflict.startTime} — {modalConflict.endTime})
                      </b>
                      . Các ca làm việc trong cửa hàng không được phép trùng khung giờ với nhau!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShiftModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!!modalConflict || computedDuration <= 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {shiftModal.isEdit ? 'Lưu cập nhật' : 'Tạo ca làm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-backdrop-fade">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden my-auto animate-modal-pop">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa ca làm?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc muốn xóa ca <b>{deleteModal.shift?.name}</b> ({deleteModal.shift?.startTime} — {deleteModal.shift?.endTime})?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, shift: null })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl btn-press"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs btn-press hover-lift"
              >
                Xóa ca làm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagementPage;
