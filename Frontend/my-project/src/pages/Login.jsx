import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../services/apiService";
import { GlobalContext } from "../context/GlobalContext";

function Login() {
  const { login, isAuthenticated, user } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const redirectAttempted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Check if already authenticated
  useEffect(() => {
    console.log("Login effect - Auth state:", isAuthenticated);
    console.log("Login effect - User:", user);
    console.log("Login effect - Redirect attempted:", redirectAttempted.current);
    
    // Only redirect if authenticated AND not already redirected
    if (isAuthenticated && user && !redirectAttempted.current) {
      console.log("User is authenticated, preparing to redirect");
      redirectAttempted.current = true; // Mark that we've attempted a redirect
      
      // Determine where to redirect based on role
      const redirectPath = user.Role === 'Admin' 
        ? "/admin/dashboard" 
        : user.Role === 'Tutor' 
          ? "/tutor/dashboard" 
          : "/student/dashboard";
      
      console.log("Redirecting to:", redirectPath);
      
      // Use setTimeout to ensure this happens after render
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, user, navigate]);

  // Reset redirect flag when component unmounts
  useEffect(() => {
    return () => {
      console.log("Login component unmounting, resetting redirect flag");
      redirectAttempted.current = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt with email:", email);
    redirectAttempted.current = false; // Reset redirect flag on new login attempt

    try {
      const response = await apiService.post("/auth/login", { email, password });
      console.log("Login response:", response.data);
      
      const { user } = response.data;

      if (user) {
        // Call the login function from context
        login(user);
        console.log("Login function called with user");
        
        // Also store the token in localStorage as a fallback
        // You'll need to modify your backend to return the token as well
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log("Token stored in localStorage as fallback");
        }
        
        setSuccess("Login successful, redirecting...");
        setError("");
        
        // The redirect will be handled by the useEffect above
      } else {
        console.error("Invalid response format:", response.data);
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setSuccess("");
    }
}

  return (
    <div className="flex h-screen">

      {/* Left Section - Illustration */}
      <div className="w-1/2  flex flex-col justify-center items-center relative px-6">
        <img src="/illustration.png" className="" alt="User" />
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 flex flex-col justify-center px-16 bg-white">
        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-gray-500 mb-6">See your growth and get consulting support!</p>

        <button className="w-full flex items-center justify-center gap-2 py-3 border rounded-3xl text-gray-600 shadow-md mb-4">
          <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" className="w-5 h-5" alt="Google logo" />
          Sign in with Google
        </button>
        
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-400 text-sm">or Sign up with Email</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {(error || success) && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-3 text-center text-base font-medium duration-300 h-20 flex items-center justify-center">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      )}
        
        <form onSubmit={handleLogin}> 
          <input 
            type="email" 
            placeholder="Mail@website.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border mb-3 text-gray-700 rounded-3xl" 
            required
          />

          <input 
            type="password" 
            placeholder="Password"               
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 border mb-3 text-gray-700 rounded-3xl" 
            required
          />

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-gray-500">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="text-blue-600">Forget password?</a>
          </div>

            <button
                type="submit"
                disabled={redirectAttempted.current}
                className={`w-full ${redirectAttempted.current ? 'bg-blue-200' : ' hover:bg-blue-500'} bg-blue-600 text-white py-3 text-lg font-bold rounded-3xl`}
              >
                {redirectAttempted.current ? 'Redirecting...' : 'Login →'}
            </button>
        </form>
        

        <p className="text-gray-500 text-center mt-4">
          Not registered yet? <a href="/signup" className="text-blue-600">Create an Account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
