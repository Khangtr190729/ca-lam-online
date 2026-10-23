# Danh Sách & Thiết Kế Màn Hình (SCREENS.md)

Tài liệu này mô tả chi tiết danh sách tất cả các màn hình, bố cục và chức năng trên hai nền tảng: **Web App (`web/`)** và **Mobile App (`mobile/`)** cho hệ thống **Ca Làm Online**, bám sát giao diện thời khóa biểu và các nghiệp vụ xếp ca, tính lương và gửi email.

---

## 1. Tổng Quan Kiến Trúc Giao Diện

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 HỆ THỐNG CA LÀM ONLINE                                 │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│         WEB APP (Desktop / Laptop)        │          MOBILE APP (iOS / Android)        │
│    Dành cho: ADMIN (Chủ), MANAGER         │    Dành cho: EMPLOYEE (Người đi làm)       │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Đăng ký tài khoản (Chủ / Người đi làm) │ 1. Đăng ký & Đăng nhập tài khoản           │
│ 2. Đăng nhập hệ thống                     │ 2. Nhập Mã 6 số gia nhập Cửa hàng          │
│ 3. Tạo & Quản lý Cửa hàng                 │ 3. Lịch làm việc tuần & Tiền lương dự kiến │
│ 4. Mời nhân viên (Mã ID & Mã 6 số 1h)     │ 4. Chi tiết Ca làm việc                    │
│ 5. Quản lý Nhân sự & Gắn Lương (VNĐ/h)    │ 5. Hộp thư Thông báo & Lịch sử nhận mail   │
│ 6. Xếp lịch Thời khóa biểu & Tính lương   │ 6. Hồ sơ cá nhân (Sửa thông tin)           │
│ 7. Hồ sơ cá nhân (Sửa thông tin)          │                                            │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Giao Diện Web App — `web/` (Admin & Manager)

Ứng dụng web được tối ưu cho máy tính, phục vụ công việc điều hành, xếp lịch và tính lương của Chủ quán và Quản lý.

### 2.1. Màn hình Đăng Ký Tài Khoản (`/register`)
- **Đối tượng:** Người dùng mới đăng ký vào hệ thống.
- **Form đăng ký yêu cầu đầy đủ các trường:**
  - **Email:** Nhập email hợp lệ (dùng để đăng nhập và nhận thông báo).
  - **Mật khẩu & Xác nhận mật khẩu:** Ẩn/hiện mật khẩu.
  - **Họ và tên:** Họ tên đầy đủ.
  - **Giới tính:** Lựa chọn `Nam`, `Nữ` hoặc `Khác`.
  - **Tuổi:** Ô nhập số tuổi.
  - **Vai trò (Role):** Chọn 1 trong 2 nút lựa chọn (Radio/Card):
    - 🏢 **Chủ cửa hàng** (`ADMIN`)
    - 👷 **Người đi làm** (`EMPLOYEE`)
    - *(Hệ thống không hiển thị tùy chọn Quản lý ở đây)*.

---

### 2.2. Màn hình Đăng Nhập (`/login`)
- **Đối tượng:** Tất cả người dùng.
- **Chức năng:** Đăng nhập bằng Email và Mật khẩu, lưu JWT token, tự động chuyển hướng theo vai trò (Chủ vào trang Quản lý/Tạo cửa hàng, Nhân viên vào trang cá nhân).

---

### 2.3. Màn hình Hồ Sơ Cá Nhân (`/profile`)
- **Đối tượng:** ADMIN, MANAGER, EMPLOYEE.
- **Chức năng:**
  - Xem và **chỉnh sửa thông tin cá nhân**: Cập nhật Họ tên, Giới tính, Tuổi, Ảnh đại diện (Avatar).
  - Đổi mật khẩu tài khoản.

---

### 2.4. Màn hình Tạo & Quản Lý Cửa Hàng / Mời Nhân Viên (`/store-management`)
- **Đối tượng:** ADMIN (Chủ cửa hàng).
- **Chức năng chính:**
  - **Tạo cửa hàng mới:** Nhập tên cửa hàng (ví dụ: *Tiệm Cà Phê Mộc*), địa chỉ quán.
  - **Khu vực Mời Nhân Viên Vào Quán (2 Phương thức):**
    1. **Mời trực tiếp qua ID tài khoản:** Ô nhập Mã ID hoặc Email của nhân viên -> Bấm "Thêm vào quán" hoặc "Gửi email mời".
    2. **Sinh Mã Mời 6 Số Ngẫu Nhiên (Random 6-digit Code):**
       - Nút bấm **"Tạo mã mời mới"**.
       - Khi bấm, hệ thống sinh ra mã ngẫu nhiên (Ví dụ: **`482915`**).
       - Hiển thị **đồng hồ đếm ngược 60 phút (1 giờ)** hiệu lực của mã.
       - Nút "Sao chép mã" để gửi cho nhân viên qua tin nhắn.
       - Cảnh báo rõ: *Khi bấm sinh mã mới, mã mời cũ sẽ bị vô hiệu hóa ngay lập tức*.

