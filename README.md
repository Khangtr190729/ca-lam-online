# Ca Làm Online

Ca Làm Online là hệ thống quản lý và xếp ca làm việc trực tuyến cá nhân, được thiết kế theo kiến trúc monorepo phân tách rõ ràng giữa ba ứng dụng độc lập: Web, Mobile và Backend.

---

## 1. Mục Đích & Đối Tượng Sử Dụng

Hệ thống hỗ trợ phân bổ, quản lý lịch làm việc và theo dõi ca làm việc cho ba nhóm vai trò người dùng chính:

- **ADMIN:** Quản trị toàn bộ hệ thống, thiết lập quyền hạn và danh mục cấp cao.
- **MANAGER:** Quản lý danh sách nhân sự, phân chia và điều phối ca làm việc trong phạm vi phân quyền.
- **EMPLOYEE:** Sử dụng ứng dụng di động để theo dõi lịch làm việc cá nhân và thực hiện các tác vụ liên quan đến ca làm.

---

## 2. Tổng Quan Các Ứng Dụng

| Ứng dụng | Nền tảng & Công nghệ chính | Mục đích sử dụng |
|---|---|---|
| **Web** (`web/`) | React.js, Vite, JavaScript, Tailwind CSS, Lucide React, FullCalendar, React Router | Giao diện quản trị trên trình duyệt dành cho vai trò **ADMIN** và **MANAGER**. |
| **Mobile** (`mobile/`) | React Native, Expo, React Navigation, Expo SecureStore | Ứng dụng di động tiện lợi dành riêng cho vai trò **EMPLOYEE**. |
| **Backend** (`backend/`) | Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, bcrypt, Zod | RESTful API cung cấp logic xử lý trung tâm, xác thực/phân quyền và lưu trữ dữ liệu. |

---

## 3. Danh Mục Công Nghệ Lựa Chọn

- **Frontend Web:** React.js, Vite, JavaScript, React Router, Tailwind CSS, Lucide React, FullCalendar, Axios.
- **Mobile:** React Native, Expo, React Navigation, Expo SecureStore, Axios.
- **Backend API:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt, Zod.

---

## 4. Cấu Trúc Thư Mục Repository

```text
ca-lam-online/
├── docs/                      # Tài liệu kiến trúc, yêu cầu và kế hoạch kiểm thử
│   ├── REQUIREMENTS.md        # Yêu cầu hệ thống và phạm vi chức năng
│   ├── DESIGN_DECISIONS.md    # Quyết định thiết kế và ranh giới kiến trúc
│   └── TEST_PLAN.md           # Kế hoạch kiểm thử dự kiến cho các giai đoạn sau
├── web/                       # Ứng dụng Web (ADMIN & MANAGER)
│   └── src/
│       ├── components/        # UI components tái sử dụng
│       ├── pages/             # Trang giao diện chính
│       ├── layouts/           # Bố cục giao diện chung (shell/layout)
│       ├── routes/            # Cấu hình định tuyến và route guards
│       ├── services/          # Tầng giao tiếp API qua Axios
│       └── contexts/          # State quản lý toàn cục qua React Context
├── mobile/                    # Ứng dụng Mobile (EMPLOYEE)
│   └── src/
│       ├── components/        # Mobile UI components tái sử dụng
│       ├── screens/           # Các màn hình chức năng của nhân viên
│       ├── navigation/        # Cấu hình React Navigation
│       ├── services/          # Tầng giao tiếp API qua Axios
│       └── storage/           # Quản lý lưu trữ bảo mật (Expo SecureStore)
├── backend/                   # Ứng dụng Backend REST API
│   └── src/
│       ├── routes/            # Khai báo endpoint REST API
│       ├── controllers/       # Tiếp nhận và điều phối HTTP request/response
│       ├── services/          # Tầng xử lý nghiệp vụ chính (business logic)
│       ├── models/            # Mô hình dữ liệu Mongoose / MongoDB
│       ├── middlewares/       # Middleware xác thực, phân quyền, xử lý lỗi
│       ├── validators/        # Schema xác thực dữ liệu đầu vào với Zod
│       └── config/            # Cấu hình hệ thống và kết nối database
└── README.md                  # Tài liệu giới thiệu tổng quan dự án
```

---

## 5. Trạng Thái Dự Án & Hướng Dẫn Vận Hành

> **Lưu ý quan trọng:** Dự án hiện đang ở **Phase 0 — Thiết lập Kiến trúc & Cấu trúc Thư mục**. 
> Trong giai đoạn này, mã nguồn tính năng, các gói phụ thuộc (dependencies) và kịch bản khởi chạy chưa được cài đặt. Hướng dẫn cài đặt chi tiết và các lệnh vận hành từng ứng dụng sẽ được bổ sung đầy đủ trong các giai đoạn triển khai kế tiếp.
