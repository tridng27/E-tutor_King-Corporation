import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import apiService from "../../services/apiService";
import RightSidebar from "../../components/rightSidebar";
import Sidebar from "../../components/sidebar";

function Dashboard() {
    const [classData, setClassData] = useState([]);
    const [classStudentCount, setClassStudentCount] = useState([]);
    const [classStudentPercentage, setClassStudentPercentage] = useState([]);
    const [messageTimelineData, setMessageTimelineData] = useState([]);
    const [messagesByHourData, setMessagesByHourData] = useState([]);

    // Fetch all data
    useEffect(() => {
        fetchClassData();
        fetchMessageData();
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
    
            // Bước 3: Gọi API như bình thường
            const response = await apiService.getConversation(userID);
            const messages = response.data;
    
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
            hoursCount.forEach((count, hour) => {
                hoursData.push([`${hour}:00`, count]);
            });
            setMessagesByHourData(hoursData);
    
        } catch (error) {
            console.error("Error fetching message data:", error);
        }
    };

    return (
        <div className="flex h-screen">
                <Sidebar />

                <div className="flex-1 p-6 ml-16 overflow-y-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    </div>

                    {/* MIS Dashboard Table */}
                    <div className="flex flex-row gap-6 mb-10">
                        <div className="p-4 w-1/3">
                            <h2 className="text-xl font-semibold mb-4">MIS Dashboard - Class Overview</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-left" >
                                            <th className="border px-4 py-2">Class ID</th>
                                            <th className="border px-4 py-2">Class Name</th>
                                            <th className="border px-4 py-2">Student Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classData.map((classItem) => (
                                            <tr key={classItem.ClassID} className="hover:bg-gray-100 transition">
                                                <td className="border px-4 py-2">{classItem.ClassID}</td>
                                                <td className="border px-4 py-2">{classItem.Name}</td>
                                                <td className="border px-4 py-2">
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
                        <div className="bg-white shadow p-4 w-2/3">
                            <h2 className="text-xl font-semibold mb-4">Class Enrollment Percentage</h2>
                            <Chart
                                chartType="PieChart"
                                width="100%"
                                height="400px"
                                data={classStudentPercentage}
                                options={{
                                    title: "Class Enrollment Percentage",
                                    is3D: true,
                                    pieSliceText: "percentage",
                                }}
                            />
                        </div>
                    </div>

                    {/* Original Class Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white shadow p-4">
                            <h2 className="text-xl font-semibold mb-4">Student Count by Class</h2>
                            <Chart
                                chartType="BarChart"
                                width="100%"
                                height="400px"
                                data={classStudentCount}
                                options={{
                                    title: "Student Count by Class",
                                    chartArea: { width: "50%" },
                                    hAxis: {
                                        title: "Student Count",
                                        minValue: 0,
                                    },
                                    vAxis: {
                                        title: "Class",
                                    },
                                }}
                            />
                        </div>
                        <div className="bg-white shadow p-4">
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

                        <div className="bg-white shadow p-4">
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
                </div>

                <RightSidebar />
        </div>
    );
}

export default Dashboard;