---

### 2.5. Màn hình Quản Lý Nhân Sự & Cài Đặt Lương (`/employees`)
- **Đối tượng:** ADMIN, MANAGER.
- **Chức năng chính:**
  - **Danh sách nhân sự cửa hàng:** Hiển thị Họ tên, Email, Giới tính, Tuổi, Hình thức làm việc (Full-time / Part-time), Chức vụ (Nhân viên / Quản lý).
  - **Cài đặt Mức Lương Theo Giờ (`hourlyWage`):**
    - Cho phép nhập/chỉnh sửa mức lương cho từng nhân viên (Ví dụ: `20,000 đ/h`, `25,000 đ/h`).
  - **Bổ nhiệm Quản lý (Chỉ Admin):** Chủ quán có quyền chọn một nhân viên để nâng cấp thành **Quản lý (Manager)** để phụ giúp điều hành và xếp lịch khi chủ bận.
  - Xóa/Khai trừ nhân viên khỏi cửa hàng.

---

### 2.6. Màn hình Xếp Lịch Làm Việc & Tự Động Tính Lương (`/schedules`) — *Chức Năng Trọng Tâm*
- **Đối tượng:** ADMIN, MANAGER.
- **Bố cục giao diện (Bám sát thiết kế thời khóa biểu):**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Chọn tuần: Tuần 43, 2026 📅]   [← Tuần trước]   [📅 Tuần hiện tại]   [Tuần sau →]               │
├──────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Slot │ Thứ 2 (19/10)│ Thứ 3 (20/10)│ Thứ 4 (21/10)│ Thứ 5 (22/10)│ Thứ 6 (23/10)│ Chủ nhật(25/10)│
├──────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│Slot 1│ [Ca Sáng]    │ [Ca Sáng]    │ [Ca Sáng]    │ -            │ [Ca Sáng]    │ -              │
│07-11h│ 👤 Nguyễn A  │ 👤 Trần B    │ 👤 Lê C      │              │ 👤 Nguyễn A  │                │
├──────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│Slot 2│ [Ca Chiều]   │ -            │ [Ca Chiều]   │ [Ca Chiều]   │ -            │ [Ca Chiều]     │
│13-17h│ 👤 Quản lý Q │              │ 👤 Nguyễn A  │ 👤 Trần B    │              │ 👤 Lê C        │
└──────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 💰 BẢNG TÍNH LƯƠNG DỰ KIẾN THEO LỊCH TUẦN NÀY:                                                   │
│ • Nguyễn A (Part-time):  3 ca (12 giờ) × 20.000 đ/h = 240.000 VNĐ                                │
│ • Trần B (Full-time):    5 ca (20 giờ) × 25.000 đ/h = 500.000 VNĐ                                │
│ • Quản lý Q (Tự xếp ca): 4 ca (16 giờ) × 30.000 đ/h = 480.000 VNĐ                                │
│ ──────────────────────────────────────────────────────────────────────────────────────────────── │
│ [ 💾 Lưu Bản Nháp ]                      [ 🚀 XÁC NHẬN & GỬI EMAIL LỊCH LÀM KÈM LƯƠNG ]          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Các tính năng chi tiết:**
  - **Thanh điều hướng tuần:** Chuyển đổi giữa các tuần dễ dàng để xếp lịch cho cả tuần hoặc tháng tiếp theo.
  - **Phân ca linh hoạt:** Click vào ô Slot của từng Thứ để chọn nhân viên vào trực. **Quản lý có thể tự xếp lịch cho chính mình**.
  - **Tự động tính lương trực tiếp:** Mỗi khi thêm hoặc bớt một ca làm, bảng tổng kết lương bên dưới tự động nhảy số tiền tương ứng (`Số giờ ca × Lương/giờ của nhân viên đó`).
  - **Trạng thái Bản Nháp (Draft):** Đang xếp lịch dở dang sẽ lưu nháp, chưa gửi gì cho nhân viên.
  - **Nút "Xác nhận & Gửi Email" (Publish):**
    - Chốt lịch tuần/tháng.
    - Hệ thống tự động kích hoạt gửi email thông báo chi tiết đến hòm thư của từng nhân viên kèm theo bảng lịch và số tiền lương được nhận.

