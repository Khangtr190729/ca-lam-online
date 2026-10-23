import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Shield,
  Briefcase,
  DollarSign,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  X,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { memberApi } from '../services/api';
import { formatVND, getRoleLabel, getEmploymentTypeLabel } from '../utils/formatters';

export const EmployeeManagementPage = () => {
  const { store, roleInStore, user } = useAuth();
  const isAdmin = roleInStore === 'ADMIN' || user?.role === 'ADMIN';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Wage Edit Modal
  const [wageModal, setWageModal] = useState({
    isOpen: false,
    member: null,
    newWage: ''
  });

  // Role Edit Modal (Admin only)
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    member: null,
    newRole: 'EMPLOYEE'
  });

  // Employment Type Edit Modal
  const [typeModal, setTypeModal] = useState({
    isOpen: false,
    member: null,
    newType: 'PART_TIME'
  });

  // Remove Member Confirm Modal (Admin only)
  const [removeModal, setRemoveModal] = useState({
    isOpen: false,
    member: null
  });

  const loadMembers = useCallback(async () => {
    if (!store?._id) return;
    try {
      setLoading(true);
      const res = await memberApi.getMembers(store._id);
      if (res.success) {
        const rawList = res.members || res.data || [];
        const normalized = rawList.map((m) => ({
          ...m,
          _id: m.memberId || m._id,
          role: m.roleInStore || m.role,
          user: {
            _id: m.userId || m.user?._id,
            name: m.fullName || m.user?.fullName || m.user?.name,
            email: m.email || m.user?.email,
            gender: m.gender || m.user?.gender,
            age: m.age || m.user?.age,
            avatar: m.avatar || m.user?.avatar
          }
        }));
        setMembers(normalized);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải danh sách nhân viên' });
    } finally {
      setLoading(false);
    }
  }, [store?._id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Filtered members by name or email
  const filteredMembers = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    const name = m.user?.name?.toLowerCase() || '';
    const email = m.user?.email?.toLowerCase() || '';
    return name.includes(q) || email.includes(q);
  });

  // Handle Update Wage
  const handleSaveWage = async () => {
    if (!wageModal.member || !wageModal.newWage) return;
    try {
      const res = await memberApi.updateWage(
        store._id,
        wageModal.member._id,
        Number(wageModal.newWage)
      );
      if (res.success) {
        setFeedback({ type: 'success', message: 'Cập nhật mức lương thành công!' });
        setWageModal({ isOpen: false, member: null, newWage: '' });
        loadMembers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi cập nhật lương' });
    }
  };

  // Handle Update Role
  const handleSaveRole = async () => {
    if (!roleModal.member) return;
    try {
      const res = await memberApi.updateRole(
        store._id,
        roleModal.member._id,
        roleModal.newRole
      );
      if (res.success) {
        setFeedback({ type: 'success', message: 'Cập nhật quyền hạn thành công!' });
        setRoleModal({ isOpen: false, member: null, newRole: 'EMPLOYEE' });
        loadMembers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi cập nhật vai trò' });
    }
  };

  // Handle Update Employment Type
  const handleSaveType = async () => {
    if (!typeModal.member) return;
    try {
      const res = await memberApi.updateEmploymentType(
        store._id,
        typeModal.member._id,
        typeModal.newType
      );
      if (res.success) {
        setFeedback({ type: 'success', message: 'Cập nhật hình thức làm việc thành công!' });
        setTypeModal({ isOpen: false, member: null, newType: 'PART_TIME' });
        loadMembers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi cập nhật loại hợp đồng' });
    }
  };

  // Handle Remove Member
  const handleConfirmRemove = async () => {
    if (!removeModal.member) return;
    try {
      const res = await memberApi.removeMember(store._id, removeModal.member._id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Đã xóa nhân viên khỏi cửa hàng.' });
        setRemoveModal({ isOpen: false, member: null });
        loadMembers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi xóa nhân viên' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EA701B]" />
            <span>Danh sách nhân viên cửa hàng</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA701B] font-bold">
              {members.length} nhân sự
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý mức lương theo giờ, loại hợp đồng và quyền hạn quản lý ca làm.
          </p>
        </div>

        {/* Search bar & Invite shortcut */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EA701B] w-56 md:w-64"
            />
          </div>

          {isAdmin && (
            <a
              href="/store-management"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EA701B] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#D55E0D] transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Mời nhân viên</span>
            </a>
          )}
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
              <CheckCircle className="w-5 h-5 text-emerald-600" />
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

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Đang tải danh sách nhân sự...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy nhân viên phù hợp</p>
            <p className="text-xs text-slate-500 mt-1">
              Hãy thử tìm kiếm với từ khóa khác hoặc chia sẻ mã mời 6 chữ số cho nhân viên mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FFF0E5] border-b border-orange-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Hình thức làm việc</th>
                  <th className="p-4">Vai trò / Quyền</th>
                  <th className="p-4">Lương theo giờ (VNĐ/h)</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMembers.map((member) => {
                  const roleBadge = getRoleLabel(member.role);
                  const typeBadge = getEmploymentTypeLabel(member.employmentType);
                  const isCurrentSelf = member.user?._id === user?._id;
                  const isStoreOwner = member.role === 'ADMIN';

                  return (
                    <tr key={member._id} className="hover:bg-orange-50/20 transition">
                      {/* Name & Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#EA701B] font-bold text-sm flex items-center justify-center shrink-0 border border-orange-200">
                            {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{member.user?.name}</span>
                              {isCurrentSelf && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-semibold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {member.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employment Type */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setTypeModal({
                              isOpen: true,
                              member,
                              newType: member.employmentType || 'PART_TIME'
                            })
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border hover:opacity-80 transition cursor-pointer"
                        >
                          <span className={`px-2 py-0.5 rounded-md ${typeBadge.badge}`}>
                            {typeBadge.text}
                          </span>
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>

                      {/* Role Badge & Promotion Action */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${roleBadge.color}`}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {roleBadge.text}
                          </span>

                          {/* Admin can promote/demote if not owner */}
                          {isAdmin && !isStoreOwner && (
                            <button
                              type="button"
                              onClick={() =>
                                setRoleModal({
                                  isOpen: true,
                                  member,
                                  newRole: member.role === 'MANAGER' ? 'EMPLOYEE' : 'MANAGER'
                                })
                              }
                              title="Thay đổi quyền hạn"
                              className="text-xs text-slate-400 hover:text-[#EA701B] p-1 rounded-md hover:bg-orange-50 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Hourly Wage */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {formatVND(member.hourlyWage || 0)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setWageModal({
                                isOpen: true,
                                member,
                                newWage: String(member.hourlyWage || 20000)
                              })
                            }
                            className="p-1 text-slate-400 hover:text-[#EA701B] hover:bg-orange-50 rounded-md transition"
                            title="Sửa mức lương"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {isAdmin && !isStoreOwner && (
                          <button
                            type="button"
                            onClick={() => setRemoveModal({ isOpen: true, member })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Xóa nhân viên khỏi quán"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Edit Hourly Wage */}
      {wageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-[#FFF0E5] border-b border-orange-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#EA701B]" />
                <h3 className="font-bold text-slate-900 text-sm">Cập nhật lương theo giờ</h3>
              </div>
              <button
                type="button"
                onClick={() => setWageModal({ isOpen: false, member: null, newWage: '' })}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Nhân viên: <b className="text-slate-800">{wageModal.member?.user?.name}</b>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức lương theo giờ (VNĐ/giờ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={wageModal.newWage}
                    onChange={(e) =>
                      setWageModal((prev) => ({ ...prev, newWage: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 font-mono pr-14 focus:outline-none focus:ring-2 focus:ring-[#EA701B]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWageModal({ isOpen: false, member: null, newWage: '' })}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveWage}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#EA701B] hover:bg-[#D55E0D] rounded-xl shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Role (Promote / Demote) */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Thay đổi vai trò quản lý</h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModal({ isOpen: false, member: null, newRole: 'EMPLOYEE' })}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Nhân viên: <b className="text-slate-800">{roleModal.member?.user?.name}</b>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn quyền hạn
                </label>
                <select
                  value={roleModal.newRole}
                  onChange={(e) =>
                    setRoleModal((prev) => ({ ...prev, newRole: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value="EMPLOYEE">Nhân viên (Chỉ xem lịch & ca của mình)</option>
                  <option value="MANAGER">Quản lý (Được xếp ca, lưu nháp & xuất bản lịch)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModal({ isOpen: false, member: null, newRole: 'EMPLOYEE' })}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Cập nhật quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Employment Type */}
      {typeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Hình thức làm việc</h3>
              </div>
              <button
                type="button"
                onClick={() => setTypeModal({ isOpen: false, member: null, newType: 'PART_TIME' })}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Nhân viên: <b className="text-slate-800">{typeModal.member?.user?.name}</b>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn loại hình
                </label>
                <select
                  value={typeModal.newType}
                  onChange={(e) =>
                    setTypeModal((prev) => ({ ...prev, newType: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
                >
                  <option value="PART_TIME">Bán thời gian (Part-time)</option>
                  <option value="FULL_TIME">Toàn thời gian (Full-time)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTypeModal({ isOpen: false, member: null, newType: 'PART_TIME' })}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveType}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Remove Member Confirmation */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Xóa nhân viên khỏi quán?</h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc muốn xóa <b>{removeModal.member?.user?.name}</b> khỏi danh sách nhân sự của quán? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveModal({ isOpen: false, member: null })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
