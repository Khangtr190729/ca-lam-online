import axios from 'axios';
import { Platform } from 'react-native';
import tokenStorage from '../storage/tokenStorage';

// Default backend API URL depending on platform
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

let currentBaseUrl = DEFAULT_API_URL;

const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically
export const setApiBaseUrl = (newUrl) => {
  if (!newUrl) return;
  currentBaseUrl = newUrl;
  api.defaults.baseURL = newUrl;
  tokenStorage.saveCustomApiUrl(newUrl);
};

export const getApiBaseUrl = () => currentBaseUrl;

// Request interceptor: attach token & read custom URL
api.interceptors.request.use(
  async (config) => {
    const customUrl = await tokenStorage.getCustomApiUrl();
    if (customUrl && config.baseURL !== customUrl) {
      config.baseURL = customUrl;
    }
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard unwrap & friendly error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
    return Promise.reject(new Error(message));
  }
);

// --- AUTH APIS ---
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetOtp: (email, otp) => api.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),
};

// --- STORE APIS ---
export const storeApi = {
  getMyStore: () => api.get('/stores/my-store'),
  joinByCode: (inviteCode) => api.post('/stores/join-by-code', { inviteCode }),
};

// --- SCHEDULE APIS ---
export const scheduleApi = {
  getMySchedule: (week, year) => api.get(`/schedules/my-schedule?week=${week}&year=${year}`),
};

// --- USER APIS ---
export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

export default api;
