import mongoose from 'mongoose';

/**
 * Kết nối tới cơ sở dữ liệu MongoDB Atlas
 * Tên database mặc định: store_schedules
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/store_schedules';

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'store_schedules', // Chỉ định chính xác tên database theo yêu cầu
    });

    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
