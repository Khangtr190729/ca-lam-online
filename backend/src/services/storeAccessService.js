import mongoose from 'mongoose';
import Store from '../models/Store.js';
import StoreMember from '../models/StoreMember.js';

/**
 * Service kiểm tra quyền hạn của người dùng đối với một cửa hàng cụ thể
 */
export const verifyStoreAccess = async (storeId, userId) => {
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
  const isManager = isOwner || (member && ['MANAGER', 'ADMIN'].includes(member.roleInStore));

  return { store, isOwner, isManager, isMember };
};
