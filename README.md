# Ca Làm Online — Xếp Ca & Quản Lý Lương Cửa Hàng

**Ca Làm Online** là nền tảng quản trị và tự động hóa quy trình xếp ca làm việc, theo dõi lịch trực và tính toán tiền lương theo giờ dành cho các mô hình cửa hàng vừa và nhỏ (quán cà phê, nhà hàng, trà sữa, cửa hàng bán lẻ...). Hệ thống được xây dựng theo kiến trúc monorepo phân tách rõ ràng, tích hợp thuật toán xếp lịch thông minh, phát hiện xung đột thời gian thực, đánh giá ca làm việc và tự động gửi thông báo qua Email.

---

## 1. Hiện Trạng & Tiến Độ Dự Án

Hệ thống đã hoàn thiện toàn diện các phân hệ cốt lõi:
- [x] **Backend REST API (`backend/`):** Hoạt động hoàn chỉnh với Express 5, MongoDB Atlas (Mongoose 9), bảo mật JWT, mã hóa bcryptjs, kiểm thực dữ liệu Zod và dịch vụ gửi mail tự động Nodemailer.
- [x] **Frontend Web App (`web/`):** Ứng dụng web SPA hoàn chỉnh trên React 19 & Vite, Tailwind CSS v4, giao diện responsive, tích hợp hệ thống micro-interactions tăng tốc phần cứng GPU (60–120 FPS).
- [x] **Mobile App (`mobile/`):** Cấu trúc ứng dụng di động React Native & Expo SDK 58, tích hợp React Navigation và SecureStore, sẵn sàng mở rộng tra cứu lịch làm việc trên thiết bị cầm tay.

---

## 2. Phân Quyền & Đối Tượng Người Dùng

Hệ thống quản lý chặt chẽ 3 vai trò người dùng trong cửa hàng:

| Vai trò | Định danh kỹ thuật | Mô tả & Thẩm quyền chính |
|---|---|---|
| **Chủ cửa hàng** | `OWNER` / `ADMIN` | • Tạo cửa hàng, quản lý thông tin cửa hàng, tạo mã mời 6 số (hiệu lực 60 phút).<br>• Mời nhân viên qua email hoặc mã mời, phân loại Part-time / Full-time.<br>• Thiết lập mức lương theo giờ linh hoạt cho từng nhân viên.<br>• Bổ nhiệm/hạ quyền Quản lý, xóa nhân viên khỏi cửa hàng.<br>• Định nghĩa khung giờ ca làm việc, kiểm tra trùng lặp khung giờ.<br>• Xếp lịch tuần (thủ công & tự động), xuất bản lịch và xem tổng chi phí lương tuần/tháng. |
| **Quản lý cửa hàng** | `MANAGER` | • Được Chủ bổ nhiệm từ nhân viên (không đăng ký tự do).<br>• Điều phối, phân công ca làm việc cho nhân sự trong tuần.<br>• Sử dụng thuật toán tự động xếp lịch và kiểm soát xung đột.<br>• **Đánh giá ca làm việc đa cấp độ:** Đánh dấu ca hoàn thành, chưa hoàn thành tốt (đi trễ, về sớm, trừ 1 phần lương), hoặc không hoàn thành (vắng/bỏ ca, trừ cả ca), nhập lý do vi phạm và gửi email minh bạch.<br>• **Có thể được phân ca và theo dõi lịch làm việc của chính mình** qua màn hình *Lịch làm của tôi*. |
| **Người đi làm / Nhân viên** | `EMPLOYEE` | • Đăng ký tài khoản với vai trò người đi làm, tham gia quán qua mã mời 6 số hoặc link mời email.<br>• Theo dõi lịch làm việc cá nhân tuần/tháng (giao diện web responsive & mobile).<br>• Nhận email thông báo tự động khi lịch làm việc được xuất bản (kèm danh sách ca và lương ước tính).<br>• Nhận email thông báo chi tiết khi ca làm việc bị đánh giá chưa tốt hoặc không hoàn thành kèm số tiền khấu trừ cụ thể. |

---

## 3. Các Tính Năng Nổi Bật

