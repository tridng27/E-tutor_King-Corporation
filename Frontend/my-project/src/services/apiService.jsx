import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance without default Content-Type
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // This is critical for cookies
});

const apiService = {
  get: (url, config = {}) => apiClient.get(url, { ...config, withCredentials: true }),
  post: (url, data, config = {}) => apiClient.post(url, data, { ...config, withCredentials: true }),
  put: (url, data, config = {}) => apiClient.put(url, data, { ...config, withCredentials: true }),
  delete: (url, config = {}) => apiClient.delete(url, { ...config, withCredentials: true }),

getStudentPerformance: async (studentID) => {
  try {
    const response = await apiClient.get(`/students/${studentID}/performance`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu điểm số:", error);
    return null;
  }
}
};
export default apiService;
