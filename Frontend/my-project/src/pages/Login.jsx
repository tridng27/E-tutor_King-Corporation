import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { GlobalContext } from "../context/GlobalContext";

function Login() {
  const { login } = useContext(GlobalContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // In your Login.jsx file, update the handleLogin function
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await apiService.post("/auth/login", { email, password });
    const { user, token } = response.data;

    if (user && token) {
      login(user, token);
      setSuccess("Login successful, redirecting...");
      setError("");
      
      // Redirect based on user role
      setTimeout(() => {
        if (user.Role === 'Admin') {
          navigate("/admin/dashboard");
        } else if (user.Role === 'Tutor') {
          navigate("/tutor/dashboard");
        } else if (user.Role === 'Student') {
          navigate("/student/dashboard");
        } else {
          navigate("/"); // Default fallback
        }
      }, 2000);
    } else {
      setError("Invalid email or password");
    }
  } catch (err) {
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
            className="w-full bg-[#cbfff3] text-[#252B42] py-2 rounded-xl hover:bg-[#b3ffed] transition"
          >
            Sign In →
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
