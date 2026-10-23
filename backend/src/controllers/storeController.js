import mongoose from 'mongoose';
import Store from '../models/Store.js';
import StoreMember from '../models/StoreMember.js';
import User from '../models/User.js';
import { sendStoreInviteEmail } from '../services/emailService.js';

/**
 * @desc    Tạo cửa hàng mới (Chỉ dành cho Chủ quán - ADMIN)
 * @route   POST /api/stores
 * @access  Private (ADMIN)
 */
export const createStore = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.user.id;

    // 1. Kiểm tra quyền hạn
    if (req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ tài khoản Chủ cửa hàng (ADMIN) mới có quyền tạo cửa hàng.',
      });
    }

    // 2. Kiểm tra thông tin bắt buộc
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên cửa hàng.',
      });
    }

    // 3. Kiểm tra xem chủ quán đã có cửa hàng chưa (mỗi chủ 1 cửa hàng chính)
    const existingStore = await Store.findOne({ ownerId: userId });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã tạo cửa hàng "${existingStore.name}". Mỗi tài khoản chủ hiện tại quản lý 1 cửa hàng chính.`,
        store: existingStore,
      });
    }

    // 4. Tạo cửa hàng
    const newStore = await Store.create({
      name: name.trim(),
      address: address ? address.trim() : '',
      ownerId: userId,
    });

    // 5. Tự động thêm chủ quán vào bảng thành viên với vai trò Quản lý / Điều hành
    await StoreMember.create({
      storeId: newStore._id,
      userId: userId,
      roleInStore: 'MANAGER',
      employmentType: 'FULL_TIME',
      hourlyWage: 0,
      status: 'ACTIVE',
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo cửa hàng thành công!',
      store: newStore,
    });
  } catch (error) {
    console.error('Lỗi tạo cửa hàng:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi tạo cửa hàng: ${error.message}`,
    });
  }
};

/**
 * @desc    Lấy thông tin cửa hàng hiện tại của tôi (Chủ quán hoặc Nhân viên)
 * @route   GET /api/stores/my-store
 * @access  Private
 */
export const getMyStore = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Nếu là ADMIN: Tìm cửa hàng do mình sở hữu
    if (req.user.systemRole === 'ADMIN') {
      const store = await Store.findOne({ ownerId: userId }).populate('ownerId', 'fullName email');
      if (!store) {
        return res.status(200).json({
          success: true,
          hasStore: false,
          message: 'Bạn chưa tạo cửa hàng nào. Vui lòng tạo cửa hàng mới.',
        });
      }

      // Đếm số lượng thành viên
      const totalMembers = await StoreMember.countDocuments({ storeId: store._id, status: 'ACTIVE' });

      return res.status(200).json({
        success: true,
        hasStore: true,
        roleInStore: 'ADMIN',
        store,
        totalMembers,
      });
    }

    // 2. Nếu là EMPLOYEE: Tìm cửa hàng mà mình đang là thành viên
    const membership = await StoreMember.findOne({ userId, status: 'ACTIVE' }).populate({
      path: 'storeId',
      populate: { path: 'ownerId', select: 'fullName email' },
    });

    if (!membership || !membership.storeId) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'Bạn chưa gia nhập cửa hàng nào. Hãy nhập mã mời 6 số để vào cửa hàng của bạn.',
      });
    }

    return res.status(200).json({
      success: true,
      hasStore: true,
      roleInStore: membership.roleInStore,
      employmentType: membership.employmentType,
      hourlyWage: membership.hourlyWage,
      store: membership.storeId,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin cửa hàng:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ: ${error.message}`,
    });
  }
};

/**
 * @desc    Cập nhật thông tin cửa hàng (Tên, địa chỉ)
 * @route   PUT /api/stores/my-store
 * @access  Private (ADMIN)
 */
export const updateMyStore = async (req, res) => {
  try {
    const { name, address } = req.body;
    const userId = req.user.id;

    if (req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng mới có quyền cập nhật thông tin cửa hàng.',
      });
    }

    const store = await Store.findOne({ ownerId: userId });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có cửa hàng nào.',
      });
    }

    if (name) store.name = name.trim();
    if (address !== undefined) store.address = address.trim();

    await store.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cửa hàng thành công!',
      store,
    });
  } catch (error) {
    console.error('Lỗi cập nhật cửa hàng:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ: ${error.message}`,
    });
  }
};

