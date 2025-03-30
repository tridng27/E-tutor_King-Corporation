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

  // Lấy danh sách lớp học
  getAllClasses: () => apiClient.get('/classes').then(res => res.data),
  
  // Lấy thông tin lớp học theo ID
  getClassById: (classId) => apiClient.get(`/classes/${classId}`),
  
  // Tạo lớp học mới
  createClass: (classData) => apiClient.post('/classes', classData),
  
  // Cập nhật thông tin lớp học
  updateClass: (classId, classData) => apiClient.put(`/classes/${classId}`, classData),
  
  // Xóa lớp học
  deleteClass: (classId) => apiClient.delete(`/classes/${classId}`),
  
  // Lấy danh sách học sinh
  getAllStudents: () => apiClient.get('/students').then(res => res.data),
  
  // Lấy thông tin học sinh theo ID
  getStudentById: (UserID) => apiClient.get(`/students/${UserID}`),
  
  // Tạo học sinh mới (chỉ dành cho Admin)
  createStudent: (studentData) => {
    // Validate dữ liệu trước khi gửi
    const requiredFields = ['Name', 'Email', 'Password', 'Birthdate', 'Gender'];
    const missingFields = requiredFields.filter(field => !studentData[field]);
    
    if (missingFields.length > 0) {
      return Promise.reject(new Error(`Thiếu trường bắt buộc: ${missingFields.join(', ')}`));
    }
    
    return apiClient.post('/students', studentData);
  },
  
  // Cập nhật thông tin học sinh (chỉ dành cho Admin)
  updateStudent: (UserID, studentData) => apiClient.put(`/students/${UserID}`, studentData),

  // Xóa học sinh (chỉ dành cho Admin)
  deleteStudent: (UserID) => apiClient.delete(`/students/${UserID}`).then(res => res.data),

  // Lấy thông tin điểm số và điểm danh của học sinh
  getStudentPerformance: (UserID) => apiClient.get(`/students/${UserID}/performance`),
  
};

export default apiService;
