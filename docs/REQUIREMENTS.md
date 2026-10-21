# Tài Liệu Yêu Cầu Dự Án (REQUIREMENTS)

---

## 1. Mục Đích & Phạm Vi Dự Án

**Ca Làm Online** là hệ thống quản lý ca làm việc trực tuyến dạng cá nhân (personal project), hướng đến việc chuẩn hóa quy trình phân ca, tra cứu lịch làm việc và điều phối nhân sự một cách minh bạch, tiện lợi.

Hệ thống được thiết kế theo mô hình Monorepo gồm ba thành phần riêng biệt:
1. **Web App:** Dành cho cấp quản lý điều hành và quản trị viên thao tác trên màn hình lớn.
2. **Mobile App:** Dành cho nhân viên tra cứu, cập nhật ca làm việc nhanh chóng trên thiết bị cá nhân.
3. **Backend API:** Hệ thống máy chủ xử lý dữ liệu tập trung, cung cấp dịch vụ cho cả Web và Mobile.

---

## 2. Phân Vai Trò Người Dùng (User Roles)

Hệ thống phân tách quyền hạn dựa trên ba nhóm vai trò người dùng cốt lõi:

### 2.1. Quản Trị Viên (ADMIN)
- **Phạm vi quyền:** Toàn quyền quản trị hệ thống.
- **Trách nhiệm cấp cao:**
  - Quản lý các cấu hình chung của hệ thống.
  - Quản lý tài khoản và phân quyền cho cấp quản lý (MANAGER) và nhân viên (EMPLOYEE).
  - Giám sát toàn bộ hoạt động điều phối ca làm việc trên hệ thống.

### 2.2. Quản Lý (MANAGER)
- **Phạm vi quyền:** Quản lý nhân sự và lịch làm việc trong phạm vi được phân công.
- **Trách nhiệm cấp cao:**
  - Quản lý danh sách nhân viên thuộc nhóm/bộ phận phụ trách.
  - Lập lịch, điều phối và phân bổ ca làm việc (Shift Scheduling).
  - Theo dõi, xét duyệt yêu cầu đổi ca hoặc phản hồi từ nhân viên (nếu có trong phạm vi phân quyền).

### 2.3. Nhân Viên (EMPLOYEE)
- **Phạm vi quyền:** Tiếp cận thông tin và tiện ích cá nhân trên thiết bị di động.
- **Trách nhiệm cấp cao:**
  - Tra cứu và xem lịch làm việc được chỉ định cho bản thân.
  - Xem thông tin chi tiết của từng ca làm việc (thời gian bắt đầu, kết thúc, địa điểm/bộ phận).
  - Nhận các cập nhật liên quan đến lịch làm việc cá nhân.

---

## 3. Phân Định Giữa Nền Tảng Web và Mobile

| Tiêu chí | Web Application (`web/`) | Mobile Application (`mobile/`) |
|---|---|---|
| **Người dùng mục tiêu** | **ADMIN** và **MANAGER** | **EMPLOYEE** |
| **Thiết bị tối ưu** | Máy tính để bàn, laptop (màn hình trung bình và lớn) | Điện thoại thông minh (iOS / Android) |
| **Đặc trưng trải nghiệm** | Hiển thị bảng biểu, lịch biểu phức tạp (FullCalendar), thao tác quản trị khối lượng lớn | Giao diện tinh gọn, thao tác cảm ứng nhanh gọn, truy cập lịch cá nhân tiện lợi |
| **Lưu trữ phiên đăng nhập** | Token lưu trữ an toàn trên môi trường trình duyệt | Token được bảo mật qua phần cứng/hệ điều hành với `Expo SecureStore` |

---

## 4. Các Vùng Chức Năng Dự Kiến (Được khám phá ở các giai đoạn sau)

Các nhóm chức năng sau đây đã được xác định ở mức độ định hướng kiến trúc ban đầu và sẽ được phân tích chi tiết trong các pha tiếp theo:

1. **Xác thực & Phân quyền (Authentication & Authorization):**
   - Đăng nhập tập trung bằng JWT kết hợp mã hóa mật khẩu với `bcrypt`.
   - Phân quyền theo vai trò (Role-based Access Control - RBAC) cho 3 nhóm vai trò: ADMIN, MANAGER, EMPLOYEE.
2. **Quản lý Nhân sự (Employee Management):**
   - Danh sách nhân viên, thông tin cơ bản, trạng thái làm việc.
3. **Lập lịch & Xếp ca (Shift Scheduling & Assignment):**
   - Tạo mẫu ca làm việc, gán nhân viên vào ca.
   - Hiển thị trực quan theo tuần/tháng trên Web (FullCalendar).
4. **Tra cứu Lịch Cá nhân (Mobile Shift Viewing):**
   - Giao diện xem lịch làm việc cá nhân theo ngày/tuần trên điện thoại.
5. **Xác thực Dữ liệu Đầu vào (Data Validation):**
   - Kiểm tra chặt chẽ cấu trúc và kiểu dữ liệu từ client gửi lên backend sử dụng thư viện `Zod`.

---

## 5. Các Yêu Cầu Chưa Được Chốt (Unresolved / Pending Requirements)

Để đảm bảo tính trung thực và không tự ý sáng tác quy tắc nghiệp vụ ngoài phạm vi thỏa thuận, các nội dung sau **chưa được xem là yêu cầu chính thức** và cần được thảo luận, phê duyệt trước khi hiện thực hóa:

- [ ] **Quy trình Đổi ca / Xin nghỉ (Shift Swap & Leave Requests):** Có cho phép nhân viên tự thỏa thuận đổi ca hay cần sự phê duyệt của MANAGER?
- [ ] **Điểm danh / Chấm công (Check-in / Check-out):** Có tích hợp tính năng chấm công theo định vị GPS, Wi-Fi hay quét mã QR không?
- [ ] **Cơ chế Thông báo Thời gian thực (Push Notifications / Real-time):** Có cần hệ thống thông báo đẩy (Expo Notifications / WebSockets) khi ca làm thay đổi hay chỉ dựa vào việc tải lại dữ liệu (polling)?
- [ ] **Chính sách Đăng ký Tài khoản (Self-registration vs Admin Invitation):** Tài khoản nhân viên do ADMIN/MANAGER tạo thủ công hay nhân viên có thể tự đăng ký và chờ phê duyệt?
- [ ] **Quy tắc Kiểm tra Trùng lịch (Conflict Detection Rules):** Các ràng buộc chi tiết về số giờ làm tối đa/ngày, số ngày nghỉ bắt buộc/tuần cụ thể như thế nào?

---

> *Tài liệu này xác định phạm vi tổng quát ở Phase 0 và sẽ được cập nhật định kỳ khi các quyết định nghiệp vụ được phê duyệt.*
