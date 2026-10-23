# Tài Liệu Yêu Cầu Dự Án (REQUIREMENTS.md)

Tài liệu này xác định toàn bộ yêu cầu nghiệp vụ, luồng xử lý và quy tắc vận hành của hệ thống **Ca Làm Online** theo đúng định hướng thực tế của sản phẩm.

---

## 1. Mục Đích & Phạm Vi Dự Án

**Ca Làm Online** là nền tảng hỗ trợ chủ cửa hàng (quán cà phê, nhà hàng, cửa hàng bán lẻ...) quản lý nhân sự, tự động hóa quy trình phân ca làm việc (theo tuần/tháng), tính toán tiền lương theo giờ và tự động gửi thông báo lịch làm kèm lương chi tiết qua email cho nhân viên.

Hệ thống được phát triển theo mô hình:
- **Web App (`web/`):** Dành cho **Chủ (Admin)** và **Quản lý (Manager)** thao tác trên máy tính (xếp lịch, gắn lương, xem báo cáo, quản lý nhân viên).
- **Mobile App (`mobile/`):** Dành cho **Nhân viên (Employee)** tra cứu lịch làm cá nhân, nhận thông báo tức thời.
- **Backend API (`backend/`):** Xử lý nghiệp vụ tập trung, quản lý cơ sở dữ liệu MongoDB Atlas, tính lương và gửi Email tự động.

---

## 2. Phân Vai Trò Người Dùng (3 Roles Cốt Lõi)

### 2.1. Chủ Cửa Hàng (`ADMIN`)
- Người có quyền hạn cao nhất trong hệ thống.
- Đăng ký tài khoản với vai trò Chủ và tạo Cửa hàng.
- Có toàn quyền: Quản lý cửa hàng, phân quyền bổ nhiệm Quản lý, mời/xóa nhân viên, xếp lịch, gắn mức lương theo giờ và duyệt xuất bản lịch làm.

### 2.2. Quản Lý (`MANAGER`)
- Là nhân viên được Chủ cấp quyền điều hành (phân quyền) khi chủ bận hoặc không trực tiếp quản lý.
- **Lưu ý đặc biệt:** Người dùng **không thể tự chọn vai trò này khi đăng ký**, chỉ có Chủ mới có quyền nâng cấp một nhân viên lên làm Quản lý.
- Có quyền xếp lịch làm việc cho cửa hàng, quản lý nhân viên.
- **Có thể tự xếp lịch cho chính mình** (trong trường hợp Quản lý kiêm nhân viên bán hàng / trực ca).

### 2.3. Nhân Viên (`EMPLOYEE`)
- Là người đi làm được thuê bởi Chủ cửa hàng, bao gồm cả:
  - **Nhân viên Chính thức (Full-time)**
  - **Nhân viên Bán thời gian (Part-time)**
- Đăng ký tài khoản với vai trò "Người đi làm", tham gia vào cửa hàng thông qua Mã ID hoặc Mã Mời 6 số.
- Nhận thông báo lịch làm việc và mức lương dự kiến qua email hoặc ứng dụng di động.

---

## 3. Quy Tắc Đăng Ký & Quản Lý Thông Tin Cá Nhân

### 3.1. Đăng Ký Tài Khoản (Sign Up)
- Bắt buộc đăng ký bằng **Email**.
- Form đăng ký yêu cầu đầy đủ các thông tin:
  1. **Email:** Định danh duy nhất để đăng nhập và nhận email thông báo.
  2. **Mật khẩu:** Tối thiểu 6 ký tự, được băm an toàn.
  3. **Họ và tên:** Tên hiển thị của người dùng.
  4. **Giới tính:** Nam / Nữ / Khác.
  5. **Tuổi:** Số tuổi của người dùng.
  6. **Vai trò (Role):** Người dùng **chỉ được chọn 1 trong 2 lựa chọn**:
     - 🏢 **Chủ cửa hàng** (`ADMIN`)
     - 👷 **Người đi làm** (`EMPLOYEE`)
     - *(Tuyệt đối không có tùy chọn Quản lý khi đăng ký)*.

### 3.2. Quản Lý Thông Tin Cá Nhân (Profile Update)
- Tất cả người dùng (Chủ, Quản lý, Nhân viên) đều có quyền xem và chỉnh sửa thông tin cá nhân của mình: Họ tên, giới tính, tuổi, đổi mật khẩu và cập nhật ảnh đại diện.

---

## 4. Quản Lý Cửa Hàng & Cơ Chế Mời Nhân Viên

### 4.1. Tạo Cửa Hàng
- Chủ cửa hàng sau khi đăng ký sẽ tạo không gian làm việc cho cửa hàng của mình (Tên quán, địa chỉ).

