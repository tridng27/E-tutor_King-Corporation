import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";

function Dashboard() {
    const [classData, setClassData] = useState([]);
    const [classStudentCount, setClassStudentCount] = useState([]);
    const [classStudentPercentage, setClassStudentPercentage] = useState([]);
    const [messageTimelineData, setMessageTimelineData] = useState([["Date", "Messages"]]);
    const [messagesByHourData, setMessagesByHourData] = useState([["Hour", "Messages"]]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchClassData(),
                    fetchMessageData()
                ]);
                setError(null);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAllData();
    }, []);

    const fetchClassData = async () => {
        try {
            const response = await apiService.get('/classes');
            const classes = response.data;
            const studentCountData = [["Class", "Student Count"]];
            const studentPercentageData = [["Class", "Student Count"]];

            for (const classItem of classes) {
                const classId = classItem.ClassID;
                const studentsInClass = await apiService.get(`/class-students/${classId}/students`);
                const studentCountInClass = studentsInClass.data.length;

                studentCountData.push([`${classItem.Name}`, studentCountInClass]);
                studentPercentageData.push([`${classItem.Name}`, studentCountInClass]);
            }

            setClassData(classes);
            setClassStudentCount(studentCountData);
            setClassStudentPercentage(studentPercentageData);
        } catch (error) {
            console.error("Error fetching class data:", error);
            throw error;
        }
    };

    const fetchMessageData = async () => {
        try {
            setIsLoading(true);
            
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
            <Sidebar />

            <div className="flex-1 p-4 md:p-6 ml-16 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="mt-2 text-sm md:text-base text-gray-600">Overview of class enrollments and message activity</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
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
                    ) : (
                        <>
                            {/* MIS Dashboard Section */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-lg font-semibold">Class Overview</h2>
                                </div>
                                
                                <div className="flex flex-col md:flex-row">
                                    {/* Class Table - Takes full width on mobile, 1/3 on desktop */}
                                    <div className="p-4 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200">
                                        <h3 className="text-base font-semibold mb-4 text-gray-700">Class Enrollment</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                                                <thead>
                                                    <tr className="bg-gray-100 text-gray-700 text-left">
                                                        <th className="px-4 py-2 text-xs font-medium">Class ID</th>
                                                        <th className="px-4 py-2 text-xs font-medium">Class Name</th>
                                                        <th className="px-4 py-2 text-xs font-medium">Students</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {classData.map((classItem) => (
                                                        <tr key={classItem.ClassID} className="hover:bg-gray-50 transition">
                                                            <td className="px-4 py-2 text-sm">{classItem.ClassID}</td>
                                                            <td className="px-4 py-2 text-sm">{classItem.Name}</td>
                                                            <td className="px-4 py-2 text-sm">
                                                                {
                                                                    classStudentCount.find(item => item[0] === classItem.Name)?.[1] ?? 0
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Pie Chart - Takes full width on mobile, 2/3 on desktop */}
                                    <div className="p-4 w-full md:w-2/3">
                                        <h3 className="text-base font-semibold mb-4 text-gray-700">Class Enrollment Percentage</h3>
                                        <div className="h-64 md:h-80">
                                            <Chart
                                                chartType="PieChart"
                                                width="100%"
                                                height="100%"
                                                data={classStudentPercentage}
                                                options={{
                                                    pieSliceText: "percentage",
                                                    chartArea: { width: '90%', height: '80%' },
                                                    legend: { position: 'bottom' },
                                                    is3D: true,
                                                    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8430F0', '#1DA1F2', '#FF6B6B']
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Student Count Chart */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-800 text-white">
                                        <h2 className="text-base font-semibold">Student Count by Class</h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="h-64 md:h-80">
                                            <Chart
                                                chartType="BarChart"
                                                width="100%"
                                                height="100%"
                                                data={classStudentCount}
                                                options={{
                                                    chartArea: { width: '60%', height: '70%' },
                                                    hAxis: {
                                                        title: "Student Count",
                                                        minValue: 0,
                                                    },
                                                    vAxis: {
                                                        title: "Class",
                                                    },
                                                    legend: { position: 'none' },
                                                    colors: ['#4285F4']
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
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
                        </>
                    )}
                </div>
            </div>

            <RightSidebar />
        </div>
    );
}

export default Dashboard;