### 3.1. Quản lý Khung giờ Ca làm việc (Shifts)
- Tạo và định nghĩa các ca làm việc mẫu (ví dụ: Slot 1, Slot 2, Ca Sáng, Ca Gãy, Ca Tối...).
- Tự động tính toán số giờ làm việc dựa trên giờ bắt đầu và giờ kết thúc.
- Gán mã màu phân biệt cho từng ca để dễ dàng nhận diện trên lịch biểu.
- **Thuật toán ngăn chặn xung đột:** Ngăn chặn tuyệt đối việc tạo 2 ca làm việc có khung giờ trùng hoặc giao thoa nhau trong cùng một cửa hàng.

### 3.2. Lịch biểu Xếp ca Tuần Thông minh (Weekly Timetable Grid)
- Giao diện ma trận lịch biểu trực quan 7 ngày trong tuần (Thứ 2 đến Chủ Nhật).
- Phân ca linh hoạt cho từng ô lịch, hỗ trợ nhiều nhân viên trong một ca.
- **Cảnh báo xung đột thời gian thực:**
  - Phát hiện nhân viên bị trùng khung giờ ca làm việc trong cùng ngày.
  - Cảnh báo nhân viên bị xếp quá số ca cho phép trong ngày.
- **Thuật toán Tự động xếp lịch (Auto Schedule):**
  - Tự động phân bổ số ca và số giờ làm việc công bằng, đều đặn giữa các nhân viên.
  - Tuân thủ nghiêm ngặt quy tắc không trùng ca và giữ nguyên các ca đã xếp thủ công (tùy chọn).
  - Tự động bỏ qua các ca/ngày đã diễn ra trong quá khứ.
  - Lưu kết quả dưới dạng **Bản nháp (DRAFT)** để quản lý xem lại và tinh chỉnh trước khi duyệt.

### 3.3. Đánh giá Ca làm việc Đa Cấp Độ (Shift Evaluation) & Khấu Trừ Lương Tự Động
- Cho phép Quản lý / Chủ cửa hàng đánh giá các ca làm việc đang diễn ra hoặc đã kết thúc trong quá khứ (không áp dụng cho ca tương lai).
- **3 Cấp độ đánh giá chuyên nghiệp:**
  1. **Hoàn thành (`COMPLETED`):** Tính đủ 100% giờ làm và lương ca.
  2. **Chưa hoàn thành tốt (`PARTIAL`):** Dành cho trường hợp nhân viên đi trễ, về sớm, xin nghỉ 1 phần ca hoặc vi phạm nội quy cửa hàng.
     - **Trừ theo số giờ/phút:** Nhập số giờ khấu trừ (kèm chip chọn nhanh: *Trễ 30 phút*, *Trễ 1 tiếng*, *Về sớm 1 tiếng*...). Hệ thống tự động tính tiền trừ = `Giờ trừ × Mức lương` và tính tiền lương thực nhận của ca.
     - **Trừ theo số tiền cố định (VNĐ):** Nhập trực tiếp số tiền khấu trừ (kèm chip gợi ý *-20.000đ*, *-50.000đ*).
  3. **Không hoàn thành (`MISSED`):** Dành cho trường hợp nhân viên vắng mặt không phép, bỏ ca (trừ 100% lương ca làm).
- **Hỗ trợ khôi phục ca:** Có thể khôi phục lại trạng thái Hoàn thành và hoàn lương bất cứ lúc nào nếu có sự nhầm lẫn.
- **Tự động gửi email minh bạch:** Hệ thống gửi ngay email thông báo về hộp thư nhân viên, thể hiện rõ mức trừ, số giờ trừ, lương ca còn nhận, lý do và danh tính người đánh giá (Chủ/Quản lý).

### 3.4. Bảng Lương & Thống kê Tài chính Cửa hàng
- **Bảng tổng kết lương tuần:** Tự động tính tổng giờ làm việc thực tế, tổng ca hoàn thành, ca vi phạm/trừ 1 phần và tiền lương chi tiết của từng nhân viên theo công thức `Mức lương/giờ × Thời lượng ca thực tế`.
- **Thống kê tháng & Luỹ kế:**
  - Tổng số ca đã phân trong tháng.
  - Dự toán tổng chi phí lương của cả cửa hàng trong tháng này (đã phản ánh các khoản khấu trừ).
  - Nút chuyển đổi đối soát và so sánh trực quan với dữ liệu của tháng trước.