---

## 3. Giao Diện Mobile App — `mobile/` (Employee)

Ứng dụng di động giúp nhân viên tra cứu lịch làm và theo dõi tiền lương cá nhân nhanh chóng trên điện thoại.

### 3.1. Màn hình Đăng Nhập & Đăng Ký Mobile (`LoginScreen`, `RegisterScreen`)
- Nhân viên đăng ký tài khoản với vai trò "Người đi làm" và đăng nhập vào ứng dụng.
- Lưu phiên an toàn bằng `Expo SecureStore`.

---

### 3.2. Màn hình Gia Nhập Cửa Hàng (`JoinStoreScreen`)
- Xuất hiện khi nhân viên chưa thuộc cửa hàng nào:
  - **Ô nhập Mã Mời 6 số:** Nhập mã ngẫu nhiên do Chủ quán cung cấp (ví dụ: `482915`).
  - Bấm "Gia nhập" -> Hệ thống kiểm tra mã còn trong hạn 1 giờ hay không -> Vào ngay cửa hàng.

---

### 3.3. Màn hình Lịch Làm Việc Tuần & Tiền Lương (`MyScheduleScreen` — Tab Chính)
- **Thanh điều hướng tuần:** Xem lịch tuần này, tuần trước, tuần sau tương tự Web.
- **Lưới lịch cá nhân:** Hiển thị rõ ràng các ngày trong tuần mình có ca trực (Slot mấy, từ mấy giờ đến mấy giờ).
- **Hộp thông tin Tiền lương dự kiến:**
  - Mức lương theo giờ: *20.000 đ/h*.
  - Tổng số giờ làm tuần này: *16 giờ*.
  - **Tổng tiền lương dự kiến nhận: 320.000 VNĐ**.

---

### 3.4. Màn hình Chi Tiết Ca Làm (`ShiftDetailScreen`)
- Xem chi tiết ca làm: Giờ bắt đầu, kết thúc, các đồng nghiệp cùng trực ca đó.

---

### 3.5. Màn hình Thông Báo & Hộp Thư (`NotificationScreen` — Tab 2)
- Xem lại lịch sử các thông báo lịch làm mới và thông báo mời gia nhập.

---

### 3.6. Màn hình Hồ Sơ Cá Nhân (`ProfileScreen` — Tab 3)
- Xem và chỉnh sửa thông tin cá nhân (Họ tên, giới tính, tuổi).
- Đổi mật khẩu tài khoản và đăng xuất.

---

## 4. Chi Tiết 2 Mẫu Giao Diện Email Gửi Về Cho Nhân Viên

### 4.1. Mẫu Email 1: Thông Báo Lịch Làm Việc & Tiền Lương Tuần
- **Tiêu đề:** `[Tên Cửa Hàng] Thông báo Lịch làm việc & Bảng lương dự kiến - Tuần XX`
- **Nội dung:**
  - Lời chào: *Chào [Họ và tên nhân viên], lịch làm việc tuần mới của bạn tại [Tên cửa hàng] đã được công bố.*
  - Bảng chi tiết các ca trực trong tuần:
    | Thứ / Ngày | Ca / Slot | Khung giờ | Số giờ | Tiền lương ca |
    |---|---|---|---|---|
    | Thứ 2 (19/10) | Slot 1 (Ca Sáng) | 07:00 - 11:30 | 4.5h | 90.000 VNĐ |
    | Thứ 4 (21/10) | Slot 2 (Ca Chiều) | 13:00 - 17:00 | 4.0h | 80.000 VNĐ |
  - **Tổng kết:**
    - Tổng thời gian làm việc: **8.5 giờ**
    - Mức lương: **20.000 VNĐ / giờ**
    - **TỔNG LƯƠNG DỰ KIẾN NHẬN ĐƯỢC: 170.000 VNĐ**

### 4.2. Mẫu Email 2: Thư Mời Tham Gia Cửa Hàng
- **Tiêu đề:** `[Tên Cửa Hàng] Lời mời tham gia ca làm việc từ Quản lý`
- **Nội dung:**
  - Lời chào và thông điệp mời từ Chủ quán.
  - **Mã mời 6 số:** `[ 4 8 2 9 1 5 ]`
  - Ghi chú: *Mã mời này có hiệu lực trong vòng 60 phút. Vui lòng mở ứng dụng Ca Làm Online và nhập mã để tham gia.*
