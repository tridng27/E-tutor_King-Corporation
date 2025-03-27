import { useContext, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { useLocation } from 'react-router-dom';

function AuthDebug() {
  const { user, isAuthenticated, userRole } = useContext(GlobalContext);
  const location = useLocation();

  useEffect(() => {
    console.log('Auth Debug - Path:', location.pathname);
    console.log('Auth Debug - isAuthenticated:', isAuthenticated);
    console.log('Auth Debug - user:', user);
    console.log('Auth Debug - userRole:', userRole);
    
    // Check cookies
    console.log('Auth Debug - Cookies:', document.cookie);
  }, [location.pathname, isAuthenticated, user, userRole]);

  return null; // This component doesn't render anything
}

export default AuthDebug;
