import { useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { GlobalContext } from "../context/GlobalContext";
import apiService from "../services/apiService";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useContext(GlobalContext);
  const [authChecked, setAuthChecked] = useState(false);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    user: null,
    error: null
  });
  const location = useLocation();
 
  console.log("ProtectedRoute render at:", location.pathname);
  console.log("ProtectedRoute context state:", { isAuthenticated, user, allowedRoles });
 
  useEffect(() => {
    // Only check if we haven't already checked
    if (!authChecked) {
      console.log("ProtectedRoute: Checking auth status directly with API");
     
      const checkAuth = async () => {
        try {
          const response = await apiService.get("/auth/me");
          console.log("ProtectedRoute: Auth check response:", response.data);
         
          const userData = response.data.user;
          setAuthStatus({
            isAuthenticated: true,
            user: userData,
            error: null
          });
        } catch (error) {
          console.error("ProtectedRoute: Auth check failed:", error.message);
          console.error("ProtectedRoute: Error details:", error.response?.data);
         
          setAuthStatus({
            isAuthenticated: false,
            user: null,
            error: error.message
          });
        } finally {
          setAuthChecked(true);
        }
      };
     
      checkAuth();
    }
  }, [authChecked]); // Remove location.pathname from dependencies
 
  // If we're still checking, show a loading indicator
  if (!authChecked) {
    console.log("ProtectedRoute: Still checking authentication...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Verifying your access...</p>
        </div>
      </div>
    );
  }
 
  // If not authenticated, redirect to login
  if (!authStatus.isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
 
  // If roles are specified and user doesn't have the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(authStatus.user.Role)) {
    console.log(`ProtectedRoute: User role ${authStatus.user.Role} not allowed, required roles:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }
 
  // If all checks pass, render the children
  console.log("ProtectedRoute: Access granted to", location.pathname);
  return children;
}

export default ProtectedRoute;
