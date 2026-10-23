import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

/**
 * Khởi tạo transporter cho Nodemailer
 */
const createTransporter = () => {
  // Tải lại các biến từ file .env mới nhất (nếu người dùng vừa cập nhật lại mật khẩu ứng dụng)
  dotenv.config({ override: true });

  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    return null; // Chưa cấu hình email trong .env
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

/**
 * Gửi email thông báo Lịch làm việc & Tiền lương dự kiến cho nhân viên
 */
export const sendScheduleEmail = async ({
  toEmail,
  employeeName,
  storeName,
  week,
  year,
  assignments,
  totalHours,
  hourlyWage,
  totalSalary,
}) => {
  try {
    const transporter = createTransporter();

    // 1. Nếu chưa điền EMAIL_USER hoặc EMAIL_PASS trong .env
    if (!transporter) {
      console.log(
        `📧 [EMAIL SIMULATION] Gửi email lịch tuần ${week}/${year} đến ${toEmail} (${employeeName}) - Tổng lương: ${totalSalary.toLocaleString('vi-VN')} VNĐ. (Chưa điền EMAIL_USER/EMAIL_PASS trong .env, bỏ qua gửi thật).`
      );
      return { success: true, simulated: true, to: toEmail };
    }

    // 2. Tạo các dòng trong bảng ca làm
    const tableRows = assignments
      .map(
        (a) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; text-align: left;">${a.dayOfWeek} (${a.date})</td>
          <td style="padding: 10px; text-align: left; font-weight: bold; color: #2563eb;">${a.shiftName} (${a.timeRange})</td>
          <td style="padding: 10px; text-align: center;">${a.hours}h</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: #059669;">${a.totalPay.toLocaleString('vi-VN')} đ</td>
        </tr>
      `
      )
      .join('');

    // 3. Nội dung HTML của Email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">${storeName}</h2>
          <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">LỊCH LÀM VIỆC & BẢNG LƯƠNG DỰ KIẾN (TUẦN ${week} - NĂM ${year})</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #1f2937;">Xin chào <strong>${employeeName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.5;">
            Lịch làm việc tuần mới của bạn tại <strong>${storeName}</strong> đã được Quản lý chính thức công bố. Dưới đây là danh sách các ca trực và bảng tính lương dự kiến của bạn:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #374151;">
                <th style="padding: 10px; text-align: left;">Thứ / Ngày</th>
                <th style="padding: 10px; text-align: left;">Ca Trực</th>
                <th style="padding: 10px; text-align: center;">Số Giờ</th>
                <th style="padding: 10px; text-align: right;">Tiền Công</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div style="margin-top: 24px; padding: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px;">💰 TỔNG KẾT TUẦN ${week}:</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #047857;">
              <span>• Tổng thời gian làm việc:</span>
              <strong>${totalHours} giờ</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #047857;">
              <span>• Mức lương theo giờ:</span>
              <strong>${hourlyWage.toLocaleString('vi-VN')} VNĐ / giờ</strong>
            </div>
            <hr style="border: 0; border-top: 1px dashed #6ee7b7; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; color: #065f46; font-weight: bold;">
              <span>TỔNG LƯƠNG DỰ KIẾN NHẬN:</span>
              <span style="color: #059669; font-size: 18px;">${totalSalary.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #6b7280; text-align: center;">
            Nếu có bất kỳ thắc mắc nào về lịch trực hoặc giờ làm, vui lòng liên hệ trực tiếp Quản lý cửa hàng.<br>
            <em>Hệ thống Ca Làm Online tự động gửi thông báo.</em>
          </p>
        </div>
      </div>
    `;

    // 4. Gửi email
    const mailOptions = {
      from: `"${storeName} - Ca Làm Online" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[${storeName}] Thông báo Lịch làm việc & Tiền lương Tuần ${week}/${year}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT] Đã gửi email lịch tuần ${week} đến ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Lỗi gửi email đến ${toEmail}:`, error.message);
    return { success: false, error: error.message, to: toEmail };
  }
};

/**
 * Gửi email Thư mời gia nhập cửa hàng kèm Mã Mời 6 số ngẫu nhiên
 */
export const sendStoreInviteEmail = async ({ toEmail, storeName, inviteCode }) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        `📧 [EMAIL SIMULATION] Gửi thư mời tham gia ${storeName} đến ${toEmail} - Mã mời: ${inviteCode} (Bỏ qua gửi thật do chưa có EMAIL_USER/EMAIL_PASS).`
      );
      return { success: true, simulated: true, to: toEmail };
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">${storeName}</h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">LỜI MỜI GIA NHẬP ĐỘI NGŨ NHÂN VIÊN</p>
        </div>

        <div style="padding: 28px 24px; text-align: center;">
          <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
            Bạn đã được Quản lý cửa hàng <strong>${storeName}</strong> mời tham gia vào hệ thống phân ca làm việc trực tuyến.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Dưới đây là mã mời gia nhập cửa hàng của bạn:</p>

          <div style="display: inline-block; padding: 14px 28px; background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; margin: 12px 0 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1d4ed8; font-family: monospace;">
              ${inviteCode}
            </span>
          </div>

          <p style="color: #ef4444; font-size: 13px; margin: 0 0 20px 0;">
            ⏰ <em>Lưu ý: Mã mời này chỉ có hiệu lực trong vòng <strong>60 phút</strong>.</em>
          </p>

          <div style="padding: 14px; background-color: #f9fafb; border-radius: 6px; font-size: 13px; color: #4b5563; text-align: left; line-height: 1.5;">
            <strong>Hướng dẫn nhập mã:</strong><br>
            1. Mở ứng dụng hoặc trang web <strong>Ca Làm Online</strong>.<br>
            2. Đăng nhập tài khoản của bạn (hoặc đăng ký mới với vai trò <em>Người đi làm</em>).<br>
            3. Nhập mã 6 số trên vào màn hình <strong>Gia nhập cửa hàng</strong>.
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${storeName} - Ca Làm Online" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[${storeName}] Lời mời gia nhập ca làm việc (Mã: ${inviteCode})`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Đã gửi thư mời đến ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (error) {
    console.error(`[EMAIL ERROR] Lỗi gửi thư mời đến ${toEmail}:`, error.message);
    return { success: false, error: error.message, to: toEmail };
  }
};
