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
    console.log(` [EMAIL SENT] Đã gửi email lịch tuần ${week} đến ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (error) {
    console.error(` [EMAIL ERROR] Lỗi gửi email đến ${toEmail}:`, error.message);
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

/**
 * Gửi email thông báo Nhân viên bị đánh giá Không hoàn thành / Chưa hoàn thành tốt & Khấu trừ lương
 */
export const sendMissedShiftEmail = async ({
  toEmail,
  employeeName,
  storeName,
  evaluatorName,
  evaluatorRole = 'Quản lý cửa hàng',
  shiftName,
  timeRange,
  date,
  dayOfWeek,
  attendanceStatus = 'MISSED',
  deductedHours = 0,
  deductedPay = 0,
  originalPay = 0,
  remainingPay = 0,
  reason = '',
  updatedTotalSalary = 0,
}) => {
  try {
    const isPartial = attendanceStatus === 'PARTIAL';
    const transporter = createTransporter();

    if (!transporter) {
      console.log(
        `[EMAIL SIMULATION] Thông báo ${isPartial ? 'chưa hoàn thành tốt' : 'trừ cả ca'} ${shiftName} (${date}) bởi ${evaluatorRole} ${evaluatorName} đến ${toEmail} (${employeeName}) - Trừ ${deductedPay.toLocaleString('vi-VN')} VNĐ. Lý do: ${reason}`
      );
      return { success: true, simulated: true, to: toEmail };
    }

    const headerGradient = isPartial
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #ef4444, #dc2626)';
    const statusText = isPartial ? 'Chưa hoàn thành tốt ca làm' : 'Không hoàn thành ca làm việc';
    const statusBadgeStyle = isPartial
      ? 'color: #b45309; background-color: #fffbeb; padding: 3px 8px; border-radius: 6px; border: 1px solid #fde68a;'
      : 'color: #dc2626; background-color: #fef2f2; padding: 3px 8px; border-radius: 6px; border: 1px solid #fecaca;';
    const boxBg = isPartial ? '#fffbeb' : '#fef2f2';
    const boxBorder = isPartial ? '#fcd34d' : '#fca5a5';
    const titleColor = isPartial ? '#92400e' : '#991b1b';
    const textColor = isPartial ? '#78350f' : '#7f1d1d';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid ${boxBorder}; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="background: ${headerGradient}; padding: 24px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 20px;">${storeName}</h2>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95; letter-spacing: 0.5px;">THÔNG BÁO ĐÁNH GIÁ CA LÀM & ĐIỀU CHỈNH TIỀN LƯƠNG</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #1f2937;">Xin chào <strong>${employeeName}</strong>,</p>
          <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
            ${evaluatorRole} <strong>${evaluatorName || storeName}</strong> vừa cập nhật đánh giá ca làm việc của bạn sang trạng thái 
            <strong style="${statusBadgeStyle}">${statusText}</strong>.
          </p>

          <div style="margin: 20px 0; padding: 16px; background-color: ${boxBg}; border: 1px solid ${boxBorder}; border-radius: 8px;">
            <h4 style="margin: 0 0 12px 0; color: ${titleColor}; font-size: 15px;">CHI TIẾT ĐÁNH GIÁ CA LÀM:</h4>
            <div style="margin-bottom: 8px; font-size: 14px; color: ${textColor};">
              <span>• Người đánh giá:</span> <strong>${evaluatorName || 'Quản lý'}</strong> (${evaluatorRole})
            </div>
            <div style="margin-bottom: 8px; font-size: 14px; color: ${textColor};">
              <span>• Ca làm việc:</span> <strong>${shiftName} (${timeRange})</strong>
            </div>
            <div style="margin-bottom: 8px; font-size: 14px; color: ${textColor};">
              <span>• Thời gian:</span> <strong>${dayOfWeek}, ngày ${date}</strong>
            </div>
            ${
              originalPay > 0
                ? `<div style="margin-bottom: 8px; font-size: 14px; color: ${textColor};">
                    <span>• Lương ca ban đầu:</span> <strong>${originalPay.toLocaleString('vi-VN')} VNĐ</strong>
                   </div>`
                : ''
            }
            ${
              deductedHours > 0
                ? `<div style="margin-bottom: 8px; font-size: 14px; color: ${textColor};">
                    <span>• Số giờ bị khấu trừ:</span> <strong>-${deductedHours} giờ</strong>
                   </div>`
                : ''
            }
            <div style="margin-bottom: 8px; font-size: 14px; color: ${isPartial ? '#d97706' : '#dc2626'}; font-weight: bold;">
              <span>• Tiền lương bị trừ:</span> <strong style="font-size: 16px;">-${deductedPay.toLocaleString('vi-VN')} VNĐ</strong>
            </div>
            ${
              isPartial
                ? `<div style="margin-bottom: 8px; font-size: 14px; color: #059669; font-weight: bold;">
                    <span>• Lương ca thực nhận:</span> <strong style="font-size: 16px;">${remainingPay.toLocaleString('vi-VN')} VNĐ</strong>
                   </div>`
                : ''
            }
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed ${boxBorder}; font-size: 14px; color: ${titleColor};">
              <span>• Lý do ghi nhận:</span> <em style="font-weight: 600;">"${reason || (isPartial ? 'Đi trễ / Về sớm / Vi phạm quy chế ca làm' : 'Không đến nhận ca / Vắng mặt')}"</em>
            </div>
          </div>

          <div style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155;">
            <span>Tổng lương tuần sau khi cập nhật:</span> 
            <strong style="color: #059669; font-size: 15px; margin-left: 6px;">${updatedTotalSalary.toLocaleString('vi-VN')} VNĐ</strong>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
            Nếu có sự nhầm lẫn hoặc cần giải trình lý do chính đáng, bạn vui lòng liên hệ trực tiếp với ${evaluatorRole} <strong>${evaluatorName}</strong> để được xem xét điều chỉnh lại.<br>
            <em>Thông báo tự động từ hệ thống Ca Làm Online.</em>
          </p>
        </div>
      </div>
    `;

    const subject = isPartial
      ? `[${storeName}] Thông báo: Ca làm "${shiftName}" ngày ${date} - Đánh giá Chưa hoàn thành tốt & Trừ một phần lương`
      : `[${storeName}] Thông báo: Ca làm "${shiftName}" ngày ${date} bị đánh giá Không hoàn thành`;

    const mailOptions = {
      from: `"${storeName} - Ca Làm Online" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Đã gửi thông báo đánh giá ca đến ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (error) {
    console.error(`[EMAIL ERROR] Lỗi gửi thông báo trừ ca đến ${toEmail}:`, error.message);
    return { success: false, error: error.message, to: toEmail };
  }
};
