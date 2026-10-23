import mongoose from 'mongoose';

const storeMemberSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleInStore: {
      type: String,
      enum: ['MANAGER', 'EMPLOYEE'],
      default: 'EMPLOYEE',
      required: true,
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME'],
      default: 'PART_TIME',
      required: true,
    },
    hourlyWage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Một nhân viên chỉ có 1 bản ghi thành viên trong cùng một cửa hàng
storeMemberSchema.index({ storeId: 1, userId: 1 }, { unique: true });

const StoreMember = mongoose.model('StoreMember', storeMemberSchema);
export default StoreMember;
export { StoreMember };
