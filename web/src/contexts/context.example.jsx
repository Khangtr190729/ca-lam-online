/**
 * @file context.example.jsx
 * @description File ví dụ minh họa cho thư mục contexts/ của ứng dụng Web.
 * 
 * VAI TRÒ & MỤC ĐÍCH:
 * - Quản lý trạng thái toàn cục (Global State) qua React Context API khi thực sự cần thiết.
 * - Ví dụ: AuthContext (lưu thông tin user hiện tại và token), ThemeContext,...
 * 
 * QUY ƯỚC:
 * - Đặt tên theo chuẩn PascalCase kết thúc bằng Context (ví dụ: AuthContext.jsx).
 */

import React from 'react';

// Placeholder React Context cho ứng dụng web
export const ExampleContext = React.createContext(null);
