import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WebLayout from '../layouts/WebLayout';
import ScheduleManagementPage from '../pages/ScheduleManagementPage';
import EmployeeManagementPage from '../pages/EmployeeManagementPage';
import StoreManagementPage from '../pages/StoreManagementPage';
import ShiftManagementPage from '../pages/ShiftManagementPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MobileAppView from '../pages/MobileAppView';

// Protected Route Guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, roleInStore, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center text-sm font-semibold text-slate-500">
        Đang tải dữ liệu Ca Làm Online...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && roleInStore !== 'ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/schedules" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#EA701B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Đang khởi động Ca Làm Online...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          user ? (
            user.role === 'EMPLOYEE' ? (
              <Navigate to="/my-schedule" replace />
            ) : (
              <Navigate to="/schedules" replace />
            )
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            user.role === 'EMPLOYEE' ? (
              <Navigate to="/my-schedule" replace />
            ) : (
              <Navigate to="/schedules" replace />
            )
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Employee Mobile-first Experience */}
      <Route
        path="/my-schedule"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-[#FFF7F0]">
              <MobileAppView />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Main Web App Shell for Admin & Manager */}
      <Route
        element={
          <ProtectedRoute>
            <WebLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/schedules" element={<ScheduleManagementPage />} />
        <Route path="/employees" element={<EmployeeManagementPage />} />
        <Route path="/shifts" element={<ShiftManagementPage />} />
        <Route
          path="/store-management"
          element={
            <ProtectedRoute adminOnly>
              <StoreManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback Root */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'EMPLOYEE' ? (
              <Navigate to="/my-schedule" replace />
            ) : (
              <Navigate to="/schedules" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
