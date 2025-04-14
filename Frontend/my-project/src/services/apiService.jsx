import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance without default Content-Type
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // This is critical for cookies
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const apiService = {
  get: (url, config = {}) => apiClient.get(url, { ...config, withCredentials: true }),
  post: (url, data, config = {}) => apiClient.post(url, data, { ...config, withCredentials: true }),
  put: (url, data, config = {}) => apiClient.put(url, data, { ...config, withCredentials: true }),
  delete: (url, config = {}) => apiClient.delete(url, { ...config, withCredentials: true }),

  // Get all classes
  getAllClasses: () => apiClient.get('/classes').then(res => res.data),
  
  // Get class by ID
  getClassById: (classId) => apiClient.get(`/classes/${classId}`),
  
  // Create a new class
  createClass: (classData) => apiClient.post('/classes', classData),
  
  // Update  class information
  updateClass: (classId, classData) => apiClient.put(`/classes/${classId}`, classData),
  
  // Delete class
  deleteClass: (classId) => apiClient.delete(`/classes/${classId}`),
  
  // Get all students
  getAllStudents: () => apiClient.get('/students').then(res => res.data),
  
  // Get student by ID
  getStudentById: (UserID) => apiClient.get(`/students/${UserID}`),
  
  // Create a new student (Admin only)
  createStudent: (studentData) => {
    // Validate data before sending
    const requiredFields = ['Name', 'Email', 'Password', 'Birthdate', 'Gender'];
    const missingFields = requiredFields.filter(field => !studentData[field]);
    
    if (missingFields.length > 0) {
      return Promise.reject(new Error(`Thiếu trường bắt buộc: ${missingFields.join(', ')}`));
    }
    
    return apiClient.post('/students', studentData);
  },
  
  // Update student information (Admin only)
  updateStudent: (UserID, studentData) => apiClient.put(`/students/${UserID}`, studentData),

  // Detele student (Admin only)
  deleteStudent: (UserID) => apiClient.delete(`/students/${UserID}`).then(res => res.data),

  // // Get student performance by student ID
  // getStudentPerformance: (UserID) => apiClient.get(`/students/${UserID}/performance`),
  
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
      const response = await apiClient.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },  

  // Timetable management
  getAllTimetables: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(`/timetables?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching timetables:", error);
      throw error;
    }
  },

  getTimetableById: async (id) => {
    try {
      const response = await apiClient.get(`/timetables/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetable ${id}:`, error);
      throw error;
    }
  },

  createTimetable: async (timetableData) => {
    try {
      const response = await apiClient.post('/timetables', timetableData);
      return response.data;
    } catch (error) {
      console.error("Error creating timetable:", error);
      throw error;
    }
  },

  updateTimetable: async (id, timetableData) => {
    try {
      const response = await apiClient.put(`/timetables/${id}`, timetableData);
      return response.data;
    } catch (error) {
      console.error(`Error updating timetable ${id}:`, error);
      throw error;
    }
  },

  deleteTimetable: async (id) => {
    try {
      const response = await apiClient.delete(`/timetables/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting timetable ${id}:`, error);
      throw error;
    }
  },

  // User search for direct messaging
  searchUsers: async (query) => {
    try {
      const response = await apiClient.get(`/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  },

  // Direct messaging methods
  sendDirectMessage: async (receiverID, content) => {
    try {
      const response = await apiClient.post('/messages/send', { receiverID, content });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  getConversation: async (userID) => {
    try {
      const response = await apiClient.get(`/messages/conversation/${userID}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  },

  getUserConversations: async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.error("Error fetching user conversations:", error);
      throw error;
    }
  },

  markMessagesAsRead: async (messageIDs) => {
    try {
      const response = await apiClient.put('/messages/read', { messageIDs });
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
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
  
  assignStudentToClass: async (classId, userId) => {
    try {
      console.log(`Attempting to assign user ${userId} to class ${classId}`);
      
      const url = `/class-students/${classId}/students`;
      console.log(`Using URL: ${url}`);
      console.log(`With payload:`, { UserID: Number(userId) });
      
      const response = await apiClient.post(url, {
        UserID: Number(userId)  // Changed from StudentID to UserID
      });
      
      console.log("Success response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error assigning student:", error);
      console.error("Error details:", error.response?.data || {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        requestData: error.config?.data
      });
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
  },

  // Tutor management
  getAllTutors: async () => {
    try {
      const response = await apiClient.get('/admin/tutors');
      return response.data;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  },

  getTutorById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/tutors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tutor ${id}:`, error);
      throw error;
    }
  },

  updateTutor: async (id, tutorData) => {
    try {
      const response = await apiClient.put(`/admin/tutors/${id}`, tutorData);
      return response.data;
    } catch (error) {
      console.error(`Error updating tutor ${id}:`, error);
      throw error;
    }
  },

  deleteTutor: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/tutors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tutor ${id}:`, error);
      throw error;
    }
  },

  // Class-tutor assignment
  getClassesWithoutTutor: async () => {
    try {
      const response = await apiClient.get('/admin/classes/without-tutor');
      return response.data;
    } catch (error) {
      console.error('Error fetching classes without tutor:', error);
      throw error;
    }
  },

  getClassesByTutor: async (tutorId) => {
    try {
      const response = await apiClient.get(`/admin/tutors/${tutorId}/classes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching classes for tutor ${tutorId}:`, error);
      throw error;
    }
  },

  assignTutorToClass: async (classId, tutorId) => {
    try {
      const response = await apiClient.post(`/admin/classes/${classId}/tutors/${tutorId}`);
      return response.data;
    } catch (error) {
      console.error(`Error assigning tutor ${tutorId} to class ${classId}:`, error);
      throw error;
    }
  },

  removeTutorFromClass: async (classId, tutorId) => {
    try {
      const response = await apiClient.delete(`/admin/classes/${classId}/tutors/${tutorId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing tutor ${tutorId} from class ${classId}:`, error);
      throw error;
    }
  },

  // Tutor dashboard methods
  getTutorClasses: async () => {
    try {
      const response = await apiClient.get('/tutor/classes');
      return response.data;
    } catch (error) {
      console.error("Error fetching tutor classes:", error);
      throw error;
    }
  },

  getTutorClassStudents: async (classId) => {
    try {
      const response = await apiClient.get(`/tutor/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for class ${classId}:`, error);
      throw error;
    }
  },

  getStudentSubjects: async (studentId) => {
    try {
      const response = await apiClient.get(`/studentsubjects/students/${studentId}/subjects`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for student ${studentId}:`, error);
      throw error;
    }
  },

  updateStudentSubject: async (studentSubjectId, data) => {
    try {
      const response = await apiClient.put(`/studentsubjects/${studentSubjectId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating student subject ${studentSubjectId}:`, error);
      throw error;
    }
  },

  // Subject management - NEW METHODS
  getAllSubjects: async () => {
    try {
      const response = await apiClient.get('/subjects');
      return response.data;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }
  },

  getSubjectById: async (id) => {
    try {
      const response = await apiClient.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subject ${id}:`, error);
      throw error;
    }
  },

  createSubject: async (subjectData) => {
    try {
      const response = await apiClient.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error("Error creating subject:", error);
      throw error;
    }
  },

  updateSubject: async (id, subjectData) => {
    try {
      const response = await apiClient.put(`/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating subject ${id}:`, error);
      throw error;
    }
  },

  deleteSubject: async (id) => {
    try {
      const response = await apiClient.delete(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subject ${id}:`, error);
      throw error;
    }
  },

  // Student-Subject management - NEW METHODS
  createStudentSubject: async (data) => {
    try {
      const response = await apiClient.post('/studentsubjects', data);
      return response.data;
    } catch (error) {
      console.error("Error creating student subject:", error);
      throw error;
    }
  },

  getAllStudentSubjects: async () => {
    try {
      const response = await apiClient.get('/studentsubjects');
      return response.data;
    } catch (error) {
      console.error("Error fetching all student subjects:", error);
      throw error;
    }
  },

  getStudentSubjectById: async (id) => {
    try {
      const response = await apiClient.get(`/studentsubjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student subject ${id}:`, error);
      throw error;
    }
  },

  deleteStudentSubject: async (id) => {
    try {
      const response = await apiClient.delete(`/studentsubjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting student subject ${id}:`, error);
      throw error;
    }
  },

  getSubjectsByClass: async (classId) => {
    try {
      const response = await apiClient.get(`/studentsubjects/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subjects for class ${classId}:`, error);
      throw error;
    }
  }
};

export default apiService;
