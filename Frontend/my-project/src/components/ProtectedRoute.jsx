import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalContext";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useContext(GlobalContext);
  
  // Get user role from token
  const getUserRole = () => {
    if (user && user.Role) {
      return user.Role;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  };
  
  const userRole = getUserRole();
  
  // Check if user is authenticated
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If all checks pass, render the protected component
  return children;
}

export default ProtectedRoute;
