import { createContext, useState, useContext } from "react";
import apiService from "../services/apiService";
import { AuthContext } from './AuthContext';

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // Import setAuthError directly from AuthContext instead of GlobalContext
  const { setAuthError } = useContext(AuthContext);

  const fetchStudents = async () => {
    try {
      const response = await apiService.get("/students");
      setStudents(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view students");
      }
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiService.get("/tutors");
      setTutors(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view tutors");
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get("/notifications");
      setNotifications(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view notifications");
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.get("/documents");
      setDocuments(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Please log in to view documents");
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        students,
        tutors,
        notifications,
        documents,
        fetchStudents,
        fetchTutors,
        fetchNotifications,
        fetchDocuments
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => useContext(DataContext);
