import { createContext, useState, useEffect, useContext } from "react";
import apiService from "../services/apiService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiService.get("/auth/me");
        const userData = response.data.user;
        
        setUser(userData);
        setUserRole(userData.Role);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = (userData) => {
    try {
      setUser(userData);
      setUserRole(userData.Role);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
      setAuthError(null);
    } catch (error) {
      setAuthError("Failed to process login");
    }
  };

  const logout = async () => {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout API call:", error);
    } finally {
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
    }
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.Role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.Role);
    }
    
    return user.Role === requiredRole;
  };

  const getTutorId = async () => {
    if (!user || user.Role !== 'Tutor') return null;
    
    try {
      if (user.TutorID) return user.TutorID;
      
      const response = await apiService.get("/tutors/me");
      
      const updatedUser = { ...user, TutorID: response.data.TutorID };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      return response.data.TutorID;
    } catch (error) {
      console.error("Error getting TutorID:", error);
      return null;
    }
  };

  const testAuth = async () => {
    try {
      const response = await apiService.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        userRole,
        authError,
        login,
        logout,
        hasRole,
        getTutorId,
        testAuth,
        setAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