/**
 * @desc    Sinh mã mời 6 số ngẫu nhiên vào cửa hàng (Hiệu lực 1 giờ, vô hiệu mã cũ)
 * @route   POST /api/stores/generate-invite-code
 * @access  Private (ADMIN)
 */
export const generateInviteCode = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng mới có quyền sinh mã mời nhân viên.',
      });
    }

    const store = await Store.findOne({ ownerId: userId });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có cửa hàng để tạo mã mời. Vui lòng tạo cửa hàng trước.',
      });
    }

    // 1. Sinh 6 số ngẫu nhiên (từ 100000 đến 999999)
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Đặt thời gian hết hạn đúng 1 giờ (60 phút) kể từ lúc bấm
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 3. Ghi đè vào cửa hàng (Tự động vô hiệu hóa mã cũ)
    store.inviteCode = {
      code: randomCode,
      expiresAt: expiresAt,
    };

    await store.save();

    return res.status(200).json({
      success: true,
      message: 'Sinh mã mời 6 số thành công! Mã này có hiệu lực trong 1 giờ.',
      inviteCode: randomCode,
      expiresAt: expiresAt,
      expiresInMinutes: 60,
    });
  } catch (error) {
    console.error('Lỗi sinh mã mời:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi sinh mã mời: ${error.message}`,
    });
  }
};

/**
 * @desc    Nhân viên nhập mã mời 6 số để gia nhập cửa hàng
 * @route   POST /api/stores/join-by-code
 * @access  Private (EMPLOYEE)
 */
export const joinByCode = async (req, res) => {
  try {
    const { inviteCode, employmentType } = req.body;
    const userId = req.user.id;

    if (!inviteCode || !inviteCode.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã mời 6 chữ số.',
      });
    }

    const cleanCode = inviteCode.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: 'Mã mời không đúng định dạng (Mã mời phải gồm đúng 6 chữ số, ví dụ: 482915).',
      });
    }

    // 1. Tìm cửa hàng khớp mã mời
    const store = await Store.findOne({ 'inviteCode.code': cleanCode });

    if (!store) {
      return res.status(400).json({
        success: false,
        message: 'Mã mời không chính xác hoặc không tồn tại.',
      });
    }

    // 2. Kiểm tra mã mời có còn hạn 1 giờ hay không
    const now = new Date();
    if (!store.inviteCode.expiresAt || now > new Date(store.inviteCode.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Mã mời này đã hết hạn (Mỗi mã chỉ có hiệu lực trong 1 giờ). Vui lòng yêu cầu chủ quán sinh mã mới!',
      });
    }

    // 3. Kiểm tra xem người dùng đã là thành viên của quán này chưa
    const existingMembership = await StoreMember.findOne({
      storeId: store._id,
      userId: userId,
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Bạn đã là thành viên của cửa hàng "${store.name}" rồi.`,
        });
      } else {
        // Tái kích hoạt nếu trước đó bị inactive
        existingMembership.status = 'ACTIVE';
        if (employmentType) existingMembership.employmentType = employmentType;
        await existingMembership.save();

        return res.status(200).json({
          success: true,
          message: `Chào mừng bạn quay trở lại cửa hàng "${store.name}"!`,
          store: {
            _id: store._id,
            name: store.name,
            address: store.address,
          },
        });
      }
    }

    // 4. Tạo bản ghi thành viên mới
    const allowedTypes = ['FULL_TIME', 'PART_TIME'];
    const chosenType = allowedTypes.includes(employmentType) ? employmentType : 'PART_TIME';

    await StoreMember.create({
      storeId: store._id,
      userId: userId,
      roleInStore: 'EMPLOYEE',
      employmentType: chosenType,
      hourlyWage: 0, // Mức lương sẽ do chủ quán/quản lý gán sau
      status: 'ACTIVE',
    });

    return res.status(200).json({
      success: true,
      message: `Gia nhập cửa hàng "${store.name}" thành công!`,
      store: {
        _id: store._id,
        name: store.name,
        address: store.address,
      },
      employmentType: chosenType,
    });
  } catch (error) {
    console.error('Lỗi gia nhập cửa hàng qua mã:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi gia nhập cửa hàng: ${error.message}`,
    });
  }
};