### 4.2. Hai Cơ Chế Thêm / Mời Nhân Viên Vào Cửa Hàng:
1. **Mời trực tiếp qua Mã ID tài khoản:**
   - Chủ quán nhập Mã ID (hoặc email) tài khoản của nhân viên đã đăng ký trên hệ thống để thêm trực tiếp vào danh sách nhân viên quán.
2. **Mời qua Mã Mời 6 Số Ngẫu Nhiên (Random 6-digit Invite Code):**
   - **Chỉ sinh mã khi bấm:** Mã không tồn tại sẵn, chỉ khi Chủ bấm nút "Tạo mã mời" thì hệ thống mới sinh ra.
   - **Định dạng:** Gồm **6 chữ số ngẫu nhiên** (ví dụ: `482915`).
   - **Thời hạn hiệu lực:** Mã chỉ có hiệu lực đúng **1 giờ** kể từ lúc sinh ra.
   - **Quy tắc vô hiệu hóa:** Nếu Chủ bấm sinh mã mới, mã cũ **ngay lập tức bị vô hiệu hóa**.
   - Nhân viên chỉ cần nhập mã 6 số này trên ứng dụng để gia nhập vào cửa hàng.

---

## 5. Chức Năng Xếp Lịch Làm Việc & Tự Động Tính Lương (Trọng Tâm)

### 5.1. Giao Diện Lịch Biểu Dạng Thời Khóa Biểu
- Thiết kế dạng lưới (Grid) trực quan theo kiểu **Thời khóa biểu tuần / tháng**:
  - Trục dọc: Các ca làm việc trong ngày (**Slot 1, Slot 2, Slot 3, Slot 4...**).
  - Trục ngang: Các ngày trong tuần (**Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, Chủ nhật**).
  - Bộ điều hướng thời gian: Nút chọn tuần, **[← Tuần trước]**, **[📅 Tuần hiện tại]**, **[Tuần sau →]**.

### 5.2. Gắn Mức Lương Theo Giờ (Hourly Wage)
- Chủ hoặc Quản lý có thể cài đặt mức lương theo giờ cho từng nhân viên (Ví dụ: Nhân viên A = 20.000 VNĐ/giờ, Nhân viên B = 25.000 VNĐ/giờ).
- Quản lý có thể tự xếp lịch cho bản thân và cũng được tính lương tương ứng theo mức lương được gán.

### 5.3. Tự Động Tính Tiền Lương Dự Kiến
- Khi xếp nhân viên vào các ca/slot trong tuần:
  - Hệ thống tự tính: `Số giờ của ca × Mức lương theo giờ của nhân viên`.
  - Tự động cộng dồn: Hiển thị ngay bảng thống kê tổng số giờ làm và **tổng số tiền lương dự kiến chi trả cho mỗi nhân viên trong tuần/tháng đó**.

### 5.4. Quy Trình Bản Nháp (Draft) & Xuất Bản Gửi Email (Publish)
- **Chế độ Bản nháp (Draft):** Khi đang xếp lịch, mọi thay đổi chỉ lưu ở dạng nháp để Quản lý/Chủ thoải mái điều chỉnh, kéo thả mà không làm phiền nhân viên.
- **Xác nhận & Xuất bản (Confirm & Publish):**
  - Khi lịch đã hoàn chỉnh, bấm nút **"Xác nhận & Gửi Email"**.
  - Hệ thống chốt lịch và tự động kích hoạt dịch vụ Email gửi đồng loạt đến từng nhân viên.

---

## 6. Hệ Thống Email Tự Động (2 Form Email Chính)

Dự án tích hợp dịch vụ gửi email với 2 mẫu (template) chuẩn:

1. **Form 1 — Email Thông Báo Lịch Làm Việc & Tiền Lương:**
   - Gửi cho từng nhân viên ngay khi lịch được xác nhận xuất bản.
   - **Nội dung email bao gồm:**
     - Lời chào kèm họ tên nhân viên và tên cửa hàng.
     - Bảng chi tiết các ca làm việc trong tuần (Thứ mấy, ngày nào, từ mấy giờ đến mấy giờ, vị trí trực).
     - **Tổng số giờ làm việc trong tuần**.
     - **Tổng số tiền lương dự kiến nhận được (VNĐ)**.
2. **Form 2 — Email Mời Tham Gia Cửa Hàng:**
   - Gửi khi Chủ muốn mời một nhân viên tham gia vào quán qua email.
   - **Nội dung email bao gồm:**
     - Tên cửa hàng và lời mời từ Chủ quán.
     - **Mã mời 6 chữ số ngẫu nhiên** (kèm lưu ý mã có hạn 1 giờ).
     - Đường dẫn liên kết nhanh để vào app nhập mã.
