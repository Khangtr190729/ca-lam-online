import jwt from 'jsonwebtoken';

/**
 * Middleware bảo vệ các route yêu cầu đăng nhập
 */
export const protect = async (req, res, next) => {
  let token;

  // Kiểm tra header Authorization có dạng: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Gán thông tin người dùng vào request để các controller tiếp theo sử dụng
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Lỗi xác thực Token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy Token xác thực. Vui lòng đăng nhập.',
    });
  }
};
