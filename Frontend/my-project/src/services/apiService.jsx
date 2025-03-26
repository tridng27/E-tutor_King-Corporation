import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance without default Content-Type
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // This is critical for cookies
});

const apiService = {
  get: (url, config = {}) => 
    apiClient.get(url, { ...config, withCredentials: true }),
  
  post: (url, data, config = {}) => {
    // Check if we're sending FormData
    if (data instanceof FormData) {
      // For FormData, don't set Content-Type - axios will set it correctly with boundary
      return apiClient.post(url, data, { 
        ...config, 
        withCredentials: true,
        headers: {
          ...config.headers,
          // Remove Content-Type so browser can set it with proper boundary
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    // For regular JSON data
    return apiClient.post(url, data, { 
      ...config, 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  },
  
  put: (url, data, config = {}) => {
    // Similar logic for put requests
    if (data instanceof FormData) {
      return apiClient.put(url, data, { 
        ...config, 
        withCredentials: true,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    return apiClient.put(url, data, { 
      ...config, 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
  },
  
  delete: (url, config = {}) => 
    apiClient.delete(url, { 
      ...config, 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    }),

  // API để lấy điểm số và điểm danh của học sinh
  getStudentScores: async (studentId) => {
    try {
      const response = await apiClient.get(`/subject/scores/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy điểm số và điểm danh:", error);
      return [];
    }
  }
};

export default apiService;
