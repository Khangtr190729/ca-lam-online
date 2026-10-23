import mongoose from 'mongoose';
import Store from '../models/Store.js';
import StoreMember from '../models/StoreMember.js';
import Shift from '../models/Shift.js';

/**
 * Hàm kiểm tra quyền hạn của người gọi trong cửa hàng
 */
const verifyStoreAccess = async (storeId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return { error: 'Mã cửa hàng (storeId) không hợp lệ.' };
  }

  const store = await Store.findById(storeId);
  if (!store) {
    return { error: 'Không tìm thấy cửa hàng.' };
  }

  const isOwner = store.ownerId.toString() === userId;

  const member = await StoreMember.findOne({
    storeId,
    userId,
    status: 'ACTIVE',
  });

  const isMember = isOwner || !!member;
  const isManager = isOwner || (member && member.roleInStore === 'MANAGER');

  return { store, isOwner, isManager, isMember };
};

/**
 * Hàm hỗ trợ tính số giờ làm từ giờ bắt đầu và kết thúc (vd: "07:00" đến "11:30" => 4.5)
 */
const calculateHours = (startTime, endTime) => {
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let diff = endH + endM / 60 - (startH + startM / 60);
    if (diff < 0) {
      diff += 24; // Trường hợp ca đêm qua 0h sáng hôm sau
    }
    return Math.round(diff * 10) / 10;
  } catch {
    return 0;
  }
};

/**
 * @desc    Lấy danh sách các Slot/ca làm của cửa hàng
 * @route   GET /api/stores/:storeId/shifts
 * @access  Private (Mọi thành viên trong quán)
 */
export const getStoreShifts = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isMember) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chưa là thành viên của cửa hàng này.',
      });
    }

    // Lấy danh sách ca làm việc của quán, sắp xếp theo giờ bắt đầu
    const shifts = await Shift.find({ storeId }).sort({ startTime: 1 });

    return res.status(200).json({
      success: true,
      storeName: access.store.name,
      total: shifts.length,
      shifts,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách ca làm:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi lấy danh sách ca: ${error.message}`,
    });
  }
};

/**
 * @desc    Tạo mới Slot ca làm việc
 * @route   POST /api/stores/:storeId/shifts
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const createShift = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, startTime, endTime, durationHours, color } = req.body;
    const userId = req.user.id;

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền tạo mẫu ca làm việc.',
      });
    }

    if (!name || !name.trim() || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ: Tên ca (name), Giờ bắt đầu (startTime - vd: 07:00), Giờ kết thúc (endTime - vd: 11:30).',
      });
    }

    // Tự động tính số giờ nếu caller không gửi hoặc gửi không hợp lệ
    let hours = Number(durationHours);
    if (isNaN(hours) || hours <= 0) {
      hours = calculateHours(startTime, endTime);
    }

    const newShift = await Shift.create({
      storeId,
      name: name.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      durationHours: hours,
      color: color || '#3B82F6',
    });

    return res.status(201).json({
      success: true,
      message: `Tạo ca "${newShift.name}" (${newShift.startTime} - ${newShift.endTime}, ${newShift.durationHours}h) thành công!`,
      shift: newShift,
    });
  } catch (error) {
    console.error('Lỗi tạo ca làm:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi tạo ca làm: ${error.message}`,
    });
  }
};

/**
 * @desc    Cập nhật thông tin Slot ca làm việc
 * @route   PUT /api/stores/:storeId/shifts/:shiftId
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const updateShift = async (req, res) => {
  try {
    const { storeId, shiftId } = req.params;
    const { name, startTime, endTime, durationHours, color } = req.body;
    const userId = req.user.id;

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền chỉnh sửa ca làm việc.',
      });
    }

    const shift = await Shift.findOne({ _id: shiftId, storeId });
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ca làm việc này.',
      });
    }

    if (name) shift.name = name.trim();
    if (startTime) shift.startTime = startTime.trim();
    if (endTime) shift.endTime = endTime.trim();
    if (color) shift.color = color;

    if (durationHours !== undefined && !isNaN(Number(durationHours)) && Number(durationHours) > 0) {
      shift.durationHours = Number(durationHours);
    } else if (startTime || endTime) {
      shift.durationHours = calculateHours(shift.startTime, shift.endTime);
    }

    await shift.save();

    return res.status(200).json({
      success: true,
      message: `Cập nhật ca "${shift.name}" thành công!`,
      shift,
    });
  } catch (error) {
    console.error('Lỗi cập nhật ca làm:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi cập nhật ca: ${error.message}`,
    });
  }
};

/**
 * @desc    Xóa Slot ca làm việc
 * @route   DELETE /api/stores/:storeId/shifts/:shiftId
 * @access  Private (Chủ quán hoặc Quản lý)
 */
export const deleteShift = async (req, res) => {
  try {
    const { storeId, shiftId } = req.params;
    const userId = req.user.id;

    const access = await verifyStoreAccess(storeId, userId);
    if (access.error) {
      return res.status(404).json({ success: false, message: access.error });
    }

    if (!access.isManager) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng hoặc Quản lý mới có quyền xóa ca làm việc.',
      });
    }

    const shift = await Shift.findOneAndDelete({ _id: shiftId, storeId });
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ca làm việc để xóa.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa ca "${shift.name}" khỏi cửa hàng thành công.`,
    });
  } catch (error) {
    console.error('Lỗi xóa ca làm:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi xóa ca: ${error.message}`,
    });
  }
};
