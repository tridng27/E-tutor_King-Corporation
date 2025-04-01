import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../services/apiService";

// Create the context
export const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  // State for data
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // New state for tutor management
  const [currentTutor, setCurrentTutor] = useState(null);
  const [tutorClasses, setTutorClasses] = useState([]);

  // Fetch functions
  const fetchStudents = async () => {
    try {
      const response = await apiService.getAllStudents();
      setStudents(response);
      return response;
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiService.getAllTutors();
      setTutors(response);
      return response;
    } catch (error) {
      console.error("Error fetching tutors:", error);
      return [];
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get("/notifications");
      setNotifications(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await apiService.get("/documents");
      setDocuments(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };

  // New functions for tutor management
  const fetchTutorClasses = async (tutorId) => {
    try {
      const response = await apiService.getClassesByTutor(tutorId);
      setTutorClasses(response);
      return response;
    } catch (error) {
      console.error("Error fetching tutor classes:", error);
      return [];
    }
  };

  const assignTutorToClass = async (classId, tutorId) => {
    try {
      await apiService.assignTutorToClass(classId, tutorId);
      return true;
    } catch (error) {
      console.error("Error assigning tutor to class:", error);
      return false;
    }
  };

  const removeTutorFromClass = async (classId, tutorId) => {
    try {
      await apiService.removeTutorFromClass(classId, tutorId);
      return true;
    } catch (error) {
      console.error("Error removing tutor from class:", error);
      return false;
    }
  };

  // Provide the context value
  const contextValue = {
    students,
    tutors,
    notifications,
    documents,
    fetchStudents,
    fetchTutors,
    fetchNotifications,
    fetchDocuments,
    // New tutor management values
    currentTutor,
    setCurrentTutor,
    tutorClasses,
    fetchTutorClasses,
    assignTutorToClass,
    removeTutorFromClass
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useData = () => useContext(DataContext);
