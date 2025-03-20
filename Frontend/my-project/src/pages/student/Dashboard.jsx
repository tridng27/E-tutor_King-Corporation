import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import { GlobalContext } from "../../context/GlobalContext";
import { jwtDecode } from "jwt-decode";

function StudentDashboard() {
    const [selectedTab, setSelectedTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useContext(GlobalContext);
    const navigate = useNavigate();
    
    // Check if user is a student
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== 'Student') {
                // Redirect non-students
                navigate('/login');
                alert('This page is only accessible to students');
            }
        } catch (error) {
            console.error("Token verification error:", error);
            navigate('/login');
        }
    }, [navigate]);
    
    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="relative">
            {/* Overlay when sidebar is open */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>
            )}

            <div className="flex h-screen">
                <Sidebar setSelectedTab={setSelectedTab} />

                {/* Main content - Student specific */}
                <div className="flex-1 p-6 ml-16">
                    <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <input type="text" placeholder="Search courses..." className="w-full p-2 border rounded-lg" />
                    </div>
                    
                    {/* Student-specific content: My Courses */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="border rounded-lg p-4 hover:shadow-md transition">
                                <h3 className="font-bold">Mathematics 101</h3>
                                <p className="text-sm text-gray-600">Prof. Johnson</p>
                                <div className="mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full inline-block">
                                    In Progress
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 hover:shadow-md transition">
                                <h3 className="font-bold">Introduction to Programming</h3>
                                <p className="text-sm text-gray-600">Dr. Smith</p>
                                <div className="mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block">
                                    Completed
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 hover:shadow-md transition">
                                <h3 className="font-bold">Physics Fundamentals</h3>
                                <p className="text-sm text-gray-600">Prof. Williams</p>
                                <div className="mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-block">
                                    Not Started
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Assignments section */}
                    <div className="mt-6 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Assignment</th>
                                    <th className="p-2">Course</th>
                                    <th className="p-2">Due Date</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2">Algebra Homework #3</td>
                                    <td className="p-2">Mathematics 101</td>
                                    <td className="p-2">2023/10/25</td>
                                    <td className="p-2"><span className="text-orange-500">Due Soon</span></td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2">Programming Project</td>
                                    <td className="p-2">Intro to Programming</td>
                                    <td className="p-2">2023/11/05</td>
                                    <td className="p-2"><span className="text-gray-500">Pending</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-1/5 bg-gray-100 p-6">
                    <div className="flex justify-center items-center mb-20">
                        <button 
                            className="bg-white text-black px-6 py-2 rounded-full shadow-md border"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold">Upcoming Classes</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-3 rounded-lg">
                            <span className="bg-blue-400 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Mathematics 101</p>
                                <p className="text-xs">Today, 10:30AM</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg">
                            <span className="bg-green-400 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Programming Lab</p>
                                <p className="text-xs">Today, 02:00PM</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mt-6">Recent Grades</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <span className="bg-purple-300 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Quiz 2: 85%</p>
                                <p className="text-xs">Mathematics 101</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="bg-green-300 p-2 rounded-full"></span>
                            <div>
                                <p className="font-bold text-sm">Homework #2: 92%</p>
                                <p className="text-xs">Programming</p>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold mt-6">Study Resources</h3>
                    <div className="mt-4 space-y-2">
                        <a href="#" className="block text-blue-500 hover:underline">Mathematics Textbook</a>
                        <a href="#" className="block text-blue-500 hover:underline">Programming Reference</a>
                        <a href="#" className="block text-blue-500 hover:underline">Physics Lab Manual</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