/**
 * @desc    Chủ quán thêm trực tiếp nhân viên qua ID tài khoản hoặc Email
 * @route   POST /api/stores/invite-by-id
 * @access  Private (ADMIN)
 */
export const inviteById = async (req, res) => {
  try {
    const { email, identifier, targetUserId, employmentType, hourlyWage } = req.body;
    const cleanEmail = (email || identifier || targetUserId || '').trim();
    const userId = req.user.id;

    if (req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Chủ cửa hàng mới có quyền thêm nhân viên trực tiếp.',
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Email của nhân viên.',
      });
    }

    const store = await Store.findOne({ ownerId: userId });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Bạn chưa có cửa hàng nào. Vui lòng tạo cửa hàng trước.',
      });
    }

    // 1. Tìm tài khoản nhân viên theo Email (ưu tiên) hoặc ID
    let targetUser = await User.findOne({ email: cleanEmail.toLowerCase() });

    if (!targetUser && mongoose.Types.ObjectId.isValid(cleanEmail)) {
      targetUser = await User.findById(cleanEmail);
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tài khoản nhân viên nào với Email "${cleanEmail}". Vui lòng kiểm tra lại hoặc yêu cầu nhân viên đăng ký tài khoản trước.`,
      });
    }

    // Không cho phép tự thêm chính mình làm nhân viên
    if (targetUser._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang là Chủ của cửa hàng này, không cần thêm chính mình làm nhân viên.',
      });
    }

    // 2. Kiểm tra xem người này đã ở trong quán chưa
    const existingMember = await StoreMember.findOne({
      storeId: store._id,
      userId: targetUser._id,
    });

    if (existingMember && existingMember.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Nhân viên "${targetUser.fullName}" đã là thành viên của cửa hàng rồi.`,
      });
    }

    // 3. Thêm hoặc cập nhật thành viên
    const chosenType = ['FULL_TIME', 'PART_TIME'].includes(employmentType) ? employmentType : 'PART_TIME';
    const parsedWage = hourlyWage !== undefined && !isNaN(Number(hourlyWage)) ? Number(hourlyWage) : 0;

    if (existingMember) {
      existingMember.status = 'ACTIVE';
      existingMember.employmentType = chosenType;
      existingMember.hourlyWage = parsedWage;
      await existingMember.save();
    } else {
      await StoreMember.create({
        storeId: store._id,
        userId: targetUser._id,
        roleInStore: 'EMPLOYEE',
        employmentType: chosenType,
        hourlyWage: parsedWage,
        status: 'ACTIVE',
      });
    }

    // Gửi email thư mời thông báo cho nhân viên
    if (targetUser.email) {
      const codeToSend = store.inviteCode && store.inviteCode.code ? store.inviteCode.code : 'ĐÃ ĐƯỢC THÊM TRỰC TIẾP';
      sendStoreInviteEmail({
        toEmail: targetUser.email,
        storeName: store.name,
        inviteCode: codeToSend,
      }).catch((e) => console.error('Lỗi gửi mail mời:', e.message));
    }

    return res.status(200).json({
      success: true,
      message: `Đã thêm nhân viên "${targetUser.fullName}" vào cửa hàng "${store.name}" thành công!`,
      member: {
        userId: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        employmentType: chosenType,
        hourlyWage: parsedWage,
      },
    });
  } catch (error) {
    console.error('Lỗi thêm nhân viên qua ID/email:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi thêm nhân viên: ${error.message}`,
    });
  }
};
