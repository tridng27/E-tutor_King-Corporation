import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const GlobalContext = createContext(null);

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Lấy user từ localStorage nếu có
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Hàm đăng nhập
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Hàm lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
    }
  };

  // Hàm lấy danh sách gia sư
  const fetchTutors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tutors");
      setTutors(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gia sư:", error);
    }
  };

  // Hàm lấy danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  // Hàm lấy danh sách tài liệu
  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu:", error);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        students,
        tutors,
        notifications,
        documents,
        login,
        logout,
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
