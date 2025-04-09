import { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/sidebar";
import RightSidebar from "../../components/rightSidebar";
import { GlobalContext } from "../../context/GlobalContext";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Search, User, Mail, Calendar, BookOpen, Clock, Users, BookmarkCheck, Plus } from "lucide-react";
import { Chart } from "react-google-charts";

function Dashboard() {
    const { currentTutor, user } = useContext(GlobalContext);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [studentSubjects, setStudentSubjects] = useState({});
    const [tutorProfile, setTutorProfile] = useState(null);
    const [classStats, setClassStats] = useState({
        totalStudents: 0,
        averageScore: 0,
        averageAttendance: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [attendanceUpdates, setAttendanceUpdates] = useState({});

    // Chart data states
    const [scoreChartData, setScoreChartData] = useState([
        ["Subject", "Average Score"],
    ]);
    const [attendanceChartData, setAttendanceChartData] = useState([
        ["Subject", "Average Attendance"],
    ]);

    // Load attendance updates from localStorage on component mount
    useEffect(() => {
        const storedUpdates = localStorage.getItem('attendanceUpdates');
        if (storedUpdates) {
            setAttendanceUpdates(JSON.parse(storedUpdates));
        }
    }, []);

    // Fetch tutor's classes on component mount
    useEffect(() => {
        const fetchTutorClasses = async () => {
            try {
                setLoading(true);
                const response = await apiService.get('/tutor/classes');
                setClasses(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching classes:", error);
                toast.error("Failed to load your classes");
                setLoading(false);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const response = await apiService.get('/auth/me');
                if (response?.data?.user) {
                    setTutorProfile(response.data.user);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        if (user) {
            fetchTutorClasses();
            fetchUserProfile();
        }
    }, [user]);

    // Fetch students when a class is selected
    const handleClassSelect = async (classId) => {
        try {
            setLoading(true);
            setSelectedClass(classId);
            const response = await apiService.get(`/tutor/classes/${classId}/students`);
            setStudents(response.data);
            
            // Fetch subjects for each student
            const subjectsPromises = response.data.map(student => 
                apiService.get(`/studentsubjects/students/${student.StudentID}/subjects`)
                    .then(res => ({ studentId: student.StudentID, subjects: res.data }))
            );
            
            const subjectsResults = await Promise.all(subjectsPromises);
            
            // Create a map of studentId -> subjects
            const subjectsMap = {};
            subjectsResults.forEach(result => {
                subjectsMap[result.studentId] = result.subjects;
            });
            
            setStudentSubjects(subjectsMap);

            // Calculate class statistics and prepare chart data
            calculateClassStats(response.data, subjectsMap);
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students");
            setLoading(false);
        }
    };

    // Calculate class statistics and prepare chart data
    const calculateClassStats = (students, subjectsMap) => {
        let totalStudents = students.length;
        let allScores = [];
        let allAttendance = [];
        let subjectScores = {};
        let subjectAttendance = {};
        let subjectCounts = {};

        // Collect all scores and attendance
        Object.values(subjectsMap).forEach(subjects => {
            subjects.forEach(subject => {
                if (subject.Score !== null) {
                    allScores.push(subject.Score);
                    
                    // Group by subject for chart
                    const subjectName = subject.Subject?.SubjectName || 'Unknown';
                    if (!subjectScores[subjectName]) {
                        subjectScores[subjectName] = [];
                        subjectCounts[subjectName] = 0;
                    }
                    subjectScores[subjectName].push(subject.Score);
                    subjectCounts[subjectName]++;
                }
                
                if (subject.Attendance !== null) {
                    allAttendance.push(subject.Attendance);
                    
                    // Group by subject for chart
                    const subjectName = subject.Subject?.SubjectName || 'Unknown';
                    if (!subjectAttendance[subjectName]) {
                        subjectAttendance[subjectName] = [];
                    }
                    subjectAttendance[subjectName].push(subject.Attendance);
                }
            });
        });

        // Calculate averages
        const avgScore = allScores.length > 0 
            ? allScores.reduce((sum, score) => sum + Number(score), 0) / allScores.length 
            : 0;
            
        const avgAttendance = allAttendance.length > 0 
            ? allAttendance.reduce((sum, att) => sum + Number(att), 0) / allAttendance.length 
            : 0;

        // Prepare chart data
        const scoreData = [["Subject", "Average Score"]];
        Object.keys(subjectScores).forEach(subject => {
            const scores = subjectScores[subject];
            const avgSubjectScore = scores.reduce((sum, score) => sum + Number(score), 0) / scores.length;
            scoreData.push([subject, avgSubjectScore]);
        });

        const attendanceData = [["Subject", "Average Attendance"]];
        Object.keys(subjectAttendance).forEach(subject => {
            const attendance = subjectAttendance[subject];
            const avgSubjectAttendance = attendance.reduce((sum, att) => sum + Number(att), 0) / attendance.length;
            attendanceData.push([subject, avgSubjectAttendance]);
        });

        // Update state
        setClassStats({
            totalStudents,
            averageScore: avgScore.toFixed(2),
            averageAttendance: avgAttendance.toFixed(2)
        });
        
        setScoreChartData(scoreData);
        setAttendanceChartData(attendanceData);
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student => 
        student.User?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.StudentID).includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    // Handle editing student scores and attendance
    const handleEdit = (student) => {
        setEditingStudent({
            ...student,
            subjects: studentSubjects[student.StudentID] || []
        });
    };

    // Handle saving changes
    const handleSave = async () => {
        try {
            setLoading(true);
            
            // For each modified subject, send update request
            const updatePromises = editingStudent.subjects.map(subject => 
                apiService.put(`/studentsubjects/${subject.StudentSubjectID}`, {
                    Score: subject.Score,
                    Attendance: subject.Attendance
                })
            );
            
            await Promise.all(updatePromises);
            
            // Update the local state
            const updatedSubjects = { ...studentSubjects };
            updatedSubjects[editingStudent.StudentID] = editingStudent.subjects;
            setStudentSubjects(updatedSubjects);
            
            // Recalculate class stats
            calculateClassStats(students, updatedSubjects);
            
            setEditingStudent(null);
            setLoading(false);
            toast.success("Student records updated successfully");
        } catch (error) {
            console.error("Error updating student records:", error);
            toast.error("Failed to update student records");
            setLoading(false);
        }
    };

    // Handle cancel editing
    const handleCancel = () => {
        setEditingStudent(null);
    };

    // Handle input change for editing
    const handleInputChange = (subjectIndex, field, value) => {
        const updatedSubjects = [...editingStudent.subjects];
        updatedSubjects[subjectIndex][field] = value;
        
        setEditingStudent({
            ...editingStudent,
            subjects: updatedSubjects
        });
    };

    // Check if attendance update is allowed for a student-subject
    const canUpdateAttendance = (studentId, subjectId) => {
        const today = new Date().toISOString().split('T')[0];
        const key = `${studentId}-${subjectId}-${today}`;
        return !attendanceUpdates[key];
    };

    // Handle attendance increment
    const handleAttendanceIncrement = async (studentId, subject) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const key = `${studentId}-${subject.StudentSubjectID}-${today}`;
            
            if (!canUpdateAttendance(studentId, subject.StudentSubjectID)) {
                toast.warning("Attendance can only be updated once per day for each student-subject");
                return;
            }
            
            setLoading(true);
            
            // Calculate new attendance (max 100%)
            const currentAttendance = subject.Attendance || 0;
            const newAttendance = Math.min(currentAttendance + 5, 100);
            
            // Update in database
            await apiService.put(`/studentsubjects/${subject.StudentSubjectID}`, {
                Attendance: newAttendance
            });
            
            // Update local state
            const updatedSubjects = { ...studentSubjects };
            const studentSubjectIndex = updatedSubjects[studentId].findIndex(
                s => s.StudentSubjectID === subject.StudentSubjectID
            );
            
            if (studentSubjectIndex !== -1) {
                updatedSubjects[studentId][studentSubjectIndex].Attendance = newAttendance;
                setStudentSubjects(updatedSubjects);
                
                // Mark as updated for today
                const updatedAttendanceUpdates = { 
                    ...attendanceUpdates,
                    [key]: true 
                };
                setAttendanceUpdates(updatedAttendanceUpdates);
                localStorage.setItem('attendanceUpdates', JSON.stringify(updatedAttendanceUpdates));
                
                // Recalculate class stats
                calculateClassStats(students, updatedSubjects);
                
                toast.success(`Attendance for student increased by 5%`);
            }
            
            setLoading(false);
        } catch (error) {
            console.error("Error updating attendance:", error);
            toast.error("Failed to update attendance");
            setLoading(false);
        }
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
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Tutor Dashboard</h1>
                        
                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search students..." 
                                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* User Profile Summary */}
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                {tutorProfile?.Avatar ? (
                                    <img 
                                        src={tutorProfile.Avatar} 
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
                                    {tutorProfile?.Name || "Loading..."}
                                </h2>
                                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                                    <Mail size={16} className="mr-2" />
                                    {tutorProfile?.Email || "Loading..."}
                                </p>
                                <p className="text-gray-600 flex items-center justify-center md:justify-start mt-1">
                                    <Calendar size={16} className="mr-2" />
                                    {tutorProfile?.Birthdate 
                                        ? new Date(tutorProfile.Birthdate).toLocaleDateString('vi-VN') 
                                        : "Not available"}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        Tutor
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        Active
                                    </span>
                                    {currentTutor?.Fix && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                            {currentTutor.Fix}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Users size={18} className="text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {classes.length}
                                    </p>
                                    <p className="text-sm text-blue-600">Classes</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                        <Clock size={18} className="text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {tutorProfile?.RegisterDate 
                                            ? Math.floor((new Date() - new Date(tutorProfile.RegisterDate)) / (1000 * 60 * 60 * 24))
                                            : 0}
                                    </p>
                                    <p className="text-sm text-green-600">Days Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Class selection */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="px-4 py-3 bg-gray-800 text-white">
                            <h2 className="text-lg font-semibold">Your Classes</h2>
                        </div>
                        <div className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {loading && classes.length === 0 ? (
                                    <div className="flex justify-center items-center w-full py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : classes.length === 0 ? (
                                    <p className="text-gray-500 py-4">You are not assigned to any classes yet.</p>
                                ) : (
                                    classes.map(cls => (
                                        <button
                                            key={cls.ClassID}
                                            onClick={() => handleClassSelect(cls.ClassID)}
                                            className={`px-4 py-2 rounded-md transition-colors ${
                                                selectedClass === cls.ClassID
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                            }`}
                                        >
                                           Class {cls.ClassID}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && selectedClass && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {/* Class Statistics */}
                    {selectedClass && !loading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-base font-semibold">Total Students</h2>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-blue-600">{classStats.totalStudents}</p>
                                        <p className="text-sm text-gray-500">Students in this class</p>
                                    </div>
                                    <Users size={32} className="text-blue-400" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-base font-semibold">Average Score</h2>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-green-600">{classStats.averageScore}</p>
                                        <p className="text-sm text-gray-500">Class average</p>
                                    </div>
                                    <BookOpen size={32} className="text-green-400" />
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-base font-semibold">Average Attendance</h2>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-purple-600">{classStats.averageAttendance}%</p>
                                        <p className="text-sm text-gray-500">Class attendance</p>
                                    </div>
                                    <BookmarkCheck size={32} className="text-purple-400" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Charts Section */}
                    {selectedClass && !loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Score Chart */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-base font-semibold">Subject Scores</h2>
                                </div>
                                <div className="p-4">
                                    <div className="h-64 md:h-80">
                                        {scoreChartData.length > 1 ? (
                                            <Chart
                                                chartType="ColumnChart"
                                                width="100%"
                                                height="100%"
                                                data={scoreChartData}
                                                options={{
                                                    chartArea: { width: '80%', height: '70%' },
                                                    hAxis: { title: "Subjects" },
                                                    vAxis: {
                                                        title: "Average Score",
                                                        minValue: 0,
                                                        maxValue: 100
                                                    },
                                                    legend: { position: "none" },
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

                            {/* Attendance Chart */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-4 py-3 bg-gray-800 text-white">
                                    <h2 className="text-base font-semibold">Subject Attendance</h2>
                                </div>
                                <div className="p-4">
                                    <div className="h-64 md:h-80">
                                        {attendanceChartData.length > 1 ? (
                                            <Chart
                                                chartType="ColumnChart"
                                                width="100%"
                                                height="100%"
                                                data={attendanceChartData}
                                                options={{
                                                    chartArea: { width: '80%', height: '70%' },
                                                    hAxis: { title: "Subjects" },
                                                    vAxis: {
                                                        title: "Average Attendance (%)",
                                                        minValue: 0,
                                                        maxValue: 100
                                                    },
                                                    legend: { position: "none" },
                                                    colors: ["#34A853"]
                                                }}
                                            />
                                        ) : (
                                            <div className="flex justify-center items-center h-full">
                                                <p className="text-gray-500">No attendance data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student List */}
                    {selectedClass && !loading && (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <div className="px-4 py-3 bg-gray-800 text-white flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Student List</h2>
                                <Link 
                                    to={`/class/${selectedClass}`}
                                    className="text-blue-300 hover:text-blue-100 text-sm"
                                >
                                    View Class Details
                                </Link>
                            </div>
                            <div className="p-4">
                                {filteredStudents.length === 0 ? (
                                    <p className="text-gray-500 py-4 text-center">No students found in this class.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 text-gray-700 text-left">
                                                    <th className="border px-4 py-2">Student ID</th>
                                                    <th className="border px-4 py-2">Name</th>
                                                    <th className="border px-4 py-2">Subjects</th>
                                                    <th className="border px-4 py-2">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentStudents.map(student => (
                                                    <tr key={student.StudentID} className="hover:bg-gray-50 transition">
                                                        <td className="border px-4 py-2">{student.StudentID}</td>
                                                        <td className="border px-4 py-2">{student.User?.Name}</td>
                                                        <td className="border px-4 py-2">
                                                            {studentSubjects[student.StudentID]?.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {studentSubjects[student.StudentID].map(subject => (
                                                                        <div key={subject.StudentSubjectID} className="flex items-center justify-between">
                                                                            <div className="text-sm">
                                                                                <span className="font-medium">{subject.Subject?.SubjectName || 'Unknown Subject'}</span>: 
                                                                                <span className={`ml-1 ${
                                                                                    subject.Score >= 70 ? "text-green-600" : 
                                                                                    subject.Score >= 50 ? "text-yellow-600" : 
                                                                                    subject.Score ? "text-red-600" : ""
                                                                                }`}>
                                                                                    Score: {subject.Score !== null ? subject.Score : "N/A"}
                                                                                </span>, 
                                                                                <span className={`ml-1 ${
                                                                                    subject.Attendance >= 80 ? "text-green-600" : 
                                                                                    subject.Attendance >= 60 ? "text-yellow-600" : 
                                                                                    subject.Attendance ? "text-red-600" : ""
                                                                                }`}>
                                                                                    Attendance: {subject.Attendance !== null ? `${subject.Attendance}%` : "N/A"}
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleAttendanceIncrement(student.StudentID, subject)}
                                                                                disabled={!canUpdateAttendance(student.StudentID, subject.StudentSubjectID)}
                                                                                className={`ml-2 p-1 rounded-full ${
                                                                                    canUpdateAttendance(student.StudentID, subject.StudentSubjectID)
                                                                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                                }`}
                                                                                title={
                                                                                    canUpdateAttendance(student.StudentID, subject.StudentSubjectID)
                                                                                        ? "Add 5% to attendance"
                                                                                        : "Already updated today"
                                                                                }
                                                                            >
                                                                                <Plus size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500">No subjects assigned</span>
                                                            )}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            <button 
                                                                onClick={() => handleEdit(student)}
                                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                                disabled={!studentSubjects[student.StudentID]?.length}
                                                            >
                                                                Manage Scores
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                                                                {/* Pagination */}
                                                                                {totalPages > 1 && (
                                            <div className="flex justify-between items-center mt-4 px-2">
                                                <span className="text-sm text-gray-600">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="px-4 py-3 bg-gray-800 text-white">
                                <h2 className="text-base font-semibold">Timetable</h2>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-500">View your teaching schedule</p>
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
                                    <p className="text-sm text-gray-500">Manage your course materials</p>
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
                                    <p className="text-sm text-gray-500">Communicate with students</p>
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

                    {/* Edit student modal */}
                    {editingStudent && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
                                <h2 className="text-xl font-bold mb-4">
                                    Manage Scores for {editingStudent.User?.Name} (ID: {editingStudent.StudentID})
                                </h2>
                                
                                {editingStudent.subjects?.length > 0 ? (
                                    <div className="mb-4">
                                        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border px-4 py-2">Subject</th>
                                                    <th className="border px-4 py-2">Score (0-100)</th>
                                                    <th className="border px-4 py-2">Attendance (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {editingStudent.subjects.map((subject, idx) => (
                                                    <tr key={subject.StudentSubjectID} className="border-b">
                                                        <td className="p-2">{subject.Subject?.SubjectName || 'Unknown Subject'}</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={subject.Score || ""}
                                                                onChange={(e) => handleInputChange(idx, "Score", e.target.value)}
                                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2 flex items-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={subject.Attendance || ""}
                                                                onChange={(e) => handleInputChange(idx, "Attendance", e.target.value)}
                                                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const updatedSubjects = [...editingStudent.subjects];
                                                                    const currentAttendance = Number(updatedSubjects[idx].Attendance || 0);
                                                                    updatedSubjects[idx].Attendance = Math.min(currentAttendance + 5, 100);
                                                                    setEditingStudent({
                                                                        ...editingStudent,
                                                                        subjects: updatedSubjects
                                                                    });
                                                                }}
                                                                className="ml-2 p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                                                title="Add 5% to attendance"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="mb-4">No subjects assigned to this student.</p>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border rounded-md bg-gray-500 hover:bg-gray-600 text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 border rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Right sidebar */}
            <RightSidebar />
        </div>
    );
}

export default Dashboard;

