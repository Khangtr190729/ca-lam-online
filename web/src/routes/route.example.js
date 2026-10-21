/**
 * @file route.example.js
 * @description File ví dụ minh họa cho thư mục routes/ của ứng dụng Web.
 * 
 * VAI TRÒ & MỤC ĐÍCH:
 * - Định nghĩa danh sách các tuyến đường (routes) của ứng dụng bằng React Router.
 * - Chứa các cơ chế bảo vệ tuyến đường (Route Guards/Protected Routes) để kiểm tra đăng nhập
 *   và phân quyền theo vai trò (ADMIN / MANAGER).
 * 
 * QUY ƯỚC:
 * - Thường cấu hình tập trung trong AppRoutes.jsx hoặc các file route theo phân hệ.
 */

// Placeholder định nghĩa route cho ứng dụng web
export const routeExample = {
  path: '/example',
  roles: ['ADMIN', 'MANAGER'],
};
