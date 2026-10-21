# Kế Hoạch Kiểm Thử Dự Kiến (TEST_PLAN)

> **Lưu ý quan trọng:** Đây là tài liệu quy hoạch các vùng kiểm thử dự kiến cho các giai đoạn phát triển tiếp theo của dự án **Ca Làm Online**. 
> Trong **Phase 0**, không có bài kiểm thử nào được viết hoặc thực thi.

---

## 1. Mục Tiêu Kiểm Thử

Đảm bảo tính tin cậy, an toàn và đồng bộ của toàn bộ hệ thống ba thành phần (Web, Mobile, Backend) thông qua chiến lược kiểm thử đa tầng trước khi đưa vào sử dụng thực tế.

---

## 2. Các Vùng Kiểm Thử Dự Kiến (Planned Testing Areas)

### 2.1. Kiểm Thử Ứng Dụng Web (Future Web Testing)
- **Kiểm thử giao diện & tương tác người dùng (UI Component Testing):**
  - Khả năng hiển thị đúng trạng thái của các nút bấm, biểu mẫu (form), bảng phân ca.
  - Tương tác điều hướng giữa các trang (React Router navigation).
  - Tích hợp và hiển thị trực quan dữ liệu lịch làm việc trên thư viện `FullCalendar`.
- **Kiểm thử Route Protection:**
  - Ngăn chặn truy cập trái phép vào các trang quản trị khi chưa xác thực hoặc không đủ quyền (ví dụ: EMPLOYEE không được vào trang quản trị của MANAGER/ADMIN).
- **Trải nghiệm Responsive:**
  - Đảm bảo hiển thị chuẩn xác trên các kích thước màn hình máy tính bảng và màn hình máy tính bàn thông dụng.

### 2.2. Kiểm Thử Ứng Dụng Mobile (Future Mobile Testing)
- **Kiểm thử màn hình & luồng điều hướng (Screen & Navigation Testing):**
  - Hoạt động của luồng điều hướng trong React Navigation (Stack và Bottom Tab).
  - Khả năng hiển thị danh sách ca làm việc của cá nhân (MyScheduleScreen).
- **Kiểm thử lưu trữ an toàn (Secure Storage Testing):**
  - Khả năng đọc, ghi và xóa JWT token thông qua `Expo SecureStore` khi đăng nhập và đăng xuất.
  - Xử lý khi thiết bị bị khóa hoặc phiên làm việc hết hạn.
- **Xử lý trạng thái mạng (Network & Offline States):**
  - Xử lý giao diện khi mất kết nối internet hoặc khi Backend không phản hồi.

### 2.3. Kiểm Thử Backend REST API (Future Backend API Testing)
- **Kiểm thử từng Endpoint (API Endpoint Testing):**
  - Kiểm tra các mã trạng thái HTTP chuẩn (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).
  - Đảm bảo định dạng phản hồi JSON chuẩn hóa giữa các controllers.
- **Kiểm thử Tầng Dịch vụ (Service Layer Unit Testing):**
  - Kiểm tra độ chính xác của các thuật toán xếp ca, tính toán thời gian ca làm việc, kiểm tra trùng lặp lịch.

### 2.4. Kiểm Thử Xác Thực Dữ Liệu & Xử Lý Lỗi (Validation & Error-Handling Testing)
- **Kiểm thử Schema Validation với Zod:**
  - Kiểm tra payload thiếu trường bắt buộc, sai định dạng email, sai kiểu dữ liệu ngày giờ (`ISO-8601`).
  - Đảm bảo các thông báo lỗi trả về cho client có cấu trúc rõ ràng, dễ phân tích.
- **Kiểm thử Middleware Xử lý Lỗi Toàn cục (Global Error Handling):**
  - Bắt giữ các lỗi không mong muốn (unhandled exceptions) mà không làm sập tiến trình máy chủ.
  - Ngăn chặn việc lộ thông tin nhạy cảm (stack trace) ra môi trường client.

### 2.5. Kiểm Thử Xác Thực & Phân Quyền (Authentication & Role-Permission Testing)
- **Kiểm thử Cơ chế Xác thực JWT:**
  - Tạo, giải mã và xác minh tính hợp lệ của JSON Web Token.
  - Xử lý trường hợp token bị hết hạn (Expired Token) hoặc token bị can thiệp trái phép (Tampered Token).
  - Cơ chế băm và đối soát mật khẩu với `bcrypt`.
- **Kiểm thử Phân Quyền Vai Trò (Role-based Access Control - RBAC):**
  - Quyền của ADMIN: Có thể truy cập toàn bộ tài nguyên.
  - Quyền của MANAGER: Chỉ truy cập và chỉnh sửa trong phạm vi phân công, không được chỉnh sửa tài khoản ADMIN.
  - Quyền của EMPLOYEE: Chỉ xem được lịch và thông tin cá nhân, bị từ chối khi gọi API quản trị.

### 2.6. Kiểm Thử Tích Hợp Hệ Thống (Integration Testing between Apps and Backend)
- **Luồng tích hợp Web ↔ Backend:**
  - MANAGER đăng nhập trên Web -> Hệ thống cấp JWT -> MANAGER tạo ca làm việc -> Dữ liệu lưu vào MongoDB Atlas -> Trả về hiển thị trên FullCalendar.
- **Luồng tích hợp Mobile ↔ Backend:**
  - EMPLOYEE đăng nhập trên Mobile -> Token lưu vào SecureStore -> Gửi request lấy lịch cá nhân kèm Header `Authorization: Bearer <token>` -> Hiển thị danh sách ca.
- **Đồng bộ hóa dữ liệu:**
  - Ca làm được tạo/điều chỉnh trên Web phản ánh chính xác khi Mobile tải lại dữ liệu.

---

## 3. Khung Công Cụ Dự Kiến Cho Các Pha Sau (Tools Under Consideration)

Các công cụ sau đây là định hướng tham khảo để lựa chọn khi bước vào pha triển khai kiểm thử:
- **Backend Testing:** `Supertest` (kiểm thử HTTP API), `Jest` hoặc `Vitest` (test runner).
- **Web Testing:** `React Testing Library` / `Vitest` hoặc `Playwright` cho kiểm thử e2e.
- **Mobile Testing:** `Jest` với cấu hình React Native testing library.

*(Việc cài đặt và cấu hình cụ thể các công cụ trên sẽ chỉ được thực hiện khi có yêu cầu chính thức từ các giai đoạn tiếp theo).*
