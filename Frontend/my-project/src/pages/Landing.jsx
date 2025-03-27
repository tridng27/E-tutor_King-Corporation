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
        <header className="bg-[#E9FFFA] py-4 px-8 flex justify-between items-center">
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
        <section className="flex flex-col md:flex-row items-center justify-between px-24 py-20 bg-[#E9FFFA]">
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
                  className="bg-[#23856D] text-white px-6 py-3 rounded-full font-bold shadow-md"
                  onClick={handleDashboardClick}
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="bg-[#23856D] text-white px-6 py-3 rounded-full font-bold shadow-md">
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
              src="/bookteal.jpg"
              alt="Teal Book Stack"
              className="relative w-full max-w-sm mx-auto drop-shadow-lg"
            />
          </div>
        </section>

        {/* Rest of your landing page content */}
        {/* You can conditionally render different sections based on authentication status if needed */}
        
        {/* Feature Section */}
        <div className="bg-[conic-gradient(#E9FFFA_0deg,#E9FFFA_90deg,white_90deg,white_270deg,#E9FFFA_270deg)] py-16 flex justify-center">
          {/* Your existing feature section content */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
            {/* Your feature cards */}
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

        {/* Continue with the rest of your landing page content */}
        {/* ... */}

        {/* Footer */}
        <footer className="bg-white text-[#252B42]">
          {/* Your existing footer content */}
        </footer>
      </div>
    </div>
  );
}

export default Landing;
