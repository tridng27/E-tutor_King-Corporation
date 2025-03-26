import { useEffect, useState } from "react";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";

function Dashboard() {
    const [scoreChartData, setScoreChartData] = useState([
        ["Subject", "Score"], // Header cho biểu đồ điểm số
    ]);
    
    const [attendanceChartData, setAttendanceChartData] = useState([
        ["Subject", "Attendance (%)"], // Header cho biểu đồ điểm danh
    ]);
    
    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const studentId = 1; // Thay bằng studentId thực tế
                const response = await apiService.get(`/students/${studentId}/performance`);
    
                if (response?.data?.length) {
                    const scoreData = response.data.map((item) => [
                        item.SubjectName || "No Subject", 
                        item.Scores?.[0] ?? 0, 
                    ]);
    
                    const attendanceData = response.data.map((item) => [
                        item.SubjectName || "No Subject", 
                        item.AttendanceRecords?.[0] ?? 0,
                    ]); // Lấy phần trăm điểm danh
    
                    setScoreChartData([["Subjects", "Score"], ...scoreData]);
                    setAttendanceChartData([["Subjects", "Attendance (%)"], ...attendanceData]);
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

            {/* Biểu đồ cột - Điểm danh */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>
                {attendanceChartData.length > 1 ? (
                    <Chart
                        chartType="ColumnChart"
                        data={attendanceChartData}
                        options={{
                            title: "Student Attendance by Subject",
                            hAxis: { title: "Subjects" },
                            vAxis: { title: "Attendance (%)", minValue: 0, maxValue: 100 },
                            colors: ["#34A853"], // Màu xanh lá cây
                            legend: { position: "top" },
                        }}
                        width={"100%"}
                        height={"400px"}
                    />
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
