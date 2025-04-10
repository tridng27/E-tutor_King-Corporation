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
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If no token exists, user is not authenticated
        if (!token) {
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          return;
        }
        
        // Use the token to make the auth check request
        const response = await apiService.get("/auth/me");
        const userData = response.data.user;
        
        setUser(userData);
        setUserRole(userData.Role);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        // If request fails, clear auth state
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token"); // Also remove the token if auth check fails
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = (userData, token) => {
    try {
      // Store the token in localStorage
      if (token) {
        localStorage.setItem('token', token);
      }
      
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
      // Clear auth state and remove token
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("token"); // Remove token from localStorage
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
