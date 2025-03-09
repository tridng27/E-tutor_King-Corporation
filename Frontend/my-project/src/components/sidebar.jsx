import { useState } from "react";
import { LayoutDashboard, Calendar, Users, User, MessageSquare, PhoneCall } from "lucide-react";

function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div>
            {/* Overlay khi sidebar mở */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>
            )}

            <div
                className={`absolute left-0 top-0 h-full bg-teal-50 p-5 space-y-6 overflow-hidden shadow-xl transition-all duration-500 ${
                    isSidebarOpen ? "w-64 z-50" : "w-16"
                }`}
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
            >
                <h1 className="text-xl font-bold text-teal-500 whitespace-nowrap text-center">
                    LX
                </h1>
                <nav className="space-y-6">
                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                        <LayoutDashboard className="w-6 h-6 text-teal-500" />
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Dashboard
                        </span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                        <Calendar className="w-6 h-6 text-gray-600" />
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Timetable
                        </span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                        <Users className="w-6 h-6 text-gray-600" />
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Students
                        </span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                        <User className="w-6 h-6 text-gray-600" />
                        <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                            Tutor
                        </span>
                    </a>

                    <div className="space-y-6">
                        <h3 className="text-gray-500 uppercase text-xs pb-2 mt-10">Teams</h3>
                        <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                            <MessageSquare className="w-6 h-6 text-gray-600" />
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Message
                            </span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 rounded-lg hover:bg-gray-200">
                            <PhoneCall className="w-6 h-6 text-gray-600" />
                            <span className={`text-gray-700 transition-all duration-300 ${isSidebarOpen ? "block" : "hidden"}`}>
                                Meeting
                            </span>
                        </a>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;
