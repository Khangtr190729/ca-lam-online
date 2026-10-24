# Tài Liệu Yêu Cầu Dự Án (REQUIREMENTS.md)

Tài liệu này xác định toàn bộ yêu cầu nghiệp vụ, luồng xử lý và quy tắc vận hành của hệ thống **Ca Làm Online** theo đúng định hướng thực tế của sản phẩm.

---

## 1. Mục Đích & Phạm Vi Dự Án

**Ca Làm Online** là nền tảng hỗ trợ chủ cửa hàng (quán cà phê, nhà hàng, cửa hàng bán lẻ...) quản lý nhân sự, tự động hóa quy trình phân ca làm việc (theo tuần/tháng), tính toán tiền lương theo giờ và tự động gửi thông báo lịch làm kèm lương chi tiết qua email cho nhân viên.

Hệ thống được phát triển theo mô hình:
- **Web App (`web/`):** Nền tảng toàn diện trên máy tính & trình duyệt dành cho **Chủ (Admin)**, **Quản lý (Manager)** và **Nhân viên (Employee)**.
- **Mobile App (`mobile/`):** Ứng dụng di động đa năng hỗ trợ cả hai nhóm đối tượng:
  - **Chủ quán / Quản lý:** Theo dõi thống kê quán, xếp ca tự động/thủ công, duyệt & xuất bản lịch làm gửi email, tạo mã mời 6 số, quản lý nhân sự & khung giờ trực ngay trên điện thoại.
  - **Nhân viên:** Tra cứu lịch làm tuần, theo dõi bảng lương ước tính theo giờ, ca trực tiếp theo và thông báo cửa hàng.
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

### 3.3. Chức Năng Quên Mật Khẩu Qua Mã OTP 6 Số Gửi Về Email
- Cho phép tất cả người dùng khôi phục và đặt lại mật khẩu trực tiếp tại màn hình Đăng nhập (`/login`).
- **Quy trình 3 bước bảo mật tiêu chuẩn:**
  1. **Bước 1 - Yêu cầu mã OTP:** Người dùng nhập Email tài khoản. Hệ thống kiểm tra tài khoản, sinh **Mã xác thực OTP gồm 6 chữ số ngẫu nhiên** (ví dụ: `809786`) và tự động gửi email thông báo chứa mã đến hộp thư của người dùng.
  2. **Bước 2 - Xác thực mã OTP:** Người dùng nhập mã OTP 6 số nhận được từ email.
     - **Thời hạn hiệu lực:** Mã OTP chỉ có hiệu lực đúng **10 phút** kể từ thời điểm sinh mã.
     - **Bảo mật:** Giao diện hỗ trợ đếm ngược 60 giây trước khi cho phép gửi lại mã OTP mới (hủy mã cũ).
  3. **Bước 3 - Đặt mật khẩu mới:** Sau khi OTP được xác thực thành công, người dùng nhập mật khẩu mới (tối thiểu 6 ký tự) và xác nhận lại mật khẩu. Hệ thống băm an toàn với `bcryptjs`, lưu vào cơ sở dữ liệu và hủy mã OTP đã sử dụng để chống tái sử dụng.

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

### 5.5. Đánh Dấu Mức Độ Cao Điểm Của Ca (1 - 3 Sao) & Thuật Toán Tự Động Xếp Ca Thông Minh
- **Mức độ sao cao điểm cho từng ca:**
  - Mỗi ca làm việc (Slot) được gắn mức đánh giá cao điểm từ 1 đến 3 sao:
    - ⭐ **1 sao (Mặc định):** Ca bình thường, lượng khách trung bình, chỉ cần cơ số nhân viên tiêu chuẩn (1 nhân sự).
    - ⭐⭐ **2 sao:** Ca khá cao điểm, lượng khách đông hơn, hệ thống tự động điều phối thêm nhân sự khi cửa hàng có đủ người.
    - ⭐⭐⭐ **3 sao:** Ca rất cao điểm (giờ vàng, đông khách nhất), được ưu tiên phân bổ số lượng nhân sự cao nhất.
  - Quản lý có thể gắn sao trực tiếp tại trang **Ca làm** hoặc bấm trực tiếp vào các ngôi sao ở cột **"Khung Giờ / Ca"** trên lưới thời khóa biểu để điều chỉnh nhanh chóng.
- **Thuật toán Tự động xếp lịch thông minh theo số sao:**
  - **Dựa trên số lượng nhân sự thực tế của quán:** Thuật toán tự động tính toán định mức nhân sự cho từng ca theo số lượng nhân viên hiện có (`totalMembers`) và giới hạn số ca tối đa/ngày (`maxShiftsPerDay`), hoàn toàn dựa trên khả năng thực tế của quán.
  - **Đảm bảo phủ đều & không dồn quá tải:** Hệ thống đảm bảo mọi ca đều có người trực (nếu quán đủ người), sau đó mới phân bổ nhân sự dôi dư vào ca 3 sao và 2 sao theo trần hợp lý (sensible cap), tuyệt đối không nhồi nhét toàn bộ nhân viên vào một ca khi không cần thiết.
  - **Cân bằng tải công bằng (Fair Workload):** Luôn chia đều tổng số ca và tổng số giờ làm việc giữa các nhân viên trong tuần, chống trùng lịch và bảo toàn các ca đã qua trong quá khứ.

