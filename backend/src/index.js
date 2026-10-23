import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import { personalScheduleRouter } from './routes/scheduleRoutes.js';

// Nạp cấu hình từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Middlewares toàn cục
app.use(cors());
app.use(express.json());

// Routes chính
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/schedules', personalScheduleRouter);

// Route kiểm tra trạng thái server
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Ca Làm Online Backend API đang hoạt động!',
    time: new Date(),
  });
});

// Khởi chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server đang chạy trên cổng ${PORT} (http://localhost:${PORT})`);
});
