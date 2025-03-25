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
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Illustration */}
      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="max-w-xl">
          <img src="/illustration.png" alt="Illustration" className="max-w-full h-auto rounded-xl" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16">
        <h1 className="text-3xl font-semibold mb-6">Sign in to your account</h1>

        {/* Debug info */}
        <div className="w-full max-w-sm mb-4 p-3 bg-yellow-50 rounded-md text-xs">
          <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? user.Name : 'None'}</p>
          <p><strong>Role:</strong> {user ? user.Role : 'None'}</p>
          <p><strong>Redirect attempted:</strong> {redirectAttempted.current ? 'Yes' : 'No'}</p>
          <p><strong>Current path:</strong> {location.pathname}</p>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <form className="w-full max-w-sm" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium py-1">Email</label>
            <input
              type="email"
              placeholder="Username or email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#cbfff3]"
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-medium py-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#cbfff3]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={redirectAttempted.current}
            className={`w-full ${redirectAttempted.current ? 'bg-gray-300' : 'bg-[#cbfff3] hover:bg-[#b3ffed]'} text-[#252B42] py-2 rounded-xl transition`}
          >
            {redirectAttempted.current ? 'Redirecting...' : 'Sign In →'}
          </button>
        </form>

        <p className="mt-4 text-sm">
          You don't have an account?{" "}
          <a href="/signup" className="text-orange-500 hover:underline">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
