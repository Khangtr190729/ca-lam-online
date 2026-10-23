import React from 'react';
import { Send, Info } from 'lucide-react';
import { formatWeekRange } from '../../utils/formatters';

export const PublishScheduleModal = ({
  isOpen,
  onClose,
  saving,
  onConfirmPublish,
  currentMonday,
  week,
  year,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-backdrop-fade">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-modal-pop">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-[#EA701B] mx-auto flex items-center justify-center">
            <Send className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Xác nhận xuất bản lịch & gửi email?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống sẽ chuyển trạng thái lịch sang <b>Đã xuất bản</b>, đồng thời tự động gửi email thông báo chi tiết danh sách ca làm và bảng lương ước tính tới từng nhân viên có ca trong tuần này.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-left text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-[#EA701B] mb-1">
              <Info className="w-4 h-4" />
              <span>Tuần áp dụng:</span>
            </div>
            <span>
              {formatWeekRange(currentMonday)} (Tuần {week}/{year})
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onConfirmPublish}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {saving ? 'Đang gửi email...' : 'Đồng ý & Xuất bản ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishScheduleModal;
