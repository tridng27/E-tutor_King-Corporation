import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    Calendar, 
    MessageSquare, 
    PhoneCall, 
    Home, 
    LogOut, 
    BookHeart, 
    Earth, 
    Users, 
    GraduationCap, 
    BookOpen
} from "lucide-react";
import { GlobalContext } from "../context/GlobalContext";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout, hasRole, unreadCount } = useContext(GlobalContext);

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

    // Handle navigation to student based on role
    const handleStudentClick = (e) => {
        e.preventDefault();
        if (userRole === 'Admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'Tutor') {
            navigate('/tutor/student');
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

    // Updated timetable navigation to use the common /timetable route
    const handleTTableClick = (e) => {
        e.preventDefault();
        // Navigate to the common timetable route instead of role-specific routes
        navigate('/timetable');
    };

    // Handle navigation to course page
    const handleCourseClick = (e) => {
        e.preventDefault();
        navigate('/course');
    };

    // Handle navigation to admin page
    const handleAdminClick = (e) => {
        e.preventDefault();
        navigate('/admin');
    };

    // Handle navigation to messages page
    const handleMessagesClick = (e) => {
        e.preventDefault();
        navigate('/messages');
    };
    
    // NEW: Handle navigation to subject management (Admin only)
    const handleSubjectsClick = (e) => {
        e.preventDefault();
        navigate('/admin/subjects');
    };

    // NEW: Handle navigation to student management (Admin only)
    const handleStudentManagementClick = (e) => {
        e.preventDefault();
        navigate('/admin/student');
    };

    return (
        <div>
            {/* Overlay when sidebar is open */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>
            )}

            <div
                className={`fixed left-0 top-0 h-screen bg-[#e4f5ff] p-5 space-y-6 overflow-y-auto shadow-xl transition-all duration-500 ${
                    isSidebarOpen ? "w-64 z-50" : "w-16"
                }`}
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
            >
                <h1 className="text-xl font-bold text-[#31A0FE] whitespace-nowrap text-center">
                    LX
                </h1>
                <nav className="space-y-6">
                    {/* Home/Landing button */}
                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        onClick={handleHomeClick}
                    >
                        {/* Add min-width and center the icon when sidebar is collapsed */}
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Home className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Home
                        </span>
                    </a>

                    {/* Dashboard button */}
                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        onClick={handleDashboardClick}
                    >
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <LayoutDashboard className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Dashboard
                        </span>
                    </a>

                    {/* Admin button - Only visible for Admin users */}
                    {userRole === 'Admin' && (
                        <a
                            href="#"
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                            onClick={handleAdminClick}
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <Users className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                ManagerTool
                            </span>
                        </a>
                    )}
                    
                    {/* NEW: Subject Management - Admin only */}
                    {userRole === 'Admin' && (
                        <a
                            href="#"
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                            onClick={handleSubjectsClick}
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <BookOpen className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                SubjectManager
                            </span>
                        </a>
                    )}

                    {/* NEW: Student Management - Admin only */}
                    {userRole === 'Admin' && (
                        <a
                            href="#"
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                            onClick={handleStudentManagementClick}
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <GraduationCap className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                StudentManager
                            </span>
                        </a>
                    )}

                    {/* Timetable button - Updated to use the common route */}
                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        onClick={handleTTableClick}
                    >
                        {/* Add min-width and center the icon when sidebar is collapsed */}
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Calendar className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            TimeTable
                        </span>
                    </a>

                    {/* Course button - Updated to use handleCourseClick */}
                    <a 
                        href="#" 
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        onClick={handleCourseClick}
                    >
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <BookHeart className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Material
                        </span>
                    </a>

                    <a
                        href="#"
                        className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        onClick={handleSocialClick}
                    >
                        <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                            <Earth className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                        </div>
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Social
                        </span>
                    </a>

                    <div className="space-y-6">
                        <h3 className={`text-gray-500 uppercase text-xs pb-2 mt-10 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Teams
                        </h3>
                        {/* Messages button - Updated to navigate to direct messages */}
                        <a 
                            href="#" 
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                            onClick={handleMessagesClick}
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <MessageSquare className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                            </div>
                            <div className="flex items-center">
                                <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                    Messages
                                </span>
                                {unreadCount > 0 && (
                                    <span className={`ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 ${isSidebarOpen ? "inline-flex" : "absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"}`}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </a>
                        
                        {/* FIXED: Changed from nested <a> and <Link> to just <Link> */}
                        <Link 
                            to={`/meeting/${uuidv4()}`} 
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1"
                        >
                            <div className={`flex ${!isSidebarOpen ? "justify-center w-full" : ""}`}>
                                <PhoneCall className="w-6 h-6 text-[#31A0FE] min-w-[24px]" />
                            </div>
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Meeting
                            </span>
                        </Link>
                    </div>

                    {/* Logout button at the bottom */}
                    <div className="absolute bottom-5 left-0 right-0 px-5">
                        <a
                            href="#"
                            className="flex items-center space-x-3 rounded-lg hover:bg-gray-100 p-1 text-red-500"
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
