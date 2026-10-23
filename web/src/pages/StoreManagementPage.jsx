import React, { useState, useEffect } from 'react';
import {
  Store,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Mail,
  UserPlus,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storeApi } from '../services/api';

export const StoreManagementPage = () => {
  const { store, refreshUser } = useAuth();

  // Store profile form
  const [storeForm, setStoreForm] = useState({
    name: store?.name || '',
    address: store?.address || ''
  });
  const [savingStore, setSavingStore] = useState(false);

  // Invite code state
  const [inviteCode, setInviteCode] = useState(store?.inviteCode || '');
  const [inviteExpires, setInviteExpires] = useState(store?.inviteExpires || null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');

  // Direct invite form (by ID or Email)
  const [directForm, setDirectForm] = useState({
    targetUserId: '',
    email: '',
    hourlyWage: 20000,
    employmentType: 'PART_TIME'
  });
  const [invitingDirect, setInvitingDirect] = useState(false);

  const [feedback, setFeedback] = useState(null);

  // Sync store data when available
  useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name || '',
        address: store.address || ''
      });
      if (store.inviteCode) setInviteCode(store.inviteCode);
      if (store.inviteExpires) setInviteExpires(store.inviteExpires);
    }
  }, [store]);

  // Countdown timer for 60-minute expiration
  useEffect(() => {
    if (!inviteExpires) {
      setRemainingTime('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(inviteExpires).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setRemainingTime('Đã hết hạn');
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingTime(`${minutes} phút ${seconds < 10 ? '0' : ''}${seconds} giây`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [inviteExpires]);

  // Update store info
  const handleSaveStore = async (e) => {
    e.preventDefault();
    try {
      setSavingStore(true);
      setFeedback(null);
      const res = await storeApi.updateMyStore(storeForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Cập nhật thông tin cửa hàng thành công!' });
        await refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi cập nhật cửa hàng' });
    } finally {
      setSavingStore(false);
    }
  };

  // Generate new 6-digit code
  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      setFeedback(null);
      const res = await storeApi.generateInviteCode();
      if (res.success && res.data) {
        setInviteCode(res.data.inviteCode);
        setInviteExpires(res.data.inviteExpires);
        setFeedback({
          type: 'success',
          message: 'Đã tạo mã mời 6 chữ số mới có hiệu lực trong 60 phút!'
        });
        await refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi tạo mã mời' });
    } finally {
      setGeneratingCode(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct invite by ID or Email
  const handleDirectInvite = async (e) => {
    e.preventDefault();
    if (!directForm.targetUserId && !directForm.email) {
      setFeedback({
        type: 'error',
        message: 'Vui lòng nhập Mã ID tài khoản hoặc Email nhân viên.'
      });
      return;
    }

    try {
      setInvitingDirect(true);
      setFeedback(null);
      const payload = {
        targetUserId: directForm.targetUserId || undefined,
        email: directForm.email || undefined,
        hourlyWage: Number(directForm.hourlyWage),
        employmentType: directForm.employmentType
      };
      const res = await storeApi.inviteByIdOrEmail(payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Đã thêm/mời nhân viên vào cửa hàng thành công!'
        });
        setDirectForm({
          targetUserId: '',
          email: '',
          hourlyWage: 20000,
          employmentType: 'PART_TIME'
        });
        await refreshUser();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi mời nhân viên' });
    } finally {
      setInvitingDirect(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-[#EA701B]" />
            <span>Cài đặt Cửa hàng & Mã mời</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin quán và cấp phát mã số mời nhân viên mới gia nhập.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-[#EA701B] rounded-full text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Dành riêng cho Chủ cửa hàng</span>
        </div>
      </div>

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

      {/* SECTION 1: 6-DIGIT INVITATION CODE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mã mời 6 chữ số cho Nhân viên</h3>
              <p className="text-xs text-slate-500">
                Nhân viên tải app / mở web chỉ cần nhập 6 số này để tự động gia nhập quán
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={generatingCode}
            onClick={handleGenerateCode}
            className="flex items-center gap-2 px-4 py-2 bg-[#EA701B] text-white text-xs font-bold rounded-xl hover:bg-[#D55E0D] transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generatingCode ? 'animate-spin' : ''}`} />
            <span>{generatingCode ? 'Đang tạo...' : 'Tạo mã mới'}</span>
          </button>
        </div>

        {/* Big 6-digit Code Display */}
        <div className="bg-gradient-to-br from-[#FFF0E5] via-[#FFF7F0] to-orange-50/50 p-6 rounded-2xl border border-orange-200/70 text-center space-y-3">
          {inviteCode ? (
            <>
              <div className="text-xs font-bold text-[#EA701B] uppercase tracking-wider">
                Mã mời hiện tại của quán
              </div>
              <div className="text-4xl md:text-5xl font-extrabold tracking-widest font-mono text-slate-900 select-all">
                {inviteCode.slice(0, 3)} {inviteCode.slice(3, 6)}
              </div>

              {/* Expiration countdown pill */}
              <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                <Clock className="w-4 h-4 text-[#EA701B]" />
                <span className="text-slate-600">Thời gian còn lại:</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-200 text-[#EA701B] font-mono font-bold">
                  {remainingTime || '60 phút'}
                </span>
              </div>

              {/* Copy button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-xl text-xs font-bold text-slate-700 hover:text-[#EA701B] shadow-xs hover:border-orange-300 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép mã!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Sao chép mã 6 số</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="py-4">
              <p className="text-xs text-slate-500 mb-3">
                Chưa có mã mời hoạt động. Nhấn nút bên dưới để tạo mã 6 chữ số có hiệu lực 60 phút.
              </p>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-5 py-2.5 bg-[#EA701B] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Tạo mã mời đầu tiên
              </button>
            </div>
          )}

          {/* Warning notice */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 max-w-lg mx-auto">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Lưu ý:</b> Khi tạo mã mới, mã mời trước đó sẽ lập tức bị vô hiệu hóa.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DIRECT INVITATION (BY ID OR EMAIL) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mời nhân viên trực tiếp (Mã ID hoặc Email)</h3>
            <p className="text-xs text-slate-500">
              Chủ động thêm nhân viên đã có tài khoản vào danh sách nhân sự của quán
            </p>
          </div>
        </div>

        <form onSubmit={handleDirectInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã ID tài khoản (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 6512abcd..."
              value={directForm.targetUserId}
              onChange={(e) => setDirectForm((prev) => ({ ...prev, targetUserId: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hoặc Email nhân viên
            </label>
            <input
              type="email"
              placeholder="nhanvien@gmail.com"
              value={directForm.email}
              onChange={(e) => setDirectForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lương theo giờ khởi điểm (VNĐ/giờ)
            </label>
            <input
              type="number"
              step="1000"
              value={directForm.hourlyWage}
              onChange={(e) => setDirectForm((prev) => ({ ...prev, hourlyWage: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hình thức làm việc
            </label>
            <select
              value={directForm.employmentType}
              onChange={(e) =>
                setDirectForm((prev) => ({ ...prev, employmentType: e.target.value }))
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="PART_TIME">Bán thời gian (Part-time)</option>
              <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={invitingDirect}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#EA701B]" />
              <span>{invitingDirect ? 'Đang thêm...' : 'Thêm nhân viên ngay'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: STORE GENERAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA701B] flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Thông tin cơ sở quán</h3>
            <p className="text-xs text-slate-500">
              Tên cửa hàng và địa chỉ hiển thị trên ứng dụng của nhân viên và email xếp lịch
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveStore} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên cửa hàng</label>
            <input
              type="text"
              value={storeForm.name}
              onChange={(e) => setStoreForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ quán</label>
            <input
              type="text"
              value={storeForm.address}
              onChange={(e) => setStoreForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingStore}
              className="px-5 py-2.5 bg-[#EA701B] hover:bg-[#D55E0D] text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingStore ? 'Đang lưu...' : 'Lưu thông tin quán'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreManagementPage;
