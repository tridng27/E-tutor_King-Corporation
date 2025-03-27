import { useEffect, useState } from "react";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";

function Dashboard() {
    const [scoreChartData, setScoreChartData] = useState([
        ["Subject", "Score"], // Header cho biểu đồ điểm số
    ]);
    
    const [attendanceData, setAttendanceData] = useState([]); // Dữ liệu điểm danh dạng danh sách
    
    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const studentId = 1; // Thay bằng studentId thực tế
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
    
        fetchPerformanceData();
    }, []);
    

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
                            {/* % điểm danh */}
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