### 3.5. Dịch vụ Email Tự động (Nodemailer HTML Templates)
- Template email mời nhân viên tham gia cửa hàng kèm hướng dẫn kích hoạt.
- Template email xuất bản lịch làm việc: Liệt kê chi tiết từng ca trong tuần của nhân viên và bảng tính lương dự toán.
- Template email thông báo đánh giá Chưa hoàn thành tốt (Trừ một phần lương) hoặc Không hoàn thành ca (Trừ toàn bộ lương) minh bạch.

### 3.6. Giao diện Đỉnh cao & Hiệu năng 60–120 FPS
- Bảng màu cam thương hiệu (`#EA701B`) ấm áp, hiện đại, phối hợp cùng nền kem nhẹ và kính mờ (glassmorphism).
- Hệ thống hiệu ứng vi mô (micro-interactions): phản hồi lực nhấn nút (`.btn-press`), nâng thẻ khi hover (`.hover-lift`), mở bung modal dialog tự nhiên (`.animate-modal-pop`), nền mờ kính mờ toàn màn hình (`backdrop-blur-sm`).
- **Tăng tốc phần cứng GPU:** 100% chuyển động chỉ can thiệp vào `transform` và `opacity`, không gây Layout Thrashing/Reflow, tôn trọng chuẩn trợ năng `@media (prefers-reduced-motion)`.

---

## 4. Công Nghệ Sử Dụng (Tech Stack)

### Backend API (`backend/`)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5
- **Database:** MongoDB Atlas qua Mongoose 9
- **Bảo mật & Xác thực:** JSON Web Tokens (JWT), bcryptjs
- **Kiểm thực dữ liệu:** Zod Schema Validation
- **Gửi Email:** Nodemailer (tích hợp SMTP Gmail với HTML templates)
- **Hỗ trợ phát triển:** Nodemon, Dotenv, CORS

### Frontend Web App (`web/`)
- **Core:** React 19, JavaScript (ES6+)
- **Build Tool:** Vite 8 (Hot Module Replacement siêu tốc, build production < 1s)
- **Định tuyến:** React Router v7 (bảo vệ route guard theo vai trò OWNER / MANAGER / EMPLOYEE)
- **Styling:** Tailwind CSS v4, Vanilla CSS animations tăng tốc GPU
- **Biểu tượng:** Lucide React
- **HTTP Client:** Axios (Interceptors tự động đính kèm Bearer token và xử lý lỗi tập trung)

### Mobile App (`mobile/`)
- **Framework:** React Native 0.88, Expo SDK 58
- **Điều hướng:** React Navigation v7 (Native Stack & Bottom Tabs)
- **Lưu trữ an toàn:** Expo SecureStore
- **Thông báo:** Expo Notifications

---

## 5. Cấu Trúc Thư Mục Monorepo

```text
ca-lam-online/
├── docs/                      # Tài liệu kiến trúc, đặc tả API và thiết kế UI/UX
│   ├── API.md                 # Đặc tả chi tiết các endpoint REST API
│   ├── DATABASE.md            # Sơ đồ quan hệ và cấu trúc Schema MongoDB
│   ├── DESIGN_DECISIONS.md    # Các quyết định thiết kế hệ thống
│   ├── FE.md                  # Hướng dẫn thiết kế giao diện Figma UI/UX
│   ├── REQUIREMENTS.md        # Yêu cầu nghiệp vụ chi tiết
│   ├── SCREENS.md             # Đặc tả các màn hình chức năng
│   └── TECH_STACK.md          # Chi tiết danh mục công nghệ và lệnh cài đặt
├── backend/                   # Ứng dụng Backend REST API
│   ├── src/
│   │   ├── config/            # Kết nối Database MongoDB Atlas
│   │   ├── controllers/       # Tiếp nhận và xử lý HTTP request
│   │   ├── middlewares/       # Middleware xác thực JWT, phân quyền role
│   │   ├── models/            # Schemas: User, Store, Shift, Member, Schedule
│   │   ├── routes/            # Khai báo các API routes
│   │   ├── services/          # Logic nghiệp vụ (emailService, scheduleService)
│   │   └── validators/        # Zod validation schemas
│   ├── .env.example           # File mẫu cấu hình biến môi trường
│   └── package.json
├── web/                       # Ứng dụng Frontend Web (Chủ quán & Quản lý & Nhân viên)
│   ├── src/
│   │   ├── components/        # Components tái sử dụng (schedules, layout, alerts)
│   │   ├── contexts/          # AuthContext quản lý trạng thái đăng nhập toàn cục
│   │   ├── layouts/           # WebLayout (Sidebar, Topbar, Mobile Drawer)
│   │   ├── pages/             # 9 màn hình chức năng chính
│   │   ├── routes/            # AppRoutes & PrivateRoute bảo vệ theo Role
│   │   ├── services/          # api.js gọi Backend qua Axios
│   │   ├── utils/             # Format tiền tệ VNĐ, xử lý ngày tuần ISO
│   │   ├── index.css          # Core Design System & GPU Animation Engine
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── mobile/                    # Ứng dụng Mobile App (Expo / React Native)
│   ├── src/
│   │   ├── navigation/        # Cấu hình chuyển màn hình
│   │   ├── screens/           # Các màn hình di động của nhân viên
│   │   ├── services/          # API client trên mobile
│   │   └── storage/           # SecureStore lưu trữ token
│   └── package.json
└── README.md                  # Tài liệu tổng quan dự án (tài liệu này)
```

