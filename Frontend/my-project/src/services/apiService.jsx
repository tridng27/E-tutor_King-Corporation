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
  
  // File upload with multipart/form-data
  uploadFile: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      withCredentials: true,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Student performance
  getStudentPerformance: async (studentID) => {
    try {
      const response = await apiClient.get(`/students/${studentID}/performance`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu điểm số:", error);
      return null;
    }
  },

  // Resource management
  getResources: async () => {
    try {
      const response = await apiClient.get('/resources');
      return response.data;
    } catch (error) {
      console.error("Error fetching resources:", error);
      throw error;
    }
  },

  getResourceById: async (id) => {
    try {
      const response = await apiClient.get(`/resources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error);
      throw error;
    }
  },

  createResource: async (formData) => {
    try {
      const data = new FormData();
      // Changed from 'name' to 'title' to match backend expectations
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      if (formData.pdfFile) {
        // Changed from 'file' to 'pdfFile' to match multer field name in backend
        data.append('pdfFile', formData.pdfFile);
      }
      
      const response = await apiService.uploadFile('/resources', data);
      return response.data;
    } catch (error) {
      console.error("Error creating resource:", error);
      throw error;
    }
  },

  updateResource: async (id, formData) => {
    try {
      const data = new FormData();
      // Changed from 'name' to 'title' to match backend expectations
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      if (formData.pdfFile) {
        // Changed from 'file' to 'pdfFile' to match multer field name in backend
        data.append('pdfFile', formData.pdfFile);
      }
      
      const response = await apiService.uploadFile(`/resources/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating resource ${id}:`, error);
      throw error;
    }
  },

  deleteResource: async (id) => {
    try {
      const response = await apiClient.delete(`/resources/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting resource ${id}:`, error);
      throw error;
    }
  },

  downloadResource: async (id, filename) => {
    try {
      const response = await apiClient.get(`/resources/${id}/download`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename || 'resource'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error(`Error downloading resource ${id}:`, error);
      throw error;
    }
  },

  // Admin user management
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  getPendingUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users/pending');
      return response.data;
    } catch (error) {
      console.error("Error fetching pending users:", error);
      throw error;
    }
  },

  assignUserRole: async (userId, role) => {
    try {
      const response = await apiClient.post('/admin/users/assign-role', { userId, role });
      return response.data;
    } catch (error) {
      console.error("Error assigning user role:", error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/admin/delete/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
  getStudentsByClass: async (classId) => {
    try {
      const response = await apiClient.get(`/class-students/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error("Error fetching students by class:", error);
      throw error;
    }
  },  
  assignStudentToClass: async (classId, studentId) => {
    try {
        const response = await apiClient.post(`/class-students/${classId}/students`, {
            StudentID: String(studentId) 
        });
        return response.data;
    } catch (error) {
        console.error("Error assigning student:", error);
        throw error;
    }
  },
  removeStudentFromClass: async (classId, studentId) => {
    try {
      const response = await apiClient.delete(`/class-students/${classId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing student from class:", error);
      throw error;
    }
  },
  getStudentsNotInClass: async (classId) => {
    try {
        const response = await apiClient.get(`/class-students/${classId}/students/not-in-class`);
        return response.data;
    } catch (error) {
        console.error("Error fetching students not in class:", error);
        throw error;
    }
  }
};

export default apiService;
