import { useEffect, useState, useContext } from "react";
import Sidebar from "../../components/sidebar";
import RightSidebar from "../../components/rightSidebar";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";
import { GlobalContext } from "../../context/GlobalContext";
import { Search, User, Mail, Calendar, BookOpen, Clock } from "lucide-react";

function Dashboard() {
    const { user } = useContext(GlobalContext);
    const [studentId] = useState(1); // Using hardcoded ID as in the original code
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoreChartData, setScoreChartData] = useState([
        ["Subject", "Score"], // Header for score chart
    ]);
    
    const [attendanceData, setAttendanceData] = useState([]); // Attendance data as list
    const [messageTimelineData, setMessageTimelineData] = useState([["Date", "Messages"]]);
    const [messagesByHourData, setMessagesByHourData] = useState([["Hour", "Messages"]]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiService.get('/auth/me');
                if (response?.data?.user) {
                    setStudentProfile(response.data.user);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };
        
        fetchUserProfile();
        fetchPerformanceData();
        fetchMessageData();
    }, [studentId]);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/students/${studentId}/performance`);
            console.log("API Response:", response.data); // Debug API data
    
            if (response?.data?.length) {
                const scoreData = response.data.map((item) => [
                    item.SubjectName || "No Subject", 
                    item.Scores?.[0] ?? 0, 
                ]);
    
                const attendanceData = response.data.map((item) => ({
                    subject: item.SubjectName || "No Subject", 
                    attendance: item.AttendanceRecords?.[0] ?? 0,
                }));
    
                setScoreChartData([["Subjects", "Score"], ...scoreData]);
                setAttendanceData(attendanceData);
                setError(null);
            } else {
                console.warn("No score or attendance data available.");
            }
        } catch (err) {
            console.error("Error fetching performance data:", err);
            setError("Failed to load performance data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Updated message data fetching function
    const fetchMessageData = async () => {
        try {
            setLoading(true);
            
            // First get the current user ID
            const userResponse = await apiService.get('/auth/me');
            const currentUserID = userResponse.data.user.UserID;
            
            if (!currentUserID) {
                console.error("Current user ID not found");
                return;
            }
            
            console.log("Current user ID:", currentUserID);
            
            // Try to get all conversations first
            try {
                const conversationsResponse = await apiService.getUserConversations();
                console.log("All conversations:", conversationsResponse);
                
                if (conversationsResponse?.success && 
                    Array.isArray(conversationsResponse.data) && 
                    conversationsResponse.data.length > 0) {
                    
                    // We need to get all messages, not just the latest ones
                    // Let's collect all partner IDs
                    const partnerIds = conversationsResponse.data.map(conv => conv.partner.UserID);
                    console.log("Partner IDs:", partnerIds);
                    
                    // Now fetch all messages for each partner
                    const allMessages = [];
                    
                    for (const partnerId of partnerIds) {
                        try {
                            // Get conversation with this partner
                            const partnerConversation = await apiService.get(`/messages/conversation/${partnerId}`);
                            
                            if (partnerConversation?.success && 
                                Array.isArray(partnerConversation.data) && 
                                partnerConversation.data.length > 0) {
                                
                                // Add these messages to our collection
                                allMessages.push(...partnerConversation.data);
                            }
                        } catch (err) {
                            console.error(`Error fetching conversation with partner ${partnerId}:`, err);
                        }
                    }
                    
                    console.log("All collected messages:", allMessages.length);
                    
                    if (allMessages.length > 0) {
                        processMessageData(allMessages);
                    } else {
                        // If we couldn't get any messages, use the latest messages from conversations
                        const latestMessages = conversationsResponse.data.map(conv => conv.latestMessage);
                        console.log("Using latest messages:", latestMessages.length);
                        processMessageData(latestMessages);
                    }
                } else {
                    // If no conversations, try getting direct conversation
                    const directMessagesResponse = await apiService.getConversation(currentUserID);
                    console.log("Direct conversation messages:", directMessagesResponse);
                    
                    if (directMessagesResponse?.success && 
                        Array.isArray(directMessagesResponse.data) && 
                        directMessagesResponse.data.length > 0) {
                        
                        processMessageData(directMessagesResponse.data);
                    } else {
                        // If still no messages, set empty chart data
                        setMessageTimelineData([["Date", "Messages"]]);
                        setMessagesByHourData([["Hour", "Messages"]]);
                    }
                }
            } catch (err) {
                console.error("Error fetching conversations:", err);
                
                // Try direct conversation as fallback
                try {
                    const directMessagesResponse = await apiService.getConversation(currentUserID);
                    console.log("Direct conversation messages:", directMessagesResponse);
                    
                    if (directMessagesResponse?.success && 
                        Array.isArray(directMessagesResponse.data) && 
                        directMessagesResponse.data.length > 0) {
                        
                        processMessageData(directMessagesResponse.data);
                    } else {
                        // If still no messages, set empty chart data
                        setMessageTimelineData([["Date", "Messages"]]);
                        setMessagesByHourData([["Hour", "Messages"]]);
                    }
                } catch (directErr) {
                    console.error("Error fetching direct conversation:", directErr);
                    // Set empty chart data
                    setMessageTimelineData([["Date", "Messages"]]);
                    setMessagesByHourData([["Hour", "Messages"]]);
                }
            }
            
            setError(null);
        } catch (err) {
            console.error("Error in message data fetching:", err);
            // Set empty chart data in case of error
            setMessageTimelineData([["Date", "Messages"]]);
            setMessagesByHourData([["Hour", "Messages"]]);
        } finally {
            setLoading(false);
        }
    };    
    
    // Helper function to process message data for charts
    const processMessageData = (messages) => {
        // Timeline Data
        const timelineMap = new Map();
        messages.forEach(msg => {
            const date = new Date(msg.Timestamp).toLocaleDateString();
            timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
        });
        
        const timelineData = [["Date", "Messages"]];
        timelineMap.forEach((count, date) => {
            timelineData.push([date, count]);
        });
        setMessageTimelineData(timelineData);
        
        // Messages by Hour Data
        const hoursData = [["Hour", "Messages"]];
        const hoursCount = Array(24).fill(0);
        messages.forEach(msg => {
            const hour = new Date(msg.Timestamp).getHours();
            hoursCount[hour]++;
        });
        
        for (let hour = 0; hour < 24; hour++) {
            hoursData.push([`${hour}:00`, hoursCount[hour]]);
        }
        setMessagesByHourData(hoursData);
    };         

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 ml-16 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Student Dashboard</h1>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                {studentProfile?.Avatar ? (
                                    <img 
                                        src={studentProfile.Avatar} 
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <User size={40} className="text-blue-500" />
                                )}
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {studentProfile?.Name || "Loading..."}
                                </h2>
                                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                                    <Mail size={16} className="mr-2" />
                                    {studentProfile?.Email || "Loading..."}
                                </p>
                                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                                    <Calendar size={16} className="mr-2" />
                                    {studentProfile?.Birthdate 
                                        ? new Date(studentProfile.Birthdate).toLocaleDateString('vi-VN') 
                                        : "Not available"}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Student
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        Active
                                    </span>
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <BookOpen size={18} className="text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {attendanceData.length}
                                    </p>
                                    <p className="text-sm text-blue-600">Subjects</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Clock size={18} className="text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {studentProfile?.RegisterDate 
                                            ? Math.floor((new Date() - new Date(studentProfile.RegisterDate)) / (1000 * 60 * 60 * 24))
                                            : 0}
                                    </p>
                                    <p className="text-sm text-green-600">Days Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && !error && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* Score Chart - Using admin dashboard style */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-lg font-semibold">Student Scores</h2>
                                </div>
                                <div className="p-4">
                                    <div className="h-64 md:h-80">
                                        {scoreChartData.length > 1 ? (
                                            <Chart
                                                chartType="LineChart"
                                                width="100%"
                                                height="100%"
                                                data={scoreChartData}
                                                options={{
                                                    chartArea: { width: '80%', height: '70%' },
                                                    hAxis: { title: "Subjects" },
                                                    vAxis: {
                                                        title: "Score",
                                                        minValue: 0,
                                                        maxValue: 100
                                                    },
                                                    legend: { position: "top" },
                                                    colors: ["#4285F4"]
                                                }}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-gray-500">No score data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section - Using admin dashboard style */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Message Timeline Chart */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Message Activity Timeline</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="h-64 md:h-80">
                                            {messageTimelineData.length > 1 ? (
                                                <Chart
                                                    chartType="LineChart"
                                                    width="100%"
                                                    height="100%"
                                                    data={messageTimelineData}
                                                    options={{
                                                        curveType: 'function',
                                                        legend: { position: 'none' },
                                                        chartArea: { width: '80%', height: '70%' },
                                                        hAxis: {
                                                            title: 'Date',
                                                            slantedText: true,
                                                            slantedTextAngle: 45
                                                        },
                                                        vAxis: {
                                                            title: 'Number of Messages',
                                                            minValue: 0,
                                                            format: '0'
                                                        },
                                                        colors: ['#34A853']
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex justify-center items-center h-full">
                                                    <p className="text-gray-500">No message data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages by Hour Chart */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Messages by Hour of Day</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="h-64 md:h-80">
                                            {messagesByHourData.length > 1 ? (
                                                <Chart
                                                    chartType="ColumnChart"
                                                    width="100%"
                                                    height="100%"
                                                    data={messagesByHourData}
                                                    options={{
                                                        chartArea: { width: '80%', height: '70%' },
                                                        hAxis: {
                                                            title: 'Hour of Day',
                                                        },
                                                        vAxis: {
                                                            title: 'Number of Messages',
                                                            minValue: 0,
                                                            format: '0'
                                                        },
                                                        legend: { position: 'none' },
                                                        colors: ['#FBBC05']
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex justify-center items-center h-full">
                                                    <p className="text-gray-500">No message data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Progress Bars */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-lg font-semibold">Student Attendance</h2>
                                </div>
                                <div className="p-4">
                                    {attendanceData.length > 0 ? (
                                        <div className="space-y-4">
                                            {attendanceData.map((item, index) => (
                                                <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                                    {/* Subject name */}
                                                    <span className="w-full md:w-40 text-gray-700 font-medium mb-2 md:mb-0">{item.subject || "Unknown"}</span>
                                                    {/* Progress Bar */}
                                                    <div className="flex-1 bg-gray-200 rounded-full h-5 relative">
                                                        <div
                                                            className={`h-5 rounded-full transition-all duration-300 ${
                                                                item.attendance >= 75 ? "bg-green-500"
                                                                : item.attendance >= 50 ? "bg-yellow-500"
                                                                : "bg-red-500"
                                                            }`}
                                                            style={{ width: `${item.attendance}%` }}
                                                        ></div>
                                                    </div>
                                                    {/* Attendance percentage */}
                                                    <span className="w-16 text-right text-gray-700 mt-1 md:mt-0">{item.attendance ?? 0}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center h-32 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">No attendance data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                                                <BookOpen size={20} className="text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="font-medium">New course material available</p>
                                                <p className="text-sm text-gray-500">Mathematics - Algebra Fundamentals</p>
                                                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                                                <Calendar size={20} className="text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="font-medium">Upcoming test reminder</p>
                                                <p className="text-sm text-gray-500">Science - Physics Principles</p>
                                                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                                                <Mail size={20} className="text-purple-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="font-medium">New message from tutor</p>
                                                <p className="text-sm text-gray-500">Regarding your recent assignment</p>
                                                <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View All Activity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Timetable</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-500">View your class schedule and upcoming events</p>
                                            <Calendar size={20} className="text-blue-600" />
                                        </div>
                                        <button 
                                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            onClick={() => window.location.href = '/timetable'}
                                        >
                                            Go to Timetable →
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Courses</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-500">Access your course materials and resources</p>
                                            <BookOpen size={20} className="text-green-600" />
                                        </div>
                                        <button 
                                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            onClick={() => window.location.href = '/course'}
                                        >
                                            Go to Courses →
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Messages</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm text-gray-500">Communicate with your tutors and classmates</p>
                                            <Mail size={20} className="text-purple-600" />
                                        </div>
                                        <button 
                                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            onClick={() => window.location.href = '/messages'}
                                        >
                                            Go to Messages →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