---

## 6. Hướng Dẫn Cài Đặt & Vận Hành Hệ Thống

### 6.1. Yêu cầu môi trường
- **Node.js:** Phiên bản `>= 18.0.0` (khuyên dùng Node 20 LTS trở lên).
- **Trình quản lý gói:** `npm` (đi kèm Node.js).
- **Cơ sở dữ liệu:** Chuỗi kết nối MongoDB Atlas (hoặc MongoDB cài cục bộ).
- **Tài khoản gửi mail (Tùy chọn):** Tài khoản Gmail với App Password để gửi email thông báo tự động.

---

### 6.2. Cài đặt và Khởi chạy Backend API

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Cấu hình file môi trường `.env`:
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Cập nhật các thông số cần thiết:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ca_lam_online?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. Khởi chạy máy chủ phát triển (Development):
   ```bash
   npm run dev
   ```
   > Máy chủ Backend sẽ chạy tại: `http://localhost:5000`

---

### 6.3. Cài đặt và Khởi chạy Frontend Web

1. Mở một cửa sổ dòng lệnh mới và di chuyển vào thư mục web:
   ```bash
   cd web
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
   > Ứng dụng Web sẽ hoạt động tại: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

4. Kiểm tra đóng gói bản Production:
   ```bash
   npm run build
   ```

---

### 6.4. Khởi chạy Mobile App (React Native / Expo)

1. Mở cửa sổ dòng lệnh và di chuyển vào thư mục mobile:
   ```bash
   cd mobile
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy Expo development server:
   ```bash
   npx expo start
   ```
   > Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại iOS/Android hoặc bấm phím `a` (mở Android Emulator) / `w` (mở phiên bản web).

---

## 7. Tài Liệu Kỹ Thuật Chi Tiết Trong Thư Mục `docs/`

Để tìm hiểu sâu hơn về kiến trúc và thiết kế hệ thống, vui lòng tham khảo các tài liệu chuyên biệt:

- [REQUIREMENTS.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/REQUIREMENTS.md): Yêu cầu nghiệp vụ và chi tiết phân quyền người dùng.
- [DATABASE.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/DATABASE.md): Thiết kế cấu trúc cơ sở dữ liệu MongoDB và quan hệ các bảng.
- [API.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/API.md): Danh sách đầy đủ các endpoint REST API, định dạng request/response.
- [FE.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/FE.md): Hướng dẫn đặc tả thiết kế giao diện UI/UX cho Web & Mobile.
- [SCREENS.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/SCREENS.md): Mô tả chi tiết từng màn hình người dùng trong ứng dụng.
- [TECH_STACK.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/TECH_STACK.md): Bảng chi tiết các gói thư viện và lệnh cài đặt độc lập.
- [DESIGN_DECISIONS.md](file:///c:/Users/truon/OneDrive/Desktop/ca-lam-online/docs/DESIGN_DECISIONS.md): Các quyết định kiến trúc và ranh giới hệ thống monorepo.
