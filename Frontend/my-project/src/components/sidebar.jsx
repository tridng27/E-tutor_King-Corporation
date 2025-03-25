import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, User, MessageSquare, PhoneCall, Home, LogOut, BookHeart } from "lucide-react";
import { GlobalContext } from "../context/GlobalContext";
import { jwtDecode } from "jwt-decode";

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useContext(GlobalContext);

    // Get user role from token or context
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

    // Handle navigation to dashboard based on role
    const handleDashboardClick = (e) => {
        e.preventDefault();
        if (userRole === 'Admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'Tutor') {
            navigate('/tutor/dashboard');
        } else if (userRole === 'Student') {
            navigate('/student/dashboard');
        }
    };

    // Handle navigation to landing page
    const handleHomeClick = (e) => {
        e.preventDefault();
        navigate('/landing');
    };

    // Handle logout
    const handleLogoutClick = (e) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    const handleSocialClick = (e) => {
        e.preventDefault();
        navigate('/social');
    };

    const handleTTableClick = (e) => {
        e.preventDefault();
        if (userRole === 'Admin') {
            navigate('/admin/Timetable');
        } else if (userRole === 'Tutor') {
            navigate('/tutor/Timetable');
        } else if (userRole === 'Student') {
            navigate('/student/Timetable');
        }
    };

    return (
        <div>
            {/* Overlay when sidebar is open */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>
            )}

            <div
                className={`fixed left-0 top-0 h-screen bg-teal-50 p-5 space-y-6 overflow-y-auto shadow-xl transition-all duration-500 ${
                    isSidebarOpen ? "w-64 z-50" : "w-16"
                }`}
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
            >
                <h1 className="text-xl font-bold text-teal-500 whitespace-nowrap text-center">
                    LX
                </h1>
                <nav className="space-y-6">
                    {/* Home/Landing button */}
                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2"
                        onClick={handleHomeClick}
                    >
                        {/* Add min-width and center the icon when sidebar is collapsed */}
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Home className="w-6 h-6 text-teal-500 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Home
                        </span>
                    </a>

                    {/* Dashboard button */}
                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2"
                        onClick={handleDashboardClick}
                    >
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <LayoutDashboard className="w-6 h-6 text-teal-500 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Dashboard
                        </span>
                    </a>

                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2"
                        onClick={handleTTableClick}
                    >
                        {/* Add min-width and center the icon when sidebar is collapsed */}
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Calendar className="w-6 h-6 text-teal-500 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Time Table
                        </span>
                    </a>

                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2"
                        onClick={handleSocialClick}
                    >
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <BookHeart className="w-6 h-6 text-teal-500 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Social
                        </span>
                    </a>

                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2">
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Users className="w-6 h-6 text-gray-600 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Students
                        </span>
                    </a>

                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2">
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <User className="w-6 h-6 text-gray-600 min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Tutor
                        </span>
                    </a>

                    <div className="space-y-6">
                        <h3 className={`text-gray-500 uppercase text-xs pb-2 mt-10 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Teams
                        </h3>
                        <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2">
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <MessageSquare className="w-6 h-6 text-gray-600 min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Message
                            </span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2">
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <PhoneCall className="w-6 h-6 text-gray-600 min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Meeting
                            </span>
                        </a>
                    </div>

                    {/* Logout button at the bottom */}
                    <div className="absolute bottom-5 left-0 right-0 px-5">
                        <a
                            href="#"
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-200 p-2 text-red-500"
                            onClick={handleLogoutClick}
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <LogOut className="w-6 h-6 min-w-[24px]" />
                            </div>
                            <span className={`transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Logout
                            </span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;
