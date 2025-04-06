import { useEffect, useState } from "react";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
    const [studentId] = useState(1);
    const [scoreChartData, setScoreChartData] = useState([
        ["Subject", "Score"], // Header cho biểu đồ điểm số
    ]);
    
    const [attendanceData, setAttendanceData] = useState([]); // Dữ liệu điểm danh dạng danh sách
    const [messageTimelineData, setMessageTimelineData] = useState([]);
    const [messagesByHourData, setMessagesByHourData] = useState([]);

    useEffect(() => { 
        fetchPerformanceData();
        fetchMessageData();
    }, [studentId]); 
        const fetchPerformanceData = async () => {
            try {

                const response = await apiService.get(`/students/${studentId}/performance`);

                console.log("API Response:", response.data); // Debug dữ liệu API
    
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
                } else {
                    console.warn("Không có dữ liệu điểm số hoặc điểm danh.");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        };

        const fetchMessageData = async () => {
            try {
                const response1 = await apiService.get('/auth/me'); // với withCredentials: true
                const userID = response1.data.user.UserID;
        
                if (!userID) {
                    console.error("UserID not found");
                    return;
                }
        
                const response = await apiService.getConversation(userID);
                const messages = response.data;
        
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
                hoursCount.forEach((count, hour) => {
                    hoursData.push([`${hour}:00`, count]);
                });
                setMessagesByHourData(hoursData);
        
            } catch (error) {
                console.error("Error fetching message data:", error);
            }
        };

    return (
        <div className="relative h-screen flex">
            {/* Sidebar bên trái */}
            <Sidebar />

            {/* Nội dung chính */}
            <div className="flex-1 overflow-y-auto p-6 ml-16 transition-all duration-300">
                <div className="bg-white p-6 rounded-lg shadow">
                    <input type="text" placeholder="Search" className="w-full p-2 border rounded-lg" />
                </div>

                {/* Bảng dữ liệu */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Class</th>
                            </tr>
                        </thead>
                        <tbody>
                        
                        </tbody>
                    </table>
                </div>

                {/* Biểu đồ đường - Điểm số */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Student Scores</h2>
                    {scoreChartData.length > 1 ? (
                        <Chart
                            chartType="LineChart"
                            data={scoreChartData}
                            options={{
                                title: "Student Scores by Subject",
                                hAxis: { title: "Subjects" },
                                vAxis: { title: "Score", minValue: 0, maxValue: 100 },
                                colors: ["#4285F4"], // Màu xanh
                                legend: { position: "top" },
                            }}
                            width={"100%"}
                            height={"400px"}
                        />
                    ) : (
                        <p className="text-center text-gray-500">Đang tải dữ liệu điểm số...</p>
                    )}
                </div>
                {/* New Message Charts */}
                <div className="flex flex-col gap-6 mb-10">
                        <div className="bg-white rounded-lg shadow p-4 w-full">
                            <h2 className="text-xl font-semibold mb-4">Message Activity Timeline</h2>
                            <Chart
                                chartType="LineChart"
                                width="100%"
                                height="400px"
                                data={messageTimelineData}
                                options={{
                                    title: "Message Activity Over Time",
                                    curveType: 'function',
                                    legend: { position: 'none' },
                                    hAxis: {
                                        title: 'Date',
                                        slantedText: true,
                                        slantedTextAngle: 45
                                    },
                                    vAxis: {
                                        title: 'Number of Messages'
                                    },
                                    colors: ['#34A853']
                                }}
                            />
                        </div>

                        <div className="bg-white rounded-lg shadow p-4 w-full">
                            <h2 className="text-xl font-semibold mb-4">Messages by Hour of Day</h2>
                            <Chart
                                chartType="BarChart"
                                width="100%"
                                height="400px"
                                data={messagesByHourData}
                                options={{
                                    title: "Messages by Hour",
                                    chartArea: { width: '70%' },
                                    hAxis: {
                                        title: 'Hour of Day',
                                    },
                                    vAxis: {
                                        title: 'Number of Messages'
                                    },
                                    colors: ['#FBBC05']
                                }}
                            />
                        </div>
                </div>
          {/* Progress Bar - Điểm danh */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>
                {attendanceData.length > 0 ? (
                <div className="space-y-4">
                    {attendanceData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            {/* Tên môn học */}
                            <span className="w-40 text-gray-700 font-medium">{item.subject || "Unknown"}</span>
                            {/* Progress Bar */}
                            <div className="flex-1 bg-gray-200 rounded-full h-5 w-2/5 relative">
                                <div
                                    className={`h-5 rounded-full transition-all duration-300 ${
                                        item.attendance >= 75 ? "bg-green-500"
                                        : item.attendance >= 50 ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${item.attendance}%` }}
                                ></div>
                            </div>
                            {/* % attendance */}
                            <span className="w-12 text-right text-gray-700">{item.attendance ?? 0}%</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">Đang tải dữ liệu điểm danh...</p>
            )}
            </div>
            </div>

            {/* Right sidebar */}
            <RightSidebar />
        </div>
    );
}

export default Dashboard;
