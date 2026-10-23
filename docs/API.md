# Danh Sách & Tài Liệu API Backend (API.md)

Tài liệu này tổng hợp toàn bộ các RESTful API hiện có của hệ thống **Ca Làm Online** (Backend chạy tại `http://localhost:5000`).

---

## 📌 Quy Ước Chung
- **Định dạng dữ liệu:** JSON (`Content-Type: application/json`).
- **Xác thực người dùng:** Các API có yêu cầu Token đều gửi kèm Header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Cấu trúc phản hồi chung:**
  * Thành công: `{ "success": true, "data": ... }`
  * Thất bại: `{ "success": false, "message": "Thông báo lỗi tiếng Việt dễ hiểu" }`

---

## 1. Nhóm Xác Thực & Hồ Sơ Cá Nhân (`/api/auth` & `/api/users`)

| Method | Endpoint | Yêu cầu Token | Quyền hạn | Chức năng |
|---|---|:---:|---|---|
| `POST` | `/api/auth/register` | ❌ | Công khai | Đăng ký tài khoản (Chỉ chọn `ADMIN` hoặc `EMPLOYEE`, bắt buộc: email, password, fullName, gender, age) |
| `POST` | `/api/auth/login` | ❌ | Công khai | Đăng nhập tài khoản, trả về JWT Token |
| `GET` | `/api/auth/me` | ✅ | Đã đăng nhập | Lấy thông tin cá nhân của tài khoản đang đăng nhập |
| `PUT` | `/api/users/profile` | ✅ | Đã đăng nhập | Cập nhật thông tin cá nhân (họ tên, giới tính, tuổi, avatar) |
| `PUT` | `/api/users/change-password` | ✅ | Đã đăng nhập | Đổi mật khẩu tài khoản |

---

## 2. Nhóm Cửa Hàng & Mã Mời 6 Số (`/api/stores`)

| Method | Endpoint | Yêu cầu Token | Quyền hạn | Chức năng |
|---|---|:---:|---|---|
| `POST` | `/api/stores` | ✅ | `ADMIN` (Chủ) | Tạo cửa hàng mới (Tên quán, địa chỉ) |
| `GET` | `/api/stores/my-store` | ✅ | Mọi thành viên | Xem thông tin cửa hàng hiện tại (Chủ xem quán mình sở hữu, Nhân viên xem quán mình đang làm) |
| `PUT` | `/api/stores/my-store` | ✅ | `ADMIN` (Chủ) | Cập nhật thông tin cửa hàng (Tên, địa chỉ) |
| `POST` | `/api/stores/generate-invite-code` | ✅ | `ADMIN` (Chủ) | **Bấm sinh Mã Mời 6 số ngẫu nhiên** (hạn 1 giờ, tự động hủy mã cũ) |
| `POST` | `/api/stores/join-by-code` | ✅ | `EMPLOYEE` | **Nhân viên nhập mã 6 số để gia nhập quán** |
| `POST` | `/api/stores/invite-by-id` | ✅ | `ADMIN` (Chủ) | Mời trực tiếp nhân viên qua ID hoặc Email (Tự động gửi email thông báo) |

---

## 3. Nhóm Quản Lý Nhân Sự & Gắn Lương (`/api/stores/:storeId/members`)

| Method | Endpoint | Yêu cầu Token | Quyền hạn | Chức năng |
|---|---|:---:|---|---|
| `GET` | `/api/stores/:storeId/members` | ✅ | `ADMIN` / `MANAGER` | Lấy danh sách nhân viên trong quán kèm mức lương/h và chức vụ |
| `PUT` | `/api/stores/:storeId/members/:memberId/wage` | ✅ | `ADMIN` / `MANAGER` | **Gắn / Cập nhật mức lương theo giờ (VNĐ/h)** (ví dụ: 20.000, 25.000 đ/h) |
| `PUT` | `/api/stores/:storeId/members/:memberId/role` | ✅ | **Chỉ Chủ quán** | Bổ nhiệm nhân viên lên làm **Quản lý (`MANAGER`)** hoặc hạ quyền |
| `PUT` | `/api/stores/:storeId/members/:memberId/type` | ✅ | `ADMIN` / `MANAGER` | Đổi hình thức làm việc: Chính thức (`FULL_TIME`) hoặc Bán thời gian (`PART_TIME`) |
| `DELETE` | `/api/stores/:storeId/members/:memberId` | ✅ | **Chỉ Chủ quán** | Xóa nhân viên khỏi quán (chuyển trạng thái `INACTIVE` để giữ lịch sử) |

