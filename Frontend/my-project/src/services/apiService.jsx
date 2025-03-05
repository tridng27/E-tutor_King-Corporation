// src/services/apiService.jsx
import axios from 'axios';

// Sử dụng import.meta.env cho Vite; hãy đảm bảo trong file .env của bạn có biến: VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động gửi token nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Token lưu trong localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi (tùy chọn)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Định nghĩa các phương thức API theo nguyên tắc DRY
const apiService = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiService;
