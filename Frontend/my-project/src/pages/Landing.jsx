import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import { jwtDecode } from "jwt-decode";
import Sidebar from "../components/sidebar";

function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useContext(GlobalContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication status and user role on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || (user && user.Role));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, [user]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    if (userRole === 'Admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'Tutor') {
      navigate('/tutor/dashboard');
    } else if (userRole === 'Student') {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="relative">
      {/* Add Sidebar if user is authenticated */}
      {isAuthenticated && <Sidebar />}

      <div className={isAuthenticated ? "ml-16 transition-all duration-300" : ""}>
        {/* Header */}
        <header className=" py-4 px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">LearnXpert</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <a href="#" className="hover:text-gray-900">Home</a>
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
            <a href="#" className="hover:text-gray-900">Blog</a>
            
            {/* Show Dashboard link if authenticated */}
            {isAuthenticated && (
              <a href="#" className="hover:text-gray-900" onClick={handleDashboardClick}>
                Dashboard
              </a>
            )}
          </nav>
          
          {/* Conditional rendering of login/logout button */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {userRole || 'User'}
              </span>
              <button 
                className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-100"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-full shadow-md hover:bg-gray-100" 
              onClick={handleLoginClick}
            >
              Login
            </button>
          )}
        </header>

        {/* Hero Section - Customize based on authentication status */}
        <section className="flex flex-col md:flex-row items-center justify-between px-24 py-20">
          {/* Nội dung bên trái */}
          <div className="w-full md:w-1/2">
            <h1 className="text-5xl font-bold text-gray-900">
              {isAuthenticated ? (
                <>
                  {userRole === 'Admin' && "Welcome to Admin Portal"}
                  {userRole === 'Tutor' && "Welcome to Tutor Dashboard"}
                  {userRole === 'Student' && "Welcome to Student Learning"}
                  {!userRole && "Welcome Back to LearnXpert"}
                </>
              ) : (
                <>Unlock Your Learning Potential with <span className="text-[#23856D]">LearnXpert.</span></>
              )}
            </h1>
            <p className="text-gray-600 mt-4">
              {isAuthenticated ? (
                <>
                  {userRole === 'Admin' && "Manage users, content, and system settings with ease."}
                  {userRole === 'Tutor' && "Create courses, manage students, and track progress."}
                  {userRole === 'Student' && "Access your courses, assignments, and learning materials."}
                  {!userRole && "Continue your learning journey with personalized content."}
                </>
              ) : (
                "Embrace life's vastness, venture forth, and discover the wonders waiting beyond. The world beckons; seize its grand offerings now!"
              )}
            </p>

            {/* Nút hành động */}
            <div className="mt-6 flex space-x-4">
              {isAuthenticated ? (
                <button 
                  className="bg-[#31A0FE] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-blue-500"
                  onClick={handleDashboardClick}
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="bg-[#31A0FE] text-white px-6 py-3 rounded-full font-bold shadow-md">
                    Join Class
                  </button>
                  <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-md border">
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Các lựa chọn nhỏ - only show when not authenticated */}
            {!isAuthenticated && (
              <div className="mt-6 flex space-x-6 text-gray-700">
                <div className="flex items-center">
                  ✅ <span className="ml-2">Make a Claim</span>
                </div>
                <div className="flex items-center">
                  ✅ <span className="ml-2">Find an Agent</span>
                </div>
              </div>
            )}
          </div>

          {/* Hình ảnh bên phải */}
          <div className="w-full md:w-1/2 relative mt-10 md:mt-0 ">
            <img
              src="/bookteal2.png"
              alt="Teal Book Stack"
              className="relative w-full max-w-sm mx-auto drop-shadow-lg"
            />
          </div>
        </section>

        <div className=" py-16 px-8 md:px-20 flex flex-col md:flex-row items-center bg-[#ddf2ff]">
          {/* Left Side */}
          <div className="md:w-1/2 space-y-6 ">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight ">
              Equip your team with skills for today — and tomorrow
            </h1>
            <p className="text-gray-400 text-lg">
              Reach business and professional goals with technical training for your whole team.
            </p>
            <button className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-md">
              Explore business plans
            </button>
          </div>
          
          {/* Right Side */}
          <div className="md:w-1/2 flex flex-wrap justify-center md:justify-end gap-6 mt-10 md:mt-0">
            <img src="/airbnb.svg" alt="Airbnb" className="h-10 opacity-50" />
            <img src="/amazon.svg" alt="Amazon" className="h-10 opacity-50" />
            <img src="/dailymotion.svg" alt="Dailymotion" className="h-10 opacity-50" />
            <img src="/reverb.svg" alt="Reverb" className="h-10 opacity-50" />
          </div>
        </div>

        {/* Add role-specific sections for authenticated users */}
        {isAuthenticated && userRole === 'Admin' && (
          <div className="container mx-auto px-4 py-8 bg-gray-50 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">Admin Quick Actions</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">Manage Users</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove system users</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">System Settings</h3>
                <p className="text-sm text-gray-600">Configure application settings</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">View Reports</h3>
                <p className="text-sm text-gray-600">Access system analytics and reports</p>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && userRole === 'Tutor' && (
          <div className="container mx-auto px-4 py-8 bg-gray-50 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">Tutor Resources</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">My Courses</h3>
                <p className="text-sm text-gray-600">Manage your teaching materials</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">Student Progress</h3>
                <p className="text-sm text-gray-600">Track student performance</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">Schedule</h3>
                <p className="text-sm text-gray-600">View upcoming classes</p>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && userRole === 'Student' && (
          <div className="container mx-auto px-4 py-8 bg-gray-50 rounded-lg my-8">
            <h2 className="text-2xl font-bold mb-4">My Learning</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">My Courses</h3>
                <p className="text-sm text-gray-600">Access your enrolled courses</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">Assignments</h3>
                <p className="text-sm text-gray-600">View pending assignments</p>
              </div>
              <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                <h3 className="font-bold">Progress</h3>
                <p className="text-sm text-gray-600">Track your learning journey</p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center py-20 bg-[#ddf2ff]">
          <h1 className="text-4xl font-bold text-gray-900">Start Your Learning Journey Today!</h1>
          <p className="mt-4 text-gray-700">Join LearnXpert and embark on a path of continuous growth and knowledge.</p>
          <button className="mt-6 px-6 py-3 bg-[#31A0FE] text-white rounded-lg shadow hover:bg-blue-500">Get Started</button>
        </div>
        
        {/* Footer Section */}
        <div className="bg-white py-12 px-8 flex text-gray-900">
          <div className="w-1/2 px-10">
            <h3 className="font-bold text-lg">Get In Touch</h3>
            <p className="mt-2 text-gray-600">the quick fox jumps over the lazy dog</p>
            <div className="flex gap-4 mt-4 text-blue-500 text-xl">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-twitter"></i>
            </div>
          </div>

          <div className="w-1/2 flex">
            <div className="w-1/2 px-10">
              <h3 className="font-bold text-lg">Company Info</h3>
              <ul className="mt-2 text-gray-600">
                <li>About Us</li>
                <li>Carrier</li>
                <li>We are hiring</li>
                <li>Blog</li>
              </ul>
            </div>
            <div className="w-1/2 px-10">
              <h3 className="font-bold text-lg">Features</h3>
              <ul className="mt-2 text-gray-600">
                <li>Business Marketing</li>
                <li>User Analytics</li>
                <li>Live Chat</li>
                <li>Unlimited Support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-[#ddf2ff] text-center py-4 text-gray-700">
          Made With Love By Team 3 © 2025
        </div>
      </div>
    </div>
  );
}

export default Landing;
