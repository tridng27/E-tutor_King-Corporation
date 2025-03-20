import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
 // Make sure to install this package

export const GlobalContext = createContext(null);

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Check for token and user on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        // Decode token to check expiration and get role
        const decoded = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expired, log out user
          handleTokenExpiration();
        } else {
          // Valid token
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setUserRole(decoded.role || userData.Role);
          setIsAuthenticated(true);
          
          // Set authorization header for all future requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleTokenExpiration();
      }
    }
  }, []);

  // Handle token expiration
  const handleTokenExpiration = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  // Hàm đăng nhập
  const login = (userData, token) => {
    try {
      // Decode token to get role and expiration
      const decoded = jwtDecode(token);
      
      setUser(userData);
      setUserRole(decoded.role || userData.Role);
      setIsAuthenticated(true);
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      
      // Set authorization header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error processing login:", error);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Remove authorization header
    delete axios.defaults.headers.common["Authorization"];
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return userRole === requiredRole;
  };

  // Hàm lấy danh sách sinh viên - with auth header
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/students", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        handleTokenExpiration();
      }
    }
  };

  // Hàm lấy danh sách gia sư - with auth header
  const fetchTutors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/tutors", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTutors(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gia sư:", error);
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
      }
    }
  };

  // Hàm lấy danh sách thông báo - with auth header
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
      }
    }
  };

  // Hàm lấy danh sách tài liệu - with auth header
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu:", error);
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
      }
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        isAuthenticated,
        userRole,
        students,
        tutors,
        notifications,
        documents,
        login,
        logout,
        hasRole,
        fetchStudents,
        fetchTutors,
        fetchNotifications,
        fetchDocuments,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
