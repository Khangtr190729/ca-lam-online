import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true, // Ví dụ: "2026-10-19"
    },
    dayOfWeek: {
      type: String,
      required: true, // Ví dụ: "Thứ 2", "Thứ 3", ... "Chủ nhật"
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Nhân viên hoặc Quản lý tự xếp cho mình
    },
    hourlyWage: {
      type: Number,
      required: true,
      default: 0, // Mức lương áp dụng tại thời điểm xếp ca
    },
    hours: {
      type: Number,
      required: true,
      default: 0, // Số giờ ca làm
    },
    totalPay: {
      type: Number,
      required: true,
      default: 0, // Tiền lương ca = hours * hourlyWage (nếu MISSED thì = 0)
    },
    attendanceStatus: {
      type: String,
      enum: ['COMPLETED', 'MISSED'],
      default: 'COMPLETED',
    },
    missedReason: {
      type: String,
      default: '',
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

const scheduleSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    week: {
      type: Number,
      required: true, // Ví dụ: 43
    },
    year: {
      type: Number,
      required: true, // Ví dụ: 2026
    },
    startDate: {
      type: Date,
      required: true, // Ngày Thứ 2 đầu tuần
    },
    endDate: {
      type: Date,
      required: true, // Ngày Chủ nhật cuối tuần
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Chủ hoặc Quản lý tạo lịch
    },
    assignments: [assignmentSchema],
    publishedAt: {
      type: Date,
      default: null, // Lưu thời điểm bấm "Xác nhận & Gửi Email"
    },
  },
  {
    timestamps: true,
  }
);

// Một cửa hàng chỉ có 1 bảng lịch cho mỗi tuần trong năm
scheduleSchema.index({ storeId: 1, week: 1, year: 1 }, { unique: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
export { Schedule };