---

## 6. Hệ Thống Email Tự Động (3 Mẫu Email Chính)

Dự án tích hợp dịch vụ gửi email với 3 mẫu (template) chuẩn:

1. **Form 1 — Email Thông Báo Lịch Làm Việc & Tiền Lương:**
   - Gửi cho từng nhân viên ngay khi lịch được xác nhận xuất bản.
   - **Nội dung email bao gồm:** Lời chào, bảng chi tiết các ca trực trong tuần, tổng số giờ làm và tổng số tiền lương dự kiến nhận được (VNĐ).
2. **Form 2 — Email Mời Tham Gia Cửa Hàng:**
   - Gửi khi Chủ muốn mời một nhân viên tham gia vào quán qua email.
   - **Nội dung email bao gồm:** Tên cửa hàng, lời mời, **mã mời 6 chữ số ngẫu nhiên** (hạn 1 giờ) và liên kết gia nhập quán.
3. **Form 3 — Email Kỷ Luật & Thông Báo Khấu Trừ Lương Ca Làm:**
   - Tự động kích hoạt khi Quản lý đánh giá ca làm việc của nhân viên (khi ca đang diễn ra hoặc đã kết thúc).
   - **Hai cấp độ hiển thị:**
     - **Chưa hoàn thành tốt (`PARTIAL` - màu hổ phách):** Thông báo số giờ bị trừ, số tiền khấu trừ, lý do vi phạm (đi trễ, về sớm) và số tiền lương thực nhận còn lại của ca.
     - **Không hoàn thành (`MISSED` - màu đỏ):** Thông báo nhân viên bỏ ca/vắng mặt không phép, khấu trừ 100% lương ca và lý do ghi nhận.

---

## 7. Nghiệp Vụ Đánh Giá Ca Làm Việc & Khấu Trừ Lương (Shift Attendance & Deductions)

Nhằm đảm bảo kỷ luật và minh bạch quyền lợi công bằng cho nhân sự, hệ thống cung cấp quy trình đánh giá 3 cấp độ:

### 7.1. Ba Trạng Thái Đánh Giá Ca
1. **Hoàn thành tốt (`COMPLETED`):**
   - Mặc định khi nhân viên đi làm đầy đủ, đúng giờ.
   - Nhân viên hưởng **100%** tiền lương ca làm việc.
2. **Chưa hoàn thành tốt (`PARTIAL`):**
   - Áp dụng khi nhân viên đi trễ (15p, 30p, 1h...), xin về sớm hoặc vi phạm quy chế nhẹ.
   - Hệ thống cho phép **khấu trừ một phần lương ca** thay vì trừ mất cả ca:
     - **Khấu trừ theo số giờ:** Sử dụng dropdown chọn từ `0.5 giờ`, `1 giờ`, `1.5 giờ`... đến tối đa thời lượng ca.
     - **Khấu trừ theo số tiền (VNĐ):** Sử dụng dropdown với **bước nhảy 10.000đ** (`10.000đ`, `20.000đ`, `30.000đ`...) đến trần lương ca, kèm ô nhập số lẻ tùy chỉnh.
   - **Tự do nhập lý do:** Quản lý tự gõ lý do vi phạm thực tế để lưu vào hồ sơ và gửi trực tiếp qua email nhân viên.
   - **Bảng xem trước trực tiếp:** Tự động tính: `Lương gốc ca - Khấu trừ = Lương ca thực nhận`.
3. **Không hoàn thành (`MISSED`):**
   - Áp dụng khi nhân viên vắng mặt không phép, tự ý bỏ ca giữa chừng.
   - Khấu trừ toàn bộ **100% tiền lương ca** (lương ca = 0 VNĐ) và gửi email cảnh báo.

### 7.2. Đồng Bộ Bảng Lương & Khôi Phục Ca
- Mọi khoản khấu trừ sẽ được tự động cập nhật thời gian thực vào:
  - Bảng tổng hợp lương tuần của cửa hàng (`PayrollSummaryCard`).
  - Lưới thời khóa biểu (hiển thị huy hiệu vi phạm màu cam).
  - Màn hình lịch cá nhân của nhân viên (`MySchedulePage` / Mobile).
  - Báo cáo tài chính & quỹ lương trên `Dashboard`.
- **Cơ chế Khôi phục ca:** Quản lý có thể bấm nút **"Khôi phục ca"** bất kỳ lúc nào để chuyển trạng thái về `COMPLETED` và cộng lại 100% lương ca nếu có sự nhầm lẫn.

