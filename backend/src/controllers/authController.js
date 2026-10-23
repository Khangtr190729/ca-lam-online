import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Tạo token JWT cho người dùng
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      systemRole: user.systemRole,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * @desc    Đăng ký tài khoản mới (Chủ hoặc Người đi làm)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, gender, age, systemRole } = req.body;

    // 1. Kiểm tra các trường bắt buộc và kiểu dữ liệu string chống NoSQL injection
    if (!email || !password || !fullName || !gender || age === undefined || !systemRole) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ tất cả các trường: email, password, fullName, gender, age, systemRole.',
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || typeof fullName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ (phải là chuỗi ký tự hợp lệ).',
      });
    }

    // 2. Kiểm tra định dạng Email hợp lệ bằng Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: user@gmail.com).',
      });
    }

    // 3. Kiểm tra vai trò đăng ký (Chỉ được chọn ADMIN hoặc EMPLOYEE, không được chọn MANAGER)
    const allowedRoles = ['ADMIN', 'EMPLOYEE'];
    if (!allowedRoles.includes(systemRole)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ. Bạn chỉ có thể đăng ký là "Chủ cửa hàng" (ADMIN) hoặc "Người đi làm" (EMPLOYEE).',
      });
    }

    // 4. Kiểm tra độ tuổi hợp lệ (Từ 15 đến 100 tuổi)
    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 15 || parsedAge > 100) {
      return res.status(400).json({
        success: false,
        message: 'Tuổi không hợp lệ (Độ tuổi làm việc hợp lệ từ 15 đến 100 tuổi).',
      });
    }

    // 5. Kiểm tra giới tính (hỗ trợ cả có dấu và không dấu)
    const validGenders = { Nam: 'Nam', Nữ: 'Nữ', Nu: 'Nữ', Khác: 'Khác', Khac: 'Khác' };
    if (!validGenders[gender]) {
      return res.status(400).json({
        success: false,
        message: 'Giới tính phải là một trong: Nam, Nữ, Khác.',
      });
    }
    const normalizedGender = validGenders[gender];

    // 6. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo an toàn.',
      });
    }

    // 7. Kiểm tra email đã tồn tại hay chưa
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.',
      });
    }

    // 8. Băm mật khẩu an toàn với bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 9. Tạo user mới
    const newUser = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      fullName: fullName.trim(),
      gender: normalizedGender,
      age: parsedAge,
      systemRole,
    });

    // 10. Tạo token đăng nhập
    const token = generateToken(newUser);

    // 11. Trả về kết quả (loại bỏ mật khẩu)
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        gender: newUser.gender,
        age: newUser.age,
        systemRole: newUser.systemRole,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi đăng ký: ${error.message}`,
    });
  }
};

/**
 * @desc    Đăng nhập hệ thống
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào và kiểu dữ liệu string chống NoSQL injection
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Email và Mật khẩu hợp lệ.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Tìm người dùng theo email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.',
      });
    }

    // 3. So khớp mật khẩu đã băm
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.',
      });
    }

    // 4. Tạo token đăng nhập
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        age: user.age,
        systemRole: user.systemRole,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ khi đăng nhập: ${error.message}`,
    });
  }
};

/**
 * @desc    Lấy thông tin tài khoản đang đăng nhập
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin me:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi máy chủ: ${error.message}`,
    });
  }
};
