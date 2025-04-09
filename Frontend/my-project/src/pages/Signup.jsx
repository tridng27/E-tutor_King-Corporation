import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService"; // Sử dụng apiService theo nguyên tắc DRY

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [requestedRole, setRequestedRole] = useState("Student"); // Default to Student
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Hàm kiểm tra mật khẩu
  const validatePassword = (password) => {
    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (!uppercaseRegex.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const response = await apiService.post("/auth/register", {
        email,
        password,
        name: name || email.split("@")[0], // Use provided name or fallback to email username
        requestedRole // Send the requested role to the backend
      });

      // Giả sử backend trả về một thông báo thành công khi đăng ký
      if (response.data) {
        setSuccess("Signup successful! Your account is pending admin approval. Redirecting to login...");
        setError("");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.data.message || "Signup failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setSuccess("");
    }
  };

  return (
      <div className="flex h-screen">
      {/* Left Section - Login Form */}
      <div className="hidden md:flex w-1/2 justify-center items-center p-6 bg-white">
        <img src="/illustration.png" className="" alt="User" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-8 bg-white">
        <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
        <p className="text-gray-500 mb-6">See your growth and get consulting support!</p>

        <form onSubmit={handleSignup}> 
          <input 
            type="email" 
            placeholder="Mail@website.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border mb-3 text-gray-700 rounded-3xl" 
            required
          />

          <input 
            type="text" 
            placeholder="Your Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border mb-3 text-gray-700 rounded-3xl" 
            required
          />

          <div className="w-full p-3 border mb-3 text-gray-700 rounded-3xl flex-row flex">
            <label className="block text-gray-500 mb-1">I want to join as:</label>
            <div className="flex gap-4 px-2">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="role" 
                  value="Student" 
                  checked={requestedRole === "Student"}
                  onChange={() => setRequestedRole("Student")}
                  className="mr-2" 
                />
                Student
              </label>
              <label className="flex items-center px-2">
                <input 
                  type="radio" 
                  name="role" 
                  value="Tutor" 
                  checked={requestedRole === "Tutor"}
                  onChange={() => setRequestedRole("Tutor")}
                  className="mr-2" 
                />
                Tutor
              </label>
            </div>
          </div>

          <input 
            type="password" 
            placeholder="Password"               
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border mb-3 text-gray-700 rounded-3xl" 
            required
          />

          <input 
            type="password" 
            placeholder="Confirm Password"               
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-3xl mb-3 text-gray-700" 
            required
          />
          
          <p className="text-xxs text-gray-600 mt-1">
              Password must include: <br />
              - At least 6 characters<br />
              - One uppercase letter (A-Z)<br />
              - One special character (!@#$%^&*)
          </p>

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-gray-500">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="text-blue-600">Forget password?</a>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 text-lg font-bold rounded-3xl"
          >
            Sign Up 
          </button>
        </form>
        
        <p className="text-gray-500 text-center mt-4">
          Already have an Account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