---

## 4. Nhóm Khung Giờ / Slot Ca Làm (`/api/stores/:storeId/shifts`)

| Method | Endpoint | Yêu cầu Token | Quyền hạn | Chức năng |
|---|---|:---:|---|---|
| `GET` | `/api/stores/:storeId/shifts` | ✅ | Mọi thành viên quán | Lấy danh sách toàn bộ các Slot ca làm của quán |
| `POST` | `/api/stores/:storeId/shifts` | ✅ | `ADMIN` / `MANAGER` | Tạo mới Slot ca làm (Tên slot, giờ vào, giờ ra - Tự động tính số tiếng `durationHours`) |
| `PUT` | `/api/stores/:storeId/shifts/:shiftId` | ✅ | `ADMIN` / `MANAGER` | Chỉnh sửa Slot ca làm việc |
| `DELETE` | `/api/stores/:storeId/shifts/:shiftId` | ✅ | `ADMIN` / `MANAGER` | Xóa Slot ca làm việc khỏi quán |

---

## 5. Nhóm Xếp Lịch Thời Khóa Biểu, Tính Lương & Gửi Email

| Method | Endpoint | Yêu cầu Token | Quyền hạn | Chức năng |
|---|---|:---:|---|---|
| `GET` | `/api/stores/:storeId/schedules` | ✅ | Mọi thành viên quán | Lấy bảng lịch tuần theo tham số `?week=43&year=2026`, kèm bảng tổng hợp lương nhân viên |
| `POST` | `/api/stores/:storeId/schedules/save-draft` | ✅ | `ADMIN` / `MANAGER` | **Lưu Bản Nháp (`DRAFT`)**: Xếp ca cho nhân viên (hoặc Quản lý tự xếp cho mình), tự động tính lương tuần |
| `POST` | `/api/stores/:storeId/schedules/publish` | ✅ | `ADMIN` / `MANAGER` | **Xác nhận Xuất bản (`PUBLISHED`)**: Chốt lịch tuần & **Tự động gửi Email** lịch trực kèm tiền lương đến từng nhân viên |
| `GET` | `/api/schedules/my-schedule` | ✅ | `EMPLOYEE` | **Nhân viên xem lịch cá nhân tuần này**: Xem các ca trực của riêng mình và tổng số tiền lương nhận được |

---

## 6. Mẫu Payload Nhanh Khi Test

### 🔹 Đăng ký tài khoản (`POST /api/auth/register`)
```json
{
  "email": "chuquan@gmail.com",
  "password": "password123",
  "fullName": "Nguyễn Văn Chủ Quán",
  "gender": "Nam",
  "age": 28,
  "systemRole": "ADMIN"
}
```

### 🔹 Đăng nhập (`POST /api/auth/login`)
```json
{
  "email": "chuquan@gmail.com",
  "password": "password123"
}
```

### 🔹 Nhân viên nhập mã 6 số vào quán (`POST /api/stores/join-by-code`)
```json
{
  "inviteCode": "557736",
  "employmentType": "PART_TIME"
}
```

### 🔹 Lưu bản nháp lịch tuần (`POST /api/stores/:storeId/schedules/save-draft`)
```json
{
  "week": 43,
  "year": 2026,
  "startDate": "2026-10-19",
  "endDate": "2026-10-25",
  "assignments": [
    {
      "date": "2026-10-19",
      "dayOfWeek": "Thứ 2",
      "shiftId": "6adb4d80c6954b3856773bde",
      "userId": "6adb4b57747a495bc51e4dea"
    }
  ]
}
```
